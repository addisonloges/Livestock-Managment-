import {presentInYear,type StatusEvent} from './animal-status.ts';
export type Ancestor={id:string;sire:string|null;dam:string|null};
export type Animal=Ancestor & {statusEvents?:StatusEvent[];pedigreeOnly?:number;pedigreeInfo?:string;archivedAt?:string|null;seq:number;species:string;name:string;rightTag:string;leftTag:string;eid:string|null;sex:string;origin:string;dob:string|null;birthYear:number|null;firstYear:number;breed:string;status:string;createdAt:string;version:number};
export type Weight={version?:number;voided?:boolean;id:string;animalId:string;date:string;pounds:number;originalValue:number;unit:string;session:string};
export function displayId(a:{seq:number;birthYear:number|null}){return `${a.birthYear?String(a.birthYear).slice(-2):'?'}-${String(a.seq).padStart(3,'0')}`}
export function label(a:Animal){return a.name||a.rightTag||a.leftTag||a.eid||displayId(a)}
export function visibleInYear(a:{firstYear:number;status?:string;statusEvents?:StatusEvent[]},year:string){return presentInYear({...a,status:a.status||'Active'},year)}
export function adg(weights:{date:string;pounds:number}[]){const w=[...weights].sort((a,b)=>a.date.localeCompare(b.date));if(w.length<2)return null;const a=w[w.length-2],b=w[w.length-1];const days=(Date.parse(b.date)-Date.parse(a.date))/86400000;return days>0?(b.pounds-a.pounds)/days:null}
export function validDate(x:string){return /^\d{4}-\d{2}-\d{2}$/.test(x)&&!Number.isNaN(Date.parse(x))&&new Date(x).toISOString().slice(0,10)===x}
export function validateAnimal(a:any){
 if(!['Sheep','Goats'].includes(a.species))throw Error('Choose Sheep or Goats.');
 if(!['Unknown','Female','Male','Castrated male'].includes(a.sex))throw Error('Choose a valid sex or Unknown.');
 if(!['Home-raised','Purchased'].includes(a.origin))throw Error('Choose an origin.');
 if(a.dob&&(!validDate(a.dob)||a.dob>new Date().toISOString().slice(0,10)))throw Error('Enter a valid birth date that is not in the future.');
 if(a.birthYear!==null&&a.birthYear!==undefined&&(!Number.isInteger(a.birthYear)||a.birthYear<1900||a.birthYear>new Date().getFullYear()))throw Error('Enter a valid birth year.');
 if(!Number.isInteger(a.firstYear)||a.firstYear<1900||a.firstYear>new Date().getFullYear())throw Error('Enter a valid first recorded year.');
 const y=a.dob?Number(a.dob.slice(0,4)):a.birthYear;if(y&&a.firstYear<y)throw Error('First recorded year cannot precede birth.');
 if(a.sire&&a.sire===a.dam)throw Error('Sire and dam must differ.');
 for(const f of ['name','rightTag','leftTag','eid','breed'])if(a[f]&&String(a[f]).length>200)throw Error(`${f} must be 200 characters or fewer.`);
}
export function relationshipMatrix(animals:Ancestor[]){
 const map=new Map(animals.map(a=>[a.id,a]));if(map.size!==animals.length)throw Error('Duplicate pedigree identities.');
 const order:Ancestor[]=[],visiting=new Set<string>(),done=new Set<string>();
 function visit(id:string){if(done.has(id))return;if(visiting.has(id))throw Error('Pedigree cycle detected.');const a=map.get(id);if(!a)throw Error('A referenced ancestor is missing.');visiting.add(id);if(a.sire)visit(a.sire);if(a.dam)visit(a.dam);visiting.delete(id);done.add(id);order.push(a)}
 animals.forEach(a=>visit(a.id));const rows=new Map<string,Map<string,number>>();
 const get=(a:string|null,b:string|null):number=>a&&b?rows.get(a)?.get(b)||rows.get(b)?.get(a)||0:0;
 for(const a of order){const row=new Map<string,number>();for(const b of rows.keys())row.set(b,(get(a.sire,b)+get(a.dam,b))/2);row.set(a.id,1+get(a.sire,a.dam)/2);rows.set(a.id,row)}
 return {get,has:(id:string)=>rows.has(id)};
}
export function projectedCoi(matrix:ReturnType<typeof relationshipMatrix>,sire:string,dam:string){if(!matrix.has(sire)||!matrix.has(dam))throw Error('Select recorded parents.');return matrix.get(sire,dam)/2}
export function relation(a:Animal,b:Animal){if(a.id===b.sire||a.id===b.dam||b.id===a.sire||b.id===a.dam)return 'Parent / offspring';if(a.sire&&a.dam&&a.sire===b.sire&&a.dam===b.dam)return 'Full siblings';if((a.sire&&a.sire===b.sire)||(a.dam&&a.dam===b.dam))return 'Half siblings';return 'See pedigree'}

export function isFlockAnimal(a:{pedigreeOnly?:number;archivedAt?:string|null}){return !a.pedigreeOnly&&!a.archivedAt}
export function ancestorInfo(value:unknown){
 const source=value&&typeof value==='object'?value as Record<string,unknown>:{};
 const result:Record<string,string>={};
 for(const field of ['farm','registry','registrationNumber','notes']){
  const v=source[field]??'';if(typeof v!=='string'||v.length>(field==='notes'?2000:200))throw Error('Ancestor details exceed the allowed length.');result[field]=v.trim();
 }
 return result;
}
export function validateParentDates(child:Animal,parent:Animal){
 if(child.dob&&parent.dob&&parent.dob>=child.dob)throw Error('Parents must be born before their offspring.');
 const cy=child.dob?Number(child.dob.slice(0,4)):child.birthYear;
 const py=parent.dob?Number(parent.dob.slice(0,4)):parent.birthYear;
 if(cy&&py&&py>cy)throw Error('A parent cannot have a later birth year.');
}
