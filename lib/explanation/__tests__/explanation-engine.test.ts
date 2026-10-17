import { buildVerifiedResult } from '../../result/builder';
import { createFallbackExplanation } from '../service';
import { calculateBirthChart } from '../../astronomy/engine';
import { evaluatePatterns } from '../../patterns/evaluator';
import { calculateUserRarity } from '../../rarity/engine';
import { NormalizedBirthInput } from '../../types/birth-input';
import { CanonicalVerifiedResult } from '../../types/result';

export interface ExplanationTestCaseResult {
  name: string;
  passed: boolean;
  details?: string;
}

export function runExplanationEngineTests(): ExplanationTestCaseResult[] {
  const results: ExplanationTestCaseResult[] = [];

  const sampleBirthInput: NormalizedBirthInput = {
    birthDate: '1995-10-24',
    birthTime: '06:30',
    location: {
      city: 'London',
      region: 'Greater London',
      country: 'United Kingdom',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London',
    },
  };

  // 1. Canonical Verified Result Generation from Phase 2-5 pipelines
  try {
    const chart = calculateBirthChart(sampleBirthInput);
    const patterns = evaluatePatterns(chart);
    const rarity = calculateUserRarity(patterns);
    const verified = buildVerifiedResult({
      discoveryId: 'disc_test_123',
      chart,
      patterns,
      rarity,
      explanation: null,
    });

    const passed =
      verified.status === 'READY' &&
      verified.discoveryId === 'disc_test_123' &&
      verified.calculation.version === 'v1' &&
      verified.reference.datasetVersion === 'v1' &&
      !!verified.primaryPattern &&
      !!verified.rarity &&
      typeof verified.rarity.frequencyPercent === 'number';

    results.push({
      name: '1. Canonical Verified Result pipeline construction',
      passed,
      details: `Primary pattern: ${verified.primaryPattern?.name} (${verified.rarity?.formattedPercent})`,
    });
  } catch (err) {
    results.push({ name: '1. Canonical Verified Result', passed: false, details: String(err) });
  }

  // 2. Factual Lock: Verified numerical metrics cannot be altered by explanation layer
  try {
    const chart = calculateBirthChart(sampleBirthInput);
    const patterns = evaluatePatterns(chart);
    const rarity = calculateUserRarity(patterns);
    const trueFreq = rarity.rarestPattern?.frequencyPercent;

    // Simulate an AI explanation containing incorrect/hallucinated text numbers
    const forgedExplanation = {
      summary: 'AI says your frequency is 0.0001%',
      whyItStandsOut: 'AI claims you are 1 in a billion.',
      evidenceExplanation: 'AI explanation text.',
      isAiGenerated: true,
    };

    const verified = buildVerifiedResult({
      discoveryId: 'disc_test_factual_lock',
      chart,
      patterns,
      rarity,
      explanation: forgedExplanation,
    });

    // Verify factual lock: verified.rarity.frequencyPercent retains the mathematical truth
    const passed =
      verified.rarity?.frequencyPercent === trueFreq &&
      verified.sharePayload?.frequencyPercent === trueFreq &&
      verified.primaryPattern?.name === rarity.rarestPattern?.patternName;

    results.push({
      name: '2. Factual Lock: AI explanation cannot mutate verified rarity percentages or pattern names',
      passed,
    });
  } catch (err) {
    results.push({ name: '2. Factual Lock', passed: false, details: String(err) });
  }

  // 3. AI Failure Isolation: AI failure != result failure
  try {
    const chart = calculateBirthChart(sampleBirthInput);
    const patterns = evaluatePatterns(chart);
    const rarity = calculateUserRarity(patterns);

    // Fallback explanation generator
    const fallback = rarity.rarestPattern
      ? createFallbackExplanation({
          patternId: rarity.rarestPattern.patternId,
          patternName: rarity.rarestPattern.patternName,
          patternDescription: rarity.rarestPattern.description,
          category: rarity.rarestPattern.category,
          frequencyPercent: rarity.rarestPattern.frequencyPercent,
          referenceSampleSize: rarity.rarestPattern.validSampleSize,
          evidence: rarity.rarestPattern.evidence,
        })
      : null;

    const verifiedWithFallback = buildVerifiedResult({
      discoveryId: 'disc_fallback_test',
      chart,
      patterns,
      rarity,
      explanation: fallback,
    });

    const passed =
      verifiedWithFallback.status === 'READY' &&
      verifiedWithFallback.explanation?.isAiGenerated === false &&
      !!verifiedWithFallback.explanation.summary &&
      !!verifiedWithFallback.explanation.whyItStandsOut &&
      !!verifiedWithFallback.explanation.evidenceExplanation;

    results.push({
      name: '3. AI Failure Isolation: Fallback explanation generated seamlessly on AI absence/failure',
      passed,
    });
  } catch (err) {
    results.push({ name: '3. AI Failure Isolation', passed: false, details: String(err) });
  }

  // 4. Privacy: Share payload strictly excludes private birth time and coordinates
  try {
    const chart = calculateBirthChart(sampleBirthInput);
    const patterns = evaluatePatterns(chart);
    const rarity = calculateUserRarity(patterns);
    const verified = buildVerifiedResult({
      discoveryId: 'disc_privacy_test',
      chart,
      patterns,
      rarity,
      explanation: null,
    });

    const shareStr = JSON.stringify(verified.sharePayload);
    // Ensure raw birth time "06:30", lat "51.5074", lng "-0.1278" are not exposed in sharePayload
    const passed =
      !shareStr.includes('06:30') &&
      !shareStr.includes('51.5074') &&
      !shareStr.includes('-0.1278') &&
      verified.sharePayload?.brand === 'OUTLIER';

    results.push({
      name: '4. Privacy: Share payload excludes private birth time, latitude, and longitude',
      passed,
    });
  } catch (err) {
    results.push({ name: '4. Privacy Share Payload', passed: false, details: String(err) });
  }

  // 5. Empty / No Valid Pattern state
  try {
    const emptyResult: CanonicalVerifiedResult = buildVerifiedResult({
      discoveryId: 'disc_empty',
      chart: calculateBirthChart(sampleBirthInput),
      patterns: { engineVersion: 'v1', patternsChecked: 15, matches: [] },
      rarity: {
        status: 'NO_VALID_PATTERN',
        referenceDatasetVersion: 'v1',
        totalPatternsEvaluated: 15,
        matchedCount: 0,
        rarestPattern: null,
        secondaryPatterns: [],
        rankedPatterns: [],
        rarityProfile: { rarest: '—', second: '—', third: '—' },
        summaryText: '',
      },
      explanation: null,
    });

    const passed = emptyResult.status === 'NO_VALID_PATTERN' && emptyResult.primaryPattern === null;
    results.push({
      name: '5. No-valid-pattern status handled cleanly without fabricating data',
      passed,
    });
  } catch (err) {
    results.push({ name: '5. Empty pattern handling', passed: false, details: String(err) });
  }

  return results;
}
