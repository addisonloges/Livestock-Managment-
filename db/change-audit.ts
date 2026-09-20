import {env} from 'cloudflare:workers';
import {digest,readSession,validDashboardUser} from '../lib/dashboard-access';
export async function sessionUser(req:Request){
 const hash=(env as unknown as {FLOCK_PASSWORD_HASH?:string}).FLOCK_PASSWORD_HASH,token=readSession(req);
 if(!hash||!token)return null;
 const row=await env.DB!.prepare('SELECT userId FROM dashboard_sessions WHERE tokenHash=? AND expires>?').bind(await digest(token+hash),Math.floor(Date.now()/1000)).first<{userId:string}>();
 return validDashboardUser(row?.userId)?row!.userId:null;
}
export async function auditWrite(req:Request,save:()=>Promise<Response>){
 const userId=await sessionUser(req);if(!userId)return Response.json({error:'Select your user ID and unlock again.'},{status:401});
 const author=req.headers.get('X-Flock-Author');
 if(author&&author!==userId)return Response.json({error:'This save belongs to '+author+'. Lock the dashboard and select that user before syncing.'},{status:409});
 let details:any={};
 if(req.headers.get('content-type')?.includes('application/json'))details=await req.clone().json();
 else if(req.headers.get('content-type')?.includes('multipart/form-data')){const form=await req.clone().formData();for(const [key,value] of form.entries())details[key]=typeof value==='string'?value:{filename:value.name,size:value.size,type:value.type};}
 const id=crypto.randomUUID(),path=new URL(req.url).pathname,action=String(details.action||details.kind||'Save'),raw=JSON.stringify(details);
 const json=raw.length<=64000?raw:JSON.stringify({action,operationId:details.operationId,summary:'Large batch: full records remain in their section histories.',payloadHash:await digest(raw),fields:Object.fromEntries(Object.entries(details).map(([k,v])=>[k,Array.isArray(v)?{count:v.length}:typeof v==='object'?{type:'object'}:String(v).slice(0,500)]))});
 await env.DB!.prepare('INSERT INTO dashboard_changes(id,userId,createdAt,path,action,details,outcome) VALUES (?,?,?,?,?,?,?)').bind(id,userId,new Date().toISOString(),path,action,json,'Unconfirmed').run();
 try{const response=await save();await env.DB!.prepare('UPDATE dashboard_changes SET outcome=?,status=? WHERE id=?').bind(response.ok?'Confirmed':'Not confirmed',response.status,id).run();return response;}
 catch(error){await env.DB!.prepare('UPDATE dashboard_changes SET outcome=? WHERE id=?').bind('Unconfirmed',id).run();throw error;}
}
