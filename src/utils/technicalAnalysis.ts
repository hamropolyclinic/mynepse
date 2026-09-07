import {
  OHLCVDataPoint,
  TechnicalSummary,
  IndicatorSignal,
  TechnicalSignalType,
  FloorPivotPoints,
  CandlestickObservation,
  FullTechnicalIndicatorsSnapshot,
  StockFundamental,
} from '../types/nepse';

/**
 * Calculates Simple Moving Average (SMA)
 */
export function calculateSMA(data: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  let sum = 0;

  for (let i = 0; i < data.length; i++) {
    sum += data[i];
    if (i >= period) {
      sum -= data[i - period];
    }
    if (i >= period - 1) {
      result.push(Number((sum / period).toFixed(2)));
    } else {
      result.push(undefined);
    }
  }
  return result;
}

/**
 * Calculates Exponential Moving Average (EMA)
 */
export function calculateEMA(data: number[], period: number): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  const k = 2 / (period + 1);
  let previousEMA: number | undefined = undefined;

  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(undefined);
    } else if (i === period - 1) {
      // First EMA is simple average of initial period
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[j];
      }
      previousEMA = sum / period;
      result.push(Number(previousEMA.toFixed(2)));
    } else {
      const currentEMA = data[i] * k + (previousEMA as number) * (1 - k);
      previousEMA = currentEMA;
      result.push(Number(currentEMA.toFixed(2)));
    }
  }
  return result;
}

/**
 * Calculates Relative Strength Index (RSI) using Wilder's smoothed method
 */
export function calculateRSI(closes: number[], period: number = 14): (number | undefined)[] {
  const result: (number | undefined)[] = [];
  if (closes.length <= period) {
    return closes.map(() => undefined);
  }

  let gains = 0;
  let losses = 0;

  // First period initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) {
      gains += diff;
    } else {
      losses += Math.abs(diff);
    }
    result.push(undefined);
  }
  result.unshift(undefined); // align indices

  let avgGain = gains / period;
  let avgLoss = losses / period;

  const firstRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const firstRSI = avgLoss === 0 ? 100 : 100 - (100 / (1 + firstRS));
  result[period] = Number(firstRSI.toFixed(2));

  // Subsequent periods using Wilder's smoothing
  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const currentGain = diff > 0 ? diff : 0;
    const currentLoss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + currentGain) / period;
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period;

    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      const rsi = 100 - (100 / (1 + rs));
      result.push(Number(rsi.toFixed(2)));
    }
  }

  // Ensure result length matches closes length
  while (result.length < closes.length) {
    result.unshift(undefined);
  }
  if (result.length > closes.length) {
    return result.slice(result.length - closes.length);
  }

  return result;
}

/**
 * Calculates MACD (12, 26, 9)
 */
export function calculateMACD(
  closes: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): {
  macd: (number | undefined)[];
  signal: (number | undefined)[];
  histogram: (number | undefined)[];
} {
  const fastEMA = calculateEMA(closes, fastPeriod);
  const slowEMA = calculateEMA(closes, slowPeriod);

  const macdLine: (number | undefined)[] = [];
  const validMacdValues: number[] = [];
  const validMacdIndices: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (fastEMA[i] !== undefined && slowEMA[i] !== undefined) {
      const diff = Number(((fastEMA[i] as number) - (slowEMA[i] as number)).toFixed(2));
      macdLine.push(diff);
      validMacdValues.push(diff);
      validMacdIndices.push(i);
    } else {
      macdLine.push(undefined);
    }
  }

  const signalEMA = calculateEMA(validMacdValues, signalPeriod);
  const signalLine: (number | undefined)[] = new Array(closes.length).fill(undefined);
  const histogram: (number | undefined)[] = new Array(closes.length).fill(undefined);

  for (let j = 0; j < validMacdIndices.length; j++) {
    const originalIndex = validMacdIndices[j];
    if (signalEMA[j] !== undefined) {
      const sig = signalEMA[j] as number;
      signalLine[originalIndex] = sig;
      const macdVal = macdLine[originalIndex] as number;
      histogram[originalIndex] = Number((macdVal - sig).toFixed(2));
    }
  }

  return { macd: macdLine, signal: signalLine, histogram };
}

/**
 * Calculates Bollinger Bands (20 SMA, 2 StdDev)
 */
