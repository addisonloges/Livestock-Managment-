import {label,relationshipMatrix,validateParentDates,type Animal} from './livestock.ts';
const key=(v:string)=>v.trim().toLowerCase().replace(/[^a-z0-9]/g,'');
const same=(a:string,b:string)=>a.trim().toLowerCase()===b.trim().toLowerCase();
function info(a:Animal):Record<string,string>{try{return JSON.parse(a.pedigreeInfo||'{}')}catch{return {}}}
export function sourceDate(v:string){const m=v.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);return m?`${m[3]}-${m[1].padStart(2,'0')}-${m[2].padStart(2,'0')}`:v.trim()}
export function hasPedigreeColumns(headers:string[]){return headers.some(h=>['sirereg','sireregistration','sireflocknameid','damreg','damregistration','damflocknameid'].includes(key(h)))}
export function planPedigreeImport(grid:string[][],animals:Animal[],year:number,species:string,overrides:Record<string,string>={}){
 if(!Array.isArray(grid)||grid.length<2||grid.length>201||grid.some(r=>!Array.isArray(r)||r.length>60||r.some(v=>typeof v!=='string'||v.length>2000)))throw Error('Use a spreadsheet with a header and at most 200 animal rows.');
 if(!['Sheep','Goats'].includes(species)||!Number.isInteger(year)||year<1900||year>new Date().getFullYear())throw Error('Choose a species and specific year.');
 const errors:string[]=[],skipped:string[]=[],created:Animal[]=[],updates:{before:Animal;after:Animal;row:number}[]=[];
 const headers=grid[0].map(key),working=animals.map(a=>({...a})),matches:{a:Animal;r:string[];row:number}[]=[];
 function read(r:string[],...names:string[]){const vals=[...new Set(headers.flatMap((h,i)=>names.includes(h)&&r[i]?.trim()?[r[i].trim()]:[]))];if(vals.length>1)throw Error(`Conflicting values in ${names.join(' / ')}.`);return vals[0]||''}
 const selected=working.filter(a=>a.species===species&&!a.archivedAt);
 for(let i=1;i<grid.length;i++){const r=grid[i];try{
  const sire=read(r,'sirereg','sireregistration','sireregistrationnumber')||read(r,'sireflocknameid','sirename'),dam=read(r,'damreg','damregistration','damregistrationnumber')||read(r,'damflocknameid','damname');
  if(!sire&&!dam)continue;
  const right=read(r,'righttag'),left=read(r,'lefttag'),eid=read(r,'eid'),reg=read(r,'ussaregistration','registrationnumber'),name=read(r,'name'),dob=sourceDate(read(r,'dob')||read(r,'birthdate'));
  const byId=selected.filter(a=>(right&&a.rightTag===right)||(left&&a.leftTag===left)||(eid&&a.eid===eid)||(reg&&same(info(a).registrationNumber||'',reg)));
  const found=overrides[String(i)]?selected.filter(a=>a.id===overrides[String(i)]):byId.length?byId:selected.filter(a=>name&&same(a.name,name)&&(!dob||a.dob===dob));
  if(!found.length){skipped.push(`Row ${i}: ${name||right||left||read(r,'flocknameid')||'unmatched animal'} — no existing animal matched`);continue}
  if(found.length!==1)throw Error('More than one existing animal matches. Resolve its identifiers first.');const a=found[0];
  if((right&&a.rightTag&&a.rightTag!==right)||(left&&a.leftTag&&a.leftTag!==left)||(eid&&a.eid&&a.eid!==eid)||(dob&&a.dob&&a.dob!==dob))throw Error('The matched animal has conflicting tags or birth information.');
  if(!a.pedigreeOnly&&a.firstYear>year)throw Error('The animal is not present in the selected year.');
  if(matches.some(m=>m.a.id===a.id))throw Error('The same animal appears more than once with pedigree information.');
  const meta=info(a),flockName=read(r,'flocknameid');if(reg&&meta.registrationNumber&&!same(meta.registrationNumber,reg))throw Error('Existing registration number differs from the spreadsheet.');
  if(reg)meta.registrationNumber=reg;if(flockName)meta.flockNameId=flockName;const member=read(r,'membershipid');if(member)meta.membershipId=member;
  a.pedigreeInfo=JSON.stringify(meta);matches.push({a,r,row:i});
 }catch(e){errors.push(`Row ${i}: ${(e as Error).message}`)}}
 function parent(r:string[],role:'sire'|'dam',child:Animal):Animal|null{
  const reg=read(r,role+'reg',role+'registration',role+'registrationnumber'),name=read(r,role+'flocknameid',role+'name');if(!reg&&!name)return null;
  const sex=role==='sire'?'Male':'Female';const all=[...selected,...created];
  let found=reg?all.filter(a=>same(info(a).registrationNumber||'',reg)):[];
  if(!found.length&&name)found=all.filter(a=>same(a.name,name)||same(info(a).flockNameId||'',name));
  if(found.length>1)throw Error(`Multiple records match ${role} ${name||reg}.`);
  if(found.length){const a=found[0];if(a.id===child.id||a.sex!==sex)throw Error(`The matched ${role} has conflicting identity or sex.`);const old=info(a).registrationNumber;if(reg&&old&&!same(old,reg))throw Error(`The ${role} name matches a different registration number.`);if(reg&&!old)a.pedigreeInfo=JSON.stringify({...info(a),registrationNumber:reg});return a}
  const a:Animal={id:crypto.randomUUID(),seq:0,species,name:name||reg,sex,origin:'Pedigree only',dob:null,birthYear:null,firstYear:year,breed:'',rightTag:'',leftTag:'',eid:null,sire:null,dam:null,status:'Reference',pedigreeOnly:1,pedigreeInfo:JSON.stringify({registrationNumber:reg,flockNameId:name,notes:'Parent identified in imported pedigree spreadsheet; birth details not provided.'}),version:1,createdAt:new Date().toISOString(),archivedAt:null};created.push(a);return a;
 }
 for(const m of matches){try{for(const role of ['sire','dam'] as const){const p=parent(m.r,role,m.a);if(!p)continue;if(m.a[role]&&m.a[role]!==p.id)throw Error(`Existing ${role} differs. Review the current pedigree before replacing it.`);validateParentDates(m.a,p);m.a[role]=p.id}}catch(e){errors.push(`Row ${m.row}: ${(e as Error).message}`)}}
 for(const a of working){const before=animals.find(x=>x.id===a.id)!;if(before.sire!==a.sire||before.dam!==a.dam||before.pedigreeInfo!==a.pedigreeInfo)updates.push({before,after:{...a,version:a.version+1},row:matches.find(m=>m.a.id===a.id)?.row||0})}
 try{relationshipMatrix([...working,...created])}catch(e){errors.push((e as Error).message)}
 const labels=new Map([...working,...created].map(a=>[a.id,label(a)]));
 return {created,updates,errors,skipped,matched:matches.length,preview:matches.map(m=>({row:m.row,animal:label(m.a),sire:labels.get(m.a.sire||'')||'Unknown',dam:labels.get(m.a.dam||'')||'Unknown'})),revision:animals.reduce((sum,a)=>sum+a.version,0)};
}
