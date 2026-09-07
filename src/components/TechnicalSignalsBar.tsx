import React from 'react';
import { Gauge, CheckCircle2, AlertTriangle, XCircle, ArrowUpRight, TrendingUp } from 'lucide-react';
import { TechnicalSummary, TechnicalSignalType } from '../types/nepse';

interface TechnicalSignalsBarProps {
  summary: TechnicalSummary;
  ticker: string;
  hideRecommendation?: boolean;
}

export const TechnicalSignalsBar: React.FC<TechnicalSignalsBarProps> = ({ 
  summary, 
  ticker, 
  hideRecommendation = false 
}) => {
  const getSignalBadge = (signal: TechnicalSignalType) => {
    switch (signal) {
      case 'STRONG_BUY':
        return {
          label: 'STRONG BUY',
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-400',
          border: 'border-emerald-500/40',
          desc: 'High bullish confluence across key oscillators & moving averages',
        };
      case 'BUY':
        return {
          label: 'BUY',
          bg: 'bg-emerald-500/10',
          text: 'text-emerald-400',
          border: 'border-emerald-500/30',
          desc: 'Bullish momentum supported by short-to-medium indicators',
        };
      case 'STRONG_SELL':
        return {
          label: 'STRONG SELL',
          bg: 'bg-rose-500/20',
          text: 'text-rose-400',
          border: 'border-rose-500/40',
          desc: 'Significant bearish breakdown or extreme overbought warning',
        };
      case 'SELL':
        return {
          label: 'SELL',
          bg: 'bg-rose-500/10',
          text: 'text-rose-400',
          border: 'border-rose-500/30',
          desc: 'Downside pressure or momentum exhaustion detected',
        };
      default:
        return {
          label: 'NEUTRAL',
          bg: 'bg-amber-500/10',
          text: 'text-amber-400',
          border: 'border-amber-500/30',
          desc: 'Consolidation phase with mixed oscillator & trend signals',
        };
    }
  };

  const badge = getSignalBadge(summary.overallSignal);
  const totalSignals = summary.buyCount + summary.neutralCount + summary.sellCount;
  const buyPct = totalSignals > 0 ? (summary.buyCount / totalSignals) * 100 : 33;
  const neutralPct = totalSignals > 0 ? (summary.neutralCount / totalSignals) * 100 : 33;
  const sellPct = totalSignals > 0 ? (summary.sellCount / totalSignals) * 100 : 33;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl space-y-5">
      {/* Top Bento Header & Signal Highlight */}
      <div className="flex flex-col lg:flex-row items-stretch gap-4">
        {/* Left: Confluence Title & Score */}
        <div className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Gauge className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Technical Confluence Radar
                  <span className="text-xs font-mono text-emerald-400 font-semibold">({ticker})</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">{badge.desc}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Confluence</span>
              <span className="font-mono font-extrabold text-base text-slate-100">
                {summary.score > 0 ? `+${summary.score}` : summary.score} / 100
              </span>
            </div>
          </div>

          {/* Signal Breakdown Multi-Segment Meter */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Buy: {summary.buyCount}
              </span>
              <span className="text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Neutral: {summary.neutralCount}
              </span>
              <span className="text-rose-400 flex items-center gap-1">
                <XCircle className="w-3 h-3" /> Sell: {summary.sellCount}
              </span>
            </div>

            {/* Proportional Multi-Segment Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden p-0.5 gap-0.5">
              <div
                className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                style={{ width: `${buyPct}%` }}
                title={`Buy: ${summary.buyCount}`}
              />
              <div
                className="h-full bg-amber-500 transition-all duration-500"
                style={{ width: `${neutralPct}%` }}
                title={`Neutral: ${summary.neutralCount}`}
              />
              <div
                className="h-full bg-rose-500 rounded-r-full transition-all duration-500"
                style={{ width: `${sellPct}%` }}
                title={`Sell: ${summary.sellCount}`}
              />
            </div>
          </div>
        </div>

        {/* Right: Indigo Highlight Bento Tile (Inspired by Bento theme) */}
        {!hideRecommendation && (
          <div className="lg:w-72 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-4.5 text-white flex flex-col justify-between shadow-lg relative overflow-hidden">
            <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-200">Recommendation</span>
              </div>
              <div className="text-2xl font-black font-mono tracking-tight mt-1">
                {badge.label}
              </div>
              <p className="text-xs text-indigo-100/90 mt-1 line-clamp-2">
                Based on {totalSignals} algorithmic technical checkpoints.
              </p>
            </div>

            <div className="mt-3 pt-3 border-t border-indigo-400/30 flex items-center justify-between text-xs">
              <span className="text-indigo-200 font-mono">Trend Strength</span>
              <span className="font-bold font-mono bg-indigo-950/40 px-2.5 py-0.5 rounded-full border border-indigo-400/30">
                {summary.score > 25 ? 'Strong Bullish' : summary.score < -25 ? 'Strong Bearish' : 'Moderate'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Key Individual Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Oscillators Panel */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Oscillators & Momentum</span>
            <span className="text-[10px] text-slate-500 font-mono">RSI, MACD, STOCH</span>
          </div>
          <div className="space-y-2.5">
            {summary.oscillators.map((osc) => {
              const sigColor =
                osc.signal === 'BUY'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : osc.signal === 'SELL'
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/30';
              return (
                <div key={osc.name} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/40 last:border-0">
                  <div>
                    <div className="font-semibold text-slate-200">{osc.name}</div>
                    <div className="text-[11px] text-slate-400">{osc.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-300 font-medium">{String(osc.value)}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${sigColor}`}>
                      {osc.signal}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Moving Averages Panel */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span>Moving Averages & Trend</span>
            <span className="text-[10px] text-slate-500 font-mono">SMA & EMA Suite</span>
          </div>
          <div className="space-y-2.5">
            {summary.movingAverages.map((ma) => {
              const sigColor =
                ma.signal === 'BUY'
                  ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                  : ma.signal === 'SELL'
                  ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
                  : 'text-amber-400 bg-amber-500/10 border-amber-500/30';
              return (
                <div key={ma.name} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/40 last:border-0">
                  <div>
                    <div className="font-semibold text-slate-200">{ma.name}</div>
                    <div className="text-[11px] text-slate-400">{ma.description}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-slate-300 font-medium">{String(ma.value)}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border ${sigColor}`}>
                      {ma.signal}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
