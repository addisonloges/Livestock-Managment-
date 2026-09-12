import {validDate,type Animal} from './livestock.ts';
export const tagLabels={rightTag:'Right tag',leftTag:'Left tag',eid:'EID'};
export function tagChange(animal:Animal,input:any,year:number){
 const field=input.field as keyof typeof tagLabels;
 if(!(field in tagLabels)||!Object.hasOwn(tagLabels,field))throw Error('Choose a tag position.');
 if(!['correct','retire','assign','link'].includes(input.mode))throw Error('Choose correction, retirement, or assignment.');
 const old=animal[field]||'';
 if(typeof input.value!=='string'||input.value.length>200)throw Error('Tag must be text, up to 200 characters.');
 const value=input.value.trim();
 if(input.mode==='assign'&&old)throw Error('Retire the current tag before assigning another.');
 if(input.mode!=='assign'&&!old)throw Error('There is no current tag in this position.');
 if(input.mode==='assign'&&!value)throw Error('Enter the new tag.');
 if(input.mode==='correct'&&!value)throw Error('Enter the corrected tag. To remove a lost tag, retire it.');
 if(input.mode==='link'&&(field!=='eid'||!old||value!==old))throw Error('Link the existing EID without changing its number.');
 if(input.mode!=='link'&&value===old)throw Error('The new value must differ from the current tag.');
 if(!validDate(input.date)||Number(input.date.slice(0,4))!==year||input.date>new Date().toISOString().slice(0,10))throw Error('Choose a valid date in the selected year, not in the future.');
 if(animal.dob&&input.date<animal.dob)throw Error('Tag date cannot precede birth.');
 const info=JSON.parse(animal.pedigreeInfo||'{}');
 const oldPosition=info.eidTagPosition||'';
 let eid=animal.eid||'',position=oldPosition;
 if(field==='eid'){
  if(input.mode==='retire'&&oldPosition)throw Error('Retire the linked physical ear tag to retire its EID with it.');
  eid=value;
  position=input.eidPosition??oldPosition;
  if(!['','rightTag','leftTag'].includes(position))throw Error('Choose an EID ear position.');
  if(position&&!animal[position as 'rightTag'|'leftTag'])throw Error('Record the physical ear tag before linking its EID.');
  if(!eid)position='';
 }else if(input.mode!=='correct'){
  const replacement=input.replacementEid??'';
  if(typeof replacement!=='string'||replacement.length>200)throw Error('EID must be text, up to 200 characters.');
  if(input.mode==='retire'&&oldPosition===field){eid='';position='';}
  if(replacement.trim()){
   if(!value)throw Error('Enter the replacement tag number with its EID.');
   if(eid)throw Error('An EID is already recorded. Link it or retire its tag before assigning another.');
   eid=replacement.trim();position=field;
  }
 }
 return {field,mode:input.mode as 'correct'|'retire'|'assign'|'link',previous:old,value,date:input.date,eid,position,previousEid:animal.eid||'',previousPosition:oldPosition,retiredEid:input.mode==='retire'&&(field==='eid'||oldPosition===field)?animal.eid||'':''};
}
