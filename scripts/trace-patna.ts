import { calculateBirthChart } from '../lib/astronomy/engine';
import { PATTERN_REGISTRY } from '../lib/patterns/registry';
import { evaluatePatterns } from '../lib/patterns/evaluator';
import { calculateUserRarity } from '../lib/rarity/engine';
import { angularDistance } from '../lib/astronomy/math';

const input = {
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
};

const chart = calculateBirthChart(input);
console.log('=== DETAILED TRACE FOR 2009-08-13 23:30 Patna, India ===');
console.log('Local Time:', input.birthDate, input.birthTime, input.location.timezone);
console.log('UTC Iso:', chart.time.utcIso);
console.log('Julian Day:', chart.time.julianDay);
console.log('Angles:');
console.log('  Ascendant:', chart.angles.ascendant.toFixed(2), chart.angles.formattedAscendant);
console.log('  Midheaven:', chart.angles.midheaven.toFixed(2), chart.angles.formattedMidheaven);
console.log('  Descendant:', chart.angles.descendant.toFixed(2));
console.log('  Nadir:', chart.angles.nadir.toFixed(2));

console.log('\nPlanetary Longitudes:');
Object.values(chart.planets).forEach((p) => {
  console.log(`  - ${p.body.padEnd(8)}: ${p.longitude.toFixed(4)}° (${p.formattedLongitude}) speed=${p.speedDegPerDay.toFixed(5)}°/d`);
});

const patterns = evaluatePatterns(chart);
console.log('\nMatched Patterns Count:', patterns.matches.length);
patterns.matches.forEach(m => {
  console.log(`  Matched: [${m.patternId}] ${m.name}`);
});

console.log('\nDetailed check of why every pattern passed or failed:');
for (const pat of PATTERN_REGISTRY) {
  const m = patterns.matches.find(x => x.patternId === pat.id);
  if (m) {
    console.log(`✓ MATCH: ${pat.name} (${pat.id})`);
  } else {
    console.log(`✗ NO MATCH: ${pat.name} (${pat.id})`);
    if (pat.id === 'pat_solar_zenith_mc') {
      const d = angularDistance(chart.planets.Sun.longitude, chart.angles.midheaven);
      console.log(`   -> Sun-MC distance is ${d.toFixed(2)}° (required <= 1.0°)`);
    } else if (pat.id === 'pat_ascendant_conjunction') {
      const dists = Object.values(chart.planets).map(p => ({ b: p.body, d: angularDistance(p.longitude, chart.angles.ascendant) }));
      dists.sort((a,b) => a.d - b.d);
      console.log(`   -> Closest to ASC: ${dists[0].b} at ${dists[0].d.toFixed(2)}° (required <= 1.0°)`);
    } else if (pat.id === 'pat_stationary_node') {
      const speeds = Object.values(chart.planets).filter(p => p.body !== 'Sun' && p.body !== 'Moon').map(p => ({ b: p.body, s: Math.abs(p.speedDegPerDay) }));
      speeds.sort((a,b) => a.s - b.s);
      console.log(`   -> Lowest planetary speed: ${speeds[0].b} at ${speeds[0].s.toFixed(5)}°/day (required <= 0.005°)`);
    } else if (pat.id === 'pat_exact_opposition') {
      const opps = [];
      const pls = Object.values(chart.planets);
      for (let i=0; i<pls.length; i++) {
        for (let j=i+1; j<pls.length; j++) {
          const d = angularDistance(pls[i].longitude, pls[j].longitude);
          opps.push({ pair: `${pls[i].body}-${pls[j].body}`, dev: Math.abs(d - 180), dist: d });
        }
      }
      opps.sort((a,b) => a.dev - b.dev);
      console.log(`   -> Closest opposition: ${opps[0].pair} with dev=${opps[0].dev.toFixed(2)}° (required <= 0.35°) [Jupiter-Sun distance is ${opps.find(x => x.pair.includes('Jupiter') && x.pair.includes('Sun'))?.dist.toFixed(2)}°]`);
    } else if (pat.id === 'pat_t_square') {
      console.log(`   -> T-Square: No opposition within 2.0° with a 90° square apex within 2.0° orb.`);
    }
  }
}

const rarity = calculateUserRarity(patterns);
console.log('\nRarity Result:', rarity.status);
