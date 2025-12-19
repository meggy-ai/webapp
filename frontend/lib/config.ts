/**
 * Centralized configuration for the Bruno PA frontend application.
 * All environment variables and app configuration should be managed here.
 */

import { getDefaults, type ConfigDefaults } from './config.defaults';

// Get environment defaults
const environment = process.env.NODE_ENV || process.env.NEXT_PUBLIC_APP_ENV || 'development';
const defaults = getDefaults(environment);

// Environment variable validation and defaults
const getEnvVar = (key: string, configPath: keyof ConfigDefaults, configKey: string, required = false): string => {
  const value = process.env[key];
  const defaultValue = defaults[configPath][configKey as keyof ConfigDefaults[keyof ConfigDefaults]] as string;
  
  if (required && !value && !defaultValue) {
    throw new Error(`Environment variable ${key} is required but not provided and no default available`);
  }
  
  return value || defaultValue;
};

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
  const env = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || defaults.app.environment;
  
  if (env === 'production' || env === 'test') {
    return env as 'production' | 'test';
  }
  
  return 'development';
};

// WebSocket URL construction
const getWebSocketUrl = (): string => {
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  
  if (wsUrl) {
    return wsUrl;
  }
  
  // Use default from config or fallback construction
  const defaultWsUrl = defaults.websocket.baseUrl;
  if (defaultWsUrl) {
    return defaultWsUrl;
  }
  
  // Last resort: construct from API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || defaults.api.baseUrl;
  if (apiUrl) {
    const wsProtocol = apiUrl.startsWith('https') ? 'wss:' : 'ws:';
    const baseUrl = apiUrl.replace(/^https?:\/\//, '').replace('/api', '');
    return `${wsProtocol}//${baseUrl}/ws`;
  }
  
  throw new Error('Unable to determine WebSocket URL: no environment variable or default provided');
};

// Main configuration object
const config: AppConfiguration = {
  api: {
    baseUrl: getEnvVar('NEXT_PUBLIC_API_URL', 'api', 'baseUrl', environment === 'production'),
    timeout: parseInt(getEnvVar('NEXT_PUBLIC_API_TIMEOUT', 'api', 'timeout'), 10),
  },
  websocket: {
    url: getWebSocketUrl(),
    reconnectInterval: parseInt(getEnvVar('NEXT_PUBLIC_WS_RECONNECT_INTERVAL', 'websocket', 'reconnectInterval'), 10),
    maxReconnectAttempts: parseInt(getEnvVar('NEXT_PUBLIC_WS_MAX_RECONNECT_ATTEMPTS', 'websocket', 'maxReconnectAttempts'), 10),
  },
  app: {
    name: getEnvVar('NEXT_PUBLIC_APP_NAME', 'app', 'name'),
    environment: getEnvironment(),
    telemetryDisabled: getEnvVar('NEXT_TELEMETRY_DISABLED', 'app', 'telemetryDisabled') === 'true',
  },
};

// Validation function
const validateConfig = (): void => {
  const { api, websocket, app } = config;
  
  // Validate API configuration
  if (!api.baseUrl) {
    throw new Error('API base URL is required');
  }
  
  if (api.timeout < 1000) {
    console.warn('API timeout is set to less than 1 second, this may cause issues');
  }
  
  // Validate WebSocket configuration
  if (!websocket.url) {
    throw new Error('WebSocket URL is required');
  }
  
  if (websocket.reconnectInterval < 1000) {
    console.warn('WebSocket reconnect interval is set to less than 1 second');
  }
  
  // Validate app configuration
  if (!app.name) {
    console.warn('App name is not configured');
  }
  
  // Environment-specific validations
  if (app.environment === 'production') {
    if (api.baseUrl.includes('localhost')) {
      console.warn('Production environment is using localhost API URL');
    }
    
    if (websocket.url.includes('localhost')) {
      console.warn('Production environment is using localhost WebSocket URL');
    }
  }
};

// Run validation on load
try {
  validateConfig();
} catch (error) {
  console.error('Configuration validation failed:', error);
  if (config.app.environment === 'production') {
    throw error; // Fail hard in production
  }
}

// Export configuration and types
export type { ApiConfig, WebSocketConfig, AppConfig, AppConfiguration };
export { config };
export default config;