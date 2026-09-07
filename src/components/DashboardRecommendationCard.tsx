import React, { useMemo, useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Compass, 
  Target, 
  Zap
} from 'lucide-react';
import { 
  StockFundamental, 
  OHLCVDataPoint, 
  TechnicalSummary, 
  NewsPortalReport, 
  MarketSentimentMetrics,
  TriFactorTrajectorySynthesis
} from '../types/nepse';
import { nepseApi } from '../utils/nepseApi';
import { 
  getNewsReportsForStock, 
  computeMarketSentimentMetrics, 
  generateTriFactorTrajectorySynthesis 
} from '../data/nepseNewsData';

interface DashboardRecommendationCardProps {
  stock: StockFundamental;
  ohlcData: OHLCVDataPoint[];
  technicalSummary: TechnicalSummary;
}

export const DashboardRecommendationCard: React.FC<DashboardRecommendationCardProps> = ({
  stock,
  ohlcData,
  technicalSummary
}) => {
  const [newsReports, setNewsReports] = useState<NewsPortalReport[]>(() => getNewsReportsForStock(stock));
  const [sentimentMetrics, setSentimentMetrics] = useState<MarketSentimentMetrics>(() => 
    computeMarketSentimentMetrics(stock, getNewsReportsForStock(stock))
  );
  const [synthesis, setSynthesis] = useState<TriFactorTrajectorySynthesis>(() =>
    generateTriFactorTrajectorySynthesis(stock, ohlcData || [], getNewsReportsForStock(stock), computeMarketSentimentMetrics(stock, getNewsReportsForStock(stock)))
  );

  // Sync news & sentiment when stock changes
  useEffect(() => {
    let isMounted = true;
    const initialReports = getNewsReportsForStock(stock);
    const initialSentiment = computeMarketSentimentMetrics(stock, initialReports);
    setNewsReports(initialReports);
    setSentimentMetrics(initialSentiment);
    setSynthesis(generateTriFactorTrajectorySynthesis(stock, ohlcData || [], initialReports, initialSentiment));

    nepseApi.getStockNewsAndSentiment(stock)
      .then(res => {
        if (!isMounted) return;
        setNewsReports(res.reports);
        setSentimentMetrics(res.sentiment);
        setSynthesis(generateTriFactorTrajectorySynthesis(stock, ohlcData || [], res.reports, res.sentiment));
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [stock.symbol, ohlcData]);

  // Compute Multi-Factor Recommendation
  const recommendation = useMemo(() => {
    const currentPrice = stock.currentPrice;

    // 1. Technical Factor Score (30% weight)
    const techScore = synthesis.technicalFactor.score;

    // 2. Fundamental Factor Score (30% weight)
    const fundScore = synthesis.fundamentalFactor.score;

    // 3. News Media Score across 5 portals (20% weight)
    const newsScore = sentimentMetrics.mediaSentimentScore;

    // 4. Overall Market Sentiment & Flows (20% weight)
    const sentimentScoreScaled = (sentimentMetrics.overallScore - 50) * 2;

    // Multi-factor weighted aggregate (-100 to +100)
    const compositeScore = Math.round(
      techScore * 0.30 +
      fundScore * 0.30 +
      newsScore * 0.20 +
      sentimentScoreScaled * 0.20
    );

    // Recommendation Label & Configuration
    let label = 'NEUTRAL / HOLD';
    let sublabel = 'Balanced Risk-Reward';
    let badgeClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
    let glowClass = 'from-amber-500/10 to-transparent';
    let icon = Compass;
    let actionTone = 'Wait for directional breakout before initiating major position size.';

    if (compositeScore >= 50) {
      label = 'STRONG BUY';
      sublabel = 'High Conviction Multi-Factor Confluence';
      badgeClass = 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-lg shadow-emerald-500/20';
      glowClass = 'from-emerald-500/15 via-emerald-500/5 to-transparent';
      icon = TrendingUp;
      actionTone = 'Aggressively accumulate on dips towards structural moving average support.';
    } else if (compositeScore >= 18) {
      label = 'ACCUMULATE / BUY';
      sublabel = 'Favorable Confluence with Upside Bias';
      badgeClass = 'bg-emerald-950 text-emerald-300 border-emerald-500/50';
      glowClass = 'from-emerald-500/10 to-transparent';
      icon = TrendingUp;
      actionTone = 'Gradually build positions within current consolidation channel.';
    } else if (compositeScore <= -50) {
      label = 'STRONG SELL';
      sublabel = 'High Risk Multi-Factor Deterioration';
      badgeClass = 'bg-rose-500 text-white border-rose-400 font-black shadow-lg shadow-rose-500/20';
      glowClass = 'from-rose-500/15 via-rose-500/5 to-transparent';
      icon = TrendingDown;
      actionTone = 'Liquidate positions or enforce tight protective stop-loss.';
    } else if (compositeScore <= -18) {
      label = 'REDUCE / TAKE PROFIT';
      sublabel = 'Elevated Risk / Bearish Confluence';
      badgeClass = 'bg-rose-950 text-rose-300 border-rose-500/50';
      glowClass = 'from-rose-500/10 to-transparent';
      icon = TrendingDown;
      actionTone = 'Trim exposure into relief rallies and tighten trailing stops.';
    }

    // Trade targets
    const atrApprox = currentPrice * 0.025;
    const entryLow = Math.max(1, currentPrice - atrApprox * 0.8);
    const entryHigh = currentPrice + atrApprox * 0.4;
    const stopLoss = Math.max(1, currentPrice - atrApprox * 1.8);
    const target1 = currentPrice + atrApprox * 2.2;
    const target2 = currentPrice + atrApprox * 4.0;
    const riskRewardRatio = ((target1 - currentPrice) / (currentPrice - stopLoss || 1)).toFixed(1);

    return {
      compositeScore,
      label,
      sublabel,
      badgeClass,
      glowClass,
      icon,
      actionTone,
      entryLow,
      entryHigh,
      stopLoss,
      target1,
      target2,
      riskRewardRatio
    };
  }, [stock, technicalSummary, synthesis, sentimentMetrics, newsReports]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-6">
      {/* Decorative gradient background glow */}
      <div className={`absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl ${recommendation.glowClass} rounded-full blur-3xl pointer-events-none`} />

      {/* Top Header: Multi-Factor Recommendation Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-slate-800/80 relative z-10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold mb-1">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>INSTITUTIONAL MULTI-FACTOR RECOMMENDATION ENGINE</span>
          </div>
          <h2 className="text-2xl font-black text-white flex items-center gap-3">
            <span>{stock.symbol} Investment & Trading Verdict</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Synthesized algorithmic recommendation derived from multi-factor technical indicators, balance sheet valuation, 5 verified Nepali financial news portals, and real-time market sentiment.
          </p>
        </div>

        {/* Big Recommendation Callout Box */}
        <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-4 rounded-2xl shadow-md shrink-0">
          <div className="text-right">
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Multi-Factor Verdict</div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-3.5 py-1.5 rounded-xl text-sm font-mono tracking-wide border ${recommendation.badgeClass}`}>
                {recommendation.label}
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              Conviction Score: <span className="font-bold text-white">{recommendation.compositeScore >= 0 ? `+${recommendation.compositeScore}` : recommendation.compositeScore} / 100</span>
            </div>
          </div>

          <div className="h-10 w-px bg-slate-800" />

          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Primary Horizon</div>
            <div className="text-xs font-mono font-bold text-emerald-400 mt-1">1 to 3 Months</div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">R:R {recommendation.riskRewardRatio}:1</div>
          </div>
        </div>
      </div>

      {/* Actionable Trade & Execution Blueprint Box */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Strategic Trade Planning & Risk-Adjusted Execution Blueprint
            </span>
          </div>
          <div className="text-xs font-mono text-slate-400">
            Current Spot: <span className="font-bold text-white">Rs. {stock.currentPrice.toFixed(1)}</span>
          </div>
        </div>

        {/* Execution Pricing Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-slate-900/60 border border-slate-800/80 p-3 rounded-xl">
            <div className="text-[10px] text-slate-400 uppercase">Accumulation Zone</div>
            <div className="text-sm font-black text-white mt-1">
              Rs. {recommendation.entryLow.toFixed(0)} - {recommendation.entryHigh.toFixed(0)}
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Optimal Value Range</div>
          </div>

          <div className="bg-slate-900/60 border border-emerald-500/20 p-3 rounded-xl">
            <div className="text-[10px] text-emerald-400 uppercase font-semibold">Target 1 (Conservative)</div>
            <div className="text-sm font-black text-emerald-400 mt-1">
              Rs. {recommendation.target1.toFixed(0)}
            </div>
            <div className="text-[10px] text-emerald-400/80 mt-0.5">
              +{(((recommendation.target1 - stock.currentPrice) / stock.currentPrice) * 100).toFixed(1)}% Upside
            </div>
          </div>

          <div className="bg-slate-900/60 border border-indigo-500/20 p-3 rounded-xl">
            <div className="text-[10px] text-indigo-300 uppercase font-semibold">Target 2 (Breakout)</div>
            <div className="text-sm font-black text-indigo-300 mt-1">
              Rs. {recommendation.target2.toFixed(0)}
            </div>
            <div className="text-[10px] text-indigo-300/80 mt-0.5">
              +{(((recommendation.target2 - stock.currentPrice) / stock.currentPrice) * 100).toFixed(1)}% Expansion
            </div>
          </div>

          <div className="bg-slate-900/60 border border-rose-500/20 p-3 rounded-xl">
            <div className="text-[10px] text-rose-400 uppercase font-semibold">Stop Loss Invalidation</div>
            <div className="text-sm font-black text-rose-400 mt-1">
              Rs. {recommendation.stopLoss.toFixed(0)}
            </div>
            <div className="text-[10px] text-rose-400/80 mt-0.5">
              {(((recommendation.stopLoss - stock.currentPrice) / stock.currentPrice) * 100).toFixed(1)}% Max Risk
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
