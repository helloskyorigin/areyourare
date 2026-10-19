import test from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { parseBirthday, prettyDate } from '../lib/birthday';
import { loadHistory } from '../lib/history';
import { GET as discover } from '../app/api/discover/route';

test('birthday parser accepts leap days and rejects invalid dates', () => {
  assert.equal(parseBirthday('2001-02-29'), null);
  assert.equal(parseBirthday('1998-09-31'), null);
  assert.equal(parseBirthday('2030-01-01'), null);
  assert.equal(parseBirthday('hello'), null);
  const leap=parseBirthday('2000-02-29');
  assert.ok(leap);
  assert.equal(prettyDate(leap), 'February 29');
});

test('public scan confirms availability without leaking any historical facts', async () => {
  const original=globalThis.fetch;
  globalThis.fetch=(async()=>new Response(JSON.stringify({
    selected:[{year:1969,text:'Apollo 11 landed on the Moon during a historic lunar mission.',pages:[{
      title:'Apollo 11',content_urls:{desktop:{page:'https://en.wikipedia.org/wiki/Apollo_11'}}}]}],
    events:[{year:2000,text:'A documented historical event happened on this same calendar day.'}],
    births:[{year:1940,text:'A famous person was born on the same date.'}],
    deaths:[],
  }),{status:200})) as typeof fetch;
  try {
    const birth=parseBirthday('2000-07-20');
    assert.ok(birth);
    const full=await loadHistory(birth);
    assert.ok(full.featured.title);
    assert.equal(full.timeline.length,2);
    assert.equal(full.people.length,1);

    const result=await discover(new NextRequest('https://areyourare.ai.studio/api/discover?date=2000-07-20&lang=hi'));
    assert.equal(result.status,200);
    const body=await result.json();
    assert.deepEqual(body,{ready:true});
    const serialized=JSON.stringify(body);
    for(const secret of ['featured','year','title','text','people','events','source','1969','Apollo','1940','2000'])
      assert.equal(serialized.includes(secret),false,'Public payload must not include '+secret);
    assert.equal(result.headers.get('cache-control'),'private, no-store');

    const invalid=await discover(new NextRequest('https://areyourare.ai.studio/api/discover?date=2000-02-30'));
    assert.equal(invalid.status,400);
  } finally {globalThis.fetch=original;}
});
