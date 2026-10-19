import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = (name) => readFileSync(resolve(process.cwd(), name), 'utf8');
const landing = source('app/page.tsx');
const searching = source('app/searching/page.tsx');
const result = source('app/result/page.tsx');
const stability = source('app/layout-stability.css');
const root = source('app/layout.tsx');

test('Orbital illustrations are removed from the active V2 journey', () => {
  for (const text of [landing, searching, result]) {
    assert.doesNotMatch(text, /portal-ring|journey-orbit|discovery-art-ring|discovery-loading-ring/);
  }
  assert.match(landing, /hero-archive-frame/);
  assert.match(searching, /scan2-sheet/);
  assert.match(result, /result2-grid/);
});

test('Mobile content uses an explicit grid rather than squeezed auto-columns', () => {
  assert.match(stability, /\.how-steps>div>p\{grid-column:2;grid-row:2/);
  assert.match(stability, /\.how-steps>div>strong\{grid-column:2;grid-row:1/);
  assert.match(stability, /@media\(max-width:760px\)/);
  assert.match(stability, /@media\(max-width:380px\)/);
  assert.match(stability, /grid-template-columns:minmax\(0,1fr\)/);
});

test('Global style imports the responsive and conversion layers', () => {
  assert.match(root, /import '\.\/layout-stability\.css';/);
  assert.match(root, /import '\.\/conversion\.css';/);
  assert.match(stability, /prefers-reduced-motion:reduce/);
});

test('Stylesheet brace pairs stay balanced', () => {
  for (const file of ['app/globals.css', 'app/journey.css', 'app/layout-stability.css', 'app/conversion.css']) {
    const css = source(file);
    assert.equal((css.match(/\{/g) || []).length, (css.match(/\}/g) || []).length, file);
  }
});

test('Checkout, data sources, and premium gate remain wired', () => {
  assert.match(result, /<PremiumCTA date=\{date\} paid=\{paid\}/);
  assert.match(searching, /\/api\/discover\?date=/);
  assert.match(result, /\/api\/payment-status\?date=/);
});
