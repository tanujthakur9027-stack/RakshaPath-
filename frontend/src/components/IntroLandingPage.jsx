import React, { useState } from 'react';
import {
  Shield,
  Users,
  Truck,
  Activity,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Radio,
  MapPin,
  Building2,
  Lock,
  Zap,
  PhoneCall,
  Compass,
  FileText,
  ExternalLink,
  ChevronRight,
  Layers,
  Sparkles
} from 'lucide-react';
import { CITY_PRESETS } from '../api/embeddedEngine';

export default function IntroLandingPage({
  onSelectView,
  onSelectRole,
  currentRole,
  onSelectCity,
  onApplyScenario,
  currentCityId
}) {
  const [officerBadge, setOfficerBadge] = useState('NDRF-7701');
  const [officerRole, setOfficerRole] = useState(currentRole || 'NDRF Tactical Lead');
  const [officerPasscode, setOfficerPasscode] = useState('RAKSHA2026');
  const [selectedDemoScenario, setSelectedDemoScenario] = useState('lucknow_gomti');

  const handleOfficerLogin = (e) => {
    e.preventDefault();
    onSelectRole(officerRole);
    onSelectView('officer');
  };

  const handleCitizenLogin = () => {
    onSelectRole('Civilian Evacuee');
    onSelectView('citizen');
  };

  const handleCrewLogin = () => {
    onSelectRole('Fleet Ambulance Driver');
    onSelectView('crew');
  };

  const handleAnalyticsLogin = () => {
    onSelectRole('Field Reviewer / Evaluator');
    onSelectView('simulation');
  };

  const demoScenarios = [
    {
      id: 'lucknow_gomti',
      cityId: 'lucknow',
      title: 'Gomti River Breach (Lucknow)',
      desc: '65cm water over Gomti Barrage road. ALS ambulance (30cm limit) routed via elevated Shaheed Path flyover.',
      badge: 'Monsoon Flood • 88% Risk Reduction',
      state: 'Uttar Pradesh',
      district: 'Lucknow',
      origin: 'UP_GOMTI_CHOKE',
      dest: 'UP_SGPGI_LKO',
      vehicle: 'ambulance',
      waterDepth: 65,
      damage: 3.5,
      debris: 2.5,
      disasterType: 'flood'
    },
    {
      id: 'delhi_yamuna',
      cityId: 'delhi',
      title: 'Yamuna Ring Road Inundation (Delhi NCR)',
      desc: '1.1m muddy flood surge submerging Kashmere Gate underpass. NDRF rescue heavy truck deployed.',
      badge: 'River Surge • 100% Passability',
      state: 'Delhi NCR',
      district: 'Central Delhi',
      origin: 'DL_KASHMERE_GATE',
      dest: 'DL_AIIMS_DELHI',
      vehicle: 'ndrf_truck',
      waterDepth: 85,
      damage: 4.0,
      debris: 3.0,
      disasterType: 'flood'
    },
    {
      id: 'prayagraj_sangam',
      cityId: 'prayagraj',
      title: 'Sangam Drainage Backflow (Prayagraj)',
      desc: 'Swollen drainage nullahs blocking Daraganj approach to SRN Hospital. Joint bed reservation active.',
      badge: 'Confluence Surge • Zero Diverts',
      state: 'Uttar Pradesh',
      district: 'Prayagraj',
      origin: 'PRY_DARAGANJ',
      dest: 'PRY_SRN_HOSP',
      vehicle: 'ambulance',
      waterDepth: 45,
      damage: 2.0,
      debris: 1.5,
      disasterType: 'flood'
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-white">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 pt-10 pb-16 px-4 sm:px-6 lg:px-8">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700/80 text-xs font-semibold text-cyan-400 mb-6 shadow-lg shadow-cyan-950/20">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>National Emergency Mobility Intelligence Network</span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-300">RakshaPath 2.0</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            RAKSHAPATH <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">( रक्षापथ )</span>
          </h1>
          <p className="mt-4 text-base sm:text-xl text-slate-300 font-medium max-w-3xl mx-auto leading-relaxed">
            Autonomous Multi-Hazard Disaster Corridor Navigation &amp; Real-Time Trauma Bed Reservation Network
          </p>
          <p className="mt-2 text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Commercial GPS apps minimize distance, leading ambulances blindly into lethal 60cm flooded underpasses. RakshaPath models physical vehicle wading limits, solves Risk-Weighted A* safe bypasses, and guarantees verified hospital ICU beds.
          </p>

          {/* Quick Stats Grid */}
          <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto text-left">
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-cyan-900/40 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono">-25.9%</div>
              <div className="text-[11px] sm:text-xs font-bold text-white mt-1">P90 Response Latency</div>
              <div className="text-[10px] text-slate-400">Verified via 200 SimPy calls</div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-emerald-900/40 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">0.0%</div>
              <div className="text-[11px] sm:text-xs font-bold text-white mt-1">Vehicle Drownings</div>
              <div className="text-[10px] text-slate-400">Zero engine hydrolock stalls</div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-blue-900/40 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-blue-400 font-mono">100%</div>
              <div className="text-[11px] sm:text-xs font-bold text-white mt-1">ICU Bed Pre-Reserved</div>
              <div className="text-[10px] text-slate-400">Zero ER diversion mismatches</div>
            </div>

            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/80 border border-amber-900/40 backdrop-blur-sm">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">₹ 3,680</div>
              <div className="text-[11px] sm:text-xs font-bold text-white mt-1">Autonomous IoT Node</div>
              <div className="text-[10px] text-slate-400">Solar LoRaWAN river gauge</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Choose Your Role / Login Portal (The Core Request!) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Select Your Operational Gateway
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl mx-auto">
            Choose your clearance profile to access the appropriate toolset, interface, and telemetry permissions.
          </p>
        </div>

        {/* 4 Gateway Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Tactical Officer / Commander */}
          <div className="relative rounded-3xl bg-slate-900/90 border border-slate-700 hover:border-cyan-500/80 p-6 flex flex-col justify-between shadow-xl transition-all hover:shadow-cyan-950/40 hover:-translate-y-1">
            <div className="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full bg-cyan-600 text-[10px] font-black uppercase text-white tracking-wider">
              COMMAND CLEARANCE
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Tactical Officer &amp; Commander</h3>
              <p className="text-xs text-slate-400 mt-1">
                For NDRF, SDRF, EMS Dispatchers, and Municipal Control Room incident commanders.
              </p>

              <div className="my-4 space-y-1.5 text-xs text-slate-300 border-t border-b border-slate-800 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Full GIS Telemetry &amp; CWC Gauge River Ticker</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Interactive Flood Depth &amp; Debris Sliders</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Hungarian Hospital Bed Capacity Allocator</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Official NDMA Mission Manifest Generator</span>
                </div>
              </div>

              {/* Quick Officer Form */}
              <form onSubmit={handleOfficerLogin} className="space-y-2.5">
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-0.5">
                    Command Wing
                  </label>
                  <select
                    value={officerRole}
                    onChange={(e) => setOfficerRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="NDRF Tactical Lead">NDRF Tactical Lead</option>
                    <option value="SDRF Disaster Commander">SDRF Disaster Commander</option>
                    <option value="EMS Trauma Dispatcher">EMS Trauma Dispatcher</option>
                    <option value="Municipal Control Officer">Municipal Control Officer</option>
                  </select>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={officerBadge}
                    onChange={(e) => setOfficerBadge(e.target.value)}
                    placeholder="Badge ID"
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg transition shrink-0"
                  >
                    Enter
                  </button>
                </div>
              </form>
            </div>

            <button
              onClick={() => {
                onSelectRole('NDRF Tactical Lead');
                onSelectView('officer');
              }}
              className="mt-4 w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>Launch Tactical Command Center</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Citizen / Civilian Safety Portal */}
          <div className="relative rounded-3xl bg-slate-900/90 border border-slate-700 hover:border-emerald-500/80 p-6 flex flex-col justify-between shadow-xl transition-all hover:shadow-emerald-950/40 hover:-translate-y-1">
            <div className="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full bg-emerald-600 text-[10px] font-black uppercase text-white tracking-wider">
              PUBLIC ACCESS
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Citizen Safety &amp; Evacuation</h3>
              <p className="text-xs text-slate-400 mt-1">
                For everyday civilians, stranded families, and flood evacuees seeking safe passage.
              </p>

              <div className="my-4 space-y-1.5 text-xs text-slate-300 border-t border-b border-slate-800 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Zero Confusing Math — Plain Everyday Guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>1-Touch Safe Evacuation Route to High Ground</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Verified Safe Hospitals &amp; Emergency Beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Direct 1-Touch Hotlines: 112, 108 &amp; 1078</span>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-[11px] text-emerald-300">
                💡 <b>No Password Needed:</b> Open to all citizens during declared flood and storm alerts.
              </div>
            </div>

            <button
              onClick={handleCitizenLogin}
              className="mt-4 w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>Enter Citizen Safety Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: In-Cab Fleet Terminal (Ambulance & Rescue Driver) */}
          <div className="relative rounded-3xl bg-slate-900/90 border border-slate-700 hover:border-amber-500/80 p-6 flex flex-col justify-between shadow-xl transition-all hover:shadow-amber-950/40 hover:-translate-y-1">
            <div className="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full bg-amber-600 text-[10px] font-black uppercase text-white tracking-wider">
              FLEET IN-CAB HUD
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Fleet In-Cab Navigator</h3>
              <p className="text-xs text-slate-400 mt-1">
                For ambulance drivers, NDRF rescue boat crews, and all-terrain vehicle operators.
              </p>

              <div className="my-4 space-y-1.5 text-xs text-slate-300 border-t border-b border-slate-800 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>High-Contrast Storm Night HUD Console</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Audio-Tactile Radar Deviation Alarms</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>1-Tap Immediate Road Blockage Reporting</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>100% Offline Web Worker Routing Resilience</span>
                </div>
              </div>

              <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-xl text-[11px] text-amber-300">
                🚨 <b>Unit Terminal:</b> Call Sign <code>UP-70-AMB-01</code> synced with regional EMS dispatch.
              </div>
            </div>

            <button
              onClick={handleCrewLogin}
              className="mt-4 w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>Launch Fleet In-Cab Terminal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 4: Simulation & Engineering Lab */}
          <div className="relative rounded-3xl bg-slate-900/90 border border-slate-700 hover:border-blue-500/80 p-6 flex flex-col justify-between shadow-xl transition-all hover:shadow-blue-950/40 hover:-translate-y-1">
            <div className="absolute -top-3 right-5 px-2.5 py-0.5 rounded-full bg-blue-600 text-[10px] font-black uppercase text-white tracking-wider">
              EVALUATOR LAB
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Simulation &amp; Engineering Lab</h3>
              <p className="text-xs text-slate-400 mt-1">
                For hackathon judges, academic researchers, and disaster mobility evaluators.
              </p>

              <div className="my-4 space-y-1.5 text-xs text-slate-300 border-t border-b border-slate-800 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>SimPy 200-Incident Monte Carlo Benchmark Logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Vehicle Soft-Sigmoid Wading Dynamics Curves</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Itemized Hardware BOM (₹3,680 / node)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>75-Day Milestone Execution Roadmap</span>
                </div>
              </div>

              <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-[11px] text-blue-300">
                🔬 <b>Discrete-Event Logs:</b> P90 latency tail drops from 38.2 to 28.3 minutes.
              </div>
            </div>

            <button
              onClick={handleAnalyticsLogin}
              className="mt-4 w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>Inspect Simulation Evidence</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. Live City Network Coverage */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              Active Monitored River Basins &amp; Urban Networks
            </h3>
            <p className="text-xs text-slate-400">
              Select any regional basin to instantly initialize the tactical GIS grid and live gauge feeds.
            </p>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            Status: <span className="text-emerald-400 font-bold">4 Basins Live &amp; Streaming</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {CITY_PRESETS.map((city) => (
            <button
              key={city.id}
              onClick={() => {
                onSelectCity(city.id);
                onSelectView('officer');
              }}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                currentCityId === city.id
                  ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-lg shadow-cyan-950/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold">
                <span>{city.name}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">{city.state}</div>
              <div className="text-[10px] text-cyan-400 font-mono mt-2">
                Coords: {city.coords[1].toFixed(2)}°N, {city.coords[0].toFixed(2)}°E
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Interactive Pre-Configured Disaster Scenarios */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-800/80">
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Evaluation Walkthroughs</span>
          </div>
          <h3 className="text-lg font-bold text-white">
            1-Click Benchmark Disaster Scenarios
          </h3>
          <p className="text-xs text-slate-400">
            Launch pre-calibrated flood situations to immediately observe the difference between standard naive routes and RakshaPath safe corridors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {demoScenarios.map((sc) => (
            <div
              key={sc.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">{sc.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                    {sc.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {sc.desc}
                </p>
              </div>

              <button
                onClick={() => {
                  onApplyScenario(sc);
                  onSelectView('officer');
                }}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-cyan-600 text-slate-200 hover:text-white font-semibold text-xs transition flex items-center justify-center gap-1.5"
              >
                <span>Launch This Scenario</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Footer */}
      <footer className="border-t border-slate-800/80 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <b>RakshaPath (रक्षापथ)</b> • Team Techies • Track: Diploma &amp; Higher Education
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/tanujthakur9027-stack/RakshaPath-"
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-white flex items-center gap-1 transition"
          >
            <span>GitHub Repository</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={() => onSelectView('simulation')}
            className="text-slate-400 hover:text-white transition"
          >
            Engineering Dossier
          </button>
        </div>
      </footer>
    </div>
  );
}
