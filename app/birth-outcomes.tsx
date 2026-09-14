"use client";
import {useState} from 'react';
import {birthOutcomes} from '@/lib/birth-outcomes';
import {label,type Animal} from '@/lib/livestock';
import type {Litter} from '@/lib/lambing';
import {Button} from '@/components/ui/button';
export default function BirthOutcomes({animals,litters,species,year}:{animals:Animal[];litters:Litter[];species:string;year:string}){
 const [days,setDays]=useState(7);const today=new Date().toISOString().slice(0,10),through=year==='all'?today:year+'-12-31'<today?year+'-12-31':today,rows=birthOutcomes(litters,animals,species,year,through,days);
 const parent=(id:string)=>{const a=animals.find(a=>a.id===id);return a?label(a):'Unknown'};
 const headings=['Birth date','Dam','Born alive','Stillborn',`Deaths before ${days} days`,'Death date unknown','Missing profiles','Assistance'];
 const data=rows.map(r=>[r.date,parent(r.damId),r.bornAlive,r.stillborn,r.deaths,r.unknownDates,r.missingProfiles,r.assistance||'Not recorded']);
 function download(){const escape=(v:unknown)=>'"'+String(v).replace(/^[=+@-]/,"'$&").replaceAll('"','""')+'"',url=URL.createObjectURL(new Blob([[headings,...data].map(r=>r.map(escape).join(',')).join('\r\n')],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`birth-outcomes-${species}-${year}.csv`;a.click();URL.revokeObjectURL(url)}
 return <section className="my-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3>Birth & early-life outcomes</h3><p className="hint">Recorded litters through {through}. This view covers all litters for the selected species and birth year.</p></div><Button variant="outline" onClick={download}>Export birth outcomes</Button></div><label className="flex items-center gap-2 my-3">Review deaths before age<select className="border rounded p-2" value={days} onChange={e=>setDays(Number(e.target.value))}>{[7,14,30,60,90].map(n=><option key={n} value={n}>{n} days</option>)}</select></label><p className="hint">Stillbirths are separate from deaths after a live birth. Only dated death events within the selected age window count. Unknown dates and missing profiles remain visible; no survival or mortality rate is inferred from incomplete follow-up. Animal filters above do not narrow this litter report.</p>{rows.length?<div className="overflow-x-auto"><table className="w-full"><thead><tr>{headings.map(h=><th className="text-left p-2" key={h}>{h}</th>)}</tr></thead><tbody>{data.map((row,i)=><tr className="border-b" key={rows[i].id}>{row.map((v,j)=><td className="p-2" key={j}>{v}</td>)}</tr>)}</tbody></table></div>:<p>No recorded litters in this view.</p>}</section>
}
