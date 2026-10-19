import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const source = name => readFileSync(name,'utf8');
test('orbital visuals remain removed from active pages',()=>{
 for(const path of ['app/page.tsx','app/searching/page.tsx','app/unlock/page.tsx','app/result/page.tsx']) {
  assert.doesNotMatch(source(path),/portal-ring|journey-orbit|discovery-art-ring|discovery-loading-ring/);
 }
 assert.match(source('app/page.tsx'),/hero-archive-frame/);
 assert.match(source('app/searching/page.tsx'),/scan2-sheet/);
 assert.match(source('app/unlock/page.tsx'),/mystery-stage/);
});
test('responsive mystery screen and past broken how-steps fixed',()=>{
 const stability=source('app/layout-stability.css');
 const mystery=source('app/mystery.css');
 assert.match(stability,/\.how-steps>div>p\{grid-column:2;grid-row:2/);
 assert.match(mystery,/\.mystery-lock-grid/);
 assert.match(mystery,/@media\(max-width:760px\)/);
 assert.match(mystery,/@media\(max-width:380px\)/);
 assert.match(mystery,/@media\(prefers-reduced-motion:reduce\)/);
 assert.match(source('app/layout.tsx'),/import '\.\/mystery\.css';/);
});
test('all author CSS has balanced brace pairs',()=>{
 for(const path of ['app/globals.css','app/journey.css','app/layout-stability.css','app/conversion.css','app/launch.css','app/mystery.css']){
  const css=source(path);
  assert.equal((css.match(/\{/g)||[]).length,(css.match(/\}/g)||[]).length,path);
 }
});
test('checkout sits below the curiosity cards and payment success goes to paid result',()=>{
 const unlock=source('app/unlock/page.tsx');
 assert.ok(unlock.indexOf('mystery-lock-grid')<unlock.indexOf('mystery-payment'));
 assert.match(source('app/payment/return/page.tsx'),/router\.replace\('\/result\?date=/);
 assert.match(source('app/recover/route.ts'),/new URL\('\/result'/);
});
