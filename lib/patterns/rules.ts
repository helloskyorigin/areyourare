import { angularDistance, normalizeDegrees } from '../astronomy/math';

/**
 * Checks if the angular distance between two longitudes is within an orb of a target aspect angle.
 */
export function isWithinOrb(
  longA: number,
  longB: number,
  targetAspectDeg: number,
  maxOrbDeg: number
): { isMatch: boolean; separationDeg: number; deviationDeg: number } {
  const separationDeg = angularDistance(longA, longB);
  const deviationDeg = Math.abs(separationDeg - targetAspectDeg);
  const isMatch = deviationDeg <= maxOrbDeg;
  return {
    isMatch,
    separationDeg,
    deviationDeg,
  };
}

/**
 * Finds all tight conjunctions between a specific body and an angular axis.
 */
export function findAngularConjunction(
  planetName: string,
  planetLong: number,
  angleName: string,
  angleLong: number,
  maxOrbDeg: number
) {
  const result = isWithinOrb(planetLong, angleLong, 0, maxOrbDeg);
  if (result.isMatch) {
    return {
      matched: true,
      body: planetName,
      angle: angleName,
      planetLongitude: planetLong,
      angleLongitude: angleLong,
      separationDegrees: result.separationDeg,
      targetDegrees: 0,
      orbLimitDegrees: maxOrbDeg,
      deviationDegrees: result.deviationDeg,
    };
  }
  return null;
}

/**
 * Finds a Stellium (cluster of N+ bodies within a maximum span in degrees)
 */
export function findStellium(
  bodies: Array<{ name: string; longitude: number }>,
  maxSpanDeg: number,
  minBodies: number
) {
  if (bodies.length < minBodies) return null;

  // Sort bodies by longitude
  const sorted = [...bodies].sort((a, b) => a.longitude - b.longitude);
  const n = sorted.length;

  // Check all subsets using circular wrapping
  let bestCluster: Array<{ name: string; longitude: number }> | null = null;
  let minSpanFound = Infinity;

  for (let i = 0; i < n; i++) {
    for (let count = minBodies; count <= n; count++) {
      const subset: Array<{ name: string; longitude: number }> = [];
      for (let j = 0; j < count; j++) {
        subset.push(sorted[(i + j) % n]);
      }

      // Calculate total span on circle
      let span = 0;
      for (let k = 0; k < subset.length - 1; k++) {
        span += normalizeDegrees(subset[k + 1].longitude - subset[k].longitude);
      }

      if (span <= maxSpanDeg && span < minSpanFound) {
        minSpanFound = span;
        bestCluster = subset;
      }
    }
  }

  if (bestCluster && bestCluster.length >= minBodies) {
    return {
      matched: true,
      bodies: bestCluster.map((b) => b.name),
      bodyCount: bestCluster.length,
      spanDegrees: minSpanFound,
      maxAllowedSpanDegrees: maxSpanDeg,
      longitudes: bestCluster.map((b) => ({ name: b.name, longitude: b.longitude })),
    };
  }

  return null;
}

/**
 * Finds Grand Trines (3 distinct bodies mutually forming 120° trines)
 */
export function findGrandTrine(
  bodies: Array<{ name: string; longitude: number }>,
  maxOrbDeg: number
) {
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      for (let k = j + 1; k < bodies.length; k++) {
        const bA = bodies[i];
        const bB = bodies[j];
        const bC = bodies[k];

        const trineAB = isWithinOrb(bA.longitude, bB.longitude, 120, maxOrbDeg);
        const trineBC = isWithinOrb(bB.longitude, bC.longitude, 120, maxOrbDeg);
        const trineCA = isWithinOrb(bC.longitude, bA.longitude, 120, maxOrbDeg);

        if (trineAB.isMatch && trineBC.isMatch && trineCA.isMatch) {
          const maxDeviation = Math.max(
            trineAB.deviationDeg,
            trineBC.deviationDeg,
            trineCA.deviationDeg
          );
          return {
            matched: true,
            bodies: [bA.name, bB.name, bC.name],
            aspects: [
              { pair: [bA.name, bB.name], separationDegrees: trineAB.separationDeg, deviationDegrees: trineAB.deviationDeg },
              { pair: [bB.name, bC.name], separationDegrees: trineBC.separationDeg, deviationDegrees: trineBC.deviationDeg },
              { pair: [bC.name, bA.name], separationDegrees: trineCA.separationDeg, deviationDegrees: trineCA.deviationDeg },
            ],
            targetDegrees: 120,
            orbLimitDegrees: maxOrbDeg,
            maxDeviationDegrees: maxDeviation,
          };
        }
      }
    }
  }
  return null;
}

