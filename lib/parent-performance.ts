import type {Animal,Weight} from './livestock.ts';
import {animalExpenses,animalIncome,type FarmEvent} from './farm-events.ts';
export function parentPerformance(parent:Animal,animals:Animal[],weights:Weight[],events:FarmEvent[],year:string){
 const offspring=animals.filter(a=>!a.pedigreeOnly&&!a.archivedAt&&(a.sire===parent.id||a.dam===parent.id)&&(year==='all'||String(a.birthYear||a.dob?.slice(0,4))===year));
 const cutoff=year==='all'?'9999-12-31':year+'-12-31';
 const weaned=offspring.filter(a=>events.some(e=>e.kind==='weaning'&&!e.voided&&e.date<=cutoff&&e.animalIds.includes(a.id)));
 const birthWeights=offspring.flatMap(a=>{const w=weights.find(w=>w.animalId===a.id&&!w.voided&&w.date===a.dob);return w?[w.pounds]:[]});
 const income=offspring.reduce((n,a)=>n+animalIncome(events,a.id,year),0),expenses=offspring.reduce((n,a)=>n+animalExpenses(events,a.id,year),0);
 return {offspring:offspring.length,weaned:weaned.length,measuredAtBirth:birthWeights.length,meanBirthWeight:birthWeights.length?birthWeights.reduce((a,b)=>a+b,0)/birthWeights.length:null,income,expenses,cashContribution:income-expenses};
}
