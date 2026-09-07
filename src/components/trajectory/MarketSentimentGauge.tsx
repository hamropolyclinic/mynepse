import React from 'react';
import { 
  Gauge, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Landmark, 
  Newspaper, 
  Flame, 
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';
import { MarketSentimentMetrics } from '../../types/nepse';

interface MarketSentimentGaugeProps {
  sentiment: MarketSentimentMetrics;
  symbol: string;
}

export const MarketSentimentGauge: React.FC<MarketSentimentGaugeProps> = ({
  sentiment,
  symbol
}) => {
  const { 
    overallScore, 
    sentimentLabel, 
    bullishRatio, 
    neutralRatio, 
    bearishRatio, 
    mediaSentimentScore, 
    retailCrowdScore, 
    smartMoneyFlowScore, 
    macroRegulatoryScore,
    sentimentVelocity,
    keyDrivers 
  } = sentiment;

  // Gauge color based on score (0-100)
  const getScoreColor = (score: number) => {
    if (score >= 75) return 'text-emerald-400';
    if (score >= 60) return 'text-teal-400';
    if (score >= 45) return 'text-amber-400';
    if (score >= 30) return 'text-orange-400';
    return 'text-rose-400';
  };

  const getMeterGradient = (score: number) => {
    if (score >= 70) return 'from-emerald-500 to-teal-400';
    if (score >= 50) return 'from-teal-500 to-amber-400';
    if (score >= 35) return 'from-amber-500 to-orange-400';
    return 'from-orange-500 to-rose-500';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold mb-1">
            <Gauge className="w-4 h-4" />
            <span>NEPSE SENTIMENT & FEAR/GREED INDEX</span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center gap-3">
            <span>Market Sentiment Analysis: {symbol}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time consensus derived from financial media portals, broker floorsheets, and retail crowd tone.
          </p>
        </div>

        {/* Velocity Indicator */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-2xl shrink-0">
          <Flame className="w-4 h-4 text-amber-400" />
          <div>
            <span className="text-[10px] font-mono text-slate-400 block uppercase">Sentiment Velocity</span>
            <span className="text-xs font-mono font-bold text-white">
              {sentimentVelocity?.replace(/_/g, ' ') || 'NEUTRAL'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Gauge Visual & 4 Pillars Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Column: Big Circular Sentiment Meter (5 cols) */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 text-center relative overflow-hidden flex flex-col items-center justify-center">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          {/* Meter SVG */}
          <div className="relative w-48 h-28 flex flex-col items-center justify-end">
            <svg viewBox="0 0 200 110" className="w-full h-full">
              {/* Background Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="#1e293b"
                strokeWidth="18"
                strokeLinecap="round"
              />
              {/* Progress Arc */}
              <path
                d="M 20 100 A 80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#sentimentGradient)"
                strokeWidth="18"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * overallScore) / 100}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="sentimentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="35%" stopColor="#f59e0b" />
                  <stop offset="70%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>
            </svg>

            {/* Score in Center */}
            <div className="absolute bottom-1 flex flex-col items-center">
              <span className={`text-4xl font-black font-mono tracking-tight ${getScoreColor(overallScore)}`}>
                {overallScore}
              </span>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-black text-white tracking-wide">
              {sentimentLabel}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-xs mx-auto">
              Weighted confluence across news disclosures, retail bid books, and central bank liquidity indicators.
            </p>
          </div>

          {/* Sentiment Ratio Bar */}
          <div className="w-full mt-5 pt-4 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-emerald-400 font-bold">{bullishRatio}% Bullish</span>
              <span className="text-amber-400 font-bold">{neutralRatio}% Neutral</span>
              <span className="text-rose-400 font-bold">{bearishRatio}% Bearish</span>
            </div>
            <div className="w-full h-2 rounded-full overflow-hidden bg-slate-900 flex">
              <div style={{ width: `${bullishRatio}%` }} className="bg-emerald-500 h-full" />
              <div style={{ width: `${neutralRatio}%` }} className="bg-amber-500 h-full" />
              <div style={{ width: `${bearishRatio}%` }} className="bg-rose-500 h-full" />
            </div>
          </div>
        </div>

        {/* Right Column: The 4 Key Sentiment Pillars (7 cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="text-xs font-mono text-slate-400 font-bold uppercase tracking-wider mb-1">
            4-Pillar Sentiment Breakdown
          </div>

          {/* Pillar 1: Media News Portals */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Newspaper className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white">1. News Portals Media Sentiment</div>
                <div className="text-[11px] text-slate-400">Aggregated polarity from 5 verified financial news portals</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`text-base font-black font-mono ${mediaSentimentScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {mediaSentimentScore >= 0 ? '+' : ''}{mediaSentimentScore}
              </div>
              <div className="text-[10px] font-mono text-slate-500">Scale: -100 to +100</div>
            </div>
          </div>

          {/* Pillar 2: Retail Crowd Sentiment */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white">2. Retail Crowd Tone</div>
                <div className="text-[11px] text-slate-400">Broker community sentiment & retail buy/sell volumes</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`text-base font-black font-mono ${retailCrowdScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {retailCrowdScore >= 0 ? '+' : ''}{retailCrowdScore}
              </div>
              <div className="text-[10px] font-mono text-slate-500">Retail Bias</div>
            </div>
          </div>

          {/* Pillar 3: Smart Money & FloorSheet Flow */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white">3. Institutional FloorSheet Flow</div>
                <div className="text-[11px] text-slate-400">Top 5 broker accumulation vs distribution tracking</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className={`text-base font-black font-mono ${smartMoneyFlowScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {smartMoneyFlowScore >= 0 ? '+' : ''}{smartMoneyFlowScore}
              </div>
              <div className="text-[10px] font-mono text-emerald-400 font-semibold">Net Accumulation</div>
            </div>
          </div>

          {/* Pillar 4: Macro Regulatory Stance */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-mono font-bold text-white">4. Macro & NRB Policy Stance</div>
                <div className="text-[11px] text-slate-400">Liquidity, interbank rate (2.8%), and margin lending caps</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-base font-black font-mono text-amber-400">
                +{macroRegulatoryScore}
              </div>
              <div className="text-[10px] font-mono text-slate-500">Accommodative</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Drivers List */}
      <div className="bg-slate-950/50 border border-slate-800/60 rounded-2xl p-4">
        <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-emerald-400" />
          <span>Core Market Sentiment Drivers</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {keyDrivers.map((driver, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs font-mono text-slate-300">
              <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
              <span>{driver}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
