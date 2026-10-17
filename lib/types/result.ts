export interface CanonicalExplanation {
  summary: string;
  whyItStandsOut: string;
  evidenceExplanation: string;
  isAiGenerated: boolean;
}

export interface CanonicalPrimaryPattern {
  id: string;
  name: string;
  category: string;
  description: string;
  evidence: Record<string, unknown>;
}

export interface CanonicalRarityStats {
  frequency: number;
  frequencyPercent: number;
  matchingCount: number;
  referenceSampleSize: number;
  formattedPercent: string;
  percentileText: string;
}

export interface CanonicalSecondaryPattern {
  id: string;
  name: string;
  category: string;
  description: string;
  frequency: number;
  frequencyPercent: number;
  formattedPercent: string;
  evidence: Record<string, unknown>;
  discoveryType?: 'MATCHED_PATTERN' | 'CONTINUOUS_FEATURE';
  formattedDistance?: string;
}

export interface CanonicalSharePayload {
  brand: 'AREYOURARE' | 'OUTLIER';
  discoveryType?: 'MATCHED_PATTERN' | 'CONTINUOUS_FEATURE';
  headline: string;
  patternName: string;
  percentileText: string;
  frequencyPercent: number;
  referenceLabel: string;
}

export interface CanonicalMatchedPatternDiscovery {
  type: 'MATCHED_PATTERN';
  patternId: string;
  patternName: string;
  category: string;
  description: string;
  frequency: number;
  frequencyPercent: number;
  formattedPercent: string;
  matchingCount: number;
  referenceSampleSize: number;
  sectionLabel: 'YOUR STRONGEST DISCOVERY';
  evidence: Record<string, unknown>;
}

export interface CanonicalContinuousFeatureDiscovery {
  type: 'CONTINUOUS_FEATURE';
  featureId: string;
  featureName: string;
  category: string;
  description: string;
  referencePercentile: number;
  formattedPercent: string;
  matchingCount: number;
  referenceSampleSize: number;
  sectionLabel: 'YOUR MOST UNUSUAL ALIGNMENT';
  measurement: {
    distanceFromIdeal: number;
    idealTarget: number;
    unit: 'degrees' | 'degrees_per_day';
    formattedDistance: string;
  };
  referenceDistribution: {
    datasetVersion: string;
    sampleSize: number;
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
}

export type CanonicalDiscovery =
  | CanonicalMatchedPatternDiscovery
  | CanonicalContinuousFeatureDiscovery;

export interface CanonicalVerifiedResult {
  status: 'READY' | 'NO_VALID_PATTERN' | 'LOW_SAMPLE_SUPPORT' | 'CALCULATION_ERROR' | 'EXPLANATION_ERROR';
  discoveryType?: 'MATCHED_PATTERN' | 'CONTINUOUS_FEATURE';
  calculation_mode?: 'FULL_TIME' | 'DATE_ONLY';
  discovery?: CanonicalDiscovery | null;
  discoveryId: string;
  calculation: {
    version: 'v1';
    engineName: string;
    engineVersion: string;
  };
  reference: {
    datasetVersion: string;
    continuousDistributionVersion?: string;
    sampleSize: number;
    source: string;
  };
  primaryPattern: CanonicalPrimaryPattern | null;
  rarity: CanonicalRarityStats | null;
  explanation: CanonicalExplanation | null;
  otherPatterns: CanonicalSecondaryPattern[];
  rarityProfile: {
    rarest: string;
    second: string;
    third: string;
  };
  sharePayload: CanonicalSharePayload | null;
  calculatedAt: string;
}
