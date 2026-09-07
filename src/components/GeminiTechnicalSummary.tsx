import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  Cpu,
  TrendingUp,
  TrendingDown,
  Activity,
  Compass,
  RefreshCw,
  Target,
  ShieldAlert,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Gauge,
  ExternalLink,
} from 'lucide-react';
import { StockFundamental, OHLCVDataPoint, GeminiTechnicalSummaryReport } from '../types/nepse';
import { buildFullTechnicalSnapshot } from '../utils/technicalAnalysis';
import { nepseApi } from '../utils/nepseApi';

interface GeminiTechnicalSummaryProps {
  stock: StockFundamental;
  ohlcData: OHLCVDataPoint[];
  allStocks?: StockFundamental[];
  onSelectStock?: (symbol: string) => void;
}

export const GeminiTechnicalSummary: React.FC<GeminiTechnicalSummaryProps> = ({
  stock,
  ohlcData,
  allStocks = [],
  onSelectStock,
}) => {
  const [report, setReport] = useState<GeminiTechnicalSummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Compute live indicators snapshot locally to ensure instant zero-latency preview and feed into Gemini
  const snapshot = useMemo(() => {
    return buildFullTechnicalSnapshot(stock, ohlcData);
  }, [stock, ohlcData]);

  // Fetch or regenerate Gemini technical summary
  const fetchSummary = useCallback(async () => {
    if (!stock?.symbol) return;
    setIsLoading(true);
    setError(null);
    try {
      const result = await nepseApi.getGeminiTechnicalSummary(stock, snapshot, ohlcData);
      setReport(result);
    } catch (err: any) {
      console.warn('Notice: Gemini technical summary fetch condition:', err?.message || err);
      setError(err?.message || 'Unable to generate technical report');
    } finally {
      setIsLoading(false);
    }
  }, [stock, snapshot, ohlcData]);

  // Automatically refresh AI analysis whenever the active stock changes
  useEffect(() => {
    fetchSummary();
  }, [stock.symbol]);

  // Helpers for badge styling
  const getBiasColor = (bias?: string) => {
    if (!bias) return 'bg-slate-800 text-slate-300 border-slate-700';
    if (bias.includes('STRONG_BULLISH')) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    if (bias.includes('BULLISH')) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    if (bias.includes('STRONG_BEARISH')) return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
    if (bias.includes('BEARISH')) return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  };

  return (
    <div id="gemini-technical-summary-panel" className="bg-slate-900/95 border border-slate-800 rounded-xl overflow-hidden shadow-2xl space-y-6 p-5 sm:p-6 transition-all">
      {/* Top Diagnostics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-300">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight flex items-center gap-2">
                Gemini Technical Diagnostics & Synthesis
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5" />
                {report?.model || 'gemini-3.8-flash'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Institutional CMT confluence with ShareSansar & Hamroshare norm references
            </p>
          </div>
        </div>

        {/* Actions Toolbar */}
        <div className="flex items-center gap-2">
          {/* Re-Analyze Button */}
          <button
            id="gemini-refresh-summary-btn"
            type="button"
            onClick={fetchSummary}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 text-xs font-medium transition-all disabled:opacity-50"
            title="Re-run Gemini AI Technical Analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Refresh Diagnostics</span>
          </button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
            <Sparkles className="w-5 h-5 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="text-xs text-indigo-300/90 font-mono animate-pulse">
            Synthesizing confluence across 5/20/50/200 MAs, RSI 14, MACD, Stochastics & Floor Pivots...
          </p>
        </div>
      )}

      {/* Error Notice */}
      {!isLoading && error && (
        <div className="bg-rose-950/40 border border-rose-800/60 rounded-lg p-3 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={fetchSummary}
            className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700/50 font-medium"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content Area */}
      {!isLoading && report && (
        <div className="space-y-6">
          {/* Executive Headline & Bias Hero Banner */}
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`px-3 py-1 rounded-md text-xs font-bold font-mono uppercase tracking-wider border ${getBiasColor(
                        report.marketBias
                      )}`}
                    >
                      {report.marketBias.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {stock.symbol} • NPR {stock.currentPrice.toLocaleString()} ({stock.change >= 0 ? '+' : ''}
                      {stock.change.toFixed(2)} / {stock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
                    {report.summaryHeadline}
                  </h3>
                  <p className="text-xs text-slate-300/90 leading-relaxed max-w-3xl">
                    {report.trendAnalysis.details}
                  </p>
                </div>

                {/* Quantitative Confidence Meter */}
                <div className="flex md:flex-col items-center md:items-end justify-between shrink-0 pl-0 md:pl-6 md:border-l md:border-slate-800">
                  <div className="text-left md:text-right">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                      AI Confluence Confidence
                    </span>
                    <div className="flex items-baseline md:justify-end gap-1">
                      <span className="text-2xl font-mono font-bold text-indigo-300">
                        {report.confidenceScore}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">/ 100</span>
                    </div>
                  </div>
                  <div className="w-28 bg-slate-800 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(5, report.confidenceScore))}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* ShareSansar & Hamroshare Cross-Reference Callout */}
              {report.trendAnalysis.shareSansarHamroshareNote && (
                <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-lg p-3 text-xs text-indigo-300/90 flex items-start gap-2.5">
                  <ExternalLink className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-indigo-300">ShareSansar & Hamroshare Context: </span>
                    <span>{report.trendAnalysis.shareSansarHamroshareNote}</span>
                  </div>
                </div>
              )}

              {/* Floor Pivot Grid */}
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4.5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-cyan-400" />
                    Floor Pivot Grid (R2, R1, PP, S1, S2)
                  </h4>
                  <span className="text-[11px] font-mono text-slate-400">
                    Current: <strong className="text-white">NPR {stock.currentPrice}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                  {/* R2 */}
                  <div className="flex flex-col justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/20 text-rose-400">
                        R2
                      </span>
                      <span className="text-slate-300 font-medium text-[11px]">Major Resistance</span>
                    </div>
                    <span className="font-mono font-bold text-slate-100 text-sm">
                      NPR {report.floorPivotGrid.r2?.toLocaleString()}
                    </span>
                  </div>

                  {/* R1 */}
                  <div className="flex flex-col justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400">
                        R1
                      </span>
                      <span className="text-slate-300 font-medium text-[11px]">First Breakout</span>
                    </div>
                    <span className="font-mono font-bold text-slate-100 text-sm">
                      NPR {report.floorPivotGrid.r1?.toLocaleString()}
                    </span>
                  </div>

                  {/* PP (Pivot Point) */}
                  <div className="flex flex-col justify-between p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-500/30 text-xs gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/30 text-indigo-300">
                        PP
                      </span>
                      <span className="text-indigo-200 font-bold text-[11px]">Central Pivot</span>
                    </div>
                    <span className="font-mono font-bold text-indigo-300 text-sm">
                      NPR {report.floorPivotGrid.pp?.toLocaleString()}
                    </span>
                  </div>

                  {/* S1 */}
                  <div className="flex flex-col justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                        S1
                      </span>
                      <span className="text-slate-300 font-medium text-[11px]">Primary Floor</span>
                    </div>
                    <span className="font-mono font-bold text-slate-100 text-sm">
                      NPR {report.floorPivotGrid.s1?.toLocaleString()}
                    </span>
                  </div>

                  {/* S2 */}
                  <div className="flex flex-col justify-between p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400">
                        S2
                      </span>
                      <span className="text-slate-300 font-medium text-[11px]">Bedrock Support</span>
                    </div>
                    <span className="font-mono font-bold text-slate-100 text-sm">
                      NPR {report.floorPivotGrid.s2?.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Floor Assessment commentary */}
                <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
                  {report.floorPivotGrid.assessment}
                </p>
              </div>

              {/* Grid 2: Momentum & Volatility Oscillators */}
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4.5 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Momentum & Volatility Oscillators (RSI, MACD, Stochastics, Bollinger %B, ATR)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* RSI 14 Card */}
                  <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">RSI (14-Period)</span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-200">
                        {snapshot.rsi14 !== undefined ? snapshot.rsi14 : 'N/A'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {report.oscillatorsAnalysis.rsiInterpretation}
                    </p>
                  </div>

                  {/* MACD Card */}
                  <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">MACD (12, 26, 9)</span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-200">
                        {snapshot.macd?.histogram !== undefined
                          ? `${snapshot.macd.histogram >= 0 ? '+' : ''}${snapshot.macd.histogram}`
                          : 'N/A'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {report.oscillatorsAnalysis.macdInterpretation}
                    </p>
                  </div>

                  {/* Slow Stochastics Card */}
                  <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Stochastics (%K / %D)</span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-200">
                        {snapshot.stochastic?.k !== undefined
                          ? `${snapshot.stochastic.k} / ${snapshot.stochastic.d}`
                          : 'N/A'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {report.oscillatorsAnalysis.stochInterpretation}
                    </p>
                  </div>

                  {/* Bollinger Bands %B Card */}
                  <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Bollinger Bands (%B)</span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-200">
                        {snapshot.bollinger?.percentB !== undefined ? snapshot.bollinger.percentB : 'N/A'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {report.oscillatorsAnalysis.bollingerInterpretation}
                    </p>
                  </div>

                  {/* Average True Range (ATR 14) */}
                  <div className="p-3.5 rounded-lg bg-slate-900/70 border border-slate-800 space-y-1.5 md:col-span-2 lg:col-span-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-300">Average True Range (ATR 14)</span>
                      <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-slate-200">
                        NPR {snapshot.atr14 || 'N/A'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {report.oscillatorsAnalysis.atrVolatilityNote}
                    </p>
                  </div>
                </div>
              </div>

              {/* Grid 3: Candlestick Pattern Observations & Price Dynamics */}
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4.5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-purple-400" />
                    Candlestick Pattern Observations & Price Behavior
                  </h4>
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase ${
                      snapshot.candlestick.bias === 'BULLISH'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : snapshot.candlestick.bias === 'BEARISH'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {report.candlestickObservations.primaryPattern}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">Real Body & Range</span>
                    <p className="text-xs font-mono font-bold text-slate-100">
                      NPR {snapshot.candlestick.bodySize} ({Math.round(snapshot.candlestick.bodyRatio * 100)}% of Range)
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">Upper Shadow (Supply Test)</span>
                    <p className="text-xs font-mono font-bold text-slate-100">
                      NPR {snapshot.candlestick.upperShadow}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">Lower Shadow (Dip Defense)</span>
                    <p className="text-xs font-mono font-bold text-slate-100">
                      NPR {snapshot.candlestick.lowerShadow}
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800/80">
                  <p>{report.candlestickObservations.bodyWickDynamics}</p>
                  <p className="text-slate-400 text-[11px]">{report.candlestickObservations.volumeConfirmation}</p>
                </div>
              </div>

              {/* Grid 4: What to Watch Next: Breakout Triggers & Invalidation */}
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4.5 space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-400" />
                  What to Watch Next: Breakout & Confirmation Triggers
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Bullish Trigger */}
                  <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <ArrowUpRight className="w-4 h-4" />
                      <span>Bullish Continuation Trigger</span>
                    </div>
                    <p className="text-xs text-emerald-200/90 leading-relaxed">
                      {report.whatToWatchNext.bullishTrigger}
                    </p>
                  </div>

                  {/* Bearish Trigger */}
                  <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-500/20 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                      <ArrowDownRight className="w-4 h-4" />
                      <span>Bearish Breakdown & Warning Trigger</span>
                    </div>
                    <p className="text-xs text-rose-200/90 leading-relaxed">
                      {report.whatToWatchNext.bearishTrigger}
                    </p>
                  </div>
                </div>

                {/* Key Watch Levels & Invalidation Stop */}
                <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-slate-200">
                        Structural Invalidation Stop:
                      </span>
                      <span className="ml-2 text-xs font-mono font-bold text-amber-400">
                        NPR {report.whatToWatchNext.invalidationLevel}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-slate-400">Target Corridor:</span>
                    <span className="text-xs font-mono text-slate-300 font-medium">
                      R1 NPR {report.floorPivotGrid.r1} • R2 NPR {report.floorPivotGrid.r2}
                    </span>
                  </div>
                </div>
              </div>
            </div>
      )}
    </div>
  );
};
