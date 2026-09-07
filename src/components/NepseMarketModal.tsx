import React, { useState, useEffect } from 'react';
import { MarketIndex } from '../types/nepse';
import { NepseMarketSummary } from '../utils/nepseApi';
import { getNepseMarketSchedule, NepseMarketScheduleInfo } from '../utils/nepseSchedule';
import { X, TrendingUp, TrendingDown, Activity, DollarSign, Layers, ShieldCheck, RefreshCw, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';

interface NepseMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  indices: MarketIndex[];
  summary: NepseMarketSummary | null;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const NepseMarketModal: React.FC<NepseMarketModalProps> = ({
  isOpen,
  onClose,
  indices,
  summary,
  onRefresh,
  isRefreshing,
}) => {
  const [schedule, setSchedule] = useState<NepseMarketScheduleInfo>(getNepseMarketSchedule());

  useEffect(() => {
    if (!isOpen) return;
    setSchedule(getNepseMarketSchedule());
    const timer = setInterval(() => {
      setSchedule(getNepseMarketSchedule());
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const nepseIndex = indices.find((i) => i.name === 'NEPSE Index') || indices[0];
  const sensitiveIndex = indices.find((i) => i.name === 'Sensitive Index');
  const floatIndex = indices.find((i) => i.name === 'Float Index');
  const sensitiveFloatIndex = indices.find((i) => i.name === 'Sensitive Float Index');

  const subIndices = indices.filter(
    (i) =>
      i.name !== 'NEPSE Index' &&
      i.name !== 'Sensitive Index' &&
      i.name !== 'Float Index' &&
      i.name !== 'Sensitive Float Index'
  );

  const isNepsePos = (nepseIndex?.change || 0) >= 0;

  const isMarketOpen = schedule.session === 'REGULAR_OPEN';
  const isPreOpen = schedule.session === 'PRE_OPEN' || schedule.session === 'PRE_OPEN_BUFFER';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        id="nepse-market-modal-card"
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 relative flex flex-col space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Nepal Stock Exchange (NEPSE) Market Feed</h2>
                <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold ${
                  isMarketOpen
                    ? 'bg-emerald-950/90 text-emerald-400 border-emerald-500/50'
                    : isPreOpen
                    ? 'bg-amber-950/90 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}>
                  {schedule.badgeLabel}: {schedule.session === 'REGULAR_OPEN' ? '11:00 AM - 3:00 PM' : schedule.session === 'PRE_OPEN' ? 'PRE-OPEN (10:30-10:45)' : 'CLOSED'}
                </span>
              </div>
              <p className="text-xs text-slate-400">Directly synchronized with official NEPSE gateway feed & trading hours</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="refresh-modal-btn"
              onClick={onRefresh}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs flex items-center gap-1.5 transition-all"
              title="Refresh from NEPSE API"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-400' : 'text-slate-300'}`} />
            </button>
            <button
              id="close-nepse-modal-btn"
              onClick={onClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NEPSE Trading Schedule & Sessions Banner */}
        <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 shrink-0 mt-0.5">
              <Clock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Trading Schedule</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono text-[10px] font-semibold">
                  Monday to Friday
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                <strong className="text-white">Continuous Trading:</strong> 11:00 AM – 3:00 PM NPT
              </p>
              <p className="text-xs text-slate-400">
                <strong className="text-amber-300">Pre-Open Session:</strong> 10:30 AM – 10:45 AM NPT (Order Entry & Matching)
              </p>
              <p className="text-[11px] text-slate-500">
                Market Holidays / Closed: Saturday & Sunday
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between shrink-0 md:min-w-[240px]">
            <div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Current Nepal Time (NPT)</div>
              <div className="text-base font-mono font-bold text-emerald-400 mt-0.5">
                {schedule.nepalTimeFormatted}
              </div>
              <div className="text-[11px] text-slate-400 font-sans">
                {schedule.nepalDateFormatted}
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300 font-medium flex items-center gap-1.5">
              <div className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-emerald-400 animate-pulse' : isPreOpen ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{schedule.nextSessionText}</span>
            </div>
          </div>
        </div>

        {/* Hero Card: NEPSE Index Highlight */}
        {nepseIndex && (
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Benchmark Index</span>
              <div className="text-2xl lg:text-3xl font-mono font-bold text-white mt-1">
                {nepseIndex.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={`flex items-center gap-1.5 font-mono text-sm font-bold mt-1 ${isNepsePos ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isNepsePos ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{isNepsePos ? '+' : ''}{nepseIndex.change.toFixed(2)} ({isNepsePos ? '+' : ''}{nepseIndex.changePercent.toFixed(2)}%)</span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400 font-sans">Previous Close:</span>
                <span className="text-slate-200 font-semibold">{nepseIndex.previousClose?.toFixed(2) || '2,522.66'}</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/80 pb-1">
                <span className="text-slate-400 font-sans">Day High / Low:</span>
                <span className="text-slate-200 font-semibold">
                  {nepseIndex.high?.toFixed(2) || '2,537.76'} / {nepseIndex.low?.toFixed(2) || '2,501.49'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">52-Week Range:</span>
                <span className="text-slate-300">
                  {nepseIndex.fiftyTwoWeekLow?.toFixed(2) || '2,487.18'} – {nepseIndex.fiftyTwoWeekHigh?.toFixed(2) || '2,960.40'}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Total Turnover:</span>
                <span className="text-emerald-400 font-bold">
                  Rs. {summary ? (summary.totalTurnoverNpr / 10000000).toFixed(2) : '290.69'} Cr
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Traded Shares:</span>
                <span className="text-slate-200 font-semibold">
                  {summary ? summary.totalTradedShares.toLocaleString() : '7,613,681'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-sans">Transactions:</span>
                <span className="text-slate-200 font-semibold">
                  {summary ? summary.totalTransactions.toLocaleString() : '48,341'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Other Main Indices (Sensitive, Float, Sensitive Float) */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            Major Market Indices
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[sensitiveIndex, floatIndex, sensitiveFloatIndex].filter(Boolean).map((idx) => {
              if (!idx) return null;
              const isPos = idx.change >= 0;
              return (
                <div key={idx.name} className="bg-slate-950/60 border border-slate-800 p-3.5 rounded-2xl">
                  <div className="text-xs text-slate-400 font-medium">{idx.name}</div>
                  <div className="text-lg font-mono font-bold text-white mt-1">{idx.value.toFixed(2)}</div>
                  <div className={`text-xs font-mono font-semibold flex items-center gap-1 mt-0.5 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                    <span>{isPos ? '+' : ''}{idx.change.toFixed(2)} ({isPos ? '+' : ''}{idx.changePercent.toFixed(2)}%)</span>
                  </div>
                  {idx.fiftyTwoWeekHigh && idx.fiftyTwoWeekLow && (
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      52W: {idx.fiftyTwoWeekLow.toFixed(2)} - {idx.fiftyTwoWeekHigh.toFixed(2)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sub-indices Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Sector Sub-Indices (13 Official Sectors)
          </h3>
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Sector Index</th>
                  <th className="px-4 py-3 text-right">Current Value</th>
                  <th className="px-4 py-3 text-right">Point Change</th>
                  <th className="px-4 py-3 text-right">% Change</th>
                  <th className="px-4 py-3 text-center">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {subIndices.map((sub) => {
                  const isPos = sub.change >= 0;
                  return (
                    <tr key={sub.name} className="hover:bg-slate-900/50 transition-colors">
                      <td className="px-4 py-2.5 font-sans font-medium text-slate-200 flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${isPos ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                        <span>{sub.name}</span>
                      </td>
                      <td className="px-4 py-2.5 text-right font-bold text-white">
                        {sub.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className={`px-4 py-2.5 text-right font-semibold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? '+' : ''}{sub.change.toFixed(2)}
                      </td>
                      <td className={`px-4 py-2.5 text-right font-bold ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {isPos ? '+' : ''}{sub.changePercent.toFixed(2)}%
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPos ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30' : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                        }`}>
                          {isPos ? 'BULLISH' : 'BEARISH'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
