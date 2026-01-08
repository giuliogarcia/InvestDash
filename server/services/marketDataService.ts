import axios from 'axios';

/**
 * Market Data Service
 * Integrates with external APIs to fetch financial data
 */

// API Configuration
const BRAPI_BASE_URL = 'https://brapi.dev/api';
const HG_FINANCE_BASE_URL = 'https://api.hgbrasil.com/finance';

interface StockQuote {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  high: number;
  low: number;
}

interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

/**
 * Fetch stock quote from Brapi
 */
export async function fetchStockQuote(ticker: string): Promise<StockQuote | null> {
  try {
    const response = await axios.get(`${BRAPI_BASE_URL}/quote/${ticker}`);
    
    if (response.data && response.data.results && response.data.results.length > 0) {
      const stock = response.data.results[0];
      return {
        ticker: stock.symbol,
        name: stock.longName || stock.shortName,
        price: stock.regularMarketPrice,
        change: stock.regularMarketChange,
        changePercent: stock.regularMarketChangePercent,
        volume: stock.regularMarketVolume,
        marketCap: stock.marketCap,
        high: stock.regularMarketDayHigh,
        low: stock.regularMarketDayLow,
      };
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching quote for ${ticker}:`, error);
    return null;
  }
}

/**
 * Fetch multiple stock quotes
 */
export async function fetchMultipleQuotes(tickers: string[]): Promise<StockQuote[]> {
  try {
    const tickersString = tickers.join(',');
    const response = await axios.get(`${BRAPI_BASE_URL}/quote/${tickersString}`);
    
    if (response.data && response.data.results) {
      return response.data.results.map((stock: any) => ({
        ticker: stock.symbol,
        name: stock.longName || stock.shortName,
        price: stock.regularMarketPrice,
        change: stock.regularMarketChange,
        changePercent: stock.regularMarketChangePercent,
        volume: stock.regularMarketVolume,
        marketCap: stock.marketCap,
        high: stock.regularMarketDayHigh,
        low: stock.regularMarketDayLow,
      }));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching multiple quotes:', error);
    return [];
  }
}

/**
 * Fetch market indices (Ibovespa, IFIX, etc)
 */
export async function fetchMarketIndices(): Promise<Record<string, MarketIndex>> {
  try {
    // Fetch from HG Finance API
    const response = await axios.get(`${HG_FINANCE_BASE_URL}`);
    
    if (response.data && response.data.results) {
      const results = response.data.results;
      
      return {
        IBOV: {
          name: 'Ibovespa',
          value: results.stocks?.IBOVESPA?.points || 0,
          change: results.stocks?.IBOVESPA?.variation || 0,
          changePercent: results.stocks?.IBOVESPA?.variation || 0,
        },
        USD: {
          name: 'Dólar',
          value: results.currencies?.USD?.buy || 0,
          change: results.currencies?.USD?.variation || 0,
          changePercent: results.currencies?.USD?.variation || 0,
        },
        EUR: {
          name: 'Euro',
          value: results.currencies?.EUR?.buy || 0,
          change: results.currencies?.EUR?.variation || 0,
          changePercent: results.currencies?.EUR?.variation || 0,
        },
        BTC: {
          name: 'Bitcoin',
          value: results.bitcoin?.mercadobitcoin?.last || 0,
          change: 0,
          changePercent: results.bitcoin?.mercadobitcoin?.variation || 0,
        },
      };
    }
    
    return {};
  } catch (error) {
    console.error('Error fetching market indices:', error);
    return {};
  }
}

/**
 * Fetch price history for a stock
 */
export async function fetchPriceHistory(
  ticker: string,
  range: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' | 'max' = '1mo'
): Promise<any[]> {
  try {
    const response = await axios.get(
      `${BRAPI_BASE_URL}/quote/${ticker}?range=${range}&interval=1d`
    );
    
    if (response.data && response.data.results && response.data.results.length > 0) {
      const stock = response.data.results[0];
      return stock.historicalDataPrice || [];
    }
    
    return [];
  } catch (error) {
    console.error(`Error fetching price history for ${ticker}:`, error);
    return [];
  }
}

/**
 * Fetch fundamental data for a stock
 */
export async function fetchFundamentalData(ticker: string): Promise<any | null> {
  try {
    const response = await axios.get(`${BRAPI_BASE_URL}/quote/${ticker}?fundamental=true`);
    
    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching fundamental data for ${ticker}:`, error);
    return null;
  }
}

/**
 * Search for stocks by name or ticker
 */
export async function searchStocks(query: string): Promise<any[]> {
  try {
    const response = await axios.get(`${BRAPI_BASE_URL}/quote/list?search=${query}`);
    
    if (response.data && response.data.stocks) {
      return response.data.stocks;
    }
    
    return [];
  } catch (error) {
    console.error('Error searching stocks:', error);
    return [];
  }
}

/**
 * Fetch available stocks list
 */
export async function fetchAvailableStocks(): Promise<any[]> {
  try {
    const response = await axios.get(`${BRAPI_BASE_URL}/quote/list`);
    
    if (response.data && response.data.stocks) {
      return response.data.stocks;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching available stocks:', error);
    return [];
  }
}

/**
 * Fetch dividend history for a stock
 */
export async function fetchDividendHistory(ticker: string): Promise<any[]> {
  try {
    // Note: This would need a specific API endpoint
    // For now, return empty array
    return [];
  } catch (error) {
    console.error(`Error fetching dividend history for ${ticker}:`, error);
    return [];
  }
}

/**
 * Fetch FII data
 */
export async function fetchFIIData(ticker: string): Promise<any | null> {
  try {
    const response = await axios.get(`${BRAPI_BASE_URL}/quote/${ticker}`);
    
    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results[0];
    }
    
    return null;
  } catch (error) {
    console.error(`Error fetching FII data for ${ticker}:`, error);
    return null;
  }
}

/**
 * Batch update prices for multiple assets
 */
export async function batchUpdatePrices(tickers: string[]): Promise<Map<string, number>> {
  const priceMap = new Map<string, number>();
  
  try {
    const quotes = await fetchMultipleQuotes(tickers);
    
    quotes.forEach(quote => {
      priceMap.set(quote.ticker, quote.price);
    });
    
    return priceMap;
  } catch (error) {
    console.error('Error batch updating prices:', error);
    return priceMap;
  }
}

/**
 * Get market status (open/closed)
 */
export async function getMarketStatus(): Promise<{
  isOpen: boolean;
  nextOpen?: Date;
  nextClose?: Date;
}> {
  try {
    // Check if market is open (9:00 - 18:00 BRT on weekdays)
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    const isWeekday = day >= 1 && day <= 5;
    const isDuringMarketHours = hour >= 9 && hour < 18;
    
    return {
      isOpen: isWeekday && isDuringMarketHours,
    };
  } catch (error) {
    console.error('Error getting market status:', error);
    return { isOpen: false };
  }
}

export default {
  fetchStockQuote,
  fetchMultipleQuotes,
  fetchMarketIndices,
  fetchPriceHistory,
  fetchFundamentalData,
  searchStocks,
  fetchAvailableStocks,
  fetchDividendHistory,
  fetchFIIData,
  batchUpdatePrices,
  getMarketStatus,
};
