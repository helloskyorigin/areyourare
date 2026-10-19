import { Birthday, prettyDate } from './birthday';

export type HistoricalMoment = {
  id: string; year: number; kind: 'event'|'birth'|'death'; title: string;
  text: string; source: string | null; image: string | null;
};
export type FullHistory = {
  birthDate: string; dayLabel: string; birthYear: number;
  featured: HistoricalMoment;
  attribution: string;
  person: HistoricalMoment | null;
  preview: HistoricalMoment[]; exactDayYear: HistoricalMoment | null;
  totals: { events: number; people: number; exact: number };
  timeline: HistoricalMoment[]; people: HistoricalMoment[];
  deaths: HistoricalMoment[]; exactMatches: HistoricalMoment[];
};
type WikiPage = { title?: string; thumbnail?: { source?: string }; content_urls?: { desktop?: { page?: string } } };
type WikiRecord = { year?: number; text?: string; pages?: WikiPage[] };
type WikiFeed = { selected?: WikiRecord[]; events?: WikiRecord[]; births?: WikiRecord[]; deaths?: WikiRecord[] };
const clean = (str: string, limit = 750) => str.replace(/<[^>]*>/g, '').replace(/\s+/g,' ').trim().slice(0,limit);

function mapEntries(rows: WikiRecord[], kind: HistoricalMoment['kind']): HistoricalMoment[] {
  return rows.flatMap((item, i) => {
    if (!Number.isInteger(item.year) || typeof item.text !== 'string' || item.text.trim().length < 18) return [];
    const page = item.pages?.find(p => p.thumbnail?.source && p.content_urls?.desktop?.page) ||
      item.pages?.find(p => p.content_urls?.desktop?.page) || item.pages?.[0];
    const link = page?.content_urls?.desktop?.page || '';
    const image = page?.thumbnail?.source || '';
    return [{
      id: kind + '-' + String(item.year) + '-' + i, year: item.year!, kind,
      title: clean((page?.title || item.text.split(/[.!?]/)[0]).replace(/_/g,' '), 120),
      text: clean(item.text),
      source: /^https:\/\/en\.wikipedia\.org\/wiki\//.test(link) ? link : null,
      image: /^https:\/\/(upload\.wikimedia\.org|en\.wikipedia\.org)\//.test(image) ? image : null,
    }];
  });
}
function unique(items: HistoricalMoment[]): HistoricalMoment[] {
  const keys = new Set<string>();
  return items.filter(e => {
    const k = e.year + ':' + e.text.toLowerCase().slice(0,75);
    if (keys.has(k)) return false;
    keys.add(k); return true;
  });
}
const rank = (e: HistoricalMoment) => (e.image ? 8 : 0) + (e.source ? 3 : 0) +
  (e.text.length > 65 && e.text.length < 390 ? 2 : 0) + (e.year > 1750 && e.year < 2020 ? 1 : 0);
async function fetchFeed(date: Birthday): Promise<WikiFeed> {
  const md = String(date.month).padStart(2,'0') + '/' + String(date.day).padStart(2,'0');
  const urls = [
    'https://en.wikipedia.org/api/rest_v1/feed/onthisday/all/' + md,
    'https://api.wikimedia.org/feed/v1/wikipedia/en/onthisday/all/' + md,
  ];
  for (const url of urls) {
    try {
      const res = await fetch(url, {
        headers: { Accept: 'application/json',
          'User-Agent': 'AREYOURARE/2.0 (https://areyourare.ai.studio; hello.skyorigin@gmail.com)' },
        next: { revalidate: 86400 }, signal: AbortSignal.timeout(6500),
      });
      if (!res.ok) continue;
      const json = await res.json() as WikiFeed;
      if (Array.isArray(json.events) || Array.isArray(json.selected)) return json;
    } catch { /* Fallback to the alternate Wikimedia endpoint */ }
  }
  throw new Error('HISTORY_SOURCE_UNAVAILABLE');
}
export async function loadHistory(date: Birthday): Promise<FullHistory> {
  const feed = await fetchFeed(date);
  const all = unique(mapEntries([...(feed.selected || []), ...(feed.events || [])], 'event'));
  if (!all.length) throw new Error('NO_HISTORICAL_EVENTS');
  const ranked = [...all].sort((a,b) => rank(b) - rank(a) || b.year - a.year);
  const people = mapEntries(feed.births || [], 'birth').sort((a,b) => rank(b) - rank(a));
  const deaths = mapEntries(feed.deaths || [], 'death').sort((a,b) => rank(b) - rank(a));
  const exactMatches = all.filter(e => e.year === date.year);
  return {
    birthDate: date.iso, dayLabel: prettyDate(date), birthYear: date.year,
    featured: ranked[0], person: people[0] || null,
    preview: ranked.slice(1,3), exactDayYear: exactMatches[0] || null,
    totals: { events: all.length, people: people.length, exact: exactMatches.length },
    attribution: 'Historical entries from Wikipedia / Wikimedia projects. Follow original links for context and licensing.',
    timeline: [...all].sort((a,b) => a.year - b.year),
    people: people.slice(0,60), deaths: deaths.slice(0,30), exactMatches,
  };
}
