import {env} from 'cloudflare:workers';
import {rawDb} from '@/db';
import {animalFiles,fileType} from '@/lib/animal-files';
import {isUuid} from '@/lib/lambing';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 const form=await req.formData(),animalId=String(form.get('animalId')||''),eventId=String(form.get('eventId')||''),fileId=String(form.get('fileId')||''),file=form.get('file');
 if(!!eventId===!!animalId||!isUuid(eventId||animalId)||!isUuid(fileId)||!(file instanceof File)||file.size>10*1024*1024)throw Error('Invalid backup file.');
 const animal:any=await rawDb().prepare('SELECT pedigreeInfo FROM animals WHERE id=?').bind(animalId).first();
 const event:any=eventId?await rawDb().prepare('SELECT data FROM farm_records WHERE id=?').bind(eventId).first():null;const reference=eventId?event&&JSON.parse(event.data).attachments?.find((f:any)=>f.id===fileId):animal&&animalFiles(animal.pedigreeInfo).files.find(f=>f.id===fileId);if(!reference)throw Error('Restore this file’s animal records first.');
 const bytes=new Uint8Array(await file.arrayBuffer());if(bytes.length!==reference.size||fileType(bytes)!==reference.type)throw Error('File bytes do not match the saved document details.');
 if(!env.BUCKET)throw Error('File storage unavailable.');const key=(eventId?'event-files/'+eventId:'animal-files/'+animalId)+'/'+fileId,old=await env.BUCKET.get(key);
 if(old){const digest=async(b:BufferSource)=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',b))).join(',');if(await digest(await old.arrayBuffer())!==await digest(bytes))return Response.json({error:'An existing file differs. It was not overwritten.'},{status:409});return Response.json({saved:true,alreadyPresent:true});}
 const stored=await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:reference.type},onlyIf:{etagDoesNotMatch:'*'}});if(!stored)return Response.json({error:'File arrived from another operation. Retry to compare it.'},{status:409});return Response.json({saved:true});
 }catch(e){return Response.json({error:(e as Error).message},{status:400})}}
