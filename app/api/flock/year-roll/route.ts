import {withWriteEpoch} from '@/db/recovery-context';
import {rawDb} from '@/db';
import {isUuid} from '@/lib/lambing';
import type {Animal} from '@/lib/livestock';
import {resolvedStatusEvents} from '@/lib/animal-status';
import {yearRollCandidates,withYearSelection} from '@/lib/year-roll';
export const dynamic='force-dynamic';
const settingsId='00000000-0000-0000-0000-000000000001';
async function save(req:Request){try{
 const b:any=await req.json(),source=Number(b.year),target=source+1;
 if(!Number.isInteger(source)||source<1900||target>new Date().getFullYear()+10||!['Sheep','Goats'].includes(b.species)||!isUuid(b.operationId)||!Array.isArray(b.selected)||!Array.isArray(b.candidates))throw Error('Invalid rollover details.');
 const db=rawDb(),prior:any=await db.prepare('SELECT recordId,after FROM farm_history WHERE operationId=?').bind(b.operationId).first();
 if(prior){const saved=JSON.parse(prior.after).lastRollover;if(prior.recordId!==settingsId||saved?.species!==b.species||saved?.target!==target||JSON.stringify([...saved.selected].sort())!==JSON.stringify([...b.selected].sort()))throw Error('Rollover identifier already used.');return Response.json({saved:true});}
 const [ar,hr,sr]=await db.batch([db.prepare('SELECT * FROM animals'),db.prepare("SELECT * FROM animal_history WHERE action='status'"),db.prepare('SELECT * FROM farm_records WHERE id=?').bind(settingsId)]);
 const raw=ar.results as Animal[],animals=raw.map(a=>({...a,statusEvents:resolvedStatusEvents(hr.results.filter((h:any)=>h.animalId===a.id).map((h:any)=>({...JSON.parse(h.after).statusEvent,operationId:h.operationId})))}));
 const candidates=yearRollCandidates(animals,b.species,source),selected=new Set<string>(b.selected);
 if(selected.size!==b.selected.length||b.selected.some((id:any)=>typeof id!=='string'||!candidates.some(a=>a.id===id)))throw Error('Only eligible active animals can roll forward.');
 if(candidates.length!==b.candidates.length||candidates.some(a=>!b.candidates.some((c:any)=>c.id===a.id&&c.version===a.version)))return Response.json({error:'Animals changed. Close and reopen rollover to review the current list.'},{status:409});
 // Do not silently remove an animal from a year containing its records.
 const excluded=candidates.filter(a=>!selected.has(a.id));
 if(excluded.length){const [w,f,g]=await db.batch([db.prepare('SELECT animalId,date FROM weights WHERE date>=?').bind(`${target}-01-01`),db.prepare('SELECT data FROM farm_records WHERE date>=?').bind(`${target}-01-01`),db.prepare('SELECT * FROM breeding_groups')]);
  for(const a of excluded){const linked=w.results.some((r:any)=>r.animalId===a.id)||f.results.some((r:any)=>{const e=JSON.parse(r.data);return !e.voided&&(e.animalIds?.includes(a.id)||e.damId===a.id||e.sireId===a.id||e.lambs?.some((l:any)=>l.id===a.id))})||g.results.some((r:any)=>{const e=r.data?JSON.parse(r.data):r;return Number(e.year)>=target&&JSON.stringify(e).includes(a.id)});if(linked)throw Error(`${a.name||a.id} has records in ${target} or later. Keep it selected so those records remain available.`);}
 }
 const old:any=sr.results[0],before=old?JSON.parse(old.data):{fields:[]};if((old?.version||0)!==b.settingsVersion)return Response.json({error:'Year settings changed. Close and reopen rollover.'},{status:409});
 const now=new Date().toISOString(),after=JSON.stringify({...before,addedYears:[...new Set([...(before.addedYears||[]),target])],lastRollover:{species:b.species,target,selected:[...selected]},version:(old?.version||0)+1});
 const guard=db.prepare("INSERT INTO animals(id,species,sex,origin,firstYear,createdAt) SELECT NULL,'Sheep','Unknown','Purchased',1900,'' WHERE ? != (SELECT COALESCE(SUM(version),0) FROM animals) OR ? != COALESCE((SELECT version FROM farm_records WHERE id=?),0)").bind(raw.reduce((n,a)=>n+a.version,0),old?.version||0,settingsId);
 const writes=[guard];for(const a of candidates){const original=raw.find(r=>r.id===a.id)!;const info=withYearSelection(original,target,selected.has(a.id));writes.push(db.prepare('UPDATE animals SET pedigreeInfo=?,version=version+1 WHERE id=?').bind(info,a.id),db.prepare('INSERT INTO animal_history(operationId,animalId,action,reason,before,after,createdAt) VALUES (?,?,?,?,?,?,?)').bind(crypto.randomUUID(),a.id,'roll-forward',`${selected.has(a.id)?'Included in':'Not selected for'} ${target} rollover`,JSON.stringify(original),JSON.stringify({...original,pedigreeInfo:info,version:original.version+1}),now));}
 if(old)writes.push(db.prepare('UPDATE farm_records SET data=?,version=version+1 WHERE id=?').bind(after,settingsId));else writes.push(db.prepare("INSERT INTO farm_records(id,kind,species,date,data,version) VALUES (?,'settings','Shared',?,?,1)").bind(settingsId,now.slice(0,10),after));
 writes.push(db.prepare('INSERT INTO farm_history(operationId,recordId,before,after,createdAt) VALUES (?,?,?,?,?)').bind(b.operationId,settingsId,old?.data||'{}',after,now));await db.batch(writes);return Response.json({saved:true});
 }catch(e){const message=e instanceof Error?e.message:'Could not save rollover';return Response.json({error:/SQLITE|D1|NOT NULL/.test(message)?'Records changed while saving. Close and reopen rollover. No partial rollover was saved.':message},{status:400})}}
export const POST=withWriteEpoch(save);
