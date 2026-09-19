import {sql} from 'drizzle-orm';
import {integer,real,sqliteTable,text,uniqueIndex,index} from 'drizzle-orm/sqlite-core';
export const animals=sqliteTable('animals',{
 birthSequence:integer('birthSequence'),pedigreeOnly:integer('pedigreeOnly').notNull().default(0),pedigreeInfo:text('pedigreeInfo').notNull().default('{}'),archivedAt:text('archivedAt'),seq:integer('seq').primaryKey({autoIncrement:true}),id:text('id').notNull().unique(),species:text('species').notNull(),name:text('name').notNull().default(''),rightTag:text('rightTag').notNull().default(''),leftTag:text('leftTag').notNull().default(''),eid:text('eid'),sex:text('sex').notNull(),origin:text('origin').notNull(),dob:text('dob'),birthYear:integer('birthYear'),firstYear:integer('firstYear').notNull(),breed:text('breed').notNull().default(''),sire:text('sire'),dam:text('dam'),status:text('status').notNull().default('Active'),createdAt:text('createdAt').notNull(),version:integer('version').notNull().default(1)
},t=>[uniqueIndex('idx_animals_eid').on(t.eid),uniqueIndex('idx_animals_birth_number').on(t.birthYear,t.birthSequence),uniqueIndex('idx_animals_unknown_birth_number').on(t.birthSequence).where(sql`${t.birthYear} IS NULL`),index('idx_animals_species_firstYear').on(t.species,t.firstYear)]);
export const weights=sqliteTable('weights',{id:text('id').primaryKey(),animalId:text('animalId').notNull().references(()=>animals.id),date:text('date').notNull(),pounds:real('pounds').notNull(),originalValue:real('originalValue').notNull(),unit:text('unit').notNull(),session:text('session').notNull(),createdAt:text('createdAt').notNull(),version:integer('version').notNull().default(1)},t=>[uniqueIndex('idx_weights_animal_date').on(t.animalId,t.date)]);

export const animalHistory=sqliteTable('animal_history',{operationId:text('operationId').primaryKey(),animalId:text('animalId').notNull().references(()=>animals.id),action:text('action').notNull(),reason:text('reason').notNull(),before:text('before').notNull(),after:text('after').notNull(),createdAt:text('createdAt').notNull()},t=>[index('idx_history_animal').on(t.animalId)]);

export const breedingGroups=sqliteTable('breeding_groups',{id:text('id').primaryKey(),species:text('species').notNull(),year:integer('year').notNull(),data:text('data').notNull(),version:integer('version').notNull().default(1),updatedAt:text('updatedAt').notNull()});
export const breedingHistory=sqliteTable('breeding_history',{operationId:text('operationId').primaryKey(),groupId:text('groupId').notNull(),before:text('before').notNull(),after:text('after').notNull(),reason:text('reason').notNull(),createdAt:text('createdAt').notNull()});

export const breedingProjects=sqliteTable('breeding_projects',{id:text('id').primaryKey(),data:text('data').notNull(),version:integer('version').notNull().default(1)});

export const farmRecords=sqliteTable('farm_records',{id:text('id').primaryKey(),kind:text('kind').notNull(),species:text('species').notNull(),date:text('date').notNull(),data:text('data').notNull(),version:integer('version').notNull().default(1),archivedAt:text('archivedAt')});
export const farmHistory=sqliteTable('farm_history',{operationId:text('operationId').primaryKey(),recordId:text('recordId').notNull(),before:text('before').notNull(),after:text('after').notNull(),createdAt:text('createdAt').notNull()});
export const recoveryControl=sqliteTable('recovery_control',{id:integer('id').primaryKey(),epoch:integer('epoch').notNull().default(0)});

export const identityCounters=sqliteTable('identity_counters',{yearKey:integer('yearKey').primaryKey(),highWater:integer('highWater').notNull()});

export const recoveryRuns=sqliteTable('recovery_runs',{id:text('id').primaryKey(),epoch:integer('epoch').notNull(),scope:text('scope').notNull(),safetyKey:text('safetyKey').notNull(),createdAt:text('createdAt').notNull(),counts:text('counts').notNull()});
export const dashboardSessions=sqliteTable('dashboard_sessions',{tokenHash:text('tokenHash').primaryKey().notNull(),expires:integer('expires').notNull()});
export const dashboardLoginAttempts=sqliteTable('dashboard_login_attempts',{key:text('key').primaryKey().notNull(),attempts:integer('attempts').notNull(),expires:integer('expires').notNull()});
