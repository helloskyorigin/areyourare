'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, Check, Copy, Globe2,
  History, RotateCcw, Share2, Sparkles,
} from 'lucide-react';
import { monthName, parseBirthday } from '@/lib/birthday';
import type { FreeHistory } from '@/lib/history';
import { SiteFooter, SiteHeader } from '@/components/v2/Brand';
import { MomentCard } from '@/components/v2/MomentCard';
import { PremiumCTA } from '@/components/v2/PremiumCTA';

type CachedDiscovery = { date: string; savedAt: number; result: FreeHistory };

function ResultExperience() {
  const params = useSearchParams();
  const date = params.get('date') || '';
  const birthday = parseBirthday(date);
  const [history, setHistory] = useState<FreeHistory | null>(null);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sharing, setSharing] = useState(false);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!parseBirthday(date)) {
      setError('Choose a real birthday to explore its history.');
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError('');
    setHistory(null);
    setPaid(false);

    async function loadFreeHistory() {
      // Use the free discovery just fetched on /searching. Never cache premium data.
      if (retry === 0) {
        try {
          const cached = sessionStorage.getItem('ayr:free-discovery:v2');
          if (cached) {
            const parsed = JSON.parse(cached) as CachedDiscovery;
            if (parsed.date === date && Date.now() - parsed.savedAt < 10 * 60 * 1000 &&
                parsed.result?.featured?.title && Array.isArray(parsed.result.preview)) {
              if (!controller.signal.aborted) {
                setHistory(parsed.result);
                setLoading(false);
              }
              return;
            }
          }
        } catch { /* If storage is unavailable, fetch normally. */ }
      }
      try {
        const response = await fetch('/api/discover?date=' + encodeURIComponent(date), {
          signal: controller.signal, cache: 'no-store',
        });
        const data = await response.json() as FreeHistory & { error?: string };
        if (!response.ok || !data.featured?.title) throw new Error(data.error || 'Unable to open this day in history.');
        if (controller.signal.aborted) return;
        setHistory(data);
        setLoading(false);
      } catch (cause) {
        if (controller.signal.aborted) return;
        setError(cause instanceof Error ? cause.message : 'Could not load the archive.');
        setLoading(false);
      }
    }

    // Payment entitlement is checked independently; the free result never waits for checkout.
    async function checkPurchase() {
      try {
        const response = await fetch('/api/payment-status?date=' + encodeURIComponent(date), {
          signal: controller.signal, cache: 'no-store',
        });
        if (!response.ok) return;
        const result = await response.json() as { paid?: boolean };
        if (!controller.signal.aborted) setPaid(result.paid === true);
      } catch { /* Checkout still provides a recoverable error if requested. */ }
    }

    void loadFreeHistory();
    void checkPurchase();
    return () => controller.abort();
  }, [date, retry]);

  async function share() {
    const url = window.location.origin + '/';
    const text = 'I discovered the history behind my birthday with AREYOURARE. Explore yours.';
    try {
      if (navigator.share) await navigator.share({ title: 'A day in history — AREYOURARE', text, url });
      else {
        await navigator.clipboard.writeText(text + ' ' + url);
        setSharing(true);
      }
    } catch { /* Native share cancelled or clipboard unavailable. */ }
  }

  if (loading) {
    return <div className="site discovery-loading">
      <span className="eyebrow">✳ YOUR DAY IN HISTORY</span>
      <div className="discovery-loading-line" aria-hidden="true"><span/></div>
      <h1>Preparing your <em>first discovery.</em></h1>
      <p>Retrieving historical records from the archive…</p>
    </div>;
  }
  if (error || !history || !birthday) {
    return <div className="site">
      <SiteHeader/>
      <main className="state-message shell">
        <span className="eyebrow">✳ THE ARCHIVE</span>
        <h1>This chapter couldn't be opened.</h1>
        <p>{error || 'Please try again in a moment.'}</p>
        <div className="discovery-error-actions">
          {birthday && <button className="button-primary" type="button" onClick={() => setRetry(value => value + 1)}>
            <RotateCcw size={17}/> Retry discovery
          </button>}
          <Link href="/discover" className="button-secondary"><ArrowLeft size={16}/> Choose another date</Link>
        </div>
      </main>
      <SiteFooter/>
    </div>;
  }

  const day = String(birthday.day).padStart(2, '0');
  const month = monthName(birthday.month);
  const previews = history.preview || [];
  const sources = history.totals;

  return <div className="site discovery-page">
    <SiteHeader/>
    <main id="main-content">
      <section className="discovery-hero">
        <div className="shell">
          <div className="discovery-hero-bar">
            <span className="eyebrow"><Sparkles size={15}/> YOUR PERSONAL HISTORICAL ARCHIVE</span>
            <button className="discovery-share" type="button" onClick={share} aria-label="Share AREYOURARE without revealing your birth year">
              {sharing ? <Check size={16}/> : <Share2 size={16}/>}
              {sharing ? 'Link copied' : 'Share the discovery'}
            </button>
          </div>
          <div className="discovery-hero-grid">
            <div className="discovery-hero-copy">
              <span className="discovery-caps">THE DAY THE WORLD REMEMBERS</span>
              <h1 aria-label={month + ' ' + day}>
                <span>{day}</span>
                <em>{month}</em>
              </h1>
              <p>
                Your birthday is one date in a much larger story. See what happened across the centuries — and who shares your day.
              </p>
              <div className="discovery-born"><span>YOUR BIRTH YEAR</span><strong>{birthday.year}</strong><small>Historical anniversaries may be from other years.</small></div>
            </div>
            <div className="discovery-hero-art" aria-hidden="true">
              <div className="discovery-index-card">
                <div className="discovery-index-top"><span>AREYOURARE / ARCHIVE</span><span>VOL. 01</span></div>
                <div className="discovery-index-label">A DATE THROUGH HISTORY</div>
                <div className="discovery-index-date"><strong>{day}</strong><em>{month}</em></div>
                <div className="discovery-index-divider"><span>01 / FEATURED MOMENT</span><span>✳</span></div>
                <div className="discovery-index-feature">
                  <strong>{history.featured.year}</strong>
                  <span>{history.featured.title}</span>
                </div>
                <div className="discovery-index-bottom"><span>DOCUMENTED ANNIVERSARIES</span><span>YOUR HUMAN ARCHIVE</span></div>
              </div>
            </div>
          </div>
          <div className="discovery-metrics" aria-label="Entries from the Wikipedia On This Day feed">
            <div><strong>{sources.events}</strong><span>Historical records</span></div>
            <div><strong>{sources.people}</strong><span>People born on your day</span></div>
            <div><strong>{sources.exact}</strong><span>Events from your exact birth year</span></div>
            <a href="#featured-moment">EXPLORE YOUR DAY <span>↓</span></a>
          </div>
        </div>
      </section>

      <section className="discovery-feature shell" id="featured-moment">
        <div className="discovery-chapter-head"><span className="eyebrow">01 / A MOMENT IN HISTORY</span><span>CURATED FROM WIKIPEDIA</span></div>
        <div className="discovery-feature-grid">
          <div className="discovery-feature-copy">
            <span className="discovery-feature-label">A STORY YOUR DATE REMEMBERS</span>
            <strong className="discovery-event-year">{history.featured.year}</strong>
            <h2>{history.featured.title}</h2>
            <p>{history.featured.text}</p>
            {history.featured.source && <a className="discovery-source-link" href={history.featured.source} target="_blank" rel="noopener noreferrer">
              Read the original Wikipedia article <ArrowUpRight size={18}/>
            </a>}
            <span className="discovery-footnote"><Globe2 size={15}/> This event shares {month} {birthday.day}, not necessarily {birthday.year}.</span>
          </div>
          <div className="discovery-feature-image">
            <div className="discovery-feature-photo">
              {history.featured.image ? <img src={history.featured.image} alt={'Related Wikipedia image: ' + history.featured.title} loading="lazy" decoding="async"/> : <span className="discovery-fallback-glyph" aria-hidden="true">✳</span>}
            </div>
            <div className="discovery-photo-caption"><span>01 — THE FEATURED RECORD</span><span>{history.featured.year}</span></div>
          </div>
        </div>
      </section>

      <section className="discovery-connection">
        <div className="shell discovery-connection-grid">
          <div className="discovery-connection-intro">
            <span className="eyebrow">02 / THE HUMAN CONNECTION</span>
            <h2>A birthday shared <em>across time.</em></h2>
            <p>A date can connect people separated by generations. Here's one notable person who shares your calendar day.</p>
          </div>
          {history.person ? <article className="discovery-person-card">
            <div className="discovery-person-details">
              <span className="discovery-card-eyebrow">BORN {history.person.year} / {month.toUpperCase()} {day}</span>
              <h3>{history.person.title}</h3>
              <p>{history.person.text}</p>
              {history.person.source && <a className="discovery-source-link" href={history.person.source} target="_blank" rel="noopener noreferrer">Explore their story <ArrowUpRight size={17}/></a>}
            </div>
            <div className="discovery-person-portrait">
              {history.person.image ? <img src={history.person.image} loading="lazy" decoding="async" alt={'Wikipedia portrait related to ' + history.person.title}/> : <span aria-hidden="true">✳</span>}
            </div>
          </article> : <div className="discovery-person-empty">
            <span className="discovery-card-eyebrow">THE PEOPLE ARCHIVE</span>
            <h3>Not every story comes with a portrait.</h3>
            <p>Wikipedia doesn't list a featured birthday for this date in the available feed.</p>
          </div>}
        </div>
      </section>

      <section className="discovery-chronicle shell">
        <div className="discovery-chronicle-head">
          <div><span className="eyebrow">03 / THE CHRONICLE</span><h2>One day. <em>So many chapters.</em></h2></div>
          <p>A few more documented moments connected to {month} {birthday.day}.</p>
        </div>
        {previews.length ? <div className="discovery-chronicle-grid">
          {previews.map((moment, index) => <MomentCard key={moment.id} moment={moment} index={index + 2}/>)}
        </div> : <div className="discovery-chronicle-empty">
          <BookOpen size={22}/><p>Other events for this calendar date aren't listed in the current archive preview.</p>
        </div>}
        <div className="discovery-year-explainer">
          <CalendarDays size={21}/>
          <div><strong>{history.exactDayYear ? 'A documented moment from ' + birthday.year : 'A note about your birth year'}</strong>
            <p>{history.exactDayYear
              ? history.exactDayYear.text
              : 'The moments above happened on your calendar birthday across different years. A notable event on your exact birth date and year may not be listed by Wikipedia.'}</p>
            {history.exactDayYear?.source && <a className="discovery-source-link" href={history.exactDayYear.source} target="_blank" rel="noopener noreferrer">View this birth-year record <ArrowUpRight size={16}/></a>}
          </div>
        </div>
      </section>

      <section className="discovery-premium-section" id="time-capsule">
        <div className="shell">
          <div className="discovery-premium-intro"><span className="eyebrow">04 / KEEP EXPLORING</span><h2>This was just <em>the first page.</em></h2><p>Behind your birthday is a full archive of lives, events and historical connections.</p></div>
          <div className="premium-wrap discovery-premium-wrap">
            <div className="premium-art discovery-capsule-art">
              <div className="discovery-cover-frame">
                <div className="discovery-cover-top"><span>AREYOURARE</span><span>VOL. 01</span></div>
                <span className="discovery-cover-star" aria-hidden="true">✳</span>
                <span className="discovery-cover-label">A PERSONAL HISTORICAL ARCHIVE</span>
                <strong>{day}</strong>
                <em>{month}</em>
                <span className="discovery-cover-bottom">THE BIRTHDAY<br/>TIME CAPSULE</span>
              </div>
            </div>
            <PremiumCTA date={date} paid={paid}/>
          </div>
        </div>
      </section>

      <section className="discovery-finale shell">
        <div><span className="eyebrow">THE STORIES ARE REAL</span><h2>History is better <em>when you make it personal.</em></h2></div>
        <div className="discovery-finale-actions">
          <p><History size={17}/>{history.attribution} Calendar anniversaries are not personal predictions.</p>
          <Link href="/discover" className="button-secondary"><RotateCcw size={16}/> Explore another birthday</Link>
          <button type="button" className="discovery-share discovery-share-footer" onClick={share}>
            {sharing ? <Check size={16}/> : <Copy size={16}/>} {sharing ? 'Copied' : 'Share AREYOURARE'}
          </button>
        </div>
      </section>
    </main>
    <SiteFooter/>
  </div>;
}

export default function ResultPage() {
  return <Suspense fallback={<div className="site loading-state">Opening your birthday in history…</div>}>
    <ResultExperience/>
  </Suspense>;
}
