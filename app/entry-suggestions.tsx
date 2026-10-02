"use client";
import {useEffect,useState} from 'react';
import {collectSuggestions,suggestionFields} from '@/lib/entry-suggestions';
export default function EntrySuggestions(){
 const [values,setValues]=useState<Record<string,string[]>>({});
 useEffect(()=>{let last=0,active=true;async function refresh(){if(Date.now()-last<10000)return;last=Date.now();try{const r=await fetch('/api/flock');if(!r.ok)return;const d:any=await r.json();if(active)setValues(collectSuggestions(d.animals||[]))}catch{}}
 const focus=(e:FocusEvent)=>{if((e.target as HTMLElement)?.getAttribute('list')?.startsWith('past-'))void refresh()};
 document.addEventListener('focusin',focus);return()=>{active=false;document.removeEventListener('focusin',focus)}},[]);
 return <>{suggestionFields.map(k=><datalist id={'past-'+k} key={k}>{(values[k]||[]).map(v=><option key={v} value={v}/>)}</datalist>)}</>;
}
