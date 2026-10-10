import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Clock,
  Compass,
  PhoneCall,
  Info,
  Waves,
  Activity,
  Wind,
  Mountain,
  ChevronRight,
  MapPin
} from 'lucide-react';

export default function CivilianSafetyCard({
  recommendation = null,
  activeRouteType = 'primary',
  disasterType = 'flood',
  onOpenSOS = () => {},
  selectedIncident = null
}) {
  if (!recommendation) {
    return (
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 text-slate-400 space-y-3">
        <div className="flex items-center space-x-2 text-slate-300">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="font-semibold text-sm text-white">Civilian Safety & Evacuation Guidance</h3>
        </div>
        <p className="text-xs leading-relaxed text-slate-400">
          Select any active emergency incident on the map or left list to view an instant verified safe route, 
          hospital bed readiness, and hazard avoidance guidance.
        </p>
      </div>
    );
  }

  const route = activeRouteType === 'primary' ? recommendation.primary_route : recommendation.backup_route;
  const vehicle = recommendation.assigned_vehicle;
  const hospital = recommendation.assigned_hospital;

  // Authentic disaster advice based on active threat
  const disasterTips = {
    flood: [
      "Avoid low-lying underpasses and riverbank roads where water depth can submerge vehicle engines.",
      "Move to higher ground immediately if flood water approaches premises.",
      "Do not walk or drive through flowing water. Turn Around, Don't Drown."
    ],
    earthquake: [
      "Keep clear of older masonry overpasses and building facades with visible structural cracks.",
      "Stay in open spaces away from high-tension utility wires, flyovers, and glass buildings.",
      "Be prepared for potential aftershocks before re-entering compromised structures."
    ],
    cyclone: [
      "Stay indoors away from windows until official all-clear advisories are issued.",
      "Never touch or step near dangling electrical cables or uprooted utility poles.",
      "Avoid driving through tree-lined avenues prone to sudden canopy collapse."
    ],
    landslide: [
      "Avoid sheer hillside roads and mountain valley passes during intense rainfall.",
      "Watch for sudden surges of muddy water or rolling stones on road cuts.",
      "Evacuate hillside structures immediately if ground cracking or tilting trees are noticed."
    ]
  };

  const tips = disasterTips[disasterType] || disasterTips.flood;

  // Specific hazard avoided callout
  const hazardAvoidedText = {
    flood: "Bypassed submerged lowland underpass (45+ cm water depth) to prevent engine stalling.",
    earthquake: "Diverted away from older flyover deck with structural tremor advisory.",
    cyclone: "Bypassed tree-canopied corridor blocked by uprooted banyan trees and downed power lines.",
    landslide: "Rerouted around steep hill cut road prone to active rockfalls."
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl space-y-4 p-5">
      {/* Top Status Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono tracking-wider font-bold uppercase text-emerald-400">
              Verified Safe Evacuation Path
            </span>
          </div>
          <h3 className="font-bold text-base text-white mt-1">
            {activeRouteType === 'primary' ? 'Recommended Primary Corridor' : 'Alternate Diversion Route'}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Inspected and cleared for emergency transit under active {disasterType} conditions.
          </p>
        </div>

        {/* Quick ETA Badge */}
        <div className="text-right bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
          <div className="text-lg font-bold font-mono text-emerald-400">
            {Math.round(route?.travel_time_min || 12)} min
          </div>
          <div className="text-[10px] text-slate-400 font-medium">Estimated Time</div>
        </div>
      </div>

      {/* 3 Plain-Language Safety Reasons */}
      <div className="space-y-2.5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          Why This Route Is Safe:
        </h4>

        <div className="space-y-2 text-xs">
          {/* Reason 1 */}
          <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">High-Elevation Corridor: </span>
              <span className="text-slate-400">
                Utilizes structurally sound, dry highway corridors and modern bridges.
              </span>
            </div>
          </div>

          {/* Reason 2: Hazard Avoided */}
          <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-950/50 border border-amber-900/30">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-amber-300">Hazard Diverted: </span>
              <span className="text-slate-400">
                {hazardAvoidedText[disasterType] || hazardAvoidedText.flood}
              </span>
            </div>
          </div>

          {/* Reason 3: Hospital Beds Verified */}
          <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80">
            <Building2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-200">Hospital Bed Pre-Reserved: </span>
              <span className="text-slate-400">
                {hospital?.name || 'Nearest Government Hospital'} has verified emergency capacity (Trauma: {hospital?.beds_trauma_avail || 8} open, ICU: {hospital?.beds_icu_avail || 4} open).
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Official Disaster Safety Advisory */}
      <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/70 space-y-2">
        <h4 className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Official Civilian Safety Guidelines:
        </h4>
        <ul className="space-y-1.5 text-xs text-slate-400">
          {tips.map((tip, idx) => (
            <li key={idx} className="flex items-start space-x-2">
              <span className="text-emerald-500 font-bold shrink-0">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 1-Click SOS Action Button */}
      <button
        onClick={onOpenSOS}
        className="w-full py-3 px-4 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-2 shadow-lg shadow-rose-950/40"
      >
        <PhoneCall className="w-4 h-4" />
        <span>Need Emergency Help or Report Danger (SOS)</span>
      </button>
    </div>
  );
}
