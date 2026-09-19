"use client";
import {useState} from 'react';
import {type Animal,label,displayId} from '@/lib/livestock';
import {statusAt} from '@/lib/animal-status';
import {managementGroups,groupMembers} from '@/lib/management-groups';
import {useGroups} from './group-context';
import GroupTransfer from './group-transfer';
import EventWorkspace from './event-workspace';
export default function GroupWorkspace({animals,species,year}:{animals:Animal[];species:string;year:string}){
 const {events,error,loading}=useGroups(),[date,setDate]=useState(year==='all'||year===String(new Date().getFullYear())?new Date().toISOString().slice(0,10):year+'-12-31');
 const groups=managementGroups(events,species);
 return <><section className="panel"><h2>Animals running together</h2><p>Create named groups for paddocks, feeding, replacements or other management needs. Animals may belong to more than one group. Breeding groups keep their own exposure records.</p><GroupTransfer animals={animals} species={species} date={date}/><label>View membership on<input aria-label="View group membership on" type="date" className="border rounded p-2 ml-2" value={date} onChange={e=>setDate(e.target.value)}/></label>{loading?<p>Loading groups…</p>:error?<p role="alert">{error}</p>:<div className="animal-sheet-scroll"><table className="w-full text-left"><thead><tr><th>Group</th><th>Recorded members</th><th>Active on date</th><th>Actions</th><th>Membership history</th></tr></thead><tbody>{groups.map(g=>{const ids=groupMembers(events,g.id,date),members=animals.filter(a=>ids.has(a.id));return <tr key={g.id}><td>{g.name}</td><td>{members.length}</td><td>{members.filter(a=>!a.pedigreeOnly&&!a.archivedAt&&statusAt(a,date)==='Active').length}</td><td><GroupTransfer animals={animals} species={species} date={date} sourceGroup={g.id}/></td><td><details><summary>View animals & periods</summary><p>{members.map(a=>label(a)+' · '+displayId(a)).join('; ')||'No members on this date'}</p>{g.periods.map(p=><p key={p.id}>{p.date} to {p.management?.endDate||'ongoing'} · {p.animalIds.length} animals</p>)}</details></td></tr>})}</tbody></table>{!groups.length&&<p>No groups yet. Add your first group below.</p>}</div>}<p className="hint">Choose start and optional end dates when adding animals. Use Transfer animals to move selected members to another group while keeping earlier history. Use Edit only to correct an assignment.</p></section><EventWorkspace animals={animals} species={species} year={year} scope="management"/></>
}
