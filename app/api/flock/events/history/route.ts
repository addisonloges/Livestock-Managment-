import {rawDb} from '@/db';
import {isUuid} from '@/lib/lambing';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const id=new URL(req.url).searchParams.get('id');
 if(!id||!isUuid(id))return Response.json({error:'Choose an event.'},{status:400});
 try{
  const result=await rawDb().prepare('SELECT operationId,before,after,createdAt FROM farm_history WHERE recordId=? ORDER BY createdAt DESC').bind(id).all<any>();
  return Response.json({history:result.results.map(r=>({...r,before:JSON.parse(r.before),after:JSON.parse(r.after)}))},{headers:{'Cache-Control':'no-store'}});
 }catch{return Response.json({error:'History could not be loaded.'},{status:503})}
}
