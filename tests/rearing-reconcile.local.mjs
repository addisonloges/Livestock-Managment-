import assert from 'node:assert/strict';
const root='http://127.0.0.1:5173/api/flock';
async function post(path,body){const r=await fetch(root+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,data:await r.json()}}
const child={id:crypto.randomUUID(),name:'Reconcile QA',sex:'Female',rightTag:'',leftTag:'',rightTagColor:'',leftTagColor:'',eid:'',outcome:'Alive',birthWeight:null,unit:'lb',cause:''};
let litter={id:crypto.randomUUID(),version:0,species:'Sheep',date:'2026-07-01',damId:'',sireId:'',groupId:'',assistance:'',notes:'QA only',lambs:[child]};
assert.equal((await post('/lambing',{data:litter,year:'2026',operationId:crypto.randomUUID()})).status,200);
let flock=await(await fetch(root)).json(),animal=flock.animals.find(a=>a.id===child.id);
let r=await post('',{action:'edit',year:'2026',data:{id:animal.id,name:animal.name,breed:animal.breed,version:animal.version,dob:'2026-06-01',reason:'Correct source birth date',operationId:crypto.randomUUID()}});assert.equal(r.status,200,JSON.stringify(r));
const event={id:crypto.randomUUID(),version:0,kind:'selection',species:'Sheep',date:'2026-08-01',animalIds:[child.id],title:'Retain QA',notes:'',amountCents:null,category:'Retain',dueDate:''};assert.equal((await post('/events',{data:event,year:'2026',operationId:crypto.randomUUID()})).status,200);
litter=(await(await fetch(root+'/lambing')).json()).litters.find(l=>l.id===litter.id);litter.date='2026-06-01';r=await post('/lambing',{data:litter,year:'2026',operationId:crypto.randomUUID(),reason:'Reconcile already corrected profile'});assert.equal(r.status,200,JSON.stringify(r));
flock=await(await fetch(root)).json();animal=flock.animals.find(a=>a.id===child.id);assert.equal(animal.version,2);assert.equal(animal.status,'Active');assert.equal(animal.dam,null);
const foster=flock.animals.find(a=>a.id!==animal.id&&a.sex==='Female'&&a.species==='Sheep'&&!a.pedigreeOnly&&a.dob&&a.dob<'2026-08-01');assert.ok(foster);
r=await post('/events',{year:'2026',operationId:crypto.randomUUID(),data:{...event,id:crypto.randomUUID(),kind:'rearing',category:'Fostered',title:'Foster QA',rearing:{fosterDamId:foster.id,numberReared:2}}});assert.equal(r.status,200,JSON.stringify(r));
flock=await(await fetch(root)).json();assert.equal(flock.animals.find(a=>a.id===animal.id).dam,null);
console.log('PASS retention leaves status unchanged; litter reconciles without rewriting profiles; foster details preserve pedigree');
