import assert from 'node:assert/strict';import {updateTagRecords,tagSlots} from '../lib/tag-records.ts';
let a={rightTag:'R1',leftTag:'L1',eid:'123',dob:null,pedigreeInfo:JSON.stringify({rightTagColor:'White',leftTagColor:'Yellow',eidTagPosition:'leftTag'})};
const apply=x=>{const r=updateTagRecords(a,{date:'2026-01-01',operationId:'abc',...x},2026);a={...a,...r};return r;};
apply({mode:'add',ear:'Left',value:'L2',color:'Blue'});assert.equal(tagSlots(a).filter(t=>t.ear==='Left'&&t.number).length,2);
assert.throws(()=>apply({mode:'swap',field:'leftTag'}),/two/);
let r=apply({mode:'swap',field:'leftTag',otherField:'extra:abc'});assert.equal(a.leftTag,'L2');assert.equal(tagSlots(a).find(t=>t.id==='extra:abc').number,'L1');assert.equal(JSON.parse(a.pedigreeInfo).eidTagPosition,'extra:abc');
r=apply({mode:'retire',field:'extra:abc',value:'',color:''});assert.equal(r.event.retiredEid,'123');assert.equal(a.eid,null);assert.equal(a.leftTag,'L2');
assert.equal(updateTagRecords(a,{mode:'add',operationId:'blank-color',ear:'Left',value:'N',color:'',date:'2026-01-01'},2026).event.color,'');
console.log('PASS: two left tags, explicit pair required, selected swap, linked extra EID retirement, color requirement');
