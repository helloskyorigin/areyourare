'use client';
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Clock3, CreditCard, LoaderCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { parseBirthday } from '@/lib/birthday';
import { useLanguage } from '@/components/v2/Language';
import { SiteHeader, SiteFooter } from '@/components/v2/Brand';
import type { PurchaseState } from '@/lib/payments';

function PaymentReturn() {
  const {tr,lang}=useLanguage();
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
        <span className="eyebrow"><ShieldCheck size={15}/> {tr('SECURE PAYMENT VERIFICATION','सुरक्षित भुगतान की पुष्टि')}</span>
        <h1>{state==='paid'?tr('Your Time Capsule is unlocked.','आपकी पूरी रिपोर्ट खुल गई है।'):
 state==='pending'?tr('Confirming your payment…','भुगतान की पुष्टि हो रही है…'):
 state==='failed'?tr('Payment was not completed.','भुगतान पूरा नहीं हुआ।'):
 state==='cancelled'?tr('Checkout was cancelled.','भुगतान रद्द हो गया।'):
 state==='not_started'?tr('Your payment session was not found.','आपका भुगतान सत्र नहीं मिला।'):
 state==='unavailable'?tr('Verification is taking longer.','पुष्टि में थोड़ा समय लग रहा है।'):
 state==='misconfigured'?tr('Checkout is not ready.','भुगतान अभी तैयार नहीं है।'):
 tr('This payment was refunded.','इस भुगतान का रिफंड हो चुका है।')}</h1>
        <p>{isPaid ? tr("Your payment was verified directly with Dodo Payments. Taking you to your archive…","आपका भुगतान सुरक्षित रूप से सत्यापित हो गया है। आपकी पूरी रिपोर्ट खुल रही है…")
          : state==='pending' ? tr("Payment confirmation can take a moment. Please keep this tab open; we are checking the provider, not trusting a URL parameter.","भुगतान की पुष्टि में कुछ समय लग सकता है। कृपया यह टैब खुला रखें।")
          : state==='unavailable' ? tr("We could not confirm the payment right now. You will not be charged again by using Retry verification.","भुगतान की पुष्टि अभी नहीं हो पा रही है। पुष्टि दोबारा जाँचने से नया भुगतान नहीं होगा।")
          : state==='refunded' ? tr("This purchase is no longer active. Contact support if you believe this is incorrect.","यह खरीद अब सक्रिय नहीं है। गलती लगती है तो सहायता से संपर्क करें।")
          : state==='misconfigured' ? tr("The payment system is not currently configured for purchases. No premium content was unlocked.","भुगतान सुविधा अभी उपलब्ध नहीं है। प्रीमियम रिपोर्ट नहीं खोली गई है।")
          : state==='failed'||state==='cancelled' ? tr("Your report remains safe on the free results page. You can choose whether to start a new checkout.","आपकी मुफ़्त कहानी सुरक्षित है। चाहें तो दोबारा भुगतान शुरू कर सकते हैं।")
          : tr("No matching checkout was found in this browser. Open the link in the same browser used for payment, or contact support with your receipt.","इस ब्राउज़र में भुगतान का रिकॉर्ड नहीं मिला। भुगतान वाले ब्राउज़र में खोलें या रसीद के साथ सहायता लें।")}</p>
        {birth&&<div className="return-record"><span>{tr("TIME CAPSULE","टाइम कैप्सूल")}</span><strong>{new Date(Date.UTC(2000,birth.month-1,birth.day)).toLocaleDateString(lang==='hi'?'hi-IN':'en-US',{month:'long',day:'numeric',timeZone:'UTC'})} · {birth.year}</strong></div>}
        {checking&&!isPaid&&!error&&<p className="return-wait"><Clock3 size={15}/> {tr('Secure confirmation in progress…','सुरक्षित पुष्टि जारी है…')}</p>}
        <div className="return-actions">
          {!isPaid && (timedOut||error) && birth && <button type="button" className="button-primary" onClick={()=>setAttempt(n=>n+1)}>
            <RefreshCw size={16}/> {tr('Retry verification','फिर से पुष्टि जाँचें')}
          </button>}
          {isPaid&&birth&&<Link className="button-primary" href={'/capsule?date='+encodeURIComponent(date)}>
            {tr('Open my Time Capsule','मेरी टाइम कैप्सूल खोलें')} <ArrowRight size={17}/>
          </Link>}
          {birth&&<Link className="button-secondary" href={'/result?date='+encodeURIComponent(date)}>
            <ArrowLeft size={15}/> {tr('Back to my discovery','मेरी खोज पर वापस जाएँ')}
          </Link>}
          {!birth&&<Link className="button-secondary" href="/discover">{tr("Enter birthday","जन्मतिथि दर्ज करें")} <ArrowRight size={15}/></Link>}
        </div>
        <p className="return-support">{tr("Need help?","मदद चाहिए?")} <a href="mailto:hello.skyorigin@gmail.com?subject=AREYOURARE%20payment%20help">{tr("Contact payment support","भुगतान सहायता")}</a>. {tr("Never share your card number.","अपना कार्ड नंबर कभी साझा न करें।")}</p>
      </div>
    </main>
    <SiteFooter/></div>;
}
export default function PaymentReturnPage(){
  return <Suspense fallback={<div className="site loading-state">AREYOURARE</div>}><PaymentReturn/></Suspense>;
}
