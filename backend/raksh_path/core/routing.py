"""
Time-Dependent Predictive Emergency Routing Engine with Backup Diversity for Raksh Path
"""
import math
import heapq
import logging
from typing import Dict, Any, List, Optional, Tuple, Set
import networkx as nx

from raksh_path.config import ROUTING_CONFIG, SCENARIOS_CONFIG
from raksh_path.core.road_graph import build_or_load_graph, haversine_distance_m
from raksh_path.core.flood_model import flood_model
from raksh_path.core.vehicle_profiles import vehicle_manager

logger = logging.getLogger("raksh_path.routing")

def get_scenario_conditions_at_time(scenario_id: str, hour_float: float) -> Tuple[float, float, float]:
    """
    Interpolates rainfall (mm/h), 3h accumulated rain (mm), and river surge (m)
    for a given scenario at hour_float (between 0.0 and 6.0).
    """
    scenarios = SCENARIOS_CONFIG.get("scenarios", {})
    scen = scenarios.get(scenario_id, scenarios.get("heavy_monsoon", {}))

    rain_list = scen.get("rainfall_hourly_mm", [20.0, 40.0, 60.0, 45.0, 30.0, 20.0, 10.0])
    surge_list = scen.get("river_surge_hourly_m", [0.2, 0.6, 1.2, 1.8, 2.2, 2.5, 2.7])

    h_idx = max(0, min(len(rain_list) - 1, int(hour_float)))
    h_frac = hour_float - h_idx
    next_idx = min(len(rain_list) - 1, h_idx + 1)

    # Linear interpolation
    rain_1h = rain_list[h_idx] + h_frac * (rain_list[next_idx] - rain_list[h_idx])
    surge_m = surge_list[h_idx] + h_frac * (surge_list[next_idx] - surge_list[h_idx])

    # 3-hour accumulation estimate
    start_window = max(0, h_idx - 2)
    accum_3h = sum(rain_list[start_window : h_idx + 1]) + rain_1h * 0.5

    return round(rain_1h, 2), round(accum_3h, 2), round(surge_m, 2)

