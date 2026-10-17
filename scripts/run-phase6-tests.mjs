import { runProductionHardeningTests } from '../lib/security/__tests__/production-hardening.test.ts';

console.log('=======================================================');
console.log('OUTLIER — Phase 6 Production Hardening Test Suite');
console.log('=======================================================\n');

const results = runProductionHardeningTests();
let passed = 0;
let failed = 0;

results.forEach((r) => {
  if (r.passed) {
    console.log(`[PASS] ${r.name}`);
    passed++;
  } else {
    console.error(`[FAIL] ${r.name}: ${r.error}`);
    failed++;
  }
});

console.log('\n=======================================================');
console.log(`Summary: ${passed} passed, ${failed} failed (${results.length} total)`);
console.log('=======================================================');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('All Phase 6 production security and reliability tests passed.');
}
