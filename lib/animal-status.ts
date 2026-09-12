export const statuses=['Active','Sold','Culled','Dead','Transferred'] as const;
export type StatusEvent={date:string;status:string;cullReason:string;exitReason:string;operationId:string;reason:string};
export type StatusAnimal={firstYear:number;status:string;statusEvents?:StatusEvent[]};
export function statusAt(a:StatusAnimal,date:string){return [...(a.statusEvents||[])].filter(e=>e.date<=date).sort((a,b)=>a.date.localeCompare(b.date)).at(-1)?.status||(a.statusEvents?.length?'Active':a.status);}
export function presentInYear(a:StatusAnimal,year:string){
 if(year==='all')return true;
 if(a.firstYear>Number(year))return false;
 const start=year+'-01-01',end=year+'-12-31';
 return statusAt(a,start)==='Active'||(a.statusEvents||[]).some(e=>e.date>=start&&e.date<=end&&(e.status==='Active'||statusAt(a,new Date(Date.parse(e.date)-86400000).toISOString().slice(0,10))==='Active'));
}
