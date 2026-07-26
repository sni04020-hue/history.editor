CREATE TABLE `portal_documents` (
	`id` integer PRIMARY KEY NOT NULL,
	`document_json` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL,
	`updated_by` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `portal_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`version` integer NOT NULL,
	`document_json` text NOT NULL,
	`author_email` text NOT NULL,
	`created_at` text NOT NULL
);
