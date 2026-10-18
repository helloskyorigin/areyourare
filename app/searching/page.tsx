'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowUpRight, BookOpen, CalendarDays, Check, Globe2, RotateCcw } from 'lucide-react';
import { SiteHeader } from '@/components/v2/Brand';
import { monthName, parseBirthday } from '@/lib/birthday';
import type { FreeHistory } from '@/lib/history';

type ArchiveStage = 'connecting' | 'ready' | 'error';

function SearchingExperience() {
  const params = useSearchParams();
  const router = useRouter();
  const date = params.get('date') || '';
  const birthday = parseBirthday(date);
  const [stage, setStage] = useState<ArchiveStage>('connecting');
  const [message, setMessage] = useState('');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!parseBirthday(date)) return;
    const controller = new AbortController();
    setStage('connecting');
    setMessage('');

    async function openArchive() {
      try {
        const response = await fetch('/api/discover?date=' + encodeURIComponent(date), {
          signal: controller.signal,
          cache: 'no-store',
        });
        const payload = await response.json() as FreeHistory & { error?: string };
        if (!response.ok || !payload.featured?.title) {
          throw new Error(payload.error || 'The historical archive could not be reached.');
        }
        if (controller.signal.aborted) return;

        // Cache only the already-public free result; no premium data is stored here.
        try {
          sessionStorage.setItem('ayr:free-discovery:v2', JSON.stringify({
            date, savedAt: Date.now(), result: payload,
          }));
        } catch { /* Storage may be disabled; the result screen fetches as usual. */ }

        setStage('ready');
        router.replace('/result?date=' + encodeURIComponent(date));
      } catch (error) {
        if (controller.signal.aborted) return;
        setMessage(error instanceof Error ? error.message : 'Unable to connect to the historical archive.');
        setStage('error');
      }
    }

    void openArchive();
    return () => controller.abort();
  }, [date, router, attempt]);

  const invalid = !birthday;
  const day = birthday ? String(birthday.day).padStart(2, '0') : '--';
  const month = birthday ? monthName(birthday.month) : 'HISTORY';
  const isReady = stage === 'ready';
  const isError = stage === 'error' || invalid;
  const dateText = birthday ? month + ' ' + birthday.day : 'your day';

  return (
    <div className="site journey-page">
      <SiteHeader />
      <main className="journey-main shell" id="main-content">
        <div className="journey-atmosphere" aria-hidden="true" />
        <div className="journey-topline">
          <span className="eyebrow">✳ AREYOURARE / THE HUMAN ARCHIVE</span>
          <span className="journey-step-label">01 — OPENING YOUR DAY</span>
        </div>
        <div className="journey-grid">
          <section className="journey-copy">
            <span className="journey-kicker"><span className="journey-kicker-dot" /> YOUR HISTORICAL JOURNEY</span>
            <h1>
              Your day is a <em>doorway</em> into history.
            </h1>
            <p className="journey-description">
              {invalid
                ? 'Enter a valid birthday to open your personal historical archive.'
                : 'One calendar date. Countless lives, discoveries and moments that came before you.'}
            </p>
            <div className="journey-current" role="status" aria-live="polite" aria-atomic="true">
              <span className={'journey-current-icon' + (isError ? ' is-error' : '')}>
                {isError ? '!' : isReady ? '✓' : <span className="journey-activity" />}
              </span>
              <div>
                <strong>
                  {invalid ? 'Birthday needed' : isError ? 'Archive connection interrupted' : isReady ? 'Your discovery is ready' : 'Opening Wikipedia’s historical records'}
                </strong>
                <span>
                  {invalid ? 'Choose a date to continue.' : isError ? message : isReady ? 'Taking you to your stories…' : 'Finding documented events connected to ' + dateText + '.'}
                </span>
              </div>
            </div>
            <div className="journey-checklist" aria-label="Discovery status">
              <div className={"journey-check-row " + (!invalid ? "is-complete" : "")}><span><Check size={15}/></span><p>Birthday validated</p><small>01</small></div>
              <div className={'journey-check-row ' + (isReady ? 'is-complete' : isError ? 'is-error' : 'is-active')}>
                <span>{isReady ? <Check size={15}/> : <Globe2 size={16}/>}</span><p>Historical records</p><small>02</small>
              </div>
              <div className={'journey-check-row ' + (isReady ? 'is-complete' : '')}>
                <span>{isReady ? <Check size={15}/> : <BookOpen size={16}/>}</span><p>Your day in history</p><small>03</small>
              </div>
            </div>
            {isError ? (
              <div className="journey-actions">
                {birthday && <button className="button-primary" type="button" onClick={() => setAttempt(v => v + 1)}>
                  <RotateCcw size={17}/> Try again
                </button>}
                <Link href="/discover" className="button-secondary"><ArrowLeft size={16}/> Change birthday</Link>
              </div>
            ) : (
              <Link href="/discover" className="journey-back"><ArrowLeft size={15}/> Change birthday</Link>
            )}
          </section>
          <section className="journey-scene" aria-label={birthday ? 'Opening the historical archive for ' + dateText : 'Historical archive artwork'}>
            <div className="journey-scene-top"><span>THE DATE PORTAL</span><span>ARCHIVE Nº 01</span></div>
            <div className="journey-orbit-field" aria-hidden="true">
              <span className="journey-orbit orbit-outer" />
              <span className="journey-orbit orbit-middle" />
              <span className="journey-orbit orbit-inner" />
              <span className="journey-orbit-arc" />
              <span className="journey-spark spark-one">✳</span>
              <span className="journey-spark spark-two">✦</span>
              <span className="journey-spark spark-three">✧</span>
            </div>
            <div className="journey-date-card">
              <span>YOUR CALENDAR DAY</span>
              <strong>{day}</strong>
              <em>{month.toUpperCase()}</em>
              <span className="journey-date-rule" />
              <small>{birthday ? 'BORN ' + birthday.year : 'THE HUMAN ARCHIVE'}</small>
            </div>
            <div className="journey-scene-bottom">
              <span className="journey-trail" aria-hidden="true"><i/><i/><i/><i/><i/></span>
              <span>ONE DATE. MANY CENTURIES.</span>
              <CalendarDays size={19} strokeWidth={1.25}/>
            </div>
          </section>
        </div>
        <footer className="journey-footer">
          <span>AN EXPLORATION OF DOCUMENTED HISTORY</span>
          <span>WIKIPEDIA-SOURCED · NO PREDICTIONS <ArrowUpRight size={13}/></span>
        </footer>
      </main>
    </div>
  );
}

export default function SearchingPage() {
  return <Suspense fallback={<div className="site loading-state">Opening the archive…</div>}>
    <SearchingExperience />
  </Suspense>;
}
