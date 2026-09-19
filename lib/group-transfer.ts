import type {FarmEvent} from './farm-events.ts';
import {validDate} from './livestock.ts';
import {groupMembers,managementGroups} from './management-groups.ts';
export type TransferInput={species:string;from:string;to:string;newName:string;date:string;endDate:string;animalIds:string[]};
export function planGroupTransfer(events:FarmEvent[],input:TransferInput,newId:()=>string){
 const {species,from,to,newName,date,endDate,animalIds}=input;
 if(!['Sheep','Goats'].includes(species)||!validDate(date)||date>new Date().toISOString().slice(0,10)||endDate&&(!validDate(endDate)||endDate<date))throw Error('Choose a valid transfer date (today or earlier) and an optional end date on or after it.');
 if(!Array.isArray(animalIds)||!animalIds.length||animalIds.length>200||new Set(animalIds).size!==animalIds.length)throw Error('Select 1 to 200 distinct animals to transfer.');
 const rows=events.filter(e=>e.species===species&&e.kind==='management'),groups=managementGroups(rows),source=groups.find(g=>g.id===from),destination=groups.find(g=>g.id===to);
 if(!source||from===to)throw Error('Choose different source and destination groups.');
 if(to&&!destination||!to&&(typeof newName!=='string'||!newName.trim()||newName.trim().length>200))throw Error('Choose a destination group or enter a new group name.');
 const members=groupMembers(rows,from,date),selected=new Set(animalIds);
 if(animalIds.some(id=>!members.has(id)))throw Error('Some selected animals are not in the source group on that date. Reload and review the selection.');
 if(rows.some(e=>!e.voided&&e.management?.groupId===from&&e.date>date&&e.animalIds.some(id=>selected.has(id))))throw Error('A selected animal has a later assignment in the source group. Correct that assignment before transferring.');
 if(rows.some(e=>!e.voided&&e.management?.groupId===to&&e.date<=(endDate||'9999-12-31')&&(!e.management.endDate||e.management.endDate>=date)&&e.animalIds.some(id=>selected.has(id))))throw Error('A selected animal already has a destination membership during these dates. Review its dates before transferring.');
 const previous=new Date(Date.parse(date+'T12:00:00Z')-86400000).toISOString().slice(0,10),updates:FarmEvent[]=[],creates:FarmEvent[]=[];
 for(const e of rows.filter(e=>!e.voided&&e.management?.groupId===from&&e.date<=date&&(!e.management.endDate||e.management.endDate>=date)&&e.animalIds.some(id=>selected.has(id)))){
  const moved=e.animalIds.filter(id=>selected.has(id)),remaining=e.animalIds.filter(id=>!selected.has(id));
  if(!remaining.length)updates.push(e.date===date?{...e,voided:true}:{...e,management:{...e.management!,endDate:previous}});
  else {
   updates.push({...e,animalIds:remaining});
   if(e.date<date)creates.push({...e,id:newId(),version:0,animalIds:moved,management:{...e.management!,endDate:previous},attachments:[]});
  }
 }
 const target:FarmEvent={id:newId(),version:0,kind:'management',species,date,title:destination?.name||newName.trim(),animalIds:[...animalIds],management:{groupId:to||newId(),endDate},notes:`Transferred from ${source.name} on ${date}.`,category:'',dueDate:'',amountCents:null};
 creates.push(target);return {updates,creates,target};
}
