import * as Astronomy from 'astronomy-engine';
import {
  CelestialBodyName,
  CelestialBodyPosition,
  BirthChartResult,
  AngularSeparation,
  HouseSystemType,
} from '../types/astronomy';
import { NormalizedBirthInput } from '../types/birth-input';
import { resolveLocalToUtc } from './time';
import {
  normalizeDegrees,
  angularDistance,
  directionalSeparation,
  formatDegreesToZodiac,
  RAD2DEG,
} from './math';
import { calculateChartAngles, calculateHouseCusps } from './houses';

export interface ChartCalculationOptions {
  houseSystem?: HouseSystemType;
}

const BODIES_LIST: Array<{ name: CelestialBodyName; astroBody: Astronomy.Body }> = [
  { name: 'Sun', astroBody: Astronomy.Body.Sun },
  { name: 'Moon', astroBody: Astronomy.Body.Moon },
  { name: 'Mercury', astroBody: Astronomy.Body.Mercury },
  { name: 'Venus', astroBody: Astronomy.Body.Venus },
  { name: 'Mars', astroBody: Astronomy.Body.Mars },
  { name: 'Jupiter', astroBody: Astronomy.Body.Jupiter },
  { name: 'Saturn', astroBody: Astronomy.Body.Saturn },
  { name: 'Uranus', astroBody: Astronomy.Body.Uranus },
  { name: 'Neptune', astroBody: Astronomy.Body.Neptune },
  { name: 'Pluto', astroBody: Astronomy.Body.Pluto },
];

/**
 * Calculates geocentric apparent ecliptic longitude, latitude, and distance for a celestial body
 */
function getEclipticCoordinates(
  body: Astronomy.Body,
  astroTime: Astronomy.AstroTime
): { longitude: number; latitude: number; distanceAu: number } {
  const geoVector = Astronomy.GeoVector(body, astroTime, true);
  const ecliptic = Astronomy.Ecliptic(geoVector);
  const distanceAu = Math.hypot(geoVector.x, geoVector.y, geoVector.z);

  return {
    longitude: normalizeDegrees(ecliptic.elon),
    latitude: ecliptic.elat,
    distanceAu,
  };
}

/**
 * Main Deterministic Birth Chart Calculation Engine (Phase 2)
 */
