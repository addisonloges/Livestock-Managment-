CREATE TABLE `recovery_control` (
	`id` integer PRIMARY KEY NOT NULL,
	`epoch` integer DEFAULT 0 NOT NULL
);

--> statement-breakpoint
INSERT INTO recovery_control(id,epoch) VALUES (1,0);
