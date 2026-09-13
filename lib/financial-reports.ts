import {type FarmEvent} from './farm-events.ts';
export function retainedEstimate(events:FarmEvent[],animalId:string,through:string){
 const rows=events.filter(e=>e.kind==='valuation'&&!e.voided&&e.date<=through&&e.animalIds.includes(animalId)).sort((a,b)=>b.date.localeCompare(a.date)||b.id.localeCompare(a.id));
 if(!rows.length)return null;
 const latest=rows[0];
 // Same-day competing valuations need review rather than an arbitrary winner.
 if(rows.some(e=>e.id!==latest.id&&e.date===latest.date))return {cents:null,date:latest.date,conflict:true};
 return {cents:latest.amountCents,date:latest.date,conflict:false};
}
export function monthlyCash(events:FarmEvent[],year:string){
 const totals=new Map<string,{month:string;income:number;expenses:number}>();
 for(const e of events){if(e.voided||!['income','expense'].includes(e.kind)||year!=='all'&&!e.date.startsWith(year))continue;const month=e.date.slice(0,7),row=totals.get(month)||{month,income:0,expenses:0};if(e.kind==='income')row.income+=e.amountCents||0;else row.expenses+=e.amountCents||0;totals.set(month,row);}
 return [...totals.values()].sort((a,b)=>a.month.localeCompare(b.month)).map(r=>({...r,net:r.income-r.expenses}));
}

export function retentionDecision(events:FarmEvent[],animalId:string,through:string){const rows=events.filter(e=>e.kind==='selection'&&!e.voided&&e.date<=through&&e.animalIds.includes(animalId)).sort((a,b)=>b.date.localeCompare(a.date));if(!rows.length)return 'Not recorded';if(rows.some(e=>e.id!==rows[0].id&&e.date===rows[0].date&&e.category!==rows[0].category))return 'Conflicting decisions';return rows[0].category;}
