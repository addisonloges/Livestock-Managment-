import {type FarmEvent,eventAllocation} from './farm-events.ts';
export const animalPurchaseCategory='Animal purchase';
export function purchaseBasis(events:FarmEvent[],animalId:string,through:string){
 const rows=events.filter(e=>!e.voided&&e.kind==='expense'&&e.category===animalPurchaseCategory&&e.date<=through&&e.animalIds.includes(animalId));
 return {recorded:rows.length>0,cents:rows.reduce((sum,e)=>sum+(eventAllocation(e).find(a=>a.id===animalId)?.cents||0),0),records:rows.map(e=>e.id)};
}
export function retainedEstimate(events:FarmEvent[],animalId:string,through:string){
 const rows=events.filter(e=>e.kind==='valuation'&&!e.voided&&e.date<=through&&e.animalIds.includes(animalId)).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
 if(!rows.length)return null;
 const latest=rows[0];
 // Same-day competing valuations need review rather than an arbitrary winner.
 if(rows.some(e=>e.id!==latest.id&&e.date===latest.date))return {cents:null,date:latest.date,conflict:true};
 return {cents:latest.amountCents,date:latest.date,conflict:false};
}
export function monthlyCash(events:FarmEvent[],year:string,animalIds?:Set<string>){
 const totals=new Map<string,{month:string;income:number;expenses:number}>();
 for(const e of events){if(e.voided||!['income','expense'].includes(e.kind)||year!=='all'&&!e.date.startsWith(year))continue;const assignments=eventAllocation(e);if(animalIds&&!assignments.some(a=>animalIds.has(a.id)))continue;const cents=animalIds?assignments.filter(a=>animalIds.has(a.id)).reduce((sum,a)=>sum+a.cents,0):e.amountCents||0;const month=e.date.slice(0,7),row=totals.get(month)||{month,income:0,expenses:0};if(e.kind==='income')row.income+=cents;else row.expenses+=cents;totals.set(month,row);}
 return [...totals.values()].sort((a,b)=>a.month.localeCompare(b.month)).map(r=>({...r,net:r.income-r.expenses}));
}

export function retentionDecision(events:FarmEvent[],animalId:string,through:string){const rows=events.filter(e=>e.kind==='selection'&&!e.voided&&e.date<=through&&e.animalIds.includes(animalId)).sort((a,b)=>b.date.localeCompare(a.date));if(!rows.length)return 'Not recorded';if(rows.some(e=>e.id!==rows[0].id&&e.date===rows[0].date&&e.category!==rows[0].category))return 'Conflicting decisions';return rows[0].category;}
