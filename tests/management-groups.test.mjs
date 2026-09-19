import test from 'node:test';
import assert from 'node:assert/strict';
import {managementGroups,groupMembers} from '../lib/management-groups.ts';
import {filterReportAnimals,emptyReportFilter,validateReportFilter} from '../lib/report-filters.ts';
const period=(id,ids,start,end='',extra={})=>({id,version:1,kind:'management',species:'Sheep',date:start,title:'North pasture',animalIds:ids,management:{groupId:'group-1',endDate:end},...extra});
test('dated groups preserve join/leave dates and deduplicate memberships',()=>{
 const rows=[period('p1',['a','b'],'2026-01-01','2026-06-30'),period('p2',['b','c'],'2026-07-01'),period('p3',['c'],'2026-07-01')];
 assert.deepEqual([...groupMembers(rows,'group-1','2026-06-30')],['a','b']);
 assert.deepEqual([...groupMembers(rows,'group-1','2026-07-01')],['b','c']);
 assert.equal(groupMembers(rows,'group-1','').size,0);
 assert.equal(groupMembers(rows,'group-1','2025-12-31').size,0);
});
test('void periods excluded, species groups isolated, latest group title retained',()=>{
 const rows=[period('p1',['a'],'2026-01-01','2026-02-01'),period('p2',['b'],'2026-03-01','',{title:'Replacements'}),period('p3',['x'],'2026-04-01','',{voided:true,title:'Wrong'}),period('p4',['z'],'2026-01-01','',{species:'Goats',management:{groupId:'goats',endDate:''}})];
 assert.equal(managementGroups(rows,'Sheep').length,1);assert.equal(managementGroups(rows,'Sheep')[0].name,'Replacements');assert.deepEqual([...groupMembers(rows,'group-1','2026-05-01')],['b']);
});
test('group reporting uses specified membership date and legacy filters still work',()=>{
 const animals=['a','b'].map(id=>({id,name:id,breed:'Katahdin',status:'Active',sex:'Female',birthYear:2025}));
 const rows=[period('p',['a'],'2026-01-01','2026-03-01')];
 assert.equal(filterReportAnimals(animals,emptyReportFilter,'2026-12-31',rows).length,2);
 const filter={...emptyReportFilter,groupId:'group-1',groupDate:'2026-02-01'};validateReportFilter(filter);
 assert.deepEqual(filterReportAnimals(animals,filter,'2026-12-31',rows).map(a=>a.id),['a']);
 assert.equal(filterReportAnimals(animals,{...filter,groupDate:'2026-04-01'},'2026-12-31',rows).length,0);
});
