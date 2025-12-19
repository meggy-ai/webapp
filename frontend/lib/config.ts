/**
 * Centralized configuration for the Bruno PA frontend application.
 * Uses environment variables with sensible defaults following industry standards.
 */

// Configuration interfaces
interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

interface AppConfig {
  name: string;
  environment: 'development' | 'production' | 'test';
  telemetryDisabled: boolean;
}

interface AppConfiguration {
  api: ApiConfig;
  websocket: WebSocketConfig;
  app: AppConfig;
}

// Environment detection
const getEnvironment = (): 'development' | 'production' | 'test' => {
  const env = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development';
  
  if (env === 'production' || env === 'test') {
    return env as 'production' | 'test';
  }
  
  return 'development';
};

// WebSocket URL construction
const getWebSocketUrl = (): string => {
  // Use explicit WebSocket URL if provided
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  if (wsUrl) {
    return wsUrl;
  }
  
  // Auto-construct from API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
  const wsProtocol = apiUrl.startsWith('https') ? 'wss:' : 'ws:';
  const baseUrl = apiUrl.replace(/^https?:\/\//, '').replace('/api', '');
  
  return `${wsProtocol}//${baseUrl}/ws`;
};

// Main configuration object - Industry standard pattern
const config: AppConfiguration = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  },
  websocket: {
    url: getWebSocketUrl(),
    reconnectInterval: parseInt(process.env.NEXT_PUBLIC_WS_RECONNECT_INTERVAL || '5000', 10),
    maxReconnectAttempts: parseInt(process.env.NEXT_PUBLIC_WS_MAX_RECONNECT_ATTEMPTS || '5', 10),
  },
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'Bruno Personal Assistant',
    environment: getEnvironment(),
    telemetryDisabled: (process.env.NEXT_TELEMETRY_DISABLED || 'true') === 'true',
  },
};

// Simple validation
if (config.app.environment === 'production') {
  if (config.api.baseUrl.includes('localhost')) {
    console.warn('⚠️ Production environment is using localhost API URL');
  }
  if (config.websocket.url.includes('localhost')) {
    console.warn('⚠️ Production environment is using localhost WebSocket URL');
  }
}

// Export configuration and types
export type { ApiConfig, WebSocketConfig, AppConfig, AppConfiguration };
export { config };
export default config;