import { checkRateLimit, resetRateLimitStore } from '../rate-limit';
import { checkAbuseLimits } from '../abuse';
import { isAllowedOrigin } from '../cors';
import { verifySystemIntegrity } from '../../rarity/integrity';
import { createFallbackExplanation } from '../../explanation/service';
import { calculateBirthChart } from '../../astronomy/engine';
import { evaluatePatterns } from '../../patterns/evaluator';
import { calculateUserRarity } from '../../rarity/engine';
import { NextRequest } from 'next/server';

export interface ProductionTestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export function runProductionHardeningTests(): ProductionTestResult[] {
  const results: ProductionTestResult[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: unknown) {
      results.push({
        name,
        passed: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 1. Rate Limiting Tests
  test('Rate Limiter: enforces sliding window limit', () => {
    resetRateLimitStore();
    const fakeReq = new NextRequest('http://localhost:3000/api/discover', {
      headers: { 'x-forwarded-for': '192.0.2.1' },
    });

    const limit = 5;
    const windowMs = 10000;

    for (let i = 0; i < limit; i++) {
      const res = checkRateLimit(fakeReq, limit, windowMs);
      if (!res.allowed) throw new Error(`Request ${i + 1} was prematurely blocked.`);
    }

    // Next request must be blocked
    const blockedRes = checkRateLimit(fakeReq, limit, windowMs);
    if (blockedRes.allowed) {
      throw new Error('Rate limit was not enforced after reaching limit.');
    }
    if (blockedRes.resetSeconds <= 0) {
      throw new Error('Invalid resetSeconds returned.');
    }
  });

  // 2. Abuse Protection Tests
  test('Abuse Protection: rejects oversized strings', () => {
    const longCity = 'A'.repeat(200);
    const check = checkAbuseLimits({
      birthDate: '1990-05-15',
      birthTime: '14:30',
      location: { city: longCity },
    });

    if (check.passed) {
      throw new Error('Abuse check failed to reject string exceeding 150 characters.');
    }
    if (check.code !== 'STRING_LENGTH_EXCEEDED') {
      throw new Error(`Expected STRING_LENGTH_EXCEEDED, got ${check.code}`);
    }
  });

  test('Abuse Protection: rejects oversized payload headers', () => {
    const check = checkAbuseLimits({ ok: true }, '15000'); // 15KB header
    if (check.passed) {
      throw new Error('Abuse check failed to reject payload > 10KB.');
    }
    if (check.code !== 'PAYLOAD_TOO_LARGE') {
      throw new Error(`Expected PAYLOAD_TOO_LARGE, got ${check.code}`);
    }
  });

  // 3. System Integrity & Reference Dataset
  test('System Integrity: validates reference dataset V1 and engine versions', () => {
    const integrity = verifySystemIntegrity(true);
    if (!integrity.isHealthy) {
      throw new Error(`System integrity failed: ${integrity.errors.join('; ')}`);
    }
    if (integrity.registryCount === 0 || integrity.datasetPatternCount === 0) {
      throw new Error('Registry or dataset contains zero patterns.');
    }
  });

  // 4. AI Failure Isolation
  test('AI Failure Isolation: provides verified deterministic fallback', () => {
    const fallback = createFallbackExplanation({
      patternId: 'pat_solar_zenith_mc',
      patternName: 'Solar Midheaven Zenith Alignment',
      patternDescription: 'Sun conjunct Midheaven meridian axis.',
      category: 'angular',
      frequencyPercent: 0.68,
      referenceSampleSize: 100000,
      evidence: { separationDegrees: 0.42 },
    });

    if (fallback.isAiGenerated) {
      throw new Error('Fallback should flag isAiGenerated: false');
    }
    if (!fallback.whyItStandsOut.includes('0.68%')) {
      throw new Error('Fallback failed to embed exact reference percentage.');
    }
    if (!fallback.evidenceExplanation.includes('0.42°')) {
      throw new Error('Fallback failed to incorporate measured numerical evidence.');
    }
  });

  // 5. CORS Validation
  test('CORS: allows permitted origins and same-origin', () => {
    if (!isAllowedOrigin(null)) {
      throw new Error('Direct or same-origin requests should be permitted.');
    }
  });

  // 6. Concurrency Isolation
  test('Concurrency: isolated calculation outputs for distinct inputs', () => {
    const input1 = {
      birthDate: '1985-03-20',
      birthTime: '06:00',
      location: { city: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
    };
    const input2 = {
      birthDate: '2002-11-10',
      birthTime: '23:45',
      location: { city: 'London', country: 'UK', latitude: 51.5074, longitude: -0.1278, timezone: 'Europe/London' },
    };

    const chart1 = calculateBirthChart(input1);
    const chart2 = calculateBirthChart(input2);

    if (chart1.sun.longitude === chart2.sun.longitude) {
      throw new Error('Concurrent state leak detected between separate chart calculations.');
    }

    const patterns1 = evaluatePatterns(chart1);
    const patterns2 = evaluatePatterns(chart2);

    const rarity1 = calculateUserRarity(patterns1);
    const rarity2 = calculateUserRarity(patterns2);

    if (rarity1.rarestPattern?.patternId === rarity2.rarestPattern?.patternId && chart1.sun.sign === chart2.sun.sign) {
      throw new Error('Unexpected identical pattern outputs across differing inputs.');
    }
  });

  return results;
}
