CREATE TABLE `farm_history` (
	`operationId` text PRIMARY KEY NOT NULL,
	`recordId` text NOT NULL,
	`before` text NOT NULL,
	`after` text NOT NULL,
	`createdAt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `farm_records` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`species` text NOT NULL,
	`date` text NOT NULL,
	`data` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`archivedAt` text
);
