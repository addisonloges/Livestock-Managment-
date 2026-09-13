import {type Animal,validDate,relationshipMatrix,projectedCoi} from './livestock.ts';
export type BreedingGroup={id:string;version:number;species:string;year:number;name:string;ramId:string;eweIds:string[];plannedStart?:string;start:string;end:string;state:string;notes:string};
export function normalizeGroup(g:BreedingGroup):BreedingGroup{return g.plannedStart===undefined&&g.state==='Planned'?{...g,plannedStart:g.start||'',start:''}:{...g,plannedStart:g.plannedStart||''};}
export function groupDate(g:BreedingGroup){return g.start||g.plannedStart||'';}
export function validateGroup(g:BreedingGroup,animals:Animal[]){
 if(!g.name?.trim()||g.name.length>200)throw Error('Enter a group name up to 200 characters.');
 if(!['Planned','Exposed','Completed','Cancelled'].includes(g.state))throw Error('Choose a group state.');
 if(g.plannedStart&&(!validDate(g.plannedStart)||Number(g.plannedStart.slice(0,4))!==g.year))throw Error('Choose a valid planned start date in the plan year, or leave it blank.');
 if(['Exposed','Completed'].includes(g.state)&&!g.start)throw Error('Enter the actual exposure date. The planned date is kept separately.');
 if(g.state==='Planned'&&g.start)throw Error('Use the planned date for a plan; record actual exposure by changing the state to Exposed.');
 if(g.start&&(!validDate(g.start)||g.start>new Date().toISOString().slice(0,10)))throw Error('Enter a valid actual exposure date that is not in the future.');
 if(g.end&&(!validDate(g.end)||!groupDate(g)||g.end<groupDate(g)))throw Error('End date must be on or after the planned or actual start.');
 if(!Array.isArray(g.eweIds)||!g.eweIds.length||g.eweIds.length>200||new Set(g.eweIds).size!==g.eweIds.length)throw Error('Select 1–200 distinct females.');
 if(typeof g.notes!=='string'||g.notes.length>2000)throw Error('Notes must be 2000 characters or fewer.');
 const ram=animals.find(a=>a.id===g.ramId);if(!ram||ram.species!==g.species||ram.sex!=='Male'||ram.pedigreeOnly||ram.archivedAt)throw Error('Select a recorded flock male of the same species.');
 const matrix=relationshipMatrix(animals);for(const id of g.eweIds){const ewe=animals.find(a=>a.id===id);if(!ewe||ewe.species!==g.species||ewe.sex!=='Female'||ewe.pedigreeOnly||ewe.archivedAt)throw Error('Select recorded flock females of the same species.');for(const a of [ram,ewe])if(a.firstYear>g.year||(a.dob&&groupDate(g)&&a.dob>groupDate(g)))throw Error('Group start cannot precede an animal’s birth or first recorded year.');if(g.state==='Planned'&&projectedCoi(matrix,ram.id,ewe.id)>.2)throw Error('A planned mating exceeds the 20% COI limit. Review its pedigree or ram selection.');}
}
