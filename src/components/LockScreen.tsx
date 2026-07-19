import React, { useState, useEffect } from 'react';
import { Shield, Lock, Fingerprint, RefreshCw, Plus, Trash2, KeyRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface UserProfile {
  id: string;
  name: string;
  role: 'Owner' | 'Admin' | 'Guest';
  pin: string;
  avatarColor: string;
}

interface LockScreenProps {
  onUnlock: (profile: UserProfile, provider: 'airtel' | 'jio') => void;
  initialProvider: 'airtel' | 'jio';
}

export default function LockScreen({ onUnlock, initialProvider }: LockScreenProps) {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem('fiber_profiles');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return [
      { id: '1', name: 'Sajid Admin', role: 'Owner', pin: '0000', avatarColor: 'bg-red-500' },
      { id: '2', name: 'Family Room', role: 'Guest', pin: '1234', avatarColor: 'bg-indigo-500' }
    ];
  });

  const [activeTab, setActiveTab] = useState<'select' | 'create'>('select');
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<boolean>(false);
  const [selectedProvider, setSelectedProvider] = useState<'airtel' | 'jio'>(initialProvider);

  // Profile creation states
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileRole, setNewProfileRole] = useState<'Owner' | 'Admin' | 'Guest'>('Guest');
  const [newProfilePin, setNewProfilePin] = useState('');
  const [newProfileColor, setNewProfileColor] = useState('bg-teal-500');

  useEffect(() => {
    localStorage.setItem('fiber_profiles', JSON.stringify(profiles));
  }, [profiles]);

  const handleProfileSelect = (p: UserProfile) => {
    setSelectedProfile(p);
    setPinInput('');
    setPinError(false);
  };

  const handleKeyPress = (num: string) => {
    if (pinInput.length < 4) {
      const nextInput = pinInput + num;
      setPinInput(nextInput);
      setPinError(false);

      if (nextInput.length === 4) {
        if (selectedProfile && nextInput === selectedProfile.pin) {
          // Success!
          setTimeout(() => {
            onUnlock(selectedProfile, selectedProvider);
          }, 300);
        } else {
          // Incorrect PIN
          setTimeout(() => {
            setPinError(true);
            setPinInput('');
          }, 200);
        }
      }
    }
  };

  const handleDelete = () => {
    setPinInput(prev => prev.slice(0, -1));
  };

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProfileName.trim() || newProfilePin.length !== 4) return;

    const newProfile: UserProfile = {
      id: Date.now().toString(),
      name: newProfileName,
      role: newProfileRole,
      pin: newProfilePin,
      avatarColor: newProfileColor
    };

    setProfiles(prev => [...prev, newProfile]);
    setNewProfileName('');
    setNewProfilePin('');
    setActiveTab('select');
    setSelectedProfile(newProfile);
  };

  const removeProfile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (profiles.length <= 1) return;
    setProfiles(prev => prev.filter(p => p.id !== id));
    if (selectedProfile?.id === id) {
      setSelectedProfile(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden text-white font-sans">
      {/* Dynamic atmospheric background glow */}
      <div className={`absolute top-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full opacity-30 blur-[150px] transition-colors duration-1000 ${selectedProvider === 'airtel' ? 'bg-red-600' : 'bg-indigo-600'}`} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900 rounded-full opacity-25 blur-[120px]" />

      <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 relative z-10">
        
        {/* Network Selection Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-slate-950/60 p-1 rounded-full border border-slate-800 flex items-center">
            <button
              onClick={() => setSelectedProvider('airtel')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                selectedProvider === 'airtel' 
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-200 animate-ping" />
              Airtel Fiber
            </button>
            <button
              onClick={() => setSelectedProvider('jio')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-2 ${
                selectedProvider === 'jio' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-200 animate-ping" />
              Jio Fiber
            </button>
          </div>
        </div>

        {/* Security Title header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-slate-800/80 border border-slate-700 rounded-2xl mb-3 text-emerald-400 shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Security Portal</h1>
          <p className="text-slate-400 text-xs mt-1">Fiber Management Secure Access Layer</p>
        </div>

        {/* Sub-tabs: Select Profile or Add New */}
        <div className="grid grid-cols-2 bg-slate-950/40 p-1 rounded-xl border border-slate-800/80 mb-6">
          <button
            onClick={() => { setActiveTab('select'); setSelectedProfile(profiles[0]); }}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'select' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Select Profile
          </button>
          <button
            onClick={() => setActiveTab('create')}
            className={`py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'create' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Profile
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'select' ? (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              {/* Profile Avatars Scroll */}
              <div className="flex gap-4 overflow-x-auto py-2 px-1 w-full max-w-full justify-center no-scrollbar mb-6">
                {profiles.map((p) => {
                  const isActive = selectedProfile?.id === p.id;
                  return (
                    <div
                      key={p.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleProfileSelect(p)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleProfileSelect(p);
                        }
                      }}
                      className={`relative flex flex-col items-center p-3 rounded-2xl border transition-all duration-300 min-w-[80px] shrink-0 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                        isActive 
                          ? 'border-emerald-500 bg-slate-800/40 scale-105 shadow-md shadow-emerald-500/5' 
                          : 'border-slate-800 bg-slate-950/20 hover:border-slate-700'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-full ${p.avatarColor} flex items-center justify-center font-bold text-lg text-white shadow-inner relative`}>
                        {p.name.charAt(0).toUpperCase()}
                        {p.role === 'Owner' && (
                          <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5 text-[8px] text-black font-extrabold shadow">
                            👑
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold mt-2 truncate max-w-[70px] text-slate-200">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-slate-400 tracking-wider">
                        {p.role}
                      </span>

                      {/* Remove Profile button (if more than 1 exist) */}
                      {profiles.length > 1 && (
                        <button
                          onClick={(e) => removeProfile(p.id, e)}
                          className="absolute -top-1.5 -right-1.5 bg-slate-800 hover:bg-red-950 hover:text-red-400 p-1 rounded-full border border-slate-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {selectedProfile && (
                <div className="w-full flex flex-col items-center">
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs mb-4">
                    <Lock className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                    Enter PIN for <span className="font-bold text-slate-200">{selectedProfile.name}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded ml-1">default: {selectedProfile.pin}</span>
                  </div>

                  {/* PIN Display Dots */}
                  <div className="flex gap-4 mb-6">
                    {[0, 1, 2, 3].map((index) => {
                      const hasValue = pinInput.length > index;
                      return (
                        <motion.div
                          key={index}
                          animate={pinError ? { x: [0, -10, 10, -10, 10, 0] } : {}}
                          transition={{ duration: 0.4 }}
                          className={`w-4.5 h-4.5 rounded-full border-2 transition-all ${
                            hasValue 
                              ? pinError 
                                ? 'bg-red-500 border-red-500' 
                                : 'bg-emerald-400 border-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.4)]'
                              : 'border-slate-700 bg-slate-950/40'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {pinError && (
                    <span className="text-red-400 text-xs font-semibold mb-4 animate-bounce">
                      Incorrect PIN. Please try again.
                    </span>
                  )}

                  {/* Security PIN Pad Grid */}
                  <div className="grid grid-cols-3 gap-3 w-full max-w-[280px]">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleKeyPress(num)}
                        className="h-14 bg-slate-800/40 border border-slate-800/80 rounded-2xl text-xl font-bold hover:bg-slate-800 hover:border-slate-700 active:scale-95 transition-all text-white/90 shadow-sm"
                      >
                        {num}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        // Simulated Biometric unlock
                        if (selectedProfile) {
                          setPinInput(selectedProfile.pin);
                          setTimeout(() => {
                            onUnlock(selectedProfile, selectedProvider);
                          }, 300);
                        }
                      }}
                      className="h-14 bg-slate-950/40 hover:bg-emerald-950/20 hover:text-emerald-400 rounded-2xl flex items-center justify-center border border-slate-800/60 active:scale-95 transition-all text-slate-400"
                      title="Simulate Fingerprint Authentication"
                    >
                      <Fingerprint className="w-6 h-6" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleKeyPress('0')}
                      className="h-14 bg-slate-800/40 border border-slate-800/80 rounded-2xl text-xl font-bold hover:bg-slate-800 active:scale-95 transition-all text-white/90 shadow-sm"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="h-14 bg-slate-950/40 hover:bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-800/60 active:scale-95 transition-all text-slate-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.form
              key="create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleCreateProfile}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Profile Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sajid Bhai, Guest PC"
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Access Level
                  </label>
                  <select
                    value={newProfileRole}
                    onChange={(e) => setNewProfileRole(e.target.value as any)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-3 text-xs focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none text-slate-200"
                  >
                    <option value="Guest">Guest (Read Only)</option>
                    <option value="Admin">Admin (Control)</option>
                    <option value="Owner">Owner (All Rights)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Secure 4-Digit PIN
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    pattern="[0-9]{4}"
                    required
                    placeholder="4 numbers"
                    value={newProfilePin}
                    onChange={(e) => setNewProfilePin(e.target.value.replace(/[^0-9]/g, ''))}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm tracking-widest text-center focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Theme Color
                </label>
                <div className="flex gap-3 justify-center">
                  {[
                    'bg-red-500', 'bg-indigo-500', 'bg-teal-500', 
                    'bg-amber-500', 'bg-emerald-500', 'bg-purple-500'
                  ].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewProfileColor(color)}
                      className={`w-8 h-8 rounded-full ${color} border-2 transition-all ${
                        newProfileColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={!newProfileName.trim() || newProfilePin.length !== 4}
                className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 mt-4"
              >
                <Plus className="w-4 h-4" />
                Register Secure Profile
              </button>
            </motion.form>
          )}
        </AnimatePresence>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center flex items-center justify-center gap-1.5 text-[11px] text-slate-500 font-mono">
          <Shield className="w-3.5 h-3.5 text-slate-600" />
          <span>Airtel/Jio Router Firewall Active</span>
        </div>
      </div>
    </div>
  );
}
