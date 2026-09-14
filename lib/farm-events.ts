import {type GrowthBudget,validateGrowthBudget} from './growth-budget.ts';
import {validDate,type Animal} from './livestock.ts';
import {isUuid} from './lambing.ts';
export const eventKinds=['note','rearing','weaning','condition','expense','income','valuation','reminder','treatment','stock','management','ration','lab','evaluation','growthplan','selection','watch'] as const;
export type DoseState='Scheduled'|'Given'|'Skipped';
export type TreatmentDose={date:string;amount:number;unit:string;state:DoseState;states?:Record<string,DoseState>;overrides?:Record<string,number>};
export type FarmEvent={watch?:{resolvedDate:string};feedAllocation?:import('./feed-allocation.ts').FeedSnapshot;id:string;version:number;kind:typeof eventKinds[number];species:string;date:string;animalIds:string[];title:string;notes:string;amountCents:number|null;category:string;dueDate:string;voided?:boolean;attachments?:{id:string;name:string;type:string;size:number;uploadedAt:string;removedAt?:string}[];counterparty?:{id:string;name:string};sale?:{buyer:string;disposition:'Sold'|'Transferred';exitReason:string;cullReason:string};saleStatusIds?:string[];allocations?:Record<string,number>;lab?:{laboratory:string;results:Record<string,{value:string;unit:string;reference:string}>};rearing?:{fosterDamId:string;numberReared:number|null};growth?:GrowthBudget;ration?:{stage?:string;source?:string;feedingLb:number|null;ingredients:{name:string;pounds:number;pricePerTon:number|null}[]};management?:{groupId:string;endDate:string};weaningWeights?:Record<string,{value:number;unit:'lb'|'kg'}>;weightIds?:string[];stock?:{quantity:number;unit:string;expires:string;lowAt:number|null;minimumIntervalDays?:number|null;maximumDose?:number|null;warningReference?:string};protocol?:{lotId?:string;product:string;route:string;reference:string;withdrawalEnd:string;doses:TreatmentDose[]}};
export function validateEvent(e:FarmEvent,animals:Animal[]){
 if(!isUuid(e.id)||!eventKinds.includes(e.kind)||!['Sheep','Goats'].includes(e.species)||!validDate(e.date))throw Error('Choose a valid event type, species and date.');
 if(!['reminder','growthplan','ration'].includes(e.kind)&&e.date>new Date().toISOString().slice(0,10))throw Error('Actual events cannot be in the future.');
 if(typeof e.title!=='string'||!e.title.trim()||e.title.length>200||typeof e.notes!=='string'||e.notes.length>4000||typeof e.category!=='string'||e.category.length>100)throw Error('Enter a title up to 200 characters and notes up to 4000.');
 if(!Array.isArray(e.animalIds)||e.animalIds.length>200||new Set(e.animalIds).size!==e.animalIds.length)throw Error('Select distinct animals (up to 200).');
 if(['rearing','weaning','condition','valuation','management','selection','watch'].includes(e.kind)&&!e.animalIds.length)throw Error('Select at least one animal.');
 for(const id of e.animalIds){const a=animals.find(a=>a.id===id);if(!a||a.species!==e.species||a.pedigreeOnly||a.firstYear>Number(e.date.slice(0,4))||a.dob&&a.dob>e.date)throw Error('Event animals must belong to this species and be recorded by the event date.');}
 if(['expense','income','valuation'].includes(e.kind)){if(!Number.isSafeInteger(e.amountCents)||e.amountCents!<0||e.amountCents!>1e10)throw Error('Enter a nonnegative amount with at most two decimals.');}else if(e.amountCents!==null)throw Error('Amounts belong only to income, expenses or valuations.');
 if(e.allocations){if(!['expense','income'].includes(e.kind)||typeof e.allocations!=='object'||Array.isArray(e.allocations)||Object.keys(e.allocations).length!==e.animalIds.length||Object.entries(e.allocations).some(([id,n])=>!e.animalIds.includes(id)||!Number.isSafeInteger(n)||n<0)||Object.values(e.allocations).reduce((a,b)=>a+b,0)!==e.amountCents)throw Error('Individual allocations must cover the selected animals and equal the total exactly.');}
 if(e.counterparty&&(!['expense','income'].includes(e.kind)||!isUuid(e.counterparty.id)||typeof e.counterparty.name!=='string'||!e.counterparty.name.trim()||e.counterparty.name.length>200))throw Error('Choose a valid payee or payer contact.');
 if(e.sale&&(e.kind!=='income'||!e.animalIds.length||typeof e.sale.buyer!=='string'||e.sale.buyer.length>200||!['Sold','Transferred'].includes(e.sale.disposition)||typeof e.sale.exitReason!=='string'||e.sale.exitReason.length>200||typeof e.sale.cullReason!=='string'||e.sale.cullReason.length>200||e.sale.exitReason==='Cull'&&!e.sale.cullReason.trim()))throw Error('Enter valid sale details and a cull reason when applicable.');
 if(e.kind==='condition'&&(!Number.isFinite(Number(e.category))||Number(e.category)<1||Number(e.category)>5))throw Error('Body condition score must be from 1 to 5.');
 if(e.kind==='watch'&&(!e.category.trim()||!e.watch||typeof e.watch.resolvedDate!=='string'||e.watch.resolvedDate&&(!validDate(e.watch.resolvedDate)||e.watch.resolvedDate<e.date||e.watch.resolvedDate>new Date().toISOString().slice(0,10))))throw Error('Enter a flag category and a valid optional resolution date.');
 if(e.kind==='selection'&&!['Retain','Market / sell','Undecided'].includes(e.category))throw Error('Choose a retention or marketing decision.');
 if(e.kind==='rearing'&&!['Dam-raised','Bottle-raised','Fostered','Other'].includes(e.category))throw Error('Choose a rearing method.');
 if(e.rearing){const r=e.rearing;if(e.kind!=='rearing'||typeof r.fosterDamId!=='string'||r.numberReared!==null&&(!Number.isInteger(r.numberReared)||r.numberReared<1))throw Error('Enter a valid optional number reared.');if(r.fosterDamId){const dam=animals.find(a=>a.id===r.fosterDamId);if(!dam||dam.sex!=='Female'||dam.species!==e.species||dam.pedigreeOnly||dam.firstYear>Number(e.date.slice(0,4))||e.animalIds.includes(dam.id)||dam.dob&&dam.dob>=e.date)throw Error('Choose a recorded female of this species as foster dam.');if(e.category!=='Fostered')throw Error('A foster dam belongs to a Fostered rearing event.');}}
 if(e.dueDate&&(!validDate(e.dueDate)||e.dueDate<e.date))throw Error('Follow-up date must be on or after the event date.');
 if(['lab','evaluation'].includes(e.kind)){const l=e.lab;if(!e.animalIds.length||!l||typeof l.laboratory!=='string'||l.laboratory.length>200||!l.results||Array.isArray(l.results)||typeof l.results!=='object')throw Error('Choose animals and enter result details.');if(e.kind==='evaluation'&&!l.laboratory.trim())throw Error('Record the evaluation provider/source.');for(const [id,r] of Object.entries(l.results))if(!e.animalIds.includes(id)||!r||typeof r.value!=='string'||r.value.length>200||typeof r.unit!=='string'||r.unit.length>50||typeof r.reference!=='string'||r.reference.length>500)throw Error('Lab results must match selected animals and contain valid text.');}
 if(e.kind==='growthplan')validateGrowthBudget(e.growth!);
 if(e.kind==='ration'){const r=e.ration;if(!r||r.stage!==undefined&&(typeof r.stage!=='string'||r.stage.length>100)||r.source!==undefined&&(typeof r.source!=='string'||r.source.length>1000)||!Array.isArray(r.ingredients)||!r.ingredients.length||r.ingredients.length>20||r.feedingLb!==null&&(!Number.isFinite(r.feedingLb)||r.feedingLb<=0)||r.ingredients.some(i=>typeof i.name!=='string'||!i.name.trim()||i.name.length>200||!Number.isFinite(i.pounds)||i.pounds<=0||i.pounds>1e8||i.pricePerTon!==null&&(!Number.isFinite(i.pricePerTon)||i.pricePerTon<0||i.pricePerTon>1e8)))throw Error('Enter ingredient names, positive pounds and nonnegative prices per US ton.');}
 if(e.kind==='management'&&(!e.management||!isUuid(e.management.groupId)||e.management.endDate&&(!validDate(e.management.endDate)||e.management.endDate<e.date)))throw Error('Choose a management group and an optional end date on or after its start.');
 if(e.weaningWeights){if(e.kind!=='weaning'||typeof e.weaningWeights!=='object'||Array.isArray(e.weaningWeights))throw Error('Measurements belong to weaning events.');for(const [id,w] of Object.entries(e.weaningWeights))if(!e.animalIds.includes(id)||!w||!Number.isFinite(w.value)||w.value<=0||w.value>10000||!['lb','kg'].includes(w.unit))throw Error('Enter positive measurements for selected animals.');}
 if(e.kind==='stock'){const s=e.stock;if(!s||!Number.isFinite(s.quantity)||s.quantity<0||s.quantity>1e9||typeof s.unit!=='string'||!s.unit.trim()||s.unit.length>30||s.expires&&!validDate(s.expires)||s.lowAt!==null&&(!Number.isFinite(s.lowAt)||s.lowAt<0))throw Error('Enter a valid opening quantity, unit, expiration and optional low-stock threshold.');for(const n of [s.minimumIntervalDays,s.maximumDose])if(n!==undefined&&n!==null&&(!Number.isFinite(n)||n<=0))throw Error('Warning limits must be positive when provided.');if(s.warningReference!==undefined&&(typeof s.warningReference!=='string'||s.warningReference.length>1000))throw Error('Warning source must be text up to 1000 characters.');if((s.minimumIntervalDays||s.maximumDose)&&!s.warningReference?.trim())throw Error('Record the source for product-specific warning limits.');}
 if(e.kind==='treatment'){
  const p=e.protocol;if(!e.animalIds.length||!p||typeof p.product!=='string'||!p.product.trim()||p.product.length>200||typeof p.route!=='string'||p.route.length>100||typeof p.reference!=='string'||p.reference.length>1000)throw Error('Select animals and enter the treatment product and reference details.');
  if(p.withdrawalEnd&&(!validDate(p.withdrawalEnd)||p.withdrawalEnd<e.date))throw Error('Withdrawal end must be on or after treatment start.');
  if(!Array.isArray(p.doses)||!p.doses.length||p.doses.length>100)throw Error('Enter 1–100 scheduled doses.');
  for(const d of p.doses)if(!validDate(d.date)||d.date<e.date||!Number.isFinite(d.amount)||d.amount<=0||d.amount>100000||typeof d.unit!=='string'||!d.unit.trim()||d.unit.length>30||!['Scheduled','Given','Skipped'].includes(d.state)||d.state==='Given'&&d.date>new Date().toISOString().slice(0,10))throw Error('Each dose needs a valid date, positive amount, unit and state. Future doses cannot be marked Given.');
  for(const d of p.doses)if(d.states){if(typeof d.states!=='object'||Array.isArray(d.states)||Object.entries(d.states).some(([id,state])=>!e.animalIds.includes(id)||!['Scheduled','Given','Skipped'].includes(state)||state==='Given'&&d.date>new Date().toISOString().slice(0,10)))throw Error('Individual dose states must belong to selected animals; future doses cannot be given.');}
  for(const d of p.doses)if(d.overrides){if(typeof d.overrides!=='object'||Array.isArray(d.overrides))throw Error('Invalid individual doses.');for(const [id,amount] of Object.entries(d.overrides))if(!e.animalIds.includes(id)||!Number.isFinite(amount)||amount<=0||amount>100000)throw Error('Individual doses must be positive amounts for selected animals.');}
 }
}
export function allocation(cents:number,ids:string[]){const sorted=[...ids].sort(),base=Math.floor(cents/sorted.length),remainder=cents%sorted.length;return sorted.map((id,i)=>({id,cents:base+(i<remainder?1:0)}));}
export function animalExpenses(events:FarmEvent[],animalId:string,year?:string){return events.filter(e=>e.kind==='expense'&&!e.voided&&(!year||year==='all'||e.date.startsWith(year))).reduce((sum,e)=>sum+(eventAllocation(e).find(a=>a.id===animalId)?.cents||0),0)}

