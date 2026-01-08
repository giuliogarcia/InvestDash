import { 
  integer, 
  text, 
  real,
  sqliteTable,
  index,
} from "drizzle-orm/sqlite-core";

/**
 * Core user table backing auth flow.
 */
export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  openId: text("openId").notNull().unique(),
  name: text("name"),
  email: text("email"),
  loginMethod: text("loginMethod"),
  role: text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
  lastSignedIn: integer("lastSignedIn", { mode: "timestamp" }).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Asset types available in the system
 */
export const assetTypes = sqliteTable("asset_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(), // "Ação", "FII", "Renda Fixa", "ETF", "Cripto"
  description: text("description"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export type AssetType = typeof assetTypes.$inferSelect;
export type InsertAssetType = typeof assetTypes.$inferInsert;

/**
 * Segments/sectors for assets
 */
export const segments = sqliteTable("segments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(), // "Tecnologia", "Financeiro", "Energia", etc
  description: text("description"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
});

export type Segment = typeof segments.$inferSelect;
export type InsertSegment = typeof segments.$inferInsert;

/**
 * Available assets in the market
 */
export const assets = sqliteTable("assets", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ticker: text("ticker").notNull().unique(), // PETR4, ITUB4, BCFF11, etc
  name: text("name").notNull(),
  assetTypeId: integer("asset_type_id").notNull(),
  segmentId: integer("segment_id"),
  currentPrice: real("current_price").notNull().default(0),
  previousPrice: real("previous_price").notNull().default(0),
  priceUpdatedAt: integer("price_updated_at", { mode: "timestamp" }).notNull(),
  dayHigh: real("day_high"),
  dayLow: real("day_low"),
  yearHigh: real("year_high"),
  yearLow: real("year_low"),
  marketCap: real("market_cap"),
  dividendYield: real("dividend_yield"),
  pe: real("pe"),
  pb: real("pb"),
  description: text("description"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
}, (table) => ({
  assetTypeIdx: index("asset_type_idx").on(table.assetTypeId),
  segmentIdx: index("segment_idx").on(table.segmentId),
  tickerIdx: index("ticker_idx").on(table.ticker),
}));

export type Asset = typeof assets.$inferSelect;
export type InsertAsset = typeof assets.$inferInsert;

/**
 * User's portfolio holdings
 */
export const holdings = sqliteTable("holdings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  assetId: integer("asset_id").notNull(),
  quantity: real("quantity").notNull(),
  averageBuyPrice: real("average_buy_price").notNull(),
  totalInvested: real("total_invested").notNull(),
  currentValue: real("current_value").notNull(),
  gain: real("gain").notNull(),
  gainPercentage: real("gain_percentage").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
}, (table) => ({
  userIdx: index("holdings_user_idx").on(table.userId),
  assetIdx: index("holdings_asset_idx").on(table.assetId),
}));

export type Holding = typeof holdings.$inferSelect;
export type InsertHolding = typeof holdings.$inferInsert;

/**
 * Transaction history for each asset
 */
export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  assetId: integer("asset_id").notNull(),
  holdingId: integer("holding_id"),
  type: text("type", { enum: ["buy", "sell"] }).notNull(),
  quantity: real("quantity").notNull(),
  unitPrice: real("unit_price").notNull(),
  totalValue: real("total_value").notNull(),
  fees: real("fees").default(0),
  transactionDate: integer("transaction_date", { mode: "timestamp" }).notNull(),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
}, (table) => ({
  userIdx: index("transactions_user_idx").on(table.userId),
  assetIdx: index("transactions_asset_idx").on(table.assetId),
  holdingIdx: index("transactions_holding_idx").on(table.holdingId),
}));

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

/**
 * Dividends, JCP, and other income
 */
export const dividends = sqliteTable("dividends", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  assetId: integer("asset_id").notNull(),
  holdingId: integer("holding_id"),
  type: text("type", { enum: ["dividend", "jcp", "rendimento", "amortizacao"] }).notNull(),
  amount: real("amount").notNull(),
  perShare: real("per_share").notNull(),
  exDate: integer("ex_date", { mode: "timestamp" }),
  paymentDate: integer("payment_date", { mode: "timestamp" }).notNull(),
  notes: text("notes"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
}, (table) => ({
  userIdx: index("dividends_user_idx").on(table.userId),
  assetIdx: index("dividends_asset_idx").on(table.assetId),
  holdingIdx: index("dividends_holding_idx").on(table.holdingId),
  paymentDateIdx: index("dividends_payment_date_idx").on(table.paymentDate),
}));

export type Dividend = typeof dividends.$inferSelect;
export type InsertDividend = typeof dividends.$inferInsert;

/**
 * Financial goals
 */
export const financialGoals = sqliteTable("financial_goals", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  targetAmount: real("target_amount").notNull(),
  currentAmount: real("current_amount").notNull().default(0),
  targetDate: integer("target_date", { mode: "timestamp" }),
  category: text("category", { enum: ["patrimonio", "renda", "economia", "outro"] }).notNull(),
  status: text("status", { enum: ["ativo", "concluido", "cancelado"] }).default("ativo").notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull(),
}, (table) => ({
  userIdx: index("goals_user_idx").on(table.userId),
}));

export type FinancialGoal = typeof financialGoals.$inferSelect;
export type InsertFinancialGoal = typeof financialGoals.$inferInsert;

/**
 * Price history for assets
 */
export const priceHistory = sqliteTable("price_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  assetId: integer("asset_id").notNull(),
  price: real("price").notNull(),
  high: real("high"),
  low: real("low"),
  volume: real("volume"),
  recordedAt: integer("recorded_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
}, (table) => ({
  assetIdx: index("price_history_asset_idx").on(table.assetId),
  recordedAtIdx: index("price_history_recorded_at_idx").on(table.recordedAt),
}));

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;

/**
 * Portfolio snapshots for historical tracking
 */
export const portfolioSnapshots = sqliteTable("portfolio_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  totalValue: real("total_value").notNull(),
  totalInvested: real("total_invested").notNull(),
  totalGain: real("total_gain").notNull(),
  gainPercentage: real("gain_percentage").notNull(),
  snapshotDate: integer("snapshot_date", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
}, (table) => ({
  userIdx: index("snapshots_user_idx").on(table.userId),
  snapshotDateIdx: index("snapshots_date_idx").on(table.snapshotDate),
}));

export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect;
export type InsertPortfolioSnapshot = typeof portfolioSnapshots.$inferInsert;

/**
 * Notifications for portfolio events
 */
export const notifications = sqliteTable("notifications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  message: text("message"),
  type: text("type", { enum: ["goal_reached", "price_alert", "dividend_payment", "portfolio_update", "system"] }).notNull(),
  read: integer("read", { mode: "boolean" }).default(false).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
}, (table) => ({
  userIdx: index("notifications_user_idx").on(table.userId),
  readIdx: index("notifications_read_idx").on(table.read),
}));

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
