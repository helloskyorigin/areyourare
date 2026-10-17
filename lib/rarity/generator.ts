import {
  ReferencePopulationDataset,
  PatternFrequencyStats,
  ContinuousFeatureDistribution,
  EmpiricalQuantilePoint,
} from '../types/rarity';
import { PATTERN_REGISTRY } from '../patterns/registry';
import { CONTINUOUS_FEATURE_REGISTRY } from '../patterns/continuous';
import { calculateBirthChart } from '../astronomy/engine';
import { evaluatePatterns } from '../patterns/evaluator';
import { GLOBAL_CITIES } from '../cities';

export interface ReferenceGeneratorConfig {
  datasetVersion?: string;
  seed: string;
  sampleSize: number;
  startYear?: number;
  endYear?: number;
}

/**
 * Deterministic Pseudo-Random Number Generator (FNV-1a + Xorshift32)
 * Guarantees 100% bit-level reproducibility across runtimes given the same seed string.
 */
export function createSeededRandom(seedStr: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return function nextRandom(): number {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    h += h << 5;
    return (h >>> 0) / 4294967296;
  };
}

/**
 * Finds the exact count of elements in a sorted ascending array that are <= target
 */
function countLessOrEqual(sorted: number[], target: number): number {
  let lo = 0;
  let hi = sorted.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (sorted[mid] <= target + 1e-12) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }
  return lo;
}

const QUANTILE_PERCENT_CHECKPOINTS: number[] = [
  0.01, 0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0,
  1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 3.5, 4.0, 4.5, 5.0,
  6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
  21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
  36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50,
  52, 54, 56, 58, 60, 62, 64, 66, 68, 70, 72, 74, 76, 78, 80,
  82, 84, 86, 88, 90, 92, 94, 96, 98, 100,
];

/**
 * Batch reference population simulation generator.
 * Runs deterministic Phase 2 & Phase 3 calculations (both strict patterns and continuous features)
 * on a controlled distribution.
 */
