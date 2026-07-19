import React, { useState, useEffect } from 'react';
import { Home, Router, Calendar, MessageSquare, ShieldAlert, Cpu } from 'lucide-react';
import LockScreen from './components/LockScreen';
import ThemeSelector from './components/ThemeSelector';
import Dashboard from './components/Dashboard';
import DevicesManager from './components/DevicesManager';
import Schedules from './components/Schedules';
import AIChatbot from './components/AIChatbot';
import { ProviderState } from './types';

export default function App() {
  // Authentication State
  const [activeProfile, setActiveProfile] = useState<any | null>(null);

  // Selected Provider: 'airtel' or 'jio'
  const [currentProvider, setCurrentProvider] = useState<'airtel' | 'jio'>('airtel');

  // Router Database state synced with backend
  const [providerState, setProviderState] = useState<ProviderState | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<'home' | 'devices' | 'schedule' | 'support'>('home');

  // Reboot status states
  const [rebooting, setRebooting] = useState(false);
  const [rebootSeconds, setRebootSeconds] = useState(0);

  // Sync state with the backend
  const fetchProviderState = async (provider: 'airtel' | 'jio') => {
    try {
      const res = await fetch(`/api/router-status/${provider}`);
      if (res.ok) {
        const data = await res.json();
        setProviderState(data);
      }
    } catch (err) {
      console.error("Failed to sync router state with backend:", err);
    }
  };

  // On Login Unlock
  const handleUnlock = (profile: any, provider: 'airtel' | 'jio') => {
    setActiveProfile(profile);
    setCurrentProvider(provider);
    fetchProviderState(provider);
  };

  // Sync whenever provider changes
  useEffect(() => {
    if (activeProfile) {
      fetchProviderState(currentProvider);
    }
  }, [currentProvider, activeProfile]);

  // Handle local state updates and post to server database
  const handleUpdateState = async (newState: Partial<ProviderState>) => {
    if (!providerState) return;
    const mergedState = { ...providerState, ...newState };
    
    // Optimistic local state update
    setProviderState(mergedState);

    try {
      await fetch('/api/router-status/' + currentProvider, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newState)
      });
    } catch (err) {
      console.error("Failed to post state update to backend:", err);
    }
  };

  // Handle reboot trigger
  const handleRebootTrigger = async () => {
    if (rebooting || !providerState) return;

    setRebooting(true);
    setRebootSeconds(12);

    // Call server reboot simulation
    try {
      await fetch(`/api/reboot/${currentProvider}`, { method: 'POST' });
    } catch (err) {
      console.error("Failed to post reboot to server:", err);
    }

    // Begin countdown
    const timer = setInterval(() => {
      setRebootSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setRebooting(false);
          fetchProviderState(currentProvider); // Refresh state from server
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Determine if WiFi is online
  const isOnline = providerState ? (providerState.wifiOn && !rebooting) : false;

  // Render LockScreen if not authenticated
  if (!activeProfile) {
    return <LockScreen onUnlock={handleUnlock} initialProvider={currentProvider} />;
  }

  // Loading state if syncing with server
  if (!providerState) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Cpu className="w-10 h-10 text-emerald-400 animate-spin mb-4" />
        <span className="text-xs font-bold font-mono text-slate-400">CONNECTING TO FIBER GATEWAY...</span>
      </div>
    );
  }

  // Theme styling helpers based on provider
  const navActiveStyle = currentProvider === 'airtel' 
    ? 'bg-red-600 text-white shadow-md shadow-red-500/20' 
    : 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20';

  const navInactiveStyle = 'text-slate-400 hover:text-slate-600';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative font-sans max-w-2xl mx-auto border-x border-slate-100 shadow-xl bg-white">
      
      {/* Shared Header bar */}
      <ThemeSelector
        currentProvider={currentProvider}
        onProviderChange={setCurrentProvider}
        activeProfile={activeProfile}
        onLogout={() => {
          setActiveProfile(null);
          setProviderState(null);
        }}
        isOnline={isOnline}
      />

      {/* Main Canvas with scroll padding */}
      <main className="flex-1 p-5 overflow-y-auto">
        {activeTab === 'home' && (
          <Dashboard
            providerState={providerState}
            provider={currentProvider}
            onUpdateState={handleUpdateState}
            isOnline={isOnline}
            onReboot={handleRebootTrigger}
            rebooting={rebooting}
          />
        )}

        {activeTab === 'devices' && (
          <DevicesManager
            providerState={providerState}
            provider={currentProvider}
            onUpdateState={handleUpdateState}
          />
        )}

        {activeTab === 'schedule' && (
          <Schedules
            providerState={providerState}
            provider={currentProvider}
            onUpdateState={handleUpdateState}
          />
        )}

        {activeTab === 'support' && (
          <AIChatbot
            provider={currentProvider}
            providerState={providerState}
            isOnline={isOnline}
          />
        )}
      </main>

      {/* Rebooting Countdown Overlay */}
      {rebooting && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white max-w-2xl mx-auto border-x border-slate-800">
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-full mb-6">
            <Cpu className="w-12 h-12 text-amber-500 animate-spin" />
          </div>
          <h3 className="text-xl font-extrabold text-slate-100">Gateway Rebooting</h3>
          <p className="text-xs text-slate-400 max-w-xs text-center mt-2 leading-relaxed">
            Re-aligning broadband channels and purging DNS cache for {currentProvider === 'jio' ? 'JioFiber' : 'Airtel Air Fiber'} terminal.
          </p>
          
          <div className="mt-8 flex flex-col items-center">
            <span className="text-6xl font-extrabold text-amber-500 tabular-nums">
              {rebootSeconds}
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mt-2">Seconds remaining</span>
          </div>
        </div>
      )}

      {/* Bottom Sticky Tab Bar Navigation */}
      <nav className="sticky bottom-0 w-full flex justify-around items-center py-2 px-3 bg-white/95 backdrop-blur-md border-t border-slate-100 shadow-lg rounded-t-2xl z-40">
        <button
          onClick={() => setActiveTab('home')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl transition-all duration-300 ${
            activeTab === 'home' ? navActiveStyle : navInactiveStyle
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5 tracking-wider">Home</span>
        </button>

        <button
          onClick={() => setActiveTab('devices')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl transition-all duration-300 ${
            activeTab === 'devices' ? navActiveStyle : navInactiveStyle
          }`}
        >
          <Router className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5 tracking-wider">Devices</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl transition-all duration-300 ${
            activeTab === 'schedule' ? navActiveStyle : navInactiveStyle
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5 tracking-wider">Schedule</span>
        </button>

        <button
          onClick={() => setActiveTab('support')}
          className={`flex flex-col items-center justify-center px-4 py-1.5 rounded-2xl transition-all duration-300 ${
            activeTab === 'support' ? navActiveStyle : navInactiveStyle
          }`}
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5 tracking-wider">Support</span>
        </button>
      </nav>
    </div>
  );
}
