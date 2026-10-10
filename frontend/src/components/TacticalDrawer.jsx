import React, { useState } from 'react';
import {
  Navigation,
  BarChart3,
  Truck,
  Send,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function TacticalDrawer({
  routeData,
  fleet = [],
  onReportIncident,
  selectedState = 'Uttar Pradesh',
  selectedDistrict = 'Lucknow'
}) {
  const [activeTab, setActiveTab] = useState('corridor'); // 'corridor' | 'comparison' | 'fleet' | 'incident'
  const [isExpanded, setIsExpanded] = useState(true);

  // Form State for Ground Incident Transmission
  const [incidentTitle, setIncidentTitle] = useState('Submerged Road & Embankment Breach');
  const [incidentType, setIncidentType] = useState('flood');
  const [severity, setSeverity] = useState('High');
  const [waterDepth, setWaterDepth] = useState(65.0);
  const [damageLevel, setDamageLevel] = useState(4.0);
  const [debrisLevel, setDebrisLevel] = useState(3.0);
  const [description, setDescription] = useState('Arterial road inundated with rapid flood runoff.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onReportIncident({
        title: incidentTitle,
        state: selectedState,
        district: selectedDistrict,
        incident_type: incidentType,
        severity,
        lat: 26.8520, // default center
        lon: 80.9750,
        water_depth_cm: waterDepth,
        damage_level: damageLevel,
        debris_level: debrisLevel,
        description
      });
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const safeCorridor = routeData?.safe_corridor;
  const shortestNaive = routeData?.shortest_naive;
  const comparison = routeData?.comparison;

  return (
    <div className="bg-slate-900 border-t border-slate-800 flex flex-col text-slate-200 transition-all select-none">
      {/* Header bar with drawer toggle & tab strip */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('corridor'); setIsExpanded(true); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'corridor'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Turn-by-Turn Safe Corridor
          </button>

          <button
            onClick={() => { setActiveTab('comparison'); setIsExpanded(true); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'comparison'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            Comparative Safety Analytics
          </button>

          <button
            onClick={() => { setActiveTab('fleet'); setIsExpanded(true); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'fleet'
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            Regional Fleet & ETAs ({fleet.length})
          </button>

          <button
            onClick={() => { setActiveTab('incident'); setIsExpanded(true); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              activeTab === 'incident'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-rose-400" />
            Ground Incident Transmission
          </button>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
          title={isExpanded ? 'Collapse Tactical Drawer' : 'Expand Tactical Drawer'}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Tab Content */}
      {isExpanded && (
        <div className="p-4 max-h-64 overflow-y-auto">
          {/* TAB 1: Turn-by-Turn Safe Corridor */}
          {activeTab === 'corridor' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
                <span>Safe Corridor Waypoints ({safeCorridor?.segments?.length || 0} segments)</span>
                <span className="font-mono text-cyan-400">Total: {safeCorridor?.total_distance_km || 0} km • {safeCorridor?.estimated_transit_time_min || 0} mins</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {safeCorridor?.segments?.map((seg, idx) => (
                  <div key={idx} className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-2.5 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-slate-100">
                      <span className="truncate">Leg {idx + 1}: {seg.road_name}</span>
                      <span className="text-cyan-400 shrink-0 font-mono">{seg.distance_km} km</span>
                    </div>
                    <div className="grid grid-cols-2 text-[11px] text-slate-400 gap-1 pt-1 border-t border-slate-700/40">
                      <div>Grade: <span className="text-emerald-400 font-semibold">{seg.grade || 'SAFE'}</span></div>
                      <div>Risk: <span className="text-slate-200 font-mono">x{seg.risk_multiplier}</span></div>
                      <div>Water: <span className="text-slate-200 font-mono">{seg.water_depth_cm} cm</span></div>
                      <div>Transit: <span className="text-cyan-400 font-mono">{seg.transit_time_min} min</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Comparative Safety Analytics */}
          {activeTab === 'comparison' && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Algorithmic Comparison: Risk-Weighted A* Corridor vs. Naive Direct Path
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Safe Corridor */}
                <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> RakshaPath Safe Corridor (Risk-Weighted A*)
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded">
                      RECOMMENDED
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between py-0.5 border-b border-emerald-900/40">
                      <span className="text-slate-400">Total Corridor Distance:</span>
                      <span className="font-mono font-bold text-white">{safeCorridor?.total_distance_km} km</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-emerald-900/40">
                      <span className="text-slate-400">Average Composite Risk:</span>
                      <span className="font-mono font-bold text-emerald-400">x{safeCorridor?.average_risk_multiplier}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-emerald-900/40">
                      <span className="text-slate-400">Estimated Transit Time:</span>
                      <span className="font-mono font-bold text-white">{safeCorridor?.estimated_transit_time_min} mins</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Corridor Passability:</span>
                      <span className="font-bold text-emerald-400">100% Fully Passable</span>
                    </div>
                  </div>
                </div>

                {/* Naive Path */}
                <div className="bg-rose-950/30 border border-rose-500/40 rounded-xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                      <XCircle className="w-4 h-4" /> Naive Direct Route (Unweighted Shortest Path)
                    </span>
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded">
                      DANGEROUS
                    </span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between py-0.5 border-b border-rose-900/40">
                      <span className="text-slate-400">Total Distance:</span>
                      <span className="font-mono font-bold text-white">{shortestNaive?.total_distance_km} km</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-rose-900/40">
                      <span className="text-slate-400">Average Composite Risk:</span>
                      <span className="font-mono font-bold text-rose-400">x{shortestNaive?.average_risk_multiplier}</span>
                    </div>
                    <div className="flex justify-between py-0.5 border-b border-rose-900/40">
                      <span className="text-slate-400">Estimated Transit Time:</span>
                      <span className="font-mono font-bold text-rose-300">{shortestNaive?.estimated_transit_time_min} mins (stalled)</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-400">Corridor Passability:</span>
                      <span className="font-bold text-rose-400">
                        {shortestNaive?.is_fully_passable ? 'Passable with High Risk' : 'Impassable (Risk of Submersion)'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Regional Fleet & ETAs */}
          {activeTab === 'fleet' && (
            <div className="space-y-2">
              <div className="text-xs text-slate-400">
                Staged Emergency Mobility Units in {selectedDistrict}, {selectedState}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {fleet.map((unit) => (
                  <div key={unit.id} className="bg-slate-800/60 border border-slate-700/60 rounded-lg p-3 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white truncate">{unit.name}</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-semibold px-1.5 py-0.5 rounded">
                        {unit.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Type: <strong className="text-slate-200">{unit.unit_type}</strong> • Clearance: <strong className="text-cyan-400">{unit.clearance_cm || 45}cm</strong>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-700/40 flex justify-between">
                      <span>Callsign: {unit.id}</span>
                      <span className="text-cyan-400">{unit.contact}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: Ground Incident Transmission */}
          {activeTab === 'incident' && (
            <form onSubmit={handleSubmit} className="space-y-3 max-w-3xl">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Field Disaster Incident Reporting (Direct Database Transmission)</span>
                {submitSuccess && (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Incident registered & map updated!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Incident Title</label>
                  <input
                    type="text"
                    value={incidentTitle}
                    onChange={(e) => setIncidentTitle(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Hazard Category</label>
                  <select
                    value={incidentType}
                    onChange={(e) => setIncidentType(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="flood">Flood Inundation</option>
                    <option value="earthquake">Earthquake Rubble</option>
                    <option value="cyclone">Cyclone / Fallen Grid</option>
                    <option value="landslide">Landslide / Mudflow</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Severity Priority</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Low">Low - Monitored</option>
                    <option value="Medium">Medium - Elevated</option>
                    <option value="High">High - Impassable for Light Vehicles</option>
                    <option value="Critical">Critical - Complete Washout</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Water Depth: {waterDepth} cm</label>
                  <input
                    type="range"
                    min="0"
                    max="150"
                    step="5"
                    value={waterDepth}
                    onChange={(e) => setWaterDepth(Number(e.target.value))}
                    className="w-full accent-cyan-400 bg-slate-700 h-1.5 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Damage: {damageLevel} / 10</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={damageLevel}
                    onChange={(e) => setDamageLevel(Number(e.target.value))}
                    className="w-full accent-amber-400 bg-slate-700 h-1.5 rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Debris: {debrisLevel} / 10</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={debrisLevel}
                    onChange={(e) => setDebrisLevel(Number(e.target.value))}
                    className="w-full accent-rose-400 bg-slate-700 h-1.5 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Situation Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="2"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-lg shadow transition"
              >
                {isSubmitting ? 'Transmitting to National Database...' : 'Transmit Report to National Registry'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
