/**
 * OUTLIER Server-Side Production Configuration & Environment Module
 * Validates, types, and isolates runtime environment variables.
 */

export interface AppConfig {
  env: 'development' | 'staging' | 'production' | 'test';
  isProduction: boolean;
  appUrl: string;
  geminiApiKey: string | null;
  rateLimit: {
    maxRequests: number;
    windowMs: number;
  };
  versions: {
    calculationVersion: string;
    astronomyEngineVersion: string;
    patternEngineVersion: string;
    patternRegistryVersion: string;
    referenceDatasetVersion: string;
  };
  timeouts: {
    aiRequestMs: number;
    locationRequestMs: number;
    calculationMs: number;
  };
}

export function getAppConfig(): AppConfig {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isProduction = nodeEnv === 'production';

  const env =
    nodeEnv === 'production'
      ? 'production'
      : nodeEnv === 'test'
      ? 'test'
      : process.env.APP_ENV === 'staging'
      ? 'staging'
      : 'development';

  const appUrl = process.env.APP_URL || (isProduction ? 'https://outlier.app' : 'http://localhost:3000');
  const geminiApiKey = process.env.GEMINI_API_KEY || null;

  const rateLimitMax = parseInt(process.env.RATE_LIMIT_MAX || '30', 10);
  const rateLimitWindowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10);

  return {
    env,
    isProduction,
    appUrl,
    geminiApiKey,
    rateLimit: {
      maxRequests: Number.isNaN(rateLimitMax) ? 30 : rateLimitMax,
      windowMs: Number.isNaN(rateLimitWindowMs) ? 60000 : rateLimitWindowMs,
    },
    versions: {
      calculationVersion: '1.0.0',
      astronomyEngineVersion: '1.0.0',
      patternEngineVersion: 'v1',
      patternRegistryVersion: '1.0',
      referenceDatasetVersion: 'v1.1.0',
    },
    timeouts: {
      aiRequestMs: parseInt(process.env.TIMEOUT_AI_MS || '4000', 10),
      locationRequestMs: parseInt(process.env.TIMEOUT_LOCATION_MS || '3000', 10),
      calculationMs: parseInt(process.env.TIMEOUT_CALCULATION_MS || '2000', 10),
    },
  };
}
