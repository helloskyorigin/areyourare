import { calculateBirthChart } from '../lib/astronomy/engine';
import { PATTERN_REGISTRY } from '../lib/patterns/registry';
import { evaluatePatterns } from '../lib/patterns/evaluator';
import { calculateUserRarity } from '../lib/rarity/engine';
import { REFERENCE_POPULATION_V1 } from '../lib/rarity/dataset';
import { angularDistance } from '../lib/astronomy/math';

console.log('================================================================');
console.log('OUTLIER — DEEP PIPELINE DIAGNOSTIC & PATTERN COVERAGE AUDIT');
console.log('================================================================\n');

// Test input: 2009-08-13 23:30 in Patna, Bihar, India (from prior user sample)
// and another sample: 1994-07-20 16:45 in New York
const testInputs = [
  {
    name: 'Sample Input 1 (Patna, India: 2009-08-13 23:30)',
    payload: {
      birthDate: '2009-08-13',
      birthTime: '23:30',
      location: {
        city: 'Patna',
        region: 'Bihar',
        country: 'India',
        latitude: 25.5941,
        longitude: 85.1376,
        timezone: 'Asia/Kolkata',
      },
    },
  },
  {
    name: 'Sample Input 2 (New York: 1994-07-20 16:45)',
    payload: {
      birthDate: '1994-07-20',
      birthTime: '16:45',
      location: {
        city: 'New York',
        region: 'New York',
        country: 'United States',
        latitude: 40.7128,
        longitude: -74.006,
        timezone: 'America/New_York',
      },
    },
  },
  {
    name: 'Sample Input 3 (London: 1988-03-21 06:00)',
    payload: {
      birthDate: '1988-03-21',
      birthTime: '06:00',
      location: {
        city: 'London',
        country: 'United Kingdom',
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: 'Europe/London',
      },
    },
  },
];

