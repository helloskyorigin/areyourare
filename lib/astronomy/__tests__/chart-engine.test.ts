import { calculateBirthChart } from '../engine';
import { angularDistance, directionalSeparation, normalizeDegrees } from '../math';
import { resolveLocalToUtc } from '../time';
import { NormalizedBirthInput } from '../../types/birth-input';

export interface AstroTestCaseResult {
  name: string;
  passed: boolean;
  details?: string;
}

export function runAstronomyEngineTests(): AstroTestCaseResult[] {
  const results: AstroTestCaseResult[] = [];

  const sampleInputA: NormalizedBirthInput = {
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

  // 1. Same input produces exact identical result (Determinism)
  try {
    const chart1 = calculateBirthChart(sampleInputA);
    const chart2 = calculateBirthChart(sampleInputA);
    const isExactMatch =
      JSON.stringify(chart1.planets) === JSON.stringify(chart2.planets) &&
      chart1.angles.ascendant === chart2.angles.ascendant &&
      chart1.angles.midheaven === chart2.angles.midheaven &&
      JSON.stringify(chart1.houses.cusps) === JSON.stringify(chart2.houses.cusps);

    results.push({
      name: '1. Deterministic Calculation (Identical input produces identical chart data)',
      passed: isExactMatch,
    });
  } catch (err) {
    results.push({
      name: '1. Deterministic Calculation',
      passed: false,
      details: String(err),
    });
  }

  // 2. Valid date/time conversion
  try {
    const timeRes = resolveLocalToUtc('2020-01-15', '12:00', 'UTC');
    const passed = timeRes.utcIso === '2020-01-15T12:00:00.000Z' && timeRes.julianDay > 2450000;
    results.push({
      name: '2. Valid date/time to UTC and Julian Day conversion',
      passed,
    });
  } catch (err) {
    results.push({
      name: '2. Valid date/time conversion',
      passed: false,
      details: String(err),
    });
  }

  // 3. Timezone conversion (e.g. New York EDT in summer: UTC-4)
  try {
    const timeResNY = resolveLocalToUtc('2022-07-04', '10:00', 'America/New_York');
    // 10:00 EDT is 14:00 UTC
    const passed = timeResNY.utcIso === '2022-07-04T14:00:00.000Z';
    results.push({
      name: '3. Timezone offset & Daylight Saving Time resolution',
      passed,
      details: `Resolved ${timeResNY.utcIso}`,
    });
  } catch (err) {
    results.push({
      name: '3. Timezone conversion',
      passed: false,
      details: String(err),
    });
  }

  // 4. Coordinates validation
  try {
    let rejected = false;
    try {
      calculateBirthChart({
        ...sampleInputA,
        location: { ...sampleInputA.location, latitude: 105.0 },
      });
    } catch {
      rejected = true;
    }
    results.push({
      name: '4. Invalid latitude coordinate bounds rejected',
      passed: rejected,
    });
  } catch (err) {
    results.push({ name: '4. Coordinates', passed: false, details: String(err) });
  }

  // 5. Planetary output exists for all 10 standard celestial bodies
  try {
    const chart = calculateBirthChart(sampleInputA);
    const requiredBodies = [
      'Sun',
      'Moon',
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
      'Uranus',
      'Neptune',
      'Pluto',
    ];
    const allBodiesPresent = requiredBodies.every((b) => {
      const pos = chart.planets[b as keyof typeof chart.planets];
      return (
        pos &&
        typeof pos.longitude === 'number' &&
        pos.longitude >= 0 &&
        pos.longitude < 360 &&
        typeof pos.speedDegPerDay === 'number'
      );
    });

    results.push({
      name: '5. All 10 planetary bodies computed with high-precision ecliptic longitudes',
      passed: allBodiesPresent,
    });
  } catch (err) {
    results.push({ name: '5. Planetary output', passed: false, details: String(err) });
  }

  // 6. Ascendant angle calculated
  try {
    const chart = calculateBirthChart(sampleInputA);
    const passed =
      typeof chart.angles.ascendant === 'number' &&
      chart.angles.ascendant >= 0 &&
      chart.angles.ascendant < 360 &&
      !!chart.angles.formattedAscendant;

    results.push({
      name: '6. Ascendant angle computed and formatted',
      passed,
      details: `Ascendant: ${chart.angles.formattedAscendant} (${chart.angles.ascendant.toFixed(4)}°)`,
    });
  } catch (err) {
    results.push({ name: '6. Ascendant', passed: false, details: String(err) });
  }

  // 7. Midheaven (MC) angle calculated
  try {
    const chart = calculateBirthChart(sampleInputA);
    const passed =
      typeof chart.angles.midheaven === 'number' &&
      chart.angles.midheaven >= 0 &&
      chart.angles.midheaven < 360 &&
      !!chart.angles.formattedMidheaven;

    results.push({
      name: '7. Midheaven (MC) angle computed and formatted',
      passed,
      details: `MC: ${chart.angles.formattedMidheaven} (${chart.angles.midheaven.toFixed(4)}°)`,
    });
  } catch (err) {
    results.push({ name: '7. MC angle', passed: false, details: String(err) });
  }

  // 8. Houses exist (12 cusps)
  try {
    const chart = calculateBirthChart(sampleInputA);
    const passed =
      chart.houses.cusps.length === 12 &&
      chart.houses.cusps.every((c) => typeof c === 'number' && c >= 0 && c < 360) &&
      chart.houses.system === 'placidus';

    results.push({
      name: '8. Twelve House cusps calculated with explicit house system (placidus)',
      passed,
    });
  } catch (err) {
    results.push({ name: '8. Houses', passed: false, details: String(err) });
  }

  // 9. Angular distance 0°/360° boundary check
  try {
    const d1 = angularDistance(359, 1);
    const d2 = angularDistance(10, 350);
    const d3 = angularDistance(0, 180);
    const dir1 = directionalSeparation(350, 10);
    const passed = d1 === 2 && d2 === 20 && d3 === 180 && dir1 === 20;

    results.push({
      name: '9. Angular distance circle boundary handling (359° and 1° = 2°)',
      passed,
    });
  } catch (err) {
    results.push({ name: '9. Angular distance boundary', passed: false, details: String(err) });
  }

  // 10. Invalid longitude coordinate rejected
  try {
    let rejected = false;
    try {
      calculateBirthChart({
        ...sampleInputA,
        location: { ...sampleInputA.location, longitude: 200.0 },
      });
    } catch {
      rejected = true;
    }
    results.push({
      name: '10. Invalid longitude coordinate rejected',
      passed: rejected,
    });
  } catch (err) {
    results.push({ name: '10. Invalid longitude', passed: false, details: String(err) });
  }

  // 11. Invalid IANA timezone rejected
  try {
    let rejected = false;
    try {
      calculateBirthChart({
        ...sampleInputA,
        location: { ...sampleInputA.location, timezone: 'Fake/Timezone_Name' },
      });
    } catch {
      rejected = true;
    }
    results.push({
      name: '11. Invalid IANA timezone rejected safely',
      passed: rejected,
    });
  } catch (err) {
    results.push({ name: '11. Invalid timezone', passed: false, details: String(err) });
  }

  // 12. Angular separation matrix between all bodies and angles
  try {
    const chart = calculateBirthChart(sampleInputA);
    // 10 planets + 2 angles = 12 points. Combinations = 12 * 11 / 2 = 66 pairs.
    const passed = chart.angularSeparations.length === 66;
    results.push({
      name: '12. Complete pair-wise angular separation matrix computed (66 planetary & angle pairs)',
      passed,
    });
  } catch (err) {
    results.push({ name: '12. Angular separation matrix', passed: false, details: String(err) });
  }

  return results;
}
