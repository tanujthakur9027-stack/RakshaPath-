"""
Tests for Stage 5: Joint Multi-Constraint Dispatch and Hungarian Matching
"""
import pytest
from raksh_path.core.dispatch import DispatchEngine

def test_single_incident_recommendation():
    engine = DispatchEngine(region_id="prayagraj")

    incident = {
        "id": "INC-TEST-01",
        "lat": 25.4410,
        "lon": 81.8740,  # Near Daraganj
        "incident_type": "medical_emergency",
        "required_specialty": "trauma",
        "severity": 4,
        "description": "Severe traffic collision with flood ponding"
    }

    res = engine.recommend_for_incident(incident, scenario_id="heavy_monsoon", start_hour=1.0)
    assert res["success"] is True
    assert "recommended_unit" in res
    assert "recommended_hospital" in res
    assert res["total_eta_minutes"] > 0
    assert 0.0 <= res["combined_reliability_pct"] <= 100.0
    assert "explanation" in res
    assert len(res["explanation"]) > 30

    # Ensure hospital has available trauma beds
    hosp = res["recommended_hospital"]
    assert hosp["trauma_beds_available"] > 0

def test_hospital_bed_exhaustion_constraint():
    engine = DispatchEngine(region_id="prayagraj")

    # Artificially exhaust trauma beds at the closest hospital (e.g., SRN Hospital)
    for h in engine.hospitals:
        if h["id"] == "H-SRN":
            h["trauma_beds_available"] = 0

    incident = {
        "id": "INC-TEST-TRAUMA",
        "lat": 25.4431,
        "lon": 81.8540,
        "incident_type": "trauma_severe",
        "required_specialty": "trauma",
        "severity": 5
    }

    res = engine.recommend_for_incident(incident, scenario_id="heavy_monsoon", start_hour=1.0)
    assert res["success"] is True
    # Must NOT assign H-SRN since its trauma beds are 0!
    assert res["recommended_hospital"]["id"] != "H-SRN"

def test_batch_joint_hungarian_dispatch_no_double_assignment():
    engine = DispatchEngine(region_id="prayagraj")

    incidents = [
        {
            "id": "INC-A",
            "lat": 25.4525,
            "lon": 81.8340,
            "incident_type": "medical_emergency",
            "required_specialty": "general",
            "severity": 3
        },
        {
            "id": "INC-B",
            "lat": 25.4608,
            "lon": 81.8475,
            "incident_type": "medical_emergency",
            "required_specialty": "general",
            "severity": 3
        },
        {
            "id": "INC-C",
            "lat": 25.4410,
            "lon": 81.8740,
            "incident_type": "water_rescue",
            "required_specialty": "trauma",
            "severity": 4
        }
    ]

    assignments = engine.solve_joint_batch_dispatch(incidents, scenario_id="heavy_monsoon", start_hour=1.0)
    assert len(assignments) == 3

    assigned_unit_ids = []
    for a in assignments:
        if a["success"]:
            assigned_unit_ids.append(a["recommended_unit"]["unit_id"])

    # Double-assignment check: all assigned unit IDs must be unique
    assert len(assigned_unit_ids) == len(set(assigned_unit_ids)), "No unit may be double-assigned across concurrent incidents"
