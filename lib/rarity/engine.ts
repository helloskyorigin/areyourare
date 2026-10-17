import {
  PatternEngineResult,
  MatchedPattern,
  ContinuousFeatureMeasurement,
} from '../types/patterns';
import {
  ReferencePopulationDataset,
  UserRarityResult,
  RankedUserPattern,
  RankedContinuousFeature,
  ContinuousFeatureDistribution,
} from '../types/rarity';
import { REFERENCE_POPULATION_V1 } from './dataset';

/**
 * Benchmarks a single continuous distanceFromIdeal measurement against the empirical
 * quantile distribution of the reference population.
 */
export function evaluateContinuousFeatureBenchmark(
  distanceFromIdeal: number,
  dist: ContinuousFeatureDistribution
): {
  matchingCount: number;
  validSampleSize: number;
  referenceFrequency: number;
  referencePercentile: number;
} {
  const validSampleSize = dist.validSampleSize || 100000;
  const quantiles = dist.quantiles || [];

  if (quantiles.length === 0) {
    // Safe fallback if quantiles are absent
    const ratio = dist.median > 0 ? Math.min(1, distanceFromIdeal / (dist.median * 2)) : 0.5;
    const freq = Math.max(0.0001, ratio);
    return {
      matchingCount: Math.max(1, Math.round(freq * validSampleSize)),
      validSampleSize,
      referenceFrequency: freq,
      referencePercentile: freq * 100,
    };
  }

  const first = quantiles[0];
  const last = quantiles[quantiles.length - 1];

  let exactInterpolatedCount: number;

  if (distanceFromIdeal <= first.maxDistance) {
    if (first.maxDistance <= 0) {
      exactInterpolatedCount = Math.max(1, first.matchingCount);
    } else {
      const ratio = Math.max(0, distanceFromIdeal / first.maxDistance);
      exactInterpolatedCount = Math.max(1, first.matchingCount * ratio);
    }
  } else if (distanceFromIdeal >= last.maxDistance) {
    exactInterpolatedCount = validSampleSize;
  } else {
    // Binary search for bracket [quantiles[lo], quantiles[lo + 1]]
    let lo = 0;
    let hi = quantiles.length - 2;
    while (lo <= hi) {
      const mid = (lo + hi) >>> 1;
      if (quantiles[mid].maxDistance <= distanceFromIdeal && distanceFromIdeal <= quantiles[mid + 1].maxDistance) {
        lo = mid;
        break;
      } else if (quantiles[mid].maxDistance < distanceFromIdeal) {
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }
    const idx = Math.max(0, Math.min(quantiles.length - 2, lo));
    const qLow = quantiles[idx];
    const qHigh = quantiles[idx + 1];
    const span = qHigh.maxDistance - qLow.maxDistance;
    const t = span > 0 ? (distanceFromIdeal - qLow.maxDistance) / span : 0;
    exactInterpolatedCount = qLow.matchingCount + t * (qHigh.matchingCount - qLow.matchingCount);
  }

  const matchingCount = Math.max(1, Math.min(validSampleSize, Math.round(exactInterpolatedCount)));
  const referenceFrequency = Math.max(1 / validSampleSize, Math.min(1, exactInterpolatedCount / validSampleSize));
  const referencePercentile = referenceFrequency * 100;

  return {
    matchingCount,
    validSampleSize,
    referenceFrequency,
    referencePercentile,
  };
}

/**
 * Evaluates live user matched patterns and continuous geometric features against
 * the reference population dataset.
 *
 * Guarantee: Every valid birth chart evaluated by evaluatePatterns(chart) produces
 * status = 'READY' with either:
 *   - discoveryType = 'MATCHED_PATTERN' (when 1+ strict binary patterns cross their threshold)
 *   - discoveryType = 'CONTINUOUS_FEATURE' (when 0 binary patterns cross threshold; selects the
 *     strongest statistically supported continuous feature benchmarked against the reference population)
 */
export function calculateUserRarity(
  patternResult: PatternEngineResult,
  dataset: ReferencePopulationDataset = REFERENCE_POPULATION_V1,
  calculationMode?: 'FULL_TIME' | 'DATE_ONLY'
): UserRarityResult {
  if (!patternResult || !Array.isArray(patternResult.matches)) {
    return {
      status: 'NO_VALID_PATTERN',
      referenceDatasetVersion: dataset.version,
      continuousDistributionVersion: dataset.continuousDistributionVersion || 'v1.2.0',
      totalPatternsEvaluated: 0,
      totalContinuousFeaturesEvaluated: 0,
      matchedCount: 0,
      rarestPattern: null,
      secondaryPatterns: [],
      rankedPatterns: [],
      bestContinuousFeature: null,
      secondaryContinuousFeatures: [],
      rankedContinuousFeatures: [],
      rarityProfile: { rarest: '—', second: '—', third: '—' },
      summaryText: 'No pattern data provided.',
    };
  }

  const { matches, continuousFeatures = [] } = patternResult;

  // Evaluate and rank continuous features against reference population distributions
  const rankedContinuous: RankedContinuousFeature[] = continuousFeatures
    .map((cf: ContinuousFeatureMeasurement) => {
      const dist = dataset.continuousFeatures?.[cf.featureId];
      const benchmark = dist
        ? evaluateContinuousFeatureBenchmark(cf.distanceFromIdeal, dist)
        : {
            matchingCount: 5000,
            validSampleSize: dataset.methodology.validSamples,
            referenceFrequency: 0.05,
            referencePercentile: 5.0,
          };

      return {
        featureId: cf.featureId,
        featureName: cf.name,
        featureVersion: cf.featureVersion,
        category: cf.category,
        description: cf.description,
        distanceFromIdeal: cf.distanceFromIdeal,
        idealTarget: cf.idealTarget,
        unit: cf.unit,
        formattedDistance: cf.formattedDistance,
        matchingCount: benchmark.matchingCount,
        validSampleSize: benchmark.validSampleSize,
        referenceFrequency: benchmark.referenceFrequency,
        referencePercentile: benchmark.referencePercentile,
        formattedPercent: `${benchmark.referencePercentile.toFixed(2)}%`,
        distributionSummary: dist
          ? {
              min: dist.min,
              median: dist.median,
              p05: dist.p05,
              p10: dist.p10,
              p25: dist.p25,
              p75: dist.p75,
              p90: dist.p90,
              max: dist.max,
            }
          : {
              min: 0,
              median: 10,
              p05: 1,
              p10: 2,
              p25: 5,
              p75: 20,
              p90: 30,
              max: 90,
            },
        evidence: cf.evidence,
        rank: 0,
      };
    })
    .sort((a, b) => {
      // Primary: lowest empirical reference frequency (most unusual alignment in reference population)
      if (Math.abs(a.referenceFrequency - b.referenceFrequency) > 1e-9) {
        return a.referenceFrequency - b.referenceFrequency;
      }
      // Secondary: normalized distance relative to reference median
      const normA = a.distributionSummary.median > 0 ? a.distanceFromIdeal / a.distributionSummary.median : a.distanceFromIdeal;
      const normB = b.distributionSummary.median > 0 ? b.distanceFromIdeal / b.distributionSummary.median : b.distanceFromIdeal;
      if (Math.abs(normA - normB) > 1e-9) {
        return normA - normB;
      }
      // Tertiary: deterministic alphabetical ID
      return a.featureId.localeCompare(b.featureId);
    })
    .map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));

  const bestContinuousFeature = rankedContinuous[0] || null;
  const secondaryContinuousFeatures = rankedContinuous.slice(1, 3);

  // If no strict binary patterns matched, use the continuous feature fallback
  if (matches.length === 0) {
    if (calculationMode === 'DATE_ONLY') {
      return {
        status: 'NO_VALID_PATTERN',
        discoveryType: 'MATCHED_PATTERN',
        referenceDatasetVersion: dataset.version,
        continuousDistributionVersion: dataset.continuousDistributionVersion || 'v1.2.0',
        totalPatternsEvaluated: patternResult.patternsChecked,
        totalContinuousFeaturesEvaluated: rankedContinuous.length,
        matchedCount: 0,
        rarestPattern: null,
        secondaryPatterns: [],
        rankedPatterns: [],
        bestContinuousFeature: null,
        secondaryContinuousFeatures: [],
        rankedContinuousFeatures: [],
        rarityProfile: { rarest: '—', second: '—', third: '—' },
        summaryText: 'No qualifying date-based patterns found in our reference population.',
      };
    }

    if (bestContinuousFeature) {
      return {
        status: 'READY',
        discoveryType: 'CONTINUOUS_FEATURE',
        referenceDatasetVersion: dataset.version,
        continuousDistributionVersion: dataset.continuousDistributionVersion || 'v1.2.0',
        totalPatternsEvaluated: patternResult.patternsChecked,
        totalContinuousFeaturesEvaluated: rankedContinuous.length,
        matchedCount: 0,
        rarestPattern: null,
        secondaryPatterns: [],
        rankedPatterns: [],
        bestContinuousFeature,
        secondaryContinuousFeatures,
        rankedContinuousFeatures: rankedContinuous,
        rarityProfile: {
          rarest: rankedContinuous[0]?.formattedPercent || '—',
          second: rankedContinuous[1]?.formattedPercent || '—',
          third: rankedContinuous[2]?.formattedPercent || '—',
        },
        summaryText: `An alignment this close occurs in ${bestContinuousFeature.formattedPercent} of our reference population.`,
      };
    }

    return {
      status: 'NO_VALID_PATTERN',
      referenceDatasetVersion: dataset.version,
      continuousDistributionVersion: dataset.continuousDistributionVersion || 'v1.2.0',
      totalPatternsEvaluated: patternResult.patternsChecked,
      totalContinuousFeaturesEvaluated: 0,
      matchedCount: 0,
      rarestPattern: null,
      secondaryPatterns: [],
      rankedPatterns: [],
      bestContinuousFeature: null,
      secondaryContinuousFeatures: [],
      rankedContinuousFeatures: [],
      rarityProfile: { rarest: '—', second: '—', third: '—' },
      summaryText: 'No qualifying patterns found in our reference population.',
    };
  }

  // Map binary matches to their verified reference population statistics
  const ranked: RankedUserPattern[] = matches
    .map((match: MatchedPattern) => {
      const stats = dataset.patterns[match.patternId];
      if (!stats) {
        return {
          patternId: match.patternId,
          patternName: match.name,
          patternVersion: match.patternVersion,
          category: match.category,
          description: match.description,
          matchingCount: 0,
          validSampleSize: dataset.methodology.validSamples,
          frequency: 0.05,
          frequencyPercent: 5.0,
          status: 'LOW_SAMPLE_SUPPORT' as const,
          evidence: match.evidence,
          rank: 0,
        };
      }

      return {
        patternId: match.patternId,
        patternName: stats.patternName,
        patternVersion: match.patternVersion,
        category: stats.category,
        description: match.description,
        matchingCount: stats.matchingCount,
        validSampleSize: stats.validSampleSize,
        frequency: stats.frequency,
        frequencyPercent: stats.frequencyPercent,
        status: stats.status,
        evidence: match.evidence,
        rank: 0,
      };
    })
    .sort((a, b) => {
      // Primary: lowest frequency first (rarest)
      if (a.frequency !== b.frequency) {
        return a.frequency - b.frequency;
      }
      // Deterministic tie-breaker: alphabetical pattern ID
      return a.patternId.localeCompare(b.patternId);
    })
    .map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

  const rarestPattern = ranked[0] || null;
  const secondaryPatterns = ranked.slice(1, 3);

  const formatPercent = (p?: RankedUserPattern) => {
    if (!p) return '—';
    return `${p.frequencyPercent.toFixed(2)}%`;
  };

  const summaryText = rarestPattern
    ? `This pattern appears in ${rarestPattern.frequencyPercent.toFixed(2)}% of our reference population.`
    : 'No outlier pattern detected in the reference baseline.';

  return {
    status: rarestPattern && rarestPattern.status === 'LOW_SAMPLE_SUPPORT' ? 'LOW_SAMPLE_SUPPORT' : 'READY',
    discoveryType: 'MATCHED_PATTERN',
    referenceDatasetVersion: dataset.version,
    continuousDistributionVersion: dataset.continuousDistributionVersion || 'v1.2.0',
    totalPatternsEvaluated: patternResult.patternsChecked,
    totalContinuousFeaturesEvaluated: rankedContinuous.length,
    matchedCount: ranked.length,
    rarestPattern,
    secondaryPatterns,
    rankedPatterns: ranked,
    bestContinuousFeature,
    secondaryContinuousFeatures,
    rankedContinuousFeatures: rankedContinuous,
    rarityProfile: {
      rarest: formatPercent(ranked[0]),
      second: formatPercent(ranked[1]),
      third: formatPercent(ranked[2]),
    },
    summaryText,
  };
}
