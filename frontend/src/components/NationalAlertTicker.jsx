import React, { useState, useEffect } from 'react';
import { AlertCircle, Radio, Satellite, Volume2, VolumeX, ShieldAlert } from 'lucide-react';

export default function NationalAlertTicker({ currentRegion = 'lucknow', disasterType = 'flood' }) {
  const [currentAlertIdx, setCurrentAlertIdx] = useState(0);
  const [isLive, setIsLive] = useState(true);

  const alerts = [
    {
      level: 'RED',
      city: 'Delhi NCR',
      text: 'Yamuna River crossed critical warning level (205.53m) at Old Railway Bridge • Ring Road lowlands evacuated'
    },
    {
      level: 'AMBER',
      city: 'Lucknow',
      text: 'Gomti Barrage sluice gates raised to Level 4 • Low-lying bypass closed for civilian transport • Emergency corridor active'
    },
    {
      level: 'AMBER',
      city: 'Prayagraj',
      text: 'Triveni Sangam flood surge discharge at 52,000 cusecs • Daraganj and Phaphamau lowlands under active SDRF boat watch'
    },
    {
      level: 'YELLOW',
      city: 'Dehradun',
      text: 'Himalayan foothill mudflow advisory along Mussoorie-Dehradun link • Rapid Response units staged at Clock Tower'
    },
    {
      level: 'GREEN',
      city: 'National',
      text: 'SGPGI, AIIMS Delhi & SRN Hospital emergency casualty wings operating with pre-reserved trauma bed telemetry'
    }
  ];

  // Auto-cycle alerts every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAlertIdx((prev) => (prev + 1) % alerts.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [alerts.length]);

  const activeAlert = alerts[currentAlertIdx];
  const badgeColor =
    activeAlert.level === 'RED'
      ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
      : activeAlert.level === 'AMBER'
      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
      : activeAlert.level === 'YELLOW'
      ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40'
      : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

  return (
    <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-1.5 flex items-center justify-between text-xs text-slate-300 select-none shadow-inner overflow-hidden">
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 hidden sm:inline">
            CWC / NDMA LIVE FEED
          </span>
        </div>

        <div className="h-3.5 w-px bg-slate-800 shrink-0 hidden sm:block" />

        {/* Cycling Alert Message */}
        <div className="flex items-center gap-2 min-w-0 flex-1 truncate">
          <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border shrink-0 ${badgeColor}`}>
            {activeAlert.city} • {activeAlert.level}
          </span>
          <span className="text-xs text-slate-200 truncate font-medium">
            {activeAlert.text}
          </span>
        </div>
      </div>

      {/* Satellite Telemetry Sync Status */}
      <div className="flex items-center gap-3 shrink-0 text-[11px] text-slate-400 font-mono hidden md:flex pl-3 border-l border-slate-800/80">
        <div className="flex items-center gap-1 text-cyan-400">
          <Satellite className="w-3.5 h-3.5 animate-pulse" />
          <span>INSAT-3DR SYNC</span>
        </div>
        <span className="text-slate-500">•</span>
        <span className="text-slate-400">LATENCY: <strong className="text-slate-200">18ms</strong></span>
      </div>
    </div>
  );
}
