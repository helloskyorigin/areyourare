import { PATTERN_REGISTRY } from '../registry';
import { evaluatePatterns } from '../evaluator';
import { isWithinOrb, findStellium, findGrandTrine, findTsquare, findGrandCross, findYod, findKite } from '../rules';
import { BirthChartResult, CelestialBodyName, CelestialBodyPosition } from '../../types/astronomy';

export interface PatternTestCaseResult {
  name: string;
  passed: boolean;
  details?: string;
}

/**
 * Creates a synthetic controlled chart fixture for exact mathematical unit testing
 */
function createMockChart(overrides?: {
  planets?: Partial<Record<CelestialBodyName, Partial<CelestialBodyPosition>>>;
  angles?: { ascendant?: number; midheaven?: number; descendant?: number; nadir?: number };
}): BirthChartResult {
  const basePlanets: Record<CelestialBodyName, CelestialBodyPosition> = {
    Sun: { body: 'Sun', longitude: 10, latitude: 0, distanceAu: 1, speedDegPerDay: 0.98, isRetrograde: false, sign: 'Aries', signDegree: 10, formattedLongitude: "10° Aries" },
    Moon: { body: 'Moon', longitude: 75, latitude: 0, distanceAu: 0.0025, speedDegPerDay: 13.1, isRetrograde: false, sign: 'Gemini', signDegree: 15, formattedLongitude: "15° Gemini" },
    Mercury: { body: 'Mercury', longitude: 140, latitude: 0, distanceAu: 0.9, speedDegPerDay: 1.2, isRetrograde: false, sign: 'Leo', signDegree: 20, formattedLongitude: "20° Leo" },
    Venus: { body: 'Venus', longitude: 195, latitude: 0, distanceAu: 0.7, speedDegPerDay: 1.1, isRetrograde: false, sign: 'Libra', signDegree: 15, formattedLongitude: "15° Libra" },
    Mars: { body: 'Mars', longitude: 230, latitude: 0, distanceAu: 1.5, speedDegPerDay: 0.5, isRetrograde: false, sign: 'Scorpio', signDegree: 20, formattedLongitude: "20° Scorpio" },
    Jupiter: { body: 'Jupiter', longitude: 280, latitude: 0, distanceAu: 5.2, speedDegPerDay: 0.08, isRetrograde: false, sign: 'Capricorn', signDegree: 10, formattedLongitude: "10° Capricorn" },
    Saturn: { body: 'Saturn', longitude: 310, latitude: 0, distanceAu: 9.5, speedDegPerDay: 0.03, isRetrograde: false, sign: 'Aquarius', signDegree: 10, formattedLongitude: "10° Aquarius" },
    Uranus: { body: 'Uranus', longitude: 45, latitude: 0, distanceAu: 19.2, speedDegPerDay: 0.01, isRetrograde: false, sign: 'Taurus', signDegree: 15, formattedLongitude: "15° Taurus" },
    Neptune: { body: 'Neptune', longitude: 350, latitude: 0, distanceAu: 30.1, speedDegPerDay: 0.008, isRetrograde: false, sign: 'Pisces', signDegree: 20, formattedLongitude: "20° Pisces" },
    Pluto: { body: 'Pluto', longitude: 300, latitude: 0, distanceAu: 34.0, speedDegPerDay: 0.004, isRetrograde: false, sign: 'Capricorn', signDegree: 30, formattedLongitude: "30° Capricorn" },
  };

  if (overrides?.planets) {
    for (const [name, p] of Object.entries(overrides.planets)) {
      if (basePlanets[name as CelestialBodyName]) {
        basePlanets[name as CelestialBodyName] = {
          ...basePlanets[name as CelestialBodyName],
          ...p,
        };
      }
    }
  }

  const asc = overrides?.angles?.ascendant ?? 0;
  const mc = overrides?.angles?.midheaven ?? 90;
  const dc = overrides?.angles?.descendant ?? 180;
  const ic = overrides?.angles?.nadir ?? 270;

  return {
    calculationVersion: 'v1',
    engine: {
      name: 'OUTLIER Deterministic Astronomy Engine',
      version: '1.0.0',
      provider: 'AstronomyEngine (VSOP87 / ELP2000)',
      license: 'MIT',
    },
    input: {
      localDate: '2000-01-01',
      localTime: '12:00',
      timezone: 'UTC',
      latitude: 0,
      longitude: 0,
      city: 'Test City',
      country: 'Test Country',
    },
    time: {
      localIso: '2000-01-01T12:00:00.000',
      utcIso: '2000-01-01T12:00:00.000Z',
      julianDay: 2451545.0,
      greenwichSiderealTimeHours: 18.66,
      localSiderealTimeHours: 18.66,
      localSiderealTimeDegrees: 279.9,
      obliquityDeg: 23.439,
    },
    planets: basePlanets,
    angles: {
      ascendant: asc,
      midheaven: mc,
      descendant: dc,
      nadir: ic,
      formattedAscendant: `${asc}° Ascendant`,
      formattedMidheaven: `${mc}° Midheaven`,
    },
    houses: {
      system: 'placidus',
      cusps: [asc, 30, 60, ic, 120, 150, dc, 210, 240, mc, 300, 330],
      formattedCusps: [],
    },
    angularSeparations: [],
    status: 'calculated',
  };
}

