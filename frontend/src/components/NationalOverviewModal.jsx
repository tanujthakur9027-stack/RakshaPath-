import React, { useState } from 'react';
import {
  Globe,
  Waves,
  Shield,
  Activity,
  ArrowRight,
  MapPin,
  Building2,
  Truck,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Compass,
} from 'lucide-react';

export default function NationalOverviewModal({
  isOpen = false,
  onClose,
  nationalOverview = [],
  currentRegion = 'prayagraj',
  onSelectRegion,
}) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filteredRegions = (nationalOverview || []).filter((r) => {
    const term = searchTerm.toLowerCase();
    return (
      (r.name || '').toLowerCase().includes(term) ||
      (r.state || '').toLowerCase().includes(term) ||
      (r.basin || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-950">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-lg text-white">
                  Pan-India National Flood Command Center
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                  All-India Grid
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Predictive Emergency Dispatch across India's Major River Basins &amp; Coastal Floodplains
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* National Telemetry Bar & Search */}
        <div className="p-6 bg-slate-950/40 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4 text-xs font-mono">
            <div className="flex items-center space-x-1.5 text-cyan-300">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span><b>7 Active Regions</b> Covered</span>
            </div>
            <div className="h-4 w-[1px] bg-slate-800" />
            <div className="flex items-center space-x-1.5 text-rose-300">
              <Waves className="w-4 h-4 text-rose-400" />
              <span>Monsoon Alert Level: <b>HIGH</b></span>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search city, state, or river basin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Region Cards Grid */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRegions.map((reg) => {
              const isSelected = currentRegion === reg.id;
              const isCritical = (reg.alert_level || '').includes('Critical') || (reg.alert_level || '').includes('Severe');

              return (
                <div
                  key={reg.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-slate-850 border-cyan-500 shadow-lg shadow-cyan-950/60 ring-2 ring-cyan-500/40'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
                  }`}
                >
                  <div>
                    {/* Card Header: Region & State */}
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="font-bold text-sm text-white">{reg.name}</h4>
                          {reg.pilot_ready && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                              Pilot HQ
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {reg.state} • {reg.basin}
                        </span>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          isCritical
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                        }`}
                      >
                        {reg.alert_level?.split(' ')[0] || 'WATCH'}
                      </span>
                    </div>

                    {/* Flood Telemetry Details */}
                    <div className="space-y-1.5 my-3 text-xs font-mono bg-slate-900/90 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="flex justify-between">
                        <span className="text-slate-400">River Height:</span>
                        <span className="text-slate-200 font-bold">{reg.river_level}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Surge Trend:</span>
                        <span className="text-amber-400 font-bold">{reg.surge_trend}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Terrain Risk:</span>
                        <span className="text-cyan-300 text-[11px] truncate max-w-[150px]">
                          {reg.vulnerability}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Deploy Button */}
                  <button
                    onClick={() => {
                      onSelectRegion(reg.id);
                      onClose();
                    }}
                    className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all mt-2 ${
                      isSelected
                        ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
                    }`}
                  >
                    <span>{isSelected ? 'Currently Active Grid' : 'Deploy Command & Routing'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
