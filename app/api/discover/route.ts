import { NextRequest, NextResponse } from 'next/server';
import { validateDiscoverPayload } from '@/lib/validation/birth-input';
import { DiscoverResponse, ApiErrorResponse } from '@/lib/types/birth-input';
import { calculateBirthChart } from '@/lib/astronomy/engine';
import { evaluatePatterns } from '@/lib/patterns/evaluator';
import { calculateUserRarity } from '@/lib/rarity/engine';
import { generatePatternExplanation } from '@/lib/explanation/service';
import { buildVerifiedResult } from '@/lib/result/builder';
import { checkRateLimit } from '@/lib/security/rate-limit';
import { checkAbuseLimits } from '@/lib/security/abuse';
import { applySecurityHeaders } from '@/lib/security/cors';
import { logger } from '@/lib/logging/logger';
import { metrics } from '@/lib/observability/metrics';
import { verifySystemIntegrity } from '@/lib/rarity/integrity';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

  // 1. Rate Limiting Check
  const rateLimit = checkRateLimit(req);
  if (!rateLimit.allowed) {
    const durationMs = Date.now() - startTime;
    metrics.recordRequest(429, durationMs);
    logger.warn('Rate limit exceeded', {
      requestId,
      endpoint: '/api/discover',
      statusCode: 429,
      durationMs,
      limit: rateLimit.limit,
    });

    const errorPayload: ApiErrorResponse = {
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please wait a moment before trying again.',
      },
    };

    const res = NextResponse.json(errorPayload, { status: 429 });
    res.headers.set('Retry-After', rateLimit.resetSeconds.toString());
    return applySecurityHeaders(res, req);
  }

  try {
    // 2. Request parsing and abuse bounds checking
    const contentLength = req.headers.get('content-length');
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      const durationMs = Date.now() - startTime;
      metrics.recordRequest(400, durationMs);
      const errorPayload: ApiErrorResponse = {
        error: {
          code: 'MALFORMED_REQUEST',
          message: 'Invalid JSON request payload.',
        },
      };
      const res = NextResponse.json(errorPayload, { status: 400 });
      return applySecurityHeaders(res, req);
    }

    const abuseCheck = checkAbuseLimits(body, contentLength);
    if (!abuseCheck.passed) {
      const durationMs = Date.now() - startTime;
      metrics.recordRequest(400, durationMs);
      const errorPayload: ApiErrorResponse = {
        error: {
          code: abuseCheck.code || 'INVALID_INPUT',
          message: abuseCheck.message || 'Request payload violates size or length restrictions.',
        },
      };
      const res = NextResponse.json(errorPayload, { status: 400 });
      return applySecurityHeaders(res, req);
    }

    // 3. System Integrity & Version Verification
    const integrity = verifySystemIntegrity();
    if (!integrity.isHealthy) {
      const durationMs = Date.now() - startTime;
      metrics.recordRequest(503, durationMs);
      logger.error('Reference dataset integrity failure', {
        requestId,
        endpoint: '/api/discover',
        statusCode: 503,
        durationMs,
        errors: integrity.errors,
      });

      const errorPayload: ApiErrorResponse = {
        error: {
          code: 'SERVICE_UNAVAILABLE',
          message: 'The calculation engine is temporarily unavailable due to integrity verification. Please try again later.',
        },
      };
      const res = NextResponse.json(errorPayload, { status: 503 });
      return applySecurityHeaders(res, req);
    }

    // 4. Input Validation & Geographic Normalization
    const validation = validateDiscoverPayload(body);
    if (!validation.isValid || !validation.sanitized) {
      const durationMs = Date.now() - startTime;
      metrics.recordRequest(400, durationMs);
      const errorPayload: ApiErrorResponse = {
        error: {
          code: validation.error?.code || 'INVALID_INPUT',
          message: validation.error?.message || 'Invalid birth input.',
        },
      };
      const res = NextResponse.json(errorPayload, { status: 400 });
      return applySecurityHeaders(res, req);
    }

    const { birthDate, birthTime, location, calculation_mode } = validation.sanitized;
    const discoveryId = `disc_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;

    // 5. Phase 2: Deterministic Astronomical Chart Calculation
    let chart;
    try {
      chart = calculateBirthChart({
        birthDate,
        birthTime,
        location,
        calculation_mode,
      });
    } catch (calcErr: unknown) {
      const durationMs = Date.now() - startTime;
      metrics.recordRequest(422, durationMs);
      logger.error('Astronomy calculation failed', {
        requestId,
        endpoint: '/api/discover',
        statusCode: 422,
        durationMs,
        errorCode: 'ASTRONOMY_CALCULATION_FAILED',
      });

      const errorPayload: ApiErrorResponse = {
        error: {
          code: 'ASTRONOMY_CALCULATION_FAILED',
          message:
            calcErr instanceof Error
              ? calcErr.message
              : 'Unable to calculate astronomical chart coordinates for the given datetime and location.',
        },
      };
      const res = NextResponse.json(errorPayload, { status: 422 });
      return applySecurityHeaders(res, req);
    }

    // 6. Phase 3: Deterministic Pattern Rules Evaluation
    let patterns;
    try {
      patterns = evaluatePatterns(chart);
    } catch {
      const durationMs = Date.now() - startTime;
      metrics.recordRequest(500, durationMs);
      logger.error('Pattern evaluation failed', {
        requestId,
        endpoint: '/api/discover',
        statusCode: 500,
        durationMs,
        errorCode: 'PATTERN_EVALUATION_FAILED',
      });

      const errorPayload: ApiErrorResponse = {
        error: {
          code: 'PATTERN_EVALUATION_FAILED',
          message: 'Unable to evaluate chart patterns against registry rules.',
        },
      };
      const res = NextResponse.json(errorPayload, { status: 500 });
      return applySecurityHeaders(res, req);
    }

    // 7. Phase 4: Reference Population Rarity Lookup & Ranking
    let rarity;
    try {
      rarity = calculateUserRarity(patterns, undefined, calculation_mode);
    } catch {
      const durationMs = Date.now() - startTime;
      metrics.recordRequest(500, durationMs);
      logger.error('Rarity calculation failed', {
        requestId,
        endpoint: '/api/discover',
        statusCode: 500,
        durationMs,
        errorCode: 'RARITY_CALCULATION_FAILED',
      });

      const errorPayload: ApiErrorResponse = {
        error: {
          code: 'RARITY_CALCULATION_FAILED',
          message: 'Unable to compute pattern rarity frequencies against the reference population.',
        },
      };
      const res = NextResponse.json(errorPayload, { status: 500 });
      return applySecurityHeaders(res, req);
    }

    // 8. Phase 5: Verified AI Explanation with Factual Lock & Graceful Fallback
    let explanation = null;
    if (rarity.rarestPattern) {
      try {
        explanation = await generatePatternExplanation({
          discoveryType: 'MATCHED_PATTERN',
          patternId: rarity.rarestPattern.patternId,
          patternName: rarity.rarestPattern.patternName,
          patternDescription: rarity.rarestPattern.description,
          category: rarity.rarestPattern.category,
          frequencyPercent: rarity.rarestPattern.frequencyPercent,
          referenceSampleSize: rarity.rarestPattern.validSampleSize,
          evidence: rarity.rarestPattern.evidence,
        });
      } catch {
        explanation = null;
      }
    } else if (rarity.bestContinuousFeature) {
      try {
        explanation = await generatePatternExplanation({
          discoveryType: 'CONTINUOUS_FEATURE',
          patternId: rarity.bestContinuousFeature.featureId,
          patternName: rarity.bestContinuousFeature.featureName,
          patternDescription: rarity.bestContinuousFeature.description,
          category: rarity.bestContinuousFeature.category,
          frequencyPercent: rarity.bestContinuousFeature.referencePercentile,
          referenceSampleSize: rarity.bestContinuousFeature.validSampleSize,
          evidence: rarity.bestContinuousFeature.evidence,
        });
      } catch {
        explanation = null;
      }
    }

    // 9. Build Canonical Verified Result Object
    const verifiedResult = buildVerifiedResult({
      discoveryId,
      chart,
      patterns,
      rarity,
      explanation,
      calculation_mode,
    });

    const responsePayload: DiscoverResponse = {
      success: true,
      discoveryId,
      birthInput: {
        birthDate,
        birthTime,
        location,
      },
      chart,
      patterns,
      rarity,
      result: verifiedResult,
      status: 'ready',
    };

    const durationMs = Date.now() - startTime;
    metrics.recordRequest(200, durationMs);

    logger.info('Discovery processed successfully', {
      requestId,
      endpoint: '/api/discover',
      statusCode: 200,
      durationMs,
      discoveryType: verifiedResult.discoveryType || 'MATCHED_PATTERN',
      patternId: rarity.rarestPattern?.patternId || rarity.bestContinuousFeature?.featureId || 'NONE',
    });

    const res = NextResponse.json(responsePayload, { status: 200 });
    res.headers.set('X-Request-ID', requestId);
    return applySecurityHeaders(res, req);
  } catch (err: unknown) {
    const durationMs = Date.now() - startTime;
    metrics.recordRequest(500, durationMs);

    logger.error('Unexpected internal error in /api/discover', {
      requestId,
      endpoint: '/api/discover',
      statusCode: 500,
      durationMs,
      error: err instanceof Error ? err.message : 'Unknown error',
    });

    const internalError: ApiErrorResponse = {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred while processing birth details. Please try again.',
      },
    };
    const res = NextResponse.json(internalError, { status: 500 });
    return applySecurityHeaders(res, req);
  }
}

export async function OPTIONS(req: NextRequest) {
  const res = new NextResponse(null, { status: 204 });
  return applySecurityHeaders(res, req);
}
