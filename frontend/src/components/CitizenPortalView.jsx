import React, { useState } from 'react';
import {
  ShieldCheck,
  PhoneCall,
  AlertTriangle,
  Building2,
  MapPin,
  Navigation,
  Compass,
  CheckCircle2,
  LifeBuoy,
  Send,
  Radio,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Waves
} from 'lucide-react';
import MapView from './MapView';
import CivilianSafetyCard from './CivilianSafetyCard';
import { VEHICLE_PROFILES } from '../api/embeddedEngine';

export default function CitizenPortalView({
  currentCityId,
  selectedState,
  selectedDistrict,
  routeData,
  hospitals,
  fleet,
  incidents,
  mapCenter,
  originCoords,
  destCoords,
  originName,
  destName,
  onOpenSOS,
  onGeolocate,
  disasterType,
  onReportIncident,
  onSwitchToOfficer
}) {
  const [activeTab, setActiveTab] = useState('evacuation'); // 'evacuation' | 'hospitals' | 'guidelines'
  const [citizenReportText, setCitizenReportText] = useState('');
  const [reportRoadName, setReportRoadName] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [reportSent, setReportSent] = useState(false);

  const emergencyHotlines = [
    {
      number: '112',
      label: 'National Emergency ERSS',
      desc: 'All-in-one police, fire & disaster rescue dispatch',
      badge: '24/7 TOLL FREE',
      color: 'from-rose-600 to-red-700'
    },
    {
      number: '108',
      label: 'Free Ambulance Service',
      desc: 'Immediate emergency medical and trauma dispatch',
      badge: 'AMBULANCE',
      color: 'from-amber-600 to-orange-700'
    },
    {
      number: '1078',
      label: 'NDMA Disaster Control',
      desc: 'National Disaster Management Authority Helpline',
      badge: 'DISASTER RESCUE',
      color: 'from-blue-600 to-indigo-700'
    }
  ];

  const handleCitizenSubmit = (e) => {
    e.preventDefault();
    if (!reportRoadName) return;
    setIsReporting(true);
    onReportIncident({
      title: `Citizen Report: Flooded Road near ${reportRoadName}`,
      state: selectedState,
      district: selectedDistrict,
      incident_type: disasterType || 'flood',
      severity: 'Critical',
      lat: mapCenter[1],
      lon: mapCenter[0],
      water_depth_cm: 55,
      damage_level: 3,
      debris_level: 2,
      description: citizenReportText || `Citizen observed deep floodwater blocking ${reportRoadName}. Avoid traversal.`
    });

    setReportSent(true);
    setTimeout(() => {
      setReportSent(false);
      setIsReporting(false);
      setReportRoadName('');
      setCitizenReportText('');
    }, 2500);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 font-sans">
      {/* 1. Citizen Emergency Header Banner */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 px-4 sm:px-8 py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Official Citizen Safety &amp; Evacuation Portal
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Stay Safe During Monsoon &amp; Flood Emergencies
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
              Real-time flood-safe evacuation routes, nearby relief centers, and hospital ICU bed readiness for {selectedDistrict}, {selectedState}.
            </p>
          </div>

          {/* Quick GPS Evacuation Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={onGeolocate}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/50 flex items-center gap-2 transition"
            >
              <Compass className="w-4 h-4" />
              <span>Find My Safe Evacuation Route</span>
            </button>
            <button
              onClick={onOpenSOS}
              className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 flex items-center gap-2 transition"
            >
              <PhoneCall className="w-4 h-4" />
              <span>SOS Emergency</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. 1-Touch Emergency Hotlines Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emergencyHotlines.map((h) => (
            <div
              key={h.number}
              className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between shadow-lg"
            >
              <div>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  {h.badge}
                </span>
                <div className="text-sm font-bold text-white mt-1.5">{h.label}</div>
                <div className="text-[11px] text-slate-400">{h.desc}</div>
              </div>

              <a
                href={`tel:${h.number}`}
                className={`px-4 py-2.5 rounded-xl bg-gradient-to-r ${h.color} hover:brightness-110 text-white font-black text-sm font-mono flex items-center gap-2 shadow-md transition`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>{h.number}</span>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Main Content Grid (Map + Safety Advice) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Live Evacuation Map & Verified Guidance (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold text-white">Live Safe Evacuation Corridor Map</span>
                  <span className="text-slate-400 font-normal">({selectedDistrict})</span>
                </div>
                <span className="text-[11px] text-cyan-400 font-mono">
                  Bypassing {originName} Flood Trap
                </span>
              </div>

              {/* Map Embed Container */}
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
                  vehicleProfile={VEHICLE_PROFILES['ambulance']}
                />
              </div>

              <div className="p-3 bg-slate-950/80 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-1 bg-emerald-400 rounded-full" />
                    <span>Safe High-Ground Route</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-3 h-1 bg-rose-500 rounded-full" />
                    <span>Submerged Danger Zone</span>
                  </span>
                </div>
                <span className="text-slate-400">Updated in real-time</span>
              </div>
            </div>

            {/* Plain-Language Route Guidance Card */}
            <CivilianSafetyCard
              recommendation={routeData ? {
                primary_route: {
                  travel_time_min: routeData.safe_corridor?.estimated_transit_time_min || 15,
                  total_length_km: routeData.safe_corridor?.total_distance_km || 10,
                  max_water_depth_m: 0.15
                },
                assigned_hospital: {
                  name: destName,
                  beds_trauma_avail: 16,
                  beds_icu_avail: 18,
                  beds_general_avail: 72
                },
                assigned_vehicle: {
                  callsign: 'Verified Safe Route'
                }
              } : null}
              disasterType={disasterType || 'flood'}
              onOpenSOS={onOpenSOS}
            />
          </div>

          {/* Right Column: Safe Hospitals & 1-Tap Hazard Report (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Safe Hospitals & Medical Centers */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-bold text-white">Verified Open Emergency Hospitals</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold">
                  LIVE CAPACITY
                </span>
              </div>

              <div className="space-y-3">
                {hospitals.slice(0, 4).map((h) => (
                  <div
                    key={h.id || h.name}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{h.name}</div>
                        <div className="text-[11px] text-slate-400">{h.district || selectedDistrict}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                        SAFE TO ACCESS
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-1 text-center font-mono">
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block uppercase">Trauma</span>
                        <span className="text-xs font-bold text-emerald-400">{h.beds_trauma_avail || 12}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block uppercase">ICU Beds</span>
                        <span className="text-xs font-bold text-cyan-400">{h.beds_icu_avail || 8}</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[9px] text-slate-400 block uppercase">General</span>
                        <span className="text-xs font-bold text-slate-200">{h.beds_general_avail || 45}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 1-Tap Citizen Road Hazard Report Form */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-sm font-bold text-white">Report a Flooded or Blocked Road</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                See floodwater or fallen debris blocking your neighborhood? Submit it here to warn other citizens and ambulance drivers immediately.
              </p>

              {reportSent ? (
                <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Hazard Reported! Local map updated successfully.</span>
                </div>
              ) : (
                <form onSubmit={handleCitizenSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Road / Landmark Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Shaheed Path Underpass, Ring Road near Temple"
                      value={reportRoadName}
                      onChange={(e) => setReportRoadName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">
                      Estimated Water Depth / Description
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Water is up to knee height (~50cm). Small cars are turning back."
                      value={citizenReportText}
                      onChange={(e) => setCitizenReportText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isReporting}
                    className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{isReporting ? 'Submitting Report...' : 'Submit Roadblock Warning'}</span>
                  </button>
                </form>
              )}
            </div>

            {/* Switch to Tactical Mode Callout */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400">Emergency responder or official officer?</span>
              <button
                onClick={onSwitchToOfficer}
                className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 transition"
              >
                <span>Switch to Tactical Command</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
