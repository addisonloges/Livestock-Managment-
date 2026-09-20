CREATE TABLE `dashboard_changes` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`createdAt` text NOT NULL,
	`path` text NOT NULL,
	`action` text NOT NULL,
	`details` text NOT NULL,
	`outcome` text NOT NULL,
	`status` integer
);
--> statement-breakpoint
ALTER TABLE `dashboard_sessions` ADD `userId` text;