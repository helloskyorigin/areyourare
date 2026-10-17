import { generateReferencePopulationDataset } from '../lib/rarity/generator';
import { PATTERN_REGISTRY } from '../lib/patterns/registry';
import * as fs from 'fs';
import * as path from 'path';

console.log('======================================================================');
console.log('OUTLIER — GENERATING EMPIRICAL REFERENCE DATASET v1.1.0 (N = 100,000)');
console.log('======================================================================\n');

const PRIMARY_SEED = 'outlier_global_reference_seed_2026_v1_1_0';
const VALIDATION_SEED = 'outlier_independent_validation_seed_2026';

// 1. Generate Primary 100,000-sample Dataset
console.log(`[1/3] Running primary simulation (N = 100,000, seed = "${PRIMARY_SEED}")...`);
const t0 = Date.now();
const primaryDataset = generateReferencePopulationDataset({
  datasetVersion: 'v1.1.0',
  seed: PRIMARY_SEED,
  sampleSize: 100000,
  startYear: 1940,
  endYear: 2025,
});
const dt1 = ((Date.now() - t0) / 1000).toFixed(2);
console.log(`✓ Primary dataset generated in ${dt1}s.`);
console.log(`  Valid Samples: ${primaryDataset.methodology.validSamples} | Invalid Samples: ${primaryDataset.methodology.invalidSamples}\n`);

// 2. Generate Independent Validation Dataset (N = 25,000)
console.log(`[2/3] Running independent validation sample (N = 25,000, seed = "${VALIDATION_SEED}")...`);
const t1 = Date.now();
const validationDataset = generateReferencePopulationDataset({
  datasetVersion: 'v1.1.0-val',
  seed: VALIDATION_SEED,
  sampleSize: 25000,
  startYear: 1940,
  endYear: 2025,
});
const dt2 = ((Date.now() - t1) / 1000).toFixed(2);
console.log(`✓ Validation dataset generated in ${dt2}s.\n`);

// 3. Compare Primary vs. Validation
console.log('==================================================================================================================');
console.log('PRIMARY (N=100,000) VS. INDEPENDENT VALIDATION (N=25,000) COMPARISON TABLE');
console.log('==================================================================================================================');
console.log(
  'Pattern ID'.padEnd(30) + ' | ' +
  'Matches (100k)'.padStart(14) + ' | ' +
  'Primary Freq %'.padStart(14) + ' | ' +
  'Val Matches (25k)'.padStart(17) + ' | ' +
  'Val Freq %'.padStart(10) + ' | ' +
  'Delta %'.padStart(8) + ' | ' +
  'Support'
);
console.log('------------------------------------------------------------------------------------------------------------------');

PATTERN_REGISTRY.forEach((p) => {
  const prim = primaryDataset.patterns[p.id];
  const val = validationDataset.patterns[p.id];
  const delta = Math.abs(prim.frequencyPercent - val.frequencyPercent);

  console.log(
    p.id.padEnd(30) + ' | ' +
    String(prim.matchingCount).padStart(14) + ' | ' +
    (prim.frequencyPercent.toFixed(4) + '%').padStart(14) + ' | ' +
    String(val.matchingCount).padStart(17) + ' | ' +
    (val.frequencyPercent.toFixed(4) + '%').padStart(10) + ' | ' +
    (delta.toFixed(4) + '%').padStart(8) + ' | ' +
    prim.status
  );
});
console.log('==================================================================================================================\n');

// 4. Write new lib/rarity/dataset.ts
console.log('[3/3] Writing verified empirical dataset to lib/rarity/dataset.ts...');

const datasetFileContent = `import { ReferencePopulationDataset } from '../types/rarity';
import { PATTERN_REGISTRY } from '../patterns/registry';

/**
 * Validates a reference dataset to ensure mathematical and structural integrity
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

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Official Computational Reference Population Dataset (v1.1.0)
 * Generated directly from Phase 2 Astronomy Engine + Phase 3 Pattern Engine
 * over 100,000 deterministically sampled birth coordinates (seed: "${PRIMARY_SEED}").
 */
export const REFERENCE_POPULATION_V1: ReferencePopulationDataset = ${JSON.stringify(primaryDataset, null, 2)};
`;

const targetPath = path.resolve(process.cwd(), 'lib/rarity/dataset.ts');
fs.writeFileSync(targetPath, datasetFileContent, 'utf-8');
console.log(`✓ Successfully wrote ${targetPath}`);
