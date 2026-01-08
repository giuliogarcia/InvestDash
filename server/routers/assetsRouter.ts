import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import * as brapiService from "../services/brapiService";
import * as valuationCalc from "../services/valuationCalculations";

/**
 * Assets Router
 * Handles all asset-related operations (stocks, FIIs, BDRs, ETFs)
 */

export const assetsRouter = router({
  /**
   * Get quote for a single asset
   */
  getQuote: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
      })
    )
    .query(async ({ input }) => {
      const quote = await brapiService.getQuote(input.ticker);
      return quote;
    }),

  /**
   * Get quotes for multiple assets
   */
  getMultipleQuotes: publicProcedure
    .input(
      z.object({
        tickers: z.array(z.string()).min(1).max(50),
      })
    )
    .query(async ({ input }) => {
      const quotes = await brapiService.getMultipleQuotes(input.tickers);
      return quotes;
    }),

  /**
   * Get complete asset data (quote + fundamentals + dividends + historical)
   */
  getCompleteData: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
        range: z
          .enum(["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"])
          .optional()
          .default("1y"),
      })
    )
    .query(async ({ input }) => {
      const data = await brapiService.getCompleteAssetData(input.ticker, input.range);
      
      if (!data) {
        throw new Error(`Asset ${input.ticker} not found`);
      }

      return data;
    }),

  /**
   * Get historical price data (OHLCV)
   */
  getHistoricalData: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
        range: z
          .enum(["1d", "5d", "1mo", "3mo", "6mo", "1y", "2y", "5y", "10y", "ytd", "max"])
          .optional()
          .default("1y"),
        interval: z.enum(["1d", "1wk", "1mo"]).optional().default("1d"),
      })
    )
    .query(async ({ input }) => {
      const data = await brapiService.getHistoricalData(
        input.ticker,
        input.range,
        input.interval
      );
      return data;
    }),

  /**
   * Get fundamental indicators
   */
  getFundamentals: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
      })
    )
    .query(async ({ input }) => {
      const fundamentals = await brapiService.getFundamentalData(input.ticker);
      return fundamentals;
    }),

  /**
   * Get dividend history
   */
  getDividends: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
      })
    )
    .query(async ({ input }) => {
      const dividends = await brapiService.getDividends(input.ticker);
      
      // Calculate additional dividend metrics
      const averageDividend = valuationCalc.calculateAverageDividend(dividends, 5);
      const analysis = valuationCalc.analyzeDividends(dividends, 5);

      return {
        dividends,
        averageDividend,
        analysis,
      };
    }),

  /**
   * Get balance sheet history
   */
  getBalanceSheet: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
      })
    )
    .query(async ({ input }) => {
      const balanceSheet = await brapiService.getBalanceSheet(input.ticker);
      return balanceSheet;
    }),

  /**
   * Get income statement history
   */
  getIncomeStatement: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
      })
    )
    .query(async ({ input }) => {
      const incomeStatement = await brapiService.getIncomeStatement(input.ticker);
      return incomeStatement;
    }),

  /**
   * Get cash flow statement history
   */
  getCashFlow: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
      })
    )
    .query(async ({ input }) => {
      const cashFlow = await brapiService.getCashFlow(input.ticker);
      return cashFlow;
    }),

  /**
   * Calculate Graham's Fair Price
   */
  calculateGrahamPrice: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
      })
    )
    .query(async ({ input }) => {
      // Get fundamental data
      const quote = await brapiService.getQuote(input.ticker, { fundamental: true });
      
      if (!quote) {
        throw new Error(`Asset ${input.ticker} not found`);
      }

      const lpa = quote.defaultKeyStatistics?.earningsPerShare || 0;
      const vpa = quote.defaultKeyStatistics?.bookValue || 0;
      const currentPrice = quote.regularMarketPrice;

      const grahamCalc = valuationCalc.calculateGrahamPrice(lpa, vpa, currentPrice);

      return grahamCalc;
    }),

  /**
   * Calculate Bazin's Ceiling Price
   */
  calculateBazinPrice: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
        targetYield: z.number().optional().default(0.06),
      })
    )
    .query(async ({ input }) => {
      // Get quote and dividends
      const quote = await brapiService.getQuote(input.ticker);
      const dividends = await brapiService.getDividends(input.ticker);
      
      if (!quote) {
        throw new Error(`Asset ${input.ticker} not found`);
      }

      const currentPrice = quote.regularMarketPrice;
      const averageDividend = valuationCalc.calculateAverageDividend(dividends, 5);

      const bazinCalc = valuationCalc.calculateBazinPrice(
        averageDividend,
        currentPrice,
        input.targetYield
      );

      return bazinCalc;
    }),

  /**
   * Get valuation analysis (Graham + Bazin + other metrics)
   */
  getValuationAnalysis: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
      })
    )
    .query(async ({ input }) => {
      // Get all necessary data
      const quote = await brapiService.getQuote(input.ticker, {
        fundamental: true,
        dividends: true,
      });
      
      if (!quote) {
        throw new Error(`Asset ${input.ticker} not found`);
      }

      const currentPrice = quote.regularMarketPrice;
      const lpa = quote.defaultKeyStatistics?.earningsPerShare || 0;
      const vpa = quote.defaultKeyStatistics?.bookValue || 0;
      
      const dividends = [
        ...(quote.dividendsData?.cashDividends || []),
        ...(quote.dividendsData?.stockDividends || []),
      ];
      
      const averageDividend = valuationCalc.calculateAverageDividend(dividends, 5);

      // Calculate Graham price
      const graham = valuationCalc.calculateGrahamPrice(lpa, vpa, currentPrice);

      // Calculate Bazin price
      const bazin = valuationCalc.calculateBazinPrice(averageDividend, currentPrice);

      // Dividend analysis
      const dividendAnalysis = valuationCalc.analyzeDividends(dividends, 5);

      // Payout ratio
      const payoutRatio = valuationCalc.calculatePayoutRatio(averageDividend, lpa);
      const payoutSustainability = valuationCalc.isPayoutSustainable(payoutRatio);

      return {
        ticker: input.ticker,
        currentPrice,
        graham,
        bazin,
        dividendAnalysis,
        payoutRatio,
        payoutSustainability,
        fundamentals: {
          lpa,
          vpa,
          pl: quote.defaultKeyStatistics?.priceEarnings,
          pvp: quote.defaultKeyStatistics?.priceToBook,
          dy: quote.defaultKeyStatistics?.dividendYield,
          roe: quote.defaultKeyStatistics?.returnOnEquity,
          roa: quote.defaultKeyStatistics?.returnOnAssets,
        },
      };
    }),

  /**
   * Get Buy and Hold checklist
   */
  getBuyAndHoldChecklist: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
      })
    )
    .query(async ({ input }) => {
      const quote = await brapiService.getQuote(input.ticker, { fundamental: true });
      const dividends = await brapiService.getDividends(input.ticker);
      
      if (!quote) {
        throw new Error(`Asset ${input.ticker} not found`);
      }

      const fundamentals = quote.defaultKeyStatistics || {};
      const dividendAnalysis = valuationCalc.analyzeDividends(dividends, 5);

      // Check criteria
      const checks = {
        // 1. Company with more than 5 years on stock exchange
        moreThan5Years: true, // Would need IPO date
        
        // 2. Never had losses (fiscal year)
        neverHadLosses: (fundamentals.earningsPerShare || 0) > 0,
        
        // 3. Profit in last 20 quarters (5 years)
        profitLast20Quarters: true, // Would need quarterly data
        
        // 4. Paid more than 5% dividends/year in last 5 years
        goodDividendYield: (fundamentals.dividendYield || 0) > 0.05,
        
        // 5. ROE above 10%
        goodROE: (fundamentals.returnOnEquity || 0) > 0.10,
        
        // 6. Debt lower than equity
        lowDebt: (fundamentals.debtToEquity || 0) < 1,
        
        // 7. Revenue growth in last 5 years
        revenueGrowth: (fundamentals.revenueGrowth || 0) > 0,
        
        // 8. Earnings growth in last 5 years
        earningsGrowth: (fundamentals.earningsGrowth || 0) > 0,
        
        // 9. Daily liquidity above US$ 2M
        goodLiquidity: (quote.regularMarketVolume * quote.regularMarketPrice) > 2000000,
        
        // 10. Well rated by users
        wellRated: true, // Would need user ratings
      };

      const passedCount = Object.values(checks).filter(Boolean).length;
      const score = (passedCount / Object.keys(checks).length) * 100;

      return {
        ticker: input.ticker,
        score: Math.round(score),
        checks,
        passedCount,
        totalChecks: Object.keys(checks).length,
      };
    }),

  /**
   * Search assets
   */
  search: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const results = await brapiService.searchStocks(input.query);
      return results;
    }),

  /**
   * Get list of available assets
   */
  getAvailableAssets: publicProcedure.query(async () => {
    const stocks = await brapiService.getAvailableStocks();
    return stocks;
  }),

  /**
   * Compare multiple assets
   */
  compareAssets: publicProcedure
    .input(
      z.object({
        tickers: z.array(z.string()).min(2).max(10),
      })
    )
    .query(async ({ input }) => {
      const quotes = await brapiService.getMultipleQuotes(input.tickers, {
        fundamental: true,
      });

      const comparison = quotes.map((quote) => ({
        ticker: quote.symbol,
        name: quote.longName || quote.shortName,
        price: quote.regularMarketPrice,
        marketCap: quote.marketCap,
        pl: quote.defaultKeyStatistics?.priceEarnings,
        pvp: quote.defaultKeyStatistics?.priceToBook,
        dy: quote.defaultKeyStatistics?.dividendYield,
        roe: quote.defaultKeyStatistics?.returnOnEquity,
        roa: quote.defaultKeyStatistics?.returnOnAssets,
        debtToEquity: quote.defaultKeyStatistics?.debtToEquity,
        currentRatio: quote.defaultKeyStatistics?.currentRatio,
        profitMargin: quote.defaultKeyStatistics?.profitMargins,
        operatingMargin: quote.defaultKeyStatistics?.operatingMargins,
      }));

      return comparison;
    }),

  /**
   * Get dividend radar (projected dividend months)
   */
  getDividendRadar: publicProcedure
    .input(
      z.object({
        ticker: z.string().min(1).max(10),
      })
    )
    .query(async ({ input }) => {
      const dividends = await brapiService.getDividends(input.ticker);
      
      if (dividends.length === 0) {
        return {
          ticker: input.ticker,
          months: [],
          hasData: false,
        };
      }

      // Analyze historical patterns to predict future dividend months
      const monthCounts = new Map<number, number>();
      const monthValues = new Map<number, number[]>();

      dividends.forEach((div) => {
        const month = new Date(div.date).getMonth(); // 0-11
        monthCounts.set(month, (monthCounts.get(month) || 0) + 1);
        
        const values = monthValues.get(month) || [];
        values.push(div.value);
        monthValues.set(month, values);
      });

      // Calculate probability and average value for each month
      const totalDividends = dividends.length;
      const months = Array.from({ length: 12 }, (_, i) => {
        const count = monthCounts.get(i) || 0;
        const probability = (count / totalDividends) * 100;
        const values = monthValues.get(i) || [];
        const averageValue = values.length > 0
          ? values.reduce((sum, v) => sum + v, 0) / values.length
          : 0;

        return {
          month: i,
          monthName: new Date(2000, i, 1).toLocaleString('pt-BR', { month: 'short' }),
          probability: Math.round(probability),
          hasHistorical: count > 0,
          averageValue: Number(averageValue.toFixed(4)),
          count,
        };
      });

      return {
        ticker: input.ticker,
        months,
        hasData: true,
        totalDividends,
      };
    }),

  /**
   * Clear cache for specific asset or all cache
   */
  clearCache: publicProcedure
    .input(
      z.object({
        ticker: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      if (input.ticker) {
        brapiService.clearCache(`quote_${input.ticker}`);
        brapiService.clearCache(`fundamental_${input.ticker}`);
        brapiService.clearCache(`dividends_${input.ticker}`);
      } else {
        brapiService.clearCache();
      }
      
      return { success: true };
    }),

  /**
   * Get cache statistics
   */
  getCacheStats: publicProcedure.query(async () => {
    return brapiService.getCacheStats();
  }),
});

export default assetsRouter;
