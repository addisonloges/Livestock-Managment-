CREATE TABLE `breeding_groups` (
	`id` text PRIMARY KEY NOT NULL,
	`species` text NOT NULL,
	`year` integer NOT NULL,
	`data` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updatedAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `breeding_history` (
	`operationId` text PRIMARY KEY NOT NULL,
	`groupId` text NOT NULL,
	`before` text NOT NULL,
	`after` text NOT NULL,
	`reason` text NOT NULL,
	`createdAt` text NOT NULL
);
