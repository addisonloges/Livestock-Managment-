import type {FarmEvent} from './farm-events.ts';
export function managementGroups(events:FarmEvent[],species?:string){
 const periods=events.filter(e=>e.kind==='management'&&!e.voided&&e.management&&(!species||e.species===species)).sort((a,b)=>b.date.localeCompare(a.date)||b.version-a.version||a.id.localeCompare(b.id));
 return [...new Map(periods.map(e=>e.management!.groupId).map(id=>[id,periods.find(e=>e.management!.groupId===id)!])).entries()].map(([id,e])=>({id,name:e.title,species:e.species,periods:periods.filter(p=>p.management!.groupId===id)})).sort((a,b)=>a.name.localeCompare(b.name));
}
export function groupMembers(events:FarmEvent[],id:string,date:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return new Set<string>();
 return new Set(events.filter(e=>e.kind==='management'&&!e.voided&&e.management?.groupId===id&&e.date<=date&&(!e.management.endDate||e.management.endDate>=date)).flatMap(e=>e.animalIds));
}
