import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {balanceSheepRation,validateSheepNutrition} from '../lib/sheep-ration.ts';
import {rationCost} from '../lib/farm-events.ts';
import {sheepFeeds,sheepRequirements} from '../lib/sheep-ration-data.ts';
const fixture=JSON.parse(readFileSync(new URL('./sheep-ration-fixture.json',import.meta.url),'utf8'));
const near=(actual,expected)=>assert.ok(Math.abs(actual-expected)<1e-9,`${actual} != ${expected}`);
test('OSU workbook cached example: costs, all displayed nutrients, intake and Ca:P',()=>{
 const requirement=sheepRequirements.find(r=>r.name==='Ewe, Late Gestation Twin Lambs, 187 lbs');
 const r={...fixture,nutrition:{model:'osu-v6-1',dietScope:'complete',requirement}};
 validateSheepNutrition(r,'Sheep');const b=balanceSheepRation(r),e=fixture.expected;
 near(rationCost(r).perTon,e.C21);near(b.concentrations.dm,e.E19);near(b.estimatedAsFed,e.F5);
 for(const [key,cell] of Object.entries({me:'E25',tdn:'F25',cp:'H25',ca:'K25',p:'L25'}))near(b.daily[key],e[cell]);
 near(b.concentrations.cp,e.G25);near(b.concentrations.ndf,e.I25);near(b.concentrations.adf,e.J25);near(b.caP,e.E29);near(b.copperLimit,e.F31);
 // Excel coerces a missing copper value to zero. The production calculator must disclose unknown.
 assert.equal(b.daily.cu,null);assert.equal(b.daily.zn,null);
 const explicitZero=structuredClone(r);for(const i of explicitZero.ingredients)for(const k of ['cu','zn'])if(i.analysis.nutrients[k]===null)i.analysis.nutrients[k]=0;
 near(balanceSheepRation(explicitZero).daily.cu,e.M25);near(balanceSheepRation(explicitZero).daily.zn,e.N25);
});
test('unknown nutrient stays unknown rather than reporting adequacy from other feeds',()=>{
 const r=structuredClone(fixture);r.ingredients[0].analysis.nutrients.cu=null;
 const b=balanceSheepRation(r);assert.equal(b.daily.cu,null);assert.ok(b.missing.cu.includes('Corn Grain Whole'));assert.ok(b.daily.cp>0);
 r.ingredients[0].analysis.nutrients.dm=null;assert.equal(balanceSheepRation(r).daily.cp,null);
});
test('wet feed converts dry-matter percentages before daily intake; zero intake is unknown',()=>{
 const r={feedingLb:10,ingredients:[{name:'Test forage',pounds:100,pricePerTon:100,analysis:{source:'Test',nutrients:{dm:20,cp:10,cu:20}}}]};
 near(balanceSheepRation(r).daily.cp,.2);near(balanceSheepRation(r).copperPpmDM,20);
 assert.ok(balanceSheepRation(r).warnings.some(w=>w.includes('15 ppm')));
 r.feedingLb=0;assert.equal(balanceSheepRation(r).daily.cp,null);
});
test('all bundled feed references and sheep targets pass validation',()=>{
 for(const f of sheepFeeds)validateSheepNutrition({feedingLb:1,ingredients:[{name:f.name,pounds:1,pricePerTon:null,analysis:f}]},'Sheep');
 for(const requirement of sheepRequirements)validateSheepNutrition({feedingLb:1,ingredients:[],nutrition:{model:'osu-v6-1',dietScope:'complete',requirement}},'Sheep');
});
test('legacy cost-only rations remain valid; sheep models reject goats and invalid units',()=>{
 const r={feedingLb:2,ingredients:[{name:'Hay',pounds:100,pricePerTon:null}]};validateSheepNutrition(r,'Goats');assert.equal(rationCost(r).perTon,null);
 const n={...r,nutrition:{model:'osu-v6-1',dietScope:'supplement'}};assert.throws(()=>validateSheepNutrition(n,'Goats'));
 assert.throws(()=>validateSheepNutrition({...n,nutrition:{...n.nutrition,shrinkPercent:100}},'Sheep'));
 assert.throws(()=>validateSheepNutrition({...r,ingredients:[{...r.ingredients[0],analysis:{source:'Test',nutrients:{dm:101}}}]},'Sheep'));
});
