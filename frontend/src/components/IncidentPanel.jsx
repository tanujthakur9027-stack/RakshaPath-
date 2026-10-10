import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Plus,
  Compass,
  Building2,
  Truck,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  PhoneCall,
} from 'lucide-react';
import TurnByTurnNavigation from './TurnByTurnNavigation';
import CivilianSafetyCard from './CivilianSafetyCard';

export default function IncidentPanel({
  incidents = [],
  selectedIncident = null,
  recommendation = null,
  fleet = [],
  hospitals = [],
  nodes = [],
  isCivilianMode = true,
  disasterType = 'flood',
  onOpenSOS = () => {},
  onSelectIncident,
  onCreateIncident,
  onOverrideDispatch,
}) {
  const [filter, setFilter] = useState('ALL');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [overrideUnit, setOverrideUnit] = useState('');
  const [overrideHospital, setOverrideHospital] = useState('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  // New incident form state
  const [newIncident, setNewIncident] = useState({
    type: 'MEDICAL_EMERGENCY',
    severity: 'P1',
    description: 'Elderly patient with respiratory distress trapped in flooded ground floor',
    node_id: 'n_beli',
    required_vehicle_type: 'rescue_truck',
    patients_count: 1,
  });

  const safeIncidents = Array.isArray(incidents) ? incidents : [];
  const filteredIncidents = safeIncidents.filter((inc) => {
    const status = (inc.status || '').toUpperCase();
    if (filter === 'PENDING') return status === 'PENDING';
    if (filter === 'DISPATCHED') return status === 'DISPATCHED';
    if (filter === 'RESOLVED') return status === 'RESOLVED';
    return true;
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    onCreateIncident(newIncident);
    setIsNewModalOpen(false);
  };

  const handleOverrideSubmit = async () => {
    if (!selectedIncident || !overrideUnit || !overrideHospital) return;
    setIsSubmittingOverride(true);
    try {
      await onOverrideDispatch(selectedIncident.id, overrideUnit, overrideHospital);
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border-l border-slate-800 text-slate-100 overflow-hidden">
      {/* Header & Tabs */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <h2 className="text-base font-bold text-white tracking-wide">Incident Queue</h2>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-slate-800 text-slate-300">
              {incidents.length}
            </span>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md shadow-cyan-950 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Incident</span>
          </button>
        </div>

        {/* Status Filters */}
        <div className="flex space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80 text-xs">
          {['ALL', 'PENDING', 'DISPATCHED', 'RESOLVED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex-1 py-1 text-center rounded-lg font-medium transition-all ${
                filter === tab
                  ? 'bg-slate-800 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Split between Incident Cards and Active Recommendation */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
        {/* Incident List */}
        <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
          {filteredIncidents.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-500">
              No incidents matching current filter
            </div>
          ) : (
            filteredIncidents.map((inc) => {
              const isSelected = selectedIncident && selectedIncident.id === inc.id;
              const isP1 = inc.severity === 'P1' || inc.severity === 4 || inc.severity === 5;
              const isP2 = inc.severity === 'P2' || inc.severity === 3;
              const sevLabel = typeof inc.severity === 'number' ? 'P' + inc.severity : (inc.severity || 'P3');
              const incType = (inc.incident_type || inc.type || 'Emergency').replace('_', ' ');
              const incStatus = (inc.status || 'PENDING').toUpperCase();

              return (
                <div
                  key={inc.id}
                  onClick={() => onSelectIncident(inc)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-800/90 border-cyan-500/80 shadow-md shadow-cyan-950/40 ring-1 ring-cyan-500/50'
                      : 'bg-slate-950/50 border-slate-800/80 hover:bg-slate-850 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          isP1
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : isP2
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-blue-950 text-blue-400 border border-blue-800'
                        }`}
                      >
                        {sevLabel}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {inc.id}
                      </span>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {incType}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        incStatus === 'DISPATCHED'
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                          : incStatus === 'RESOLVED'
                          ? 'bg-slate-800 text-slate-400'
                          : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                      }`}
                    >
                      {incStatus}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-1 mb-2">
                    {inc.description}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <span>{inc.timestamp ? inc.timestamp.split('T')[1]?.slice(0, 5) : '00:00'}</span>
                    </div>
                    <span className="text-cyan-400 flex items-center">
                      Select for Routing <ChevronRight className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Incident Recommendation View */}
        {selectedIncident && (
          <div className="p-4 space-y-4">
            {isCivilianMode ? (
              <>
                <CivilianSafetyCard
                  recommendation={recommendation}
                  activeRouteType="primary"
                  disasterType={disasterType}
                  onOpenSOS={onOpenSOS}
                  selectedIncident={selectedIncident}
                />
                <TurnByTurnNavigation
                  recommendation={recommendation}
                  activeRouteType="primary"
                />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      Raksh Path AI Recommendation
                    </h3>
                  </div>
                  <span className="text-xs font-mono text-slate-400">
                    {selectedIncident.id}
                  </span>
                </div>

                {/* Recommendation Loading or Content */}
                {!recommendation ? (
                  <div className="p-6 text-center text-xs text-slate-400 animate-pulse">
                    Calculating multi-criteria Hungarian assignment and diverse routes...
                  </div>
                ) : (
                  <div className="space-y-4">
                {/* AI Plain Language Rationale */}
                {recommendation.explanation && (
                  <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/60 text-xs text-cyan-200 leading-relaxed flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-cyan-300 block mb-0.5">
                        Autonomous Dispatch Justification:
                      </span>
                      {recommendation.explanation}
                    </div>
                  </div>
                )}

                {/* Match Summary: Assigned Unit & Hospital */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Vehicle */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                      <Truck className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Assigned Vehicle</span>
                    </div>
                    <div className="font-bold text-xs text-white truncate">
                      {recommendation.assigned_vehicle
                        ? recommendation.assigned_vehicle.callsign
                        : 'Searching Unit'}
                    </div>
                    <div className="text-[10px] text-cyan-300 font-mono mt-0.5 uppercase">
                      {(recommendation.assigned_vehicle?.vehicle_type || 'RESCUE UNIT').replace('_', ' ')}
                    </div>
                  </div>

                  {/* Hospital */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                    <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-1">
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Destination Hospital</span>
                    </div>
                    <div className="font-bold text-xs text-white truncate">
                      {recommendation.assigned_hospital
                        ? recommendation.assigned_hospital.name
                        : 'Auto-Routing'}
                    </div>
                    <div className="text-[10px] text-emerald-300 font-mono mt-0.5">
                      Beds: {recommendation.assigned_hospital?.beds_trauma_avail} Trauma, {recommendation.assigned_hospital?.beds_icu_avail} ICU
                    </div>
                  </div>
                </div>

                {/* Route Cards: Primary vs Backup */}
                <div className="space-y-2">
                  {/* Primary Route */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-cyan-800/80 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                        <span className="text-xs font-bold text-white">Primary Route</span>
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                          Recommended
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyan-300">
                        {recommendation.primary_route?.travel_time_min?.toFixed(1) || '--'} min ETA
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Distance</span>
                        <span className="font-bold text-white">
                          {recommendation.primary_route?.total_length_km?.toFixed(1) || '0.0'} km
                        </span>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Reliability</span>
                        <span className="font-bold text-emerald-400">
                          {Math.round((recommendation.primary_route?.reliability_score || 0) * 100)}%
                        </span>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Max Water</span>
                        <span className="font-bold text-cyan-300">
                          {Math.round((recommendation.primary_route?.max_water_depth_m || 0) * 100)} cm
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Backup Route */}
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-800/80 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                        <span className="text-xs font-bold text-white">Backup Route</span>
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-700">
                          Diverse Corridors
                        </span>
                      </div>
                      <span className="text-xs font-mono font-bold text-amber-300">
                        {recommendation.backup_route?.travel_time_min?.toFixed(1) || '--'} min ETA
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                      <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Distance</span>
                        <span className="font-bold text-white">
                          {recommendation.backup_route?.total_length_km?.toFixed(1) || '0.0'} km
                        </span>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Reliability</span>
                        <span className="font-bold text-amber-400">
                          {Math.round((recommendation.backup_route?.reliability_score || 0) * 100)}%
                        </span>
                      </div>
                      <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">Diversity</span>
                        <span className="font-bold text-cyan-400">
                          {Math.round((recommendation.backup_route?.diversity_ratio || 0) * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Understandable Navigation */}
                <TurnByTurnNavigation
                  recommendation={recommendation}
                  activeRouteType="primary"
                />

                {/* Dispatcher Manual Override Section */}
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300">
                      Dispatcher Override Controls
                    </span>
                    <span className="text-[10px] text-slate-500">Human-in-the-loop</span>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Override Vehicle:
                      </label>
                      <select
                        value={overrideUnit}
                        onChange={(e) => setOverrideUnit(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-2 rounded-lg focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">-- Keep AI Assignment --</option>
                        {(Array.isArray(fleet) ? fleet : []).map((u) => {
                          const callsign = u.callsign || u.display_name || 'Unit';
                          const vType = String(u.vehicle_type || u.class_id || 'ambulance').replace('_', ' ');
                          const vStatus = u.status || 'AVAILABLE';
                          const val = u.unit_id || u.id;
                          return (
                            <option key={val} value={val}>
                              {callsign} ({vType}) - {vStatus}
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">
                        Override Hospital:
                      </label>
                      <select
                        value={overrideHospital}
                        onChange={(e) => setOverrideHospital(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 text-xs text-white p-2 rounded-lg focus:outline-none focus:border-cyan-500"
                      >
                        <option value="">-- Keep AI Facility --</option>
                        {(Array.isArray(hospitals) ? hospitals : []).map((h) => (
                          <option key={h.id} value={h.id}>
                            {h.name} (Trauma: {h.beds_trauma_avail ?? h.trauma_beds_available ?? 0}, ICU: {h.beds_icu_avail ?? h.icu_beds_available ?? 0})
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={handleOverrideSubmit}
                      disabled={isSubmittingOverride || (!overrideUnit && !overrideHospital)}
                      className="w-full py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-cyan-300 font-bold text-xs rounded-lg transition-all"
                    >
                      {isSubmittingOverride ? 'Updating Dispatch...' : 'Confirm Manual Override'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            </>
          )}
          </div>
        )}
      </div>

      {/* New Incident Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-5 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-cyan-400" />
                <h3 className="font-bold text-base text-white">Create Emergency Incident</h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Incident Type</label>
                <select
                  value={newIncident.type}
                  onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white"
                >
                  <option value="MEDICAL_EMERGENCY">Medical Emergency (Cardiac / Trauma)</option>
                  <option value="WATER_RESCUE">Water Rescue (Submerged Road / House)</option>
                  <option value="FIRE_EVACUATION">Fire / Flood Hazard Evacuation</option>
                  <option value="COLLAPSED_STRUCTURE">Structure Inundation & Rescue</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Severity</label>
                  <select
                    value={newIncident.severity}
                    onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white"
                  >
                    <option value="P1">P1 - Critical (Threat to Life)</option>
                    <option value="P2">P2 - Urgent (Rising Water)</option>
                    <option value="P3">P3 - Standard Transfer</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Vehicle Class</label>
                  <select
                    value={newIncident.required_vehicle_type}
                    onChange={(e) =>
                      setNewIncident({ ...newIncident, required_vehicle_type: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white"
                  >
                    <option value="ambulance">Standard Ambulance</option>
                    <option value="rescue_truck">High-Clearance Rescue Truck</option>
                    <option value="boat_truck">Inflatable Boat Carrier</option>
                    <option value="fire_tender">Heavy Fire Tender</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Location Landmark</label>
                <select
                  value={newIncident.node_id}
                  onChange={(e) => setNewIncident({ ...newIncident, node_id: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white"
                >
                  <option value="n_daraganj">Daraganj Ghat (Lowland Flood Zone)</option>
                  <option value="n_sangam">Sangam Lowland Shore</option>
                  <option value="n_chhota_baghada">Chhota Baghada (Ganga Inundation)</option>
                  <option value="n_beli">Beli Hospital Road (Lowland Corridor)</option>
                  <option value="n_kareli">Kareli Drainage Lowland</option>
                  <option value="n_civil_lines">Civil Lines Central</option>
                  <option value="n_katra">Katra University Area</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Caller Description</label>
                <textarea
                  rows="2"
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white"
                  placeholder="Describe flood depth and patient condition..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold"
                >
                  Create & Auto-Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
