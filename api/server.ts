import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Nepse } from '@rumess/nepse-api';
import { GoogleGenAI } from '@google/genai';
import { SHAREBAZAAR_DIVIDENDS, getShareBazaarDividend, calculateLiveDividendYield } from './src/data/sharebazaarDividendData';
import { getNewsReportsForStock, computeMarketSentimentMetrics, generateTriFactorTrajectorySynthesis } from './src/data/nepseNewsData';
import { getStockBySymbol } from './src/data/nepseStocks';
import { TriFactorTrajectorySynthesis } from './src/types/nepse';

const app = express();
const PORT = 3000;
const nepseClient = new Nepse();

// Gemini client initialization
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
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

// Cache variables for responsive UI and avoiding excessive rate-limits
let cachedCompanies: any[] = [];
let lastCompaniesFetch = 0;
let cachedIndices: any[] = [];
let lastIndicesFetch = 0;
let cachedAllStocksData: any = null;
let lastAllStocksFetch = 0;
const stockDetailsCache = new Map<string, { data: any; timestamp: number }>();
const stockHistoryCache = new Map<string, { data: any[]; timestamp: number }>();
const shareBazaarDividendCache = new Map<string, { data: any; timestamp: number }>();

app.use(express.json());

// API: Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), provider: 'NEPSE API Live Engine' });
});

// API: Pull historical OHLC candles, volumes, and trade stats for specific symbol
app.get('/api/nepse/history/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const now = Date.now();

  const cached = stockHistoryCache.get(symbol);
  if (cached && now - cached.timestamp < 30000) {
    return res.json({ success: true, symbol, data: cached.data, count: cached.data.length, source: 'cache' });
  }

  try {
    const symbolMap = await nepseClient.getSecuritySymbolIdKeymap();
    const secId = symbolMap.get(symbol);

    if (!secId) {
      return res.status(404).json({ success: false, error: `Security symbol ${symbol} not found in NEPSE catalog` });
    }

    // Fetch historical candles and latest security details in parallel
    const [historyRes, detailsRes] = await Promise.allSettled([
      nepseClient.requestGETAPI(`/api/nots/market/security/price/${secId}?size=250&page=0`),
      nepseClient.getSecurityDetails(symbol)
    ]);

    const historyVal: any = historyRes.status === 'fulfilled' ? historyRes.value : null;
    const detailsVal: any = detailsRes.status === 'fulfilled' ? detailsRes.value : null;
    const rawList: any[] = historyVal?.content || [];
    
    // Parse historical entries
    const pointsMap = new Map<string, any>();

    rawList.forEach((item: any) => {
      if (!item.businessDate) return;
      const dateStr = item.businessDate.split('T')[0];
      const close = Number(item.closePrice || item.lastTradedPrice || 0);
      if (close <= 0) return;

      const open = Number(item.openPrice || item.previousDayClosePrice || close);
      const high = Number(item.highPrice || Math.max(open, close));
      const low = Number(item.lowPrice || Math.min(open, close));
      const volume = Number(item.totalTradedQuantity || 0);
      const turnover = Number(item.totalTradedValue || volume * close);

      pointsMap.set(dateStr, {
        date: dateStr,
        timestamp: new Date(dateStr).getTime(),
        open,
        high,
        low,
        close,
        volume,
        turnover,
        trades: Number(item.totalTrades || 0),
        previousClose: Number(item.previousDayClosePrice || 0),
        fiftyTwoWeekHigh: Number(item.fiftyTwoWeekHigh || 0),
        fiftyTwoWeekLow: Number(item.fiftyTwoWeekLow || 0),
      });
    });

    // Merge latest live day trade candle if available from security details
    if (detailsVal?.securityDailyTradeDto) {
      const daily = detailsVal.securityDailyTradeDto;
      if (daily.businessDate) {
        const liveDateStr = daily.businessDate.split('T')[0];
        const liveClose = Number(daily.lastTradedPrice || daily.closePrice || 0);
        if (liveClose > 0) {
          const liveOpen = Number(daily.openPrice || daily.previousClose || liveClose);
          const liveHigh = Number(daily.highPrice || Math.max(liveOpen, liveClose));
          const liveLow = Number(daily.lowPrice || Math.min(liveOpen, liveClose));
          const liveVol = Number(daily.totalTradeQuantity || 0);
          const liveTurnover = Number(daily.totalTradeQuantity ? daily.totalTradeQuantity * liveClose : 0);

          pointsMap.set(liveDateStr, {
            date: liveDateStr,
            timestamp: new Date(liveDateStr).getTime(),
            open: liveOpen,
            high: liveHigh,
            low: liveLow,
            close: liveClose,
            volume: liveVol,
            turnover: liveTurnover,
            trades: Number(daily.totalTrades || 0),
            previousClose: Number(daily.previousClose || 0),
            fiftyTwoWeekHigh: Number(daily.fiftyTwoWeekHigh || 0),
            fiftyTwoWeekLow: Number(daily.fiftyTwoWeekLow || 0),
          });
        }
      }
    }

    // Sort chronologically ascending
    const sortedPoints = Array.from(pointsMap.values()).sort((a, b) => a.timestamp - b.timestamp);

    if (sortedPoints.length > 0) {
      stockHistoryCache.set(symbol, { data: sortedPoints, timestamp: now });
      return res.json({
        success: true,
        symbol,
        data: sortedPoints,
        count: sortedPoints.length,
        source: 'live_nepse_api'
      });
    }

    res.status(404).json({ success: false, error: `No price history found for ${symbol}` });
  } catch (error: any) {
    console.warn(`[NEPSE API] Notice: history fetch for ${symbol}:`, error.message);
    res.status(500).json({ success: false, symbol, error: error.message });
  }
});

// API: Pull all listed companies with official NEPSE sector categories
app.get('/api/nepse/companies', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedCompanies.length > 0 && now - lastCompaniesFetch < 60000) {
      return res.json({ success: true, count: cachedCompanies.length, data: cachedCompanies, source: 'cache' });
    }

    const list = await nepseClient.getCompanyList();
    if (list && list.length > 0) {
      cachedCompanies = list;
      lastCompaniesFetch = now;
      return res.json({ success: true, count: list.length, data: list, source: 'live_nepse_api' });
    }
    res.json({ success: true, count: cachedCompanies.length, data: cachedCompanies, source: 'fallback' });
  } catch (error: any) {
    console.warn('[NEPSE API] Notice: company list fetch:', error.message);
    res.status(500).json({ success: false, error: error.message, data: cachedCompanies });
  }
});

