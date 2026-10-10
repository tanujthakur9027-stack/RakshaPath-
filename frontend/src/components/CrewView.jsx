import React, { useState } from 'react';
import {
  Truck,
  AlertTriangle,
  Radio,
  Navigation,
  Compass,
  CheckCircle,
  X,
  PhoneForwarded,
  ShieldAlert,
  Send,
} from 'lucide-react';

export default function CrewView({
  isOpen = false,
  onClose,
  selectedIncident,
  recommendation,
  onReportRoadBlock,
}) {
  const [isReportingBlock, setIsReportingBlock] = useState(false);
  const [selectedSegmentKey, setSelectedSegmentKey] = useState('n_civil_lines|n_daraganj');
  const [blockReason, setBlockReason] = useState('Water submerged > 50cm, impassable for ambulance');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  if (!isOpen) return null;

  const vehicleCallsign = recommendation?.assigned_vehicle?.callsign || 'UP-70-AMB-01';
  const vehicleType = recommendation?.assigned_vehicle?.vehicle_type || 'ambulance';

  const handleBlockReport = async (e) => {
    e.preventDefault();
    const [u, v] = selectedSegmentKey.split('|');
    setIsSubmitting(true);
    try {
      await onReportRoadBlock(u, v, blockReason, vehicleCallsign);
      setReportSuccess(true);
      setTimeout(() => {
        setReportSuccess(false);
        setIsReportingBlock(false);
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Mobile In-Cab Navigation Bar */}
        <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-base text-white">
                  {vehicleCallsign}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">
                {(vehicleType || 'AMBULANCE').replace('_', ' ')} • Tactical Crew Terminal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Console Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* Mission Status Header */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Assigned Dispatch:</span>
              <span className="font-mono font-bold text-cyan-400">
                {selectedIncident ? selectedIncident.id : 'PATROL IDLE'}
              </span>
            </div>

            {selectedIncident && (
              <>
                <div className="flex items-start space-x-2 text-xs">
                  <Navigation className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white block">
                      Target Destination: {recommendation?.assigned_hospital?.name || 'Assigned Hospital'}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Incident: {selectedIncident.description}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase">Primary ETA</span>
                    <span className="text-lg font-mono font-black text-cyan-400">
                      {recommendation?.primary_route?.travel_time_min?.toFixed(1) || '--'} min
                    </span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                    <span className="text-[10px] text-slate-400 block uppercase">Passability</span>
                    <span className="text-lg font-mono font-black text-emerald-400">
                      {Math.round((recommendation?.primary_route?.reliability_score || 0.95) * 100)}%
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Turn Guidance Simulation */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                Active Tactical Corridor
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">GPS LOCKED</span>
            </div>
            <div className="p-3 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-slate-200">
              {recommendation?.primary_route ? (
                <span>
                  Current Path: Curzon Elevated Bridge Corridor. Safe road elevation (91.5m MSL) above Ganga flood crest.
                </span>
              ) : (
                <span className="text-slate-400">Select an incident to initialize active navigation waypoint sequence.</span>
              )}
            </div>
          </div>

          {/* Large High-Priority Action: 1-Tap Road Blocked Button */}
          {!isReportingBlock ? (
            <button
              onClick={() => setIsReportingBlock(true)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-base shadow-lg shadow-rose-950/80 flex items-center justify-center space-x-3 transition-transform active:scale-95"
            >
              <AlertTriangle className="w-6 h-6 text-white" />
              <span>REPORT ROAD BLOCKED</span>
            </button>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-800/80 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  Field Roadblock Report
                </span>
                <button
                  onClick={() => setIsReportingBlock(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              {reportSuccess ? (
                <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Blockage Transmitted! Dispatch Auto-Rerouted Fleet.
                </div>
              ) : (
                <form onSubmit={handleBlockReport} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 block mb-1">Impacted Road Segment:</label>
                    <select
                      value={selectedSegmentKey}
                      onChange={(e) => setSelectedSegmentKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-white"
                    >
                      <option value="n_civil_lines|n_daraganj">Civil Lines ➔ Daraganj Lowland Road</option>
                      <option value="n_daraganj|n_sangam">Daraganj ➔ Sangam Lowland Approach</option>
                      <option value="n_civil_lines|n_chhota_baghada">Civil Lines ➔ Chhota Baghada Inundation</option>
                      <option value="n_civil_lines|n_beli">Civil Lines ➔ Beli Hospital Lowland Road</option>
                      <option value="n_civil_lines|n_kareli">Civil Lines ➔ Kareli Corridor</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 block mb-1">Reason / Hazard Description:</label>
                    <select
                      value={blockReason}
                      onChange={(e) => setBlockReason(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 p-2 rounded-xl text-white mb-2"
                    >
                      <option value="Water submerged > 50cm, impassable for ambulance">
                        Water submerged &gt; 50cm, impassable for ambulance
                      </option>
                      <option value="Downed high-voltage power line & submerged debris">
                        Downed high-voltage power line &amp; submerged debris
                      </option>
                      <option value="Civilian vehicle stalled underwater blocking entire roadway">
                        Civilian vehicle stalled underwater blocking roadway
                      </option>
                      <option value="Bridge approach inundated with rapid water velocity">
                        Bridge approach inundated with rapid water velocity
                      </option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white text-xs flex items-center justify-center gap-2 shadow-md shadow-rose-950 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Transmitting to Command...' : 'Transmit Immediate Roadblock'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
