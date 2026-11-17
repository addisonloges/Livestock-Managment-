import type { Animal, Weight } from './livestock.ts';
import type { Litter } from './lambing.ts';
import type { FarmEvent } from './farm-events.ts';
import type { BreedingGroup } from './breeding.ts';

export function maternalRecords(animals: Animal[], weights: Weight[], events: FarmEvent[], litters: Litter[], through: string, species: string) {
  const births = litters.filter(l => !l.voided && l.species === species && l.date <= through);
  const eligibleEvents = events.filter(e => !e.voided && e.species === species && e.date <= through);
  const birthCounts = new Map<string, number>();
  for (const litter of births) for (const lamb of litter.lambs) birthCounts.set(lamb.id, (birthCounts.get(lamb.id) ?? 0) + 1);
  return births.flatMap(litter => {
    const ewe = animals.find(a => a.id === litter.damId && a.species === species && a.sex === 'Female' && !a.pedigreeOnly);
    if (!ewe) return [];
    const siblings = births.filter(l => l.damId === ewe.id).sort((a,b) => a.date.localeCompare(b.date));
    const lambingNumber = siblings.findIndex(l => l.id === litter.id) + 1;
    const observations = litter.lambs.filter(l => l.outcome === 'Alive').map(lamb => {
      const weaning = eligibleEvents.filter(e => e.kind === 'weaning' && e.date >= litter.date && e.animalIds.includes(lamb.id))
        .sort((a,b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))[0];
      const rearing = eligibleEvents.filter(e => e.kind === 'rearing' && e.date >= litter.date && e.date <= (weaning?.date ?? through) && e.animalIds.includes(lamb.id))
        .sort((a,b) => b.date.localeCompare(a.date));
      const latest = rearing.filter(e => e.date === rearing[0]?.date);
      const signatures = new Set(latest.map(e => JSON.stringify([e.category,e.rearing?.fosterDamId || '',e.rearing?.numberReared ?? null])));
      const record = signatures.size === 1 ? latest[0] : undefined;
      const rearingDam = !latest.length || record?.category === 'Dam-raised' ? ewe.id : record?.category === 'Fostered' ? record.rearing?.fosterDamId || '' : '';
      const measured = weaning ? weights.filter(w => !w.voided && w.animalId === lamb.id && w.date >= litter.date && w.date <= through && (weaning.weightIds?.includes(w.id) || w.date === weaning.date) && w.pounds > 0) : [];
      const uniqueBirth = birthCounts.get(lamb.id) === 1;
      const lost = !weaning && animals.find(a => a.id === lamb.id)?.statusEvents?.some(e => e.status === 'Dead' && !!e.date && e.date >= litter.date && e.date <= through);
      return { id:lamb.id, uniqueBirth, weaningDate:weaning?.date, rearingDam, count:record?.rearing?.numberReared ?? null,
        rearingType:record?.category ?? (latest.length ? 'Conflicting records' : 'Birth dam assumed'), lost:!!lost,
        pounds:measured.length === 1 ? measured[0].pounds : null };
    });
    const preWeight = weights.find(w => !w.voided && w.id === litter.preLambingWeightId && w.animalId === ewe.id && w.date < litter.date && w.pounds > 0);
    return [{ litter, ewe, lambingNumber, observations, preWeight }];
  });
}

export function maternalCycles(records: ReturnType<typeof maternalRecords>, weights: Weight[], groups: BreedingGroup[]) {
  const all = records.flatMap(row => row.observations.map(lamb => ({ ...lamb, birth:row.litter })));
  return records.map(row => {
    const {litter,ewe,observations,preWeight} = row;
    const external = all.filter(lamb => lamb.rearingDam === ewe.id && lamb.birth.damId !== ewe.id && lamb.uniqueBirth);
    // Fostered-in output belongs to the ewe. It belongs to a specific litter only when the exposure provides an unambiguous common cycle.
    const assigned = external.filter(lamb => !!litter.groupId && lamb.birth.groupId === litter.groupId &&
      records.filter(r => r.ewe.id === ewe.id && r.litter.groupId === litter.groupId).length === 1);
    const reared = [...observations.filter(lamb => lamb.rearingDam === ewe.id && lamb.uniqueBirth), ...assigned];
    const weaned = reared.filter(lamb => !!lamb.weaningDate);
    const weighed = weaned.filter(lamb => lamb.pounds !== null);
    const pounds = weighed.reduce((total,lamb) => total + lamb.pounds!,0);
    const unresolved = observations.some(lamb => !lamb.uniqueBirth || ['Conflicting records','Other'].includes(lamb.rearingType) ||
      lamb.rearingType === 'Fostered' && !lamb.rearingDam ||
      lamb.rearingDam === ewe.id && !lamb.weaningDate && !lamb.lost);
    const unassigned = external.some(lamb => !records.some(r => r.ewe.id === ewe.id && !!r.litter.groupId &&
      r.litter.groupId === lamb.birth.groupId && records.filter(x => x.ewe.id === ewe.id && x.litter.groupId === r.litter.groupId).length === 1));
    const outcomeComplete = !unresolved && !unassigned && reared.every(lamb => !!lamb.weaningDate || lamb.lost);
    const complete = outcomeComplete && weighed.length === weaned.length;
    const group = groups.find(g => g.id === litter.groupId);
    const start = group?.exposures?.filter(x => x.eweId === ewe.id).map(x => x.start).sort()[0] || group?.start;
    const breedingWeight = weights.find(w => !w.voided && w.id === group?.productionLinks?.[ewe.id]?.weightId && w.animalId === ewe.id && !!start && w.date <= start && w.pounds > 0);
    const efficiency = (weight?:Weight) => complete && weight ? pounds / weight.pounds * 100 : null;
    return {...row,group,reared,weaned,weighed,pounds,outcomeComplete,complete,breedingWeight,preEfficiency:efficiency(preWeight),breedingEfficiency:efficiency(breedingWeight)};
  });
}

export function meanKnown(values:(number|null)[]) {
  const known = values.filter((v):v is number => v !== null);
  return { count:known.length,value:known.length ? known.reduce((a,b)=>a+b,0)/known.length : null };
}

export function repeatedMaternalEstimate(records:number[],heritability:number,repeatability:number) {
  if (!records.length || !records.every(Number.isFinite) || !(heritability > 0 && heritability <= repeatability && repeatability <= 1)) return null;
  const difference = records.reduce((a,b)=>a+b,0)/records.length;
  return records.length * heritability / (1 + (records.length - 1) * repeatability) * difference;
}

export function maternalGroupSummary(rows:ReturnType<typeof maternalCycles>) {
  return {
    ewes:new Set(rows.map(r=>r.ewe.id)).size,
    born:rows.reduce((n,r)=>n+r.litter.lambs.length,0),
    reared:rows.reduce((n,r)=>n+r.reared.length,0),
    weaned:rows.reduce((n,r)=>n+r.weaned.length,0),
    weighed:rows.reduce((n,r)=>n+r.weighed.length,0),
    pounds:rows.reduce((n,r)=>n+r.pounds,0),
    litterPounds:meanKnown(rows.map(r=>r.complete?r.pounds:null)),
    pre:meanKnown(rows.map(r=>r.preEfficiency)),
    breeding:meanKnown(rows.map(r=>r.breedingEfficiency)),
  };
}
