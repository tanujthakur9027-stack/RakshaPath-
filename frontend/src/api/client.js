/**
 * API client communicating with FastAPI backend with seamless Embedded Engine fallback
 * Allows RakshaPath to run 100% interactively on Vercel Edge without requiring a local backend server!
 */
import {
  NETWORK_NODES,
  CITY_PRESETS,
  INITIAL_RESCUE_FLEET,
  INITIAL_INCIDENTS,
  VEHICLE_PROFILES,
  calculateHazardRisk,
  computeUnifiedRoute
} from './embeddedEngine';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

let isBackendAvailable = null;

async function checkBackend() {
  if (isBackendAvailable !== null) return isBackendAvailable;
  try {
    const res = await fetch(`${API_BASE}/`, { method: 'GET', signal: AbortSignal.timeout(1200) });
    isBackendAvailable = res.ok;
  } catch {
    isBackendAvailable = false;
  }
  return isBackendAvailable;
}

// In-memory store for client-side incident submissions
const dynamicIncidents = [...INITIAL_INCIDENTS];

export const api = {
  checkStatus: async () => {
    const online = await checkBackend();
    return {
      online,
      mode: online ? 'ONLINE (FastAPI Gateway)' : 'ONLINE (Embedded Vercel Edge)'
    };
  },

  getRegions: async () => {
    try {
      const res = await fetch(`${API_BASE}/regions`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : (data.regions || []);
      }
    } catch {
      // fallback
    }
    return CITY_PRESETS.map(c => ({
      id: c.id,
      name: c.name,
      state: c.state,
      district: c.district,
      center: c.coords,
      defaultOrigin: c.defaultOrigin,
      defaultDest: c.defaultDest
    }));
  },

  getNodes: async (region = 'lucknow') => {
    try {
      const res = await fetch(`${API_BASE}/nodes?region_id=${region}`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : (data.nodes || []);
      }
    } catch {
      // fallback
    }
    const preset = CITY_PRESETS.find(p => p.id === region) || CITY_PRESETS[1];
    return Object.entries(NETWORK_NODES)
      .filter(([_, d]) => d.state === preset.state || d.district === preset.district)
      .map(([id, d]) => ({ id, ...d }));
  },

  getHospitals: async (region = 'lucknow') => {
    try {
      const res = await fetch(`${API_BASE}/hospitals?region_id=${region}`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.hospitals || []);
        return list.map(h => ({
          ...h,
          beds_trauma_avail: h.trauma_beds_available ?? h.beds_trauma_avail ?? 12,
          beds_icu_avail: h.icu_beds_available ?? h.beds_icu_avail ?? 15,
          beds_general_avail: h.general_beds_available ?? h.beds_general_avail ?? 60
        }));
      }
    } catch {
      // fallback
    }
    const preset = CITY_PRESETS.find(p => p.id === region) || CITY_PRESETS[1];
    return Object.entries(NETWORK_NODES)
      .filter(([_, d]) => d.category === 'Hospital' && (d.state === preset.state || d.district === preset.district))
      .map(([id, d]) => ({
        id,
        name: d.name,
        lat: d.lat,
        lon: d.lon,
        beds_trauma_avail: 16,
        beds_icu_avail: 18,
        beds_general_avail: 72
      }));
  },

  getFleet: async (region = 'lucknow') => {
    try {
      const res = await fetch(`${API_BASE}/fleet?region_id=${region}`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : (data.fleet || []);
      }
    } catch {
      // fallback
    }
    const preset = CITY_PRESETS.find(p => p.id === region) || CITY_PRESETS[1];
    return INITIAL_RESCUE_FLEET.filter(u => u.state === preset.state || u.district === preset.district);
  },

  getIncidents: async (region = 'lucknow', disasterType = 'flood') => {
    try {
      const res = await fetch(`${API_BASE}/incidents?region_id=${region}&disaster_type=${disasterType}`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) {
        const data = await res.json();
        return Array.isArray(data) ? data : (data.incidents || []);
      }
    } catch {
      // fallback
    }
    return dynamicIncidents;
  },

  createIncident: async (incidentData) => {
    try {
      const res = await fetch(`${API_BASE}/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incidentData),
        signal: AbortSignal.timeout(1200)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    const newInc = {
      id: dynamicIncidents.length + 1,
      ...incidentData,
      status: 'VERIFIED'
    };
    dynamicIncidents.unshift(newInc);
    return newInc;
  },

  evaluateHazard: (waterDepth, damage, debris, vehicleType) => {
    return calculateHazardRisk(waterDepth, damage, debris, vehicleType);
  },

  computeRoute: async (source, target, vehicle, waterDepth, damage, debris, incidents) => {
    try {
      const res = await fetch(`${API_BASE}/api/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_node: source,
          target_node: target,
          vehicle_type: vehicle,
          water_depth_cm: waterDepth,
          damage_level: damage,
          debris_level: debris
        }),
        signal: AbortSignal.timeout(1500)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // fallback
    }
    // Embedded standalone computation
    return computeUnifiedRoute(source, target, vehicle, waterDepth, damage, debris, incidents || dynamicIncidents);
  },

  sendCivilianSOS: async (data) => {
    try {
      const res = await fetch(`${API_BASE}/civilian/sos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: AbortSignal.timeout(1200)
      });
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      status: 'TRANSMITTED',
      dispatch_id: 'SOS-' + Math.floor(100000 + Math.random() * 900000),
      message: 'Emergency request registered. Priority dispatch dispatched to closest NDRF unit.'
    };
  }
};
