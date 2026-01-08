import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getUserHoldings,
  getUserTransactions,
  getUserDividends,
  getUserDividendsSummary,
  getUserGoals,
  getAssetByTicker,
  getAssetById,
  searchAssets,
  getHoldingById,
  getUserHoldingByAsset,
  createOrUpdateHolding,
  createTransaction,
  createDividend,
  createGoal,
  updateGoal,
  createPortfolioSnapshot,
  getUserPortfolioHistory,
  getAssetTypes,
  getSegments,
  getHoldingTransactions,
  getHoldingDividends,
  getAssetPriceHistory,
} from "./db";
import { TRPCError } from "@trpc/server";
import { assetsRouter } from "./routers/assetsRouter";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Portfolio/Holdings procedures
  portfolio: router({
    getHoldings: protectedProcedure.query(async ({ ctx }) => {
      const holdings = await getUserHoldings(ctx.user.id);
      return holdings.map(h => ({
        id: h.holding.id,
        assetId: h.holding.assetId,
        ticker: h.asset.ticker,
        assetName: h.asset.name,
        assetType: h.asset.assetTypeId,
        quantity: h.holding.quantity,
        averageBuyPrice: h.holding.averageBuyPrice,
        totalInvested: h.holding.totalInvested,
        currentValue: h.holding.currentValue,
        currentPrice: h.asset.currentPrice,
        gain: h.holding.gain,
        gainPercentage: h.holding.gainPercentage,
        updatedAt: h.holding.updatedAt,
      }));
    }),

    getSummary: protectedProcedure.query(async ({ ctx }) => {
      const holdings = await getUserHoldings(ctx.user.id);
      
      let totalInvested = 0;
      let totalValue = 0;
      const byType: Record<number, { invested: number; value: number }> = {};

      holdings.forEach(h => {
        const invested = Number(h.holding.totalInvested);
        const value = Number(h.holding.currentValue);
        
        totalInvested += invested;
        totalValue += value;

        const typeId = h.asset.assetTypeId;
        if (!byType[typeId]) {
          byType[typeId] = { invested: 0, value: 0 };
        }
        byType[typeId].invested += invested;
        byType[typeId].value += value;
      });

      const totalGain = totalValue - totalInvested;
      const gainPercentage = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

      return {
        totalInvested,
        totalValue,
        totalGain,
        gainPercentage,
        byType,
        holdingCount: holdings.length,
      };
    }),

    addHolding: protectedProcedure
      .input(z.object({
        ticker: z.string(),
        quantity: z.string(),
        averageBuyPrice: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const asset = await getAssetByTicker(input.ticker);
        if (!asset) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Asset not found",
          });
        }

        const quantity = Number(input.quantity);
        const averageBuyPrice = Number(input.averageBuyPrice);
        const totalInvested = quantity * averageBuyPrice;
        const currentPrice = Number(asset.currentPrice);
        const currentValue = quantity * currentPrice;
        const gain = currentValue - totalInvested;
        const gainPercentage = totalInvested > 0 ? (gain / totalInvested) * 100 : 0;

        const holdingId = await createOrUpdateHolding({
          userId: ctx.user.id,
          assetId: asset.id,
          quantity: input.quantity,
          averageBuyPrice: input.averageBuyPrice,
          totalInvested: totalInvested.toString(),
          currentValue: currentValue.toString(),
          gain: gain.toString(),
          gainPercentage: gainPercentage.toString(),
        });

        return { success: true, holdingId };
      }),

    getHoldingDetails: protectedProcedure
      .input(z.object({ holdingId: z.number() }))
      .query(async ({ ctx, input }) => {
        const holding = await getHoldingById(input.holdingId);
        if (!holding || holding.holding.userId !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Not authorized",
          });
        }

        const transactions = await getHoldingTransactions(input.holdingId);
        const dividends = await getHoldingDividends(input.holdingId);

        return {
          holding: holding.holding,
          asset: holding.asset,
          transactions,
          dividends,
        };
      }),
  }),

  // Market data from Brapi (new comprehensive router)
  market: assetsRouter,

  // Assets procedures (legacy - keeping for backward compatibility)
  assets: router({
    search: publicProcedure
      .input(z.object({ query: z.string(), limit: z.number().optional() }))
      .query(async ({ input }) => {
        if (input.query.length < 2) {
          return [];
        }
        return await searchAssets(input.query, input.limit || 20);
      }),

    getById: publicProcedure
      .input(z.object({ assetId: z.number() }))
      .query(async ({ input }) => {
        return await getAssetById(input.assetId);
      }),

    getTypes: publicProcedure.query(async () => {
      return await getAssetTypes();
    }),

    getSegments: publicProcedure.query(async () => {
      return await getSegments();
    }),

    getPriceHistory: publicProcedure
      .input(z.object({ assetId: z.number(), days: z.number().optional() }))
      .query(async ({ input }) => {
        return await getAssetPriceHistory(input.assetId, input.days || 30);
      }),
  }),

  // Transactions procedures
  transactions: router({
    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        const transactions = await getUserTransactions(ctx.user.id, input.limit || 100);
        return transactions.map(t => ({
          id: t.transaction.id,
          ticker: t.asset.ticker,
          assetName: t.asset.name,
          type: t.transaction.type,
          quantity: t.transaction.quantity,
          unitPrice: t.transaction.unitPrice,
          totalValue: t.transaction.totalValue,
          fees: t.transaction.fees,
          transactionDate: t.transaction.transactionDate,
          notes: t.transaction.notes,
        }));
      }),

    add: protectedProcedure
      .input(z.object({
        assetId: z.number(),
        type: z.enum(["buy", "sell"]),
        quantity: z.string(),
        unitPrice: z.string(),
        transactionDate: z.date(),
        fees: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const asset = await getAssetById(input.assetId);
        if (!asset) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Asset not found",
          });
        }

        const quantity = Number(input.quantity);
        const unitPrice = Number(input.unitPrice);
        const totalValue = quantity * unitPrice;

        const transactionId = await createTransaction({
          userId: ctx.user.id,
          assetId: input.assetId,
          type: input.type,
          quantity: input.quantity,
          unitPrice: input.unitPrice,
          totalValue: totalValue.toString(),
          fees: input.fees || "0",
          transactionDate: input.transactionDate,
          notes: input.notes,
        });

        return { success: true, transactionId };
      }),
  }),

  // Dividends procedures
  dividends: router({
    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        const dividends = await getUserDividends(ctx.user.id, input.limit || 100);
        return dividends.map(d => ({
          id: d.dividend.id,
          ticker: d.asset.ticker,
          assetName: d.asset.name,
          type: d.dividend.type,
          amount: d.dividend.amount,
          perShare: d.dividend.perShare,
          paymentDate: d.dividend.paymentDate,
          notes: d.dividend.notes,
        }));
      }),

    getSummary: protectedProcedure.query(async ({ ctx }) => {
      return await getUserDividendsSummary(ctx.user.id);
    }),

    add: protectedProcedure
      .input(z.object({
        assetId: z.number(),
        holdingId: z.number().optional(),
        type: z.enum(["dividend", "jcp", "rendimento", "amortizacao"]),
        amount: z.string(),
        perShare: z.string(),
        paymentDate: z.date(),
        exDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const asset = await getAssetById(input.assetId);
        if (!asset) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Asset not found",
          });
        }

        const dividendId = await createDividend({
          userId: ctx.user.id,
          assetId: input.assetId,
          holdingId: input.holdingId,
          type: input.type,
          amount: input.amount,
          perShare: input.perShare,
          paymentDate: input.paymentDate,
          exDate: input.exDate,
          notes: input.notes,
        });

        return { success: true, dividendId };
      }),
  }),

  // Financial Goals procedures
  goals: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return await getUserGoals(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        targetAmount: z.string(),
        targetDate: z.date().optional(),
        category: z.enum(["patrimonio", "renda", "economia", "outro"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const goalId = await createGoal({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          targetAmount: input.targetAmount,
          currentAmount: "0",
          targetDate: input.targetDate,
          category: input.category,
          status: "ativo",
        });

        return { success: true, goalId };
      }),

    update: protectedProcedure
      .input(z.object({
        goalId: z.number(),
        currentAmount: z.string().optional(),
        status: z.enum(["ativo", "concluido", "cancelado"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateGoal(input.goalId, {
          currentAmount: input.currentAmount,
          status: input.status,
        });

        return { success: true };
      }),
  }),

  // Portfolio History procedures
  history: router({
    getPortfolioHistory: protectedProcedure
      .input(z.object({ days: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return await getUserPortfolioHistory(ctx.user.id, input.days || 30);
      }),

    saveSnapshot: protectedProcedure
      .input(z.object({
        totalValue: z.string(),
        totalInvested: z.string(),
        totalGain: z.string(),
        gainPercentage: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const snapshotId = await createPortfolioSnapshot({
          userId: ctx.user.id,
          totalValue: input.totalValue,
          totalInvested: input.totalInvested,
          totalGain: input.totalGain,
          gainPercentage: input.gainPercentage,
          snapshotDate: new Date(),
        });

        return { success: true, snapshotId };
      }),
  }),
});

export type AppRouter = typeof appRouter;
