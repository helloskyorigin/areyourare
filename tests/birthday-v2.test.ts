import test from 'node:test';
import assert from 'node:assert/strict';
import { parseBirthday, prettyDate } from '../lib/birthday';
import { loadHistory, freeHistory } from '../lib/history';

test('birthday parser accepts leap day but rejects invalid dates', () => {
  assert.equal(parseBirthday('2001-02-29'), null);
  assert.equal(parseBirthday('1998-09-31'), null);
  assert.equal(parseBirthday('2030-01-01'), null);
  assert.equal(parseBirthday('hello'), null);
  const leap = parseBirthday('2000-02-29');
  assert.ok(leap);
  assert.equal(prettyDate(leap), 'February 29');
});
test('Wikimedia feed is curated and premium collections are not in free payload', async () => {
  const oldFetch = globalThis.fetch;
  globalThis.fetch = (async () => new Response(JSON.stringify({
    selected: [{year:1969,text:'Apollo 11 landed on the Moon during a historic lunar mission.',pages:[{title:'Apollo 11',content_urls:{desktop:{page:'https://en.wikipedia.org/wiki/Apollo_11'}}}]}],
    events:[
      {year:1969,text:'Apollo 11 landed on the Moon during a historic lunar mission.'},
      {year:2000,text:'A documented scientific milestone occurred on this date.'},
      {year:2011,text:'Another important historical event happened on this date.'}
    ],
    births:[{year:1940,text:'An important artist was born on the same calendar date.',pages:[{title:'Artist'}]}],
    deaths:[]
  }),{status:200})) as typeof fetch;
  try {
    const birth=parseBirthday('2000-07-20');
    assert.ok(birth);
    const full=await loadHistory(birth);
    const free=freeHistory(full);
    assert.equal(full.birthYear,2000);
    assert.equal(full.timeline.length,3);
    assert.equal(full.exactMatches.length,1);
    assert.equal(full.totals.people,1);
    assert.deepEqual(Object.keys(free).sort(),['attribution','birthDate','birthYear','dayLabel','featured'].sort());
    assert.equal('person' in free,false);
    assert.equal('preview' in free,false);
    assert.equal('totals' in free,false);
    assert.equal('exactDayYear' in free,false);
    assert.equal('timeline' in free,false);
    assert.equal('people' in free,false);
    assert.equal('exactMatches' in free,false);
  } finally {globalThis.fetch=oldFetch;}
});
