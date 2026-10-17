import { BirthChartResult } from '../types/astronomy';
import { PatternEngineResult } from '../types/patterns';
import { UserRarityResult } from '../types/rarity';
import { CanonicalVerifiedResult, CanonicalExplanation } from '../types/result';

export interface BuildResultParams {
  discoveryId: string;
  chart: BirthChartResult;
  patterns: PatternEngineResult;
  rarity: UserRarityResult;
  explanation?: CanonicalExplanation | null;
  calculation_mode?: 'FULL_TIME' | 'DATE_ONLY';
}

/**
 * Builds the canonical verified result object from Phase 2-5 pipelines.
 * Enforces factual truth: all numerical metrics are directly mapped from verified engines.
 * Distinguishes between MATCHED_PATTERN (strict binary threshold match) and
 * CONTINUOUS_FEATURE (objectively measured continuous feature benchmarked against reference population).
 */
export function buildVerifiedResult(params: BuildResultParams): CanonicalVerifiedResult {
  const { discoveryId, chart, rarity, explanation = null, calculation_mode = 'FULL_TIME' } = params;

  // Case 1: Strict binary pattern matched (MATCHED_PATTERN)
  if (rarity.rarestPattern) {
    const primary = rarity.rarestPattern;
    const otherPatterns = rarity.secondaryPatterns.map((p) => ({
      id: p.patternId,
      name: p.patternName,
      category: p.category,
      description: p.description,
      frequency: p.frequency,
      frequencyPercent: p.frequencyPercent,
      formattedPercent: `${p.frequencyPercent.toFixed(2)}%`,
      evidence: p.evidence,
      discoveryType: 'MATCHED_PATTERN' as const,
    }));

    const formattedPercent = `${primary.frequencyPercent.toFixed(2)}%`;

    return {
      status: rarity.status === 'LOW_SAMPLE_SUPPORT' ? 'LOW_SAMPLE_SUPPORT' : 'READY',
      discoveryType: 'MATCHED_PATTERN',
      calculation_mode,
      discovery: {
        type: 'MATCHED_PATTERN',
        patternId: primary.patternId,
        patternName: primary.patternName,
        category: primary.category,
        description: primary.description,
        frequency: primary.frequency,
        frequencyPercent: primary.frequencyPercent,
        formattedPercent,
        matchingCount: primary.matchingCount,
        referenceSampleSize: primary.validSampleSize,
        sectionLabel: 'YOUR STRONGEST DISCOVERY',
        evidence: primary.evidence,
      },
      discoveryId,
      calculation: {
        version: 'v1',
        engineName: chart.engine.name,
        engineVersion: chart.engine.version,
      },
      reference: {
        datasetVersion: rarity.referenceDatasetVersion,
        continuousDistributionVersion: rarity.continuousDistributionVersion || 'v1.2.0',
        sampleSize: primary.validSampleSize,
        source: 'AREYOURARE Global Reference Baseline (v1.1.0)',
      },
      primaryPattern: {
        id: primary.patternId,
        name: primary.patternName,
        category: primary.category,
        description: primary.description,
        evidence: primary.evidence,
      },
      rarity: {
        frequency: primary.frequency,
        frequencyPercent: primary.frequencyPercent,
        matchingCount: primary.matchingCount,
        referenceSampleSize: primary.validSampleSize,
        formattedPercent,
        percentileText: formattedPercent,
      },
      explanation,
      otherPatterns,
      rarityProfile: rarity.rarityProfile,
      sharePayload: {
        brand: 'AREYOURARE',
        discoveryType: 'MATCHED_PATTERN',
        headline: 'I found my rarity.',
        patternName: primary.patternName,
        percentileText: formattedPercent,
        frequencyPercent: primary.frequencyPercent,
        referenceLabel: 'of our reference population',
      },
      calculatedAt: new Date().toISOString(),
    };
  }

  // Case 2: Continuous feature discovery (CONTINUOUS_FEATURE)
  if (rarity.bestContinuousFeature) {
    const best = rarity.bestContinuousFeature;
    const otherPatterns = (rarity.secondaryContinuousFeatures || []).map((f) => ({
      id: f.featureId,
      name: f.featureName,
      category: f.category,
      description: f.description,
      frequency: f.referenceFrequency,
      frequencyPercent: f.referencePercentile,
      formattedPercent: f.formattedPercent,
      formattedDistance: f.formattedDistance,
      evidence: f.evidence,
      discoveryType: 'CONTINUOUS_FEATURE' as const,
    }));

    return {
      status: 'READY',
      discoveryType: 'CONTINUOUS_FEATURE',
      calculation_mode,
      discovery: {
        type: 'CONTINUOUS_FEATURE',
        featureId: best.featureId,
        featureName: best.featureName,
        category: best.category,
        description: best.description,
        referencePercentile: best.referencePercentile,
        formattedPercent: best.formattedPercent,
        matchingCount: best.matchingCount,
        referenceSampleSize: best.validSampleSize,
        sectionLabel: 'YOUR MOST UNUSUAL ALIGNMENT',
        measurement: {
          distanceFromIdeal: best.distanceFromIdeal,
          idealTarget: best.idealTarget,
          unit: best.unit,
          formattedDistance: best.formattedDistance,
        },
        referenceDistribution: {
          datasetVersion: rarity.continuousDistributionVersion || 'v1.2.0',
          sampleSize: best.validSampleSize,
          ...best.distributionSummary,
        },
        evidence: best.evidence,
      },
      discoveryId,
      calculation: {
        version: 'v1',
        engineName: chart.engine.name,
        engineVersion: chart.engine.version,
      },
      reference: {
        datasetVersion: rarity.referenceDatasetVersion,
        continuousDistributionVersion: rarity.continuousDistributionVersion || 'v1.2.0',
        sampleSize: best.validSampleSize,
        source: 'AREYOURARE Global Reference Baseline (v1.2.0)',
      },
      primaryPattern: {
        id: best.featureId,
        name: best.featureName,
        category: best.category,
        description: best.description,
        evidence: best.evidence,
      },
      rarity: {
        frequency: best.referenceFrequency,
        frequencyPercent: best.referencePercentile,
        matchingCount: best.matchingCount,
        referenceSampleSize: best.validSampleSize,
        formattedPercent: best.formattedPercent,
        percentileText: best.formattedPercent,
      },
      explanation,
      otherPatterns,
      rarityProfile: rarity.rarityProfile,
      sharePayload: {
        brand: 'AREYOURARE',
        discoveryType: 'CONTINUOUS_FEATURE',
        headline: 'I found my most unusual alignment.',
        patternName: best.featureName,
        percentileText: best.formattedPercent,
        frequencyPercent: best.referencePercentile,
        referenceLabel: 'of our reference population',
      },
      calculatedAt: new Date().toISOString(),
    };
  }

  // Technical fallback only if both pattern and continuous arrays were completely empty
  return {
    status: 'NO_VALID_PATTERN',
    discoveryId,
    calculation_mode,
    calculation: {
      version: 'v1',
      engineName: chart.engine.name,
      engineVersion: chart.engine.version,
    },
    reference: {
      datasetVersion: rarity.referenceDatasetVersion,
      sampleSize: 100000,
      source: 'AREYOURARE Global Reference Baseline',
    },
    primaryPattern: null,
    rarity: null,
    explanation: null,
    otherPatterns: [],
    rarityProfile: {
      rarest: '—',
      second: '—',
      third: '—',
    },
    sharePayload: null,
    calculatedAt: new Date().toISOString(),
  };
}
