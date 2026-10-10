"""
Raksh Path - FastAPI Application & OpenAPI REST Endpoints
"""
import uuid
import json
import logging
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from raksh_path.config import SCENARIOS_CONFIG
from raksh_path.regions import region_manager
from raksh_path.core.road_graph import build_or_load_graph, graph_to_geojson_features, graph_nodes_to_geojson_features
from raksh_path.core.flood_model import flood_model
from raksh_path.core.vehicle_profiles import vehicle_manager
from raksh_path.core.routing import router, get_scenario_conditions_at_time
from raksh_path.core.dispatch import dispatch_engine
from raksh_path.core.updater import updater
from raksh_path.db.database import init_db, save_incident, get_all_incidents, get_incident_by_id
from raksh_path.db.models import (
    IncidentCreate,
    ScenarioAdvanceRequest,
    ScenarioSelectRequest,
    BlockedRoadReportRequest,
    OverrideDispatchRequest
)
from pydantic import BaseModel
from raksh_path.core.disaster_types import DISASTER_CATALOG, evaluate_multi_hazard_edge

class CivilianSOSRequest(BaseModel):
    region_id: str = "prayagraj"
    lat: float
    lon: float
    hazard_type: str  # "flooded_road", "fallen_tree", "building_debris", "landslide", "medical_emergency"
    description: Optional[str] = None
    contact_phone: Optional[str] = None
    disaster_type: str = "flood"

logger = logging.getLogger("raksh_path.api")

