import { BirthChartResult } from '../types/astronomy';
import {
  ContinuousFeatureDefinition,
  ContinuousFeatureMeasurement,
} from '../types/patterns';
import { angularDistance, normalizeDegrees } from '../astronomy/math';

/**
 * Helper to find the minimum circular span of K bodies on the 360° ecliptic.
 */
function findClosestClusterSpan(
  bodies: Array<{ name: string; longitude: number }>,
  clusterSize: number
): {
  bodies: string[];
  spanDegrees: number;
  longitudes: Array<{ name: string; longitude: number }>;
} {
  const sorted = [...bodies].sort((a, b) => a.longitude - b.longitude);
  const n = sorted.length;
  let minSpan = Infinity;
  let bestSubset: Array<{ name: string; longitude: number }> = sorted.slice(0, clusterSize);

  for (let i = 0; i < n; i++) {
    const subset: Array<{ name: string; longitude: number }> = [];
    for (let j = 0; j < clusterSize; j++) {
      subset.push(sorted[(i + j) % n]);
    }
    let span = 0;
    for (let k = 0; k < subset.length - 1; k++) {
      span += normalizeDegrees(subset[k + 1].longitude - subset[k].longitude);
    }
    if (span < minSpan) {
      minSpan = span;
      bestSubset = subset;
    }
  }

  return {
    bodies: bestSubset.map((b) => b.name),
    spanDegrees: minSpan,
    longitudes: bestSubset,
  };
}

/**
 * Helper to find the pair of planets closest to a target aspect angle (0, 60, 90, 120, 180).
 */
function findClosestPairwiseAspect(
  chart: BirthChartResult,
  targetDegrees: number
): {
  bodies: [string, string];
  separationDegrees: number;
  deviationDegrees: number;
  targetDegrees: number;
} {
  const planets = Object.values(chart.planets);
  let minDev = Infinity;
  let bestSep = 0;
  let bestPair: [string, string] = [planets[0].body, planets[1].body];

  for (let i = 0; i < planets.length; i++) {
    for (let j = i + 1; j < planets.length; j++) {
      const sep = angularDistance(planets[i].longitude, planets[j].longitude);
      const dev = Math.abs(sep - targetDegrees);
      if (dev < minDev) {
        minDev = dev;
        bestSep = sep;
        bestPair = [planets[i].body, planets[j].body];
      }
    }
  }

  return {
    bodies: bestPair,
    separationDegrees: bestSep,
    deviationDegrees: minDev,
    targetDegrees,
  };
}

/**
 * Official Continuous Geometric Feature Registry (15 Features)
 * Evaluated deterministically for every valid birth chart to measure exact distanceFromIdeal.
 */
