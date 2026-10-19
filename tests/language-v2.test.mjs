import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const file=name=>readFileSync(name,'utf8');

test('header offers persistent English and Hindi switch across pages',()=>{
 const ctx=file('components/v2/Language.tsx');
 assert.match(ctx,/ayr:language/);
 assert.match(ctx,/document\.documentElement\.lang/);
 assert.match(ctx,/हिंदी/);
 const layout=file('app/layout.tsx');
 assert.match(layout,/LanguageProvider/);
});
test('free result includes exactly one historical event, no paid collections',()=>{
 const history=file('lib/history.ts');
 assert.match(history,/export function freeHistory/);
 const snippet=history.slice(history.indexOf('export function freeHistory'));
 assert.doesNotMatch(snippet,/preview:h\.preview|person:h\.person|totals:h\.totals|exactDayYear:h\.exactDayYear/);
 const result=file('app/result/page.tsx');
 assert.doesNotMatch(result,/MomentCard|history\.preview|history\.person/);
 assert.match(result,/result2-mobile-teaser/);
 assert.match(result,/<PremiumCTA date=\{date\} paid=\{paid\}/);
});
test('mobile conversion call-to-action appears before full free story',()=>{
 const css=file('app/conversion.css');
 assert.match(css,/\.result2-upgrade\{order:-1\}/);
 assert.match(css,/\.result2-event\{order:1\}/);
 assert.match(css,/\.language-toggle/);
});
test('Hindi historical content is translated server-side only',()=>{
 const translator=file('lib/i18n-history.ts');
 assert.match(translator,/GOOGLE_CLOUD_TRANSLATE_API_KEY/);
 assert.match(translator,/translation\.googleapis\.com/);
 assert.match(file('app/api/discover/route.ts'),/localizeFree/);
 assert.match(file('app/api/capsule/route.ts'),/localizePremium/);
 assert.match(file('app/api/capsule/route.ts'),/verifiedPurchase/);
});
test('no public Wikipedia-powered marketing label',()=>{
 for(const page of ['app/page.tsx','app/searching/page.tsx','app/result/page.tsx',
 'components/v2/Brand.tsx','components/v2/PremiumCTA.tsx']){
  assert.doesNotMatch(file(page),/wikipedia[\s-]*powered|wikipedia[\s-]*sourced/i);
 }
});
