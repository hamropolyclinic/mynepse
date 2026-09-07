import React, { useState, useMemo } from 'react';
import { 
  Table, 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  FileSpreadsheet,
  FileJson,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { OHLCVDataPoint, StockFundamental } from '../types/nepse';

interface DataApiTableProps {
  data: OHLCVDataPoint[];
  stock: StockFundamental;
  allStocks?: StockFundamental[];
  onSelectStock?: (symbol: string) => void;
  onSyncAllStocks?: () => void;
  isSyncingAll?: boolean;
  syncStats?: {
    totalStocks: number;
    tradedCount: number;
    gainersCount: number;
    losersCount: number;
    unchangedCount: number;
    totalTurnover: number;
    totalVolume: number;
    timestamp?: string;
  } | null;
}

export const DataApiTable: React.FC<DataApiTableProps> = ({ 
  data, 
  stock,
}) => {
  // Single stock OHLC state
  const [ohlcSearch, setOhlcSearch] = useState('');
  const [ohlcSortField, setOhlcSortField] = useState<keyof OHLCVDataPoint>('date');
  const [ohlcSortAsc, setOhlcSortAsc] = useState(false);
  const [ohlcPage, setOhlcPage] = useState(1);
  const pageSize = 15;

  // Filter and Sort OHLC
  const processedOhlc = useMemo(() => {
    let result = [...data];

    if (ohlcSearch.trim()) {
      const q = ohlcSearch.trim().toLowerCase();
      result = result.filter((d) => d.date.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      const valA = a[ohlcSortField] ?? 0;
      const valB = b[ohlcSortField] ?? 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        return ohlcSortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return ohlcSortAsc ? Number(valA) - Number(valB) : Number(valB) - Number(valA);
    });

    return result;
  }, [data, ohlcSearch, ohlcSortField, ohlcSortAsc]);

  const ohlcTotalPages = Math.ceil(processedOhlc.length / pageSize) || 1;
  const paginatedOhlc = processedOhlc.slice((ohlcPage - 1) * pageSize, ohlcPage * pageSize);

  const handleOhlcSort = (field: keyof OHLCVDataPoint) => {
    if (ohlcSortField === field) {
      setOhlcSortAsc(!ohlcSortAsc);
    } else {
      setOhlcSortField(field);
      setOhlcSortAsc(false);
    }
  };

  // Export OHLC CSV
  const handleExportOhlcCSV = () => {
    const headers = [
      'Date', 'Open', 'High', 'Low', 'Close', 'Change', 'ChangePercent', 'Volume', 'Turnover',
      'SMA20', 'EMA50', 'EMA200', 'SMA200', 'RSI14', 'MACD', 'MACD_Signal'
    ];
    const rows = data.map((d) => {
      const change = d.close - d.open;
      const changePct = d.open > 0 ? ((change / d.open) * 100).toFixed(2) : '0.00';
      return [
        d.date, d.open, d.high, d.low, d.close, change.toFixed(2), `${changePct}%`, d.volume, d.turnover,
        d.sma20 ?? '', d.ema50 ?? '', d.ema200 ?? '', d.sma200 ?? '', d.rsi14 ?? '', d.macd ?? '', d.macdSignal ?? ''
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NEPSE_${stock.symbol}_OHLCV_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export OHLC JSON
  const handleExportOhlcJSON = () => {
    const exportPayload = {
      symbol: stock.symbol,
      companyName: stock.name,
      sector: stock.sector,
      totalSessions: data.length,
      exportedAt: new Date().toISOString(),
      candles: data,
    };
    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `NEPSE_${stock.symbol}_OHLCV_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Single Stock OHLC Data & Export Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Table className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-bold text-white">
                  {stock.symbol} Historical OHLCV Data Table
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 font-mono border border-emerald-500/30 font-semibold">
                  {data.length} Trading Days
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-sans border border-slate-700">
                  {stock.sector}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {stock.name} • Daily Open, High, Low, Close, Volume, RSI(14), MACD, and Moving Averages.
              </p>
            </div>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end flex-wrap sm:flex-nowrap">
          <button
            id="export-ohlc-csv-btn"
            onClick={handleExportOhlcCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 active:scale-95 shadow-sm"
            title="Download CSV file of historical prices"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export CSV</span>
          </button>
          <button
            id="export-ohlc-json-btn"
            onClick={handleExportOhlcJSON}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700 active:scale-95 shadow-sm"
            title="Download JSON format of historical prices"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* SINGLE STOCK OHLC CANDLESTICK TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="ohlc-date-search-input"
              type="text"
              placeholder="Filter by Date (YYYY-MM-DD)..."
              value={ohlcSearch}
              onChange={(e) => {
                setOhlcSearch(e.target.value);
                setOhlcPage(1);
              }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
            />
          </div>

          <div className="text-xs text-slate-400">
            Showing <span className="font-mono text-white font-semibold">{processedOhlc.length}</span> recorded sessions
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-800">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 select-none font-mono">
                <th
                  onClick={() => handleOhlcSort('date')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Trading Date</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-500" />
                  </div>
                </th>
                <th onClick={() => handleOhlcSort('open')} className="py-3 px-3 text-right cursor-pointer hover:text-white">Open</th>
                <th onClick={() => handleOhlcSort('high')} className="py-3 px-3 text-right cursor-pointer hover:text-white text-emerald-400">High</th>
                <th onClick={() => handleOhlcSort('low')} className="py-3 px-3 text-right cursor-pointer hover:text-white text-rose-400">Low</th>
                <th onClick={() => handleOhlcSort('close')} className="py-3 px-3 text-right cursor-pointer hover:text-white text-white font-bold">Close</th>
                <th className="py-3 px-3 text-right">Change</th>
                <th onClick={() => handleOhlcSort('volume')} className="py-3 px-3 text-right cursor-pointer hover:text-white">Volume</th>
                <th className="py-3 px-3 text-right text-slate-400 hidden md:table-cell">Turnover</th>
                <th onClick={() => handleOhlcSort('rsi14')} className="py-3 px-3 text-right cursor-pointer hover:text-white text-indigo-400">RSI (14)</th>
                <th onClick={() => handleOhlcSort('macd')} className="py-3 px-3 text-right cursor-pointer hover:text-white text-blue-400">MACD</th>
                <th className="py-3 px-3 text-right text-amber-400 hidden lg:table-cell">SMA 20</th>
                <th className="py-3 px-3 text-right text-cyan-400 hidden lg:table-cell">EMA 50</th>
                <th className="py-3 px-3 text-right text-purple-400 hidden xl:table-cell">EMA 200</th>
                <th className="py-3 px-3 text-right text-blue-400 hidden xl:table-cell">SMA 200</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-slate-200 bg-slate-950/40">
              {paginatedOhlc.length > 0 ? (
                paginatedOhlc.map((row) => {
                  const isBull = row.close >= row.open;
                  const change = row.close - row.open;
                  const changePct = row.open > 0 ? (change / row.open) * 100 : 0;
                  return (
                    <tr key={row.date} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-4 font-sans font-medium text-slate-300 whitespace-nowrap">{row.date}</td>
                      <td className="py-2.5 px-3 text-right">Rs. {row.open.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-right text-emerald-400">Rs. {row.high.toFixed(1)}</td>
                      <td className="py-2.5 px-3 text-right text-rose-400">Rs. {row.low.toFixed(1)}</td>
                      <td className={`py-2.5 px-3 text-right font-bold ${isBull ? 'text-emerald-400' : 'text-rose-400'}`}>
                        Rs. {row.close.toFixed(1)}
                      </td>
                      <td className={`py-2.5 px-3 text-right font-semibold ${isBull ? 'text-emerald-400' : 'text-rose-400'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {isBull ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{change >= 0 ? `+${change.toFixed(1)}` : change.toFixed(1)} ({changePct >= 0 ? `+${changePct.toFixed(1)}%` : `${changePct.toFixed(1)}%`})</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{row.volume.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right text-slate-400 hidden md:table-cell">
                        {row.turnover ? `Rs. ${(row.turnover / 100000).toFixed(1)} L` : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {row.rsi14 !== undefined ? (
                          <span className={`px-1.5 py-0.5 rounded ${
                            row.rsi14 < 30 ? 'bg-emerald-500/20 text-emerald-400 font-bold' : row.rsi14 > 70 ? 'bg-rose-500/20 text-rose-400 font-bold' : 'text-indigo-300'
                          }`}>
                            {row.rsi14}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {row.macd !== undefined ? (
                          <span className={row.macd >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {row.macd}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-300 hidden lg:table-cell">{row.sma20?.toFixed(1) ?? '-'}</td>
                      <td className="py-2.5 px-3 text-right text-cyan-300 hidden lg:table-cell">{row.ema50?.toFixed(1) ?? '-'}</td>
                      <td className="py-2.5 px-3 text-right text-purple-300 hidden xl:table-cell">{row.ema200?.toFixed(1) ?? '-'}</td>
                      <td className="py-2.5 px-3 text-right text-blue-300 hidden xl:table-cell">{row.sma200?.toFixed(1) ?? '-'}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={14} className="py-8 text-center text-slate-500 font-sans">
                    No trading records found matching &quot;{ohlcSearch}&quot;
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="bg-slate-950/60 px-4 py-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs">
          <div className="text-slate-400">
            Page <span className="font-mono text-slate-200 font-bold">{ohlcPage}</span> of{' '}
            <span className="font-mono text-slate-200 font-bold">{ohlcTotalPages}</span>
            <span className="ml-2 text-slate-500">({processedOhlc.length} sessions total)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="ohlc-prev-page-btn"
              onClick={() => setOhlcPage((p) => Math.max(1, p - 1))}
              disabled={ohlcPage === 1}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              id="ohlc-next-page-btn"
              onClick={() => setOhlcPage((p) => Math.min(ohlcTotalPages, p + 1))}
              disabled={ohlcPage === ohlcTotalPages}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300 transition-colors"
              title="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
