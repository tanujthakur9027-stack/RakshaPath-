import React, { useState } from 'react';
import {
  ShieldCheck,
  Clock,
  Navigation,
  AlertTriangle,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
  Sliders
} from 'lucide-react';

export default function RouteMetricsHUD({ routeData, vehicleProfile }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!routeData || !routeData.safe_corridor) return null;

  const { safe_corridor, shortest_naive, comparison } = routeData;
  const isOptimal =
    safe_corridor.safety_grade?.includes('GRADE A') ||
    safe_corridor.average_risk_multiplier <= 1.3;
  const displayGrade =
    safe_corridor.average_risk_multiplier <= 1.3
      ? 'GRADE A - OPTIMAL'
      : safe_corridor.safety_grade || 'GRADE B - CAUTION';

  return (
    <div className="absolute top-4 left-4 right-4 z-20 pointer-events-none flex flex-col items-center select-none">
      {/* 1. Collapsed Slider Handle (Visible when HUD is hidden) */}
      {!isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          className="pointer-events-auto flex items-center gap-2.5 px-4 py-2 bg-slate-900/95 hover:bg-slate-800 text-white border border-cyan-500/50 rounded-full shadow-2xl backdrop-blur-md transition-all transform hover:scale-105 active:scale-95 text-xs font-bold animate-in fade-in slide-in-from-top-3 duration-200 group"
          title="Click to view route metrics HUD again"
        >
          <Sliders className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-90 transition-transform" />
          <span>View Route Metrics</span>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60 font-semibold">
            {safe_corridor.total_distance_km} km • {safe_corridor.estimated_transit_time_min} mins • x{safe_corridor.average_risk_multiplier}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
        </button>
      )}

      {/* 2. Full Floating HUD Card (Visible when expanded) */}
      {isVisible && (
        <div className="w-full max-w-5xl bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3.5 shadow-2xl pointer-events-auto text-white transition-all transform animate-in fade-in slide-in-from-top-4 duration-300 relative group">
          {/* Top-Right Dismiss Button */}
          <button
            onClick={() => setIsVisible(false)}
            className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition"
            title="Slide up / Remove metrics banner to view full map"
          >
            <ChevronUp className="w-4 h-4 text-slate-300" />
          </button>

          {/* 4 Core Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pr-6 sm:pr-0">
            {/* 1. Safe Distance */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
                <Navigation className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Safe Corridor
                </div>
                <div className="text-lg font-bold text-slate-100 flex items-baseline gap-1.5">
                  {safe_corridor.total_distance_km}{' '}
                  <span className="text-xs text-slate-400 font-normal">km</span>
                </div>
                {comparison?.distance_diff_km > 0 && (
                  <div className="text-[10px] text-emerald-400 font-medium truncate">
                    +{comparison.distance_diff_km} km safety detour
                  </div>
                )}
              </div>
            </div>

            {/* 2. Transit Time */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Est. Transit Time
                </div>
                <div className="text-lg font-bold text-slate-100 flex items-baseline gap-1.5">
                  {safe_corridor.estimated_transit_time_min}{' '}
                  <span className="text-xs text-slate-400 font-normal">mins</span>
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate">
                  @ {vehicleProfile?.base_speed_kmh || 50} km/h safe limit
                </div>
              </div>
            </div>

            {/* 3. Risk Multiplier */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 flex items-center gap-3">
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  safe_corridor.average_risk_multiplier <= 1.5
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Risk Multiplier
                </div>
                <div className="text-lg font-bold text-slate-100 flex items-baseline gap-1.5">
                  x{safe_corridor.average_risk_multiplier}
                  <span
                    className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${
                      safe_corridor.average_risk_multiplier <= 1.3
                        ? 'bg-emerald-950 text-emerald-400'
                        : 'bg-amber-950 text-amber-400'
                    }`}
                  >
                    {safe_corridor.average_risk_multiplier <= 1.3 ? 'Low Risk' : 'Caution'}
                  </span>
                </div>
                {shortest_naive && (
                  <div className="text-[10px] text-rose-400 font-medium truncate">
                    vs x{shortest_naive.average_risk_multiplier} naive direct
                  </div>
                )}
              </div>
            </div>

            {/* 4. Safety Grade */}
            <div className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-2.5 flex items-center gap-3">
              <div
                className={`p-2 rounded-lg shrink-0 ${
                  isOptimal
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Safety Grade
                </div>
                <div
                  className={`text-sm font-bold truncate ${
                    isOptimal ? 'text-emerald-400' : 'text-amber-400'
                  }`}
                >
                  {displayGrade}
                </div>
                <div className="text-[10px] text-slate-400 font-medium truncate">
                  {safe_corridor.is_fully_passable ? '100% Fully Passable' : 'Caution Advised'}
                </div>
              </div>
            </div>
          </div>

          {/* Sub-bar with Hazard Avoidance & Slide-to-hide button */}
          <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="truncate">
                <strong className="text-white">AI Safe Corridor Active:</strong> Bypassed{' '}
                {comparison?.hazards_avoided_count || 1} submerged road segments & structural
                chokepoints.
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {comparison?.risk_reduction_pct && (
                <span className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {comparison.risk_reduction_pct}% Net Risk Reduction
                </span>
              )}

              {/* Slider / Collapse Action Button */}
              <button
                onClick={() => setIsVisible(false)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-semibold transition"
                title="Slide up to view full map"
              >
                <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>Slide Up (Hide)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