export function calculateBollingerBands(
  closes: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): {
  upper: (number | undefined)[];
  middle: (number | undefined)[];
  lower: (number | undefined)[];
} {
  const sma = calculateSMA(closes, period);
  const upper: (number | undefined)[] = [];
  const lower: (number | undefined)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1 || sma[i] === undefined) {
      upper.push(undefined);
      lower.push(undefined);
      continue;
    }

    // Standard deviation
    let varianceSum = 0;
    const mean = sma[i] as number;
    for (let j = i - period + 1; j <= i; j++) {
      varianceSum += Math.pow(closes[j] - mean, 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);
    upper.push(Number((mean + stdDevMultiplier * stdDev).toFixed(2)));
    lower.push(Number((mean - stdDevMultiplier * stdDev).toFixed(2)));
  }

  return { upper, middle: sma, lower };
}

/**
 * Calculates Average True Range (ATR 14)
 */
export function calculateATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): (number | undefined)[] {
  const tr: number[] = [highs[0] - lows[0]];

  for (let i = 1; i < closes.length; i++) {
    const currentHigh = highs[i];
    const currentLow = lows[i];
    const prevClose = closes[i - 1];
    const trueRange = Math.max(
      currentHigh - currentLow,
      Math.abs(currentHigh - prevClose),
      Math.abs(currentLow - prevClose)
    );
    tr.push(trueRange);
  }

  const atr: (number | undefined)[] = [];
  let sum = 0;

  for (let i = 0; i < tr.length; i++) {
    if (i < period - 1) {
      atr.push(undefined);
      sum += tr[i];
    } else if (i === period - 1) {
      sum += tr[i];
      let avg = sum / period;
      atr.push(Number(avg.toFixed(2)));
    } else {
      const prevATR = atr[i - 1] as number;
      const currentATR = (prevATR * (period - 1) + tr[i]) / period;
      atr.push(Number(currentATR.toFixed(2)));
    }
  }

  return atr;
}

/**
 * Calculates Slow Stochastic Oscillator (%K and %D)
 * Default: 14 period, 3 smooth %K, 3 smooth %D
 */
export function calculateStochastics(
  highs: number[],
  lows: number[],
  closes: number[],
  periodK: number = 14,
  smoothK: number = 3,
  smoothD: number = 3
): {
  k: (number | undefined)[];
  d: (number | undefined)[];
} {
  const rawK: (number | undefined)[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < periodK - 1) {
      rawK.push(undefined);
      continue;
    }

    let highestHigh = -Infinity;
    let lowestLow = Infinity;
    for (let j = i - periodK + 1; j <= i; j++) {
      if (highs[j] > highestHigh) highestHigh = highs[j];
      if (lows[j] < lowestLow) lowestLow = lows[j];
    }

    const range = highestHigh - lowestLow;
    if (range <= 0) {
      rawK.push(50);
    } else {
      const val = ((closes[i] - lowestLow) / range) * 100;
      rawK.push(Number(val.toFixed(2)));
    }
  }

  // Smooth rawK by smoothK period SMA to get %K
  const validIndicesK: number[] = [];
  const validValuesK: number[] = [];
  rawK.forEach((val, idx) => {
    if (val !== undefined) {
      validIndicesK.push(idx);
      validValuesK.push(val);
    }
  });

  const smoothedKValues = calculateSMA(validValuesK, smoothK);
  const kLine: (number | undefined)[] = new Array(closes.length).fill(undefined);
  const validForD: number[] = [];
  const validIndicesForD: number[] = [];

  for (let j = 0; j < validIndicesK.length; j++) {
    const origIdx = validIndicesK[j];
    const smVal = smoothedKValues[j];
    if (smVal !== undefined) {
      kLine[origIdx] = smVal;
      validForD.push(smVal);
      validIndicesForD.push(origIdx);
    }
  }

  // Smooth %K by smoothD period SMA to get %D
  const smoothedDValues = calculateSMA(validForD, smoothD);
  const dLine: (number | undefined)[] = new Array(closes.length).fill(undefined);

  for (let m = 0; m < validIndicesForD.length; m++) {
    const origIdx = validIndicesForD[m];
    const dVal = smoothedDValues[m];
    if (dVal !== undefined) {
      dLine[origIdx] = dVal;
    }
  }

  return { k: kLine, d: dLine };
}

/**
 * Calculates Bollinger Bands %B (Percentage B)
 * %B = (Price - Lower Band) / (Upper Band - Lower Band)
 */
export function calculateBollingerPercentB(
  close: number,
  upper?: number,
  lower?: number
): number | undefined {
  if (upper === undefined || lower === undefined || upper <= lower) {
    return undefined;
  }
  const percentB = (close - lower) / (upper - lower);
  return Number(percentB.toFixed(3));
}

