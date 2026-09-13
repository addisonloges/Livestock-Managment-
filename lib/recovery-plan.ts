import {validateAnimal,validDate} from './livestock.ts';
export const recoveryTables=['animals','weights','animal_history','breeding_groups','breeding_history','breeding_projects','farm_records','farm_history'];
export function scopedRecovery(current:Record<string,any[]>,backup:Record<string,any[]>,scope:string){
 if(scope==='all')return backup;
 if(!['Sheep','Goats'].includes(scope))throw Error('Choose all records, Sheep or Goats.');
 const all=(table:string)=>[...current[table],...backup[table]];
 const animalIds=new Set(all('animals').filter(a=>a.species===scope).map(a=>a.id));
 const groupIds=new Set([...all('breeding_groups').filter(g=>g.species===scope).map(g=>g.id),...all('breeding_projects').filter(p=>JSON.parse(p.data).species===scope).map(p=>p.id)]);
 const recordIds=new Set(all('farm_records').filter(r=>r.species===scope).map(r=>r.id));
 const selected=(table:string,row:any)=>table==='animals'?row.species===scope:['weights','animal_history'].includes(table)?animalIds.has(row.animalId):table==='breeding_history'?groupIds.has(row.groupId):table==='farm_history'?recordIds.has(row.recordId):table==='breeding_projects'?JSON.parse(row.data).species===scope:row.species===scope;
 return Object.fromEntries(recoveryTables.map(table=>{const rows=[...current[table].filter(r=>!selected(table,r)),...backup[table].filter(r=>selected(table,r))],key=table.endsWith('history')?'operationId':'id';if(new Set(rows.map(r=>r[key])).size!==rows.length)throw Error('A backup identifier conflicts with records outside the selected species.');return [table,rows]}));
}
export function validateRecoveryLinks(tables:Record<string,any[]>){
 const sequences=new Set(),numbers=new Set(),eids=new Set(),weightDates=new Set();
 for(const a of tables.animals){if(!Number.isSafeInteger(a.seq)||a.seq<1||sequences.has(a.seq))throw Error('Backup contains a repeated or invalid animal sequence.');sequences.add(a.seq);if(a.birthSequence!==null&&a.birthSequence!==undefined){const number=String(a.birthYear??0)+':'+a.birthSequence;if(!Number.isSafeInteger(a.birthSequence)||a.birthSequence<1||numbers.has(number))throw Error('Backup contains repeated birth-year display numbers.');numbers.add(number)}if(a.eid!==null&&a.eid!==undefined){if(eids.has(a.eid))throw Error('Backup contains a repeated EID.');eids.add(a.eid)}}
 for(const w of tables.weights){const key=w.animalId+':'+w.date;if(weightDates.has(key))throw Error('Backup contains repeated animal/date measurements.');weightDates.add(key)}
 const animals=new Map(tables.animals.map(a=>[a.id,a])),visiting=new Set<string>(),done=new Set<string>();
 const visit=(id:string)=>{if(done.has(id))return;if(visiting.has(id))throw Error('Backup pedigree contains a cycle.');const a=animals.get(id);if(!a)throw Error('Backup references a missing ancestor.');visiting.add(id);for(const role of ['sire','dam'])if(a[role]){const parent=animals.get(a[role]);if(!parent||parent.species!==a.species)throw Error('Backup parent is missing or belongs to another species.');visit(a[role])}visiting.delete(id);done.add(id)};
 for(const a of tables.animals){validateAnimal({...a,origin:a.pedigreeOnly?'Purchased':a.origin});visit(a.id)}
 for(const w of tables.weights)if(!animals.has(w.animalId)||!validDate(w.date)||!Number.isFinite(w.pounds)||w.pounds<=0||!['lb','kg'].includes(w.unit))throw Error('Backup contains an invalid or unlinked weight.');
 const requireAnimal=(id:string,species:string)=>{if(id&&(!animals.has(id)||animals.get(id).species!==species))throw Error('Backup contains a missing or cross-species animal reference.')};
 for(const g of tables.breeding_groups){const data=JSON.parse(g.data);requireAnimal(data.ramId,g.species);for(const id of data.eweIds||[])requireAnimal(id,g.species)}
 for(const r of tables.farm_records){const data=JSON.parse(r.data);if(!data||typeof data!=='object'||data.id!==undefined&&data.id!==r.id||data.species!==undefined&&data.species!==r.species)throw Error('Invalid record contents or identity.');for(const id of data.animalIds||[])requireAnimal(id,r.species);if(r.kind==='litter'){requireAnimal(data.damId,r.species);requireAnimal(data.sireId,r.species);for(const child of data.lambs||[])if(child.outcome==='Alive')requireAnimal(child.id,r.species)}}
}
