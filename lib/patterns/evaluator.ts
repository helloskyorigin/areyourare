import { BirthChartResult } from '../types/astronomy';
import { PatternEngineResult, MatchedPattern } from '../types/patterns';
import { PATTERN_REGISTRY } from './registry';
import { evaluateContinuousFeatures } from './continuous';

/**
 * Evaluates a birth chart against all registered binary pattern definitions in the Pattern Registry
 * and computes exact continuous distanceFromIdeal measurements across all continuous features.
 * Fully deterministic: same chart always produces the exact same matched patterns and continuous measurements.
 */
export function evaluatePatterns(chart: BirthChartResult): PatternEngineResult {
  if (!chart || !chart.planets || !chart.angles) {
    throw new Error('Invalid birth chart result provided for pattern evaluation.');
  }

  const isDateOnly = (chart.input as any)?.calculation_mode === 'DATE_ONLY';
  const enabledPatterns = PATTERN_REGISTRY.filter(
    (p) => p.enabled && (!isDateOnly || p.category !== 'angular')
  );
  const matches: MatchedPattern[] = [];

  for (const pattern of enabledPatterns) {
    try {
      const evalResult = pattern.evaluate(chart);
      if (evalResult.matched && evalResult.evidence) {
        matches.push({
          patternId: pattern.id,
          patternVersion: pattern.version,
          name: pattern.name,
          category: pattern.category,
          description: pattern.description,
          evidence: evalResult.evidence,
        });
      }
    } catch {
      // Individual pattern evaluation failure is isolated and does not crash the engine
      continue;
    }
  }

  const continuousFeatures = evaluateContinuousFeatures(chart);

  return {
    engineVersion: 'v1',
    patternsChecked: enabledPatterns.length,
    matches,
    continuousFeatures,
  };
}
