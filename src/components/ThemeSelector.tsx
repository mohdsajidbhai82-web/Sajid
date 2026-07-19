import React from 'react';
import { LogOut, Wifi, Bell, ShieldCheck, User } from 'lucide-react';

interface ThemeSelectorProps {
  currentProvider: 'airtel' | 'jio';
  onProviderChange: (provider: 'airtel' | 'jio') => void;
  activeProfile: { name: string; role: string; avatarColor: string } | null;
  onLogout: () => void;
  isOnline: boolean;
}

export default function ThemeSelector({
  currentProvider,
  onProviderChange,
  activeProfile,
  onLogout,
  isOnline
}: ThemeSelectorProps) {
  return (
    <header className="sticky top-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 flex justify-between items-center px-4 py-3 shadow-sm">
      {/* Brand Selector */}
      <div className="flex items-center gap-3">
        {/* Animated Brand Pulse icon */}
        <div className={`p-2 rounded-xl text-white transition-colors duration-300 ${
          currentProvider === 'airtel' ? 'bg-red-600 shadow-md shadow-red-500/20' : 'bg-indigo-600 shadow-md shadow-indigo-500/20'
        }`}>
          <Wifi className="w-5 h-5 animate-pulse" />
        </div>
        
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className={`font-extrabold tracking-tight text-lg transition-colors duration-300 ${
              currentProvider === 'airtel' ? 'text-red-600' : 'text-indigo-600'
            }`}>
              {currentProvider === 'airtel' ? 'Airtel Air Fiber' : 'JioFiber Home'}
            </h1>
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'} animate-ping`} />
          </div>
          
          {/* Provider quick-toggle pills */}
          <div className="flex gap-2 mt-0.5">
            <button
              onClick={() => onProviderChange('airtel')}
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                currentProvider === 'airtel' 
                  ? 'bg-red-50 text-red-600 border border-red-200' 
                  : 'bg-slate-50 text-slate-400 hover:text-slate-600'
              }`}
            >
              Airtel
            </button>
            <button
              onClick={() => onProviderChange('jio')}
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${
                currentProvider === 'jio' 
                  ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' 
                  : 'bg-slate-50 text-slate-400 hover:text-slate-600'
              }`}
            >
              Jio
            </button>
          </div>
        </div>
      </div>

      {/* Profile & Controls */}
      <div className="flex items-center gap-2.5">
        <div className="hidden sm:flex flex-col text-right">
          <div className="flex items-center gap-1 justify-end">
            <span className="text-xs font-bold text-slate-800">{activeProfile?.name || 'User'}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <span className="text-[10px] text-slate-400 font-medium">{activeProfile?.role || 'Owner'}</span>
        </div>

        {/* Profile Avatar */}
        <div className={`w-9 h-9 rounded-full ${activeProfile?.avatarColor || 'bg-slate-500'} flex items-center justify-center text-white font-bold text-sm relative shadow-inner`}>
          {(activeProfile?.name || 'U').charAt(0).toUpperCase()}
          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 border-2 border-white rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-slate-300'}`} />
        </div>

        {/* Logout button */}
        <button
          onClick={onLogout}
          title="Logout"
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-500 active:scale-95 transition-all"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
