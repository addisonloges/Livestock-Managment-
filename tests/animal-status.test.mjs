import assert from 'node:assert/strict';
import {presentInYear,statusAt} from '../lib/animal-status.ts';
const a={firstYear:2023,status:'Active',statusEvents:[{date:'2024-06-01',status:'Sold'},{date:'2026-02-01',status:'Active'}]};
assert.equal(presentInYear(a,'2022'),false);assert.equal(presentInYear(a,'2023'),true);assert.equal(presentInYear(a,'2024'),true);assert.equal(presentInYear(a,'2025'),false);assert.equal(presentInYear(a,'2026'),true);assert.equal(presentInYear(a,'all'),true);assert.equal(statusAt(a,'2024-05-31'),'Active');assert.equal(statusAt(a,'2024-06-01'),'Sold');assert.equal(statusAt(a,'2026-02-01'),'Active');
const jan={firstYear:2023,status:'Sold',statusEvents:[{date:'2024-01-01',status:'Sold'}]};assert.equal(presentInYear(jan,'2024'),true);assert.equal(presentInYear(jan,'2025'),false);
console.log('PASS: exit year, subsequent absence, return year, historical status, January exit, all years');