export function generateReferencePopulationDataset(
  config: ReferenceGeneratorConfig
): ReferencePopulationDataset {
  const {
    datasetVersion = 'v1.1.0',
    seed,
    sampleSize,
    startYear = 1940,
    endYear = 2025,
  } = config;
  const rng = createSeededRandom(seed);

  let validSamples = 0;
  let invalidSamples = 0;
  let matchedPatternCharts = 0;
  let continuousFeatureCharts = 0;

  // Initialize binary pattern match counters
  const patternCounts: Record<string, number> = {};
  for (const pattern of PATTERN_REGISTRY) {
    patternCounts[pattern.id] = 0;
  }

  // Initialize continuous feature sample arrays
  const featureSamples: Record<string, number[]> = {};
  for (const feat of CONTINUOUS_FEATURE_REGISTRY) {
    featureSamples[feat.id] = [];
  }

  const citiesCount = GLOBAL_CITIES.length;

  for (let s = 0; s < sampleSize; s++) {
    // 1. Generate deterministic date in range [startYear, endYear]
    const year = startYear + Math.floor(rng() * (endYear - startYear + 1));
    const month = 1 + Math.floor(rng() * 12);
    const isLeap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const daysInMonth = [31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    const day = 1 + Math.floor(rng() * daysInMonth[month - 1]);

    const birthDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

    // 2. Generate deterministic local time [00:00 - 23:59]
    const hour = Math.floor(rng() * 24);
    const minute = Math.floor(rng() * 60);
    const birthTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

    // 3. Select city from global representative distribution
    const city = GLOBAL_CITIES[Math.floor(rng() * citiesCount)];

    try {
      // Phase 2 Astronomy calculation
      const chart = calculateBirthChart({
        birthDate,
        birthTime,
        location: {
          city: city.name,
          region: city.region,
          country: city.country,
          latitude: city.lat,
          longitude: city.lng,
          timezone: city.timezone,
        },
      });

      // Phase 3 Pattern & Continuous Feature evaluation
      const patternResult = evaluatePatterns(chart);

      if (patternResult.matches.length > 0) {
        matchedPatternCharts++;
      } else {
        continuousFeatureCharts++;
      }

      for (const match of patternResult.matches) {
        if (patternCounts[match.patternId] !== undefined) {
          patternCounts[match.patternId]++;
        }
      }

      if (patternResult.continuousFeatures) {
        for (const cf of patternResult.continuousFeatures) {
          if (featureSamples[cf.featureId]) {
            featureSamples[cf.featureId].push(cf.distanceFromIdeal);
          }
        }
      }

      validSamples++;
    } catch {
      invalidSamples++;
    }
  }

  // Build structured binary pattern statistics
  const patterns: Record<string, PatternFrequencyStats> = {};

  for (const p of PATTERN_REGISTRY) {
    const matchCount = patternCounts[p.id] || 0;
    const frequency = validSamples > 0 ? matchCount / validSamples : 0;
    const frequencyPercent = frequency * 100;

    let status: PatternFrequencyStats['status'] = 'ADEQUATE_SUPPORT';
    if (matchCount === 0) {
      status = 'INSUFFICIENT_OBSERVATIONS';
    } else if (matchCount < 5) {
      status = 'LOW_SAMPLE_SUPPORT';
    }

    patterns[p.id] = {
      patternId: p.id,
      patternName: p.name,
      category: p.category,
      matchingCount: matchCount,
      validSampleSize: validSamples,
      frequency,
      frequencyPercent,
      status,
    };
  }

  // Build empirical continuous feature distributions
  const continuousFeatures: Record<string, ContinuousFeatureDistribution> = {};

  for (const feat of CONTINUOUS_FEATURE_REGISTRY) {
    const raw = featureSamples[feat.id] || [];
    const sorted = [...raw].sort((a, b) => a - b);
    const n = sorted.length;

    if (n === 0) continue;

    const getAtPercent = (pct: number) => {
      const idx = Math.max(0, Math.min(n - 1, Math.round((pct / 100) * n) - 1));
      return Number(sorted[idx].toFixed(6));
    };

    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const mean = Number((sum / n).toFixed(6));
    const min = Number(sorted[0].toFixed(6));
    const max = Number(sorted[n - 1].toFixed(6));

    const quantiles: EmpiricalQuantilePoint[] = [];
    for (const pct of QUANTILE_PERCENT_CHECKPOINTS) {
      const maxDist = getAtPercent(pct);
      const count = countLessOrEqual(sorted, maxDist);
      const cumPct = Number(((count / n) * 100).toFixed(4));

      // Avoid duplicate consecutive maxDistance points
      if (quantiles.length === 0 || maxDist > quantiles[quantiles.length - 1].maxDistance) {
        quantiles.push({
          maxDistance: maxDist,
          matchingCount: count,
          cumulativePercent: cumPct,
        });
      }
    }

    continuousFeatures[feat.id] = {
      featureId: feat.id,
      featureName: feat.name,
      category: feat.category,
      unit: feat.unit,
      idealTarget: feat.idealTarget,
      validSampleSize: n,
      min,
      max,
      mean,
      median: getAtPercent(50),
      p01: getAtPercent(1),
      p05: getAtPercent(5),
      p10: getAtPercent(10),
      p25: getAtPercent(25),
      p75: getAtPercent(75),
      p90: getAtPercent(90),
      quantiles,
    };
  }

  return {
    version: datasetVersion,
    continuousDistributionVersion: 'v1.2.0',
    astronomyEngineVersion: '1.0.0',
    patternEngineVersion: 'v1',
    patternRegistryVersion: '1.0',
    generatedAt: new Date().toISOString(),
    methodology: {
      source: 'AREYOURARE Computational Reference Sample (v1.1.0 / v1.2.0)',
      seed,
      totalSamples: sampleSize,
      validSamples,
      invalidSamples,
      dateRange: { start: `${startYear}-01-01`, end: `${endYear}-12-31` },
      samplingMethod:
        'Uniform civil date/time distribution across 60 global coordinate anchors using FNV-1a/Xorshift32 PRNG',
      geographicDistribution: `${citiesCount} verified global coordinate anchors across all major continents and timezones`,
    },
    discoveryBreakdown: {
      matchedPatternCharts,
      matchedPatternPercent: validSamples > 0 ? Number(((matchedPatternCharts / validSamples) * 100).toFixed(3)) : 0,
      continuousFeatureCharts,
      continuousFeaturePercent: validSamples > 0 ? Number(((continuousFeatureCharts / validSamples) * 100).toFixed(3)) : 0,
    },
    patterns,
    continuousFeatures,
  };
}
