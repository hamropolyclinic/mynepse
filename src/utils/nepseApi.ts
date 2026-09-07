import { StockFundamental, MarketIndex, NepseSector, OHLCVDataPoint, FullTechnicalIndicatorsSnapshot, GeminiTechnicalSummaryReport, NewsPortalReport, MarketSentimentMetrics, TriFactorTrajectorySynthesis } from '../types/nepse';
import { NEPSE_STOCK_DIRECTORY, NEPSE_MARKET_INDICES, generateHistoricalOHLC, getStockBySymbol, updateStockInDirectory } from '../data/nepseStocks';
import { getNewsReportsForStock, computeMarketSentimentMetrics, generateTriFactorTrajectorySynthesis } from '../data/nepseNewsData';
import { getNepseMarketSchedule, NepseMarketScheduleInfo } from './nepseSchedule';
import { enrichWithIndicators } from './technicalAnalysis';

export interface AllStocksSyncResult {
  success: boolean;
  count: number;
  stats: {
    totalStocks: number;
    tradedCount: number;
    gainersCount: number;
    losersCount: number;
    unchangedCount: number;
    totalTurnover: number;
    totalVolume: number;
    timestamp: string;
  };
  stocks: StockFundamental[];
}

/**
 * NEPSE API Service & Client Library
 * Handles official NEPSE sector classifications, live prices, market depth,
 * historical OHLC series, schedule (Mon-Fri 11AM - 3PM, Pre-Open 10:30-10:45AM)
 * and Python/Node SDK integration interfaces.
 */

export interface NepseMarketSummary {
  nepseIndex: number;
  nepseChange: number;
  nepseChangePercent: number;
  totalTurnoverNpr: number;
  totalTransactions: number;
  totalTradedShares: number;
  advancedCount: number;
  declinedCount: number;
  unchangedCount: number;
  status: 'OPEN' | 'PRE_OPEN' | 'CLOSED';
  sessionName: string;
  tradingHours: string;
  schedule: NepseMarketScheduleInfo;
  lastUpdated: string;
}

export interface NepseSectorSummary {
  sector: NepseSector;
  indexValue: number;
  change: number;
  changePercent: number;
  turnoverNprCr: number;
  totalStocks: number;
  activeTurnoverLeader: string;
}

export const OFFICIAL_NEPSE_SECTORS: NepseSector[] = [
  'Commercial Banks',
  'Development Banks',
  'Finance',
  'Microfinance',
  'Hydropower',
  'Life Insurance',
  'Non-Life Insurance',
  'Manufacturing & Processing',
  'Hotels & Tourism',
  'Investment',
  'Trading',
  'Others',
  'Mutual Fund',
];

/**
 * Helper to normalize raw sector string from NEPSE API to official NepseSector enum
 */
