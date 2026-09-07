import React, { useEffect } from 'react';
import { X, Building2, Layers, ShieldCheck, Activity, Users, Info, CheckCircle2 } from 'lucide-react';
import { StockFundamental } from '../types/nepse';
import { getCapitalizationInfo } from '../utils/capitalization';

interface CapitalizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  stock: StockFundamental;
}

export const CapitalizationModal: React.FC<CapitalizationModalProps> = ({
  isOpen,
  onClose,
  stock,
}) => {
  const capInfo = getCapitalizationInfo(stock.marketCapNprCr);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id="capitalization-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="capitalization-modal-dialog"
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-150 my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs uppercase font-mono tracking-wider text-slate-400 font-semibold">
                  Capitalization Classification
                </span>
                <span className="text-slate-600">•</span>
                <span className="font-mono font-bold text-white text-sm">
                  {stock.symbol}
                </span>
              </div>
              <h2 className="text-lg font-bold text-white tracking-tight mt-0.5">
                {stock.name}
              </h2>
            </div>
          </div>

          <button
            id="close-cap-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Active Capitalization Status Banner */}
          <div className={`p-4 sm:p-5 rounded-2xl border ${capInfo.borderColor} ${capInfo.bgSubtle} relative overflow-hidden`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${capInfo.dotColor} animate-pulse`} />
                  <span className="text-xs uppercase tracking-widest font-mono text-slate-400 font-semibold">
                    Current Status
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-mono font-extrabold text-white tracking-tight">
                  {capInfo.fullLabel}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
                  {capInfo.summary}
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:text-right shrink-0">
                <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
                  Market Cap
                </div>
                <div className="text-lg sm:text-xl font-mono font-extrabold text-white">
                  Rs. {stock.marketCapNprCr.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Cr
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  Rs. {capInfo.marketCapArba.toFixed(2)} Arba
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Current Price</span>
              <span className="font-mono font-bold text-white text-base mt-1">Rs. {stock.currentPrice.toFixed(2)}</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Per Share (LTP)</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Paid-Up Capital</span>
              <span className="font-mono font-bold text-white text-base mt-1">Rs. {stock.paidUpCapitalCr.toFixed(1)} Cr</span>
              <span className="text-[10px] text-slate-500 mt-0.5">Equity Base</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Total Shares</span>
              <span className="font-mono font-bold text-white text-base mt-1">{(stock.totalShares / 10000000).toFixed(2)} Cr</span>
              <span className="text-[10px] text-slate-500 mt-0.5">{stock.totalShares.toLocaleString()} units</span>
            </div>
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 flex flex-col">
              <span className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Sector</span>
              <span className="font-mono font-bold text-emerald-400 text-sm mt-1 truncate">{stock.sector}</span>
              <span className="text-[10px] text-slate-500 mt-0.5">NEPSE Category</span>
            </div>
          </div>

          {/* NEPSE Benchmark Capitalization Standards Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider font-mono font-bold text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                NEPSE Market Capitalization Classification Standards
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">1 Arba = 100 Crore</span>
            </div>

            <div className="space-y-2.5">
              {/* High Cap Row */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  capInfo.tier === 'HIGH_CAP'
                    ? 'bg-indigo-950/30 border-indigo-500/50 ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400" />
                    <span className="font-bold text-xs text-white">High Cap (Large-Cap)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                      ≥ Rs. 3,000 Cr (Rs. 30 Arba+)
                    </span>
                  </div>
                  {capInfo.tier === 'HIGH_CAP' && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Current Stock
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Blue-chip institutional enterprises (e.g. top commercial banks, reinsurance, utilities). Characterized by high market liquidity, robust balance sheets, and low relative price volatility.
                </p>
              </div>

              {/* Mid Cap Row */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  capInfo.tier === 'MID_CAP'
                    ? 'bg-amber-950/30 border-amber-500/50 ring-1 ring-amber-500/30'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span className="font-bold text-xs text-white">Mid Cap (Middle-Tier)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 border border-slate-700">
                      Rs. 1,000 Cr – 3,000 Cr (Rs. 10 – 30 Arba)
                    </span>
                  </div>
                  {capInfo.tier === 'MID_CAP' && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Current Stock
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Established corporations with proven track records. Offers a balanced blend of capital appreciation potential, healthy trading volume, and moderate market sensitivity.
                </p>
              </div>

              {/* Low Cap Row */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  capInfo.tier === 'LOW_CAP'
                    ? 'bg-cyan-950/30 border-cyan-500/50 ring-1 ring-cyan-500/30'
                    : 'bg-slate-950/40 border-slate-800/80 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400" />
                    <span className="font-bold text-xs text-white">Low Cap (Small-Cap)</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                      &lt; Rs. 1,000 Cr (&lt; Rs. 10 Arba)
                    </span>
                  </div>
                  {capInfo.tier === 'LOW_CAP' && (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" /> Current Stock
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  Smaller market cap companies, including small hydropowers and microfinances with tighter free-float. Prone to sharp price moves, circuit breakers, and momentum-driven retail trading.
                </p>
              </div>
            </div>
          </div>

          {/* Investment Characteristics Card */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Risk & Investment Characteristics for {stock.symbol}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Volatility Profile</div>
                <div className="text-slate-200 font-semibold mt-1">{capInfo.characteristics.volatility}</div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Trading Liquidity</div>
                <div className="text-slate-200 font-semibold mt-1">{capInfo.characteristics.liquidity}</div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Ownership Structure</div>
                <div className="text-slate-200 font-semibold mt-1">{capInfo.characteristics.institutionalOwnership}</div>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                <div className="text-slate-400 text-[10px] font-semibold uppercase tracking-wider">Strategy Fit</div>
                <div className="text-slate-200 font-semibold mt-1">{capInfo.characteristics.riskProfile}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Market capitalization is computed as <code>Current LTP × Total Listed Shares</code></span>
          </div>
          <button
            id="modal-done-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
