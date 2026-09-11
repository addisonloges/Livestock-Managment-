import {test} from 'node:test';
import assert from 'node:assert/strict';
import {relationshipMatrix,projectedCoi,adg,validateAnimal,visibleInYear} from '../lib/livestock.ts';
const founders=[{id:'a',sire:null,dam:null},{id:'b',sire:null,dam:null},{id:'c',sire:null,dam:null},{id:'d',sire:null,dam:null}];
const family=[...founders,{id:'ab1',sire:'a',dam:'b'},{id:'ab2',sire:'a',dam:'b'},{id:'ac',sire:'a',dam:'c'},{id:'cousin1',sire:'ab1',dam:'c'},{id:'cousin2',sire:'ab2',dam:'d'}];
test('known pedigree COI cases',()=>{const m=relationshipMatrix(family);assert.equal(projectedCoi(m,'a','b'),0);assert.equal(projectedCoi(m,'a','ab1'),.25);assert.equal(projectedCoi(m,'ab1','ab2'),.25);assert.equal(projectedCoi(m,'ab1','ac'),.125);assert.equal(projectedCoi(m,'cousin1','cousin2'),.0625)});
test('cycles and missing referenced ancestors fail intentionally',()=>{assert.throws(()=>relationshipMatrix([{id:'a',sire:'a',dam:null}]));assert.throws(()=>relationshipMatrix([{id:'a',sire:'absent',dam:null}]))});
test('weights use actual chronological dates',()=>{assert.equal(adg([{date:'2026-01-01',pounds:10},{date:'2026-01-11',pounds:15}]),.5);assert.equal(adg([{date:'2026-01-01',pounds:10}]),null);assert.equal(adg([{date:'2026-01-01',pounds:10},{date:'2026-01-01',pounds:15}]),null)});
test('animal validation and year presence',()=>{assert.throws(()=>validateAnimal({species:'Sheep',origin:'Home-raised',sex:'Female',birthYear:2026,firstYear:2026}));assert.throws(()=>validateAnimal({species:'Sheep',origin:'Purchased',sex:'',birthYear:2026,firstYear:2026}));assert.equal(visibleInYear({firstYear:2025},'2024'),false);assert.equal(visibleInYear({firstYear:2025},'2026'),true);assert.equal(visibleInYear({firstYear:2025},'all'),true)});
