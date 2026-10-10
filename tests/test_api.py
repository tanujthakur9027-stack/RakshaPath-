"""
Tests for Stage 7: FastAPI Endpoints and API Workflows
"""
import pytest
from fastapi.testclient import TestClient
from raksh_path.api.app import app

client = TestClient(app)

def test_root_endpoint():
    resp = client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert data["app"] == "Raksh Path"

def test_get_regions():
    resp = client.get("/regions")
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert len(data["regions"]) >= 1
    reg_ids = [r["id"] for r in data["regions"]]
    assert "prayagraj" in reg_ids

def test_get_segments():
    resp = client.get("/segments?vehicle=ambulance&hour=2.0")
    assert resp.status_code == 200
    geojson = resp.json()
    assert geojson["type"] == "FeatureCollection"
    assert len(geojson["features"]) > 0

    first_feat = geojson["features"][0]
    assert first_feat["type"] == "Feature"
    props = first_feat["properties"]
    assert "status" in props
    assert props["status"] in ["safe", "caution", "impassable"]
    assert "color" in props
    assert "water_depth_cm" in props

def test_create_incident_and_recommendation():
    payload = {
        "lat": 25.4410,
        "lon": 81.8740,
        "incident_type": "water_rescue",
        "severity": 4,
        "required_specialty": "trauma",
        "description": "Rising flood near Daraganj Ghat",
        "region_id": "prayagraj"
    }

    resp = client.post("/incidents", json=payload)
    assert resp.status_code == 200
    res = resp.json()
    assert res["success"] is True
    assert "incident" in res
    inc_id = res["incident"]["id"]

    # Recommendation check
    rec = res["recommendation"]
    assert rec["success"] is True
    assert "recommended_unit" in rec
    assert "recommended_hospital" in rec
    assert "primary_route" in rec
    assert "backup_route" in rec
    assert "explanation" in rec
    assert len(rec["explanation"]) > 20

    # Retrieve recommendation by ID
    get_resp = client.get(f"/incidents/{inc_id}/recommendation")
    assert get_resp.status_code == 200
    assert get_resp.json()["incident"]["id"] == inc_id

def test_scenario_advance_endpoint():
    resp = client.post("/scenario/advance", json={"hours_delta": 1.0})
    assert resp.status_code == 200
    data = resp.json()
    assert "new_hour" in data
    assert data["new_hour"] >= 1.0

def test_crew_blocked_road_report_endpoint():
    payload = {
        "u_node": "N_CIVIL_1",
        "v_node": "N_CIVIL_2",
        "reason": "Uprooted tree and 50cm deep water across lane",
        "reporter_callsign": "108-AMB-01"
    }
    resp = client.post("/reports/blocked-road", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "report" in data

def test_simulation_results_endpoint():
    resp = client.get("/simulation/results")
    assert resp.status_code == 200
    data = resp.json()
    assert "metrics" in data
    assert "baseline" in data["metrics"]
    assert "raksh_path" in data["metrics"]
    assert "improvement" in data["metrics"]
