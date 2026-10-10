"""
Road Graph & Spatial Feature Enrichment Module for Raksh Path
"""
import os
import json
import math
import logging
from pathlib import Path
from typing import Dict, Any, Tuple, List, Optional
import networkx as nx
import numpy as np

from raksh_path.config import DATA_DIR
from raksh_path.regions import region_manager

logger = logging.getLogger("raksh_path.road_graph")
logging.basicConfig(level=logging.INFO)

def haversine_distance_m(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0  # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + \
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

def compute_dist_to_rivers_m(lat: float, lon: float, rivers_geometry: List[List[Tuple[float, float]]]) -> float:
    min_dist = float("inf")
    for river_coords in rivers_geometry:
        for r_lat, r_lon in river_coords:
            d = haversine_distance_m(lat, lon, r_lat, r_lon)
            if d < min_dist:
                min_dist = d
    return min_dist

def get_prayagraj_river_centerlines() -> List[List[Tuple[float, float]]]:
    # Ganga river flow past Prayagraj towards Sangam and eastwards
    ganga = [
        (25.4950, 81.8300),  # Phaphamau
        (25.4750, 81.8480),  # Beli kachhar
        (25.4600, 81.8680),  # Bagambari / Chhota Baghada
        (25.4380, 81.8810),  # Daraganj Ghat
        (25.4299, 81.8844),  # Triveni Sangam
        (25.4220, 81.9050),  # Jhunsi East
        (25.4150, 81.9250),
    ]
    # Yamuna river flow from SW towards Sangam
    yamuna = [
        (25.4100, 81.8000),  # Kareli bank
        (25.4200, 81.8300),  # Saraswati Ghat / Kydganj
        (25.4240, 81.8550),  # Yamuna Bank
        (25.4280, 81.8750),  # Near Fort
        (25.4299, 81.8844),  # Triveni Sangam
    ]
    return [ganga, yamuna]

def generate_synthetic_prayagraj_network() -> nx.MultiDiGraph:
    """
    Generates a realistic, topologically connected street network for Prayagraj, UP.
    Includes real landmarks, bridges across the Ganga and Yamuna, low-lying riverbank
    corridors, and elevated central city arterials.
    """
    G = nx.MultiDiGraph()
    G.graph["crs"] = "EPSG:4326"
    G.graph["name"] = "Prayagraj Drivable Emergency Network"

    # Define key landmark nodes
    # (id, name, lat, lon, elevation_m, zone_type)
    nodes_data = [
        # Central Elevated Ridge (Civil Lines & Cantonment: ~88 - 95m MSL)
        ("N_CIVIL_1", "Subhash Chauraha (Civil Lines)", 25.4525, 81.8340, 93.5, "ridge"),
        ("N_CIVIL_2", "MG Marg North", 25.4570, 81.8360, 94.0, "ridge"),
        ("N_CIVIL_3", "High Court Junction", 25.4490, 81.8260, 95.0, "ridge"),
        ("N_CIVIL_4", "Civil Lines Bus Station", 25.4540, 81.8410, 93.0, "ridge"),
        ("N_CANT_1", "Cantonment Hospital Gate", 25.4520, 81.8210, 95.5, "ridge"),
        ("N_CANT_2", "Cantonment South", 25.4450, 81.8150, 96.0, "ridge"),

        # Medical Core: Swaroop Rani Nehru (SRN) & MLN Medical College (~87 - 91m MSL)
        ("N_SRN_MAIN", "Swaroop Rani Nehru Hospital Gate", 25.4431, 81.8542, 90.0, "medical"),
        ("N_MLN_MAIN", "MLN Medical College Junction", 25.4410, 81.8520, 89.5, "medical"),
        ("N_DUFFERIN", "Dufferin Hospital Gate", 25.4385, 81.8380, 91.0, "medical"),
        ("N_TBS_BELI", "Tej Bahadur Sapru (Beli) Hospital", 25.4608, 81.8475, 86.5, "medical"),

        # Academic & Town Center (Georgetown, Colonelganj, University: ~88 - 92m MSL)
        ("N_GEO_1", "Georgetown Crossing", 25.4470, 81.8590, 89.0, "urban"),
        ("N_COLONEL_1", "Colonelganj Crossing", 25.4590, 81.8610, 87.5, "urban"),
        ("N_UNIV_1", "Prayagraj University Library", 25.4610, 81.8550, 88.0, "urban"),
        ("N_ALLEN_1", "Allenganj Chauraha", 25.4660, 81.8530, 86.0, "urban"),

        # Riverbank Lowlands (Daraganj, Sangam, Chhota Baghada, Beli Kachhar: ~74.5 - 77.5m MSL)
        ("N_DARA_1", "Daraganj Main Road", 25.4410, 81.8740, 78.5, "lowland"),
        ("N_DARA_GHAT", "Daraganj River Ghat Road", 25.4380, 81.8810, 75.2, "lowland_critical"),
        ("N_SANGAM_1", "Sangam Bund Marg", 25.4330, 81.8790, 77.5, "lowland"),
        ("N_SANGAM_GHAT", "Triveni Sangam Ghat Point", 25.4299, 81.8844, 74.6, "lowland_critical"),
        ("N_BAGHADA_1", "Chhota Baghada Crossing", 25.4650, 81.8680, 75.8, "lowland_critical"),
        ("N_BAGAMBARI", "Bagambari Gaddi / Riverbank", 25.4550, 81.8720, 75.4, "lowland_critical"),
        ("N_BELI_KACHHAR", "Beli Kachhar Low Road", 25.4680, 81.8440, 75.3, "lowland_critical"),

        # Yamuna South & Kareli Lowlands (~75.5 - 82m MSL)
        ("N_KARELI_1", "Kareli 60-Feet Road", 25.4240, 81.8150, 81.0, "lowland"),
        ("N_KARELI_LOW", "Kareli Lowland Embankment", 25.4180, 81.8100, 75.5, "lowland_critical"),
        ("N_SARASWATI_GHAT", "Saraswati Ghat / Kydganj", 25.4230, 81.8420, 75.8, "lowland"),
        ("N_FORT_1", "Akbar Fort Outer Road", 25.4280, 81.8720, 82.5, "urban"),

        # Major Bridges (Bridges elevate deck above floodwaters: 90 - 93m MSL)
        # Shastri Bridge across Ganga (Connecting Daraganj <-> Jhusi)
        ("N_SHASTRI_WEST", "Shastri Bridge West Approach (Daraganj)", 25.4420, 81.8770, 84.0, "bridge_approach"),
        ("N_SHASTRI_DECK", "Shastri Bridge Deck (Mid-Ganga)", 25.4380, 81.8920, 92.5, "bridge_deck"),
        ("N_SHASTRI_EAST", "Shastri Bridge East Approach (Jhusi)", 25.4350, 81.9050, 85.0, "bridge_approach"),

        # Curzon / Phaphamau Bridge across Ganga (Teliyarganj <-> Phaphamau)
        ("N_CURZON_SOUTH", "Phaphamau Bridge South (Teliyarganj)", 25.4850, 81.8450, 85.0, "bridge_approach"),
        ("N_CURZON_DECK", "Phaphamau Bridge Deck (Mid-Ganga)", 25.4920, 81.8420, 91.5, "bridge_deck"),
        ("N_CURZON_NORTH", "Phaphamau North Approach", 25.4980, 81.8390, 86.0, "bridge_approach"),

        # New Yamuna Bridge & Old Naini Bridge (Yamuna Crossing)
        ("N_NAINI_NORTH", "New Yamuna Bridge North Approach", 25.4270, 81.8540, 86.5, "bridge_approach"),
        ("N_NAINI_DECK", "New Yamuna Bridge Deck (Mid-Yamuna)", 25.4170, 81.8600, 91.0, "bridge_deck"),
        ("N_NAINI_SOUTH", "Naini South Approach / Industrial Gate", 25.4050, 81.8670, 86.0, "bridge_approach"),

        # Railway & Transit Hubs
        ("N_STATION_1", "Prayagraj Junction (Civil Lines side)", 25.4450, 81.8310, 93.0, "transit"),
        ("N_STATION_2", "Prayagraj Junction (City side)", 25.4420, 81.8290, 92.0, "transit"),
        ("N_KHULDABAD", "Khuldabad GT Road Crossing", 25.4360, 81.8220, 90.0, "urban"),
    ]

    for n_id, name, lat, lon, elev, zone in nodes_data:
        G.add_node(n_id, name=name, y=lat, x=lon, elevation_m=elev, zone_type=zone)

    # Define realistic road links
    # (u, v, name, highway, maxweight, maxheight, width, is_bridge, deck_elev)
    edges_def = [
        # Central Ridge Arterials
        ("N_CIVIL_1", "N_CIVIL_2", "Mahatma Gandhi Marg North", "primary", 30.0, 4.5, 14.0, False, None),
        ("N_CIVIL_1", "N_CIVIL_3", "High Court Link Road", "primary", 30.0, 4.5, 12.0, False, None),
        ("N_CIVIL_1", "N_CIVIL_4", "Civil Lines Bus Corridor", "primary", 35.0, 4.5, 14.0, False, None),
        ("N_CIVIL_3", "N_CANT_1", "Cantonment Avenue Road", "secondary", 25.0, 4.2, 10.0, False, None),
        ("N_CANT_1", "N_CANT_2", "Military Hospital South Line", "tertiary", 20.0, 4.0, 8.0, False, None),
        ("N_CIVIL_1", "N_STATION_1", "Station Approach Road", "primary", 30.0, 4.5, 12.0, False, None),
        ("N_STATION_1", "N_STATION_2", "Junction Overbridge Line", "primary", 25.0, 4.2, 10.0, False, None),
        ("N_STATION_2", "N_KHULDABAD", "GT Road City Sector", "primary", 40.0, 4.5, 14.0, False, None),
        ("N_KHULDABAD", "N_KARELI_1", "Khuldabad-Kareli Link Road", "secondary", 25.0, 4.0, 9.0, False, None),
        ("N_CIVIL_4", "N_DUFFERIN", "Kutchery to Dufferin Road", "secondary", 20.0, 4.0, 9.0, False, None),
        ("N_DUFFERIN", "N_MLN_MAIN", "Medical Enclave Avenue", "primary", 30.0, 4.5, 12.0, False, None),
        ("N_MLN_MAIN", "N_SRN_MAIN", "Emergency Trauma Corridor", "primary", 35.0, 4.8, 14.0, False, None),

        # Academic & Town Center
        ("N_CIVIL_2", "N_UNIV_1", "University Road North", "primary", 25.0, 4.2, 12.0, False, None),
        ("N_UNIV_1", "N_TBS_BELI", "Beli Hospital Bypass", "secondary", 25.0, 4.2, 10.0, False, None),
        ("N_UNIV_1", "N_ALLEN_1", "Allenganj Main Road", "secondary", 20.0, 4.0, 9.0, False, None),
        ("N_CIVIL_4", "N_GEO_1", "Tagore Town - Georgetown Marg", "primary", 25.0, 4.2, 12.0, False, None),
        ("N_GEO_1", "N_COLONEL_1", "Colonelganj Arterial", "secondary", 25.0, 4.0, 10.0, False, None),
        ("N_GEO_1", "N_SRN_MAIN", "Georgetown to SRN Road", "secondary", 25.0, 4.0, 10.0, False, None),

        # Connection to Lowlands: Daraganj, Sangam, Chhota Baghada
        ("N_GEO_1", "N_DARA_1", "Daraganj Access Highway", "primary", 30.0, 4.2, 12.0, False, None),
        ("N_DARA_1", "N_DARA_GHAT", "Daraganj Riverbank Ghat Road", "residential", 12.0, 3.5, 6.0, False, None),
        ("N_DARA_1", "N_SANGAM_1", "Sangam Bund Road (High Embankment)", "primary", 25.0, 4.0, 10.0, False, None),
        ("N_SANGAM_1", "N_SANGAM_GHAT", "Triveni Sangam Pilgrimage Access", "unclassified", 10.0, 3.2, 6.5, False, None),
        ("N_DARA_1", "N_SHASTRI_WEST", "Shastri Bridge West Incline", "primary", 40.0, 4.8, 14.0, False, None),
        ("N_COLONEL_1", "N_BAGAMBARI", "Bagambari Gaddi Lowland Street", "residential", 12.0, 3.5, 6.0, False, None),
        ("N_COLONEL_1", "N_BAGHADA_1", "Chhota Baghada Floodway Lane", "residential", 10.0, 3.2, 5.5, False, None),
        ("N_BAGHADA_1", "N_BAGAMBARI", "Riverbank Marginal Bandh Road", "residential", 10.0, 3.2, 5.0, False, None),
        ("N_TBS_BELI", "N_BELI_KACHHAR", "Beli Lowland Kachhar Lane", "residential", 10.0, 3.2, 5.0, False, None),

        # Shastri Bridge Corridor (Major Bridge across Ganga)
        ("N_SHASTRI_WEST", "N_SHASTRI_DECK", "Shastri Bridge Ganga Span West", "trunk", 45.0, 5.0, 16.0, True, 92.5),
        ("N_SHASTRI_DECK", "N_SHASTRI_EAST", "Shastri Bridge Ganga Span East", "trunk", 45.0, 5.0, 16.0, True, 92.5),

        # Phaphamau / Curzon Bridge Corridor across Ganga
        ("N_ALLEN_1", "N_CURZON_SOUTH", "Teliyarganj Phaphamau Corridor", "primary", 35.0, 4.5, 12.0, False, None),
        ("N_CURZON_SOUTH", "N_CURZON_DECK", "Phaphamau Bridge River Span", "primary", 35.0, 4.5, 12.0, True, 91.5),
        ("N_CURZON_DECK", "N_CURZON_NORTH", "Phaphamau North Ramp", "primary", 35.0, 4.5, 12.0, False, None),

        # Yamuna Crossing & Naini Bridges
        ("N_SRN_MAIN", "N_NAINI_NORTH", "SRN to Yamuna Bridge Express Road", "primary", 35.0, 4.5, 14.0, False, None),
        ("N_NAINI_NORTH", "N_NAINI_DECK", "New Yamuna Cable-Stayed Bridge", "trunk", 45.0, 5.0, 16.0, True, 91.0),
        ("N_NAINI_DECK", "N_NAINI_SOUTH", "Naini Ramp to Industrial Area", "trunk", 45.0, 5.0, 16.0, False, None),

        # South Lowlands: Saraswati Ghat & Kareli
        ("N_DUFFERIN", "N_SARASWATI_GHAT", "Kydganj to Saraswati Ghat", "secondary", 18.0, 3.8, 8.0, False, None),
        ("N_SARASWATI_GHAT", "N_FORT_1", "Yamuna Embankment Road", "secondary", 20.0, 4.0, 8.5, False, None),
        ("N_FORT_1", "N_SANGAM_1", "Fort East Sangam Link", "secondary", 20.0, 4.0, 9.0, False, None),
        ("N_KARELI_1", "N_KARELI_LOW", "Kareli Lowland Sector 4", "residential", 12.0, 3.4, 6.0, False, None),
        ("N_KARELI_1", "N_SARASWATI_GHAT", "Kareli-Kydganj Riverside Road", "secondary", 20.0, 3.8, 8.0, False, None),
    ]

    rivers = get_prayagraj_river_centerlines()
    base_river_level = 74.0

    speed_map = {
        "trunk": 65.0,
        "motorway": 75.0,
        "primary": 50.0,
        "secondary": 40.0,
        "tertiary": 30.0,
        "residential": 22.0,
        "unclassified": 20.0
    }

    # Add edges bidirectionally
    edge_idx = 0
    for u, v, name, hw, max_wt, max_ht, width, is_br, deck_elev in edges_def:
        u_lat = G.nodes[u]["y"]
        u_lon = G.nodes[u]["x"]
        u_elev = G.nodes[u]["elevation_m"]

        v_lat = G.nodes[v]["y"]
        v_lon = G.nodes[v]["x"]
        v_elev = G.nodes[v]["elevation_m"]

        length_m = round(haversine_distance_m(u_lat, u_lon, v_lat, v_lon), 1)
        mean_elev = round((u_elev + v_elev) / 2.0, 2)
        slope_pct = round(abs(u_elev - v_elev) / max(10.0, length_m) * 100.0, 2)

        mid_lat = (u_lat + v_lat) / 2.0
        mid_lon = (u_lon + v_lon) / 2.0
        dist_to_river_m = round(compute_dist_to_rivers_m(mid_lat, mid_lon, rivers), 1)

        # Height Above Nearest Drainage proxy
        hand_m = round(max(0.1, mean_elev - base_river_level), 2)
        # Wetness index proxy
        wetness_idx = round(math.log(100.0 / (max(0.1, slope_pct) + 0.05)), 2)

        speed_kph = speed_map.get(hw, 30.0)
        travel_time_sec = round(length_m / (speed_kph * 1000.0 / 3600.0), 1)

        edge_attrs = {
            "edge_id": f"E_{edge_idx}",
            "name": name,
            "highway": hw,
            "length": length_m,
            "speed_kph": speed_kph,
            "travel_time_sec": travel_time_sec,
            "elevation_m": mean_elev,
            "slope": slope_pct,
            "dist_to_river_m": dist_to_river_m,
            "hand_m": hand_m,
            "wetness_index": wetness_idx,
            "is_bridge": is_br,
            "bridge_deck_elevation_m": deck_elev if is_br else None,
            "maxweight": max_wt,
            "maxheight": max_ht,
            "width": width,
            "geometry": [[u_lon, u_lat], [v_lon, v_lat]],
        }

        # Add both forward and reverse
        G.add_edge(u, v, key=0, **edge_attrs)
        rev_attrs = dict(edge_attrs)
        rev_attrs["edge_id"] = f"E_{edge_idx}_rev"
        rev_attrs["geometry"] = [[v_lon, v_lat], [u_lon, u_lat]]
        G.add_edge(v, u, key=0, **rev_attrs)
        edge_idx += 1

    return G

def build_or_load_graph(region_id: str = "prayagraj", force_refresh: bool = False) -> nx.MultiDiGraph:
    """
    Loads road network from local JSON cache if present, otherwise generates
    or fetches the network and caches it.
    """
    cache_file = DATA_DIR / f"{region_id}_road_graph.json"

    if cache_file.exists() and not force_refresh:
        logger.info(f"Loading cached graph for region '{region_id}' from {cache_file}")
        try:
            with open(cache_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            G = nx.MultiDiGraph()
            G.graph.update(data.get("graph", {}))
            for n_id, attrs in data.get("nodes", {}).items():
                G.add_node(n_id, **attrs)
            for edge in data.get("edges", []):
                u = edge["u"]
                v = edge["v"]
                key = edge.get("key", 0)
                attrs = edge["attrs"]
                G.add_edge(u, v, key=key, **attrs)
            logger.info(f"Successfully loaded graph with {len(G.nodes)} nodes, {len(G.edges)} edges.")
            return G
        except Exception as e:
            logger.warning(f"Error reading cache file: {e}. Rebuilding graph.")

    logger.info(f"Building road network graph for region '{region_id}'...")
    if region_id == "prayagraj":
        G = generate_synthetic_prayagraj_network()
    else:
        # Fallback or generic synthesis for other regional presets
        reg = region_manager.get_region(region_id)
        center = reg.get("center", {"lat": 25.4358, "lon": 81.8463})
        G = generate_synthetic_prayagraj_network()
        # Shift coordinate center for region
        lat_shift = center["lat"] - 25.4358
        lon_shift = center["lon"] - 81.8463
        for n, attrs in G.nodes(data=True):
            attrs["y"] += lat_shift
            attrs["x"] += lon_shift
        for u, v, k, attrs in G.edges(keys=True, data=True):
            attrs["geometry"] = [
                [coords[0] + lon_shift, coords[1] + lat_shift]
                for coords in attrs["geometry"]
            ]

    # Save to JSON cache
    save_graph_to_cache(G, cache_file)
    return G

def save_graph_to_cache(G: nx.MultiDiGraph, cache_file: Path) -> None:
    serializable = {
        "graph": dict(G.graph),
        "nodes": {n: dict(attrs) for n, attrs in G.nodes(data=True)},
        "edges": [
            {"u": u, "v": v, "key": k, "attrs": dict(attrs)}
            for u, v, k, attrs in G.edges(keys=True, data=True)
        ]
    }
    with open(cache_file, "w", encoding="utf-8") as f:
        json.dump(serializable, f, indent=2)
    logger.info(f"Saved graph cache to {cache_file} ({len(G.nodes)} nodes, {len(G.edges)} edges).")

def graph_to_geojson_features(G: nx.MultiDiGraph) -> List[Dict[str, Any]]:
    features = []
    for u, v, k, attrs in G.edges(keys=True, data=True):
        geom = attrs.get("geometry")
        if not geom:
            u_node = G.nodes[u]
            v_node = G.nodes[v]
            geom = [[u_node["x"], u_node["y"]], [v_node["x"], v_node["y"]]]
        props = {k_: v_ for k_, v_ in attrs.items() if k_ != "geometry"}
        props["u"] = u
        props["v"] = v
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "LineString",
                "coordinates": geom
            },
            "properties": props
        })
    return features

def graph_nodes_to_geojson_features(G: nx.MultiDiGraph) -> List[Dict[str, Any]]:
    features = []
    for n_id, attrs in G.nodes(data=True):
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [attrs["x"], attrs["y"]]
            },
            "properties": {
                "id": n_id,
                **attrs
            }
        })
    return features