/**
 * Enriches raw OHLCV dataset with all technical indicators
 */
export function enrichWithIndicators(data: OHLCVDataPoint[]): OHLCVDataPoint[] {
  if (data.length === 0) return [];

  const closes = data.map((d) => d.close);
  const highs = data.map((d) => d.high);
  const lows = data.map((d) => d.low);
  const volumes = data.map((d) => d.volume);

  const sma5 = calculateSMA(closes, 5);
  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const sma200 = calculateSMA(closes, 200);

  const ema5 = calculateEMA(closes, 5);
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const ema200 = calculateEMA(closes, 200);

  const rsi14 = calculateRSI(closes, 14);
  const { macd, signal: macdSignal, histogram: macdHist } = calculateMACD(closes, 12, 26, 9);
  const { upper: bbUpper, middle: bbMiddle, lower: bbLower } = calculateBollingerBands(closes, 20, 2);
  const { k: stochK, d: stochD } = calculateStochastics(highs, lows, closes, 14, 3, 3);
  const atr14 = calculateATR(highs, lows, closes, 14);
  const volumeSma20 = calculateSMA(volumes, 20);

  return data.map((point, index) => {
    const upper = bbUpper[index];
    const lower = bbLower[index];
    const bbPercentB = calculateBollingerPercentB(point.close, upper, lower);

    return {
      ...point,
      sma5: sma5[index],
      sma20: sma20[index],
      sma50: sma50[index],
      sma200: sma200[index],
      ema5: ema5[index],
      ema20: ema20[index],
      ema50: ema50[index],
      ema200: ema200[index],
      rsi14: rsi14[index],
      macd: macd[index],
      macdSignal: macdSignal[index],
      macdHist: macdHist[index],
      bbUpper: upper,
      bbMiddle: bbMiddle[index],
      bbLower: lower,
      bbPercentB,
      stochK: stochK[index],
      stochD: stochD[index],
      atr14: atr14[index],
      volumeSma20: volumeSma20[index],
    };
  });
}

/**
 * Generates Technical Confluence Analysis and Signal Gauge
 */
