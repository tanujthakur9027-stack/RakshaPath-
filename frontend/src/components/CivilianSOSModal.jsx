import React, { useState } from 'react';
import {
  PhoneCall,
  AlertOctagon,
  X,
  Waves,
  Activity,
  Wind,
  Mountain,
  CheckCircle2,
  ShieldAlert,
  Send
} from 'lucide-react';
import { api } from '../api/client';

export default function CivilianSOSModal({
  isOpen = false,
  onClose = () => {},
  regionId = 'prayagraj',
  disasterType = 'flood',
  onReportSubmitted = () => {}
}) {
  const [selectedHazard, setSelectedHazard] = useState('flooded_road');
  const [description, setDescription] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  if (!isOpen) return null;

  const helplines = [
    { number: '112', title: 'National Emergency Support', desc: 'Police, Fire, Ambulance & NDRF integration' },
    { number: '108', title: 'Emergency Medical Transport', desc: 'Government Ambulance Services' },
    { number: '1078', title: 'NDRF Disaster Helpline', desc: 'Specialized search, rescue & evacuation' },
    { number: '1070', title: 'State Disaster Relief', desc: 'State emergency operations centre' },
  ];

  const hazardOptions = [
    { id: 'flooded_road', label: 'Flooded Road / Deep Water', icon: Waves, color: 'text-cyan-400' },
    { id: 'building_debris', label: 'Collapsed Rubble / Structural Damage', icon: Activity, color: 'text-rose-400' },
    { id: 'fallen_tree', label: 'Fallen Tree / Snapped Power Line', icon: Wind, color: 'text-amber-400' },
    { id: 'landslide', label: 'Landslide / Mountain Rockfall', icon: Mountain, color: 'text-emerald-400' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.sendCivilianSOS({
        region_id: regionId,
        lat: 25.441, // default current city center with slight jitter
        lon: 81.865,
        hazard_type: selectedHazard,
        description: description,
        contact_phone: phoneNumber,
        disaster_type: disasterType,
      });
      setSubmittedSuccess(true);
      setTimeout(() => {
        onReportSubmitted();
        onClose();
        setSubmittedSuccess(false);
        setDescription('');
      }, 1600);
    } catch (err) {
      console.error('Failed to submit civilian SOS:', err);
      // Fallback close on error
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Emergency Assistance &amp; Hazard Reporting</h3>
              <p className="text-xs text-slate-400">Official National Disaster Helplines &amp; Citizen Incident Reporting</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Dial Helplines */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Official 24x7 Emergency Helplines (Tap to Call)
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              {helplines.map((h) => (
                <a
                  key={h.number}
                  href={`tel:${h.number}`}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors block text-left group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-bold font-mono text-white group-hover:text-rose-400 transition-colors">
                      {h.number}
                    </span>
                    <PhoneCall className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition-colors" />
                  </div>
                  <div className="text-[11px] font-medium text-slate-300 mt-0.5">{h.title}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">{h.desc}</div>
                </a>
              ))}
            </div>
          </div>

          {/* Report Hazard Section */}
          <div className="border-t border-slate-800 pt-5 space-y-4">
            <div className="space-y-1">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Report Road Obstruction or Threat
              </h4>
              <p className="text-xs text-slate-400">
                Help emergency teams and fellow citizens avoid dangerous corridors.
              </p>
            </div>

            {submittedSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                <h5 className="font-semibold text-sm text-emerald-300">Hazard Report Transmitted</h5>
                <p className="text-xs text-slate-400">
                  Information received by emergency network. Road hazard marked on live map.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Hazard Type Selector */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-medium">Select Hazard Type:</label>
                  <div className="grid grid-cols-2 gap-2">
                    {hazardOptions.map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = selectedHazard === opt.id;
                      return (
                        <button
                          type="button"
                          key={opt.id}
                          onClick={() => setSelectedHazard(opt.id)}
                          className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition-colors ${
                            isSelected
                              ? 'bg-slate-800 border-slate-600 text-white'
                              : 'bg-slate-950/50 border-slate-800/80 text-slate-400 hover:bg-slate-800/40'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${opt.color}`} />
                          <span className="text-xs font-medium leading-tight">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Location Details / Notes:</label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Underpass submerged under 50cm water near bridge approach"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                  />
                </div>

                {/* Contact Phone */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-300 font-medium">Contact Phone (Optional):</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 Mobile number for verification"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-600"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Transmitting...' : 'Submit Citizen Hazard Report'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
