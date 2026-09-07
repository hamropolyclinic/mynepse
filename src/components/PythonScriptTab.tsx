import React, { useState } from 'react';
import { 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  Sliders, 
  Sparkles, 
  ExternalLink,
  PlayCircle,
  FileCode,
  Layers,
  BookOpen,
  Cpu,
  Server
} from 'lucide-react';
import { StockFundamental } from '../types/nepse';
import { 
  generatePythonStreamlitScript, 
  generateRequirementsTxt, 
  generateNepseApiPythonLibrarySnippet, 
  generateNepseApiNodeLibrarySnippet, 
  PythonScriptOptions 
} from '../utils/pythonScriptGenerator';

interface PythonScriptTabProps {
  stock: StockFundamental;
}

export const PythonScriptTab: React.FC<PythonScriptTabProps> = ({ stock }) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedReqs, setCopiedReqs] = useState(false);
  const [activeSubView, setActiveSubView] = useState<'code' | 'nepse_api' | 'node_api' | 'instructions' | 'requirements'>('code');

  // Script Generator Options
  const [includeRSI, setIncludeRSI] = useState(true);
  const [includeMACD, setIncludeMACD] = useState(true);
  const [includeSMA, setIncludeSMA] = useState(true);
  const [includeEMA, setIncludeEMA] = useState(true);
  const [includeBB, setIncludeBB] = useState(true);
  const [daysHistory, setDaysHistory] = useState(365);
  const [chartTheme, setChartTheme] = useState<'plotly_dark' | 'plotly_white'>('plotly_dark');

  const scriptOptions: PythonScriptOptions = {
    ticker: stock.symbol,
    stock,
    includeRSI,
    includeMACD,
    includeSMA,
    includeEMA,
    includeBollingerBands: includeBB,
    includeFundamentals: true,
    chartTheme,
    daysHistory,
  };

  const pythonScript = generatePythonStreamlitScript(scriptOptions);
  const requirementsTxt = generateRequirementsTxt();
  const nepseApiPythonCode = generateNepseApiPythonLibrarySnippet(stock.symbol);
  const nepseApiNodeCode = generateNepseApiNodeLibrarySnippet(stock.symbol);

  const getCurrentSnippet = () => {
    switch (activeSubView) {
      case 'code':
        return pythonScript;
      case 'nepse_api':
        return nepseApiPythonCode;
      case 'node_api':
        return nepseApiNodeCode;
      case 'requirements':
        return requirementsTxt;
      default:
        return pythonScript;
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getCurrentSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyReqs = () => {
    navigator.clipboard.writeText(requirementsTxt);
    setCopiedReqs(true);
    setTimeout(() => setCopiedReqs(false), 2000);
  };

  const handleDownloadScript = () => {
    let content = pythonScript;
    let filename = `nepse_${stock.symbol.toLowerCase()}_dashboard.py`;

    if (activeSubView === 'nepse_api') {
      content = nepseApiPythonCode;
      filename = `nepse_api_${stock.symbol.toLowerCase()}_client.py`;
    } else if (activeSubView === 'node_api') {
      content = nepseApiNodeCode;
      filename = `nepse_api_${stock.symbol.toLowerCase()}_client.ts`;
    } else if (activeSubView === 'requirements') {
      content = requirementsTxt;
      filename = 'requirements.txt';
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner Bento Container */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-5 lg:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Code2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base lg:text-lg font-bold text-white">NEPSE API & Python / Node Script Hub</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-semibold border border-indigo-500/30">
                  {stock.symbol} ({stock.sector})
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Ready-to-run scripts powered by official <code className="text-indigo-300">nepse-api</code> Python and <code className="text-emerald-300">@rumess/nepse-api</code> Node libraries.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="copy-python-btn"
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copied Active Script!' : 'Copy Active Code'}</span>
            </button>

            <button
              id="download-python-btn"
              onClick={handleDownloadScript}
              className="px-4 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs flex items-center gap-1.5 transition-all border border-slate-700 active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
          </div>
        </div>
      </div>

      {/* Script Configuration Bento Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-4 uppercase tracking-wider">
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          Customize Generated Python Script Parameters
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs">
          {/* Lookback Days */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Lookback</span>
            <select
              value={daysHistory}
              onChange={(e) => setDaysHistory(Number(e.target.value))}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 mt-1.5 text-xs font-mono focus:outline-none"
            >
              <option value={90}>90 Days (3M)</option>
              <option value={180}>180 Days (6M)</option>
              <option value={365}>365 Days (1Y)</option>
              <option value={730}>730 Days (2Y)</option>
            </select>
          </div>

          {/* Theme */}
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
            <span className="text-slate-400 text-[11px] uppercase tracking-wider font-semibold">Plotly Theme</span>
            <select
              value={chartTheme}
              onChange={(e) => setChartTheme(e.target.value as 'plotly_dark' | 'plotly_white')}
              className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl px-2.5 py-1.5 mt-1.5 text-xs font-mono focus:outline-none"
            >
              <option value="plotly_dark">plotly_dark</option>
              <option value="plotly_white">plotly_white</option>
            </select>
          </div>

          {/* RSI Toggle */}
          <label className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors">
            <div>
              <div className="font-semibold text-slate-200">RSI (14)</div>
              <div className="text-[10px] text-slate-500">Oscillator</div>
            </div>
            <input
              type="checkbox"
              checked={includeRSI}
              onChange={(e) => setIncludeRSI(e.target.checked)}
              className="accent-indigo-500 w-4 h-4 rounded"
            />
          </label>

          {/* MACD Toggle */}
          <label className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors">
            <div>
              <div className="font-semibold text-slate-200">MACD</div>
              <div className="text-[10px] text-slate-500">(12, 26, 9)</div>
            </div>
            <input
              type="checkbox"
              checked={includeMACD}
              onChange={(e) => setIncludeMACD(e.target.checked)}
              className="accent-indigo-500 w-4 h-4 rounded"
            />
          </label>

          {/* Moving Averages Toggle */}
          <label className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors">
            <div>
              <div className="font-semibold text-slate-200">Moving Averages</div>
              <div className="text-[10px] text-slate-500">SMA 200 & EMA 50, 200</div>
            </div>
            <input
              type="checkbox"
              checked={includeSMA}
              onChange={(e) => setIncludeSMA(e.target.checked)}
              className="accent-indigo-500 w-4 h-4 rounded"
            />
          </label>

          {/* Bollinger Bands Toggle */}
          <label className="bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors">
            <div>
              <div className="font-semibold text-slate-200">Bollinger Bands</div>
              <div className="text-[10px] text-slate-500">(20, 2)</div>
            </div>
            <input
              type="checkbox"
              checked={includeBB}
              onChange={(e) => setIncludeBB(e.target.checked)}
              className="accent-indigo-500 w-4 h-4 rounded"
            />
          </label>
        </div>
      </div>

      {/* Code Viewer / Sub-Tab Bento Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="border-b border-slate-800 bg-slate-950 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-full border border-slate-800 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveSubView('code')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubView === 'code' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Streamlit App
            </button>

            <button
              onClick={() => setActiveSubView('nepse_api')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubView === 'nepse_api' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400" />
              Python nepse-api Library
            </button>

            <button
              onClick={() => setActiveSubView('node_api')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubView === 'node_api' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              Node @rumess/nepse-api
            </button>

            <button
              onClick={() => setActiveSubView('instructions')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubView === 'instructions' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Execution Guide
            </button>

            <button
              onClick={() => setActiveSubView('requirements')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeSubView === 'requirements' ? 'bg-indigo-600 text-white font-bold shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              requirements.txt
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
            {activeSubView === 'node_api' ? 'Node.js 18+ / TS' : 'Python 3.9+'}
          </div>
        </div>

        {/* View 1: Streamlit Python Script */}
        {activeSubView === 'code' && (
          <div className="relative">
            <pre className="p-5 text-xs font-mono text-slate-200 bg-slate-950 overflow-x-auto max-h-[600px] leading-relaxed select-text">
              <code>{pythonScript}</code>
            </pre>
          </div>
        )}

        {/* View 2: Python nepse-api SDK */}
        {activeSubView === 'nepse_api' && (
          <div className="relative">
            <div className="bg-slate-900 border-b border-slate-800 px-5 py-2.5 flex items-center justify-between text-xs text-slate-300">
              <span className="font-mono text-amber-400">Library: nepse-api (Async Client)</span>
              <span className="text-slate-500 text-[11px]">Install: pip install nepse-api aiohttp</span>
            </div>
            <pre className="p-5 text-xs font-mono text-slate-200 bg-slate-950 overflow-x-auto max-h-[600px] leading-relaxed select-text">
              <code>{nepseApiPythonCode}</code>
            </pre>
          </div>
        )}

        {/* View 3: Node @rumess/nepse-api */}
        {activeSubView === 'node_api' && (
          <div className="relative">
            <div className="bg-slate-900 border-b border-slate-800 px-5 py-2.5 flex items-center justify-between text-xs text-slate-300">
              <span className="font-mono text-emerald-400">Package: @rumess/nepse-api</span>
              <span className="text-slate-500 text-[11px]">Install: npm install @rumess/nepse-api</span>
            </div>
            <pre className="p-5 text-xs font-mono text-slate-200 bg-slate-950 overflow-x-auto max-h-[600px] leading-relaxed select-text">
              <code>{nepseApiNodeCode}</code>
            </pre>
          </div>
        )}

        {/* View 4: Instructions */}
        {activeSubView === 'instructions' && (
          <div className="p-6 text-xs text-slate-300 space-y-5 bg-slate-950/40">
            <div>
              <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Step-by-Step Local Execution Guide
              </h3>
              <p className="text-slate-400">
                You can run this exact NEPSE analytics dashboard locally or use the official NEPSE Python library with asynchronous token deobfuscation.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="text-xs font-semibold text-indigo-400 mb-1 uppercase tracking-wider">Step 1: Install Dependencies</div>
                <p className="text-slate-400 mb-2">Create a virtual environment (optional) and install requirements:</p>
                <div className="bg-slate-950 p-3 rounded-xl font-mono text-emerald-400 border border-slate-800">
                  <code>pip install streamlit plotly pandas numpy requests nepse-api aiohttp</code>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="text-xs font-semibold text-indigo-400 mb-1 uppercase tracking-wider">Step 2: Save Script</div>
                <p className="text-slate-400 mb-2">
                  Click the <strong>Download File</strong> button above or save the code as <code>nepse_dashboard.py</code>.
                </p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <div className="text-xs font-semibold text-indigo-400 mb-1 uppercase tracking-wider">Step 3: Launch Streamlit Dashboard</div>
                <p className="text-slate-400 mb-2">Run the dashboard with hot-reloading enabled:</p>
                <div className="bg-slate-950 p-3 rounded-xl font-mono text-emerald-400 border border-slate-800">
                  <code>streamlit run nepse_dashboard.py</code>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Streamlit will launch a local server at <code>http://localhost:8501</code> with the interactive NEPSE candlestick & indicators chart.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View 5: requirements.txt */}
        {activeSubView === 'requirements' && (
          <div className="p-5 bg-slate-950">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="text-slate-400 font-mono">requirements.txt</span>
              <button
                onClick={handleCopyReqs}
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-xs flex items-center gap-1.5 transition-colors"
              >
                {copiedReqs ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedReqs ? 'Copied' : 'Copy'}
              </button>
            </div>
            <pre className="p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-xs text-indigo-300">
              {requirementsTxt}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
