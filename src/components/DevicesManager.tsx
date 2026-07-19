import React, { useState } from 'react';
import { 
  Wifi, 
  Smartphone, 
  Tv, 
  Laptop, 
  Gamepad, 
  Plus, 
  Check, 
  RefreshCw, 
  ShieldAlert, 
  X, 
  Activity, 
  Gauge, 
  Play, 
  ArrowDown, 
  ArrowUp,
  Cpu,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProviderState, Device } from '../types';

interface DevicesManagerProps {
  providerState: ProviderState;
  provider: 'airtel' | 'jio';
  onUpdateState: (newState: Partial<ProviderState>) => void;
}

export default function DevicesManager({
  providerState,
  provider,
  onUpdateState
}: DevicesManagerProps) {
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [showSpeedTest, setShowSpeedTest] = useState(false);
  const [scanning, setScanning] = useState(false);

  // Form states for custom devices
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceType, setNewDeviceType] = useState<Device['type']>('smartphone');

  // Speed test simulation states
  const [testPhase, setTestPhase] = useState<'idle' | 'ping' | 'download' | 'upload' | 'complete'>('idle');
  const [simSpeed, setSimSpeed] = useState(0);
  const [simPing, setSimPing] = useState(0);
  const [simUpload, setSimUpload] = useState(0);
  const [simDownload, setSimDownload] = useState(0);

  const activeDevices = providerState.devices.filter(d => !d.isBlocked);
  const blockedDevices = providerState.devices.filter(d => d.isBlocked);

  // Scan network simulation
  const handleScanNetwork = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      // Fluctuate speeds slightly to prove real data updates
      const updatedDevices = providerState.devices.map(d => {
        if (d.isBlocked) return d;
        const randD = (Math.random() * 20 + 5).toFixed(1);
        const randU = (Math.random() * 4 + 1).toFixed(1);
        return {
          ...d,
          downloadSpeed: d.type === 'tv' ? '320.4 Mbps' : `${randD} Mbps`,
          uploadSpeed: `${randU} Mbps`
        };
      });
      onUpdateState({ devices: updatedDevices });
    }, 1500);
  };

  // Toggle blocking/unblocking
  const toggleBlockDevice = (deviceId: string, currentBlockedState: boolean) => {
    const updatedDevices = providerState.devices.map(d => {
      if (d.id === deviceId) {
        return {
          ...d,
          isBlocked: !currentBlockedState,
          blockedOn: !currentBlockedState ? new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : undefined,
          downloadSpeed: '0 Mbps',
          uploadSpeed: '0 Mbps'
        };
      }
      return d;
    });
    onUpdateState({ devices: updatedDevices });
  };

  // Add Device form submit
  const handleAddDeviceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;

    const newDev: Device = {
      id: `dev-custom-${Date.now()}`,
      name: newDeviceName,
      type: newDeviceType,
      downloadSpeed: '15.4 Mbps',
      uploadSpeed: '3.1 Mbps',
      isBlocked: false
    };

    onUpdateState({
      devices: [newDev, ...providerState.devices]
    });

    setNewDeviceName('');
    setShowAddDevice(false);
  };

  // Run interactive speed test simulation
  const runSpeedTestSim = () => {
    setTestPhase('ping');
    setSimPing(0);
    setSimDownload(0);
    setSimUpload(0);
    setSimSpeed(0);

    // 1. Simulate Ping test
    setTimeout(() => {
      setSimPing(Math.round(Math.random() * 8 + 3)); // 3-11ms
      setTestPhase('download');
      
      // 2. Simulate Download test (Needle animate)
      let downInterval = setInterval(() => {
        setSimSpeed(prev => {
          const target = provider === 'jio' ? 920 : 810;
          if (prev >= target) {
            clearInterval(downInterval);
            return target;
          }
          return prev + Math.round(Math.random() * 60 + 20);
        });
      }, 80);

      setTimeout(() => {
        clearInterval(downInterval);
        const finalDown = provider === 'jio' ? 950 : 842;
        setSimDownload(finalDown);
        setSimSpeed(finalDown);
        setTestPhase('upload');

        // 3. Simulate Upload test (Animate needle down then up to upload speeds)
        setSimSpeed(20);
        let upInterval = setInterval(() => {
          setSimSpeed(prev => {
            const target = provider === 'jio' ? 440 : 380;
            if (prev >= target) {
              clearInterval(upInterval);
              return target;
            }
            return prev + Math.round(Math.random() * 40 + 10);
          });
        }, 80);

        setTimeout(() => {
          clearInterval(upInterval);
          const finalUp = provider === 'jio' ? 480 : 410;
          setSimUpload(finalUp);
          setSimSpeed(finalUp);
          setTestPhase('complete');
          
          // Update total speed on Dashboard state!
          onUpdateState({ totalSpeed: finalDown });
        }, 2000);

      }, 2500);

    }, 1500);
  };

  const getDeviceIcon = (type: Device['type']) => {
    switch (type) {
      case 'smartphone': return <Smartphone className="w-5 h-5" />;
      case 'tv': return <Tv className="w-5 h-5" />;
      case 'laptop': return <Laptop className="w-5 h-5" />;
      case 'gaming': return <Gamepad className="w-5 h-5" />;
      default: return <Wifi className="w-5 h-5" />;
    }
  };

  const brandColor = provider === 'airtel' ? 'bg-red-600 hover:bg-red-500' : 'bg-indigo-600 hover:bg-indigo-500';
  const brandTextColor = provider === 'airtel' ? 'text-red-600' : 'text-indigo-600';
  const brandBgLight = provider === 'airtel' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600';

  return (
    <div className="space-y-6 pb-24">
      
      {/* Network Health Header Hero Card */}
      <section>
        <div className={`p-6 rounded-3xl text-white shadow-lg overflow-hidden relative ${
          provider === 'airtel' ? 'bg-gradient-to-br from-red-600 to-rose-500' : 'bg-gradient-to-br from-indigo-600 to-blue-500'
        }`}>
          {/* Backside watermarked antenna wifi logo */}
          <Wifi className="absolute right-[-40px] bottom-[-40px] w-52 h-52 opacity-10 rotate-12 pointer-events-none" />

          <div className="flex justify-between items-end relative z-10">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/80">Network Diagnostics</span>
              <h3 className="text-2xl font-extrabold tracking-tight mt-1">{providerState.networkHealth}</h3>
              
              <div className="flex items-center gap-2 mt-4 bg-white/10 px-3 py-1.5 rounded-full w-fit">
                <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
                <span className="text-xs font-bold">{activeDevices.length} Connected Devices Active</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/80">Bandwidth speed</span>
              <p className="text-4xl font-extrabold tracking-tighter leading-none mt-1">
                {providerState.totalSpeed} <span className="text-sm font-bold tracking-normal">Mbps</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Connected Devices List Panel */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            Connected Hardware ({activeDevices.length})
          </h4>

          <button
            onClick={handleScanNetwork}
            disabled={scanning}
            className={`text-xs font-extrabold flex items-center gap-1 px-3 py-1.5 bg-white rounded-xl border border-slate-100 hover:border-slate-200 active:scale-95 transition-all ${brandTextColor}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            {scanning ? 'Scanning...' : 'Scan Devices'}
          </button>
        </div>

        <div className="space-y-3">
          {activeDevices.map(device => (
            <div 
              key={device.id}
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm flex items-center justify-between hover:border-slate-200 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center text-slate-600 ${brandBgLight}`}>
                  {getDeviceIcon(device.type)}
                </div>
                <div>
                  <h5 className="text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
                    {device.name}
                    {device.isStreaming && (
                      <span className="text-[9px] font-extrabold bg-red-100 text-red-600 px-1.5 py-0.5 rounded-md animate-pulse">
                        {device.statusText || 'Streaming 4K'}
                      </span>
                    )}
                    {device.scheduleBlockTime && (
                      <span className="text-[9px] font-extrabold bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded-md">
                        {device.scheduleBlockTime}
                      </span>
                    )}
                    {device.usageLimitReached && (
                      <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md">
                        2h Limit Reached
                      </span>
                    )}
                  </h5>
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-0.5">
                      <ArrowDown className="w-3 h-3 text-emerald-500" />
                      {device.downloadSpeed}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <ArrowUp className="w-3 h-3 text-indigo-500" />
                      {device.uploadSpeed}
                    </span>
                  </div>
                </div>
              </div>

              {/* Slider Toggle to Block client node */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleBlockDevice(device.id, false)}
                  className="text-xs font-bold text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 border border-slate-100 px-3 py-1.5 rounded-xl transition-all"
                >
                  Block
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blocked Devices Section */}
      {blockedDevices.length > 0 && (
        <section className="space-y-3">
          <h4 className="text-sm font-extrabold uppercase tracking-wider text-slate-400">
            Blocked Firewall Nodes ({blockedDevices.length})
          </h4>

          <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden divide-y divide-slate-100">
            {blockedDevices.map(device => (
              <div 
                key={device.id} 
                className="p-4 flex items-center justify-between hover:bg-slate-100/40 transition-colors"
              >
                <div className="flex items-center gap-3 opacity-60">
                  <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">
                    {getDeviceIcon(device.type)}
                  </div>
                  <div>
                    <h5 className="text-xs font-extrabold text-slate-800 line-through">{device.name}</h5>
                    <p className="text-[10px] text-red-500 font-bold mt-0.5">
                      {device.blockedOn ? `Blocked on ${device.blockedOn}` : 'Schedule Restricted'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => toggleBlockDevice(device.id, true)}
                  className="bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 text-slate-600 hover:text-emerald-600 px-3 py-1.5 rounded-xl text-xs font-extrabold active:scale-95 transition-all shadow-sm"
                >
                  UNBLOCK
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Quick performance testing grid */}
      <section className="grid grid-cols-2 gap-4">
        {/* Speed test panel trigger */}
        <button
          onClick={() => { setShowSpeedTest(true); runSpeedTestSim(); }}
          className="bg-white border border-slate-100 hover:border-slate-200 rounded-3xl p-5 flex flex-col items-center text-center shadow-sm group transition-all"
        >
          <div className={`w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 mb-3 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors`}>
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <h5 className="text-sm font-extrabold text-slate-800">Internet Speed Test</h5>
          <span className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">Test current bandwidth latency</span>
        </button>

        {/* Custom device adder trigger */}
        <button
          onClick={() => setShowAddDevice(true)}
          className="bg-white border border-slate-100 hover:border-slate-200 rounded-3xl p-5 flex flex-col items-center text-center shadow-sm group transition-all"
        >
          <div className={`w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 mb-3 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors`}>
            <Plus className="w-6 h-6" />
          </div>
          <h5 className="text-sm font-extrabold text-slate-800">Register Device</h5>
          <span className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wide">Add a custom hardware manually</span>
        </button>
      </section>

      {/* Add Device Dialog */}
      <AnimatePresence>
        {showAddDevice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowAddDevice(false)} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm relative z-10 shadow-2xl border border-slate-100"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-slate-950 text-lg">Add Hardware Manually</h3>
                <button onClick={() => setShowAddDevice(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddDeviceSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Device Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sajid Room smart TV, iPhone"
                    value={newDeviceName}
                    onChange={(e) => setNewDeviceName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Hardware Type</label>
                  <select
                    value={newDeviceType}
                    onChange={(e) => setNewDeviceType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none"
                  >
                    <option value="smartphone">Smartphone / Tablet</option>
                    <option value="laptop">Laptop / Desktop</option>
                    <option value="tv">Smart TV / Streaming box</option>
                    <option value="gaming">Gaming Console / VR</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className={`w-full text-white font-bold py-3 rounded-xl text-xs transition-all ${brandColor}`}
                >
                  Register Device
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Speed Test Simulation Dialog */}
      <AnimatePresence>
        {showSpeedTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-md" onClick={() => setShowSpeedTest(false)} />
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="bg-slate-950 text-white rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl border border-slate-800 flex flex-col items-center"
            >
              <div className="flex justify-between items-center w-full mb-6">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  SpeedTest Server Protocol
                </span>
                <button onClick={() => setShowSpeedTest(false)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Speed Dial Visual */}
              <div className="relative w-48 h-48 flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-slate-800 opacity-20" />
                <div className="absolute inset-2 rounded-full border-4 border-slate-700/40" />

                <div className="text-center flex flex-col justify-center items-center">
                  <Gauge className="w-8 h-8 text-slate-500 mb-1" />
                  <span className="text-4xl font-extrabold tracking-tight tabular-nums">
                    {simSpeed}
                  </span>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase mt-0.5">Mbps</span>
                </div>

                {/* Simulated needle */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    stroke={provider === 'airtel' ? '#e40000' : '#4f46e5'}
                    strokeWidth="3"
                    fill="transparent"
                    strokeDasharray="552"
                    strokeDashoffset={552 - (552 * Math.min(100, (simSpeed / 1000) * 100)) / 100}
                    className="transition-all duration-100 ease-out"
                  />
                </svg>
              </div>

              {/* Diagnostic Log Panels */}
              <div className="grid grid-cols-3 gap-3 w-full mb-6 text-center">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">Ping</span>
                  <p className="text-base font-extrabold text-white mt-1">
                    {simPing > 0 ? `${simPing} ms` : testPhase === 'ping' ? 'testing...' : '--'}
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-0.5">
                    <ArrowDown className="w-2.5 h-2.5 text-emerald-400" />
                    Download
                  </span>
                  <p className="text-base font-extrabold text-emerald-400 mt-1">
                    {simDownload > 0 ? `${simDownload} Mbps` : testPhase === 'download' ? 'testing...' : '--'}
                  </p>
                </div>
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3">
                  <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center justify-center gap-0.5">
                    <ArrowUp className="w-2.5 h-2.5 text-indigo-400" />
                    Upload
                  </span>
                  <p className="text-base font-extrabold text-indigo-400 mt-1">
                    {simUpload > 0 ? `${simUpload} Mbps` : testPhase === 'upload' ? 'testing...' : '--'}
                  </p>
                </div>
              </div>

              {/* Action Controls */}
              <div className="w-full">
                {testPhase === 'complete' ? (
                  <div className="space-y-3">
                    <div className="text-center text-xs font-bold text-emerald-400 mb-2">
                      ✔ Bandwidth performance verified. Excellent rating!
                    </div>
                    <button
                      onClick={runSpeedTestSim}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 rounded-2xl text-xs transition-all"
                    >
                      Test Connection Again
                    </button>
                  </div>
                ) : testPhase === 'idle' ? (
                  <button
                    onClick={runSpeedTestSim}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-2xl text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Initiate Fiber speed test
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-2">
                    <div className="flex gap-1">
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" />
                    </div>
                    <span className="text-[10px] text-slate-500 font-extrabold uppercase mt-1 tracking-widest">
                      Processing phase: {testPhase}...
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
