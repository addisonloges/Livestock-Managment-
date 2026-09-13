import {withReadEpoch,withWriteEpoch} from '@/db/recovery-context';
import {env} from 'cloudflare:workers';
import {rawDb} from '@/db';
import {validDate,type Animal} from '@/lib/livestock';
import {animalFiles,fileType,type AnimalFile} from '@/lib/animal-files';
export const dynamic='force-dynamic';
const uuid=(v:string)=>/^[0-9a-f-]{36}$/i.test(v);
const json=(data:unknown,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store'}});
async function handleGET(req:Request){try{const url=new URL(req.url),id=url.searchParams.get('animal')||'',fileId=url.searchParams.get('file')||'';if(!uuid(id)||!uuid(fileId))return json({error:'File not found.'},404);const a=await rawDb().prepare('SELECT * FROM animals WHERE id=?').bind(id).first<Animal>();const file=a&&animalFiles(a.pedigreeInfo).files.find(f=>f.id===fileId&&!f.removedAt);if(!file)return json({error:'File not found.'},404);if(!env.BUCKET)throw Error('File storage is unavailable.');const object=await env.BUCKET.get('animal-files/'+id+'/'+file.id);if(!object)return json({error:'File could not be found.'},404);return new Response(object.body,{headers:{'Content-Type':file.type,'Content-Disposition':(url.searchParams.has('download')?'attachment':'inline')+'; filename="'+file.name.replace(/[^a-zA-Z0-9._ -]/g,'_')+'"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"sandbox; default-src 'none'"}});}catch(e){return json({error:'File storage is temporarily unavailable.'},503)}}
async function handlePOST(req:Request){try{
 const form=await req.formData();const id=String(form.get('animalId')||''),op=String(form.get('operationId')||''),action=String(form.get('action')||''),year=Number(form.get('year')),version=Number(form.get('version'));
 if(!uuid(id)||!uuid(op))throw Error('Invalid record identifier.');if(!Number.isInteger(year)||year<1900||year>new Date().getFullYear())throw Error('Choose a specific year to change files.');if(!['upload','remove','restore','primary','details'].includes(action))throw Error('Choose a valid file action.');
 const db=rawDb();const prior=await db.prepare('SELECT animalId,action FROM animal_history WHERE operationId=?').bind(op).first<any>();if(prior){if(prior.animalId!==id||prior.action!=='file-'+action)throw Error('Change identifier already used.');return json({saved:true});}
 const animal=await db.prepare('SELECT * FROM animals WHERE id=?').bind(id).first<Animal>();if(!animal||animal.archivedAt||(!animal.pedigreeOnly&&animal.firstYear>year))throw Error('Open a current animal record in an applicable year.');if(animal.version!==version)return json({error:'Animal changed elsewhere. Close and reopen the profile before retrying.'},409);
 const meta=JSON.parse(animal.pedigreeInfo||'{}');const state=animalFiles(animal.pedigreeInfo);const files=state.files.map(f=>({...f}));const now=new Date().toISOString();let primaryPhotoId=state.primaryPhotoId;
 const caption=String(form.get('caption')||'').trim(),takenOn=String(form.get('takenOn')||'');if(caption.length>500||takenOn&&(!validDate(takenOn)||takenOn>now.slice(0,10)))throw Error('Use a caption up to 500 characters and a valid date, or leave the date unknown.');
 let file=files.find(f=>f.id===String(form.get('fileId')));let objectKey='';
 if(action==='upload'){
  const upload=form.get('file'),category=String(form.get('category'));if(!(upload instanceof File)||!['photo','registration'].includes(category))throw Error('Choose a photo or registration document.');if(upload.size===0||upload.size>10*1024*1024)throw Error('Choose a file between 1 byte and 10 MB.');if(files.length>=100)throw Error('This profile has reached 100 files.');const bytes=new Uint8Array(await upload.arrayBuffer()),type=fileType(bytes);if(!type||category==='photo'&&type==='application/pdf')throw Error('Use JPG, PNG or WebP for photos; registration papers also accept PDF.');if(!env.BUCKET)throw Error('File storage is unavailable.');
  file={id:op,category:category as AnimalFile['category'],name:upload.name.slice(0,200)||'document',type,size:upload.size,uploadedAt:now,takenOn,caption,...(category==='registration'?{registry:String(meta.registry||''),registrationNumber:String(meta.registrationNumber||'')}:{})};objectKey='animal-files/'+id+'/'+op;await env.BUCKET.put(objectKey,bytes,{httpMetadata:{contentType:type}});files.push(file);if(category==='photo'&&(!primaryPhotoId||form.get('makePrimary')==='true'))primaryPhotoId=file.id;
 }else{
  if(!file)throw Error('File not found.');if(action==='restore'){if(!file.removedAt)throw Error('File is already visible.');delete file.removedAt;}
  else {if(file.removedAt)throw Error('Restore this file before changing it.');if(action==='remove'){file.removedAt=now;if(primaryPhotoId===file.id)primaryPhotoId=files.find(f=>f.category==='photo'&&!f.removedAt)?.id||'';}if(action==='primary'){if(file.category!=='photo')throw Error('Choose an animal photo.');primaryPhotoId=file.id;}if(action==='details'){file.caption=caption;file.takenOn=takenOn;}}
 }
 const next={...animal,version:version+1,pedigreeInfo:JSON.stringify({...meta,files,primaryPhotoId})};const reason=action==='upload'?'Added '+file!.category+': '+file!.name:action==='primary'?'Changed profile photo':action==='details'?'Updated photo/document details':(action==='remove'?'Removed (restorable): ':'Restored: ')+file!.name;
 const result=await db.batch([db.prepare('INSERT INTO animal_history (operationId,animalId,action,reason,before,after,createdAt) SELECT ?,?,?,?,?,?,? FROM animals WHERE id=? AND version=?').bind(op,id,'file-'+action,reason,JSON.stringify(animal),JSON.stringify(next),now,id,version),db.prepare('UPDATE animals SET pedigreeInfo=?,version=version+1 WHERE id=? AND version=?').bind(next.pedigreeInfo,id,version)]);
 if(result[1].meta.changes!==1)return json({error:'Animal changed elsewhere. Reopen the profile and retry.'},409);return json({saved:true});
 }catch(e){console.error('Animal file save failed',e);const m=e instanceof Error?e.message:'Unable to save file.';return json({error:/D1|SQLITE|R2/.test(m)?'Unable to save file. Please retry.':m},400)}}

export const GET=withReadEpoch(handleGET);

export const POST=withWriteEpoch(handlePOST);
