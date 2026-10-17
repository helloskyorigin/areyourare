import { normalizeDegrees, formatDegreesToZodiac, DEG2RAD, RAD2DEG } from './math';
import { ChartAngles, HouseCusps, HouseSystemType } from '../types/astronomy';

export interface HouseCalculationInput {
  localSiderealTimeDeg: number;
  obliquityDeg: number;
  latitudeDeg: number;
  system?: HouseSystemType;
}

/**
 * Calculates primary chart angles: Ascendant and Midheaven (MC)
 */
export function calculateChartAngles(
  localSiderealTimeDeg: number,
  obliquityDeg: number,
  latitudeDeg: number
): ChartAngles {
  const ramcRad = localSiderealTimeDeg * DEG2RAD;
  const epsRad = obliquityDeg * DEG2RAD;
  const latRad = latitudeDeg * DEG2RAD;

  // Midheaven (MC): ecliptic longitude where the meridian crosses the ecliptic
  // tan(MC) = tan(RAMC) / cos(eps)
  const mcY = Math.sin(ramcRad);
  const mcX = Math.cos(ramcRad) * Math.cos(epsRad);
  let mcDeg = Math.atan2(mcY, mcX) * RAD2DEG;
  mcDeg = normalizeDegrees(mcDeg);

  // Ascendant (ASC): ecliptic longitude rising on eastern horizon
  // tan(ASC) = -cos(RAMC) / (sin(RAMC)*cos(eps) + tan(lat)*sin(eps))
  const ascY = -Math.cos(ramcRad);
  const ascX = Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad);
  let ascDeg = Math.atan2(ascY, ascX) * RAD2DEG;
  ascDeg = normalizeDegrees(ascDeg);

  const descendant = normalizeDegrees(ascDeg + 180);
  const nadir = normalizeDegrees(mcDeg + 180);

  return {
    ascendant: ascDeg,
    midheaven: mcDeg,
    descendant,
    nadir,
    formattedAscendant: formatDegreesToZodiac(ascDeg).formatted,
    formattedMidheaven: formatDegreesToZodiac(mcDeg).formatted,
  };
}

/**
 * Calculates 12 house cusps based on chosen house system
 */
export function calculateHouseCusps(
  angles: ChartAngles,
  localSiderealTimeDeg: number,
  obliquityDeg: number,
  latitudeDeg: number,
  system: HouseSystemType = 'placidus'
): HouseCusps {
  const cusps: number[] = new Array(12).fill(0);
  const asc = angles.ascendant;
  const mc = angles.midheaven;
  const dc = angles.descendant;
  const ic = angles.nadir;

  switch (system) {
    case 'equal_from_ascendant': {
      for (let i = 0; i < 12; i++) {
        cusps[i] = normalizeDegrees(asc + i * 30);
      }
      break;
    }

    case 'whole_sign': {
      const ascSignIndex = Math.floor(asc / 30);
      for (let i = 0; i < 12; i++) {
        cusps[i] = normalizeDegrees(((ascSignIndex + i) % 12) * 30);
      }
      break;
    }

    case 'porphyry': {
      // Porphyry: Exactly trisects the quadrant arcs between angles
      cusps[0] = asc;
      cusps[9] = mc;
      cusps[6] = dc;
      cusps[3] = ic;

      // 4th quadrant (MC to ASC)
      const q4Arc = normalizeDegrees(asc - mc);
      cusps[10] = normalizeDegrees(mc + q4Arc / 3);
      cusps[11] = normalizeDegrees(mc + (2 * q4Arc) / 3);

      // 1st quadrant (ASC to IC)
      const q1Arc = normalizeDegrees(ic - asc);
      cusps[1] = normalizeDegrees(asc + q1Arc / 3);
      cusps[2] = normalizeDegrees(asc + (2 * q1Arc) / 3);

      // Opposite cusps (2nd and 3rd quadrants)
      cusps[4] = normalizeDegrees(cusps[10] + 180);
      cusps[5] = normalizeDegrees(cusps[11] + 180);
      cusps[7] = normalizeDegrees(cusps[1] + 180);
      cusps[8] = normalizeDegrees(cusps[2] + 180);
      break;
    }

    case 'placidus':
    default: {
      // Placidus with Porphyry polar-circle fallback
      if (Math.abs(latitudeDeg) > 66.0) {
        return calculateHouseCusps(angles, localSiderealTimeDeg, obliquityDeg, latitudeDeg, 'porphyry');
      }

      cusps[0] = asc;
      cusps[9] = mc;
      cusps[6] = dc;
      cusps[3] = ic;

      const ramcRad = localSiderealTimeDeg * DEG2RAD;
      const epsRad = obliquityDeg * DEG2RAD;
      const latRad = latitudeDeg * DEG2RAD;

      // Placidus intermediate cusps using iterative semi-arc trisection
      const calcPlacidusCusp = (raOffsetDeg: number, f: number): number => {
        let r = ramcRad + raOffsetDeg * DEG2RAD;
        for (let iter = 0; iter < 8; iter++) {
          const sinD = Math.sin(epsRad) * Math.sin(r);
          const tanD = sinD / Math.sqrt(Math.max(0.0001, 1 - sinD * sinD));
          const val = f * Math.tan(latRad) * tanD;
          const clamped = Math.max(-0.9999, Math.min(0.9999, val));
          const m = Math.asin(clamped);
          r = ramcRad + raOffsetDeg * DEG2RAD + m;
        }
        const y = Math.sin(r);
        const x = Math.cos(r) * Math.cos(epsRad);
        return normalizeDegrees(Math.atan2(y, x) * RAD2DEG);
      };

      try {
        cusps[10] = calcPlacidusCusp(30, 1 / 3); // House 11
        cusps[11] = calcPlacidusCusp(60, 2 / 3); // House 12
        cusps[1] = calcPlacidusCusp(120, 2 / 3); // House 2
        cusps[2] = calcPlacidusCusp(150, 1 / 3); // House 3

        cusps[4] = normalizeDegrees(cusps[10] + 180); // House 5
        cusps[5] = normalizeDegrees(cusps[11] + 180); // House 6
        cusps[7] = normalizeDegrees(cusps[1] + 180); // House 8
        cusps[8] = normalizeDegrees(cusps[2] + 180); // House 9
      } catch {
        return calculateHouseCusps(angles, localSiderealTimeDeg, obliquityDeg, latitudeDeg, 'porphyry');
      }
      break;
    }
  }

  return {
    system,
    cusps,
    formattedCusps: cusps.map((c) => formatDegreesToZodiac(c).formatted),
  };
}
