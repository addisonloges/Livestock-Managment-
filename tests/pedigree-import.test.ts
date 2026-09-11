import test from 'node:test';
import assert from 'node:assert/strict';
import {planPedigreeImport} from '../lib/pedigree-import.ts';
import type {Animal} from '../lib/livestock.ts';
const animal=(id:string,tag:string):Animal=>({id,seq:1,species:'Sheep',name:'',rightTag:tag,leftTag:'',eid:null,sex:'Female',origin:'Purchased',dob:'2026-01-01',birthYear:2026,firstYear:2026,breed:'',sire:null,dam:null,status:'Active',version:1,createdAt:'',pedigreeInfo:'{}'});
const headers=['Right Tag','Name','DOB','USSA Registration','Flock Name/ID','Sire Reg','Sire Flock Name/ID','Dam Reg','Dam Flock Name/ID'];
test('matches existing animals, shares ancestors, preserves registration and is repeatable',()=>{
 const existing=[animal('a','001'),animal('b','002')],grid=[headers,['001','','1/1/2026','A1','Farm 1','S1','Sire one','D1','Dam one'],['002','','1/1/2026','A2','Farm 2','S1','Sire one','D1','Dam one']];
 const p=planPedigreeImport(grid,existing,2026,'Sheep');assert.deepEqual(p.errors,[]);assert.equal(p.created.length,2);assert.equal(p.updates.length,2);assert.equal(p.updates[0].after.sire,p.updates[1].after.sire);assert.equal(JSON.parse(p.updates[0].after.pedigreeInfo!).registrationNumber,'A1');
 const again=planPedigreeImport(grid,[...p.updates.map(u=>u.after),...p.created],2026,'Sheep');assert.equal(again.created.length,0);assert.equal(again.updates.length,0);
});
test('unmatched rows are skipped, explicit renamed-animal matches are supported',()=>{
 const a={...animal('a',''),name:'Cooper'},grid=[headers,['','Coper','1/1/2026','A1','','S1','Sire one','','']];
 assert.equal(planPedigreeImport(grid,[a],2026,'Sheep').skipped.length,1);
 assert.equal(planPedigreeImport(grid,[a],2026,'Sheep',{'1':'a'}).matched,1);
});
test('conflicting dates and existing parent links prevent saving',()=>{
 const a=animal('a','001'),grid=[headers,['001','','1/1/2025','','','S1','Sire one','','']];assert.match(planPedigreeImport(grid,[a],2026,'Sheep').errors.join(),/conflicting/);
 grid[1][2]='1/1/2026';const p=planPedigreeImport(grid,[{...a,sire:'other'},{...animal('other',''),sex:'Male',dob:null,birthYear:null}],2026,'Sheep');assert.match(p.errors.join(),/Existing sire differs/);
});
