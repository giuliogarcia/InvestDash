import axios, { AxiosInstance } from 'axios';

/**
 * Brapi Service - Complete Integration
 * Provides comprehensive access to Brazilian stock market data
 */

const BRAPI_BASE_URL = 'https://brapi.dev/api';
const BRAPI_API_KEY = process.env.BRAPI_API_KEY || ''; // Set in .env

// Create axios instance with default config
const brapiClient: AxiosInstance = axios.create({
  baseURL: BRAPI_BASE_URL,
  timeout: 30000,
  headers: BRAPI_API_KEY ? {
    'Authorization': `Bearer ${BRAPI_API_KEY}`
  } : {}
});

// ==================== TYPES ====================

export interface BrapiQuote {
  symbol: string;
  shortName: string;
  longName: string;
  currency: string;
  regularMarketPrice: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketDayRange: string;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketTime: string;
  marketCap: number;
  regularMarketVolume: number;
  regularMarketPreviousClose: number;
  regularMarketOpen: number;
  averageDailyVolume10Day: number;
  averageDailyVolume3Month: number;
  fiftyTwoWeekLowChange: number;
  fiftyTwoWeekLowChangePercent: number;
  fiftyTwoWeekRange: string;
  fiftyTwoWeekHighChange: number;
  fiftyTwoWeekHighChangePercent: number;
  fiftyTwoWeekLow: number;
  fiftyTwoWeekHigh: number;
  twoHundredDayAverage: number;
  twoHundredDayAverageChange: number;
  twoHundredDayAverageChangePercent: number;
  logourl?: string;
}

export interface BrapiHistoricalData {
  date: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjustedClose: number;
}

export interface BrapiFundamentalData {
  // Valuation Ratios
  priceEarnings?: number; // P/L
  priceToBook?: number; // P/VP
  priceToSalesRatio?: number; // P/SR
  enterpriseToEbitda?: number; // EV/EBITDA
  enterpriseToRevenue?: number; // EV/Receita
  
  // Profitability
  profitMargins?: number; // Margem Líquida
  operatingMargins?: number; // Margem Operacional
  grossMargins?: number; // Margem Bruta
  ebitdaMargins?: number; // Margem EBITDA
  
  // Returns
  returnOnAssets?: number; // ROA
  returnOnEquity?: number; // ROE
  
  // Dividend Info
  dividendYield?: number; // DY
  payoutRatio?: number; // Payout
  
  // Per Share Data
  bookValue?: number; // VPA
  earningsPerShare?: number; // LPA
  
  // Debt
  debtToEquity?: number; // Dívida/Patrimônio
  currentRatio?: number; // Liquidez Corrente
  quickRatio?: number; // Liquidez Seca
  
  // Growth
  revenueGrowth?: number;
  earningsGrowth?: number;
  
  // Market Data
  beta?: number;
  
  // Company Info
  sector?: string;
  industry?: string;
  fullTimeEmployees?: number;
  website?: string;
  longBusinessSummary?: string;
}

export interface BrapiDividend {
  date: string; // Data COM
  label: string; // Tipo (Dividendo, JCP, etc)
  value: number; // Valor por ação
  paymentDate?: string; // Data de pagamento
  exDate?: string; // Data EX
}

export interface BrapiBalanceSheet {
  endDate: string;
  cash: number;
  shortTermInvestments: number;
  netReceivables: number;
  inventory: number;
  totalCurrentAssets: number;
  longTermInvestments: number;
  propertyPlantEquipment: number;
  goodWill: number;
  intangibleAssets: number;
  totalAssets: number;
  accountsPayable: number;
  shortLongTermDebt: number;
  totalCurrentLiabilities: number;
  longTermDebt: number;
  totalLiab: number;
  commonStock: number;
  retainedEarnings: number;
  totalStockholderEquity: number;
}

