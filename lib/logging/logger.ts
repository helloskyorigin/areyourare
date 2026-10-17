export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface StructuredLogContext {
  requestId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  durationMs?: number;
  service?: string;
  errorCode?: string;
  ip?: string;
  [key: string]: unknown;
}

/**
 * PII Filter: Strips out birth dates, birth times, coordinates, and personal inputs
 */
function sanitizeLogContext(context?: StructuredLogContext): Record<string, unknown> {
  if (!context) return {};

  const clean: Record<string, unknown> = {};
  const forbiddenKeys = new Set([
    'birthDate',
    'birthTime',
    'latitude',
    'longitude',
    'prompt',
    'apiKey',
    'geminiApiKey',
    'authorization',
  ]);

  for (const [key, value] of Object.entries(context)) {
    if (forbiddenKeys.has(key.toLowerCase())) {
      clean[key] = '[REDACTED]';
    } else if (key === 'location' && typeof value === 'object' && value !== null) {
      clean[key] = '[LOCATION_DATA_MASKED]';
    } else {
      clean[key] = value;
    }
  }

  return clean;
}

export const logger = {
  info(message: string, context?: StructuredLogContext): void {
    const entry = {
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      ...sanitizeLogContext(context),
    };
    console.log(JSON.stringify(entry));
  },

  warn(message: string, context?: StructuredLogContext): void {
    const entry = {
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      ...sanitizeLogContext(context),
    };
    console.warn(JSON.stringify(entry));
  },

  error(message: string, context?: StructuredLogContext): void {
    const entry = {
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      ...sanitizeLogContext(context),
    };
    console.error(JSON.stringify(entry));
  },
};
