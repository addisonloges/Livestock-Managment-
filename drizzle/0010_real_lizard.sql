CREATE TABLE `dashboard_login_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`attempts` integer NOT NULL,
	`expires` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `dashboard_sessions` (
	`tokenHash` text PRIMARY KEY NOT NULL,
	`expires` integer NOT NULL
);
