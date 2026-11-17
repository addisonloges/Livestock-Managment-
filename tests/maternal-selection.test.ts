import assert from 'node:assert/strict';
import test from 'node:test';
import { maternalRecords, maternalCycles, maternalGroupSummary, repeatedMaternalEstimate } from '../lib/maternal-selection.ts';
import type { Animal, Weight } from '../lib/livestock.ts';
import type { Litter } from '../lib/lambing.ts';
import type { FarmEvent } from '../lib/farm-events.ts';

test('fostered output is credited once and missing lamb weights withhold litter efficiency',()=>{
  const animals=[{id:'dam',species:'Sheep',sex:'Female'},{id:'foster',species:'Sheep',sex:'Female'}] as Animal[];
  const litters=[
    {id:'first',damId:'dam',preLambingWeightId:'A',lambs:[{id:'one',outcome:'Alive'},{id:'two',outcome:'Alive'}]},
    {id:'second',damId:'foster',preLambingWeightId:'B',lambs:[{id:'three',outcome:'Alive'}]},
  ].map(l=>({...l,date:'2026-02-01',groupId:'group',species:'Sheep'})) as Litter[];
  const events=[
    {id:'foster',kind:'rearing',date:'2026-02-02',category:'Fostered',animalIds:['two'],rearing:{fosterDamId:'foster',numberReared:2}},
    {id:'wean',kind:'weaning',date:'2026-04-01',animalIds:['one','two','three']},
  ].map(e=>({...e,species:'Sheep'})) as FarmEvent[];
  const weights=[
    {id:'A',animalId:'dam',date:'2026-01-29',pounds:150},
    {id:'B',animalId:'foster',date:'2026-01-31',pounds:160},
    {id:'1',animalId:'one',date:'2026-04-01',pounds:60},
    {id:'2',animalId:'two',date:'2026-04-01',pounds:55},
  ] as Weight[];
  const rows=maternalCycles(maternalRecords(animals,weights,events,litters,'2026-04-02','Sheep'),weights,[]);
  assert.equal(rows[0].preEfficiency,40);
  assert.equal(rows[1].weaned.length,2);
  assert.equal(rows[1].outcomeComplete,true);
  assert.equal(rows[1].preEfficiency,null);
  assert.equal(maternalGroupSummary(rows).pounds,115);
  assert.equal(maternalGroupSummary(rows).pre.count,1);
});

test('repeated ewe estimate requires valid parameters and retains unfavorable performance',()=>{
  assert.equal(repeatedMaternalEstimate([],0.1,0.2),null);
  assert.equal(repeatedMaternalEstimate([1],0.3,0.2),null);
  assert.equal(repeatedMaternalEstimate([-0.4,-0.4,-0.4,-0.4],0.1,0.2),-0.1);
});
