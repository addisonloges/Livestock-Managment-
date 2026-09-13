import test from 'node:test';
import assert from 'node:assert/strict';
import {farmCalendar} from '../lib/farm-calendar.ts';
test('cross-year calendar entries open the original record year and count individual scheduled doses',()=>{
 const event={id:'t',species:'Sheep',date:'2025-12-31',title:'Protocol',kind:'treatment',animalIds:['a','b'],dueDate:'2026-01-03',protocol:{product:'Product',withdrawalEnd:'2026-01-10',doses:[{date:'2026-01-01',state:'Scheduled',states:{a:'Given'}},{date:'2026-01-02',state:'Skipped'}]}};
 const group={species:'Sheep',year:2025,name:'Winter group',start:'2025-12-01',end:'',state:'Exposed',projectSnapshot:{gestationMin:145,gestationMax:150}};
 const rows=farmCalendar([event,{...event,id:'void',voided:true}],[{species:'Sheep',date:'2026-04-25',lambs:[{}]}],[group],[],'Sheep');
 assert.equal(rows.filter(r=>r.type==='Scheduled dose').length,1);
 assert.match(rows.find(r=>r.type==='Scheduled dose').title,/1 animals scheduled/);
 assert.equal(rows.find(r=>r.type==='Follow-up').year,'2025');
 assert.equal(rows.find(r=>r.type==='Follow-up').recordId,'t');
 assert.equal(rows.find(r=>r.type==='Estimated birth window starts').year,'2025');
 assert.ok(rows.find(r=>r.type==='Estimated birth window starts').date.startsWith('2026'));
 assert.equal(rows.find(r=>r.type==='Recorded lambing').section,'lambing');
 assert.equal(farmCalendar([event],[],[group],[],'Goats').length,0);
});