export const CONTINUOUS_FEATURE_REGISTRY: ContinuousFeatureDefinition[] = [
  // 1. Solar Meridian Alignment
  {
    id: 'feat_solar_meridian_alignment',
    name: 'Solar Meridian Axis Alignment',
    version: '1.0',
    category: 'angular',
    description:
      'Measures the angular proximity of the Sun to the vertical meridian axis (Midheaven or Nadir).',
    idealTarget: 0,
    unit: 'degrees',
    enabled: true,
    measure: (chart: BirthChartResult) => {
      const sunLong = chart.planets.Sun.longitude;
      const distMc = angularDistance(sunLong, chart.angles.midheaven);
      const distIc = angularDistance(sunLong, chart.angles.nadir);
      const isMcCloser = distMc <= distIc;
      const dist = isMcCloser ? distMc : distIc;
      const angleName = isMcCloser ? 'Midheaven' : 'Nadir';
      const angleLong = isMcCloser ? chart.angles.midheaven : chart.angles.nadir;

      return {
        distanceFromIdeal: dist,
        formattedDistance: `${dist.toFixed(2)}°`,
        evidence: {
          body: 'Sun',
          angle: angleName,
          planetLongitude: sunLong,
          angleLongitude: angleLong,
          separationDegrees: dist,
          deviationDegrees: dist,
          distanceFromIdeal: dist,
          idealTarget: 0,
        },
      };
    },
  },

  // 2. Lunar Horizon Alignment
  {
    id: 'feat_lunar_horizon_alignment',
    name: 'Lunar Horizon Axis Alignment',
    version: '1.0',
    category: 'angular',
    description:
      'Measures the angular proximity of the Moon to the horizon axis (Ascendant or Descendant).',
    idealTarget: 0,
    unit: 'degrees',
    enabled: true,
    measure: (chart: BirthChartResult) => {
      const moonLong = chart.planets.Moon.longitude;
      const distAsc = angularDistance(moonLong, chart.angles.ascendant);
      const distDc = angularDistance(moonLong, chart.angles.descendant);
      const isAscCloser = distAsc <= distDc;
      const dist = isAscCloser ? distAsc : distDc;
      const angleName = isAscCloser ? 'Ascendant' : 'Descendant';
      const angleLong = isAscCloser ? chart.angles.ascendant : chart.angles.descendant;

      return {
        distanceFromIdeal: dist,
        formattedDistance: `${dist.toFixed(2)}°`,
        evidence: {
          body: 'Moon',
          angle: angleName,
          planetLongitude: moonLong,
          angleLongitude: angleLong,
          separationDegrees: dist,
          deviationDegrees: dist,
          distanceFromIdeal: dist,
          idealTarget: 0,
        },
      };
    },
  },

  // 3. Ascendant Rising Alignment
  {
    id: 'feat_ascendant_alignment',
    name: 'Ascendant Rising Alignment',
    version: '1.0',
    category: 'angular',
    description:
      'Measures the closest celestial body alignment with the eastern horizon (Ascendant).',
    idealTarget: 0,
    unit: 'degrees',
    enabled: true,
    measure: (chart: BirthChartResult) => {
      const planets = Object.values(chart.planets);
      let minDist = Infinity;
      let bestPlanet = planets[0];

      for (const p of planets) {
        const d = angularDistance(p.longitude, chart.angles.ascendant);
        if (d < minDist) {
          minDist = d;
          bestPlanet = p;
        }
      }

      return {
        distanceFromIdeal: minDist,
        formattedDistance: `${minDist.toFixed(2)}°`,
        evidence: {
          body: bestPlanet.body,
          angle: 'Ascendant',
          planetLongitude: bestPlanet.longitude,
          angleLongitude: chart.angles.ascendant,
          separationDegrees: minDist,
          deviationDegrees: minDist,
          distanceFromIdeal: minDist,
          idealTarget: 0,
        },
      };
    },
  },

  // 4. Midheaven Culmination Alignment
  {
    id: 'feat_midheaven_alignment',
    name: 'Midheaven Zenith Alignment',
    version: '1.0',
    category: 'angular',
    description:
      'Measures the closest celestial body alignment with the upper meridian (Midheaven).',
    idealTarget: 0,
    unit: 'degrees',
    enabled: true,
    measure: (chart: BirthChartResult) => {
      const planets = Object.values(chart.planets);
      let minDist = Infinity;
      let bestPlanet = planets[0];

      for (const p of planets) {
        const d = angularDistance(p.longitude, chart.angles.midheaven);
        if (d < minDist) {
          minDist = d;
          bestPlanet = p;
        }
      }

      return {
        distanceFromIdeal: minDist,
        formattedDistance: `${minDist.toFixed(2)}°`,
        evidence: {
          body: bestPlanet.body,
          angle: 'Midheaven',
          planetLongitude: bestPlanet.longitude,
          angleLongitude: chart.angles.midheaven,
          separationDegrees: minDist,
          deviationDegrees: minDist,
          distanceFromIdeal: minDist,
          idealTarget: 0,
        },
      };
    },
  },

  // 5. Dual Axis Angular Polarity
  {
    id: 'feat_meridian_axis_opposition',
    name: 'Dual Axis Angular Polarity',
    version: '1.0',
    category: 'angular',
    description:
      'Measures how closely two celestial bodies simultaneously occupy opposite poles of the horizon or meridian axis.',
    idealTarget: 0,
    unit: 'degrees',
    enabled: true,
    measure: (chart: BirthChartResult) => {
      const planets = Object.values(chart.planets);
      let minMaxDev = Infinity;
      let bestAxis = 'Ascendant-Descendant';
      let bestPair: [string, string] = [planets[0].body, planets[1].body];
      let bestSep = 180;

      for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
          const pA = planets[i];
          const pB = planets[j];

          // ASC-DC
          const dAsc1 = Math.max(
            angularDistance(pA.longitude, chart.angles.ascendant),
            angularDistance(pB.longitude, chart.angles.descendant)
          );
          const dAsc2 = Math.max(
            angularDistance(pB.longitude, chart.angles.ascendant),
            angularDistance(pA.longitude, chart.angles.descendant)
          );
          const dAsc = Math.min(dAsc1, dAsc2);
          if (dAsc < minMaxDev) {
            minMaxDev = dAsc;
            bestAxis = 'Ascendant-Descendant';
            bestPair = [pA.body, pB.body];
            bestSep = angularDistance(pA.longitude, pB.longitude);
          }

          // MC-IC
          const dMc1 = Math.max(
            angularDistance(pA.longitude, chart.angles.midheaven),
            angularDistance(pB.longitude, chart.angles.nadir)
          );
          const dMc2 = Math.max(
            angularDistance(pB.longitude, chart.angles.midheaven),
            angularDistance(pA.longitude, chart.angles.nadir)
          );
          const dMc = Math.min(dMc1, dMc2);
          if (dMc < minMaxDev) {
            minMaxDev = dMc;
            bestAxis = 'Midheaven-Nadir';
            bestPair = [pA.body, pB.body];
            bestSep = angularDistance(pA.longitude, pB.longitude);
          }
        }
      }

      return {
        distanceFromIdeal: minMaxDev,
        formattedDistance: `${minMaxDev.toFixed(2)}°`,
        evidence: {
          axis: bestAxis,
          bodyA: bestPair[0],
          bodyB: bestPair[1],
          separationDegrees: bestSep,
          deviationDegrees: minMaxDev,
          distanceFromIdeal: minMaxDev,
          idealTarget: 0,
        },
      };
    },
  },

  // 6. Planetary Conjunction Alignment
  {
    id: 'feat_planetary_conjunction_alignment',
    name: 'Celestial Conjunction Alignment',
    version: '1.0',
    category: 'aspect',
    description:
      'Measures the closest angular convergence (0° conjunction) between any two celestial bodies in the chart.',
    idealTarget: 0,
    unit: 'degrees',
    enabled: true,
    measure: (chart: BirthChartResult) => {
      const res = findClosestPairwiseAspect(chart, 0);
      return {
        distanceFromIdeal: res.deviationDegrees,
        formattedDistance: `${res.deviationDegrees.toFixed(2)}°`,
        evidence: {
          bodies: res.bodies,
          separationDegrees: res.separationDegrees,
          deviationDegrees: res.deviationDegrees,
          distanceFromIdeal: res.deviationDegrees,
          targetDegrees: 0,
        },
      };
    },
  },

  // 7. Harmonic Trine Alignment
  {
    id: 'feat_harmonic_trine_alignment',
    name: 'Harmonic Trine Alignment',
    version: '1.0',
    category: 'aspect',
    description:
      'Measures the closest two-body planetary alignment to an exact 120.0° harmonic trine aspect.',
    idealTarget: 120,
    unit: 'degrees',
    enabled: true,
    measure: (chart: BirthChartResult) => {
      const res = findClosestPairwiseAspect(chart, 120);
      return {
        distanceFromIdeal: res.deviationDegrees,
        formattedDistance: `${res.deviationDegrees.toFixed(2)}°`,
        evidence: {
          bodies: res.bodies,
          separationDegrees: res.separationDegrees,
          deviationDegrees: res.deviationDegrees,
          distanceFromIdeal: res.deviationDegrees,
          targetDegrees: 120,
        },
      };
    },
  },

  // 8. Diurnal Opposition Alignment
  {
    id: 'feat_diurnal_opposition_alignment',
    name: 'Diurnal Opposition Alignment',
    version: '1.0',
    category: 'aspect',
    description:
      'Measures the closest two-body planetary alignment to an exact 180.0° opposition aspect.',
    idealTarget: 180,
    unit: 'degrees',
    enabled: true,
    measure: (chart: BirthChartResult) => {
      const res = findClosestPairwiseAspect(chart, 180);
      return {
        distanceFromIdeal: res.deviationDegrees,
        formattedDistance: `${res.deviationDegrees.toFixed(2)}°`,
        evidence: {
          bodies: res.bodies,
          separationDegrees: res.separationDegrees,
          deviationDegrees: res.deviationDegrees,
          distanceFromIdeal: res.deviationDegrees,
          targetDegrees: 180,
        },
      };
    },
  },

  // 9. Quadrature Square Alignment
  {
    id: 'feat_quadrature_square_alignment',
    name: 'Quadrature Square Alignment',
    version: '1.0',
    category: 'aspect',
    description:
      'Measures the closest two-body planetary alignment to an exact 90.0° square aspect.',
    idealTarget: 90,
    unit: 'degrees',
    enabled: true,
    measure: (chart: BirthChartResult) => {
      const res = findClosestPairwiseAspect(chart, 90);
      return {
        distanceFromIdeal: res.deviationDegrees,
        formattedDistance: `${res.deviationDegrees.toFixed(2)}°`,
        evidence: {
          bodies: res.bodies,
          separationDegrees: res.separationDegrees,
          deviationDegrees: res.deviationDegrees,
          distanceFromIdeal: res.deviationDegrees,
          targetDegrees: 90,
        },
      };
    },
  },

  // 10. Harmonic Sextile Alignment
  {
    id: 'feat_harmonic_sextile_alignment',
    name: 'Harmonic Sextile Alignment',
    version: '1.0',
    category: 'aspect',
    description:
      'Measures the closest two-body planetary alignment to an exact 60.0° sextile aspect.',
    idealTarget: 60,
    unit: 'degrees',
    enabled: true,
    measure: (chart: BirthChartResult) => {
      const res = findClosestPairwiseAspect(chart, 60);
      return {
        distanceFromIdeal: res.deviationDegrees,
        formattedDistance: `${res.deviationDegrees.toFixed(2)}°`,
        evidence: {
          bodies: res.bodies,
          separationDegrees: res.separationDegrees,
          deviationDegrees: res.deviationDegrees,
          distanceFromIdeal: res.deviationDegrees,
          targetDegrees: 60,
        },
      };
    },
  },

  // 11. Triple Planetary Cluster Convergence
  {
    id: 'feat_triple_cluster_span',
    name: 'Triple Planetary Cluster Convergence',
    version: '1.0',
    category: 'planetary',
    description:
      'Measures the narrowest zodiacal arc span enclosing any three celestial bodies.',
    idealTarget: 0,
    unit: 'degrees',
    enabled: true,
    measure: (chart: BirthChartResult) => {
      const bodies = Object.values(chart.planets).map((p) => ({
        name: p.body,
        longitude: p.longitude,
      }));
      const cluster = findClosestClusterSpan(bodies, 3);
      return {
        distanceFromIdeal: cluster.spanDegrees,
        formattedDistance: `${cluster.spanDegrees.toFixed(2)}°`,
        evidence: {
          bodies: cluster.bodies,
          spanDegrees: cluster.spanDegrees,
          deviationDegrees: cluster.spanDegrees,
          distanceFromIdeal: cluster.spanDegrees,
          idealTarget: 0,
        },
      };
    },
  },

  // 12. Equilateral Grand Trine Geometry
  {
    id: 'feat_grand_trine_geometry',
    name: 'Equilateral Grand Trine Geometry',
    version: '1.0',
    category: 'structural',
    description:
      'Measures the closest three-body configuration to a symmetrical 120° equilateral triangle.',
    idealTarget: 120,
    unit: 'degrees',
    enabled: true,
    measure: (chart: BirthChartResult) => {
      const planets = Object.values(chart.planets);
      let minMaxDev = Infinity;
      let bestBodies: [string, string, string] = [
        planets[0].body,
        planets[1].body,
        planets[2].body,
      ];

      for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
          const dAB = Math.abs(
            angularDistance(planets[i].longitude, planets[j].longitude) - 120
          );
          if (dAB >= minMaxDev) continue;
          for (let k = j + 1; k < planets.length; k++) {
            const dBC = Math.abs(
              angularDistance(planets[j].longitude, planets[k].longitude) - 120
            );
            const dCA = Math.abs(
              angularDistance(planets[k].longitude, planets[i].longitude) - 120
            );
            const maxDev = Math.max(dAB, dBC, dCA);
            if (maxDev < minMaxDev) {
              minMaxDev = maxDev;
              bestBodies = [planets[i].body, planets[j].body, planets[k].body];
            }
          }
        }
      }

      return {
        distanceFromIdeal: minMaxDev,
        formattedDistance: `${minMaxDev.toFixed(2)}°`,
        evidence: {
          bodies: bestBodies,
          maxDeviationDegrees: minMaxDev,
          deviationDegrees: minMaxDev,
          distanceFromIdeal: minMaxDev,
          targetDegrees: 120,
        },
      };
    },
  },

  // 13. Focal T-Square Axis Geometry
  {
    id: 'feat_t_square_geometry',
    name: 'Focal T-Square Axis Geometry',
    version: '1.0',
    category: 'structural',
    description:
      'Measures the closest three-body configuration to a 180° opposition focalized through dual 90° squares to an apex body.',
    idealTarget: 90,
    unit: 'degrees',
    enabled: true,
    measure: (chart: BirthChartResult) => {
      const planets = Object.values(chart.planets);
      let minMaxDev = Infinity;
      let bestOpp: [string, string] = [planets[0].body, planets[1].body];
      let bestApex = planets[2].body;

      for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
          const dOpp = Math.abs(
            angularDistance(planets[i].longitude, planets[j].longitude) - 180
          );
          if (dOpp >= minMaxDev) continue;
          for (let k = 0; k < planets.length; k++) {
            if (k === i || k === j) continue;
            const dSqA = Math.abs(
              angularDistance(planets[k].longitude, planets[i].longitude) - 90
            );
            const dSqB = Math.abs(
              angularDistance(planets[k].longitude, planets[j].longitude) - 90
            );
            const maxDev = Math.max(dOpp, dSqA, dSqB);
            if (maxDev < minMaxDev) {
              minMaxDev = maxDev;
              bestOpp = [planets[i].body, planets[j].body];
              bestApex = planets[k].body;
            }
          }
        }
      }

      return {
        distanceFromIdeal: minMaxDev,
        formattedDistance: `${minMaxDev.toFixed(2)}°`,
        evidence: {
          oppositionBodies: bestOpp,
          apexBody: bestApex,
          maxDeviationDegrees: minMaxDev,
          deviationDegrees: minMaxDev,
          distanceFromIdeal: minMaxDev,
          targetDegrees: 90,
        },
      };
    },
  },

  // 14. Harmonic Yod Apex Geometry
  {
    id: 'feat_yod_inconjunct_geometry',
    name: 'Harmonic Yod Apex Geometry',
    version: '1.0',
    category: 'structural',
    description:
      'Measures the closest three-body configuration to a 60° sextile base aligned in dual 150° quincunx aspects to an apex body.',
    idealTarget: 150,
    unit: 'degrees',
    enabled: true,
    measure: (chart: BirthChartResult) => {
      const planets = Object.values(chart.planets);
      let minMaxDev = Infinity;
      let bestSex: [string, string] = [planets[0].body, planets[1].body];
      let bestApex = planets[2].body;

      for (let i = 0; i < planets.length; i++) {
        for (let j = i + 1; j < planets.length; j++) {
          const dSex = Math.abs(
            angularDistance(planets[i].longitude, planets[j].longitude) - 60
          );
          if (dSex >= minMaxDev) continue;
          for (let k = 0; k < planets.length; k++) {
            if (k === i || k === j) continue;
            const dQ1 = Math.abs(
              angularDistance(planets[k].longitude, planets[i].longitude) - 150
            );
            const dQ2 = Math.abs(
              angularDistance(planets[k].longitude, planets[j].longitude) - 150
            );
            const maxDev = Math.max(dSex, dQ1, dQ2);
            if (maxDev < minMaxDev) {
              minMaxDev = maxDev;
              bestSex = [planets[i].body, planets[j].body];
              bestApex = planets[k].body;
            }
          }
        }
      }

      return {
        distanceFromIdeal: minMaxDev,
        formattedDistance: `${minMaxDev.toFixed(2)}°`,
        evidence: {
          sextileBodies: bestSex,
          apexBody: bestApex,
          maxDeviationDegrees: minMaxDev,
          deviationDegrees: minMaxDev,
          distanceFromIdeal: minMaxDev,
          targetDegrees: 150,
        },
      };
    },
  },

  // 15. Stationary Planetary Pivot Proximity
  {
    id: 'feat_stationary_motion_pivot',
    name: 'Stationary Planetary Pivot Proximity',
    version: '1.0',
    category: 'planetary',
    description:
      'Measures the slowest daily longitudinal motion among the eight non-luminary planets relative to a stationary 0.000°/day turning point.',
    idealTarget: 0,
    unit: 'degrees_per_day',
    enabled: true,
    measure: (chart: BirthChartResult) => {
      const planets = Object.values(chart.planets).filter(
        (p) => p.body !== 'Sun' && p.body !== 'Moon'
      );
      let minSpeed = Infinity;
      let bestPlanet = planets[0];

      for (const p of planets) {
        const absSpeed = Math.abs(p.speedDegPerDay);
        if (absSpeed < minSpeed) {
          minSpeed = absSpeed;
          bestPlanet = p;
        }
      }

      return {
        distanceFromIdeal: minSpeed,
        formattedDistance: `${minSpeed.toFixed(4)}°/day`,
        evidence: {
          body: bestPlanet.body,
          speedDegPerDay: bestPlanet.speedDegPerDay,
          absoluteSpeedDegPerDay: minSpeed,
          deviationDegrees: minSpeed,
          distanceFromIdeal: minSpeed,
          idealTarget: 0,
          isRetrograde: bestPlanet.isRetrograde,
        },
      };
    },
  },
];

/**
 * Deterministically evaluates all enabled continuous geometric features on a birth chart.
 */
export function evaluateContinuousFeatures(
  chart: BirthChartResult
): ContinuousFeatureMeasurement[] {
  if (!chart || !chart.planets || !chart.angles) {
    return [];
  }

  const isDateOnly = (chart.input as any)?.calculation_mode === 'DATE_ONLY';
  const enabled = CONTINUOUS_FEATURE_REGISTRY.filter(
    (f) => f.enabled && (!isDateOnly || f.category !== 'angular')
  );
  const results: ContinuousFeatureMeasurement[] = [];

  for (const feature of enabled) {
    try {
      const measured = feature.measure(chart);
      results.push({
        featureId: feature.id,
        featureVersion: feature.version,
        name: feature.name,
        category: feature.category,
        description: feature.description,
        distanceFromIdeal: measured.distanceFromIdeal,
        idealTarget: feature.idealTarget,
        unit: feature.unit,
        formattedDistance: measured.formattedDistance,
        evidence: measured.evidence,
      });
    } catch {
      continue;
    }
  }

  return results;
}
