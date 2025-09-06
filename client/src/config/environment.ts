/**
 * Environment configuration
 * This file centralizes all environment variables and provides type-safe access
 */

interface EnvironmentConfig {
  // Application
  appEnv: 'development' | 'production' | 'test';
  appVersion: string;
  appName: string;
  
  // API
  apiBaseUrl: string;
  
  // Authentication
  oauthAuthUrl: string;
  oauthClientId: string;
  oauthTokenUrl: string;
  oauthRedirectUri: string;
  
  // Feature Flags
  enableAnalytics: boolean;
  enableErrorTracking: boolean;
  
  // Development
  debugMode: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

// Default values for development
const defaultConfig: EnvironmentConfig = {
  appEnv: 'development',
  appVersion: '1.0.0',
  appName: 'Baltek Jobs',
  apiBaseUrl: 'https://api.baltek.net/api',
  oauthAuthUrl: 'https://api.baltek.net/api/oauth2/authorize/',
  oauthClientId: 'your_oauth_client_id',
  oauthTokenUrl: 'https://api.baltek.net/api/oauth2/token/',
  oauthRedirectUri: 'http://localhost:3000/auth/callback',
  enableAnalytics: false,
  enableErrorTracking: false,
  debugMode: true,
  logLevel: 'debug',
};

// Get environment variable with fallback
function getEnvVar(key: string, fallback: string): string {
  return import.meta.env[key] || fallback;
}

// Get boolean environment variable
function getBooleanEnvVar(key: string, fallback: boolean): boolean {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
}

// Get environment variable with type validation
function getTypedEnvVar<T extends string>(
  key: string, 
  fallback: T, 
  validValues: readonly T[]
): T {
  const value = import.meta.env[key] as T;
  return validValues.includes(value) ? value : fallback;
}

// Build configuration from environment variables
export const config: EnvironmentConfig = {
  appEnv: getTypedEnvVar('VITE_APP_ENV', 'development', ['development', 'production', 'test'] as const),
  appVersion: getEnvVar('VITE_APP_VERSION', defaultConfig.appVersion),
  appName: getEnvVar('VITE_APP_NAME', defaultConfig.appName),
  apiBaseUrl: getEnvVar('VITE_API_BASE_URL', defaultConfig.apiBaseUrl),
  oauthAuthUrl: getEnvVar('VITE_OAUTH_AUTH_URL', defaultConfig.oauthAuthUrl),
  oauthClientId: getEnvVar('VITE_OAUTH_CLIENT_ID', defaultConfig.oauthClientId),
  oauthTokenUrl: getEnvVar('VITE_OAUTH_TOKEN_URL', defaultConfig.oauthTokenUrl),
  oauthRedirectUri: getEnvVar('VITE_OAUTH_REDIRECT_URI', defaultConfig.oauthRedirectUri),
  enableAnalytics: getBooleanEnvVar('VITE_ENABLE_ANALYTICS', defaultConfig.enableAnalytics),
  enableErrorTracking: getBooleanEnvVar('VITE_ENABLE_ERROR_TRACKING', defaultConfig.enableErrorTracking),
  debugMode: getBooleanEnvVar('VITE_DEBUG_MODE', defaultConfig.debugMode),
  logLevel: getTypedEnvVar('VITE_LOG_LEVEL', 'debug', ['debug', 'info', 'warn', 'error'] as const),
};

// Validation
if (!config.apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is required');
}

if (!config.oauthClientId || config.oauthClientId === 'your_oauth_client_id') {
  console.warn('VITE_OAUTH_CLIENT_ID is not set or using default value');
}

// Export individual config values for convenience
export const {
  appEnv,
  appVersion,
  appName,
  apiBaseUrl,
  oauthAuthUrl,
  oauthClientId,
  oauthTokenUrl,
  oauthRedirectUri,
  enableAnalytics,
  enableErrorTracking,
  debugMode,
  logLevel,
} = config;

// Environment checks
export const isDevelopment = appEnv === 'development';
export const isProduction = appEnv === 'production';
export const isTest = appEnv === 'test';

// Log configuration in development (only if debug mode is enabled)
if (isDevelopment && debugMode) {
  console.log('🔧 Environment Configuration Loaded:', {
    appEnv,
    appVersion,
    appName,
    apiBaseUrl,
    oauthAuthUrl,
    oauthClientId: oauthClientId.substring(0, 8) + '...', // Mask sensitive data
    oauthTokenUrl,
    oauthRedirectUri,
    debugMode,
    logLevel,
  });
}
