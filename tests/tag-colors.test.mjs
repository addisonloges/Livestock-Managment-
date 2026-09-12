import assert from 'node:assert/strict';
import {tagChange} from '../lib/tag-change.ts';
import {blankImportRow,prepareImport} from '../lib/animal-import.ts';
const a={rightTag:'1',leftTag:'',eid:null,dob:null,pedigreeInfo:JSON.stringify({rightTagColor:'Yellow'})};
assert.equal(tagChange(a,{field:'rightTag',mode:'retire',value:'2',date:'2026-01-01'},2026).color,'');
const retired=tagChange(a,{field:'rightTag',mode:'retire',value:'',date:'2026-01-01'},2026);assert.equal(retired.color,'');assert.equal(retired.previousColor,'Yellow');
const corrected=tagChange(a,{field:'rightTag',mode:'color',value:'1',color:'Blue',date:'2026-01-01'},2026);assert.equal(corrected.color,'Blue');
let row={...blankImportRow('Sheep','2026','1'),name:'Color QA',rightTag:'42'};assert.equal(prepareImport([row],[],2026).errors.length,0);row.rightTagColor='Yellow';assert.equal(prepareImport([row],[],2026).errors.length,0);row.rightTag='   ';row.rightTagColor='';assert.equal(prepareImport([row],[],2026).errors.length,0);
console.log('PASS: conditional color, retirement color history, correction, import tagged/blank rows');