export function computeTechnicalSummary(data: OHLCVDataPoint[]): TechnicalSummary {
  if (data.length === 0) {
    return {
      overallSignal: 'NEUTRAL',
      score: 0,
      buyCount: 0,
      neutralCount: 0,
      sellCount: 0,
      oscillators: [],
      movingAverages: [],
    };
  }

  const latest = data[data.length - 1];
  const prev = data.length > 1 ? data[data.length - 2] : latest;

  const oscillators: IndicatorSignal[] = [];
  const movingAverages: IndicatorSignal[] = [];

  let buyPoints = 0;
  let sellPoints = 0;
  let totalPoints = 0;

  // 1. RSI (14)
  if (latest.rsi14 !== undefined) {
    const rsiVal = latest.rsi14;
    let sig: 'BUY' | 'NEUTRAL' | 'SELL' = 'NEUTRAL';
    let desc = `RSI is neutral at ${rsiVal}`;

    if (rsiVal < 30) {
      sig = 'BUY';
      desc = `Oversold territory (${rsiVal}) - Rebound candidate`;
      buyPoints += 2;
    } else if (rsiVal < 45) {
      sig = 'BUY';
      desc = `Bullish recovery trend (${rsiVal})`;
      buyPoints += 1;
    } else if (rsiVal > 70) {
      sig = 'SELL';
      desc = `Overbought territory (${rsiVal}) - Potential pullback`;
      sellPoints += 2;
    } else if (rsiVal > 55) {
      sig = 'SELL';
      desc = `Upper momentum zone (${rsiVal})`;
      sellPoints += 1;
    }
    totalPoints += 2;
    oscillators.push({
      name: 'RSI (14)',
      value: rsiVal,
      signal: sig,
      description: desc,
    });
  }

  // 2. MACD (12, 26, 9)
  if (latest.macd !== undefined && latest.macdSignal !== undefined) {
    const isBullishCross = (prev.macd || 0) <= (prev.macdSignal || 0) && latest.macd > latest.macdSignal;
    const isBearishCross = (prev.macd || 0) >= (prev.macdSignal || 0) && latest.macd < latest.macdSignal;
    const isAboveSignal = latest.macd > latest.macdSignal;

    let sig: 'BUY' | 'NEUTRAL' | 'SELL' = 'NEUTRAL';
    let desc = 'MACD line aligned with Signal';

    if (isBullishCross) {
      sig = 'BUY';
      desc = `Fresh Bullish Crossover (${latest.macd} > ${latest.macdSignal})`;
      buyPoints += 2.5;
    } else if (isBearishCross) {
      sig = 'SELL';
      desc = `Fresh Bearish Crossover (${latest.macd} < ${latest.macdSignal})`;
      sellPoints += 2.5;
    } else if (isAboveSignal && (latest.macdHist || 0) > 0) {
      sig = 'BUY';
      desc = `Positive momentum histogram (+${latest.macdHist})`;
      buyPoints += 1.5;
    } else {
      sig = 'SELL';
      desc = `Negative momentum histogram (${latest.macdHist})`;
      sellPoints += 1.5;
    }
    totalPoints += 2.5;
    oscillators.push({
      name: 'MACD (12, 26, 9)',
      value: `${latest.macd} / ${latest.macdSignal}`,
      signal: sig,
      description: desc,
    });
  }

  // 3. Bollinger Bands (20, 2)
  if (latest.bbLower !== undefined && latest.bbUpper !== undefined) {
    let sig: 'BUY' | 'NEUTRAL' | 'SELL' = 'NEUTRAL';
    let desc = 'Price within standard bands';

    if (latest.close <= latest.bbLower * 1.01) {
      sig = 'BUY';
      desc = `Price testing lower band (NPR ${latest.bbLower}) - Oversold bounce setup`;
      buyPoints += 1.5;
    } else if (latest.close >= latest.bbUpper * 0.99) {
      sig = 'SELL';
      desc = `Price testing upper band (NPR ${latest.bbUpper}) - Stretched resistance`;
      sellPoints += 1.5;
    }
    totalPoints += 1.5;
    oscillators.push({
      name: 'Bollinger Bands (20, 2)',
      value: `NPR ${latest.bbLower} - ${latest.bbUpper}`,
      signal: sig,
      description: desc,
    });
  }

  // 4. Moving Averages: EMA 50
  if (latest.ema50 !== undefined) {
    const isAbove = latest.close > latest.ema50;
    const sig = isAbove ? 'BUY' : 'SELL';
    if (isAbove) buyPoints += 1.5; else sellPoints += 1.5;
    totalPoints += 1.5;
    movingAverages.push({
      name: 'EMA (50)',
      value: `NPR ${latest.ema50}`,
      signal: sig,
      description: isAbove ? 'Price above medium-term 50 EMA' : 'Price below medium-term 50 EMA',
    });
  }

  // 6. Moving Averages: EMA 200
  if (latest.ema200 !== undefined) {
    const isAbove = latest.close > latest.ema200;
    const sig = isAbove ? 'BUY' : 'SELL';
    if (isAbove) buyPoints += 2; else sellPoints += 2;
    totalPoints += 2;
    movingAverages.push({
      name: 'EMA (200)',
      value: `NPR ${latest.ema200}`,
      signal: sig,
      description: isAbove ? 'Price above long-term 200 EMA (Bull Market)' : 'Price below long-term 200 EMA (Bear Market)',
    });
  }

  // 6b. Moving Averages: SMA 200
  if (latest.sma200 !== undefined) {
    const isAbove = latest.close > latest.sma200;
    const sig = isAbove ? 'BUY' : 'SELL';
    if (isAbove) buyPoints += 2; else sellPoints += 2;
    totalPoints += 2;
    movingAverages.push({
      name: 'SMA (200)',
      value: `NPR ${latest.sma200}`,
      signal: sig,
      description: isAbove ? 'Price above long-term 200 SMA (Bull Market)' : 'Price below long-term 200 SMA (Bear Market)',
    });
  }

  // 7. Golden Cross / Death Cross Check (EMA 50 / 200)
  if (latest.ema50 !== undefined && latest.ema200 !== undefined) {
    const isGolden = latest.ema50 > latest.ema200;
    movingAverages.push({
      name: 'Trend Bias (EMA 50/200)',
      value: isGolden ? 'Golden Alignment' : 'Death Alignment',
      signal: isGolden ? 'BUY' : 'SELL',
      description: isGolden ? '50 EMA is above 200 EMA (Macro uptrend)' : '50 EMA is below 200 EMA (Macro downtrend)',
    });
  }

  // Aggregate signals
  const allSignals = [...oscillators, ...movingAverages];
  const buyCount = allSignals.filter((s) => s.signal === 'BUY').length;
  const sellCount = allSignals.filter((s) => s.signal === 'SELL').length;
  const neutralCount = allSignals.filter((s) => s.signal === 'NEUTRAL').length;

  const netScore = totalPoints > 0 ? ((buyPoints - sellPoints) / totalPoints) * 100 : 0;
  const roundedScore = Math.round(netScore);

  let overallSignal: TechnicalSignalType = 'NEUTRAL';
  if (roundedScore >= 45) {
    overallSignal = 'STRONG_BUY';
  } else if (roundedScore >= 15) {
    overallSignal = 'BUY';
  } else if (roundedScore <= -45) {
    overallSignal = 'STRONG_SELL';
  } else if (roundedScore <= -15) {
    overallSignal = 'SELL';
  }

  return {
    overallSignal,
    score: roundedScore,
    buyCount,
    neutralCount,
    sellCount,
    oscillators,
    movingAverages,
  };
}

