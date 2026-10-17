import { PATTERN_REGISTRY } from '../lib/patterns/registry';
import { REFERENCE_POPULATION_V1 } from '../lib/rarity/dataset';
import { generateReferencePopulationDataset } from '../lib/rarity/generator';

console.log('================================================================');
console.log('OUTLIER — DEEP REFERENCE DATASET CONSISTENCY AUDIT');
console.log('================================================================\n');

// 1. Run fresh recomputation using the actual generator over N=10,000 samples
const auditSampleSize = 10000;
console.log(`Generating fresh reference population with N = ${auditSampleSize.toLocaleString()} samples...`);

const startTime = Date.now();
const freshDataset = generateReferencePopulationDataset({
  seed: 'outlier_global_reference_seed_2026',
  sampleSize: auditSampleSize,
  startYear: 1940,
  endYear: 2025,
});
const durationMs = Date.now() - startTime;
console.log(`Recomputation completed in ${(durationMs / 1000).toFixed(2)}s. Valid samples: ${freshDataset.methodology.validSamples}\n`);

// 2. Pattern-by-pattern comparison table
console.log('===========================================================================================================================================');
console.log('PATTERN-BY-PATTERN RECOMPUTATION AUDIT TABLE');
console.log('===========================================================================================================================================');
console.log(
  'Pattern ID'.padEnd(30) + ' | ' +
  'Stored Cnt'.padStart(10) + ' | ' +
  'Stored Freq'.padStart(11) + ' | ' +
  'Fresh Cnt'.padStart(10) + ' | ' +
  'Fresh Freq'.padStart(11) + ' | ' +
  'Abs Diff'.padStart(10) + ' | ' +
  'Rel Diff'.padStart(10)
);
console.log('-------------------------------------------------------------------------------------------------------------------------------------------');

const discrepancies: Array<{
  id: string;
  name: string;
  storedFreq: number;
  freshFreq: number;
  absDiff: number;
  relDiff: number;
}> = [];

PATTERN_REGISTRY.forEach((p) => {
  const stored = REFERENCE_POPULATION_V1.patterns[p.id];
  const fresh = freshDataset.patterns[p.id];

  const storedCount = stored ? stored.matchingCount : 0;
  const storedFreq = stored ? stored.frequencyPercent : 0;

  const freshCount = fresh ? fresh.matchingCount : 0;
  const freshFreq = fresh ? fresh.frequencyPercent : 0;

  const absDiff = Math.abs(freshFreq - storedFreq);
  const relDiff = storedFreq > 0 ? (absDiff / storedFreq) * 100 : 0;

  discrepancies.push({
    id: p.id,
    name: p.name,
    storedFreq,
    freshFreq,
    absDiff,
    relDiff,
  });

  console.log(
    p.id.padEnd(30) + ' | ' +
    String(storedCount).padStart(10) + ' | ' +
    (storedFreq.toFixed(2) + '%').padStart(11) + ' | ' +
    String(freshCount).padStart(10) + ' | ' +
    (freshFreq.toFixed(2) + '%').padStart(11) + ' | ' +
    (absDiff.toFixed(2) + '%').padStart(10) + ' | ' +
    (relDiff.toFixed(1) + '%').padStart(10)
  );
});

console.log('===========================================================================================================================================\n');
