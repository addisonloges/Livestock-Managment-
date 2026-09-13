import test from 'node:test';import assert from 'node:assert/strict';
import {compareGrowth,membershipCovers} from '../lib/peer-growth.ts';
test('peer comparisons use the selected measurement window, preserve ties and omit ineligible animals',()=>{
 const animals=[{id:'a',dob:'2026-01-01'},{id:'b',dob:'2026-01-01'},{id:'c',dob:''}],weights=animals.flatMap(a=>[{animalId:a.id,date:'2026-02-01',pounds:20},{animalId:a.id,date:'2026-03-03',pounds:50},{animalId:a.id,date:'2026-03-04',pounds:100,voided:true}]);
 const options={from:'2026-02-01',to:'2026-03-03',minAge:20,maxAge:80,groupId:''};const result=compareGrowth(animals,weights,options,[]);assert.equal(result.rows.length,2);assert.equal(result.excluded,1);assert.equal(result.mean,1);assert.deepEqual(result.rows.map(r=>[r.rank,r.ratio,r.days]),[[1,100,30],[1,100,30]]);assert.equal(compareGrowth(animals,weights,{...options,to:'2026-02-01'},[]).rows.length,0);
});
test('dated peer membership accepts contiguous intervals but rejects gaps and voided membership',()=>{
 const e={kind:'management',animalIds:['a'],date:'2026-02-01',management:{groupId:'g',endDate:'2026-02-15'}};
 const next={...e,date:'2026-02-16',management:{groupId:'g',endDate:'2026-03-03'}};
 assert.equal(membershipCovers([e,next],'g','a','2026-02-01','2026-03-03'),true);
 assert.equal(membershipCovers([e,{...next,date:'2026-02-17'}],'g','a','2026-02-01','2026-03-03'),false);
 assert.equal(membershipCovers([{...e,voided:true},next],'g','a','2026-02-01','2026-03-03'),false);
 assert.equal(membershipCovers([e,next],'g','b','2026-02-01','2026-03-03'),false);
});
