import { GoogleGenAI, Type } from '@google/genai';
import { CanonicalExplanation } from '../types/result';
import { getAppConfig } from '../config/env';
import { metrics } from '../observability/metrics';
import { logger } from '../logging/logger';

export interface ExplanationPayload {
  discoveryType?: 'MATCHED_PATTERN' | 'CONTINUOUS_FEATURE';
  patternId: string;
  patternName: string;
  patternDescription: string;
  category: string;
  frequencyPercent: number;
  referenceSampleSize: number;
  evidence: Record<string, unknown>;
}

/**
 * Formats concrete mathematical evidence from the Phase 3 Pattern & Continuous Feature Evaluator
 * into a crisp, readable sentence.
 */
export function formatMeasuredEvidenceText(
  evidence: Record<string, unknown>,
  fallbackDescription: string
): string {
  if (!evidence || typeof evidence !== 'object') {
    return fallbackDescription;
  }

  // 1. Pairwise aspect (strict binary match or continuous feature)
  if (
    Array.isArray(evidence.bodies) &&
    evidence.bodies.length === 2 &&
    typeof evidence.separationDegrees === 'number' &&
    typeof evidence.targetDegrees === 'number'
  ) {
    const [bA, bB] = evidence.bodies;
    const sep = evidence.separationDegrees.toFixed(4);
    const target = evidence.targetDegrees;
    const aspectWord =
      target === 120
        ? 'trine'
        : target === 180
        ? 'opposition'
        : target === 90
        ? 'square'
        : target === 60
        ? 'sextile'
        : target === 0
        ? 'conjunction'
        : 'alignment';

    if (typeof evidence.orbLimitDegrees === 'number') {
      return `Your ${bA} and ${bB} form a ${sep}° separation, within the defined ${evidence.orbLimitDegrees}° tolerance of a ${target}° ${aspectWord}.`;
    }
    const dev =
      typeof evidence.deviationDegrees === 'number'
        ? evidence.deviationDegrees.toFixed(4)
        : Math.abs(evidence.separationDegrees - target).toFixed(4);
    return `Your ${bA} and ${bB} form a ${sep}° angular separation, within ${dev}° of an exact ${target}° ${aspectWord}.`;
  }

  // 2. Angular conjunction / alignment (strict or continuous)
  if (
    typeof evidence.body === 'string' &&
    typeof evidence.angle === 'string' &&
    typeof evidence.separationDegrees === 'number'
  ) {
    if (typeof evidence.orbLimitDegrees === 'number') {
      return `Your ${evidence.body} aligns with the ${evidence.angle} within a ${evidence.separationDegrees.toFixed(4)}° separation (defined ${evidence.orbLimitDegrees}° tolerance).`;
    }
    return `Your ${evidence.body} aligns within ${evidence.separationDegrees.toFixed(4)}° of the ${evidence.angle} axis.`;
  }

  // 3. Dual-axis meridian / horizon opposition
  if (
    typeof evidence.axis === 'string' &&
    typeof evidence.bodyA === 'string' &&
    typeof evidence.bodyB === 'string'
  ) {
    if (typeof evidence.orbLimitDegrees === 'number' && typeof evidence.separationDegrees === 'number') {
      return `Your ${evidence.bodyA} and ${evidence.bodyB} align across the ${evidence.axis} axis (${evidence.separationDegrees.toFixed(2)}° separation) within the defined ${evidence.orbLimitDegrees}° tolerance.`;
    }
    if (typeof evidence.deviationDegrees === 'number') {
      return `Your ${evidence.bodyA} and ${evidence.bodyB} align across opposite poles of the ${evidence.axis} axis within ${evidence.deviationDegrees.toFixed(2)}° deviation.`;
    }
  }

  // 4. Cazimi conjunction
  if (
    typeof evidence.cazimiBody === 'string' &&
    typeof evidence.separationDegrees === 'number' &&
    typeof evidence.orbLimitDegrees === 'number'
  ) {
    return `Your ${evidence.cazimiBody} and Sun form a ${evidence.separationDegrees.toFixed(4)}° separation, within the defined ${evidence.orbLimitDegrees}° cazimi boundary.`;
  }

  // 5. Stellium / Triple cluster
  if (
    Array.isArray(evidence.bodies) &&
    evidence.bodies.length >= 3 &&
    typeof evidence.spanDegrees === 'number'
  ) {
    const list = evidence.bodies.join(', ');
    if (typeof evidence.maxAllowedSpanDegrees === 'number') {
      return `Your ${list} cluster within a ${evidence.spanDegrees.toFixed(2)}° span, inside the defined ${evidence.maxAllowedSpanDegrees}° boundary.`;
    }
    return `Your ${list} converge within a compact ${evidence.spanDegrees.toFixed(2)}° zodiacal arc span.`;
  }

  // 6. T-Square (strict or continuous)
  if (
    Array.isArray(evidence.oppositionBodies) &&
    evidence.oppositionBodies.length === 2 &&
    typeof evidence.apexBody === 'string'
  ) {
    const [bA, bB] = evidence.oppositionBodies;
    if (typeof evidence.orbLimitDegrees === 'number') {
      return `Your ${bA} and ${bB} form an opposition focalized through 90° squares to ${evidence.apexBody} within the defined ${evidence.orbLimitDegrees}° tolerance.`;
    }
    if (typeof evidence.maxDeviationDegrees === 'number') {
      return `Your ${bA} and ${bB} form an oppositional axis focalized through 90° squares to ${evidence.apexBody} within ${evidence.maxDeviationDegrees.toFixed(2)}° maximum deviation.`;
    }
  }

  // 7. Grand Trine (strict or continuous)
  if (
    Array.isArray(evidence.bodies) &&
    evidence.bodies.length === 3 &&
    evidence.targetDegrees === 120
  ) {
    if (typeof evidence.orbLimitDegrees === 'number') {
      return `Your ${evidence.bodies.join(', ')} form a mutual 120° equilateral triangle within the defined ${evidence.orbLimitDegrees}° tolerance.`;
    }
    if (typeof evidence.maxDeviationDegrees === 'number') {
      return `Your ${evidence.bodies.join(', ')} form a 120° triangular configuration within ${evidence.maxDeviationDegrees.toFixed(2)}° maximum deviation from equilateral symmetry.`;
    }
  }

  // 8. Yod (strict or continuous)
  if (
    Array.isArray(evidence.sextileBodies) &&
    typeof evidence.apexBody === 'string'
  ) {
    const [bA, bB] = evidence.sextileBodies;
    if (typeof evidence.orbLimitDegrees === 'number') {
      return `Your ${bA} and ${bB} form a 60° sextile, both aligned in 150° quincunx aspects to ${evidence.apexBody} within ${evidence.orbLimitDegrees}° tolerance.`;
    }
    if (typeof evidence.maxDeviationDegrees === 'number') {
      return `Your ${bA} and ${bB} form a 60° sextile base aligned in 150° quincunx aspects to ${evidence.apexBody} within ${evidence.maxDeviationDegrees.toFixed(2)}° maximum deviation.`;
    }
  }

  // 9. Stationary node (strict or continuous)
  if (
    typeof evidence.body === 'string' &&
    typeof evidence.absoluteSpeedDegPerDay === 'number'
  ) {
    if (typeof evidence.thresholdDegPerDay === 'number') {
      return `Your ${evidence.body} moves at ${evidence.absoluteSpeedDegPerDay.toFixed(4)}°/day, within the defined ${evidence.thresholdDegPerDay}°/day stationary pivot threshold.`;
    }
    return `Your ${evidence.body} moves at ${evidence.absoluteSpeedDegPerDay.toFixed(4)}°/day near its stationary longitudinal turning point.`;
  }

  if ('separationDegrees' in evidence && typeof evidence.separationDegrees === 'number') {
    return `Observed angular separation of ${evidence.separationDegrees.toFixed(2)}° satisfies the defined rule tolerance.`;
  }

  return fallbackDescription;
}

