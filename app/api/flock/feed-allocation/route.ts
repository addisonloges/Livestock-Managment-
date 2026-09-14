import {withWriteEpoch} from '@/db/recovery-context';
import {rawDb} from '@/db';
import {calculateFeed} from '@/lib/feed-allocation';
import {resolvedStatusEvents} from '@/lib/animal-status';
import {isUuid} from '@/lib/lambing';
export const dynamic='force-dynamic';
async function handlePOST(req:Request){try{
 const b:any=await req.json();if(!['preview','save'].includes(b.action)||!isUuid(b.billId)||!isUuid(b.operationId))throw Error('Choose a feed bill and action.');const db=rawDb();const prior:any=await db.prepare('SELECT recordId FROM farm_history WHERE operationId=?').bind(b.operationId).first();if(prior){if(prior.recordId!==b.billId)throw Error('Change identifier reused.');return Response.json({saved:true})}
 const stampSql="(SELECT COUNT(*)||':'||COALESCE(SUM(version),0) FROM farm_records)||':'||(SELECT COUNT(*)||':'||COALESCE(SUM(version),0) FROM animals)||':'||(SELECT COUNT(*) FROM animal_history)",stamp:any=await db.prepare('SELECT '+stampSql+' AS value').first();
 const [records,animalRows,h]=await db.batch([db.prepare('SELECT * FROM farm_records'),db.prepare('SELECT * FROM animals'),db.prepare("SELECT animalId,operationId,after FROM animal_history WHERE action='status'")]);
 const events=records.results.map((r:any)=>({...JSON.parse(r.data),version:r.version})),bill=events.find((e:any)=>e.id===b.billId&&e.kind==='expense'&&!e.voided);if(!bill||bill.category!=='Feed'||String(b.year)!==bill.date.slice(0,4)||bill.version!==b.version)throw Error('Choose a current Feed expense in its recorded year.');
 const animals=animalRows.results.map((a:any)=>({...a,statusEvents:resolvedStatusEvents(h.results.filter((e:any)=>e.animalId===a.id).map((e:any)=>({...JSON.parse(e.after).statusEvent,operationId:e.operationId})))}));
 const amountCents=b.amountCents??bill.amountCents;const snapshot=calculateFeed(b.input,events.filter((e:any)=>e.id!==bill.id),animals,bill.species,amountCents);const signature=JSON.stringify({...snapshot,calculatedAt:''});
 if(b.action==='preview')return Response.json({snapshot,signature});if(b.signature!==signature)return Response.json({error:'Source records changed. Preview again before saving.'},{status:409});
 const next={...bill,amountCents,version:bill.version+1,animalIds:snapshot.rows.map(r=>r.animalId),allocations:Object.fromEntries(snapshot.rows.map(r=>[r.animalId,r.allocatedCents])),feedAllocation:snapshot},now=new Date().toISOString();
 await db.batch([db.prepare("INSERT INTO animals(id,species,sex,origin,firstYear,createdAt) SELECT NULL,'Sheep','Unknown','Purchased',1900,'' WHERE ? != (SELECT "+stampSql+')').bind(stamp.value),db.prepare('UPDATE farm_records SET data=?,version=version+1 WHERE id=? AND version=?').bind(JSON.stringify(next),bill.id,bill.version),db.prepare('INSERT INTO farm_history(operationId,recordId,before,after,createdAt) VALUES (?,?,?,?,?)').bind(b.operationId,bill.id,JSON.stringify(bill),JSON.stringify({...next,changeReason:'Feed allocated from dated membership and ration quantities'}),now)]);
 return Response.json({saved:true});
 }catch(e){return Response.json({error:(e as Error).message},{status:400})}}
export const POST=withWriteEpoch(handlePOST);
