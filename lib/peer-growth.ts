import type {Animal,Weight} from './livestock.ts';
import type {FarmEvent} from './farm-events.ts';
import {ageDays} from './adjusted-growth.ts';
export function membershipCovers(events:FarmEvent[],groupId:string,animalId:string,start:string,end:string){
 const periods=events.filter(e=>!e.voided&&e.kind==='management'&&e.management?.groupId===groupId&&e.animalIds.includes(animalId)).map(e=>({start:e.date,end:e.management!.endDate||'9999-12-31'})).sort((a,b)=>a.start.localeCompare(b.start));
 let through='';
 for(const p of periods){if(p.end<start)continue;if(!through){if(p.start>start)return false;through=p.end}else if(Date.parse(p.start)-Date.parse(through)<=86400000){if(p.end>through)through=p.end}else return false;if(through>=end)return true;}
 return false;
}
export function compareGrowth(animals:Animal[],weights:Weight[],options:{from:string;to:string;minAge:number|null;maxAge:number|null;groupId:string},events:FarmEvent[]){
 const rows=animals.map(animal=>{const measured=weights.filter(w=>w.animalId===animal.id&&!w.voided&&w.date>=options.from&&w.date<=options.to).filter(w=>{const age=ageDays(animal.dob||'',w.date);return (options.minAge===null||age!==null&&age>=options.minAge)&&(options.maxAge===null||age!==null&&age<=options.maxAge)}).sort((a,b)=>a.date.localeCompare(b.date));const first=measured[0],last=measured.at(-1);if(!first||!last||first.date===last.date)return null;const days=(Date.parse(last.date)-Date.parse(first.date))/86400000;if(options.groupId&&!membershipCovers(events,options.groupId,animal.id,first.date,last.date))return null;return {animal,first,last,days,age:ageDays(animal.dob||'',last.date),adg:(last.pounds-first.pounds)/days};}).filter((r):r is NonNullable<typeof r>=>!!r).sort((a,b)=>b.adg-a.adg||a.animal.id.localeCompare(b.animal.id));
 const mean=rows.length?rows.reduce((s,r)=>s+r.adg,0)/rows.length:null;
 return {mean,rows:rows.map((r,i)=>({...r,rank:rows.findIndex(x=>Math.abs(x.adg-r.adg)<1e-10)+1,ratio:mean!==null&&mean>0?r.adg/mean*100:null})),excluded:animals.length-rows.length};
}
