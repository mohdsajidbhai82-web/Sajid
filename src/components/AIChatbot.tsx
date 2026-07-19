import React, { useState, useEffect, useRef } from 'react';
import { Send, PlusCircle, Bot, User, RefreshCw, AlertCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, ProviderState } from '../types';

interface AIChatbotProps {
  provider: 'airtel' | 'jio';
  providerState: ProviderState;
  isOnline: boolean;
}

export default function AIChatbot({
  provider,
  providerState,
  isOnline
}: AIChatbotProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const botName = provider === 'jio' ? 'JioAssist' : 'Aria Assistant';
    const brandName = provider === 'jio' ? 'JioFiber' : 'Air Fiber';
    
    return [
      {
        id: 'init',
        role: 'model',
        text: `Hello! I'm ${botName}, your automated ${brandName} virtual assistant. How can I assist you with your high-speed connection today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Adjust greeting when switching providers
  useEffect(() => {
    const botName = provider === 'jio' ? 'JioAssist' : 'Aria Assistant';
    const brandName = provider === 'jio' ? 'JioFiber' : 'Air Fiber';
    
    setMessages([
      {
        id: Date.now().toString(),
        role: 'model',
        text: `Hello! I'm ${botName}, your automated ${brandName} virtual assistant. How can I assist you with your high-speed connection today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [provider]);

  // Triggering suggestions
  const handleChipClick = (topic: string) => {
    sendMessage(topic);
  };

  // Sending API request to Express server `/api/chat`
  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setErrorMsg(null);

    // Simulated custom inline card logic based on topic
    let isDiagnostic = false;
    const lowerText = textToSend.toLowerCase();
    if (lowerText.includes('slow') || lowerText.includes('diagnostic') || lowerText.includes('speed') || lowerText.includes('test')) {
      isDiagnostic = true;
    }

    try {
      // Map history for API
      const historyPayload = messages.map(m => ({
        role: m.role,
        text: m.text
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          provider
        })
      });

      if (!res.ok) {
        throw new Error("Failed to communicate with assistant. Check if API keys are active.");
      }

      const data = await res.json();
      
      const botMsg: ChatMessage = {
        id: `b-${Date.now()}`,
        role: 'model',
        text: data.response || "I have received your inquiry. Let me look into that.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        customCard: isDiagnostic ? {
          type: 'diagnostic',
          signalStrength: providerState.totalSpeed > 600 ? 'EXCELLENT' : 'GOOD',
          signalProgress: providerState.totalSpeed > 600 ? 92 : 75,
          planSpeed: providerState.planSpeedText,
          currentSpeed: `${providerState.totalSpeed} Mbps`
        } : undefined
      };

      setMessages(prev => [...prev, botMsg]);

    } catch (err: any) {
      console.error(err);
      setErrorMsg("Assistant offline. (Simulated responses will load temporarily.)");
      
      // Fallback simulated response
      setTimeout(() => {
        let fallbackReply = `I understand your question about "${textToSend}". Under normal operation, I would connect to the secure Cloud AI servers. Please verify that your system is connected or check the Secrets configuration.`;
        
        if (lowerText.includes('slow') || lowerText.includes('speed') || lowerText.includes('test')) {
          fallbackReply = `I've triggered a remote connection diagnostic on your ${provider === 'jio' ? 'JioFiber' : 'Airtel Air Fiber'} terminal. The signal strength is Excellent, but there may be local channel congestion.`;
        } else if (lowerText.includes('pay') || lowerText.includes('bill') || lowerText.includes('charge')) {
          fallbackReply = `Your billing cycle is current! You are on a monthly plan with a recursive charge of ₹1,179.00 due on the 10th of next month.`;
        } else if (lowerText.includes('plan') || lowerText.includes('change') || lowerText.includes('upgrade')) {
          fallbackReply = `You are on the high-performance ${providerState.planName} plan supporting speeds up to ${providerState.planSpeedText}. To upgrade, click the promo banner or let me generate a support ticket.`;
        }

        const botMsg: ChatMessage = {
          id: `b-fallback-${Date.now()}`,
          role: 'model',
          text: fallbackReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          customCard: isDiagnostic ? {
            type: 'diagnostic',
            signalStrength: 'EXCELLENT',
            signalProgress: 92,
            planSpeed: providerState.planSpeedText,
            currentSpeed: `${providerState.totalSpeed} Mbps`
          } : undefined
        };

        setMessages(prev => [...prev, botMsg]);
      }, 1000);

    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage(input);
    }
  };

  const brandColor = provider === 'airtel' ? 'bg-red-600' : 'bg-indigo-600';
  const brandTextColor = provider === 'airtel' ? 'text-red-600' : 'text-indigo-600';
  const botAvatar = provider === 'jio' 
    ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150' 
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150';

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] relative bg-slate-50">
      
      {/* Bot Chat Header Profile */}
      <div className="bg-white px-4 py-3 flex items-center gap-3.5 sticky top-0 z-10 border-b border-slate-100 shadow-sm">
        <div className="relative">
          <img
            src={botAvatar}
            alt="Support Headshot"
            className={`w-11 h-11 rounded-full object-cover border-2 ${provider === 'airtel' ? 'border-red-600' : 'border-indigo-600'}`}
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
        </div>
        <div>
          <h3 className="font-extrabold text-slate-800 text-sm tracking-tight">
            {provider === 'jio' ? 'JioAssist AI' : 'Aria Assistant'}
          </h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            {isOnline ? 'Online • Ready to help' : 'Router Offline • Diagnosing'}
          </p>
        </div>
      </div>

      {/* Chat History Canvas */}
      <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
            >
              {/* Avatar indicator */}
              {!isUser && (
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 text-white shadow-sm ${
                  provider === 'airtel' ? 'bg-red-600' : 'bg-indigo-600'
                }`}>
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className="space-y-2">
                <div className={`p-4 rounded-2xl shadow-sm ${
                  isUser 
                    ? `${brandColor} text-white rounded-tr-none shadow-indigo-900/5` 
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                }`}>
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  
                  <span className={`block text-[8px] font-extrabold tracking-wider mt-2.5 text-right ${
                    isUser ? 'text-white/70' : 'text-slate-400'
                  }`}>
                    {msg.timestamp}
                  </span>
                </div>

                {/* Built-in inline Diagnostics Card if applicable */}
                {msg.customCard && msg.customCard.type === 'diagnostic' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-md max-w-xs space-y-3.5"
                  >
                    <div className="flex justify-between items-center text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">
                      <span>Live Signal Strength</span>
                      <span className="text-emerald-500">{msg.customCard.signalStrength}</span>
                    </div>

                    <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${brandColor} transition-all duration-1000`} 
                        style={{ width: `${msg.customCard.signalProgress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-xs text-slate-600 font-bold border-t border-slate-50 pt-3">
                      <span>Plan Limit: {msg.customCard.planSpeed}</span>
                      <span className={`${brandTextColor}`}>Current: {msg.customCard.currentSpeed}</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading / Typing indicator */}
        {loading && (
          <div className="flex gap-3 max-w-[85%] self-start items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm ${
              provider === 'airtel' ? 'bg-red-600 animate-pulse' : 'bg-indigo-600 animate-pulse'
            }`}>
              <Bot className="w-4 h-4" />
            </div>
            
            <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Sticky Bottom Actions / Suggestion Chips */}
      <div className="bg-white border-t border-slate-100 p-3 space-y-3">
        
        {/* Suggestion Prompt Chips Horizontal slider */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {[
            'Slow Internet',
            'Bill Payment',
            'Change Plan',
            'Test Connection',
            'Raise Support Ticket'
          ].map((chip) => (
            <button
              key={chip}
              disabled={loading}
              onClick={() => handleChipClick(chip)}
              className="whitespace-nowrap px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 text-slate-700 text-xs font-extrabold rounded-full active:scale-95 transition-all shadow-sm shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Text Input area */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => alert("Image/File uploads can be done in conversation directly using standard router diagnostic dumps.")}
            className="p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-full transition-all"
            title="Attach System Dump File"
          >
            <PlusCircle className="w-6 h-6" />
          </button>

          <div className="flex-1 relative">
            <input
              type="text"
              disabled={loading}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask AI virtual assistant..."
              className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-300 text-slate-850"
            />
          </div>

          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className={`w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md active:scale-90 disabled:opacity-40 transition-all shrink-0 ${brandColor}`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