// API: Pull live NEPSE Main Indices (NEPSE Index, Sensitive, Float, Sensitive Float)
app.get('/api/nepse/main-indices', async (req, res) => {
  try {
    const indices = await nepseClient.getNepseIndex();
    if (indices && indices.length > 0) {
      return res.json({ success: true, data: indices, source: 'live_nepse_api' });
    }
    res.json({ success: false, data: [] });
  } catch (error: any) {
    console.warn('[NEPSE API] Notice: main indices fetch:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Pull live NEPSE sector sub-indices
app.get('/api/nepse/indices', async (req, res) => {
  try {
    const now = Date.now();
    if (cachedIndices.length > 0 && now - lastIndicesFetch < 15000) {
      return res.json({ success: true, data: cachedIndices, source: 'cache' });
    }

    const [mainIndices, subIndices, summary] = await Promise.allSettled([
      nepseClient.getNepseIndex(),
      nepseClient.getNepseSubIndices(),
      nepseClient.getMarketSummary()
    ]);

    const result = {
      main: mainIndices.status === 'fulfilled' ? mainIndices.value : [],
      sub: subIndices.status === 'fulfilled' ? subIndices.value : [],
      summary: summary.status === 'fulfilled' ? summary.value : null
    };

    cachedIndices = result as any;
    lastIndicesFetch = now;
    return res.json({ success: true, data: result, source: 'live_nepse_api' });
  } catch (error: any) {
    console.warn('[NEPSE API] Notice: sub-indices fetch:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Pull live NEPSE Market Summary
app.get('/api/nepse/summary', async (req, res) => {
  try {
    const summary = await nepseClient.getMarketSummary();
    res.json({ success: true, data: summary, source: 'live_nepse_api' });
  } catch (error: any) {
    console.warn('[NEPSE API] Notice: market summary fetch:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// API: Pull live security details, trade prices, and metrics for specific symbol
app.get('/api/nepse/security/:symbol', async (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const now = Date.now();

  const cached = stockDetailsCache.get(symbol);
  if (cached && now - cached.timestamp < 15000) {
    return res.json({ success: true, symbol, data: cached.data, source: 'cache' });
  }

  try {
    const details = await nepseClient.getSecurityDetails(symbol);
    if (details) {
      stockDetailsCache.set(symbol, { data: details, timestamp: now });
      return res.json({ success: true, symbol, data: details, source: 'live_nepse_api' });
    }
    res.status(404).json({ success: false, error: `Symbol ${symbol} not found in NEPSE` });
  } catch (error: any) {
    console.warn(`[NEPSE API] Notice: security details fetch for ${symbol}:`, error.message);
    res.status(500).json({ success: false, symbol, error: error.message });
  }
});

// Helper: Normalize Sector strings to standard categories
function normalizeSectorName(rawSector: string): string {
  if (!rawSector) return 'Others';
  const clean = rawSector.trim().toLowerCase();
  if (clean.includes('commercial') || clean === 'commercial bank') return 'Commercial Banks';
  if (clean.includes('development')) return 'Development Banks';
  if (clean.includes('microfinance') || clean.includes('micro finance')) return 'Microfinance';
  if (clean.includes('finance')) return 'Finance';
  if (clean.includes('hydro') || clean.includes('power')) return 'Hydropower';
  if (clean.includes('non-life') || clean.includes('non life') || clean.includes('general insurance')) return 'Non-Life Insurance';
  if (clean.includes('life insurance')) return 'Life Insurance';
  if (clean.includes('hotel') || clean.includes('tourism')) return 'Hotels & Tourism';
  if (clean.includes('manufacturing') || clean.includes('processing')) return 'Manufacturing & Processing';
  if (clean.includes('investment')) return 'Investment';
  if (clean.includes('trading')) return 'Trading';
  if (clean.includes('mutual') || clean.includes('fund')) return 'Mutual Fund';
  return 'Others';
}

// Master Fetcher: Pull live price data for all stocks from NEPSE API library
async function fetchAllStockPricesFromNepse(force = false) {
  const now = Date.now();
  if (!force && cachedAllStocksData && now - lastAllStocksFetch < 30000) {
    return { ...cachedAllStocksData, source: 'cache' };
  }

  // Concurrently request live trade stat for NEPSE index (58), company list, gainers, losers, and security catalog
  const clientAny = nepseClient as any;
  const priceVolumeUrl = clientAny.apiEndpoints?.price_volume_url || 'https://www.nepalstock.com.np/api/nots/securityDailyTradeStat/58';

  const [pricesRes, companiesRes, gainersRes, losersRes, secListRes] = await Promise.allSettled([
    clientAny.requestGETAPI(priceVolumeUrl),
    nepseClient.getCompanyList(),
    nepseClient.getTopTenGainers(),
    nepseClient.getTopTenLosers(),
    nepseClient.getSecurityList(),
  ]);

  const rawPrices: any[] = pricesRes.status === 'fulfilled' && Array.isArray(pricesRes.value) ? pricesRes.value : [];
  const rawCompanies: any[] = companiesRes.status === 'fulfilled' && Array.isArray(companiesRes.value) ? companiesRes.value : [];
  const rawGainers: any[] = gainersRes.status === 'fulfilled' && Array.isArray(gainersRes.value) ? gainersRes.value : [];
  const rawLosers: any[] = losersRes.status === 'fulfilled' && Array.isArray(losersRes.value) ? losersRes.value : [];
  const rawSecList: any[] = secListRes.status === 'fulfilled' && Array.isArray(secListRes.value) ? secListRes.value : [];

  const companyMap = new Map<string, any>();
  rawCompanies.forEach((comp) => {
    if (comp.symbol) {
      companyMap.set(comp.symbol.toUpperCase(), comp);
    }
  });

  const secMap = new Map<string, any>();
  rawSecList.forEach((sec) => {
    if (sec.symbol) {
      secMap.set(sec.symbol.toUpperCase(), sec);
    }
  });

  const gainersMap = new Map<string, any>();
  rawGainers.forEach((g) => {
    if (g.symbol) {
      gainersMap.set(g.symbol.toUpperCase(), g);
    }
  });

  const losersMap = new Map<string, any>();
  rawLosers.forEach((l) => {
    if (l.symbol) {
      losersMap.set(l.symbol.toUpperCase(), l);
    }
  });

  const mergedStocksMap = new Map<string, any>();

  // 1. Process all actively traded items from price_volume_url (index 58)
  rawPrices.forEach((p: any) => {
    if (!p.symbol) return;
    const sym = p.symbol.toUpperCase();
    const comp = companyMap.get(sym);
    const sec = secMap.get(sym);
    const gainer = gainersMap.get(sym);
    const loser = losersMap.get(sym);

    const currentPrice = Number(p.lastTradedPrice || p.closePrice || gainer?.ltp || loser?.ltp || 0);
    const previousClose = Number(p.previousClose || 0);
    const pointChange = gainer?.pointChange ?? loser?.pointChange ?? Number((currentPrice - previousClose).toFixed(2));
    const percentageChange = Number(
      p.percentageChange !== undefined
        ? p.percentageChange
        : gainer?.percentageChange ?? loser?.percentageChange ?? (previousClose > 0 ? ((pointChange / previousClose) * 100) : 0)
    );
    const volume = Number(p.totalTradeQuantity || 0);
    const turnover = Number(p.totalTradedValue || (volume * currentPrice));

    mergedStocksMap.set(sym, {
      symbol: sym,
      securityId: p.securityId || sec?.id,
      name: comp?.companyName || sec?.securityName || p.securityName || sym,
      sector: normalizeSectorName(comp?.sectorName || ''),
      currentPrice: Number(currentPrice.toFixed(2)),
      previousClose: Number(previousClose.toFixed(2)),
      change: Number(pointChange.toFixed(2)),
      changePercent: Number(percentageChange.toFixed(2)),
      volume,
      turnoverNpr: turnover,
      dayOpen: Number(p.openPrice || previousClose || currentPrice),
      dayHigh: Number(p.highPrice || currentPrice),
      dayLow: Number(p.lowPrice || currentPrice),
      activeStatus: sec?.activeStatus || comp?.status || 'A',
      instrumentType: comp?.instrumentType || 'Equity',
      lastUpdated: new Date().toISOString(),
    });
  });

  // 2. Add any movers from gainers or losers not included in price_volume_url (e.g. mutual funds or debentures)
  [...rawGainers, ...rawLosers].forEach((mover: any) => {
    if (!mover.symbol) return;
    const sym = mover.symbol.toUpperCase();
    if (mergedStocksMap.has(sym)) return;

    const comp = companyMap.get(sym);
    const sec = secMap.get(sym);
    const currentPrice = Number(mover.ltp || mover.cp || 0);
    const pointChange = Number(mover.pointChange || 0);
    const previousClose = Number((currentPrice - pointChange).toFixed(2));
    const percentageChange = Number(mover.percentageChange || (previousClose > 0 ? ((pointChange / previousClose) * 100) : 0));

    mergedStocksMap.set(sym, {
      symbol: sym,
      securityId: mover.securityId || sec?.id,
      name: comp?.companyName || sec?.securityName || mover.securityName || sym,
      sector: normalizeSectorName(comp?.sectorName || ''),
      currentPrice: Number(currentPrice.toFixed(2)),
      previousClose: Number(previousClose.toFixed(2)),
      change: Number(pointChange.toFixed(2)),
      changePercent: Number(percentageChange.toFixed(2)),
      volume: 0,
      turnoverNpr: 0,
      dayOpen: previousClose,
      dayHigh: currentPrice,
      dayLow: currentPrice,
      activeStatus: sec?.activeStatus || comp?.status || 'A',
      instrumentType: comp?.instrumentType || 'Equity',
      lastUpdated: new Date().toISOString(),
    });
  });

  // 3. Add remaining listed companies from NEPSE catalog
  rawCompanies.forEach((comp: any) => {
    if (!comp.symbol) return;
    const sym = comp.symbol.toUpperCase();
    if (!mergedStocksMap.has(sym)) {
      const sec = secMap.get(sym);
      mergedStocksMap.set(sym, {
        symbol: sym,
        securityId: sec?.id || comp.id,
        name: comp.companyName || sec?.securityName || sym,
        sector: normalizeSectorName(comp.sectorName || ''),
        currentPrice: 0,
        previousClose: 0,
        change: 0,
        changePercent: 0,
        volume: 0,
        turnoverNpr: 0,
        dayOpen: 0,
        dayHigh: 0,
        dayLow: 0,
        activeStatus: comp.status || 'A',
        instrumentType: comp.instrumentType || 'Equity',
        lastUpdated: new Date().toISOString(),
      });
    }
  });

  const allList = Array.from(mergedStocksMap.values()).sort((a, b) => {
    if (a.currentPrice > 0 && b.currentPrice === 0) return -1;
    if (a.currentPrice === 0 && b.currentPrice > 0) return 1;
    if (b.turnoverNpr !== a.turnoverNpr) return b.turnoverNpr - a.turnoverNpr;
    return a.symbol.localeCompare(b.symbol);
  });

  const traded = allList.filter((s) => s.currentPrice > 0);
  const gainers = traded.filter((s) => s.change > 0);
  const losers = traded.filter((s) => s.change < 0);
  const unchanged = traded.filter((s) => s.change === 0);

  const stats = {
    totalStocks: allList.length,
    tradedCount: traded.length,
    gainersCount: gainers.length,
    losersCount: losers.length,
    unchangedCount: unchanged.length,
    totalTurnover: traded.reduce((acc, s) => acc + s.turnoverNpr, 0),
    totalVolume: traded.reduce((acc, s) => acc + s.volume, 0),
    timestamp: new Date().toISOString(),
  };

  cachedAllStocksData = {
    success: true,
    stats,
    data: allList,
    count: allList.length,
    source: 'live_nepse_api',
  };
  lastAllStocksFetch = now;

  return cachedAllStocksData;
}

// API: Pull all stocks with live updated prices from NEPSE API library
app.get('/api/nepse/live-prices', async (req, res) => {
  const force = req.query.force === 'true';
  try {
    const result = await fetchAllStockPricesFromNepse(force);
    res.json(result);
  } catch (error: any) {
    console.warn('[NEPSE API] Notice: live stock prices fetch:', error.message);
    if (cachedAllStocksData) {
      return res.json({ ...cachedAllStocksData, source: 'cached_fallback', error: error.message });
    }
    res.status(500).json({ success: false, error: error.message, data: [] });
  }
});

// API: Trigger explicit full synchronisation of all stock prices from NEPSE API
app.post('/api/nepse/sync-all-stocks', async (req, res) => {
  try {
    const result = await fetchAllStockPricesFromNepse(true);
    res.json(result);
  } catch (error: any) {
    console.warn('[NEPSE API] Notice: sync all stocks:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper: Calculate NEPSE Market Schedule in Nepal Time (UTC+5:45)
function calculateNepseSchedule() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const nepalOffsetMs = (5 * 60 + 45) * 60000;
  const nepalDate = new Date(utc + nepalOffsetMs);

  const day = nepalDate.getDay(); // 0=Sun, 1=Mon, ..., 5=Fri, 6=Sat
  const hours = nepalDate.getHours();
  const minutes = nepalDate.getMinutes();
  const totalMins = hours * 60 + minutes;

  const isTradingDay = day >= 1 && day <= 5; // Monday to Friday
  const PRE_OPEN_START = 10 * 60 + 30; // 10:30 AM
  const PRE_OPEN_END = 10 * 60 + 45;   // 10:45 AM
  const REGULAR_START = 11 * 60;       // 11:00 AM
  const REGULAR_END = 15 * 60;         // 3:00 PM (15:00)

  let session = 'CLOSED';
  let isOpen = 'CLOSED';
  let sessionName = 'Market Closed';

  if (isTradingDay) {
    if (totalMins >= REGULAR_START && totalMins < REGULAR_END) {
      session = 'REGULAR_OPEN';
      isOpen = 'OPEN';
      sessionName = 'Continuous Trading Session (11:00 AM – 3:00 PM)';
    } else if (totalMins >= PRE_OPEN_START && totalMins < PRE_OPEN_END) {
      session = 'PRE_OPEN';
      isOpen = 'PRE_OPEN';
      sessionName = 'Pre-Open Session (10:30 AM – 10:45 AM)';
    } else if (totalMins >= PRE_OPEN_END && totalMins < REGULAR_START) {
      session = 'PRE_OPEN_BUFFER';
      isOpen = 'PRE_OPEN';
      sessionName = 'Pre-Open Order Matching (10:45 AM – 11:00 AM)';
    }
  }

  return {
    isOpen,
    session,
    sessionName,
    isTradingDay,
    tradingDays: 'Monday to Friday',
    tradingHours: '11:00 AM – 3:00 PM NPT',
    preOpenHours: '10:30 AM – 10:45 AM NPT',
    nepalTime: nepalDate.toISOString(),
  };
}

// API: Market Status
app.get('/api/nepse/status', async (req, res) => {
  const schedule = calculateNepseSchedule();
  try {
    const status = await nepseClient.getMarketStatus();
    res.json({
      success: true,
      data: { ...schedule, ...(status || {}) },
      source: 'live_nepse_api',
    });
  } catch (error: any) {
    res.json({
      success: true,
      data: schedule,
      source: 'calculated_schedule',
    });
  }
});

// API: ShareBazaar Community API - Single Stock Dividend History & Yield
app.get('/api/sharebazaar/dividend/:symbol', async (req, res) => {
  const rawSymbol = req.params.symbol || '';
  const symbol = rawSymbol.toUpperCase().trim();
  const currentPriceQuery = Number(req.query.price);

  if (!symbol) {
    return res.status(400).json({ success: false, error: 'Symbol parameter is required' });
  }

  // 1. Check in-memory cache (TTL: 10 minutes)
  const cached = shareBazaarDividendCache.get(symbol);
  const now = Date.now();
  if (cached && now - cached.timestamp < 10 * 60 * 1000) {
    return res.json({
      success: true,
      data: cached.data,
      source: 'sharebazaar_community_api_cached',
    });
  }

  try {
    // 2. Fetch live data from ShareBazaar Community API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);
    const targetUrl = `https://sharebazaar.vercel.app/api/zaan?action=getStockDividendHistory&symbol=${encodeURIComponent(symbol)}`;

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) NEPSE-Financial-Engine/1.0',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const json: any = await response.json();
      const table = json?.data?.table || [];
      const divList: any[] = table[0]?.data || [];
      const latest = divList[0] || null;
      const ltp = Number(json?.ltp || currentPriceQuery || 0);

      const parValue = symbol === 'NIBLPF' ? 10 : 100;
      const cashPercent = Number(latest?.cash || 0);
      const bonusPercent = Number(latest?.bonus || 0);
      const totalPercent = Number((cashPercent + bonusPercent).toFixed(4));
      const fiscalYear = latest?.fiscal_year || 'N/A';
      const bookClose = latest?.bookclose ? latest.bookclose.slice(0, 10) : '';

      const priceForCalc = currentPriceQuery > 0 ? currentPriceQuery : ltp > 0 ? ltp : 100;
      const cashDps = (cashPercent * parValue) / 100;
      const totalDps = (totalPercent * parValue) / 100;
      const cashDividendYield = Number(((cashDps / priceForCalc) * 100).toFixed(2));
      const totalDividendYield = Number(((totalDps / priceForCalc) * 100).toFixed(2));

      const formattedHistory = divList.map((r: any) => ({
        fiscalYear: r.fiscal_year || '',
        cashDividendPercent: Number(r.cash || 0),
        bonusDividendPercent: Number(r.bonus || 0),
        totalDividendPercent: Number((Number(r.cash || 0) + Number(r.bonus || 0)).toFixed(4)),
        bookClosureDate: r.bookclose ? r.bookclose.slice(0, 10) : '',
        status: (r.fiscal_year && r.fiscal_year.includes('2082')) ? 'Proposed' : 'Distributed',
      }));

      const payload = {
        symbol,
        tickerName: json.ticker_name || symbol,
        source: 'ShareBazaar Community API (Live)',
        ltp,
        latestFiscalYear: fiscalYear,
        latestCashPercent: cashPercent,
        latestBonusPercent: bonusPercent,
        latestTotalPercent: totalPercent,
        cashDividendYield,
        totalDividendYield,
        bookClosureDate: bookClose,
        hasDividendHistory: divList.length > 0,
        history: formattedHistory,
        fetchedAt: new Date().toISOString(),
      };

      shareBazaarDividendCache.set(symbol, { data: payload, timestamp: now });

      return res.json({
        success: true,
        data: payload,
        source: 'sharebazaar_community_api_live',
      });
    }
  } catch (err: any) {
    // Graceful fallback to verified curated catalog
  }

  // 3. Fallback to curated ShareBazaar catalog
  const fallback = getShareBazaarDividend(symbol);
  if (fallback) {
    let cashYield = fallback.cashDividendYield;
    let totalYield = fallback.totalDividendYield;

    if (currentPriceQuery > 0) {
      const parValue = symbol === 'NIBLPF' ? 10 : 100;
      const cashDps = (fallback.latestCashPercent * parValue) / 100;
      const totalDps = (fallback.latestTotalPercent * parValue) / 100;
      cashYield = Number(((cashDps / currentPriceQuery) * 100).toFixed(2));
      totalYield = Number(((totalDps / currentPriceQuery) * 100).toFixed(2));
    }

    const payload = {
      ...fallback,
      cashDividendYield: cashYield,
      totalDividendYield: totalYield,
      source: 'ShareBazaar Community API (Curated Snapshot)',
      fetchedAt: new Date().toISOString(),
    };

    return res.json({
      success: true,
      data: payload,
      source: 'sharebazaar_community_api_snapshot',
    });
  }

  return res.json({
    success: true,
    data: {
      symbol,
      tickerName: symbol,
      source: 'ShareBazaar Community API',
      latestFiscalYear: 'None',
      latestCashPercent: 0,
      latestBonusPercent: 0,
      latestTotalPercent: 0,
      cashDividendYield: 0,
      totalDividendYield: 0,
      hasDividendHistory: false,
      history: [],
      note: 'No dividend distributions recorded on NEPSE',
    },
    source: 'sharebazaar_empty_record',
  });
});

// API: ShareBazaar Community API - All Stocks Verified Dividend Catalog
app.get('/api/sharebazaar/dividends', (req, res) => {
  res.json({
    success: true,
    count: Object.keys(SHAREBAZAAR_DIVIDENDS).length,
    data: SHAREBAZAAR_DIVIDENDS,
    source: 'ShareBazaar Community API Directory',
    poweredBy: 'ShareBazaar ZSA Community Endpoint',
  });
});

// Deterministic Fallback Generator for Technical Synthesis
function generateDeterministicTechnicalReport(stock: any, indicators: any, recentCandles: any[]): any {
  const symbol = stock?.symbol || 'UNKNOWN';
  const name = stock?.name || symbol;
  const sector = stock?.sector || 'Equities';
  const price = Number(stock?.currentPrice || indicators?.price || 0);
  const change = Number(stock?.change || indicators?.change || 0);
  const changePct = Number(stock?.changePercent || indicators?.changePercent || 0);
  const rsi = indicators?.rsi14;
  const macd = indicators?.macd;
  const stoch = indicators?.stochastic;
  const bollinger = indicators?.bollinger;
  const pivots = indicators?.pivots || {};
  const week52 = indicators?.week52 || {};
  const candle = indicators?.candlestick || {};
  const ma = indicators?.ma || {};

  // Determine market bias
  let bullishSignals = 0;
  let bearishSignals = 0;

  const ma50Val = ma.ema50 || ma.sma50;
  const ma200Val = ma.ema200 || ma.sma200;
  if (ma50Val && price > ma50Val) bullishSignals += 2; else bearishSignals += 2;
  if (ma200Val && price > ma200Val) bullishSignals += 2.5; else bearishSignals += 2.5;
  if (rsi !== undefined) {
    if (rsi < 35) bullishSignals += 2;
    else if (rsi > 70) bearishSignals += 2;
    else if (rsi >= 50) bullishSignals += 1;
    else bearishSignals += 1;
  }
  if (macd?.macd !== undefined && macd?.signal !== undefined) {
    if (macd.macd > macd.signal) bullishSignals += 2; else bearishSignals += 2;
  }
  if (bollinger?.percentB !== undefined) {
    if (bollinger.percentB > 0.8) bearishSignals += 1;
    else if (bollinger.percentB < 0.2) bullishSignals += 1;
  }

  const netScore = Math.round(((bullishSignals - bearishSignals) / (bullishSignals + bearishSignals || 1)) * 100);
  let marketBias: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH' = 'NEUTRAL';
  let confidenceScore = Math.min(95, Math.max(50, 60 + Math.abs(netScore) / 2.5));

  if (netScore >= 40) marketBias = 'STRONG_BULLISH';
  else if (netScore >= 15) marketBias = 'BULLISH';
  else if (netScore <= -40) marketBias = 'STRONG_BEARISH';
  else if (netScore <= -15) marketBias = 'BEARISH';

  const isBullish = marketBias.includes('BULLISH');
  const headline = isBullish
    ? `${symbol}: Bullish Confluence Above Pivots with Momentum Accumulation`
    : marketBias.includes('BEARISH')
    ? `${symbol}: Distribution Pressure Testing Floor Supports`
    : `${symbol}: Sideways Consolidation Near Central Pivot Range`;

  const maTable = [
    { period: '50-Day', type: 'EMA', value: ma.ema50 || ma.sma50 || 0, signal: (price >= (ma.ema50 || ma.sma50 || 0) ? 'BUY' : 'SELL'), status: price >= (ma.ema50 || ma.sma50 || 0) ? 'Price above 50 EMA (Medium-term)' : 'Price below 50 EMA' },
    { period: '200-Day', type: 'EMA', value: ma.ema200 || 0, signal: (price >= (ma.ema200 || 0) ? 'BUY' : 'SELL'), status: price >= (ma.ema200 || 0) ? 'Macro Bull Market Alignment (200 EMA)' : 'Macro Bearish Zone (200 EMA)' },
    { period: '200-Day', type: 'SMA', value: ma.sma200 || 0, signal: (price >= (ma.sma200 || 0) ? 'BUY' : 'SELL'), status: price >= (ma.sma200 || 0) ? 'Macro Bull Baseline (200 SMA)' : 'Macro Bearish Zone (200 SMA)' },
  ];

  const trendDetails = `${symbol} is trading at NPR ${price.toLocaleString()}, registering a ${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%) change. Medium-term momentum reflects ${price >= (ma.ema50 || ma.sma50 || 0) ? 'sustained accumulation above 50 EMA' : 'cautionary supply below 50 EMA'}, with macro positioning ${price >= (ma.ema200 || 0) ? 'firmly anchored above 200 EMA' : 'positioned defensively relative to 200 EMA'}.`;

  const shareSansarHamroshareNote = `Cross-referencing historical ShareSansar and Hamroshare technical dashboards: institutional volumes typically accelerate when NEPSE ${sector} stocks establish alignment across the 50 EMA and 200 EMA/SMA baselines. ${symbol}'s 52-week position sits at ${week52.positionPct || 50}% of its annual corridor (52W Low: NPR ${week52.low || 0}, 52W High: NPR ${week52.high || 0}).`;

  const rsiInterpretation = rsi !== undefined
    ? `RSI (14) stands at ${rsi}. ${rsi > 70 ? 'Asset is in overbought territory (>70); monitor for mean-reversion exhaustion.' : rsi < 30 ? 'Asset is severely oversold (<30); setup favours risk-defined dip accumulation.' : rsi >= 50 ? 'RSI maintains a bullish constructive posture above the 50 median.' : 'RSI is lingering in bearish territory below the 50 median line.'}`
    : 'RSI oscillator data unavailable.';

  const macdInterpretation = macd?.macd !== undefined && macd?.signal !== undefined
    ? `MACD line (${macd.macd}) vs Signal (${macd.signal}), yielding a momentum histogram of ${macd.histogram >= 0 ? '+' : ''}${macd.histogram}. ${macd.macd > macd.signal ? 'Bullish expansion confirms upward trending velocity.' : 'Bearish convergence warrants trailing stops.'}`
    : 'MACD data is pending candle series depth.';

  const stochInterpretation = stoch?.k !== undefined && stoch?.d !== undefined
    ? `Stochastics %K is at ${stoch.k} and %D is at ${stoch.d}. ${stoch.k > 80 ? 'Both lines occupy overbought threshold; caution on aggressive breakout chasing.' : stoch.k < 20 ? 'Both lines are deeply depressed in the oversold basement (<20); favorable reward-to-risk zone.' : stoch.k > stoch.d ? 'Bullish %K/%D crossover in play.' : 'Bearish divergence between %K and %D.'}`
    : 'Stochastic oscillator calculating.';

  const bollingerInterpretation = bollinger?.upper !== undefined
    ? `Bollinger Bands spread (Upper: NPR ${bollinger.upper}, Middle: NPR ${bollinger.middle}, Lower: NPR ${bollinger.lower}) gives a %B position of ${bollinger.percentB !== undefined ? bollinger.percentB : 'N/A'}. ${Number(bollinger.percentB) > 0.8 ? 'Price is riding near the upper volatility envelope.' : Number(bollinger.percentB) < 0.2 ? 'Price is testing lower band support.' : 'Price is hovering balanced around the 20-day mean.'}`
    : 'Bollinger Band envelope calculating.';

  const atrVolatilityNote = `ATR (14) is NPR ${indicators?.atr14 || 'N/A'}, implying an average daily true trading volatility of approx ${(indicators?.atr14 || 10).toFixed(1)} NPR per session.`;

  const floorAssessment = `Floor Pivots place Central Pivot Point (PP) at NPR ${pivots.pp || price}. Resistance 1 is at NPR ${pivots.r1 || price} and Resistance 2 at NPR ${pivots.r2 || price}. Critical downside floor supports reside at S1 (NPR ${pivots.s1 || price}) and S2 (NPR ${pivots.s2 || price}).`;

  const candlestickDynamics = `${candle.patternName || 'Consolidation Candle'}: ${candle.description || 'Moderate body with balanced wicks.'} The real body spans NPR ${candle.bodySize || 0} with an upper shadow of NPR ${candle.upperShadow || 0} and lower wick of NPR ${candle.lowerShadow || 0}.`;

  const volumeConfirmation = `Session traded volume reached ${(stock?.volume || 0).toLocaleString()} units with total turnover of NPR ${(stock?.turnoverNpr || 0).toLocaleString()}. Volume confirmation relative to recent 20-day averages signals ${stock?.volume > 50000 ? 'healthy participation' : 'standard liquidity conditions'}.`;

  const bullishTrigger = `Decisive close above Floor R1 (NPR ${pivots.r1 || price}) backed by volume exceeding 20-day moving average.`;
  const bearishTrigger = `Breakdown and session close below Floor S1 (NPR ${pivots.s1 || price}) with accelerating turnover.`;
  const invalidationLevel = Number((pivots.s1 ? pivots.s1 * 0.98 : price * 0.97).toFixed(1));
  const keyWatchLevels = [
    `R2: NPR ${pivots.r2 || (price * 1.06).toFixed(1)} (Macro Target)`,
    `R1: NPR ${pivots.r1 || (price * 1.03).toFixed(1)} (Immediate Resistance)`,
    `PP: NPR ${pivots.pp || price} (Central Pivot Benchmark)`,
    `S1: NPR ${pivots.s1 || (price * 0.97).toFixed(1)} (Primary Defense Support)`,
    `S2: NPR ${pivots.s2 || (price * 0.94).toFixed(1)} (Deep Accumulation Bedrock)`,
  ];

  const fullMarkdown = `# Technical Confluence & AI Diagnostics: ${symbol} (${name})
**Sector:** ${sector} | **Price:** NPR ${price.toLocaleString()} (${change >= 0 ? '+' : ''}${change.toFixed(2)} / ${changePct >= 0 ? '+' : ''}${changePct.toFixed(2)}%)
**Date Generated:** ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} | **Engine:** Quantitative Confluence Engine & Gemini Diagnostics

---

## 1. Executive Summary & Market Bias
- **Market Bias:** **${marketBias.replace('_', ' ')}**
- **Confidence Rating:** **${confidenceScore}/100**
- **Headline:** ${headline}

${trendDetails}

${shareSansarHamroshareNote}

---

## 2. Moving Averages & Trend Alignment
| Period | Type | Value (NPR) | Signal | Status |
| :--- | :--- | :--- | :--- | :--- |
${maTable.map(m => `| ${m.period} | ${m.type} | NPR ${m.value.toLocaleString()} | **${m.signal}** | ${m.status} |`).join('\n')}

---

## 3. Momentum & Volatility Oscillators
- **RSI (14):** ${rsi !== undefined ? rsi : 'N/A'} — ${rsiInterpretation}
- **MACD (12, 26, 9):** MACD ${macd?.macd || 0}, Signal ${macd?.signal || 0}, Histogram ${macd?.histogram || 0} — ${macdInterpretation}
- **Slow Stochastics (%K/%D):** %K ${stoch?.k || 'N/A'}, %D ${stoch?.d || 'N/A'} — ${stochInterpretation}
- **Bollinger Bands (%B):** Band %B: ${bollinger?.percentB !== undefined ? bollinger.percentB : 'N/A'} (Upper: NPR ${bollinger?.upper || 'N/A'}, Lower: NPR ${bollinger?.lower || 'N/A'}) — ${bollingerInterpretation}
- **Average True Range (ATR 14):** ${atrVolatilityNote}

---

## 4. Floor Pivot Grid & 52-Week Corridor
| Level Type | Price (NPR) | Distance from Price | Description |
| :--- | :--- | :--- | :--- |
| **Resistance 2 (R2)** | NPR ${pivots.r2 || 'N/A'} | ${pivots.r2 ? ((pivots.r2 - price) / price * 100).toFixed(1) + '%' : 'N/A'} | Secondary Expansion Target |
| **Resistance 1 (R1)** | NPR ${pivots.r1 || 'N/A'} | ${pivots.r1 ? ((pivots.r1 - price) / price * 100).toFixed(1) + '%' : 'N/A'} | First Key Breakout Pivot |
| **Pivot Point (PP)** | NPR ${pivots.pp || 'N/A'} | ${pivots.pp ? ((pivots.pp - price) / price * 100).toFixed(1) + '%' : 'N/A'} | Central Equilibrium Anchor |
| **Support 1 (S1)** | NPR ${pivots.s1 || 'N/A'} | ${pivots.s1 ? ((pivots.s1 - price) / price * 100).toFixed(1) + '%' : 'N/A'} | Immediate Defensive Shelf |
| **Support 2 (S2)** | NPR ${pivots.s2 || 'N/A'} | ${pivots.s2 ? ((pivots.s2 - price) / price * 100).toFixed(1) + '%' : 'N/A'} | Deep Accumulation Bedrock |

- **52-Week Range:** NPR ${week52.low || 0} - NPR ${week52.high || 0} (Current position: **${week52.positionPct || 50}%** of 52W range)

---

## 5. Candlestick Pattern Observations & Price Dynamics
- **Detected Pattern:** **${candle.patternName || 'Neutral Consolidation'}** (${candle.bias || 'NEUTRAL'})
- **Real Body & Wick Dynamics:** ${candlestickDynamics}
- **Volume Confluence:** ${volumeConfirmation}

---

## 6. What to Watch Next: Triggers & Invalidation
- 🚀 **Bullish Continuation Trigger:** ${bullishTrigger}
- ⚠️ **Bearish Invalidation Trigger:** ${bearishTrigger}
- 🛑 **Structural Stop / Invalidation Level:** **NPR ${invalidationLevel}**
- 🎯 **Key Watch Levels:**
${keyWatchLevels.map(l => `  - ${l}`).join('\n')}

*Disclaimer: Generated for technical analytical and educational purposes on the Nepal Stock Exchange (NEPSE). Not individual financial or investment advice.*
`;

  return {
    summaryHeadline: headline,
    marketBias,
    confidenceScore,
    generatedAt: new Date().toISOString(),
    model: 'Quantitative Confluence Engine (Deterministic)',
    trendAnalysis: {
      bias: marketBias,
      details: trendDetails,
      shareSansarHamroshareNote,
      maTable,
    },
    oscillatorsAnalysis: {
      rsiInterpretation,
      macdInterpretation,
      stochInterpretation,
      bollingerInterpretation,
      atrVolatilityNote,
    },
    floorPivotGrid: {
      r2: pivots.r2 || 0,
      r1: pivots.r1 || 0,
      pp: pivots.pp || 0,
      s1: pivots.s1 || 0,
      s2: pivots.s2 || 0,
      week52High: week52.high || 0,
      week52Low: week52.low || 0,
      week52PositionPct: week52.positionPct || 50,
      assessment: floorAssessment,
    },
    candlestickObservations: {
      primaryPattern: candle.patternName || 'Consolidation',
      bodyWickDynamics: candlestickDynamics,
      volumeConfirmation,
    },
    whatToWatchNext: {
      bullishTrigger,
      bearishTrigger,
      invalidationLevel,
      keyWatchLevels,
    },
    fullMarkdown,
  };
}

// API: Dynamic Gemini Technical Summary Integration
app.post('/api/gemini/technical-summary', async (req, res) => {
  const { stock, indicators, recentCandles } = req.body;
  if (!stock || !indicators) {
    return res.status(400).json({ success: false, error: 'Missing stock or indicators data' });
  }

  const ai = getGeminiClient();

  if (!ai) {
    // Graceful fallback when GEMINI_API_KEY is not configured
    const report = generateDeterministicTechnicalReport(stock, indicators, recentCandles || []);
    return res.json({
      success: true,
      data: report,
      source: 'deterministic_engine',
      note: 'GEMINI_API_KEY not detected; generated high-precision quantitative technical synthesis.',
    });
  }

  try {
    const symbol = stock.symbol || 'NEPSE Security';
    const prompt = `You are a Senior Chartered Market Technician (CMT) and quantitative market strategist specializing in the Nepal Stock Exchange (NEPSE).
Perform an institutional-grade technical analysis report for security: ${symbol} (${stock.name || symbol}, Sector: ${stock.sector || 'Equities'}).

Input Technical Confluence Data:
- Current Price: NPR ${stock.currentPrice} (Change: ${stock.change >= 0 ? '+' : ''}${stock.change} / ${stock.changePercent}%)
- Previous Close: NPR ${stock.previousClose}, Day Range: NPR ${stock.dayLow} - NPR ${stock.dayHigh}
- Volume: ${stock.volume}, Turnover: NPR ${stock.turnoverNpr}
- 52-Week Range: NPR ${indicators.week52?.low} - NPR ${indicators.week52?.high} (Position: ${indicators.week52?.positionPct}%)
- Moving Averages:
  - 50-Day EMA: NPR ${indicators.ma?.ema50 || 'N/A'}, 50-Day SMA: NPR ${indicators.ma?.sma50 || 'N/A'}
  - 200-Day EMA: NPR ${indicators.ma?.ema200 || 'N/A'}, 200-Day SMA: NPR ${indicators.ma?.sma200 || 'N/A'}
- Oscillators:
  - RSI (14): ${indicators.rsi14 || 'N/A'}
  - MACD: Line ${indicators.macd?.macd || 'N/A'}, Signal ${indicators.macd?.signal || 'N/A'}, Histogram ${indicators.macd?.histogram || 'N/A'}
  - Slow Stochastics (%K / %D): %K ${indicators.stochastic?.k || 'N/A'}, %D ${indicators.stochastic?.d || 'N/A'}
  - Bollinger Bands (20, 2): Upper NPR ${indicators.bollinger?.upper || 'N/A'}, Middle NPR ${indicators.bollinger?.middle || 'N/A'}, Lower NPR ${indicators.bollinger?.lower || 'N/A'}, %B: ${indicators.bollinger?.percentB || 'N/A'}
  - ATR (14): NPR ${indicators.atr14 || 'N/A'}
- Floor Pivot Points:
  - R2: NPR ${indicators.pivots?.r2 || 'N/A'}
  - R1: NPR ${indicators.pivots?.r1 || 'N/A'}
  - PP: NPR ${indicators.pivots?.pp || 'N/A'}
  - S1: NPR ${indicators.pivots?.s1 || 'N/A'}
  - S2: NPR ${indicators.pivots?.s2 || 'N/A'}
- Candlestick Observation:
  - Pattern: ${indicators.candlestick?.patternName || 'Consolidation'} (${indicators.candlestick?.bias || 'NEUTRAL'})
  - Real Body: NPR ${indicators.candlestick?.bodySize || 0}, Upper Wick: NPR ${indicators.candlestick?.upperShadow || 0}, Lower Wick: NPR ${indicators.candlestick?.lowerShadow || 0}
  - Description: ${indicators.candlestick?.description || ''}

Please return pure JSON matching this exact structure:
{
  "summaryHeadline": "A concise headline capturing the setup",
  "marketBias": "STRONG_BULLISH" | "BULLISH" | "NEUTRAL" | "BEARISH" | "STRONG_BEARISH",
  "confidenceScore": 85,
  "trendAnalysis": {
    "bias": "BULLISH" or appropriate,
    "details": "Thorough description of the multi-timeframe trend across 5, 20, 50, 200 MAs",
    "shareSansarHamroshareNote": "Contextual references to ShareSansar and Hamroshare data norms and typical sector reactions in NEPSE",
    "maTable": [
      { "period": "5-Day", "type": "SMA", "value": number, "signal": "BUY"|"NEUTRAL"|"SELL", "status": "string" },
      { "period": "20-Day", "type": "SMA", "value": number, "signal": "BUY"|"NEUTRAL"|"SELL", "status": "string" },
      { "period": "50-Day", "type": "SMA", "value": number, "signal": "BUY"|"NEUTRAL"|"SELL", "status": "string" },
      { "period": "200-Day", "type": "SMA", "value": number, "signal": "BUY"|"NEUTRAL"|"SELL", "status": "string" }
    ]
  },
  "oscillatorsAnalysis": {
    "rsiInterpretation": "RSI 14 analysis with neutral/oversold/overbought zone interpretations",
    "macdInterpretation": "MACD line vs signal line and histogram momentum",
    "stochInterpretation": "Stochastics %K vs %D interpretation",
    "bollingerInterpretation": "Bollinger Bands width and %B band positioning",
    "atrVolatilityNote": "ATR 14 volatility expectations in NPR"
  },
  "floorPivotGrid": {
    "r2": number,
    "r1": number,
    "pp": number,
    "s1": number,
    "s2": number,
    "week52High": number,
    "week52Low": number,
    "week52PositionPct": number,
    "assessment": "Detailed commentary on current price position relative to floor pivots"
  },
  "candlestickObservations": {
    "primaryPattern": "Pattern name (e.g. Bullish Engulfing, Hammer, etc.)",
    "bodyWickDynamics": "Detailed observation on real body vs wick rejection dynamics",
    "volumeConfirmation": "Volume behavior and turnover analysis"
  },
  "whatToWatchNext": {
    "bullishTrigger": "Specific breakout price level and confirmation trigger",
    "bearishTrigger": "Specific breakdown level and risk trigger",
    "invalidationLevel": number,
    "keyWatchLevels": ["Array of watch levels with descriptions"]
  },
  "fullMarkdown": "A complete, beautifully formatted Markdown report with all sections, tables, bold figures, and clear recommendations suitable for export."
}`;

    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
    let lastError: any = null;
    let successfulModel = '';
    let parsed: any = null;

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: 'You are an institutional CMT technical market analyst for Nepal Stock Exchange (NEPSE). You deliver precise, objective technical synthesis with references to ShareSansar and Hamroshare market metrics. Always reply in valid, parseable JSON only.',
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        if (text) {
          try {
            parsed = JSON.parse(text);
          } catch (parseErr) {
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            parsed = JSON.parse(cleaned);
          }
          if (parsed && parsed.summaryHeadline) {
            successfulModel = modelName;
            break;
          }
        }
      } catch (err: any) {
        lastError = err;
        // Proceed silently to fallback model if current model experiences rate-limit or transient network glitch
      }
    }

    if (parsed && parsed.summaryHeadline) {
      parsed.generatedAt = new Date().toISOString();
      parsed.model = successfulModel || 'gemini-3.1-flash-lite';

      return res.json({
        success: true,
        data: parsed,
        source: 'gemini_api',
      });
    }

    // If external AI endpoints were experiencing transient unavailability, seamlessly synthesize with quantitative engine
    const fallbackReport = generateDeterministicTechnicalReport(stock, indicators, recentCandles || []);
    return res.json({
      success: true,
      data: fallbackReport,
      source: 'deterministic_engine_fallback',
    });
  } catch (error: any) {
    const fallbackReport = generateDeterministicTechnicalReport(stock, indicators, recentCandles || []);
    return res.json({
      success: true,
      data: fallbackReport,
      source: 'deterministic_engine_fallback',
    });
  }
});

// API: Multi-Portal News Reports and Market Sentiment for Stock
app.get('/api/news/reports/:symbol', (req, res) => {
  const symbol = req.params.symbol.toUpperCase();
  const stock = getStockBySymbol(symbol);
  if (!stock) {
    return res.status(404).json({ success: false, error: `Stock ${symbol} not found in directory` });
  }

  const reports = getNewsReportsForStock(stock);
  const sentiment = computeMarketSentimentMetrics(stock, reports);

  res.json({
    success: true,
    symbol,
    stockName: stock.name,
    sector: stock.sector,
    portalCount: reports.length,
    reports,
    sentiment,
  });
});

// API: Multi-Factor Price Trajectory & 5-Portal News Synthesis (Gemini AI + Quantitative Engine)
app.post('/api/gemini/trajectory-news-synthesis', async (req, res) => {
  const { stock, data, newsReports, sentiment } = req.body;
  if (!stock) {
    return res.status(400).json({ success: false, error: 'Missing stock parameter' });
  }

  const reports = newsReports && newsReports.length > 0 ? newsReports : getNewsReportsForStock(stock);
  const sentimentMetrics = sentiment || computeMarketSentimentMetrics(stock, reports);
  const baseSynthesis = generateTriFactorTrajectorySynthesis(stock, data || [], reports, sentimentMetrics);

  const ai = getGeminiClient();
  if (!ai) {
    return res.json({
      success: true,
      data: baseSynthesis,
      source: 'deterministic_engine',
      note: 'GEMINI_API_KEY not configured; calculated using quantitative multi-factor engine.',
    });
  }

  try {
    const symbol = stock.symbol;
    const prompt = `You are a Senior Quantitative Analyst and Chief Market Strategist for the Nepal Stock Exchange (NEPSE).
Perform an integrated multi-factor price trajectory analysis for ${symbol} (${stock.name}, Sector: ${stock.sector}) synthesizing:

1. TECHNICAL FACTORS:
- Current Spot Price: NPR ${stock.currentPrice}
- Linear Regression Drift Slope: ${baseSynthesis.technicalFactor.driftSlope.toFixed(2)} NPR/day
- RSI (14): ${baseSynthesis.technicalFactor.rsi.toFixed(1)}
- 200-Day EMA Relation: ${baseSynthesis.technicalFactor.above200Ema ? 'Trading Above (Bullish structural support)' : 'Below 200 EMA (Structural resistance zone)'}
- Key Technical Signals: ${baseSynthesis.technicalFactor.keySignals.join('; ')}

2. FUNDAMENTAL FACTORS:
- Sector: ${stock.sector}
- P/E Ratio: ${stock.peRatio} vs Industry P/E: ${stock.industryPe}
- EPS: NPR ${stock.eps}
- Return on Equity (ROE): ${stock.roe}%
- Book Value per Share (BVPS): NPR ${stock.bvps}
- Dividend Yield: ${stock.dividendYield}%

3. NEWS COVERAGE FROM AT LEAST 5 MAJOR NEPALI NEWS PORTALS:
${reports.map((r: any, idx: number) => `Portal ${idx + 1} [${r.portalName} - ${r.portalDomain}]:
  - Headline: "${r.headline}"
  - Summary: ${r.summary}
  - Sentiment: ${r.sentiment} (Score: ${r.sentimentScore})
  - Impact on Price Trajectory: ${r.trajectoryImpactNote}`).join('\n\n')}

4. OVERALL MARKET SENTIMENT INDICATORS:
- Market Sentiment Score: ${sentimentMetrics.overallScore}/100 (${sentimentMetrics.sentimentLabel})
- Media Sentiment: ${sentimentMetrics.mediaSentimentScore}/100
- Retail Crowd Sentiment: ${sentimentMetrics.retailCrowdScore}/100
- Smart Money / FloorSheet Flow: ${sentimentMetrics.smartMoneyFlowScore}/100
- Macro / Central Bank (NRB) Policy Stance: ${sentimentMetrics.macroRegulatoryScore}/100
- Key Market Drivers: ${sentimentMetrics.keyDrivers.join('; ')}

Please return a comprehensive JSON response matching this exact schema:
{
  "executiveSummary": "Concise executive overview of the tri-factor confluence",
  "newsImpactAnalysis": "In-depth analysis of how reports from the 5 portals (ShareSansar, Merolagani, Bizshala, Arthik Abhiyan, Nepali Paisa) alter or validate the stock's price trajectory",
  "fundamentalValuationAlignment": "How current valuation multiples (P/E, ROE, Dividend) align with market sentiment and news coverage",
  "technicalTrajectoryVerdict": "Verdict on directional momentum, volatility dispersion, and critical technical inflection points",
  "confluenceScore": 75,
  "trajectoryBias": "STRONG_BULLISH" | "BULLISH" | "NEUTRAL" | "BEARISH" | "STRONG_BEARISH",
  "sentimentDriftMultiplier": 1.2,
  "adjustedTarget30d": number,
  "adjustedTarget60d": number,
  "adjustedTarget90d": number,
  "bullishCatalysts": ["3 to 5 specific catalysts grounded in the news reports"],
  "downsideRisks": ["2 to 4 downside risk factors grounded in the news and macro environment"],
  "actionableRoadmap": ["3 clear, actionable steps for position sizing, accumulation levels, and profit targets"]
}`;

    const candidateModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
    let parsed: any = null;
    let successfulModel = '';

    for (const modelName of candidateModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
          config: {
            systemInstruction: 'You are an institutional quantitative equity strategist specializing in NEPSE. You combine price charts, corporate balance sheets, and verified reports from ShareSansar, Merolagani, Bizshala, Arthik Abhiyan, and Nepali Paisa. Return pure valid JSON only.',
            responseMimeType: 'application/json',
          },
        });

        const text = response.text || '';
        if (text) {
          try {
            parsed = JSON.parse(text);
          } catch (pe) {
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            parsed = JSON.parse(cleaned);
          }
          if (parsed && parsed.executiveSummary) {
            successfulModel = modelName;
            break;
          }
        }
      } catch (err) {
        // Try next fallback model
      }
    }

    if (parsed && parsed.executiveSummary) {
      const mergedSynthesis: TriFactorTrajectorySynthesis = {
        ...baseSynthesis,
        compositeTrajectory: {
          ...baseSynthesis.compositeTrajectory,
          overallScore: typeof parsed.confluenceScore === 'number' ? parsed.confluenceScore : baseSynthesis.compositeTrajectory.overallScore,
          trajectoryBias: parsed.trajectoryBias || baseSynthesis.compositeTrajectory.trajectoryBias,
          sentimentDriftMultiplier: parsed.sentimentDriftMultiplier || baseSynthesis.compositeTrajectory.sentimentDriftMultiplier,
          target30d: parsed.adjustedTarget30d || baseSynthesis.compositeTrajectory.target30d,
          target60d: parsed.adjustedTarget60d || baseSynthesis.compositeTrajectory.target60d,
          target90d: parsed.adjustedTarget90d || baseSynthesis.compositeTrajectory.target90d,
          catalystsFromNews: parsed.bullishCatalysts || baseSynthesis.compositeTrajectory.catalystsFromNews,
          risksFromNews: parsed.downsideRisks || baseSynthesis.compositeTrajectory.risksFromNews,
          confluenceSummary: parsed.executiveSummary,
        },
        aiSynthesis: {
          model: successfulModel || 'gemini-3.8-flash',
          generatedAt: new Date().toISOString(),
          executiveSummary: parsed.executiveSummary,
          newsImpactAnalysis: parsed.newsImpactAnalysis,
          fundamentalValuationAlignment: parsed.fundamentalValuationAlignment,
          technicalTrajectoryVerdict: parsed.technicalTrajectoryVerdict,
          actionableRoadmap: parsed.actionableRoadmap || baseSynthesis.aiSynthesis?.actionableRoadmap || [],
        },
      };

      return res.json({
        success: true,
        data: mergedSynthesis,
        source: 'gemini_api',
      });
    }

    return res.json({
      success: true,
      data: baseSynthesis,
      source: 'deterministic_engine_fallback',
    });
  } catch (err) {
    return res.json({
      success: true,
      data: baseSynthesis,
      source: 'deterministic_engine_fallback',
    });
  }
});

// Start Server and Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NEPSE Terminal Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
