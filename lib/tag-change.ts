import {validDate,type Animal} from './livestock.ts';
export const tagLabels={rightTag:'Right tag',leftTag:'Left tag',eid:'EID'};
export function tagChange(animal:Animal,input:any,year:number){
 const field=input.field as keyof typeof tagLabels;
 if(!(field in tagLabels)||!Object.hasOwn(tagLabels,field))throw Error('Choose a tag position.');
 if(!['correct','retire','assign'].includes(input.mode))throw Error('Choose correction, retirement, or assignment.');
 const old=animal[field]||'';
 if(typeof input.value!=='string'||input.value.length>200)throw Error('Tag must be text, up to 200 characters.');
 const value=input.value.trim();
 if(input.mode==='assign'&&old)throw Error('Retire the current tag before assigning another.');
 if(input.mode!=='assign'&&!old)throw Error('There is no current tag in this position.');
 if(input.mode==='assign'&&!value)throw Error('Enter the new tag.');
 if(input.mode==='correct'&&!value)throw Error('Enter the corrected tag. To remove a lost tag, retire it.');
 if(value===old)throw Error('The new value must differ from the current tag.');
 if(!validDate(input.date)||Number(input.date.slice(0,4))!==year||input.date>new Date().toISOString().slice(0,10))throw Error('Choose a valid date in the selected year, not in the future.');
 if(animal.dob&&input.date<animal.dob)throw Error('Tag date cannot precede birth.');
 return {field,mode:input.mode as 'correct'|'retire'|'assign',previous:old,value,date:input.date};
}
