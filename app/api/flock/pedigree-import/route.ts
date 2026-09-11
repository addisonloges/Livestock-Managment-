import {rawDb} from '@/db';
import {planPedigreeImport} from '@/lib/pedigree-import';
import type {Animal} from '@/lib/livestock';
export async function POST(req:Request){try{
 const text=await req.text();if(text.length>1_000_000)throw Error('File is too large.');const body=JSON.parse(text),db=rawDb();
 const {results}=await db.prepare('SELECT * FROM animals').all<Animal>();const plan=planPedigreeImport(body.grid,results,Number(body.year),body.species,body.overrides||{});
 if(body.revision!==plan.revision)return Response.json({error:'Records changed since preview. Close the importer, reopen it and preview again.'},{status:409});
 if(plan.errors.length)throw Error(plan.errors.join('\n'));
 if(!plan.matched)throw Error('No existing animals matched.');
 const queries=[db.prepare('INSERT INTO animals (id) SELECT NULL WHERE (SELECT COALESCE(SUM(version),0) FROM animals) != ?').bind(plan.revision)];
 for(const a of plan.created)queries.push(db.prepare('INSERT INTO animals (id,species,name,sex,origin,firstYear,status,pedigreeOnly,pedigreeInfo,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?)').bind(a.id,a.species,a.name,a.sex,a.origin,a.firstYear,a.status,1,a.pedigreeInfo,a.createdAt));
 for(const u of plan.updates){queries.push(db.prepare('INSERT INTO animal_history (operationId,animalId,action,reason,before,after,createdAt) VALUES (?,?,?,?,?,?,?)').bind(crypto.randomUUID(),u.before.id,'pedigree','Sire/dam and registration information restored from spreadsheet',JSON.stringify(u.before),JSON.stringify(u.after),new Date().toISOString()));queries.push(db.prepare('UPDATE animals SET sire=?,dam=?,pedigreeInfo=?,version=version+1 WHERE id=? AND version=?').bind(u.after.sire,u.after.dam,u.after.pedigreeInfo,u.before.id,u.before.version))}
 await db.batch(queries);return Response.json({saved:true,updated:plan.updates.length,ancestors:plan.created.length,matched:plan.matched,skipped:plan.skipped.length});
 }catch(e){const message=e instanceof Error?e.message:'Unable to save pedigree updates.';return Response.json({error:/D1|SQLITE|constraint|Database/i.test(message)?'Records may have changed. Nothing was saved; reload and preview again.':message},{status:400})}}
