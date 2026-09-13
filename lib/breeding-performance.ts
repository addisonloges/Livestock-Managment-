import type {BreedingGroup} from './breeding.ts';
import type {Litter} from './lambing.ts';
export function breedingPerformance(group:BreedingGroup,litters:Litter[],through:string){
 let pregnant=0,open=0,unresolved=0;
 for(const id of group.eweIds){const checks=(group.pregnancyChecks||[]).filter(c=>c.eweId===id&&c.date<=through).sort((a,b)=>b.date.localeCompare(a.date));if(!checks.length){unresolved++;continue}const latest=checks.filter(c=>c.date===checks[0].date),results=new Set(latest.map(c=>c.result));if(results.size!==1){unresolved++;continue}if(checks[0].result==='Pregnant')pregnant++;else if(checks[0].result==='Open')open++;else unresolved++;}
 const births=litters.filter(l=>!l.voided&&l.groupId===group.id&&l.species===group.species&&l.date<=through);
 return {females:group.eweIds.length,pregnant,open,unresolved,positiveAmongDefinite:pregnant+open?pregnant/(pregnant+open):null,litters:births.length,bornAlive:births.reduce((n,l)=>n+l.lambs.filter(x=>x.outcome==='Alive').length,0),stillborn:births.reduce((n,l)=>n+l.lambs.filter(x=>x.outcome==='Stillborn').length,0)};
}
