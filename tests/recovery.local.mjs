import assert from 'node:assert/strict';
const root='http://127.0.0.1:5173/api/flock';
const backup=await(await fetch(root+'/backup')).json();
async function request(action,data,stamp){const r=await fetch(root+'/backup/restore',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,backup:data,stamp})});return {status:r.status,data:await r.json()}}
let preview=await request('preview',backup);assert.equal(preview.status,200);assert.equal(preview.data.conflictCount,0);assert.equal(preview.data.missing,0);
const added={...backup.tables.animals[0],id:crypto.randomUUID(),seq:Math.max(...backup.tables.animals.map(a=>a.seq))+100,name:'Recovery QA',birthSequence:null,eid:null,sire:null,dam:null,pedigreeInfo:'{}'};
backup.tables.animals.push(added);preview=await request('preview',backup);assert.equal(preview.data.missing,1);
const applied=await request('apply',backup,preview.data.stamp);assert.equal(applied.status,200,JSON.stringify(applied.data));assert.equal(applied.data.restored,1);
const after=await(await fetch(root)).json();assert.ok(after.animals.some(a=>a.id===added.id));
assert.equal((await request('apply',backup,preview.data.stamp)).status,409);
added.name='Conflicting backup name';preview=await request('preview',backup);assert.equal(preview.data.conflictCount,1);assert.equal((await request('apply',backup,preview.data.stamp)).status,409);
const safety=await(await fetch(root+'/backup/restore')).json();assert.ok(safety.backups.some(b=>b.key===applied.data.safetyKey));
const saved=await(await fetch(root+'/backup/restore?key='+encodeURIComponent(applied.data.safetyKey))).json();assert.equal(saved.tables.animals.some(a=>a.id===added.id),false);
console.log('PASS restore preview, missing-record restore, stale preview rejection, conflict protection and retrievable safety backup.');
