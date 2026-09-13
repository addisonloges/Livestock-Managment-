import assert from 'node:assert/strict';
const root='http://127.0.0.1:5173/api/flock';
const flock=await(await fetch(root)).json();
const used=new Set(flock.weights.filter(w=>w.date==='2026-08-01').map(w=>w.animalId));
const animal=flock.animals.find(a=>!a.pedigreeOnly&&!a.archivedAt&&a.species==='Sheep'&&a.firstYear<=2026&&(!a.dob||a.dob<'2026-08-01')&&!used.has(a.id));assert.ok(animal);
async function post(data){const r=await fetch(root+'/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data,year:'2026',operationId:crypto.randomUUID()})});return {status:r.status,body:await r.json()}}
const e={id:crypto.randomUUID(),version:0,kind:'weaning',species:'Sheep',date:'2026-08-01',animalIds:[animal.id],title:'QA weaning',notes:'Local only',amountCents:null,category:'',dueDate:'',weaningWeights:{[animal.id]:{value:45,unit:'lb'}}};
assert.equal((await post(e)).status,200);
const saved=(await(await fetch(root+'/events')).json()).events.find(x=>x.id===e.id);assert.equal(saved.weightIds.length,1);
const updated=await(await fetch(root)).json();assert.equal(updated.weights.find(w=>w.id===saved.weightIds[0]).originalValue,45);
assert.equal((await post({...e,id:crypto.randomUUID()})).status,400);
assert.equal((await post({...saved,weaningWeights:{[animal.id]:{value:50,unit:'lb'}}})).status,400);
const group={...e,id:crypto.randomUUID(),kind:'management',management:{groupId:crypto.randomUUID(),endDate:'2026-08-31'}};delete group.weaningWeights;
assert.equal((await post(group)).status,200);
assert.equal((await post({...group,id:crypto.randomUUID(),date:'2026-08-15'})).status,400);
assert.equal((await post({...group,id:crypto.randomUUID(),date:'2026-09-01',management:{...group.management,endDate:''}})).status,200);
console.log('PASS shared weaning weight, duplicate rollback, measurement correction protection and dated membership overlap checks.');
