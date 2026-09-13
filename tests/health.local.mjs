import assert from 'node:assert/strict';
const root='http://127.0.0.1:5173/api/flock';
const flock=await(await fetch(root)).json(),animal=flock.animals.find(a=>a.name==='Litter QA');assert.ok(animal);
async function post(data,action='save'){const r=await fetch(root+'/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({data,action,year:'2026',operationId:crypto.randomUUID(),reason:'Local QA'})});return {status:r.status,body:await r.json()}}
const lot={id:crypto.randomUUID(),version:0,kind:'stock',species:'Sheep',date:'2026-04-01',animalIds:[],title:'QA inventory only',notes:'Local test',amountCents:null,category:'',dueDate:'',stock:{quantity:100,unit:'mL',expires:'2027-01-01',lowAt:10}};
assert.equal((await post(lot)).status,200);lot.version=1;
const treatment={...lot,id:crypto.randomUUID(),version:0,kind:'treatment',animalIds:[animal.id],protocol:{lotId:lot.id,product:'QA product',route:'Recorded route',reference:'Test only',withdrawalEnd:'',doses:[{date:'2026-04-01',amount:2,unit:'mL',state:'Given',overrides:{[animal.id]:3}}]}};delete treatment.stock;
assert.equal((await post(treatment)).status,200);
assert.equal((await post(lot,'void')).status,400);
assert.equal((await post({...lot,stock:{...lot.stock,unit:'oz'}})).status,400);
const history=await(await fetch(root+'/events/history?id='+treatment.id)).json();assert.equal(history.history.length,1);assert.equal(history.history[0].after.protocol.doses[0].overrides[animal.id],3);
assert.equal((await post({...treatment,id:crypto.randomUUID(),protocol:{...treatment.protocol,doses:[{...treatment.protocol.doses[0],unit:'oz'}]}})).status,400);
console.log('PASS inventory linkage, dose overrides, incompatible units, linked-lot protection and readable history.');
