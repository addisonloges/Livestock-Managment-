CREATE TABLE `animal_history` (
	`operationId` text PRIMARY KEY NOT NULL,
	`animalId` text NOT NULL,
	`action` text NOT NULL,
	`reason` text NOT NULL,
	`before` text NOT NULL,
	`after` text NOT NULL,
	`createdAt` text NOT NULL,
	FOREIGN KEY (`animalId`) REFERENCES `animals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_history_animal` ON `animal_history` (`animalId`);--> statement-breakpoint
ALTER TABLE `animals` ADD `archivedAt` text;