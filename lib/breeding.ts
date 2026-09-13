import {type Animal,validDate,relationshipMatrix,projectedCoi} from './livestock.ts';
export type BreedingGroup={id:string;version:number;species:string;year:number;name:string;ramId:string;eweIds:string[];start:string;end:string;state:string;notes:string};
export function validateGroup(g:BreedingGroup,animals:Animal[]){
 if(!g.name?.trim()||g.name.length>200)throw Error('Enter a group name up to 200 characters.');
 if(!['Planned','Exposed','Completed','Cancelled'].includes(g.state))throw Error('Choose a group state.');
 if(!validDate(g.start)||Number(g.start.slice(0,4))!==g.year||g.end&&(!validDate(g.end)||g.end<g.start))throw Error('Start must be in the selected year; end must be on or after start.');
 if(!Array.isArray(g.eweIds)||!g.eweIds.length||g.eweIds.length>200||new Set(g.eweIds).size!==g.eweIds.length)throw Error('Select 1–200 distinct females.');
 if(typeof g.notes!=='string'||g.notes.length>2000)throw Error('Notes must be 2000 characters or fewer.');
 const ram=animals.find(a=>a.id===g.ramId);if(!ram||ram.species!==g.species||ram.sex!=='Male'||ram.pedigreeOnly||ram.archivedAt)throw Error('Select a recorded flock male of the same species.');
 const matrix=relationshipMatrix(animals);for(const id of g.eweIds){const ewe=animals.find(a=>a.id===id);if(!ewe||ewe.species!==g.species||ewe.sex!=='Female'||ewe.pedigreeOnly||ewe.archivedAt)throw Error('Select recorded flock females of the same species.');for(const a of [ram,ewe])if(a.firstYear>g.year||(a.dob&&a.dob>g.start))throw Error('Group start cannot precede an animal’s birth or first recorded year.');if(g.state==='Planned'&&projectedCoi(matrix,ram.id,ewe.id)>.2)throw Error('A planned mating exceeds the 20% COI limit. Review its pedigree or ram selection.');}
}
