import assert from 'node:assert/strict';
const root='http://127.0.0.1:5173/api/flock';
async function post(path,body){const r=await fetch(root+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,data:await r.json()}}
let c={id:crypto.randomUUID(),version:0,name:'QA veterinary supplier',role:'Veterinarian',phone:'',email:'',address:'',notes:'',archived:false};
let r=await post('/contacts',{year:'2026',operationId:crypto.randomUUID(),data:c});assert.equal(r.status,200,JSON.stringify(r));
const event={id:crypto.randomUUID(),version:0,kind:'expense',species:'Sheep',date:'2026-09-13',animalIds:[],title:'Contact QA bill',notes:'',amountCents:100,category:'Veterinary',dueDate:'',counterparty:{id:c.id,name:'Untrusted replacement name'}};
r=await post('/events',{year:'2026',operationId:crypto.randomUUID(),data:event});assert.equal(r.status,200,JSON.stringify(r));
c={...c,version:1,name:'QA renamed contact',archived:true};assert.equal((await post('/contacts',{year:'2026',operationId:crypto.randomUUID(),data:c})).status,200);
let e=(await(await fetch(root+'/events')).json()).events.find(e=>e.id===event.id);assert.equal(e.counterparty.name,'QA veterinary supplier');
assert.equal((await post('/events',{year:'2026',operationId:crypto.randomUUID(),data:{...e,notes:'Correction'}})).status,200);
assert.equal((await post('/events',{year:'2026',operationId:crypto.randomUUID(),data:{...event,id:crypto.randomUUID()}})).status,400);
assert.equal((await post('/contacts',{year:'all',operationId:crypto.randomUUID(),data:c})).status,400);
console.log('PASS reusable contacts, archived-contact protection and retained transaction name snapshots');
