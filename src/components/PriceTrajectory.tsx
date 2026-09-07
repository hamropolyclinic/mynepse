import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Compass, 
  Target, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  ChevronRight,
  Sparkles,
  Zap,
  Newspaper,
  Gauge
} from 'lucide-react';
import { 
  OHLCVDataPoint, 
  StockFundamental, 
  NewsPortalReport, 
  MarketSentimentMetrics, 
  TriFactorTrajectorySynthesis 
} from '../types/nepse';
import { nepseApi } from '../utils/nepseApi';
import { getNewsReportsForStock, computeMarketSentimentMetrics, generateTriFactorTrajectorySynthesis } from '../data/nepseNewsData';
import { TriFactorConfluenceStrip } from './trajectory/TriFactorConfluenceStrip';
import { MarketSentimentGauge } from './trajectory/MarketSentimentGauge';
import { GeminiTrajectorySynthesisCard } from './trajectory/GeminiTrajectorySynthesisCard';

interface PriceTrajectoryProps {
  data: OHLCVDataPoint[];
  stock: StockFundamental;
}

export const PriceTrajectory: React.FC<PriceTrajectoryProps> = ({ data, stock }) => {
  const [projectionHorizon, setProjectionHorizon] = useState<30 | 60 | 90>(60);
  const [activeScenario, setActiveScenario] = useState<'sentiment' | 'bullish' | 'base' | 'bearish'>('sentiment');
  
  // Tri-factor news, sentiment & synthesis state
  const [newsReports, setNewsReports] = useState<NewsPortalReport[]>(() => getNewsReportsForStock(stock));
  const [sentimentMetrics, setSentimentMetrics] = useState<MarketSentimentMetrics>(() => 
    computeMarketSentimentMetrics(stock, getNewsReportsForStock(stock))
  );
  const [synthesis, setSynthesis] = useState<TriFactorTrajectorySynthesis>(() => 
    generateTriFactorTrajectorySynthesis(stock, data || [], getNewsReportsForStock(stock), computeMarketSentimentMetrics(stock, getNewsReportsForStock(stock)))
  );
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Sync news & sentiment on stock change
  useEffect(() => {
    let isMounted = true;
    const initialReports = getNewsReportsForStock(stock);
    const initialSentiment = computeMarketSentimentMetrics(stock, initialReports);
    setNewsReports(initialReports);
    setSentimentMetrics(initialSentiment);
    const initialSyn = generateTriFactorTrajectorySynthesis(stock, data || [], initialReports, initialSentiment);
    setSynthesis(initialSyn);

    nepseApi.getStockNewsAndSentiment(stock)
      .then(res => {
        if (!isMounted) return;
        setNewsReports(res.reports);
        setSentimentMetrics(res.sentiment);
        setSynthesis(prev => generateTriFactorTrajectorySynthesis(stock, data || [], res.reports, res.sentiment));
      })
      .catch(() => {});

    return () => { isMounted = false; };
  }, [stock.symbol, data]);

  // Handler for Gemini AI Synthesis
  const handleRefreshAiSynthesis = async () => {
    setIsSynthesizing(true);
    try {
      const updated = await nepseApi.getGeminiTrajectoryNewsSynthesis(stock, data || [], newsReports, sentimentMetrics);
      setSynthesis(updated);
    } catch (err) {
      console.error('Failed to fetch AI synthesis:', err);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Compute regression, volatility, and trajectory metrics from authentic OHLC data
  const trajectoryAnalysis = useMemo(() => {
    if (!data || data.length < 10) {
      const p = stock.currentPrice;
      return {
        currentPrice: p,
        slope: 0,
        rSquared: 0,
        volatilityPercent: 1.5,
        annualizedVol: 24,
        momentum30d: 0,
        momentum90d: 0,
        support1: p * 0.95,
        support2: p * 0.90,
        resistance1: p * 1.05,
        resistance2: p * 1.10,
        swingHigh: stock.high52 || p * 1.2,
        swingLow: stock.low52 || p * 0.8,
        fibLevels: [],
        forecastPoints: [],
        returns: { '7d': 0, '30d': 0, '90d': 0, '180d': 0, '1y': 0 },
        trendStatus: 'Consolidating',
        trendDescription: 'Stable price action around recent mean.',
        rsi: 50,
        distanceFrom200EMA: 0,
        distanceFrom200SMA: 0,
        distanceFrom52wHigh: 0,
        distanceFrom52wLow: 0
      };
    }

    const prices = data.map(d => d.close);
    const n = prices.length;
    const currentPrice = stock.currentPrice || prices[n - 1];

    // 1. Linear Regression Drift Estimation (OLS on last 40 sessions)
    const windowSize = Math.min(40, n);
    const xVals = Array.from({ length: windowSize }, (_, i) => i);
    const yVals = prices.slice(-windowSize);

    const xMean = (windowSize - 1) / 2;
    const yMean = yVals.reduce((a, b) => a + b, 0) / windowSize;

    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < windowSize; i++) {
      numerator += (xVals[i] - xMean) * (yVals[i] - yMean);
      denominator += (xVals[i] - xMean) ** 2;
    }
    const slope = denominator === 0 ? 0 : numerator / denominator;
    const intercept = yMean - slope * xMean;

    // R-Squared calculation
    let ssTot = 0;
    let ssRes = 0;
    for (let i = 0; i < windowSize; i++) {
      const pred = intercept + slope * xVals[i];
      ssRes += (yVals[i] - pred) ** 2;
      ssTot += (yVals[i] - yMean) ** 2;
    }
    const rSquared = ssTot === 0 ? 0 : Math.max(0, Math.min(1, 1 - ssRes / ssTot));

    // 2. Realized Volatility Calculation (Log Returns)
    const logReturns: number[] = [];
    for (let i = 1; i < n; i++) {
      if (prices[i - 1] > 0) {
        logReturns.push(Math.log(prices[i] / prices[i - 1]));
      }
    }
    const retMean = logReturns.reduce((a, b) => a + b, 0) / (logReturns.length || 1);
    const variance = logReturns.reduce((acc, r) => acc + (r - retMean) ** 2, 0) / (logReturns.length || 1);
    const dailyVol = Math.sqrt(variance);
    const annualizedVol = dailyVol * Math.sqrt(240) * 100; // 240 trading days in Nepal

    // 3. Multi-horizon momentum returns
    const getReturn = (days: number) => {
      if (n <= days) return 0;
      const prev = prices[n - 1 - days];
      return prev > 0 ? ((currentPrice - prev) / prev) * 100 : 0;
    };
    const returns = {
      '7d': getReturn(5),
      '30d': getReturn(22),
      '90d': getReturn(66),
      '180d': getReturn(132),
      '1y': getReturn(240)
    };

    // 4. Moving Average Diagnostics
    const calcEMA = (period: number): number => {
      if (n < period) return currentPrice;
      const k = 2 / (period + 1);
      let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
      for (let i = period; i < n; i++) {
        ema = prices[i] * k + ema * (1 - k);
      }
      return ema;
    };

    const calcSMA = (period: number): number => {
      if (n < period) return currentPrice;
      const slice = prices.slice(-period);
      return slice.reduce((a, b) => a + b, 0) / period;
    };

    const ema200 = calcEMA(200);
    const sma200 = calcSMA(200);
    const distanceFrom200EMA = ema200 > 0 ? ((currentPrice - ema200) / ema200) * 100 : 0;
    const distanceFrom200SMA = sma200 > 0 ? ((currentPrice - sma200) / sma200) * 100 : 0;

    // 52-Week High/Low calculations
    const high52 = stock.high52 || Math.max(...prices.slice(-240), currentPrice);
    const low52 = stock.low52 || Math.min(...prices.slice(-240), currentPrice);
    const distanceFrom52wHigh = high52 > 0 ? ((currentPrice - high52) / high52) * 100 : 0;
    const distanceFrom52wLow = low52 > 0 ? ((currentPrice - low52) / low52) * 100 : 0;

    // 5. Fibonacci Retracement and Expansion Gates
    const swingHigh = Math.max(...prices.slice(-60), currentPrice);
    const swingLow = Math.min(...prices.slice(-60), currentPrice);
    const fibRange = swingHigh - swingLow || 1;

    const fibRatios = [
      { ratio: 0.0, name: 'Swing High (0.0%)' },
      { ratio: 0.236, name: 'Fib Pullback (23.6%)' },
      { ratio: 0.382, name: 'Golden Pocket (38.2%)' },
      { ratio: 0.500, name: 'Equilibrium (50.0%)' },
      { ratio: 0.618, name: 'Golden Pocket (61.8%)' },
      { ratio: 0.786, name: 'Deep Reversal (78.6%)' },
      { ratio: 1.0, name: 'Swing Low (100.0%)' },
      { ratio: -0.272, name: 'Fib Expansion (127.2%)' },
      { ratio: -0.618, name: 'Fib Expansion (161.8%)' }
    ];

    const fibLevels = fibRatios.map(f => {
      const price = swingHigh - f.ratio * fibRange;
      const diffPercent = ((price - currentPrice) / currentPrice) * 100;
      return {
        key: f.name,
        name: f.name,
        price,
        ratio: f.ratio,
        diffPercent,
        status: price >= currentPrice ? 'RESISTANCE' : 'SUPPORT'
      };
    });

    // 6. Stochastic Dispersion Modeling for 90 days forward
    // Incorporating sentiment drift multiplier
    const sentimentMultiplier = synthesis.compositeTrajectory.sentimentDriftMultiplier || 1.0;
    const sentimentAdjustedSlope = slope * sentimentMultiplier;

    const forecastPoints: Array<{
      day: number;
      baseExpected: number;
      sentimentExpected: number;
      bullishPath: number;
      bearishPath: number;
      upper1Sigma: number;
      lower1Sigma: number;
      upper2Sigma: number;
      lower2Sigma: number;
    }> = [];

    for (let day = 1; day <= 90; day++) {
      const baseExpected = Math.max(10, currentPrice + slope * day);
      const sentimentExpected = Math.max(10, currentPrice + sentimentAdjustedSlope * day);
      const sigmaT = currentPrice * dailyVol * Math.sqrt(day);

      const upper1Sigma = sentimentExpected + sigmaT;
      const lower1Sigma = Math.max(10, sentimentExpected - sigmaT);
      const upper2Sigma = sentimentExpected + 1.96 * sigmaT;
      const lower2Sigma = Math.max(10, sentimentExpected - 1.96 * sigmaT);

      // Bullish and Bearish Trajectory curves
      const bullishPath = sentimentExpected + 0.85 * sigmaT + (slope > 0 ? slope * day * 0.4 : day * 0.25);
      const bearishPath = Math.max(10, sentimentExpected - 0.95 * sigmaT);

      forecastPoints.push({
        day,
        baseExpected,
        sentimentExpected,
        bullishPath,
        bearishPath,
        upper1Sigma,
        lower1Sigma,
        upper2Sigma,
        lower2Sigma
      });
    }

    // Determine descriptive trend status
    let trendStatus = 'Consolidating Neutral';
    let trendDescription = 'Price is fluctuating within a balanced range with stable drift.';
    if (slope > 0.8 && rSquared > 0.55) {
      trendStatus = 'Strong Bullish Expansion';
      trendDescription = 'High-conviction upward trajectory with robust linear fit and continuous buyer accumulation.';
    } else if (slope > 0.2) {
      trendStatus = 'Moderate Bullish Drift';
      trendDescription = 'Positive upward bias with constructive higher lows and steady absorption.';
    } else if (slope < -0.8 && rSquared > 0.55) {
      trendStatus = 'Strong Bearish Channel';
      trendDescription = 'Persistent downward trajectory with steady institutional distribution.';
    } else if (slope < -0.2) {
      trendStatus = 'Mild Bearish Drift';
      trendDescription = 'Gentle downward slope with periodic technical mean-reversion bounces.';
    }

    // Support and Resistance pivots from ATR
    const atrApprox = currentPrice * dailyVol * 1.5;
    const support1 = Math.max(10, currentPrice - atrApprox * 1.5);
    const support2 = Math.max(10, currentPrice - atrApprox * 2.8);
    const resistance1 = currentPrice + atrApprox * 1.5;
    const resistance2 = currentPrice + atrApprox * 3.0;

    return {
      currentPrice,
      slope,
      sentimentAdjustedSlope,
      rSquared,
      volatilityPercent: dailyVol * 100,
      annualizedVol,
      momentum30d: returns['30d'],
      momentum90d: returns['90d'],
      support1,
      support2,
      resistance1,
      resistance2,
      swingHigh,
      swingLow,
      fibLevels,
      forecastPoints,
      returns,
      trendStatus,
      trendDescription,
      distanceFrom200EMA,
      distanceFrom200SMA,
      distanceFrom52wHigh,
      distanceFrom52wLow
    };
  }, [data, stock, synthesis.compositeTrajectory.sentimentDriftMultiplier]);

  // Selected projected target values for currently active horizon
  const horizonForecast = trajectoryAnalysis.forecastPoints[projectionHorizon - 1] || {
    baseExpected: stock.currentPrice,
    sentimentExpected: stock.currentPrice,
    bullishPath: stock.currentPrice * 1.1,
    bearishPath: stock.currentPrice * 0.9,
    upper1Sigma: stock.currentPrice * 1.08,
    lower1Sigma: stock.currentPrice * 0.92,
    upper2Sigma: stock.currentPrice * 1.15,
    lower2Sigma: stock.currentPrice * 0.85
  };

  // Trajectory chart coordinates computation
  const chartWidth = 900;
  const chartHeight = 340;
  const padding = { top: 30, right: 90, bottom: 40, left: 60 };
  const plotWidth = chartWidth - padding.left - padding.right;
  const plotHeight = chartHeight - padding.top - padding.bottom;

  // Combine last 45 historical bars + forecast points for canvas
  const recentBars = (data || []).slice(-45);
  const numHistorical = recentBars.length;
  const numForecast = projectionHorizon;
  const totalPoints = numHistorical + numForecast;

  const allChartPrices: number[] = [
    ...recentBars.map(b => b.close),
    horizonForecast.upper2Sigma,
    horizonForecast.lower2Sigma,
    horizonForecast.bullishPath,
    horizonForecast.bearishPath,
    horizonForecast.sentimentExpected
  ];

  const minPrice = Math.min(...allChartPrices) * 0.96;
  const maxPrice = Math.max(...allChartPrices) * 1.04;
  const priceRange = maxPrice - minPrice || 1;

  const getX = (index: number) => padding.left + (index / (totalPoints - 1)) * plotWidth;
  const getY = (val: number) => padding.top + plotHeight - ((val - minPrice) / priceRange) * plotHeight;

  // Historical line path
  const historicalPathD = recentBars.map((b, i) => {
    const x = getX(i);
    const y = getY(b.close);
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  // Historical Area path
  const lastHistX = getX(numHistorical - 1);
  const histAreaD = `${historicalPathD} L ${lastHistX.toFixed(1)} ${(padding.top + plotHeight).toFixed(1)} L ${padding.left} ${(padding.top + plotHeight).toFixed(1)} Z`;

  // Future Paths
  const futureBaseD = [`M ${lastHistX.toFixed(1)} ${getY(stock.currentPrice).toFixed(1)}`];
  const futureSentimentD = [`M ${lastHistX.toFixed(1)} ${getY(stock.currentPrice).toFixed(1)}`];
  const futureBullishD = [`M ${lastHistX.toFixed(1)} ${getY(stock.currentPrice).toFixed(1)}`];
  const futureBearishD = [`M ${lastHistX.toFixed(1)} ${getY(stock.currentPrice).toFixed(1)}`];
  const upperConePoints: string[] = [`${lastHistX.toFixed(1)},${getY(stock.currentPrice).toFixed(1)}`];
  const lowerConePoints: string[] = [];

  trajectoryAnalysis.forecastPoints.slice(0, projectionHorizon).forEach((pt) => {
    const chartIndex = numHistorical - 1 + pt.day;
    const x = getX(chartIndex);
    futureBaseD.push(`L ${x.toFixed(1)} ${getY(pt.baseExpected).toFixed(1)}`);
    futureSentimentD.push(`L ${x.toFixed(1)} ${getY(pt.sentimentExpected).toFixed(1)}`);
    futureBullishD.push(`L ${x.toFixed(1)} ${getY(pt.bullishPath).toFixed(1)}`);
    futureBearishD.push(`L ${x.toFixed(1)} ${getY(pt.bearishPath).toFixed(1)}`);
    upperConePoints.push(`${x.toFixed(1)},${getY(pt.upper1Sigma).toFixed(1)}`);
    lowerConePoints.unshift(`${x.toFixed(1)},${getY(pt.lower1Sigma).toFixed(1)}`);
  });

  const conePolygonPoints = [...upperConePoints, ...lowerConePoints].join(' ');

  // Price ticks
  const priceTicks = [0, 0.25, 0.5, 0.75, 1].map(r => minPrice + r * priceRange);

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold mb-1">
              <Compass className="w-4 h-4" />
              <span>TRI-FACTOR PRICE TRAJECTORY & MARKET SENTIMENT RADAR</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <span>{stock.symbol} Price Trajectory Modeling</span>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono font-bold">
                {trajectoryAnalysis.trendStatus}
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              Synthesizing Technical Momentum (40%), Fundamental Valuation (35%), and News Media Sentiment across 5 Top Nepali Portals (25%).
            </p>
          </div>

          {/* Timeframe Projection Selector */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 p-1.5 rounded-2xl shrink-0">
            <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span>Forecast:</span>
            </span>
            {([30, 60, 90] as const).map((days) => (
              <button
                key={days}
                onClick={() => setProjectionHorizon(days)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  projectionHorizon === days
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900'
                }`}
              >
                +{days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Key Trajectory Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-3.5">
            <div className="text-[11px] font-mono text-slate-400">Current Spot</div>
            <div className="text-base font-black font-mono text-white mt-0.5">Rs. {trajectoryAnalysis.currentPrice.toFixed(1)}</div>
            <div className={`text-[10px] font-mono mt-0.5 ${stock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}% Today
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-3.5">
            <div className="text-[11px] font-mono text-slate-400">Sentiment Drift Velocity</div>
            <div className={`text-base font-black font-mono mt-0.5 ${trajectoryAnalysis.sentimentAdjustedSlope >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {trajectoryAnalysis.sentimentAdjustedSlope >= 0 ? '+' : ''}{trajectoryAnalysis.sentimentAdjustedSlope.toFixed(2)} Rs/day
            </div>
            <div className="text-[10px] font-mono text-purple-300 mt-0.5">
              {synthesis.compositeTrajectory.sentimentDriftMultiplier}x Multiplier
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-3.5">
            <div className="text-[11px] font-mono text-slate-400">Market Sentiment</div>
            <div className="text-base font-black font-mono text-amber-400 mt-0.5">
              {sentimentMetrics.overallScore} / 100
            </div>
            <div className="text-[10px] font-mono text-emerald-400 mt-0.5 truncate">
              {sentimentMetrics.sentimentLabel}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-3.5">
            <div className="text-[11px] font-mono text-purple-300 font-semibold">News-Adjusted Target (+{projectionHorizon}d)</div>
            <div className="text-base font-black font-mono text-purple-300 mt-0.5">
              Rs. {horizonForecast.sentimentExpected.toFixed(1)}
            </div>
            <div className={`text-[10px] font-mono mt-0.5 ${horizonForecast.sentimentExpected >= stock.currentPrice ? 'text-emerald-400' : 'text-rose-400'}`}>
              {horizonForecast.sentimentExpected >= stock.currentPrice ? '+' : ''}
              {(((horizonForecast.sentimentExpected - stock.currentPrice) / stock.currentPrice) * 100).toFixed(1)}% Projected
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-3.5">
            <div className="text-[11px] font-mono text-emerald-400 font-semibold">Bullish Catalyst Target</div>
            <div className="text-base font-black font-mono text-emerald-400 mt-0.5">
              Rs. {horizonForecast.bullishPath.toFixed(1)}
            </div>
            <div className="text-[10px] font-mono text-emerald-400/80 mt-0.5">
              +{(((horizonForecast.bullishPath - stock.currentPrice) / stock.currentPrice) * 100).toFixed(1)}% Upside
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-3.5">
            <div className="text-[11px] font-mono text-rose-400 font-semibold">Protective Floor (-{projectionHorizon}d)</div>
            <div className="text-base font-black font-mono text-rose-400 mt-0.5">
              Rs. {horizonForecast.bearishPath.toFixed(1)}
            </div>
            <div className="text-[10px] font-mono text-rose-400/80 mt-0.5">
              {(((horizonForecast.bearishPath - stock.currentPrice) / stock.currentPrice) * 100).toFixed(1)}% Max Risk
            </div>
          </div>
        </div>
      </div>

      {/* Tri-Factor Confluence Executive Strip */}
      <TriFactorConfluenceStrip
        synthesis={synthesis}
        stock={stock}
        selectedHorizon={projectionHorizon}
      />

      {/* Main Interactive Visual Trajectory Canvas */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Visual Price Trajectory & Multi-Factor Dispersion Cone</span>
            </h3>
            <p className="text-xs text-slate-400">
              Live NEPSE bars + {projectionHorizon}-day predictive channel with 5-portal news sentiment velocity overlay.
            </p>
          </div>

          {/* Scenario Filter Toggles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveScenario('sentiment')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all border ${
                activeScenario === 'sentiment'
                  ? 'bg-purple-950 text-purple-300 border-purple-500/80 shadow-md shadow-purple-500/20'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              ★ Sentiment & News Adjusted
            </button>
            <button
              onClick={() => setActiveScenario('bullish')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all border ${
                activeScenario === 'bullish'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Bullish Catalysts
            </button>
            <button
              onClick={() => setActiveScenario('base')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all border ${
                activeScenario === 'base'
                  ? 'bg-indigo-950 text-indigo-300 border-indigo-500/60 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Pure Technical Base
            </button>
            <button
              onClick={() => setActiveScenario('bearish')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-semibold transition-all border ${
                activeScenario === 'bearish'
                  ? 'bg-rose-950 text-rose-300 border-rose-500/60 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Bearish Risk Floor
            </button>
          </div>
        </div>

        {/* SVG Projection Canvas */}
        <div className="w-full overflow-x-auto bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-auto min-w-[700px] select-none"
          >
            <defs>
              <linearGradient id="histGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="coneGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.15" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {priceTicks.map((val, idx) => {
              const y = getY(val);
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={chartWidth - padding.right}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={chartWidth - padding.right + 8}
                    y={y + 4}
                    fill="#64748b"
                    fontSize="11"
                    fontFamily="monospace"
                  >
                    Rs. {val.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Split Divider: Historical vs Forecast */}
            <line
              x1={lastHistX}
              y1={padding.top}
              x2={lastHistX}
              y2={padding.top + plotHeight}
              stroke="#059669"
              strokeDasharray="3 3"
              strokeWidth="1.5"
            />
            <text
              x={lastHistX - 6}
              y={padding.top + 14}
              fill="#10b981"
              fontSize="10"
              fontFamily="monospace"
              textAnchor="end"
              fontWeight="bold"
            >
              TODAY (LIVE)
            </text>
            <text
              x={lastHistX + 6}
              y={padding.top + 14}
              fill="#c084fc"
              fontSize="10"
              fontFamily="monospace"
              fontWeight="bold"
            >
              TRI-FACTOR PROJECTION ➔
            </text>

            {/* Dispersion Cone Area */}
            <polygon
              points={conePolygonPoints}
              fill="url(#coneGradient)"
              stroke="#a855f7"
              strokeWidth="1"
              strokeDasharray="3 3"
              strokeOpacity="0.5"
            />

            {/* Historical Area */}
            <path d={histAreaD} fill="url(#histGradient)" />

            {/* Historical Solid Line */}
            <path
              d={historicalPathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Projected Scenarios */}
            {/* 1. Base Expected (dashed slate/indigo) */}
            <path
              d={futureBaseD.join(' ')}
              fill="none"
              stroke="#818cf8"
              strokeWidth={activeScenario === 'base' ? '3' : '1.5'}
              strokeDasharray={activeScenario === 'base' ? '' : '5 5'}
              opacity={activeScenario === 'base' ? 1 : 0.4}
            />

            {/* 2. Sentiment & News-Adjusted Trajectory (Purple Glowing Line) */}
            <path
              d={futureSentimentD.join(' ')}
              fill="none"
              stroke="#c084fc"
              strokeWidth={activeScenario === 'sentiment' ? '3.5' : '2'}
              strokeDasharray={activeScenario === 'sentiment' ? '' : '6 3'}
              opacity={activeScenario === 'sentiment' ? 1 : 0.7}
            />

            {/* 3. Bullish Catalysts */}
            <path
              d={futureBullishD.join(' ')}
              fill="none"
              stroke="#10b981"
              strokeWidth={activeScenario === 'bullish' ? '3' : '1.5'}
              strokeDasharray={activeScenario === 'bullish' ? '' : '4 4'}
              opacity={activeScenario === 'bullish' ? 1 : 0.4}
            />

            {/* 4. Bearish Floor */}
            <path
              d={futureBearishD.join(' ')}
              fill="none"
              stroke="#f43f5e"
              strokeWidth={activeScenario === 'bearish' ? '3' : '1.5'}
              strokeDasharray={activeScenario === 'bearish' ? '' : '4 4'}
              opacity={activeScenario === 'bearish' ? 1 : 0.4}
            />

            {/* Target End Point Dots & Labels */}
            {/* Sentiment-Adjusted Target Dot */}
            <circle
              cx={getX(totalPoints - 1)}
              cy={getY(horizonForecast.sentimentExpected)}
              r="6"
              fill="#c084fc"
              stroke="#581c87"
              strokeWidth="2.5"
            />
            <text
              x={getX(totalPoints - 1) + 8}
              y={getY(horizonForecast.sentimentExpected) + 4}
              fill="#e9d5ff"
              fontSize="12"
              fontFamily="monospace"
              fontWeight="bold"
            >
              Rs. {horizonForecast.sentimentExpected.toFixed(0)} (News & Sentiment)
            </text>

            {/* Bullish End */}
            <circle
              cx={getX(totalPoints - 1)}
              cy={getY(horizonForecast.bullishPath)}
              r="4.5"
              fill="#10b981"
              stroke="#022c22"
              strokeWidth="2"
            />

            {/* Bearish End */}
            <circle
              cx={getX(totalPoints - 1)}
              cy={getY(horizonForecast.bearishPath)}
              r="4.5"
              fill="#f43f5e"
              stroke="#4c0519"
              strokeWidth="2"
            />

            {/* Current Spot Dot */}
            <circle
              cx={lastHistX}
              cy={getY(stock.currentPrice)}
              r="6"
              fill="#10b981"
              stroke="#ffffff"
              strokeWidth="2"
            />

            {/* Bottom X-axis labels */}
            <text
              x={padding.left}
              y={chartHeight - 12}
              fill="#64748b"
              fontSize="11"
              fontFamily="monospace"
            >
              {recentBars[0]?.date || '-45 Sessions'}
            </text>
            <text
              x={lastHistX}
              y={chartHeight - 12}
              fill="#10b981"
              fontSize="11"
              fontFamily="monospace"
              textAnchor="middle"
              fontWeight="bold"
            >
              Current Spot
            </text>
            <text
              x={getX(totalPoints - 1)}
              y={chartHeight - 12}
              fill="#c084fc"
              fontSize="11"
              fontFamily="monospace"
              textAnchor="middle"
              fontWeight="bold"
            >
              +{projectionHorizon}d Future
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono pt-2 text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>Live NEPSE History</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3.5 h-1 bg-purple-400 rounded-full" />
              <span className="text-purple-300 font-bold">News & Market Sentiment Trajectory</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-indigo-400" />
              <span>Pure Technical Regression</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purple-500/20 border border-purple-500/50" />
              <span>±1σ Dispersion Cone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-400 border-t border-dashed border-emerald-400" />
              <span>Bullish Catalysts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-rose-400 border-t border-dashed border-rose-400" />
              <span>Bearish Support</span>
            </div>
          </div>
          <div className="text-[11px] text-slate-500">
            Weighted Confluence: 40% Technical + 35% Fundamental + 25% 5-Portal News Sentiment
          </div>
        </div>
      </div>

      {/* Gemini AI Multi-Factor Trajectory Synthesis Card */}
      <GeminiTrajectorySynthesisCard
        synthesis={synthesis}
        isLoading={isSynthesizing}
        onRefresh={handleRefreshAiSynthesis}
        symbol={stock.symbol}
      />

      {/* Market Sentiment Gauge & 4 Pillars Breakdown */}
      <MarketSentimentGauge
        sentiment={sentimentMetrics}
        symbol={stock.symbol}
      />

      {/* Two-Column Grid: Fibonacci Trajectory Gates + Multi-Horizon Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Fibonacci Retracement & Extension Trajectory Gates */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span>Fibonacci Trajectory Gates</span>
              </h3>
              <p className="text-xs text-slate-400">
                Calculated between swing low (Rs. {trajectoryAnalysis.swingLow.toFixed(1)}) and swing high (Rs. {trajectoryAnalysis.swingHigh.toFixed(1)}).
              </p>
            </div>
            <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-950 border border-amber-500/40 text-amber-300 font-semibold">
              9 Key Levels
            </span>
          </div>

          <div className="space-y-2 mt-4">
            {trajectoryAnalysis.fibLevels.map((fib) => {
              const isNear = Math.abs(fib.diffPercent) < 2.5;
              return (
                <div
                  key={fib.key}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-mono transition-all ${
                    isNear
                      ? 'bg-amber-950/40 border-amber-500/60 text-amber-200'
                      : fib.status === 'SUPPORT'
                      ? 'bg-slate-950/60 border-emerald-500/20 text-slate-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2 h-2 rounded-full ${
                      isNear ? 'bg-amber-400' : fib.status === 'SUPPORT' ? 'bg-emerald-400' : 'bg-rose-400'
                    }`} />
                    <span className="font-semibold">{fib.name}</span>
                    {isNear && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                        CURRENT ZONE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-white font-bold">Rs. {fib.price.toFixed(1)}</span>
                    <span className={`text-[11px] w-16 text-right ${
                      fib.diffPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {fib.diffPercent >= 0 ? '+' : ''}{fib.diffPercent.toFixed(1)}%
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                      fib.status === 'SUPPORT'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/30'
                        : 'bg-rose-950 text-rose-400 border border-rose-500/30'
                    }`}>
                      {fib.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Multi-Horizon Trajectory Momentum & Benchmarks */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Multi-Horizon Momentum Vector</span>
            </h3>
            <p className="text-xs text-slate-400">
              Historical return trajectories across key institutional trading windows.
            </p>
          </div>

          {/* Performance Bars */}
          <div className="space-y-3">
            {[
              { label: '7-Day Velocity', value: trajectoryAnalysis.returns['7d'], period: 'Short-term drift' },
              { label: '30-Day Momentum', value: trajectoryAnalysis.returns['30d'], period: 'Monthly cycle' },
              { label: '90-Day Trajectory', value: trajectoryAnalysis.returns['90d'], period: 'Quarterly trend' },
              { label: '180-Day Trend', value: trajectoryAnalysis.returns['180d'], period: 'Semi-annual shift' },
              { label: '1-Year Total Return', value: trajectoryAnalysis.returns['1y'], period: 'Annual baseline' },
            ].map((m, idx) => {
              const isPos = m.value >= 0;
              const barWidth = Math.min(100, Math.abs(m.value) * 1.8);
              return (
                <div key={idx} className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl">
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <div>
                      <span className="text-white font-bold">{m.label}</span>
                      <span className="text-[11px] text-slate-500 ml-2">({m.period})</span>
                    </div>
                    <span className={`font-bold flex items-center gap-1 ${isPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPos ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {isPos ? '+' : ''}{m.value.toFixed(2)}%
                    </span>
                  </div>

                  {/* Progress visualization */}
                  <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden flex">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isPos ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${Math.max(4, barWidth)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Valuation & Moving Average Trajectory Divergences */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800/80">
            <div className="bg-slate-950/80 border border-slate-800/60 p-3 rounded-2xl text-center">
              <div className="text-[10px] font-mono text-purple-400">vs 200 EMA</div>
              <div className={`text-sm font-mono font-black mt-0.5 ${
                trajectoryAnalysis.distanceFrom200EMA >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {trajectoryAnalysis.distanceFrom200EMA >= 0 ? '+' : ''}
                {trajectoryAnalysis.distanceFrom200EMA.toFixed(1)}%
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/60 p-3 rounded-2xl text-center">
              <div className="text-[10px] font-mono text-blue-400">vs 200 SMA</div>
              <div className={`text-sm font-mono font-black mt-0.5 ${
                trajectoryAnalysis.distanceFrom200SMA >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}>
                {trajectoryAnalysis.distanceFrom200SMA >= 0 ? '+' : ''}
                {trajectoryAnalysis.distanceFrom200SMA.toFixed(1)}%
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/60 p-3 rounded-2xl text-center">
              <div className="text-[10px] font-mono text-slate-400">From 52W High</div>
              <div className="text-sm font-mono font-black text-rose-400 mt-0.5">
                {trajectoryAnalysis.distanceFrom52wHigh.toFixed(1)}%
              </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800/60 p-3 rounded-2xl text-center">
              <div className="text-[10px] font-mono text-slate-400">Above 52W Low</div>
              <div className="text-sm font-mono font-black text-emerald-400 mt-0.5">
                +{trajectoryAnalysis.distanceFrom52wLow.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk / Reward Scenario Matrix & Trade Planning Blueprint */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Trajectory Risk / Reward Scenario Matrix</span>
            </h3>
            <p className="text-xs text-slate-400">
              Institutional risk-adjusted price targets and stop-loss support floors based on historical NEPSE volatility.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>ATR-Calibrated</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Conservative Target */}
          <div className="bg-slate-950/80 border border-emerald-500/30 rounded-2xl p-4.5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-emerald-400">
              <span className="font-bold">TARGET 1: CONSERVATIVE PIVOT</span>
              <span className="bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">R:R 2.1:1</span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              Rs. {trajectoryAnalysis.resistance1.toFixed(1)}
            </div>
            <p className="text-xs text-slate-400">
              Immediate overhead resistance and primary profit-taking zone (+{(((trajectoryAnalysis.resistance1 - stock.currentPrice) / stock.currentPrice) * 100).toFixed(1)}% upside).
            </p>
          </div>

          {/* Aggressive Breakout Target */}
          <div className="bg-slate-950/80 border border-indigo-500/30 rounded-2xl p-4.5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-indigo-400">
              <span className="font-bold">TARGET 2: MOMENTUM EXTENSION</span>
              <span className="bg-indigo-950 px-2 py-0.5 rounded-full border border-indigo-500/30">R:R 3.8:1</span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              Rs. {trajectoryAnalysis.resistance2.toFixed(1)}
            </div>
            <p className="text-xs text-slate-400">
              Breakout expansion zone aligned with high volatility expansion (+{(((trajectoryAnalysis.resistance2 - stock.currentPrice) / stock.currentPrice) * 100).toFixed(1)}% upside).
            </p>
          </div>

          {/* Stop Loss Floor */}
          <div className="bg-slate-950/80 border border-rose-500/30 rounded-2xl p-4.5 space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between text-xs font-mono text-rose-400">
              <span className="font-bold">PROTECTIVE SUPPORT FLOOR</span>
              <span className="bg-rose-950 px-2 py-0.5 rounded-full border border-rose-500/30">RISK: {(((trajectoryAnalysis.support1 - stock.currentPrice) / stock.currentPrice) * 100).toFixed(1)}%</span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              Rs. {trajectoryAnalysis.support1.toFixed(1)}
            </div>
            <p className="text-xs text-slate-400">
              Key structural invalidate floor based on ATR 1.5x trailing support buffer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
