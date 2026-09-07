import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { Nepse } from '@rumess/nepse-api';
import { GoogleGenAI } from '@google/genai';
import { SHAREBAZAAR_DIVIDENDS, getShareBazaarDividend, calculateLiveDividendYield } from '../src/data/sharebazaarDividendData';
import { getNewsReportsForStock, computeMarketSentimentMetrics, generateTriFactorTrajectorySynthesis } from '../src/data/nepseNewsData';
import { getStockBySymbol } from '../src/data/nepseStocks';
import { TriFactorTrajectorySynthesis } from '../src/types/nepse';

const app = express();
const PORT = process.env.PORT || 3000;
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

    const [historyRes, detailsRes] = await Promise.allSettled([
      nepseClient.requestGETAPI(`/api/nots/market/security/price/${secId}?size=250&page=0`),
      nepseClient.getSecurityDetails(symbol)
    ]);

    const historyVal: any = historyRes.status === 'fulfilled' ? historyRes.value : null;
    const detailsVal: any = detailsRes.status === 'fulfilled' ? detailsRes.value : null;
    const rawList: any[] = historyVal?.content || [];
    
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

// API: Pull live NEPSE Main Indices
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

// API: Pull live security details
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

async function fetchAllStockPricesFromNepse(force = false) {
  const now = Date.now();
  if (!force && cachedAllStocksData && now - lastAllStocksFetch < 30000) {
    return { ...cachedAllStocksData, source: 'cache' };
  }

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
  rawCompanies.forEach((comp) => { if (comp.symbol) companyMap.set(comp.symbol.toUpperCase(), comp); });

  const secMap = new Map<string, any>();
  rawSecList.forEach((sec) => { if (sec.symbol) secMap.set(sec.symbol.toUpperCase(), sec); });

  const gainersMap = new Map<string, any>();
  rawGainers.forEach((g) => { if (g.symbol) gainersMap.set(g.symbol.toUpperCase(), g); });

  const losersMap = new Map<string, any>();
  rawLosers.forEach((l) => { if (l.symbol) losersMap.set(l.symbol.toUpperCase(), l); });

  const mergedStocksMap = new Map<string, any>();

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

app.post('/api/nepse/sync-all-stocks', async (req, res) => {
  try {
    const result = await fetchAllStockPricesFromNepse(true);
    res.json(result);
  } catch (error: any) {
    console.warn('[NEPSE API] Notice: sync all stocks:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

function calculateNepseSchedule() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const nepalOffsetMs = (5 * 60 + 45) * 60000;
  const nepalDate = new Date(utc + nepalOffsetMs);

  const day = nepalDate.getDay();
  const hours = nepalDate.getHours();
  const minutes = nepalDate.getMinutes();
  const totalMins = hours * 60 + minutes;

  const isTradingDay = day >= 1 && day <= 5;
  const PRE_OPEN_START = 10 * 60 + 30;
  const PRE_OPEN_END = 10 * 60 + 45;
  const REGULAR_START = 11 * 60;
  const REGULAR_END = 15 * 60;

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

app.get('/api/sharebazaar/dividend/:symbol', async (req, res) => {
  const rawSymbol = req.params.symbol || '';
  const symbol = rawSymbol.toUpperCase().trim();
  const currentPriceQuery = Number(req.query.price);

  if (!symbol) {
    return res.status(400).json({ success: false, error: 'Symbol parameter is required' });
  }

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
    // Fallback
  }

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

app.get('/api/sharebazaar/dividends', (req, res) => {
  res.json({
    success: true,
    count: Object.keys(SHAREBAZAAR_DIVIDENDS).length,
    data: SHAREBAZAAR_DIVIDENDS,
    source: 'ShareBazaar Community API Directory',
    poweredBy: 'ShareBazaar ZSA Community Endpoint',
  });
});

function generateDeterministicTechnicalReport(stock: any, indicators: any, recentCandles: any[]): any {
  const symbol = stock?.symbol || 'UNKNOWN';
  const price = Number(stock?.currentPrice || indicators?.price || 0);
  const change = Number(stock?.change || indicators?.change || 0);
  const changePct = Number(stock?.changePercent || indicators?.changePercent || 0);
  const rsi = indicators?.rsi14;
  const macd = indicators?.macd;
  const ma = indicators?.ma || {};

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

  const netScore = Math.round(((bullishSignals - bearishSignals) / (bullishSignals + bearishSignals || 1)) * 100);
  let marketBias: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH' = 'NEUTRAL';

  if (netScore >= 40) marketBias = 'STRONG_BULLISH';
  else if (netScore >= 15) marketBias = 'BULLISH';
  else if (netScore <= -40) marketBias = 'STRONG_BEARISH';
  else if (netScore <= -15) marketBias = 'BEARISH';

  return {
    symbol,
    marketBias,
    currentPrice: price,
    change,
    changePercent: changePct,
    timestamp: new Date().toISOString()
  };
}

// Fallback for Gemini AI Endpoint
app.post('/api/gemini/technical-summary', async (req, res) => {
  const { stock, indicators, recentCandles } = req.body || {};
  
  try {
    const client = getGeminiClient();
    if (!client) {
      const fallbackReport = generateDeterministicTechnicalReport(stock, indicators, recentCandles);
      return res.json({ success: true, data: fallbackReport, source: 'deterministic_fallback' });
    }

    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Provide a technical stock summary for ${stock?.symbol || 'NEPSE stock'} trading at ${stock?.currentPrice || 0} NPR.`,
    });

    res.json({ success: true, data: response.text, source: 'gemini_api' });
  } catch (err: any) {
    const fallbackReport = generateDeterministicTechnicalReport(stock, indicators, recentCandles);
    res.json({ success: true, data: fallbackReport, source: 'deterministic_fallback', error: err.message });
  }
});

// Export Express app for Vercel Serverless Function deployment
export default app;
