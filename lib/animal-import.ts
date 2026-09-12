import {validateAnimal,validateParentDates,type Animal} from './livestock.ts';

export const importFields = ['recordKey','species','name','sex','origin','dob','birthYear','firstYear','rightTag','rightTagColor','tagColors','leftTag','leftTagColor','eid','breed','pedigreeOnly','sireKey','damKey','farm','registry','registrationNumber','notes'] as const;
export type ImportField=typeof importFields[number];
export type ImportRow=Record<ImportField,string>&{id:string};
export const fieldLabels:Record<ImportField,string>={recordKey:'Import key',species:'Species',name:'Name',sex:'Sex',origin:'Origin',dob:'Birth date',birthYear:'Birth year',firstYear:'First recorded year',rightTag:'Right tag',rightTagColor:'Right tag color',tagColors:'Tag colors (right/left)',leftTag:'Left tag',leftTagColor:'Left tag color',eid:'EID',breed:'Breed',pedigreeOnly:'Unowned ancestor',sireKey:'Sire import key',damKey:'Dam import key',farm:'Breeder / farm',registry:'Registry',registrationNumber:'Registration number',notes:'Notes / source'};
export function blankImportRow(species:string,year:string,key:string):ImportRow{return {...Object.fromEntries(importFields.map(k=>[k,''])),id:crypto.randomUUID(),recordKey:key,species,sex:'',origin:'Purchased',firstYear:year,pedigreeOnly:'No'} as ImportRow}
export function mapImportRows(grid:string[][],mapping:string[],species:string,year:string):ImportRow[]{
 return grid.slice(1).map((cells,i)=>{
  const r=blankImportRow(species,year,String(i+1));
  for(const field of importFields){
   const columns=mapping.flatMap((k,c)=>k===field&&cells[c]?.trim()?[c]:[]);
   const values=[...new Set(columns.map(c=>cells[c].trim()))];
   if(values.length>1)throw Error(`Row ${i+1}: ${columns.map(c=>'“'+grid[0][c]+'”').join(' and ')} contain different values for ${fieldLabels[field]}. Correct the source values or set the column you do not want to “Do not import”.`);
   if(values.length)r[field]=values[0];
  }
  if(r.tagColors){const parts=r.tagColors.split('/').map(v=>v.trim());if(parts.length>2)throw Error(`Row ${i+1}: use right/left for tag colors.`);for(const [field,color] of [['rightTagColor',parts[0]],['leftTagColor',parts[1]||'']] as const){if(r[field]&&color&&r[field].toLowerCase()!==color.toLowerCase())throw Error(`Row ${i+1}: conflicting ${fieldLabels[field]}.`);if(!r[field])r[field]=color;}}
  return normalizeImportRow(r);
 });
}
const canonical=(v:string)=>v.toLowerCase().replace(/[^a-z0-9]/g,'');
export function matchImportField(header:string):ImportField|''{const h=canonical(header);const aliases:Record<string,ImportField>={tagcolor:'tagColors',tag1:'rightTag',tag2:'leftTag',tag1color:'rightTagColor',tag2color:'leftTagColor',righttagnumber:'rightTag',lefttagnumber:'leftTag',animalname:'name',registeredname:'name',gender:'sex',dateofbirth:'dob',birthdate:'dob',electronicid:'eid',eartag:'rightTag',tag:'rightTag',year:'firstYear',unownedancestor:'pedigreeOnly',sire:'sireKey',dam:'damKey',id:'recordKey',animalid:'recordKey',registration:'registrationNumber'};return importFields.find(k=>canonical(k)===h||canonical(fieldLabels[k])===h)||aliases[h]||''}
export function parseCsv(text:string):string[][]{
 text=text.replace(/^\uFEFF/,'');const rows:string[][]=[];let row:string[]=[],cell='',quoted=false,closed=false;
 for(let i=0;i<text.length;i++){const c=text[i];if(quoted){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++}else{quoted=false;closed=true}}else cell+=c;continue}
 if(c==='"'){if(cell||closed)throw Error('Unexpected quote in CSV. Save the spreadsheet as CSV again.');quoted=true}
 else if(c===','||c==='\n'||c==='\r'){row.push(cell);cell='';closed=false;if(c!==','){if(c==='\r'&&text[i+1]==='\n')i++;if(row.some(v=>v.trim()))rows.push(row);row=[]}}
 else{if(closed&&!/\s/.test(c))throw Error('Unexpected text after a quoted CSV cell.');if(!closed)cell+=c}
 }
 if(quoted)throw Error('A quoted CSV cell is not closed.');row.push(cell);if(row.some(v=>v.trim()))rows.push(row);return rows;
}
export function normalizeImportRow(r:ImportRow):ImportRow{
 const n={...r};for(const k of importFields)n[k]=String(r[k]??'').trim();
 if(!n.sex||['unknown','not known','n/a','?'].includes(n.sex.toLowerCase()))n.sex='Unknown';
 if(/^\d{4}$/.test(n.dob)){if(!n.birthYear)n.birthYear=n.dob;n.dob='';}
 const us=n.dob.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);if(us)n.dob=`${us[3]}-${us[1].padStart(2,'0')}-${us[2].padStart(2,'0')}`;
 const sex=canonical(n.sex);n.sex=({f:'Female',female:'Female',ewe:'Female',doe:'Female',m:'Male',male:'Male',ram:'Male',buck:'Male',wether:'Castrated male',castratedmale:'Castrated male'} as Record<string,string>)[sex]||n.sex;
 n.species=({sheep:'Sheep',goat:'Goats',goats:'Goats'} as Record<string,string>)[canonical(n.species)]||n.species;
 n.origin=({purchase:'Purchased',purchsae:'Purchased',purchased:'Purchased',bought:'Purchased',raised:'Home-raised',homeraised:'Home-raised',homebred:'Home-raised'} as Record<string,string>)[canonical(n.origin)]||n.origin;
 n.pedigreeOnly=['yes','true','1'].includes(n.pedigreeOnly.toLowerCase())?'Yes':['no','false','0',''].includes(n.pedigreeOnly.toLowerCase())?'No':n.pedigreeOnly;
 return n;
}
export function prepareImport(input:ImportRow[],existing:Animal[],year:number){
 if(!Array.isArray(input)||!input.length||input.length>200)throw Error('Import between 1 and 200 animals at a time.');
 const rows=input.map(normalizeImportRow),errors:string[]=[],keys=new Map<string,ImportRow>(),ids=new Set<string>();
 const candidates=rows.map((r,index)=>{const prefix=`Row ${index+1}`;try{
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(r.id)||ids.has(r.id))throw Error('Invalid or repeated row identifier.');ids.add(r.id);
  if(!r.recordKey||keys.has(r.recordKey))throw Error('Use a unique import key for each row.');keys.set(r.recordKey,r);
  if(!['Yes','No'].includes(r.pedigreeOnly))throw Error('Unowned ancestor must be Yes or No.');
  if(!r.name&&!r.rightTag&&!r.leftTag&&!r.eid)throw Error('Enter a name, tag or EID.');
  if(r.pedigreeOnly==='Yes'&&(!r.name||!['Unknown','Male','Female'].includes(r.sex)))throw Error('An unowned ancestor needs a name; sex can be Unknown.');
  for(const k of importFields)if(r[k].length>(k==='notes'?2000:200))throw Error(`${fieldLabels[k]} is too long.`);
  for(const field of ['rightTag','leftTag'] as const)if(r[field]&&(!r[field+'Color' as ImportField]||r[field+'Color' as ImportField].length>60))throw Error('Enter '+fieldLabels[field]+' color (up to 60 characters).');
  const a={...r,dob:r.dob||null,birthYear:r.dob?Number(r.dob.slice(0,4)):r.birthYear?Number(r.birthYear):null,firstYear:Number(r.firstYear),pedigreeOnly:r.pedigreeOnly==='Yes'?1:0,sire:null,dam:null} as unknown as Animal;
  validateAnimal({...a,origin:a.pedigreeOnly?'Purchased':a.origin});if(a.firstYear>year)throw Error('First recorded year cannot be later than the selected year.');return a;
 }catch(e){errors.push(`${prefix}: ${(e as Error).message}`);return null}});
 const all=[...existing,...candidates.filter(Boolean) as Animal[]];
 for(let i=0;i<rows.length;i++){const r=rows[i],a=candidates[i];if(!a)continue;try{
  for(const role of ['sire','dam'] as const){const key=r[role==='sire'?'sireKey':'damKey'];if(!key)continue;const parentRow=keys.get(key);const p=parentRow?candidates.find(x=>x?.id===parentRow.id):undefined;if(!p||p.id===a.id||p.species!==a.species||p.sex!==(role==='sire'?'Male':'Female'))throw Error(`The ${role} import key must refer to another row with the same species and correct sex.`);validateParentDates(a,p);a[role]=p.id}
  const duplicate=all.find(b=>b.id!==a.id&&((r.eid&&b.eid===r.eid)||(b.species===a.species&&((r.rightTag&&b.rightTag===r.rightTag)||(r.leftTag&&b.leftTag===r.leftTag)||(r.name&&b.name.toLowerCase()===r.name.toLowerCase()&&b.sex===a.sex&&b.dob===a.dob&&b.birthYear===a.birthYear)))));
  if(duplicate)throw Error('Possible duplicate name/birth information, tag or EID. Review the existing animal or remove the repeated row.');
 }catch(e){errors.push(`Row ${i+1}: ${(e as Error).message}`)}}
 const visiting=new Set<string>(),done=new Set<string>();const graph=new Map(candidates.filter(Boolean).map(a=>[a!.id,a!]));
 function visit(id:string){if(done.has(id))return;if(visiting.has(id))throw Error('The imported parent links contain a pedigree cycle.');visiting.add(id);const a=graph.get(id);if(a?.sire)visit(a.sire);if(a?.dam)visit(a.dam);visiting.delete(id);done.add(id)}
 try{for(const id of graph.keys())visit(id)}catch(e){errors.push((e as Error).message)}
 return {rows,animals:candidates as Animal[],errors};
}

export function swapImportTags(row:ImportRow):ImportRow{return {...row,rightTag:row.leftTag,leftTag:row.rightTag,rightTagColor:row.leftTagColor,leftTagColor:row.rightTagColor};}
