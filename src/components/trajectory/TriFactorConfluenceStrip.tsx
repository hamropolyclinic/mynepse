import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Cpu, 
  Building2, 
  Newspaper, 
  Gauge, 
  Zap, 
  CheckCircle2, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Percent
} from 'lucide-react';
import { TriFactorTrajectorySynthesis, StockFundamental } from '../../types/nepse';

interface TriFactorConfluenceStripProps {
  synthesis: TriFactorTrajectorySynthesis;
  stock: StockFundamental;
  selectedHorizon: 30 | 60 | 90;
}

export const TriFactorConfluenceStrip: React.FC<TriFactorConfluenceStripProps> = ({
  synthesis,
  stock,
  selectedHorizon
}) => {
  const { technicalFactor, fundamentalFactor, newsSentimentFactor, compositeTrajectory } = synthesis;

  const getBiasBadge = (bias: 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BULLISH' | 'STRONG_BEARISH') => {
    switch (bias) {
      case 'STRONG_BULLISH':
      case 'BULLISH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
            <ArrowUpRight className="w-3 h-3" />
            {bias?.replace(/_/g, ' ') || 'NEUTRAL'}
          </span>
        );
      case 'STRONG_BEARISH':
      case 'BEARISH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-950/80 border border-rose-500/40 text-rose-400">
            <ArrowDownRight className="w-3 h-3" />
            {bias?.replace(/_/g, ' ') || 'NEUTRAL'}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300">
            NEUTRAL
          </span>
        );
    }
  };

  const targetPrice = selectedHorizon === 30
    ? compositeTrajectory.target30d
    : selectedHorizon === 60
    ? compositeTrajectory.target60d
    : compositeTrajectory.target90d;

  const targetDiffPct = ((targetPrice - stock.currentPrice) / stock.currentPrice) * 100;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
      {/* Header row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold mb-1">
            <Zap className="w-4 h-4" />
            <span>TRI-FACTOR TRAJECTORY CONFLUENCE ENGINE</span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center gap-3">
            <span>Multi-Factor Synthesis: Technical + Fundamental + 5 News Portals</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Holistic price trajectory modeling combining linear momentum, financial valuation multiples, and sentiment across top 5 Nepali news portals.
          </p>
        </div>

        {/* Overall Confluence Score Pill */}
        <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 px-4 py-3 rounded-2xl shrink-0">
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Composite Score</div>
            <div className={`text-xl font-black font-mono mt-0.5 ${compositeTrajectory.overallScore >= 20 ? 'text-emerald-400' : compositeTrajectory.overallScore <= -20 ? 'text-rose-400' : 'text-amber-400'}`}>
              {compositeTrajectory.overallScore >= 0 ? '+' : ''}{compositeTrajectory.overallScore} / 100
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Overall Trajectory</div>
            <div className="mt-1">
              {getBiasBadge(compositeTrajectory.trajectoryBias)}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">+{selectedHorizon}d Target</div>
            <div className="text-lg font-black font-mono text-white mt-0.5">
              Rs. {targetPrice.toFixed(1)}
              <span className={`text-xs ml-1.5 font-bold ${targetDiffPct >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ({targetDiffPct >= 0 ? '+' : ''}{targetDiffPct.toFixed(1)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Pillar 1: Technical Factors (40%) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4.5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-white block">1. Technical Factors</span>
                <span className="text-[10px] font-mono text-slate-400">Weight: 40%</span>
              </div>
            </div>
            <div className="text-right">
              {getBiasBadge(technicalFactor.bias)}
              <div className="text-[10px] font-mono text-slate-400 mt-1">Score: {technicalFactor.score >= 0 ? '+' : ''}{technicalFactor.score}</div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
            {technicalFactor.keySignals.map((sig, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300 font-mono">
                <span className="text-blue-400 mt-0.5">›</span>
                <span className="leading-tight">{sig}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-2 text-[11px] font-mono flex items-center justify-between">
            <span className="text-slate-400">Trendline Status:</span>
            <span className={`font-bold ${technicalFactor.above200Ema ? 'text-emerald-400' : 'text-rose-400'}`}>
              {technicalFactor.above200Ema ? 'Above 200 EMA (Bullish)' : 'Below 200 EMA (Under Pressure)'}
            </span>
          </div>
        </div>

        {/* Pillar 2: Fundamental Factors (35%) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4.5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-white block">2. Fundamental Factors</span>
                <span className="text-[10px] font-mono text-slate-400">Weight: 35%</span>
              </div>
            </div>
            <div className="text-right">
              {getBiasBadge(fundamentalFactor.bias)}
              <div className="text-[10px] font-mono text-slate-400 mt-1">Score: {fundamentalFactor.score >= 0 ? '+' : ''}{fundamentalFactor.score}</div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
            {fundamentalFactor.keySignals.map((sig, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300 font-mono">
                <span className="text-emerald-400 mt-0.5">›</span>
                <span className="leading-tight">{sig}</span>
              </div>
            ))}
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-2 text-[11px] font-mono flex items-center justify-between">
            <span className="text-slate-400">P/E vs Sector:</span>
            <span className={`font-bold ${fundamentalFactor.peRatio < fundamentalFactor.industryPe ? 'text-emerald-400' : 'text-amber-400'}`}>
              {fundamentalFactor.peRatio < fundamentalFactor.industryPe 
                ? `${(((fundamentalFactor.industryPe - fundamentalFactor.peRatio) / fundamentalFactor.industryPe) * 100).toFixed(0)}% Discount` 
                : 'Sector Premium'}
            </span>
          </div>
        </div>

        {/* Pillar 3: News Reports & Market Sentiment (25%) */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-4.5 space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                <Newspaper className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-white block">3. News & Market Sentiment</span>
                <span className="text-[10px] font-mono text-slate-400">5 Portals | Weight: 25%</span>
              </div>
            </div>
            <div className="text-right">
              {getBiasBadge(newsSentimentFactor.bias)}
              <div className="text-[10px] font-mono text-slate-400 mt-1">Net Polarity: {newsSentimentFactor.score >= 0 ? '+' : ''}{newsSentimentFactor.score}</div>
            </div>
          </div>

          <div className="space-y-1.5 pt-1 border-t border-slate-800/60">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Portals Analyzed:</span>
              <span className="font-bold text-white">{newsSentimentFactor.portalCount} Verified Nepali Portals</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Sentiment Distribution:</span>
              <span className="text-emerald-400 font-bold">{newsSentimentFactor.bullishPortals} Bullish</span>
              <span className="text-slate-500">/</span>
              <span className="text-amber-400 font-bold">{newsSentimentFactor.neutralPortals} Neutral</span>
              <span className="text-slate-500">/</span>
              <span className="text-rose-400 font-bold">{newsSentimentFactor.bearishPortals} Bearish</span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Velocity Multiplier:</span>
              <span className="text-purple-300 font-bold">{compositeTrajectory.sentimentDriftMultiplier}x Drift Velocity</span>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-2 text-[11px] font-mono flex items-center justify-between">
            <span className="text-slate-400">Top Portals:</span>
            <span className="text-slate-300 truncate max-w-[170px]">ShareSansar, Merolagani...</span>
          </div>
        </div>
      </div>
    </div>
  );
};
