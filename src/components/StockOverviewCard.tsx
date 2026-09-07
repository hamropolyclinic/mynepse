import React, { useState } from 'react';
import { ArrowUpRight, ArrowDownRight, Calendar, ShieldCheck, Activity, Info, Building2 } from 'lucide-react';
import { StockFundamental } from '../types/nepse';
import { getCapitalizationInfo } from '../utils/capitalization';
import { CapitalizationModal } from './CapitalizationModal';

interface StockOverviewCardProps {
  stock: StockFundamental;
}

export const StockOverviewCard: React.FC<StockOverviewCardProps> = ({ stock }) => {
  const [isCapModalOpen, setIsCapModalOpen] = useState(false);
  const isPositive = stock.change >= 0;
  const capInfo = getCapitalizationInfo(stock.marketCapNprCr);
  
  // Calculate 52-week position percentage
  const range52 = stock.high52 - stock.low52;
  const current52Pos = range52 > 0 ? Math.min(100, Math.max(0, ((stock.currentPrice - stock.low52) / range52) * 100)) : 50;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl relative overflow-hidden">
      {/* Background glow accent */}
      <div 
        className={`absolute -right-20 -top-20 w-72 h-72 rounded-full blur-3xl pointer-events-none opacity-10 ${
          isPositive ? 'bg-emerald-500' : 'bg-rose-500'
        }`}
      />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
        {/* Left: Ticker & Name & Price */}
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl lg:text-3xl font-mono font-extrabold text-white tracking-tight">
              {stock.symbol}
            </h1>
          </div>
          
          {/* Stock Name with Capitalization Status Button */}
          <div className="flex items-center gap-2.5 mt-1.5 flex-wrap">
            <p className="text-sm text-slate-300 font-normal">
              {stock.name}
            </p>

            <button
              id="stock-capitalization-status-btn"
              type="button"
              onClick={() => setIsCapModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95 ${capInfo.badgeClass}`}
              title={`Click to view capitalization status & NEPSE tier details for ${stock.symbol}`}
            >
              <span>{capInfo.label}</span>
              <span className="opacity-75 text-[10px] font-mono">({capInfo.shortCapDisplay})</span>
              <Info className="w-3 h-3 opacity-70 ml-0.5" />
            </button>
          </div>

          <div className="flex items-baseline gap-4 mt-3.5 flex-wrap">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xs font-semibold text-slate-400">Rs.</span>
              <span className="text-3xl lg:text-4xl font-mono font-extrabold text-white tracking-tight">
                {stock.currentPrice.toFixed(2)}
              </span>
            </div>

            <div
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-mono font-bold ${
                isPositive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
              }`}
            >
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{isPositive ? '+Rs. ' : '-Rs. '}{Math.abs(stock.change).toFixed(2)}</span>
              <span>({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)</span>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              Prev Close: <span className="font-mono text-slate-300 font-semibold">Rs. {stock.previousClose.toFixed(2)}</span>
            </span>
          </div>
        </div>

        {/* Right: Today's Session High/Low & 52-Week Range in Bento Cells */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3.5 lg:min-w-[380px]">
          {/* Day Open & Volume */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Day Open</div>
            <div className="text-lg font-mono font-bold text-slate-100 mt-1">Rs. {stock.dayOpen.toFixed(2)}</div>
            <div className="text-[10px] text-slate-500 mt-1">H: {stock.dayHigh.toFixed(1)} | L: {stock.dayLow.toFixed(1)}</div>
          </div>

          {/* Volume & Turnover */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Traded Volume</div>
            <div className="text-lg font-mono font-bold text-slate-100 mt-1">{stock.volume.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500 mt-1">
              Turnover: Rs. {(stock.turnoverNpr / 10000000).toFixed(2)} Cr
            </div>
          </div>

          {/* 52-Week Range Bar */}
          <div className="col-span-2 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5">
            <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase tracking-wider font-semibold mb-2">
              <span>52W Low: <strong className="text-slate-300 font-mono">Rs. {stock.low52.toFixed(1)}</strong></span>
              <span>52W High: <strong className="text-slate-300 font-mono">Rs. {stock.high52.toFixed(1)}</strong></span>
            </div>
            
            {/* Visual Range bar with needle */}
            <div className="relative w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 rounded-full opacity-80"
                style={{ width: '100%' }}
              />
            </div>
            <div className="relative w-full h-2 mt-0.5">
              <div
                className="absolute -top-3 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${current52Pos}%` }}
              >
                <div className="w-2.5 h-2.5 rotate-45 bg-white border border-slate-900 shadow"></div>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 text-right mt-1 font-mono">
              Position: {current52Pos.toFixed(1)}% of 52W Range
            </div>
          </div>
        </div>
      </div>

      {/* Mini quick-metrics Bento sub-grid footer strip */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-xs">
        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50 flex flex-col">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider">P/E Ratio</span>
          <span className="font-mono font-bold text-slate-200 mt-0.5">{stock.peRatio.toFixed(2)}x</span>
        </div>
        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50 flex flex-col">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider">EPS</span>
          <span className="font-mono font-bold text-slate-200 mt-0.5">Rs. {stock.eps.toFixed(2)}</span>
        </div>
        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50 flex flex-col">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider">BVPS</span>
          <span className="font-mono font-bold text-slate-200 mt-0.5">Rs. {stock.bvps.toFixed(2)}</span>
        </div>
        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50 flex flex-col">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider">Price/Book</span>
          <span className="font-mono font-bold text-slate-200 mt-0.5">{stock.pbRatio.toFixed(2)}x</span>
        </div>
        <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/50 flex flex-col">
          <span className="text-slate-400 text-[10px] uppercase tracking-wider">ROE</span>
          <span className="font-mono font-bold text-slate-200 mt-0.5">{stock.roe.toFixed(2)}%</span>
        </div>
        <button
          type="button"
          onClick={() => setIsCapModalOpen(true)}
          className="bg-slate-950/40 hover:bg-slate-800/60 p-2.5 rounded-xl border border-slate-800/50 hover:border-slate-700 flex flex-col text-left transition-colors cursor-pointer group"
          title="Click to view full capitalization status and NEPSE tier details"
        >
          <div className="flex items-center justify-between w-full">
            <span className="text-slate-400 text-[10px] uppercase tracking-wider">Market Cap</span>
            <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${capInfo.textColor}`}>
              {capInfo.label}
            </span>
          </div>
          <span className="font-mono font-bold text-slate-200 mt-0.5 group-hover:text-white">
            Rs. {stock.marketCapNprCr.toFixed(1)} Cr
          </span>
        </button>
      </div>

      {/* Capitalization Breakdown Modal */}
      <CapitalizationModal
        isOpen={isCapModalOpen}
        onClose={() => setIsCapModalOpen(false)}
        stock={stock}
      />
    </div>
  );
};
