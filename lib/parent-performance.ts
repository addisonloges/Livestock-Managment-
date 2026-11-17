import type {BreedingGroup} from './breeding.ts';
import type {Litter} from './lambing.ts';
import {retentionDecision} from './financial-reports.ts';
import type {Animal,Weight} from './livestock.ts';
import {animalExpenses,animalIncome,type FarmEvent} from './farm-events.ts';
export function parentPerformance(parent:Animal,animals:Animal[],weights:Weight[],events:FarmEvent[],year:string,litters:Litter[]=[],through?:string,groups:BreedingGroup[]=[]){
 const cutoff=through||(year==='all'?'9999-12-31':year+'-12-31');
 const offspring=animals.filter(a=>!a.pedigreeOnly&&!a.archivedAt&&(!a.dob||a.dob<=cutoff)&&(a.sire===parent.id||a.dam===parent.id)&&(year==='all'||String(a.birthYear||a.dob?.slice(0,4))===year));
 const exposures=groups.filter(g=>g.species===parent.species&&!g.archivedAt&&g.start&&g.start<=cutoff&&g.state!=='Cancelled'&&g.eweIds.includes(parent.id)&&(year==='all'||String(g.year)===year)).length;
 const weaned=offspring.filter(a=>events.some(e=>e.kind==='weaning'&&!e.voided&&e.date<=cutoff&&e.animalIds.includes(a.id)));
 const birthWeights=offspring.flatMap(a=>{const w=weights.find(w=>w.animalId===a.id&&!w.voided&&w.date===a.dob);return w?[w.pounds]:[]});
 const income=offspring.reduce((n,a)=>n+animalIncome(events,a.id,year),0),expenses=offspring.reduce((n,a)=>n+animalExpenses(events,a.id,year),0);
 const births=litters.filter(l=>!l.voided&&l.date<=cutoff&&l.species===parent.species&&(l.damId===parent.id||l.sireId===parent.id)&&(year==='all'||l.date.startsWith(year)));
 const retained=offspring.filter(a=>retentionDecision(events,a.id,cutoff)==='Retain').length;
 return {exposures,recordedLitters:births.length,bornAlive:births.length?births.reduce((n,l)=>n+l.lambs.filter(x=>x.outcome==='Alive').length,0):null,stillborn:births.length?births.reduce((n,l)=>n+l.lambs.filter(x=>x.outcome==='Stillborn').length,0):null,retained,offspring:offspring.length,weaned:weaned.length,measuredAtBirth:birthWeights.length,meanBirthWeight:birthWeights.length?birthWeights.reduce((a,b)=>a+b,0)/birthWeights.length:null,income,expenses,cashContribution:income-expenses};
}