export function runPatternEngineTests(): PatternTestCaseResult[] {
  const results: PatternTestCaseResult[] = [];

  // 1. Math Utility: isWithinOrb with 0°/360° boundary
  try {
    const wrapTest1 = isWithinOrb(359.5, 0.5, 0, 1.5); // difference is 1.0 deg
    const wrapTest2 = isWithinOrb(358.0, 2.0, 0, 3.0); // difference is 4.0 deg
    const passed = wrapTest1.isMatch && wrapTest1.separationDeg === 1.0 && !wrapTest2.isMatch;
    results.push({
      name: '1. Math Rule: isWithinOrb correctly handles 0°/360° circular wrapping',
      passed,
    });
  } catch (err) {
    results.push({ name: '1. Math Rule: isWithinOrb', passed: false, details: String(err) });
  }

  // 2. Math Utility: Grand Trine detection
  try {
    const bodies = [
      { name: 'Sun', longitude: 10.0 },
      { name: 'Moon', longitude: 130.5 },
      { name: 'Mars', longitude: 250.2 },
      { name: 'Venus', longitude: 50.0 },
    ];
    const gt = findGrandTrine(bodies, 2.0);
    const passed = !!gt && gt.bodies.includes('Sun') && gt.bodies.includes('Moon') && gt.bodies.includes('Mars');
    results.push({
      name: '2. Math Rule: findGrandTrine detects 3-body 120° configuration',
      passed,
    });
  } catch (err) {
    results.push({ name: '2. Math Rule: findGrandTrine', passed: false, details: String(err) });
  }

  // 3. Math Utility: T-Square detection
  try {
    const bodies = [
      { name: 'Sun', longitude: 0.0 },
      { name: 'Moon', longitude: 180.5 },
      { name: 'Mars', longitude: 90.2 },
    ];
    const tsq = findTsquare(bodies, 2.0);
    const passed = !!tsq && tsq.apexBody === 'Mars';
    results.push({
      name: '3. Math Rule: findTsquare detects opposition with apex square',
      passed,
    });
  } catch (err) {
    results.push({ name: '3. Math Rule: findTsquare', passed: false, details: String(err) });
  }

  // 4. Math Utility: Grand Cross detection
  try {
    const bodies = [
      { name: 'Sun', longitude: 0.5 },
      { name: 'Moon', longitude: 91.0 },
      { name: 'Mars', longitude: 180.2 },
      { name: 'Venus', longitude: 270.8 },
    ];
    const gc = findGrandCross(bodies, 2.5);
    const passed = !!gc && gc.bodies.length === 4;
    results.push({
      name: '4. Math Rule: findGrandCross detects 4-planet square grid',
      passed,
    });
  } catch (err) {
    results.push({ name: '4. Math Rule: findGrandCross', passed: false, details: String(err) });
  }

  // 5. Math Utility: Yod (Finger of Fate) detection
  try {
    const bodies = [
      { name: 'Sun', longitude: 0.0 },
      { name: 'Moon', longitude: 60.5 }, // sextile to Sun
      { name: 'Mars', longitude: 150.2 }, // quincunx to Sun, quincunx to Moon (150.2 - 60.5 = 89.7 -> not yod)
    ];
    // For proper Yod: base at 0° and 60°, apex at 210° (210 - 0 = 210 -> 150° quincunx; 210 - 60 = 150° quincunx)
    const validYodBodies = [
      { name: 'Sun', longitude: 0.0 },
      { name: 'Moon', longitude: 60.5 },
      { name: 'Mars', longitude: 210.2 },
    ];
    const yod = findYod(validYodBodies, 1.5);
    const passed = !!yod && yod.apexBody === 'Mars';
    results.push({
      name: '5. Math Rule: findYod detects sextile base with dual quincunx apex',
      passed,
    });
  } catch (err) {
    results.push({ name: '5. Math Rule: findYod', passed: false, details: String(err) });
  }

  // 6. Math Utility: Stellium cluster detection
  try {
    const bodies = [
      { name: 'Sun', longitude: 100.0 },
      { name: 'Moon', longitude: 102.5 },
      { name: 'Mercury', longitude: 106.0 },
      { name: 'Venus', longitude: 109.5 },
      { name: 'Mars', longitude: 200.0 },
    ];
    const st = findStellium(bodies, 12.0, 4);
    const passed = !!st && st.bodyCount === 4 && st.spanDegrees === 9.5;
    results.push({
      name: '6. Math Rule: findStellium detects 4-body cluster within 12.0° span',
      passed,
    });
  } catch (err) {
    results.push({ name: '6. Math Rule: findStellium', passed: false, details: String(err) });
  }

  // 7. Pattern: pat_solar_zenith_mc (Positive, Negative, Boundary)
  try {
    const positiveChart = createMockChart({
      planets: { Sun: { longitude: 90.4 } },
      angles: { midheaven: 90.0 },
    });
    const justOutsideChart = createMockChart({
      planets: { Sun: { longitude: 91.5 } }, // deviation 1.5 > orb 1.0
      angles: { midheaven: 90.0 },
    });

    const posResult = PATTERN_REGISTRY.find((p) => p.id === 'pat_solar_zenith_mc')?.evaluate(positiveChart);
    const outResult = PATTERN_REGISTRY.find((p) => p.id === 'pat_solar_zenith_mc')?.evaluate(justOutsideChart);

    const passed = posResult?.matched === true && outResult?.matched === false && !!posResult?.evidence;
    results.push({
      name: '7. Pattern pat_solar_zenith_mc: Positive match & tolerance boundary check',
      passed,
    });
  } catch (err) {
    results.push({ name: '7. pat_solar_zenith_mc', passed: false, details: String(err) });
  }

  // 8. Pattern: pat_exact_cazimi (Positive & Boundary)
  try {
    const cazimiChart = createMockChart({
      planets: {
        Sun: { longitude: 45.0 },
        Mercury: { longitude: 45.15 }, // 0.15 deg = 9 arcmin <= 16 arcmin (0.267 deg)
      },
    });
    const combustionChart = createMockChart({
      planets: {
        Sun: { longitude: 45.0 },
        Mercury: { longitude: 45.45 }, // 0.45 deg > 0.267 deg
      },
    });

    const posResult = PATTERN_REGISTRY.find((p) => p.id === 'pat_exact_cazimi')?.evaluate(cazimiChart);
    const negResult = PATTERN_REGISTRY.find((p) => p.id === 'pat_exact_cazimi')?.evaluate(combustionChart);

    const passed = posResult?.matched === true && negResult?.matched === false;
    results.push({
      name: '8. Pattern pat_exact_cazimi: Exact Cazimi within 16 arcminutes',
      passed,
    });
  } catch (err) {
    results.push({ name: '8. pat_exact_cazimi', passed: false, details: String(err) });
  }

  // 9. Pattern: pat_stationary_node (Positive & Boundary)
  try {
    const stationaryChart = createMockChart({
      planets: {
        Saturn: { speedDegPerDay: 0.003 }, // <= 0.005
      },
    });
    const movingChart = createMockChart({
      planets: {
        Saturn: { speedDegPerDay: 0.04 }, // > 0.005
      },
    });

    const posResult = PATTERN_REGISTRY.find((p) => p.id === 'pat_stationary_node')?.evaluate(stationaryChart);
    const negResult = PATTERN_REGISTRY.find((p) => p.id === 'pat_stationary_node')?.evaluate(movingChart);

    const passed = posResult?.matched === true && negResult?.matched === false;
    results.push({
      name: '9. Pattern pat_stationary_node: Stationary planet detection (|speed| <= 0.005°/day)',
      passed,
    });
  } catch (err) {
    results.push({ name: '9. pat_stationary_node', passed: false, details: String(err) });
  }

  // 10. Generic Evaluator Engine Determinism
  try {
    const testChart = createMockChart({
      planets: {
        Sun: { longitude: 90.2 },
        Moon: { longitude: 210.1 },
        Mars: { longitude: 330.3 },
      },
      angles: { midheaven: 90.0, ascendant: 0.0 },
    });

    const run1 = evaluatePatterns(testChart);
    const run2 = evaluatePatterns(testChart);

    const passed =
      run1.engineVersion === 'v1' &&
      run1.patternsChecked === PATTERN_REGISTRY.length &&
      run1.matches.length === run2.matches.length &&
      JSON.stringify(run1.matches) === JSON.stringify(run2.matches) &&
      run1.matches.every((m) => !!m.patternId && !!m.name && !!m.category && !!m.evidence);

    results.push({
      name: '10. Pattern Engine Determinism: Identical chart returns identical matches with complete evidence',
      passed,
      details: `Checked ${run1.patternsChecked} patterns, found ${run1.matches.length} matches.`,
    });
  } catch (err) {
    results.push({ name: '10. Pattern Engine Determinism', passed: false, details: String(err) });
  }

  return results;
}
