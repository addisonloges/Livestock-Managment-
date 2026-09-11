import {rawDb} from '@/db';
import {validateAnimal,validDate,relationshipMatrix,type Animal} from '@/lib/livestock';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){try{const db=rawDb();const [a,w]=await db.batch([db.prepare('SELECT * FROM animals ORDER BY seq DESC'),db.prepare('SELECT * FROM weights ORDER BY date DESC')]);return json({animals:a.results,weights:w.results})}catch(e){console.error('Flock load failed',e);return json({error:'Records could not be loaded. Please try again.'},503)}}
export async function POST(req:Request){try{
 const body:any=await req.json();if(body.year==='all')return json({error:'All Years is read-only. Choose a specific year to save.'},400);
 const year=Number(body.year);if(!Number.isInteger(year)||year<1900||year>new Date().getFullYear())throw Error('Choose a valid year.');
 const db=rawDb();const a=body.data;if(!a||typeof a!=='object')throw Error('Record details are required.');
 const id=String(a.id||'');if(!/^[0-9a-f-]{36}$/i.test(id))throw Error('Invalid record identifier.');
 if(body.action==='animal'){
  validateAnimal(a);if(a.firstYear!==year)throw Error('The first recorded year must match the selected year.');
  const existing=await db.prepare('SELECT id FROM animals WHERE id = ?').bind(id).first();if(existing)return json({saved:true,id});
  const {results}=await db.prepare('SELECT * FROM animals').all<Animal>();
  for(const role of ['sire','dam'] as const){if(a[role]){const p=results.find(x=>x.id===a[role]);if(!p||p.species!==a.species||p.sex!==(role==='sire'?'Male':'Female'))throw Error('Parent must be a recorded animal of the same species and correct sex.');if(p.dob&&a.dob&&p.dob>=a.dob)throw Error('Parents must be born before their offspring.');if(p.birthYear&&a.birthYear&&p.birthYear>a.birthYear)throw Error('A parent cannot have a later birth year.')}}
  relationshipMatrix([...results,{id,sire:a.sire||null,dam:a.dam||null}]);
  const vals=[id,a.species,String(a.name||'').trim(),String(a.rightTag||'').trim(),String(a.leftTag||'').trim(),String(a.eid||'').trim()||null,a.sex,a.origin,a.dob||null,a.dob?Number(a.dob.slice(0,4)):a.birthYear??null,year,String(a.breed||'').trim(),a.sire||null,a.dam||null,new Date().toISOString()];
  await db.prepare('INSERT INTO animals (id,species,name,rightTag,leftTag,eid,sex,origin,dob,birthYear,firstYear,breed,sire,dam,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(...vals).run();
 }else if(body.action==='weight'){
  if(!validDate(a.date)||Number(a.date.slice(0,4))!==year||a.date>new Date().toISOString().slice(0,10))throw Error('Weight date must be in the selected year and not in the future.');
  const animal=await db.prepare('SELECT * FROM animals WHERE id = ?').bind(a.animalId).first<Animal>();if(!animal||animal.firstYear>year)throw Error('Select an animal present in this year.');if(animal.dob&&a.date<animal.dob)throw Error('Weight date cannot precede birth.');
  const value=Number(a.originalValue);if(!Number.isFinite(value)||value<=0||value>10000||!['lb','kg'].includes(a.unit))throw Error('Enter a positive measured weight and a valid unit.');
  if(!String(a.session||'').trim()||String(a.session).length>200)throw Error('Enter a session name (up to 200 characters).');
  if(await db.prepare('SELECT id FROM weights WHERE id=?').bind(id).first())return json({saved:true,id});
  await db.prepare('INSERT INTO weights (id,animalId,date,pounds,originalValue,unit,session,createdAt) VALUES (?,?,?,?,?,?,?,?)').bind(id,a.animalId,a.date,value*(a.unit==='kg'?2.2046226218:1),value,a.unit,a.session.trim(),new Date().toISOString()).run();
 }else throw Error('Unknown operation.');
 return json({saved:true,id});
 }catch(e){console.error('Flock save failed',e);const m=e instanceof Error?e.message:'';if(m.includes('UNIQUE'))return json({error:'That EID or animal/date weight already exists. Review the existing record.'},409);if(m.includes('D1')||m.includes('SQLITE')||m.includes('Database'))return json({error:'Unable to save right now. Your form is still available; please retry.'},503);return json({error:m||'Unable to save this record.'},400)}}
