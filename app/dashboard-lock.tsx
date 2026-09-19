"use client";
import {useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
import {localStore,clearWorkingCache} from '@/lib/offline-store';
async function clearLocal(){await clearWorkingCache();if('caches' in window)for(const key of await caches.keys())if(key.startsWith('clarksons-'))await caches.delete(key)}
export default function DashboardLock(){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const channel=new BroadcastChannel('flock-lock');channel.onmessage=()=>{clearLocal().finally(()=>location.replace('/access'))};return()=>channel.close()},[]);
 async function lock(){setBusy(true);setError('');try{if((await localStore('queue','all')).length)throw Error('Sync or review Pending saves before locking so your unsynced work is preserved.');if(!window.confirm('Lock this dashboard and clear its downloaded working copy? Unsaved form changes will be lost.'))return;const r=await fetch('/access/lock',{method:'POST'});if(!r.ok)throw Error('Connect to the server to lock this dashboard.');const channel=new BroadcastChannel('flock-lock');channel.postMessage('lock');channel.close();await clearLocal();location.replace('/access')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}
 return <><Button variant="outline" size="sm" disabled={busy} onClick={lock}>{busy?'Locking…':'Lock dashboard'}</Button>{error&&<span role="alert">{error}</span>}</>
}
