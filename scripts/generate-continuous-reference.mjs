import fs from 'node:fs';
import path from 'node:path';
import { generateReferencePopulationDataset } from '../lib/rarity/generator.ts';

console.log('Generating empirical reference dataset (N = 100,000) with continuous feature distributions...');
const startTime = Date.now();

const dataset = generateReferencePopulationDataset({
  datasetVersion: 'v1.1.0',
  seed: 'outlier_global_reference_seed_2026_v1_1_0',
  sampleSize: 100000,
  startYear: 1940,
  endYear: 2025,
});

const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(2);
console.log(`Completed 100,000 chart simulations in ${elapsedSec}s.`);
console.log('Discovery Breakdown:', dataset.discoveryBreakdown);

const fileContent = `import { ReferencePopulationDataset } from '../types/rarity';
import { PATTERN_REGISTRY } from '../patterns/registry';
import { CONTINUOUS_FEATURE_REGISTRY } from '../patterns/continuous';

/**
 * Validates a reference dataset to ensure mathematical and structural integrity
 * across both binary patterns and continuous feature empirical distributions.
 */
export function validateReferenceDataset(dataset: ReferencePopulationDataset): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!dataset.version) errors.push('Missing dataset version identifier.');
  if (!dataset.methodology) errors.push('Missing dataset methodology.');
  if (dataset.methodology?.validSamples <= 0) errors.push('validSamples must be greater than zero.');
  if (dataset.methodology?.totalSamples < dataset.methodology?.validSamples) {
    errors.push('totalSamples cannot be less than validSamples.');
  }

  const registeredIds = new Set(PATTERN_REGISTRY.map((p) => p.id));
  const datasetIds = Object.keys(dataset.patterns || {});

  if (datasetIds.length === 0) {
    errors.push('Dataset contains zero pattern frequency records.');
  }

  for (const id of datasetIds) {
    if (!registeredIds.has(id)) {
      errors.push(\`Dataset contains unregistered pattern ID: \${id}\`);
    }

    const stat = dataset.patterns[id];
    if (stat.matchingCount < 0) {
      errors.push(\`Pattern \${id} has negative matchingCount.\`);
    }
    if (stat.matchingCount > stat.validSampleSize) {
      errors.push(\`Pattern \${id} matchingCount exceeds validSampleSize.\`);
    }
    const expectedFreq = stat.matchingCount / stat.validSampleSize;
    if (Math.abs(stat.frequency - expectedFreq) > 0.000001) {
      errors.push(\`Pattern \${id} frequency (\${stat.frequency}) does not match matchingCount/validSampleSize.\`);
    }
  }

  if (dataset.continuousFeatures) {
    const registeredFeatureIds = new Set(CONTINUOUS_FEATURE_REGISTRY.map((f) => f.id));
    for (const [fid, dist] of Object.entries(dataset.continuousFeatures)) {
      if (!registeredFeatureIds.has(fid)) {
        errors.push(\`Dataset contains unregistered continuous feature ID: \${fid}\`);
      }
      if (!Array.isArray(dist.quantiles) || dist.quantiles.length === 0) {
        errors.push(\`Continuous feature \${fid} is missing quantile distribution points.\`);
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Official Computational Reference Population Dataset (v1.1.0 / Continuous v1.2.0)
 * Generated directly from Phase 2 Astronomy Engine + Phase 3 Pattern & Continuous Feature Engine
 * over 100,000 deterministically sampled birth coordinates (seed: "outlier_global_reference_seed_2026_v1_1_0").
 */
export const REFERENCE_POPULATION_V1: ReferencePopulationDataset = ${JSON.stringify(dataset, null, 2)};
`;

const targetPath = path.resolve(process.cwd(), 'lib/rarity/dataset.ts');
fs.writeFileSync(targetPath, fileContent, 'utf-8');
console.log(`Successfully wrote updated dataset to ${targetPath}`);
