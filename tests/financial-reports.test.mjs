import test from 'node:test';import assert from 'node:assert/strict';
import {retainedEstimate,monthlyCash} from '../lib/financial-reports.ts';
test('retained estimates use latest prior valuation and expose competing values',()=>{
 const a={id:'1',kind:'valuation',date:'2026-03-01',animalIds:['a','b'],amountCents:101};
 assert.equal(retainedEstimate([a],'a','2026-02-01'),null);
 assert.equal(retainedEstimate([a],'a','2026-04-01').cents,51);
 assert.equal(retainedEstimate([a,{...a,id:'2'}],'a','2026-04-01').conflict,true);
 assert.equal(retainedEstimate([a,{...a,id:'2',date:'2026-04-01',amountCents:200}],'a','2026-04-01').cents,100);
});
test('monthly cash counts each bill once and excludes estimates and voided records',()=>{
 const e={kind:'expense',date:'2026-01-01',amountCents:100,animalIds:['a','b']};
 assert.deepEqual(monthlyCash([e,{...e,voided:true},{...e,kind:'valuation'},{...e,kind:'income',amountCents:300}],'2026'),[{month:'2026-01',income:300,expenses:100,net:200}]);
});
