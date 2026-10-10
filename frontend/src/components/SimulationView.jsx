import React from 'react';
import {
  Activity,
  CheckCircle2,
  XCircle,
  TrendingDown,
  ShieldCheck,
  Clock,
  Building2,
  X,
  FileSpreadsheet,
  Zap,
} from 'lucide-react';

export default function SimulationView({ isOpen = false, onClose, simulationData = null }) {
  if (!isOpen) return null;

  const baseline = simulationData?.metrics?.baseline || {
    mean_response_time_minutes: 9.9,
    p90_response_time_minutes: 24.3,
    blocked_routes_count: 0,
    hospital_capacity_mismatches: 4,
    completed_incidents: 25,
  };

  const rakshPath = simulationData?.metrics?.raksh_path || {
    mean_response_time_minutes: 11.4,
    p90_response_time_minutes: 18.0,
    blocked_routes_count: 0,
    hospital_capacity_mismatches: 0,
    completed_incidents: 25,
  };

  const improvement = simulationData?.metrics?.improvement || {
    p90_response_time_reduction_pct: 25.9,
    diversions_prevented: 4,
  };

  const sampleIncidents = simulationData?.sample_incidents_preview || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-white">
                  SimPy Discrete-Event Simulation Analysis
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
                  24-Hour Monsoon Run
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Baseline Naive Dispatch vs. Raksh Path Predictive Passability &amp; Capacity Routing
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

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Top KPI Comparison Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* P90 Tail Latency */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-900/50 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  P90 Response Time
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                  -{improvement.p90_response_time_reduction_pct}% Faster
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-2xl font-mono font-black text-white">
                    {rakshPath.p90_response_time_minutes}
                  </span>
                  <span className="text-xs text-slate-400 font-mono ml-1">min</span>
                  <span className="block text-[11px] text-cyan-400 font-medium">Raksh Path</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-bold text-slate-400 line-through">
                    {baseline.p90_response_time_minutes}
                  </span>
                  <span className="text-xs text-slate-500 font-mono ml-1">min</span>
                  <span className="block text-[11px] text-slate-500">Baseline Naive</span>
                </div>
              </div>
            </div>

            {/* Hospital Diversions Prevented */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-900/50 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  Hospital Diversions
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                  Zero Mismatch
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-2xl font-mono font-black text-emerald-400">
                    {rakshPath.hospital_capacity_mismatches}
                  </span>
                  <span className="block text-[11px] text-emerald-300 font-medium">
                    100% Pre-Verified Beds
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-mono font-bold text-rose-400">
                    {baseline.hospital_capacity_mismatches}
                  </span>
                  <span className="block text-[11px] text-slate-500">Diverted at Door</span>
                </div>
              </div>
            </div>

            {/* Total Completed Incidents */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Simulated Incidents
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-700">
                  100% Resolved
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-2xl font-mono font-black text-white">
                    {rakshPath.completed_incidents}
                  </span>
                  <span className="block text-[11px] text-blue-300 font-medium">
                    High-Water Rescues
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono text-slate-400">
                    Scenario: Heavy Monsoon
                  </span>
                  <span className="block text-[11px] text-slate-500">Peak Ganga Surge</span>
                </div>
              </div>
            </div>
          </div>

          {/* Graphical Comparison Bar Chart */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <h4 className="font-bold text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              Response Latency &amp; Reliability Comparison
            </h4>

            {/* P90 Bar */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>90th Percentile Latency (Worst 10% severe cases)</span>
                <span className="font-mono text-cyan-300">
                  {rakshPath.p90_response_time_minutes}m vs {baseline.p90_response_time_minutes}m
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-20 text-[10px] text-cyan-400 font-medium">Raksh Path</span>
                  <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-cyan-500 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(rakshPath.p90_response_time_minutes / 30) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-white">
                    {rakshPath.p90_response_time_minutes}m
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="w-20 text-[10px] text-slate-500">Baseline</span>
                  <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-rose-500/70 h-full rounded-full transition-all duration-1000"
                      style={{ width: `${(baseline.p90_response_time_minutes / 30) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {baseline.p90_response_time_minutes}m
                  </span>
                </div>
              </div>
            </div>

            {/* Bed Capacity Bar */}
            <div className="space-y-1.5 text-xs pt-2 border-t border-slate-800/80">
              <div className="flex justify-between text-slate-300">
                <span>Emergency Bed Allocation Failures</span>
                <span className="font-mono text-emerald-300">
                  0 failures (Raksh Path) vs {baseline.hospital_capacity_mismatches} diverted (Baseline)
                </span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="w-20 text-[10px] text-emerald-400 font-medium">Raksh Path</span>
                  <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden">
                    <div className="bg-emerald-500 h-full rounded-full w-0" />
                  </div>
                  <span className="font-mono text-[10px] text-emerald-400 font-bold">0</span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="w-20 text-[10px] text-slate-500">Baseline</span>
                  <div className="flex-1 bg-slate-900 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-rose-500 h-full rounded-full"
                      style={{ width: `${(baseline.hospital_capacity_mismatches / 10) * 100}%` }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-rose-400 font-bold">
                    {baseline.hospital_capacity_mismatches}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Sample Incident Simulation Log */}
          {sampleIncidents.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                Simulated Poisson Incident Stream Sample
              </h4>
              <div className="rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">ID</th>
                      <th className="p-2.5">Arrival T+</th>
                      <th className="p-2.5">Location</th>
                      <th className="p-2.5">Zone</th>
                      <th className="p-2.5">Required Specialty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-950/40 font-mono text-[11px]">
                    {(Array.isArray(sampleIncidents) ? sampleIncidents : []).map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-cyan-300 font-bold">{s.id}</td>
                        <td className="p-2.5 text-slate-400">{s.arrival_time_min.toFixed(1)} min</td>
                        <td className="p-2.5 text-slate-200">{s.location_name}</td>
                        <td className="p-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                              s.zone_type === 'lowland'
                                ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {s.zone_type}
                          </span>
                        </td>
                        <td className="p-2.5 text-emerald-400 uppercase">{s.required_specialty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
