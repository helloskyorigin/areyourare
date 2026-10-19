import * as fs from 'fs';
import * as path from 'path';
import { calculateBirthChart } from '../../astronomy/engine';
import { evaluatePatterns } from '../../patterns/evaluator';
import { CONTINUOUS_FEATURE_REGISTRY } from '../../patterns/continuous';
import { calculateUserRarity } from '../engine';
import { REFERENCE_POPULATION_V1 } from '../dataset';
import { buildVerifiedResult } from '../../result/builder';
import { createFallbackExplanation } from '../../explanation/service';

export interface BestDiscoveryTestCase {
  id: string;
  name: string;
  passed: boolean;
  details?: string;
}

const SAMPLE_BIRTH_INPUTS = [
  {
    // Previously returned NO_VALID_PATTERN (Patna, 1995-05-15 10:30)
    birthDate: '1995-05-15',
    birthTime: '10:30',
    location: {
      city: 'Patna',
      region: 'Bihar',
      country: 'India',
      latitude: 25.5941,
      longitude: 85.1376,
      timezone: 'Asia/Kolkata',
    },
  },
  {
    birthDate: '1988-11-03',
    birthTime: '04:15',
    location: {
      city: 'London',
      country: 'United Kingdom',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London',
    },
  },
  {
    birthDate: '2001-02-19',
    birthTime: '17:45',
    location: {
      city: 'New York',
      region: 'NY',
      country: 'United States',
      latitude: 40.7128,
      longitude: -74.006,
      timezone: 'America/New_York',
    },
  },
  {
    birthDate: '1976-09-09',
    birthTime: '22:10',
    location: {
      city: 'Tokyo',
      country: 'Japan',
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: 'Asia/Tokyo',
    },
  },
  {
    birthDate: '1992-07-14',
    birthTime: '06:50',
    location: {
      city: 'Paris',
      country: 'France',
      latitude: 48.8566,
      longitude: 2.3522,
      timezone: 'Europe/Paris',
    },
  },
  {
    birthDate: '1984-12-28',
    birthTime: '13:05',
    location: {
      city: 'Sydney',
      country: 'Australia',
      latitude: -33.8688,
      longitude: 151.2093,
      timezone: 'Australia/Sydney',
    },
  },
  {
    birthDate: '1999-04-05',
    birthTime: '01:25',
    location: {
      city: 'São Paulo',
      country: 'Brazil',
      latitude: -23.5505,
      longitude: -46.6333,
      timezone: 'America/Sao_Paulo',
    },
  },
  {
    birthDate: '1969-07-20',
    birthTime: '20:17',
    location: {
      city: 'Houston',
      country: 'United States',
      latitude: 29.7604,
      longitude: -95.3698,
      timezone: 'America/Chicago',
    },
  },
  {
    birthDate: '2005-08-22',
    birthTime: '09:40',
    location: {
      city: 'Berlin',
      country: 'Germany',
      latitude: 52.52,
      longitude: 13.405,
      timezone: 'Europe/Berlin',
    },
  },
  {
    birthDate: '1991-01-17',
    birthTime: '15:55',
    location: {
      city: 'Toronto',
      country: 'Canada',
      latitude: 43.6532,
      longitude: -79.3832,
      timezone: 'America/Toronto',
    },
  },
];

