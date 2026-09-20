import {env} from 'cloudflare:workers';
export const dynamic='force-dynamic';
export async function GET(req:Request){
 const url=new URL(req.url),user=url.searchParams.get('user')||'',offset=Math.max(0,Number(url.searchParams.get('offset'))||0);
 const rows=await env.DB!.prepare("SELECT * FROM dashboard_changes WHERE (?='' OR userId=?) ORDER BY createdAt DESC,id DESC LIMIT 101 OFFSET ?").bind(user,user,offset).all();
 return Response.json({rows:rows.results.slice(0,100),more:rows.results.length>100},{headers:{'Cache-Control':'no-store'}});
}
