import assert from 'node:assert/strict';
const root='http://127.0.0.1:5173/api/flock';
async function post(path,body){const r=await fetch(root+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,data:await r.json()}}
const p={id:crypto.randomUUID(),version:0,species:'Sheep',name:'QA lamb report',archived:false,filter:{query:'',status:'Active',sex:'Female',breed:'',birthYear:'2026',sort:'Animal'}};
const op=crypto.randomUUID();assert.equal((await post('/report-presets',{year:'2026',operationId:op,data:p})).status,200);assert.equal((await post('/report-presets',{year:'2026',operationId:op,data:p})).status,200);
const saved=(await(await fetch(root+'/report-presets')).json()).presets.find(x=>x.id===p.id);assert.deepEqual(saved.filter,p.filter);
assert.equal((await post('/report-presets',{year:'2026',operationId:crypto.randomUUID(),data:p})).status,409);
const base={id:crypto.randomUUID(),version:0,species:'Sheep',date:'2027-01-01',kind:'growthplan',title:'QA future growth',notes:'',animalIds:[],amountCents:null,category:'',dueDate:'',growth:{startWeight:70,targetWeight:140,expectedAdg:0.5,feedPerDay:2,feedPricePerTon:null,otherCost:null,salePricePerLb:null,dressingPercent:null}};
let r=await post('/events',{year:'2027',operationId:crypto.randomUUID(),data:base});assert.equal(r.status,200,JSON.stringify(r));
r=await post('/events',{year:'2027',operationId:crypto.randomUUID(),data:{...base,id:crypto.randomUUID(),kind:'ration',growth:undefined,ration:{stage:'Replacement rams',source:'QA source',feedingLb:2,ingredients:[{name:'QA feed',pounds:100,pricePerTon:null}]}}});assert.equal(r.status,200,JSON.stringify(r));
console.log('PASS: saved filter persistence/retry/conflict, future growth plans, and unknown ration prices');
