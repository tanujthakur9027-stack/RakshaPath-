"""
All-Natural-Disasters (Multi-Hazard) Management Engine for Raksh Path
Provides realistic hazard modeling, civilian safety guidance, and passability
for Floods, Earthquakes, Cyclones, and Landslides across India.
"""
from typing import Dict, Any, List, Tuple
import math

DISASTER_CATALOG: Dict[str, Dict[str, Any]] = {
    "flood": {
        "id": "flood",
        "name": "Flood & Waterlogging",
        "hindi_name": "बाढ़ एवं जलभराव",
        "icon": "Waves",
        "threat_level": "Severe Inundation Alert",
        "authority": "Central Water Commission & IMD",
        "description": "Rising river stages, breach of embankments, and deep waterlogging across road underpasses.",
        "primary_hazard": "Submerged road surfaces causing vehicle engine hydrolock and impassable currents.",
        "civilian_guidance": [
            "Never attempt to drive or walk through moving water. Even 15 cm of moving water can knock you down.",
            "Move immediately to higher ground or upper floors if water enters your premises.",
            "Keep emergency battery lights ready and switch off main electrical breakers.",
            "Boil drinking water or use water purification tablets."
        ],
        "emergency_contacts": [
            {"service": "National Emergency Support", "number": "112", "desc": "All-India Emergency Helpline"},
            {"service": "Ambulance & Medical", "number": "108", "desc": "Emergency Medical Transport"},
            {"service": "State Disaster Relief", "number": "1070", "desc": "State Disaster Management Authority"},
            {"service": "NDRF Disaster Helpline", "number": "1078", "desc": "National Disaster Response Force"}
        ]
    },
    "earthquake": {
        "id": "earthquake",
        "name": "Earthquake & Seismic Tremor",
        "hindi_name": "भूकंप एवं संरचनात्मक क्षति",
        "icon": "Activity",
        "threat_level": "Major Seismic Event (M 6.8)",
        "authority": "National Centre for Seismology",
        "description": "Ground motion resulting in structural cracks on road overpasses, fallen building facades, and road fissures.",
        "primary_hazard": "Cracked flyovers, collapsed building masonry on road corridors, and broken utility gas/water pipes.",
        "civilian_guidance": [
            "Drop, Cover, and Hold On: Take cover under a sturdy desk or table away from glass windows.",
            "If on the road, pull over safely away from flyovers, overpasses, utility poles, and tall buildings.",
            "Do not use elevators. Use stairs once tremors have ceased.",
            "Expect aftershocks. Inspect structures before re-entering."
        ],
        "emergency_contacts": [
            {"service": "National Emergency Support", "number": "112", "desc": "Police, Fire & Rescue Integration"},
            {"service": "Disaster Search & Rescue (NDRF)", "number": "1078", "desc": "Collapsed Structure Search Teams"},
            {"service": "Ambulance Response", "number": "108", "desc": "Trauma & Emergency Medical"},
            {"service": "Fire & Rescue Control", "number": "101", "desc": "Gas Leaks & Structural Collapse"}
        ]
    },
    "cyclone": {
        "id": "cyclone",
        "name": "Cyclone & Severe Wind Storm",
        "hindi_name": "चक्रवात एवं भीषण आंधी",
        "icon": "Wind",
        "threat_level": "Very Severe Cyclonic Storm (140 km/h)",
        "authority": "India Meteorological Department (IMD)",
        "description": "Gale-force winds, uprooted banyan trees, severed electrical high-tension lines, and flying metal debris.",
        "primary_hazard": "Roads blocked by uprooted mature trees, live dangling power lines, and zero visibility.",
        "civilian_guidance": [
            "Remain indoors in the strongest part of the house, away from glass doors and windows.",
            "Unplug all electrical appliances to prevent damage from power surges.",
            "Never approach or touch dangling electric wires or uprooted poles.",
            "Keep emergency radio or phone charged to receive official evacuation bulletins."
        ],
        "emergency_contacts": [
            {"service": "National Emergency", "number": "112", "desc": "Unified 24x7 Emergency Line"},
            {"service": "Electricity Board Emergency", "number": "1912", "desc": "Power Line & Wire Hazard Control"},
            {"service": "Ambulance Service", "number": "108", "desc": "Emergency Trauma Dispatch"},
            {"service": "Coastal & Cyclone Relief", "number": "1077", "desc": "District Cyclone Control Cell"}
        ]
    },
    "landslide": {
        "id": "landslide",
        "name": "Landslide & Mountain Rockfall",
        "hindi_name": "भूस्खलन एवं मलबा प्रवाह",
        "icon": "Mountain",
        "threat_level": "High Geohazard Landslide Warning",
        "authority": "Geological Survey of India (GSI)",
        "description": "Steep slope instability, mudflows, debris torrents, and heavy boulders blocking transport corridors.",
        "primary_hazard": "Roads buried under hundreds of tons of rock and mud, severed valley road links.",
        "civilian_guidance": [
            "Stay alert for sudden changes in water flow or cracking sounds in trees and rocks on mountain slopes.",
            "Move quickly away from steep hillsides, gullies, and valley channels during intense rainfall.",
            "Do not cross a road where mud or small stones are actively rolling down.",
            "Notify local authorities immediately if you notice new cracks on road shoulders or retaining walls."
        ],
        "emergency_contacts": [
            {"service": "National Emergency Helpline", "number": "112", "desc": "Mountain Rescue Coordination"},
            {"service": "BRO Highway Clearance", "number": "1077", "desc": "Border Roads & Highway Clearing"},
            {"service": "Ambulance Response", "number": "108", "desc": "Trauma & Air Ambulance"},
            {"service": "NDRF Mountain Teams", "number": "1078", "desc": "Heavy Debris Evacuation"}
        ]
    }
}