export function calculateBirthChart(
  input: NormalizedBirthInput,
  options: ChartCalculationOptions = {}
): BirthChartResult {
  const { birthDate, birthTime, location } = input;
  const { city, country, latitude, longitude, timezone } = location;
  const isDateOnly = input.calculation_mode === 'DATE_ONLY';

  if (latitude < -90 || latitude > 90) {
    throw new Error(`Invalid latitude out of bounds [-90, 90]: ${latitude}`);
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error(`Invalid longitude out of bounds [-180, 180]: ${longitude}`);
  }

  // 1. Resolve Timezone-aware local datetime to UTC and Julian Day
  // For DATE_ONLY, we use 12:00 internally for astronomical planet coordinates of that day,
  // but we store the original empty string or localTime as-is in the return object to keep transparency.
  const timeResult = resolveLocalToUtc(birthDate, isDateOnly ? '12:00' : birthTime, timezone);
  const astroTime = new Astronomy.AstroTime(timeResult.utcDate);

  // 2. Calculate Sidereal Time and Obliquity of Ecliptic
  const gmstHours = Astronomy.SiderealTime(astroTime); // Greenwich Mean Sidereal Time in hours
  const lstHours = normalizeDegrees(gmstHours * 15 + longitude) / 15;
  const lstDegrees = normalizeDegrees(lstHours * 15);

  // Mean & True Obliquity of Date
  const rotMatrix = Astronomy.Rotation_EQJ_ECT(astroTime);
  // Derive true obliquity from rotation matrix: sin(eps) = rotMatrix.rot[1][2]
  const obliquityDeg = Math.asin(rotMatrix.rot[1][2]) * RAD2DEG;

  // 3. Compute Planetary Positions for all 10 standard bodies
  const planets: Record<string, CelestialBodyPosition> = {};
  const timeStepHours = 1; // 1 hour time delta to calculate precise instantaneous daily motion
  const futureDate = new Date(timeResult.utcDate.getTime() + timeStepHours * 3600000);
  const futureAstroTime = new Astronomy.AstroTime(futureDate);

  for (const item of BODIES_LIST) {
    const currentCoords = getEclipticCoordinates(item.astroBody, astroTime);
    const futureCoords = getEclipticCoordinates(item.astroBody, futureAstroTime);

    // Calculate longitudinal speed in degrees per day
    let lonDiff = futureCoords.longitude - currentCoords.longitude;
    if (lonDiff > 180) lonDiff -= 360;
    if (lonDiff < -180) lonDiff += 360;
    const speedDegPerDay = (lonDiff / timeStepHours) * 24;
    const isRetrograde = speedDegPerDay < 0;

    const zodiac = formatDegreesToZodiac(currentCoords.longitude);

    planets[item.name] = {
      body: item.name,
      longitude: currentCoords.longitude,
      latitude: currentCoords.latitude,
      distanceAu: currentCoords.distanceAu,
      speedDegPerDay,
      isRetrograde,
      sign: zodiac.sign,
      signDegree: zodiac.signDegree,
      formattedLongitude: zodiac.formatted,
    };
  }

  // 4. Calculate Primary Chart Angles (Ascendant, Midheaven, Descendant, Nadir)
  // For DATE_ONLY, we do not generate a fake Ascendant or fake houses.
  const angles = isDateOnly
    ? {
        ascendant: 0,
        midheaven: 0,
        descendant: 0,
        nadir: 0,
        formattedAscendant: '—',
        formattedMidheaven: '—',
      }
    : calculateChartAngles(lstDegrees, obliquityDeg, latitude);

  // 5. Calculate House Cusps
  const houseSystem: HouseSystemType = options.houseSystem || 'placidus';
  const houses = isDateOnly
    ? {
        system: houseSystem,
        cusps: Array(12).fill(0),
        formattedCusps: Array(12).fill('—'),
      }
    : calculateHouseCusps(angles, lstDegrees, obliquityDeg, latitude, houseSystem);

  // 6. Compute Angular Separation Matrix between all bodies and angles
  // Exclude Ascendant and Midheaven points in DATE_ONLY mode.
  const pointsForAspects: Array<{ name: string; longitude: number }> = [
    ...Object.values(planets).map((p) => ({ name: p.body, longitude: p.longitude })),
  ];

  if (!isDateOnly) {
    pointsForAspects.push(
      { name: 'Ascendant', longitude: angles.ascendant },
      { name: 'Midheaven', longitude: angles.midheaven }
    );
  }

  const angularSeparations: AngularSeparation[] = [];
  for (let i = 0; i < pointsForAspects.length; i++) {
    for (let j = i + 1; j < pointsForAspects.length; j++) {
      const pA = pointsForAspects[i];
      const pB = pointsForAspects[j];
      angularSeparations.push({
        bodyA: pA.name,
        bodyB: pB.name,
        angleA: pA.longitude,
        angleB: pB.longitude,
        shortestArc: angularDistance(pA.longitude, pB.longitude),
        directionalSeparation: directionalSeparation(pA.longitude, pB.longitude),
      });
    }
  }

  return {
    calculationVersion: 'v1',
    engine: {
      name: 'OUTLIER Deterministic Astronomy Engine',
      version: '1.0.0',
      provider: 'AstronomyEngine (VSOP87 / ELP2000)',
      license: 'MIT',
    },
    input: {
      localDate: birthDate,
      localTime: isDateOnly ? '' : birthTime, // Do not secretly assume/invent time in output birth data!
      timezone,
      latitude,
      longitude,
      city,
      country,
      calculation_mode: input.calculation_mode, // Store the explicit mode
    } as any,
    time: {
      localIso: timeResult.localIso,
      utcIso: timeResult.utcIso,
      julianDay: timeResult.julianDay,
      greenwichSiderealTimeHours: gmstHours,
      localSiderealTimeHours: lstHours,
      localSiderealTimeDegrees: lstDegrees,
      obliquityDeg,
    },
    planets: planets as Record<CelestialBodyName, CelestialBodyPosition>,
    angles,
    houses,
    angularSeparations,
    status: 'calculated',
  };
}