for (const t of testInputs) {
  console.log(`\n----------------------------------------------------------------`);
  console.log(`TRACE: ${t.name}`);
  console.log(`----------------------------------------------------------------`);

  const chart = calculateBirthChart(t.payload);
  console.log(`Calculation Version: ${chart.calculationVersion}`);
  console.log(`Astronomy Engine: ${chart.engine.name} (${chart.engine.version})`);
  console.log(`UTC Instant: ${chart.time.utcIso} (Julian Day: ${chart.time.julianDay.toFixed(4)})`);
  console.log(`Ascendant: ${chart.angles.ascendant.toFixed(2)}° (${chart.angles.formattedAscendant})`);
  console.log(`Midheaven: ${chart.angles.midheaven.toFixed(2)}° (${chart.angles.formattedMidheaven})`);
  console.log(`Descendant: ${chart.angles.descendant.toFixed(2)}°`);
  console.log(`Nadir: ${chart.angles.nadir.toFixed(2)}°`);

  console.log('\nPlanetary Longitudes:');
  Object.values(chart.planets).forEach((p) => {
    console.log(`  - ${p.body.padEnd(8)}: ${p.longitude.toFixed(2)}° (${p.formattedLongitude}) speed: ${p.speedDegPerDay.toFixed(4)}°/day`);
  });

  const patterns = evaluatePatterns(chart);
  console.log(`\nPatterns Evaluated: ${patterns.patternsChecked} | Matched: ${patterns.matches.length}`);

  if (patterns.matches.length > 0) {
    console.log('MATCHED PATTERNS:');
    patterns.matches.forEach((m) => {
      console.log(`  ✓ [${m.patternId}] ${m.name} (${m.category})`);
    });
  } else {
    console.log('NO PATTERNS MATCHED.');
  }

  console.log('\nNON-MATCHING PATTERNS FAILURE ANALYSIS:');
  for (const pat of PATTERN_REGISTRY) {
    const isMatched = patterns.matches.some((m) => m.patternId === pat.id);
    if (!isMatched) {
      // Analyze why it failed
      console.log(`  ✗ [${pat.id}] ${pat.name}`);
      console.log(`    Rule: ${pat.ruleType} | Params: ${JSON.stringify(pat.parameters)}`);

      if (pat.id === 'pat_solar_zenith_mc') {
        const sun = chart.planets.Sun;
        const dist = angularDistance(sun.longitude, chart.angles.midheaven);
        console.log(`    Measured: Sun=${sun.longitude.toFixed(2)}°, MC=${chart.angles.midheaven.toFixed(2)}°, Distance=${dist.toFixed(2)}°, Orb=1.0°`);
      } else if (pat.id === 'pat_ascendant_conjunction') {
        let minDist = Infinity;
        let closestBody = '';
        Object.values(chart.planets).forEach((p) => {
          const d = angularDistance(p.longitude, chart.angles.ascendant);
          if (d < minDist) {
            minDist = d;
            closestBody = p.body;
          }
        });
        console.log(`    Closest planet to ASC: ${closestBody} at ${minDist.toFixed(2)}° distance (required <= 1.0°)`);
      } else if (pat.id === 'pat_exact_cazimi') {
        const sun = chart.planets.Sun;
        let minDist = Infinity;
        let closestBody = '';
        Object.values(chart.planets).forEach((p) => {
          if (p.body !== 'Sun') {
            const d = angularDistance(p.longitude, sun.longitude);
            if (d < minDist) {
              minDist = d;
              closestBody = p.body;
            }
          }
        });
        console.log(`    Closest planet to Sun: ${closestBody} at ${minDist.toFixed(2)}° distance (required <= 0.267°)`);
      } else if (pat.id === 'pat_exact_opposition') {
        let minDev = Infinity;
        const planets = Object.values(chart.planets);
        for (let i = 0; i < planets.length; i++) {
          for (let j = i + 1; j < planets.length; j++) {
            const sep = angularDistance(planets[i].longitude, planets[j].longitude);
            const dev = Math.abs(sep - 180);
            if (dev < minDev) minDev = dev;
          }
        }
        console.log(`    Closest opposition deviation: ${minDev.toFixed(2)}° (required <= 0.35°)`);
      } else if (pat.id === 'pat_exact_trine_pair') {
        let minDev = Infinity;
        const planets = Object.values(chart.planets);
        for (let i = 0; i < planets.length; i++) {
          for (let j = i + 1; j < planets.length; j++) {
            const sep = angularDistance(planets[i].longitude, planets[j].longitude);
            const dev = Math.abs(sep - 120);
            if (dev < minDev) minDev = dev;
          }
        }
        console.log(`    Closest trine deviation: ${minDev.toFixed(2)}° (required <= 0.35°)`);
      } else if (pat.id === 'pat_stationary_node') {
        let minSpeed = Infinity;
        let minSpeedBody = '';
        Object.values(chart.planets).forEach((p) => {
          if (p.body !== 'Sun' && p.body !== 'Moon') {
            const spd = Math.abs(p.speedDegPerDay);
            if (spd < minSpeed) {
              minSpeed = spd;
              minSpeedBody = p.body;
            }
          }
        });
        console.log(`    Lowest planetary speed: ${minSpeedBody} at ${minSpeed.toFixed(4)}°/day (required <= 0.0050°/day)`);
      }
    }
  }

  const rarity = calculateUserRarity(patterns);
  console.log(`\nRarity Engine Output: Status = ${rarity.status}`);
  if (rarity.rarestPattern) {
    console.log(`  Primary Outlier: ${rarity.rarestPattern.patternName} (${rarity.rarestPattern.frequencyPercent.toFixed(2)}%)`);
  }
}

// ----------------------------------------------------------------
// STATISTICAL COVERAGE AUDIT OVER 1000 SAMPLE CHARTS
// ----------------------------------------------------------------
console.log('\n================================================================');
console.log('STATISTICAL COVERAGE AUDIT OVER 1,000 STRATIFIED BIRTH CHARTS');
console.log('================================================================');