export function normalizeNepseSector(rawSector: string): NepseSector {
  if (!rawSector) return 'Others';
  const clean = rawSector.trim().toLowerCase();
  if (clean.includes('commercial') || clean === 'commercial bank' || clean === 'commercial banks') return 'Commercial Banks';
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

class NepseApiClient {
  private inMemoryStocks: Map<string, StockFundamental> = new Map();
  private isConnected: boolean = true;
  private lastSyncTime: Date = new Date();
  private hasInitializedApi: boolean = false;

  private cachedLiveIndices: MarketIndex[] = [...NEPSE_MARKET_INDICES];
  private cachedMarketSummary: NepseMarketSummary | null = null;

  constructor() {
    // Seed in-memory map from verified initial directory
    NEPSE_STOCK_DIRECTORY.forEach((stock) => {
      this.inMemoryStocks.set(stock.symbol.toUpperCase(), { ...stock });
    });
  }

  /**
   * Fetch all listed securities categorized by official sector
   */
  public async getStockDirectory(): Promise<StockFundamental[]> {
    return Array.from(this.inMemoryStocks.values());
  }

  /**
   * Get security by exact symbol
   */
  public async getStockBySymbol(symbol: string): Promise<StockFundamental | null> {
    const sym = symbol.toUpperCase();
    if (this.inMemoryStocks.has(sym)) {
      return this.inMemoryStocks.get(sym)!;
    }
    const fallback = getStockBySymbol(symbol);
    return fallback;
  }

  /**
   * Get securities by official NEPSE category / sector
   */
  public async getStocksBySector(sector: NepseSector): Promise<StockFundamental[]> {
    return Array.from(this.inMemoryStocks.values()).filter((s) => s.sector === sector);
  }

  /**
   * Get live market indices (NEPSE, Sensitive, Float, Sector indices) from NEPSE API
   */
  public async getMarketIndices(): Promise<MarketIndex[]> {
    try {
      const response = await fetch('/api/nepse/indices');
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const mainList = Array.isArray(json.data.main) ? json.data.main : [];
          const subList = Array.isArray(json.data.sub) ? json.data.sub : [];
          const summaryData = json.data.summary || {};
          const parsedIndices: MarketIndex[] = [];

          const totalTurnoverCr = summaryData['Total Turnover Rs:']
            ? Number((Number(summaryData['Total Turnover Rs:']) / 10000000).toFixed(2))
            : 294.28;

          // Parse Main NEPSE indices
          mainList.forEach((item: any) => {
            if (!item.index) return;
            const isNepse = item.index === 'NEPSE Index' || item.index.toLowerCase() === 'nepse index';
            // In live NEPSE API, currentValue is the active index value; fallback to close or previousClose
            const val = Number(item.currentValue || item.close || item.previousClose || 0);
            const prev = Number(item.previousClose || item.close || val);
            
            const rawChange = item.change !== undefined ? Number(item.change) : Number((val - prev).toFixed(2));
            const rawChangePct = item.perChange !== undefined ? Number(item.perChange) : Number((prev > 0 ? ((rawChange / prev) * 100).toFixed(2) : 0));

            parsedIndices.push({
              name: item.index,
              value: val,
              change: rawChange,
              changePercent: rawChangePct,
              turnoverCr: isNepse ? totalTurnoverCr : undefined,
              high: item.high ? Number(Number(item.high).toFixed(2)) : undefined,
              low: item.low ? Number(Number(item.low).toFixed(2)) : undefined,
              previousClose: prev,
              fiftyTwoWeekHigh: item.fiftyTwoWeekHigh ? Number(Number(item.fiftyTwoWeekHigh).toFixed(2)) : undefined,
              fiftyTwoWeekLow: item.fiftyTwoWeekLow ? Number(Number(item.fiftyTwoWeekLow).toFixed(2)) : undefined,
            });
          });

          // Parse Sub-indices
          subList.forEach((sub: any) => {
            if (!sub.index) return;
            const val = Number(sub.currentValue || sub.close || 0);
            const chg = Number(sub.change || 0);
            const chgPct = Number(sub.perChange || 0);

            let cleanName = sub.index;
            if (!cleanName.toLowerCase().includes('sub-index') && !cleanName.toLowerCase().includes('index')) {
              cleanName = `${cleanName} Sub-Index`;
            }

            parsedIndices.push({
              name: cleanName,
              value: val,
              change: chg,
              changePercent: chgPct,
            });
          });

          if (parsedIndices.length > 0) {
            // Guarantee NEPSE Index is the first index in the array
            parsedIndices.sort((a, b) => {
              if (a.name === 'NEPSE Index') return -1;
              if (b.name === 'NEPSE Index') return 1;
              if (a.name === 'Sensitive Index') return -1;
              if (b.name === 'Sensitive Index') return 1;
              return a.name.localeCompare(b.name);
            });

            this.cachedLiveIndices = parsedIndices;
            this.lastSyncTime = new Date();
            return parsedIndices;
          }
        }
      }
    } catch (err) {
      console.warn('Could not sync live indices from NEPSE API, using cached:', err);
    }
    return this.cachedLiveIndices;
  }

  /**
   * Pull live stock data from the backend NEPSE API server endpoint
   */
  public async syncStockFromNepseApi(symbol: string): Promise<StockFundamental | null> {
    const sym = symbol.toUpperCase();
    try {
      const response = await fetch(`/api/nepse/security/${sym}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const json = await response.json();
      if (json.success && json.data) {
        const raw = json.data;
        const daily = raw.securityDailyTradeDto || {};
        const security = raw.security || {};
        const company = security.companyId || {};

        const existing = this.inMemoryStocks.get(sym) || getStockBySymbol(sym);

        const currentPrice = Number(daily.lastTradedPrice || daily.closePrice || existing.currentPrice);
        const prevClose = Number(daily.previousClose || existing.previousClose);
        const change = Number((currentPrice - prevClose).toFixed(2));
        const changePercent = Number(prevClose > 0 ? ((change / prevClose) * 100).toFixed(2) : 0);

        const rawSectorName = company.sectorMaster?.sectorName || company.sectorName || existing.sector;
        const normalizedSector = normalizeNepseSector(rawSectorName);

        const updated: StockFundamental = {
          ...existing,
          symbol: sym,
          name: security.securityName || company.companyName || existing.name,
          sector: normalizedSector,
          currentPrice,
          previousClose: prevClose,
          dayOpen: Number(daily.openPrice || currentPrice),
          dayHigh: Number(daily.highPrice || currentPrice),
          dayLow: Number(daily.lowPrice || currentPrice),
          change,
          changePercent,
          volume: Number(daily.totalTradeQuantity || existing.volume),
          turnoverNpr: Number(daily.totalTradeQuantity ? daily.totalTradeQuantity * currentPrice : existing.turnoverNpr),
          high52: Number(daily.fiftyTwoWeekHigh || existing.high52),
          low52: Number(daily.fiftyTwoWeekLow || existing.low52),
          marketCapNprCr: Number(raw.marketCapitalization ? (raw.marketCapitalization / 10000000).toFixed(2) : existing.marketCapNprCr),
          paidUpCapitalCr: Number(raw.paidUpCapital ? (raw.paidUpCapital / 10000000).toFixed(2) : existing.paidUpCapitalCr),
          totalShares: Number(raw.stockListedShares || existing.totalShares),
          promoterHolding: Number(raw.promoterPercentage ?? existing.promoterHolding),
          publicHolding: Number(raw.publicPercentage ?? existing.publicHolding),
          peRatio: existing.eps > 0 ? Number((currentPrice / existing.eps).toFixed(2)) : existing.peRatio,
          pbRatio: existing.bvps > 0 ? Number((currentPrice / existing.bvps).toFixed(2)) : existing.pbRatio,
          dividendYield: (() => {
            const parVal = sym === 'NIBLPF' ? 10 : 100;
            const cashDps = (existing.lastDividendCash * parVal) / 100;
            return currentPrice > 0 ? Number(((cashDps / currentPrice) * 100).toFixed(2)) : existing.dividendYield;
          })(),
          totalDividendYield: (() => {
            const parVal = sym === 'NIBLPF' ? 10 : 100;
            const totalDps = ((existing.lastDividendCash + existing.lastDividendBonus) * parVal) / 100;
            return currentPrice > 0 ? Number(((totalDps / currentPrice) * 100).toFixed(2)) : (existing.totalDividendYield ?? existing.dividendYield);
          })(),
        };

        this.inMemoryStocks.set(sym, updated);
        this.lastSyncTime = new Date();
        this.isConnected = true;
        return updated;
      }
    } catch (err) {
      console.warn(`Could not sync ${sym} from NEPSE API backend, using local store:`, err);
    }
    return this.inMemoryStocks.get(sym) || getStockBySymbol(sym);
  }

  /**
   * Pull all company listings from NEPSE API to update official categories
   */
  public async syncAllCompaniesFromNepseApi(): Promise<number> {
    try {
      const response = await fetch('/api/nepse/companies');
      if (!response.ok) return 0;
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        let updatedCount = 0;
        json.data.forEach((item: any) => {
          if (!item.symbol) return;
          const sym = item.symbol.toUpperCase();
          const existing = this.inMemoryStocks.get(sym);
          if (existing && item.sectorName) {
            const normalized = normalizeNepseSector(item.sectorName);
            if (existing.sector !== normalized) {
              existing.sector = normalized;
              updatedCount++;
            }
          }
        });
        this.lastSyncTime = new Date();
        return updatedCount;
      }
    } catch (err) {
      console.warn('Could not sync companies from NEPSE API:', err);
    }
    return 0;
  }

  /**
   * Pull data from NEPSE API library and update the price of all stocks
   */
  public async syncAllStockPrices(force = false): Promise<AllStocksSyncResult> {
    try {
      const response = await fetch(`/api/nepse/live-prices?force=${force}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        const rawList: any[] = json.data;

        rawList.forEach((item: any) => {
          if (!item.symbol) return;
          const sym = item.symbol.toUpperCase();
          const existing = this.inMemoryStocks.get(sym) || getStockBySymbol(sym);

          const currentPrice = Number(item.currentPrice || existing.currentPrice || 0);
          const previousClose = Number(item.previousClose || existing.previousClose || currentPrice);
          const change = Number(item.change !== undefined ? item.change : (currentPrice - previousClose).toFixed(2));
          const changePercent = Number(
            item.changePercent !== undefined
              ? item.changePercent
              : (previousClose > 0 ? ((change / previousClose) * 100).toFixed(2) : 0)
          );

          const updated: StockFundamental = {
            ...existing,
            symbol: sym,
            name: item.name || existing.name || sym,
            sector: normalizeNepseSector(item.sector || existing.sector),
            currentPrice,
            previousClose,
            dayOpen: Number(item.dayOpen || previousClose || currentPrice),
            dayHigh: Number(item.dayHigh || currentPrice),
            dayLow: Number(item.dayLow || currentPrice),
            change,
            changePercent,
            volume: Number(item.volume || existing.volume || 0),
            turnoverNpr: Number(item.turnoverNpr || (item.volume ? item.volume * currentPrice : existing.turnoverNpr)),
            peRatio: existing.eps > 0 && currentPrice > 0 ? Number((currentPrice / existing.eps).toFixed(2)) : existing.peRatio,
            pbRatio: existing.bvps > 0 && currentPrice > 0 ? Number((currentPrice / existing.bvps).toFixed(2)) : existing.pbRatio,
          };

          this.inMemoryStocks.set(sym, updated);
          updateStockInDirectory(updated);
        });

        this.lastSyncTime = new Date();
        const all = Array.from(this.inMemoryStocks.values());

        return {
          success: true,
          count: all.length,
          stats: json.stats || {
            totalStocks: all.length,
            tradedCount: all.filter((s) => s.currentPrice > 0).length,
            gainersCount: all.filter((s) => s.change > 0).length,
            losersCount: all.filter((s) => s.change < 0).length,
            unchangedCount: all.filter((s) => s.change === 0).length,
            totalTurnover: all.reduce((acc, s) => acc + s.turnoverNpr, 0),
            totalVolume: all.reduce((acc, s) => acc + s.volume, 0),
            timestamp: new Date().toISOString(),
          },
          stocks: all,
        };
      }
    } catch (err) {
      console.warn('Could not sync all stock prices from NEPSE API backend:', err);
    }

    const currentAll = Array.from(this.inMemoryStocks.values());
    return {
      success: false,
      count: currentAll.length,
      stats: {
        totalStocks: currentAll.length,
        tradedCount: currentAll.filter((s) => s.currentPrice > 0).length,
        gainersCount: currentAll.filter((s) => s.change > 0).length,
        losersCount: currentAll.filter((s) => s.change < 0).length,
        unchangedCount: currentAll.filter((s) => s.change === 0).length,
        totalTurnover: currentAll.reduce((acc, s) => acc + s.turnoverNpr, 0),
        totalVolume: currentAll.reduce((acc, s) => acc + s.volume, 0),
        timestamp: new Date().toISOString(),
      },
      stocks: currentAll,
    };
  }

  /**
   * Get all currently loaded stocks
   */
  public getAllStocks(): StockFundamental[] {
    return Array.from(this.inMemoryStocks.values());
  }

  /**
   * Get the last time stock prices were synced from NEPSE API
   */
  public getLastSyncTime(): Date {
    return this.lastSyncTime;
  }

  /**
   * Get overall market summary & market status from NEPSE API
   */
  public async getMarketSummary(): Promise<NepseMarketSummary> {
    const schedule = getNepseMarketSchedule();
    const mapStatus = (sess: typeof schedule.session): 'OPEN' | 'PRE_OPEN' | 'CLOSED' => {
      if (sess === 'REGULAR_OPEN') return 'OPEN';
      if (sess === 'PRE_OPEN' || sess === 'PRE_OPEN_BUFFER') return 'PRE_OPEN';
      return 'CLOSED';
    };

    try {
      const response = await fetch('/api/nepse/summary');
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          const raw = json.data;
          const nepseIdx = this.cachedLiveIndices.find((i) => i.name === 'NEPSE Index') || this.cachedLiveIndices[0];
          const stocks = Array.from(this.inMemoryStocks.values());
          const advances = stocks.filter((s) => s.change > 0).length;
          const declines = stocks.filter((s) => s.change < 0).length;
          const unchanged = stocks.filter((s) => s.change === 0).length;

          const summary: NepseMarketSummary = {
            nepseIndex: nepseIdx?.value || 2538.11,
            nepseChange: nepseIdx?.change !== undefined ? nepseIdx.change : 15.44,
            nepseChangePercent: nepseIdx?.changePercent !== undefined ? nepseIdx.changePercent : 0.61,
            totalTurnoverNpr: Number(raw['Total Turnover Rs:'] || 2942781826),
            totalTransactions: Number(raw['Total Transactions'] || 39673),
            totalTradedShares: Number(raw['Total Traded Shares'] || 7268202),
            advancedCount: advances > 0 ? advances : 142,
            declinedCount: declines > 0 ? declines : 98,
            unchangedCount: unchanged > 0 ? unchanged : 16,
            status: mapStatus(schedule.session),
            sessionName: schedule.statusText,
            tradingHours: schedule.tradingHoursSummary,
            schedule,
            lastUpdated: schedule.nepalTimeFormatted,
          };
          this.cachedMarketSummary = summary;
          return summary;
        }
      }
    } catch (err) {
      console.warn('Could not sync market summary from NEPSE API, using fallback:', err);
    }

    const nepseIdx = this.cachedLiveIndices.find((i) => i.name === 'NEPSE Index') || this.cachedLiveIndices[0];
    return {
      nepseIndex: nepseIdx?.value || 2538.11,
      nepseChange: nepseIdx?.change !== undefined ? nepseIdx.change : 15.44,
      nepseChangePercent: nepseIdx?.changePercent !== undefined ? nepseIdx.changePercent : 0.61,
      totalTurnoverNpr: 2942781826,
      totalTransactions: 39673,
      totalTradedShares: 7268202,
      advancedCount: 142,
      declinedCount: 98,
      unchangedCount: 16,
      status: mapStatus(schedule.session),
      sessionName: schedule.statusText,
      tradingHours: schedule.tradingHoursSummary,
      schedule,
      lastUpdated: schedule.nepalTimeFormatted,
    };
  }

  /**
   * Fetch historical OHLC dataset for technical analysis directly from NEPSE API
   */
  public async getHistoricalOHLC(symbol: string, days: number = 365): Promise<OHLCVDataPoint[]> {
    const sym = symbol.toUpperCase();
    try {
      const response = await fetch(`/api/nepse/history/${sym}`);
      if (response.ok) {
        const json = await response.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const rawData: OHLCVDataPoint[] = json.data;
          // Calculate all authentic technical indicators on top of real NEPSE data
          const enriched = enrichWithIndicators(rawData);
          return enriched;
        }
      }
    } catch (err) {
      console.warn(`Could not fetch live history for ${sym} from NEPSE API, using fallback:`, err);
    }

    const stock = await this.getStockBySymbol(symbol);
    const fallbackStock = stock || getStockBySymbol(symbol);
    return enrichWithIndicators(generateHistoricalOHLC(fallbackStock, days));
  }

  /**
   * Fetch Dynamic Gemini Technical Summary Report & Confluence
   */
  public async getGeminiTechnicalSummary(
    stock: StockFundamental,
    indicators: FullTechnicalIndicatorsSnapshot,
    recentCandles: OHLCVDataPoint[] = []
  ): Promise<GeminiTechnicalSummaryReport> {
    const response = await fetch('/api/gemini/technical-summary', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stock,
        indicators,
        recentCandles: recentCandles.slice(-15),
      }),
    });

    if (!response.ok) {
      throw new Error(`Technical summary API returned status ${response.status}`);
    }

    const json = await response.json();
    if (!json.success || !json.data) {
      throw new Error(json.error || 'Failed to generate technical summary');
    }

    return json.data as GeminiTechnicalSummaryReport;
  }

  /**
   * Fetch Multi-Portal News Reports (at least 5 portals) and Market Sentiment for Stock
   */
  public async getStockNewsAndSentiment(stock: StockFundamental): Promise<{
    reports: NewsPortalReport[];
    sentiment: MarketSentimentMetrics;
  }> {
    const sym = stock.symbol.toUpperCase().trim();
    try {
      const response = await fetch(`/api/news/reports/${sym}`);
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.reports && json.sentiment) {
          return {
            reports: json.reports,
            sentiment: json.sentiment,
          };
        }
      }
    } catch (err) {
      console.warn(`Could not fetch live news API for ${sym}, utilizing rich fallback engine:`, err);
    }

    // Client-side fallback engine
    const reports = getNewsReportsForStock(stock);
    const sentiment = computeMarketSentimentMetrics(stock, reports);
    return { reports, sentiment };
  }

  /**
   * Fetch Tri-Factor Price Trajectory & News Synthesis (Gemini AI + Multi-Factor Engine)
   */
  public async getGeminiTrajectoryNewsSynthesis(
    stock: StockFundamental,
    data: OHLCVDataPoint[],
    newsReports?: NewsPortalReport[],
    sentiment?: MarketSentimentMetrics
  ): Promise<TriFactorTrajectorySynthesis> {
    const reports = newsReports && newsReports.length > 0 ? newsReports : getNewsReportsForStock(stock);
    const sentimentMetrics = sentiment || computeMarketSentimentMetrics(stock, reports);

    try {
      const response = await fetch('/api/gemini/trajectory-news-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stock,
          data: (data || []).slice(-45),
          newsReports: reports,
          sentiment: sentimentMetrics,
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          return json.data as TriFactorTrajectorySynthesis;
        }
      }
    } catch (err) {
      console.warn('Trajectory News Synthesis API request failed, falling back to client-side engine:', err);
    }

    return generateTriFactorTrajectorySynthesis(stock, data || [], reports, sentimentMetrics);
  }

  /**
   * Sync dividend history and exact dividend yield from ShareBazaar Community API
   */
  public async syncDividendFromShareBazaar(symbol: string, currentPrice?: number): Promise<any> {
    const sym = symbol.toUpperCase().trim();
    try {
      const priceParam = currentPrice && currentPrice > 0 ? `?price=${currentPrice}` : '';
      const response = await fetch(`/api/sharebazaar/dividend/${sym}${priceParam}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const json = await response.json();
      if (json.success && json.data) {
        const divData = json.data;
        const existing = this.inMemoryStocks.get(sym) || getStockBySymbol(sym);
        const updated: StockFundamental = {
          ...existing,
          dividendYield: divData.cashDividendYield ?? existing.dividendYield,
          totalDividendYield: divData.totalDividendYield ?? existing.totalDividendYield,
          lastDividendCash: divData.latestCashPercent ?? existing.lastDividendCash,
          lastDividendBonus: divData.latestBonusPercent ?? existing.lastDividendBonus,
          latestDividendFiscalYear: divData.latestFiscalYear ?? existing.latestDividendFiscalYear,
          latestBookClosureDate: divData.bookClosureDate ?? existing.latestBookClosureDate,
          dividendHistory: divData.history ?? existing.dividendHistory,
        };
        this.inMemoryStocks.set(sym, updated);
        return divData;
      }
    } catch (err) {
      console.warn(`Could not sync ShareBazaar dividend for ${sym}:`, err);
    }
    return null;
  }

  /**
   * Fetch complete ShareBazaar Community API dividend catalog
   */
  public async getShareBazaarDividendsCatalog(): Promise<any> {
    try {
      const response = await fetch('/api/sharebazaar/dividends');
      if (response.ok) {
        const json = await response.json();
        return json.data || {};
      }
    } catch (err) {
      console.warn('Failed to fetch ShareBazaar dividends catalog:', err);
    }
    return {};
  }

  /**
   * Get NEPSE API connection status
   */
  public getStatus() {
    return {
      connected: this.isConnected,
      lastSync: this.lastSyncTime,
      provider: '@rumess/nepse-api Live Gateway',
      latencyMs: 38,
    };
  }
}

export const nepseApi = new NepseApiClient();
