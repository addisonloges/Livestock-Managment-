import test from 'node:test';
import assert from 'node:assert/strict';
import {growthBudget,validateGrowthBudget} from '../lib/growth-budget.ts';
import {cashSummary} from '../lib/farm-events.ts';
const plan={startWeight:70,targetWeight:140,expectedAdg:0.5,feedPerDay:2,feedPricePerTon:300,otherCost:100,salePricePerLb:2,dressingPercent:50};
test('finishing projections follow days, feed and break-even arithmetic',()=>{
 validateGrowthBudget(plan);const r=growthBudget(plan);
 assert.equal(r.days,140);assert.equal(r.feedPounds,280);assert.equal(r.feedCost,42);assert.equal(r.total,142);assert.equal(r.liveBreakEven,142/140);assert.equal(r.dressedPounds,70);assert.equal(r.dressedBreakEven,142/70);assert.equal(r.margin,138);
 assert.deepEqual(cashSummary([{kind:'growthplan',date:'2026-09-01',growth:plan}]),{income:0,expenses:0,net:0});
});
test('unknown costs stay unknown and invalid/overflow inputs are rejected',()=>{
 assert.equal(growthBudget({...plan,otherCost:null}).margin,null);
 assert.equal(growthBudget({...plan,feedPricePerTon:null}).feedCost,null);
 assert.throws(()=>validateGrowthBudget({...plan,expectedAdg:0}));
 assert.throws(()=>validateGrowthBudget({...plan,expectedAdg:Number.MIN_VALUE}));
 assert.throws(()=>validateGrowthBudget({...plan,dressingPercent:101}));
});
