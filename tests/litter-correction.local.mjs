import assert from 'node:assert/strict';
const root='http://127.0.0.1:5173/api/flock';
async function post(path,body){const r=await fetch(root+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,data:await r.json()}}
const child={id:crypto.randomUUID(),name:'Birth correction QA',sex:'Female',rightTag:'',leftTag:'',rightTagColor:'',leftTagColor:'',eid:'',outcome:'Alive',birthWeight:8,unit:'lb',cause:''};
let litter={id:crypto.randomUUID(),version:0,species:'Sheep',date:'2026-07-01',damId:'',sireId:'',groupId:'',assistance:'',notes:'QA only',lambs:[child]};
const save=()=>post('/lambing',{data:litter,year:'2026',operationId:crypto.randomUUID(),reason:'Correct birth date'});
assert.equal((await save()).status,200);
const reload=async()=>{litter=(await(await fetch(root+'/lambing')).json()).litters.find(l=>l.id===litter.id)};
await reload();litter.date='2026-07-02';let result=await save();assert.equal(result.status,200,JSON.stringify(result));
let flock=await(await fetch(root)).json();assert.equal(flock.animals.find(a=>a.id===child.id).dob,litter.date);assert.equal(flock.weights.find(w=>w.animalId===child.id).date,litter.date);
await reload();litter.date='2026-07-03';assert.equal((await save()).status,200);
await reload();litter.damId=child.id;assert.equal((await save()).status,400);
await reload();const event={id:crypto.randomUUID(),version:0,kind:'note',species:'Sheep',date:'2026-08-01',animalIds:[child.id],title:'Later history',notes:'',amountCents:null,category:'',dueDate:''};
assert.equal((await post('/events',{data:event,year:'2026',operationId:crypto.randomUUID()})).status,200);
litter.date='2026-07-04';assert.equal((await save()).status,400);
flock=await(await fetch(root)).json();assert.equal(flock.animals.find(a=>a.id===child.id).dob,'2026-07-03');
console.log('PASS: birth correction updates profiles and weights atomically, repeats safely and protects dependent history');