export interface BrapiIncomeStatement {
  endDate: string;
  totalRevenue: number;
  costOfRevenue: number;
  grossProfit: number;
  researchDevelopment: number;
  sellingGeneralAdministrative: number;
  totalOperatingExpenses: number;
  operatingIncome: number;
  interestExpense: number;
  totalOtherIncomeExpenseNet: number;
  incomeBeforeTax: number;
  incomeTaxExpense: number;
  netIncome: number;
  ebitda: number;
}

export interface BrapiCashFlow {
  endDate: string;
  totalCashFromOperatingActivities: number;
  capitalExpenditures: number;
  investments: number;
  totalCashflowsFromInvestingActivities: number;
  dividendsPaid: number;
  netBorrowings: number;
  totalCashFromFinancingActivities: number;
  changeInCash: number;
  freeCashFlow: number;
}

export interface BrapiQuoteResponse {
  results: Array<BrapiQuote & {
    historicalDataPrice?: BrapiHistoricalData[];
    summaryProfile?: {
      sector?: string;
      industry?: string;
      website?: string;
      longBusinessSummary?: string;
      fullTimeEmployees?: number;
    };
    defaultKeyStatistics?: BrapiFundamentalData;
    financialData?: BrapiFundamentalData;
    dividendsData?: {
      cashDividends?: BrapiDividend[];
      stockDividends?: BrapiDividend[];
    };
    balanceSheetHistory?: {
      balanceSheetStatements?: BrapiBalanceSheet[];
    };
    incomeStatementHistory?: {
      incomeStatementHistory?: BrapiIncomeStatement[];
    };
    cashflowStatementHistory?: {
      cashflowStatements?: BrapiCashFlow[];
    };
  }>;
  requestedAt: string;
  took: string;
}

export interface BrapiAvailableStock {
  stock: string;
  name: string;
  close: number;
  change: number;
  volume: number;
  market_cap: number;
  logo: string;
  sector: string;
  type: string;
}

// ==================== CACHE ====================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = {
  quote: 15 * 60 * 1000, // 15 minutes
  fundamental: 24 * 60 * 60 * 1000, // 24 hours
  historical: 7 * 24 * 60 * 60 * 1000, // 7 days
  dividends: 24 * 60 * 60 * 1000, // 24 hours
  list: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function getCached<T>(key: string, maxAge: number): T | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < maxAge) {
    return entry.data as T;
  }
  return null;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ==================== API FUNCTIONS ====================

/**
 * Get quote for a single stock
 */
export async function getQuote(
  ticker: string,
  options: {
    range?: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max';
    interval?: '1d' | '1wk' | '1mo';
    fundamental?: boolean;
    dividends?: boolean;
  } = {}
): Promise<BrapiQuoteResponse['results'][0] | null> {
  try {
    const cacheKey = `quote_${ticker}_${JSON.stringify(options)}`;
    const cached = getCached<BrapiQuoteResponse['results'][0]>(cacheKey, CACHE_DURATION.quote);
    if (cached) return cached;

    const params: any = {};
    if (options.range) params.range = options.range;
    if (options.interval) params.interval = options.interval;
    if (options.fundamental) params.fundamental = 'true';
    if (options.dividends) params.dividends = 'true';

    const response = await brapiClient.get<BrapiQuoteResponse>(`/quote/${ticker}`, { params });
    
    if (response.data?.results?.[0]) {
      const result = response.data.results[0];
      setCache(cacheKey, result);
      return result;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching quote for ${ticker}:`, error);
    return null;
  }
}

/**
 * Get quotes for multiple stocks
 */
export async function getMultipleQuotes(
  tickers: string[],
  options: {
    fundamental?: boolean;
    dividends?: boolean;
  } = {}
): Promise<BrapiQuoteResponse['results']> {
  try {
    const tickersString = tickers.join(',');
    const cacheKey = `quotes_${tickersString}_${JSON.stringify(options)}`;
    const cached = getCached<BrapiQuoteResponse['results']>(cacheKey, CACHE_DURATION.quote);
    if (cached) return cached;

    const params: any = {};
    if (options.fundamental) params.fundamental = 'true';
    if (options.dividends) params.dividends = 'true';

    const response = await brapiClient.get<BrapiQuoteResponse>(`/quote/${tickersString}`, { params });
    
    if (response.data?.results) {
      setCache(cacheKey, response.data.results);
      return response.data.results;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching multiple quotes:', error);
    return [];
  }
}

/**
 * Get historical price data (OHLCV)
 */
export async function getHistoricalData(
  ticker: string,
  range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max' = '1y',
  interval: '1d' | '1wk' | '1mo' = '1d'
): Promise<BrapiHistoricalData[]> {
  try {
    const cacheKey = `historical_${ticker}_${range}_${interval}`;
    const cached = getCached<BrapiHistoricalData[]>(cacheKey, CACHE_DURATION.historical);
    if (cached) return cached;

    const quote = await getQuote(ticker, { range, interval });
    
    if (quote?.historicalDataPrice) {
      setCache(cacheKey, quote.historicalDataPrice);
      return quote.historicalDataPrice;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching historical data for ${ticker}:`, error);
    return [];
  }
}

