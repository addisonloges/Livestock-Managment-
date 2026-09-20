import {auditWrite} from './change-audit';
import {AsyncLocalStorage} from 'node:async_hooks';
import {env} from 'cloudflare:workers';
export const writeEpoch=new AsyncLocalStorage<number>();
export const epochHeader='X-Flock-Epoch';
export async function currentEpoch(){if(!env.DB)throw Error('Database unavailable.');const row=await env.DB.prepare('SELECT epoch FROM recovery_control WHERE id=1').first<{epoch:number}>();if(!row)throw Error('Recovery control unavailable.');return row.epoch;}
const stale=()=>Response.json({error:'Records were recovered after this working copy was loaded. Reload the app and review pending saves before saving again.',recoveryChanged:true},{status:409});
export function withWriteEpoch(handler:(req:Request)=>Promise<Response>){return async(req:Request)=>{try{const epoch=await currentEpoch(),value=req.headers.get(epochHeader);if(value===null?epoch!==0:!/^\d+$/.test(value)||Number(value)!==epoch)return stale();const response=await writeEpoch.run(epoch,()=>auditWrite(req,()=>handler(req)));if(!response.ok&&await currentEpoch()!==epoch)return stale();return response;}catch{return Response.json({error:'The save could not be verified. No confirmation was returned.'},{status:503})}}}
export function withReadEpoch(handler:(req:Request)=>Promise<Response>){return async(req:Request)=>{try{const epoch=await currentEpoch(),response=await handler(req);if(await currentEpoch()!==epoch)return stale();const headers=new Headers(response.headers);headers.set(epochHeader,String(epoch));return new Response(response.body,{status:response.status,statusText:response.statusText,headers});}catch{return Response.json({error:'Current records are temporarily unavailable.'},{status:503})}}}
export function guardedDatabase(database:D1Database):D1Database{
 const epoch=writeEpoch.getStore();if(epoch===undefined)return database;
 const unwrap=new WeakMap<object,D1PreparedStatement>();
 const guard=()=>database.prepare("INSERT INTO animals(id,species,sex,origin,firstYear,createdAt) SELECT NULL,'Sheep','Unknown','Purchased',1900,'' WHERE ? != (SELECT epoch FROM recovery_control WHERE id=1)").bind(epoch);
 const statement=(target:D1PreparedStatement):D1PreparedStatement=>{const proxy=new Proxy(target,{get(object,key){if(key==='bind')return (...args:unknown[])=>statement(object.bind(...args));if(key==='run')return async()=> (await database.batch([guard(),object]))[1];const value=Reflect.get(object,key);return typeof value==='function'?value.bind(object):value}});unwrap.set(proxy,target);return proxy};
 return new Proxy(database,{get(object,key){if(key==='prepare')return (query:string)=>statement(object.prepare(query));if(key==='batch')return async(statements:D1PreparedStatement[])=> (await object.batch([guard(),...statements.map(s=>unwrap.get(s)||s)])).slice(1);const value=Reflect.get(object,key);return typeof value==='function'?value.bind(object):value}});
}
