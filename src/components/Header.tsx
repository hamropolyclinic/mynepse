import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  RefreshCw, 
  BarChart3, 
  PieChart, 
  SlidersHorizontal,
  Compass
} from 'lucide-react';
import { MarketIndex, StockFundamental } from '../types/nepse';
import { NEPSE_STOCK_DIRECTORY } from '../data/nepseStocks';
import { NepseMarketScheduleInfo } from '../utils/nepseSchedule';

interface HeaderProps {
  indices: MarketIndex[];
  currentStock?: StockFundamental;
  stocks?: StockFundamental[];
  onSelectStock: (symbol: string) => void;
  activeTab: 'dashboard' | 'charts' | 'fundamentals' | 'python' | 'trajectory' | 'compare';
  setActiveTab: (tab: 'dashboard' | 'charts' | 'fundamentals' | 'python' | 'trajectory' | 'compare') => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  secondsUntilRefresh?: number;
  isMarketOpen?: boolean;
  marketSchedule?: NepseMarketScheduleInfo;
  onOpenNepseModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  indices,
  currentStock,
  stocks,
  onSelectStock,
  activeTab,
  setActiveTab,
  onRefresh,
  isRefreshing,
  secondsUntilRefresh = 60,
  isMarketOpen = false,
  marketSchedule,
  onOpenNepseModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const stockList = stocks && stocks.length > 0 ? stocks : NEPSE_STOCK_DIRECTORY;

  const filteredStocks = stockList.filter(
    (s) =>
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sector.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 15); // Limit dropdown to 15 quick results for optimal responsiveness

  const nepseIndex = indices?.find(
    (i) => i.name.toLowerCase().includes('nepse') || i.name === 'NEPSE Index'
  ) || indices?.[0];
  const isNepsePositive = nepseIndex ? nepseIndex.change >= 0 : true;

  const isSessionOpen = marketSchedule?.session === 'REGULAR_OPEN' || isMarketOpen;
  const isSessionPreOpen = marketSchedule?.session === 'PRE_OPEN' || marketSchedule?.session === 'PRE_OPEN_BUFFER';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onSelectStock(searchQuery.trim().toUpperCase());
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-40">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand, NEPSE Index & Market Session Indicators (Left side) */}
        <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto justify-between md:justify-start flex-wrap sm:flex-nowrap">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3 shrink-0">
            <img
              id="header-brand-logo-img"
              src="/bikash-sand-logo.jpg"
              alt="Logo"
              className="w-8 h-8 rounded-lg object-cover border border-slate-700 shadow-md shadow-slate-900/50 hover:opacity-90 transition-opacity"
              referrerPolicy="no-referrer"
            />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                <span className="text-emerald-400">BIKASH'S</span> NEPSE
              </h1>
            </div>
          </div>