/**
 * Get fundamental data for a stock
 */
export async function getFundamentalData(ticker: string): Promise<BrapiFundamentalData | null> {
  try {
    const cacheKey = `fundamental_${ticker}`;
    const cached = getCached<BrapiFundamentalData>(cacheKey, CACHE_DURATION.fundamental);
    if (cached) return cached;

    const quote = await getQuote(ticker, { fundamental: true });
    
    if (quote) {
      const fundamentalData: BrapiFundamentalData = {
        ...quote.defaultKeyStatistics,
        ...quote.financialData,
        sector: quote.summaryProfile?.sector,
        industry: quote.summaryProfile?.industry,
        website: quote.summaryProfile?.website,
        longBusinessSummary: quote.summaryProfile?.longBusinessSummary,
        fullTimeEmployees: quote.summaryProfile?.fullTimeEmployees,
      };
      
      setCache(cacheKey, fundamentalData);
      return fundamentalData;
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching fundamental data for ${ticker}:`, error);
    return null;
  }
}

/**
 * Get dividend history for a stock
 */
export async function getDividends(ticker: string): Promise<BrapiDividend[]> {
  try {
    const cacheKey = `dividends_${ticker}`;
    const cached = getCached<BrapiDividend[]>(cacheKey, CACHE_DURATION.dividends);
    if (cached) return cached;

    const quote = await getQuote(ticker, { dividends: true });
    
    if (quote?.dividendsData) {
      const allDividends = [
        ...(quote.dividendsData.cashDividends || []),
        ...(quote.dividendsData.stockDividends || []),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setCache(cacheKey, allDividends);
      return allDividends;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching dividends for ${ticker}:`, error);
    return [];
  }
}

/**
 * Get balance sheet history
 */
export async function getBalanceSheet(ticker: string): Promise<BrapiBalanceSheet[]> {
  try {
    const cacheKey = `balance_sheet_${ticker}`;
    const cached = getCached<BrapiBalanceSheet[]>(cacheKey, CACHE_DURATION.fundamental);
    if (cached) return cached;

    const quote = await getQuote(ticker, { fundamental: true });
    
    if (quote?.balanceSheetHistory?.balanceSheetStatements) {
      const statements = quote.balanceSheetHistory.balanceSheetStatements;
      setCache(cacheKey, statements);
      return statements;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching balance sheet for ${ticker}:`, error);
    return [];
  }
}

/**
 * Get income statement history
 */
export async function getIncomeStatement(ticker: string): Promise<BrapiIncomeStatement[]> {
  try {
    const cacheKey = `income_statement_${ticker}`;
    const cached = getCached<BrapiIncomeStatement[]>(cacheKey, CACHE_DURATION.fundamental);
    if (cached) return cached;

    const quote = await getQuote(ticker, { fundamental: true });
    
    if (quote?.incomeStatementHistory?.incomeStatementHistory) {
      const statements = quote.incomeStatementHistory.incomeStatementHistory;
      setCache(cacheKey, statements);
      return statements;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching income statement for ${ticker}:`, error);
    return [];
  }
}

