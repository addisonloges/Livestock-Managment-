import test from 'node:test';import assert from 'node:assert/strict';
import {parentPerformance} from '../lib/parent-performance.ts';
test('parent performance distinguishes live profiles from stillborn litter records',()=>{
 const dam={id:'d',species:'Sheep'},foster={id:'f',species:'Sheep'},child={id:'a',species:'Sheep',dam:'d',birthYear:2026,dob:'2026-01-01'};
 const litter={id:'l',species:'Sheep',date:'2026-01-01',damId:'d',sireId:'',lambs:[{id:'a',outcome:'Alive'},{id:'b',outcome:'Stillborn'}]};
 const records=[{id:'r',kind:'selection',date:'2026-03-01',animalIds:['a'],category:'Retain'},{id:'f',kind:'rearing',date:'2026-01-02',animalIds:['a'],rearing:{fosterDamId:'f'}}];
 const p=parentPerformance(dam,[child],[],records,'2026',[litter]);assert.equal(p.offspring,1);assert.equal(p.bornAlive,1);assert.equal(p.stillborn,1);assert.equal(p.retained,1);assert.equal(p.meanBirthWeight,null);
 assert.equal(parentPerformance(foster,[child],[],records,'2026',[litter]).offspring,0);
 assert.equal(parentPerformance(dam,[child],[],records,'2025',[litter]).bornAlive,null);
 assert.equal(parentPerformance(dam,[child],[],records,'2026',[{...litter,voided:true}]).recordedLitters,0);
});
