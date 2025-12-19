/**
 * Default configuration values for Bruno PA frontend application.
 * These values are used when environment variables are not provided.
 * 
 * This file should be updated for different deployment environments.
 */

export interface ConfigDefaults {
  api: {
    baseUrl: string;
    timeout: string;
  };
  websocket: {
    baseUrl: string;
    reconnectInterval: string;
    maxReconnectAttempts: string;
  };
  app: {
    name: string;
    environment: string;
    telemetryDisabled: string;
  };
}

/**
 * Development environment defaults
 */
export const developmentDefaults: ConfigDefaults = {
  api: {
    baseUrl: 'http://localhost:8000/api',
    timeout: '30000',
  },
  websocket: {
    baseUrl: 'ws://localhost:8000/ws',
    reconnectInterval: '5000',
    maxReconnectAttempts: '5',
  },
  app: {
    name: 'Bruno Personal Assistant',
    environment: 'development',
    telemetryDisabled: 'true',
  },
};

/**
 * Production environment defaults
 */
export const productionDefaults: ConfigDefaults = {
  api: {
    baseUrl: '', // Must be provided via environment variable in production
    timeout: '30000',
  },
  websocket: {
    baseUrl: '', // Must be provided via environment variable in production
    reconnectInterval: '5000',
    maxReconnectAttempts: '3', // Lower retry count for production
  },
  app: {
    name: 'Bruno Personal Assistant',
    environment: 'production',
    telemetryDisabled: 'false',
  },
};

/**
 * Test environment defaults
 */
export const testDefaults: ConfigDefaults = {
  api: {
    baseUrl: 'http://localhost:8000/api',
    timeout: '10000', // Shorter timeout for tests
  },
  websocket: {
    baseUrl: 'ws://localhost:8000/ws',
    reconnectInterval: '1000', // Faster reconnection for tests
    maxReconnectAttempts: '2',
  },
  app: {
    name: 'Bruno Personal Assistant (Test)',
    environment: 'test',
    telemetryDisabled: 'true',
  },
};

/**
 * Get defaults based on environment
 */
export const getDefaults = (environment?: string): ConfigDefaults => {
  const env = environment || process.env.NODE_ENV || 'development';
  
  switch (env) {
    case 'production':
      return productionDefaults;
    case 'test':
      return testDefaults;
    case 'development':
    default:
      return developmentDefaults;
  }
};