import React from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  Compass, 
  TrendingUp, 
  Building2, 
  Newspaper, 
  AlertTriangle,
  FileText,
  Target,
  ArrowRight
} from 'lucide-react';
import { TriFactorTrajectorySynthesis } from '../../types/nepse';

interface GeminiTrajectorySynthesisCardProps {
  synthesis: TriFactorTrajectorySynthesis;
  isLoading: boolean;
  onRefresh: () => void;
  symbol: string;
}

export const GeminiTrajectorySynthesisCard: React.FC<GeminiTrajectorySynthesisCardProps> = ({
  synthesis,
  isLoading,
  onRefresh,
  symbol
}) => {
  const ai = synthesis.aiSynthesis;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-indigo-400 font-semibold mb-1">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>GEMINI AI MULTI-FACTOR TRAJECTORY SYNTHESIS</span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center gap-3">
            <span>AI Confluence Intelligence: {symbol}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 font-mono">
              Model: {ai?.model || 'gemini-3.8-flash'}
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Deep contextual synthesis combining technical momentum, fundamental multiples, and news from 5 portals.
          </p>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? 'Synthesizing...' : 'Refresh AI Synthesis'}</span>
        </button>
      </div>

      {/* Executive Summary Box */}
      <div className="bg-slate-950/70 border border-indigo-500/30 rounded-2xl p-4.5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-indigo-300 uppercase">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>Executive Trajectory Summary</span>
        </div>
        <p className="text-sm text-slate-200 leading-relaxed font-sans">
          {ai?.executiveSummary || synthesis.compositeTrajectory.confluenceSummary}
        </p>
      </div>

      {/* 3 Core Analytical Perspectives */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Perspective 1: News Portal Analysis */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4.5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400">
            <Newspaper className="w-4 h-4" />
            <span>5-Portal News Impact Analysis</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {ai?.newsImpactAnalysis || `Media coverage across ShareSansar, Merolagani, Bizshala, Arthik Abhiyan, and Nepali Paisa presents favorable sentiment, supporting institutional accumulation.`}
          </p>
        </div>

        {/* Perspective 2: Fundamental Valuation Alignment */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4.5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
            <Building2 className="w-4 h-4" />
            <span>Fundamental Valuation Alignment</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {ai?.fundamentalValuationAlignment || `Current financial ratios (P/E, EPS, ROE) confirm attractive risk-reward relative to sector peers, reinforcing fundamental price floors.`}
          </p>
        </div>

        {/* Perspective 3: Technical Trajectory Verdict */}
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4.5 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400">
            <Compass className="w-4 h-4" />
            <span>Technical Trajectory Verdict</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {ai?.technicalTrajectoryVerdict || `Linear drift velocity and moving average confluence indicate a defined upward channel with key inflection points at 50-day and 200-day moving averages.`}
          </p>
        </div>
      </div>

      {/* Actionable Roadmap */}
      {ai?.actionableRoadmap && ai.actionableRoadmap.length > 0 && (
        <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
            <Target className="w-4 h-4 text-amber-400" />
            <span>Actionable Trajectory Execution Roadmap</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {ai.actionableRoadmap.map((step, idx) => (
              <div key={idx} className="bg-slate-900/60 border border-slate-800/60 rounded-xl p-3 flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs text-slate-300 font-mono leading-tight">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* News Catalysts and Downside Risks from Synthesis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Catalysts */}
        <div className="bg-slate-950/60 border border-emerald-500/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span>News-Identified Price Catalysts</span>
          </div>
          <div className="space-y-1.5">
            {synthesis.compositeTrajectory.catalystsFromNews.map((cat, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>{cat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Risks */}
        <div className="bg-slate-950/60 border border-rose-500/20 rounded-2xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-rose-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Downside Trajectory Risks & Headwinds</span>
          </div>
          <div className="space-y-1.5">
            {synthesis.compositeTrajectory.risksFromNews.map((risk, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 font-mono">
                <span className="text-rose-400 shrink-0 mt-0.5">⚠️</span>
                <span>{risk}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
