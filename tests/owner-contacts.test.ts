import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeOwners,ownershipAt} from '../lib/ownership.ts';
test('owner contact identity is retained alongside the historical name and share',()=>{
 const contactId='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
 const owners=normalizeOwners([{name:'Original farm',percent:'100',contactId}],false);
 assert.deepEqual(owners,[{name:'Original farm',basisPoints:10000,contactId}]);
 assert.equal(ownershipAt([{operationId:'one',date:'2026-01-01',owners,unknown:false,reason:'Purchase'}],'2026-02-01')?.owners[0].name,'Original farm');
 assert.throws(()=>normalizeOwners([{name:'Farm',percent:'100',contactId:'invalid'}],false));
 assert.deepEqual(normalizeOwners([{name:'Manual farm',percent:'100'}],false),[{name:'Manual farm',basisPoints:10000}]);
});
