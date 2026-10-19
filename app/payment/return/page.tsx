'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Clock3, CreditCard, LoaderCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { parseBirthday, prettyDate } from '@/lib/birthday';
import { SiteHeader, SiteFooter } from '@/components/v2/Brand';
import type { PurchaseState } from '@/lib/payments';

const titleByState:Record<PurchaseState,string>={
  paid:'Your Time Capsule is unlocked.',
  pending:'Confirming your payment.',
  failed:'The payment was not completed.',
  cancelled:'Checkout was cancelled.',
  not_started:'Your purchase session was not found.',
  unavailable:'Verification is taking longer.',
  misconfigured:'Checkout is not ready yet.',
  refunded:'This payment has been refunded.',
};

function PaymentReturn() {
  const params=useSearchParams();
  const router=useRouter();
  const date=params.get('date')||'';
  const birth=parseBirthday(date);
  const [state,setState]=useState<PurchaseState>('pending');
  const [checking,setChecking]=useState(true);
  const [attempt,setAttempt]=useState(0);
  const [timedOut,setTimedOut]=useState(false);
  useEffect(()=>{
    if (!birth){setState('not_started');setChecking(false);return;}
    const ctrl=new AbortController();
    let timeout:ReturnType<typeof setTimeout>|undefined;
    let checks=0;
    async function verify(){
      if(ctrl.signal.aborted)return;
      setChecking(true);
      try {
        const response=await fetch('/api/payment-status?date='+encodeURIComponent(date),{
          cache:'no-store',signal:ctrl.signal
        });
        const data=await response.json() as {paid?:boolean;state?:PurchaseState};
        if (ctrl.signal.aborted)return;
        const current= data.paid===true ? 'paid' : data.state||'unavailable';
        setState(current);
        if (current==='paid'){
          router.replace('/capsule?date='+encodeURIComponent(date));
          return;
        }
        if ((current==='pending'||current==='unavailable') && checks<13){
          checks++;
          timeout=setTimeout(verify,2400);
        } else {
          setChecking(false);
          setTimedOut(current==='pending'||current==='unavailable');
        }
      } catch {
        if(ctrl.signal.aborted)return;
        setState('unavailable');
        if(checks++<13)timeout=setTimeout(verify,2400);
        else{setTimedOut(true);setChecking(false);}
      }
    }
    setTimedOut(false);
    void verify();
    return()=>{ctrl.abort();if(timeout)clearTimeout(timeout);};
  },[date,attempt,router,birth?.iso]);

  const error=['failed','cancelled','not_started','misconfigured','refunded'].includes(state);
  const isPaid=state==='paid';
  return <div className="site"><SiteHeader/>
    <main className="return-page shell" id="main-content">
      <div className="return-card">
        <div className="return-symbol" aria-hidden="true">
          {isPaid?<Check size={37}/>:error?<CreditCard size={35}/>:<LoaderCircle size={35} className={checking?'spin':''}/>}
        </div>
        <span className="eyebrow"><ShieldCheck size={15}/> SECURE PAYMENT VERIFICATION</span>
        <h1>{titleByState[state].split(' ').slice(0,-1).join(' ')} <em>{titleByState[state].split(' ').at(-1)}</em></h1>
        <p>{isPaid ? 'Your payment was verified directly with Dodo Payments. Taking you to your archive…'
          : state==='pending' ? 'Payment confirmation can take a moment. Please keep this tab open; we are checking the provider, not trusting a URL parameter.'
          : state==='unavailable' ? 'We could not confirm the payment right now. You will not be charged again by using Retry verification.'
          : state==='refunded' ? 'This purchase is no longer active. Contact support if you believe this is incorrect.'
          : state==='misconfigured' ? 'The payment system is not currently configured for purchases. No premium content was unlocked.'
          : state==='failed'||state==='cancelled' ? 'Your report remains safe on the free results page. You can choose whether to start a new checkout.'
          : 'No matching checkout was found in this browser. Open the link in the same browser used for payment, or contact support with your receipt.'}</p>
        {birth&&<div className="return-record"><span>TIME CAPSULE</span><strong>{prettyDate(birth)} · {birth.year}</strong></div>}
        {checking&&!isPaid&&!error&&<p className="return-wait"><Clock3 size={15}/> Secure confirmation in progress…</p>}
        <div className="return-actions">
          {!isPaid && (timedOut||error) && birth && <button type="button" className="button-primary" onClick={()=>setAttempt(n=>n+1)}>
            <RefreshCw size={16}/> Retry verification
          </button>}
          {isPaid&&birth&&<Link className="button-primary" href={'/capsule?date='+encodeURIComponent(date)}>
            Open my Time Capsule <ArrowRight size={17}/>
          </Link>}
          {birth&&<Link className="button-secondary" href={'/result?date='+encodeURIComponent(date)}>
            <ArrowLeft size={15}/> Back to my discovery
          </Link>}
          {!birth&&<Link className="button-secondary" href="/discover">Enter birthday <ArrowRight size={15}/></Link>}
        </div>
        <p className="return-support">Need help? <a href="mailto:hello.skyorigin@gmail.com?subject=AREYOURARE%20payment%20help">Contact payment support</a>. Never share your card number.</p>
      </div>
    </main>
    <SiteFooter/></div>;
}
export default function PaymentReturnPage(){
  return <Suspense fallback={<div className="site loading-state">Checking payment…</div>}><PaymentReturn/></Suspense>;
}
