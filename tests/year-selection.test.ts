import {test} from 'node:test';
import assert from 'node:assert/strict';
import {includedInYear,presentInYear,statusAt} from '../lib/animal-status.ts';
import {yearRollCandidates,rollDecision,withYearSelection} from '../lib/year-roll.ts';
import type {Animal} from '../lib/livestock.ts';
test('retained ewe and ram lambs remain eligible, exits and ancestors do not',()=>{
 const base={firstYear:2025,status:'Active',species:'Sheep',pedigreeInfo:'{}',birthYear:2025} as Animal;
 const animals=[{...base,id:'ewe',sex:'Female'},{...base,id:'ram',sex:'Male'},{...base,id:'sold',status:'Sold'},{...base,id:'dead',status:'Dead'},{...base,id:'ancestor',pedigreeOnly:1}];
 assert.deepEqual(yearRollCandidates(animals,'Sheep',2025).map(a=>a.id),['ewe','ram']);
 const events=[{id:'retain',kind:'selection',category:'Retain',date:'2025-10-01',animalIds:['ewe','ram']}] as any;
 assert.equal(rollDecision(animals[0],events,2025),'Retain');assert.equal(rollDecision(animals[1],events,2025),'Retain');
});
test('year exclusions preserve prior and lifetime history, persist forward, and can be reversed',()=>{
 const a={id:'a',firstYear:2024,status:'Active',species:'Sheep',pedigreeInfo:'{}'} as Animal;
 const skipped={...a,pedigreeInfo:withYearSelection(a,2026,false)};
 assert.equal(presentInYear(skipped,'2025'),true);assert.equal(presentInYear(skipped,'all'),true);assert.equal(presentInYear(skipped,'2026'),false);assert.equal(includedInYear(skipped,2027),false);assert.equal(skipped.status,'Active');
 assert.equal(yearRollCandidates([skipped],'Sheep',2026).length,1);
 const restored={...skipped,pedigreeInfo:withYearSelection(skipped,2027,true)};
 assert.equal(presentInYear(restored,'2026'),false);assert.equal(presentInYear(restored,'2027'),true);assert.equal(statusAt(restored,'2027-06-01'),'Active');
});
