import { getAppConfig } from '../config/env';

export interface HeaderCarrier {
  headers: {
    get(name: string): string | null;
  };
}

interface RateLimitRecord {
  timestamps: number[];
}

// In-memory token store with periodic automatic cleanup
const ipStore = new Map<string, RateLimitRecord>();
let lastCleanup = Date.now();

function cleanupExpiredRecords(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < 30000) return; // Clean up at most once every 30 seconds
  lastCleanup = now;

  const threshold = now - windowMs;
  for (const [ip, record] of ipStore.entries()) {
    const validTimestamps = record.timestamps.filter((t) => t > threshold);
    if (validTimestamps.length === 0) {
      ipStore.delete(ip);
    } else {
      record.timestamps = validTimestamps;
    }
  }
}

/**
 * Extracts client IP safely from request headers
 */
export function getClientIp(req: HeaderCarrier): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfConnectingIp = req.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  return '127.0.0.1';
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetSeconds: number;
}

/**
 * Checks rate limit for the client IP using a sliding window algorithm
 */
export function checkRateLimit(req: HeaderCarrier, customLimit?: number, customWindowMs?: number): RateLimitResult {
  const config = getAppConfig();
  const limit = customLimit ?? config.rateLimit.maxRequests;
  const windowMs = customWindowMs ?? config.rateLimit.windowMs;

  cleanupExpiredRecords(windowMs);

  const ip = getClientIp(req);
  const now = Date.now();
  const threshold = now - windowMs;

  let record = ipStore.get(ip);
  if (!record) {
    record = { timestamps: [] };
    ipStore.set(ip, record);
  }

  // Filter timestamps within the current sliding window
  record.timestamps = record.timestamps.filter((t) => t > threshold);

  if (record.timestamps.length >= limit) {
    const oldest = record.timestamps[0];
    const resetSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    return {
      allowed: false,
      limit,
      remaining: 0,
      resetSeconds,
    };
  }

  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);
  const resetSeconds = Math.ceil(windowMs / 1000);

  return {
    allowed: true,
    limit,
    remaining,
    resetSeconds,
  };
}

/**
 * Resets rate limit store (used in test suites)
 */
export function resetRateLimitStore(): void {
  ipStore.clear();
}
