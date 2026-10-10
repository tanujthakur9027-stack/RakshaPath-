"""
Tests for Stage 2: Flood Model (Physics Baseline & LightGBM)
"""
import pytest
from raksh_path.core.flood_model import (
    compute_physics_runoff_baseline,
    FloodModel,
    flood_model
)

def test_physics_runoff_baseline():
    # Test elevated dry ridge (Civil Lines)
    d_high = compute_physics_runoff_baseline(
        elevation_m=95.0,
        slope=2.0,
        dist_to_river_m=2800.0,
        hand_m=21.0,
        wetness_index=2.5,
        is_bridge=False,
        bridge_deck_elevation_m=None,
        rainfall_1h_mm=15.0,
        rainfall_3h_accum_mm=30.0,
        river_surge_m=2.0
    )
    assert d_high < 0.10, "Elevated ridge should have minimal runoff"

    # Test lowland riverbank during surge (Daraganj Ghat)
    d_low = compute_physics_runoff_baseline(
        elevation_m=76.0,
        slope=0.5,
        dist_to_river_m=120.0,
        hand_m=2.0,
        wetness_index=5.5,
        is_bridge=False,
        bridge_deck_elevation_m=None,
        rainfall_1h_mm=60.0,
        rainfall_3h_accum_mm=120.0,
        river_surge_m=4.5
    )
    assert d_low > 0.50, "Lowland near river during surge should show deep flood"

    # Test high bridge (Shastri Bridge deck at 92.5m)
    d_bridge = compute_physics_runoff_baseline(
        elevation_m=84.0,
        slope=1.0,
        dist_to_river_m=10.0,
        hand_m=10.0,
        wetness_index=3.0,
        is_bridge=True,
        bridge_deck_elevation_m=92.5,
        rainfall_1h_mm=50.0,
        rainfall_3h_accum_mm=100.0,
        river_surge_m=3.0,
        base_river_level_m=74.0
    )
    assert d_bridge == 0.0, "Bridge deck above river flood water should have zero flood depth"

def test_train_and_evaluate_flood_model(tmp_path):
    test_model_file = tmp_path / "test_flood_model.pkl"
    fm = FloodModel(model_path=test_model_file)
    metrics = fm.train_and_evaluate(n_samples=1500)

    # Check metrics existence and reasonable boundaries
    assert "precision" in metrics
    assert "recall" in metrics
    assert "auc_pr" in metrics
    assert "brier_score" in metrics
    assert "depth_mae_m" in metrics

    assert metrics["precision"] > 0.70, f"Precision should be > 0.70, got {metrics['precision']}"
    assert metrics["recall"] > 0.70, f"Recall should be > 0.70, got {metrics['recall']}"
    assert metrics["auc_pr"] > 0.75, f"AUC-PR should be > 0.75, got {metrics['auc_pr']}"
    assert metrics["brier_score"] < 0.15, f"Brier score should be calibrated (< 0.15), got {metrics['brier_score']}"

    # Test edge prediction
    dummy_edge = {
        "elevation_m": 77.0,
        "slope": 0.8,
        "dist_to_river_m": 200.0,
        "hand_m": 3.0,
        "wetness_index": 4.8,
        "is_bridge": False
    }
    pred_depth, pred_prob = fm.predict_edge_flood(dummy_edge, rainfall_1h_mm=50.0, rainfall_3h_accum_mm=90.0, river_surge_m=3.5)
    assert pred_depth >= 0.0
    assert 0.0 <= pred_prob <= 1.0
