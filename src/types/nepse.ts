export interface QuarterlyReport {
  quarter: string; // e.g. "Q4 2081/82"
  revenueNprCr: number;
  netProfitNprCr: number;
  eps: number;
  nplPercent?: number; // Non-performing loans (for banks)
  fiscalYear?: string; // e.g. "2081/82" or "2082/83"
  filingPeriod?: string; // e.g. "Ashadh 2082", "Chaitra 2081"
  yoyGrowthPercent?: number; // e.g. +14.2%
  status?: 'Audited' | 'Unaudited' | 'Verified';
}

export type NepseSector = 
  | 'Commercial Banks'
  | 'Development Banks'
  | 'Finance'
  | 'Microfinance'
  | 'Hydropower'
  | 'Life Insurance'
  | 'Non-Life Insurance'
  | 'Manufacturing & Processing'
  | 'Hotels & Tourism'
  | 'Investment'
  | 'Trading'
  | 'Others'
  | 'Mutual Fund';

export interface StockFundamental {
  symbol: string;
  name: string;
  sector: NepseSector;
  currentPrice: number;
  previousClose: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  change: number;
  changePercent: number;
  volume: number;
  turnoverNpr: number;
  high52: number;
  low52: number;
  
  // Key Fundamental Metrics
  peRatio: number;
  industryPe: number;
  eps: number;
  bvps: number;
  pbRatio: number;
  roe: number; // Return on Equity %
  roa: number; // Return on Assets %
  dividendYield: number; // % (Cash Dividend Yield)
  totalDividendYield?: number; // % (Total Yield including bonus shares)
  lastDividendCash: number; // %
  lastDividendBonus: number; // %
  latestDividendFiscalYear?: string;
  latestBookClosureDate?: string;
  marketCapNprCr: number; // in Crores
  paidUpCapitalCr: number; // in Crores
  totalShares: number; // in units
  promoterHolding: number; // %
  publicHolding: number; // %
  promoterShares?: number; // exact units
  publicShares?: number; // exact units
  promoterEntities?: string; // key promoter groups/institutions
  lockInStatus?: string; // e.g. "Lock-in Expired", "SEBON Compliant"
  beta: number;
  description: string;
  quarterlyReports: QuarterlyReport[];
  dividendHistory?: DividendRecord[];
  dividendCapacity?: DividendCapacityAnalysis;
  financialStrengths?: FinancialFactor[];
  financialRisks?: FinancialFactor[];
  financialHealth?: StockFinancialHealthProfile;
}

export type FinancialFactorCategory = 
  | 'Profitability & Earnings'
  | 'Solvency & Leverage'
  | 'Valuation & Multiples'
  | 'Dividend & Cash Flow'
  | 'Asset Quality & Credit'
  | 'Market & Liquidity'
  | 'Operational & Industry Moat'
  | 'Regulatory & Policy';

export interface FinancialFactor {
  id: string;
  title: string;
  description: string;
  category: FinancialFactorCategory;
  impact: 'High' | 'Moderate' | 'Low';
  metricHighlight?: string;
}

export interface StockFinancialHealthProfile {
  healthScore: number; // 0 to 100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C';
  outlook: 'Strong / Robust' | 'Stable / Resilient' | 'Moderate' | 'Cautious / High Risk';
  strengthsCount: number;
  risksCount: number;
  strengths: FinancialFactor[];
  risks: FinancialFactor[];
  keyTakeaway: string;
}

export interface DividendRecord {
  fiscalYear: string; // e.g. "2080/81"
  bonusDividendPercent: number; // Bonus Share %
  cashDividendPercent: number; // Cash Dividend %
  totalDividendPercent: number; // Total Dividend %
  bookClosureDate?: string; // Date (BS/AD)
  agmDate?: string; // AGM Date
  status: 'Distributed' | 'Proposed' | 'Approved' | 'No Dividend';
  cashAmountCr?: number; // Total Cash payout in Cr
  bonusSharesIssued?: number; // Total Bonus shares issued
}

