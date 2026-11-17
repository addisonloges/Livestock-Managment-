import {env} from 'cloudflare:workers';
import {rawDb} from '@/db';
import {withReadEpoch,withWriteEpoch} from '@/db/recovery-context';
import {settingsId} from '../settings/route';
import {chicagoToday} from '@/lib/reader';

export const dynamic='force-dynamic';
const tables=['animals','weights','animal_history','breeding_groups','breeding_history','breeding_projects','farm_records','farm_history'];
const stamp=tables.map(t=>"(SELECT COUNT(*) || ':' || "+(t.endsWith('_history')?"COALESCE(MAX(createdAt),'')":'COALESCE(SUM(version),0)')+' FROM '+t+')').join(" || '|' || ");
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store'}});
type Row={id:string;kind:string;species:string;date:string;year:number;firstYear:number;animalId:string;data:string;version:number;action:string;after:string;pedigreeInfo:string};
const dateFields=new Set(['date','start','end','endDate','plannedStart','dueDate','withdrawalEnd','confirmedDate','expires','resolvedDate']);
function spansOtherYears(value:unknown,year:string):boolean{
 if(Array.isArray(value))return value.some(item=>spansOtherYears(item,year));
 if(!value||typeof value!=='object')return false;
 return Object.entries(value).some(([key,item])=>
  dateFields.has(key)&&typeof item==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(item)&&!item.startsWith(year+'-')||
  spansOtherYears(item,year));
}

async function plan(req:Request){
 const query=new URL(req.url).searchParams;
 const year=query.get('year')||'',species=query.get('species')||'';
 const current=chicagoToday().slice(0,4);
 if(!/^\d{4}$/.test(year)||Number(year)<1900||Number(year)>Number(current)+10||!['Sheep','Goats'].includes(species))throw Error('Choose a specific year and species.');
 const db=rawDb();
 const [before,...rows]=await db.batch([db.prepare('SELECT '+stamp+' AS value'),...tables.map(t=>db.prepare('SELECT * FROM '+t+' ORDER BY '+(t.endsWith('_history')?'operationId':'id')))]);
 const records=Object.fromEntries(tables.map((t,i)=>[t,rows[i].results as Row[]]));
 const ids=new Set(records.animals.filter(a=>a.species===species).map(a=>a.id));
 const inYear=(date:string)=>date?.startsWith(year+'-');
 const profiles=records.animals.filter(a=>ids.has(a.id)&&a.firstYear===Number(year));
 const history=records.animal_history.filter(h=>ids.has(h.animalId)&&['ownership','status'].includes(h.action)&&inYear(JSON.parse(h.after).statusEvent?.date||JSON.parse(h.after).ownershipEvent?.date));
 const weights=records.weights.filter(w=>ids.has(w.animalId)&&inYear(w.date));
 const groups=records.breeding_groups.filter(g=>g.species===species&&g.year===Number(year));
 const events=records.farm_records.filter(e=>e.species===species&&inYear(e.date));
 const counts={profiles:profiles.length,history:history.length,weights:weights.length,breedingGroups:groups.length,litters:events.filter(e=>e.kind==='litter').length,otherRecords:events.filter(e=>e.kind!=='litter').length};
 const populated=Object.values(counts).some(Boolean);
 const settings=records.farm_records.find(r=>r.id===settingsId);
 const preferences=settings?JSON.parse(settings.data):{fields:[],addedYears:[]};
 const removePicker=year!==current&&preferences.addedYears?.includes(Number(year));
 const blockers:string[]=[];
 if(profiles.length||history.length)blockers.push('This year contains animal profiles or status and ownership changes. Resolve those in the animal profiles before deleting the year.');
 if(events.some(e=>{const data=JSON.parse(e.data);return e.kind==='litter'&&data.lambs?.some((l:{outcome:string})=>l.outcome==='Alive')||data.saleStatusIds?.length;}))blockers.push('Some records created offspring or changed an animal’s sale status. Resolve them in their original sections first.');
 if([...groups,...events].some(e=>spansOtherYears(JSON.parse(e.data),year))||events.some(e=>e.kind==='management'&&!JSON.parse(e.data).management?.endDate))
  blockers.push('Some records span more than one year. Review those dates or memberships before deleting.');
 const targets=new Set([...weights,...groups,...events].map(r=>r.id));
 const usesTarget=(value:string)=>[...targets].some(id=>value?.includes(id));
 if([...records.farm_records,...records.breeding_groups,...records.breeding_projects].some(r=>!targets.has(r.id)&&usesTarget(r.data))||records.animals.some(a=>usesTarget(a.pedigreeInfo)))
  blockers.push('A record outside this selection depends on one of the records to be deleted. Review its links first.');
 const sharedYear=records.animals.some(a=>!ids.has(a.id)&&a.firstYear===Number(year))||
  records.weights.some(w=>!ids.has(w.animalId)&&inYear(w.date))||
  records.farm_records.some(r=>r.species!==species&&['Sheep','Goats'].includes(r.species)&&inYear(r.date))||
  records.breeding_groups.some(r=>r.species!==species&&r.year===Number(year));
 if(!populated&&(!removePicker||sharedYear))blockers.push('This year is shared with another flock, is the current year, or was not manually added.');
 const removeFromPicker=!!removePicker&&!sharedYear;
 const token=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([year,species,before.results[0],records])))),n=>n.toString(16).padStart(2,'0')).join('');
 return {db,year,species,records,settings,preferences,weights,groups,events,token,snapshot:(before.results[0] as {value:string}).value,preview:{year,species,counts,populated,blockers,removeFromPicker,token}};
}

