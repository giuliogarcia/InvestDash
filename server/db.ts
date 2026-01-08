import { eq, and, desc, sql, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";
import { 
  InsertUser, 
  users,
  assets,
  holdings,
  transactions,
  dividends,
  financialGoals,
  priceHistory,
  portfolioSnapshots,
  assetTypes,
  segments,
  InsertAsset,
  InsertHolding,
  InsertTransaction,
  InsertDividend,
  InsertFinancialGoal,
  InsertPriceHistory,
  InsertPortfolioSnapshot,
  InsertAssetType,
  InsertSegment
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db) {
    try {
      const __filename = fileURLToPath(import.meta.url);
      const __dirname = path.dirname(__filename);
      const projectRoot = path.resolve(__dirname, "..");
      
      let dbPath = process.env.DATABASE_URL;
      if (!dbPath) {
        throw new Error("DATABASE_URL not set");
      }
      
      // Se for caminho relativo (file:./dev.db), converter para absoluto
      if (dbPath.startsWith("file:")) {
        const relativePath = dbPath.replace("file:", "").trim();
        dbPath = path.resolve(projectRoot, relativePath);
      }
      
      console.log("[Database] Connecting to:", dbPath);
      const sqlite = new Database(dbPath);
      _db = drizzle(sqlite);
      console.log("[Database] ✓ Connected to SQLite");
    } catch (error) {
      console.error("[Database] ✗ Failed to connect:", error);
      throw error;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    throw new Error("[Database] Database connection failed");
  }

  try {
    // Para SQLite: Tenta UPDATE primeiro, se nenhuma linha foi afetada, faz INSERT
    const existingUserResult = await db
      .select()
      .from(users)
      .where(eq(users.openId, user.openId))
      .limit(1);
    
    const existingUser = existingUserResult.length > 0 ? existingUserResult[0] : null;

    const now = new Date();
    
    if (existingUser) {
      // Usuário existe, atualizar apenas os campos definidos
      const updateFields: Record<string, any> = {
        lastSignedIn: now,
        updatedAt: now,
      };
      
      if (user.name !== undefined) updateFields.name = user.name;
      if (user.email !== undefined) updateFields.email = user.email;
      if (user.loginMethod !== undefined) updateFields.loginMethod = user.loginMethod;
      if (user.role !== undefined) updateFields.role = user.role;
      
      await db.update(users).set(updateFields).where(eq(users.openId, user.openId));
    } else {
      // Novo usuário, inserir
      const insertValues: InsertUser = {
        openId: user.openId,
        name: user.name || null,
        email: user.email || null,
        loginMethod: user.loginMethod || null,
        lastSignedIn: now,
        createdAt: now,
        updatedAt: now,
        role: user.role || (user.openId === ENV.ownerOpenId ? 'admin' : null),
      };
      
      await db.insert(users).values(insertValues);
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Asset helpers
export async function getAssetByTicker(ticker: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(assets)
    .where(eq(assets.ticker, ticker.toUpperCase()))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAssetById(assetId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(assets)
    .where(eq(assets.id, assetId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function searchAssets(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const searchTerm = `%${query.toUpperCase()}%`;
  
  const result = await db
    .select()
    .from(assets)
    .where(
      sql`UPPER(${assets.ticker}) LIKE ${searchTerm} OR UPPER(${assets.name}) LIKE ${searchTerm}`
    )
    .limit(limit);

  return result;
}

// Holdings helpers
export async function getUserHoldings(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      holding: holdings,
      asset: assets,
    })
    .from(holdings)
    .innerJoin(assets, eq(holdings.assetId, assets.id))
    .where(eq(holdings.userId, userId));

  return result;
}

export async function getHoldingById(holdingId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select({
      holding: holdings,
      asset: assets,
    })
    .from(holdings)
    .innerJoin(assets, eq(holdings.assetId, assets.id))
    .where(eq(holdings.id, holdingId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserHoldingByAsset(userId: number, assetId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(holdings)
    .where(and(eq(holdings.userId, userId), eq(holdings.assetId, assetId)))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createOrUpdateHolding(data: InsertHolding) {
  const db = await getDb();
  if (!db) return undefined;

  const existing = await getUserHoldingByAsset(data.userId, data.assetId);
  
  if (existing) {
    const updateData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );
    if (Object.keys(updateData).length > 0) {
      await db
        .update(holdings)
        .set(updateData)
        .where(eq(holdings.id, existing.id));
    }
    return existing.id;
  } else {
    const result = await db.insert(holdings).values(data);
    return result[0]?.insertId;
  }
}

// Transaction helpers
export async function getHoldingTransactions(holdingId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(transactions)
    .where(eq(transactions.holdingId, holdingId))
    .orderBy(desc(transactions.transactionDate));

  return result;
}

export async function getUserTransactions(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      transaction: transactions,
      asset: assets,
    })
    .from(transactions)
    .innerJoin(assets, eq(transactions.assetId, assets.id))
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.transactionDate))
    .limit(limit);

  return result;
}

export async function createTransaction(data: InsertTransaction) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(transactions).values(data);
  return result[0]?.insertId;
}

// Dividend helpers
export async function getHoldingDividends(holdingId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(dividends)
    .where(eq(dividends.holdingId, holdingId))
    .orderBy(desc(dividends.paymentDate));

  return result;
}

export async function getUserDividends(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select({
      dividend: dividends,
      asset: assets,
    })
    .from(dividends)
    .innerJoin(assets, eq(dividends.assetId, assets.id))
    .where(eq(dividends.userId, userId))
    .orderBy(desc(dividends.paymentDate))
    .limit(limit);

  return result;
}

export async function createDividend(data: InsertDividend) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(dividends).values(data);
  return result[0]?.insertId;
}

export async function getUserDividendsSummary(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, byType: {} };

  const result = await db
    .select({
      type: dividends.type,
      total: sql<number>`SUM(CAST(${dividends.amount} AS DECIMAL(18,2)))`,
    })
    .from(dividends)
    .where(eq(dividends.userId, userId))
    .groupBy(dividends.type);

  const byType: Record<string, number> = {};
  let total = 0;

  result.forEach(row => {
    const amount = Number(row.total) || 0;
    byType[row.type] = amount;
    total += amount;
  });

  return { total, byType };
}

// Financial Goals helpers
export async function getUserGoals(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(financialGoals)
    .where(eq(financialGoals.userId, userId))
    .orderBy(desc(financialGoals.createdAt));

  return result;
}

export async function createGoal(data: InsertFinancialGoal) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(financialGoals).values(data);
  return result[0]?.insertId;
}

export async function updateGoal(goalId: number, data: Partial<InsertFinancialGoal>) {
  const db = await getDb();
  if (!db) return undefined;

  const updateData = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  );
  if (Object.keys(updateData).length > 0) {
    await db
      .update(financialGoals)
      .set(updateData)
      .where(eq(financialGoals.id, goalId));
  }

  return goalId;
}

