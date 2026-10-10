"""
Tests for Stage 1: Road Graph and Spatial Attributes
"""
import pytest
import networkx as nx
from raksh_path.core.road_graph import build_or_load_graph, graph_to_geojson_features, graph_nodes_to_geojson_features

def test_build_or_load_graph():
    G = build_or_load_graph("prayagraj", force_refresh=True)
    assert isinstance(G, nx.MultiDiGraph)
    assert len(G.nodes) >= 20
    assert len(G.edges) >= 40

    # Verify attributes on nodes
    for n, attrs in G.nodes(data=True):
        assert "elevation_m" in attrs
        assert "x" in attrs
        assert "y" in attrs
        assert 70.0 <= attrs["elevation_m"] <= 100.0

    # Verify attributes on edges
    bridge_found = False
    for u, v, k, attrs in G.edges(keys=True, data=True):
        assert "length" in attrs and attrs["length"] > 0
        assert "slope" in attrs
        assert "dist_to_river_m" in attrs
        assert "hand_m" in attrs
        assert "speed_kph" in attrs
        assert "travel_time_sec" in attrs
        if attrs.get("is_bridge"):
            bridge_found = True
            assert attrs.get("bridge_deck_elevation_m") is not None
            assert attrs["bridge_deck_elevation_m"] > 90.0

    assert bridge_found, "Must contain modeled bridges (e.g. Shastri Bridge, Naini Bridge)"

def test_geojson_export():
    G = build_or_load_graph("prayagraj")
    features = graph_to_geojson_features(G)
    assert len(features) == len(G.edges)
    assert features[0]["type"] == "Feature"
    assert features[0]["geometry"]["type"] == "LineString"

    node_features = graph_nodes_to_geojson_features(G)
    assert len(node_features) == len(G.nodes)
    assert node_features[0]["geometry"]["type"] == "Point"
