import test from 'node:test';import assert from 'node:assert/strict';import {allocation,animalExpenses,validateEvent,animalIncome,cashSummary,lotBalance,rationCost} from '../lib/farm-events.ts';
test('allocation conserves cents and excludes voided bills from animal totals',()=>{assert.deepEqual(allocation(100,['b','a','c']),[{id:'a',cents:34},{id:'b',cents:33},{id:'c',cents:33}]);const e={kind:'expense',date:'2026-01-01',animalIds:['a','b','c'],amountCents:100};assert.equal(animalExpenses([e],'a'),34);assert.equal(animalExpenses([{...e,voided:true}],'a'),0);assert.equal(animalExpenses([{...e,kind:'valuation'}],'a'),0);assert.deepEqual(allocation(100,[]),[])});
test('weaning and condition require valid animals and dates',()=>{const e={id:crypto.randomUUID(),kind:'weaning',species:'Sheep',date:'2026-04-01',animalIds:['a'],title:'Weaned',notes:'',category:'',amountCents:null,dueDate:''},animals=[{id:'a',species:'Sheep',dob:'2026-01-01',firstYear:2026}];assert.doesNotThrow(()=>validateEvent(e,animals));assert.throws(()=>validateEvent({...e,animalIds:[]},animals));assert.throws(()=>validateEvent({...e,date:'2025-01-01'},animals));assert.throws(()=>validateEvent({...e,kind:'condition',category:'8'},animals));assert.throws(()=>validateEvent({...e,kind:'expense',amountCents:10.5},animals));});

test('treatment overrides apply only to selected animals and require positive doses',()=>{
 const animals=[{id:'a',species:'Sheep',dob:'2026-01-01',firstYear:2026}];
 const e={id:crypto.randomUUID(),kind:'treatment',species:'Sheep',date:'2026-04-01',animalIds:['a'],title:'Treatment',notes:'',category:'',amountCents:null,dueDate:'',protocol:{product:'Recorded product',route:'Recorded route',reference:'Veterinary directions',withdrawalEnd:'',doses:[{date:'2026-04-01',amount:2,unit:'mL',state:'Given',overrides:{a:3}}]}};
 assert.doesNotThrow(()=>validateEvent(e,animals));
 e.protocol.doses[0].overrides={b:3};assert.throws(()=>validateEvent(e,animals),/selected animals/);
 e.protocol.doses[0].overrides={a:0};assert.throws(()=>validateEvent(e,animals),/positive/);
 e.protocol.doses[0].overrides={a:NaN};assert.throws(()=>validateEvent(e,animals),/positive/);
});

test('cash report excludes valuations and counts lot income once',()=>{
 const events=[{kind:'income',date:'2026-04-01',animalIds:['a','b'],amountCents:10001},{kind:'expense',date:'2026-04-01',animalIds:['a'],amountCents:1000},{kind:'valuation',date:'2026-04-01',animalIds:['a'],amountCents:999999},{kind:'income',date:'2026-04-01',animalIds:['a'],amountCents:88888,voided:true}];
 assert.deepEqual(cashSummary(events,'2026'),{income:10001,expenses:1000,net:9001});
 assert.equal(animalIncome(events,'a','2026')+animalIncome(events,'b','2026'),10001);
 assert.deepEqual(cashSummary(events,'2025'),{income:0,expenses:0,net:0});
});

test('inventory uses given individual doses and reverses voided protocols',()=>{
 const lot={id:'lot',kind:'stock',stock:{quantity:100,unit:'mL'}};
 const treatment={kind:'treatment',animalIds:['a','b'],protocol:{lotId:'lot',doses:[{date:'2026-01-01',amount:2,unit:'mL',state:'Given',overrides:{b:3}},{date:'2026-01-02',amount:2,unit:'mL',state:'Scheduled'}]}};
 assert.deepEqual(lotBalance(lot,[treatment]),{used:5,remaining:95});
 assert.deepEqual(lotBalance(lot,[{...treatment,voided:true}]),{used:0,remaining:100});
 assert.deepEqual(lotBalance(lot,[treatment],'2025-12-31'),{used:0,remaining:100});
});

test('ration cost uses a 2000-pound US ton and does not create actual expenses',()=>{
 const r={feedingLb:4,ingredients:[{name:'A',pounds:1500,pricePerTon:300},{name:'B',pounds:500,pricePerTon:500}]};
 assert.deepEqual(rationCost(r),{pounds:2000,batch:350,perTon:350,perHeadDay:0.7});
 assert.deepEqual(cashSummary([{kind:'ration',date:'2026-01-01',ration:r}]),{income:0,expenses:0,net:0});
});

test('custom payment shares conserve the bill and reject missing allocations',()=>{
 const animals=[{id:'a',species:'Sheep',firstYear:2026},{id:'b',species:'Sheep',firstYear:2026}];
 const e={id:crypto.randomUUID(),kind:'income',species:'Sheep',date:'2026-04-01',animalIds:['a','b'],title:'Lot',notes:'',category:'',amountCents:10000,dueDate:'',allocations:{a:3000,b:7000}};
 assert.doesNotThrow(()=>validateEvent(e,animals));assert.equal(animalIncome([e],'a'),3000);assert.equal(animalIncome([e],'b'),7000);
 assert.throws(()=>validateEvent({...e,allocations:{a:10000}},animals));assert.throws(()=>validateEvent({...e,allocations:{a:3000,b:6000}},animals));
});

test('missing ingredient price never becomes a free ration',()=>{assert.deepEqual(rationCost({feedingLb:2,ingredients:[{name:'Hay',pounds:100,pricePerTon:null}]}),{pounds:100,batch:null,perTon:null,perHeadDay:null});});
