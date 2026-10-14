import React, { useState } from 'react';
import {
  Shield,
  Search,
  Crosshair,
  Waves,
  Activity,
  Wind,
  Mountain,
  Users,
  ShieldCheck,
  PhoneCall,
  Radio,
  BookOpen,
  MapPin,
  Trophy
} from 'lucide-react';
import { CITY_PRESETS, NETWORK_NODES } from '../api/embeddedEngine';

export default function Header({
  currentRegion = 'lucknow',
  onSelectCity,
  disasterType = 'flood',
  onSelectDisaster = () => {},
  isCivilianMode = false,
  onToggleMode = () => {},
  onSearchSelect,
  onGeolocate,
  currentRole = 'NDRF Tactical Lead',
  onOpenAuth,
  onOpenSOS,
  onOpenGuide,
  onOpenHackathonPitch = () => {},
  activeView = 'officer',
  onSelectView = () => {}
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Search filtering
  const searchResults = searchQuery.trim().length > 1
    ? Object.entries(NETWORK_NODES).filter(([id, n]) =>
        n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        id.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
    : [];

  const disasters = [
    { id: 'flood', label: 'Flood', icon: Waves, color: 'text-cyan-400' },
    { id: 'earthquake', label: 'Earthquake', icon: Activity, color: 'text-rose-400' },
    { id: 'cyclone', label: 'Cyclone', icon: Wind, color: 'text-amber-400' },
    { id: 'landslide', label: 'Landslide', icon: Mountain, color: 'text-emerald-400' },
  ];

  const viewTabs = [
    { id: 'landing', label: 'Intro / Login' },
    { id: 'officer', label: 'Officer Command' },
    { id: 'citizen', label: 'Citizen Safety' },
    { id: 'crew', label: 'Fleet Terminal' },
    { id: 'simulation', label: 'Simulation Lab' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md px-4 py-2 border-b border-slate-800 flex flex-col gap-2 shadow-xl select-none">
      {/* Top Main Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectView('landing')}
            className="flex items-center gap-2.5 text-left group transition"
            title="Return to Intro Page"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-700 border border-cyan-400/30 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm sm:text-base text-white tracking-tight group-hover:text-cyan-300 transition-colors">
                  RAKSHAPATH <span className="text-xs text-slate-400 font-normal">(रक्षापथ)</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ● 2.0 ONLINE
                </span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium hidden sm:block">
                National Emergency Mobility GIS Network
              </div>
            </div>
          </button>
        </div>

        {/* View Switcher Tabs (Senior Google SDE Multi-Page Architecture) */}
        <nav className="flex items-center bg-slate-900/90 border border-slate-800 p-1 rounded-xl gap-1">
          {viewTabs.map((tab) => {
            const isActive = activeView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectView(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-950'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Search, GPS, Personnel Badge & Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Landmark Search */}
          <div className="relative">
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 w-48 sm:w-64 text-xs text-white focus-within:border-cyan-500">
              <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search landmark, bridge, AIIMS..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                className="bg-transparent border-none outline-none w-full text-xs text-white placeholder-slate-500"
              />
            </div>

            {/* Dropdown Suggestions */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto">
                {searchResults.map(([id, n]) => (
                  <button
                    key={id}
                    onClick={() => {
                      onSearchSelect(id, n);
                      setSearchQuery(n.name);
                      setIsSearchOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-800 border-b border-slate-800 last:border-none flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white truncate">{n.name}</div>
                      <div className="text-[10px] text-slate-400">{n.district}, {n.state} • {n.category}</div>
                    </div>
                    <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* GPS Location Button */}
          <button
            onClick={onGeolocate}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
            title="Locate via GPS"
          >
            <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">My GPS</span>
          </button>

          {/* Personnel Badge */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800/80 text-xs font-semibold transition"
            title="Change Responder Role / Badge"
          >
            <Shield className="w-3.5 h-3.5" />
            <span className="truncate max-w-[120px]">{currentRole}</span>
          </button>

          {/* Hackathon Tour & Pitch Button */}
          <button
            onClick={onOpenHackathonPitch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-amber-300 border border-amber-500/50 text-xs font-bold transition shadow-sm animate-pulse"
            title="Interactive Evaluator Tour & Live Demo Scenarios"
          >
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>🏆 Hackathon Tour</span>
          </button>

          {/* Civilian / Dispatcher Mode Toggle */}
          <button
            onClick={onToggleMode}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
              isCivilianMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 hover:bg-indigo-500/30'
            }`}
          >
            {isCivilianMode ? <Users className="w-3.5 h-3.5 text-emerald-400" /> : <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />}
            <span>{isCivilianMode ? 'Civilian Safety View' : 'Tactical Dispatcher'}</span>
          </button>

          {/* Guide User Manual */}
          <button
            onClick={onOpenGuide}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition"
            title="Operations Manual"
          >
            <BookOpen className="w-4 h-4" />
          </button>

          {/* SOS Hotlines Button */}
          <button
            onClick={onOpenSOS}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg shadow-md transition"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>SOS</span>
          </button>
        </div>
      </div>

      {/* Second Row: City Quick-Jumps & Multi-Disaster Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
        {/* City Quick Jumps */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            City Jump:
          </span>
          {CITY_PRESETS.map((city) => {
            const isSelected = currentRegion === city.id;
            return (
              <button
                key={city.id}
                onClick={() => onSelectCity(city.id)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 transition ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 shadow-md font-bold'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                }`}
              >
                {city.name}
              </button>
            );
          })}
        </div>

        {/* Multi-Disaster Types */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Hazard:
          </span>
          {disasters.map((d) => {
            const Icon = d.icon;
            const isSelected = disasterType === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onSelectDisaster(d.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-slate-800 text-white border border-slate-600 shadow'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${d.color}`} />
                <span>{d.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
