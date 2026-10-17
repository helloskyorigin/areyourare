import { BirthChartResult } from './astronomy';

export type PatternCategory = 'angular' | 'aspect' | 'planetary' | 'structural';

export type ContinuousMeasurementUnit = 'degrees' | 'degrees_per_day';

export interface PatternEvaluationResult {
  matched: boolean;
  evidence?: Record<string, unknown>;
}

export interface PatternDefinition {
  id: string;
  name: string;
  version: string;
  category: PatternCategory;
  description: string;
  enabled: boolean;
  ruleType: string;
  parameters: Record<string, unknown>;
  evaluate: (chart: BirthChartResult) => PatternEvaluationResult;
}

export interface MatchedPattern {
  patternId: string;
  patternVersion: string;
  name: string;
  category: PatternCategory;
  description: string;
  evidence: Record<string, unknown>;
}

export interface ContinuousFeatureMeasurement {
  featureId: string;
  featureVersion: string;
  name: string;
  category: PatternCategory;
  description: string;
  distanceFromIdeal: number;
  idealTarget: number;
  unit: ContinuousMeasurementUnit;
  formattedDistance: string;
  evidence: Record<string, unknown>;
}

export interface ContinuousFeatureDefinition {
  id: string;
  name: string;
  version: string;
  category: PatternCategory;
  description: string;
  idealTarget: number;
  unit: ContinuousMeasurementUnit;
  enabled: boolean;
  measure: (chart: BirthChartResult) => {
    distanceFromIdeal: number;
    formattedDistance: string;
    evidence: Record<string, unknown>;
  };
}

export interface PatternEngineResult {
  engineVersion: 'v1';
  patternsChecked: number;
  matches: MatchedPattern[];
  continuousFeatures?: ContinuousFeatureMeasurement[];
}
