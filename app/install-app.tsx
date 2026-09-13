"use client";
import {useEffect,useState} from 'react';
import {Button} from '@/components/ui/button';
type InstallPrompt=Event&{prompt:()=>Promise<void>;userChoice:Promise<{outcome:string}>};
export default function InstallApp(){
 const [prompt,setPrompt]=useState<InstallPrompt|null>(null),[error,setError]=useState('');
 useEffect(()=>{const ready=(e:Event)=>{e.preventDefault();setPrompt(e as InstallPrompt)},installed=()=>setPrompt(null);window.addEventListener('beforeinstallprompt',ready);window.addEventListener('appinstalled',installed);return()=>{window.removeEventListener('beforeinstallprompt',ready);window.removeEventListener('appinstalled',installed)}},[]);
 if(!prompt)return null;
 return <><Button variant="outline" size="sm" onClick={async()=>{try{await prompt.prompt();await prompt.userChoice;setPrompt(null)}catch{setError('Use your browser’s install or add-to-home-screen menu.')}}}>Install on this device</Button>{error&&<span role="status">{error}</span>}</>;
}
