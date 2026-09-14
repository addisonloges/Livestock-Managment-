import type {Animal} from './livestock.ts';
import {statusAt} from './animal-status.ts';
import {retentionDecision} from './financial-reports.ts';
import type {FarmEvent} from './farm-events.ts';
export function yearRollCandidates(animals:Animal[],species:string,source:number){return animals.filter(a=>a.species===species&&!a.archivedAt&&!a.pedigreeOnly&&a.firstYear<=source&&statusAt({...a,pedigreeInfo:'{}'},`${source+1}-01-01`)==='Active');}
export function rollDecision(a:Animal,events:FarmEvent[],source:number){return retentionDecision(events,a.id,`${source}-12-31`);}
export function withYearSelection(a:Animal,target:number,included:boolean){const info=JSON.parse(a.pedigreeInfo||'{}');return JSON.stringify({...info,yearSelections:{...(info.yearSelections||{}),[target]:included}});}
