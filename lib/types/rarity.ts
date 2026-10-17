export type RarityObservationStatus =
  | 'ADEQUATE_SUPPORT'
  | 'LOW_SAMPLE_SUPPORT'
  | 'INSUFFICIENT_OBSERVATIONS';

export type DiscoveryMode = 'MATCHED_PATTERN' | 'CONTINUOUS_FEATURE';

export interface PatternFrequencyStats {
  patternId: string;
  patternName: string;
  category: string;
  matchingCount: number;
  validSampleSize: number;
  frequency: number; // e.g. 0.0068
  frequencyPercent: number; // e.g. 0.68
  status: RarityObservationStatus;
}

export interface EmpiricalQuantilePoint {
  /** Upper bound distanceFromIdeal at this empirical checkpoint */
  maxDistance: number;
  /** Exact number of reference population charts with distanceFromIdeal <= maxDistance */
  matchingCount: number;
  /** Cumulative percentage (0 to 100) of reference population with distanceFromIdeal <= maxDistance */
  cumulativePercent: number;
}

export interface ContinuousFeatureDistribution {
  featureId: string;
  featureName: string;
  category: string;
  unit: 'degrees' | 'degrees_per_day';
  idealTarget: number;
  validSampleSize: number;
  min: number;
  max: number;
  mean: number;
  median: number;
  p01: number;
  p05: number;
  p10: number;
  p25: number;
  p75: number;
  p90: number;
  quantiles: EmpiricalQuantilePoint[];
}

export interface ReferencePopulationMetadata {
  version: string;
  continuousDistributionVersion?: string;
  astronomyEngineVersion: string;
  patternEngineVersion: string;
  patternRegistryVersion: string;
  generatedAt: string;
  methodology: {
    source: string;
    seed: string;
    totalSamples: number;
    validSamples: number;
    invalidSamples: number;
    dateRange: { start: string; end: string };
    samplingMethod: string;
    geographicDistribution: string;
  };
}

export interface ReferencePopulationDataset extends ReferencePopulationMetadata {
  patterns: Record<string, PatternFrequencyStats>;
  continuousFeatures?: Record<string, ContinuousFeatureDistribution>;
  discoveryBreakdown?: {
    matchedPatternCharts: number;
    matchedPatternPercent: number;
    continuousFeatureCharts: number;
    continuousFeaturePercent: number;
  };
}

export interface RankedUserPattern extends PatternFrequencyStats {
  patternVersion: string;
  description: string;
  evidence: Record<string, unknown>;
  rank: number;
}

export interface RankedContinuousFeature {
  featureId: string;
  featureName: string;
  featureVersion: string;
  category: string;
  description: string;
  distanceFromIdeal: number;
  idealTarget: number;
  unit: 'degrees' | 'degrees_per_day';
  formattedDistance: string;
  matchingCount: number;
  validSampleSize: number;
  referenceFrequency: number;
  referencePercentile: number;
  formattedPercent: string;
  distributionSummary: {
    min: number;
    median: number;
    p05: number;
    p10: number;
    p25: number;
    p75: number;
    p90: number;
    max: number;
  };
  evidence: Record<string, unknown>;
  rank: number;
}

export interface UserRarityResult {
  status: 'READY' | 'NO_VALID_PATTERN' | 'LOW_SAMPLE_SUPPORT';
  discoveryType?: DiscoveryMode;
  referenceDatasetVersion: string;
  continuousDistributionVersion?: string;
  totalPatternsEvaluated: number;
  totalContinuousFeaturesEvaluated?: number;
  matchedCount: number;
  rarestPattern: RankedUserPattern | null;
  secondaryPatterns: RankedUserPattern[];
  rankedPatterns: RankedUserPattern[];
  bestContinuousFeature?: RankedContinuousFeature | null;
  secondaryContinuousFeatures?: RankedContinuousFeature[];
  rankedContinuousFeatures?: RankedContinuousFeature[];
  rarityProfile: {
    rarest: string;
    second: string;
    third: string;
  };
  summaryText: string;
}
