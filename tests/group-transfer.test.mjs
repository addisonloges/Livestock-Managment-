import test from 'node:test';
import assert from 'node:assert/strict';
import {planGroupTransfer} from '../lib/group-transfer.ts';
import {groupMembers} from '../lib/management-groups.ts';
const row=(id,group,ids,date='2025-01-01',endDate='')=>({id,version:1,kind:'management',species:'Sheep',date,title:group,animalIds:ids,management:{groupId:group,endDate},notes:'',category:'',dueDate:'',amountCents:null});
const input={species:'Sheep',from:'north',to:'south',newName:'',date:'2026-01-01',endDate:'',animalIds:['a']};
const execute=(rows,i=input)=>{let n=0;const plan=planGroupTransfer(rows,i,()=>`new-${++n}`);return {plan,rows:[...rows.map(e=>plan.updates.find(x=>x.id===e.id)||e),...plan.creates]}};
test('partial transfer preserves source history, unselected animals and unrelated groups across years',()=>{
 const original=[row('1','north',['a','b']),row('2','south',['c']),row('3','feed',['a'])];
 const {rows,plan}=execute(original);
 assert.deepEqual([...groupMembers(rows,'north','2025-12-31')].sort(),['a','b']);
 assert.deepEqual([...groupMembers(rows,'north','2026-01-01')],['b']);
 assert.deepEqual([...groupMembers(rows,'south','2026-01-01')].sort(),['a','c']);
 assert.deepEqual([...groupMembers(rows,'feed','2026-01-01')],['a']);
 assert.deepEqual(original[0].animalIds,['a','b']);assert.equal(plan.updates.length,1);
});
test('whole-roster transfer ends old membership; same-day transfer voids original instead of invalid end date',()=>{
 let {rows}=execute([row('1','north',['a']),row('2','south',['c'])]);
 assert.equal(rows[0].management.endDate,'2025-12-31');
 ({rows}=execute([row('1','north',['a'],'2026-01-01'),row('2','south',['c'])]));
 assert.equal(rows[0].voided,true);assert.equal(groupMembers(rows,'north','2026-01-01').size,0);
});
test('new group and optional destination end are respected',()=>{
 const {rows,plan}=execute([row('1','north',['a','b'])],{...input,to:'',newName:'Replacements',endDate:'2026-02-01'});
 assert.equal(plan.target.title,'Replacements');assert.equal(groupMembers(rows,plan.target.management.groupId,'2026-02-01').size,1);assert.equal(groupMembers(rows,plan.target.management.groupId,'2026-02-02').size,0);
});
test('rejects overlap, absent animals, later source assignments, invalid dates and identical groups',()=>{
 const rows=[row('1','north',['a']),row('2','south',['c'])];
 assert.throws(()=>execute(rows,{...input,to:'north'}),/different/);
 assert.throws(()=>execute(rows,{...input,animalIds:['b']}),/not in/);
 assert.throws(()=>execute([...rows,row('3','south',['a'],'2026-02-01')]),/destination/);
 assert.throws(()=>execute([...rows,row('3','north',['a'],'2026-02-01')]),/later assignment/);
 assert.throws(()=>execute(rows,{...input,date:'2026-02-30'}),/valid/);
 assert.throws(()=>execute(rows,{...input,endDate:'2025-12-31'}),/valid/);
});