/**
 * Finds T-Square configuration (Opposition between A & B, both square to apex C)
 */
export function findTsquare(
  bodies: Array<{ name: string; longitude: number }>,
  maxOrbDeg: number
) {
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const bA = bodies[i];
      const bB = bodies[j];

      const opposition = isWithinOrb(bA.longitude, bB.longitude, 180, maxOrbDeg);
      if (opposition.isMatch) {
        // Look for apex planet squaring both A and B
        for (let k = 0; k < bodies.length; k++) {
          if (k === i || k === j) continue;
          const apex = bodies[k];

          const squareA = isWithinOrb(apex.longitude, bA.longitude, 90, maxOrbDeg);
          const squareB = isWithinOrb(apex.longitude, bB.longitude, 90, maxOrbDeg);

          if (squareA.isMatch && squareB.isMatch) {
            return {
              matched: true,
              oppositionBodies: [bA.name, bB.name],
              apexBody: apex.name,
              oppositionSeparationDegrees: opposition.separationDeg,
              squareASeparationDegrees: squareA.separationDeg,
              squareBSeparationDegrees: squareB.separationDeg,
              orbLimitDegrees: maxOrbDeg,
              maxDeviationDegrees: Math.max(
                opposition.deviationDeg,
                squareA.deviationDeg,
                squareB.deviationDeg
              ),
            };
          }
        }
      }
    }
  }
  return null;
}

/**
 * Finds Grand Cross configuration (4 bodies forming 4 squares and 2 oppositions)
 */
export function findGrandCross(
  bodies: Array<{ name: string; longitude: number }>,
  maxOrbDeg: number
) {
  const n = bodies.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      for (let k = j + 1; k < n; k++) {
        for (let l = k + 1; l < n; l++) {
          const quad = [bodies[i], bodies[j], bodies[k], bodies[l]].sort(
            (a, b) => a.longitude - b.longitude
          );

          const s01 = isWithinOrb(quad[0].longitude, quad[1].longitude, 90, maxOrbDeg);
          const s12 = isWithinOrb(quad[1].longitude, quad[2].longitude, 90, maxOrbDeg);
          const s23 = isWithinOrb(quad[2].longitude, quad[3].longitude, 90, maxOrbDeg);
          const s30 = isWithinOrb(quad[3].longitude, quad[0].longitude, 90, maxOrbDeg);

          const opp02 = isWithinOrb(quad[0].longitude, quad[2].longitude, 180, maxOrbDeg);
          const opp13 = isWithinOrb(quad[1].longitude, quad[3].longitude, 180, maxOrbDeg);

          if (
            s01.isMatch &&
            s12.isMatch &&
            s23.isMatch &&
            s30.isMatch &&
            opp02.isMatch &&
            opp13.isMatch
          ) {
            return {
              matched: true,
              bodies: quad.map((b) => b.name),
              oppositions: [
                { pair: [quad[0].name, quad[2].name], separationDegrees: opp02.separationDeg },
                { pair: [quad[1].name, quad[3].name], separationDegrees: opp13.separationDeg },
              ],
              squares: [
                { pair: [quad[0].name, quad[1].name], separationDegrees: s01.separationDeg },
                { pair: [quad[1].name, quad[2].name], separationDegrees: s12.separationDeg },
                { pair: [quad[2].name, quad[3].name], separationDegrees: s23.separationDeg },
                { pair: [quad[3].name, quad[0].name], separationDegrees: s30.separationDeg },
              ],
              orbLimitDegrees: maxOrbDeg,
              maxDeviationDegrees: Math.max(
                s01.deviationDeg,
                s12.deviationDeg,
                s23.deviationDeg,
                s30.deviationDeg,
                opp02.deviationDeg,
                opp13.deviationDeg
              ),
            };
          }
        }
      }
    }
  }
  return null;
}

