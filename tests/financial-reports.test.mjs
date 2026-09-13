import test from 'node:test';import assert from 'node:assert/strict';
import {retainedEstimate,monthlyCash,retentionDecision} from '../lib/financial-reports.ts';
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
