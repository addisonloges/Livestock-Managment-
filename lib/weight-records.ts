import {validDate,type Weight} from './livestock.ts';
export function weightState(weight:Weight,history:any[]):Weight{
 const changes=history.filter(h=>h.action?.startsWith('weight-')).map(h=>{try{return JSON.parse(h.after)}catch{return null}}).filter(w=>w?.id===weight.id).sort((a,b)=>b.version-a.version);
 return {...weight,voided:changes[0]?.voided||false};
}
export function validateWeight(value:any,year:number){
 if(typeof value.date!=='string'||!validDate(value.date)||Number(value.date.slice(0,4))!==year||value.date>new Date().toISOString().slice(0,10))throw Error('Choose a valid weight date in the selected year, not in the future.');
 if(!Number.isFinite(value.originalValue)||value.originalValue<=0||value.originalValue>10000||!['lb','kg'].includes(value.unit))throw Error('Enter a positive measured weight and lb or kg.');
 if(typeof value.session!=='string'||!value.session.trim()||value.session.length>200)throw Error('Enter a session name, up to 200 characters.');
 return {...value,session:value.session.trim(),pounds:value.originalValue*(value.unit==='kg'?2.2046226218:1)};
}
