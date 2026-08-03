CREATE TABLE `agent_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`request_id` text NOT NULL,
	`action` text NOT NULL,
	`label` text NOT NULL,
	`response` text NOT NULL,
	`metadata` text,
	`user_agent` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`request_id`) REFERENCES `agent_requests`(`request_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `agent_events_request_id_idx` ON `agent_events` (`request_id`);--> statement-breakpoint
CREATE INDEX `agent_events_created_at_idx` ON `agent_events` (`created_at`);--> statement-breakpoint
CREATE TABLE `agent_requests` (
	`request_id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'created' NOT NULL,
	`source` text DEFAULT 'agent_card' NOT NULL,
	`contact` text,
	`object_address` text,
	`work_summary` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `agent_requests_status_idx` ON `agent_requests` (`status`);--> statement-breakpoint
CREATE INDEX `agent_requests_updated_at_idx` ON `agent_requests` (`updated_at`);