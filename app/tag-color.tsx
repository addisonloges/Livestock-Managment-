import {tagSlots} from '@/lib/tag-records';
import {type Animal} from '@/lib/livestock';
export function tagColor(a:Animal,field:'rightTag'|'leftTag'){try{return a[field]?JSON.parse(a.pedigreeInfo||'{}')[field+'Color']||'':''}catch{return ''}}
const colors:Record<string,string>={yellow:'#facc15',blue:'#2563eb',white:'#ffffff',black:'#111827',red:'#dc2626',green:'#16a34a',orange:'#f97316',purple:'#9333ea',pink:'#ec4899',brown:'#92400e',gray:'#6b7280',grey:'#6b7280'};
export default function TagColor({animal,field}:{animal:Animal;field:'rightTag'|'leftTag'}){const color=tagColor(animal,field);return color?<span className="sub"><span aria-hidden="true" style={{display:'inline-block',width:12,height:12,border:'1px solid #64748b',borderRadius:3,marginRight:5,backgroundColor:colors[color.toLowerCase()]||'transparent'}}/>{color}</span>:null;}

export function ExtraTags({animal,ear}:{animal:Animal;ear:'Right'|'Left'}){return <>{tagSlots(animal).filter(t=>t.id.startsWith('extra:')&&t.ear===ear&&t.number).map(t=><span className="sub" key={t.id}>{t.number} · {t.color}</span>)}</>;}
