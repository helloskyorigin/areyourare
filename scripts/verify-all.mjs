import { calculateBirthChart } from '../lib/astronomy/engine.ts';
import { evaluatePatterns } from '../lib/patterns/evaluator.ts';
import { calculateUserRarity } from '../lib/rarity/engine.ts';
import { buildVerifiedResult } from '../lib/result/builder.ts';
import { createFallbackExplanation } from '../lib/explanation/service.ts';
import { validateDiscoverPayload } from '../lib/validation/birth-input.ts';
import { verifySystemIntegrity } from '../lib/rarity/integrity.ts';
import { checkRateLimit, resetRateLimitStore } from '../lib/security/rate-limit.ts';
import { checkAbuseLimits } from '../lib/security/abuse.ts';
import { runRarityEngineTests } from '../lib/rarity/__tests__/rarity-engine.test.ts';
import { runBestDiscoveryTests } from '../lib/rarity/__tests__/best-discovery.test.ts';

console.log('================================================================');
console.log('AREYOURARE — COMPLETE PRODUCTION END-TO-END VERIFICATION RUNNER');
console.log('================================================================\n');

const testResults = {
  pass: [],
  fail: [],
  warnings: [],
};

function recordTest(id, name, fn) {
  try {
    fn();
    testResults.pass.push(`[${id}] ${name}`);
    console.log(`✓ [PASS] ${id}: ${name}`);
  } catch (err) {
    testResults.fail.push(`[${id}] ${name} -> ${err.message || err}`);
    console.error(`✗ [FAIL] ${id}: ${name} -> ${err.message || err}`);
  }
}

// 1. Hardcoded Data Audit
recordTest('CHK-01', 'No hardcoded birth data in calculation pipeline', () => {
  const chart1 = calculateBirthChart({
    birthDate: '1995-10-24',
    birthTime: '08:30',
    location: { city: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405, timezone: 'Europe/Berlin' },
  });
  const chart2 = calculateBirthChart({
    birthDate: '1982-04-12',
    birthTime: '21:15',
    location: { city: 'Sydney', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezone: 'Australia/Sydney' },
  });
  if (chart1.planets.Sun.longitude === chart2.planets.Sun.longitude) {
    throw new Error('Calculations produced hardcoded static values across different inputs.');
  }
});

// 2. Real Astronomical Engine Verification
recordTest('CHK-02', 'Phase 2 astronomy calculations are mathematically accurate', () => {
  const chart = calculateBirthChart({
    birthDate: '2000-01-01',
    birthTime: '12:00',
    location: { city: 'Greenwich', country: 'UK', latitude: 51.48, longitude: 0.0, timezone: 'UTC' },
  });

  if (Math.abs(chart.time.julianDay - 2451545.0) > 0.001) {
    throw new Error(`Julian Day calculation inaccurate: got ${chart.time.julianDay}, expected 2451545.0`);
  }

  const sun = chart.planets.Sun;
  if (sun.sign !== 'Capricorn' || sun.longitude < 275 || sun.longitude > 285) {
    throw new Error(`Sun longitude in Capricorn expected around 280°, got ${sun.longitude}°`);
  }

  const bodies = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  bodies.forEach((b) => {
    if (!chart.planets[b] || typeof chart.planets[b].longitude !== 'number' || !chart.planets[b].sign) {
      throw new Error(`Missing planetary body: ${b}`);
    }
  });

  if (!chart.angles.ascendant || !chart.angles.midheaven) {
    throw new Error('Missing Ascendant or Midheaven angles.');
  }

  if (!chart.houses || !Array.isArray(chart.houses.cusps) || chart.houses.cusps.length !== 12) {
    throw new Error(`Expected 12 astrological house cusps, got ${chart.houses?.cusps?.length}`);
  }
});

// 3. Phase 3 Pattern Engine Determinism
recordTest('CHK-03', 'Phase 3 patterns are deterministic & reproducible', () => {
  const input = {
    birthDate: '1990-08-15',
    birthTime: '14:20',
    location: { city: 'Tokyo', country: 'Japan', latitude: 35.6762, longitude: 139.6503, timezone: 'Asia/Tokyo' },
  };

  const chartA = calculateBirthChart(input);
  const chartB = calculateBirthChart(input);
  const patternsA = evaluatePatterns(chartA);
  const patternsB = evaluatePatterns(chartB);

  if (patternsA.matches.length !== patternsB.matches.length) {
    throw new Error('Pattern detection count is non-deterministic.');
  }

  patternsA.matches.forEach((pat, idx) => {
    if (pat.patternId !== patternsB.matches[idx].patternId) {
      throw new Error(`Pattern mismatch at index ${idx}`);
    }
  });
});

