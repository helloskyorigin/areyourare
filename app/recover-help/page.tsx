import Link from 'next/link';
import { ArrowLeft, Mail, ShieldCheck } from 'lucide-react';
import { SiteFooter, SiteHeader } from '@/components/v2/Brand';
export const metadata = {
  title:'Report recovery — AREYOURARE',
  robots:{index:false,follow:false}
};
export default function RecoverHelp() {
  return <div className="site"><SiteHeader/><main className="shell return-page" id="main-content">
    <div className="return-card">
      <div className="eyebrow"><ShieldCheck size={17}/> PRIVATE REPORT ACCESS</div>
      <h1>This recovery link <em>cannot be used.</em></h1>
      <p>It may be expired, incomplete, or related to a refunded payment. Recovery links are private and are verified against Dodo Payments before your archive opens.</p>
      <p>If you paid successfully, please contact support using the email from checkout and your receipt or invoice ID. Never send passwords or card details.</p>
      <div className="return-actions"><a className="button-primary" href="mailto:hello.skyorigin@gmail.com?subject=AREYOURARE%20report%20recovery"><Mail size={17}/> Contact support</a>
        <Link className="button-secondary" href="/"><ArrowLeft size={16}/> Home</Link></div>
    </div>
  </main><SiteFooter/></div>;
}
