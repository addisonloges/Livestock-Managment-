import assert from 'node:assert/strict';
const root='http://127.0.0.1:5173/api/flock',epoch=(await fetch(root)).headers.get('X-Flock-Epoch');
async function post(path,body,status=200){const r=await fetch(root+path,{method:'POST',headers:{'Content-Type':'application/json','X-Flock-Epoch':epoch},body:JSON.stringify(body)}),d=await r.json();assert.equal(r.status,status,JSON.stringify(d));return d}
const id=crypto.randomUUID();await post('',{action:'animal',year:'2026',data:{id,species:'Sheep',name:'Feed allocation QA',sex:'Unknown',origin:'Purchased',birthYear:2026,firstYear:2026,dob:'2026-01-01',breed:'',rightTag:'',leftTag:'',eid:'',sire:'',dam:''}});
const base=(kind,extra={})=>({id:crypto.randomUUID(),version:0,kind,species:'Sheep',date:'2026-01-01',animalIds:[],title:'Operations QA '+kind,notes:'',amountCents:null,category:'',dueDate:'',...extra});
const groupId=crypto.randomUUID(),membership=base('management',{animalIds:[id],management:{groupId,endDate:'2026-01-10'}}),ration=base('ration',{ration:{feedingLb:2,ingredients:[{name:'Hay',pounds:100,pricePerTon:400}]}}),bill=base('expense',{category:'Feed',amountCents:2001});
for(const e of [membership,ration,bill])await post('/events',{year:'2026',data:e,operationId:crypto.randomUUID()});
const input={groupId,start:'2026-01-01',end:'2026-01-10',rationId:ration.id,lbPerHeadDay:2,overrides:{}},operationId=crypto.randomUUID(),body={billId:bill.id,version:1,year:'2026',input,operationId};
const p=await post('/feed-allocation',{...body,action:'preview'});assert.equal(p.snapshot.rows[0].allocatedCents,2001);assert.equal(p.snapshot.rows[0].pounds,20);
await post('/feed-allocation',{...body,action:'save',signature:'stale'},409);
await post('/feed-allocation',{...body,action:'save',signature:p.signature});await post('/feed-allocation',{...body,action:'save',signature:p.signature});
const events=async()=>(await(await fetch(root+'/events')).json()).events;let saved=(await events()).find(e=>e.id===bill.id);assert.equal(saved.version,2);assert.equal(saved.allocations[id],2001);assert.equal(saved.feedAllocation.rows[0].days,10);
await post('/events',{year:'2026',data:{...saved,amountCents:2002},operationId:crypto.randomUUID()},400);
await post('/events',{year:'2026',data:{...saved,notes:'Valid note correction'},operationId:crypto.randomUUID()});
saved=(await events()).find(e=>e.id===bill.id);const revised={...body,version:saved.version,amountCents:3001,operationId:crypto.randomUUID()};const preview=await post('/feed-allocation',{...revised,action:'preview'});await post('/feed-allocation',{...revised,action:'save',signature:preview.signature});saved=(await events()).find(e=>e.id===bill.id);assert.equal(saved.amountCents,3001);assert.equal(saved.allocations[id],3001);
const watch=base('watch',{animalIds:[id],category:'Heat management',watch:{resolvedDate:''}});await post('/events',{year:'2026',data:watch,operationId:crypto.randomUUID()});await post('/events',{year:'2026',data:{...watch,version:1,watch:{resolvedDate:'2026-01-02'}},operationId:crypto.randomUUID()});assert.equal((await events()).find(e=>e.id===watch.id).watch.resolvedDate,'2026-01-02');
console.log('PASS actual feed bill preview/save/retry, stale preview rejection, total correction, protected allocation history, flag resolution');