// 4. Phase 4 Reference Population Rarity Suite (10 Tests)
const raritySuite = runRarityEngineTests();
raritySuite.forEach((t, idx) => {
  recordTest(`RAR-${String(idx + 1).padStart(2, '0')}`, t.name, () => {
    if (!t.passed) throw new Error(t.details || 'Failed rarity test');
  });
});

// 5. Result Integrity & AI Factual Lock
recordTest('CHK-05', 'AI cannot modify factual measurements or percentiles', () => {
  const fallback = createFallbackExplanation({
    patternId: 'pat_exact_cazimi',
    patternName: 'Heart of the Sun Cazimi Conjunction',
    patternDescription: 'Exact sub-degree alignment with the Sun.',
    category: 'aspect',
    frequencyPercent: 2.318,
    referenceSampleSize: 100000,
    evidence: { separationDegrees: 0.12 },
  });

  if (!fallback.whyItStandsOut.includes('2.32%')) {
    throw new Error('Fallback explanation lost the canonical 2.32% rarity metric.');
  }
  if (!fallback.evidenceExplanation.includes('0.12°')) {
    throw new Error('Fallback explanation lost the measured 0.12° tolerance.');
  }
});

// 6. Rate Limiting Protection
recordTest('CHK-06', 'Rate limiting enforces sliding window and blocks excessive requests', () => {
  resetRateLimitStore();
  const headers = new Headers();
  headers.set('x-forwarded-for', '203.0.113.195');
  const req = { headers };

  const limit = 4;
  for (let i = 0; i < limit; i++) {
    const result = checkRateLimit(req, limit, 10000);
    if (!result.allowed) throw new Error(`Prematurely blocked on request ${i + 1}`);
  }

  const blocked = checkRateLimit(req, limit, 10000);
  if (blocked.allowed) throw new Error('Failed to block request exceeding rate limit.');
  if (blocked.remaining !== 0) throw new Error('Remaining tokens should be 0 when blocked.');
});

// 7. Abuse and Size Boundaries
recordTest('CHK-07', 'Abuse protection rejects oversized payload and malformed fields', () => {
  const hugeBody = {
    birthDate: '1990-01-01',
    birthTime: '12:00',
    location: { city: 'X'.repeat(250) },
  };
  const abuse = checkAbuseLimits(hugeBody);
  if (abuse.passed) throw new Error('Failed to reject string > 150 chars.');
  if (abuse.code !== 'STRING_LENGTH_EXCEEDED') throw new Error(`Wrong abuse code: ${abuse.code}`);
});

// 8. Reference Dataset & Version Compatibility
recordTest('CHK-08', 'Reference dataset v1.1.0 passes structural and mathematical integrity', () => {
  const integrity = verifySystemIntegrity(true);
  if (!integrity.isHealthy) {
    throw new Error(`Integrity errors: ${integrity.errors.join(', ')}`);
  }
  if (integrity.versions.referenceDatasetVersion !== 'v1.1.0') {
    throw new Error(`Wrong dataset version: ${integrity.versions.referenceDatasetVersion}`);
  }
});

// 9. End-to-End Discovery Pipeline Execution
recordTest('CHK-09', 'End-to-end discovery pipeline runs cleanly with real input', () => {
  const input = {
    birthDate: '1993-07-20',
    birthTime: '14:30',
    location: {
      city: 'San Francisco',
      region: 'California',
      country: 'United States',
      latitude: 37.7749,
      longitude: -122.4194,
      timezone: 'America/Los_Angeles',
    },
  };

  const val = validateDiscoverPayload(input);
  if (!val.isValid || !val.sanitized) throw new Error('Validation failed for valid input.');

  const chart = calculateBirthChart(val.sanitized);
  if (!chart.planets.Sun || !chart.angles.ascendant) throw new Error('Chart missing essential coordinates.');

  const patterns = evaluatePatterns(chart);
  if (!Array.isArray(patterns.matches)) throw new Error('Patterns not an array.');

  const rarity = calculateUserRarity(patterns);
  if (!rarity.status) throw new Error('Rarity status missing.');

  const verified = buildVerifiedResult({
    discoveryId: 'disc_test_e2e_001',
    chart,
    patterns,
    rarity,
    explanation: null,
  });

  if (!verified.status || !verified.calculation.version) {
    throw new Error('Verified result missing status or versioning metadata.');
  }
});

// 10. Best Discovery & Continuous Feature Suite (12 Tests)
const bestDiscoverySuite = runBestDiscoveryTests();
bestDiscoverySuite.forEach((t) => {
  recordTest(t.id, t.name, () => {
    if (!t.passed) throw new Error(t.details || 'Failed Best Discovery test');
  });
});

console.log('\n================================================================');
console.log(`TOTAL TESTS: ${testResults.pass.length + testResults.fail.length}`);
console.log(`PASSED: ${testResults.pass.length}`);
console.log(`FAILED: ${testResults.fail.length}`);
console.log('================================================================');

if (testResults.fail.length > 0) {
  process.exit(1);
}