export interface DividendCapacityAnalysis {
  capacityPercent: number; // % of Paid-Up Capital (Distributable EPS)
  distributableProfitCr: number; // in Rs. Crore
  distributableEps: number; // in Rs. per share
  payoutRatio: number; // %
  fiveYearAvgDividend: number; // %
  sustainabilityRating: 'High' | 'Moderate' | 'Constrained' | 'Negative / Ineligible';
  cashVsBonusBias: 'Cash Favored' | 'Bonus Favored' | 'Balanced' | 'None';
  capitalAdequacyCompliance: string;
  reservePositionCr: number;
  notes: string;
}

export interface OHLCVDataPoint {
  date: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover: number;
  
  // Computed Technical Indicators
  sma5?: number;
  sma20?: number;
  sma50?: number;
  sma200?: number;
  ema5?: number;
  ema20?: number;
  ema50?: number;
  ema200?: number;
  rsi14?: number;
  macd?: number;
  macdSignal?: number;
  macdHist?: number;
  bbUpper?: number;
  bbMiddle?: number;
  bbLower?: number;
  bbPercentB?: number;
  stochK?: number;
  stochD?: number;
  atr14?: number;
  volumeSma20?: number;
}

export type IndicatorKey = 'sma20' | 'sma50' | 'sma200' | 'ema20' | 'ema50' | 'ema200' | 'bb' | 'rsi' | 'macd' | 'volume';

export type ChartType = 'candlestick';

export type Timeframe = '1M' | '3M' | '6M' | '1Y' | '2Y' | '5Y' | 'ALL';

export type TechnicalSignalType = 'STRONG_BUY' | 'BUY' | 'NEUTRAL' | 'SELL' | 'STRONG_SELL';

export interface IndicatorSignal {
  name: string;
  value: string | number;
  signal: 'BUY' | 'NEUTRAL' | 'SELL';
  description: string;
}

export interface FloorPivotPoints {
  r2: number;
  r1: number;
  pp: number;
  s1: number;
  s2: number;
}

export interface CandlestickObservation {
  patternName: string;
  bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  bodySize: number;
  upperShadow: number;
  lowerShadow: number;
  bodyRatio: number;
  description: string;
}

export interface FullTechnicalIndicatorsSnapshot {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  previousClose: number;
  dayOpen: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  turnover: number;
  
  // Moving Averages
  ma: {
    sma5?: number;
    sma20?: number;
    sma50?: number;
    sma200?: number;
    ema5?: number;
    ema20?: number;
    ema50?: number;
    ema200?: number;
  };
  
  // Oscillators & Momentum
  rsi14?: number;
  macd?: {
    macd?: number;
    signal?: number;
    histogram?: number;
  };
  stochastic?: {
    k?: number;
    d?: number;
  };
  bollinger?: {
    upper?: number;
    middle?: number;
    lower?: number;
    percentB?: number;
  };
  atr14?: number;
  
  // Floor Pivots
  pivots: FloorPivotPoints;
  
  // 52-Week Range
  week52: {
    high: number;
    low: number;
    positionPct: number;
  };
  
  // Candlestick Pattern
  candlestick: CandlestickObservation;
}

export interface MovingAverageItem {
  period: string;
  type: string;
  value: number;
  signal: 'BUY' | 'NEUTRAL' | 'SELL';
  status: string;
}

export interface GeminiTechnicalSummaryReport {
  summaryHeadline: string;
  marketBias: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
  confidenceScore: number; // 1-100
  generatedAt: string;
  model: string;
  trendAnalysis: {
    bias: string;
    details: string;
    shareSansarHamroshareNote: string;
    maTable: MovingAverageItem[];
  };
  oscillatorsAnalysis: {
    rsiInterpretation: string;
    macdInterpretation: string;
    stochInterpretation: string;
    bollingerInterpretation: string;
    atrVolatilityNote: string;
  };
  floorPivotGrid: {
    r2: number;
    r1: number;
    pp: number;
    s1: number;
    s2: number;
    week52High: number;
    week52Low: number;
    week52PositionPct: number;
    assessment: string;
  };
  candlestickObservations: {
    primaryPattern: string;
    bodyWickDynamics: string;
    volumeConfirmation: string;
  };
  whatToWatchNext: {
    bullishTrigger: string;
    bearishTrigger: string;
    invalidationLevel: number;
    keyWatchLevels: string[];
  };
  fullMarkdown: string;
}