export function animalIncome(events:FarmEvent[],animalId:string,year?:string){return events.filter(e=>e.kind==='income'&&!e.voided&&(!year||year==='all'||e.date.startsWith(year))).reduce((sum,e)=>sum+(eventAllocation(e).find(a=>a.id===animalId)?.cents||0),0)}
export function cashSummary(events:FarmEvent[],year='all'){
 const included=events.filter(e=>!e.voided&&(year==='all'||e.date.startsWith(year)));
 const income=included.filter(e=>e.kind==='income').reduce((s,e)=>s+(e.amountCents||0),0);
 const expenses=included.filter(e=>e.kind==='expense').reduce((s,e)=>s+(e.amountCents||0),0);
 return {income,expenses,net:income-expenses};
}

export function lotBalance(lot:FarmEvent,events:FarmEvent[],through='9999-12-31'){
 if(lot.kind!=='stock'||!lot.stock||lot.voided)return null;
 let used=0;
 for(const e of events.filter(e=>!e.voided&&e.kind==='treatment'&&e.protocol?.lotId===lot.id))for(const dose of e.protocol!.doses)if(dose.date<=through&&dose.unit.trim().toLowerCase()===lot.stock.unit.trim().toLowerCase())used+=e.animalIds.reduce((n,id)=>n+(doseState(dose,id)==='Given'?(dose.overrides?.[id]??dose.amount):0),0);
 return {used,remaining:lot.stock.quantity-used};
}

