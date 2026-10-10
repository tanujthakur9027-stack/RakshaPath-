"""
Tests for Stage 4: Time-Dependent Routing and Diverse Backup Route Generation
"""
import pytest
from raksh_path.core.routing import EmergencyRouter, get_scenario_conditions_at_time

def test_scenario_condition_interpolation():
    rain, accum, surge = get_scenario_conditions_at_time("heavy_monsoon", hour_float=2.5)
    assert rain > 0
    assert accum > rain
    assert surge > 0

def test_dual_route_generation():
    router = EmergencyRouter(region_id="prayagraj")

    # From Civil Lines (25.4525, 81.8340) to Swaroop Rani Nehru Hospital (25.4431, 81.8542)
    res = router.compute_dual_routes(
        origin_lat=25.4525,
        origin_lon=81.8340,
        dest_lat=25.4431,
        dest_lon=81.8542,
        vehicle_class="ambulance",
        start_hour=1.0,
        scenario_id="heavy_monsoon",
        severity=3
    )

    assert res["success"] is True
    assert "primary_route" in res
    assert "backup_route" in res

    primary = res["primary_route"]
    assert primary["total_distance_km"] > 0
    assert primary["total_duration_minutes"] > 0
    assert 0.0 <= primary["overall_reliability_pct"] <= 100.0
    assert len(primary["coordinates"]) >= 2
    assert len(primary["segments"]) >= 1

    # Check reliability calculation is a product of segment pass probabilities
    expected_prod = 1.0
    for seg in primary["segments"]:
        expected_prod *= seg["pass_probability"]
    assert abs(primary["overall_reliability_pct"] - round(expected_prod * 100.0, 1)) < 0.5

def test_severity_weight_impact():
    router = EmergencyRouter(region_id="prayagraj")

    # Run routing with minor severity (1) vs critical severity (5)
    res_minor = router.compute_dual_routes(
        origin_lat=25.4525,
        origin_lon=81.8340,
        dest_lat=25.4380,
        dest_lon=81.8810, # Near Daraganj riverbank
        vehicle_class="ambulance",
        start_hour=2.0,
        scenario_id="heavy_monsoon",
        severity=1
    )

    res_critical = router.compute_dual_routes(
        origin_lat=25.4525,
        origin_lon=81.8340,
        dest_lat=25.4380,
        dest_lon=81.8810,
        vehicle_class="ambulance",
        start_hour=2.0,
        scenario_id="heavy_monsoon",
        severity=5
    )

    if res_minor["success"] and res_critical["success"]:
        # Critical severity should enforce equal or higher reliability
        rel_minor = res_minor["primary_route"]["overall_reliability_pct"]
        rel_critical = res_critical["primary_route"]["overall_reliability_pct"]
        assert rel_critical >= rel_minor - 1.0, "Critical severity should enforce safer path"
