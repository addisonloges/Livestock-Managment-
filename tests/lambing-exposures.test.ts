import test from 'node:test';
import assert from 'node:assert/strict';
import {lambingExposures} from '../lib/lambing.ts';
import type {BreedingGroup} from '../lib/breeding.ts';

const group={id:'fall',year:2026,species:'Sheep',start:'2026-09-01',end:'2026-09-30',state:'Completed',
  eweIds:['ewe'],ramId:'ram',projectSnapshot:{gestationMin:142,gestationMax:152}} as BreedingGroup;

test('a prior-year exposure can suggest a sire for a next-year lambing',()=>{
  const result=lambingExposures([group],'Sheep','ewe','2027-02-05');
  assert.equal(result.suggestion?.ramId,'ram');
  assert.deepEqual(result.eligible,[group]);
});

test('overlapping or unconfigured exposures require a producer selection',()=>{
  const other={...group,id:'other',ramId:'other ram'};
  assert.equal(lambingExposures([group,other],'Sheep','ewe','2027-02-05').suggestion,null);
  assert.equal(lambingExposures([group,{...other,projectSnapshot:null}],'Sheep','ewe','2027-02-05').suggestion,null);
  assert.equal(lambingExposures([{...group,state:'Cancelled'}],'Sheep','ewe','2027-02-05').eligible.length,0);
});
