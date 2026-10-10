"""
Real-Time Scenario Updater, Route Reliability Monitor, and Crew Blockage Feed for Raksh Path
"""
import math
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime

from raksh_path.config import ROUTING_CONFIG, SCENARIOS_CONFIG
from raksh_path.core.routing import router, get_scenario_conditions_at_time
from raksh_path.core.dispatch import dispatch_engine

logger = logging.getLogger("raksh_path.updater")

class ScenarioUpdater:
    def __init__(self):
        self.current_hour: float = 0.0
        self.active_scenario_id: str = "heavy_monsoon"
        self.alert_threshold_pct: float = ROUTING_CONFIG.get("routing", {}).get("alert_reliability_threshold", 0.70) * 100.0

        # In-memory store of active dispatches
        self.active_missions: Dict[str, Dict[str, Any]] = {}
        # Alerts history
        self.alerts: List[Dict[str, Any]] = []
        # Crew blockage reports
        self.blocked_reports: List[Dict[str, Any]] = []

    def set_scenario(self, scenario_id: str, start_hour: float = 0.0) -> Dict[str, Any]:
        scenarios = SCENARIOS_CONFIG.get("scenarios", {})
        if scenario_id in scenarios:
            self.active_scenario_id = scenario_id
        self.current_hour = max(0.0, min(6.0, start_hour))
        return self.get_status()

    def get_status(self) -> Dict[str, Any]:
        rain, accum, surge = get_scenario_conditions_at_time(self.active_scenario_id, self.current_hour)
        return {
            "scenario_id": self.active_scenario_id,
            "current_hour": self.current_hour,
            "rainfall_hourly_mm": rain,
            "accum_3h_mm": accum,
            "river_surge_m": surge,
            "active_missions_count": len(self.active_missions),
            "active_alerts_count": len([a for a in self.alerts if not a.get("acknowledged", False)]),
            "blocked_roads_count": len(self.blocked_reports)
        }

    def register_mission(self, incident: Dict[str, Any], recommendation: Dict[str, Any]) -> Dict[str, Any]:
        mission_id = f"MSN-{incident['id']}"
        mission = {
            "mission_id": mission_id,
            "incident_id": incident["id"],
            "incident": incident,
            "unit": recommendation["recommended_unit"],
            "hospital": recommendation["recommended_hospital"],
            "primary_route": recommendation["primary_route"],
            "backup_route": recommendation["backup_route"],
            "active_route_type": "primary",
            "initial_reliability_pct": recommendation["combined_reliability_pct"],
            "current_reliability_pct": recommendation["combined_reliability_pct"],
            "status": "in_transit",
            "created_at_hour": self.current_hour
        }
        self.active_missions[mission_id] = mission
        logger.info(f"Registered new mission {mission_id} for incident {incident['id']}")
        return mission

    def advance_scenario(self, hours_delta: float = 1.0) -> Dict[str, Any]:
        """
        Advances rainfall timeline, re-scores all active in-progress missions,
        and triggers alerts with automatic fallback to backup routes when reliability drops.
        """
        old_hour = self.current_hour
        self.current_hour = min(6.0, round(self.current_hour + hours_delta, 2))
        logger.info(f"Advancing scenario from {old_hour}h to {self.current_hour}h")

        triggered_alerts = []

        # Re-score all active missions
        for m_id, mission in list(self.active_missions.items()):
            if mission["status"] != "in_transit":
                continue

            unit_class = mission["unit"]["class_id"]
            inc = mission["incident"]
            hosp = mission["hospital"]

            # Re-evaluate route under new hourly conditions
            res = router.compute_dual_routes(
                origin_lat=mission["unit"]["lat"],
                origin_lon=mission["unit"]["lon"],
                dest_lat=inc["lat"],
                dest_lon=inc["lon"],
                vehicle_class=unit_class,
                start_hour=self.current_hour,
                scenario_id=self.active_scenario_id,
                severity=inc.get("severity", 3)
            )

            if not res["success"]:
                # Primary route completely flooded!
                new_rel = 0.0
            else:
                new_rel = res["primary_route"]["overall_reliability_pct"]

            old_rel = mission["current_reliability_pct"]
            mission["current_reliability_pct"] = new_rel

            # Check for reliability degradation below threshold
            if new_rel < self.alert_threshold_pct and mission["active_route_type"] == "primary":
                # Switch to backup route
                mission["active_route_type"] = "backup"
                backup_rel = mission["backup_route"]["overall_reliability_pct"]

                alert = {
                    "alert_id": f"ALT-{m_id}-{int(self.current_hour*10)}",
                    "mission_id": m_id,
                    "incident_id": mission["incident_id"],
                    "unit_callsign": mission["unit"]["callsign"],
                    "timestamp_hour": self.current_hour,
                    "severity": "CRITICAL" if new_rel < 30.0 else "WARNING",
                    "message": (
                        f"Route reliability for {mission['unit']['callsign']} dropped from {old_rel}% to {new_rel}% "
                        f"due to rising flood levels at T+{self.current_hour}h. "
                        f"Automatically switched to Backup Route (Reliability: {backup_rel}%)."
                    ),
                    "action_taken": "Switched to Backup Route",
                    "acknowledged": False
                }
                self.alerts.append(alert)
                triggered_alerts.append(alert)
                logger.warning(alert["message"])

        return {
            "status": self.get_status(),
            "hours_advanced": hours_delta,
            "new_hour": self.current_hour,
            "triggered_alerts": triggered_alerts
        }

    def report_road_block(
        self,
        u_node: str,
        v_node: str,
        reason: str = "Debris / Deep Water Blockage",
        reporter_callsign: str = "CREW-108-01"
    ) -> Dict[str, Any]:
        """
        Feeds crew reported road block back into the road graph, setting passability to 0,
        and re-routing affected active missions immediately.
        """
        G = router.G
        edge_found = False

        if G.has_edge(u_node, v_node):
            G[u_node][v_node][0]["is_blocked_by_report"] = True
            edge_found = True
        if G.has_edge(v_node, u_node):
            G[v_node][u_node][0]["is_blocked_by_report"] = True
            edge_found = True

        report = {
            "report_id": f"REP-{len(self.blocked_reports) + 1:03d}",
            "u": u_node,
            "v": v_node,
            "reason": reason,
            "reporter": reporter_callsign,
            "hour": self.current_hour,
            "timestamp": datetime.now().isoformat()
        }
        self.blocked_reports.append(report)

        # Check affected active missions
        affected_missions = []
        for m_id, mission in self.active_missions.items():
            if mission["status"] != "in_transit":
                continue
            path_nodes = mission["primary_route"].get("path_nodes", [])
            # Check if this edge is on path
            is_on_path = any(
                (path_nodes[i] == u_node and path_nodes[i+1] == v_node) or
                (path_nodes[i] == v_node and path_nodes[i+1] == u_node)
                for i in range(len(path_nodes) - 1)
            )
            if is_on_path:
                mission["active_route_type"] = "backup"
                alert = {
                    "alert_id": f"ALT-BLK-{m_id}",
                    "mission_id": m_id,
                    "incident_id": mission["incident_id"],
                    "unit_callsign": mission["unit"]["callsign"],
                    "timestamp_hour": self.current_hour,
                    "severity": "URGENT",
                    "message": f"Crew reported blockage on segment {u_node} <-> {v_node} ({reason}). Mission diverted to backup route.",
                    "action_taken": "Switched to Backup Route",
                    "acknowledged": False
                }
                self.alerts.append(alert)
                affected_missions.append(m_id)

        return {
            "success": True,
            "report": report,
            "affected_missions": affected_missions,
            "message": f"Segment {u_node} <-> {v_node} marked as blocked. {len(affected_missions)} active missions rerouted."
        }

    def get_alerts(self) -> List[Dict[str, Any]]:
        return list(reversed(self.alerts))

updater = ScenarioUpdater()
