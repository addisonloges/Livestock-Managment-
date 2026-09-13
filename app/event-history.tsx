"use client";
import {useState} from 'react';
import {Button} from '@/components/ui/button';
import {Dialog,DialogContent,DialogHeader,DialogTitle,DialogDescription} from '@/components/ui/dialog';
import type {FarmEvent} from '@/lib/farm-events';
type Revision={operationId:string;createdAt:string;before:Partial<FarmEvent>;after:FarmEvent&{changeReason?:string}};
export default function EventHistory({id}:{id:string}){
 const [open,setOpen]=useState(false),[rows,setRows]=useState<Revision[]>([]),[error,setError]=useState(''),[loading,setLoading]=useState(false);
 async function show(){setOpen(true);setLoading(true);setError('');try{const r=await fetch('/api/flock/events/history?id='+encodeURIComponent(id));const data=await r.json() as {error?:string;history:Revision[]};if(!r.ok)throw Error(data.error);setRows(data.history)}catch(e){setError((e as Error).message)}finally{setLoading(false)}}
 return <><Button variant="outline" onClick={show}>History</Button><Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-2xl max-h-[85dvh] overflow-y-auto"><DialogHeader><DialogTitle>Event history</DialogTitle><DialogDescription>Original entries and subsequent corrections remain available.</DialogDescription></DialogHeader>{loading?<p>Loading history…</p>:error?<p role="alert">{error}</p>:rows.map(r=><article key={r.operationId} className="border rounded p-3"><h3>{new Date(r.createdAt).toLocaleString()} · Revision {r.after.version}</h3><p>{r.after.changeReason||'Created'}</p>{Object.keys(r.after).filter(k=>!['id','version','changeReason'].includes(k)&&JSON.stringify(r.before[k as keyof FarmEvent])!==JSON.stringify(r.after[k as keyof FarmEvent])).map(k=><div key={k} className="my-2"><strong>{k}</strong><div className="grid grid-cols-2 gap-2"><pre className="whitespace-pre-wrap break-all text-sm">{JSON.stringify(r.before[k as keyof FarmEvent]??'Not recorded',null,2)}</pre><pre className="whitespace-pre-wrap break-all text-sm">{JSON.stringify(r.after[k as keyof FarmEvent]??'Not recorded',null,2)}</pre></div></div>)}</article>)}</DialogContent></Dialog></>
}
