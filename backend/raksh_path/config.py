import os
import yaml
from pathlib import Path
from typing import Dict, Any

BASE_DIR = Path(__file__).resolve().parent.parent
CONFIG_DIR = BASE_DIR / "config"
DATA_DIR = BASE_DIR / "data"

DATA_DIR.mkdir(parents=True, exist_ok=True)

def load_yaml(file_path: Path) -> Dict[str, Any]:
    if not file_path.exists():
        return {}
    with open(file_path, "r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}

REGIONS_CONFIG = load_yaml(CONFIG_DIR / "regions.yaml")
VEHICLES_CONFIG = load_yaml(CONFIG_DIR / "vehicle_profiles.yaml")
ROUTING_CONFIG = load_yaml(CONFIG_DIR / "routing_weights.yaml")
SCENARIOS_CONFIG = load_yaml(CONFIG_DIR / "scenarios.yaml")

DEFAULT_REGION_ID = REGIONS_CONFIG.get("default_region", "prayagraj")
DEFAULT_SCENARIO_ID = "heavy_monsoon"
DB_PATH = DATA_DIR / "raksh_path.db"
MODEL_PATH = DATA_DIR / "flood_lightgbm_model.pkl"
