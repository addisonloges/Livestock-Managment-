import {weightState} from '@/lib/weight-records';
import {statuses,statusAt,resolvedStatusEvents} from '@/lib/animal-status';
import {updateTagRecords} from '@/lib/tag-records';
import {rawDb} from '@/db';
import {validateAnimal,validDate,relationshipMatrix,ancestorInfo,validateParentDates,type Animal} from '@/lib/livestock';
export const dynamic='force-dynamic';
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(){try{const db=rawDb();const [a,w,h]=await db.batch([db.prepare('SELECT * FROM animals ORDER BY seq DESC'),db.prepare('SELECT * FROM weights ORDER BY date DESC'),db.prepare('SELECT * FROM animal_history ORDER BY createdAt DESC')]);return json({animals:a.results.map((animal:any)=>({...animal,statusEvents:resolvedStatusEvents(h.results.filter((e:any)=>e.animalId===animal.id&&e.action==='status').map((e:any)=>({...JSON.parse(e.after).statusEvent,operationId:e.operationId,reason:e.reason})) )})),weights:w.results.map((weight:any)=>weightState(weight,h.results)),history:h.results})}catch(e){console.error('Flock load failed',e);return json({error:'Records could not be loaded. Please try again.'},503)}}
export async function POST(req:Request){try{
 const body:any=await req.json();if(body.year==='all')return json({error:'All Years is read-only. Choose a specific year to save.'},400);
 const year=Number(body.year);if(!Number.isInteger(year)||year<1900||year>new Date().getFullYear())throw Error('Choose a valid year.');
 const db=rawDb();const a=body.data;if(!a||typeof a!=='object')throw Error('Record details are required.');
 const id=String(a.id||'');if(!/^[0-9a-f-]{36}$/i.test(id))throw Error('Invalid record identifier.');
 if(['archive','restore','edit','pedigree','ancestor-edit','tag','status'].includes(body.action)){
  const existing=await db.prepare('SELECT * FROM animals WHERE id=?').bind(id).first<Animal>();
  if(!existing||(!existing.pedigreeOnly&&existing.firstYear>year))throw Error('Select an animal present in this year.');
  const operationId=String(a.operationId||'');if(!/^[0-9a-f-]{36}$/i.test(operationId))throw Error('Invalid change identifier.');
  const prior=await db.prepare('SELECT animalId,action FROM animal_history WHERE operationId=?').bind(operationId).first<{animalId:string;action:string}>();
  if(prior){if(prior.animalId!==id||prior.action!==body.action)throw Error('Change identifier already used.');return json({saved:true,id})}
  if(!Number.isInteger(a.version)||existing.version!==a.version)return json({error:'This animal changed in another view. Close this form and reload before trying again.'},409);
  const reason=String(a.reason||'').trim();if(!reason||reason.length>500)throw Error('Enter a reason (up to 500 characters).');
  if(body.action==='restore'&&!existing.archivedAt)throw Error('This animal is not deleted.');
  if(body.action!=='restore'&&existing.archivedAt)throw Error('Restore this animal before changing it.');
  const now=new Date().toISOString();
  const next:Animal & {tagChange?:any;statusEvent?:any}={...existing,version:existing.version+1};
  let graphVersion=-1;
  if(body.action==='edit'||body.action==='ancestor-edit'){
   if(typeof a.name!=='string'||typeof a.breed!=='string'||a.name.length>200||a.breed.length>200)throw Error('Name and breed must be 200 characters or fewer.');
   next.name=a.name.trim();next.breed=a.breed.trim();
   if(body.action==='edit'){for(const field of ['rightTag','leftTag','eid'] as const){if(field in a&&String(a[field]||'').trim()!==(existing[field]||''))throw Error('Use Manage tags to correct, retire, or assign a tag.');}}
   if(body.action==='edit'&&'info' in a){
    if(!a.info||typeof a.info!=='object'||Array.isArray(a.info))throw Error('Invalid registration details.');
    const info=JSON.parse(existing.pedigreeInfo||'{}');
    for(const field of ['registry','registrationNumber','membershipId','flockNameId','farm','notes']){if(field in a.info){const value=a.info[field];if(typeof value!=='string'||value.length>(field==='notes'?2000:200))throw Error('Registration details or notes exceed the allowed length.');info[field]=value.trim();}}
    next.pedigreeInfo=JSON.stringify(info);
   }
   if(body.action==='edit'&&('sex' in a||'dob' in a||'birthYear' in a)){
    next.sex=a.sex??existing.sex;next.dob='dob' in a?(a.dob||null):existing.dob;
    next.birthYear=next.dob?Number(next.dob.slice(0,4)):'birthYear' in a?(a.birthYear??null):existing.birthYear;
    validateAnimal({...next,origin:next.pedigreeOnly?'Purchased':next.origin});
    const {results}=await db.prepare('SELECT * FROM animals').all<Animal>();graphVersion=results.reduce((sum,p)=>sum+p.version,0);
    for(const child of results.filter(p=>p.sire===id||p.dam===id)){if((child.sire===id&&next.sex!=='Male')||(child.dam===id&&next.sex!=='Female'))throw Error('This animal is already linked as a parent. Correct those links before changing its sex.');validateParentDates(child,next)}
    for(const parent of results.filter(p=>p.id===next.sire||p.id===next.dam))validateParentDates(next,parent);
    const weight=await db.prepare('SELECT date FROM weights WHERE animalId=? ORDER BY date LIMIT 1').bind(id).first<{date:string}>();
    if(weight&&next.dob&&weight.date<next.dob)throw Error('Birth date cannot be after an existing weight record.');
   }
   if(body.action==='ancestor-edit'){
    if(!existing.pedigreeOnly)throw Error('This action only edits pedigree-only records.');
    if(!next.name)throw Error('Enter an ancestor name or identifying label.');
    next.dob=a.dob||null;next.birthYear=next.dob?Number(next.dob.slice(0,4)):a.birthYear??null;
    next.pedigreeInfo=JSON.stringify(ancestorInfo(a.info));
    validateAnimal({...next,origin:'Purchased',firstYear:new Date().getFullYear()});
    const {results}=await db.prepare('SELECT * FROM animals').all<Animal>();
    graphVersion=results.reduce((sum,p)=>sum+p.version,0);
    for(const child of results.filter(p=>p.sire===id||p.dam===id))validateParentDates(child,next);
    for(const parent of results.filter(p=>p.id===next.sire||p.id===next.dam))validateParentDates(next,parent);
   }
  }else if(body.action==='status'){
   if(existing.pedigreeOnly)throw Error('Record status only for flock animals.');
   if(!statuses.includes(a.status))throw Error('Choose a valid status.');
   if(typeof a.date!=='string'||(a.date&&(!validDate(a.date)||Number(a.date.slice(0,4))!==year||a.date>now.slice(0,10)||(existing.dob&&a.date<existing.dob)))||(!a.date&&a.status==='Active'))throw Error('Choose a valid effective date in the selected year, not before birth or in the future.');
   const {results}=await db.prepare("SELECT after,operationId FROM animal_history WHERE animalId=? AND action='status'").bind(id).all<{after:string;operationId:string}>();
   const events=resolvedStatusEvents(results.map(h=>({...JSON.parse(h.after).statusEvent,operationId:h.operationId})));
   const correction=a.correctLatest?events.at(-1):undefined;
   if(a.correctLatest&&!correction)throw Error('There is no status entry to correct.');
   const prior=correction?events.filter(e=>e.operationId!==correction.operationId):events;
   const unresolved=prior.find(e=>!e.date);
   if(unresolved&&(!a.date||unresolved.status!==a.status))throw Error('Enter the missing date for the existing status before adding another status.');
   if(!a.date&&prior.length)throw Error('An undated exit can only be recorded before dated status events.');
   if(prior.some(e=>e.date&&e.date>=a.date))throw Error('Use a date after the last status event. Earlier event corrections need review.');
   if(existing.status===a.status&&!unresolved&&!correction)throw Error('This animal already has that status.');
   const isCull=a.status==='Culled'||(['Sold','Transferred'].includes(a.status)&&a.exitReason==='Cull');
   if(isCull&&(typeof a.cullReason!=='string'||!a.cullReason.trim()||a.cullReason.length>200))throw Error('Enter a cull reason, up to 200 characters.');
   if(a.status!=='Active'&&a.date){
    const later=await db.prepare('SELECT date FROM weights WHERE animalId=? AND date>? LIMIT 1').bind(id,a.date).first();
    if(later)throw Error('There are weight records after this exit date. Review those dates first.');
   }
   next.status=a.status;next.statusEvent={date:a.date,recordedOn:now.slice(0,10),...((correction||unresolved)?{supersedes:(correction||unresolved)!.operationId}:{}),status:a.status,exitReason:isCull?'Cull':'',cullReason:isCull?a.cullReason.trim():''};
  }else if(body.action==='tag'){
   const changed=updateTagRecords(existing,a,year);next.tagChange=changed.event;next.rightTag=changed.rightTag;next.leftTag=changed.leftTag;next.eid=changed.eid;next.pedigreeInfo=changed.pedigreeInfo;
   const {results}=await db.prepare('SELECT after FROM animal_history WHERE animalId=? AND action=?').bind(id,'tag').all<{after:string}>();
   if(results.some(h=>{const t=JSON.parse(h.after).tagChange;return t&&t.date>changed.event.date}))throw Error('Tag date must be on or after the last event for this position.');
  }else if(body.action==='pedigree'){
   next.sire=a.sire||null;next.dam=a.dam||null;
   const {results}=await db.prepare('SELECT * FROM animals').all<Animal>();
   graphVersion=results.reduce((sum,p)=>sum+p.version,0);
   for(const role of ['sire','dam'] as const){if(next[role]){
    const p=results.find(p=>p.id===next[role]);
    if(!p||p.id===id||p.species!==existing.species||p.sex!==(role==='sire'?'Male':'Female'))throw Error('Choose a different recorded parent of the same species and correct sex.');
    validateParentDates(existing,p);
   }}
   relationshipMatrix(results.map(p=>p.id===id?next:p));
  }else next.archivedAt=body.action==='archive'?now:null;
  const result=await db.batch([
   db.prepare('INSERT INTO animal_history (operationId,animalId,action,reason,before,after,createdAt) SELECT ?,?,?,?,?,?,? FROM animals WHERE id=? AND version=? AND (?=-1 OR (SELECT SUM(version) FROM animals)=?)').bind(operationId,id,body.action,reason,JSON.stringify(existing),JSON.stringify(next),now,id,a.version,graphVersion,graphVersion),
   db.prepare('UPDATE animals SET archivedAt=?,name=?,breed=?,sire=?,dam=?,dob=?,birthYear=?,pedigreeInfo=?,sex=?,rightTag=?,leftTag=?,eid=?,status=?,version=version+1 WHERE id=? AND version=? AND (?=-1 OR (SELECT SUM(version) FROM animals)=?)').bind(next.archivedAt||null,next.name,next.breed,next.sire,next.dam,next.dob,next.birthYear,next.pedigreeInfo||'{}',next.sex,next.rightTag,next.leftTag,next.eid,next.status,id,a.version,graphVersion,graphVersion)
  ]);
  if(result[1].meta.changes!==1)return json({error:'This animal changed in another view. Reload before trying again.'},409);
 }else if(body.action==='ancestor'){
  validateAnimal({...a,origin:'Purchased',firstYear:new Date().getFullYear()});
  if(!['Male','Female'].includes(a.sex))throw Error('Choose the ancestor sex.');
  if(typeof a.name!=='string'||!a.name.trim())throw Error('Enter an ancestor name or identifying label.');
  const info=JSON.stringify(ancestorInfo(a.info));
  const existing=await db.prepare('SELECT id,pedigreeOnly FROM animals WHERE id=?').bind(id).first<Animal>();
  if(existing){if(!existing.pedigreeOnly)throw Error('Record identifier already used.');return json({saved:true,id})}
  await db.prepare('INSERT INTO animals (id,species,name,sex,origin,dob,birthYear,firstYear,breed,status,pedigreeOnly,pedigreeInfo,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,a.species,a.name.trim(),a.sex,'Pedigree only',a.dob||null,a.dob?Number(a.dob.slice(0,4)):a.birthYear??null,year,String(a.breed||'').trim(),'Reference',1,info,new Date().toISOString()).run();
 }else if(body.action==='animal'){
  const colors:Record<string,string>={};
  for(const field of ['rightTag','leftTag']){const color=a[field+'Color']??'';if(String(a[field]||'').trim()&&(typeof color!=='string'||color.length>60))throw Error('Tag colors must be text up to 60 characters.');colors[field+'Color']=String(a[field]||'').trim()?color.trim():'';}
  validateAnimal(a);if(a.firstYear!==year)throw Error('The first recorded year must match the selected year.');
  const existing=await db.prepare('SELECT id FROM animals WHERE id = ?').bind(id).first();if(existing)return json({saved:true,id});
  const {results}=await db.prepare('SELECT * FROM animals').all<Animal>();
  for(const role of ['sire','dam'] as const){if(a[role]){const p=results.find(x=>x.id===a[role]);if(!p||p.species!==a.species||p.sex!==(role==='sire'?'Male':'Female'))throw Error('Parent must be a recorded animal of the same species and correct sex.');if(p.dob&&a.dob&&p.dob>=a.dob)throw Error('Parents must be born before their offspring.');if(p.birthYear&&a.birthYear&&p.birthYear>a.birthYear)throw Error('A parent cannot have a later birth year.')}}
  relationshipMatrix([...results,{id,sire:a.sire||null,dam:a.dam||null}]);
  const vals=[id,a.species,String(a.name||'').trim(),String(a.rightTag||'').trim(),String(a.leftTag||'').trim(),String(a.eid||'').trim()||null,a.sex,a.origin,a.dob||null,a.dob?Number(a.dob.slice(0,4)):a.birthYear??null,year,String(a.breed||'').trim(),a.sire||null,a.dam||null,JSON.stringify(colors),new Date().toISOString()];
  await db.prepare('INSERT INTO animals (id,species,name,rightTag,leftTag,eid,sex,origin,dob,birthYear,firstYear,breed,sire,dam,pedigreeInfo,createdAt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(...vals).run();
 }else if(body.action==='weight'){
  if(!validDate(a.date)||Number(a.date.slice(0,4))!==year||a.date>new Date().toISOString().slice(0,10))throw Error('Weight date must be in the selected year and not in the future.');
  const animal=await db.prepare('SELECT * FROM animals WHERE id = ?').bind(a.animalId).first<Animal>();if(!animal||animal.pedigreeOnly||animal.archivedAt||animal.firstYear>year)throw Error('Select an animal present in this year.');if(animal.dob&&a.date<animal.dob)throw Error('Weight date cannot precede birth.');
  const statusHistory=await db.prepare("SELECT after,operationId FROM animal_history WHERE animalId=? AND action='status'").bind(animal.id).all<{after:string}>();
  const statusEvents=resolvedStatusEvents(statusHistory.results.map((h:any)=>({...JSON.parse(h.after).statusEvent,operationId:h.operationId})));
  if(statusAt({...animal,statusEvents},a.date)!=='Active'&&!statusEvents.some(e=>e.date===a.date&&e.status!=='Active'))throw Error('This animal was not active on the weight date.');
  const value=Number(a.originalValue);if(!Number.isFinite(value)||value<=0||value>10000||!['lb','kg'].includes(a.unit))throw Error('Enter a positive measured weight and a valid unit.');
  if(!String(a.session||'').trim()||String(a.session).length>200)throw Error('Enter a session name (up to 200 characters).');
  if(await db.prepare('SELECT id FROM weights WHERE id=?').bind(id).first())return json({saved:true,id});
  await db.prepare('INSERT INTO weights (id,animalId,date,pounds,originalValue,unit,session,createdAt) VALUES (?,?,?,?,?,?,?,?)').bind(id,a.animalId,a.date,value*(a.unit==='kg'?2.2046226218:1),value,a.unit,a.session.trim(),new Date().toISOString()).run();
 }else throw Error('Unknown operation.');
 return json({saved:true,id});
 }catch(e){console.error('Flock save failed',e);const m=e instanceof Error?e.message:'';if(m.includes('UNIQUE'))return json({error:'That EID or animal/date weight already exists. Review the existing record.'},409);if(m.includes('D1')||m.includes('SQLITE')||m.includes('Database'))return json({error:'Unable to save right now. Your form is still available; please retry.'},503);return json({error:m||'Unable to save this record.'},400)}}
