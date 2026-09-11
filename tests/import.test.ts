import test from 'node:test';
import assert from 'node:assert/strict';
import {blankImportRow,parseCsv,normalizeImportRow,prepareImport,mapImportRows} from '../lib/animal-import.ts';
const row=(key:string,name=key)=>({...blankImportRow('Sheep','2026',key),name,sex:'Female'});
test('duplicate birth columns combine blanks and agreeing values without losing dates',()=>{
 const result=mapImportRows([['DOB','Birth Date'],['','2022-01-01'],['2021-01-01',''],['2020-01-01','2020-01-01'],['','']],['dob','dob'],'Sheep','2026');
 assert.deepEqual(result.map(r=>r.dob),['2022-01-01','2021-01-01','2020-01-01','']);
 assert.throws(()=>mapImportRows([['DOB','Birth Date'],['2022-01-01','2023-01-01']],['dob','dob'],'Sheep','2026'),/Row 1.*DOB.*Birth Date.*different values/);
 assert.equal(mapImportRows([['Species','Year'],['','']],['species','firstYear'],'Sheep','2026')[0].firstYear,'2026');
});
test('CSV keeps quoted commas, escaped quotes, multiline cells and leading zeros',()=>{
 assert.deepEqual(parseCsv('\uFEFFname,eid,notes\r\n"Ewe, One",000123,"line 1\nline ""2"""\r\n'),[['name','eid','notes'],['Ewe, One','000123','line 1\nline "2"']]);
 assert.throws(()=>parseCsv('name\n"unclosed'),/not closed/);
});
test('import resolves parent rows regardless of order and keeps unowned ancestors separate',()=>{
 const child={...row('lamb'),sireKey:'sire',dob:'2026-01-01'},sire={...row('sire'),sex:'ram',pedigreeOnly:'yes',birthYear:'2022'};
 const p=prepareImport([child,sire],[],2026);assert.deepEqual(p.errors,[]);assert.equal(p.animals[0].sire,sire.id);assert.equal(p.animals[1].pedigreeOnly,1);assert.equal(p.animals[1].sex,'Male');
});
test('invalid dates, missing parent keys and repeated identities block the whole preview',()=>{
 assert.match(prepareImport([{...row('x'),dob:'2026-02-30'}],[],2026).errors.join(),/birth date/);
 assert.match(prepareImport([{...row('x'),sireKey:'missing'}],[],2026).errors.join(),/sire import key/);
 const a=row('x');const existing=prepareImport([a],[],2026).animals;
 assert.match(prepareImport([row('y','x')],existing,2026).errors.join(),/duplicate/);
 assert.match(prepareImport([{...row('x'),eid:'001'},{...row('y'),eid:'001'}],[],2026).errors.join(),/duplicate/);
});
test('cycles and impossible parent ages are rejected',()=>{
 const a={...row('a'),sex:'Male',sireKey:'b'},b={...row('b'),sex:'Male',sireKey:'a'};
 assert.match(prepareImport([a,b],[],2026).errors.join(),/cycle/);
 assert.match(prepareImport([{...a,dob:'2020-01-01'},{...b,sireKey:'',dob:'2022-01-01'}],[],2026).errors.join(),/before/);
});
test('recognizes common sex and species labels without assigning missing sex',()=>{
 assert.equal(normalizeImportRow({...row('x'),sex:'ewe',species:'goat'}).species,'Goats');
 assert.match(prepareImport([{...row('x'),sex:''}],[],2026).errors.join(),/Sex is required/);
});
