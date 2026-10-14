import React, { useState } from 'react';
import { Shield, UserCheck, Lock, X, CheckCircle2 } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  currentRole = 'NDRF Tactical Lead',
  onSelectRole,
  isCivilianMode,
  onToggleCivilianMode,
  onSelectView = () => {}
}) {
  const [activeTab, setActiveTab] = useState('officer'); // 'officer' | 'civilian' | 'crew' | 'evaluator'
  const [badgeId, setBadgeId] = useState('NDRF-7701');
  const [passcode, setPasscode] = useState('RAKSHA2026');
  const [selectedWing, setSelectedWing] = useState(currentRole);
  const [evaluatorName, setEvaluatorName] = useState('Field Evaluator Alpha');

  if (!isOpen) return null;

  const handleAuthorizeOfficer = (e) => {
    e.preventDefault();
    onSelectRole(selectedWing);
    onSelectView('officer');
    onClose();
  };

  const handleAuthorizeCivilian = () => {
    onSelectRole('Civilian Evacuee');
    onSelectView('citizen');
    onClose();
  };

  const handleAuthorizeCrew = () => {
    onSelectRole('Fleet Ambulance Driver');
    onSelectView('crew');
    onClose();
  };

  const handleAuthorizeEvaluator = () => {
    onSelectRole(evaluatorName);
    onSelectView('simulation');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mb-2">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">RakshaPath Access Portal</h2>
          <p className="text-xs text-slate-400 mt-1">
            National Disaster Management Tactical Verification
          </p>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl mb-4 text-[11px] font-semibold">
          <button
            onClick={() => setActiveTab('officer')}
            className={`py-2 rounded-lg transition ${
              activeTab === 'officer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🛡️ Officer
          </button>
          <button
            onClick={() => setActiveTab('civilian')}
            className={`py-2 rounded-lg transition ${
              activeTab === 'civilian'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            👥 Citizen
          </button>
          <button
            onClick={() => setActiveTab('crew')}
            className={`py-2 rounded-lg transition ${
              activeTab === 'crew'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🚑 Crew
          </button>
          <button
            onClick={() => setActiveTab('evaluator')}
            className={`py-2 rounded-lg transition ${
              activeTab === 'evaluator'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Demo
          </button>
        </div>

        {/* Officer Tab */}
        {activeTab === 'officer' && (
          <form onSubmit={handleAuthorizeOfficer} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Command Wing</label>
              <select
                value={selectedWing}
                onChange={(e) => setSelectedWing(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="NDRF Tactical Lead">NDRF Tactical Lead</option>
                <option value="SDRF Disaster Commander">SDRF Disaster Commander</option>
                <option value="EMS Trauma Dispatcher">EMS Trauma Dispatcher</option>
                <option value="Civil Defense Coordinator">Civil Defense Coordinator</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Badge ID</label>
              <input
                type="text"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Enter Tactical Command Center
            </button>
          </form>
        )}

        {/* Civilian Tab */}
        {activeTab === 'civilian' && (
          <div className="space-y-4">
            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3.5 text-xs text-slate-200 space-y-1.5">
              <p className="font-bold text-emerald-300">Public Citizen Access</p>
              <p className="text-slate-400 leading-relaxed">
                Open to all citizens and flood evacuees. View verified high-ground evacuation paths, nearby safe hospitals, and 1-touch emergency SOS lines.
              </p>
            </div>
            <button
              onClick={handleAuthorizeCivilian}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Switch to Citizen Safety Portal
            </button>
          </div>
        )}

        {/* Crew Tab */}
        {activeTab === 'crew' && (
          <div className="space-y-4">
            <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3.5 text-xs text-slate-200 space-y-1.5">
              <p className="font-bold text-amber-300">Fleet In-Cab Tablet Console</p>
              <p className="text-slate-400 leading-relaxed">
                Terminal for ambulance drivers and rescue boat operators with turn-by-turn guidance, live speedometers, and 1-tap roadblock reporting.
              </p>
            </div>
            <button
              onClick={handleAuthorizeCrew}
              className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Launch Driver Navigation Terminal
            </button>
          </div>
        )}

        {/* Evaluator Tab */}
        {activeTab === 'evaluator' && (
          <div className="space-y-4">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">Direct Evaluator Clearance</p>
              <p className="text-slate-400">
                Hackathon evaluators, jury members, and guests can launch full telemetry with all features unlocked.
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Evaluator Call Sign</label>
              <input
                type="text"
                value={evaluatorName}
                onChange={(e) => setEvaluatorName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <button
              onClick={handleAuthorizeEvaluator}
              className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Open Simulation &amp; Engineering Lab
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
