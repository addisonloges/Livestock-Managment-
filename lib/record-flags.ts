export type FlagRules={sex:boolean;birth:boolean};
export function recordFlags(a:{sex:string;dob:string|null;birthYear:number|null;rightTag?:string;leftTag?:string;pedigreeInfo?:string;statusEvents?:{date:string}[]},rules:FlagRules){
 const flags:string[]=[];
 if(rules.sex&&(!a.sex||a.sex==='Unknown'))flags.push('Sex unknown');
 if(rules.birth&&!a.dob&&!a.birthYear)flags.push('Birth information unknown');
 let info:any={};try{info=JSON.parse(a.pedigreeInfo||'{}')}catch{}
 if(a.rightTag?.trim()&&!info.rightTagColor?.trim())flags.push('Right tag color unknown');
 if(a.leftTag?.trim()&&!info.leftTagColor?.trim())flags.push('Left tag color unknown');
 for(const tag of info.additionalTags||[])if(tag.number?.trim()&&!tag.color?.trim())flags.push(`${tag.ear} tag ${tag.number}: color unknown`);
 if(a.statusEvents?.some(e=>!e.date))flags.push('Exit date unknown');
 return flags;
}
