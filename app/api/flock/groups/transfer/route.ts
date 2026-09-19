import {rawDb} from '@/db';
import {withWriteEpoch} from '@/db/recovery-context';
import {planGroupTransfer,type TransferInput} from '@/lib/group-transfer';
import {validateEvent,type FarmEvent} from '@/lib/farm-events';
import {isUuid} from '@/lib/lambing';
import type {Animal} from '@/lib/livestock';
export const dynamic='force-dynamic';
export const POST=withWriteEpoch(async(req:Request)=>{
 try{
  const b=await req.json() as TransferInput&{operationId:string;versions:{id:string;version:number}[]};
  if(!isUuid(b.operationId)||!Array.isArray(b.versions))throw Error('Reload groups before transferring.');
  const db=rawDb(),prior=await db.prepare('SELECT recordId FROM farm_history WHERE operationId=?').bind(b.operationId).first();
  if(prior)return Response.json({saved:true});
  const rows=await db.prepare("SELECT id,data,version FROM farm_records WHERE kind='management' AND species=?").bind(b.species).all<{id:string;data:string;version:number}>();
  const signature=(r:{id:string;version:number}[])=>JSON.stringify(r.map(e=>[e.id,e.version]).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))));
  if(signature(rows.results)!==signature(b.versions))return Response.json({error:'Group membership changed. Reload groups and review this transfer.'},{status:409});
  const events:FarmEvent[]=rows.results.map(r=>({...JSON.parse(r.data),version:r.version}));
  const plan=planGroupTransfer(events,b,()=>crypto.randomUUID()),animals=(await db.prepare('SELECT * FROM animals').all<Animal>()).results;
  for(const e of [...plan.updates,...plan.creates])validateEvent(e,animals);
  const now=new Date().toISOString(),statements=[];
  // All version/count guards and writes execute in one transaction, including the recovery epoch guard.
  statements.push(db.prepare("INSERT INTO animals(id,species,sex,origin,firstYear,createdAt) SELECT NULL,'Sheep','Unknown','Purchased',1900,'' WHERE (SELECT COUNT(*) FROM farm_records WHERE kind='management' AND species=?)!=?").bind(b.species,rows.results.length));
  for(const r of rows.results)statements.push(db.prepare("INSERT INTO animals(id,species,sex,origin,firstYear,createdAt) SELECT NULL,'Sheep','Unknown','Purchased',1900,'' WHERE NOT EXISTS (SELECT 1 FROM farm_records WHERE id=? AND version=?)").bind(r.id,r.version));
  for(const e of [...plan.updates,...plan.creates]){
   const old=rows.results.find(r=>r.id===e.id),next={...e,version:(old?.version||0)+1},data=JSON.stringify(next);
   if(old)statements.push(db.prepare('UPDATE farm_records SET data=?,version=version+1 WHERE id=?').bind(data,e.id));
   else statements.push(db.prepare('INSERT INTO farm_records(id,kind,species,date,data,version) VALUES (?,?,?,?,?,1)').bind(e.id,e.kind,e.species,e.date,data));
   statements.push(db.prepare('INSERT INTO farm_history(operationId,recordId,before,after,createdAt) VALUES (?,?,?,?,?)').bind(e.id===plan.target.id?b.operationId:crypto.randomUUID(),e.id,old?.data||'{}',JSON.stringify({...next,changeReason:'Group transfer',transferOperationId:b.operationId}),now));
  }
  await db.batch(statements);return Response.json({saved:true});
 }catch(e){const message=(e as Error).message;return Response.json({error:/SQLITE|constraint|UNIQUE/i.test(message)?'The transfer could not be saved because records changed. Reload and review; no partial transfer was saved.':message},{status:400})}
});
