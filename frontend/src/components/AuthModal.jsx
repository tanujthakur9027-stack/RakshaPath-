import React, { useState } from 'react';
import { Shield, UserCheck, Lock, X, CheckCircle2 } from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  currentRole = 'NDRF Tactical Lead',
  onSelectRole,
  isCivilianMode,
  onToggleCivilianMode
}) {
  const [activeTab, setActiveTab] = useState('evaluator'); // 'personnel' | 'evaluator'
  const [badgeId, setBadgeId] = useState('NDRF-7701');
  const [passcode, setPasscode] = useState('RAKSHA2026');
  const [selectedWing, setSelectedWing] = useState(currentRole);
  const [evaluatorName, setEvaluatorName] = useState('Field Evaluator Alpha');

  if (!isOpen) return null;

  const handleAuthorizePersonnel = (e) => {
    e.preventDefault();
    onSelectRole(selectedWing);
    onClose();
  };

  const handleAuthorizeEvaluator = () => {
    onSelectRole(evaluatorName);
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
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl mb-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('evaluator')}
            className={`py-2 rounded-lg transition ${
              activeTab === 'evaluator'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ⚡ Instant Evaluator Access
          </button>
          <button
            onClick={() => setActiveTab('personnel')}
            className={`py-2 rounded-lg transition ${
              activeTab === 'personnel'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🛡️ Official Personnel
          </button>
        </div>

        {/* Evaluator Tab */}
        {activeTab === 'evaluator' && (
          <div className="space-y-4">
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">Direct Evaluator Clearance</p>
              <p className="text-slate-400">
                Hackathon evaluators, field reviewers, and guests can launch tactical operations with full telemetry access immediately.
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
              className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Launch Tactical Operations Directly
            </button>
          </div>
        )}

        {/* Personnel Tab */}
        {activeTab === 'personnel' && (
          <form onSubmit={handleAuthorizePersonnel} className="space-y-3">
            <div>
              <label className="text-xs text-slate-400 block mb-1">Operational Badge / Unit ID</label>
              <input
                type="text"
                value={badgeId}
                onChange={(e) => setBadgeId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Tactical Passcode</label>
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">Command Station / Wing</label>
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

            <button
              type="submit"
              className="w-full py-2.5 mt-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition"
            >
              Authorize & Verify Badge
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
