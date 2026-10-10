"""
Seed Script for Raksh Path
Builds road graph, trains ML model, seeds database, and executes simulation with one command.
"""
import sys
import logging
from pathlib import Path

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from raksh_path.db.database import init_db, save_incident
from raksh_path.core.road_graph import build_or_load_graph
from raksh_path.core.flood_model import flood_model
from raksh_path.core.vehicle_profiles import vehicle_manager
from raksh_path.core.dispatch import dispatch_engine
from raksh_path.core.updater import updater
from raksh_path.simulation.sim_engine import run_discrete_event_simulation

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("raksh_path.seed")

def seed():
    print("=" * 70)
    print("RAKSH PATH - ONE-COMMAND INITIALIZATION & SEEDING")
    print("=" * 70)

    # 1. Initialize DB
    print("\n[1/5] Initializing SQLite database schema...")
    init_db()
    print("  -> Database schema ready.")

    # 2. Build road graph
    print("\n[2/5] Building & enriching Prayagraj road network graph...")
    G = build_or_load_graph("prayagraj", force_refresh=True)
    print(f"  -> Road network loaded: {len(G.nodes)} intersections, {len(G.edges)} directed segments.")

    # 3. Train LightGBM flood model
    print("\n[3/5] Training calibrated LightGBM flood inundation model...")
    metrics = flood_model.train_and_evaluate(n_samples=4000)
    print(f"  -> Model trained: Precision={metrics['precision']}, Recall={metrics['recall']}, AUC-PR={metrics['auc_pr']}, Brier={metrics['brier_score']}")

    # 4. Seed initial realistic emergency incidents in Prayagraj
    print("\n[4/5] Seeding representative monsoon flood incidents...")
    seed_incidents = [
        {
            "id": "INC-001",
            "region_id": "prayagraj",
            "lat": 25.4380,
            "lon": 81.8810,
            "incident_type": "water_rescue",
            "severity": 4,
            "required_specialty": "trauma",
            "description": "Family of 4 marooned at Daraganj Ghat; water level rising rapidly past 45cm",
            "status": "pending"
        },
        {
            "id": "INC-002",
            "region_id": "prayagraj",
            "lat": 25.4650,
            "lon": 81.8680,
            "incident_type": "trapped_citizens",
            "severity": 3,
            "required_specialty": "general",
            "description": "Elderly citizens stranded on ground floor in Chhota Baghada; low-lying drainage backflow",
            "status": "pending"
        },
        {
            "id": "INC-003",
            "region_id": "prayagraj",
            "lat": 25.4525,
            "lon": 81.8340,
            "incident_type": "medical_emergency",
            "severity": 5,
            "required_specialty": "icu",
            "description": "Cardiac arrest requiring Advanced Life Support (ALS) near Civil Lines Subhash Chauraha",
            "status": "pending"
        },
        {
            "id": "INC-004",
            "region_id": "prayagraj",
            "lat": 25.4180,
            "lon": 81.8100,
            "incident_type": "structural_collapse",
            "severity": 4,
            "required_specialty": "trauma",
            "description": "Boundary wall collapse into flooded lane in Kareli Lowland Sector",
            "status": "pending"
        },
        {
            "id": "INC-005",
            "region_id": "prayagraj",
            "lat": 25.4299,
            "lon": 81.8844,
            "incident_type": "water_rescue",
            "severity": 5,
            "required_specialty": "trauma",
            "description": "Pilgrims trapped on submerged sandbar at Triveni Sangam during sudden Ganga surge",
            "status": "pending"
        }
    ]

    for inc in seed_incidents:
        save_incident(inc)
        rec = dispatch_engine.recommend_for_incident(inc, scenario_id="heavy_monsoon", start_hour=1.0)
        if rec.get("success"):
            updater.register_mission(inc, rec)
    print(f"  -> Seeded {len(seed_incidents)} realistic flood incidents with active dispatches.")

    # 5. Run SimPy benchmark simulation
    print("\n[5/5] Executing SimPy Monte Carlo flood benchmark simulation...")
    sim_res = run_discrete_event_simulation(num_incidents=25, scenario_id="heavy_monsoon")
    b = sim_res["metrics"]["baseline"]
    r = sim_res["metrics"]["raksh_path"]
    imp = sim_res["metrics"]["improvement"]
    print(f"  -> Simulation complete!")
    print(f"     Baseline Mean Response Time:   {b['mean_response_time_minutes']} min (P90: {b['p90_response_time_minutes']} min)")
    print(f"     Raksh Path Mean Response Time: {r['mean_response_time_minutes']} min (P90: {r['p90_response_time_minutes']} min)")
    print(f"     Response Time Improvement:     {imp['mean_response_time_reduction_pct']}% faster")
    print(f"     Blocked Routes Eliminated:     {imp['blocked_routes_eliminated']} (Baseline had {b['blocked_routes_count']}, Raksh Path had {r['blocked_routes_count']})")
    print(f"     Diversions Prevented:          {imp['diversions_prevented']} (Hospital bed mismatches avoided)")

    print("\n" + "=" * 70)
    print("RAKSH PATH INITIALIZATION COMPLETED SUCCESSFULLY!")
    print("Ready to launch backend via: uvicorn raksh_path.api.app:app --port 8000")
    print("=" * 70)

if __name__ == "__main__":
    seed()