class EmergencyRouter:
    def __init__(self, G: Optional[nx.MultiDiGraph] = None, region_id: str = "prayagraj"):
        self.region_id = region_id
        self.G = G if G is not None else build_or_load_graph(region_id)
        self.config = ROUTING_CONFIG.get("routing", {})
        self.severity_lambdas = self.config.get("severity_lambda", {
            1: 25.0, 2: 60.0, 3: 120.0, 4: 220.0, 5: 350.0
        })

    def switch_region(self, region_id: str) -> None:
        if self.region_id == region_id and self.G is not None:
            return
        self.region_id = region_id
        self.G = build_or_load_graph(region_id)
        logger.info(f"Switched router graph to region '{region_id}' ({len(self.G.nodes)} nodes, {len(self.G.edges)} edges).")

    def find_nearest_node(self, lat: float, lon: float) -> str:
        min_dist = float("inf")
        best_node = None
        for n, attrs in self.G.nodes(data=True):
            d = haversine_distance_m(lat, lon, attrs["y"], attrs["x"])
            if d < min_dist:
                min_dist = d
                best_node = n
        return best_node

    def calculate_edge_cost_and_reliability(
        self,
        u: str,
        v: str,
        edge_attrs: Dict[str, Any],
        vehicle_class: str,
        arrival_hour: float,
        scenario_id: str,
        severity: int = 3,
        penalized_edges: Optional[Set[Tuple[str, str]]] = None,
        incident_type: Optional[str] = None,
        disaster_type: str = "flood"
    ) -> Tuple[float, float, float, float]:
        """
        Calculates:
        (edge_cost, edge_duration_sec, pass_prob, water_depth_m)
        """
        # Multi-Hazard evaluation
        if disaster_type != "flood":
            from raksh_path.core.disaster_types import evaluate_multi_hazard_edge
            pass_prob, status, color, reason = evaluate_multi_hazard_edge(
                edge_attrs=edge_attrs,
                disaster_type=disaster_type,
                vehicle_class=vehicle_class
            )
            depth_m = 0.0
            if pass_prob <= 0.005:
                return float("inf"), float("inf"), 0.0, depth_m
        else:
            rain_1h, accum_3h, surge_m = get_scenario_conditions_at_time(scenario_id, arrival_hour)
            # 1. Predict water depth on this segment
            depth_m, flood_prob = flood_model.predict_edge_flood(
                edge_attrs=edge_attrs,
                rainfall_1h_mm=rain_1h,
                rainfall_3h_accum_mm=accum_3h,
                river_surge_m=surge_m
            )

            # 2. Evaluate vehicle passability with hard & soft constraints
            pass_prob, violation_reason = vehicle_manager.calculate_passability_probability(
                vehicle_class=vehicle_class,
                water_depth_m=depth_m,
                edge_attrs=edge_attrs,
                incident_type=incident_type
            )

            if pass_prob <= 0.005 or violation_reason is not None:
                # Impassable edge
                return float("inf"), float("inf"), 0.0, depth_m

        # 3. Time calculation with flood slowdown
        length_m = edge_attrs.get("length", 100.0)
        base_speed_kph = edge_attrs.get("speed_kph", 30.0)
        profile = vehicle_manager.get_profile(vehicle_class)
        safe_depth = profile.get("safe_wading_depth_m", 0.30)

        # Speed slows down proportionally to water depth
        speed_factor = max(0.25, 1.0 - 0.75 * min(1.0, depth_m / max(0.1, safe_depth)))
        eff_speed_mps = (base_speed_kph * (1000.0 / 3600.0)) * speed_factor
        duration_sec = length_m / max(1.0, eff_speed_mps)

        # 4. Severity-weighted penalty on unreliability (-ln(pass_prob))
        lambda_val = self.severity_lambdas.get(severity, 120.0)
        # Numerical protection: clamp pass_prob
        p_clamped = max(0.001, min(0.9999, pass_prob))
        unreliability_cost = -math.log(p_clamped) * lambda_val

        cost = duration_sec + unreliability_cost

        # 5. Apply backup diversification penalty if requested
        if penalized_edges and (u, v) in penalized_edges:
            backup_cfg = self.config.get("backup_route", {})
            cost *= backup_cfg.get("primary_edge_penalty_multiplier", 4.5)
            if pass_prob < 0.85:
                cost *= backup_cfg.get("risk_edge_penalty_multiplier", 6.0)

        return cost, duration_sec, p_clamped, depth_m

    def solve_time_dependent_path(
        self,
        origin_node: str,
        dest_node: str,
        vehicle_class: str,
        start_hour: float,
        scenario_id: str,
        severity: int = 3,
        penalized_edges: Optional[Set[Tuple[str, str]]] = None,
        incident_type: Optional[str] = None,
        disaster_type: str = "flood"
    ) -> Optional[Dict[str, Any]]:
        """
        Dijkstra variant tracking cumulative arrival time and severity risk.
        """
        # Priority queue entries: (cost, current_node, elapsed_sec, path_nodes)
        heap = [(0.0, origin_node, 0.0, [origin_node])]
        visited: Dict[str, float] = {}

        while heap:
            cum_cost, current_node, elapsed_sec, path = heapq.heappop(heap)

            if current_node == dest_node:
                # Reconstruct full path metrics
                return self._assemble_route_details(
                    path=path,
                    vehicle_class=vehicle_class,
                    start_hour=start_hour,
                    scenario_id=scenario_id,
                    severity=severity,
                    incident_type=incident_type,
                    disaster_type=disaster_type
                )

            if current_node in visited and visited[current_node] <= cum_cost:
                continue
            visited[current_node] = cum_cost

            curr_arrival_hour = start_hour + (elapsed_sec / 3600.0)

            for neighbor in self.G.successors(current_node):
                edge_dict = self.G.get_edge_data(current_node, neighbor, 0)
                if not edge_dict:
                    continue

                e_cost, e_dur, e_prob, _ = self.calculate_edge_cost_and_reliability(
                    u=current_node,
                    v=neighbor,
                    edge_attrs=edge_dict,
                    vehicle_class=vehicle_class,
                    arrival_hour=curr_arrival_hour,
                    scenario_id=scenario_id,
                    severity=severity,
                    penalized_edges=penalized_edges,
                    incident_type=incident_type,
                    disaster_type=disaster_type
                )

                if math.isinf(e_cost):
                    continue

                new_cost = cum_cost + e_cost
                new_elapsed = elapsed_sec + e_dur
                heapq.heappush(heap, (new_cost, neighbor, new_elapsed, path + [neighbor]))

        return None

    def _assemble_route_details(
        self,
        path: List[str],
        vehicle_class: str,
        start_hour: float,
        scenario_id: str,
        severity: int,
        incident_type: Optional[str],
        disaster_type: str = "flood"
    ) -> Dict[str, Any]:
        segments = []
        coordinates = []
        total_length_m = 0.0
        total_duration_sec = 0.0
        elapsed_sec = 0.0
        cum_log_reliability = 0.0
        max_flood_depth = 0.0
        min_pass_prob = 1.0

        for i in range(len(path) - 1):
            u = path[i]
            v = path[i + 1]
            edge_dict = self.G.get_edge_data(u, v, 0)

            curr_arrival_hour = start_hour + (elapsed_sec / 3600.0)
            _, e_dur, e_prob, depth_m = self.calculate_edge_cost_and_reliability(
                u=u,
                v=v,
                edge_attrs=edge_dict,
                vehicle_class=vehicle_class,
                arrival_hour=curr_arrival_hour,
                scenario_id=scenario_id,
                severity=severity,
                incident_type=incident_type,
                disaster_type=disaster_type
            )

            total_length_m += edge_dict.get("length", 100.0)
            total_duration_sec += e_dur
            elapsed_sec += e_dur
            cum_log_reliability += math.log(max(0.0001, e_prob))
            max_flood_depth = max(max_flood_depth, depth_m)
            min_pass_prob = min(min_pass_prob, e_prob)

            geom = edge_dict.get("geometry")
            if geom:
                coordinates.extend(geom if not coordinates else geom[1:])
            else:
                u_node = self.G.nodes[u]
                v_node = self.G.nodes[v]
                if not coordinates:
                    coordinates.append([u_node["x"], u_node["y"]])
                coordinates.append([v_node["x"], v_node["y"]])

            segments.append({
                "from_node": u,
                "to_node": v,
                "name": edge_dict.get("name", "Unnamed Road"),
                "length_m": round(edge_dict.get("length", 0.0), 1),
                "duration_sec": round(e_dur, 1),
                "water_depth_m": round(depth_m, 3),
                "pass_probability": round(e_prob, 4),
                "is_bridge": bool(edge_dict.get("is_bridge", False))
            })

        overall_reliability = round(math.exp(cum_log_reliability) * 100.0, 1)
        eta_minutes = round(total_duration_sec / 60.0, 1)

        return {
            "path_nodes": path,
            "coordinates": coordinates,
            "total_distance_km": round(total_length_m / 1000.0, 2),
            "total_duration_minutes": eta_minutes,
            "overall_reliability_pct": overall_reliability,
            "max_water_depth_m": round(max_flood_depth, 3),
            "min_segment_passability": round(min_pass_prob, 4),
            "segments": segments,
            "is_feasible": True
        }

    def compute_dual_routes(
        self,
        origin_lat: float,
        origin_lon: float,
        dest_lat: float,
        dest_lon: float,
        vehicle_class: str = "ambulance",
        start_hour: float = 0.0,
        scenario_id: str = "heavy_monsoon",
        severity: int = 3,
        incident_type: Optional[str] = None,
        disaster_type: str = "flood"
    ) -> Dict[str, Any]:
        """
        Computes both Primary Route and Diverse Backup Route with reliability metrics.
        """
        orig_node = self.find_nearest_node(origin_lat, origin_lon)
        dest_node = self.find_nearest_node(dest_lat, dest_lon)

        if not orig_node or not dest_node or orig_node == dest_node:
            return {
                "success": False,
                "message": "Origin and destination are identical or could not be mapped to street network."
            }

        # 1. Primary route computation
        primary = self.solve_time_dependent_path(
            origin_node=orig_node,
            dest_node=dest_node,
            vehicle_class=vehicle_class,
            start_hour=start_hour,
            scenario_id=scenario_id,
            severity=severity,
            incident_type=incident_type,
            disaster_type=disaster_type
        )

        if not primary:
            return {
                "success": False,
                "message": f"No passable route exists for vehicle class '{vehicle_class}' under current disaster conditions."
            }

        # 2. Formulate penalized edge set from primary route
        primary_edges = set()
        p_nodes = primary["path_nodes"]
        for i in range(len(p_nodes) - 1):
            primary_edges.add((p_nodes[i], p_nodes[i + 1]))

        # 3. Backup route computation with diversity penalties
        backup = self.solve_time_dependent_path(
            origin_node=orig_node,
            dest_node=dest_node,
            vehicle_class=vehicle_class,
            start_hour=start_hour,
            scenario_id=scenario_id,
            severity=severity,
            penalized_edges=primary_edges,
            incident_type=incident_type,
            disaster_type=disaster_type
        )

        # Calculate diversity ratio
        diversity_ratio = 0.0
        if backup:
            b_nodes = backup["path_nodes"]
            backup_edges = set((b_nodes[i], b_nodes[i + 1]) for i in range(len(b_nodes) - 1))
            common_edges = primary_edges.intersection(backup_edges)
            diversity_ratio = round(1.0 - (len(common_edges) / max(1, len(primary_edges))), 3)

        return {
            "success": True,
            "vehicle_class": vehicle_class,
            "start_hour": start_hour,
            "scenario_id": scenario_id,
            "severity": severity,
            "primary_route": primary,
            "backup_route": backup if backup else primary,
            "diversity_ratio": diversity_ratio,
            "has_distinct_backup": backup is not None and diversity_ratio > 0.15
        }

router = EmergencyRouter()
