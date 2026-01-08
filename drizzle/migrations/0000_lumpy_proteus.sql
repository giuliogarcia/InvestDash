CREATE TABLE `asset_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `asset_types_name_unique` ON `asset_types` (`name`);--> statement-breakpoint
CREATE TABLE `assets` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`ticker` text NOT NULL,
	`name` text NOT NULL,
	`asset_type_id` integer NOT NULL,
	`segment_id` integer,
	`current_price` real DEFAULT 0 NOT NULL,
	`previous_price` real DEFAULT 0 NOT NULL,
	`price_updated_at` integer NOT NULL,
	`day_high` real,
	`day_low` real,
	`year_high` real,
	`year_low` real,
	`market_cap` real,
	`dividend_yield` real,
	`pe` real,
	`pb` real,
	`description` text,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assets_ticker_unique` ON `assets` (`ticker`);--> statement-breakpoint
CREATE INDEX `asset_type_idx` ON `assets` (`asset_type_id`);--> statement-breakpoint
CREATE INDEX `segment_idx` ON `assets` (`segment_id`);--> statement-breakpoint
CREATE INDEX `ticker_idx` ON `assets` (`ticker`);--> statement-breakpoint
CREATE TABLE `dividends` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`asset_id` integer NOT NULL,
	`holding_id` integer,
	`type` text NOT NULL,
	`amount` real NOT NULL,
	`per_share` real NOT NULL,
	`ex_date` integer,
	`payment_date` integer NOT NULL,
	`notes` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `dividends_user_idx` ON `dividends` (`user_id`);--> statement-breakpoint
CREATE INDEX `dividends_asset_idx` ON `dividends` (`asset_id`);--> statement-breakpoint
CREATE INDEX `dividends_holding_idx` ON `dividends` (`holding_id`);--> statement-breakpoint
CREATE INDEX `dividends_payment_date_idx` ON `dividends` (`payment_date`);--> statement-breakpoint
CREATE TABLE `financial_goals` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`target_amount` real NOT NULL,
	`current_amount` real DEFAULT 0 NOT NULL,
	`target_date` integer,
	`category` text NOT NULL,
	`status` text DEFAULT 'ativo' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `goals_user_idx` ON `financial_goals` (`user_id`);--> statement-breakpoint
CREATE TABLE `holdings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`asset_id` integer NOT NULL,
	`quantity` real NOT NULL,
	`average_buy_price` real NOT NULL,
	`total_invested` real NOT NULL,
	`current_value` real NOT NULL,
	`gain` real NOT NULL,
	`gain_percentage` real NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `holdings_user_idx` ON `holdings` (`user_id`);--> statement-breakpoint
CREATE INDEX `holdings_asset_idx` ON `holdings` (`asset_id`);--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`title` text NOT NULL,
	`message` text,
	`type` text NOT NULL,
	`read` integer DEFAULT false NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_read_idx` ON `notifications` (`read`);--> statement-breakpoint
CREATE TABLE `portfolio_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`total_value` real NOT NULL,
	`total_invested` real NOT NULL,
	`total_gain` real NOT NULL,
	`gain_percentage` real NOT NULL,
	`snapshot_date` integer NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `snapshots_user_idx` ON `portfolio_snapshots` (`user_id`);--> statement-breakpoint
CREATE INDEX `snapshots_date_idx` ON `portfolio_snapshots` (`snapshot_date`);--> statement-breakpoint
CREATE TABLE `price_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`asset_id` integer NOT NULL,
	`price` real NOT NULL,
	`high` real,
	`low` real,
	`volume` real,
	`recorded_at` integer NOT NULL,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `price_history_asset_idx` ON `price_history` (`asset_id`);--> statement-breakpoint
CREATE INDEX `price_history_recorded_at_idx` ON `price_history` (`recorded_at`);--> statement-breakpoint
CREATE TABLE `segments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `segments_name_unique` ON `segments` (`name`);--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`asset_id` integer NOT NULL,
	`holding_id` integer,
	`type` text NOT NULL,
	`quantity` real NOT NULL,
	`unit_price` real NOT NULL,
	`total_value` real NOT NULL,
	`fees` real DEFAULT 0,
	`transaction_date` integer NOT NULL,
	`notes` text,
	`createdAt` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `transactions_user_idx` ON `transactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `transactions_asset_idx` ON `transactions` (`asset_id`);--> statement-breakpoint
CREATE INDEX `transactions_holding_idx` ON `transactions` (`holding_id`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`openId` text NOT NULL,
	`name` text,
	`email` text,
	`loginMethod` text,
	`role` text DEFAULT 'user' NOT NULL,
	`createdAt` integer NOT NULL,
	`updatedAt` integer NOT NULL,
	`lastSignedIn` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_openId_unique` ON `users` (`openId`);