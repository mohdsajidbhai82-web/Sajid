import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Gemini SDK lazily
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY environment variable is not defined. AI Chatbot responses will fall back to simulated assistant.");
      return null;
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Initial Simulated Router Database
interface Device {
  id: string;
  name: string;
  type: 'smartphone' | 'tv' | 'laptop' | 'tablet' | 'gaming' | 'unknown';
  downloadSpeed: string;
  uploadSpeed: string;
  isStreaming?: boolean;
  statusText?: string;
  isBlocked: boolean;
  blockedOn?: string;
  scheduleBlockTime?: string;
  usageLimitReached?: boolean;
}

interface ProviderState {
  wifiOn: boolean;
  networkHealth: string;
  totalSpeed: number;
  dataLimitGb: number;
  dataUsedGb: number;
  dataUploadGb: number;
  dataDownloadGb: number;
  planName: string;
  planSpeedText: string;
  validityDaysLeft: number;
  devices: Device[];
  sleepMode: {
    enabled: boolean;
    from: string;
    until: string;
    repeatDays: string[]; // M, T, W, T, F, S, S
  };
  smartBoost: {
    enabled: boolean;
    configured: boolean;
    priorityDevices: string[];
  };
}

let routerDatabase: Record<'airtel' | 'jio', ProviderState> = {
  airtel: {
    wifiOn: true,
    networkHealth: "Strong Signal",
    totalSpeed: 842,
    dataLimitGb: 1024,
    dataUsedGb: 682,
    dataUploadGb: 12.4,
    dataDownloadGb: 669.6,
    planName: "Xstream Ultrafast",
    planSpeedText: "1 Gbps",
    validityDaysLeft: 24,
    devices: [
      { id: "dev-1", name: "iPhone 15 Pro", type: "smartphone", downloadSpeed: "12.4 Mbps", uploadSpeed: "2.1 Mbps", isBlocked: false },
      { id: "dev-2", name: "Samsung 4K TV", type: "tv", downloadSpeed: "340.8 Mbps", uploadSpeed: "12.5 Mbps", isStreaming: true, statusText: "Streaming 4K", isBlocked: false },
      { id: "dev-3", name: "MBP 16 M3 Max", type: "laptop", downloadSpeed: "2.1 Mbps", uploadSpeed: "0.5 Mbps", statusText: "Idle", isBlocked: false },
      { id: "dev-4", name: "Leo's iPad", type: "tablet", downloadSpeed: "0 Mbps", uploadSpeed: "0 Mbps", isBlocked: false, scheduleBlockTime: "Blocks at 8:00 PM" },
      { id: "dev-5", name: "PS5 Gaming", type: "gaming", downloadSpeed: "0 Mbps", uploadSpeed: "0 Mbps", isBlocked: false, usageLimitReached: true },
      { id: "dev-6", name: "Unknown Android", type: "unknown", downloadSpeed: "0 Mbps", uploadSpeed: "0 Mbps", isBlocked: true, blockedOn: "Jan 12" },
      { id: "dev-7", name: "PS5-LivingRoom", type: "gaming", downloadSpeed: "0 Mbps", uploadSpeed: "0 Mbps", isBlocked: true, statusText: "Schedule: Offline" },
    ],
    sleepMode: {
      enabled: true,
      from: "23:00",
      until: "06:30",
      repeatDays: ["M", "T", "W", "T", "F"]
    },
    smartBoost: {
      enabled: false,
      configured: false,
      priorityDevices: []
    }
  },
  jio: {
    wifiOn: true,
    networkHealth: "Excellent Connection",
    totalSpeed: 950,
    dataLimitGb: 1500,
    dataUsedGb: 412,
    dataUploadGb: 28.5,
    dataDownloadGb: 383.5,
    planName: "JioFiber Max Pro",
    planSpeedText: "1 Gbps",
    validityDaysLeft: 18,
    devices: [
      { id: "dev-j1", name: "OnePlus 12", type: "smartphone", downloadSpeed: "45.1 Mbps", uploadSpeed: "8.2 Mbps", isBlocked: false },
      { id: "dev-j2", name: "Living Room JioTV", type: "tv", downloadSpeed: "150.2 Mbps", uploadSpeed: "10.4 Mbps", isStreaming: true, statusText: "Active Streaming", isBlocked: false },
      { id: "dev-j3", name: "MacBook Air M2", type: "laptop", downloadSpeed: "1.2 Mbps", uploadSpeed: "0.2 Mbps", statusText: "Idle", isBlocked: false },
      { id: "dev-j4", name: "Riya's iPhone", type: "smartphone", downloadSpeed: "0 Mbps", uploadSpeed: "0 Mbps", isBlocked: false, scheduleBlockTime: "Blocks at 10:00 PM" },
      { id: "dev-j5", name: "Xbox Series X", type: "gaming", downloadSpeed: "0 Mbps", uploadSpeed: "0 Mbps", isBlocked: true, blockedOn: "Feb 20" },
    ],
    sleepMode: {
      enabled: false,
      from: "22:00",
      until: "06:00",
      repeatDays: ["S", "S"]
    },
    smartBoost: {
      enabled: true,
      configured: true,
      priorityDevices: ["dev-j3"]
    }
  }
};

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API: Get active router database state
  app.get("/api/router-status/:provider", (req, res) => {
    const provider = req.params.provider === "jio" ? "jio" : "airtel";
    res.json(routerDatabase[provider]);
  });

  // API: Update router state
  app.post("/api/router-status/:provider", (req, res) => {
    const provider = req.params.provider === "jio" ? "jio" : "airtel";
    routerDatabase[provider] = {
      ...routerDatabase[provider],
      ...req.body
    };
    res.json({ success: true, state: routerDatabase[provider] });
  });

  // API: Reboot Router
  app.post("/api/reboot/:provider", (req, res) => {
    const provider = req.params.provider === "jio" ? "jio" : "airtel";
    
    // Simulate speed fluctuate and active devices reconnect
    routerDatabase[provider].networkHealth = "Rebooting...";
    routerDatabase[provider].totalSpeed = 0;
    
    setTimeout(() => {
      routerDatabase[provider].networkHealth = provider === "jio" ? "Excellent Connection" : "Strong Signal";
      routerDatabase[provider].totalSpeed = provider === "jio" ? 950 : 842;
    }, 12000);

    res.json({ success: true, message: "Router reboot sequence initiated. Please allow 15-30 seconds to reconnect." });
  });

  // API: Chatbot powered by Gemini
  app.post("/api/chat", async (req, res) => {
    const { message, history, provider } = req.body;
    const activeProvider = provider === "jio" ? "jio" : "airtel";
    const routerState = routerDatabase[activeProvider];
    
    const botName = activeProvider === "jio" ? "JioAssist" : "Aria Assistant";
    const brandName = activeProvider === "jio" ? "JioFiber" : "Airtel Air Fiber";

    // Build standard diagnostic summary for the system prompt so Gemini has full context of the actual live UI states!
    const diagnosticSummary = `
Brand: ${brandName}
WiFi Network: ${routerState.wifiOn ? "ON" : "OFF"}
Network Health: ${routerState.networkHealth}
Total Current Speed: ${routerState.totalSpeed} Mbps
Data Limit: ${routerState.dataLimitGb} GB
Data Used: ${routerState.dataUsedGb} GB (${((routerState.dataUsedGb / routerState.dataLimitGb) * 100).toFixed(1)}%)
Active Plan: ${routerState.planName} (${routerState.planSpeedText})
Plan Validity: ${routerState.validityDaysLeft} Days Remaining
Connected Devices: ${routerState.devices.filter(d => !d.isBlocked).length} devices active
Blocked Devices: ${routerState.devices.filter(d => d.isBlocked).length} devices blocked
Sleep Mode: ${routerState.sleepMode.enabled ? `ON (from ${routerState.sleepMode.from} until ${routerState.sleepMode.until})` : "OFF"}
Smart Boost: ${routerState.smartBoost.enabled ? "ACTIVE" : "INACTIVE"}
`;

    const systemInstruction = `You are ${botName}, the friendly, helpful AI virtual assistant for ${brandName}.
You assist users with troubleshooting their connection, monitoring usage, understanding billing, and managing router features.

Current Live Router Diagnostics to use for reference:
${diagnosticSummary}

Rules:
1. Speak clearly, professionally, and concisely. Keep responses customer-friendly.
2. Use the live diagnostics data above as your absolute source of truth when asked about the user's internet speed, data usage, plan name, validity, or active devices.
3. If the user complains about slow speeds, mention their current speed and that you see "${routerState.networkHealth}" with ${routerState.devices.filter(d => d.isStreaming).length} streaming devices. Suggest rebooting the router or configuring "Smart Boost" priority.
4. If they ask about their plan, tell them they are on "${routerState.planName}" with ${routerState.validityDaysLeft} days left.
5. If the user wants to reboot, tell them they can do so using the "Reboot Router" button on the dashboard, or you can guide them.
6. Provide helpful advice for managing family access via "Parental Controls" or scheduling router offline hours with "Sleep Mode".
7. Avoid using markdown formatting blocks in plain outputs, but standard bold highlights are perfect. Keep answers friendly and clean.`;

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback response generator if API key is not available
      let fallbackText = `I am ${botName}, your simulated ${brandName} assistant. (To enable real AI responses, please add GEMINI_API_KEY in Settings > Secrets). \n\nBased on your live connection details: \n- WiFi is currently ${routerState.wifiOn ? "Online" : "Offline"}.\n- Network Health: "${routerState.networkHealth}"\n- Current speed: ${routerState.totalSpeed} Mbps.\n- Plan: ${routerState.planName} with ${routerState.validityDaysLeft} days remaining.`;
      
      const lowerMsg = message.toLowerCase();
      if (lowerMsg.includes("slow") || lowerMsg.includes("speed")) {
        fallbackText = `I ran a diagnostic on your ${brandName} network. I see you are currently getting **${routerState.totalSpeed} Mbps** on your **${routerState.planName}** plan.\n\nSince your status is *"${routerState.networkHealth}"*, you might be experiencing channel interference. Would you like to **reboot your router** or enable **Smart Boost** for your current device to prioritize traffic?`;
      } else if (lowerMsg.includes("usage") || lowerMsg.includes("data") || lowerMsg.includes("limit")) {
        fallbackText = `You have consumed **${routerState.dataUsedGb} GB** out of your **${routerState.dataLimitGb} GB** monthly quota. You have about **${(routerState.dataLimitGb - routerState.dataUsedGb).toFixed(0)} GB** remaining on your high-speed plan.`;
      } else if (lowerMsg.includes("reboot") || lowerMsg.includes("restart")) {
        fallbackText = `I can trigger a remote router reboot for you. Alternatively, you can click the **Reboot Router** quick-action tile on the dashboard to immediately clear the cache and optimize your connection.`;
      } else if (lowerMsg.includes("plan") || lowerMsg.includes("valid") || lowerMsg.includes("bill")) {
        fallbackText = `Your current plan is the **${routerState.planName}** (${routerState.planSpeedText}). It has **${routerState.validityDaysLeft} days left** before renewal. Your estimated bill is clear, and you can view historical payments via the "Pay History" tile.`;
      }
      
      return res.json({ response: fallbackText });
    }

    try {
      // Format chat history for Gemini SDK
      // The API uses content history objects
      const contents = history.map((chat: any) => ({
        role: chat.role === "user" ? "user" : "model",
        parts: [{ text: chat.text }]
      }));

      // Append current message
      contents.push({
        role: "user",
        parts: [{ text: message }]
      });

      const result = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ response: result.text || "I'm processing your request. How else can I assist you with your connection today?" });
    } catch (err: any) {
      console.error("Gemini API call failed:", err);
      res.status(500).json({ error: "Failed to communicate with AI Assistant. Please check server logs or secret key configuration." });
    }
  });

  // Serve static assets and bundle React client
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Fiber Manager Server running on http://localhost:${PORT}`);
  });
}

startServer();
