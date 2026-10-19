'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { SiteHeader } from '@/components/v2/Brand';
import { useLanguage } from '@/components/v2/Language';
import { parseBirthday } from '@/lib/birthday';

function Searching() {
  const router = useRouter();
  const params = useSearchParams();
  const {lang, tr} = useLanguage();
  const date = params.get('date') || '';
  const birthday = parseBirthday(date);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!parseBirthday(date)) {
      setError(tr('Please choose a valid birth date.', 'सही जन्मतिथि चुनें।'));
      return;
    }
    const controller = new AbortController();
    setError('');
    async function checkDate() {
      try {
        // No historical story or premium metadata is ever returned to this route.
        const response = await fetch('/api/discover?date=' + encodeURIComponent(date) + '&lang=' + lang, {
          signal: controller.signal, cache: 'no-store'
        });
        const body = await response.json() as {ready?:boolean; error?:string};
        if (!response.ok || body.ready !== true)
          throw new Error(body.error || tr('Please try again shortly.', 'कृपया कुछ देर बाद फिर कोशिश करें।'));
        if (!controller.signal.aborted)
          router.replace('/unlock?date=' + encodeURIComponent(date));
      } catch (problem) {
        if (!controller.signal.aborted)
          setError(problem instanceof Error ? problem.message : tr('Try again.', 'फिर कोशिश करें।'));
      }
    }
    void checkDate();
    return () => controller.abort();
  }, [date, lang, attempt, router, tr]);
  const display = birthday ? new Date(Date.UTC(2000, birthday.month-1, birthday.day)).toLocaleDateString(
    lang === 'hi' ? 'hi-IN' : 'en-US', {day:'numeric',month:'long',timeZone:'UTC'}) : '—';
  return <div className="site scan2-page">
    <SiteHeader/>
    <main className="scan2-main shell" id="main-content">
      <div className="scan2-issue"><span>AREYOURARE / {tr('YOUR DATE', 'आपकी तारीख')}</span>
        <span>{tr('DISCOVERY', 'खोज')}</span></div>
      <div className="scan2-sheet">
        <div className="scan2-content">
          <span className="eyebrow">✳ {tr('A LOOK BACK IN TIME', 'इतिहास में एक झलक')}</span>
          <h1>{error ? tr("Couldn't check", 'खोज पूरी') : tr('Your date.', 'आपकी तारीख।')}<br/>
            <em>{error ? tr('this date.', 'नहीं हुई।') : tr('Our history.', 'हमारा इतिहास।')}</em>
          </h1>
          <p role={error ? 'alert' : 'status'}>{error || tr('Checking historical records for your calendar day.', 'आपकी तारीख का ऐतिहासिक रिकॉर्ड जाँचा जा रहा है।')}</p>
          {error ? <div className="scan2-actions">
            <button type="button" className="button-primary" onClick={() => setAttempt(n=>n+1)}>
              <RotateCcw size={16}/>{tr('Try again', 'फिर कोशिश करें')}</button>
            <Link href="/discover" className="button-secondary"><ArrowLeft size={16}/>{tr('Change date', 'तारीख बदलें')}</Link>
          </div> : <div className="scan2-loader" role="status" aria-label={tr('Checking historical records', 'इतिहास जाँच रहे हैं')}><span/></div>}
        </div>
        <div className="scan2-date">
          <span>{tr('YOUR CALENDAR DAY','आपका दिन')}</span>
          <strong>{display}</strong>
          <span>{birthday?.year || '—'}</span>
          <small>{tr('ONE DATE. STORIES WAITING TO BE DISCOVERED.', 'एक तारीख। अनेक अनकही कहानियाँ।')}</small>
        </div>
      </div>
      <div className="scan2-bottom">
        <span>{tr('NO PERSONAL PREDICTIONS', 'कोई व्यक्तिगत भविष्यवाणी नहीं')}</span>
        <Link href="/discover">{tr('Go back', 'वापस जाएँ')} <ArrowRight size={14}/></Link>
      </div>
    </main>
  </div>;
}
export default function SearchingPage() {
  return <Suspense fallback={<div className="site scan2-page"/>}><Searching/></Suspense>;
}
