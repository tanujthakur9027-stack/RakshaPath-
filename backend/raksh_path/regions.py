"""
Pan-India Region & District Registry for Raksh Path
"""
from typing import Dict, Any, List, Optional
from raksh_path.config import REGIONS_CONFIG, DEFAULT_REGION_ID

class RegionManager:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or REGIONS_CONFIG
        self.regions: Dict[str, Any] = self.config.get("regions", {})

    def list_regions(self) -> List[Dict[str, Any]]:
        return [
            {
                "id": r_id,
                "name": data.get("name"),
                "state": data.get("state"),
                "center": data.get("center"),
                "center_lat": data.get("center", {}).get("lat", 25.4358),
                "center_lon": data.get("center", {}).get("lon", 81.8463),
                "bbox": data.get("bbox"),
                "pilot_ready": r_id == "prayagraj",
                "hospital_count": len(data.get("hospitals", [])),
                "fire_station_count": len(data.get("fire_stations", [])),
            }
            for r_id, data in self.regions.items()
        ]

    def get_region(self, region_id: Optional[str] = None) -> Dict[str, Any]:
        r_id = region_id or DEFAULT_REGION_ID
        if r_id not in self.regions:
            # fallback to default
            r_id = DEFAULT_REGION_ID
        return self.regions[r_id]

    def get_hospitals(self, region_id: Optional[str] = None) -> List[Dict[str, Any]]:
        reg = self.get_region(region_id)
        return reg.get("hospitals", [])

    def get_fire_stations(self, region_id: Optional[str] = None) -> List[Dict[str, Any]]:
        reg = self.get_region(region_id)
        return reg.get("fire_stations", [])

    def get_rivers(self, region_id: Optional[str] = None) -> List[Dict[str, Any]]:
        reg = self.get_region(region_id)
        return reg.get("rivers", [])

region_manager = RegionManager()
