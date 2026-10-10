"""
Hydrology Physics Baseline & LightGBM Machine Learning Flood Model
"""
import os
import math
import pickle
import logging
from pathlib import Path
from typing import Dict, Any, Tuple, List, Optional
import numpy as np
import lightgbm as lgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import precision_score, recall_score, precision_recall_curve, auc, brier_score_loss, mean_absolute_error

from raksh_path.config import MODEL_PATH, SCENARIOS_CONFIG

logger = logging.getLogger("raksh_path.flood_model")
logging.basicConfig(level=logging.INFO)

FEATURE_NAMES = [
    "elevation_m",
    "slope",
    "dist_to_river_m",
    "hand_m",
    "wetness_index",
    "rainfall_1h_mm",
    "rainfall_3h_accum_mm",
    "river_surge_m",
    "is_bridge",
    "baseline_depth_m"
]

def compute_physics_runoff_baseline(
    elevation_m: float,
    slope: float,
    dist_to_river_m: float,
    hand_m: float,
    wetness_index: float,
    is_bridge: bool,
    bridge_deck_elevation_m: Optional[float],
    rainfall_1h_mm: float,
    rainfall_3h_accum_mm: float,
    river_surge_m: float,
    base_river_level_m: float = 74.0,
    soil_saturation: float = 0.70,
    infiltration_rate_mm_h: float = 4.0
) -> float:
    """
    Physics-inspired baseline calculating surface water depth (in meters)
    from topography, infiltration, runoff accumulation, and river stage backwater.
    """
    if is_bridge:
        deck_elev = bridge_deck_elevation_m if bridge_deck_elevation_m is not None else (elevation_m + 8.0)
        water_surface = base_river_level_m + river_surge_m
        if deck_elev > water_surface:
            # Water is beneath bridge deck: zero flood on bridge road surface
            return 0.0
        else:
            # River has overflowed bridge deck
            return round(water_surface - deck_elev, 3)

    # 1. Local precipitation runoff component
    effective_infiltration = infiltration_rate_mm_h * max(0.1, 1.0 - soil_saturation)
    surface_excess_mm = max(0.0, rainfall_1h_mm - effective_infiltration)
    
    # Runoff accumulation influenced by topographic wetness index and slope drainage
    # Low slope and high TWI hold water longer
    drainage_factor = 1.0 + 0.12 * max(0.0, wetness_index - 3.0) - 0.04 * min(5.0, slope)
    runoff_depth_m = (surface_excess_mm / 1000.0) * max(0.2, drainage_factor)
    
    # Extended 3-hour ponding accumulation
    accum_effect_m = (rainfall_3h_accum_mm / 1000.0) * 0.15 * max(0.1, 1.0 - slope / 5.0)
    local_ponding_m = runoff_depth_m + accum_effect_m

    # 2. River surge inundation component (Ganga / Yamuna overflow)
    # Reaches low-lying areas where HAND (Height Above Nearest Drainage) is lower than river surge
    river_inundation_m = 0.0
    if river_surge_m > hand_m:
        surge_head_m = river_surge_m - hand_m
        # Attenuation based on distance from river channel
        dist_attenuation = math.exp(-dist_to_river_m / 900.0)
        river_inundation_m = surge_head_m * dist_attenuation

    total_depth_m = max(0.0, local_ponding_m + river_inundation_m)
    return round(total_depth_m, 3)

