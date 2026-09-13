import test from 'node:test';import assert from 'node:assert/strict';
import {displayId} from '../lib/livestock.ts';import {formerDisplayIds} from '../lib/foundation.ts';import {matchWeightAnimal,weightImportRows} from '../lib/weight-import.ts';
test('birth-year display IDs retain old aliases and ambiguous imports require review',()=>{
 const a={id:'a',seq:89,birthSequence:40,birthYear:2026,name:'A',rightTag:'',leftTag:'',eid:null},b={...a,id:'b',seq:110,birthSequence:89,name:'B'};
 const history=[{animalId:'a',action:'display-id',before:JSON.stringify({seq:89,birthYear:2026}),after:JSON.stringify(a)}];
 assert.equal(displayId(a),'26-040');assert.deepEqual(formerDisplayIds(history,'a'),['26-089']);assert.equal(matchWeightAnimal({animalId:'26-089'},[a,b],history).length,2);
 assert.equal(weightImportRows([['ID','Weight'],['26-089','50']],['animalId','weight'],[a,b],'lb',history)[0].animalId,'');
 assert.equal(matchWeightAnimal({animalId:'a'},[a,b],history)[0].id,'a');
});
