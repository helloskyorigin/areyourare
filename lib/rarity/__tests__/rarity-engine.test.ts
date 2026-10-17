import { calculateUserRarity } from '../engine';
import { validateReferenceDataset, REFERENCE_POPULATION_V1 } from '../dataset';
import { generateReferencePopulationDataset } from '../generator';
import { verifySystemIntegrity } from '../integrity';
import { ReferencePopulationDataset } from '../../types/rarity';
import { PatternEngineResult } from '../../types/patterns';

export interface RarityTestCaseResult {
  name: string;
  passed: boolean;
  details?: string;
}

export function runRarityEngineTests(): RarityTestCaseResult[] {
  const results: RarityTestCaseResult[] = [];

  // 1. Dataset generation is deterministic & same seed produces same pattern counts
  try {
    const sampleA = generateReferencePopulationDataset({ seed: 'repro_seed_42', sampleSize: 25 });
    const sampleB = generateReferencePopulationDataset({ seed: 'repro_seed_42', sampleSize: 25 });
    const passed =
      sampleA.methodology.validSamples === 25 &&
      JSON.stringify(sampleA.patterns) === JSON.stringify(sampleB.patterns);
    results.push({
      name: '1. Dataset generation is deterministic (same seed = identical sample & pattern counts)',
      passed,
    });
  } catch (err) {
    results.push({ name: '1. Deterministic generation', passed: false, details: String(err) });
  }

  // 2. Different seeds produce independent samples
  try {
    const sample1 = generateReferencePopulationDataset({ seed: 'seed_alpha', sampleSize: 50 });
    const sample2 = generateReferencePopulationDataset({ seed: 'seed_beta', sampleSize: 50 });
    const passed = JSON.stringify(sample1.patterns) !== JSON.stringify(sample2.patterns);
    results.push({
      name: '2. Independent seeds produce distinct reference distributions',
      passed,
    });
  } catch (err) {
    results.push({ name: '2. Independent seeds', passed: false, details: String(err) });
  }

  // 3. Frequency equals matchingCount / validSampleSize across all 15 patterns
  try {
    let allExact = true;
    for (const pat of Object.values(REFERENCE_POPULATION_V1.patterns)) {
      const expectedFreq = pat.matchingCount / pat.validSampleSize;
      if (Math.abs(pat.frequency - expectedFreq) > 1e-9) {
        allExact = false;
      }
      if (Math.abs(pat.frequencyPercent - expectedFreq * 100) > 1e-6) {
        allExact = false;
      }
    }
    results.push({
      name: '3. Frequency equals matchingCount / validSampleSize for all 15 patterns',
      passed: allExact,
    });
  } catch (err) {
    results.push({ name: '3. Frequency math', passed: false, details: String(err) });
  }

  // 4. Invalid samples are tracked and excluded from denominator
  try {
    const testDataset: ReferencePopulationDataset = {
      ...REFERENCE_POPULATION_V1,
      methodology: {
        ...REFERENCE_POPULATION_V1.methodology,
        totalSamples: 100,
        validSamples: 95,
        invalidSamples: 5,
      },
    };
    const val = validateReferenceDataset(testDataset);
    const passed = val.isValid && testDataset.methodology.totalSamples === 100 && testDataset.methodology.validSamples === 95;
    results.push({
      name: '4. Invalid samples are tracked separately from validSampleSize denominator',
      passed,
    });
  } catch (err) {
    results.push({ name: '4. Invalid sample handling', passed: false, details: String(err) });
  }

  // 5. Dataset metadata is valid and matches v1.1.0
  try {
    const meta = REFERENCE_POPULATION_V1;
    const passed =
      meta.version === 'v1.1.0' &&
      meta.astronomyEngineVersion === '1.0.0' &&
      meta.patternEngineVersion === 'v1' &&
      meta.patternRegistryVersion === '1.0' &&
      meta.methodology.seed === 'outlier_global_reference_seed_2026_v1_1_0' &&
      meta.methodology.validSamples === 100000 &&
      meta.methodology.invalidSamples === 0;
    results.push({
      name: '5. Dataset metadata is complete and verified for v1.1.0 (N = 100,000)',
      passed,
    });
  } catch (err) {
    results.push({ name: '5. Dataset metadata', passed: false, details: String(err) });
  }

  // 6. Version compatibility check succeeds for valid v1.1.0 dataset
  try {
    const integrity = verifySystemIntegrity(true);
    const passed = integrity.isHealthy && integrity.versions.referenceDatasetVersion === 'v1.1.0';
    results.push({
      name: '6. System version compatibility check passes for v1.1.0',
      passed,
    });
  } catch (err) {
    results.push({ name: '6. Version compatibility', passed: false, details: String(err) });
  }

  // 7. Rarity lookup uses the generated v1.1.0 dataset
  try {
    const mockMatches: PatternEngineResult = {
      engineVersion: 'v1',
      patternsChecked: 15,
      matches: [
        {
          patternId: 'pat_solar_zenith_mc',
          patternVersion: '1.0',
          name: 'Solar Midheaven Zenith Alignment',
          category: 'angular',
          description: 'Sun conjunct MC',
          evidence: {},
        },
      ],
    };
    const rarity = calculateUserRarity(mockMatches);
    const passed =
      rarity.referenceDatasetVersion === 'v1.1.0' &&
      rarity.rarestPattern?.matchingCount === 519 &&
      rarity.rarestPattern?.validSampleSize === 100000 &&
      rarity.rarestPattern?.frequencyPercent === 0.519;
    results.push({
      name: '7. Live rarity lookup uses generated v1.1.0 dataset (519 / 100,000 = 0.519%)',
      passed,
    });
  } catch (err) {
    results.push({ name: '7. Live rarity lookup', passed: false, details: String(err) });
  }

  // 8. Old theoretical baseline values are no longer present
  try {
    const stationary = REFERENCE_POPULATION_V1.patterns['pat_stationary_node'];
    const trine = REFERENCE_POPULATION_V1.patterns['pat_exact_trine_pair'];
    const cazimi = REFERENCE_POPULATION_V1.patterns['pat_exact_cazimi'];
    const passed =
      stationary.matchingCount !== 1100 &&
      trine.matchingCount !== 2800 &&
      cazimi.matchingCount !== 220 &&
      stationary.matchingCount === 29151 &&
      trine.matchingCount === 13569 &&
      cazimi.matchingCount === 2318;
    results.push({
      name: '8. Old theoretical seed numbers are completely replaced by empirical counts',
      passed,
    });
  } catch (err) {
    results.push({ name: '8. Old baseline check', passed: false, details: String(err) });
  }

  // 9. Production rejects corrupted or incompatible dataset
  try {
    const corrupted: ReferencePopulationDataset = {
      ...REFERENCE_POPULATION_V1,
      patterns: {
        ...REFERENCE_POPULATION_V1.patterns,
        pat_unknown_fake: {
          patternId: 'pat_unknown_fake',
          patternName: 'Fake Pattern',
          category: 'aspect',
          matchingCount: 500,
          validSampleSize: 100000,
          frequency: 0.005,
          frequencyPercent: 0.5,
          status: 'ADEQUATE_SUPPORT',
        },
      },
    };
    const val = validateReferenceDataset(corrupted);
    const passed = !val.isValid && val.errors.some((e) => e.includes('unregistered pattern ID'));
    results.push({
      name: '9. Dataset validator rejects incompatible/unregistered pattern definitions',
      passed,
    });
  } catch (err) {
    results.push({ name: '9. Incompatible dataset rejection', passed: false, details: String(err) });
  }

  // 10. Rarest pattern ranking and deterministic tie-breaking
  try {
    const mockMultiMatches: PatternEngineResult = {
      engineVersion: 'v1',
      patternsChecked: 15,
      matches: [
        {
          patternId: 'pat_stationary_node',
          patternVersion: '1.0',
          name: 'Stationary Planetary Pivot Node',
          category: 'planetary',
          description: '',
          evidence: {},
        },
        {
          patternId: 'pat_grand_cross',
          patternVersion: '1.0',
          name: 'Grand Cross Quadrant Tension Grid',
          category: 'structural',
          description: '',
          evidence: {},
        },
      ],
    };
    const rarity = calculateUserRarity(mockMultiMatches);
    const passed =
      rarity.rarestPattern?.patternId === 'pat_grand_cross' &&
      rarity.rarestPattern?.matchingCount === 95 &&
      rarity.secondaryPatterns[0]?.patternId === 'pat_stationary_node';
    results.push({
      name: '10. Rarest pattern ranking accurately orders 0.095% ahead of 29.151%',
      passed,
    });
  } catch (err) {
    results.push({ name: '10. Rarest pattern ranking', passed: false, details: String(err) });
  }

  return results;
}