app = FastAPI(
    title="Raksh Path API",
    description="Predictive Emergency Routing and Dispatch Platform for Floods in India",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    init_db()
    # Ensure model is loaded
    if not flood_model.load():
        logger.info("Training initial flood model on startup...")
        flood_model.train_and_evaluate(n_samples=2500)
    logger.info("Raksh Path API initialized successfully.")

@app.get("/")
def root():
    return {
        "app": "Raksh Path",
        "description": "Predictive Emergency Routing & Dispatch Platform for Floods",
        "pilot_region": "Prayagraj, Uttar Pradesh, India",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

# ----------------- REGIONS & FLEET -----------------

@app.get("/regions")
def get_regions():
    return {
        "success": True,
        "regions": region_manager.list_regions()
    }

@app.get("/regions/national-overview")
def get_national_overview():
    """
    Returns nationwide flood monitoring status and emergency readiness across all Indian regions.
    """
    regions = region_manager.list_regions()
    overview = []
    basin_info = {
        "prayagraj": {"basin": "Ganga & Yamuna Confluence", "alert_level": "Severe Flood Warning", "river_level": "85.20m (Danger 85.73m)", "surge_trend": "+1.2m Rising", "vulnerability": "High (Lowland Sangam & Daraganj)"},
        "patna": {"basin": "Middle Ganga Basin", "alert_level": "Flood Alert Watch", "river_level": "49.80m (Danger 50.52m)", "surge_trend": "+0.8m Moderate", "vulnerability": "Moderate (Ganga Embankments)"},
        "guwahati": {"basin": "Brahmaputra Valley", "alert_level": "Critical River Breach", "river_level": "49.50m (Danger 49.68m)", "surge_trend": "+1.9m Rapid Surge", "vulnerability": "Critical (Riverbank Submergence)"},
        "mumbai": {"basin": "Konkan Coastal & Mithi Basin", "alert_level": "High Tide & Urban Surge", "river_level": "4.80m (Danger 5.50m)", "surge_trend": "+0.5m High Tide", "vulnerability": "Urban Lowlands & Underpasses"},
        "delhi": {"basin": "Upper Yamuna Floodplain", "alert_level": "Yamuna Surge Warning", "river_level": "205.10m (Danger 205.33m)", "surge_trend": "+1.1m High", "vulnerability": "Floodplain Monasteries & Ring Road"},
        "chennai": {"basin": "Coromandel Coastal (Adyar & Cooum)", "alert_level": "Northeast Monsoon Watch", "river_level": "5.40m (Danger 7.50m)", "surge_trend": "+0.4m Surface Runoff", "vulnerability": "Urban Drainage & Marshlands"},
        "kolkata": {"basin": "Lower Gangetic Delta & Hooghly", "alert_level": "Tidal Inundation Alert", "river_level": "6.20m (Danger 7.80m)", "surge_trend": "+0.6m Tidal Surge", "vulnerability": "Strand Road & Lowland Wards"}
    }
    for r in regions:
        rid = r["id"]
        info = basin_info.get(rid, {
            "basin": f"{r['name']} Basin",
            "alert_level": "Active Flood Monitoring",
            "river_level": "Approaching Warning Level",
            "surge_trend": "+0.5m",
            "vulnerability": "Floodplain Lowlands"
        })
        overview.append({
            "id": rid,
            "name": r.get("name", rid),
            "state": r.get("state", "India"),
            "center_lat": r.get("center_lat", r.get("center", {}).get("lat", 25.4358)),
            "center_lon": r.get("center_lon", r.get("center", {}).get("lon", 81.8463)),
            "pilot_ready": r.get("pilot_ready", False),
            **info
        })
    return {
        "success": True,
        "national_status": "MONSOON DISASTER READINESS ACTIVE",
        "regions_count": len(overview),
        "overview": overview
    }

@app.get("/fleet")
def get_fleet(region_id: str = Query("prayagraj")):
    if dispatch_engine.region_id != region_id:
        dispatch_engine.switch_region(region_id)
    return {
        "success": True,
        "fleet": dispatch_engine.fleet
    }

@app.get("/hospitals")
def get_hospitals(region_id: str = Query("prayagraj")):
    if dispatch_engine.region_id != region_id:
        dispatch_engine.switch_region(region_id)
    return {
        "success": True,
        "hospitals": dispatch_engine.hospitals
    }

@app.get("/disasters")
def get_disasters():
    """
    Returns the multi-hazard disaster catalog (Flood, Earthquake, Cyclone, Landslide)
    with civilian guidance and emergency helpline directories.
    """
    return {
        "success": True,
        "disasters": list(DISASTER_CATALOG.values())
    }

# ----------------- MAP & ROAD SEGMENTS -----------------

@app.get("/segments")
def get_segments(
    vehicle: str = Query("ambulance", description="Vehicle class: ambulance, fire_tender, rescue_truck, boat_truck"),
    hour: float = Query(0.0, ge=0.0, le=6.0, description="Projected hour ahead (0 to 6)"),
    scenario: Optional[str] = Query(None, description="Scenario ID (default is active scenario)"),
    region_id: str = Query("prayagraj", description="Region / City ID"),
    disaster_type: str = Query("flood", description="Disaster type: flood, earthquake, cyclone, landslide")
):
    """
    Returns the road network as a GeoJSON FeatureCollection with passability,
    hazard risk status, and color coding for the specified vehicle and disaster.
    """
    if router.region_id != region_id:
        router.switch_region(region_id)
    scen_id = scenario or updater.active_scenario_id
    rain_1h, accum_3h, surge_m = get_scenario_conditions_at_time(scen_id, hour)

    G = router.G
    features = []

    for u, v, k, attrs in G.edges(keys=True, data=True):
        if disaster_type != "flood":
            pass_prob, status, color, reason = evaluate_multi_hazard_edge(
                edge_attrs=attrs,
                disaster_type=disaster_type,
                vehicle_class=vehicle,
                scenario_intensity=1.2
            )
            depth_m = 0.0
        else:
            # Predict flood depth on segment
            depth_m, flood_prob = flood_model.predict_edge_flood(
                edge_attrs=attrs,
                rainfall_1h_mm=rain_1h,
                rainfall_3h_accum_mm=accum_3h,
                river_surge_m=surge_m
            )

            # Calculate vehicle passability
            pass_prob, reason = vehicle_manager.calculate_passability_probability(
                vehicle_class=vehicle,
                water_depth_m=depth_m,
                edge_attrs=attrs
            )

            # Risk classification
            if pass_prob >= 0.80:
                status = "safe"
                color = "#10B981"  # Emerald green
            elif pass_prob >= 0.40:
                status = "caution"
                color = "#F59E0B"  # Amber
            else:
                status = "impassable"
                color = "#EF4444"  # Red

        geom = attrs.get("geometry")
        if not geom:
            u_node = G.nodes[u]
            v_node = G.nodes[v]
            geom = [[u_node["x"], u_node["y"]], [v_node["x"], v_node["y"]]]

        features.append({
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": geom
            },
            "properties": {
                "edge_id": attrs.get("edge_id"),
                "u": u,
                "v": v,
                "name": attrs.get("name", "Road"),
                "length_m": attrs.get("length", 0.0),
                "speed_kph": attrs.get("speed_kph", 30.0),
                "elevation_m": attrs.get("elevation_m", 80.0),
                "hand_m": attrs.get("hand_m", 5.0),
                "is_bridge": bool(attrs.get("is_bridge", False)),
                "water_depth_m": depth_m,
                "water_depth_cm": round(depth_m * 100.0, 1),
                "pass_probability": pass_prob,
                "pass_probability_pct": round(pass_prob * 100.0, 1),
                "status": status,
                "color": color,
                "is_blocked_by_report": bool(attrs.get("is_blocked_by_report", False)),
                "constraint_violation": reason
            }
        })

    return {
        "type": "FeatureCollection",
        "metadata": {
            "vehicle": vehicle,
            "hour": hour,
            "scenario": scen_id,
            "rainfall_1h_mm": rain_1h,
            "river_surge_m": surge_m,
            "total_segments": len(features)
        },
        "features": features
    }

@app.get("/nodes")
def get_nodes():
    G = router.G
    features = graph_nodes_to_geojson_features(G)
    return {
        "type": "FeatureCollection",
        "features": features
    }

# ----------------- INCIDENTS & DISPATCH -----------------

@app.post("/incidents")
def create_incident(inc: IncidentCreate):
    inc_id = f"INC-{uuid.uuid4().hex[:6].upper()}"
    incident_data = {
        "id": inc_id,
        "region_id": inc.region_id or "prayagraj",
        "lat": inc.lat,
        "lon": inc.lon,
        "incident_type": inc.incident_type,
        "severity": inc.severity,
        "required_specialty": inc.required_specialty,
        "description": inc.description,
        "status": "pending"
    }
    save_incident(incident_data)

    # Compute immediate recommendation
    rec = dispatch_engine.recommend_for_incident(
        incident=incident_data,
        scenario_id=updater.active_scenario_id,
        start_hour=updater.current_hour
    )

    # If successfully recommended, register mission
    if rec.get("success"):
        updater.register_mission(incident_data, rec)

    return {
        "success": True,
        "incident": incident_data,
        "recommendation": rec
    }

def seed_region_incidents(region_id: str, disaster_type: str = "flood") -> List[Dict[str, Any]]:
    reg = region_manager.get_region(region_id)
    center = reg.get("center", {"lat": 25.4358, "lon": 81.8463})
    clat, clon = center["lat"], center["lon"]

    # Disaster-specific templates
    if disaster_type == "earthquake":
        templates = [
            ("P1", "trauma", f"Building facade collapse & structural rubble on arterial road, {reg.get('name', region_id)}", clat + 0.003, clon + 0.002, "trauma"),
            ("P2", "medical_emergency", f"Multiple crush injuries & trapped family, {reg.get('name', region_id)} Central", clat - 0.003, clon - 0.004, "icu"),
        ]
    elif disaster_type == "cyclone":
        templates = [
            ("P1", "water_rescue", f"Uprooted banyan tree blocking corridor with live 11kV powerlines, {reg.get('name', region_id)}", clat + 0.004, clon + 0.003, "trauma"),
            ("P2", "medical_emergency", f"Severe windstorm trauma & flying debris injury, {reg.get('name', region_id)}", clat - 0.002, clon + 0.005, "icu"),
        ]
    elif disaster_type == "landslide":
        templates = [
            ("P1", "water_rescue", f"Massive hillside rockfall blocking valley transit pass, {reg.get('name', region_id)}", clat + 0.005, clon - 0.002, "trauma"),
            ("P2", "medical_emergency", f"Stranded mountain passenger bus with injured evacuees, {reg.get('name', region_id)}", clat - 0.004, clon + 0.003, "trauma"),
        ]
    else:  # flood
        regional_templates = {
            "patna": [
                ("P1", "water_rescue", "Trapped family on ground floor near Ganga Embankment, Gandhi Ghat", 25.6180, 85.1600, "trauma"),
                ("P2", "medical_emergency", "Acute myocardial infarction & respiratory distress, Kankarbagh Colony", 25.5940, 85.1480, "icu"),
            ],
            "guwahati": [
                ("P1", "water_rescue", "Brahmaputra flash surge inundation in Bharalumukh lowlands", 26.1750, 91.7310, "trauma"),
                ("P2", "medical_emergency", "Cardiac emergency near Guwahati Railway Station, Panbazar", 26.1820, 91.7520, "icu"),
            ],
            "mumbai": [
                ("P1", "water_rescue", "Mithi River water breach near Kurla West, 45cm flooding", 19.0680, 72.8750, "trauma"),
                ("P2", "medical_emergency", "Dialysis patient transport during high-tide alert, Dadar East", 19.0190, 72.8450, "general"),
            ],
            "delhi": [
                ("P1", "water_rescue", "Yamuna floodplain breach at Kashmere Gate Monastery market", 28.6670, 77.2340, "trauma"),
                ("P2", "medical_emergency", "Pediatric respiratory emergency near ITO Vikas Marg", 28.6300, 77.2510, "icu"),
            ],
            "chennai": [
                ("P1", "water_rescue", "Adyar River overflow in Mudichur / Tambaram lowland", 13.0100, 80.2100, "trauma"),
                ("P2", "medical_emergency", "Severe trauma & cardiac arrest, Anna Salai corridor", 13.0600, 80.2520, "general"),
            ],
            "kolkata": [
                ("P1", "water_rescue", "Hooghly high-tide overflow near Nimtala Ghat Strand Road", 22.5930, 88.3560, "trauma"),
                ("P2", "medical_emergency", "ALS Ambulance transfer near Park Circus 7-point crossing", 22.5410, 88.3680, "icu"),
            ]
        }
        templates = regional_templates.get(region_id, [
            ("P1", "water_rescue", f"Riverbank flash flood rescue in {reg.get('name', region_id)}", clat + 0.005, clon + 0.008, "trauma"),
            ("P2", "medical_emergency", f"Urgent cardiac emergency in central {reg.get('name', region_id)}", clat - 0.004, clon - 0.005, "icu"),
        ])

    seeded = []
    for sev, itype, desc, lat, lon, spec in templates:
        inc_data = {
            "id": f"INC-{region_id[:3].upper()}-{uuid.uuid4().hex[:4].upper()}",
            "region_id": region_id,
            "lat": lat,
            "lon": lon,
            "incident_type": itype,
            "severity": 4 if sev == "P1" else 3,
            "required_specialty": spec,
            "description": desc,
            "status": "pending"
        }
        save_incident(inc_data)
        seeded.append(inc_data)
    return seeded

@app.get("/incidents")
def list_incidents(
    region_id: Optional[str] = Query(None),
    disaster_type: str = Query("flood")
):
    all_inc = get_all_incidents()
    if region_id:
        filtered = [i for i in all_inc if i.get("region_id") == region_id]
        if not filtered:
            filtered = seed_region_incidents(region_id, disaster_type=disaster_type)
        return {
            "success": True,
            "incidents": filtered
        }
    return {
        "success": True,
        "incidents": all_inc
    }

@app.post("/civilian/sos")
def civilian_sos_report(req: CivilianSOSRequest):
    """
    Civilian 1-tap SOS and road hazard reporting.
    Instantly registers incident and marks nearby road segments as reported danger.
    """
    inc_id = f"SOS-{uuid.uuid4().hex[:6].upper()}"
    inc_data = {
        "id": inc_id,
        "region_id": req.region_id,
        "lat": req.lat,
        "lon": req.lon,
        "incident_type": "water_rescue" if req.hazard_type in ["flooded_road", "landslide"] else "trauma",
        "severity": 4,
        "required_specialty": "trauma",
        "description": f"Civilian SOS Report: {req.hazard_type.replace('_', ' ').title()} - {req.description or 'Immediate civilian assistance requested'}",
        "status": "pending",
        "contact_phone": req.contact_phone
    }
    save_incident(inc_data)

    # Find nearest road segment in current graph and mark as blocked by report
    G = router.G
    nearest_edge = None
    min_dist = float("inf")
    for u, v, k, attrs in G.edges(keys=True, data=True):
        geom = attrs.get("geometry")
        if geom:
            for pt in geom:
                d = ((pt[1] - req.lat)**2 + (pt[0] - req.lon)**2)**0.5
                if d < min_dist:
                    min_dist = d
                    nearest_edge = (u, v, k)
    if nearest_edge:
        u, v, k = nearest_edge
        G[u][v][k]["is_blocked_by_report"] = True
        logger.info(f"Marked edge ({u}, {v}) blocked based on civilian SOS report.")

    return {
        "success": True,
        "sos_id": inc_id,
        "message": "Civilian SOS registered. Emergency dispatch alerted.",
        "incident": inc_data
    }

@app.get("/incidents/{incident_id}/recommendation")
def get_recommendation(incident_id: str):
    inc = get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    rec = dispatch_engine.recommend_for_incident(
        incident=inc,
        scenario_id=updater.active_scenario_id,
        start_hour=updater.current_hour
    )
    return {
        "incident": inc,
        "recommendation": rec
    }

@app.post("/incidents/{incident_id}/override")
def override_dispatch(incident_id: str, payload: OverrideDispatchRequest):
    inc = get_incident_by_id(incident_id)
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    unit = next((u for u in dispatch_engine.fleet if u["unit_id"] == payload.unit_id), None)
    hospital = next((h for h in dispatch_engine.hospitals if h["id"] == payload.hospital_id), None)

    if not unit or not hospital:
        raise HTTPException(status_code=400, detail="Invalid unit or hospital ID")

    triplet = dispatch_engine.evaluate_triplet(
        incident=inc,
        unit=unit,
        hospital=hospital,
        scenario_id=updater.active_scenario_id,
        start_hour=updater.current_hour
    )

    if not triplet:
        raise HTTPException(status_code=400, detail="Selected unit or hospital is not feasible for this incident")

    expl = f"Manual Dispatcher Override: Assigned {unit['display_name']} and destination {hospital['name']}. Total ETA: {triplet['total_eta_min']}m."

    override_rec = {
        "success": True,
        "incident_id": incident_id,
        "recommended_unit": unit,
        "recommended_hospital": hospital,
        "total_eta_minutes": triplet["total_eta_min"],
        "combined_reliability_pct": triplet["combined_reliability_pct"],
        "explanation": expl,
        "primary_route": {
            "coordinates": triplet["leg1"]["primary_route"]["coordinates"] + triplet["leg2"]["primary_route"]["coordinates"],
            "overall_reliability_pct": triplet["combined_reliability_pct"],
            "eta_minutes": triplet["total_eta_min"],
            "distance_km": triplet["total_distance_km"]
        },
        "backup_route": {
            "coordinates": triplet["leg1"]["backup_route"]["coordinates"] + triplet["leg2"]["backup_route"]["coordinates"],
            "overall_reliability_pct": round((triplet["leg1"]["backup_route"]["overall_reliability_pct"] * triplet["leg2"]["backup_route"]["overall_reliability_pct"]) / 100.0, 1),
            "eta_minutes": round(triplet["leg1"]["backup_route"]["total_duration_minutes"] + triplet["leg2"]["backup_route"]["total_duration_minutes"], 1),
            "distance_km": round(triplet["leg1"]["backup_route"]["total_distance_km"] + triplet["leg2"]["backup_route"]["total_distance_km"], 2)
        }
    }

    updater.register_mission(inc, override_rec)

    return {
        "success": True,
        "message": "Dispatcher override applied successfully.",
        "recommendation": override_rec
    }

# ----------------- SCENARIO & REPORTS -----------------

@app.get("/status")
def get_system_status():
    return updater.get_status()

@app.post("/scenario/advance")
def advance_scenario(req: ScenarioAdvanceRequest):
    result = updater.advance_scenario(hours_delta=req.hours_delta)
    return result

@app.post("/scenario/select")
def select_scenario(req: ScenarioSelectRequest):
    result = updater.set_scenario(scenario_id=req.scenario_id, start_hour=req.start_hour)
    return {
        "success": True,
        "status": result
    }

@app.post("/reports/blocked-road")
def report_blocked_road(report: BlockedRoadReportRequest):
    result = updater.report_road_block(
        u_node=report.u_node,
        v_node=report.v_node,
        reason=report.reason,
        reporter_callsign=report.reporter_callsign
    )
    return result

@app.get("/alerts")
def get_alerts():
    return {
        "success": True,
        "alerts": updater.get_alerts()
    }

# ----------------- SIMULATION RESULTS -----------------

@app.get("/simulation/results")
def get_simulation_results():
    from raksh_path.simulation.sim_engine import load_or_run_simulation
    res = load_or_run_simulation()
    return res