/**
 * Get cash flow statement history
 */
export async function getCashFlow(ticker: string): Promise<BrapiCashFlow[]> {
  try {
    const cacheKey = `cash_flow_${ticker}`;
    const cached = getCached<BrapiCashFlow[]>(cacheKey, CACHE_DURATION.fundamental);
    if (cached) return cached;

    const quote = await getQuote(ticker, { fundamental: true });
    
    if (quote?.cashflowStatementHistory?.cashflowStatements) {
      const statements = quote.cashflowStatementHistory.cashflowStatements;
      setCache(cacheKey, statements);
      return statements;
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching cash flow for ${ticker}:`, error);
    return [];
  }
}

/**
 * Get list of available stocks
 */
export async function getAvailableStocks(): Promise<BrapiAvailableStock[]> {
  try {
    const cacheKey = 'available_stocks';
    const cached = getCached<BrapiAvailableStock[]>(cacheKey, CACHE_DURATION.list);
    if (cached) return cached;

    const response = await brapiClient.get<{ stocks: BrapiAvailableStock[] }>('/quote/list');
    
    if (response.data?.stocks) {
      setCache(cacheKey, response.data.stocks);
      return response.data.stocks;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching available stocks:', error);
    return [];
  }
}

/**
 * Search stocks by name or ticker
 */
export async function searchStocks(query: string): Promise<BrapiAvailableStock[]> {
  try {
    const response = await brapiClient.get<{ stocks: BrapiAvailableStock[] }>('/quote/list', {
      params: { search: query }
    });
    
    if (response.data?.stocks) {
      return response.data.stocks;
    }
    
    return [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
}

/**
 * Get complete asset data (quote + fundamentals + dividends + historical)
 */
export async function getCompleteAssetData(
  ticker: string,
  range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | '10y' | 'ytd' | 'max' = '1y'
) {
  try {
    const quote = await getQuote(ticker, {
      range,
      interval: '1d',
      fundamental: true,
      dividends: true,
    });

    if (!quote) return null;

    return {
      quote: {
        symbol: quote.symbol,
        name: quote.longName || quote.shortName,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        volume: quote.regularMarketVolume,
        marketCap: quote.marketCap,
        high: quote.regularMarketDayHigh,
        low: quote.regularMarketDayLow,
        open: quote.regularMarketOpen,
        previousClose: quote.regularMarketPreviousClose,
        fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
        logoUrl: quote.logourl,
      },
      fundamentals: {
        ...quote.defaultKeyStatistics,
        ...quote.financialData,
      },
      dividends: [
        ...(quote.dividendsData?.cashDividends || []),
        ...(quote.dividendsData?.stockDividends || []),
      ],
      historical: quote.historicalDataPrice || [],
      company: {
        sector: quote.summaryProfile?.sector,
        industry: quote.summaryProfile?.industry,
        website: quote.summaryProfile?.website,
        description: quote.summaryProfile?.longBusinessSummary,
        employees: quote.summaryProfile?.fullTimeEmployees,
      },
      balanceSheet: quote.balanceSheetHistory?.balanceSheetStatements || [],
      incomeStatement: quote.incomeStatementHistory?.incomeStatementHistory || [],
      cashFlow: quote.cashflowStatementHistory?.cashflowStatements || [],
    };
  } catch (error) {
    console.error(`Error fetching complete asset data for ${ticker}:`, error);
    return null;
  }
}

/**
 * Clear cache for a specific key or all cache
 */
export function clearCache(key?: string): void {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: cache.size,
    keys: Array.from(cache.keys()),
  };
}

export default {
  getQuote,
  getMultipleQuotes,
  getHistoricalData,
  getFundamentalData,
  getDividends,
  getBalanceSheet,
  getIncomeStatement,
  getCashFlow,
  getAvailableStocks,
  searchStocks,
  getCompleteAssetData,
  clearCache,
  getCacheStats,
};
