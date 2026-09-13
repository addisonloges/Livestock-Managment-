import assert from 'node:assert/strict';
const root='http://127.0.0.1:5173/api/flock';
async function post(path,body){const r=await fetch(root+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,data:await r.json()}}
const child={id:crypto.randomUUID(),name:'Archive litter QA',sex:'Female',rightTag:'',leftTag:'',rightTagColor:'',leftTagColor:'',eid:'',outcome:'Alive',birthWeight:8,unit:'lb',cause:''};
let litter={id:crypto.randomUUID(),version:0,species:'Sheep',date:'2026-07-01',damId:'',sireId:'',groupId:'',assistance:'',notes:'QA only',lambs:[child]};
assert.equal((await post('/lambing',{data:litter,year:'2026',operationId:crypto.randomUUID()})).status,200);
async function reload(){litter=(await(await fetch(root+'/lambing')).json()).litters.find(l=>l.id===litter.id)}
await reload();assert.equal((await post('/lambing',{data:litter,year:'2026',operationId:crypto.randomUUID(),action:'void',reason:'QA void'})).status,200);await reload();assert.ok(litter.voided);
let a=(await(await fetch(root)).json()).animals.find(a=>a.id===child.id);assert.ok(a.archivedAt);assert.ok(a.birthSequence>0);
assert.equal((await post('/lambing',{data:litter,year:'2026',operationId:crypto.randomUUID(),action:'restore',reason:'QA restore'})).status,200);await reload();assert.equal(litter.voided,false);
const e={id:crypto.randomUUID(),version:0,kind:'evaluation',species:'Sheep',date:'2026-08-01',animalIds:[child.id],title:'QA trait',notes:'Imported evaluation',category:'',amountCents:null,dueDate:'',lab:{laboratory:'QA provider',results:{[child.id]:{value:'-0.4',unit:'lb',reference:'Accuracy 50%'}}}};
const op=crypto.randomUUID();let result=await post('/evaluation-import',{events:[e],year:'2026',operationId:op});assert.equal(result.status,200,JSON.stringify(result.data));assert.equal(result.data.count,1);
assert.equal((await post('/evaluation-import',{events:[e],year:'2026',operationId:op})).data.count,1);
result=await post('/evaluation-import',{events:[{...e,id:crypto.randomUUID()}],year:'2026',operationId:crypto.randomUUID()});assert.equal(result.data.skipped,1);
assert.equal((await post('/evaluation-import',{events:[{...e,id:crypto.randomUUID(),lab:{...e.lab,results:{[child.id]:{...e.lab.results[child.id],value:'1'}}}}],year:'2026',operationId:crypto.randomUUID()})).status,409);
assert.equal((await post('/lambing',{data:litter,year:'2026',operationId:crypto.randomUUID(),action:'void',reason:'Should be blocked by evaluation'})).status,400);
const fileId=crypto.randomUUID(),form=new FormData(),bytes=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a5xQAAAAASUVORK5CYII=','base64');
for(const [k,v] of Object.entries({eventId:e.id,operationId:fileId,version:'1',year:'2026',action:'upload'}))form.set(k,v);form.set('file',new Blob([bytes],{type:'image/png'}),'qa-result.png');let r=await fetch(root+'/events/files',{method:'POST',body:form});assert.equal(r.status,200,await r.text());r=await fetch(root+'/events/files?event='+e.id+'&file='+fileId);assert.equal(r.status,200);assert.deepEqual(Buffer.from(await r.arrayBuffer()),bytes);
console.log('PASS litter void/restore, later-record protection, genetic import retry/dedup/conflicts, and attached document bytes.');
