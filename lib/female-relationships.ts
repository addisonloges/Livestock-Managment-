import {type Animal,relation} from './livestock.ts';
export function ancestryDistances(id:string,animals:Animal[]){
 const map=new Map(animals.map(a=>[a.id,a])),distances=new Map<string,number>([[id,0]]),queue=[id];
 for(let i=0;i<queue.length;i++){const a=map.get(queue[i]);if(!a)continue;const distance=distances.get(a.id)!+1;for(const parent of [a.sire,a.dam])if(parent&&map.has(parent)&&!distances.has(parent)){distances.set(parent,distance);queue.push(parent)}}
 return distances;
}
export function sharedFamily(a:Animal,b:Animal,animals:Animal[]){
 const left=ancestryDistances(a.id,animals),right=ancestryDistances(b.id,animals);
 const shared=animals.filter(p=>left.has(p.id)&&right.has(p.id)).map(animal=>({animal,left:left.get(animal.id)!,right:right.get(animal.id)!})).sort((a,b)=>a.left+a.right-b.left-b.right);
 let description=relation(a,b);if(description==='See pedigree'){
  if(left.has(b.id)||right.has(a.id))description='Ancestor / descendant';
  else if(shared.some(p=>p.left===2&&p.right===2))description='Shared grandparents';
  else description=shared.length?'Shared ancestry':'No shared ancestry recorded';
 }
 return {shared,description};
}
