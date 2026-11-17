"use client";

import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogDescription,DialogHeader,DialogTitle} from '@/components/ui/dialog';
import {localStore} from '@/lib/offline-store';

type Preview={
 year:string;species:string;token:string;populated:boolean;removeFromPicker:boolean;blockers:string[];
 counts:{profiles:number;history:number;weights:number;breedingGroups:number;litters:number;otherRecords:number};
};
const names={profiles:'Animal profiles first recorded that year',history:'Status and ownership changes',weights:'Weights',breedingGroups:'Breeding groups',litters:'Litters',otherRecords:'Other flock records'};

export default function YearDelete({year,species,onDeleted}:{year:string;species:string;onDeleted:()=>void}){
 const [open,setOpen]=useState(false),[preview,setPreview]=useState<Preview|null>(null);
 const [reviewed,setReviewed]=useState(false),[typedYear,setTypedYear]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const endpoint='/api/flock/year-delete?'+new URLSearchParams({year,species});
 async function requestPreview(){
  setOpen(true);setPreview(null);setReviewed(false);setTypedYear('');setBusy(true);setError('');
  try{
   const response=await fetch(endpoint,{cache:'no-store'});
   const data=await response.json() as Preview & {error?:string};
   if(!response.ok)throw Error(data.error||'Unable to review this year.');
   setPreview(data);
  }catch(e){setError((e as Error).message)}finally{setBusy(false)}
 }
 async function remove(){
  if(!preview||busy||preview.blockers.length)return;
  setBusy(true);setError('');
  try{
   const pending=await localStore('queue','all');
   if(pending?.length)throw Error('Review pending saves before deleting a year.');
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:preview.token,reviewed:true,typedYear})});
   const data=await response.json() as {error?:string};
   if(!response.ok)throw Error(data.error||'Deletion was not confirmed.');
   onDeleted();
  }catch(e){setError((e as Error).message);setBusy(false)}
 }
 return <>
  <Button variant="outline" disabled={year==='all'||busy} onClick={requestPreview}>Delete year…</Button>
  <Dialog open={open} onOpenChange={next=>{if(!busy)setOpen(next)}}>
   <DialogContent>
    <DialogHeader>
     <DialogTitle>{reviewed?'Confirm record deletion':'Review year deletion'} · {year} {species}</DialogTitle>
     <DialogDescription>{reviewed?'Enter the year to confirm deletion.':'Review what this action will remove.'}</DialogDescription>
    </DialogHeader>
    {busy&&<p role="status">{preview?'Saving…':'Checking records…'}</p>}
    {error&&<p role="alert">{error}</p>}
    {preview&&<>
     {!reviewed&&preview.populated&&<ul>{Object.entries(preview.counts).map(([key,count])=><li key={key}>{names[key as keyof typeof names]}: {count}</li>)}</ul>}
     {!preview.populated&&preview.removeFromPicker&&<p>Remove this empty year from the year picker?</p>}
     {preview.blockers.map(reason=><p key={reason} role="alert">{reason}</p>)}
     {reviewed&&<label>Type {year} to continue<input value={typedYear} inputMode="numeric" maxLength={4} onChange={event=>setTypedYear(event.target.value)}/></label>}
     {!preview.blockers.length&&(preview.populated&&!reviewed
      ? <Button disabled={busy} onClick={()=>{setReviewed(true);setError('')}}>Continue to confirmation</Button>
      : <Button variant="destructive" disabled={busy||preview.populated&&typedYear!==year} onClick={remove}>{preview.populated?'Delete '+year+' records':'Remove empty year'}</Button>)}
    </>}
    <Button variant="outline" disabled={busy} onClick={()=>setOpen(false)}>Cancel</Button>
   </DialogContent>
  </Dialog>
 </>;
}
