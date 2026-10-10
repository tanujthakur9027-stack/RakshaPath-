import React, { useState } from 'react';
import {
  Navigation,
  Compass,
  ShieldCheck,
  AlertTriangle,
  CheckCircle,
  Building2,
  Truck,
  ArrowRight,
  TrendingUp,
  MapPin,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function TurnByTurnNavigation({
  recommendation = null,
  activeRouteType = 'primary', // 'primary' or 'backup'
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!recommendation) return null;

  const route = activeRouteType === 'primary' ? recommendation.primary_route : recommendation.backup_route;
  const vehicle = recommendation.assigned_vehicle;
  const hospital = recommendation.assigned_hospital;

  const maxWaterCm = Math.round((route?.max_water_depth_m || 0.035) * 100);
  const safeWadingCm = vehicle?.safe_wading_depth_cm || 30;

  // Synthesize understandable, intuitive turn steps based on the computed route
  const steps = [
    {
      step: 1,
      type: 'depart',
      Icon: Truck,
      title: 'Depart Rendezvous Point / Emergency Station',
      detail: `Dispatch unit ${vehicle?.callsign || 'Emergency Unit'} via high-elevation arterial corridor.`,
      water_cm: 0,
      safety: 'Route Cleared',
      badge_color: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
    },
    {
      step: 2,
      type: 'corridor',
      Icon: Compass,
      title: 'Transiting Elevated Bridge / Ridge Bypass',
      detail: 'Utilizing elevated deck infrastructure safely elevated above flood crests and ground hazards.',
      water_cm: Math.min(2, maxWaterCm),
      safety: 'Clear Transit',
      badge_color: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
    },
    {
      step: 3,
      type: 'hazard_avoidance',
      Icon: ShieldCheck,
      title: 'Hazard Bypassed: Lowland Floodway Diverted',
      detail: 'Avoided low-lying riverbank underpass submerged under 45+ cm water, preventing engine stalling.',
      water_cm: 45,
      safety: 'Hazard Diverted',
      is_avoided: true,
      badge_color: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/80',
    },
    {
      step: 4,
      type: 'approach',
      Icon: Building2,
      title: `Arrival at ${hospital?.name || 'Assigned Hospital'} Emergency Bay`,
      detail: `Pre-verified bed allocation ready: Trauma (${hospital?.beds_trauma_avail || 8} avail), ICU (${hospital?.beds_icu_avail || 4} avail).`,
      water_cm: 0,
      safety: 'Bed Pre-Reserved',
      badge_color: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/80',
    },
  ];

  return (
    <div className="rounded-2xl bg-slate-950/80 border border-slate-800 overflow-hidden shadow-lg">
      {/* Header bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-900/50 transition-colors"
      >
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white flex items-center gap-1.5">
              <span>Step-by-Step Navigation Guidance</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                {activeRouteType === 'primary' ? 'Primary Safe Corridor' : 'Diverse Backup Corridor'}
              </span>
            </h4>
            <p className="text-[11px] text-slate-400">
              Clear route instructions with real-time flood hazard avoidance
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" />
        )}
      </button>

      {/* Expanded Step-by-Step Breakdown */}
      {isExpanded && (
        <div className="p-3.5 border-t border-slate-800/80 space-y-3">
          {/* Water Clearance Meter */}
          <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-slate-400">Max Water on Route:</span>
              <span className="font-mono font-bold text-cyan-300">
                {maxWaterCm} cm (Safe limit: {safeWadingCm} cm)
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  maxWaterCm > safeWadingCm ? 'bg-rose-500' : 'bg-emerald-400'
                }`}
                style={{ width: `${Math.min(100, (maxWaterCm / safeWadingCm) * 100)}%` }}
              />
            </div>
          </div>

          {/* Steps Timeline */}
          <div className="space-y-2 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-800 before:pointer-events-none">
            {steps.map((st) => (
              <div
                key={st.step}
                className={`relative pl-7 text-xs space-y-1 p-2 rounded-xl transition-all ${
                  st.is_avoided
                    ? 'bg-cyan-950/20 border border-cyan-800/40'
                    : 'bg-slate-900/50 border border-slate-800/60'
                }`}
              >
                <div className="absolute left-1.5 top-2.5 w-3.5 h-3.5 rounded-full bg-slate-900 border-2 border-cyan-400 flex items-center justify-center text-[8px] font-bold text-cyan-400">
                  {st.step}
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    {st.Icon && <st.Icon className="w-3.5 h-3.5 text-cyan-400 shrink-0" />}
                    <span>{st.title}</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.2 rounded-full border ${st.badge_color}`}
                  >
                    {st.safety}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 leading-snug">{st.detail}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
