"use client";

import { useEffect, useMemo, useState } from 'react';
import { type Animal, type Weight, label } from '@/lib/livestock';
import { type FarmEvent } from '@/lib/farm-events';
import { type Litter } from '@/lib/lambing';
import { type BreedingGroup } from '@/lib/breeding';
import { maternalRecords, maternalCycles, maternalGroupSummary, repeatedMaternalEstimate } from '@/lib/maternal-selection';
import { chicagoToday } from '@/lib/reader';
import { Button } from '@/components/ui/button';

type Sources = {events:FarmEvent[];litters:Litter[];groups:BreedingGroup[]};
type Props = {animals:Animal[];weights:Weight[];species:string;year:string;animal?:Animal;sources?:Sources;onSaved?:()=>Promise<void>};
type Cycle = ReturnType<typeof maternalCycles>[number];
const fmt = (v:number|null, suffix='') => v === null ? 'Unavailable' : v.toFixed(1)+suffix;
const summaryText = (s:{value:number|null;count:number},suffix='') => fmt(s.value,suffix)+(s.count ? ' ('+s.count+' litters)' : '');
const season = (date:string) => ['Winter','Spring','Summer','Fall'][Math.floor((Number(date.slice(5,7))%12)/3)];
const previousYear = (date:string) => {
  const year=Number(date.slice(0,4))-1,month=Number(date.slice(5,7)),day=Number(date.slice(8,10));
  return year+date.slice(4,8)+String(Math.min(day,new Date(Date.UTC(year,month,0)).getUTCDate())).padStart(2,'0');
};
const groupName = (r:Cycle) => r.group?.name || 'No linked breeding group';
const breed = (a:Animal) => a.breed?.trim() || 'Unknown';
const ageAtLambing = (r:Cycle) => !r.ewe.dob ? 'Age unknown' :
  (Date.parse(r.litter.date)-Date.parse(r.ewe.dob))/86400000 < 365.25 ? 'Under 12 months' : '12 months and older';

