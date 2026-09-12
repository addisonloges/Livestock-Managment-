import {rawDb} from '@/db';
import {prepareImport,type ImportRow} from '@/lib/animal-import';
import type {Animal} from '@/lib/livestock';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 const text=await req.text();if(text.length>1_000_000)return Response.json({error:'Import is too large. Use at most 200 rows.'},{status:400});
 const body=JSON.parse(text),year=Number(body.year);
 if(!Number.isInteger(year)||year<1900||year>new Date().getFullYear())throw Error('Choose a specific year before importing.');
 if(!Array.isArray(body.rows)||!body.rows.length||body.rows.length>200)throw Error('Import between 1 and 200 animals.');
 const db=rawDb(),{results}=await db.prepare('SELECT * FROM animals').all<Animal>();
 const found=body.rows.filter((r:ImportRow)=>results.some(a=>a.id===r.id));
 if(found.length===body.rows.length)return Response.json({saved:true,count:found.length});
 if(found.length)throw Error('Some of these records already exist. Reload and review before importing again.');
 const {rows,animals,errors}=prepareImport(body.rows,results,year);
 if(errors.length)return Response.json({error:errors.join('\n')},{status:400});
 const now=new Date().toISOString();
 await db.batch(animals.map((a,i)=>db.prepare('INSERT INTO animals (id,species,name,rightTag,leftTag,eid,sex,origin,dob,birthYear,firstYear,breed,sire,dam,status,pedigreeOnly,pedigreeInfo,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(a.id,a.species,a.name,a.rightTag,a.leftTag,a.eid||null,a.sex,a.pedigreeOnly?'Pedigree only':a.origin,a.dob||null,a.birthYear,a.firstYear,a.breed,a.sire,a.dam,a.pedigreeOnly?'Reference':'Active',a.pedigreeOnly,JSON.stringify({rightTagColor:a.rightTag?rows[i].rightTagColor:'',leftTagColor:a.leftTag?rows[i].leftTagColor:'',farm:rows[i].farm,registry:rows[i].registry,registrationNumber:rows[i].registrationNumber,notes:rows[i].notes}),now)));
 return Response.json({saved:true,count:animals.length});
 }catch(e){const message=e instanceof Error?e.message:'Unable to import.';console.error('Animal import failed',e);return Response.json({error:/UNIQUE/.test(message)?'An identifier already exists. No rows were imported. Reload and review the duplicates.':/D1|SQLITE|Database/.test(message)?'Unable to import right now. Keep this preview open and retry.':message},{status:400})}}
