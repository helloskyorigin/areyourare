import { ArrowUpRight, Calendar } from 'lucide-react';
import type { HistoricalMoment } from '@/lib/history';
export function MomentCard({moment,index=1}:{moment:HistoricalMoment;index?:number}) {
  return <article className="moment-card">
    <div className="moment-top"><span>NO. {String(index).padStart(2,'0')}</span><span>{moment.year}</span></div>
    <span className="moment-star">✳</span>
    <h3>{moment.title}</h3><p>{moment.text}</p>
    {moment.source && <a target="_blank" rel="noopener noreferrer" href={moment.source}>Original Wikipedia story <ArrowUpRight size={15}/></a>}
    <div className="moment-bottom"><Calendar size={14}/> DOCUMENTED HISTORY</div>
  </article>;
}
