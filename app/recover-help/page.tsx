'use client';
import Link from 'next/link';
import { ArrowLeft,Mail,ShieldCheck } from 'lucide-react';
import { SiteHeader,SiteFooter } from '@/components/v2/Brand';
import { useLanguage } from '@/components/v2/Language';
export default function RecoverHelp(){
 const {tr}=useLanguage();
 return <div className="site"><SiteHeader/><main className="shell return-page" id="main-content">
  <div className="return-card"><div className="eyebrow"><ShieldCheck size={17}/>{tr('PRIVATE REPORT ACCESS','निजी रिपोर्ट का एक्सेस')}</div>
   <h1>{tr('This recovery link cannot be used.','यह रिकवरी लिंक काम नहीं कर रहा है।')}</h1>
   <p>{tr('The link may be expired, incomplete or associated with a refunded purchase. Every recovery is verified with the payment provider.','लिंक समाप्त, अधूरा या रिफंड की गई खरीद से जुड़ा हो सकता है। हर रिकवरी की भुगतान सेवा से जाँच होती है।')}</p>
   <p>{tr('If you paid successfully, contact support with your checkout receipt. Never share card details or passwords.','भुगतान सफल हुआ था तो अपनी रसीद के साथ सहायता लें। कार्ड नंबर और पासवर्ड न भेजें।')}</p>
   <div className="return-actions">
    <a className="button-primary" href="mailto:hello.skyorigin@gmail.com?subject=AREYOURARE%20report%20recovery"><Mail size={17}/>{tr('Contact support','सहायता लें')}</a>
    <Link className="button-secondary" href="/"><ArrowLeft size={16}/>{tr('Back home','मुख्य पेज पर जाएँ')}</Link>
   </div>
  </div>
 </main><SiteFooter/></div>;
}
