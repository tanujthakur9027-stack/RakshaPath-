import React from 'react';
import {
  Truck,
  Shield,
  LifeBuoy,
  Gauge,
  Sliders,
  AlertOctagon,
  ChevronRight,
  Flame,
  CheckCircle2,
  XCircle,
  HelpCircle,
  PhoneCall
} from 'lucide-react';
import { VEHICLE_PROFILES } from '../api/embeddedEngine';

export default function TacticalSidebar({
  statesList = [],
  selectedState = 'Uttar Pradesh',
  onSelectState,
  selectedDistrict = 'Lucknow',
  districtsList = [],
  onSelectDistrict,
  nodes = [],
  originNode,
  onSelectOrigin,
  destNode,
  onSelectDest,
  vehicleType = 'ambulance',
  onSelectVehicle,
  waterDepth = 45,
  onChangeWaterDepth,
  damageLevel = 2.5,
  onChangeDamageLevel,
  debrisLevel = 1.5,
  onChangeDebrisLevel,
  vehicleEval,
  onOpenSOS,
  onOpenAuth,
  currentRole = 'NDRF Tactical Lead'
}) {
  const currentProfile = VEHICLE_PROFILES[vehicleType] || VEHICLE_PROFILES.ambulance;

  return (
    <div className="w-80 md:w-96 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-200 overflow-y-auto select-none">
      {/* 1. Header & Badge identification */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">
              Tactical Command Dock
            </h2>
          </div>
          <button
            onClick={onOpenAuth}
            className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition"
            title="Switch Personnel ID / Evaluator Mode"
          >
            {currentRole}
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Dynamic Risk-Weighted Routing & Ground Hazard Engine
        </p>
      </div>

      <div className="p-4 space-y-5 flex-1">
        {/* 2. State & District Location Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Operational Territory
            </span>
            <span className="text-[11px] text-slate-400">Multi-State Network</span>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">State / UT</label>
              <select
                value={selectedState}
                onChange={(e) => onSelectState(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
              >
                {statesList.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">District / City Zone</label>
              <select
                value={selectedDistrict}
                onChange={(e) => onSelectDistrict(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
              >
                {districtsList.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 3. Origin & Destination Checkpoints */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="text-xs font-semibold text-slate-300">
            Corridor Endpoints
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">Origin Checkpoint / Incident</label>
              <select
                value={originNode}
                onChange={(e) => onSelectOrigin(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
              >
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.name} ({n.category})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 font-medium block mb-1">Destination Hospital / Shelter</label>
              <select
                value={destNode}
                onChange={(e) => onSelectDest(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
              >
                {nodes.map(n => (
                  <option key={n.id} value={n.id}>{n.name} ({n.category})</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 4. Mobility Asset Profile Selector */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-cyan-400" />
              Mobility Asset Profile
            </span>
          </div>

          <div className="space-y-1.5">
            {Object.entries(VEHICLE_PROFILES).map(([key, prof]) => {
              const isSelected = vehicleType === key;
              return (
                <button
                  key={key}
                  onClick={() => onSelectVehicle(key)}
                  className={`w-full text-left p-2 rounded-lg border transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500/70 text-white'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold leading-tight truncate">{prof.name}</div>
                    <div className="text-[10px] text-slate-400">
                      Clearance: {prof.max_water_clearance_cm}cm • Speed: {prof.base_speed_kmh}km/h
                    </div>
                  </div>
                  {isSelected && <ChevronRight className="w-4 h-4 text-cyan-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. Physical Hazard Calibration Sliders */}
        <div className="space-y-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              Live Hazard Calibration
            </span>
            <span className="text-[10px] text-amber-400 font-mono">Dynamic Sliders</span>
          </div>

          {/* Water Depth Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Water Inundation Depth</span>
              <span className="font-mono font-bold text-cyan-400 text-xs">{waterDepth} cm</span>
            </div>
            <input
              type="range"
              min="0"
              max="150"
              step="5"
              value={waterDepth}
              onChange={(e) => onChangeWaterDepth(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>Dry (0cm)</span>
              <span>Submerged (150cm)</span>
            </div>
          </div>

          {/* Road Damage Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Structural Damage (0-10)</span>
              <span className="font-mono font-bold text-amber-400 text-xs">{damageLevel.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={damageLevel}
              onChange={(e) => onChangeDamageLevel(Number(e.target.value))}
              className="w-full accent-amber-400 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Debris Obstruction Slider */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-400 text-[11px]">Debris / Rubble (0-10)</span>
              <span className="font-mono font-bold text-rose-400 text-xs">{debrisLevel.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={debrisLevel}
              onChange={(e) => onChangeDebrisLevel(Number(e.target.value))}
              className="w-full accent-rose-400 bg-slate-700 h-1.5 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* 6. Active Vehicle Physics Indicator */}
        <div className="pt-3 border-t border-slate-800">
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">Vehicle Passability</span>
              {vehicleEval?.is_passable ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                  <CheckCircle2 className="w-3.5 h-3.5" /> PASSABLE
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800/80">
                  <XCircle className="w-3.5 h-3.5" /> IMPASSABLE
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/60 font-mono">
              <div>
                <span className="text-[10px] text-slate-500 block">Speed Cap</span>
                <span className="font-bold text-slate-200">{vehicleEval?.effective_speed_kmh || 50} km/h</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Hazard Penalty</span>
                <span className="font-bold text-cyan-400">x{vehicleEval?.risk_multiplier || 1.0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 7. Emergency Broadcast / SOS Action */}
        <div className="pt-2">
          <button
            onClick={onOpenSOS}
            className="w-full py-2.5 px-3 bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/30 flex items-center justify-center gap-2 transition"
          >
            <PhoneCall className="w-4 h-4" />
            Citizen Emergency SOS & Hotlines
          </button>
        </div>
      </div>
    </div>
  );
}