          {/* NEPSE Index & Market Session Buttons */}
          <div className="flex items-center gap-2 shrink-0 md:pl-3 md:border-l md:border-slate-800 flex-wrap sm:flex-nowrap">
            {/* NEPSE Index Button */}
            {nepseIndex && (
              <button
                id="header-nepse-index-btn"
                onClick={onOpenNepseModal}
                title="Click to view all 13 official sector indices & market turnover"
                className="bg-slate-900/90 hover:bg-slate-800/90 border border-emerald-500/30 hover:border-emerald-500/60 rounded-full px-3.5 py-1.5 flex items-center justify-between sm:justify-start gap-2.5 transition-all shadow-sm active:scale-95"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-emerald-400 tracking-wider">NEPSE</span>
                  <span className="font-mono font-extrabold text-white text-xs sm:text-sm tracking-tight">
                    {nepseIndex.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div
                  className={`flex items-center text-xs sm:text-sm font-mono font-bold pl-1.5 border-l border-slate-700/60 ${
                    isNepsePositive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {isNepsePositive ? (
                    <TrendingUp className="w-3.5 h-3.5 mr-1" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 mr-1" />
                  )}
                  <span>
                    {isNepsePositive ? '+' : ''}
                    {nepseIndex.change.toFixed(2)} ({isNepsePositive ? '+' : ''}
                    {nepseIndex.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </button>
            )}

            {/* Market Session Status Button (Near NEPSE Index) */}
            <button
              id="header-market-session-status-btn"
              onClick={onOpenNepseModal}
              title={
                marketSchedule
                  ? `NEPSE Status: ${marketSchedule.statusText} • (${marketSchedule.tradingHoursSummary})`
                  : 'NEPSE Hours: Mon-Fri 10:30 AM – 3:00 PM NPT'
              }
              className={`px-3.5 py-1.5 rounded-full border text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm active:scale-95 shrink-0 ${
                isSessionOpen
                  ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/60 shadow-emerald-950/50'
                  : isSessionPreOpen
                  ? 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-500/60'
                  : 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-500/60 shadow-rose-950/50'
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full ${
                  isSessionOpen
                    ? 'bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400'
                    : isSessionPreOpen
                    ? 'bg-amber-400 animate-pulse shadow-sm shadow-amber-400'
                    : 'bg-rose-500'
                }`}
              />
              <span
                className={`font-bold font-mono text-xs sm:text-sm tracking-wide ${
                  isSessionOpen ? 'text-emerald-400' : isSessionPreOpen ? 'text-amber-400' : 'text-rose-400'
                }`}
              >
                Market
              </span>
            </button>
          </div>
        </div>

        {/* Search Bar & Refresh Actions (Right side) */}
        <div className="flex items-center gap-2.5 sm:gap-3 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
          {/* Search Bar (Extended width) */}
          <div className="relative flex-1 md:w-80 lg:w-96">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search symbol (e.g. LEC, NABIL)..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchOpen(true);
                  }}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-full pl-9 pr-12 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono uppercase transition-colors"
                />
                <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono border border-slate-700">
                  ↵
                </kbd>
              </div>
            </form>

            {/* Dropdown Suggestions */}
            {isSearchOpen && searchQuery && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-800/50 p-1">
                {filteredStocks.length > 0 ? (
                  filteredStocks.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => {
                        onSelectStock(stock.symbol);
                        setSearchQuery('');
                        setIsSearchOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800/80 rounded-xl flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="pr-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono font-bold text-emerald-400 mr-1">{stock.symbol}</span>
                          <span className="text-slate-300">{stock.name}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                            stock.marketCapNprCr >= 3000
                              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                              : stock.marketCapNprCr >= 1000
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}>
                            {stock.marketCapNprCr >= 3000 ? 'High Cap' : stock.marketCapNprCr >= 1000 ? 'Mid Cap' : 'Low Cap'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono text-slate-200 font-semibold">Rs. {stock.currentPrice.toFixed(2)}</div>
                        <div className="text-[10px] text-slate-400">{stock.sector}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <button
                    onClick={() => {
                      onSelectStock(searchQuery.trim().toUpperCase());
                      setSearchQuery('');
                      setIsSearchOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800 rounded-xl text-xs text-slate-300 flex items-center justify-between"
                  >
                    <span>Analyze symbol &quot;<span className="font-mono text-emerald-400 font-bold">{searchQuery.toUpperCase()}</span>&quot;</span>
                    <span className="text-[11px] text-emerald-400 font-medium">Create OHLC ➔</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            id="refresh-btn"
            onClick={onRefresh}
            title={
              isMarketOpen
                ? `NEPSE is Open • Auto-refreshes every 1 min (next in ${secondsUntilRefresh}s) • Click to refresh now`
                : `Market Closed • Auto-refresh runs during open market hours (Mon-Fri 10:30AM–3PM NPT) • Click to refresh manually`
            }
            className="px-3.5 py-2 rounded-full bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 hover:border-emerald-500/50 text-xs font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : 'text-emerald-400'}`} />
            <span className="hidden sm:inline">Refresh</span>
            {isMarketOpen ? (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {secondsUntilRefresh}s
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 border border-slate-700/60 px-1.5 py-0.5 rounded-full">
                Off Hours
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Bento Segmented Control) */}
      <div className="max-w-7xl mx-auto px-4 pb-2.5">
        <div className="bg-slate-950/80 border border-slate-800/80 p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            id="tab-dashboard"
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2.5 px-4.5 py-2 sm:px-5 sm:py-2 rounded-xl text-sm sm:text-[15px] font-bold tracking-tight transition-all shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>

          <button
            id="tab-charts"
            onClick={() => setActiveTab('charts')}
            className={`flex items-center gap-2.5 px-4.5 py-2 sm:px-5 sm:py-2 rounded-xl text-sm sm:text-[15px] font-bold tracking-tight transition-all shrink-0 ${
              activeTab === 'charts'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Technical Charts
          </button>

          <button
            id="tab-fundamentals"
            onClick={() => setActiveTab('fundamentals')}
            className={`flex items-center gap-2.5 px-4.5 py-2 sm:px-5 sm:py-2 rounded-xl text-sm sm:text-[15px] font-bold tracking-tight transition-all shrink-0 ${
              activeTab === 'fundamentals'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Fundamentals
          </button>

          <button
            id="tab-trajectory"
            onClick={() => setActiveTab('trajectory')}
            className={`flex items-center gap-2.5 px-4.5 py-2 sm:px-5 sm:py-2 rounded-xl text-sm sm:text-[15px] font-bold tracking-tight transition-all shrink-0 ${
              activeTab === 'trajectory'
                ? 'bg-emerald-500 text-slate-950 font-extrabold shadow-md shadow-emerald-500/20'
                : 'text-slate-300 hover:text-white hover:bg-slate-900/80'
            }`}
          >
            <Compass className="w-4 h-4" />
            Price Trajectory
          </button>
        </div>
      </div>
    </header>
  );
};
