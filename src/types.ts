export interface Device {
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

export interface ProviderState {
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
    repeatDays: string[];
  };
  smartBoost: {
    enabled: boolean;
    configured: boolean;
    priorityDevices: string[];
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  customCard?: {
    type: 'diagnostic';
    signalStrength: 'EXCELLENT' | 'GOOD' | 'POOR';
    signalProgress: number;
    planSpeed: string;
    currentSpeed: string;
  };
}
