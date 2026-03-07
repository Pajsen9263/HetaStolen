CREATE TABLE `question` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`createdAt` integer NOT NULL,
	`sessionId` text,
	FOREIGN KEY (`sessionId`) REFERENCES `session`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`code` text(6) NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_code_unique` ON `session` (`code`);--> statement-breakpoint
CREATE TABLE `speaker` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`sessionId` text,
	FOREIGN KEY (`sessionId`) REFERENCES `session`(`id`) ON UPDATE no action ON DELETE cascade
);
