import assert from 'node:assert/strict';
const root='http://127.0.0.1:5173/api/flock';
async function post(path,body){const r=await fetch(root+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,data:await r.json()}}
let flock=await(await fetch(root)).json(),animal=flock.animals.find(a=>a.name==='Litter QA'&&a.status==='Active'&&!a.archivedAt);assert.ok(animal);
const setting=await(await fetch(root+'/settings')).json(),field={id:crypto.randomUUID(),name:'QA score '+Date.now(),type:'Number',choices:[],archived:false};
let r=await post('/settings',{fields:[...setting.fields,field],version:setting.version,year:'2026',operationId:crypto.randomUUID()});assert.equal(r.status,200,JSON.stringify(r.data));
r=await post('/custom-values',{animalId:animal.id,version:animal.version,year:'2026',operationId:crypto.randomUUID(),values:{[field.id]:7}});assert.equal(r.status,200,JSON.stringify(r.data));
flock=await(await fetch(root)).json();animal=flock.animals.find(a=>a.id===animal.id);assert.equal(JSON.parse(animal.pedigreeInfo).customValues[field.id],7);
assert.equal((await post('/custom-values',{animalId:animal.id,version:animal.version,year:'2026',operationId:crypto.randomUUID(),values:{[field.id]:'invalid'}})).status,400);
const event={id:crypto.randomUUID(),version:0,kind:'income',species:'Sheep',date:'2026-09-13',animalIds:[animal.id],title:'QA sale',notes:'Local only',amountCents:50000,category:'Livestock sale',dueDate:'',sale:{buyer:'Local QA',disposition:'Sold',exitReason:'Cull',cullReason:'QA reason'}};
r=await post('/events',{data:event,year:'2026',operationId:crypto.randomUUID()});assert.equal(r.status,200,JSON.stringify(r.data));
flock=await(await fetch(root)).json();animal=flock.animals.find(a=>a.id===animal.id);assert.equal(animal.status,'Sold');assert.equal(animal.statusEvents.at(-1).cullReason,'QA reason');
const before=(await(await fetch(root+'/events')).json()).events.length;
assert.equal((await post('/events',{data:{...event,id:crypto.randomUUID()},year:'2026',operationId:crypto.randomUUID()})).status,400);
assert.equal((await(await fetch(root+'/events')).json()).events.length,before);
console.log('PASS typed values, invalid value rejection, atomic sale/status/cull record and duplicate-exit prevention.');
