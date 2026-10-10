"""
Tests for Stage 6: Real-Time Scenario Updater, Route Degradation Alerts, and Crew Blockage Feed
"""
import pytest
from raksh_path.core.updater import ScenarioUpdater
from raksh_path.core.dispatch import dispatch_engine

def test_advance_scenario_and_reliability_alert():
    up = ScenarioUpdater()
    up.set_scenario("extreme_surge", start_hour=0.0)

    # Create an incident in a low-lying zone (Daraganj)
    incident = {
        "id": "INC-DARA-FLOOD",
        "lat": 25.4380,
        "lon": 81.8810,
        "incident_type": "medical_emergency",
        "required_specialty": "general",
        "severity": 3
    }

    rec = dispatch_engine.recommend_for_incident(incident, scenario_id="extreme_surge", start_hour=0.0)
    assert rec["success"] is True

    # Register active mission with an ambulance (sensitive to flood wading)
    rec["recommended_unit"]["class_id"] = "ambulance"
    rec["recommended_unit"]["callsign"] = "108-Ambulance-05"
    mission = up.register_mission(incident, rec)
    assert mission["active_route_type"] == "primary"

    # Advance scenario by 4.5 hours (where river surge exceeds ambulance safe depth)
    res = up.advance_scenario(hours_delta=4.5)
    assert res["new_hour"] == 4.5

    # Under extreme surge at hour 4.5, low-lying Daraganj is heavily flooded for ambulances
    # The updater detects reliability degradation and raises an alert
    alerts = up.get_alerts()
    assert len(alerts) >= 1
    assert any("switched to backup route" in a["action_taken"].lower() for a in alerts)

def test_crew_road_blockage_report():
    up = ScenarioUpdater()
    u = "N_DARA_1"
    v = "N_DARA_GHAT"

    rep_res = up.report_road_block(
        u_node=u,
        v_node=v,
        reason="Submerged beneath 90cm water; bridge approach impassable",
        reporter_callsign="108-AMB-02"
    )

    assert rep_res["success"] is True
    assert len(up.blocked_reports) >= 1
    # Check that the router graph has marked this edge as blocked
    from raksh_path.core.routing import router
    assert router.G[u][v][0]["is_blocked_by_report"] is True
