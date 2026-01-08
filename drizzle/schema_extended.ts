import { 
  int, 
  mysqlEnum, 
  mysqlTable, 
  text, 
  timestamp, 
  varchar,
  decimal,
  boolean,
  index,
  foreignKey,
  unique
} from "drizzle-orm/mysql-core";

// Import existing tables
export * from "./schema";

/**
 * Multiple portfolios for each user
 */
export const portfolios = mysqlTable("portfolios", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdx: index("portfolios_user_idx").on(table.userId),
}));

export type Portfolio = typeof portfolios.$inferSelect;
export type InsertPortfolio = typeof portfolios.$inferInsert;

/**
 * Fundamental indicators for stocks
 */
export const fundamentalIndicators = mysqlTable("fundamental_indicators", {
  id: int("id").autoincrement().primaryKey(),
  assetId: int("asset_id").notNull(),
  quarter: varchar("quarter", { length: 10 }), // "2024Q1"
  year: int("year"),
  
  // Profitability Indicators
  roe: decimal("roe", { precision: 8, scale: 4 }),
  roa: decimal("roa", { precision: 8, scale: 4 }),
  roic: decimal("roic", { precision: 8, scale: 4 }),
  margemBruta: decimal("margem_bruta", { precision: 8, scale: 4 }),
  margemEbitda: decimal("margem_ebitda", { precision: 8, scale: 4 }),
  margemLiquida: decimal("margem_liquida", { precision: 8, scale: 4 }),
  
  // Valuation Indicators
  pl: decimal("pl", { precision: 8, scale: 2 }),
  pvp: decimal("pvp", { precision: 8, scale: 2 }),
  psr: decimal("psr", { precision: 8, scale: 2 }),
  pebitda: decimal("pebitda", { precision: 8, scale: 2 }),
  evEbitda: decimal("ev_ebitda", { precision: 8, scale: 2 }),
  vpa: decimal("vpa", { precision: 12, scale: 4 }), // Valor Patrimonial por Ação
  lpa: decimal("lpa", { precision: 12, scale: 4 }), // Lucro por Ação
  
  // Debt Indicators
  dividaLiquida: decimal("divida_liquida", { precision: 20, scale: 2 }),
  dividaBrutaPatrimonio: decimal("divida_bruta_patrimonio", { precision: 8, scale: 4 }),
  dividaLiquidaEbitda: decimal("divida_liquida_ebitda", { precision: 8, scale: 2 }),
  
  // Liquidity Indicators
  liquidezCorrente: decimal("liquidez_corrente", { precision: 8, scale: 4 }),
  liquidezSeca: decimal("liquidez_seca", { precision: 8, scale: 4 }),
  
  // Financial Results
  receitaLiquida: decimal("receita_liquida", { precision: 20, scale: 2 }),
  ebitda: decimal("ebitda", { precision: 20, scale: 2 }),
  lucroLiquido: decimal("lucro_liquido", { precision: 20, scale: 2 }),
  
  // Dividends
  dividendYield: decimal("dividend_yield", { precision: 8, scale: 4 }),
  payoutRatio: decimal("payout_ratio", { precision: 8, scale: 4 }),
  
  recordedAt: timestamp("recorded_at").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  assetIdx: index("fundamental_asset_idx").on(table.assetId),
  recordedAtIdx: index("fundamental_recorded_at_idx").on(table.recordedAt),
}));

export type FundamentalIndicator = typeof fundamentalIndicators.$inferSelect;
export type InsertFundamentalIndicator = typeof fundamentalIndicators.$inferInsert;

/**
 * FII-specific indicators
 */
export const fiiIndicators = mysqlTable("fii_indicators", {
  id: int("id").autoincrement().primaryKey(),
  assetId: int("asset_id").notNull(),
  
  // FII Specific Indicators
  patrimonioLiquido: decimal("patrimonio_liquido", { precision: 20, scale: 2 }),
  valorPatrimonialCota: decimal("valor_patrimonial_cota", { precision: 12, scale: 4 }),
  pvp: decimal("pvp", { precision: 8, scale: 4 }),
  dividendYield: decimal("dividend_yield", { precision: 8, scale: 4 }),
  
  // Vacancy and Tenants
  vacanciaFisica: decimal("vacancia_fisica", { precision: 8, scale: 4 }),
  vacanciaFinanceira: decimal("vacancia_financeira", { precision: 8, scale: 4 }),
  numeroImoveis: int("numero_imoveis"),
  numeroInquilinos: int("numero_inquilinos"),
  
  // Profitability
  rentabilidadeMes: decimal("rentabilidade_mes", { precision: 8, scale: 4 }),
  rentabilidade12m: decimal("rentabilidade_12m", { precision: 8, scale: 4 }),
  
  recordedAt: timestamp("recorded_at").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  assetIdx: index("fii_indicators_asset_idx").on(table.assetId),
  recordedAtIdx: index("fii_indicators_recorded_at_idx").on(table.recordedAt),
}));

