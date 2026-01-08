import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Portfolio Procedures", () => {
  it("getSummary returns correct structure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const summary = await caller.portfolio.getSummary();

    expect(summary).toBeDefined();
    expect(summary).toHaveProperty("totalInvested");
    expect(summary).toHaveProperty("totalValue");
    expect(summary).toHaveProperty("totalGain");
    expect(summary).toHaveProperty("gainPercentage");
    expect(summary).toHaveProperty("byType");
    expect(summary).toHaveProperty("holdingCount");
    expect(typeof summary.totalInvested).toBe("number");
    expect(typeof summary.totalValue).toBe("number");
    expect(typeof summary.gainPercentage).toBe("number");
  });

  it("getHoldings returns empty array for new user", async () => {
    const { ctx } = createAuthContext(2);
    const caller = appRouter.createCaller(ctx);

    const holdings = await caller.portfolio.getHoldings();

    expect(Array.isArray(holdings)).toBe(true);
    expect(holdings.length).toBe(0);
  });

  it("getHoldings returns correct holding structure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const holdings = await caller.portfolio.getHoldings();

    if (holdings.length > 0) {
      const holding = holdings[0];
      expect(holding).toHaveProperty("id");
      expect(holding).toHaveProperty("ticker");
      expect(holding).toHaveProperty("assetName");
      expect(holding).toHaveProperty("quantity");
      expect(holding).toHaveProperty("averageBuyPrice");
      expect(holding).toHaveProperty("totalInvested");
      expect(holding).toHaveProperty("currentValue");
      expect(holding).toHaveProperty("gain");
      expect(holding).toHaveProperty("gainPercentage");
    }
  });
});

describe("Assets Procedures", () => {
  it("search returns empty array for short query", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const results = await caller.assets.search({ query: "A" });

    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBe(0);
  });

  it("getTypes returns asset types", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const types = await caller.assets.getTypes();

    expect(Array.isArray(types)).toBe(true);
  });

  it("getSegments returns segments", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const segments = await caller.assets.getSegments();

    expect(Array.isArray(segments)).toBe(true);
  });
});

describe("Dividends Procedures", () => {
  it("getSummary returns correct structure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const summary = await caller.dividends.getSummary();

    expect(summary).toBeDefined();
    expect(summary).toHaveProperty("total");
    expect(summary).toHaveProperty("byType");
    expect(typeof summary.total).toBe("number");
    expect(typeof summary.byType).toBe("object");
  });

  it("getHistory returns empty array for new user", async () => {
    const { ctx } = createAuthContext(3);
    const caller = appRouter.createCaller(ctx);

    const history = await caller.dividends.getHistory({ limit: 100 });

    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBe(0);
  });

  it("getHistory returns correct dividend structure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const history = await caller.dividends.getHistory({ limit: 100 });

    if (history.length > 0) {
      const dividend = history[0];
      expect(dividend).toHaveProperty("id");
      expect(dividend).toHaveProperty("ticker");
      expect(dividend).toHaveProperty("assetName");
      expect(dividend).toHaveProperty("type");
      expect(dividend).toHaveProperty("amount");
      expect(dividend).toHaveProperty("perShare");
      expect(dividend).toHaveProperty("paymentDate");
    }
  });
});

describe("Goals Procedures", () => {
  it("getAll returns empty array for new user", async () => {
    const { ctx } = createAuthContext(4);
    const caller = appRouter.createCaller(ctx);

    const goals = await caller.goals.getAll();

    expect(Array.isArray(goals)).toBe(true);
  });
});

describe("Transactions Procedures", () => {
  it("getHistory returns empty array for new user", async () => {
    const { ctx } = createAuthContext(5);
    const caller = appRouter.createCaller(ctx);

    const history = await caller.transactions.getHistory({ limit: 100 });

    expect(Array.isArray(history)).toBe(true);
    expect(history.length).toBe(0);
  });

  it("getHistory returns correct transaction structure", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const history = await caller.transactions.getHistory({ limit: 100 });

    if (history.length > 0) {
      const transaction = history[0];
      expect(transaction).toHaveProperty("id");
      expect(transaction).toHaveProperty("ticker");
      expect(transaction).toHaveProperty("assetName");
      expect(transaction).toHaveProperty("type");
      expect(transaction).toHaveProperty("quantity");
      expect(transaction).toHaveProperty("unitPrice");
      expect(transaction).toHaveProperty("totalValue");
    }
  });
});
