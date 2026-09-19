import {NextResponse} from 'next/server';
import {env} from 'cloudflare:workers';
import {checkPassword,digest,gatePage,hex,readSession,sameOrigin,sessionHeader,sessionSeconds} from './lib/dashboard-access';
const noStore={'Cache-Control':'private, no-store, max-age=0','Pragma':'no-cache','X-Robots-Tag':'noindex, nofollow','X-Content-Type-Options':'nosniff'};
function page(message='',status=200){return new Response(gatePage(message),{status,headers:{...noStore,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'self'"}})}
export async function middleware(request:Request){
 const url=new URL(request.url),path=url.pathname;
 // Static program assets contain no farm records. All dynamic routes are protected.
 if(path.startsWith('/_next/static/')||['/favicon.svg','/app-icon-192.png','/app-icon-512.png','/manifest.webmanifest','/offline-worker.js','/pdf.worker.min.mjs'].includes(path))return NextResponse.next();
 const config=env as unknown as {FLOCK_PASSWORD_HASH?:string;FLOCK_PUBLIC_ORIGIN?:string;DB:D1Database};
 const hash=config.FLOCK_PASSWORD_HASH,db=config.DB,origin=config.FLOCK_PUBLIC_ORIGIN||url.origin,secure=url.protocol==='https:'||origin.startsWith('https:');
 if(!hash||!db)return new Response('Dashboard access is not configured. Please contact the owner.',{status:503,headers:noStore});
 try{
  const now=Math.floor(Date.now()/1000),unsafe=!['GET','HEAD','OPTIONS'].includes(request.method);
  if(unsafe&&!sameOrigin(request,origin))return new Response('Request origin rejected.',{status:403,headers:noStore});
  if(path==='/access/unlock'&&request.method==='POST'){
   if(Number(request.headers.get('content-length')||0)>2048)return page('Password input is too long.',400);
   const ip=request.headers.get('cf-connecting-ip')||'unknown',ipKey='ip:'+await digest(hash+ip)+':'+Math.floor(now/900),globalKey='global:'+Math.floor(now/3600);
   const counts=await db.batch([db.prepare('DELETE FROM dashboard_login_attempts WHERE expires < ?').bind(now),db.prepare('DELETE FROM dashboard_sessions WHERE expires < ?').bind(now),...[[ipKey,now+900],[globalKey,now+3600]].map(([key,expires])=>db.prepare('INSERT INTO dashboard_login_attempts(key,attempts,expires) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET attempts=attempts+1 RETURNING attempts').bind(key,expires))]);
   if(Number((counts[2].results[0] as any)?.attempts)>5||Number((counts[3].results[0] as any)?.attempts)>30){const response=page('Too many attempts. Please try again in an hour.',429);response.headers.set('Retry-After','3600');return response}
   const body=await request.text();if(body.length>2048)return page('Password input is too long.',400);const password=new URLSearchParams(body).get('password')||'';
   if(!password||password.length>128||!await checkPassword(password,hash))return page('Incorrect password. Try again.',401);
   const token=hex(crypto.getRandomValues(new Uint8Array(32)));await db.prepare('INSERT INTO dashboard_sessions(tokenHash,expires) VALUES (?,?)').bind(await digest(token+hash),now+sessionSeconds).run();
   return new Response(null,{status:303,headers:{...noStore,'Location':'/','Set-Cookie':sessionHeader(token,secure)}});
  }
  const token=readSession(request),key=token?await digest(token+hash):'';
  if(path==='/access/lock'&&request.method==='POST'){
   if(key)await db.prepare('DELETE FROM dashboard_sessions WHERE tokenHash=?').bind(key).run();
   return Response.json({locked:true},{headers:{...noStore,'Set-Cookie':sessionHeader('',secure,0)}});
  }
  const session=key?await db.prepare('SELECT expires FROM dashboard_sessions WHERE tokenHash=? AND expires>?').bind(key,now).first():null;
  if(path==='/access')return page();
  if(!session){if(path.startsWith('/api/')||request.method!=='GET'&&request.method!=='HEAD')return Response.json({error:'Unlock the dashboard to continue.',authenticationRequired:true},{status:401,headers:noStore});return page()}
  const response=NextResponse.next();for(const [key,value] of Object.entries(noStore))response.headers.set(key,value);return response;
 }catch{return new Response('Dashboard access is temporarily unavailable. Please try again.',{status:503,headers:noStore})}
}
export const config={matcher:['/:path*']};
