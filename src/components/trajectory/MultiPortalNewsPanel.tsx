import React, { useState } from 'react';
import { 
  Newspaper, 
  ExternalLink, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Filter, 
  Sparkles, 
  Clock, 
  Tag, 
  Layers, 
  Compass, 
  ShieldCheck,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { NewsPortalReport, NewsSentimentPolarity } from '../../types/nepse';

interface MultiPortalNewsPanelProps {
  reports: NewsPortalReport[];
  stockSymbol: string;
}

export const MultiPortalNewsPanel: React.FC<MultiPortalNewsPanelProps> = ({
  reports,
  stockSymbol
}) => {
  const [selectedPortal, setSelectedPortal] = useState<string>('ALL');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('ALL');

  // List of unique portals present in reports
  const portals = Array.from(new Set(reports.map(r => r.portalName)));

  // Filter logic
  const filteredReports = reports.filter(r => {
    if (selectedPortal !== 'ALL' && r.portalName !== selectedPortal) return false;
    if (selectedSentiment !== 'ALL' && r.sentiment !== selectedSentiment) return false;
    return true;
  });

  const getPortalBrand = (name: string) => {
    switch (name) {
      case 'ShareSansar':
        return {
          bg: 'bg-blue-950/80',
          border: 'border-blue-500/40',
          text: 'text-blue-400',
          badge: 'bg-blue-500/20 text-blue-300',
          domain: 'sharesansar.com'
        };
      case 'Merolagani':
        return {
          bg: 'bg-emerald-950/80',
          border: 'border-emerald-500/40',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300',
          domain: 'merolagani.com'
        };
      case 'Bizshala':
        return {
          bg: 'bg-amber-950/80',
          border: 'border-amber-500/40',
          text: 'text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300',
          domain: 'bizshala.com'
        };
      case 'Arthik Abhiyan':
        return {
          bg: 'bg-rose-950/80',
          border: 'border-rose-500/40',
          text: 'text-rose-400',
          badge: 'bg-rose-500/20 text-rose-300',
          domain: 'abhiyan.com.np'
        };
      case 'Nepali Paisa':
        return {
          bg: 'bg-purple-950/80',
          border: 'border-purple-500/40',
          text: 'text-purple-400',
          badge: 'bg-purple-500/20 text-purple-300',
          domain: 'nepalipaisa.com'
        };
      default:
        return {
          bg: 'bg-slate-900',
          border: 'border-slate-700',
          text: 'text-slate-300',
          badge: 'bg-slate-800 text-slate-300',
          domain: 'nepse.com'
        };
    }
  };

  const getSentimentPill = (sentiment: NewsSentimentPolarity, score: number) => {
    switch (sentiment) {
      case 'BULLISH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-950 border border-emerald-500/40 text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            Bullish (+{score})
          </span>
        );
      case 'BEARISH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-950 border border-rose-500/40 text-rose-400">
            <TrendingDown className="w-3.5 h-3.5" />
            Bearish ({score})
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950 border border-amber-500/40 text-amber-400">
            <Minus className="w-3.5 h-3.5" />
            Neutral ({score >= 0 ? `+${score}` : score})
          </span>
        );
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-purple-400 font-semibold mb-1">
            <Newspaper className="w-4 h-4" />
            <span>5-PORTAL NEWS INTELLIGENCE & DISCLOSURE RADAR</span>
          </div>
          <h3 className="text-xl font-black text-white flex items-center gap-3">
            <span>News Media Trajectory Analysis for {stockSymbol}</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-500/30 text-purple-300 font-mono">
              {portals.length} Verified Nepali Portals
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Real-time news releases from ShareSansar, Merolagani, Bizshala, Arthik Abhiyan, and Nepali Paisa with automated trajectory sentiment impact scores.
          </p>
        </div>

        {/* Portal & Sentiment Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Portal Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-2xl">
            <button
              onClick={() => setSelectedPortal('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all ${
                selectedPortal === 'ALL'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Portals ({reports.length})
            </button>
            {portals.map(portal => (
              <button
                key={portal}
                onClick={() => setSelectedPortal(portal)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono transition-all ${
                  selectedPortal === portal
                    ? 'bg-purple-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {portal}
              </button>
            ))}
          </div>

          {/* Sentiment Filter */}
          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-1 rounded-2xl">
            {['ALL', 'BULLISH', 'NEUTRAL', 'BEARISH'].map((s) => (
              <button
                key={s}
                onClick={() => setSelectedSentiment(s)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-mono transition-all ${
                  selectedSentiment === s
                    ? 'bg-slate-800 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5 Portals Verification Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-1">
        {['ShareSansar', 'Merolagani', 'Bizshala', 'Arthik Abhiyan', 'Nepali Paisa'].map((pName) => {
          const brand = getPortalBrand(pName);
          const portalCount = reports.filter(r => r.portalName === pName).length;
          return (
            <div
              key={pName}
              onClick={() => setSelectedPortal(selectedPortal === pName ? 'ALL' : pName)}
              className={`cursor-pointer border rounded-2xl p-3 text-center transition-all ${
                selectedPortal === pName
                  ? `${brand.bg} ${brand.border} ring-1 ring-purple-500/50 shadow-md`
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`text-xs font-mono font-black ${brand.text}`}>
                {pName}
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                {brand.domain}
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>{portalCount} {portalCount === 1 ? 'Report' : 'Reports'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* News Cards Grid */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-slate-950/40 border border-slate-800 rounded-2xl text-slate-500 text-xs font-mono">
            No news articles match the selected portal or sentiment filter.
          </div>
        ) : (
          filteredReports.map((report) => {
            const brand = getPortalBrand(report.portalName);
            return (
              <div
                key={report.id}
                className="bg-slate-950/70 border border-slate-800/90 hover:border-slate-700/90 rounded-2xl p-5 transition-all shadow-md space-y-3.5"
              >
                {/* Card Top Strip: Portal Badge, Time, Sentiment */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border ${brand.bg} ${brand.border} ${brand.text}`}>
                      {report.portalName}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {report.timeAgo}
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400">
                      {report.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {getSentimentPill(report.sentiment, report.sentimentScore)}
                    <a
                      href={report.portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-all"
                      title={`Visit ${report.portalName}`}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Headline */}
                <h4 className="text-base font-bold text-white leading-snug tracking-tight">
                  {report.headline}
                </h4>

                {/* Summary */}
                <p className="text-xs text-slate-300 leading-relaxed">
                  {report.summary}
                </p>

                {/* Trajectory Impact Note (The Critical Synthesis Box) */}
                <div className="bg-purple-950/20 border border-purple-500/20 rounded-xl p-3 flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[11px] font-mono font-bold text-purple-300 block">
                      Price Trajectory Impact Assessment:
                    </span>
                    <p className="text-xs text-slate-300 mt-0.5">
                      {report.trajectoryImpactNote}
                    </p>
                  </div>
                </div>

                {/* Tags and Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {report.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="text-[10px] font-mono text-slate-500">
                    Impact Weight: <span className="font-bold text-slate-400">{report.impactWeight}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
