import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  WifiOff, 
  Tv, 
  Smartphone, 
  Laptop, 
  Activity, 
  Zap, 
  Calendar, 
  ShieldCheck, 
  QrCode, 
  History, 
  RotateCw,
  TrendingUp,
  Download,
  Upload,
  Coins,
  AlertTriangle,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProviderState } from '../types';

interface DashboardProps {
  providerState: ProviderState;
  provider: 'airtel' | 'jio';
  onUpdateState: (newState: Partial<ProviderState>) => void;
  isOnline: boolean;
  onReboot: () => void;
  rebooting: boolean;
}

export default function Dashboard({
  providerState,
  provider,
  onUpdateState,
  isOnline,
  onReboot,
  rebooting
}: DashboardProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [safeBrowsing, setSafeBrowsing] = useState(true);

  // Circular progress math
  const limit = providerState.dataLimitGb;
  const used = providerState.dataUsedGb;
  const percent = Math.min(100, Math.round((used / limit) * 100));
  const strokeDashoffset = 502 - (502 * percent) / 100;

  const brandColor = provider === 'airtel' ? 'bg-red-600' : 'bg-indigo-600';
  const brandTextColor = provider === 'airtel' ? 'text-red-600' : 'text-indigo-600';
  const brandGradient = provider === 'airtel' ? 'from-red-600 to-rose-500' : 'from-indigo-600 to-blue-500';
  const strokeColor = provider === 'airtel' ? '#e40000' : '#4f46e5';

  return (
    <div className="space-y-6 pb-24">
      {/* Network Alert when Offline or Rebooting */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
            <div>
              <h3 className="font-bold text-amber-800 text-sm">Router Offline</h3>
              <p className="text-xs text-amber-600 mt-1">
                {rebooting 
                  ? 'Your router is currently completing a reboot sequence. Devices will reconnect automatically shortly.' 
                  : 'The master WiFi switch is turned OFF. Turn on the WiFi toggle below to restore internet access.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome banner with Quick Toggle */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">WELCOME BACK</span>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-950 mt-1">Home Broadband Portal</h2>
          <p className="text-slate-500 text-xs mt-0.5">Control center and performance heatmaps</p>
        </div>

        {/* WiFi Master Switch Toggle */}
        <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm shrink-0">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">WiFi Status</span>
            <span className={`text-xs font-bold ${providerState.wifiOn ? 'text-emerald-500' : 'text-rose-500'}`}>
              {providerState.wifiOn ? 'Broadcasting' : 'Deactivated'}
            </span>
          </div>

          <button
            onClick={() => {
              if (rebooting) return;
              onUpdateState({ wifiOn: !providerState.wifiOn });
            }}
            disabled={rebooting}
            className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ${
              providerState.wifiOn ? (provider === 'airtel' ? 'bg-red-600' : 'bg-indigo-600') : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform duration-300 flex items-center justify-center ${
                providerState.wifiOn ? 'translate-x-6' : 'translate-x-0'
              }`}
            >
              {providerState.wifiOn ? (
                <Wifi className={`w-3.5 h-3.5 ${brandTextColor}`} />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-slate-400" />
              )}
            </div>
          </button>
        </div>
      </section>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Data Usage Large Box */}
        <div className="md:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-4 left-4">
            <h3 className="font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <Activity className={`w-4 h-4 ${brandTextColor}`} />
              Monthly Data Usage
            </h3>
          </div>

          {/* Quick Stats right top */}
          <div className="absolute top-4 right-4 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Quota resets in 6 Days</span>
          </div>

          {/* Circular Graph */}
          <div className="relative w-56 h-56 mt-10 mb-4 flex items-center justify-center">
            {/* SVG Ring */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 180 180">
              <circle
                cx="90"
                cy="90"
                r="80"
                className="text-slate-100"
                strokeWidth="14"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="90"
                cy="90"
                r="80"
                stroke={strokeColor}
                strokeWidth="14"
                fill="transparent"
                strokeDasharray="502"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute text-center flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold tracking-tighter text-slate-950">
                {used}
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-0.5">GB Consumed</span>
              <div className="w-8 h-[2px] bg-slate-100 my-2" />
              <span className="text-xs text-slate-500 font-bold">of {limit} GB Max</span>
            </div>
          </div>

          {/* Upload / Download metrics */}
          <div className="grid grid-cols-2 gap-4 w-full mt-4">
            <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Downloads</span>
                <span className="text-base font-extrabold text-slate-800">{providerState.dataDownloadGb} GB</span>
              </div>
            </div>

            <div className="bg-slate-50/60 border border-slate-100 p-4 rounded-2xl flex items-center gap-3">
              <div className="p-2.5 bg-indigo-100 text-indigo-600 rounded-xl">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Uploads</span>
                <span className="text-base font-extrabold text-slate-800">{providerState.dataUploadGb} GB</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Plan details & Connected count */}
        <div className="md:col-span-4 flex flex-col gap-6">
          
          {/* Active Plan details Card */}
          <div className={`text-white rounded-3xl p-6 shadow-lg shadow-indigo-900/10 bg-gradient-to-br relative overflow-hidden group flex-1 flex flex-col justify-between ${brandGradient}`}>
            <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/15 transition-all duration-500 pointer-events-none" />
            
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-[10px] font-extrabold text-white/70 uppercase tracking-widest">ACTIVE SUBSCRIPTION</span>
                  <h3 className="text-2xl font-extrabold tracking-tight mt-1">{providerState.planName}</h3>
                </div>
                <div className="bg-white/20 p-2.5 rounded-xl">
                  <Zap className="w-5 h-5 text-white animate-bounce" />
                </div>
              </div>

              <div className="space-y-3.5 border-t border-white/10 pt-4 font-sans">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/80">Allocation Limit</span>
                  <span className="font-extrabold">{providerState.planSpeedText} Fiber</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/80">Active Validity</span>
                  <span className="font-extrabold flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {providerState.validityDaysLeft} Days Remaining
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHistoryModal(true)}
              className="mt-6 w-full bg-white text-slate-900 hover:bg-slate-50 font-bold text-xs py-3.5 rounded-xl active:scale-95 transition-transform shadow-md"
            >
              Payment & billing logs
            </button>
          </div>

          {/* Quick Devices Summary Box */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">Connected Hardware</span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1">
                {providerState.devices.filter(d => !d.isBlocked).length} Devices
              </span>
              <p className="text-[10px] text-emerald-500 font-bold mt-1">● Optimal network conditions</p>
            </div>

            <div className="flex -space-x-2">
              <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-slate-500 shadow-sm" title="Smartphones">
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-slate-500 shadow-sm" title="Computers">
                <Laptop className="w-4 h-4" />
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-slate-600 shadow-sm font-bold text-xs">
                +{providerState.devices.filter(d => !d.isBlocked).length - 2}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Quick Router Tools / Actions Grid */}
      <section className="space-y-4">
        <h3 className="text-sm font-extrabold tracking-tight text-slate-800 uppercase tracking-wider">Quick Actions</h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Reboot router */}
          <button
            onClick={onReboot}
            disabled={rebooting || !isOnline}
            className="flex flex-col items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-100 p-5 rounded-2xl shadow-sm transition-all group active:scale-95 disabled:opacity-50"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-slate-600 transition-all ${
              rebooting ? 'bg-amber-100 text-amber-600 spin-animation' : 'bg-slate-50 group-hover:bg-red-50 group-hover:text-red-600'
            }`}>
              <RotateCw className={`w-5 h-5 ${rebooting ? 'animate-spin' : ''}`} />
            </div>
            <span className="text-xs font-bold text-slate-700">
              {rebooting ? 'Rebooting...' : 'Reboot Router'}
            </span>
          </button>

          {/* Safe Browsing switch */}
          <button
            onClick={() => setSafeBrowsing(!safeBrowsing)}
            className="flex flex-col items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-100 p-5 rounded-2xl shadow-sm transition-all group active:scale-95"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              safeBrowsing ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-600'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">
              {safeBrowsing ? 'Secure Shield ON' : 'Protection OFF'}
            </span>
          </button>

          {/* Share WiFi code */}
          <button
            onClick={() => setShowQrModal(true)}
            className="flex flex-col items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-100 p-5 rounded-2xl shadow-sm transition-all group active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center text-slate-600 transition-all">
              <QrCode className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Share WiFi QR</span>
          </button>

          {/* Pay history */}
          <button
            onClick={() => setShowHistoryModal(true)}
            className="flex flex-col items-center justify-center gap-3 bg-white hover:bg-slate-50 border border-slate-100 p-5 rounded-2xl shadow-sm transition-all group active:scale-95"
          >
            <div className="w-12 h-12 rounded-full bg-slate-50 group-hover:bg-amber-50 group-hover:text-amber-600 flex items-center justify-center text-slate-600 transition-all">
              <History className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700">Billing History</span>
          </button>
        </div>
      </section>

      {/* Corporate promotional banner advertisement */}
      <section className="relative w-full rounded-3xl overflow-hidden bg-slate-900 text-white min-h-[160px] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent z-10" />
        
        {/* Banner image background */}
        <img
          src="https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=800"
          alt="Fiber glass broadband background"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />

        <div className="relative z-20 px-6 py-6 max-w-md">
          <span className="text-[9px] font-extrabold uppercase tracking-widest text-red-500 bg-red-950/80 px-2 py-1 rounded-full border border-red-900/30">
            LIMITED OTT BUNDLE OFFER
          </span>
          <h4 className="text-lg font-extrabold tracking-tight mt-2.5">
            Upgrade to 2Gbps & Get 12 Months Disney+ & Prime Free!
          </h4>
          <p className="text-[10px] text-slate-400 mt-1">
            Valid on selected high-speed gigabit fiber connections this month.
          </p>
          <button 
            onClick={() => alert("Simulated Plan Upgrade initiated! An AI agent is ready to help you inside the Support tab.")}
            className="mt-4 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all"
          >
            Upgrade Broadband Now
          </button>
        </div>
      </section>

      {/* QR Code sharing Modal */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowQrModal(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl border border-slate-100 flex flex-col items-center text-center"
            >
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-full mb-3">
                <QrCode className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Instant Guest Connection</h3>
              <p className="text-slate-500 text-xs mt-1">Scan to connect to {provider === 'airtel' ? 'Airtel_AirFiber_5G' : 'JioFiber_HighSpeed'}</p>
              
              {/* Fake QR code generation */}
              <div className="w-44 h-44 bg-slate-50 border-4 border-white shadow-inner rounded-2xl flex items-center justify-center p-4 my-4">
                <div className="grid grid-cols-5 grid-rows-5 gap-1.5 w-full h-full opacity-80">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-sm ${
                        (i % 2 === 0 && i % 3 !== 0) || i < 5 || i > 20 || i % 6 === 0 ? 'bg-slate-900' : 'bg-transparent'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl w-full border border-slate-100 text-left font-sans mb-4">
                <div className="flex justify-between items-center text-xs text-slate-500">
                  <span>SSID:</span>
                  <span className="font-bold text-slate-800">{provider === 'airtel' ? 'Airtel_Fiber_5G_Sajid' : 'JioFiber_Sajid_Home'}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 mt-1.5">
                  <span>Password:</span>
                  <span className="font-bold font-mono text-slate-800">SajidFiber@2026</span>
                </div>
              </div>

              <button
                onClick={() => setShowQrModal(false)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-3 rounded-xl transition-all"
              >
                Dismiss sharing
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pay History Modal */}
      <AnimatePresence>
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowHistoryModal(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl border border-slate-100 flex flex-col"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-slate-900 text-lg flex items-center gap-2">
                  <Coins className="w-5 h-5 text-amber-500" />
                  Broadband Billing Logs
                </h3>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-slate-400 hover:text-slate-600 font-bold text-xs"
                >
                  Close
                </button>
              </div>

              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {[
                  { id: 'tx-1', desc: 'Monthly Broadband Auto-Debit', date: 'Jul 10, 2026', amount: '₹1,179.00', status: 'PAID' },
                  { id: 'tx-2', desc: 'Monthly Broadband Auto-Debit', date: 'Jun 10, 2026', amount: '₹1,179.00', status: 'PAID' },
                  { id: 'tx-3', desc: 'Data Voucher Top-up (200GB)', date: 'May 24, 2026', amount: '₹251.00', status: 'PAID' },
                  { id: 'tx-4', desc: 'Monthly Broadband Auto-Debit', date: 'May 10, 2026', amount: '₹1,179.00', status: 'PAID' },
                  { id: 'tx-5', desc: 'Connection Installation Charge', date: 'Apr 10, 2026', amount: '₹1,500.00', status: 'PAID' },
                ].map((item) => (
                  <div key={item.id} className="border border-slate-100 p-3.5 rounded-2xl flex justify-between items-center hover:bg-slate-50 transition-colors">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800">{item.desc}</h4>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{item.date}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-extrabold text-slate-800 block">{item.amount}</span>
                      <span className="inline-block text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full mt-1 border border-emerald-100">
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100 mt-4 text-[11px] text-amber-700 font-sans flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Auto-debit is scheduled for <strong>Aug 10, 2026</strong>.</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
