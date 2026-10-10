"""
Vehicle Profiles, Operational Constraints, and Passability Probabilities for Raksh Path
"""
import math
import logging
from typing import Dict, Any, List, Optional, Tuple
from raksh_path.config import VEHICLES_CONFIG
from raksh_path.regions import region_manager

logger = logging.getLogger("raksh_path.vehicle_profiles")

class VehicleProfileManager:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or VEHICLES_CONFIG
        self.profiles: Dict[str, Any] = self.config.get("profiles", {})

    def get_profile(self, vehicle_class: str) -> Dict[str, Any]:
        if vehicle_class not in self.profiles:
            # Fallback to ambulance as default emergency vehicle
            return self.profiles.get("ambulance", {
                "class_id": "ambulance",
                "safe_wading_depth_m": 0.30,
                "critical_wading_depth_m": 0.45,
                "soft_transition_k": 18.0,
                "avg_speed_kph": 45.0,
                "max_weight_tonnes": 3.5,
                "max_height_m": 2.8,
                "min_road_width_m": 2.5
            })
        return self.profiles[vehicle_class]

    def list_profiles(self) -> List[Dict[str, Any]]:
        return list(self.profiles.values())

    def calculate_passability_probability(
        self,
        vehicle_class: str,
        water_depth_m: float,
        edge_attrs: Dict[str, Any],
        incident_type: Optional[str] = None
    ) -> Tuple[float, Optional[str]]:
        """
        Calculates pass probability in [0.0, 1.0] using a soft sigmoid threshold
        for water depth, while enforcing hard weight/height/width limits.
        Returns: (probability, constraint_violation_reason_or_None)
        """
        profile = self.get_profile(vehicle_class)

        # 1. Hard physical constraints
        max_wt = edge_attrs.get("maxweight")
        veh_wt = profile.get("max_weight_tonnes", 3.5)
        if max_wt is not None and veh_wt > float(max_wt):
            return 0.0, f"Vehicle weight ({veh_wt}t) exceeds bridge/road capacity ({max_wt}t)"

        max_ht = edge_attrs.get("maxheight")
        veh_ht = profile.get("max_height_m", 2.8)
        if max_ht is not None and veh_ht > float(max_ht):
            return 0.0, f"Vehicle height ({veh_ht}m) exceeds underpass clearance ({max_ht}m)"

        rd_width = edge_attrs.get("width")
        min_width = profile.get("min_road_width_m", 2.5)
        if rd_width is not None and float(rd_width) < min_width:
            return 0.0, f"Road width ({rd_width}m) is too narrow for vehicle ({min_width}m)"

        # Check crew-reported temporary road blockage
        if edge_attrs.get("is_blocked_by_report", False):
            return 0.0, "Road reported blocked by on-scene crew"

        # 2. Soft wading depth passability
        safe_depth = profile.get("safe_wading_depth_m", 0.30)
        critical_depth = profile.get("critical_wading_depth_m", 0.45)
        k = profile.get("soft_transition_k", 16.0)

        # Special handling for boat-carrying trucks in deep water
        if profile.get("can_deploy_boat", False) and incident_type in ["water_rescue", "trapped_citizens", "flood_evacuation"]:
            # If carrier truck can drive or boat can deploy
            if water_depth_m <= safe_depth:
                p_pass = 1.0 / (1.0 + math.exp(k * (water_depth_m - safe_depth)))
            elif water_depth_m <= critical_depth:
                p_pass = 0.85  # Deploying motorized boat
            else:
                p_pass = 0.70  # Navigating deep water via motorized boat
            return round(min(0.999, max(0.001, p_pass)), 4), None

        if water_depth_m <= 0.01:
            return 0.999, None

        # Logistic sigmoid curve: P(pass) = 1 / (1 + exp(k * (depth - safe_depth)))
        # When depth = safe_depth, P = 0.50
        # When depth < safe_depth, P -> 1.0
        # When depth > critical_depth, P -> 0.0
        exponent = k * (water_depth_m - safe_depth)
        # Numerical stability clamp
        exponent = max(-20.0, min(20.0, exponent))
        p_pass = 1.0 / (1.0 + math.exp(exponent))

        if water_depth_m >= critical_depth:
            p_pass = min(p_pass, 0.005)

        return round(min(0.999, max(0.001, p_pass)), 4), None

    def initialize_fleet(self, region_id: str = "prayagraj") -> List[Dict[str, Any]]:
        """
        Simulates ~15 ambulances, 6 fire tenders, 4 rescue trucks, 2 boat trucks
        stationed at real hospital and fire station locations.
        """
        hospitals = region_manager.get_hospitals(region_id)
        fire_stations = region_manager.get_fire_stations(region_id)

        fleet: List[Dict[str, Any]] = []
        unit_idx = 1

        # 15 Ambulances positioned at hospitals & central points
        for i in range(15):
            hosp = hospitals[i % len(hospitals)]
            fleet.append({
                "unit_id": f"AMB-{unit_idx:02d}",
                "callsign": f"108-Ambulance-{unit_idx:02d}",
                "class_id": "ambulance",
                "display_name": f"ALS Ambulance #{unit_idx:02d}",
                "base_location_name": hosp["name"],
                "lat": round(hosp["lat"] + (i * 0.0003), 5),
                "lon": round(hosp["lon"] + (i * 0.0003), 5),
                "status": "available",  # "available", "dispatched", "busy"
                "current_incident_id": None,
                "safe_wading_depth_m": 0.30,
            })
            unit_idx += 1

        # 6 Fire Tenders at Fire Stations
        for i in range(6):
            station = fire_stations[i % len(fire_stations)]
            fleet.append({
                "unit_id": f"FT-{i+1:02d}",
                "callsign": f"Fire-Tender-{i+1:02d}",
                "class_id": "fire_tender",
                "display_name": f"Heavy Rescue Tender #{i+1:02d}",
                "base_location_name": station["name"],
                "lat": round(station["lat"] + (i * 0.0002), 5),
                "lon": round(station["lon"] + (i * 0.0002), 5),
                "status": "available",
                "current_incident_id": None,
                "safe_wading_depth_m": 0.50,
            })

        # 4 High-Clearance Rescue Trucks at Fire Stations
        for i in range(4):
            station = fire_stations[i % len(fire_stations)]
            fleet.append({
                "unit_id": f"RT-{i+1:02d}",
                "callsign": f"SDRF-Rescue-Truck-{i+1:02d}",
                "class_id": "rescue_truck",
                "display_name": f"4x4 High-Clearance Truck #{i+1:02d}",
                "base_location_name": station["name"],
                "lat": round(station["lat"] - (i * 0.0002), 5),
                "lon": round(station["lon"] + (i * 0.0002), 5),
                "status": "available",
                "current_incident_id": None,
                "safe_wading_depth_m": 0.60,
            })

        # 2 Boat-Carrying Trucks stationed near river station (Civil Lines & Naini)
        for i in range(2):
            station = fire_stations[i * 2] if len(fire_stations) > 2 else fire_stations[0]
            fleet.append({
                "unit_id": f"BT-{i+1:02d}",
                "callsign": f"NDRF-Boat-Carrier-{i+1:02d}",
                "class_id": "boat_truck",
                "display_name": f"Inflatable Motor Boat Carrier #{i+1:02d}",
                "base_location_name": station["name"],
                "lat": round(station["lat"], 5),
                "lon": round(station["lon"], 5),
                "status": "available",
                "current_incident_id": None,
                "safe_wading_depth_m": 0.60,
            })

        logger.info(f"Initialized fleet for {region_id}: {len(fleet)} total rescue units.")
        return fleet

vehicle_manager = VehicleProfileManager()
