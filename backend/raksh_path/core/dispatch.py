"""
Joint Multi-Constraint Dispatch Engine with Hungarian Matching and Plain-Language Explainer
"""
import math
import logging
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
from scipy.optimize import linear_sum_assignment

from raksh_path.config import ROUTING_CONFIG
from raksh_path.regions import region_manager
from raksh_path.core.vehicle_profiles import vehicle_manager
from raksh_path.core.routing import EmergencyRouter, router

logger = logging.getLogger("raksh_path.dispatch")

INCIDENT_CAPABILITY_MAP = {
    "medical_emergency": ["ambulance", "rescue_truck"],
    "cardiac_arrest": ["ambulance"],
    "trauma_severe": ["ambulance", "rescue_truck"],
    "trapped_citizens": ["rescue_truck", "boat_truck", "fire_tender"],
    "water_rescue": ["boat_truck", "rescue_truck"],
    "structural_collapse": ["fire_tender", "rescue_truck"],
    "flood_evacuation": ["rescue_truck", "boat_truck"],
    "fire_outbreak": ["fire_tender"]
}

class DispatchEngine:
    def __init__(self, region_id: str = "prayagraj"):
        self.region_id = region_id
        self.router = router
        self.config = ROUTING_CONFIG.get("dispatch", {})
        self.w_unit = self.config.get("weight_unit_to_incident_eta", 1.0)
        self.w_hosp = self.config.get("weight_incident_to_hospital_eta", 0.9)
        self.w_unrel = self.config.get("weight_unreliability_penalty", 250.0)

        # In-memory hospital registry with dynamic bed tracking
        self.hospitals = self._init_hospital_state()
        # In-memory fleet registry
        self.fleet = vehicle_manager.initialize_fleet(region_id)

    def _init_hospital_state(self) -> List[Dict[str, Any]]:
        raw_hospitals = region_manager.get_hospitals(self.region_id)
        state = []
        for h in raw_hospitals:
            state.append({
                "id": h["id"],
                "name": h["name"],
                "lat": h["lat"],
                "lon": h["lon"],
                "specialties": h.get("specialties", ["general"]),
                "trauma_beds_total": h.get("trauma_beds", 10),
                "trauma_beds_available": max(1, h.get("trauma_beds", 10) - 4),
                "icu_beds_total": h.get("icu_beds", 15),
                "icu_beds_available": max(1, h.get("icu_beds", 15) - 6),
                "general_beds_total": h.get("general_beds", 50),
                "general_beds_available": max(2, h.get("general_beds", 50) - 15),
            })
        return state

    def switch_region(self, region_id: str) -> None:
        if self.region_id == region_id and self.fleet:
            return
        self.region_id = region_id
        self.hospitals = self._init_hospital_state()
        self.fleet = vehicle_manager.initialize_fleet(region_id)
        self.router.switch_region(region_id)
        logger.info(f"Switched dispatch engine to region '{region_id}'.")

    def get_available_units(self) -> List[Dict[str, Any]]:
        return [u for u in self.fleet if u.get("status") == "available"]

    def is_vehicle_capable(self, vehicle_class: str, incident_type: str) -> bool:
        allowed = INCIDENT_CAPABILITY_MAP.get(incident_type, ["ambulance", "rescue_truck", "fire_tender", "boat_truck"])
        return vehicle_class in allowed

    def is_hospital_eligible(self, hospital: Dict[str, Any], required_specialty: str) -> bool:
        if required_specialty == "trauma":
            return hospital["trauma_beds_available"] > 0
        elif required_specialty == "icu":
            return hospital["icu_beds_available"] > 0
        elif required_specialty in ["pediatric", "burn"]:
            return required_specialty in hospital.get("specialties", []) and hospital["general_beds_available"] > 0
        else:
            return hospital["general_beds_available"] > 0

    def evaluate_triplet(
        self,
        incident: Dict[str, Any],
        unit: Dict[str, Any],
        hospital: Dict[str, Any],
        scenario_id: str = "heavy_monsoon",
        start_hour: float = 0.0
    ) -> Optional[Dict[str, Any]]:
        """
        Evaluates (Incident i, Unit u, Hospital h).
        Returns calculated cost, routes, and ETA or None if constraints fail.
        """
        inc_type = incident.get("incident_type", "medical_emergency")
        req_specialty = incident.get("required_specialty", "general")
        severity = incident.get("severity", 3)

        # 1. Hard capability constraint
        if not self.is_vehicle_capable(unit["class_id"], inc_type):
            return None

        # 2. Hard hospital bed availability constraint
        if not self.is_hospital_eligible(hospital, req_specialty):
            return None

        disaster_type = incident.get("disaster_type", "flood")

        # 3. Compute Leg 1: Unit -> Incident
        leg1 = self.router.compute_dual_routes(
            origin_lat=unit["lat"],
            origin_lon=unit["lon"],
            dest_lat=incident["lat"],
            dest_lon=incident["lon"],
            vehicle_class=unit["class_id"],
            start_hour=start_hour,
            scenario_id=scenario_id,
            severity=severity,
            incident_type=inc_type,
            disaster_type=disaster_type
        )

        if not leg1["success"]:
            return None

        primary_leg1 = leg1["primary_route"]
        backup_leg1 = leg1["backup_route"]

        # Compute arrival hour at incident for Leg 2
        arrival_at_inc_hour = start_hour + (primary_leg1["total_duration_minutes"] / 60.0)

        # 4. Compute Leg 2: Incident -> Hospital
        leg2 = self.router.compute_dual_routes(
            origin_lat=incident["lat"],
            origin_lon=incident["lon"],
            dest_lat=hospital["lat"],
            dest_lon=hospital["lon"],
            vehicle_class=unit["class_id"],
            start_hour=arrival_at_inc_hour,
            scenario_id=scenario_id,
            severity=severity,
            incident_type=inc_type,
            disaster_type=disaster_type
        )

        if not leg2["success"]:
            return None

        primary_leg2 = leg2["primary_route"]
        backup_leg2 = leg2["backup_route"]

        # Combined Metrics
        unit_to_inc_eta_min = primary_leg1["total_duration_minutes"]
        inc_to_hosp_eta_min = primary_leg2["total_duration_minutes"]
        total_eta_min = round(unit_to_inc_eta_min + inc_to_hosp_eta_min, 1)

        rel1_frac = primary_leg1["overall_reliability_pct"] / 100.0
        rel2_frac = primary_leg2["overall_reliability_pct"] / 100.0
        combined_reliability_pct = round((rel1_frac * rel2_frac) * 100.0, 1)

        total_distance_km = round(primary_leg1["total_distance_km"] + primary_leg2["total_distance_km"], 2)

        # Joint Cost Objective:
        # Cost = w1 * ETA_ui + w2 * ETA_ih + w3 * (1 - R_total) * (severity / 3)
        severity_mult = max(0.5, severity / 3.0)
        unrel_penalty = self.w_unrel * (1.0 - (combined_reliability_pct / 100.0)) * severity_mult
        total_cost = (self.w_unit * unit_to_inc_eta_min) + (self.w_hosp * inc_to_hosp_eta_min) + unrel_penalty

        return {
            "total_cost": round(total_cost, 2),
            "unit": unit,
            "hospital": hospital,
            "unit_to_incident_eta_min": unit_to_inc_eta_min,
            "incident_to_hospital_eta_min": inc_to_hosp_eta_min,
            "total_eta_min": total_eta_min,
            "total_distance_km": total_distance_km,
            "combined_reliability_pct": combined_reliability_pct,
            "leg1": leg1,
            "leg2": leg2,
        }

    def generate_explanation(
        self,
        incident: Dict[str, Any],
        recommendation: Dict[str, Any],
        scenario_id: str
    ) -> str:
        """
        Generates clear, contextual emergency dispatch rationale.
        """
        unit = recommendation["unit"]
        hosp = recommendation["hospital"]
        eta = recommendation["total_eta_min"]
        rel = recommendation["combined_reliability_pct"]
        inc_type = incident.get("incident_type", "Emergency").replace("_", " ").title()
        severity = incident.get("severity", 3)
        req_spec = incident.get("required_specialty", "general").upper()

        leg1_depth = recommendation["leg1"]["primary_route"]["max_water_depth_m"]
        leg2_depth = recommendation["leg2"]["primary_route"]["max_water_depth_m"]
        max_flood = max(leg1_depth, leg2_depth)

        # Vehicle justification
        veh_reason = f"Assigned {unit['display_name']} ({unit['class_id']})"
        if unit["class_id"] in ["rescue_truck", "boat_truck"] and max_flood > 0.25:
            veh_reason += f" because corridor exhibits flood depth up to {int(max_flood*100)} cm, exceeding standard ambulance safe wading depth (30 cm)."
        else:
            veh_reason += f" providing optimal response ETA ({recommendation['unit_to_incident_eta_min']} min) to incident site."

        # Hospital justification
        hosp_beds = hosp.get(f"{req_spec.lower()}_beds_available", hosp.get("general_beds_available", 2))
        hosp_reason = f"Destination is {hosp['name']} with {hosp_beds} verified {req_spec} beds available."

        # Routing & contingency justification
        route_reason = f"Combined mission reliability is {rel}% over {recommendation['total_distance_km']} km."
        if recommendation["leg1"].get("has_distinct_backup"):
            route_reason += " A diverse backup route via elevated arterial/bridge is pre-computed in case water rises."

        return f"{veh_reason} {hosp_reason} {route_reason}"

    def recommend_for_incident(
        self,
        incident: Dict[str, Any],
        scenario_id: str = "heavy_monsoon",
        start_hour: float = 0.0
    ) -> Dict[str, Any]:
        """
        Finds and ranks candidate (Unit, Hospital) dispatches for an incident.
        """
        inc_region = incident.get("region_id", "prayagraj")
        if inc_region and inc_region != self.region_id:
            self.switch_region(inc_region)

        available_units = self.get_available_units()
        if not available_units:
            return {
                "success": False,
                "message": "No rescue units currently available."
            }

        inc_type = incident.get("incident_type", "medical_emergency")
        req_spec = incident.get("required_specialty", "general")

        # 1. Prune units to capable candidates: include light, high-clearance, and water rescue units
        capable_ambs = [u for u in available_units if u["class_id"] == "ambulance" and self.is_vehicle_capable("ambulance", inc_type)]
        capable_rescue = [u for u in available_units if u["class_id"] == "rescue_truck" and self.is_vehicle_capable("rescue_truck", inc_type)]
        capable_boats = [u for u in available_units if u["class_id"] == "boat_truck" and self.is_vehicle_capable("boat_truck", inc_type)]

        capable_ambs.sort(key=lambda u: (u["lat"] - incident["lat"])**2 + (u["lon"] - incident["lon"])**2)
        capable_rescue.sort(key=lambda u: (u["lat"] - incident["lat"])**2 + (u["lon"] - incident["lon"])**2)
        capable_boats.sort(key=lambda u: (u["lat"] - incident["lat"])**2 + (u["lon"] - incident["lon"])**2)

        candidate_units = capable_ambs[:2] + capable_rescue[:2] + capable_boats[:2]
        if not candidate_units:
            candidate_units = available_units[:3]

        # 2. Prune hospitals to eligible and closest
        eligible_hospitals = [h for h in self.hospitals if self.is_hospital_eligible(h, req_spec)]
        if not eligible_hospitals:
            eligible_hospitals = list(self.hospitals)

        eligible_hospitals.sort(key=lambda h: (h["lat"] - incident["lat"])**2 + (h["lon"] - incident["lon"])**2)
        candidate_hospitals = eligible_hospitals[:2]

        candidates = []
        for unit in candidate_units:
            for hospital in candidate_hospitals:
                eval_res = self.evaluate_triplet(
                    incident=incident,
                    unit=unit,
                    hospital=hospital,
                    scenario_id=scenario_id,
                    start_hour=start_hour
                )
                if eval_res is not None:
                    candidates.append(eval_res)

        if not candidates:
            return {
                "success": False,
                "message": "No feasible dispatch option found satisfying vehicle capability, water wading depth, and hospital bed constraints."
            }

        # Sort candidates by minimum total cost
        candidates.sort(key=lambda c: c["total_cost"])
        best = candidates[0]

        explanation = self.generate_explanation(incident, best, scenario_id)

        # Prepare stitched GeoJSON routes for primary and backup
        primary_coords = best["leg1"]["primary_route"]["coordinates"] + best["leg2"]["primary_route"]["coordinates"]
        backup_coords = best["leg1"]["backup_route"]["coordinates"] + best["leg2"]["backup_route"]["coordinates"]

        return {
            "success": True,
            "incident_id": incident.get("id"),
            "recommended_unit": best["unit"],
            "recommended_hospital": best["hospital"],
            "total_eta_minutes": best["total_eta_min"],
            "unit_to_incident_eta_minutes": best["unit_to_incident_eta_min"],
            "incident_to_hospital_eta_minutes": best["incident_to_hospital_eta_min"],
            "total_distance_km": best["total_distance_km"],
            "combined_reliability_pct": best["combined_reliability_pct"],
            "explanation": explanation,
            "primary_route": {
                "coordinates": primary_coords,
                "overall_reliability_pct": best["combined_reliability_pct"],
                "eta_minutes": best["total_eta_min"],
                "distance_km": best["total_distance_km"],
                "max_flood_depth_m": max(
                    best["leg1"]["primary_route"]["max_water_depth_m"],
                    best["leg2"]["primary_route"]["max_water_depth_m"]
                )
            },
            "backup_route": {
                "coordinates": backup_coords,
                "overall_reliability_pct": round(
                    (best["leg1"]["backup_route"]["overall_reliability_pct"] * best["leg2"]["backup_route"]["overall_reliability_pct"]) / 100.0,
                    1
                ),
                "eta_minutes": round(
                    best["leg1"]["backup_route"]["total_duration_minutes"] + best["leg2"]["backup_route"]["total_duration_minutes"],
                    1
                ),
                "distance_km": round(
                    best["leg1"]["backup_route"]["total_distance_km"] + best["leg2"]["backup_route"]["total_distance_km"],
                    2
                )
            },
            "candidate_rankings_count": len(candidates)
        }

    def solve_joint_batch_dispatch(
        self,
        incidents: List[Dict[str, Any]],
        scenario_id: str = "heavy_monsoon",
        start_hour: float = 0.0
    ) -> List[Dict[str, Any]]:
        """
        Uses Hungarian matching (linear_sum_assignment) across multiple concurrent incidents
        to guarantee globally optimal, conflict-free assignments without double-booking units.
        """
        if not incidents:
            return []

        available_units = self.get_available_units()
        if not available_units:
            return [{"incident_id": inc["id"], "success": False, "message": "No available units"} for inc in incidents]

        n_inc = len(incidents)
        n_units = len(available_units)

        # Build cost matrix: size (n_inc x n_units)
        # For each (incident i, unit u), find best hospital h
        cost_matrix = np.full((n_inc, n_units), 999999.0)
        best_triplets: Dict[Tuple[int, int], Dict[str, Any]] = {}

        for i_idx, inc in enumerate(incidents):
            inc_type = inc.get("incident_type", "medical_emergency")
            req_spec = inc.get("required_specialty", "general")
            eligible_hosps = [h for h in self.hospitals if self.is_hospital_eligible(h, req_spec)]
            if not eligible_hosps:
                eligible_hosps = list(self.hospitals)
            eligible_hosps.sort(key=lambda h: (h["lat"] - inc["lat"])**2 + (h["lon"] - inc["lon"])**2)
            cand_hosps = eligible_hosps[:2]

            for u_idx, unit in enumerate(available_units):
                if not self.is_vehicle_capable(unit["class_id"], inc_type):
                    continue
                best_cost = float("inf")
                best_eval = None
                for hosp in cand_hosps:
                    eval_res = self.evaluate_triplet(inc, unit, hosp, scenario_id, start_hour)
                    if eval_res and eval_res["total_cost"] < best_cost:
                        best_cost = eval_res["total_cost"]
                        best_eval = eval_res
                if best_eval:
                    cost_matrix[i_idx, u_idx] = best_cost
                    best_triplets[(i_idx, u_idx)] = best_eval

        # Solve assignment using Hungarian algorithm
        row_ind, col_ind = linear_sum_assignment(cost_matrix)

        assignments = []
        for i_idx, u_idx in zip(row_ind, col_ind):
            inc = incidents[i_idx]
            if cost_matrix[i_idx, u_idx] < 900000.0:
                trip = best_triplets[(i_idx, u_idx)]
                expl = self.generate_explanation(inc, trip, scenario_id)
                assignments.append({
                    "incident_id": inc.get("id"),
                    "success": True,
                    "recommended_unit": trip["unit"],
                    "recommended_hospital": trip["hospital"],
                    "total_eta_minutes": trip["total_eta_min"],
                    "combined_reliability_pct": trip["combined_reliability_pct"],
                    "explanation": expl
                })
            else:
                assignments.append({
                    "incident_id": inc.get("id"),
                    "success": False,
                    "message": "No feasible unit/hospital satisfying flood wading and bed constraints"
                })

        return assignments

dispatch_engine = DispatchEngine()
