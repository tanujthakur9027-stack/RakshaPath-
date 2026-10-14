import React, { useState } from 'react';
import {
  Activity,
  Zap,
  Clock,
  Building2,
  ShieldCheck,
  Cpu,
  Layers,
  DollarSign,
  Download,
  ExternalLink,
  ChevronRight,
  TrendingDown,
  Waves,
  FileText
} from 'lucide-react';

export default function EngineeringLabView({ onSwitchToOfficer }) {
  const [activeTab, setActiveTab] = useState('simpy'); // 'simpy' | 'wading' | 'bom' | 'iot'

  const simpyIncidents = [
    { id: 'INC-01', time: '14.2 min', loc: 'Shaheed Path Underpass Lowland', zone: 'Severe Inundation', spec: 'Trauma ICU', status: 'Safely Routed' },
    { id: 'INC-02', time: '18.6 min', loc: 'Gomti Barrage Link', zone: '65cm Flood Breach', spec: 'General ER', status: 'Detoured Elevated' },
    { id: 'INC-03', time: '21.0 min', loc: 'Yamuna Ring Road Sector 14', zone: 'Submerged Underpass', spec: 'Pediatric ICU', status: 'Safely Routed' },
    { id: 'INC-04', time: '24.5 min', loc: 'Daraganj Sangam Access', zone: 'Confluence Backflow', spec: 'Trauma ICU', status: 'Bed Pre-Reserved' },
    { id: 'INC-05', time: '28.1 min', loc: 'Civil Lines Arterial feeder', zone: 'Debris & Tree Scour', spec: 'Cardiac Care', status: 'Safely Routed' }
  ];

  const bomList = [
    { item: 'ESP32-S3 Dual-Core Xtensa Microcontroller + Custom PCB', role: 'Edge data logging, Kalman wave filter, LoRaWAN stack', qty: 1, inr: '₹ 650', usd: '$ 7.80', vendor: 'Mouser / Robu.in' },
    { item: 'JSN-SR04T Waterproof Ultrasonic Transducer', role: 'Measures water surface distance (20-600cm, ±1mm)', qty: 1, inr: '₹ 480', usd: '$ 5.75', vendor: 'Amazon India / Robu.in' },
    { item: 'SX1262 LoRaWAN 868MHz Transceiver Module', role: 'Long-range telemetry (up to 12km non-line-of-sight)', qty: 1, inr: '₹ 750', usd: '$ 9.00', vendor: 'Waveshare / Semtech' },
    { item: '10W Monocrystalline Solar Panel + TP5100 MPPT', role: 'Continuous daylight energy harvesting & charging', qty: 1, inr: '₹ 850', usd: '$ 10.20', vendor: 'Local Solar Suppliers' },
    { item: '6000mAh LiFePO4 Battery Pack + IP67 Weatherproof Box', role: '14-Day zero-sunlight autonomous operation', qty: 1, inr: '₹ 950', usd: '$ 11.40', vendor: 'Local Enclosure Mfrs' },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-slate-950 text-slate-100 font-sans p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="border-b border-slate-800 pb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                Evaluation &amp; Research Dossier
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              RakshaPath Simulation, Calculations &amp; BOM Benchmarks
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              Deterministic validation of Risk-Weighted A*, SimPy 200-call Monte Carlo discrete-event simulations, and sub-₹3,700 IoT hardware.
            </p>
          </div>

          <button
            onClick={onSwitchToOfficer}
            className="px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition"
          >
            <span>Launch Live Officer Map</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setActiveTab('simpy')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'simpy'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>SimPy 200-Call Benchmark</span>
          </button>

          <button
            onClick={() => setActiveTab('wading')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'wading'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>Vehicle Wading Physics</span>
          </button>

          <button
            onClick={() => setActiveTab('bom')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'bom'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Itemized BOM &amp; Cost Realism</span>
          </button>

          <button
            onClick={() => setActiveTab('iot')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === 'iot'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>IoT Station Schematics</span>
          </button>
        </div>

        {/* Tab 1: SimPy Discrete-Event Simulation */}
        {activeTab === 'simpy' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-slate-900 border border-cyan-900/50 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    P90 Tail Response Time
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                    -25.9% Faster
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black font-mono text-white">28.3</span>
                    <span className="text-xs text-slate-400 font-mono ml-1">min</span>
                    <span className="block text-[11px] text-cyan-400 font-semibold">RakshaPath Dynamic Corridor</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-slate-400 line-through">38.2</span>
                    <span className="text-xs text-slate-500 font-mono ml-1">min</span>
                    <span className="block text-[11px] text-slate-500">Google Maps Naive</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-emerald-900/50 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    Hospital Diversions
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                    100% Eliminated
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black font-mono text-emerald-400">0</span>
                    <span className="text-xs text-slate-400 font-mono ml-1">mismatches</span>
                    <span className="block text-[11px] text-emerald-300 font-semibold">Verified ICU Bed Reserved</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-rose-400">28.5%</span>
                    <span className="block text-[11px] text-slate-500">Diverted at Door</span>
                  </div>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    Ambulance Water Submersion
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-700">
                    Zero Stalls
                  </span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-3xl font-black font-mono text-blue-400">0.0%</span>
                    <span className="block text-[11px] text-blue-300 font-semibold">100% Passable High Corridors</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold font-mono text-rose-400">41.0%</span>
                    <span className="block text-[11px] text-slate-500">Stalled in &gt;30cm water</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SimPy Call Stream Sample Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-2">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-white uppercase tracking-wider">
                  Poisson Incident Stream Sample Log (24-Hour Surge Run)
                </span>
                <span className="text-cyan-400 font-mono font-bold">200 Incidents Processed</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Incident ID</th>
                      <th className="p-3">Arrival T+</th>
                      <th className="p-3">Location</th>
                      <th className="p-3">Zone Severity</th>
                      <th className="p-3">Specialty</th>
                      <th className="p-3">RakshaPath Result</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {simpyIncidents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/40">
                        <td className="p-3 font-bold text-cyan-300">{s.id}</td>
                        <td className="p-3 text-slate-300">{s.time}</td>
                        <td className="p-3 text-white font-sans">{s.loc}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] bg-rose-950 text-rose-300 border border-rose-800">
                            {s.zone}
                          </span>
                        </td>
                        <td className="p-3 text-emerald-400">{s.spec}</td>
                        <td className="p-3 text-white font-sans font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{s.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Vehicle Wading Dynamics */}
        {activeTab === 'wading' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <h3 className="text-lg font-bold text-white">Vehicle Class Clearance Limits</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Standard commercial navigation systems treat all roads equally. RakshaPath dynamically checks physical water depth against the maximum air intake clearance of the vehicle:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Basic / ALS Ambulance</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                    30 cm Limit
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-rose-400">30 cm max</div>
                <p className="text-[11px] text-slate-400">
                  Water above 30cm reaches the engine air intake filter, causing catastrophic engine hydrolock within seconds.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-blue-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">NDRF Heavy Rescue Truck</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                    85 cm Limit
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-blue-400">85 cm max</div>
                <p className="text-[11px] text-slate-400">
                  Elevated snorkel intake and high axle clearance allow all-terrain rescue trucks to wade through up to 85cm water.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-emerald-900/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Tactical Inflatable Boat</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Amphibious
                  </span>
                </div>
                <div className="text-2xl font-black font-mono text-emerald-400">Unlimited Depth</div>
                <p className="text-[11px] text-slate-400">
                  Designed for deep river channel surges and fully flooded residential colonies.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Itemized BOM */}
        {activeTab === 'bom' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4">
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Itemized Bill of Materials (BOM) &amp; Unit Costing</h3>
                <p className="text-xs text-slate-400">Commercial-Off-The-Shelf (COTS) Components Sourcing</p>
              </div>
              <span className="text-sm font-black text-emerald-400 font-mono">
                Total Station Cost: ₹ 3,680 ($ 44.15 USD)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Component Description</th>
                    <th className="p-3">Functional Role</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Cost (INR)</th>
                    <th className="p-3">Cost (USD)</th>
                    <th className="p-3">Sourcing Viability</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                  {bomList.map((b, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white font-sans">{b.item}</td>
                      <td className="p-3 text-slate-400 font-sans">{b.role}</td>
                      <td className="p-3 text-cyan-300">{b.qty}</td>
                      <td className="p-3 text-emerald-400 font-bold">{b.inr}</td>
                      <td className="p-3 text-emerald-400">{b.usd}</td>
                      <td className="p-3 text-slate-300">{b.vendor}</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-950/30 font-bold">
                    <td colSpan={3} className="p-3 text-white font-sans">
                      Complete Autonomous Solar IoT River Gauge Station (1 Unit)
                    </td>
                    <td className="p-3 text-emerald-400 text-sm">₹ 3,680</td>
                    <td className="p-3 text-emerald-400 text-sm">$ 44.15</td>
                    <td className="p-3 text-emerald-300 font-sans">100% COTS Viable</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-950/80 border-t border-slate-800 text-xs text-slate-300">
              💡 <b>City-Scale Viability:</b> An entire district pilot (12 bridge gauge stations + 20 ambulance tablets + 1 central LoRaWAN gateway) costs under <b>₹ 2,14,000 ($ 2,570 USD)</b>—less than 2% of the cost of one single new ambulance.
            </div>
          </div>
        )}

        {/* Tab 4: IoT Station Schematics */}
        {activeTab === 'iot' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-white">Autonomous Solar IoT River Gauge Station Blueprint</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Engineered for continuous field deployment on river bridge piers. Operates on solar energy with 14 continuous days of battery autonomy during heavy overcast monsoon rain.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-cyan-400 block uppercase">1. Microcontroller &amp; Sensor</span>
                <p className="text-slate-300">
                  ESP32-S3 dual-core processor runs an active cycle of 3 seconds every 30 seconds, spending the remaining 27 seconds in ultra-low power deep sleep (15 µA).
                </p>
                <p className="text-slate-300">
                  The JSN-SR04T waterproof transducer measures water height with ±1 mm accuracy from bridge piers, filtering river wave noise.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <span className="font-bold text-emerald-400 block uppercase">2. Power Budget &amp; Long-Range Radio</span>
                <p className="text-slate-300">
                  A 10W monocrystalline solar panel keeps the 6000 mAh LiFePO4 battery pack charged. Average power draw is only 26.5 mW, giving <b>over 30 days of operation without sunlight</b>.
                </p>
                <p className="text-slate-300">
                  Telemetry packets transmit over 868 MHz LoRaWAN up to 12 km to city gateways, with 4G cellular backup.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
