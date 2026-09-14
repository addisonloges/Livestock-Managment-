export const statuses=['Active','Sold','Culled','Dead','Transferred'] as const;
export type StatusEvent={date:string;recordedOn?:string;supersedes?:string;status:string;cullReason:string;exitReason:string;operationId:string;reason:string};
export type StatusAnimal={firstYear:number;pedigreeInfo?:string;status:string;statusEvents?:StatusEvent[]};
export function includedInYear(a:{pedigreeInfo?:string},year:number){let selections:Record<string,boolean>={};try{selections=JSON.parse(a.pedigreeInfo||'{}').yearSelections||{}}catch{}const latest=Object.keys(selections).map(Number).filter(y=>y<=year).sort((a,b)=>b-a)[0];return latest===undefined||selections[String(latest)]!==false;}
export function statusAt(a:StatusAnimal,date:string){if(!includedInYear(a,Number(date.slice(0,4))))return 'Not rolled forward';const unknown=a.statusEvents?.find(e=>!e.date);if(unknown)return date>=(unknown.recordedOn||'9999-12-31')?unknown.status:'Unknown';return [...(a.statusEvents||[])].filter(e=>e.date<=date).sort((a,b)=>a.date.localeCompare(b.date)).at(-1)?.status||(a.statusEvents?.length?'Active':a.status);}
export function presentInYear(a:StatusAnimal,year:string){
 if(year==='all')return true;
 if(a.firstYear>Number(year)||!includedInYear(a,Number(year)))return false;
 const unknown=a.statusEvents?.find(e=>!e.date);if(unknown)return Number(year)<=Number((unknown.recordedOn||'9999').slice(0,4));
 const start=year+'-01-01',end=year+'-12-31';
 return statusAt(a,start)==='Active'||(a.statusEvents||[]).some(e=>e.date>=start&&e.date<=end&&(e.status==='Active'||statusAt(a,new Date(Date.parse(e.date)-86400000).toISOString().slice(0,10))==='Active'));
}

export function resolvedStatusEvents(events:StatusEvent[]){const replaced=new Set(events.map(e=>e.supersedes).filter(Boolean));return events.filter(e=>!replaced.has(e.operationId)).sort((a,b)=>(a.date||a.recordedOn||'').localeCompare(b.date||b.recordedOn||''));}
