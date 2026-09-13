import {test} from 'node:test';
import assert from 'node:assert/strict';
import {animalCsv,formerDisplayIds,weightsThroughYear} from '../lib/foundation.ts';
import {adg,displayId,relationshipMatrix,projectedCoi,validateParentDates} from '../lib/livestock.ts';
import {parseCsv} from '../lib/animal-import.ts';
test('historical weights and growth exclude future and voided records',()=>{const weights=[{id:'a',date:'2025-01-01',pounds:100},{id:'b',date:'2025-01-11',pounds:105},{id:'c',date:'2026-01-01',pounds:200},{id:'d',date:'2025-12-01',pounds:500,voided:true}];assert.equal(adg(weightsThroughYear(weights,'2025')),.5);assert.equal(weightsThroughYear(weights,'2025').length,2);assert.equal(weightsThroughYear(weights,'all').length,3)});
test('portable CSV carries immutable identity, display label and parents separately',()=>{const a={id:'uuid-child',seq:8,species:'Sheep',name:'=unsafe',rightTag:'004',leftTag:'',eid:'000123',birthYear:2025,firstYear:2025,sex:'Female',origin:'Purchased',breed:'',status:'Active',sire:'uuid-sire',dam:'uuid-dam',pedigreeInfo:'{}'};const csv=parseCsv(animalCsv([a],'2025-12-31'));const record=Object.fromEntries(csv[0].map((key,i)=>[key,csv[1][i]]));assert.equal(record.id,'uuid-child');assert.equal(record.displayId,'25-008');assert.equal(record.sireKey,'uuid-sire');assert.equal(record.damKey,'uuid-dam');assert.equal(record.eid,'000123');assert.equal(record.rightTag,'004');assert.equal(record.name,"'=unsafe")});
test('former display IDs survive birth-year correction history',()=>{assert.deepEqual(formerDisplayIds([{animalId:'a',before:JSON.stringify({seq:8,birthYear:2025})},{animalId:'a',before:'{}'}],'a'),['25-008']);assert.equal(displayId({seq:8,birthYear:2024}),'24-008')});
test('partial date validation and repeated ancestry remain explicit',()=>{assert.throws(()=>validateParentDates({birthYear:2020},{dob:'2021-01-01',birthYear:2021}));const family=[{id:'s',sire:null,dam:null},{id:'d',sire:null,dam:null},{id:'x',sire:'s',dam:'d'},{id:'y',sire:'s',dam:'d'},{id:'z',sire:'x',dam:'y'}];const matrix=relationshipMatrix(family);assert.equal(projectedCoi(matrix,'x','y'),.25);assert.equal(matrix.get('z','z'),1.25)});

test('CSV includes registration and notes without dropping leading zeros or multiline content',()=>{
 const a={id:'a',seq:1,status:'Active',origin:'Home-raised',pedigreeInfo:JSON.stringify({registry:'Registry',registrationNumber:'00123',notes:'Line one\nLine two',farm:'Farm'})};
 const rows=parseCsv(animalCsv([a],'2026-12-31'));const r=Object.fromEntries(rows[0].map((k,i)=>[k,rows[1][i]]));
 assert.equal(r.origin,'Home-raised');assert.equal(r.registrationNumber,'00123');assert.equal(r.notes,'Line one\nLine two');assert.equal(r.farm,'Farm');
});

test('animal CSV includes labeled custom fields and preserves false, zero and archived values',()=>{const animal={id:'a',seq:1,status:'Active',pedigreeInfo:JSON.stringify({customValues:{n:0,b:false,t:'Old value'}})},fields=[{id:'n',name:'Number',type:'Number',archived:false},{id:'b',name:'Flag',type:'Yes/No',archived:false},{id:'t',name:'Text',type:'Text',archived:true}];const rows=parseCsv(animalCsv([animal],'2026-12-31',fields));const row=Object.fromEntries(rows[0].map((k,i)=>[k,rows[1][i]]));assert.equal(row['Custom: Number'],'0');assert.equal(row['Custom: Flag'],'No');assert.equal(row['Custom: Text (archived)'],'Old value');});