// Portfolio Snapshot helpers
export async function createPortfolioSnapshot(data: InsertPortfolioSnapshot) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(portfolioSnapshots).values(data);
  return result[0]?.insertId;
}

export async function getUserPortfolioHistory(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select()
    .from(portfolioSnapshots)
    .where(
      and(
        eq(portfolioSnapshots.userId, userId),
        gte(portfolioSnapshots.snapshotDate, startDate)
      )
    )
    .orderBy(desc(portfolioSnapshots.snapshotDate));

  return result;
}

// Price History helpers
export async function createPriceHistory(data: InsertPriceHistory) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.insert(priceHistory).values(data);
  return result[0]?.insertId;
}

export async function getAssetPriceHistory(assetId: number, days: number = 30) {
  const db = await getDb();
  if (!db) return [];

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const result = await db
    .select()
    .from(priceHistory)
    .where(
      and(
        eq(priceHistory.assetId, assetId),
        gte(priceHistory.recordedAt, startDate)
      )
    )
    .orderBy(desc(priceHistory.recordedAt));

  return result;
}

// Asset Type helpers
export async function getAssetTypes() {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(assetTypes);
  return result;
}

// Segment helpers
export async function getSegments() {
  const db = await getDb();
  if (!db) return [];

  const result = await db.select().from(segments);
  return result;
}
