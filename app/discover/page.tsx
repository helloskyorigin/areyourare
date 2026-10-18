import { SiteHeader,SiteFooter } from '@/components/v2/Brand';
import { BirthdayForm } from '@/components/v2/BirthdayForm';
export default function DiscoverPage() { return <div className="site"><SiteHeader/><main className="discover-center shell">
 <span className="eyebrow">✳ YOUR HISTORY AWAITS</span><h1>When did your <em>story begin?</em></h1>
 <p>Enter your birthday. We'll discover the historical moments and remarkable people connected to your date.</p>
 <BirthdayForm compact/><span className="discover-decoration" aria-hidden="true">✳</span>
 </main><SiteFooter/></div>; }
