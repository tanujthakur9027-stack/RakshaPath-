import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Navigation,
  CheckCircle2,
  Clock,
  Gauge,
  ShieldCheck,
  AlertTriangle,
  Volume2,
  VolumeX,
  X,
  Radio
} from 'lucide-react';

export default function MissionSimulationControl({
  routeData,
  vehicleProfile,
  originName = 'Origin',
  destName = 'Destination Hospital',
  onVehiclePositionUpdate,
  onOpenReport
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0.0 to 1.0
  const [currentSpeed, setCurrentSpeed] = useState(48);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [missionCompleted, setMissionCompleted] = useState(false);

  const coords = routeData?.safe_corridor?.coordinates || [];
  const totalDistance = routeData?.safe_corridor?.total_distance_km || 12;
  const totalTimeMin = routeData?.safe_corridor?.estimated_transit_time_min || 15;
  const segments = routeData?.safe_corridor?.segments || [];

  // Play operational radar ping via Web Audio API
  const playTacticalPing = (freq = 880, duration = 0.15) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      // AudioContext not allowed before user interaction
    }
  };

  // Simulation tick loop
  useEffect(() => {
    if (!isPlaying || coords.length < 2) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 0.015;
        if (next >= 1.0) {
          setIsPlaying(false);
          setMissionCompleted(true);
          playTacticalPing(1320, 0.4); // Success chime
          return 1.0;
        }

        // Random speed fluctuation around base speed
        const baseSpeed = vehicleProfile?.base_speed_kmh || 50;
        setCurrentSpeed(Math.round(baseSpeed + (Math.random() * 8 - 4)));

        // Interpolate vehicle GPS position
        const index = Math.floor(next * (coords.length - 1));
        const currentCoord = coords[Math.min(index, coords.length - 1)];
        if (onVehiclePositionUpdate && currentCoord) {
          onVehiclePositionUpdate(currentCoord);
        }

        return next;
      });
    }, 400);

    return () => clearInterval(interval);
  }, [isPlaying, coords, vehicleProfile, onVehiclePositionUpdate]);

  const handleStart = () => {
    if (missionCompleted) {
      setProgress(0);
      setMissionCompleted(false);
    }
    setIsPlaying(true);
    playTacticalPing(660, 0.2);
  };

  const handlePause = () => {
    setIsPlaying(false);
    playTacticalPing(440, 0.15);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
    setMissionCompleted(false);
    if (coords.length > 0 && onVehiclePositionUpdate) {
      onVehiclePositionUpdate(coords[0]);
    }
  };

  // Calculated remaining telemetry
  const distanceRemaining = Math.max(0, Math.round(totalDistance * (1 - progress) * 10) / 10);
  const timeRemainingSec = Math.max(0, Math.round(totalTimeMin * 60 * (1 - progress)));
  const minsRemaining = Math.floor(timeRemainingSec / 60);
  const secsRemaining = timeRemainingSec % 60;

  // Active segment name
  const currentSegIdx = Math.min(
    Math.floor(progress * segments.length),
    segments.length - 1
  );
  const currentSegment = segments[currentSegIdx] || { road_name: 'Elevated Arterial Corridor' };

  if (!routeData || !routeData.safe_corridor) return null;

  return (
    <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl text-white select-none">
      {/* Header with Title & Live Pulse */}
      <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            Live Dispatch Mission Telemetry
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title={soundEnabled ? 'Mute Telemetry Pings' : 'Enable Telemetry Pings'}
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
            missionCompleted
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              : isPlaying
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 animate-pulse'
              : 'bg-slate-800 text-slate-400 border-slate-700'
          }`}>
            {missionCompleted ? 'MISSION ACCOMPLISHED' : isPlaying ? 'VEHICLE EN ROUTE' : 'DISPATCH READY'}
          </span>
        </div>
      </div>

      {/* Progress Bar & Current Leg */}
      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between text-[11px] text-slate-400">
          <span className="truncate max-w-[200px]">
            Leg {currentSegIdx + 1}/{segments.length || 1}: <strong className="text-slate-200">{currentSegment.road_name}</strong>
          </span>
          <span className="font-mono font-bold text-cyan-400">{Math.round(progress * 100)}%</span>
        </div>
        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700/60">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-500 transition-all duration-300 rounded-full"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>

      {/* Telemetry Dashboard Stats */}
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Live Speed</div>
          <div className="text-base font-bold font-mono text-cyan-400">
            {isPlaying ? currentSpeed : vehicleProfile?.base_speed_kmh || 50} <span className="text-[10px] text-slate-400 font-normal">km/h</span>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Remaining Dist</div>
          <div className="text-base font-bold font-mono text-slate-100">
            {distanceRemaining} <span className="text-[10px] text-slate-400 font-normal">km</span>
          </div>
        </div>

        <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-2">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Remaining ETA</div>
          <div className="text-base font-bold font-mono text-emerald-400">
            {minsRemaining}m {secsRemaining}s
          </div>
        </div>
      </div>

      {/* Mission Accomplished Notification Banner */}
      {missionCompleted && (
        <div className="mb-3 p-2 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Safely arrived at <strong>{destName}</strong> • Trauma Bed Verified!</span>
          </div>
          {onOpenReport && (
            <button
              onClick={onOpenReport}
              className="text-[11px] font-bold underline hover:text-white"
            >
              View Mission Brief
            </button>
          )}
        </div>
      )}

      {/* Action Controls Button Strip */}
      <div className="flex items-center gap-2">
        {!isPlaying ? (
          <button
            onClick={handleStart}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-1.5 transition active:scale-[0.99]"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            {progress > 0 && !missionCompleted ? 'Resume Mission Dispatch' : '🚀 Launch Mission Dispatch'}
          </button>
        ) : (
          <button
            onClick={handlePause}
            className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center gap-1.5 transition"
          >
            <Pause className="w-3.5 h-3.5 fill-current" />
            Pause Dispatch
          </button>
        )}

        <button
          onClick={handleReset}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
          title="Reset Mission Tracking"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
