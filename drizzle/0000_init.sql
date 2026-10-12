CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`recipient` text NOT NULL,
	`data` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` text PRIMARY KEY NOT NULL,
	`company_name` text NOT NULL,
	`email` text NOT NULL,
	`website` text NOT NULL,
	`jurisdiction` text NOT NULL,
	`bank_account_name` text NOT NULL,
	`bank_account_number` text NOT NULL,
	`bank_ifsc` text NOT NULL,
	`bank_name` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `signatories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`title` text NOT NULL,
	`signature` text,
	`active` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` integer NOT NULL
);
