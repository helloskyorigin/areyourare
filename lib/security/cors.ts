import { NextRequest, NextResponse } from 'next/server';
import { getAppConfig } from '../config/env';

/**
 * Validates origin header against configured allowed origins
 */
export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true; // Direct/same-origin navigation or server-to-server

  const config = getAppConfig();
  if (!config.isProduction) {
    return true; // Allow localhost and preview hosts in dev/staging
  }

  // Allow production app URL
  try {
    const originUrl = new URL(origin);
    const appUrl = new URL(config.appUrl);
    if (originUrl.host === appUrl.host) return true;

    // Allow *.run.app and cloud preview domains in GCP environments
    if (originUrl.hostname.endsWith('.run.app')) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
}

/**
 * Applies security and CORS headers to Next.js responses
 */
export function applySecurityHeaders(res: NextResponse, req?: NextRequest): NextResponse {
  // CORS
  const origin = req?.headers.get('origin');
  if (origin && isAllowedOrigin(origin)) {
    res.headers.set('Access-Control-Allow-Origin', origin);
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, X-Request-ID');
    res.headers.set('Access-Control-Max-Age', '86400');
  }

  // Security Headers
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.headers.set('X-Frame-Options', 'SAMEORIGIN');

  const config = getAppConfig();
  if (config.isProduction) {
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  return res;
}
