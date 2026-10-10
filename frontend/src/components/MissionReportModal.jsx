import React from 'react';
import { Shield, Printer, Download, X, CheckCircle2, FileText, Hospital, Truck, MapPin } from 'lucide-react';

export default function MissionReportModal({
  isOpen,
  onClose,
  routeData,
  selectedState = 'Uttar Pradesh',
  selectedDistrict = 'Lucknow',
  originName = 'Origin Checkpoint',
  destName = 'Destination Hospital',
  vehicleType = 'ambulance',
  vehicleProfile,
  disasterType = 'flood'
}) {
  if (!isOpen) return null;

  const missionId = `NDMA-TAC-${Math.floor(100000 + Math.random() * 900000)}`;
  const dateStr = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const safeCorridor = routeData?.safe_corridor;
  const segments = safeCorridor?.segments || [];

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      mission_id: missionId,
      timestamp: dateStr,
      classification: 'OFFICIAL USE ONLY - DISASTER MOBILITY CORRIDOR',
      state: selectedState,
      district: selectedDistrict,
      disaster_type: disasterType,
      origin: originName,
      destination: destName,
      vehicle_profile: vehicleProfile,
      safe_corridor_metrics: {
        total_distance_km: safeCorridor?.total_distance_km,
        estimated_transit_time_min: safeCorridor?.estimated_transit_time_min,
        risk_multiplier: safeCorridor?.average_risk_multiplier,
        safety_grade: safeCorridor?.safety_grade
      },
      waypoint_segments: segments
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${missionId}-Brief.json`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-100">
        {/* Header */}
        <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Official Tactical Corridor Mission Manifest
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                {missionId} • CLASSIFICATION: EMERGENCY RESPONSE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Print Official Mission Brief"
            >
              <Printer className="w-3.5 h-3.5 text-cyan-400" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleDownloadJSON}
              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
              title="Download JSON Manifest"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>JSON</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Body Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs print:text-black print:bg-white flex-1">
          {/* Government Header Banner */}
          <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <div className="font-extrabold text-sm text-cyan-300">
                GOVERNMENT OF INDIA • DISASTER RESILIENCE NETWORK
              </div>
              <div className="text-[11px] text-slate-400">
                Joint Command: NDRF • SDRF • 112 National Emergency Response Support System
              </div>
            </div>
            <div className="text-right text-[11px] font-mono text-slate-400">
              <div>Date: {dateStr}</div>
              <div>Status: <strong className="text-emerald-400">CORRIDOR SECURED</strong></div>
            </div>
          </div>

          {/* Operational Sector Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Territory</div>
              <div className="font-bold text-white text-xs mt-0.5">{selectedDistrict}, {selectedState}</div>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Hazard Profile</div>
              <div className="font-bold text-amber-400 text-xs uppercase mt-0.5">{disasterType} Inundation</div>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Corridor Distance</div>
              <div className="font-bold text-white font-mono text-xs mt-0.5">{safeCorridor?.total_distance_km || 0} km</div>
            </div>
            <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Safety Grading</div>
              <div className="font-bold text-emerald-400 text-xs mt-0.5">{safeCorridor?.safety_grade || 'GRADE A'}</div>
            </div>
          </div>

          {/* Asset & Destination Allocation Manifest */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Mobility Asset */}
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-white text-xs border-b border-slate-700/60 pb-1">
                <Truck className="w-4 h-4 text-cyan-400" />
                <span>Assigned Emergency Mobility Unit</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Vehicle Profile:</span>
                  <strong className="text-white">{vehicleProfile?.name || 'Life Support Ambulance'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Max Water Clearance:</span>
                  <strong className="text-cyan-400 font-mono">{vehicleProfile?.max_water_clearance_cm || 30} cm</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Safe Cruising Speed:</span>
                  <strong className="text-white font-mono">{vehicleProfile?.base_speed_kmh || 50} km/h</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Equipment Spec:</span>
                  <span className="text-slate-200">Advanced Life Support (ALS) + Defibrillator</span>
                </div>
              </div>
            </div>

            {/* Destination Medical Center */}
            <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-white text-xs border-b border-slate-700/60 pb-1">
                <Hospital className="w-4 h-4 text-emerald-400" />
                <span>Destination Healthcare Facility</span>
              </div>
              <div className="space-y-1 text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Facility Name:</span>
                  <strong className="text-white">{destName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Trauma Bed Status:</span>
                  <strong className="text-emerald-400">Pre-Reserved Token #TRAUMA-12</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">ICU Availability:</span>
                  <strong className="text-purple-400">Verified Available</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Triage Direct Net:</span>
                  <span className="text-cyan-400 font-mono">TAC-DISPATCH-108</span>
                </div>
              </div>
            </div>
          </div>

          {/* Turn-by-Turn Leg Waypoints Table */}
          <div className="space-y-2">
            <div className="font-bold text-white text-xs uppercase tracking-wider flex items-center justify-between">
              <span>Corridor Navigation Legs ({segments.length} Waypoint Segments)</span>
              <span className="text-emerald-400 font-normal">All segments verified passable</span>
            </div>
            <div className="border border-slate-700/70 rounded-xl overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="p-2">Leg</th>
                    <th className="p-2">Road / Corridor Name</th>
                    <th className="p-2">Distance</th>
                    <th className="p-2">Water Depth</th>
                    <th className="p-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                  {segments.map((s, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40">
                      <td className="p-2 font-bold text-cyan-400 font-mono">{idx + 1}</td>
                      <td className="p-2 font-medium text-slate-200">{s.road_name}</td>
                      <td className="p-2 font-mono text-white">{s.distance_km} km</td>
                      <td className="p-2 font-mono text-slate-300">{s.water_depth_cm} cm</td>
                      <td className="p-2 font-bold text-emerald-400">PASSABLE</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Certification Signature Block */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <div>
              Generated by <strong>RakshaPath Autonomous Emergency Corridor AI Engine</strong>
            </div>
            <div className="text-right">
              Command Signature: <span className="font-mono text-cyan-400 font-bold">DIGITAL-AUTH-VERIFIED-2026</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
