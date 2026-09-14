"use client";
import {useEffect,useState} from 'react';
export default function PracticeBanner(){const [practice,setPractice]=useState(false);useEffect(()=>setPractice(['localhost','127.0.0.1'].includes(location.hostname)&&location.port==='5174'),[]);return practice?<aside className="practice-banner"><strong>PRACTICE COPY · Fictional records only</strong><span>Your live farm records are separate.</span><a href="/practice-guide.html" target="_blank" rel="noreferrer">Open step-by-step walkthrough ↗</a></aside>:null}