def evaluate_multi_hazard_edge(
    edge_attrs: Dict[str, Any],
    disaster_type: str = "flood",
    vehicle_class: str = "ambulance",
    scenario_intensity: float = 1.0  # 0.5 to 2.0
) -> Tuple[float, str, str, str]:
    """
    Evaluates passability probability, status, color, and plain-language reason
    for a road segment under any natural disaster.
    
    Returns: (pass_prob, status, color, reason_explanation)
    """
    # Check if road is blocked by an active civilian or crew report
    if edge_attrs.get("is_blocked_by_report", False):
        return (0.05, "impassable", "#EF4444", "Directly blocked by verified on-ground hazard report")

    is_bridge = bool(edge_attrs.get("is_bridge", False))
    elevation_m = float(edge_attrs.get("elevation_m", 82.0))
    hand_m = float(edge_attrs.get("hand_m", 4.0))
    edge_id = str(edge_attrs.get("edge_id", ""))
    road_name = edge_attrs.get("name", "Corridor")

    # 1. FLOOD EVALUATION
    if disaster_type == "flood":
        # Water depth depends on HAND, elevation, and bridge presence
        if is_bridge:
            depth_m = max(0.0, 0.02 * scenario_intensity)
            reason = f"Clear passage on elevated deck of {road_name} safely above water levels."
        else:
            depth_m = max(0.0, (1.1 - 0.22 * hand_m) * scenario_intensity)
            if depth_m > 0.40:
                reason = f"Lowland section near riverbank submerged under {round(depth_m * 100)} cm water."
            elif depth_m > 0.15:
                reason = f"Moderate surface runoff ({round(depth_m * 100)} cm water), proceed with caution."
            else:
                reason = f"Dry, elevated road with minimal standing water ({round(depth_m * 100)} cm)."

        # Passability based on vehicle wading
        wading_limits = {"ambulance": 0.30, "fire_tender": 0.50, "rescue_truck": 0.60, "boat_carrier": 0.75}
        w_limit = wading_limits.get(vehicle_class, 0.30)
        if depth_m <= w_limit * 0.7:
            pass_prob = 0.95
        elif depth_m <= w_limit:
            pass_prob = 0.65
        else:
            pass_prob = max(0.02, 0.15 - (depth_m - w_limit))

    # 2. EARTHQUAKE EVALUATION
    elif disaster_type == "earthquake":
        # In earthquakes: older bridges and narrow corridors near dense masonry have higher structural risk
        if is_bridge and ("curzon" in edge_id.lower() or "old" in edge_id.lower() or "rail" in edge_id.lower()):
            pass_prob = 0.25 * (1.0 / max(0.5, scenario_intensity))
            reason = f"Structural crack advisory on older bridge deck ({road_name}); structural inspection pending."
        elif is_bridge and ("shastri" in edge_id.lower() or "new" in edge_id.lower()):
            pass_prob = 0.92
            reason = f"Modern reinforced concrete bridge deck ({road_name}) confirmed structurally sound."
        elif hand_m < 2.0 or "ghat" in edge_id.lower():
            pass_prob = 0.50
            reason = f"Riverbank embankment road subject to soil liquefaction and surface cracks."
        else:
            pass_prob = 0.90
            reason = f"Wide arterial corridor ({road_name}) clear of structural debris."

    # 3. CYCLONE EVALUATION
    elif disaster_type == "cyclone":
        # High winds affect elevated bridges and corridors with heavy tree canopies
        if is_bridge:
            pass_prob = 0.55
            reason = f"High crosswind shear on bridge deck ({road_name}); open to heavy vehicles only."
        elif "circle" in edge_id.lower() or "civil" in edge_id.lower() or "university" in edge_id.lower():
            # Tree-lined urban avenues
            pass_prob = max(0.15, 0.40 / scenario_intensity)
            reason = f"Avenue blocked by uprooted mature trees and downed electrical cables."
        else:
            pass_prob = 0.88
            reason = f"Broad corridor ({road_name}) cleared of tree debris; utility lines secure."

    # 4. LANDSLIDE EVALUATION
    elif disaster_type == "landslide":
        # Steep gradients and lowlands near river bluffs
        if hand_m > 6.0 and elevation_m > 88.0:
            pass_prob = 0.30 / scenario_intensity
            reason = f"Steep embankment bluff prone to active rockfall and debris accumulation."
        elif "ghat" in edge_id.lower() or "kachhar" in edge_id.lower():
            pass_prob = 0.45
            reason = f"Mudflow deposits washed onto lower road shoulder."
        else:
            pass_prob = 0.94
            reason = f"Protected valley bypass ({road_name}) with stable retaining structures."

    else:
        pass_prob = 0.90
        reason = f"Normal road conditions on {road_name}."

    # Status & Color mapping
    pass_prob = round(min(0.99, max(0.02, pass_prob)), 3)
    if pass_prob >= 0.80:
        status = "safe"
        color = "#10B981"  # Emerald
    elif pass_prob >= 0.45:
        status = "caution"
        color = "#F59E0B"  # Amber
    else:
        status = "impassable"
        color = "#EF4444"  # Ruby Red

    return pass_prob, status, color, reason
