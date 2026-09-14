import type {Animal} from './livestock.ts';
import type {Litter} from './lambing.ts';
import {resolvedStatusEvents,statusAt} from './animal-status.ts';
export function birthOutcomes(litters:Litter[],animals:Animal[],species:string,year:string,through:string,days:number){
 if(!Number.isInteger(days)||days<1||days>365)throw Error('Choose a review window from 1 to 365 days.');
 return litters.filter(l=>!l.voided&&l.species===species&&l.date<=through&&(year==='all'||l.date.startsWith(year))).map(l=>{
  const live=l.lambs.filter(x=>x.outcome==='Alive');let deaths=0,unknownDates=0,missingProfiles=0,observed=0;
  for(const x of live){const a=animals.find(a=>a.id===x.id);if(!a){missingProfiles++;continue;}
   const events=resolvedStatusEvents(a.statusEvents||[]),death=events.find(e=>e.status==='Dead'&&e.date&&e.date>=l.date&&e.date<=through),age=death?(Date.parse(death.date)-Date.parse(l.date))/86400000:null;
   if(age!==null&&age<days){deaths++;continue;}
   if(statusAt({...a,statusEvents:events},through)==='Dead'&&!death){unknownDates++;continue;}
   if(Date.parse(through)>=Date.parse(l.date)+days*86400000)observed++;
  }
  return {id:l.id,date:l.date,damId:l.damId,sireId:l.sireId,bornAlive:live.length,stillborn:l.lambs.filter(x=>x.outcome==='Stillborn').length,deaths,unknownDates,missingProfiles,windowElapsed:observed,assistance:l.assistance};
 });
}
