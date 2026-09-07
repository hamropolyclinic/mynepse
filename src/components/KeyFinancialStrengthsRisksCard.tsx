import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  BarChart3,
  Layers
} from 'lucide-react';
import { StockFundamental } from '../types/nepse';
import { getFinancialHealthProfile } from '../data/financialStrengthsRisksData';

interface KeyFinancialStrengthsRisksCardProps {
  stock: StockFundamental;
  variant?: 'full' | 'compact';
  title?: string;
}

export const KeyFinancialStrengthsRisksCard: React.FC<KeyFinancialStrengthsRisksCardProps> = ({
  stock,
  variant = 'full',
  title
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'strengths' | 'risks'>('all');

  const profile = useMemo(() => {
    return getFinancialHealthProfile(stock);
  }, [stock]);

  const { healthScore, grade, outlook, strengths, risks, keyTakeaway } = profile;

  // Grade badge styling
  const gradeColor = useMemo(() => {
    if (grade.startsWith('A')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (grade.startsWith('B')) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  }, [grade]);

  const scoreBarWidth = `${healthScore}%`;

  return (
    <div 
      id={`financial-strengths-risks-${stock.symbol.toLowerCase()}`}
      className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl space-y-5"
    >
      {/* Top Header & Health Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-bold text-white tracking-tight">
                {title || 'Key Financial Strengths & Risks'}
              </h2>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-950 border border-slate-800 text-slate-300">
                {stock.symbol}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive solvency, moat, valuation, and operational factor assessment
            </p>
          </div>
        </div>

        {/* Health Profile Pill & Rating */}
        <div className="flex items-center gap-3 self-start sm:self-auto bg-slate-950/70 border border-slate-800 p-2 rounded-2xl">
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
              Health Index
            </div>
            <div className="font-mono font-extrabold text-sm text-white flex items-center gap-1">
              <span>{healthScore}</span>
              <span className="text-[10px] text-slate-500 font-normal">/100</span>
            </div>
          </div>
          <div className={`px-2.5 py-1 rounded-xl text-xs font-mono font-bold border ${gradeColor}`}>
            Grade {grade}
          </div>
        </div>
      </div>

      {/* Health Metric Status Bar */}
      <div className="bg-slate-950/60 border border-slate-800/60 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-slate-400 font-medium shrink-0">
            Financial Health: <strong className="text-slate-200">{outlook}</strong>
          </div>
          <div className="flex-1 hidden md:block h-2 bg-slate-800 rounded-full overflow-hidden max-w-xs">
            <div 
              className={`h-full rounded-full transition-all duration-700 ${
                healthScore >= 75 ? 'bg-emerald-500' : healthScore >= 55 ? 'bg-blue-500' : 'bg-amber-500'
              }`}
              style={{ width: scoreBarWidth }}
            />
          </div>
        </div>

        {/* Filter Toggle Buttons */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeFilter === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({strengths.length + risks.length})
          </button>
          <button
            onClick={() => setActiveFilter('strengths')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              activeFilter === 'strengths'
                ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30'
                : 'text-emerald-400/80 hover:text-emerald-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Strengths ({strengths.length})
          </button>
          <button
            onClick={() => setActiveFilter('risks')}
            className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1 transition-all ${
              activeFilter === 'risks'
                ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Risks ({risks.length})
          </button>
        </div>
      </div>

      {/* Main Grid: Strengths and Risks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left Column: Key Financial Strengths */}
        {(activeFilter === 'all' || activeFilter === 'strengths') && (
          <div className={`space-y-3 ${activeFilter === 'strengths' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>Key Financial Strengths ({strengths.length})</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Fundamental Advantages
              </span>
            </div>

            <div className="space-y-3">
              {strengths.map((item) => (
                <div 
                  key={item.id}
                  className="bg-slate-950/70 border border-emerald-500/20 hover:border-emerald-500/40 rounded-2xl p-3.5 transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800">
                            {item.category}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            item.impact === 'High' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {item.impact} Impact
                          </span>
                        </div>
                      </div>
                    </div>

                    {item.metricHighlight && (
                      <span className="font-mono text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-900/60 shrink-0">
                        {item.metricHighlight}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-normal pl-6">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Right Column: Key Financial Risks */}
        {(activeFilter === 'all' || activeFilter === 'risks') && (
          <div className={`space-y-3 ${activeFilter === 'risks' ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <AlertTriangle className="w-4 h-4" />
                <span>Key Financial Risks ({risks.length})</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                Watch Items & Exposures
              </span>
            </div>

            <div className="space-y-3">
              {risks.map((item) => (
                <div 
                  key={item.id}
                  className="bg-slate-950/70 border border-amber-500/20 hover:border-amber-500/40 rounded-2xl p-3.5 transition-all space-y-2 group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0 group-hover:scale-110 transition-transform" />
                      <div>
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-md border border-slate-800">
                            {item.category}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            item.impact === 'High' 
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' 
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {item.impact} Risk
                          </span>
                        </div>
                      </div>
                    </div>

                    {item.metricHighlight && (
                      <span className="font-mono text-[11px] font-semibold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-900/60 shrink-0">
                        {item.metricHighlight}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-normal pl-6">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Executive Takeaway Bar */}
      <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-3.5 flex items-start gap-3 text-xs">
        <div className="w-7 h-7 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
          <BarChart3 className="w-3.5 h-3.5" />
        </div>
        <div className="flex-1">
          <div className="font-semibold text-slate-200 text-xs mb-0.5">
            Executive Financial Synthesis & Risk-Reward Outlook
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            {keyTakeaway}
          </p>
        </div>
      </div>
    </div>
  );
};