/**
 * Calculates standard Floor Pivot Points (PP, R1, S1, R2, S2)
 * Formula based on previous session's High, Low, Close:
 * PP = (H + L + C) / 3
 * R1 = 2 * PP - L
 * S1 = 2 * PP - H
 * R2 = PP + (H - L)
 * S2 = PP - (H - L)
 */
export function calculateFloorPivots(high: number, low: number, close: number): FloorPivotPoints {
  const pp = Number(((high + low + close) / 3).toFixed(2));
  const r1 = Number((2 * pp - low).toFixed(2));
  const s1 = Number((2 * pp - high).toFixed(2));
  const r2 = Number((pp + (high - low)).toFixed(2));
  const s2 = Number((pp - (high - low)).toFixed(2));

  return { r2, r1, pp, s1, s2 };
}

/**
 * Analyzes Candlestick Pattern Observations & Price Dynamics
 */
export function detectCandlestickPattern(data: OHLCVDataPoint[]): CandlestickObservation {
  if (data.length === 0) {
    return {
      patternName: 'No Data',
      bias: 'NEUTRAL',
      bodySize: 0,
      upperShadow: 0,
      lowerShadow: 0,
      bodyRatio: 0,
      description: 'Insufficient candlestick data available for pattern detection.',
    };
  }

  const current = data[data.length - 1];
  const prev = data.length > 1 ? data[data.length - 2] : null;

  const open = current.open;
  const high = current.high;
  const low = current.low;
  const close = current.close;

  const totalRange = Math.max(0.01, high - low);
  const bodySize = Math.abs(close - open);
  const bodyRatio = Number((bodySize / totalRange).toFixed(2));
  const upperShadow = Number((high - Math.max(open, close)).toFixed(2));
  const lowerShadow = Number((Math.min(open, close) - low).toFixed(2));
  const isGreen = close >= open;

  let patternName = isGreen ? 'Bullish Consolidation' : 'Bearish Consolidation';
  let bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = isGreen ? 'BULLISH' : 'BEARISH';
  let description = `Real body is ${bodySize.toFixed(1)} NPR (${Math.round(bodyRatio * 100)}% of candle range) with upper wick of ${upperShadow.toFixed(1)} and lower wick of ${lowerShadow.toFixed(1)}.`;

  // Check Doji
  if (bodyRatio <= 0.1) {
    if (upperShadow > totalRange * 0.6 && lowerShadow < totalRange * 0.2) {
      patternName = 'Gravestone Doji';
      bias = 'BEARISH';
      description = 'Severe overhead supply rejection; bears drove prices back down from session highs.';
    } else if (lowerShadow > totalRange * 0.6 && upperShadow < totalRange * 0.2) {
      patternName = 'Dragonfly Doji';
      bias = 'BULLISH';
      description = 'Strong intraday dip accumulation; buyers absorbed heavy supply into the close.';
    } else {
      patternName = 'Neutral Doji';
      bias = 'NEUTRAL';
      description = 'Market equilibrium and indecision; open and close virtually identical, awaiting directional trigger.';
    }
  }
  // Check Marubozu
  else if (bodyRatio >= 0.85) {
    if (isGreen) {
      patternName = 'Bullish Marubozu';
      bias = 'BULLISH';
      description = 'Uncompromising buyer dominance from bell to bell with virtually no wick rejection.';
    } else {
      patternName = 'Bearish Marubozu';
      bias = 'BEARISH';
      description = 'Uncompromising seller aggression throughout the trading session without relief.';
    }
  }
  // Check Hammer / Hanging Man
  else if (lowerShadow >= 2 * bodySize && upperShadow <= bodySize * 0.35) {
    if (prev && prev.close < prev.open) {
      patternName = 'Bullish Hammer';
      bias = 'BULLISH';
      description = 'Strong lower wick dip rejection; buyers fiercely defended lows suggesting an imminent pivot.';
    } else {
      patternName = 'Hanging Man';
      bias = 'BEARISH';
      description = 'Long lower wick at high territory signals buyer exhaustion and creeping volatility.';
    }
  }
  // Check Inverted Hammer / Shooting Star
  else if (upperShadow >= 2 * bodySize && lowerShadow <= bodySize * 0.35) {
    if (isGreen) {
      patternName = 'Inverted Hammer';
      bias = 'BULLISH';
      description = 'Early buyer surge tested higher liquidity zones; continuation setup pending high break.';
    } else {
      patternName = 'Shooting Star';
      bias = 'BEARISH';
      description = 'Failed breakout attempt with heavy upper wick rejection; sellers retained control.';
    }
  }
  // Check Engulfing (if previous candle exists)
  else if (prev) {
    const prevBody = Math.abs(prev.close - prev.open);
    const prevIsRed = prev.close < prev.open;
    const prevIsGreen = prev.close > prev.open;

    if (prevIsRed && isGreen && close > prev.open && open < prev.close && bodySize > prevBody) {
      patternName = 'Bullish Engulfing';
      bias = 'BULLISH';
      description = 'Current green body completely engulfs prior session body, confirming robust institutional turnaround.';
    } else if (prevIsGreen && !isGreen && close < prev.open && open > prev.close && bodySize > prevBody) {
      patternName = 'Bearish Engulfing';
      bias = 'BEARISH';
      description = 'Current red body completely engulfs prior session body, signalling urgent distribution.';
    }
  }

  return {
    patternName,
    bias,
    bodySize: Number(bodySize.toFixed(2)),
    upperShadow,
    lowerShadow,
    bodyRatio,
    description,
  };
}