export type FiiIndicator = typeof fiiIndicators.$inferSelect;
export type InsertFiiIndicator = typeof fiiIndicators.$inferInsert;

/**
 * Market events calendar
 */
export const marketEvents = mysqlTable("market_events", {
  id: int("id").autoincrement().primaryKey(),
  assetId: int("asset_id").notNull(),
  eventType: mysqlEnum("event_type", [
    "dividend_announcement",
    "earnings_release",
    "shareholder_meeting",
    "stock_split",
    "ipo",
    "delisting",
    "corporate_action"
  ]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  assetIdx: index("market_events_asset_idx").on(table.assetId),
  eventDateIdx: index("market_events_date_idx").on(table.eventDate),
}));

export type MarketEvent = typeof marketEvents.$inferSelect;
export type InsertMarketEvent = typeof marketEvents.$inferInsert;

/**
 * Price alerts
 */
export const priceAlerts = mysqlTable("price_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  assetId: int("asset_id").notNull(),
  targetPrice: decimal("target_price", { precision: 12, scale: 4 }).notNull(),
  condition: mysqlEnum("condition", ["above", "below"]).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  triggered: boolean("triggered").default(false).notNull(),
  triggeredAt: timestamp("triggered_at"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("price_alerts_user_idx").on(table.userId),
  assetIdx: index("price_alerts_asset_idx").on(table.assetId),
  activeIdx: index("price_alerts_active_idx").on(table.isActive),
}));

export type PriceAlert = typeof priceAlerts.$inferSelect;
export type InsertPriceAlert = typeof priceAlerts.$inferInsert;

/**
 * User favorites
 */
export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  assetId: int("asset_id").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("favorites_user_idx").on(table.userId),
  userAssetUnique: unique("user_asset_favorite_unique").on(table.userId, table.assetId),
}));

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

/**
 * Saved comparisons
 */
export const savedComparisons = mysqlTable("saved_comparisons", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  assetIds: text("asset_ids").notNull(), // JSON array of IDs
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("saved_comparisons_user_idx").on(table.userId),
}));

export type SavedComparison = typeof savedComparisons.$inferSelect;
export type InsertSavedComparison = typeof savedComparisons.$inferInsert;

/**
 * Saved advanced searches
 */
export const savedSearches = mysqlTable("saved_searches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  filters: text("filters").notNull(), // JSON with filters
  category: varchar("category", { length: 50 }), // "acoes", "fiis", etc
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdx: index("saved_searches_user_idx").on(table.userId),
}));

export type SavedSearch = typeof savedSearches.$inferSelect;
export type InsertSavedSearch = typeof savedSearches.$inferInsert;

/**
 * Market indices (Ibovespa, IFIX, CDI, etc)
 */
export const marketIndices = mysqlTable("market_indices", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 20 }).notNull().unique(), // "IBOV", "IFIX", "CDI"
  name: varchar("name", { length: 100 }).notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 4 }).notNull(),
  previousValue: decimal("previous_value", { precision: 12, scale: 4 }),
  changePercentage: decimal("change_percentage", { precision: 8, scale: 4 }),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  codeIdx: index("market_indices_code_idx").on(table.code),
}));

export type MarketIndex = typeof marketIndices.$inferSelect;
export type InsertMarketIndex = typeof marketIndices.$inferInsert;

/**
 * Rankings cache
 */
export const rankings = mysqlTable("rankings", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  category: varchar("category", { length: 50 }), // "acoes", "fiis", "stocks"
  rankingType: varchar("ranking_type", { length: 50 }), // "dividend_yield", "market_cap", etc
  data: text("data"), // JSON with ranking data
  generatedAt: timestamp("generated_at").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  categoryTypeIdx: index("rankings_category_type_idx").on(table.category, table.rankingType),
  generatedAtIdx: index("rankings_generated_at_idx").on(table.generatedAt),
}));

export type Ranking = typeof rankings.$inferSelect;
export type InsertRanking = typeof rankings.$inferInsert;
