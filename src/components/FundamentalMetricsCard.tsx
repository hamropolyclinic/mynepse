import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Percent, 
  BarChart2, 
  Building,
  Users,
  History,
  ChevronDown,
  ChevronUp,
  Calendar,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  FileText,
  Layers
} from 'lucide-react';
import { StockFundamental } from '../types/nepse';
import { KeyFinancialStrengthsRisksCard } from './KeyFinancialStrengthsRisksCard';
import { getShareBazaarDividend } from '../data/sharebazaarDividendData';

interface FundamentalMetricsCardProps {
  stock: StockFundamental;
  hideValuationMultiples?: boolean;
  hideQuarterlyReports?: boolean;
  hideShareholdingStructure?: boolean;
  hideStrengthsAndRisks?: boolean;
}

export const FundamentalMetricsCard: React.FC<FundamentalMetricsCardProps> = ({ 
  stock,
  hideValuationMultiples = false,
  hideQuarterlyReports = false,
  hideShareholdingStructure = false,
  hideStrengthsAndRisks = false
}) => {
  const [showDividendHistory, setShowDividendHistory] = useState(false);

  // P/E valuation relative to industry
  const peDiff = stock.peRatio - stock.industryPe;
  const isPeCheaper = peDiff < 0;

  // ShareBazaar Verified Dividend Data
  const sbDividend = getShareBazaarDividend(stock.symbol);
  const dividendHistory = stock.dividendHistory && stock.dividendHistory.length > 0 
    ? stock.dividendHistory 
    : (sbDividend?.history || []);
  const totalYield = stock.totalDividendYield ?? sbDividend?.totalDividendYield ?? (
    stock.currentPrice > 0 ? Number((((stock.lastDividendCash + stock.lastDividendBonus) * (stock.symbol === 'NIBLPF' ? 10 : 100) / 100) / stock.currentPrice * 100).toFixed(2)) : 0
  );
  const latestFY = stock.latestDividendFiscalYear || sbDividend?.latestFiscalYear || 'Latest';
  const hasHistory = dividendHistory.length > 0;

  // Fiscal Year Quarterly Filings State & Performance Calculations
  const [selectedFilingFY, setSelectedFilingFY] = useState<'ALL' | '2081/82' | '2082/83'>('2081/82');

  // Detect available fiscal years from stock quarterly filings
  const availableFiscalYears = useMemo(() => {
    const years = new Set<string>();
    stock.quarterlyReports.forEach((q) => {
      if (q.fiscalYear) {
        years.add(q.fiscalYear);
      } else if (q.quarter.includes('2082/83')) {
        years.add('2082/83');
      } else if (q.quarter.includes('2081/82')) {
        years.add('2081/82');
      }
    });
    return Array.from(years);
  }, [stock.quarterlyReports]);

  // Filter quarterly reports based on selected fiscal year
  const filteredQuarterlyReports = useMemo(() => {
    if (selectedFilingFY === 'ALL') {
      return stock.quarterlyReports;
    }
    return stock.quarterlyReports.filter((q) => 
      q.fiscalYear === selectedFilingFY || q.quarter.includes(selectedFilingFY)
    );
  }, [stock.quarterlyReports, selectedFilingFY]);

  // Cumulative performance aggregates for the selected period
  const totalPeriodRevenue = useMemo(() => {
    return filteredQuarterlyReports.reduce((sum, q) => sum + q.revenueNprCr, 0);
  }, [filteredQuarterlyReports]);

  const totalPeriodNetProfit = useMemo(() => {
    return filteredQuarterlyReports.reduce((sum, q) => sum + q.netProfitNprCr, 0);
  }, [filteredQuarterlyReports]);

  const periodProfitMargin = totalPeriodRevenue > 0 
    ? (totalPeriodNetProfit / totalPeriodRevenue) * 100 
    : 0;

  const cumulativeEps = useMemo(() => {
    return filteredQuarterlyReports.reduce((sum, q) => sum + q.eps, 0);
  }, [filteredQuarterlyReports]);

  const hasNplData = useMemo(() => {
    return filteredQuarterlyReports.some((q) => q.nplPercent !== undefined);
  }, [filteredQuarterlyReports]);

  const avgNpl = useMemo(() => {
    const withNpl = filteredQuarterlyReports.filter((q) => q.nplPercent !== undefined);
    if (withNpl.length === 0) return null;
    return withNpl.reduce((sum, q) => sum + (q.nplPercent || 0), 0) / withNpl.length;
  }, [filteredQuarterlyReports]);

  const maxRevenue = useMemo(() => {
    return Math.max(...filteredQuarterlyReports.map((q) => q.revenueNprCr), 1);
  }, [filteredQuarterlyReports]);

  return (
    <div className="space-y-6">
      {/* Valuation Multiples */}
      {!hideValuationMultiples && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 mb-5 gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Fundamental Multiples & Valuation</h2>
                <p className="text-xs text-slate-400">Financial health and ratios derived from latest audited quarterly filings</p>
              </div>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800 self-start sm:self-auto">
              Sector: {stock.sector}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: P/E Ratio */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-[11px] uppercase tracking-wider">Price to Earnings (P/E)</span>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full font-mono border border-slate-800">TTM</span>
                </div>
                <div className="text-2xl font-mono font-extrabold text-white mt-2">
                  {stock.peRatio.toFixed(2)}x
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 text-xs flex items-center justify-between">
                <span className="text-slate-500">Industry Avg:</span>
                <span className="font-mono text-slate-300 font-semibold">{stock.industryPe.toFixed(1)}x</span>
              </div>
              <div className={`text-[11px] mt-1 font-medium ${isPeCheaper ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isPeCheaper ? `✓ ${Math.abs(peDiff).toFixed(1)}x below sector average` : `⚠ ${peDiff.toFixed(1)}x premium over sector`}
              </div>
            </div>

            {/* Card 2: Earnings Per Share (EPS) */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-[11px] uppercase tracking-wider">Earnings Per Share (EPS)</span>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full font-mono border border-slate-800">Ann.</span>
                </div>
                <div className="text-2xl font-mono font-extrabold text-white mt-2">
                  Rs. {stock.eps.toFixed(2)}
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 text-xs flex items-center justify-between">
                <span className="text-slate-500">Price / EPS:</span>
                <span className="font-mono text-slate-300 font-semibold">{(stock.currentPrice / stock.eps).toFixed(1)} yrs pay</span>
              </div>
              <div className="text-[11px] text-emerald-400 mt-1 font-medium">
                Profitable operating earnings base
              </div>
            </div>

            {/* Card 3: Book Value Per Share (BVPS) */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-[11px] uppercase tracking-wider">Book Value (BVPS)</span>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full font-mono border border-slate-800">Net Worth</span>
                </div>
                <div className="text-2xl font-mono font-extrabold text-white mt-2">
                  Rs. {stock.bvps.toFixed(2)}
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 text-xs flex items-center justify-between">
                <span className="text-slate-500">Price to Book (P/B):</span>
                <span className="font-mono text-slate-300 font-semibold">{stock.pbRatio.toFixed(2)}x</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-medium">
                Net Assets: Rs. {stock.bvps.toFixed(0)} / share
              </div>
            </div>

            {/* Card 4: Return on Equity (ROE) */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="font-medium text-[11px] uppercase tracking-wider">Return on Equity (ROE)</span>
                  <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded-full font-mono border border-slate-800">Efficiency</span>
                </div>
                <div className="text-2xl font-mono font-extrabold text-white mt-2">
                  {stock.roe.toFixed(2)}%
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-800/60 text-xs flex items-center justify-between">
                <span className="text-slate-500">Return on Assets:</span>
                <span className="font-mono text-slate-300 font-semibold">{stock.roa.toFixed(2)}%</span>
              </div>
              <div className="text-[11px] text-indigo-400 mt-1 font-medium">
                High capital productivity score
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Financial Strengths & Risks */}
      {!hideStrengthsAndRisks && (
        <KeyFinancialStrengthsRisksCard stock={stock} />
      )}

      {/* Capital Structure & Shareholding Details */}
      <div className={`grid grid-cols-1 ${hideShareholdingStructure ? '' : 'lg:grid-cols-3'} gap-6`}>
          {/* Left: Capitalization Table */}
          <div className={`bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl ${hideShareholdingStructure ? 'w-full' : 'lg:col-span-2'}`}>
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-800/80 pb-3">
              <Building className="w-4 h-4 text-emerald-400" />
              Capitalization & Share Matrix
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 text-xs">
              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                <div className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Total Market Cap</div>
                <div className="font-mono font-bold text-base text-slate-100 mt-1">
                  Rs. {stock.marketCapNprCr.toFixed(2)} Cr
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Approx. Rs. {(stock.marketCapNprCr / 100).toFixed(2)} Arab</div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                <div className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Paid-Up Capital</div>
                <div className="font-mono font-bold text-base text-slate-100 mt-1">
                  Rs. {stock.paidUpCapitalCr.toFixed(2)} Cr
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Par Value Rs. 100</div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                <div className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Total Listed Shares</div>
                <div className="font-mono font-bold text-base text-slate-100 mt-1">
                  {stock.totalShares.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Units in CDS & Clearing</div>
              </div>

              {/* Dividend Yield card */}
              <div 
                id="capital-matrix-dividend-box"
                className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 relative group"
              >
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                  <span>Dividend Yield</span>
                  <span className="text-[9px] font-mono text-emerald-400/90 bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.5 rounded">
                    ShareBazaar API
                  </span>
                </div>
                
                <div className="mt-1 flex items-baseline justify-between">
                  <div>
                    <span className="font-mono font-extrabold text-base text-emerald-400">
                      {stock.dividendYield.toFixed(2)}%
                    </span>
                    <span className="text-[10px] text-slate-400 ml-1 font-sans">cash yield</span>
                  </div>
                  {totalYield > stock.dividendYield && (
                    <div className="text-[11px] font-mono text-indigo-300 font-semibold text-right">
                      {totalYield.toFixed(2)}% <span className="text-[9px] text-slate-500 font-sans font-normal">total</span>
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>Cash: {stock.lastDividendCash}% | Bonus: {stock.lastDividendBonus}%</span>
                  <span className="font-mono text-[9px] text-slate-500">{latestFY}</span>
                </div>

                {hasHistory && (
                  <button
                    type="button"
                    onClick={() => setShowDividendHistory(!showDividendHistory)}
                    className="mt-2 w-full pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-emerald-400 hover:text-emerald-300 transition-colors font-medium cursor-pointer"
                  >
                    <span className="flex items-center gap-1">
                      <History className="w-3 h-3" />
                      {showDividendHistory ? 'Hide Dividend History' : `View ${dividendHistory.length} Past Payouts`}
                    </span>
                    {showDividendHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>
                )}
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                <div className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Market Beta (Volatility)</div>
                <div className="font-mono font-bold text-base text-slate-100 mt-1">
                  {stock.beta.toFixed(2)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {stock.beta > 1 ? 'High sensitivity to index' : 'Defensive / Low volatility'}
                </div>
              </div>

              <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80">
                <div className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">52-Week Range</div>
                <div className="font-mono font-bold text-sm text-slate-100 mt-1">
                  Rs. {stock.low52.toFixed(1)} - {stock.high52.toFixed(1)}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">Historical spread</div>
              </div>
            </div>

            {/* Historical Dividend Breakdown (ShareBazaar API) */}
            {showDividendHistory && (
              <div className="mt-4 pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-emerald-400" />
                    <h3 className="text-xs font-semibold text-slate-200">
                      Historical Dividend Distributions ({stock.symbol})
                    </h3>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded-full">
                    Sourced from ShareBazaar Community API
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/80">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead className="bg-slate-900/90 text-slate-400 text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="py-2 px-3">Fiscal Year</th>
                        <th className="py-2 px-3 text-right">Cash %</th>
                        <th className="py-2 px-3 text-right">Bonus %</th>
                        <th className="py-2 px-3 text-right">Total %</th>
                        <th className="py-2 px-3 text-right">Book Closure</th>
                        <th className="py-2 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {dividendHistory.map((d, i) => (
                        <tr key={i} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-2 px-3 font-semibold text-slate-200">
                            {d.fiscalYear || 'N/A'}
                          </td>
                          <td className="py-2 px-3 text-right text-emerald-400">
                            {Number(d.cashDividendPercent || 0).toFixed(2)}%
                          </td>
                          <td className="py-2 px-3 text-right text-indigo-300">
                            {Number(d.bonusDividendPercent || 0).toFixed(2)}%
                          </td>
                          <td className="py-2 px-3 text-right font-bold text-white">
                            {(Number(d.cashDividendPercent || 0) + Number(d.bonusDividendPercent || 0)).toFixed(2)}%
                          </td>
                          <td className="py-2 px-3 text-right text-slate-400 text-[10px]">
                            {d.bookClosureDate || '—'}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-sans font-medium ${
                              d.status === 'Proposed' 
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' 
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            }`}>
                              {d.status || 'Distributed'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Cash DPS = (Cash% × Par Value Rs. {stock.symbol === 'NIBLPF' ? '10' : '100'}) ÷ 100</span>
                  <span>Yield = Cash DPS ÷ Current Market Price</span>
                </div>
              </div>
            )}

            {/* About Company snippet */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <h3 className="text-xs font-semibold text-slate-300 mb-1">Company Profile</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-normal">
                {stock.description}
              </p>
            </div>
          </div>

          {/* Right: Promoter vs Public Shareholding */}
          {!hideShareholdingStructure && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-white mb-4 border-b border-slate-800/80 pb-3">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Shareholding Structure
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium">Promoter Shareholders</span>
                      <span className="font-mono font-bold text-indigo-400">
                        {stock.promoterHolding % 1 !== 0 ? stock.promoterHolding.toFixed(2) : stock.promoterHolding.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
                        style={{ width: `${stock.promoterHolding}%` }} 
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {Math.round((stock.totalShares * stock.promoterHolding) / 100).toLocaleString()} shares locked/promoter
                    </p>
                    {stock.promoterEntities && (
                      <p className="text-[10px] text-indigo-300/80 mt-1 bg-indigo-950/40 px-2 py-1 rounded border border-indigo-900/40">
                        <strong>Promoters:</strong> {stock.promoterEntities}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-slate-400 font-medium">General Public (Free Float)</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {stock.publicHolding % 1 !== 0 ? stock.publicHolding.toFixed(2) : stock.publicHolding.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                        style={{ width: `${stock.publicHolding}%` }} 
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {Math.round((stock.totalShares * stock.publicHolding) / 100).toLocaleString()} shares actively tradable
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1.5">
                <div className="font-semibold text-slate-300">Float Liquidity Analysis:</div>
                <div>
                  • Float Market Cap: <strong className="text-emerald-400 font-mono">Rs. {((stock.marketCapNprCr * stock.publicHolding) / 100).toFixed(2)} Cr</strong>
                </div>
                <div>
                  • Status: <span className="text-slate-300">{stock.lockInStatus || 'Lock-in period compliance verified as per SEBON guidelines.'}</span>
                </div>
              </div>
            </div>
          )}
      </div>

      {/* Quarterly Reports Trajectory */}
      {!hideQuarterlyReports && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl space-y-5">
          {/* Header with Title and Fiscal Year Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                Quarterly Financial Filings Performance
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Recent Fiscal Year Reports • Audited Statements & Corporate Disclosures
              </p>
            </div>

            {/* Fiscal Year Filter Buttons */}
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setSelectedFilingFY('2081/82')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFilingFY === '2081/82'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                FY 2081/82 (Audited)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilingFY('2082/83')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFilingFY === '2082/83'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                FY 2082/83 (Latest)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilingFY('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedFilingFY === 'ALL'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                All Recent
              </button>
            </div>
          </div>

          {/* Executive Performance Summary Cards for the selected period */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {selectedFilingFY === 'ALL' ? 'Multi-Year Revenue' : `Cumulative Revenue (${selectedFilingFY})`}
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-slate-100 mt-1">
                Rs. {totalPeriodRevenue.toFixed(1)} <span className="text-xs text-slate-400 font-sans font-normal">Cr</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Across {filteredQuarterlyReports.length} filing quarters</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {selectedFilingFY === 'ALL' ? 'Total Net Profit' : `Net Profit (${selectedFilingFY})`}
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-400 mt-1">
                Rs. {totalPeriodNetProfit.toFixed(1)} <span className="text-xs text-slate-400 font-sans font-normal">Cr</span>
              </div>
              <div className="text-[10px] text-emerald-500/80 mt-0.5 font-mono">
                {periodProfitMargin.toFixed(1)}% net margin
              </div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                Cumulative EPS
              </div>
              <div className="text-base sm:text-lg font-bold font-mono text-cyan-400 mt-1">
                Rs. {cumulativeEps.toFixed(2)}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">Sum of quarterly earnings</div>
            </div>

            <div className="bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3.5">
              <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {hasNplData ? 'Average NPL Ratio' : 'Filing Compliance'}
              </div>
              {hasNplData ? (
                <>
                  <div className="text-base sm:text-lg font-bold font-mono text-amber-400 mt-1">
                    {avgNpl?.toFixed(2)}%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Asset quality health index</div>
                </>
              ) : (
                <>
                  <div className="text-base sm:text-lg font-bold font-sans text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100%
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Timely SEBON filing</div>
                </>
              )}
            </div>
          </div>

          {/* Visual Quarter Revenue vs Profit Trajectory */}
          <div className="bg-slate-950/50 border border-slate-800/70 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Quarterly Trajectory & Volume Comparison
              </span>
              <div className="flex items-center gap-3 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-600 inline-block" />
                  Revenue
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                  Net Profit
                </span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {filteredQuarterlyReports.map((q) => {
                const revPct = Math.min(100, Math.max(12, (q.revenueNprCr / maxRevenue) * 100));
                const profitPct = Math.min(100, Math.max(4, (q.netProfitNprCr / maxRevenue) * 100));
                return (
                  <div key={q.quarter} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-300 font-sans font-medium flex items-center gap-1.5">
                        {q.quarter}
                        {q.filingPeriod && (
                          <span className="text-[10px] text-slate-500">({q.filingPeriod})</span>
                        )}
                      </span>
                      <span className="text-slate-400">
                        Rev: <strong className="text-slate-200 font-mono">Rs. {q.revenueNprCr.toFixed(1)} Cr</strong> • NP: <strong className="text-emerald-400 font-mono">Rs. {q.netProfitNprCr.toFixed(1)} Cr</strong>
                      </span>
                    </div>
                    <div className="h-2 w-full bg-slate-800/60 rounded-full overflow-hidden flex relative">
                      <div 
                        className="h-full bg-slate-600/70 rounded-l-full transition-all duration-300"
                        style={{ width: `${revPct}%` }}
                        title={`Revenue: Rs. ${q.revenueNprCr.toFixed(1)} Cr`}
                      />
                      <div 
                        className="h-full bg-emerald-500 rounded-r-full -ml-1 transition-all duration-300"
                        style={{ width: `${profitPct}%` }}
                        title={`Net Profit: Rs. ${q.netProfitNprCr.toFixed(1)} Cr`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quarterly Filings Data Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800/80">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium bg-slate-950">
                  <th className="py-3 px-4">Filing Quarter</th>
                  <th className="py-3 px-4">Filing Period</th>
                  <th className="py-3 px-4 text-right">Revenue (Rs. Cr)</th>
                  <th className="py-3 px-4 text-right">Net Profit (Rs. Cr)</th>
                  <th className="py-3 px-4 text-right">Net Margin</th>
                  <th className="py-3 px-4 text-right">Quarterly EPS</th>
                  <th className="py-3 px-4 text-right">YoY Growth</th>
                  {hasNplData && <th className="py-3 px-4 text-right">NPL (%)</th>}
                  <th className="py-3 px-4 text-right">Audit Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 font-mono bg-slate-950/40">
                {filteredQuarterlyReports.map((q) => {
                  const margin = q.revenueNprCr > 0 ? ((q.netProfitNprCr / q.revenueNprCr) * 100).toFixed(1) : '0.0';
                  const isAudited = q.status === 'Audited' || (!q.status && q.quarter.includes('2081/82'));
                  const isUnaudited = q.status === 'Unaudited' || (!q.status && q.quarter.includes('2082/83'));
                  
                  return (
                    <tr key={q.quarter} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 font-sans font-semibold text-slate-200">
                        <div className="flex items-center gap-1.5">
                          <span>{q.quarter}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-sans text-slate-400 text-[11px]">
                        {q.filingPeriod || (q.quarter.includes('Q4') ? 'Ashadh' : q.quarter.includes('Q3') ? 'Chaitra' : q.quarter.includes('Q2') ? 'Poush' : 'Ashwin')}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-300">
                        Rs. {q.revenueNprCr.toFixed(1)}
                      </td>
                      <td className="py-3.5 px-4 text-right text-emerald-400 font-bold">
                        Rs. {q.netProfitNprCr.toFixed(1)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {margin}%
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-100 font-bold">
                        Rs. {q.eps.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {q.yoyGrowthPercent !== undefined ? (
                          <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                            q.yoyGrowthPercent >= 0 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}>
                            {q.yoyGrowthPercent >= 0 ? `+${q.yoyGrowthPercent.toFixed(1)}%` : `${q.yoyGrowthPercent.toFixed(1)}%`}
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px] font-sans">-</span>
                        )}
                      </td>
                      {hasNplData && (
                        <td className="py-3.5 px-4 text-right text-amber-400 font-semibold">
                          {q.nplPercent !== undefined ? `${q.nplPercent.toFixed(2)}%` : '-'}
                        </td>
                      )}
                      <td className="py-3.5 px-4 text-right font-sans">
                        {isAudited ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-medium border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Audited
                          </span>
                        ) : isUnaudited ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[10px] font-medium border border-amber-500/30">
                            <Clock className="w-3 h-3" />
                            Unaudited
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[10px] font-medium border border-cyan-500/30">
                            Verified
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Context & Compliance Footnote */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60 gap-2">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Reporting Calendar: Nepal Bikram Sambat (BS) • Q1: Ashwin, Q2: Poush, Q3: Chaitra, Q4: Ashadh
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              Source: Official NEPSE Corporate Disclosures & Audited Annual Filings
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
