// Ohio State Meat Sheep Balancer v6: Ration rows 8–31. Inputs are as-fed lb;
// feed analyses are on a dry-matter basis. Preserve workbook's 0.454 kg/lb.
export const nutrientLabels = {dm:'Dry matter %',de:'DE Mcal/kg DM',me:'ME Mcal/kg DM',tdn:'TDN % DM',cp:'Protein % DM',ca:'Calcium % DM',co:'Cobalt % DM',k:'Potassium % DM',mg:'Magnesium % DM',na:'Sodium % DM',p:'Phosphorus % DM',s:'Sulfur % DM',cu:'Copper ppm DM',fe:'Iron ppm DM',mn:'Manganese ppm DM',mo:'Molybdenum ppm DM',se:'Selenium ppm DM',zn:'Zinc ppm DM',ndf:'NDF % DM',adf:'ADF % DM'} as const;
export type Nutrient=keyof typeof nutrientLabels;
export type Analysis={id?:string;source:string;nutrients:Partial<Record<Nutrient,number|null>>};
export const targetLabels={dmi:'Dry matter lb/day',me:'ME Mcal/day',tdn:'TDN lb/day',cp:'Protein lb/day',ca:'Calcium g/day',p:'Phosphorus g/day',k:'Potassium g/day',mg:'Magnesium g/day',na:'Sodium g/day',s:'Sulfur g/day',cu:'Copper mg/day',fe:'Iron mg/day',mn:'Manganese mg/day',mo:'Molybdenum mg/day',se:'Selenium mg/day',zn:'Zinc mg/day'} as const;
export type Target=keyof typeof targetLabels;
export type Requirement={id?:string;name:string;source:string;targets:Partial<Record<Target,number|null>>};
export type SheepNutrition={model:'osu-v6-1';requirement?:Requirement;dietScope:'complete'|'supplement';headCount?:number|null;days?:number|null;shrinkPercent?:number|null};
export type RationInput={feedingLb:number|null;ingredients:{name:string;pounds:number;pricePerTon:number|null;analysis?:Analysis}[];nutrition?:SheepNutrition};
const known=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n)&&n>=0;
export function balanceSheepRation(r:RationInput){
 const rows=r.ingredients.filter(i=>i.pounds>0),total=rows.reduce((s,i)=>s+i.pounds,0);
 const concentrations={} as Record<Nutrient,number|null>,missing={} as Record<Nutrient,string[]>;
 for(const key of Object.keys(nutrientLabels) as Nutrient[]){
  missing[key]=rows.filter(i=>!known(i.analysis?.nutrients[key])||key!=='dm'&&!known(i.analysis?.nutrients.dm)).map(i=>i.name||'Unnamed ingredient');
  concentrations[key]=!total||missing[key].length?null:rows.reduce((s,i)=>s+i.pounds*i.analysis!.nutrients[key]!*(key==='dm'?1:i.analysis!.nutrients.dm!/100),0)/total;
 }
 const rate=known(r.feedingLb)&&r.feedingLb>0?r.feedingLb:null;
 const multiply=(v:number|null,factor:number)=>v===null||rate===null?null:v*rate*factor;
 const daily:Record<Target,number|null>={dmi:multiply(concentrations.dm,.01),me:multiply(concentrations.me,.454),tdn:multiply(concentrations.tdn,.01),cp:multiply(concentrations.cp,.01),ca:multiply(concentrations.ca,4.54),p:multiply(concentrations.p,4.54),k:multiply(concentrations.k,4.54),mg:multiply(concentrations.mg,4.54),na:multiply(concentrations.na,4.54),s:multiply(concentrations.s,4.54),cu:multiply(concentrations.cu,.454),fe:multiply(concentrations.fe,.454),mn:multiply(concentrations.mn,.454),mo:multiply(concentrations.mo,.454),se:multiply(concentrations.se,.454),zn:multiply(concentrations.zn,.454)};
 const dm=concentrations.dm,req=r.nutrition?.requirement;
 const estimatedAsFed=known(req?.targets.dmi)&&dm!==null&&dm>0?req.targets.dmi/(dm/100):null;
 const caP=concentrations.ca!==null&&concentrations.p!==null&&concentrations.p>0?concentrations.ca/concentrations.p:null;
 const warnings:string[]=[];
 if(r.nutrition?.dietScope!=='complete')warnings.push('Supplement only: include hay, pasture and mineral intake before assessing the whole diet.');
 if(Object.values(missing).some(x=>x.length))warnings.push('Incomplete feed analysis: unknown nutrients are not treated as zero.');
 if(rows.some(x=>x.analysis?.id?.startsWith('osu-')))warnings.push('Book values are estimates. Replace them with your forage test and product analysis.');
 if(rows.some(x=>/urea|biuret|ammonium/i.test(x.name)))warnings.push('This mix includes a non-protein nitrogen or ammonium ingredient. Crude-protein equivalents do not establish safe inclusion; obtain sheep-nutritionist instructions.');
 if(rows.some(x=>/^Example /i.test(x.name)))warnings.push('An example product is included. Replace its analysis with your actual product before using this ration.');
 if(concentrations.ndf!==null&&concentrations.ndf<10)warnings.push('NDF is below the workbook’s 10% as-fed review minimum. Review fiber and physical forage with your nutritionist.');
 if(caP!==null&&(caP<1.5||caP>3))warnings.push('Review calcium:phosphorus balance; the workbook describes a 2:1 target.');
 // Display workbook limit as such; also review DM concentration to avoid understating risk in wet diets.
 const copperLimit=rate===null?null:15*.454*rate;
 const copperPpmDM=concentrations.cu!==null&&dm!==null&&dm>0?concentrations.cu/(dm/100):null;
 if(copperPpmDM!==null&&copperPpmDM>15)warnings.push('Copper exceeds 15 ppm on a dry-matter basis. Review the complete diet and mineral interactions with your sheep nutritionist.');
 if(daily.cu!==null&&copperLimit!==null&&daily.cu>copperLimit)warnings.push('Copper also exceeds the workbook’s daily review limit.');
 return {concentrations,missing,daily,estimatedAsFed,caP,copperLimit,copperPpmDM,warnings};
}
export function validateSheepNutrition(r:RationInput,species:string){
 if(!r.nutrition&&!r.ingredients.some(i=>i.analysis))return;
 if(species!=='Sheep')throw Error('The Ohio State nutrition balancer is for sheep only.');
 if(r.nutrition&&(r.nutrition.model!=='osu-v6-1'||!['complete','supplement'].includes(r.nutrition.dietScope)))throw Error('Choose a supported sheep nutrition model and diet scope.');
 for(const k of ['headCount','days','shrinkPercent'] as const){const v=r.nutrition?.[k];if(v!==undefined&&v!==null&&(!known(v)||(k==='shrinkPercent'?v>=100:v<1||!Number.isInteger(v)||v>100000)))throw Error('Enter whole positive head counts/days and shrink from 0 to less than 100 percent.');}
 const text=(v:unknown,max:number)=>typeof v==='string'&&v.trim().length>0&&v.length<=max;
 for(const i of r.ingredients){const a=i.analysis;if(!a)continue;if(!text(a.source,1000)||!a.nutrients||Array.isArray(a.nutrients)||typeof a.nutrients!=='object')throw Error('Record a source for each feed analysis.');
  for(const [k,v] of Object.entries(a.nutrients))if(!(k in nutrientLabels)||v!==null&&(!known(v)||v>(['cu','fe','mn','mo','se','zn'].includes(k)?1e6:['cp','tdn'].includes(k)?1000:100)))throw Error('Feed analyses need nonnegative numbers in the indicated units, or blanks.');
 }
 const req=r.nutrition?.requirement;
 if(req){if(!text(req.name,200)||!text(req.source,1000)||!req.targets||Array.isArray(req.targets)||typeof req.targets!=='object')throw Error('Enter a sheep requirement name and source.');for(const [k,v] of Object.entries(req.targets))if(!(k in targetLabels)||v!==null&&(!known(v)||v>1e6))throw Error('Requirement targets must be nonnegative numbers or blanks.');}
}
