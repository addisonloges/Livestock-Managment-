import {validDate,type Animal} from './livestock.ts';
export type TagSlot={id:string;ear:'Right'|'Left';number:string;color:string};
export function tagSlots(a:Animal):TagSlot[]{const m=JSON.parse(a.pedigreeInfo||'{}');return [{id:'rightTag',ear:'Right',number:a.rightTag||'',color:m.rightTagColor||''},{id:'leftTag',ear:'Left',number:a.leftTag||'',color:m.leftTagColor||''},...(m.additionalTags||[])];}
export function updateTagRecords(a:Animal,input:any,year:number){
 const meta=JSON.parse(a.pedigreeInfo||'{}'),slots=tagSlots(a).map(t=>({...t}));let eid=a.eid||'',position=meta.eidTagPosition||'';
 if(typeof input.date!=='string'||!validDate(input.date)||Number(input.date.slice(0,4))!==year||input.date>new Date().toISOString().slice(0,10)||(a.dob&&input.date<a.dob))throw Error('Choose a valid tag date in the selected year.');
 const string=(v:unknown,max:number)=>{if(typeof v!=='string'||v.length>max)throw Error('Tag details exceed the allowed length.');return v.trim()};
 const mode=input.mode,field=input.field;const current=slots.find(t=>t.id===field);
 let event:any={field,mode,date:input.date,previous:current?.number||'',previousColor:current?.color||'',previousEid:eid,previousPosition:position,retiredEid:''};
 if(mode==='add'){
  if(!['Right','Left'].includes(input.ear))throw Error('Choose the ear for this tag.');
  const number=string(input.value,200),color=string(input.color,60);if(!number||!color)throw Error('Enter a tag number and its color.');
  const id='extra:'+input.operationId;if(slots.some(t=>t.id===id))throw Error('Tag already exists.');
  const slot:TagSlot={id,ear:input.ear,number,color};slots.push(slot);event={...event,field:id,value:number,color,ear:slot.ear};
 }else if(mode==='swap'){
  const other=slots.find(t=>t.id===input.otherField);
  if(!current||!other||current.id===other.id||!current.number||!other.number)throw Error('Choose two different recorded tags to swap.');
  event={...event,otherField:other.id,otherPrevious:other.number,otherPreviousColor:other.color,ear:current.ear,otherEar:other.ear};
  [current.number,other.number]=[other.number,current.number];[current.color,other.color]=[other.color,current.color];
  if(position===current.id)position=other.id;else if(position===other.id)position=current.id;
  event.value=current.number;event.color=current.color;event.otherValue=other.number;
 }else if(field==='eid'){
  if(!['correct','assign','retire','link'].includes(mode))throw Error('Choose a valid EID action.');
  const value=string(input.value,200);
  if(mode==='assign'&&eid)throw Error('An EID is already recorded.');
  if(mode!=='assign'&&!eid)throw Error('No EID is recorded.');
  if(mode==='retire'&&position)throw Error('Retire the linked physical tag to retire its EID.');
  if(mode==='link'&&value!==eid)throw Error('Link the existing EID without changing its number.');
  if(mode!=='retire'&&!value)throw Error('Enter the EID.');
  const linked=input.eidPosition??position;if(linked&&!slots.some(t=>t.id===linked&&t.number))throw Error('Choose a recorded physical tag.');
  event.previous=eid;event.value=value;if(mode==='retire')event.retiredEid=eid;
  eid=value;position=eid?linked:'';
 }else{
  if(!current||!['correct','assign','retire','color'].includes(mode))throw Error('Choose a tag and action.');
  if(mode==='assign'&&current.number)throw Error('Retire the existing tag before assigning a new one.');
  if(mode!=='assign'&&!current.number)throw Error('No tag is recorded in this position.');
  const value=mode==='color'?current.number:string(input.value,200),color=value?string(input.color,60):'';
  if(mode!=='retire'&&!value)throw Error('Enter the tag number.');if(value&&!color)throw Error('Enter the color for this tag number.');
  if(mode==='retire'&&value===current.number)throw Error('Replacement must differ from the retired tag.');
  if(mode==='retire'&&position===current.id){event.retiredEid=eid;eid='';position='';}
  if(['retire','assign'].includes(mode)&&input.replacementEid){if(!value)throw Error('Enter a replacement tag number.');if(eid)throw Error('An EID is already recorded.');eid=string(input.replacementEid,200);position=current.id;}
  current.number=value;current.color=color;event={...event,value,color,ear:current.ear};
 }
 const right=slots[0],left=slots[1];
 return {rightTag:right.number,leftTag:left.number,eid:eid||null,pedigreeInfo:JSON.stringify({...meta,rightTagColor:right.color,leftTagColor:left.color,eidTagPosition:position,additionalTags:slots.slice(2)}),event:{...event,eid,position}};
}
