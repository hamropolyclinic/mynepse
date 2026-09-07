import express from 'express';
import { Nepse } from '@rumess/nepse-api';
import { GoogleGenAI } from '@google/genai';
import { SHAREBAZAAR_DIVIDENDS, getShareBazaarDividend } from '../src/data/sharebazaarDividendData';

const app = express();
const nepseClient = new Nepse();

// Gemini client initialization
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// In-memory runtime cache for serverless invocation reuse
let cachedCompanies: any[] = [];
let lastCompaniesFetch = 0;
let cachedIndices: any = null;
let lastIndicesFetch = 0;
let cachedAllStocksData: any = null;
let lastAllStocksFetch = 0;
const stockDetailsCache = new Map<string, { data: any; timestamp: number }>();
const stockHistoryCache = new Map<string, { data: any[]; timestamp: number }>();

app.use(express.json());

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), provider: 'NEPSE API Live Engine' });
});

// Helper wrapper to safely call promise-based functions with a strict timeout
async function safeApiCall<T>(promiseCall: Promise<T>, fallbackValue: T, timeoutMs = 4000): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => resolve(fallbackValue), timeoutMs);
  });

  try {
    const result = await Promise.race([promiseCall, timeoutPromise]);
    clearTimeout(timeoutId!);
    return result ?? fallbackValue;
  } catch (error) {
    clearTimeout(timeoutId!);
    return fallbackValue;
  }
}

// API: Pull historical OHLC candles
app.get('/api/nepse/history/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const now = Date.now();

  const cached = stockHistoryCache.get(symbol);
  if (cached && now - cached.timestamp < 60000) {
    return res.json({ success: true, symbol, data: cached.data, count: cached.data.length, source: 'cache' });
  }

  try {
    const fetchHistory = async () => {
      const symbolMap = await nepseClient.getSecuritySymbolIdKeymap();
      const secId = symbolMap.get(symbol);
      if (!secId) return [];

      const historyVal: any = await nepseClient.requestGETAPI(`/api/nots/market/security/price/${secId}?size=250&page=0`);
      const rawList: any[] = historyVal?.content || [];
      
      return rawList.map((item: any) => {
        const dateStr = item.businessDate ? item.businessDate.split('T')[0] : '';
        const close = Number(item.closePrice || item.lastTradedPrice || 0);
        return {
          date: dateStr,
          timestamp: new Date(dateStr).getTime(),
          open: Number(item.openPrice || close),
          high: Number(item.highPrice || close),
          low: Number(item.lowPrice || close),
          close,
          volume: Number(item.totalTradedQuantity || 0),
          turnover: Number(item.totalTradedValue || 0),
          trades: Number(item.totalTrades || 0),
        };
      }).filter((item) => item.close > 0 && item.date);
    };

    const historyData = await safeApiCall(fetchHistory(), [], 4500);

    if (historyData.length > 0) {
      stockHistoryCache.set(symbol, { data: historyData, timestamp: now });
      return res.json({ success: true, symbol, data: historyData, count: historyData.length, source: 'live_nepse_api' });
    }

    res.json({ success: true, symbol, data: [], count: 0, source: 'empty_fallback' });
  } catch (error: any) {
    res.json({ success: true, symbol, data: [], count: 0, error: error.message, source: 'error_fallback' });
  }
});

// API: Pull all listed companies
app.get('/api/nepse/companies', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedCompanies.length > 0 && now - lastCompaniesFetch < 300000) {
      return res.json({ success: true, count: cachedCompanies.length, data: cachedCompanies, source: 'cache' });
    }

    const list = await safeApiCall(nepseClient.getCompanyList(), [], 4000);
    if (list && list.length > 0) {
      cachedCompanies = list;
      lastCompaniesFetch = now;
      return res.json({ success: true, count: list.length, data: list, source: 'live_nepse_api' });
    }
    res.json({ success: true, count: cachedCompanies.length, data: cachedCompanies, source: 'cache_fallback' });
  } catch (error: any) {
    res.json({ success: true, count: cachedCompanies.length, data: cachedCompanies, source: 'error_fallback' });
  }
});

// API: Pull live NEPSE indices
app.get('/api/nepse/indices', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedIndices && now - lastIndicesFetch < 60000) {
      return res.json({ success: true, data: cachedIndices, source: 'cache' });
    }

    const mainIndices = await safeApiCall(nepseClient.getNepseIndex(), [], 3000);
    const subIndices = await safeApiCall(nepseClient.getNepseSubIndices(), [], 3000);

    const result = { main: mainIndices, sub: subIndices, summary: null };
    cachedIndices = result;
    lastIndicesFetch = now;

    res.json({ success: true, data: result, source: 'live_nepse_api' });
  } catch (error: any) {
    res.json({ success: true, data: cachedIndices || { main: [], sub: [], summary: null }, source: 'error_fallback' });
  }
});

// API: Pull market summary
app.get('/api/nepse/summary', async (req, res) => {
  try {
    const summary = await safeApiCall(nepseClient.getMarketSummary(), null, 3500);
    res.json({ success: true, data: summary, source: 'live_nepse_api' });
  } catch (error: any) {
    res.json({ success: true, data: null, source: 'error_fallback' });
  }
});

// API: Pull single security details
app.get('/api/nepse/security/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const now = Date.now();

  const cached = stockDetailsCache.get(symbol);
  if (cached && now - cached.timestamp < 30000) {
    return res.json({ success: true, symbol, data: cached.data, source: 'cache' });
  }

  try {
    const details = await safeApiCall(nepseClient.getSecurityDetails(symbol), null, 3500);
    if (details) {
      stockDetailsCache.set(symbol, { data: details, timestamp: now });
      return res.json({ success: true, symbol, data: details, source: 'live_nepse_api' });
    }
    res.json({ success: true, symbol, data: null, source: 'empty_fallback' });
  } catch (error: any) {
    res.json({ success: true, symbol, data: null, error: error.message, source: 'error_fallback' });
  }
});

// API: News report endpoint route handling
app.get('/api/news/reports/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  res.json({
    success: true,
    symbol,
    reports: [],
    sentiment: { score: 0, status: 'NEUTRAL' },
    source: 'fallback_engine'
  });
});

// API: Live price feeds with timeout wrapper
app.get('/api/nepse/live-prices', async (req, res) => {
  try {
    const fetchPrices = async () => {
      const gainers = await nepseClient.getTopTenGainers();
      const losers = await nepseClient.getTopTenLosers();
      return [...(gainers || []), ...(losers || [])];
    };

    const liveData = await safeApiCall(fetchPrices(), [], 4000);
    
    res.json({
      success: true,
      stats: { totalStocks: liveData.length, timestamp: new Date().toISOString() },
      data: liveData,
      count: liveData.length,
      source: 'live_nepse_api',
    });
  } catch (error: any) {
    res.json({ success: true, stats: {}, data: [], count: 0, source: 'error_fallback' });
  }
});

// Global Express Error Handler to prevent Vercel 500 HTML response pages
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(200).json({
    success: false,
    error: err.message || 'Internal API Warning',
    source: 'error_boundary_fallback',
  });
});

export default app;
