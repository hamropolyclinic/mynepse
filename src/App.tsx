import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  getStockBySymbol, 
  generateHistoricalOHLC, 
  NEPSE_MARKET_INDICES, 
  NEPSE_STOCK_DIRECTORY 
} from './data/nepseStocks';
import { computeTechnicalSummary, enrichWithIndicators } from './utils/technicalAnalysis';
import { nepseApi } from './utils/nepseApi';
import { StockFundamental, OHLCVDataPoint, MarketIndex } from './types/nepse';
import { Header } from './components/Header';
import { NepseMarketModal } from './components/NepseMarketModal';
import { StockOverviewCard } from './components/StockOverviewCard';
import { TechnicalSignalsBar } from './components/TechnicalSignalsBar';
import { DashboardRecommendationCard } from './components/DashboardRecommendationCard';
import { InteractiveChart } from './components/InteractiveChart';
import { FundamentalMetricsCard } from './components/FundamentalMetricsCard';
import { KeyFinancialStrengthsRisksCard } from './components/KeyFinancialStrengthsRisksCard';
import { PythonScriptTab } from './components/PythonScriptTab';
import { PriceTrajectory } from './components/PriceTrajectory';
import { StockComparison } from './components/StockComparison';
import { GeminiTechnicalSummary } from './components/GeminiTechnicalSummary';
import { TrendingUp, RefreshCw, CheckCircle2, Cpu } from 'lucide-react';
import { NepseMarketSummary } from './utils/nepseApi';
import { getNepseMarketSchedule, NepseMarketScheduleInfo } from './utils/nepseSchedule';