/**
 * Registry-based deterministic fallback when AI is unavailable or fails.
 * Guarantees: AI failure != result failure.
 */
export function createFallbackExplanation(payload: ExplanationPayload): CanonicalExplanation {
  const { discoveryType = 'MATCHED_PATTERN', patternDescription, frequencyPercent, evidence } = payload;
  const evidenceText = formatMeasuredEvidenceText(evidence, patternDescription);

  const whyItStandsOut =
    discoveryType === 'CONTINUOUS_FEATURE'
      ? `An alignment this close occurs in ${frequencyPercent.toFixed(2)}% of our reference population.`
      : `This pattern occurs in ${frequencyPercent.toFixed(2)}% of our reference population.`;

  return {
    summary: patternDescription,
    whyItStandsOut,
    evidenceExplanation: evidenceText,
    isAiGenerated: false,
  };
}

/**
 * Isolated AI Explanation Service with bounded retry, timeouts, and metrics.
 * Factual Lock: AI cannot alter numbers, percentages, or predictions.
 */
export async function generatePatternExplanation(
  payload: ExplanationPayload
): Promise<CanonicalExplanation> {
  const config = getAppConfig();
  const fallback = createFallbackExplanation(payload);

  const apiKey = config.geminiApiKey;
  if (!apiKey) {
    metrics.recordAiCall(false);
    return fallback;
  }

  const isContinuous = payload.discoveryType === 'CONTINUOUS_FEATURE';

  const prompt = `
You are the statistical explanation engine for AREYOURARE, an astronomical pattern discovery tool.
Explain the following verified chart ${isContinuous ? 'continuous alignment feature' : 'pattern'} based ONLY on the provided factual evidence.

DISCOVERY DETAILS:
- Type: ${isContinuous ? 'CONTINUOUS_FEATURE (near-pattern geometric measurement)' : 'MATCHED_PATTERN (strict threshold match)'}
- Name: "${payload.patternName}"
- Category: ${payload.category}
- Registry Description: "${payload.patternDescription}"
- Reference Benchmark: ${payload.frequencyPercent.toFixed(2)}% of our reference population
- Measured Evidence: ${JSON.stringify(payload.evidence)}

WRITING CONSTRAINTS:
1. Write in a refined, minimalist, editorial tone.
2. Be ultra-concise (1 sentence per field).
3. Frame astrology strictly as geometric/symbolic chart analysis—never make supernatural, medical, or guaranteed psychological claims.
4. ${isContinuous ? 'Do NOT claim a strict binary pattern threshold was crossed; describe the measured angular proximity objectively.' : 'Do NOT claim a high-frequency pattern is exceptionally rare, and do NOT use "one in X people".'}
5. Do NOT alter any numerical frequencies, percentages, or measurements.
6. Return structured JSON matching the requested schema.
`;

  const maxAttempts = 2;
  const timeoutMs = config.timeouts.aiRequestMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI request timeout')), timeoutMs)
      );

      const apiCallPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an editorial astronomy and pattern explanation assistant. Always return concise 1-sentence JSON fields explaining verified geometric evidence without exaggerating rarity claims.',
          temperature: 0.2,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.STRING,
                description: 'One concise sentence describing the geometric alignment identified in the chart.',
              },
              whyItStandsOut: {
                type: Type.STRING,
                description: 'One concise sentence stating the exact percentage in our reference population.',
              },
              evidenceExplanation: {
                type: Type.STRING,
                description: 'One clear sentence stating the specific bodies and angular measurement.',
              },
            },
            required: ['summary', 'whyItStandsOut', 'evidenceExplanation'],
          },
        },
      });

      const response = await Promise.race([apiCallPromise, timeoutPromise]);
      const text = response.text?.trim();

      if (text) {
        const parsed = JSON.parse(text);
        if (
          typeof parsed.summary === 'string' &&
          typeof parsed.whyItStandsOut === 'string' &&
          typeof parsed.evidenceExplanation === 'string'
        ) {
          metrics.recordAiCall(true);
          return {
            summary: parsed.summary.trim(),
            whyItStandsOut: fallback.whyItStandsOut,
            evidenceExplanation: fallback.evidenceExplanation,
            isAiGenerated: true,
          };
        }
      }
    } catch (err: unknown) {
      logger.warn('AI explanation request error', {
        service: 'gemini-ai',
        attempt,
        error: err instanceof Error ? err.message : 'Unknown AI error',
      });

      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 200 * attempt));
      }
    }
  }

  metrics.recordAiCall(false);
  return fallback;
}
