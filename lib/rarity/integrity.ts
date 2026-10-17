import { REFERENCE_POPULATION_V1, validateReferenceDataset } from './dataset';
import { PATTERN_REGISTRY } from '../patterns/registry';
import { CONTINUOUS_FEATURE_REGISTRY } from '../patterns/continuous';
import { getAppConfig } from '../config/env';

export interface SystemIntegrityReport {
  isHealthy: boolean;
  datasetValid: boolean;
  registryCount: number;
  datasetPatternCount: number;
  continuousFeatureCount: number;
  continuousDistributionVersion: string;
  versionCompatibility: boolean;
  errors: string[];
  versions: {
    calculationVersion: string;
    astronomyEngineVersion: string;
    patternEngineVersion: string;
    patternRegistryVersion: string;
    referenceDatasetVersion: string;
  };
}

let cachedIntegrity: SystemIntegrityReport | null = null;

/**
 * Validates baseline reference dataset, pattern registry consistency, continuous feature distributions,
 * and version matching. Fails safely if versions or mathematical schemas mismatch.
 */
export function verifySystemIntegrity(forceFresh = false): SystemIntegrityReport {
  if (cachedIntegrity && !forceFresh) {
    return cachedIntegrity;
  }

  const config = getAppConfig();
  const errors: string[] = [];

  // 1. Validate dataset internal consistency
  const datasetValidation = validateReferenceDataset(REFERENCE_POPULATION_V1);
  if (!datasetValidation.isValid) {
    errors.push(...datasetValidation.errors);
  }

  // 2. Validate version alignment
  if (REFERENCE_POPULATION_V1.version !== config.versions.referenceDatasetVersion) {
    errors.push(
      `Dataset version mismatch: dataset has '${REFERENCE_POPULATION_V1.version}', expected '${config.versions.referenceDatasetVersion}'.`
    );
  }

  if (REFERENCE_POPULATION_V1.patternRegistryVersion !== config.versions.patternRegistryVersion) {
    errors.push(
      `Pattern registry version mismatch: dataset requires '${REFERENCE_POPULATION_V1.patternRegistryVersion}', engine has '${config.versions.patternRegistryVersion}'.`
    );
  }

  // 3. Ensure all registry patterns are represented
  const datasetPatternIds = new Set(Object.keys(REFERENCE_POPULATION_V1.patterns));
  const missingPatterns = PATTERN_REGISTRY.filter((p) => !datasetPatternIds.has(p.id));
  if (missingPatterns.length > 0) {
    errors.push(`Missing reference frequencies for patterns: ${missingPatterns.map((p) => p.id).join(', ')}`);
  }

  // 4. Ensure all continuous features are represented in empirical distributions
  const continuousFeaturesMap = REFERENCE_POPULATION_V1.continuousFeatures || {};
  const datasetContinuousIds = new Set(Object.keys(continuousFeaturesMap));
  const missingContinuous = CONTINUOUS_FEATURE_REGISTRY.filter((f) => !datasetContinuousIds.has(f.id));
  if (missingContinuous.length > 0) {
    errors.push(`Missing continuous reference distributions for features: ${missingContinuous.map((f) => f.id).join(', ')}`);
  }

  const report: SystemIntegrityReport = {
    isHealthy: errors.length === 0,
    datasetValid: datasetValidation.isValid,
    registryCount: PATTERN_REGISTRY.length,
    datasetPatternCount: Object.keys(REFERENCE_POPULATION_V1.patterns).length,
    continuousFeatureCount: Object.keys(continuousFeaturesMap).length,
    continuousDistributionVersion: REFERENCE_POPULATION_V1.continuousDistributionVersion || 'v1.2.0',
    versionCompatibility: errors.length === 0,
    errors,
    versions: config.versions,
  };

  cachedIntegrity = report;
  return report;
}
