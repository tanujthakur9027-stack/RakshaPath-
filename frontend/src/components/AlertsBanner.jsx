import React from 'react';
import { AlertTriangle, ShieldAlert, ArrowRight, CheckCircle2, X } from 'lucide-react';

export default function AlertsBanner({ alerts = [], isOpen = false, onClose, onSelectIncidentById }) {
  if (!isOpen && alerts.length === 0) return null;

  return (
    <div
      className={`fixed top-16 right-5 z-50 max-w-md w-full transition-all duration-300 transform ${
        isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
      }`}
    >
      <div className="glass-panel-elevated p-4 rounded-2xl border border-rose-800/80 shadow-2xl space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center space-x-2 text-rose-400">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
            <h3 className="font-bold text-sm text-white">Active Operational Alerts</h3>
            <span className="text-xs bg-rose-950 text-rose-300 px-2 py-0.5 rounded-full font-mono border border-rose-800">
              {alerts.length}
            </span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-80 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="text-center py-4 text-xs text-slate-400 flex items-center justify-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All active dispatches operating on nominal high-reliability routes.</span>
            </div>
          ) : (
            (Array.isArray(alerts) ? alerts : []).map((alert, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-950/80 border border-rose-900/60 hover:border-rose-700 transition-all text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-300 font-mono">
                    {alert.incident_id || 'ROUTE ALERT'}
                  </span>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-rose-950 text-rose-400 border border-rose-800">
                    {alert.type || 'DEGRADED_ROUTE'}
                  </span>
                </div>

                <p className="text-slate-300 leading-snug">{alert.message}</p>

                {alert.old_reliability !== undefined && alert.new_reliability !== undefined && (
                  <div className="flex items-center space-x-2 font-mono text-[11px] pt-1">
                    <span className="text-slate-400">Reliability:</span>
                    <span className="text-emerald-400">
                      {Math.round(alert.old_reliability * 100)}%
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                    <span className="text-rose-400 font-bold">
                      {Math.round(alert.new_reliability * 100)}%
                    </span>
                  </div>
                )}

                {alert.switched_to_backup && (
                  <div className="bg-cyan-950/60 border border-cyan-800/80 rounded px-2 py-1 text-[11px] text-cyan-300 font-medium flex items-center justify-between">
                    <span>Switched to Curzon Backup Route</span>
                    <span className="font-bold text-cyan-200">Active</span>
                  </div>
                )}

                {alert.incident_id && onSelectIncidentById && (
                  <button
                    onClick={() => onSelectIncidentById(alert.incident_id)}
                    className="text-cyan-400 hover:text-cyan-300 text-[11px] font-semibold mt-1 inline-flex items-center"
                  >
                    View in Incident Queue →
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
