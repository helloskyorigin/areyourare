import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const file=name=>readFileSync(name,'utf8');

test('English and Hindi switch persists across product screens',()=>{
 const ctx=file('components/v2/Language.tsx');
 assert.match(ctx,/ayr:language/);
 assert.match(ctx,/document\.documentElement\.lang/);
 assert.match(ctx,/हिंदी/);
 assert.match(file('app/layout.tsx'),/LanguageProvider/);
});
test('public API reveals availability only; report API verifies purchase',()=>{
 const api=file('app/api/discover/route.ts');
 assert.match(api,/ready:true/);
 assert.doesNotMatch(api,/freeHistory|localizeFree|featured|source:/);
 const full=file('app/api/capsule/route.ts');
 assert.match(full,/verifiedPurchase/);
 assert.match(full,/localizePremium/);
 const history=file('lib/history.ts');
 assert.doesNotMatch(history,/export function freeHistory/);
});
test('paid report is a distinct route, reachable only with API entitlement',()=>{
 const full=file('app/result/page.tsx');
 assert.match(full,/from '\.\.\/capsule\/page'/);
 const unlock=file('app/unlock/page.tsx');
 assert.match(unlock,/<PremiumCTA date=\{date\} paid=\{paid\}/);
 assert.doesNotMatch(unlock,/featured\.title|history\.timeline|MomentCard/);
 const scan=file('app/searching/page.tsx');
 assert.match(scan,/\/unlock\?date=/);
 assert.match(scan,/body\.ready !== true/);
});
test('language translation remains behind the verified report API',()=>{
 const translator=file('lib/i18n-history.ts');
 assert.match(translator,/GOOGLE_CLOUD_TRANSLATE_API_KEY/);
 assert.match(translator,/translation\.googleapis\.com/);
 assert.doesNotMatch(translator,/localizeFree/);
 const api=file('app/api/capsule/route.ts');
 assert.match(api,/verifiedPurchase/);
 assert.match(api,/localizePremium/);
});
test('no "Wikipedia-powered" label or sample historical result in public marketing',()=>{
 for(const path of ['app/page.tsx','app/searching/page.tsx','app/unlock/page.tsx',
 'components/v2/Brand.tsx','components/v2/PremiumCTA.tsx']){
  const s=file(path);
  assert.doesNotMatch(s,/wikipedia[\s-]*powered|wikipedia[\s-]*sourced|Apollo 11|free story|पहली कहानी मुफ़्त/i);
 }
});
