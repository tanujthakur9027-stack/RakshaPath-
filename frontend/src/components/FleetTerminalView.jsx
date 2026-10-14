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
  Volume2,
  VolumeX,
  MapPin,
  Clock,
  Gauge,
  Wifi,
  BatteryCharging
} from 'lucide-react';
import MapView from './MapView';
import { VEHICLE_PROFILES } from '../api/embeddedEngine';

export default function FleetTerminalView({
  routeData,
  hospitals,
  fleet,
  incidents,
  mapCenter,
  originCoords,
  destCoords,
  originName,
  destName,
  vehicleType = 'ambulance',
  onReportIncident,
  selectedState,
  selectedDistrict
}) {
  const [isAudioRadarOn, setIsAudioRadarOn] = useState(true);
  const [isReportingBlock, setIsReportingBlock] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState('Submerged Underpass Approach');
  const [blockReason, setBlockReason] = useState('Water depth > 45cm, impassable for ambulance');
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  const vehicleProfile = VEHICLE_PROFILES[vehicleType] || VEHICLE_PROFILES['ambulance'];
  const callsign = 'UP-70-AMB-01';

  const handleBlockReport = (e) => {
    e.preventDefault();
    setIsTransmitting(true);
    onReportIncident({
      title: `FLEET REPORT: ${selectedSegment} Impassable`,
      state: selectedState,
      district: selectedDistrict,
      incident_type: 'flood',
      severity: 'Critical',
      lat: mapCenter[1],
      lon: mapCenter[0],
      water_depth_cm: 65,
      damage_level: 4,
      debris_level: 3,
      description: `In-cab crew of ${callsign} verified ${selectedSegment} is impassable. Reason: ${blockReason}. Trailing fleet rerouted.`
    });

    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setIsReportingBlock(false);
      setIsTransmitting(false);
    }, 2500);
  };

  const steps = [
    { text: 'Depart origin checkpoint safely on high ground.', dist: '0.0 km', status: 'done' },
    { text: 'Proceed toward Shaheed Path Elevated Flyover bypass.', dist: '2.4 km', status: 'current' },
    { text: 'CAUTION: Avoid low-level service ramp (submerged 65cm water).', dist: '3.1 km', status: 'warning' },
    { text: 'Merge onto expressway overpass. Surface dry and inspected.', dist: '5.2 km', status: 'upcoming' },
    { text: `Arrive at ${destName} Emergency Trauma Bay (Bed Pre-Reserved).`, dist: '8.4 km', status: 'destination' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 font-sans p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* 1. In-Cab Telemetry Status Header */}
        <div className="rounded-3xl bg-slate-900 border border-slate-700/80 p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-black text-xl text-white tracking-wider">
                  {callsign}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  MISSION ACTIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                {vehicleProfile.name} • Wading Clearance: <b className="text-cyan-300">{vehicleProfile.max_water_depth_cm} cm</b>
              </p>
            </div>
          </div>

          {/* Telemetry Status Indicators */}
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-cyan-400">
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              <span>LORA MESH: 868MHz</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-1.5 text-emerald-400">
              <BatteryCharging className="w-3.5 h-3.5" />
              <span>BATTERY: 98%</span>
            </div>
            <button
              onClick={() => setIsAudioRadarOn(!isAudioRadarOn)}
              className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                isAudioRadarOn
                  ? 'bg-cyan-950/60 border-cyan-700 text-cyan-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
            >
              {isAudioRadarOn ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{isAudioRadarOn ? 'RADAR ON' : 'RADAR OFF'}</span>
            </button>
          </div>
        </div>

        {/* 2. Primary In-Cab HUD Gauges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              Vehicle Speed
            </div>
            <div className="text-3xl font-black font-mono text-cyan-400 mt-1">42 <span className="text-sm font-normal text-slate-400">km/h</span></div>
            <div className="text-[10px] text-emerald-400 font-medium">Safe Surface Speed</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              Estimated Transit ETA
            </div>
            <div className="text-3xl font-black font-mono text-emerald-400 mt-1">
              {routeData?.safe_corridor?.estimated_transit_time_min ? `${Math.round(routeData.safe_corridor.estimated_transit_time_min)}` : '14'} <span className="text-sm font-normal text-slate-400">min</span>
            </div>
            <div className="text-[10px] text-slate-400">Zero Reroute Delays</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-blue-400" />
              Total Safe Distance
            </div>
            <div className="text-3xl font-black font-mono text-white mt-1">
              {routeData?.safe_corridor?.total_distance_km ? `${routeData.safe_corridor.total_distance_km.toFixed(1)}` : '8.4'} <span className="text-sm font-normal text-slate-400">km</span>
            </div>
            <div className="text-[10px] text-cyan-400">Bypassing Flood Zone</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-center">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-1">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              Route Reliability
            </div>
            <div className="text-3xl font-black font-mono text-emerald-400 mt-1">100%</div>
            <div className="text-[10px] text-slate-400">Engine Clearance Verified</div>
          </div>
        </div>

        {/* 3. Main Console: Tactical Map + Step-by-Step Waypoint Guidance */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Map Console (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan-400" />
                Active Tactical Navigation Corridor
              </span>
              <span className="text-emerald-400 font-mono font-bold">GPS LOCKED</span>
            </div>

            <div className="h-96 relative">
              <MapView
                regionCenter={mapCenter}
                routeData={routeData}
                hospitals={hospitals}
                fleet={fleet}
                incidents={incidents}
                originCoords={originCoords}
                destCoords={destCoords}
                originName={originName}
                destName={destName}
                vehicleProfile={vehicleProfile}
              />
            </div>

            {/* Bottom 1-Tap Action: Report Road Blocked */}
            <div className="p-4 bg-slate-950 border-t border-slate-800">
              {!isReportingBlock ? (
                <button
                  onClick={() => setIsReportingBlock(true)}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white font-black text-sm sm:text-base shadow-xl shadow-rose-950/80 flex items-center justify-center gap-3 transition-transform active:scale-95"
                >
                  <AlertTriangle className="w-6 h-6 text-white" />
                  <span>REPORT ROAD BLOCKED (1-TAP CREW FAILOVER)</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-rose-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      Transmit Immediate Roadblock to Trailing Fleet
                    </span>
                    <button
                      onClick={() => setIsReportingBlock(false)}
                      className="text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  {reportSuccess ? (
                    <div className="p-3 bg-emerald-950 border border-emerald-700 text-emerald-300 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Transmitted! Dispatch Network Auto-Rerouted Trailing Units (&lt;300ms).</span>
                    </div>
                  ) : (
                    <form onSubmit={handleBlockReport} className="space-y-3 text-xs">
                      <div>
                        <label className="text-slate-300 block mb-1">Impacted Segment:</label>
                        <select
                          value={selectedSegment}
                          onChange={(e) => setSelectedSegment(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-white"
                        >
                          <option value="Gomti Barrage Lower Bridge Approach">Gomti Barrage Lower Bridge Approach</option>
                          <option value="Shaheed Path Underpass Low Point">Shaheed Path Underpass Low Point</option>
                          <option value="Yamuna Ring Road Lowland Underpass">Yamuna Ring Road Lowland Underpass</option>
                          <option value="Daraganj Sangam Access Road">Daraganj Sangam Access Road</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-300 block mb-1">Reason:</label>
                        <select
                          value={blockReason}
                          onChange={(e) => setBlockReason(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 p-2.5 rounded-xl text-white"
                        >
                          <option value="Water depth > 45cm, impassable for ambulance">
                            Water depth &gt; 45cm, impassable for ambulance
                          </option>
                          <option value="Downed high-voltage power lines blocking lanes">
                            Downed high-voltage power lines blocking lanes
                          </option>
                          <option value="Civilian vehicle stalled underwater blocking entire roadway">
                            Civilian vehicle stalled underwater blocking roadway
                          </option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={isTransmitting}
                        className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950 transition"
                      >
                        <Send className="w-4 h-4" />
                        <span>{isTransmitting ? 'Transmitting to Command...' : 'Transmit Immediate Roadblock'}</span>
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Waypoints & Turn Cues (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                  Turn-by-Turn Waypoints
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                  ACTIVE ROUTE
                </span>
              </div>

              {/* Waypoint steps */}
              <div className="space-y-3 mt-4">
                {steps.map((st, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-3 ${
                      st.status === 'warning'
                        ? 'bg-amber-950/30 border-amber-800/80 text-amber-200'
                        : st.status === 'current'
                        ? 'bg-cyan-950/40 border-cyan-700 text-white shadow-md'
                        : st.status === 'destination'
                        ? 'bg-emerald-950/30 border-emerald-800 text-emerald-200'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-400'
                    }`}
                  >
                    <span className="font-mono text-[11px] font-bold shrink-0 mt-0.5">
                      {st.dist}
                    </span>
                    <div className="flex-1">
                      <span>{st.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destination Hospital Readiness Card */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Pre-Verified Emergency Target:</span>
                <span className="font-bold text-emerald-400">{destName}</span>
              </div>
              <div className="text-[11px] text-slate-300">
                ICU Bed #4 and Trauma Resuscitation Bay #2 reserved. Medical team notified of incoming {callsign}.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
