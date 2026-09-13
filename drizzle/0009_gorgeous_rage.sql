CREATE TABLE `recovery_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`epoch` integer NOT NULL,
	`scope` text NOT NULL,
	`safetyKey` text NOT NULL,
	`createdAt` text NOT NULL,
	`counts` text NOT NULL
);
