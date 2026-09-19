"use client";
import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import type {FarmEvent} from '@/lib/farm-events';
import {managementGroups,groupMembers} from '@/lib/management-groups';
const Context=createContext<{events:FarmEvent[];loading:boolean;error:string;reload:()=>void}>({events:[],loading:false,error:'',reload:()=>{}});
export function GroupProvider({children}:{children:ReactNode}){
 const [events,setEvents]=useState<FarmEvent[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
 async function reload(){setLoading(true);try{const r=await fetch('/api/flock/events'),d=await r.json() as {events:FarmEvent[];error?:string};if(!r.ok)throw Error(d.error||'Groups could not be loaded.');setEvents(d.events);setError('')}catch(e){setError((e as Error).message)}finally{setLoading(false)}}
 useEffect(()=>{reload();window.addEventListener('flock-synced',reload);return()=>window.removeEventListener('flock-synced',reload)},[]);
 return <Context.Provider value={{events,loading,error,reload}}>{children}</Context.Provider>
}
export const useGroups=()=>useContext(Context);
export function GroupFilter({value,onChange,date,onDateChange,species,eligibleIds}:{value:string;onChange:(id:string)=>void;date:string;onDateChange?:(date:string)=>void;species?:string;eligibleIds?:string[]}){
 const {events,loading,error,reload}=useGroups(),groups=managementGroups(events,species);
 return <><label>Management group<select aria-label="Management group" value={value} disabled={loading||!!error} onChange={e=>onChange(e.target.value)}><option value="">All animals / no group filter</option>{groups.map(g=>{const ids=groupMembers(events,g.id,date),eligible=[...ids].filter(id=>!eligibleIds||eligibleIds.includes(id));return <option key={g.id} value={g.id}>{g.name} ({eligible.length}{eligibleIds?' eligible':''})</option>})}{value&&!groups.some(g=>g.id===value)&&<option value={value}>Unavailable group</option>}</select></label>{onDateChange?<label>Group membership on<input aria-label="Group membership on" type="date" value={date} onChange={e=>onDateChange(e.target.value)}/></label>:<span className="hint">Membership on {date}</span>}{error&&<span role="alert">{error} <button type="button" onClick={reload}>Retry groups</button></span>}</>
}
