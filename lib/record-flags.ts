export type FlagRules={sex:boolean;birth:boolean};
export function recordFlags(a:{sex:string;dob:string|null;birthYear:number|null},rules:FlagRules){
 const flags:string[]=[];
 if(rules.sex&&(!a.sex||a.sex==='Unknown'))flags.push('Sex unknown');
 if(rules.birth&&!a.dob&&!a.birthYear)flags.push('Birth information unknown');
 return flags;
}