const sampleSize = 1000;
const matchCounts: Record<string, number> = {};
PATTERN_REGISTRY.forEach((p) => (matchCounts[p.id] = 0));

let chartsWithZeroMatches = 0;
let chartsWithAtLeastOne = 0;
const totalMatchesPerChart: number[] = [];

// Seeded deterministic sampling over 1950–2025 across 10 global cities
const sampleCities = [
  { city: 'New York', lat: 40.71, lng: -74.00, tz: 'America/New_York' },
  { city: 'London', lat: 51.50, lng: -0.12, tz: 'Europe/London' },
  { city: 'Tokyo', lat: 35.67, lng: 139.65, tz: 'Asia/Tokyo' },
  { city: 'Paris', lat: 48.85, lng: 2.35, tz: 'Europe/Paris' },
  { city: 'Sydney', lat: -33.86, lng: 151.20, tz: 'Australia/Sydney' },
  { city: 'Mumbai', lat: 19.07, lng: 72.87, tz: 'Asia/Kolkata' },
  { city: 'Cairo', lat: 30.04, lng: 31.23, tz: 'Africa/Cairo' },
  { city: 'São Paulo', lat: -23.55, lng: -46.63, tz: 'America/Sao_Paulo' },
  { city: 'Johannesburg', lat: -26.20, lng: 28.04, tz: 'Africa/Johannesburg' },
  { city: 'Mexico City', lat: 19.43, lng: -99.13, tz: 'America/Mexico_City' },
];

for (let i = 0; i < sampleSize; i++) {
  // Generate distinct dates
  const year = 1950 + (i % 75);
  const month = String((i % 12) + 1).padStart(2, '0');
  const day = String((i % 28) + 1).padStart(2, '0');
  const hour = String((i * 7) % 24).padStart(2, '0');
  const minute = String((i * 13) % 60).padStart(2, '0');
  const loc = sampleCities[i % sampleCities.length];

  const chart = calculateBirthChart({
    birthDate: `${year}-${month}-${day}`,
    birthTime: `${hour}:${minute}`,
    location: {
      city: loc.city,
      country: 'Global',
      latitude: loc.lat,
      longitude: loc.lng,
      timezone: loc.tz,
    },
  });

  const patResult = evaluatePatterns(chart);
  totalMatchesPerChart.push(patResult.matches.length);

  if (patResult.matches.length === 0) {
    chartsWithZeroMatches++;
  } else {
    chartsWithAtLeastOne++;
  }

  patResult.matches.forEach((m) => {
    matchCounts[m.patternId] = (matchCounts[m.patternId] || 0) + 1;
  });
}

console.log(`\nCoverage Results (${sampleSize} charts evaluated):`);
console.log(`- Charts with >= 1 match: ${chartsWithAtLeastOne} (${((chartsWithAtLeastOne / sampleSize) * 100).toFixed(1)}%)`);
console.log(`- Charts with NO matches (NO_VALID_PATTERN): ${chartsWithZeroMatches} (${((chartsWithZeroMatches / sampleSize) * 100).toFixed(1)}%)`);

console.log('\nObserved Match Frequency Table:');
console.log('Pattern ID | Pattern Name | Observed Matches | Observed Freq | V1 Reference Freq');
console.log('------------------------------------------------------------------------------------------------');
PATTERN_REGISTRY.forEach((p) => {
  const count = matchCounts[p.id] || 0;
  const observedFreq = ((count / sampleSize) * 100).toFixed(2);
  const refFreq = REFERENCE_POPULATION_V1.patterns[p.id]?.frequencyPercent.toFixed(2) || 'N/A';
  console.log(`${p.id.padEnd(30)} | ${p.name.padEnd(36)} | ${String(count).padStart(5)} / ${sampleSize} | ${observedFreq.padStart(6)}% | ${refFreq.padStart(6)}%`);
});
