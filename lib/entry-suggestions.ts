export const suggestionFields=['generation','breed','registry','farm','rightTagColor','leftTagColor','additionalTagColor'] as const;
export function suggestionList(field:string){return (suggestionFields as readonly string[]).includes(field)?'past-'+field:undefined}
export function collectSuggestions(animals:{breed?:string;pedigreeInfo?:string}[]){
 const sets=Object.fromEntries(suggestionFields.map(k=>[k,new Map<string,string>()])) as Record<string,Map<string,string>>;
 for(const v of ['F0','F1BD','F1-BD','F1','F2','FP','A','B','C','AP','F3','F4','F5'])sets.generation.set(v.toLowerCase(),v);
 for(const a of animals){let info:any={};try{info=JSON.parse(a.pedigreeInfo||'{}')}catch{}
 for(const k of suggestionFields){const value=String(k==='breed'?a.breed||'':info[k]||'').trim();if(value)sets[k].set(value.toLocaleLowerCase(),value)}}
 return Object.fromEntries(suggestionFields.map(k=>[k,[...sets[k].values()].sort((a,b)=>a.localeCompare(b))]));
}
