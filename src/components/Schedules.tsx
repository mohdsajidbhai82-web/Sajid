import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Clock, 
  Tablet, 
  Gamepad, 
  ShieldCheck, 
  Bolt, 
  Plus, 
  Settings, 
  Trash2, 
  Check, 
  Edit,
  Sliders,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProviderState, Device } from '../types';

interface SchedulesProps {
  providerState: ProviderState;
  provider: 'airtel' | 'jio';
  onUpdateState: (newState: Partial<ProviderState>) => void;
}

export default function Schedules({
  providerState,
  provider,
  onUpdateState
}: SchedulesProps) {
  const [showAddParental, setShowAddParental] = useState(false);
  const [showBoostConfig, setShowBoostConfig] = useState(false);

  // States for new parental restriction
  const [selectedParentalDevice, setSelectedParentalDevice] = useState<string>('');
  const [parentalBlockTime, setParentalBlockTime] = useState<string>('20:00');
  const [parentalQuotaLimit, setParentalQuotaLimit] = useState<string>('2 Hours');

  const brandColor = provider === 'airtel' ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500';
  const brandTextColor = provider === 'airtel' ? 'text-red-600' : 'text-indigo-600';
  const brandGradient = provider === 'airtel' ? 'from-red-600 to-rose-500' : 'from-indigo-600 to-blue-500';

  // Toggle sleep mode enabled
  const toggleSleepMode = () => {
    onUpdateState({
      sleepMode: {
        ...providerState.sleepMode,
        enabled: !providerState.sleepMode.enabled
      }
    });
  };

  // Change FROM or UNTIL times
  const handleSleepTimeChange = (field: 'from' | 'until', value: string) => {
    onUpdateState({
      sleepMode: {
        ...providerState.sleepMode,
        [field]: value
      }
    });
  };

  // Toggle day in repeating days
  const toggleRepeatDay = (day: string) => {
    const currentDays = providerState.sleepMode.repeatDays;
    const isAlreadySelected = currentDays.includes(day);
    let updatedDays = [];

    if (isAlreadySelected) {
      updatedDays = currentDays.filter(d => d !== day);
    } else {
      // Keep order M T W T F S S
      const daysOrder = ["M", "T", "W", "T", "F", "S", "S"];
      const candidateDays = [...currentDays, day];
      updatedDays = daysOrder.filter(d => candidateDays.includes(d));
    }

    onUpdateState({
      sleepMode: {
        ...providerState.sleepMode,
        repeatDays: updatedDays
      }
    });
  };

  // Add Parental control block submit
  const handleAddParentalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParentalDevice) return;

    const targetDevice = providerState.devices.find(d => d.id === selectedParentalDevice);
    if (!targetDevice) return;

    const updatedDevices = providerState.devices.map(d => {
      if (d.id === selectedParentalDevice) {
        return {
          ...d,
          scheduleBlockTime: `Blocks at ${parentalBlockTime}`,
          usageLimitReached: parentalQuotaLimit.includes("Reached") || parentalQuotaLimit.includes("Limit") ? true : undefined
        };
      }
      return d;
    });

    onUpdateState({ devices: updatedDevices });
    setShowAddParental(false);
  };

  // Remove restriction
  const removeRestriction = (deviceId: string) => {
    const updatedDevices = providerState.devices.map(d => {
      if (d.id === deviceId) {
        const copy = { ...d };
        delete copy.scheduleBlockTime;
        delete copy.usageLimitReached;
        return copy;
      }
      return d;
    });
    onUpdateState({ devices: updatedDevices });
  };

  // Toggle Smart Boost
  const toggleSmartBoost = () => {
    onUpdateState({
      smartBoost: {
        ...providerState.smartBoost,
        enabled: !providerState.smartBoost.enabled
      }
    });
  };

  // Select priority hardware devices for smart boost
  const toggleBoostDevice = (id: string) => {
    const current = providerState.smartBoost.priorityDevices;
    const updated = current.includes(id) 
      ? current.filter(dId => dId !== id) 
      : [...current, id];

    onUpdateState({
      smartBoost: {
        ...providerState.smartBoost,
        priorityDevices: updated,
        configured: updated.length > 0
      }
    });
  };

  // Filter devices with active limits
  const restrictedDevices = providerState.devices.filter(d => d.scheduleBlockTime || d.usageLimitReached);

  return (
    <div className="space-y-6 pb-24">
      {/* Network Automation description header */}
      <section className="space-y-1">
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Broadband Schedule Controls</h2>
        <p className="text-slate-500 text-xs">Automate router shutdowns, child filters, and high-performance bandwidth slots.</p>
      </section>

      {/* Sleep Mode Card */}
      <section className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm relative overflow-hidden">
        {/* Sleeping crescent moon absolute backdrop */}
        <div className="absolute top-4 right-4 text-slate-50 opacity-10 scale-[3.5] pointer-events-none">
          <Moon className="w-12 h-12 fill-slate-300" />
        </div>

        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${brandTextColor} bg-slate-50`}>
              <Moon className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Eco Sleep Mode</h3>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block mt-0.5">
                Reduces EMF emissions & saves power
              </span>
            </div>
          </div>

          <button
            onClick={toggleSleepMode}
            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              providerState.sleepMode.enabled ? (provider === 'airtel' ? 'bg-red-600' : 'bg-indigo-600') : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                providerState.sleepMode.enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Time hour input controls */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">FROM</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
              <Clock className="w-4 h-4 text-slate-400" />
              <input
                type="time"
                disabled={!providerState.sleepMode.enabled}
                value={providerState.sleepMode.from}
                onChange={(e) => handleSleepTimeChange('from', e.target.value)}
                className="bg-transparent border-none p-0 text-sm font-bold text-slate-800 focus:outline-none focus:ring-0 w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1.5">UNTIL</label>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 p-3 rounded-2xl">
              <Sun className="w-4 h-4 text-slate-400" />
              <input
                type="time"
                disabled={!providerState.sleepMode.enabled}
                value={providerState.sleepMode.until}
                onChange={(e) => handleSleepTimeChange('until', e.target.value)}
                className="bg-transparent border-none p-0 text-sm font-bold text-slate-800 focus:outline-none focus:ring-0 w-full"
              />
            </div>
          </div>
        </div>

        {/* Repeat days pills */}
        <div className="space-y-2">
          <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">REPEAT ON</label>
          <div className="flex justify-between gap-1.5">
            {["M", "T", "W", "T", "F", "S", "S"].map((day, idx) => {
              const isSelected = providerState.sleepMode.repeatDays.includes(day);
              return (
                <button
                  key={idx}
                  disabled={!providerState.sleepMode.enabled}
                  onClick={() => toggleRepeatDay(day)}
                  className={`w-9 h-9 rounded-full font-bold text-xs transition-all flex items-center justify-center border ${
                    isSelected 
                      ? (provider === 'airtel' ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-indigo-600 border-indigo-600 text-white shadow-md')
                      : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  } disabled:opacity-40`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Parental Controls Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">Active Family Protections</h3>
            <span className="text-[10px] text-slate-400 font-bold block">Assign custom schedules to children hardware</span>
          </div>

          <button
            onClick={() => setShowAddParental(true)}
            className={`text-xs font-extrabold flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-100 hover:border-slate-200 rounded-xl transition-all ${brandTextColor}`}
          >
            <Plus className="w-4 h-4" />
            Restrict Device
          </button>
        </div>

        {/* List of active parent rules */}
        <div className="space-y-3">
          {restrictedDevices.length > 0 ? (
            restrictedDevices.map(device => (
              <div 
                key={device.id} 
                className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 border border-slate-100">
                    {device.type === 'tablet' ? <Tablet className="w-5 h-5" /> : <Gamepad className="w-5 h-5" />}
                  </div>
                  <div>
                    <h5 className="text-sm font-extrabold text-slate-800">{device.name}</h5>
                    <div className="flex items-center gap-2 mt-1.5">
                      {device.scheduleBlockTime && (
                        <span className="text-[9px] font-extrabold bg-rose-50 text-rose-600 border border-rose-100 px-2 py-0.5 rounded-full">
                          🛡 {device.scheduleBlockTime}
                        </span>
                      )}
                      {device.usageLimitReached && (
                        <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full">
                          ⏱ Quota Limit: 2 hrs max
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => removeRestriction(device.id)}
                  title="Remove restriction"
                  className="p-2 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-red-500 border border-slate-100 hover:border-rose-100 rounded-xl transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          ) : (
            <div className="border border-dashed border-slate-200 rounded-2xl py-8 text-center text-slate-400 text-xs font-medium">
              No devices currently scheduled or restricted.
            </div>
          )}
        </div>
      </section>

      {/* Atmospheric Smart Boost Card */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-lg">
        <div className="absolute right-0 top-0 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-950 text-indigo-400 rounded-xl border border-indigo-900/30">
              <Bolt className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                Intelligent Smart Boost
                {providerState.smartBoost.enabled && (
                  <span className="text-[9px] bg-indigo-500 text-white font-extrabold px-1.5 py-0.5 rounded-md flex items-center gap-0.5 animate-pulse">
                    <Sparkles className="w-2.5 h-2.5" />
                    Priority Active
                  </span>
                )}
              </h4>
              <p className="text-[10px] text-slate-400 mt-0.5">Priority routing schedules for home office or gaming</p>
            </div>
          </div>

          <button
            onClick={toggleSmartBoost}
            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              providerState.smartBoost.enabled ? 'bg-indigo-500' : 'bg-slate-800'
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 ${
                providerState.smartBoost.enabled ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed mb-5">
          Priority-boost channels allocate dedicated bandwidth bandwidth and reduce latency on selected hardware nodes during critical workloads.
        </p>

        <div className="flex justify-between items-center border-t border-slate-800/80 pt-4">
          <div className="text-slate-400 text-[10px] font-bold">
            {providerState.smartBoost.priorityDevices.length > 0 
              ? `${providerState.smartBoost.priorityDevices.length} Priority node(s) configured` 
              : 'No priority devices configured'}
          </div>

          <button
            onClick={() => setShowBoostConfig(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all shadow-md"
          >
            Configure Nodes
          </button>
        </div>
      </section>

      {/* Parental Restriction Add Dialog */}
      <AnimatePresence>
        {showAddParental && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowAddParental(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-slate-950 text-lg">Restrict Device Access</h3>
                <button onClick={() => setShowAddParental(false)} className="text-slate-400 hover:text-slate-600">
                  <Clock className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddParentalSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Device</label>
                  <select
                    value={selectedParentalDevice}
                    onChange={(e) => setSelectedParentalDevice(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="">-- Choose Hardware --</option>
                    {providerState.devices.filter(d => !d.isBlocked && !d.scheduleBlockTime).map(d => (
                      <option key={d.id} value={d.id}>{d.name} ({d.type})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Daily Bedtime</label>
                    <input
                      type="time"
                      value={parentalBlockTime}
                      onChange={(e) => setParentalBlockTime(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Quota Limit</label>
                    <select
                      value={parentalQuotaLimit}
                      onChange={(e) => setParentalQuotaLimit(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none"
                    >
                      <option value="No Limit">No limit</option>
                      <option value="1 Hour">1 hr / day</option>
                      <option value="2 Hours">2 hrs / day</option>
                      <option value="3 Hours">3 hrs / day</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!selectedParentalDevice}
                  className={`w-full text-white font-bold py-3 rounded-xl text-xs transition-all ${brandColor}`}
                >
                  Save Restrictive Policy
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Smart Boost Configure Dialog */}
      <AnimatePresence>
        {showBoostConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowBoostConfig(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-slate-950 text-lg flex items-center gap-1.5">
                  <Sliders className="w-5 h-5 text-indigo-600" />
                  Select Boost Hardware
                </h3>
                <button onClick={() => setShowBoostConfig(false)} className="text-slate-400 hover:text-slate-600">
                  <Sliders className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                Check devices to grant high-speed stream priority. Priority devices receive optimal routing.
              </p>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto mb-5 pr-1">
                {providerState.devices.filter(d => !d.isBlocked).map(device => {
                  const isChecked = providerState.smartBoost.priorityDevices.includes(device.id);
                  return (
                    <button
                      key={device.id}
                      type="button"
                      onClick={() => toggleBoostDevice(device.id)}
                      className={`w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all ${
                        isChecked 
                          ? 'border-indigo-500 bg-indigo-50/50' 
                          : 'border-slate-100 hover:border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <span className="text-xs font-extrabold text-slate-800 block">{device.name}</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">{device.type}</span>
                      </div>

                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300'
                      }`}>
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setShowBoostConfig(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all"
              >
                Done configuring
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
