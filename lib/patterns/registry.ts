import { PatternDefinition } from '../types/patterns';
import { BirthChartResult } from '../types/astronomy';
import { isWithinOrb, findAngularConjunction, findStellium, findGrandTrine, findTsquare, findGrandCross, findYod, findKite } from './rules';
import { angularDistance } from '../astronomy/math';

export const PATTERN_REGISTRY: PatternDefinition[] = [
  // ----------------------------------------------------
  // 1. ANGULAR PATTERNS
  // ----------------------------------------------------
  {
    id: 'pat_solar_zenith_mc',
    name: 'Solar Midheaven Zenith Alignment',
    version: '1.0',
    category: 'angular',
    description: 'The Sun resides in exact culmination at the upper meridian (Midheaven) within 1.0° orb.',
    enabled: true,
    ruleType: 'angular_conjunction',
    parameters: { body: 'Sun', angle: 'midheaven', maxOrbDeg: 1.0 },
    evaluate: (chart: BirthChartResult) => {
      const sun = chart.planets.Sun;
      if (!sun) return { matched: false };
      const res = findAngularConjunction('Sun', sun.longitude, 'Midheaven', chart.angles.midheaven, 1.0);
      return res ? { matched: true, evidence: res } : { matched: false };
    },
  },
  {
    id: 'pat_ascendant_conjunction',
    name: 'Ascendant Rising Planet Alignment',
    version: '1.0',
    category: 'angular',
    description: 'A major celestial body rises precisely upon the eastern horizon (Ascendant) within 1.0° orb.',
    enabled: true,
    ruleType: 'angular_conjunction',
    parameters: { angle: 'ascendant', maxOrbDeg: 1.0 },
    evaluate: (chart: BirthChartResult) => {
      let bestMatch: ReturnType<typeof findAngularConjunction> = null;
      for (const planet of Object.values(chart.planets)) {
        const res = findAngularConjunction(planet.body, planet.longitude, 'Ascendant', chart.angles.ascendant, 1.0);
        if (res && (!bestMatch || res.deviationDegrees < bestMatch.deviationDegrees)) {
          bestMatch = res;
        }
      }
      return bestMatch ? { matched: true, evidence: bestMatch } : { matched: false };
    },
  },
  {
    id: 'pat_meridian_opposition',
    name: 'Dual Axis Meridian Opposition',
    version: '1.0',
    category: 'angular',
    description: 'Two celestial bodies lock into simultaneous conjunction with opposite poles of an angular axis within 1.0° orb.',
    enabled: true,
    ruleType: 'angular_axis_opposition',
    parameters: { axes: ['ascendant-descendant', 'midheaven-nadir'], maxOrbDeg: 1.0 },
    evaluate: (chart: BirthChartResult) => {
      const planets = Object.values(chart.planets);
      let bestEvidence: Record<string, unknown> | null = null;
      let minCombinedDev = Infinity;

      for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
          const pA = planets[i];
          const pB = planets[j];

          // Check Ascendant - Descendant axis
          const ascA = isWithinOrb(pA.longitude, chart.angles.ascendant, 0, 1.0);
          const dcB = isWithinOrb(pB.longitude, chart.angles.descendant, 0, 1.0);
          const ascB = isWithinOrb(pB.longitude, chart.angles.ascendant, 0, 1.0);
          const dcA = isWithinOrb(pA.longitude, chart.angles.descendant, 0, 1.0);

          if (ascA.isMatch && dcB.isMatch) {
            const dev = Math.max(ascA.deviationDeg, dcB.deviationDeg);
            if (dev < minCombinedDev) {
              minCombinedDev = dev;
              bestEvidence = {
                axis: 'Ascendant-Descendant',
                bodyA: pA.body,
                bodyB: pB.body,
                separationDegrees: angularDistance(pA.longitude, pB.longitude),
                targetDegrees: 180,
                orbLimitDegrees: 1.0,
                deviationDegrees: dev,
              };
            }
          } else if (ascB.isMatch && dcA.isMatch) {
            const dev = Math.max(ascB.deviationDeg, dcA.deviationDeg);
            if (dev < minCombinedDev) {
              minCombinedDev = dev;
              bestEvidence = {
                axis: 'Ascendant-Descendant',
                bodyA: pA.body,
                bodyB: pB.body,
                separationDegrees: angularDistance(pA.longitude, pB.longitude),
                targetDegrees: 180,
                orbLimitDegrees: 1.0,
                deviationDegrees: dev,
              };
            }
          }

          // Check MC - IC axis
          const mcA = isWithinOrb(pA.longitude, chart.angles.midheaven, 0, 1.0);
          const icB = isWithinOrb(pB.longitude, chart.angles.nadir, 0, 1.0);
          const mcB = isWithinOrb(pB.longitude, chart.angles.midheaven, 0, 1.0);
          const icA = isWithinOrb(pA.longitude, chart.angles.nadir, 0, 1.0);

          if (mcA.isMatch && icB.isMatch) {
            const dev = Math.max(mcA.deviationDeg, icB.deviationDeg);
            if (dev < minCombinedDev) {
              minCombinedDev = dev;
              bestEvidence = {
                axis: 'Midheaven-Nadir',
                bodyA: pA.body,
                bodyB: pB.body,
                separationDegrees: angularDistance(pA.longitude, pB.longitude),
                targetDegrees: 180,
                orbLimitDegrees: 1.0,
                deviationDegrees: dev,
              };
            }
          } else if (mcB.isMatch && icA.isMatch) {
            const dev = Math.max(mcB.deviationDeg, icA.deviationDeg);
            if (dev < minCombinedDev) {
              minCombinedDev = dev;
              bestEvidence = {
                axis: 'Midheaven-Nadir',
                bodyA: pA.body,
                bodyB: pB.body,
                separationDegrees: angularDistance(pA.longitude, pB.longitude),
                targetDegrees: 180,
                orbLimitDegrees: 1.0,
                deviationDegrees: dev,
              };
            }
          }
        }
      }
      return bestEvidence ? { matched: true, evidence: bestEvidence } : { matched: false };
    },
  },
  {
    id: 'pat_meridian_cross_conjunction',
    name: 'Four-Point Meridian Quadrant Alignment',
    version: '1.0',
    category: 'angular',
    description: 'Celestial bodies concurrently occupy three or more of the four primary angular cusps (ASC, MC, DC, IC) within 2.0° orb.',
    enabled: true,
    ruleType: 'multi_angle_cluster',
    parameters: { minAnglesOccupied: 3, maxOrbDeg: 2.0 },
    evaluate: (chart: BirthChartResult) => {
      const angles = [
        { name: 'Ascendant', long: chart.angles.ascendant },
        { name: 'Midheaven', long: chart.angles.midheaven },
        { name: 'Descendant', long: chart.angles.descendant },
        { name: 'Nadir', long: chart.angles.nadir },
      ];

      const occupied: Array<{ angle: string; body: string; deviationDegrees: number }> = [];
      for (const ang of angles) {
        let closestForAngle: { angle: string; body: string; deviationDegrees: number } | null = null;
        for (const planet of Object.values(chart.planets)) {
          const res = isWithinOrb(planet.longitude, ang.long, 0, 2.0);
          if (res.isMatch && (!closestForAngle || res.deviationDeg < closestForAngle.deviationDegrees)) {
            closestForAngle = { angle: ang.name, body: planet.body, deviationDegrees: res.deviationDeg };
          }
        }
        if (closestForAngle) {
          occupied.push(closestForAngle);
        }
      }

      if (occupied.length >= 3) {
        return {
          matched: true,
          evidence: {
            occupiedAnglesCount: occupied.length,
            occupied,
            orbLimitDegrees: 2.0,
          },
        };
      }
      return { matched: false };
    },
  },

  // ----------------------------------------------------
  // 2. ASPECT PATTERNS
  // ----------------------------------------------------
  {
    id: 'pat_exact_cazimi',
    name: 'Heart of the Sun Cazimi Conjunction',
    version: '1.0',
    category: 'aspect',
    description: 'A planet resides in exact central conjunction with the Sun within 16 arcminutes (0.267° orb).',
    enabled: true,
    ruleType: 'cazimi_conjunction',
    parameters: { maxOrbDeg: 0.2667 },
    evaluate: (chart: BirthChartResult) => {
      const sun = chart.planets.Sun;
      if (!sun) return { matched: false };

      let bestEvidence: Record<string, unknown> | null = null;
      let minDev = Infinity;

      for (const planet of Object.values(chart.planets)) {
        if (planet.body === 'Sun') continue;
        const res = isWithinOrb(sun.longitude, planet.longitude, 0, 0.2667);
        if (res.isMatch && res.deviationDeg < minDev) {
          minDev = res.deviationDeg;
          bestEvidence = {
            centralBody: 'Sun',
            cazimiBody: planet.body,
            separationDegrees: res.separationDeg,
            targetDegrees: 0,
            orbLimitDegrees: 0.2667,
            deviationDegrees: res.deviationDeg,
            deviationArcminutes: res.deviationDeg * 60,
          };
        }
      }
      return bestEvidence ? { matched: true, evidence: bestEvidence } : { matched: false };
    },
  },
  {
    id: 'pat_triple_conjunction',
    name: 'Compact Triple Planetary Conjunction',
    version: '1.0',
    category: 'aspect',
    description: 'Three distinct celestial bodies converge within a tight 3.0° arc span.',
    enabled: true,
    ruleType: 'tight_cluster',
    parameters: { minBodies: 3, maxSpanDeg: 3.0 },
    evaluate: (chart: BirthChartResult) => {
      const bodies = Object.values(chart.planets).map((p) => ({ name: p.body, longitude: p.longitude }));
      const stellium = findStellium(bodies, 3.0, 3);
      if (stellium) {
        return {
          matched: true,
          evidence: {
            bodies: stellium.bodies,
            spanDegrees: stellium.spanDegrees,
            maxAllowedSpanDegrees: 3.0,
            longitudes: stellium.longitudes,
          },
        };
      }
      return { matched: false };
    },
  },
  {
    id: 'pat_exact_opposition',
    name: 'Precise Diurnal Syzygy Opposition',
    version: '1.0',
    category: 'aspect',
    description: 'Two major celestial bodies form an exact 180.0° oppositional line with less than 0.35° deviation.',
    enabled: true,
    ruleType: 'exact_aspect',
    parameters: { targetDegrees: 180, maxOrbDeg: 0.35 },
    evaluate: (chart: BirthChartResult) => {
      const planets = Object.values(chart.planets);
      let bestEvidence: Record<string, unknown> | null = null;
      let minDev = Infinity;

      for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
          const res = isWithinOrb(planets[i].longitude, planets[j].longitude, 180, 0.35);
          if (res.isMatch && res.deviationDeg < minDev) {
            minDev = res.deviationDeg;
            bestEvidence = {
              bodies: [planets[i].body, planets[j].body],
              separationDegrees: res.separationDeg,
              targetDegrees: 180,
              deviationDegrees: res.deviationDeg,
              orbLimitDegrees: 0.35,
            };
          }
        }
      }
      return bestEvidence ? { matched: true, evidence: bestEvidence } : { matched: false };
    },
  },
  {
    id: 'pat_exact_trine_pair',
    name: 'Exact Harmonic Trine Alignment',
    version: '1.0',
    category: 'aspect',
    description: 'Two celestial bodies form a precise 120.0° trine aspect with less than 0.35° deviation.',
    enabled: true,
    ruleType: 'exact_aspect',
    parameters: { targetDegrees: 120, maxOrbDeg: 0.35 },
    evaluate: (chart: BirthChartResult) => {
      const planets = Object.values(chart.planets);
      let bestEvidence: Record<string, unknown> | null = null;
      let minDev = Infinity;

      for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
          const res = isWithinOrb(planets[i].longitude, planets[j].longitude, 120, 0.35);
          if (res.isMatch && res.deviationDeg < minDev) {
            minDev = res.deviationDeg;
            bestEvidence = {
              bodies: [planets[i].body, planets[j].body],
              separationDegrees: res.separationDeg,
              targetDegrees: 120,
              deviationDegrees: res.deviationDeg,
              orbLimitDegrees: 0.35,
            };
          }
        }
      }
      return bestEvidence ? { matched: true, evidence: bestEvidence } : { matched: false };
    },
  },

  // ----------------------------------------------------
  // 3. STRUCTURAL GEOMETRIC CONFIGURATIONS
  // ----------------------------------------------------
  {
    id: 'pat_grand_trine',
    name: 'Grand Trine Equilateral Equilibrium',
    version: '1.0',
    category: 'structural',
    description: 'Three celestial bodies form an equilateral triangular 120° configuration with all orbs within 2.0°.',
    enabled: true,
    ruleType: 'grand_trine',
    parameters: { targetDegrees: 120, maxOrbDeg: 2.0 },
    evaluate: (chart: BirthChartResult) => {
      const bodies = Object.values(chart.planets).map((p) => ({ name: p.body, longitude: p.longitude }));
      const gt = findGrandTrine(bodies, 2.0);
      return gt ? { matched: true, evidence: gt } : { matched: false };
    },
  },
  {
    id: 'pat_t_square',
    name: 'T-Square Tension Focal Axis',
    version: '1.0',
    category: 'structural',
    description: 'An opposition between two celestial bodies focalizes through simultaneous 90° squares to a third apex body within 2.0° orb.',
    enabled: true,
    ruleType: 't_square',
    parameters: { maxOrbDeg: 2.0 },
    evaluate: (chart: BirthChartResult) => {
      const bodies = Object.values(chart.planets).map((p) => ({ name: p.body, longitude: p.longitude }));
      const tsq = findTsquare(bodies, 2.0);
      return tsq ? { matched: true, evidence: tsq } : { matched: false };
    },
  },
  {
    id: 'pat_grand_cross',
    name: 'Grand Cross Quadrant Tension Grid',
    version: '1.0',
    category: 'structural',
    description: 'Four celestial bodies form four 90° squares and two 180° oppositions within 2.5° orb.',
    enabled: true,
    ruleType: 'grand_cross',
    parameters: { maxOrbDeg: 2.5 },
    evaluate: (chart: BirthChartResult) => {
      const bodies = Object.values(chart.planets).map((p) => ({ name: p.body, longitude: p.longitude }));
      const gc = findGrandCross(bodies, 2.5);
      return gc ? { matched: true, evidence: gc } : { matched: false };
    },
  },
  {
    id: 'pat_yod_finger_of_fate',
    name: 'Harmonic Yod Inconjunct Geometry',
    version: '1.0',
    category: 'structural',
    description: 'Two celestial bodies in 60° sextile both form 150° quincunx aspects to a single apex body within 1.5° orb.',
    enabled: true,
    ruleType: 'yod',
    parameters: { maxOrbDeg: 1.5 },
    evaluate: (chart: BirthChartResult) => {
      const bodies = Object.values(chart.planets).map((p) => ({ name: p.body, longitude: p.longitude }));
      const yod = findYod(bodies, 1.5);
      return yod ? { matched: true, evidence: yod } : { matched: false };
    },
  },
  {
    id: 'pat_kite_formation',
    name: 'Symmetrical Kite Alignment',
    version: '1.0',
    category: 'structural',
    description: 'A Grand Trine balanced by a fourth body forming a direct spine opposition and dual 60° sextiles within 2.0° orb.',
    enabled: true,
    ruleType: 'kite',
    parameters: { maxOrbDeg: 2.0 },
    evaluate: (chart: BirthChartResult) => {
      const bodies = Object.values(chart.planets).map((p) => ({ name: p.body, longitude: p.longitude }));
      const kite = findKite(bodies, 2.0);
      return kite ? { matched: true, evidence: kite } : { matched: false };
    },
  },

  // ----------------------------------------------------
  // 4. PLANETARY & MOTION PATTERNS
  // ----------------------------------------------------
  {
    id: 'pat_stellium_cluster',
    name: 'Four-Body Stellium Cluster',
    version: '1.0',
    category: 'planetary',
    description: 'Four or more celestial bodies clustered together within a compact 12.0° zodiacal span.',
    enabled: true,
    ruleType: 'stellium',
    parameters: { minBodies: 4, maxSpanDeg: 12.0 },
    evaluate: (chart: BirthChartResult) => {
      const bodies = Object.values(chart.planets).map((p) => ({ name: p.body, longitude: p.longitude }));
      const stellium = findStellium(bodies, 12.0, 4);
      return stellium ? { matched: true, evidence: stellium } : { matched: false };
    },
  },
  {
    id: 'pat_stationary_node',
    name: 'Stationary Planetary Pivot Node',
    version: '1.0',
    category: 'planetary',
    description: 'A planet reaches its stationary turning point between direct and retrograde motion with daily speed ≤ 0.005°/day.',
    enabled: true,
    ruleType: 'stationary_planet',
    parameters: { maxAbsoluteSpeedDegPerDay: 0.005 },
    evaluate: (chart: BirthChartResult) => {
      let bestEvidence: Record<string, unknown> | null = null;
      let minSpeed = Infinity;

      for (const planet of Object.values(chart.planets)) {
        if (planet.body === 'Sun' || planet.body === 'Moon') continue;
        const absSpeed = Math.abs(planet.speedDegPerDay);
        if (absSpeed <= 0.005 && absSpeed < minSpeed) {
          minSpeed = absSpeed;
          bestEvidence = {
            body: planet.body,
            speedDegPerDay: planet.speedDegPerDay,
            absoluteSpeedDegPerDay: absSpeed,
            thresholdDegPerDay: 0.005,
            longitude: planet.longitude,
            isRetrograde: planet.isRetrograde,
          };
        }
      }
      return bestEvidence ? { matched: true, evidence: bestEvidence } : { matched: false };
    },
  },
];
