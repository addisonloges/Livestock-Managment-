ALTER TABLE `animals` ADD `pedigreeOnly` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `animals` ADD `pedigreeInfo` text DEFAULT '{}' NOT NULL;