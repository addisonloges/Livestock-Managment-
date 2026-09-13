import {displayId,type Animal,type Weight} from './livestock.ts';
import {statusAt} from './animal-status.ts';
export function weightsThroughYear(weights:Weight[],year:string){return weights.filter(w=>!w.voided&&(year==='all'||w.date<=year+'-12-31'));}
export function formerDisplayIds(history:any[],animalId:string){return [...new Set(history.filter(h=>h.animalId===animalId).flatMap(h=>{try{const a=JSON.parse(h.before);return Number.isInteger(a.seq)?[displayId(a)]:[]}catch{return []}}))];}
export function animalCsv(animals:Animal[],asOf:string){
 const keys=['id','displayId','species','name','rightTag','leftTag','eid','sex','dob','birthYear','breed','firstYear','pedigreeOnly','sireKey','damKey','rightTagColor','leftTagColor','additionalTags','status','exitDate','exitReason','cullReason'];
 const quote=(value:unknown)=>{let s=String(value??'');if(/^[=+@\-\t\r]/.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'};
 return [keys,...animals.map(a=>{const info=JSON.parse(a.pedigreeInfo||'{}');const exit=[...(a.statusEvents||[])].filter(e=>!e.date||e.date<=asOf).at(-1);const fields={...a,displayId:displayId(a),pedigreeOnly:a.pedigreeOnly?'Yes':'No',sireKey:a.sire||'',damKey:a.dam||'',rightTagColor:info.rightTagColor||'',leftTagColor:info.leftTagColor||'',additionalTags:JSON.stringify(info.additionalTags||[]),status:statusAt(a,asOf),exitDate:exit?.date||'',exitReason:exit?.exitReason||'',cullReason:exit?.cullReason||''};return keys.map(k=>(fields as any)[k]);})].map(row=>row.map(quote).join(',')).join('\r\n');
}