export default function MaternalSelection({animals,weights,species,year,animal,sources,onSaved}:Props) {
  const [loaded,setLoaded]=useState<Sources|null>(null),[error,setError]=useState('');
  const [through,setThrough]=useState(chicagoToday()),[mode,setMode]=useState('Breed'),[breedFilter,setBreedFilter]=useState(''),[groupFilter,setGroupFilter]=useState(''),[system,setSystem]=useState(''),[seasonFilter,setSeason]=useState(''),[parity,setParity]=useState(''),[management,setManagement]=useState('');
  const [litterId,setLitter]=useState(''),[weightId,setWeight]=useState(''),[busy,setBusy]=useState(false),[selected,setSelected]=useState('');
  const [age,setAge]=useState('');
  const [heritability,setHeritability]=useState(''),[repeatability,setRepeatability]=useState(''),[parameterSource,setParameterSource]=useState('');
  async function load() {
    try {
      const responses=await Promise.all(['events','lambing','breeding'].map(name=>fetch('/api/flock/'+name)));
      if(responses.some(r=>!r.ok))throw Error('Maternal records could not be loaded.');
      const [e,l,g]=await Promise.all(responses.map(r=>r.json())) as [{events:FarmEvent[]},{litters:Litter[]},{groups:BreedingGroup[]}];
      setLoaded({events:e.events,litters:l.litters,groups:g.groups});setError('');
    }catch(e){setError((e as Error).message)}
  }
  useEffect(()=>{if(!sources)void load()},[species,sources?.events === undefined]);
  const data=sources ?? loaded;
  const cycles=useMemo(()=>data&&through?maternalCycles(maternalRecords(animals,weights,data.events,data.litters,through,species),weights,data.groups):[],[animals,weights,data,through,species]);
  const memberships=(r:Cycle)=>data?.events.filter(e=>!e.voided&&e.species===species&&e.kind==='management'&&e.management&&e.animalIds.includes(r.ewe.id)&&e.date<=r.litter.date&&(!e.management.endDate||e.management.endDate>=r.litter.date)) ?? [];
  const filtered=cycles.filter(r=>(year==='all'||r.litter.date.startsWith(year))&&(!breedFilter||breed(r.ewe)===breedFilter)&&(!groupFilter||r.litter.groupId===groupFilter)&&(!system||(r.group?.productionSystem||'Unspecified')===system)&&(!seasonFilter||season(r.litter.date)===seasonFilter)&&(!parity||String(r.lambingNumber)===parity)&&(!age||ageAtLambing(r)===age)&&(!management||memberships(r).some(e=>e.management?.groupId===management)));
  const categories=new Map<string,{name:string;rows:Cycle[]}>();
  for(const r of filtered){
    const name=mode==='Breed'?breed(r.ewe):mode==='Breeding group'?groupName(r):mode==='System'?r.group?.productionSystem||'Unspecified':mode==='Season'?season(r.litter.date):mode==='Lambing number'?String(r.lambingNumber):[...new Set(memberships(r).map(e=>e.title))].sort().join(' / ')||'No recorded membership';
    const key=mode==='Breeding group'?r.litter.groupId:mode==='Management group'?memberships(r).map(e=>e.management!.groupId).sort().join('|'):name;
    const category=categories.get(key)||{name,rows:[]};category.rows.push(r);categories.set(key,category);
  }
  const ewe=animal?.sex==='Female'?animal:animals.find(a=>a.id===selected);
  const dam=animal?.sex==='Male'?animals.find(a=>a.id===animal.dam):undefined;
  const granddam=dam?animals.find(a=>a.id===dam.dam):undefined;
  const linked=cycles.find(r=>r.litter.id===litterId);
  const eligibleWeights=linked?weights.filter(w=>w.animalId===linked.ewe.id&&!w.voided&&w.date<linked.litter.date&&w.pounds>0).sort((a,b)=>b.date.localeCompare(a.date)):[];
  const genetic=animal||ewe;
  const comparableNLW=(r:Cycle)=>r.outcomeComplete&&r.reared.every(x=>x.rearingType==='Dam-raised'||x.rearingType==='Birth dam assumed')&&r.observations.every(x=>x.rearingDam===r.ewe.id)&&breed(r.ewe)!=='Unknown';
  const deviations=ewe?filtered.filter(r=>r.ewe.id===ewe.id&&comparableNLW(r)&&r.group?.start).flatMap(r=>{
    const peers=filtered.filter(p=>p.ewe.id!==ewe.id&&comparableNLW(p)&&p.group?.id===r.group?.id&&breed(p.ewe)===breed(ewe)&&p.lambingNumber===r.lambingNumber&&season(p.litter.date)===season(r.litter.date)&&management&&memberships(p).some(e=>e.management?.groupId===management));
    if(!management||new Set(peers.map(p=>p.ewe.id)).size<2)return [];
    return [r.weaned.length-peers.reduce((n,p)=>n+p.weaned.length,0)/peers.length];
  }):[];
  const estimate=parameterSource.trim()?repeatedMaternalEstimate(deviations,Number(heritability),Number(repeatability)):null;
  async function saveWeight(){
    if(!linked)return;
    setBusy(true);setError('');
    try{
      const r=await fetch('/api/flock/lambing',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({year:linked.litter.date.slice(0,4),data:{...linked.litter,preLambingWeightId:weightId},action:'save',operationId:crypto.randomUUID(),reason:'Linked pre-lambing ewe weight'})});
      if(!r.ok)throw Error((await r.json() as {error?:string}).error||'Weight link could not be saved.');
      if(onSaved)await onSaved();else await load();
      setLitter('');
    }catch(e){setError((e as Error).message)}finally{setBusy(false)}
  }
  function card(subject:Animal,title:string){
    const rows=filtered.filter(r=>r.ewe.id===subject.id),s=maternalGroupSummary(rows);
    const rolling=cycles.flatMap(r=>r.observations).filter(l=>l.uniqueBirth&&l.rearingDam===subject.id&&!!l.weaningDate&&l.weaningDate>previousYear(through));
    const latest=rows.slice().sort((a,b)=>b.litter.date.localeCompare(a.litter.date))[0];
    const benchmark=(field:'preEfficiency'|'breedingEfficiency')=>{
      if(!management||!latest?.group?.start||latest[field]===null)return null;
      const peers=filtered.filter(r=>r.group?.id===latest.group?.id&&breed(r.ewe)===breed(subject)&&r.lambingNumber===latest.lambingNumber&&season(r.litter.date)===season(latest.litter.date)&&r[field]!==null);
      const individuals=[...new Set(peers.map(r=>r.ewe.id))];
      if(individuals.length<3||individuals.length!==peers.length)return null;
      return {rank:1+peers.filter(r=>r[field]!>latest[field]!).length,n:peers.length,mean:peers.reduce((n,r)=>n+r[field]!,0)/peers.length};
    };
    const preRank=benchmark('preEfficiency'),breedingRank=benchmark('breedingEfficiency');
    return <section key={subject.id}>
      <h4>{title} · {label(subject)}</h4>
      <p>{s.born} born · {s.reared} reared · {s.weaned} weaned · {s.weighed} weighed · {s.pounds.toFixed(1)} measured lb</p>
      <p>Mean complete litter {summaryText(s.litterPounds,' lb')} · Pre-lambing efficiency {summaryText(s.pre,'%')} · Breeding-weight efficiency {summaryText(s.breeding,'%')}</p>
      <p>12 months through {through}: {rolling.length} weaned · {rolling.filter(l=>l.pounds!==null).length} weighed · {rolling.reduce((n,l)=>n+(l.pounds??0),0).toFixed(1)} measured lb.</p>
      {latest&&<p>{groupName(latest)} · {breed(subject)} · {season(latest.litter.date)} · Recorded lambing {latest.lambingNumber}. {preRank&&<>Pre-lambing rank {preRank.rank} of {preRank.n}, mean {fmt(preRank.mean,'%')}. </>}{breedingRank&&<>Breeding-weight rank {breedingRank.rank} of {breedingRank.n}, mean {fmt(breedingRank.mean,'%')}. </>}{!preRank&&!breedingRank&&'Rank requires a selected common management group and three comparable ewes with one eligible litter each.'}</p>}
      <div className="worksheet-scroll"><table><thead><tr>{['Lambing','Born','Reared','Weaned / weighed','Recorded rearing type / load','Pounds weaned','Pre-lambing weight','Pre-lambing %','Breeding %'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>
        {rows.map(r=><tr key={r.litter.id}><td>{r.litter.date}</td><td>{r.litter.lambs.length}</td><td>{r.reared.length}</td><td>{r.weaned.length} / {r.weighed.length}</td><td>{[...new Set([...r.observations,...r.reared].map(x=>x.rearingType+(x.count===null?' · load unknown':' · '+x.count+' reared together')))].join('; ')||'No live births'}</td><td>{r.pounds.toFixed(1)}{!r.complete&&' · incomplete'}</td><td>{r.preWeight?fmt(r.preWeight.pounds,' lb')+' · '+r.preWeight.date:'Unlinked'} {year!=='all'&&<Button size="sm" variant="outline" onClick={()=>{setLitter(r.litter.id);setWeight(r.litter.preLambingWeightId||'')}}>Link weight</Button>}</td><td>{fmt(r.preEfficiency,'%')}</td><td>{fmt(r.breedingEfficiency,'%')}</td></tr>)}
      </tbody></table></div>
    </section>;
  }
  if(!data)return <p role={error?'alert':'status'}>{error||'Loading maternal records…'} {error&&<Button onClick={load}>Retry</Button>}</p>;
  const groupChoices=data.groups.filter(g=>g.species===species),managementChoices=[...new Map(data.events.filter(e=>!e.voided&&e.species===species&&e.kind==='management'&&e.management).map(e=>[e.management!.groupId,e.title])).entries()];
  const exposures=groupChoices.filter(g=>!g.archivedAt&&g.state!=='Cancelled'&&g.start&&g.start<=through&&(year==='all'||String(g.year)===year)&&(!groupFilter||g.id===groupFilter)&&(!system||(g.productionSystem||'Unspecified')===system)).flatMap(g=>g.eweIds.flatMap(id=>{
    const a=animals.find(x=>x.id===id&&x.species===species&&x.sex==='Female'&&!x.pedigreeOnly);
    const start=g.exposures?.filter(x=>x.eweId===id).map(x=>x.start).sort()[0]||g.start;
    if(!a||start>through||breedFilter&&breed(a)!==breedFilter)return [];
    const rows=cycles.filter(r=>r.ewe.id===id&&r.litter.groupId===g.id);
    const link=g.productionLinks?.[id];
    const zero=!rows.length&&link?.outcome==='Confirmed no lambing'&&!!link.confirmedDate&&link.confirmedDate<=through;
    return [{a,g,lambed:rows.length>0,zero,complete:zero||rows.length>0&&rows.every(r=>r.outcomeComplete),weaned:rows.reduce((n,r)=>n+r.weaned.length,0)}];
  }));
  const exposureGroups=new Map<string,{name:string;rows:typeof exposures}>();
  for(const row of exposures){
    const key=mode==='Breed'?breed(row.a):mode==='System'?row.g.productionSystem||'Unspecified':row.g.id;
    const name=mode==='Breed'||mode==='System'?key:row.g.name+' · '+row.g.year;
    const entry=exposureGroups.get(key)||{name,rows:[]};entry.rows.push(row);exposureGroups.set(key,entry);
  }
  const evaluations=data.events.filter(e=>!e.voided&&e.species===species&&e.kind==='evaluation'&&e.date<=through&&genetic&&e.animalIds.includes(genetic.id)&&e.lab?.results[genetic.id]);
  return <section className="panel">
    <h3>Maternal performance and breeding values</h3>
    <div className="form-grid">
      <label>Observed through<input type="date" value={through} max={chicagoToday()} onChange={e=>{if(e.target.value&&e.target.value<=chicagoToday())setThrough(e.target.value)}}/></label>
      <label>Breed or recorded cross<select value={breedFilter} onChange={e=>setBreedFilter(e.target.value)}><option value="">All</option>{[...new Set(cycles.map(r=>breed(r.ewe)))].sort().map(n=><option key={n}>{n}</option>)}</select></label>
      <label>Breeding group<select value={groupFilter} onChange={e=>setGroupFilter(e.target.value)}><option value="">All</option>{groupChoices.map(g=><option key={g.id} value={g.id}>{g.name} · {g.year}</option>)}</select></label>
      <label>Lambing system<select value={system} onChange={e=>setSystem(e.target.value)}><option value="">All</option>{['Accelerated','Non-accelerated','Unspecified'].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Lambing season<select value={seasonFilter} onChange={e=>setSeason(e.target.value)}><option value="">All</option>{['Winter','Spring','Summer','Fall'].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Recorded lambing number<select value={parity} onChange={e=>setParity(e.target.value)}><option value="">All</option>{[...new Set(cycles.map(r=>r.lambingNumber))].sort((a,b)=>a-b).map(n=><option key={n}>{n}</option>)}</select></label>
      <label>Ewe age at lambing<select value={age} onChange={e=>setAge(e.target.value)}><option value="">All</option>{['Under 12 months','12 months and older','Age unknown'].map(x=><option key={x}>{x}</option>)}</select></label>
      <label>Management at lambing<select value={management} onChange={e=>setManagement(e.target.value)}><option value="">All</option>{managementChoices.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label>
    </div>
    {error&&<p role="alert">{error}</p>}
    {!animal&&<>
      <label>Summarize by <select value={mode} onChange={e=>setMode(e.target.value)}>{['Breed','Breeding group','System','Season','Lambing number','Management group'].map(x=><option key={x}>{x}</option>)}</select></label>
      <div className="worksheet-scroll"><table><thead><tr>{['Group','Ewes','Litters','Born','Reared','Weaned / weighed','Measured lb','Mean complete litter','Mean pre-lambing %','Mean breeding %'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>
        {[...categories].map(([key,c])=>{const s=maternalGroupSummary(c.rows);return <tr key={key}><th>{c.name}</th><td>{s.ewes}</td><td>{c.rows.length}</td><td>{s.born}</td><td>{s.reared}</td><td>{s.weaned} / {s.weighed}</td><td>{s.pounds.toFixed(1)}</td><td>{summaryText(s.litterPounds,' lb')}</td><td>{summaryText(s.pre,'%')}</td><td>{summaryText(s.breeding,'%')}</td></tr>})}
      </tbody></table></div>
      <h4>Exposure outcomes</h4>
      <p>Uses the exposure year, breed, breeding group and system. Counts are ewe exposures, so an accelerated ewe can contribute more than once. The rate uses confirmed failures and fully observed lambings. Unresolved exposures are included in the coverage count.</p>
      <div className="worksheet-scroll"><table><thead><tr>{['Group','Ewe exposures','Lambed','Confirmed no lambing','Lambing outcome unknown','Complete outcomes','Weaned per complete exposure'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>
        {[...exposureGroups].map(([key,{name,rows}])=>{
          const complete=rows.filter(r=>r.complete);
          return <tr key={key}><th>{name}</th><td>{rows.length}</td><td>{rows.filter(r=>r.lambed).length}</td><td>{rows.filter(r=>r.zero).length}</td><td>{rows.filter(r=>!r.zero&&!r.lambed).length}</td><td>{complete.length} / {rows.length}</td><td>{fmt(complete.length?complete.reduce((n,r)=>n+r.weaned,0)/complete.length:null)}</td></tr>;
        })}
      </tbody></table></div>
      <label>Open ewe results <select value={selected} onChange={e=>setSelected(e.target.value)}><option value="">Choose ewe</option>{[...new Map(cycles.map(r=>[r.ewe.id,r.ewe])).values()].map(a=><option key={a.id} value={a.id}>{label(a)}</option>)}</select></label>
    </>}
    {ewe&&card(ewe,'Ewe')}
    {dam&&card(dam,'Dam')}
    {granddam&&card(granddam,'Maternal granddam')}
    {animal?.sex==='Male'&&!dam&&<p>No dam is linked to this ram.</p>}
    {linked&&<fieldset><legend>Pre-lambing measurement for {label(linked.ewe)} · {linked.litter.date}</legend>
      <select aria-label="Pre-lambing weight" value={weightId} onChange={e=>setWeight(e.target.value)}><option value="">No linked measurement</option>{eligibleWeights.map(w=><option key={w.id} value={w.id}>{w.date} · {w.originalValue} {w.unit} · {w.session}</option>)}</select>
      <Button disabled={busy} onClick={saveWeight}>Save link</Button> <Button variant="outline" disabled={busy} onClick={()=>setLitter('')}>Cancel</Button>
    </fieldset>}
    {genetic&&<><h4>Recorded genetic evaluations</h4>{evaluations.length?evaluations.map(e=>{const r=e.lab!.results[genetic.id];return <p key={e.id}>{e.title} · {r.value} {r.unit} · {e.lab!.laboratory} · {e.date}{r.reference&&' · '+r.reference}</p>}):<p>No genetic evaluations are recorded for {label(genetic)}.</p>}</>}
    {ewe&&<details><summary>Experimental within-flock lambs weaned estimate</summary>
      <p>Uses complete dam-raised lambing records compared with at least two other ewes of the same recorded breed, lambing number, season and exposure group within the selected management group. This is a simple repeated-record estimate in lambs per lambing. Evaluation accuracy requires a fitted genetic model.</p>
      <div className="form-grid"><label>Heritability<input type="number" min="0" max="1" step="any" value={heritability} onChange={e=>setHeritability(e.target.value)}/></label><label>Repeatability<input type="number" min="0" max="1" step="any" value={repeatability} onChange={e=>setRepeatability(e.target.value)}/></label><label>Parameter source<input value={parameterSource} onChange={e=>setParameterSource(e.target.value)}/></label></div>
      <p>{estimate===null?'Estimate unavailable. Choose comparable records and enter sourced parameters with 0 < heritability ≤ repeatability ≤ 1.':estimate.toFixed(3)+' lambs per lambing · '+deviations.length+' eligible records · '+parameterSource}</p>
    </details>}
    <p className="hint">Rearing credit follows the recorded dam at weaning or cutoff. Fostered-in lambs appear in a litter’s efficiency only when the shared exposure identifies one receiving litter. Efficiency averages give each complete litter equal weight. Recorded lambing number reflects the lambings on file.</p>
  </section>;
}