export interface TechnicalSummary {
  overallSignal: TechnicalSignalType;
  score: number; // -100 (Strong Sell) to +100 (Strong Buy)
  buyCount: number;
  neutralCount: number;
  sellCount: number;
  oscillators: IndicatorSignal[];
  movingAverages: IndicatorSignal[];
}

export interface MarketIndex {
  name: string;
  value: number;
  change: number;
  changePercent: number;
  turnoverCr?: number;
  high?: number;
  low?: number;
  previousClose?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

export type NewsSentimentPolarity = 'BULLISH' | 'NEUTRAL' | 'BEARISH';

export interface NewsPortalReport {
  id: string;
  portalName: 'ShareSansar' | 'Merolagani' | 'Bizshala' | 'Arthik Abhiyan' | 'Nepali Paisa' | 'Ratopati' | 'OnlineKhabar';
  portalUrl: string;
  portalDomain: string;
  headline: string;
  summary: string;
  publishedAt: string;
  timeAgo: string;
  sentiment: NewsSentimentPolarity;
  sentimentScore: number; // -100 to +100
  category: 'Earnings & Financials' | 'Dividend & AGM' | 'Monetary Policy & Macro' | 'Corporate Governance' | 'Sector Movement' | 'Market Flows' | 'Regulatory & SEBON';
  impactWeight: 'HIGH' | 'MEDIUM' | 'LOW';
  trajectoryImpactNote: string;
  tags: string[];
}

export interface MarketSentimentMetrics {
  overallScore: number; // 0 to 100 (Fear & Greed index style)
  sentimentLabel: 'Extreme Greed / Strong Bullish' | 'Bullish Momentum' | 'Neutral / Consolidation' | 'Caution / Moderate Bearish' | 'Fear / Heavy Selling';
  bullishRatio: number; // percentage e.g. 68%
  neutralRatio: number; // percentage e.g. 20%
  bearishRatio: number; // percentage e.g. 12%
  mediaSentimentScore: number; // -100 to +100 (aggregated across 5 portals)
  retailCrowdScore: number; // -100 to +100
  smartMoneyFlowScore: number; // -100 to +100 (floorsheet analysis)
  macroRegulatoryScore: number; // -100 to +100 (NRB policy & interest rates)
  sentimentVelocity: 'ACCELERATING_BULLISH' | 'STABLE_BULLISH' | 'NEUTRAL' | 'TURNING_BEARISH' | 'ACCELERATING_BEARISH';
  keyDrivers: string[];
}

export interface TriFactorTrajectorySynthesis {
  technicalFactor: {
    score: number; // -100 to +100
    bias: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
    weight: number; // percentage e.g. 40%
    keySignals: string[];
    driftSlope: number;
    rsi: number;
    above200Ema: boolean;
  };
  fundamentalFactor: {
    score: number; // -100 to +100
    bias: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
    weight: number; // percentage e.g. 35%
    keySignals: string[];
    peRatio: number;
    industryPe: number;
    eps: number;
    roe: number;
    dividendYield: number;
  };
  newsSentimentFactor: {
    score: number; // -100 to +100
    bias: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
    weight: number; // percentage e.g. 25%
    portalCount: number; // at least 5
    bullishPortals: number;
    neutralPortals: number;
    bearishPortals: number;
    keyHeadlines: string[];
  };
  compositeTrajectory: {
    overallScore: number; // -100 to +100
    trajectoryBias: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
    sentimentDriftMultiplier: number; // e.g. 1.18x multiplier on velocity
    target30d: number;
    target60d: number;
    target90d: number;
    bullishCatalyst30d: number;
    bullishCatalyst60d: number;
    bullishCatalyst90d: number;
    bearishRisk30d: number;
    bearishRisk60d: number;
    bearishRisk90d: number;
    confluenceSummary: string;
    catalystsFromNews: string[];
    risksFromNews: string[];
  };
  portalReports: NewsPortalReport[];
  marketSentiment: MarketSentimentMetrics;
  aiSynthesis?: {
    model: string;
    generatedAt: string;
    executiveSummary: string;
    newsImpactAnalysis: string;
    fundamentalValuationAlignment: string;
    technicalTrajectoryVerdict: string;
    actionableRoadmap: string[];
  };
}
