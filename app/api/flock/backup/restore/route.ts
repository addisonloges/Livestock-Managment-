import {GET as fullBackup} from '../full/route';
import {animalFiles} from '@/lib/animal-files';
import {isUuid} from '@/lib/lambing';
import {scopedRecovery,validateRecoveryLinks} from '@/lib/recovery-plan';
import {withReadEpoch,withWriteEpoch} from '@/db/recovery-context';
import {rawDb} from '@/db';
import {env} from 'cloudflare:workers';
export const dynamic='force-dynamic';
const tables=['animals','weights','animal_history','breeding_groups','breeding_history','breeding_projects','farm_records','farm_history'];
const keyFor=(table:string)=>table==='animals'?'id':table.endsWith('history')?'operationId':'id';
const fingerprint="(SELECT epoch FROM recovery_control WHERE id=1) || '|' || "+tables.map(t=>`(SELECT COUNT(*) || ':' || ${['animals','weights','breeding_groups','breeding_projects','farm_records'].includes(t)?'COALESCE(SUM(version),0)':"COALESCE(MAX(createdAt),'')"} FROM ${t})`).join(" || '|' || ");
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
async function handleGET(req:Request){try{if(!env.BUCKET)throw Error('Backup storage unavailable.');const key=new URL(req.url).searchParams.get('key');if(key){if(!key.startsWith('recovery-safety/')||key.includes('..')||!(/\.(json|tar)$/.test(key)))throw Error('Invalid backup reference.');const object=await env.BUCKET.get(key);if(!object)return json({error:'Safety backup not found.'},404);return new Response(object.body,{headers:{'Content-Type':key.endsWith('.tar')?'application/x-tar':'application/json','Content-Disposition':'attachment; filename="clarksons-safety-backup.'+(key.endsWith('.tar')?'tar':'json')+'"','Cache-Control':'no-store'}})}const objects=await env.BUCKET.list({prefix:'recovery-safety/',limit:100});return json({recoveries:(await rawDb().prepare('SELECT * FROM recovery_runs ORDER BY createdAt DESC LIMIT 100').all()).results,backups:objects.objects.map(o=>({key:o.key,createdAt:o.uploaded,size:o.size})),more:objects.truncated});}catch(e){return json({error:(e as Error).message},503)}}
async function handlePOST(req:Request){try{
 if(Number(req.headers.get('content-length')||0)>25*1024*1024)throw Error('Records file exceeds 25 MB.');
 const b:any=await req.json();let backup=b.backup;const rollback=b.mode==='rollback';if(b.mode&&!['missing','rollback'].includes(b.mode))throw Error('Invalid recovery mode.');
 if(!['preview','apply'].includes(b.action)||!backup||!['clarksons-full-backup','clarksons-records-backup'].includes(backup.format)||backup.version!==1||!backup.tables)throw Error('Choose a supported records or full-backup file.');
 const db=rawDb(),current=await db.batch(tables.map(t=>db.prepare('SELECT * FROM '+t)));
 const before=Object.fromEntries(tables.map((t,i)=>[t,current[i].results]));
 if(tables.some(t=>!Array.isArray(backup.tables[t])))throw Error('Backup is missing a required record table.');
 if(rollback)backup={...backup,tables:scopedRecovery(before,backup.tables,b.speciesScope||'all')};
 const counters=backup.identityCounters||[];if(!Array.isArray(counters)||counters.some((c:any)=>!Number.isInteger(c.yearKey)||(c.yearKey!==0&&(c.yearKey<1900||c.yearKey>9999))||!Number.isSafeInteger(c.highWater)||c.highWater<0))throw Error('Invalid identifier reservations.');
 const counterStatements=counters.map((c:any)=>db.prepare('INSERT INTO identity_counters(yearKey,highWater) VALUES(?,?) ON CONFLICT(yearKey) DO UPDATE SET highWater=MAX(highWater,excluded.highWater)').bind(c.yearKey,c.highWater));
 const stamp:any=await db.prepare('SELECT '+fingerprint+' AS stamp').first();
 const inserts:{table:string;row:Record<string,string|number|null>}[]=[],conflicts:string[]=[],conflictDetails:any[]=[],counts:Record<string,number>={},currentOnly:Record<string,number>={};
 for(let i=0;i<tables.length;i++){
  const table=tables[i],rows=backup.tables[table];if(!Array.isArray(rows)||rows.length>100000)throw Error('Invalid or oversized table: '+table);
  const schema=await db.prepare('PRAGMA table_info('+table+')').all<any>(),columns=new Map(schema.results.map(c=>[c.name,c]));
  const key=keyFor(table),existing=new Map(current[i].results.map((r:any)=>[r[key],r])),seen=new Set();counts[table]=0;
  for(const row of rows){
   if(!row||typeof row!=='object'||Array.isArray(row)||typeof row[key]!=='string'||seen.has(row[key]))throw Error('Invalid or repeated record in '+table);seen.add(row[key]);
   for(const [column,value] of Object.entries(row)){const spec:any=columns.get(column);if(!spec||value!==null&&!['string','number'].includes(typeof value)||typeof value==='number'&&!Number.isFinite(value))throw Error('Invalid field in '+table);if(value!==null&&((spec.type==='TEXT'&&typeof value!=='string')||spec.type==='INTEGER'&&!Number.isInteger(value)||spec.type==='REAL'&&typeof value!=='number'))throw Error('Wrong field type in '+table);if(typeof value==='string'&&['data','before','after','pedigreeInfo'].includes(column))JSON.parse(value);if(spec.notnull&&value===null)throw Error('Missing required value in '+table);}
   for(const c of schema.results)if(c.notnull&&c.dflt_value===null&&row[c.name]===undefined)throw Error('Missing '+c.name+' in '+table);
   const old:any=existing.get(row[key]);if(old){const changed=[...columns.keys()].filter(k=>JSON.stringify(old[k]??null)!==JSON.stringify(row[k]??null));if(changed.length){conflicts.push(table+': '+row[key]);if(conflictDetails.length<50){const text=(v:any)=>{const s=typeof v==='string'?v:JSON.stringify(v??null);return s.length>800?s.slice(0,800)+'…':s};let name=old.name||old.rightTag||old.leftTag||old.title||row[key];if(old.data){const value=JSON.parse(old.data);name=value.title||value.name||name}conflictDetails.push({table,id:row[key],label:name,fields:changed.map(name=>({name,current:text(old[name]),backup:text(row[name])}))});}}}else{inserts.push({table,row});counts[table]++;}
  }
  currentOnly[table]=[...existing.keys()].filter(id=>!seen.has(id)).length;
 }
 if(rollback){validateRecoveryLinks(backup.tables);if(!env.BUCKET)throw Error('Safety-backup storage unavailable.');const references:{key:string;size:number}[]=[];for(const a of backup.tables.animals){for(const f of animalFiles(a.pedigreeInfo).files)references.push({key:'animal-files/'+a.id+'/'+f.id,size:f.size})}for(const r of backup.tables.farm_records){for(const f of JSON.parse(r.data).attachments||[])references.push({key:'event-files/'+r.id+'/'+f.id,size:f.size})}for(const f of references){if(!/^(animal-files|event-files)\/[0-9a-f-]{36}\/[0-9a-f-]{36}$/i.test(f.key)||!Number.isSafeInteger(f.size)||f.size<0)throw Error('Invalid backup file reference.');const object=await env.BUCKET.head(f.key);if(!object||object.size!==f.size)throw Error('A referenced backup file is missing from storage. Recover missing media before rolling records back.');}}
 if(b.action==='preview')return json({mode:rollback?'rollback':'missing',speciesScope:b.speciesScope||'all',counts,currentOnly,conflictDetails,conflicts:conflicts.slice(0,50),conflictCount:conflicts.length,stamp:stamp.stamp,missing:inserts.length});
 if(rollback){
  if(b.confirmation!=='RESTORE'||!isUuid(b.operationId))throw Error('Type RESTORE after reviewing the rollback preview.');
  const prior:any=await db.prepare('SELECT * FROM recovery_runs WHERE id=?').bind(b.operationId).first();if(prior)return json({saved:true,rollback:true,safetyKey:prior.safetyKey,epoch:prior.epoch});
  if(b.stamp!==stamp.stamp)return json({error:'Records changed after preview. Preview again.'},409);
  const safetyKey='recovery-safety/'+new Date().toISOString().replaceAll(':','-')+'-'+b.operationId+'-'+crypto.randomUUID()+'.tar',response=await fullBackup(req);if(!response.ok||!response.body)throw Error('A complete safety backup could not be created.');const length=Number(response.headers.get('Content-Length'));if(!Number.isSafeInteger(length)||length<=0)throw Error('Safety backup length unavailable.');const stream=new FixedLengthStream(length);await Promise.all([response.body.pipeTo(stream.writable),env.BUCKET!.put(safetyKey,stream.readable,{onlyIf:{etagDoesNotMatch:'*'},httpMetadata:{contentType:'application/x-tar'}})]);
  const guard=db.prepare("INSERT INTO animals(id,species,sex,origin,firstYear,createdAt) SELECT NULL,'Sheep','Unknown','Purchased',1900,'' WHERE ? != (SELECT "+fingerprint+')').bind(stamp.stamp);
  const statements=[guard,...['animal_history','weights','breeding_history','farm_history','breeding_groups','breeding_projects','farm_records','animals'].map(t=>db.prepare('DELETE FROM '+t))];
  for(const table of tables)for(const row of backup.tables[table]){const columns=Object.keys(row);statements.push(db.prepare('INSERT INTO '+table+' ('+columns.map(c=>'"'+c+'"').join(',')+') VALUES ('+columns.map(()=>'?').join(',')+')').bind(...columns.map(c=>row[c])))}
  statements.push(...counterStatements,db.prepare('UPDATE recovery_control SET epoch=epoch+1 WHERE id=1'),db.prepare('INSERT INTO recovery_runs(id,epoch,scope,safetyKey,createdAt,counts) SELECT ?,epoch,?,?,?,? FROM recovery_control WHERE id=1').bind(b.operationId,b.speciesScope||'all',safetyKey,new Date().toISOString(),JSON.stringify({added:counts,removed:currentOnly,changed:conflicts.length})));
  await db.batch(statements);return json({saved:true,rollback:true,restored:tables.reduce((n,t)=>n+backup.tables[t].length,0),safetyKey});
 }
 if(conflicts.length)return json({error:'Existing records differ from this backup. No records were replaced. Review those conflicts before restoring.'},409);
 if(b.stamp!==stamp.stamp)return json({error:'Records changed after preview. Preview again.'},409);
 if(!inserts.length)return json({saved:true,restored:0});
 if(!env.BUCKET)throw Error('Safety-backup storage is unavailable.');
 const safetyKey='recovery-safety/'+new Date().toISOString().replaceAll(':','-')+'-'+crypto.randomUUID()+'.json';
 await env.BUCKET.put(safetyKey,JSON.stringify({format:'clarksons-records-backup',identityCounters:(await db.prepare('SELECT * FROM identity_counters').all()).results,version:1,exportedAt:new Date().toISOString(),includesMediaBytes:false,tables:before}),{httpMetadata:{contentType:'application/json'}});
 const guard=db.prepare("INSERT INTO animals(id,species,sex,origin,firstYear,createdAt) SELECT NULL,'Sheep','Unknown','Purchased',1900,'' WHERE ? != (SELECT "+fingerprint+')').bind(stamp.stamp);
 const statements=inserts.map(({table,row})=>{const columns=Object.keys(row);return db.prepare('INSERT INTO '+table+' ('+columns.map(c=>'"'+c+'"').join(',')+') VALUES ('+columns.map(()=>'?').join(',')+')').bind(...columns.map(c=>row[c]))});
 await db.batch([guard,...statements,...counterStatements]);return json({saved:true,restored:inserts.length,safetyKey});
 }catch(e){const message=(e as Error).message;return json({error:/SQLITE|D1|UNIQUE|constraint/i.test(message)?'Restore could not be applied because records changed or identifiers conflict. No partial restore was saved.':message},400)}}

export const GET=withReadEpoch(handleGET);

export const POST=withWriteEpoch(handlePOST);
