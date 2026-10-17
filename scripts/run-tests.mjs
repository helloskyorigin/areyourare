import { runDiscoverValidationTests } from '../lib/validation/__tests__/discover-api.test.ts';
import { runAstronomyEngineTests } from '../lib/astronomy/__tests__/chart-engine.test.ts';
import { runPatternEngineTests } from '../lib/patterns/__tests__/pattern-engine.test.ts';
import { runRarityEngineTests } from '../lib/rarity/__tests__/rarity-engine.test.ts';
import { runExplanationEngineTests } from '../lib/explanation/__tests__/explanation-engine.test.ts';

console.log('==================================================');
console.log('1. RUNNING PHASE 1 DISCOVER VALIDATION TESTS');
console.log('==================================================');
const phase1Results = runDiscoverValidationTests();
let allPhase1Passed = true;
phase1Results.forEach((r) => {
  if (r.passed) {
    console.log(`✓ PASS: ${r.name}`);
  } else {
    allPhase1Passed = false;
    console.error(`✗ FAIL: ${r.name}`, r);
  }
});

console.log('\n==================================================');
console.log('2. RUNNING PHASE 2 ASTRONOMY ENGINE TESTS');
console.log('==================================================');
const phase2Results = runAstronomyEngineTests();
let allPhase2Passed = true;
phase2Results.forEach((r) => {
  if (r.passed) {
    console.log(`✓ PASS: ${r.name} ${r.details ? `(${r.details})` : ''}`);
  } else {
    allPhase2Passed = false;
    console.error(`✗ FAIL: ${r.name}`, r.details);
  }
});

console.log('\n==================================================');
console.log('3. RUNNING PHASE 3 PATTERN ENGINE TESTS');
console.log('==================================================');
const phase3Results = runPatternEngineTests();
let allPhase3Passed = true;
phase3Results.forEach((r) => {
  if (r.passed) {
    console.log(`✓ PASS: ${r.name} ${r.details ? `(${r.details})` : ''}`);
  } else {
    allPhase3Passed = false;
    console.error(`✗ FAIL: ${r.name}`, r.details);
  }
});

console.log('\n==================================================');
console.log('4. RUNNING PHASE 4 RARITY ENGINE TESTS');
console.log('==================================================');
const phase4Results = runRarityEngineTests();
let allPhase4Passed = true;
phase4Results.forEach((r) => {
  if (r.passed) {
    console.log(`✓ PASS: ${r.name} ${r.details ? `(${r.details})` : ''}`);
  } else {
    allPhase4Passed = false;
    console.error(`✗ FAIL: ${r.name}`, r.details);
  }
});

console.log('\n==================================================');
console.log('5. RUNNING PHASE 5 RESULT & EXPLANATION TESTS');
console.log('==================================================');
const phase5Results = runExplanationEngineTests();
let allPhase5Passed = true;
phase5Results.forEach((r) => {
  if (r.passed) {
    console.log(`✓ PASS: ${r.name} ${r.details ? `(${r.details})` : ''}`);
  } else {
    allPhase5Passed = false;
    console.error(`✗ FAIL: ${r.name}`, r.details);
  }
});

if (allPhase1Passed && allPhase2Passed && allPhase3Passed && allPhase4Passed && allPhase5Passed) {
  console.log('\nAll Phase 1, Phase 2, Phase 3, Phase 4, and Phase 5 test suites passed successfully!');
} else {
  console.error('\nTests failed.');
  process.exit(1);
}
