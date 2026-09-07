import React from 'react';
import { Layers, ArrowRight, TrendingUp, CheckCircle, Award } from 'lucide-react';
import { StockFundamental } from '../types/nepse';
import { NEPSE_STOCK_DIRECTORY } from '../data/nepseStocks';

interface StockComparisonProps {
  currentStock: StockFundamental;
  onSelectStock: (symbol: string) => void;
  allStocks?: StockFundamental[];
}

export const StockComparison: React.FC<StockComparisonProps> = ({ currentStock, onSelectStock, allStocks }) => {
  const directory = allStocks && allStocks.length > 0 ? allStocks : NEPSE_STOCK_DIRECTORY;

  // Find peers in the same sector
  const sectorPeers = directory.filter((s) => s.sector === currentStock.sector && s.currentPrice > 0);
  // Also include other popular stocks if sector has few
  const comparisonList = sectorPeers.length >= 3
    ? sectorPeers
    : directory.filter((s) => s.currentPrice > 0).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Header Bento Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  {currentStock.sector} Sector Peer Matrix
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono border border-slate-700">
                  Base: {currentStock.symbol}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Benchmark {currentStock.name} against listed industry peers on key valuation and profitability metrics
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Grid Table Bento Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 overflow-hidden shadow-xl">
        <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium bg-slate-950 uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Company Symbol</th>
                <th className="py-3 px-3 text-right">Price (Rs.)</th>
                <th className="py-3 px-3 text-right">P/E Ratio</th>
                <th className="py-3 px-3 text-right">EPS (Rs.)</th>
                <th className="py-3 px-3 text-right">BVPS (Rs.)</th>
                <th className="py-3 px-3 text-right">P/B Ratio</th>
                <th className="py-3 px-3 text-right">ROE (%)</th>
                <th className="py-3 px-3 text-right">Div. Yield</th>
                <th className="py-3 px-3 text-right">Market Cap (Cr)</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200 bg-slate-950/40">
              {comparisonList.map((peer) => {
                const isCurrent = peer.symbol === currentStock.symbol;
                return (
                  <tr
                    key={peer.symbol}
                    className={`transition-colors ${
                      isCurrent ? 'bg-emerald-500/10 font-bold border-l-4 border-l-emerald-500' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4 font-sans">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-extrabold text-emerald-400 text-sm">{peer.symbol}</span>
                        <span className="text-slate-400 text-xs hidden sm:inline truncate max-w-[150px]">
                          {peer.name}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-sans font-semibold border border-emerald-500/30">
                            ACTIVE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-100">
                      Rs. {peer.currentPrice.toFixed(1)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className={peer.peRatio < 25 ? 'text-emerald-400 font-bold' : 'text-slate-300'}>
                        {peer.peRatio.toFixed(1)}x
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-emerald-400 font-bold">
                      Rs. {peer.eps.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      Rs. {peer.bvps.toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      {peer.pbRatio.toFixed(2)}x
                    </td>
                    <td className="py-3 px-3 text-right text-indigo-300 font-bold">
                      {peer.roe.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right text-amber-300">
                      {peer.dividendYield.toFixed(2)}%
                    </td>
                    <td className="py-3 px-3 text-right text-slate-300">
                      Rs. {peer.marketCapNprCr.toFixed(0)}
                    </td>
                    <td className="py-3 px-4 text-right font-sans">
                      {!isCurrent ? (
                        <button
                          onClick={() => onSelectStock(peer.symbol)}
                          className="px-3 py-1 rounded-full bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 text-xs font-semibold transition-all flex items-center gap-1 ml-auto active:scale-95"
                        >
                          <span>Analyze</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                          <CheckCircle className="w-3.5 h-3.5" /> Active
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
