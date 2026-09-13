import {formerDisplayIds} from './foundation.ts';
import {type Animal,displayId,label} from './livestock.ts';
export const weightFields=['','animalId','eid','tag','rightTag','leftTag','name','weight','unit','date'] as const;
export type WeightField=typeof weightFields[number];
export const weightHeaders:Record<WeightField,string>={'':'Ignore column',animalId:'Animal ID',eid:'EID',tag:'Any tag',rightTag:'Right tag',leftTag:'Left tag',name:'Name',weight:'Weight',unit:'Unit',date:'Date'};
export function matchWeightHeader(header:string):WeightField{const key=header.toLowerCase().replace(/[^a-z0-9]/g,'');return ({animalid:'animalId',id:'animalId',eid:'eid',electronicid:'eid',tag:'tag',tagnumber:'tag',righttag:'rightTag',tag1:'rightTag',lefttag:'leftTag',tag2:'leftTag',name:'name',animalname:'name',weight:'weight',measuredweight:'weight',actualweight:'weight',unit:'unit',units:'unit',date:'date',weighingdate:'date'} as Record<string,WeightField>)[key]||'';}
const norm=(v:string)=>v.trim().toLowerCase();
export function matchWeightAnimal(row:Partial<Record<WeightField,string>>,animals:Animal[],history:any[]=[]):Animal[]{
 const fields=(['animalId','eid','tag','rightTag','leftTag','name'] as const).filter(k=>row[k]?.trim());if(!fields.length)return [];
 return animals.filter(a=>!a.archivedAt&&!a.pedigreeOnly&&fields.every(k=>{const v=norm(row[k]!);const retired=history.filter(h=>h.animalId===a.id&&h.action==='tag').some(h=>{try{const t=JSON.parse(h.after).tagChange;if(t?.mode!=='retire')return false;if(k==='eid')return norm(t.retiredEid||'')===v;if(k==='tag'&&t.field!=='eid')return norm(t.previous||'')===v;if((k==='rightTag'||k==='leftTag')&&t.field===k)return norm(t.previous||'')===v;return false}catch{return false}});if(retired)return true;if(k==='animalId')return [a.id,displayId(a),...formerDisplayIds(history,a.id)].some(x=>norm(x)===v);if(k==='tag'){let extra:string[]=[];try{extra=JSON.parse(a.pedigreeInfo||'{}').additionalTags?.map((t:any)=>t.number)||[]}catch{}return [a.rightTag,a.leftTag,...extra].some(x=>norm(x||'')===v)}return norm(a[k]||'')===v;}));
}
export function weightImportRows(grid:string[][],mapping:WeightField[],animals:Animal[],defaultUnit:string,history:any[]=[]){
 if(!mapping.includes('weight'))throw Error('Map a Weight column first.');
 const mapped=mapping.filter(Boolean);if(new Set(mapped).size!==mapped.length)throw Error('Map each field to only one column.');
 return grid.slice(1).flatMap((cells,index)=>{const row:Partial<Record<WeightField,string>>={};mapping.forEach((field,i)=>{if(field)row[field]=String(cells[i]||'').trim()});if(!row.weight)return [];
 const matches=matchWeightAnimal(row,animals,history);const current=matchWeightAnimal(row,animals);const historical=matches.some(a=>!current.some(c=>c.id===a.id));const suppliedUnit=norm(row.unit||defaultUnit);const unit=['lb','lbs','pound','pounds'].includes(suppliedUnit)?'lb':['kg','kgs','kilogram','kilograms'].includes(suppliedUnit)?'kg':suppliedUnit;
 let date=row.date||'';const us=/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(date);if(us)date=us[3]+'-'+us[1].padStart(2,'0')+'-'+us[2].padStart(2,'0');
 return [{sourceRow:index+2,source:row.animalId||row.eid||row.tag||row.rightTag||row.leftTag||row.name||'No identifier',animalId:matches.length===1&&!historical?matches[0].id:'',matchNote:historical?'Previous identifier found: '+matches.map(label).join(', ')+'. Confirm the animal and weighing date.':matches.length>1?'Multiple animals match':'No exact match',value:row.weight,unit,date}];});
}
export function weightTemplate(animals:Animal[]){const quote=(v:string)=>'"'+(/^[=+@\-\t\r]/.test(v)?"'":'')+v.replaceAll('"','""')+'"';return [['Animal ID','Name','Right tag','Left tag','EID','Weight','Unit'],...animals.filter(a=>!a.archivedAt&&!a.pedigreeOnly).map(a=>[a.id,a.name,a.rightTag,a.leftTag,a.eid||'','','lb'])].map(row=>row.map(quote).join(',')).join('\r\n');}
