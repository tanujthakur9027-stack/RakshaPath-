import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, FastForward, CloudRain, Waves, Clock } from 'lucide-react';

export default function TimeSlider({
  currentTime = 0.0,
  maxHours = 6.0,
  weatherInfo = { rain_mm_h: 65, surge_m: 1.2 },
  onTimeChange,
  onAdvanceHour,
  onResetTime,
}) {
  const [isPlaying, setIsPlaying] = useState(false);

  // Auto-play interval
  useEffect(() => {
    let interval = null;
    if (isPlaying) {
      interval = setInterval(() => {
        if (currentTime >= maxHours) {
          setIsPlaying(false);
        } else {
          onTimeChange(Math.min(maxHours, Number((currentTime + 1.0).toFixed(1))));
        }
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentTime, maxHours, onTimeChange]);

  return (
    <div className="glass-panel px-4 py-2.5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Playback Controls & Current Time Badge */}
      <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2 rounded-xl transition-all ${
              isPlaying
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800/80 text-cyan-400 hover:bg-slate-700/80'
            }`}
            title={isPlaying ? 'Pause Simulation' : 'Auto-Play Projection'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={() => onAdvanceHour(1.0)}
            disabled={currentTime >= maxHours}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-200 hover:bg-cyan-950 hover:text-cyan-400 border border-slate-700/50 disabled:opacity-40 transition-all"
            title="Step Forward +1 Hour"
          >
            <FastForward className="w-4 h-4" />
          </button>

          <button
            onClick={onResetTime}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:bg-slate-700/80 hover:text-slate-200 transition-all"
            title="Reset to T+0h"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Time display indicator */}
        <div className="flex items-center space-x-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-slate-800">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="font-mono font-bold text-sm text-white">
            T+{currentTime.toFixed(1)}h
          </span>
          <span className="text-[10px] uppercase font-semibold text-slate-400">
            {currentTime === 0 ? 'Now' : 'Projected'}
          </span>
        </div>
      </div>

      {/* Scrubbable Range Slider */}
      <div className="flex-1 w-full px-2">
        <div className="relative flex items-center">
          <input
            type="range"
            min="0"
            max={maxHours}
            step="1"
            value={currentTime}
            onChange={(e) => onTimeChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>

        {/* Hour Notch Ticks */}
        <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1.5 px-0.5">
          <span>0h (Now)</span>
          <span>+1h</span>
          <span>+2h</span>
          <span>+3h</span>
          <span>+4h</span>
          <span>+5h</span>
          <span>+6h (Peak)</span>
        </div>
      </div>

      {/* Flood Impact Telemetry Metrics */}
      <div className="flex items-center space-x-3 text-xs w-full md:w-auto justify-end">
        <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
          <CloudRain className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-slate-400">Rain:</span>
          <span className="font-mono font-bold text-blue-300">{weatherInfo.rain_mm_h} mm/h</span>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-slate-800">
          <Waves className="w-3.5 h-3.5 text-rose-400" />
          <span className="text-slate-400">River Surge:</span>
          <span className="font-mono font-bold text-rose-300">+{weatherInfo.surge_m.toFixed(2)} m</span>
        </div>
      </div>
    </div>
  );
}
