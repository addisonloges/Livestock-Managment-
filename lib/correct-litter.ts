import {validateLitter,type Litter} from './lambing';
import {litterArchiveBlock} from './litter-archive';
import type {Animal} from './livestock';

// A birth correction is a single transaction across the litter, profiles and
// original measurements. Dependent records require a separate reconciliation.
export async function correctLitter(db:any,existing:any,next:Litter,operationId:string,reason:string){
 const before=JSON.parse(existing.data) as Litter;
 if(!reason?.trim()||reason.length>500)throw Error('Enter a correction reason up to 500 characters.');
 if(before.species!==next.species||before.date.slice(0,4)!==next.date.slice(0,4))throw Error('Birth corrections must remain in the original species and birth year.');
 if(JSON.stringify(before.lambs)!==JSON.stringify(next.lambs))throw Error('Correct animal identity in its profile. To replace an incorrect litter outcome, void the original litter and record the corrected litter.');
 const stampSql="(SELECT COALESCE(SUM(version),0) FROM animals)||':'||(SELECT COUNT(*)||':'||COALESCE(SUM(version),0) FROM weights)||':'||(SELECT COUNT(*)||':'||COALESCE(SUM(version),0) FROM breeding_groups)||':'||(SELECT COUNT(*)||':'||COALESCE(SUM(version),0) FROM farm_records)";
 const stamp=await db.prepare('SELECT '+stampSql+' AS value').first();
 const all:Animal[]=(await db.prepare('SELECT * FROM animals').all()).results;
 const groups=(await db.prepare('SELECT data FROM breeding_groups').all()).results.map((r:any)=>JSON.parse(r.data));
 const children=all.filter(a=>before.lambs.some(x=>x.outcome==='Alive'&&x.id===a.id));
 if(children.some(a=>a.id===next.damId||a.id===next.sireId))throw Error('An offspring cannot be its own parent or a parent of its littermates.');
 const info=validateLitter(next,all,groups);
 const history=(await db.prepare('SELECT * FROM animal_history').all()).results;
 const weights=(await db.prepare('SELECT * FROM weights').all()).results;
 const records=(await db.prepare('SELECT id,data FROM farm_records').all()).results.map((r:any)=>({...JSON.parse(r.data),id:r.id}));
 const block=litterArchiveBlock(before,children,all,history,groups,records,weights);
 if(block)throw Error(block.replaceAll('voiding','correcting'));
 const now=new Date().toISOString();
 const corrected={...before,date:next.date,damId:next.damId,sireId:next.sireId,groupId:next.groupId,notes:next.notes,assistance:next.assistance,version:before.version+1};
 const statements=[db.prepare("INSERT INTO animals(id,species,sex,origin,firstYear,createdAt) SELECT NULL,'Sheep','Unknown','Purchased',1900,'' WHERE ? != (SELECT "+stampSql+')').bind(stamp.value)];
 for(const animal of children){
  const meta={...JSON.parse(animal.pedigreeInfo||'{}'),breedComposition:info.composition,compositionSource:info.composition.length?'Calculated from parents at birth':''};
  const after={...animal,dob:next.date,sire:next.sireId||null,dam:next.damId||null,breed:info.composition.length===1?info.composition[0].breed:info.composition.length?'Composite':'',pedigreeInfo:JSON.stringify(meta),version:animal.version+1,litterArchiveId:before.id};
  statements.push(db.prepare('UPDATE animals SET dob=?,sire=?,dam=?,breed=?,pedigreeInfo=?,version=version+1 WHERE id=? AND version=?').bind(after.dob,after.sire,after.dam,after.breed,after.pedigreeInfo,animal.id,animal.version));
  statements.push(db.prepare("INSERT INTO animal_history(operationId,animalId,action,reason,before,after,createdAt) VALUES (?,?,'birth-correction',?,?,?,?)").bind(crypto.randomUUID(),animal.id,reason,JSON.stringify(animal),JSON.stringify(after),now));
  statements.push(db.prepare('UPDATE weights SET date=?,version=version+1 WHERE animalId=? AND session=?').bind(next.date,animal.id,'Birth · '+before.id));
 }
 statements.push(db.prepare('UPDATE farm_records SET date=?,data=?,version=version+1 WHERE id=? AND version=?').bind(next.date,JSON.stringify(corrected),before.id,before.version));
 statements.push(db.prepare('INSERT INTO farm_history(operationId,recordId,before,after,createdAt) VALUES (?,?,?,?,?)').bind(operationId,before.id,existing.data,JSON.stringify({...corrected,changeReason:reason}),now));
 await db.batch(statements);
}