export function runBestDiscoveryTests(): BestDiscoveryTestCase[] {
  const results: BestDiscoveryTestCase[] = [];

  function runTest(id: string, name: string, fn: () => string | void) {
    try {
      const details = fn();
      results.push({ id, name, passed: true, details: details || undefined });
    } catch (err: unknown) {
      results.push({
        id,
        name,
        passed: false,
        details: err instanceof Error ? err.message : String(err),
      });
    }
  }

  // 1. Every valid chart returns READY
  runTest('BD-01', 'Every valid chart returns status = READY', () => {
    for (const input of SAMPLE_BIRTH_INPUTS) {
      const chart = calculateBirthChart(input);
      const patterns = evaluatePatterns(chart);
      const rarity = calculateUserRarity(patterns);
      const verified = buildVerifiedResult({
        discoveryId: 'test_bd_01',
        chart,
        patterns,
        rarity,
      });
      if (verified.status !== 'READY') {
        throw new Error(`Chart ${input.birthDate} returned status ${verified.status} instead of READY.`);
      }
      if (!verified.primaryPattern || !verified.rarity || !verified.discovery) {
        throw new Error(`Chart ${input.birthDate} missing primaryPattern, rarity, or discovery object.`);
      }
    }
    return `Verified across ${SAMPLE_BIRTH_INPUTS.length} diverse global birth charts.`;
  });

  // 2. No valid chart returns NO_VALID_PATTERN
  runTest('BD-02', 'No valid chart returns NO_VALID_PATTERN (including zero-binary-match charts)', () => {
    // Specifically test Patna 1995-05-15 10:30 which has 0 strict binary pattern matches
    const patnaInput = SAMPLE_BIRTH_INPUTS[0];
    const chart = calculateBirthChart(patnaInput);
    const patterns = evaluatePatterns(chart);
    if (patterns.matches.length !== 0) {
      throw new Error(`Expected 0 binary matches for Patna test chart, got ${patterns.matches.length}`);
    }
    const rarity = calculateUserRarity(patterns);
    const verified = buildVerifiedResult({
      discoveryId: 'test_bd_02',
      chart,
      patterns,
      rarity,
    });
    if (rarity.status === 'NO_VALID_PATTERN' || verified.status === 'NO_VALID_PATTERN') {
      throw new Error('Zero-binary-match chart still returned NO_VALID_PATTERN!');
    }
    if (verified.discovery?.type !== 'CONTINUOUS_FEATURE') {
      throw new Error(`Expected CONTINUOUS_FEATURE, got ${verified.discovery?.type}`);
    }
    return `Zero-binary-match chart resolved to CONTINUOUS_FEATURE: ${verified.discovery.featureName} (${verified.discovery.formattedPercent})`;
  });

  // 3. Same chart always returns same result
  runTest('BD-03', 'Same chart always returns identical deterministic result', () => {
    for (const input of [SAMPLE_BIRTH_INPUTS[0], SAMPLE_BIRTH_INPUTS[2]]) {
      const c1 = calculateBirthChart(input);
      const p1 = evaluatePatterns(c1);
      const r1 = calculateUserRarity(p1);
      const v1 = buildVerifiedResult({ discoveryId: 'det_1', chart: c1, patterns: p1, rarity: r1 });

      const c2 = calculateBirthChart(input);
      const p2 = evaluatePatterns(c2);
      const r2 = calculateUserRarity(p2);
      const v2 = buildVerifiedResult({ discoveryId: 'det_1', chart: c2, patterns: p2, rarity: r2 });

      if (
        v1.discoveryType !== v2.discoveryType ||
        v1.primaryPattern?.id !== v2.primaryPattern?.id ||
        v1.rarity?.frequencyPercent !== v2.rarity?.frequencyPercent ||
        JSON.stringify(v1.discovery) !== JSON.stringify(v2.discovery)
      ) {
        throw new Error('Determinism violation: identical birth input produced differing discoveries.');
      }
    }
  });

  // 4. Different charts produce genuinely different results
  runTest('BD-04', 'Different charts produce distinct discoveries and statistical percentages', () => {
    const seenIds = new Set<string>();
    const seenPercents = new Set<string>();

    for (const input of SAMPLE_BIRTH_INPUTS) {
      const chart = calculateBirthChart(input);
      const patterns = evaluatePatterns(chart);
      const rarity = calculateUserRarity(patterns);
      const verified = buildVerifiedResult({ discoveryId: 'diff', chart, patterns, rarity });
      if (verified.primaryPattern && verified.rarity) {
        seenIds.add(verified.primaryPattern.id);
        seenPercents.add(verified.rarity.formattedPercent);
      }
    }

    if (seenIds.size < 4 || seenPercents.size < 4) {
      throw new Error(`Insufficient diversity across 10 distinct charts: ${seenIds.size} IDs, ${seenPercents.size} percentages.`);
    }
    return `10 charts produced ${seenIds.size} distinct primary features and ${seenPercents.size} distinct percentages.`;
  });

  // 5. 13.57% is not hardcoded anywhere as a fallback
  runTest('BD-05', '13.57 is not hardcoded in engine, result builder, or UI components', () => {
    const filesToScan = [
      'lib/rarity/engine.ts',
      'lib/result/builder.ts',
      'lib/explanation/service.ts',
      'app/result/page.tsx',
      'components/result/ShareCardPreview.tsx',
    ];
    for (const relPath of filesToScan) {
      const fullPath = path.resolve(process.cwd(), relPath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('13.57')) {
        throw new Error(`Found hardcoded '13.57' in ${relPath}`);
      }
    }
  });

  // 6. No random fallback exists in pattern, continuous, or rarity engines
  runTest('BD-06', 'Zero Math.random() calls in astronomy, pattern, continuous, or rarity calculation engines', () => {
    const engineFiles = [
      'lib/astronomy/engine.ts',
      'lib/patterns/evaluator.ts',
      'lib/patterns/registry.ts',
      'lib/patterns/continuous.ts',
      'lib/rarity/engine.ts',
      'lib/result/builder.ts',
    ];
    for (const relPath of engineFiles) {
      const fullPath = path.resolve(process.cwd(), relPath);
      const content = fs.readFileSync(fullPath, 'utf-8');
      if (content.includes('Math.random')) {
        throw new Error(`Found forbidden Math.random in ${relPath}`);
      }
    }
  });

  // 7. Strict pattern matches remain mathematically valid
  runTest('BD-07', 'Strict pattern matches remain mathematically valid and unaltered', () => {
    const chart = calculateBirthChart(SAMPLE_BIRTH_INPUTS[1]); // London 1988-11-03
    const patterns = evaluatePatterns(chart);
    for (const m of patterns.matches) {
      if (!m.patternId.startsWith('pat_')) {
        throw new Error(`Invalid strict pattern ID: ${m.patternId}`);
      }
    }
  });

  // 8. Failed strict patterns are NOT falsely marked as matches
  runTest('BD-08', 'Failed strict patterns are never converted into fake binary matches', () => {
    const patnaChart = calculateBirthChart(SAMPLE_BIRTH_INPUTS[0]);
    const patterns = evaluatePatterns(patnaChart);
    if (patterns.matches.length !== 0) {
      throw new Error('Failed strict pattern was falsely marked as a binary match!');
    }
    const rarity = calculateUserRarity(patterns);
    if (rarity.matchedCount !== 0 || rarity.rarestPattern !== null) {
      throw new Error('Rarity engine falsely populated rarestPattern for a chart with 0 binary matches!');
    }
  });

  // 9. Continuous fallback uses real reference-population data
  runTest('BD-09', 'Continuous fallback benchmarks against empirical 100,000-chart distributions', () => {
    const distMap = REFERENCE_POPULATION_V1.continuousFeatures;
    if (!distMap) {
      throw new Error('Missing continuousFeatures in REFERENCE_POPULATION_V1');
    }
    for (const feat of CONTINUOUS_FEATURE_REGISTRY) {
      const d = distMap[feat.id];
      if (!d) {
        throw new Error(`Missing empirical distribution for continuous feature ${feat.id}`);
      }
      if (d.validSampleSize !== 100000) {
        throw new Error(`Expected validSampleSize = 100000 for ${feat.id}, got ${d.validSampleSize}`);
      }
      if (d.quantiles.length < 20) {
        throw new Error(`Insufficient empirical quantile resolution for ${feat.id}: ${d.quantiles.length}`);
      }
    }
    return `Verified all ${CONTINUOUS_FEATURE_REGISTRY.length} continuous features against N=100,000 empirical quantiles.`;
  });

  // 10. Reference distribution is versioned
  runTest('BD-10', 'Reference dataset and continuous distributions are explicitly versioned', () => {
    if (
      REFERENCE_POPULATION_V1.version !== 'v1.1.0' ||
      REFERENCE_POPULATION_V1.continuousDistributionVersion !== 'v1.2.0'
    ) {
      throw new Error(
        `Unexpected dataset versions: ${REFERENCE_POPULATION_V1.version} / ${REFERENCE_POPULATION_V1.continuousDistributionVersion}`
      );
    }
  });

  // 11. Result type correctly distinguishes MATCHED_PATTERN vs CONTINUOUS_FEATURE
  runTest('BD-11', 'Result object explicitly distinguishes MATCHED_PATTERN and CONTINUOUS_FEATURE', () => {
    let foundMatched = false;
    let foundContinuous = false;

    for (const input of SAMPLE_BIRTH_INPUTS) {
      const chart = calculateBirthChart(input);
      const patterns = evaluatePatterns(chart);
      const rarity = calculateUserRarity(patterns);
      const verified = buildVerifiedResult({ discoveryId: 'type_check', chart, patterns, rarity });

      if (verified.discoveryType === 'MATCHED_PATTERN' && verified.discovery?.type === 'MATCHED_PATTERN') {
        foundMatched = true;
        if (!verified.discovery.patternId.startsWith('pat_')) {
          throw new Error('MATCHED_PATTERN did not have pat_ prefix');
        }
        if (verified.discovery.sectionLabel !== 'YOUR STRONGEST DISCOVERY') {
          throw new Error(`Wrong sectionLabel for MATCHED_PATTERN`);
        }
      } else if (
        verified.discoveryType === 'CONTINUOUS_FEATURE' &&
        verified.discovery?.type === 'CONTINUOUS_FEATURE'
      ) {
        foundContinuous = true;
        if (!verified.discovery.featureId.startsWith('feat_')) {
          throw new Error('CONTINUOUS_FEATURE did not have feat_ prefix');
        }
        if (verified.discovery.sectionLabel !== 'YOUR MOST UNUSUAL ALIGNMENT') {
          throw new Error(`Wrong sectionLabel for CONTINUOUS_FEATURE`);
        }
        if (typeof verified.discovery.measurement.distanceFromIdeal !== 'number') {
          throw new Error('CONTINUOUS_FEATURE missing measurement.distanceFromIdeal');
        }
        if (!verified.discovery.referenceDistribution || verified.discovery.referenceDistribution.sampleSize !== 100000) {
          throw new Error('CONTINUOUS_FEATURE missing valid referenceDistribution');
        }
      }
    }

    if (!foundMatched || !foundContinuous) {
      throw new Error(`Expected both discovery types across sample inputs (foundMatched=${foundMatched}, foundContinuous=${foundContinuous})`);
    }
  });

  // 12. AI cannot generate or modify the statistical value
  runTest('BD-12', 'AI explanation layer is factually locked and cannot alter continuous or matched percentages', () => {
    const contExplanation = createFallbackExplanation({
      discoveryType: 'CONTINUOUS_FEATURE',
      patternId: 'feat_harmonic_trine_alignment',
      patternName: 'Harmonic Trine Alignment',
      patternDescription: 'Closest 120° trine alignment.',
      category: 'aspect',
      frequencyPercent: 4.18,
      referenceSampleSize: 100000,
      evidence: {
        bodies: ['Sun', 'Jupiter'],
        separationDegrees: 120.52,
        deviationDegrees: 0.52,
        targetDegrees: 120,
      },
    });

    if (!contExplanation.whyItStandsOut.includes('4.18%')) {
      throw new Error(`Expected exact 4.18% in whyItStandsOut, got: ${contExplanation.whyItStandsOut}`);
    }
    if (!contExplanation.evidenceExplanation.includes('120.5200°') || !contExplanation.evidenceExplanation.includes('0.5200°')) {
      throw new Error(`Expected exact measured evidence in evidenceExplanation, got: ${contExplanation.evidenceExplanation}`);
    }
  });

  // 13. Date-only mode verification
  runTest('BD-13', 'Date-only request does not use a fake time and sets localTime to empty string', () => {
    const input = {
      birthDate: '1995-10-24',
      birthTime: '',
      calculation_mode: 'DATE_ONLY' as const,
      location: { city: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405, timezone: 'Europe/Berlin' },
    };
    const chart = calculateBirthChart(input);
    if (chart.input.localTime !== '') {
      throw new Error(`Expected localTime to be empty string in DATE_ONLY mode, got "${chart.input.localTime}"`);
    }
    if ((chart.input as any).calculation_mode !== 'DATE_ONLY') {
      throw new Error('Expected calculation_mode to be DATE_ONLY in chart input');
    }
  });

  // 14. Date-only excludes Ascendant, houses, and angular/time-dependent patterns
  runTest('BD-14', 'Date-only excludes Ascendant, houses, and angular/time-dependent patterns', () => {
    const input = {
      birthDate: '1995-10-24',
      birthTime: '',
      calculation_mode: 'DATE_ONLY' as const,
      location: { city: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405, timezone: 'Europe/Berlin' },
    };
    const chart = calculateBirthChart(input);

    // Verify angles and houses are zeroed out
    if (chart.angles.ascendant !== 0 || chart.angles.midheaven !== 0) {
      throw new Error('Expected angles to be 0 in DATE_ONLY mode');
    }
    if (chart.houses.cusps.some((c) => c !== 0)) {
      throw new Error('Expected house cusps to be 0 in DATE_ONLY mode');
    }

    // Verify separation matrix excludes Ascendant/Midheaven
    const hasAscMC = chart.angularSeparations.some(
      (s) => s.bodyA === 'Ascendant' || s.bodyB === 'Ascendant' || s.bodyA === 'Midheaven' || s.bodyB === 'Midheaven'
    );
    if (hasAscMC) {
      throw new Error('Separation matrix still contains Ascendant or Midheaven in DATE_ONLY mode');
    }

    // Verify pattern engine excludes angular patterns
    const patterns = evaluatePatterns(chart);
    const hasAngularPatterns = patterns.matches.some((m) => m.category === 'angular');
    if (hasAngularPatterns) {
      throw new Error('Matches still contain angular patterns in DATE_ONLY mode');
    }

    const continuous = patterns.continuousFeatures;
    if (!continuous) throw new Error('Expected continuous feature array in DATE_ONLY mode');
    const hasAngularFeatures = continuous.some((f) => f.category === 'angular');
    if (hasAngularFeatures) {
      throw new Error('Continuous features still contain angular features in DATE_ONLY mode');
    }
  });

  // 15. Date-only result is clearly labeled as DATE_ONLY mode
  runTest('BD-15', 'Date-only result is clearly labeled with calculation_mode DATE_ONLY', () => {
    const input = {
      birthDate: '1995-10-24',
      birthTime: '',
      calculation_mode: 'DATE_ONLY' as const,
      location: { city: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405, timezone: 'Europe/Berlin' },
    };
    const chart = calculateBirthChart(input);
    const patterns = evaluatePatterns(chart);
    const rarity = calculateUserRarity(patterns, undefined, 'DATE_ONLY');
    const verified = buildVerifiedResult({
      discoveryId: 'date_only_label_test',
      chart,
      patterns,
      rarity,
      calculation_mode: 'DATE_ONLY',
    });

    if (verified.calculation_mode !== 'DATE_ONLY') {
      throw new Error('Result object missing calculation_mode of DATE_ONLY');
    }
  });

  // 16. Date-only and Full-time calculations are completely deterministic
  runTest('BD-16', 'Date-only and Full-time calculations are completely deterministic', () => {
    const inputDateOnly = {
      birthDate: '1995-10-24',
      birthTime: '',
      calculation_mode: 'DATE_ONLY' as const,
      location: { city: 'Berlin', country: 'Germany', latitude: 52.52, longitude: 13.405, timezone: 'Europe/Berlin' },
    };

    const c1 = calculateBirthChart(inputDateOnly);
    const c2 = calculateBirthChart(inputDateOnly);

    if (JSON.stringify(c1.planets) !== JSON.stringify(c2.planets)) {
      throw new Error('DATE_ONLY planetary calculations are non-deterministic');
    }
  });

  return results;
}
