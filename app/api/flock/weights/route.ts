import {withWriteEpoch} from '@/db/recovery-context';
import {rawDb} from '@/db';
import {weightState,validateWeight} from '@/lib/weight-records';
import {statusAt,resolvedStatusEvents} from '@/lib/animal-status';
import {type Animal,type Weight} from '@/lib/livestock';
async function handlePOST(req:Request){try{
 const {year:chosen,data:a,action}=await req.json() as any;const year=Number(chosen);
 if(chosen==='all'||!Number.isInteger(year)||year<1900||year>new Date().getFullYear())throw Error('Choose a specific valid year.');
 if(!['weight-edit','weight-void','weight-restore'].includes(action))throw Error('Choose a valid weight action.');
 if(!a||! /^[0-9a-f-]{36}$/i.test(a.id)||! /^[0-9a-f-]{36}$/i.test(a.operationId))throw Error('Invalid change identifier.');
 const db=rawDb();const stored=await db.prepare('SELECT * FROM weights WHERE id=?').bind(a.id).first<Weight>();if(!stored)throw Error('Weight record not found.');
 const prior=await db.prepare('SELECT * FROM animal_history WHERE operationId=?').bind(a.operationId).first<any>();
 if(prior){if(prior.action!==action||JSON.parse(prior.after).id!==a.id)throw Error('Change identifier already used.');return Response.json({saved:true});}
 if(stored.version!==a.version)return Response.json({error:'This weight changed elsewhere. Close and reload before retrying.'},{status:409});
 if(Number(stored.date.slice(0,4))!==year)throw Error('Select the year containing this weight.');
 const animal=await db.prepare('SELECT * FROM animals WHERE id=?').bind(stored.animalId).first<Animal>();if(!animal||animal.archivedAt||animal.pedigreeOnly)throw Error('Restore the animal before changing its weights.');
 const h=await db.prepare('SELECT * FROM animal_history WHERE animalId=?').bind(animal.id).all<any>();const before=weightState(stored,h.results);
 const reason=String(a.reason||'').trim();if(!reason||reason.length>500)throw Error('Enter a reason, up to 500 characters.');
 if(action==='weight-restore'&&!before.voided)throw Error('This weight is not voided.');if(action!=='weight-restore'&&before.voided)throw Error('Restore this weight before editing it.');
 let next={...before,version:a.version+1,voided:action==='weight-void'};
 if(action==='weight-edit')next={...next,...validateWeight({date:a.date,originalValue:a.originalValue,unit:a.unit,session:a.session},year)};
 if(action!=='weight-void'){
  if(animal.firstYear>year||(animal.dob&&next.date<animal.dob))throw Error('Weight date is before this animal was recorded or born.');
  const statusEvents=resolvedStatusEvents(h.results.filter(h=>h.action==='status').map(h=>({...JSON.parse(h.after).statusEvent,operationId:h.operationId})));
  if(statusAt({...animal,statusEvents},next.date)!=='Active'&&!statusEvents.some(e=>e.date===next.date&&e.status!=='Active'))throw Error('The animal was not active on this date, or its exit date needs review.');
 }
 const now=new Date().toISOString();const result=await db.batch([
  db.prepare('INSERT INTO animal_history (operationId,animalId,action,reason,before,after,createdAt) SELECT ?,?,?,?,?,?,? FROM weights WHERE id=? AND version=?').bind(a.operationId,animal.id,action,reason,JSON.stringify(before),JSON.stringify(next),now,a.id,a.version),
  db.prepare('UPDATE weights SET date=?,pounds=?,originalValue=?,unit=?,session=?,version=version+1 WHERE id=? AND version=?').bind(next.date,next.pounds,next.originalValue,next.unit,next.session,a.id,a.version)
 ]);if(result[1].meta.changes!==1)return Response.json({error:'Weight changed elsewhere. Reload and review.'},{status:409});
 return Response.json({saved:true});
 }catch(e){const message=e instanceof Error?e.message:'Unable to save.';return Response.json({error:message.includes('UNIQUE')?'Another weight already uses this animal and date. Correct that record instead.':message.includes('D1')||message.includes('SQLITE')?'Unable to save. Please retry.':message},{status:400});}}

export const POST=withWriteEpoch(handlePOST);
