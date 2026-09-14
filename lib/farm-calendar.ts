import {type Animal,label} from './livestock.ts';
import {type FarmEvent,doseState} from './farm-events.ts';
import {type BreedingGroup,groupDate} from './breeding.ts';
import {addDays} from './breeding-projects.ts';
import type {Litter} from './lambing.ts';
export type CalendarEntry={date:string;title:string;type:string;section:string;year:string;recordId?:string};
export function farmCalendar(events:FarmEvent[],litters:Litter[],groups:BreedingGroup[],animals:Animal[],species:string):CalendarEntry[]{
 const rows:CalendarEntry[]=[];
 for(const e of events.filter(e=>!e.voided&&e.species===species)){
  const base={section:'events',year:e.date.slice(0,4),recordId:e.id};
  rows.push({...base,date:e.date,title:e.title,type:e.kind});
  if(e.dueDate&&!(e.kind==='watch'&&e.watch?.resolvedDate))rows.push({...base,date:e.dueDate,title:e.title+' · Follow-up',type:'Follow-up'});
  for(const d of e.protocol?.doses||[]){const count=e.animalIds.filter(id=>doseState(d,id)==='Scheduled').length;if(count)rows.push({...base,date:d.date,title:e.protocol!.product+' · '+count+' animals scheduled',type:'Scheduled dose'});}
  if(e.protocol?.withdrawalEnd)rows.push({...base,date:e.protocol.withdrawalEnd,title:e.protocol.product+' · Withdrawal ends',type:'Withdrawal'});
 }
 for(const l of litters.filter(l=>!l.voided&&l.species===species)){const dam=animals.find(a=>a.id===l.damId);rows.push({date:l.date,title:(dam?label(dam):'Unknown dam')+' · '+l.lambs.length+' offspring',type:species==='Sheep'?'Recorded lambing':'Recorded kidding',section:'lambing',year:l.date.slice(0,4)});}
 for(const g of groups.filter(g=>g.species===species&&!g.archivedAt&&g.state!=='Cancelled')){
  const date=groupDate(g);if(!date)continue;
  const push=(date:string,type:string)=>rows.push({date,type,title:g.name,section:'breeding',year:String(g.year)});
  push(date,g.start?'Actual exposure':'Planned exposure');if(g.end)push(g.end,'Exposure end');
  const p=g.projectSnapshot;
  if(p?.flushingDays)push(addDays(date,-p.flushingDays),'Planned flushing start');
  if(p?.crayonDays)push(addDays(date,p.crayonDays),'Planned crayon change');
  if(p?.gestationMin&&p.gestationMax){push(addDays(date,p.gestationMin),'Estimated birth window starts');push(addDays(g.end||date,p.gestationMax),'Estimated birth window ends');}
 }
 return rows.sort((a,b)=>a.date.localeCompare(b.date)||a.title.localeCompare(b.title));
}
