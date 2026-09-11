CREATE TABLE `animals` (
	`seq` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`id` text NOT NULL,
	`species` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`rightTag` text DEFAULT '' NOT NULL,
	`leftTag` text DEFAULT '' NOT NULL,
	`eid` text,
	`sex` text NOT NULL,
	`origin` text NOT NULL,
	`dob` text,
	`birthYear` integer,
	`firstYear` integer NOT NULL,
	`breed` text DEFAULT '' NOT NULL,
	`sire` text,
	`dam` text,
	`status` text DEFAULT 'Active' NOT NULL,
	`createdAt` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `animals_id_unique` ON `animals` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_animals_eid` ON `animals` (`eid`);--> statement-breakpoint
CREATE INDEX `idx_animals_species_firstYear` ON `animals` (`species`,`firstYear`);--> statement-breakpoint
CREATE TABLE `weights` (
	`id` text PRIMARY KEY NOT NULL,
	`animalId` text NOT NULL,
	`date` text NOT NULL,
	`pounds` real NOT NULL,
	`originalValue` real NOT NULL,
	`unit` text NOT NULL,
	`session` text NOT NULL,
	`createdAt` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`animalId`) REFERENCES `animals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_weights_animal_date` ON `weights` (`animalId`,`date`);