class FloodModel:
    def __init__(self, model_path: Path = MODEL_PATH):
        self.model_path = model_path
        self.classifier: Optional[lgb.LGBMClassifier] = None
        self.regressor: Optional[lgb.LGBMRegressor] = None
        self.metrics: Dict[str, float] = {}
        self._prediction_cache: Dict[Tuple, Tuple[float, float]] = {}

    def clear_cache(self) -> None:
        self._prediction_cache.clear()

    def generate_training_data(self, n_samples: int = 4000, random_seed: int = 42) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Generates realistic synthetic training data covering diverse monsoon events,
        topographies, bridge structures, and river surge scenarios in Prayagraj.
        """
        np.random.seed(random_seed)

        # Terrain distributions matching Prayagraj
        elevations = np.random.uniform(75.0, 96.0, n_samples)
        slopes = np.random.exponential(1.5, n_samples)
        dist_to_rivers = np.random.uniform(50.0, 3500.0, n_samples)
        base_river = 74.0
        hands = np.maximum(0.2, elevations - base_river)
        wetness_indices = np.log(100.0 / (np.maximum(0.1, slopes) + 0.05))
        is_bridges = np.random.binomial(1, 0.08, n_samples).astype(bool)

        # Meteorological & river surge distributions
        rainfall_1h = np.random.exponential(25.0, n_samples)
        rainfall_3h_accum = rainfall_1h * np.random.uniform(1.8, 3.2, n_samples)
        river_surges = np.random.uniform(0.0, 7.5, n_samples)

        # Compute physics baseline
        baselines = []
        for i in range(n_samples):
            deck_elev = 92.0 if is_bridges[i] else None
            b = compute_physics_runoff_baseline(
                elevation_m=elevations[i],
                slope=slopes[i],
                dist_to_river_m=dist_to_rivers[i],
                hand_m=hands[i],
                wetness_index=wetness_indices[i],
                is_bridge=is_bridges[i],
                bridge_deck_elevation_m=deck_elev,
                rainfall_1h_mm=rainfall_1h[i],
                rainfall_3h_accum_mm=rainfall_3h_accum[i],
                river_surge_m=river_surges[i],
                base_river_level_m=base_river
            )
            baselines.append(b)
        baselines = np.array(baselines)

        # Ground truth generation: includes real-world stochasticity (drainage blockages,
        # localized soil compaction, backwater wave dynamics)
        noise = np.random.normal(0.0, 0.04, n_samples)
        clogging_factor = np.where((wetness_indices > 4.5) & (rainfall_1h > 30.0), 0.08, 0.0)
        actual_depths = np.maximum(0.0, baselines + clogging_factor + noise)
        actual_depths = np.round(actual_depths, 3)

        # Binary label for significant inundation (> 15 cm threshold)
        is_flooded_labels = (actual_depths >= 0.15).astype(int)

        X = np.column_stack([
            elevations,
            slopes,
            dist_to_rivers,
            hands,
            wetness_indices,
            rainfall_1h,
            rainfall_3h_accum,
            river_surges,
            is_bridges.astype(float),
            baselines
        ])

        return X, actual_depths, is_flooded_labels

    def train_and_evaluate(self, n_samples: int = 5000) -> Dict[str, float]:
        """
        Trains LightGBM classifier and regressor, evaluates on held-out test split,
        and reports Precision, Recall, AUC-PR, Brier Score, and MAE.
        """
        logger.info("Generating training data for LightGBM flood model...")
        X, y_depth, y_class = self.generate_training_data(n_samples=n_samples)

        X_train, X_test, y_depth_train, y_depth_test, y_class_train, y_class_test = train_test_split(
            X, y_depth, y_class, test_size=0.25, random_state=42
        )

        logger.info(f"Training LightGBM Regressor on {len(X_train)} samples...")
        self.regressor = lgb.LGBMRegressor(
            n_estimators=120,
            learning_rate=0.06,
            num_leaves=31,
            random_state=42,
            verbosity=-1
        )
        self.regressor.fit(X_train, y_depth_train)

        logger.info(f"Training LightGBM Calibrated Classifier on {len(X_train)} samples...")
        self.classifier = lgb.LGBMClassifier(
            n_estimators=100,
            learning_rate=0.06,
            num_leaves=25,
            random_state=42,
            verbosity=-1
        )
        self.classifier.fit(X_train, y_class_train)

        # Evaluations
        y_prob = self.classifier.predict_proba(X_test)[:, 1]
        y_pred = (y_prob >= 0.50).astype(int)
        y_depth_pred = np.maximum(0.0, self.regressor.predict(X_test))

        precision = float(precision_score(y_class_test, y_pred, zero_division=0))
        recall = float(recall_score(y_class_test, y_pred, zero_division=0))
        precision_curve, recall_curve, _ = precision_recall_curve(y_class_test, y_prob)
        auc_pr = float(auc(recall_curve, precision_curve))
        brier = float(brier_score_loss(y_class_test, y_prob))
        mae = float(mean_absolute_error(y_depth_test, y_depth_pred))

        self.metrics = {
            "precision": round(precision, 4),
            "recall": round(recall, 4),
            "auc_pr": round(auc_pr, 4),
            "brier_score": round(brier, 4),
            "depth_mae_m": round(mae, 4),
            "test_samples": len(X_test)
        }

        logger.info(
            f"Evaluation Report -> Precision: {precision:.4f} | Recall: {recall:.4f} | "
            f"AUC-PR: {auc_pr:.4f} | Brier Score: {brier:.4f} | Depth MAE: {mae:.4f}m"
        )

        self.save()
        return self.metrics

    def save(self) -> None:
        self.model_path.parent.mkdir(parents=True, exist_ok=True)
        payload = {
            "classifier": self.classifier,
            "regressor": self.regressor,
            "metrics": self.metrics,
            "feature_names": FEATURE_NAMES
        }
        with open(self.model_path, "wb") as f:
            pickle.dump(payload, f)
        logger.info(f"Saved trained LightGBM flood model to {self.model_path}")

    def load(self) -> bool:
        if not self.model_path.exists():
            return False
        try:
            with open(self.model_path, "rb") as f:
                payload = pickle.load(f)
            self.classifier = payload["classifier"]
            self.regressor = payload["regressor"]
            self.metrics = payload.get("metrics", {})
            return True
        except Exception as e:
            logger.warning(f"Error loading model from {self.model_path}: {e}")
            return False

    def predict_edge_flood(
        self,
        edge_attrs: Dict[str, Any],
        rainfall_1h_mm: float,
        rainfall_3h_accum_mm: float,
        river_surge_m: float,
        base_river_level_m: float = 74.0,
        soil_saturation: float = 0.70,
        infiltration_rate_mm_h: float = 4.0
    ) -> Tuple[float, float]:
        """
        Returns (predicted_water_depth_m, flood_probability) for an edge segment.
        """
        cache_key = (
            edge_attrs.get("edge_id", (edge_attrs.get("elevation_m"), edge_attrs.get("hand_m"))),
            round(rainfall_1h_mm, 1),
            round(rainfall_3h_accum_mm, 1),
            round(river_surge_m, 2)
        )
        if hasattr(self, "_prediction_cache") and cache_key in self._prediction_cache:
            return self._prediction_cache[cache_key]

        elev = edge_attrs.get("elevation_m", 85.0)
        slope = edge_attrs.get("slope", 1.5)
        dist_river = edge_attrs.get("dist_to_river_m", 1500.0)
        hand = edge_attrs.get("hand_m", max(0.5, elev - base_river_level_m))
        wetness = edge_attrs.get("wetness_index", 3.0)
        is_br = bool(edge_attrs.get("is_bridge", False))
        deck_elev = edge_attrs.get("bridge_deck_elevation_m")

        baseline_depth = compute_physics_runoff_baseline(
            elevation_m=elev,
            slope=slope,
            dist_to_river_m=dist_river,
            hand_m=hand,
            wetness_index=wetness,
            is_bridge=is_br,
            bridge_deck_elevation_m=deck_elev,
            rainfall_1h_mm=rainfall_1h_mm,
            rainfall_3h_accum_mm=rainfall_3h_accum_mm,
            river_surge_m=river_surge_m,
            base_river_level_m=base_river_level_m,
            soil_saturation=soil_saturation,
            infiltration_rate_mm_h=infiltration_rate_mm_h
        )

        if self.regressor is None or self.classifier is None:
            # Fallback to physics baseline if model not yet loaded
            prob = 1.0 / (1.0 + math.exp(-12.0 * (baseline_depth - 0.20)))
            res = (baseline_depth, round(prob, 4))
            if hasattr(self, "_prediction_cache"):
                self._prediction_cache[cache_key] = res
            return res

        feat_vector = np.array([[
            elev,
            slope,
            dist_river,
            hand,
            wetness,
            rainfall_1h_mm,
            rainfall_3h_accum_mm,
            river_surge_m,
            float(is_br),
            baseline_depth
        ]])

        pred_depth = float(np.maximum(0.0, self.regressor.predict(feat_vector)[0]))
        # Calibrated flood probability
        pred_prob = float(self.classifier.predict_proba(feat_vector)[0, 1])

        # If bridge is well above water, hard enforce 0 flood
        if is_br and deck_elev and deck_elev > (base_river_level_m + river_surge_m):
            pred_depth = 0.0
            pred_prob = 0.001

        res = (round(pred_depth, 3), round(pred_prob, 4))
        if hasattr(self, "_prediction_cache"):
            self._prediction_cache[cache_key] = res
        return res

flood_model = FloodModel()
