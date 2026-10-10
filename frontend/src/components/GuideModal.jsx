import React from 'react';
import {
  HelpCircle,
  Shield,
  Navigation,
  Compass,
  Building2,
  Truck,
  Waves,
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function GuideModal({ isOpen = false, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">How Raksh Path Works</h3>
              <p className="text-xs text-slate-400">
                Quick Guide to Predictive Flood Emergency Routing &amp; Dispatch
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
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Step 1 */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold">
              <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-700 flex items-center justify-center text-xs">
                1
              </span>
              <span className="text-sm text-white">Pan-India Multi-Region Architecture</span>
            </div>
            <p className="text-slate-300 leading-relaxed pl-8">
              Click <b>"Pan-India Command"</b> in the top bar to switch between India's 7 major floodplains (Prayagraj, Patna, Guwahati, Mumbai, Delhi, Chennai, Kolkata). Each region maintains its own authentic road elevation network, hospital bed tracking, and rescue fleet.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold">
              <span className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-xs">
                2
              </span>
              <span className="text-sm text-white">Incident Queue &amp; Hungarian AI Dispatch</span>
            </div>
            <p className="text-slate-300 leading-relaxed pl-8">
              Click any incident in the right panel. Raksh Path uses an AI flood model (physics runoff + LightGBM) to evaluate road water depth at the exact arrival time. It assigns vehicles with safe wading clearance (Standard Ambulance: 30cm, High-Clearance Rescue Truck: 60cm, Boat Carrier: 70cm+) and pre-verifies hospital Trauma/ICU beds so patients are never turned away.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold">
              <span className="w-6 h-6 rounded-full bg-amber-950 border border-amber-700 flex items-center justify-center text-xs">
                3
              </span>
              <span className="text-sm text-white">Primary vs. Diverse Backup Corridors</span>
            </div>
            <p className="text-slate-300 leading-relaxed pl-8">
              The map draws two distinct routes:
              <br />
              • <b className="text-cyan-400">Solid Cyan Line</b>: Primary route — the fastest route without drowning hazards.
              <br />
              • <b className="text-amber-400">Dashed Amber Line</b>: Diverse backup corridor — taking elevated bridges and high ground in case waters rise further.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 font-bold">
              <span className="w-6 h-6 rounded-full bg-rose-950 border border-rose-700 flex items-center justify-center text-xs">
                4
              </span>
              <span className="text-sm text-white">Interactive Flood Timeline &amp; 1-Tap Roadblock</span>
            </div>
            <p className="text-slate-300 leading-relaxed pl-8">
              Use the bottom <b>Time Slider (0h to 6h)</b> to simulate peak monsoon rainfall and river surge. Click <b>"Crew View"</b> to simulate a driver in the cab and tap <b>"REPORT ROAD BLOCKED"</b> to witness the system immediately re-route the fleet onto the backup corridor!
            </p>
          </div>

          <div className="pt-2 text-center">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 font-bold text-white text-xs shadow-lg shadow-cyan-950"
            >
              Start Exploring Raksh Path
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
