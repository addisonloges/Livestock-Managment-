import test from 'node:test';import assert from 'node:assert/strict';
import {purchaseBasis,retainedEstimate,monthlyCash,retentionDecision} from '../lib/financial-reports.ts';
test('retained estimates use latest prior valuation and expose competing values',()=>{
 const a={id:'1',kind:'valuation',date:'2026-03-01',animalIds:['a','b'],amountCents:101};
 assert.equal(retainedEstimate([a],'a','2026-02-01'),null);
 assert.equal(retainedEstimate([a],'a','2026-04-01').cents,101);
 assert.equal(retainedEstimate([a,{...a,id:'2'}],'a','2026-04-01').conflict,true);
 assert.equal(retainedEstimate([a,{...a,id:'2',date:'2026-04-01',amountCents:200}],'a','2026-04-01').cents,200);
});
test('monthly cash counts each bill once and excludes estimates and voided records',()=>{
 const e={kind:'expense',date:'2026-01-01',amountCents:100,animalIds:['a','b']};
 assert.deepEqual(monthlyCash([e,{...e,voided:true},{...e,kind:'valuation'},{...e,kind:'income',amountCents:300}],'2026'),[{month:'2026-01',income:300,expenses:100,net:200}]);
});

test('retention decisions are dated and competing same-day decisions need review',()=>{const e={id:'1',kind:'selection',date:'2026-06-01',animalIds:['a'],category:'Retain'};assert.equal(retentionDecision([e],'a','2026-05-01'),'Not recorded');assert.equal(retentionDecision([e],'a','2026-07-01'),'Retain');assert.equal(retentionDecision([e,{...e,id:'2',category:'Market / sell'}],'a','2026-07-01'),'Conflicting decisions');assert.equal(monthlyCash([e],'2026').length,0);});

test('purchase basis uses recorded allocations across years without duplicating cash expense',()=>{const e={id:'p',kind:'expense',category:'Animal purchase',date:'2024-02-01',animalIds:['a','b'],amountCents:10001,allocations:{a:6000,b:4001}};assert.deepEqual(purchaseBasis([e],'a','2026-12-31'),{recorded:true,cents:6000,records:['p']});assert.equal(purchaseBasis([e],'a','2023-12-31').recorded,false);assert.equal(purchaseBasis([{...e,voided:true}],'a','2026-12-31').recorded,false);assert.equal(purchaseBasis([{...e,category:'Veterinary'}],'a','2026-12-31').recorded,false);assert.equal(purchaseBasis([{...e,amountCents:0,allocations:{a:0,b:0}}],'a','2026-12-31').recorded,true);assert.equal(monthlyCash([e],'all')[0].expenses,10001);});

test('filtered cash uses only selected animal allocations and excludes general costs',()=>{const e={kind:'expense',date:'2026-01-01',animalIds:['a','b'],amountCents:101};const general={...e,animalIds:[],amountCents:500};const filtered=monthlyCash([e,general],'2026',new Set(['a']));assert.equal(filtered[0].expenses,51);assert.deepEqual(monthlyCash([general],'2026',new Set(['a'])),[]);assert.equal(monthlyCash([e,general],'2026')[0].expenses,601);});
