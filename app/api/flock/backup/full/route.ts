import {rawDb} from '@/db';
import {env} from 'cloudflare:workers';
import {animalFiles} from '@/lib/animal-files';
import {isUuid} from '@/lib/lambing';
import {tarHeader,tarPadding} from '@/lib/tar';
export const dynamic='force-dynamic';
export async function GET(){try{
 const db=rawDb(),tables=['animals','weights','animal_history','breeding_groups','breeding_history','breeding_projects','farm_records','farm_history'];
 const result=await db.batch(tables.map(t=>db.prepare('SELECT * FROM '+t))),data=Object.fromEntries(tables.map((t,i)=>[t,result[i].results]));
 if(!env.BUCKET)throw Error('File storage unavailable.');
 const files:{key:string;size:number}[]=[];
 for(const animal of data.animals as any[]){for(const file of animalFiles(animal.pedigreeInfo).files){
  if(!isUuid(animal.id)||!isUuid(file.id))throw Error('Invalid file reference.');
  const key='animal-files/'+animal.id+'/'+file.id;
  if(files.some(f=>f.key===key))continue;
  const object=await env.BUCKET.head(key);if(!object)throw Error('A referenced photo or document is missing.');files.push({key,size:object.size});
 }}
 for(const row of data.farm_records as any[]){for(const file of JSON.parse(row.data).attachments||[]){if(!isUuid(row.id)||!isUuid(file.id))throw Error('Invalid event document reference.');const key='event-files/'+row.id+'/'+file.id;const object=await env.BUCKET.head(key);if(!object)throw Error('A referenced event document is missing.');files.push({key,size:object.size});}}
 const bytes=new TextEncoder().encode(JSON.stringify({format:'clarksons-full-backup',version:1,exportedAt:new Date().toISOString(),includesMediaBytes:true,files,tables:data}));
 async function* archive(){yield tarHeader('records.json',bytes.length);yield bytes;yield tarPadding(bytes.length);
  const checksums:Record<string,string>={};
  for(const file of files){const object=await env.BUCKET!.get(file.key);if(!object||object.size!==file.size)throw Error('File changed during backup. Retry the download.');const content=new Uint8Array(await object.arrayBuffer());if(content.length!==file.size)throw Error('Incomplete file download.');checksums[file.key]=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',content))).map(v=>v.toString(16).padStart(2,'0')).join('');yield tarHeader(file.key,file.size);yield content;yield tarPadding(file.size)}
  checksums['records.json']=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))).map(v=>v.toString(16).padStart(2,'0')).join('');
  const verification=new TextEncoder().encode(JSON.stringify(checksums));yield tarHeader('checksums.json',verification.length);yield verification;yield tarPadding(verification.length);
  yield new Uint8Array(1024);
 }
 const checksumBytes=new TextEncoder().encode(JSON.stringify(Object.fromEntries([...files.map(f=>[f.key,'0'.repeat(64)]),['records.json','0'.repeat(64)]])));
 const archiveLength=512+Math.ceil(bytes.length/512)*512+files.reduce((n,f)=>n+512+Math.ceil(f.size/512)*512,0)+512+Math.ceil(checksumBytes.length/512)*512+1024;
 const iterator=archive();const body=new ReadableStream<Uint8Array>({async pull(controller){try{const next=await iterator.next();if(next.done)controller.close();else controller.enqueue(next.value)}catch(e){controller.error(e)}},async cancel(){await iterator.return(undefined)}});
 return new Response(body,{headers:{'Content-Length':String(archiveLength),'Content-Type':'application/x-tar','Content-Disposition':'attachment; filename="clarksons-full-backup.tar"','Cache-Control':'no-store'}});
 }catch(e){return Response.json({error:'Full backup could not start. '+(e as Error).message},{status:503})}}
