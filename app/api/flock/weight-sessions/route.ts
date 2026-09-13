import {rawDb} from '@/db';
import {weightState,validateWeight} from '@/lib/weight-records';
import {statusAt,resolvedStatusEvents} from '@/lib/animal-status';
import {type Animal,type Weight} from '@/lib/livestock';
const uuid=(v:unknown)=>typeof v==='string'&&/^[0-9a-f-]{36}$/i.test(v);
export async function POST(req:Request){try{
 const {year:chosen,action,data:a}=await req.json() as any;const year=Number(chosen);
 if(chosen==='all'||!Number.isInteger(year)||year<1900||year>new Date().getFullYear())throw Error('Choose a specific valid year.');
 if(!a||!uuid(a.id)||!uuid(a.operationId))throw Error('Invalid session identifier.');
 if(!['create','void','restore'].includes(action))throw Error('Choose a valid session action.');
 const db=rawDb();const {results:history}=await db.prepare("SELECT * FROM animal_history WHERE action LIKE 'weight-%' OR action='status'").all<any>();
 const previous=history.find(h=>{try{const w=JSON.parse(h.after);return w.batchOperation===a.operationId}catch{return false}});
 if(previous){const w=JSON.parse(previous.after);if(w.batchId!==a.id||previous.action!=='weight-'+(action==='create'?'create':action))throw Error('Change identifier already used.');return Response.json({saved:true,replayed:true});}
 const {results:animals}=await db.prepare('SELECT * FROM animals').all<Animal>();
 const {results:rawWeights}=await db.prepare('SELECT * FROM weights').all<Weight>();const weights=rawWeights.map(w=>weightState(w,history));
 const checkAnimal=(w:Weight)=>{const animal=animals.find(v=>v.id===w.animalId);if(!animal||animal.archivedAt||animal.pedigreeOnly||animal.firstYear>year||animal.species!==a.species)throw Error('A selected animal is unavailable in this species/year. Reload and review.');
 if(animal.dob&&w.date<animal.dob)throw Error('A weight date precedes the animal’s birth.');
 const statusEvents=resolvedStatusEvents(history.filter(h=>h.animalId===animal.id&&h.action==='status').map(h=>({...JSON.parse(h.after).statusEvent,operationId:h.operationId})));
 if(statusAt({...animal,statusEvents},w.date)!=='Active'&&!statusEvents.some(e=>e.date===w.date&&e.status!=='Active'))throw Error('A selected animal was not active on the weighing date, or its exit date is unknown.');};
 const now=new Date().toISOString();const statements=[];const animalVersion=animals.reduce((total,v)=>total+v.version,0);
 if(action==='create'){
  if(weights.some(w=>w.batchId===a.id))throw Error('Session already exists. Reload to view it.');
  if(!Array.isArray(a.rows)||!a.rows.length||a.rows.length>100)throw Error('Enter between 1 and 100 measurements per session.');
  const ids=new Set();for(const row of a.rows){if(!uuid(row.id)||!uuid(row.animalId)||ids.has(row.animalId))throw Error('Each animal may appear only once in a session.');ids.add(row.animalId);}
  const next=a.rows.map((row:any)=>({...validateWeight({id:row.id,animalId:row.animalId,date:a.date,originalValue:row.originalValue,unit:row.unit,session:a.name},year),version:1,voided:false,batchId:a.id,batchOperation:a.operationId}));
  for(const w of next){checkAnimal(w);if(weights.some(v=>v.animalId===w.animalId&&v.date===w.date))throw Error('An animal already has a weight on this date, including a possible voided record. Review before saving.');
   statements.push(db.prepare('INSERT INTO weights (id,animalId,date,pounds,originalValue,unit,session,createdAt) VALUES (?,CASE WHEN (SELECT COALESCE(SUM(version),0) FROM animals)=? THEN ? ELSE NULL END,?,?,?,?,?,?)').bind(w.id,animalVersion,w.animalId,w.date,w.pounds,w.originalValue,w.unit,w.session,now));
   statements.push(db.prepare('INSERT INTO animal_history (operationId,animalId,action,reason,before,after,createdAt) VALUES (?,?,?,?,?,?,?)').bind(crypto.randomUUID(),w.animalId,'weight-create','Saved weighing session',JSON.stringify({}),JSON.stringify(w),now));
  }
  await db.batch(statements);return Response.json({saved:true,count:next.length});
 }
 const session=weights.filter(w=>w.batchId===a.id);if(!session.length)throw Error('Session not found.');
 if(session.some(w=>Number(w.date.slice(0,4))!==year))throw Error('Select the session year.');
 if(!Array.isArray(a.expected)||a.expected.length!==session.length||session.some(w=>!a.expected.some((v:any)=>v.id===w.id&&v.version===w.version)))return Response.json({error:'A session measurement changed. Reload and review before retrying.'},{status:409});
 const reason=String(a.reason||'').trim();if(!reason||reason.length>500)throw Error('Enter a reason, up to 500 characters.');
 const affected=session.filter(w=>action==='void'?!w.voided:w.voided);if(!affected.length)throw Error('There are no measurements to '+action+'.');
 for(const w of affected){if(action==='restore')checkAnimal(w);}
 // Check the whole session before any updates. Audit inserts and updates commit together.
 const guard="EXISTS (SELECT 1 FROM json_each(?) j WHERE json_extract(j.value,'$.id')=weights.id AND json_extract(j.value,'$.version')=weights.version)";const guardArgs=[JSON.stringify(session.map(w=>({id:w.id,version:w.version})))];
 const mutations=affected.map(w=>({before:w,after:{...w,version:w.version!+1,voided:action==='void',batchOperation:a.operationId},operationId:crypto.randomUUID()}));
 for(const m of mutations)statements.push(db.prepare('INSERT INTO animal_history (operationId,animalId,action,reason,before,after,createdAt) SELECT ?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM weights WHERE '+guard+')=?').bind(m.operationId,m.before.animalId,'weight-'+action,reason,JSON.stringify(m.before),JSON.stringify(m.after),now,...guardArgs,session.length));
 for(const m of mutations)statements.push(db.prepare('UPDATE weights SET version=version+1 WHERE id=? AND version=? AND EXISTS (SELECT 1 FROM animal_history WHERE operationId=?)').bind(m.before.id,m.before.version,m.operationId));
 const result=await db.batch(statements);if(result[0].meta.changes!==1)return Response.json({error:'Session changed elsewhere. Reload and review.'},{status:409});
 return Response.json({saved:true,count:affected.length});
 }catch(e){const m=e instanceof Error?e.message:'Unable to save session.';return Response.json({error:/UNIQUE/.test(m)?'A duplicate record was found. Nothing in this batch was saved; reload and review.':/D1|SQLITE/.test(m)?'Session could not be saved. Please retry.':m},{status:400});}}