export function doseState(dose:TreatmentDose,animalId:string):DoseState{return dose.states?.[animalId]||dose.state;}
export function treatmentWarnings(event:FarmEvent,events:FarmEvent[]){
 if(!event.protocol)return [];
 const lot=events.find(e=>e.id===event.protocol!.lotId&&!e.voided),warnings:string[]=[];
 const doses=event.protocol.doses.filter(d=>event.animalIds.some(id=>doseState(d,id)!=='Skipped'));
 if(event.protocol.withdrawalEnd&&doses.some(d=>d.date>event.protocol!.withdrawalEnd))warnings.push('The recorded withdrawal end is before a dose date. Review the dates and instruction source.');
 if(lot?.stock?.expires&&doses.some(d=>d.date>lot.stock!.expires))warnings.push('A dose falls after this lot’s recorded expiration date.');
 if(lot?.stock?.maximumDose&&doses.some(d=>event.animalIds.some(id=>doseState(d,id)!=='Skipped'&&(d.overrides?.[id]??d.amount)>lot.stock!.maximumDose!)))warnings.push('An amount exceeds this lot’s recorded review limit. Check the instruction source.');
 let tooClose=false,duplicate=false;const interval=lot?.stock?.minimumIntervalDays;
 for(const id of event.animalIds){const own=doses.filter(d=>doseState(d,id)!=='Skipped');const other=events.filter(e=>e.id!==event.id&&!e.voided&&e.protocol?.product.trim().toLowerCase()===event.protocol!.product.trim().toLowerCase()&&e.animalIds.includes(id)).flatMap(e=>e.protocol!.doses.filter(d=>doseState(d,id)!=='Skipped'));
  for(let i=0;i<own.length;i++)for(const o of [...own.slice(i+1),...other]){const days=Math.abs(Date.parse(own[i].date)-Date.parse(o.date))/86400000;if(days===0)duplicate=true;if(interval&&days<interval)tooClose=true;}
 }
 if(tooClose)warnings.push('Treatment dates fall within this product’s recorded minimum review interval. Review the protocol and instruction source.');
 if(duplicate)warnings.push('Multiple doses share a date for an animal. Review possible duplication.');
 return warnings;
}

// Meat Sheep Balancer v6, Ration!C21: weighted ingredient cost per 2,000-lb US ton.
export function rationCost(r:NonNullable<FarmEvent['ration']>){const pounds=r.ingredients.reduce((s,i)=>s+i.pounds,0),batch=r.ingredients.some(i=>i.pricePerTon===null)?null:r.ingredients.reduce((s,i)=>s+i.pounds*i.pricePerTon!/2000,0);return {pounds,batch,perTon:batch===null?null:pounds?batch/pounds*2000:0,perHeadDay:r.feedingLb&&pounds&&batch!==null?batch/pounds*r.feedingLb:null};}

export function eventAllocation(e:FarmEvent){return e.allocations?Object.entries(e.allocations).map(([id,cents])=>({id,cents})):allocation(e.amountCents||0,e.animalIds);}
