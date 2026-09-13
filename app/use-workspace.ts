"use client";
import {useEffect,useRef,useState} from 'react';
const key='flock-workspace-preferences';
export default function useWorkspace(currentYear:number){
 const [species,updateSpecies]=useState('Sheep'),[year,updateYear]=useState(String(currentYear));
 const currentSpecies=useRef('Sheep'),years=useRef<Record<string,string>>({});
 function validYear(v:unknown):v is string{return typeof v==='string'&&(v==='all'||/^\d{4}$/.test(v)&&Number(v)>=1900&&Number(v)<=currentYear+10)}
 function persist(){try{localStorage.setItem(key,JSON.stringify({species:currentSpecies.current,years:years.current}))}catch{}}
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(key)||'null');if(!saved)return;for(const s of ['Sheep','Goats'])if(validYear(saved.years?.[s]))years.current[s]=saved.years[s];if(['Sheep','Goats'].includes(saved.species)){currentSpecies.current=saved.species;updateSpecies(saved.species);updateYear(years.current[saved.species]||String(currentYear))}}catch{}},[]);
 function setSpecies(value:string){if(!['Sheep','Goats'].includes(value))return;currentSpecies.current=value;updateSpecies(value);updateYear(years.current[value]||String(currentYear));persist()}
 function setYear(value:string){if(!validYear(value))return;years.current[currentSpecies.current]=value;updateYear(value);persist()}
 function reset(){years.current={};currentSpecies.current='Sheep';updateSpecies('Sheep');updateYear(String(currentYear));persist()}
 return {species,year,setSpecies,setYear,reset};
}