export default function App() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>('LEC');
  const [activeTab, setActiveTab] = useState<'dashboard' | 'charts' | 'fundamentals' | 'python' | 'trajectory' | 'compare'>('dashboard');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [syncedStock, setSyncedStock] = useState<StockFundamental | null>(null);
  const [apiStatusMessage, setApiStatusMessage] = useState<string | null>(null);
  const [liveIndices, setLiveIndices] = useState<MarketIndex[]>(NEPSE_MARKET_INDICES);
  const [marketSummary, setMarketSummary] = useState<NepseMarketSummary | null>(null);
  const [isMarketModalOpen, setIsMarketModalOpen] = useState(false);
  const [marketSchedule, setMarketSchedule] = useState<NepseMarketScheduleInfo>(getNepseMarketSchedule());
  const [allStocks, setAllStocks] = useState<StockFundamental[]>(() => nepseApi.getAllStocks());
  const [isSyncingAll, setIsSyncingAll] = useState(false);
  const [syncStats, setSyncStats] = useState<any>(null);

  // Real OHLCV & indicators state fetched from NEPSE API
  const [ohlcData, setOhlcData] = useState<OHLCVDataPoint[]>(() => {
    return enrichWithIndicators(generateHistoricalOHLC(getStockBySymbol('LEC'), 250));
  });

  // Track live NEPSE market session
  useEffect(() => {
    const timer = setInterval(() => {
      setMarketSchedule(getNepseMarketSchedule());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isMarketOpen = marketSchedule.session === 'REGULAR_OPEN' || marketSchedule.session === 'PRE_OPEN' || marketSchedule.session === 'PRE_OPEN_BUFFER';

  // Synchronize stock, historical candles/volumes, and market indices from live NEPSE API
  useEffect(() => {
    let isMounted = true;
    async function loadLiveData() {
      setIsLoadingChart(true);
      try {
        const [liveStock, indices, summary, history] = await Promise.allSettled([
          nepseApi.syncStockFromNepseApi(selectedSymbol),
          nepseApi.getMarketIndices(),
          nepseApi.getMarketSummary(),
          nepseApi.getHistoricalOHLC(selectedSymbol, 250),
        ]);

        if (isMounted) {
          if (liveStock.status === 'fulfilled' && liveStock.value) {
            setSyncedStock(liveStock.value);
            setApiStatusMessage(`Live NEPSE Data synced for ${liveStock.value.symbol}: Rs. ${liveStock.value.currentPrice} (${liveStock.value.sector})`);
            setTimeout(() => {
              if (isMounted) setApiStatusMessage(null);
            }, 4000);
          }
          if (indices.status === 'fulfilled' && indices.value.length > 0) {
            setLiveIndices(indices.value);
          }
          if (summary.status === 'fulfilled' && summary.value) {
            setMarketSummary(summary.value);
          }
          if (history.status === 'fulfilled' && history.value && history.value.length > 0) {
            setOhlcData(history.value);
          }
        }
      } catch (err) {
        console.warn('Live API sync notice:', err);
      } finally {
        if (isMounted) {
          setIsLoadingChart(false);
        }
      }
    }
    loadLiveData();
    return () => {
      isMounted = false;
    };
  }, [selectedSymbol, refreshKey]);

  // Initial batch sync of NEPSE company sector classifications and all stock prices
  const handleSyncAllStocks = useCallback(async (force = true) => {
    setIsSyncingAll(true);
    try {
      const result = await nepseApi.syncAllStockPrices(force);
      if (result.success && result.stocks) {
        setAllStocks(result.stocks);
        setSyncStats(result.stats);

        // Update currently selected stock if updated in batch
        const matched = result.stocks.find(
          (s) => s.symbol.toUpperCase() === selectedSymbol.toUpperCase()
        );
        if (matched) {
          setSyncedStock(matched);
        }

        setApiStatusMessage(
          `Updated prices for all stocks from NEPSE API: ${result.stats.tradedCount} active trades, ${result.stats.totalStocks} listed securities.`
        );
        setTimeout(() => setApiStatusMessage(null), 5000);
      }
    } catch (err: any) {
      console.warn('Could not sync all stock prices from NEPSE API:', err);
    } finally {
      setIsSyncingAll(false);
    }
  }, [selectedSymbol]);

  useEffect(() => {
    nepseApi.syncAllCompaniesFromNepseApi().catch(() => {});
    handleSyncAllStocks(false).catch(() => {});
  }, [handleSyncAllStocks]);

  // Current stock metadata with live synced overrides
  const currentStock: StockFundamental = useMemo(() => {
    if (syncedStock && syncedStock.symbol.toUpperCase() === selectedSymbol.toUpperCase()) {
      return syncedStock;
    }
    const foundInAll = allStocks.find((s) => s.symbol.toUpperCase() === selectedSymbol.toUpperCase());
    if (foundInAll) {
      return foundInAll;
    }
    return getStockBySymbol(selectedSymbol);
  }, [selectedSymbol, syncedStock, allStocks]);

  // Compute overall technical confluence summary from authentic NEPSE data
  const technicalSummary = useMemo(() => {
    return computeTechnicalSummary(ohlcData);
  }, [ohlcData]);

  const [secondsUntilRefresh, setSecondsUntilRefresh] = useState<number>(60);

  const handleSelectStock = useCallback((symbol: string) => {
    setSelectedSymbol(symbol.trim().toUpperCase());
    setSecondsUntilRefresh(60);
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setSecondsUntilRefresh(60);
    try {
      const [live, indices, summary, history] = await Promise.allSettled([
        nepseApi.syncStockFromNepseApi(selectedSymbol),
        nepseApi.getMarketIndices(),
        nepseApi.getMarketSummary(),
        nepseApi.getHistoricalOHLC(selectedSymbol, 250),
        nepseApi.syncAllStockPrices(true),
      ]);
      if (live.status === 'fulfilled' && live.value) {
        setSyncedStock(live.value);
      }
      if (indices.status === 'fulfilled' && indices.value.length > 0) {
        setLiveIndices(indices.value);
      }
      if (summary.status === 'fulfilled' && summary.value) {
        setMarketSummary(summary.value);
      }
      if (history.status === 'fulfilled' && history.value && history.value.length > 0) {
        setOhlcData(history.value);
      }
      setAllStocks(nepseApi.getAllStocks());
      setRefreshKey((k) => k + 1);
    } catch (e) {
      setRefreshKey((k) => k + 1);
    } finally {
      setTimeout(() => {
        setIsRefreshing(false);
      }, 500);
    }
  }, [selectedSymbol]);

  // Automatic refresh every 1 minute (60s) strictly while market is open
  useEffect(() => {
    if (!isMarketOpen) {
      setSecondsUntilRefresh(60);
      return;
    }

    const timer = setInterval(() => {
      setSecondsUntilRefresh((prev) => {
        if (prev <= 1) {
          handleRefresh();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isMarketOpen, handleRefresh]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <Header
        indices={liveIndices}
        currentStock={currentStock}
        stocks={allStocks}
        onSelectStock={handleSelectStock}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        secondsUntilRefresh={secondsUntilRefresh}
        isMarketOpen={isMarketOpen}
        marketSchedule={marketSchedule}
        onOpenNepseModal={() => setIsMarketModalOpen(true)}
      />

      {/* NEPSE Market Overview & Sub-indices Modal */}
      <NepseMarketModal
        isOpen={isMarketModalOpen}
        onClose={() => setIsMarketModalOpen(false)}
        indices={liveIndices}
        summary={marketSummary}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Live Sync Status Toast Banner */}
      {apiStatusMessage && (
        <div className="bg-emerald-950/80 border-b border-emerald-500/30 text-emerald-300 px-4 py-2 text-xs font-mono flex items-center justify-between transition-all animate-fadeIn">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{apiStatusMessage}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/80">
              <Cpu className="w-3 h-3" />
              <span>@rumess/nepse-api</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6 space-y-6">
        {/* Active Stock Hero Card (Always visible across all tabs for consistent context) */}
        <StockOverviewCard stock={currentStock} />

        {/* Tab 1: Comprehensive Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Multi-Factor Recommendation (Technicals + Fundamentals + 5 News Portals + Sentiment) */}
            <DashboardRecommendationCard 
              stock={currentStock} 
              ohlcData={ohlcData} 
              technicalSummary={technicalSummary} 
            />

            {/* Interactive Candlestick Chart */}
            <InteractiveChart data={ohlcData} symbol={currentStock.symbol} isLoading={isLoadingChart} />

            {/* Key Financial Strengths & Risks */}
            <KeyFinancialStrengthsRisksCard stock={currentStock} />
          </div>
        )}

        {/* Tab 2: Full-screen Technical Charts */}
        {activeTab === 'charts' && (
          <div className="space-y-6">
            <InteractiveChart data={ohlcData} symbol={currentStock.symbol} isLoading={isLoadingChart} />
            <TechnicalSignalsBar summary={technicalSummary} ticker={currentStock.symbol} />
            <GeminiTechnicalSummary
              stock={currentStock}
              ohlcData={ohlcData}
              allStocks={allStocks}
              onSelectStock={handleSelectStock}
            />
          </div>
        )}

        {/* Tab 3: Detailed Fundamental Valuation */}
        {activeTab === 'fundamentals' && (
          <div className="space-y-6">
            <FundamentalMetricsCard stock={currentStock} />
          </div>
        )}

        {/* Tab 4: Python Script & Streamlit Hub */}
        {activeTab === 'python' && (
          <div className="space-y-6">
            <PythonScriptTab stock={currentStock} />
          </div>
        )}

        {/* Tab: Quantitative Price Trajectory */}
        {activeTab === 'trajectory' && (
          <div className="space-y-6">
            <PriceTrajectory data={ohlcData} stock={currentStock} />
          </div>
        )}

        {/* Tab 6: Sector Peer Comparison */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <StockComparison
              currentStock={currentStock}
              onSelectStock={handleSelectStock}
              allStocks={allStocks}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-400">NEPSE Analytics & Technical Dashboard</span>
            <span>— Live Nepal Stock Exchange Intelligence Gateway</span>
          </div>
          <div className="font-mono text-[11px] text-slate-500">
            Powered by @rumess/nepse-api & Live Financial Data Gateway
          </div>
        </div>
      </footer>
    </div>
  );
}
