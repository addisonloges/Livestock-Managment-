import test from 'node:test';import assert from 'node:assert/strict';
import {sharedFamily} from '../lib/female-relationships.ts';
import {relationshipMatrix,type Animal} from '../lib/livestock.ts';
test('female pairs identify full sisters, half sisters, cousins and direct ancestors',()=>{
 const make=(id:string,sire:string|null=null,dam:string|null=null)=>({id,sire,dam,name:id} as Animal);
 const p=make('p'),q=make('q'),r=make('r'),s=make('s'),a=make('a','p','q'),b=make('b','p','q'),c=make('c','p','r'),d=make('d','s','a'),e=make('e','r','b');const all=[p,q,r,s,a,b,c,d,e],matrix=relationshipMatrix(all);
 assert.equal(sharedFamily(a,b,all).description,'Full siblings');assert.equal(matrix.get('a','b'),.5);
 assert.equal(sharedFamily(a,c,all).description,'Half siblings');assert.equal(matrix.get('a','c'),.25);
 assert.equal(sharedFamily(d,e,all).description,'Shared grandparents');assert.equal(matrix.get('d','e'),.125);
 assert.equal(sharedFamily(a,d,all).description,'Parent / offspring');assert.equal(sharedFamily(p,d,all).description,'Ancestor / descendant');
 assert.equal(sharedFamily(p,q,all).description,'No shared ancestry recorded');assert.equal(sharedFamily(a,b,all).shared.length,2);
});
