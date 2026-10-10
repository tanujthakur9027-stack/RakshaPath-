"""
Tests for Stage 3: Vehicle Profiles, Wading Passability, and Constraints
"""
import pytest
from raksh_path.core.vehicle_profiles import vehicle_manager

def test_wading_depth_sigmoid_passability():
    # Ambulance tests (safe 30cm, critical 45cm)
    dummy_edge = {"maxweight": 40.0, "maxheight": 5.0, "width": 12.0}

    # Dry / shallow puddle
    p_dry, r_dry = vehicle_manager.calculate_passability_probability("ambulance", 0.05, dummy_edge)
    assert p_dry > 0.95
    assert r_dry is None

    # Exactly at safe wading depth (30cm)
    p_safe, _ = vehicle_manager.calculate_passability_probability("ambulance", 0.30, dummy_edge)
    assert 0.40 <= p_safe <= 0.60

    # Deep flood (48cm)
    p_deep, _ = vehicle_manager.calculate_passability_probability("ambulance", 0.48, dummy_edge)
    assert p_deep < 0.05

    # Rescue truck tests (safe 60cm)
    p_rt_40cm, _ = vehicle_manager.calculate_passability_probability("rescue_truck", 0.40, dummy_edge)
    assert p_rt_40cm > 0.85, "Rescue truck should easily wade through 40cm water"

    p_rt_70cm, _ = vehicle_manager.calculate_passability_probability("rescue_truck", 0.70, dummy_edge)
    assert p_rt_70cm < 0.30

def test_hard_constraints():
    # Weight constraint: Fire tender (16 tonnes) on bridge with maxweight 10 tonnes
    weak_bridge = {"maxweight": 10.0, "maxheight": 5.0, "width": 8.0}
    p_wt, r_wt = vehicle_manager.calculate_passability_probability("fire_tender", 0.0, weak_bridge)
    assert p_wt == 0.0
    assert r_wt is not None and "weight" in r_wt.lower()

    # Height constraint: Rescue truck (3.2m) in low tunnel (2.5m)
    low_tunnel = {"maxweight": 30.0, "maxheight": 2.5, "width": 8.0}
    p_ht, r_ht = vehicle_manager.calculate_passability_probability("rescue_truck", 0.0, low_tunnel)
    assert p_ht == 0.0
    assert r_ht is not None and "height" in r_ht.lower()

    # Blocked road report
    blocked_rd = {"maxweight": 30.0, "maxheight": 5.0, "width": 8.0, "is_blocked_by_report": True}
    p_blk, r_blk = vehicle_manager.calculate_passability_probability("ambulance", 0.0, blocked_rd)
    assert p_blk == 0.0
    assert r_blk is not None and "blocked" in r_blk.lower()

def test_fleet_initialization():
    fleet = vehicle_manager.initialize_fleet("prayagraj")
    assert len(fleet) >= 27
    classes = [u["class_id"] for u in fleet]
    assert classes.count("ambulance") == 15
    assert classes.count("fire_tender") == 6
    assert classes.count("rescue_truck") == 4
    assert classes.count("boat_truck") == 2
