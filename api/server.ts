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

// Helper: Technical Analysis Summary String Generator
function generateDeterministicTechnicalText(stock: any, indicators: any): string {
  const symbol = String(stock?.symbol || 'UNKNOWN');
  const price = Number(stock?.currentPrice || indicators?.price || 0);
  const rsi = indicators?.rsi14 ?? 50;
  const ma = indicators?.ma || {};

  let bullishSignals = 0;
  let bearishSignals = 0;

  const ma50Val = ma.ema50 || ma.sma50;
  const ma200Val = ma.ema200 || ma.sma200;
  if (ma50Val && price > ma50Val) bullishSignals += 2; else if (ma50Val) bearishSignals += 2;
  if (ma200Val && price > ma200Val) bullishSignals += 2.5; else if (ma200Val) bearishSignals += 2.5;
  if (rsi < 35) bullishSignals += 2;
  else if (rsi > 70) bearishSignals += 2;
  else if (rsi >= 50) bullishSignals += 1;
  else bearishSignals += 1;

  const total = bullishSignals + bearishSignals;
  const netScore = total > 0 ? Math.round(((bullishSignals - bearishSignals) / total) * 100) : 0;
  let marketBias = 'NEUTRAL';

  if (netScore >= 40) marketBias = 'STRONG BULLISH';
  else if (netScore >= 15) marketBias = 'BULLISH';
  else if (netScore <= -40) marketBias = 'STRONG BEARISH';
  else if (netScore <= -15) marketBias = 'BEARISH';

  return `Technical Summary for ${symbol}: Trading at NPR ${price.toFixed(2)}. The overall market sentiment displays a ${marketBias} trajectory based on moving averages and an RSI value of ${Number(rsi).toFixed(1)}.`;
}

// Helper: Trajectory String Generator
function generateDeterministicTrajectoryText(stock: any): string {
  const symbol = String(stock?.symbol || 'UNKNOWN');
  const price = Number(stock?.currentPrice || 0);
  const changePct = Number(stock?.changePercent || 0);
  const direction = changePct >= 0 ? 'upward' : 'downward';

  return `Price Trajectory for ${symbol}: Currently trading at NPR ${price.toFixed(2)} with a recent ${direction} momentum shift of ${changePct.toFixed(2)}%. Near-term trajectory shows consolidation within its current support and resistance ranges.`;
}

// API: Gemini Technical Summary Route
app.post('/api/gemini/technical-summary', async (req, res) => {
  const { stock, indicators } = req.body || {};
  
  try {
    const client = getGeminiClient();
    if (!client) {
      const textSummary = generateDeterministicTechnicalText(stock, indicators);
      return res.json({ success: true, data: textSummary, text: textSummary, summary: textSummary, source: 'deterministic_fallback' });
    }

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a concise 2-sentence technical summary for NEPSE stock ${stock?.symbol || 'Symbol'} trading at NPR ${stock?.currentPrice || 0}.`,
    });

    const outputText = response.text || generateDeterministicTechnicalText(stock, indicators);
    res.json({ success: true, data: outputText, text: outputText, summary: outputText, source: 'gemini_api' });
  } catch (err: any) {
    const textSummary = generateDeterministicTechnicalText(stock, indicators);
    res.json({ success: true, data: textSummary, text: textSummary, summary: textSummary, source: 'deterministic_fallback', error: err.message });
  }
});

// API: Gemini Price Trajectory Route
app.post('/api/gemini/price-trajectory', async (req, res) => {
  const { stock, indicators } = req.body || {};

  try {
    const client = getGeminiClient();
    if (!client) {
      const textTrajectory = generateDeterministicTrajectoryText(stock);
      return res.json({ success: true, data: textTrajectory, text: textTrajectory, trajectory: textTrajectory, source: 'deterministic_fallback' });
    }

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the price trajectory forecast for NEPSE stock ${stock?.symbol || 'Symbol'} currently priced at NPR ${stock?.currentPrice || 0} in 2 sentences.`,
    });

    const outputText = response.text || generateDeterministicTrajectoryText(stock);
    res.json({ success: true, data: outputText, text: outputText, trajectory: outputText, source: 'gemini_api' });
  } catch (err: any) {
    const textTrajectory = generateDeterministicTrajectoryText(stock);
    res.json({ success: true, data: textTrajectory, text: textTrajectory, trajectory: textTrajectory, source: 'deterministic_fallback', error: err.message });
  }
});

// API: Historical OHLC candles
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

// API: Companies
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

// API: Indices
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

// API: Summary
app.get('/api/nepse/summary', async (req, res) => {
  try {
    const summary = await safeApiCall(nepseClient.getMarketSummary(), null, 3500);
    res.json({ success: true, data: summary, source: 'live_nepse_api' });
  } catch (error: any) {
    res.json({ success: true, data: null, source: 'error_fallback' });
  }
});

// API: Security details
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

// API: News reports
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

// API: Live prices
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

// Global Express Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[SERVER ERROR]', err);
  res.status(200).json({
    success: false,
    error: err.message || 'Internal API Warning',
    source: 'error_boundary_fallback',
  });
});

export default app;