/**
 * Builds Full Technical Confluence & Indicators Snapshot
 */
export function buildFullTechnicalSnapshot(
  stock: StockFundamental,
  data: OHLCVDataPoint[]
): FullTechnicalIndicatorsSnapshot {
  const enriched = enrichWithIndicators(data);
  const latest = enriched.length > 0 ? enriched[enriched.length - 1] : ({} as OHLCVDataPoint);
  const prev = enriched.length > 1 ? enriched[enriched.length - 2] : latest;

  // Use previous session's H, L, C for Floor Pivots if available, otherwise current day
  const pivotHigh = prev.high || stock.dayHigh || stock.currentPrice;
  const pivotLow = prev.low || stock.dayLow || stock.currentPrice;
  const pivotClose = prev.close || stock.previousClose || stock.currentPrice;

  const pivots = calculateFloorPivots(pivotHigh, pivotLow, pivotClose);

  // 52-Week range calculations
  const high52 = stock.high52 || latest.high || stock.currentPrice;
  const low52 = stock.low52 || latest.low || stock.currentPrice;
  const range52 = high52 - low52;
  const positionPct = range52 > 0 ? Math.round(((stock.currentPrice - low52) / range52) * 100) : 50;

  // Candlestick Pattern
  const candlestick = detectCandlestickPattern(data);

  return {
    symbol: stock.symbol,
    price: stock.currentPrice,
    change: stock.change,
    changePercent: stock.changePercent,
    previousClose: stock.previousClose,
    dayOpen: stock.dayOpen,
    dayHigh: stock.dayHigh,
    dayLow: stock.dayLow,
    volume: stock.volume,
    turnover: stock.turnoverNpr,
    ma: {
      sma5: latest.sma5,
      sma20: latest.sma20,
      sma50: latest.sma50,
      sma200: latest.sma200,
      ema5: latest.ema5,
      ema20: latest.ema20,
      ema50: latest.ema50,
      ema200: latest.ema200,
    },
    rsi14: latest.rsi14,
    macd: {
      macd: latest.macd,
      signal: latest.macdSignal,
      histogram: latest.macdHist,
    },
    stochastic: {
      k: latest.stochK,
      d: latest.stochD,
    },
    bollinger: {
      upper: latest.bbUpper,
      middle: latest.bbMiddle,
      lower: latest.bbLower,
      percentB: latest.bbPercentB,
    },
    atr14: latest.atr14,
    pivots,
    week52: {
      high: high52,
      low: low52,
      positionPct,
    },
    candlestick,
  };
}
