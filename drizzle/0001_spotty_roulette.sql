CREATE TABLE `asset_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(50) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `asset_types_id` PRIMARY KEY(`id`),
	CONSTRAINT `asset_types_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ticker` varchar(20) NOT NULL,
	`name` varchar(255) NOT NULL,
	`asset_type_id` int NOT NULL,
	`segment_id` int,
	`current_price` decimal(12,4) NOT NULL DEFAULT '0',
	`previous_price` decimal(12,4) NOT NULL DEFAULT '0',
	`price_updated_at` timestamp NOT NULL DEFAULT (now()),
	`day_high` decimal(12,4),
	`day_low` decimal(12,4),
	`year_high` decimal(12,4),
	`year_low` decimal(12,4),
	`market_cap` decimal(20,2),
	`dividend_yield` decimal(8,4),
	`pe` decimal(8,2),
	`pb` decimal(8,2),
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `assets_id` PRIMARY KEY(`id`),
	CONSTRAINT `assets_ticker_unique` UNIQUE(`ticker`)
);
--> statement-breakpoint
CREATE TABLE `dividends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`asset_id` int NOT NULL,
	`holding_id` int,
	`type` enum('dividend','jcp','rendimento','amortizacao') NOT NULL,
	`amount` decimal(18,2) NOT NULL,
	`per_share` decimal(12,4) NOT NULL,
	`ex_date` timestamp,
	`payment_date` timestamp NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dividends_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`target_amount` decimal(18,2) NOT NULL,
	`current_amount` decimal(18,2) NOT NULL DEFAULT '0',
	`target_date` timestamp,
	`category` enum('patrimonio','renda','economia','outro') NOT NULL,
	`status` enum('ativo','concluido','cancelado') NOT NULL DEFAULT 'ativo',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `holdings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`asset_id` int NOT NULL,
	`quantity` decimal(18,8) NOT NULL,
	`average_buy_price` decimal(12,4) NOT NULL,
	`total_invested` decimal(18,2) NOT NULL,
	`current_value` decimal(18,2) NOT NULL,
	`gain` decimal(18,2) NOT NULL,
	`gain_percentage` decimal(8,4) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `holdings_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_asset_unique` UNIQUE(`user_id`,`asset_id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text,
	`type` enum('goal_reached','price_alert','dividend_payment','portfolio_update','system') NOT NULL,
	`read` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `portfolio_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`total_value` decimal(18,2) NOT NULL,
	`total_invested` decimal(18,2) NOT NULL,
	`total_gain` decimal(18,2) NOT NULL,
	`gain_percentage` decimal(8,4) NOT NULL,
	`snapshot_date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `portfolio_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `price_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`asset_id` int NOT NULL,
	`price` decimal(12,4) NOT NULL,
	`high` decimal(12,4),
	`low` decimal(12,4),
	`volume` decimal(20,0),
	`recorded_at` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `price_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `segments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `segments_id` PRIMARY KEY(`id`),
	CONSTRAINT `segments_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`asset_id` int NOT NULL,
	`holding_id` int,
	`type` enum('buy','sell') NOT NULL,
	`quantity` decimal(18,8) NOT NULL,
	`unit_price` decimal(12,4) NOT NULL,
	`total_value` decimal(18,2) NOT NULL,
	`fees` decimal(12,2) DEFAULT '0',
	`transaction_date` timestamp NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `asset_type_idx` ON `assets` (`asset_type_id`);--> statement-breakpoint
CREATE INDEX `segment_idx` ON `assets` (`segment_id`);--> statement-breakpoint
CREATE INDEX `ticker_idx` ON `assets` (`ticker`);--> statement-breakpoint
CREATE INDEX `dividends_user_idx` ON `dividends` (`user_id`);--> statement-breakpoint
CREATE INDEX `dividends_asset_idx` ON `dividends` (`asset_id`);--> statement-breakpoint
CREATE INDEX `dividends_holding_idx` ON `dividends` (`holding_id`);--> statement-breakpoint
CREATE INDEX `dividends_payment_date_idx` ON `dividends` (`payment_date`);--> statement-breakpoint
CREATE INDEX `goals_user_idx` ON `financial_goals` (`user_id`);--> statement-breakpoint
CREATE INDEX `holdings_user_idx` ON `holdings` (`user_id`);--> statement-breakpoint
CREATE INDEX `holdings_asset_idx` ON `holdings` (`asset_id`);--> statement-breakpoint
CREATE INDEX `notifications_user_idx` ON `notifications` (`user_id`);--> statement-breakpoint
CREATE INDEX `notifications_read_idx` ON `notifications` (`read`);--> statement-breakpoint
CREATE INDEX `snapshots_user_idx` ON `portfolio_snapshots` (`user_id`);--> statement-breakpoint
CREATE INDEX `snapshots_date_idx` ON `portfolio_snapshots` (`snapshot_date`);--> statement-breakpoint
CREATE INDEX `price_history_asset_idx` ON `price_history` (`asset_id`);--> statement-breakpoint
CREATE INDEX `price_history_recorded_at_idx` ON `price_history` (`recorded_at`);--> statement-breakpoint
CREATE INDEX `transactions_user_idx` ON `transactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `transactions_asset_idx` ON `transactions` (`asset_id`);--> statement-breakpoint
CREATE INDEX `transactions_holding_idx` ON `transactions` (`holding_id`);