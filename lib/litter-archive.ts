import type {Animal} from './livestock.ts';
import type {Litter} from './lambing.ts';
export function litterArchiveBlock(litter:Litter,children:Animal[],all:Animal[],history:any[],groups:any[],records:any[],weights:any[]){
 for(const entry of litter.lambs.filter(l=>l.outcome==='Alive')){
  const animal=children.find(a=>a.id===entry.id);if(!animal||JSON.parse(animal.pedigreeInfo||'{}').litterId!==litter.id)return 'A linked offspring profile is missing or belongs to another birth record.';
  if(animal.archivedAt)return 'Restore individually deleted offspring before voiding their litter.';
  if(weights.some(w=>w.animalId===animal.id&&w.session!=='Birth · '+litter.id))return 'An offspring has measurements beyond this birth. Review those records before voiding the litter.';
  if(history.some(h=>h.animalId===animal.id&&!['birth','display-id'].includes(h.action)&&JSON.parse(h.after||'{}').litterArchiveId!==litter.id))return 'An offspring has later profile, status, treatment or weight history. Review those records before voiding its birth.';
  if(all.some(a=>a.sire===animal.id||a.dam===animal.id)||groups.some(g=>g.ramId===animal.id||g.eweIds?.includes(animal.id))||records.some(r=>r.id!==litter.id&&(r.animalIds?.includes(animal.id)||r.damId===animal.id||r.sireId===animal.id)))return 'An offspring is referenced by later breeding, birth or animal events. Preserve those records and review the birth correction.';
 }
 return '';
}
