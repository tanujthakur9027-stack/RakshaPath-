import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import { Layers, Compass, Maximize2, ShieldAlert, CheckCircle2, AlertTriangle, XCircle, Info, MapPin } from 'lucide-react';

if (maplibregl.setWorkerUrl) {
  maplibregl.setWorkerUrl(maplibreWorkerUrl);
}

export default function MapView({
  regionCenter = [80.9462, 26.8467],
  routeData = null,
  hospitals = [],
  fleet = [],
  incidents = [],
  selectedIncident = null,
  onSelectIncident,
  originCoords = null,
  destCoords = null,
  originName = 'Origin',
  destName = 'Destination'
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({ hospitals: [], fleet: [], incidents: [], endpoints: [] });
  const [activePopupInfo, setActivePopupInfo] = useState(null);

  // 1. Initialize MapLibre
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-tiles-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
            paint: {
              'raster-brightness-max': 0.8,
              'raster-contrast': 0.12,
              'raster-saturation': -0.35,
            },
          },
        ],
      },
      center: regionCenter,
      zoom: 12.5,
      pitch: 15,
    });

    map.current.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'bottom-right');

    map.current.on('load', () => {
      // 1. Naive Direct Route (Red Dashed)
      map.current.addSource('naive-route', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.current.addLayer({
        id: 'naive-route-line',
        type: 'line',
        source: 'naive-route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-width': 4.5,
          'line-color': '#ef4444',
          'line-dasharray': [3, 2],
          'line-opacity': 0.85,
        },
      });

      // 2. Safe Corridor Glow (Emerald)
      map.current.addSource('safe-corridor', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
      });
      map.current.addLayer({
        id: 'safe-corridor-glow',
        type: 'line',
        source: 'safe-corridor',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-width': 12,
          'line-color': '#10b981',
          'line-opacity': 0.35,
        },
      });
      map.current.addLayer({
        id: 'safe-corridor-line',
        type: 'line',
        source: 'safe-corridor',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-width': 6,
          'line-color': '#10b981',
          'line-opacity': 0.95,
        },
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // 2. Pan/FlyTo when regionCenter changes
  useEffect(() => {
    if (!map.current) return;
    map.current.flyTo({
      center: regionCenter,
      zoom: 12.5,
      essential: true,
      duration: 1200
    });
  }, [regionCenter]);

  // 3. Update Routes (Safe Corridor & Naive Path)
  useEffect(() => {
    if (!map.current) return;
    const safeSrc = map.current.getSource('safe-corridor');
    const naiveSrc = map.current.getSource('naive-route');

    if (safeSrc && routeData?.safe_corridor?.coordinates) {
      safeSrc.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: routeData.safe_corridor.coordinates,
            },
          },
        ],
      });
    } else if (safeSrc) {
      safeSrc.setData({ type: 'FeatureCollection', features: [] });
    }

    if (naiveSrc && routeData?.shortest_naive?.coordinates) {
      naiveSrc.setData({
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: routeData.shortest_naive.coordinates,
            },
          },
        ],
      });
    } else if (naiveSrc) {
      naiveSrc.setData({ type: 'FeatureCollection', features: [] });
    }

    // Auto-fit bounds if corridor coordinates exist
    if (routeData?.safe_corridor?.coordinates?.length > 1) {
      try {
        const bounds = new maplibregl.LngLatBounds();
        routeData.safe_corridor.coordinates.forEach((coord) => bounds.extend(coord));
        if (routeData?.shortest_naive?.coordinates) {
          routeData.shortest_naive.coordinates.forEach((coord) => bounds.extend(coord));
        }
        map.current.fitBounds(bounds, { padding: 90, maxZoom: 15, duration: 1000 });
      } catch (e) {
        console.error('FitBounds error:', e);
      }
    }
  }, [routeData]);

  // 4. Update Markers: Hospitals, Fleet, Incidents, Endpoints
  useEffect(() => {
    if (!map.current) return;

    // Clear existing markers
    markersRef.current.hospitals.forEach((m) => m.remove());
    markersRef.current.fleet.forEach((m) => m.remove());
    markersRef.current.incidents.forEach((m) => m.remove());
    markersRef.current.endpoints.forEach((m) => m.remove());
    markersRef.current = { hospitals: [], fleet: [], incidents: [], endpoints: [] };

    // 1. Hospital / Shelter Markers
    (Array.isArray(hospitals) ? hospitals : []).forEach((h) => {
      const el = document.createElement('div');
      el.className =
        'flex items-center justify-center w-8 h-8 rounded-full bg-slate-900 border-2 border-emerald-400 text-emerald-400 font-bold shadow-lg shadow-emerald-950/60 cursor-pointer transform hover:scale-110 transition-transform';
      el.innerHTML = `<span style="font-size: 15px;">🏥</span>`;

      const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
        <div style="background:#0f172a; color:#f8fafc; padding:10px 14px; border-radius:10px; border:1px solid #1e293b; font-family:sans-serif; min-width:200px;">
          <div style="font-weight:700; font-size:13px; color:#34d399; margin-bottom:4px;">${h.name}</div>
          <div style="font-size:11px; color:#94a3b8; margin-bottom:6px;">Emergency Relief & Medical Hub</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:11px;">
            <div style="background:#1e293b; padding:4px 6px; border-radius:4px;">Trauma Beds: <b style="color:#38bdf8;">${h.beds_trauma_avail ?? 12}</b></div>
            <div style="background:#1e293b; padding:4px 6px; border-radius:4px;">ICU Beds: <b style="color:#a78bfa;">${h.beds_icu_avail ?? 15}</b></div>
            <div style="background:#1e293b; padding:4px 6px; border-radius:4px; grid-column:span 2;">General Beds: <b style="color:#4ade80;">${h.beds_general_avail ?? 60}</b></div>
          </div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([h.lon, h.lat])
        .setPopup(popup)
        .addTo(map.current);

      markersRef.current.hospitals.push(marker);
    });

    // 2. Fleet Unit Markers
    (Array.isArray(fleet) ? fleet : []).forEach((v) => {
      const el = document.createElement('div');
      const isAvailable = v.status === 'AVAILABLE';
      const icon = v.unit_type === 'flood_boat' ? '🚤' : v.unit_type === 'ndrf_truck' ? '🚜' : v.unit_type === 'rapid_response' ? '🚙' : '🚑';

      el.className =
        'flex items-center justify-center w-7 h-7 rounded-lg bg-slate-900 border-2 border-cyan-400 shadow-md cursor-pointer transform hover:scale-110 transition-transform';
      el.innerHTML = `<span style="font-size: 13px;">${icon}</span>`;

      const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(`
        <div style="background:#0f172a; color:#f8fafc; padding:8px 12px; border-radius:8px; border:1px solid #1e293b; font-size:12px;">
          <div style="font-weight:700; color:#38bdf8;">${v.name || v.id}</div>
          <div style="font-size:10px; color:#94a3b8; text-transform:uppercase;">${v.unit_type}</div>
          <div style="margin-top:4px; font-size:11px;">Status: <b style="color:${isAvailable ? '#34d399' : '#fbbf24'};">${v.status || 'AVAILABLE'}</b></div>
          <div style="font-size:11px; color:#cbd5e1;">Clearance: <b>${v.clearance_cm || 45}cm</b> | Contact: <b>${v.contact}</b></div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([v.lon, v.lat])
        .setPopup(popup)
        .addTo(map.current);

      markersRef.current.fleet.push(marker);
    });

    // 3. Incident Markers
    (Array.isArray(incidents) ? incidents : []).forEach((inc) => {
      const isSelected = selectedIncident && selectedIncident.id === inc.id;
      const el = document.createElement('div');
      const isCritical = inc.severity === 'Critical' || inc.severity === 'P1';

      el.className = `relative flex items-center justify-center w-7 h-7 rounded-full text-white font-bold cursor-pointer transition-transform ${
        isSelected ? 'scale-125 ring-4 ring-cyan-400' : 'hover:scale-110'
      }`;
      el.style.backgroundColor = isCritical ? '#ef4444' : '#f59e0b';
      el.innerHTML = `
        <span style="font-size: 12px;">⚠️</span>
        ${isCritical ? '<div class="absolute inset-0 rounded-full animate-ping opacity-75" style="background-color:#ef4444;"></div>' : ''}
      `;

      const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(`
        <div style="background:#0f172a; color:#f8fafc; padding:8px 12px; border-radius:8px; border:1px solid #1e293b; font-size:12px; min-width:180px;">
          <div style="font-weight:700; color:#ef4444;">${inc.title || 'Disaster Incident'}</div>
          <div style="font-size:10px; color:#94a3b8; text-transform:uppercase;">${inc.incident_type || 'Flood'} • Severity: ${inc.severity}</div>
          <div style="margin-top:4px; font-size:11px;">Water: <b>${inc.water_depth_cm || 0} cm</b> | Damage: <b>${inc.damage_level || 0}/10</b></div>
          <div style="font-size:11px; color:#cbd5e1; margin-top:2px;">${inc.description || ''}</div>
        </div>
      `);

      el.onclick = () => {
        if (onSelectIncident) onSelectIncident(inc);
      };

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([inc.lon, inc.lat])
        .setPopup(popup)
        .addTo(map.current);

      markersRef.current.incidents.push(marker);
    });

    // 4. Origin & Destination Markers
    if (originCoords) {
      const elOrigin = document.createElement('div');
      elOrigin.className = 'flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500 border-2 border-white text-white font-bold shadow-xl animate-bounce';
      elOrigin.innerHTML = '🟢';
      const originMarker = new maplibregl.Marker({ element: elOrigin })
        .setLngLat(originCoords)
        .addTo(map.current);
      markersRef.current.endpoints.push(originMarker);
    }

    if (destCoords) {
      const elDest = document.createElement('div');
      elDest.className = 'flex items-center justify-center w-8 h-8 rounded-full bg-rose-600 border-2 border-white text-white font-bold shadow-xl';
      elDest.innerHTML = '🏁';
      const destMarker = new maplibregl.Marker({ element: elDest })
        .setLngLat(destCoords)
        .addTo(map.current);
      markersRef.current.endpoints.push(destMarker);
    }
  }, [hospitals, fleet, incidents, selectedIncident, originCoords, destCoords]);

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* Map Element */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-xl text-white text-xs select-none">
        <div className="font-bold text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
          Map Legend
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-4 h-1 bg-emerald-500 rounded-full inline-block shadow-sm"></span>
            <span className="text-[11px] font-medium text-slate-200">AI Safe Corridor (Risk-Weighted A*)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-0.5 border-t-2 border-dashed border-rose-500 inline-block"></span>
            <span className="text-[11px] font-medium text-slate-400">Naive Shortest Path (Hazard Risk)</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-800 text-[10px] text-slate-400">
            <span>⚠️ Active Hazard</span>
            <span>🏥 Verified Shelter</span>
            <span>🚑 Rescue Fleet</span>
          </div>
        </div>
      </div>
    </div>
  );
}
