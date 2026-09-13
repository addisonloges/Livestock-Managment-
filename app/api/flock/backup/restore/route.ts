import {rawDb} from '@/db';
import {env} from 'cloudflare:workers';
export const dynamic='force-dynamic';
const tables=['animals','weights','animal_history','breeding_groups','breeding_history','breeding_projects','farm_records','farm_history'];
const keyFor=(table:string)=>table==='animals'?'id':table.endsWith('history')?'operationId':'id';
const fingerprint=tables.map(t=>`(SELECT COUNT(*) || ':' || ${['animals','weights','breeding_groups','breeding_projects','farm_records'].includes(t)?'COALESCE(SUM(version),0)':"COALESCE(MAX(createdAt),'')"} FROM ${t})`).join(" || '|' || ");
const json=(v:unknown,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(req:Request){try{if(!env.BUCKET)throw Error('Backup storage unavailable.');const key=new URL(req.url).searchParams.get('key');if(key){if(!key.startsWith('recovery-safety/')||key.includes('..')||!key.endsWith('.json'))throw Error('Invalid backup reference.');const object=await env.BUCKET.get(key);if(!object)return json({error:'Safety backup not found.'},404);return new Response(object.body,{headers:{'Content-Type':'application/json','Content-Disposition':'attachment; filename="clarksons-safety-backup.json"','Cache-Control':'no-store'}})}const objects=await env.BUCKET.list({prefix:'recovery-safety/',limit:100});return json({backups:objects.objects.map(o=>({key:o.key,createdAt:o.uploaded,size:o.size})),more:objects.truncated});}catch(e){return json({error:(e as Error).message},503)}}
export async function POST(req:Request){try{
 if(Number(req.headers.get('content-length')||0)>25*1024*1024)throw Error('Records file exceeds 25 MB.');
 const b:any=await req.json(),backup=b.backup;
 if(!['preview','apply'].includes(b.action)||!backup||!['clarksons-full-backup','clarksons-records-backup'].includes(backup.format)||backup.version!==1||!backup.tables)throw Error('Choose a supported records or full-backup file.');
 const db=rawDb(),current=await db.batch(tables.map(t=>db.prepare('SELECT * FROM '+t)));
 const before=Object.fromEntries(tables.map((t,i)=>[t,current[i].results]));
 const stamp:any=await db.prepare('SELECT '+fingerprint+' AS stamp').first();
 const inserts:{table:string;row:Record<string,string|number|null>}[]=[],conflicts:string[]=[],counts:Record<string,number>={};
 for(let i=0;i<tables.length;i++){
  const table=tables[i],rows=backup.tables[table];if(!Array.isArray(rows)||rows.length>100000)throw Error('Invalid or oversized table: '+table);
  const schema=await db.prepare('PRAGMA table_info('+table+')').all<any>(),columns=new Map(schema.results.map(c=>[c.name,c]));
  const key=keyFor(table),existing=new Map(current[i].results.map((r:any)=>[r[key],r])),seen=new Set();counts[table]=0;
  for(const row of rows){
   if(!row||typeof row!=='object'||Array.isArray(row)||typeof row[key]!=='string'||seen.has(row[key]))throw Error('Invalid or repeated record in '+table);seen.add(row[key]);
   for(const [column,value] of Object.entries(row)){const spec:any=columns.get(column);if(!spec||value!==null&&!['string','number'].includes(typeof value)||typeof value==='number'&&!Number.isFinite(value))throw Error('Invalid field in '+table);if(value!==null&&((spec.type==='TEXT'&&typeof value!=='string')||spec.type==='INTEGER'&&!Number.isInteger(value)||spec.type==='REAL'&&typeof value!=='number'))throw Error('Wrong field type in '+table);if(typeof value==='string'&&['data','before','after','pedigreeInfo'].includes(column))JSON.parse(value);if(spec.notnull&&value===null)throw Error('Missing required value in '+table);}
   for(const c of schema.results)if(c.notnull&&c.dflt_value===null&&row[c.name]===undefined)throw Error('Missing '+c.name+' in '+table);
   const old:any=existing.get(row[key]);if(old){if([...columns.keys()].some(k=>JSON.stringify(old[k]??null)!==JSON.stringify(row[k]??null)))conflicts.push(table+': '+row[key]);}else{inserts.push({table,row});counts[table]++;}
  }
 }
 if(b.action==='preview')return json({counts,conflicts:conflicts.slice(0,50),conflictCount:conflicts.length,stamp:stamp.stamp,missing:inserts.length});
 if(conflicts.length)return json({error:'Existing records differ from this backup. No records were replaced. Review those conflicts before restoring.'},409);
 if(b.stamp!==stamp.stamp)return json({error:'Records changed after preview. Preview again.'},409);
 if(!inserts.length)return json({saved:true,restored:0});
 if(!env.BUCKET)throw Error('Safety-backup storage is unavailable.');
 const safetyKey='recovery-safety/'+new Date().toISOString().replaceAll(':','-')+'-'+crypto.randomUUID()+'.json';
 await env.BUCKET.put(safetyKey,JSON.stringify({format:'clarksons-records-backup',version:1,exportedAt:new Date().toISOString(),includesMediaBytes:false,tables:before}),{httpMetadata:{contentType:'application/json'}});
 const guard=db.prepare("INSERT INTO animals(id,species,sex,origin,firstYear,createdAt) SELECT NULL,'Sheep','Unknown','Purchased',1900,'' WHERE ? != (SELECT "+fingerprint+')').bind(stamp.stamp);
 const statements=inserts.map(({table,row})=>{const columns=Object.keys(row);return db.prepare('INSERT INTO '+table+' ('+columns.map(c=>'"'+c+'"').join(',')+') VALUES ('+columns.map(()=>'?').join(',')+')').bind(...columns.map(c=>row[c]))});
 await db.batch([guard,...statements]);return json({saved:true,restored:inserts.length,safetyKey});
 }catch(e){const message=(e as Error).message;return json({error:/SQLITE|D1|UNIQUE|constraint/i.test(message)?'Restore could not be applied because records changed or identifiers conflict. No partial restore was saved.':message},400)}}
