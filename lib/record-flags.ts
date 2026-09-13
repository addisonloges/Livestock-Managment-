export type FlagRules={sex:boolean;birth:boolean};
export function recordFlags(a:{sex:string;dob:string|null;birthYear:number|null;rightTag?:string;leftTag?:string;pedigreeInfo?:string;statusEvents?:{date:string}[]},rules:FlagRules){
 const flags:string[]=[];
 if(rules.sex&&(!a.sex||a.sex==='Unknown'))flags.push('Sex unknown');
 if(rules.birth&&!a.dob&&!a.birthYear)flags.push('Birth information unknown');
 if(a.statusEvents?.some(e=>!e.date))flags.push('Exit date unknown');
 return flags;
}