/**
 * Finds Yod (Finger of Fate) configuration: 2 bodies in 60° sextile, both 150° quincunx to apex
 */
export function findYod(
  bodies: Array<{ name: string; longitude: number }>,
  maxOrbDeg: number
) {
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const bA = bodies[i];
      const bB = bodies[j];

      const sextile = isWithinOrb(bA.longitude, bB.longitude, 60, maxOrbDeg);
      if (sextile.isMatch) {
        for (let k = 0; k < bodies.length; k++) {
          if (k === i || k === j) continue;
          const apex = bodies[k];

          const quincunxA = isWithinOrb(apex.longitude, bA.longitude, 150, maxOrbDeg);
          const quincunxB = isWithinOrb(apex.longitude, bB.longitude, 150, maxOrbDeg);

          if (quincunxA.isMatch && quincunxB.isMatch) {
            return {
              matched: true,
              sextileBodies: [bA.name, bB.name],
              apexBody: apex.name,
              sextileSeparationDegrees: sextile.separationDeg,
              quincunxASeparationDegrees: quincunxA.separationDeg,
              quincunxBSeparationDegrees: quincunxB.separationDeg,
              orbLimitDegrees: maxOrbDeg,
              maxDeviationDegrees: Math.max(
                sextile.deviationDeg,
                quincunxA.deviationDeg,
                quincunxB.deviationDeg
              ),
            };
          }
        }
      }
    }
  }
  return null;
}

/**
 * Finds Kite configuration (Grand Trine with a 4th body opposing one vertex and sextile to other two)
 */
export function findKite(
  bodies: Array<{ name: string; longitude: number }>,
  maxOrbDeg: number
) {
  const gt = findGrandTrine(bodies, maxOrbDeg);
  if (!gt) return null;

  const gtBodies = bodies.filter((b) => gt.bodies.includes(b.name));
  const otherBodies = bodies.filter((b) => !gt.bodies.includes(b.name));

  for (const extra of otherBodies) {
    for (let i = 0; i < gtBodies.length; i++) {
      const opposedVertex = gtBodies[i];
      const otherVertex1 = gtBodies[(i + 1) % 3];
      const otherVertex2 = gtBodies[(i + 2) % 3];

      const opposition = isWithinOrb(extra.longitude, opposedVertex.longitude, 180, maxOrbDeg);
      const sextile1 = isWithinOrb(extra.longitude, otherVertex1.longitude, 60, maxOrbDeg);
      const sextile2 = isWithinOrb(extra.longitude, otherVertex2.longitude, 60, maxOrbDeg);

      if (opposition.isMatch && sextile1.isMatch && sextile2.isMatch) {
        return {
          matched: true,
          grandTrineBodies: gt.bodies,
          spineOppositionBodies: [extra.name, opposedVertex.name],
          wingBodies: [otherVertex1.name, otherVertex2.name],
          oppositionSeparationDegrees: opposition.separationDeg,
          sextile1SeparationDegrees: sextile1.separationDeg,
          sextile2SeparationDegrees: sextile2.separationDeg,
          orbLimitDegrees: maxOrbDeg,
          maxDeviationDegrees: Math.max(
            gt.maxDeviationDegrees,
            opposition.deviationDeg,
            sextile1.deviationDeg,
            sextile2.deviationDeg
          ),
        };
      }
    }
  }
  return null;
}
