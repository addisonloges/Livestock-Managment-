import test from 'node:test';import assert from 'node:assert/strict';
import {emptyReportFilter,filterReportAnimals,validateReportFilter} from '../lib/report-filters.ts';
const a={id:'a',seq:1,name:'Ewe A',rightTag:'',leftTag:'',eid:'',breed:'Dorper',sex:'Female',birthYear:2024,firstYear:2024,status:'Sold',statusEvents:[{date:'2026-06-01',status:'Sold'}]};
test('report filters use status at reporting date and keep birth/sex/breed filters aligned',()=>{
 const f={...emptyReportFilter,status:'Active',sex:'Female',birthYear:'2024',breed:'dorp'};validateReportFilter(f);
 assert.equal(filterReportAnimals([a],f,'2026-01-01').length,1);
 assert.equal(filterReportAnimals([a],f,'2026-07-01').length,0);
 assert.equal(filterReportAnimals([a],{...f,status:'Sold'},'2026-07-01').length,1);
 assert.throws(()=>validateReportFilter({...f,birthYear:'unknown'}));
});
