import {validDate,type Animal} from './livestock.ts';
import {statusAt} from './animal-status.ts';
import {rationCost,type FarmEvent} from './farm-events.ts';
export type FeedInput={groupId:string;start:string;end:string;rationId:string;lbPerHeadDay:number;overrides:Record<string,{lbPerHeadDay:number;rationId:string}>};
export type FeedSnapshot={input:FeedInput;calculatedAt:string;memberships:{id:string;version:number}[];rations:{id:string;version:number;name:string;pricePerLb:number}[];rows:{animalId:string;days:number;pounds:number;modeledCost:number;allocatedCents:number;rationId:string}[];warnings:string[]};
export function calculateFeed(input:FeedInput,events:FarmEvent[],animals:Animal[],species:string,cents:number):FeedSnapshot{
 if(!input||!validDate(input.start)||!validDate(input.end)||input.end<input.start||input.end>new Date().toISOString().slice(0,10)||(Date.parse(input.end)-Date.parse(input.start))/86400000>365)throw Error('Use an actual feeding period up to 366 days, ending no later than today.');
 if(!Number.isFinite(input.lbPerHeadDay)||input.lbPerHeadDay<=0||input.lbPerHeadDay>1000||!input.overrides||Array.isArray(input.overrides)||typeof input.overrides!=='object')throw Error('Enter positive lb/head/day and valid overrides.');
 if(!Number.isSafeInteger(cents)||cents<0||cents>1e10)throw Error('Invalid bill amount.');
 const memberships=events.filter(e=>!e.voided&&e.species===species&&e.kind==='management'&&e.management?.groupId===input.groupId&&e.date<=input.end&&(!e.management.endDate||e.management.endDate>=input.start));
 if(!memberships.length)throw Error('No dated membership overlaps this period.');
 const ids=[...new Set(memberships.flatMap(e=>e.animalIds))].sort();if(ids.length>200)throw Error('Allocate up to 200 animals per bill.');
 if(Object.keys(input.overrides).some(id=>!ids.includes(id)))throw Error('Overrides must be for members in this period.');
 const rations=new Map<string,FeedSnapshot['rations'][number]>();
 const price=(id:string)=>{const r=events.find(e=>e.id===id&&e.kind==='ration'&&e.species===species&&!e.voided&&e.ration);if(!r||r.date>input.start)throw Error('Choose a ration version recorded by the feeding start.');const cost=rationCost(r.ration!);if(cost.perTon===null)throw Error('Enter ingredient prices for the chosen ration before allocating costs.');rations.set(id,{id,version:r.version,name:r.title,pricePerLb:cost.perTon/2000});return cost.perTon/2000};
 const warnings=new Set<string>(),rows:FeedSnapshot['rows']=[];
 for(const id of ids){const a=animals.find(a=>a.id===id);if(!a||a.pedigreeOnly||a.species!==species)throw Error('Membership contains an unavailable animal.');const override=input.overrides[id],lb=override?.lbPerHeadDay??input.lbPerHeadDay,rationId=override?.rationId||input.rationId;if(!Number.isFinite(lb)||lb<0||lb>1000)throw Error('Individual lb/head/day must be between 0 and 1000.');let days=0;
 for(let d=Date.parse(input.start+'T00:00:00Z');d<=Date.parse(input.end+'T00:00:00Z');d+=86400000){const date=new Date(d).toISOString().slice(0,10),matches=memberships.filter(e=>e.animalIds.includes(id)&&e.date<=date&&(!e.management!.endDate||e.management!.endDate>=date));if(!matches.length)continue;if(matches.length>1)throw Error('Overlapping membership periods must be corrected before allocation.');if(a.dob&&a.dob>date||a.firstYear>Number(date.slice(0,4)))continue;if(statusAt(a,date)!=='Active'){warnings.add('Non-active or unknown-status membership days were excluded. Review undated exits.');continue;}days++;}
 if(!days||lb===0)continue;const pounds=days*lb,modeledCost=pounds*price(rationId);rows.push({animalId:id,days,pounds,modeledCost,allocatedCents:0,rationId});}
 if(events.some(e=>e.kind==='expense'&&!e.voided&&e.species===species&&e.feedAllocation?.input.groupId===input.groupId&&e.feedAllocation.input.start<=input.end&&e.feedAllocation.input.end>=input.start))warnings.add('Another allocated feed bill overlaps this group and period. Confirm these are separate costs, not duplicate bills.');
 const total=rows.reduce((n,r)=>n+r.modeledCost,0);if(!rows.length||total<=0)throw Error('No positive priced feed consumption remains for this period.');
 const shares=rows.map(r=>{const exact=cents*r.modeledCost/total;return {r,base:Math.floor(exact),fraction:exact-Math.floor(exact)}});let remaining=cents-shares.reduce((n,s)=>n+s.base,0);shares.sort((a,b)=>b.fraction-a.fraction||a.r.animalId.localeCompare(b.r.animalId));for(const s of shares)s.r.allocatedCents=s.base+(remaining-->0?1:0);
 return {input,calculatedAt:new Date().toISOString(),memberships:memberships.map(e=>({id:e.id,version:e.version})),rations:[...rations.values()],rows,warnings:[...warnings]};
}