export const GET=withReadEpoch(async req=>{
 try{return json((await plan(req)).preview)}catch(e){return json({error:(e as Error).message},400)}
});

export const POST=withWriteEpoch(async req=>{
 try{
  const body=await req.json() as {token?:string;reviewed?:boolean;typedYear?:string};
  const p=await plan(req);
  if(body.token!==p.token)return json({error:'Records changed. Open a fresh deletion preview.'},409);
  if(p.preview.blockers.length)return json({error:p.preview.blockers.join(' ')},409);
  if(body.reviewed!==true||p.preview.populated&&body.typedYear!==p.year)return json({error:'Complete the year confirmations before deleting.'},400);
  const {db,settings}=p;
  const now=new Date().toISOString(),operation=crypto.randomUUID();
  const statements=[db.prepare("INSERT INTO animals(id,species,sex,origin,firstYear,createdAt) SELECT NULL,'Sheep','Unknown','Purchased',1900,'' WHERE ? != ("+stamp+')').bind(p.snapshot)];
  if(p.preview.populated){
   if(!env.BUCKET)return json({error:'Backup storage is unavailable.'},503);
   const identityCounters=(await db.prepare('SELECT * FROM identity_counters').all()).results;
   await env.BUCKET.put('recovery-safety/year-delete-'+operation+'.json',JSON.stringify({format:'clarksons-records-backup',version:1,exportedAt:now,identityCounters,includesMediaBytes:false,tables:p.records}),{httpMetadata:{contentType:'application/json'}});
   for(const [table,ids] of [['weights',p.weights],['breeding_groups',p.groups],['farm_records',p.events]] as const){
    if(ids.length)statements.push(db.prepare('DELETE FROM '+table+' WHERE id IN (SELECT value FROM json_each(?))').bind(JSON.stringify(ids.map(r=>r.id))));
   }
  }
  if(p.preview.removeFromPicker&&settings){
   const data=JSON.stringify({...p.preferences,addedYears:p.preferences.addedYears.filter((y:number)=>y!==Number(p.year)),version:settings.version+1});
   statements.push(db.prepare('UPDATE farm_records SET data=?,version=version+1 WHERE id=?').bind(data,settingsId));
  }
  statements.push(db.prepare('INSERT INTO farm_history(operationId,recordId,before,after,createdAt) VALUES (?,?,?,?,?)').bind(operation,settingsId,settings?.data||'{}',JSON.stringify({yearDeletion:{year:p.year,species:p.species,counts:p.preview.counts}}),now));
  if(p.preview.populated)statements.push(db.prepare('UPDATE recovery_control SET epoch=epoch+1 WHERE id=1'));
  await db.batch(statements);
  return json({deleted:true});
 }catch{return json({error:'Deletion could not be confirmed. Refresh the year preview before trying again.'},409)}
});
