import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  CandlestickChart, 
  Calendar,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronsRight,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  Shield,
  MoveHorizontal,
  RotateCcw,
  Hand,
  ArrowLeftRight,
  Sliders
} from 'lucide-react';
import { OHLCVDataPoint, Timeframe } from '../types/nepse';

interface InteractiveChartProps {
  data: OHLCVDataPoint[];
  symbol: string;
  isLoading?: boolean;
}

export const InteractiveChart: React.FC<InteractiveChartProps> = ({ data, symbol, isLoading = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [containerWidth, setContainerWidth] = useState<number>(900);
  const [timeframe, setTimeframe] = useState<Timeframe>('6M');
  
  // Overlay Toggles
  const [showSR, setShowSR] = useState(true); // Support & Resistance Toggle (default active)
  const [showEMA50, setShowEMA50] = useState(true);
  const [showEMA200, setShowEMA200] = useState(false);
  const [showSMA200, setShowSMA200] = useState(false);
  const [showBB, setShowBB] = useState(true);
  const [showVolume, setShowVolume] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showMACD, setShowMACD] = useState(true);

  // Zoom & Horizontal Scroll State
  const [zoomLevel, setZoomLevel] = useState<number>(1.0); // zoom multiplier (0.35x to 3.5x)
  const [isFitMode, setIsFitMode] = useState<boolean>(false);
  const [isScrolledLeft, setIsScrolledLeft] = useState<boolean>(false);

  // Detailed Horizontal Scroll Progress State
  const [scrollProgress, setScrollProgress] = useState<{
    scrollLeft: number;
    maxScroll: number;
    percent: number;
    canPanLeft: boolean;
    canPanRight: boolean;
  }>({
    scrollLeft: 0,
    maxScroll: 1,
    percent: 100,
    canPanLeft: false,
    canPanRight: false,
  });

  // Pinch / Punch Zoom Floating HUD feedback
  const [pinchFeedback, setPinchFeedback] = useState<{ visible: boolean; text: string } | null>(null);
  const pinchTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Drag to pan state
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ startX: number; scrollLeft: number; hasMoved: boolean }>({
    startX: 0,
    scrollLeft: 0,
    hasMoved: false
  });

  // Refs for tracking values inside native event listeners
  const zoomLevelRef = useRef<number>(zoomLevel);
  zoomLevelRef.current = zoomLevel;

  // Trigger floating visual feedback for pinch/punch zoom
  const triggerPinchToast = useCallback((text: string) => {
    if (pinchTimerRef.current) clearTimeout(pinchTimerRef.current);
    setPinchFeedback({ visible: true, text });
    pinchTimerRef.current = setTimeout(() => {
      setPinchFeedback((prev) => (prev ? { ...prev, visible: false } : null));
    }, 1200);
  }, []);

  // Anchored Zoom application (keeps point under fingers/cursor steady)
  const applyZoom = useCallback((targetZoom: number, focalPointX?: number) => {
    const clamped = Math.max(0.35, Math.min(3.5, Number(targetZoom.toFixed(2))));
    const el = scrollContainerRef.current;
    if (!el) {
      setZoomLevel(clamped);
      return;
    }

    const prevZoom = zoomLevelRef.current;
    if (Math.abs(prevZoom - clamped) < 0.005) return;

    // Calculate focal point within container to anchor zoom
    const focalX = focalPointX !== undefined ? focalPointX : el.clientWidth / 2;
    const oldScrollLeft = el.scrollLeft;
    const contentCoord = oldScrollLeft + focalX;
    const zoomRatio = clamped / prevZoom;
    const newContentCoord = contentCoord * zoomRatio;
    const targetScrollLeft = Math.max(0, newContentCoord - focalX);

    setIsFitMode(false);
    setZoomLevel(clamped);

    // Apply scroll offset compensation
    requestAnimationFrame(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollLeft = targetScrollLeft;
      }
    });
  }, []);

  // Hover state
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);

  // Measure container width responsively
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter data by timeframe
  const filteredData = useMemo(() => {
    if (data.length === 0) return [];
    let count = data.length;
    switch (timeframe) {
      case '1M': count = 22; break;
      case '3M': count = 65; break;
      case '6M': count = 130; break;
      case '1Y': count = 250; break;
      case '2Y': count = 500; break;
      case 'ALL': count = data.length; break;
    }
    return data.slice(Math.max(0, data.length - count));
  }, [data, timeframe]);

  // Support and Resistance Calculations
  const srLevels = useMemo(() => {
    if (filteredData.length === 0) return null;
    
    // Recent swing window (last 60 periods or total filtered)
    const windowSlice = filteredData.slice(-Math.min(60, filteredData.length));
    const high = Math.max(...windowSlice.map((d) => d.high));
    const low = Math.min(...windowSlice.map((d) => d.low));
    const latestClose = filteredData[filteredData.length - 1].close;

    // Classic Pivot Points
    const pp = (high + low + latestClose) / 3;
    const r1 = 2 * pp - low;
    const s1 = 2 * pp - high;
    const r2 = pp + (high - low);
    const s2 = pp - (high - low);

    return {
      pp,
      r1,
      r2,
      s1,
      s2,
      rangeHigh: high,
      rangeLow: low,
      currentPrice: latestClose
    };
  }, [filteredData]);

  // Active point for tooltip (hovered or latest)
  const activePoint = hoverIndex !== null && filteredData[hoverIndex]
    ? filteredData[hoverIndex]
    : filteredData[filteredData.length - 1];

  // Layout Dimensions
  const rightAxisWidth = 65;
  const padding = { top: 25, right: 15, bottom: 25, left: 15 };
  const visibleViewportWidth = Math.max(200, containerWidth - rightAxisWidth);

  // Candle Spacing & Horizontal Plot Width
  const { candlePitch, plotWidth, svgTotalWidth } = useMemo(() => {
    const n = Math.max(1, filteredData.length);
    if (isFitMode) {
      const pitch = Math.max(2.5, Math.min(14, (visibleViewportWidth - padding.left - padding.right) / Math.max(1, n - 1)));
      const pWidth = (n - 1) * pitch;
      return {
        candlePitch: pitch,
        plotWidth: pWidth,
        svgTotalWidth: visibleViewportWidth
      };
    }

    // Normal scrollable mode with punch/pinch zoom (compact standard ~10px pitch at 1.0x)
    const basePitch = Math.max(4, Math.min(48, Math.round(10 * zoomLevel)));
    const minPlotWidth = visibleViewportWidth - padding.left - padding.right;
    const pWidth = Math.max(minPlotWidth, (n - 1) * basePitch);
    const totalW = pWidth + padding.left + padding.right;
    return {
      candlePitch: basePitch,
      plotWidth: pWidth,
      svgTotalWidth: totalW
    };
  }, [filteredData.length, isFitMode, visibleViewportWidth, padding.left, padding.right, zoomLevel]);

  // Candle width based on pitch - compact, proportionate ratio
  const candleWidth = Math.max(1.5, Math.min(30, Math.round(candlePitch * 0.64)));

  // Heights of Subpanes
  const chartHeight = 360;
  const volumeHeight = showVolume ? 75 : 0;
  const rsiHeight = showRSI ? 90 : 0;
  const macdHeight = showMACD ? 90 : 0;
  const totalChartHeight = chartHeight + volumeHeight + rsiHeight + macdHeight;

  // Handle scroll detection and sync horizontal scroll progress state
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const max = Math.max(1, el.scrollWidth - el.clientWidth);
    const left = el.scrollLeft;
    const scrollRemaining = max - left;
    const percent = Math.min(100, Math.max(0, Math.round((left / max) * 100)));

    setIsScrolledLeft(scrollRemaining > 60);
    setScrollProgress({
      scrollLeft: left,
      maxScroll: max,
      percent,
      canPanLeft: left > 12,
      canPanRight: scrollRemaining > 12,
    });
  }, []);

  // Auto-scroll to the rightmost candle (latest date) on timeframe or initial load
  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const timer = setTimeout(() => {
      el.scrollLeft = el.scrollWidth;
      handleScroll();
    }, 50);
    return () => clearTimeout(timer);
  }, [timeframe, handleScroll]);

  // Double-tap or double-click to toggle 100% and 200% zoom
  const handleDoubleTap = useCallback((clientX: number) => {
    const el = scrollContainerRef.current;
    const focalX = el ? clientX - el.getBoundingClientRect().left : undefined;
    if (zoomLevelRef.current > 1.3) {
      applyZoom(1.0, focalX);
      triggerPinchToast('Zoom: 100%');
    } else {
      applyZoom(2.0, focalX);
      triggerPinchToast('Punch Zoom: 200%');
    }
  }, [applyZoom, triggerPinchToast]);

  // Horizontal pan navigation helpers
  const panChart = useCallback((deltaPx: number) => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({
      left: deltaPx,
      behavior: 'smooth'
    });
  }, []);

  const scrollToOldest = useCallback(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      left: 0,
      behavior: 'smooth'
    });
  }, []);

  const scrollToLatest = useCallback(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTo({
      left: scrollContainerRef.current.scrollWidth,
      behavior: 'smooth'
    });
  }, []);

  const handleScrubberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!scrollContainerRef.current) return;
    const targetPercent = Number(e.target.value);
    const el = scrollContainerRef.current;
    const max = Math.max(0, el.scrollWidth - el.clientWidth);
    const targetScroll = (targetPercent / 100) * max;
    el.scrollLeft = targetScroll;
  }, []);

  // Compute currently visible date window for the scrubber
  const visibleDates = useMemo(() => {
    if (filteredData.length === 0) return { start: '', end: '', count: 0 };
    const left = scrollProgress.scrollLeft;
    const width = containerWidth;
    const firstIdx = Math.max(0, Math.floor((left - padding.left) / Math.max(1, candlePitch)));
    const lastIdx = Math.min(filteredData.length - 1, Math.ceil((left + width - padding.left) / Math.max(1, candlePitch)));
    return {
      start: filteredData[firstIdx]?.date || filteredData[0]?.date || '',
      end: filteredData[lastIdx]?.date || filteredData[filteredData.length - 1]?.date || '',
      count: Math.max(1, lastIdx - firstIdx + 1)
    };
  }, [filteredData, scrollProgress.scrollLeft, containerWidth, padding.left, candlePitch]);

  // Touch Pinch (Punch Zoom) & Trackpad/Wheel Zoom Listener & Horizontal Pan Listener
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    let initialDistance = 0;
    let initialZoom = 1;
    let pinchFocalX = 0;
    let isPinching = false;
    let lastTapTime = 0;

    let touchStartX = 0;
    let touchStartScrollLeft = 0;
    let isSingleTouch = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Two-finger pinch gesture start
        e.preventDefault();
        isPinching = true;
        isSingleTouch = false;
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        initialDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        initialZoom = zoomLevelRef.current;
        const rect = el.getBoundingClientRect();
        const midX = (t1.clientX + t2.clientX) / 2;
        pinchFocalX = midX - rect.left;
        triggerPinchToast(`Punch Zoom: ${Math.round(initialZoom * 100)}%`);
      } else if (e.touches.length === 1) {
        // 1-finger horizontal pan tracking
        isSingleTouch = true;
        touchStartX = e.touches[0].clientX;
        touchStartScrollLeft = el.scrollLeft;

        // Double-tap detection
        const now = Date.now();
        if (now - lastTapTime < 280) {
          handleDoubleTap(e.touches[0].clientX);
        }
        lastTapTime = now;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && isPinching && initialDistance > 0) {
        // Two-finger punch zoom
        e.preventDefault();
        const t1 = e.touches[0];
        const t2 = e.touches[1];
        const currentDistance = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
        const scaleFactor = currentDistance / initialDistance;
        const targetZoom = initialZoom * scaleFactor;
        applyZoom(targetZoom, pinchFocalX);
        triggerPinchToast(`Pinch Zoom: ${Math.round(Math.max(0.35, Math.min(3.5, targetZoom)) * 100)}%`);
      } else if (e.touches.length === 1 && isSingleTouch) {
        // 1-finger horizontal drag-to-scroll
        const dx = e.touches[0].clientX - touchStartX;
        el.scrollLeft = touchStartScrollLeft - dx;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (isPinching && e.touches.length < 2) {
        isPinching = false;
        initialDistance = 0;
      }
      if (e.touches.length === 0) {
        isSingleTouch = false;
      }
    };

    // Trackpad Pinch (Ctrl+Wheel) & Mouse Wheel Horizontal Pan
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) {
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        const focalX = e.clientX - rect.left;
        const delta = -e.deltaY * 0.006;
        const newZoom = zoomLevelRef.current * (1 + delta);
        applyZoom(newZoom, focalX);
        triggerPinchToast(`Pinch Zoom: ${Math.round(Math.max(0.35, Math.min(3.5, newZoom)) * 100)}%`);
      } else {
        // Natural Horizontal Scroll with mouse wheel (vertical or horizontal delta)
        const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
        if (Math.abs(dx) > 0) {
          e.preventDefault();
          el.scrollLeft += dx;
        }
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      el.removeEventListener('wheel', onWheel);
    };
  }, [applyZoom, triggerPinchToast, handleDoubleTap]);

  // Mouse Drag-to-Pan Handlers for Desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only primary left click
    const el = scrollContainerRef.current;
    if (!el) return;
    setIsDragging(true);
    dragStartRef.current = {
      startX: e.clientX,
      scrollLeft: el.scrollLeft,
      hasMoved: false
    };
  };

  const handleMouseMoveGlobal = useCallback((e: MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    if (Math.abs(dx) > 3) {
      dragStartRef.current.hasMoved = true;
    }
    scrollContainerRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx;
  }, [isDragging]);

  const handleMouseUpGlobal = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMoveGlobal);
      window.addEventListener('mouseup', handleMouseUpGlobal);
      return () => {
        window.removeEventListener('mousemove', handleMouseMoveGlobal);
        window.removeEventListener('mouseup', handleMouseUpGlobal);
      };
    }
  }, [isDragging, handleMouseMoveGlobal, handleMouseUpGlobal]);

  // Price Extents (incorporate Support and Resistance so lines are never clipped)
  const { minPrice, maxPrice } = useMemo(() => {
    if (filteredData.length === 0) return { minPrice: 0, maxPrice: 100 };
    let min = Infinity;
    let max = -Infinity;

    filteredData.forEach((d) => {
      if (d.low < min) min = d.low;
      if (d.high > max) max = d.high;
      if (showBB && d.bbLower && d.bbLower < min) min = d.bbLower;
      if (showBB && d.bbUpper && d.bbUpper > max) max = d.bbUpper;
      if (showEMA50 && d.ema50 && d.ema50 < min) min = d.ema50;
      if (showEMA50 && d.ema50 && d.ema50 > max) max = d.ema50;
      if (showEMA200 && d.ema200 && d.ema200 < min) min = d.ema200;
      if (showEMA200 && d.ema200 && d.ema200 > max) max = d.ema200;
      if (showSMA200 && d.sma200 && d.sma200 < min) min = d.sma200;
      if (showSMA200 && d.sma200 && d.sma200 > max) max = d.sma200;
    });

    // Factor in S/R lines if active
    if (showSR && srLevels) {
      if (srLevels?.s2 != null && srLevels.s2 < min) min = srLevels.s2;
      if (srLevels?.r2 != null && srLevels.r2 > max) max = srLevels.r2;
    }

    const pad = (max - min) * 0.05 || 10;
    return { minPrice: min - pad, maxPrice: max + pad };
  }, [filteredData, showBB, showEMA50, showEMA200, showSMA200, showSR, srLevels]);

  // Volume Extent
  const maxVolume = useMemo(() => {
    return Math.max(...filteredData.map((d) => d.volume), 1000);
  }, [filteredData]);

  // MACD Extents
  const { minMacd, maxMacd } = useMemo(() => {
    let min = -2;
    let max = 2;
    filteredData.forEach((d) => {
      if (d.macd !== undefined) {
        min = Math.min(min, d.macd);
        max = Math.max(max, d.macd);
      }
      if (d.macdSignal !== undefined) {
        min = Math.min(min, d.macdSignal);
        max = Math.max(max, d.macdSignal);
      }
      if (d.macdHist !== undefined) {
        min = Math.min(min, d.macdHist);
        max = Math.max(max, d.macdHist);
      }
    });
    const pad = Math.max(Math.abs(min), Math.abs(max)) * 0.2 || 1;
    return { minMacd: min - pad, maxMacd: max + pad };
  }, [filteredData]);

  // Scaling helpers
  const getX = (index: number) => {
    if (filteredData.length <= 1) return padding.left;
    return padding.left + index * candlePitch;
  };

  const getPriceY = (price: number) => {
    const range = maxPrice - minPrice || 1;
    return padding.top + (1 - (price - minPrice) / range) * (chartHeight - padding.top - padding.bottom);
  };

  const getVolY = (vol: number) => {
    return volumeHeight - (vol / maxVolume) * (volumeHeight - 10);
  };

  const getRsiY = (rsi: number) => {
    return 10 + (1 - rsi / 100) * (rsiHeight - 20);
  };

  const getMacdY = (val: number) => {
    const range = maxMacd - minMacd || 1;
    return 10 + (1 - (val - minMacd) / range) * (macdHeight - 20);
  };

  // Build SVG Paths for Indicators
  const generatePath = (key: keyof OHLCVDataPoint, getYFn: (v: number) => number) => {
    let path = '';
    filteredData.forEach((d, i) => {
      const val = d[key] as number | undefined;
      if (val !== undefined) {
        const x = getX(i);
        const y = getYFn(val);
        path += path === '' ? `M ${x} ${y}` : ` L ${x} ${y}`;
      }
    });
    return path;
  };

  // Mouse hover handler
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;
    const mouseX = clientX - padding.left;
    
    if (mouseX >= -candlePitch && mouseX <= plotWidth + candlePitch && filteredData.length > 0) {
      const idx = Math.round(mouseX / candlePitch);
      const bounded = Math.max(0, Math.min(filteredData.length - 1, idx));
      setHoverIndex(bounded);
      setMousePos({ x: clientX, y: clientY });
    }
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
    setMousePos(null);
  };

  // Price Grid Y ticks
  const priceTicks = useMemo(() => {
    const count = 5;
    const step = (maxPrice - minPrice) / (count - 1);
    return Array.from({ length: count }, (_, i) => minPrice + i * step);
  }, [minPrice, maxPrice]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 lg:p-6 shadow-xl space-y-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-emerald-500/5 blur-3xl pointer-events-none" />

      {/* Top Chart Toolbar Bento Container */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-950/60 border border-slate-800/80 p-3 rounded-2xl">
        {/* Left: Ticker, Timeframe & Live Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800 text-xs font-mono font-bold text-white">
            <span>{symbol}</span>
            <span className="text-slate-500">|</span>
            <span className="text-emerald-400">1D</span>
            {isLoading && (
              <RefreshCw className="w-3 h-3 text-emerald-400 animate-spin ml-1" />
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[11px] font-mono text-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Live NEPSE</span>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex items-center bg-slate-900 p-1 rounded-full border border-slate-800 text-xs font-mono">
            {(['1M', '3M', '6M', '1Y', '2Y', 'ALL'] as Timeframe[]).map((tf) => (
              <button
                key={tf}
                id={`timeframe-${tf.toLowerCase()}`}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded-full transition-all ${
                  timeframe === tf
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Horizontal Scroll Mode Indicator & Punch Zoom Controls */}
          <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-full p-1 gap-1 text-xs">
            <button
              onClick={() => {
                applyZoom(zoomLevel - 0.25);
                triggerPinchToast(`Punch Zoom: ${Math.round(Math.max(0.35, zoomLevel - 0.25) * 100)}%`);
              }}
              title="Zoom Out / Punch in (Ctrl + Scroll down)"
              className="p-1 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            {/* Zoom Percentage / Quick Reset to 100% */}
            <button
              onClick={() => {
                applyZoom(1.0);
                triggerPinchToast('Zoom: 100%');
              }}
              title="Click to reset zoom to 100%"
              className="px-2 py-0.5 rounded-full hover:bg-slate-800 text-[10px] font-mono text-slate-300 hover:text-white font-semibold flex items-center gap-1 transition-colors"
            >
              <span>{isFitMode ? 'FIT' : `${Math.round(zoomLevel * 100)}%`}</span>
              {!isFitMode && Math.abs(zoomLevel - 1.0) > 0.05 && (
                <RotateCcw className="w-2.5 h-2.5 text-slate-400" />
              )}
            </button>

            <button
              onClick={() => {
                applyZoom(zoomLevel + 0.25);
                triggerPinchToast(`Punch Zoom: ${Math.round(Math.min(3.5, zoomLevel + 0.25) * 100)}%`);
              }}
              title="Zoom In / Punch out (Ctrl + Scroll up)"
              className="p-1 hover:bg-slate-800 rounded-full text-slate-300 hover:text-white transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            {/* Quick zoom presets */}
            <div className="hidden sm:flex items-center gap-0.5 border-l border-slate-800 pl-1 ml-0.5">
              {[0.5, 1.0, 1.5, 2.0].map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    applyZoom(preset);
                    triggerPinchToast(`Punch Zoom: ${Math.round(preset * 100)}%`);
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition-colors ${
                    !isFitMode && Math.abs(zoomLevel - preset) < 0.08
                      ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {preset}x
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsFitMode(!isFitMode)}
              title={isFitMode ? "Switch to Scrollable Canvas with Punch Zoom" : "Fit all candles to screen"}
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono transition-all flex items-center gap-1 ${
                isFitMode ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Maximize2 className="w-3 h-3" />
              <span>{isFitMode ? 'Fit' : 'Scrollable'}</span>
            </button>
          </div>

          {/* Horizontal Pan Controls */}
          {!isFitMode && (
            <div className="flex items-center bg-slate-900/90 border border-slate-800 rounded-full p-1 gap-1 text-xs">
              <button
                onClick={() => panChart(-240)}
                disabled={!scrollProgress.canPanLeft}
                title="Pan Left (View older candles)"
                className={`p-1 rounded-full transition-colors ${
                  scrollProgress.canPanLeft ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-mono text-slate-400 px-1 font-semibold flex items-center gap-1">
                <MoveHorizontal className="w-3 h-3 text-emerald-400" />
                <span>{scrollProgress.percent}%</span>
              </span>
              <button
                onClick={() => panChart(240)}
                disabled={!scrollProgress.canPanRight}
                title="Pan Right (View recent candles)"
                className={`p-1 rounded-full transition-colors ${
                  scrollProgress.canPanRight ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'
                }`}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Technical Overlays & Support / Resistance Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          {/* Key Support & Resistance Toggle */}
          <button
            id="toggle-support-resistance"
            onClick={() => setShowSR(!showSR)}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] border transition-all flex items-center gap-1.5 shadow-sm ${
              showSR 
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300 font-bold ring-1 ring-emerald-500/20' 
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Shield className={`w-3.5 h-3.5 ${showSR ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span>Support & Resistance</span>
          </button>

          <button
            id="toggle-ema50"
            onClick={() => setShowEMA50(!showEMA50)}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] border transition-all flex items-center gap-1 ${
              showEMA50 ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            EMA 50
          </button>

          <button
            id="toggle-ema200"
            onClick={() => setShowEMA200(!showEMA200)}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] border transition-all flex items-center gap-1 ${
              showEMA200 ? 'bg-purple-500/15 border-purple-500/40 text-purple-300 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
            EMA 200
          </button>

          <button
            id="toggle-sma200"
            onClick={() => setShowSMA200(!showSMA200)}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] border transition-all flex items-center gap-1 ${
              showSMA200 ? 'bg-blue-500/15 border-blue-500/40 text-blue-300 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            SMA 200
          </button>

          <button
            id="toggle-bb"
            onClick={() => setShowBB(!showBB)}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] border transition-all flex items-center gap-1 ${
              showBB ? 'bg-slate-700/50 border-slate-600 text-slate-200 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            BB (20,2)
          </button>

          <button
            id="toggle-rsi"
            onClick={() => setShowRSI(!showRSI)}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] border transition-all flex items-center gap-1 ${
              showRSI ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            RSI (14)
          </button>

          <button
            id="toggle-macd"
            onClick={() => setShowMACD(!showMACD)}
            className={`px-2.5 py-1 rounded-full font-mono text-[11px] border transition-all flex items-center gap-1 ${
              showMACD ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold' : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            MACD
          </button>
        </div>
      </div>

      {/* Floating Real-time HUD Values for Hovered / Active Candle & Support/Resistance Summary */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3 text-xs font-mono space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-slate-300 font-sans font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold text-white">{activePoint?.date || 'Today'}</span>
            </span>

            {/* Subtle Horizontal Scroll guide tip */}
            {!isFitMode && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 font-sans">
                <MoveHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>Scroll or drag horizontally for history</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <span className="text-slate-500 mr-1 font-sans text-[11px] uppercase">O:</span>
              <span className="text-slate-200 font-bold">Rs. {activePoint?.open.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-slate-500 mr-1 font-sans text-[11px] uppercase">H:</span>
              <span className="text-emerald-400 font-bold">Rs. {activePoint?.high.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-slate-500 mr-1 font-sans text-[11px] uppercase">L:</span>
              <span className="text-rose-400 font-bold">Rs. {activePoint?.low.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-slate-500 mr-1 font-sans text-[11px] uppercase">C:</span>
              <span className={`font-bold ${activePoint && activePoint.close >= activePoint.open ? 'text-emerald-400' : 'text-rose-400'}`}>
                Rs. {activePoint?.close.toFixed(1)}
              </span>
            </div>
            <div>
              <span className="text-slate-500 mr-1 font-sans text-[11px] uppercase">Vol:</span>
              <span className="text-slate-300 font-bold">{activePoint?.volume.toLocaleString()}</span>
            </div>
            {showEMA50 && activePoint?.ema50 !== undefined && (
              <div>
                <span className="text-cyan-400 mr-1 font-sans text-[11px] uppercase">EMA 50:</span>
                <span className="text-cyan-200 font-bold font-mono">Rs. {activePoint.ema50.toFixed(1)}</span>
              </div>
            )}
            {showRSI && activePoint?.rsi14 !== undefined && (
              <div>
                <span className="text-indigo-400 mr-1 font-sans text-[11px] uppercase">RSI:</span>
                <span className="text-indigo-200 font-bold">{activePoint.rsi14}</span>
              </div>
            )}
          </div>
        </div>

        {/* Live Support & Resistance Levels Banner (When Active) */}
        {showSR && srLevels && (
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-[11px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-slate-400 font-semibold flex items-center gap-1 font-sans">
                <Shield className="w-3 h-3 text-emerald-400" />
                Structural S/R:
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40 text-rose-300 font-bold">
                R2: Rs. {srLevels?.r2 != null ? srLevels.r2.toFixed(1) : '--'} (Major)
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-950/50 border border-rose-500/30 text-rose-300 font-bold">
                R1: Rs. {srLevels.r1.toFixed(1)}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300 font-bold">
                PP: Rs. {srLevels.pp.toFixed(1)}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 font-bold">
                S1: Rs. {srLevels.s1.toFixed(1)}
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                S2: Rs. {srLevels.s2.toFixed(1)} (Bedrock)
              </span>
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              Floor Pivot & Dynamic Swings
            </div>
          </div>
        )}
      </div>

      {/* Main Horizontally Scrollable Chart Container with Fixed Right Axis */}
      <div 
        ref={containerRef} 
        className="w-full relative select-none border border-slate-800/80 rounded-2xl bg-slate-950/70 overflow-hidden flex"
      >
        {/* Floating Animated Punch / Pinch Zoom HUD Indicator */}
        {pinchFeedback?.visible && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 pointer-events-none px-4 py-1.5 rounded-full bg-slate-900/95 border border-emerald-500/60 text-emerald-300 font-mono text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <ZoomIn className="w-3.5 h-3.5 text-emerald-400" />
            <span>{pinchFeedback.text}</span>
          </div>
        )}

        {/* ======================================================== */}
        {/* HORIZONTALLY SCROLLABLE CHART CANVAS                     */}
        {/* ======================================================== */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          onMouseDown={handleMouseDown}
          className={`flex-1 overflow-x-auto overflow-y-hidden chart-scrollbar relative touch-pan-x select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-crosshair'
          }`}
          style={{ scrollBehavior: 'auto' }}
        >
          <svg
            ref={svgRef}
            width={svgTotalWidth}
            height={totalChartHeight}
            className="overflow-visible block"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onDoubleClick={(e) => handleDoubleTap(e.clientX)}
          >
            {/* Defs for gradients */}
            <defs>
              <linearGradient id="bbGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#94a3b8" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#94a3b8" stopOpacity="0.02" />
              </linearGradient>

              {/* Gradient for Resistance zone */}
              <linearGradient id="resZoneGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.02" />
              </linearGradient>

              {/* Gradient for Support zone */}
              <linearGradient id="suppZoneGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.02" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.12" />
              </linearGradient>
            </defs>

            {/* ======================================================== */}
            {/* 1. PRICE PANE                                            */}
            {/* ======================================================== */}
            <g>
              {/* Background Horizontal Grid lines */}
              {priceTicks.map((price, idx) => {
                const y = getPriceY(price);
                return (
                  <line
                    key={idx}
                    x1={0}
                    y1={y}
                    x2={svgTotalWidth}
                    y2={y}
                    stroke="#1e293b"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                );
              })}

              {/* SUPPORT & RESISTANCE BANDS & LINES */}
              {showSR && srLevels && (
                <g className="transition-opacity duration-200">
                  {/* Resistance Band Area between R1 and R2 */}
                  {srLevels?.r2 != null && srLevels?.r1 != null && srLevels.r2 > srLevels.r1 && (
                    <rect
                      x={0}
                      y={getPriceY(srLevels?.r2 ?? 0)}
                      width={svgTotalWidth}
                      height={Math.max(2, getPriceY(srLevels.r1) - getPriceY(srLevels?.r2 ?? 0))}
                      fill="url(#resZoneGradient)"
                      opacity="0.9"
                    />
                  )}

                  {/* Support Band Area between S1 and S2 */}
                  {srLevels.s1 > srLevels.s2 && (
                    <rect
                      x={0}
                      y={getPriceY(srLevels.s1)}
                      width={svgTotalWidth}
                      height={Math.max(2, getPriceY(srLevels.s2) - getPriceY(srLevels.s1))}
                      fill="url(#suppZoneGradient)"
                      opacity="0.9"
                    />
                  )}

                  {/* R2 Major Resistance Line */}
                  <line
                    x1={0}
                    y1={getPriceY(srLevels?.r2 ?? 0)}
                    x2={svgTotalWidth}
                    y2={getPriceY(srLevels?.r2 ?? 0)}
                    stroke="#f43f5e"
                    strokeDasharray="6 4"
                    strokeWidth="1.5"
                    opacity="0.85"
                  />

                  {/* R1 Immediate Resistance Line */}
                  <line
                    x1={0}
                    y1={getPriceY(srLevels.r1)}
                    x2={svgTotalWidth}
                    y2={getPriceY(srLevels.r1)}
                    stroke="#fb7185"
                    strokeDasharray="4 3"
                    strokeWidth="1.5"
                    opacity="0.85"
                  />

                  {/* PP Equilibrium Pivot Line */}
                  <line
                    x1={0}
                    y1={getPriceY(srLevels.pp)}
                    x2={svgTotalWidth}
                    y2={getPriceY(srLevels.pp)}
                    stroke="#fbbf24"
                    strokeDasharray="2 2"
                    strokeWidth="1.2"
                    opacity="0.8"
                  />

                  {/* S1 Immediate Support Line */}
                  <line
                    x1={0}
                    y1={getPriceY(srLevels.s1)}
                    x2={svgTotalWidth}
                    y2={getPriceY(srLevels.s1)}
                    stroke="#34d399"
                    strokeDasharray="4 3"
                    strokeWidth="1.5"
                    opacity="0.85"
                  />

                  {/* S2 Bedrock Support Line */}
                  <line
                    x1={0}
                    y1={getPriceY(srLevels.s2)}
                    x2={svgTotalWidth}
                    y2={getPriceY(srLevels.s2)}
                    stroke="#10b981"
                    strokeDasharray="6 4"
                    strokeWidth="1.5"
                    opacity="0.85"
                  />
                </g>
              )}

              {/* Bollinger Bands Shaded Area */}
              {showBB && filteredData.length > 0 && (
                <path
                  d={`${generatePath('bbUpper', getPriceY)} L ${getX(filteredData.length - 1)} ${getPriceY(filteredData[filteredData.length - 1]?.bbLower || 0)} ${filteredData
                    .slice()
                    .reverse()
                    .map((d, idx) => {
                      const originalIdx = filteredData.length - 1 - idx;
                      return d.bbLower !== undefined ? `L ${getX(originalIdx)} ${getPriceY(d.bbLower)}` : '';
                    })
                    .join(' ')} Z`}
                  fill="url(#bbGradient)"
                />
              )}

              {/* Bollinger Band Upper & Lower Lines */}
              {showBB && (
                <>
                  <path d={generatePath('bbUpper', getPriceY)} fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
                  <path d={generatePath('bbLower', getPriceY)} fill="none" stroke="#64748b" strokeWidth="1" strokeDasharray="2 2" />
                  <path d={generatePath('bbMiddle', getPriceY)} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
                </>
              )}

              {/* Moving Averages */}
              {showEMA50 && (
                <path d={generatePath('ema50', getPriceY)} fill="none" stroke="#06b6d4" strokeWidth="1.5" />
              )}
              {showEMA200 && (
                <path d={generatePath('ema200', getPriceY)} fill="none" stroke="#a855f7" strokeWidth="1.8" />
              )}
              {showSMA200 && (
                <path d={generatePath('sma200', getPriceY)} fill="none" stroke="#3b82f6" strokeWidth="1.8" />
              )}

              {/* Candlestick Chart */}
              {filteredData.map((d, i) => {
                const x = getX(i);
                const isBull = d.close >= d.open;
                const candleColor = isBull ? '#10b981' : '#ef4444';

                const highY = getPriceY(d.high);
                const lowY = getPriceY(d.low);
                const openY = getPriceY(d.open);
                const closeY = getPriceY(d.close);

                const bodyTop = Math.min(openY, closeY);
                const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));

                return (
                  <g key={i}>
                    {/* High-Low Wick */}
                    <line x1={x} y1={highY} x2={x} y2={lowY} stroke={candleColor} strokeWidth="1" />
                    {/* Real Candle Body */}
                    <rect
                      x={x - candleWidth / 2}
                      y={bodyTop}
                      width={candleWidth}
                      height={bodyHeight}
                      fill={candleColor}
                      rx="1"
                    />
                  </g>
                );
              })}
            </g>

            {/* ======================================================== */}
            {/* 2. VOLUME SUBPANE                                        */}
            {/* ======================================================== */}
            {showVolume && (
              <g transform={`translate(0, ${chartHeight})`}>
                {/* Divider */}
                <line x1={0} y1={0} x2={svgTotalWidth} y2={0} stroke="#334155" strokeWidth="1" />
                <text x={padding.left} y={15} fill="#64748b" fontSize="10" fontFamily="sans-serif">
                  Volume
                </text>

                {filteredData.map((d, i) => {
                  const x = getX(i);
                  const isBull = d.close >= d.open;
                  const h = (d.volume / maxVolume) * (volumeHeight - 15);
                  return (
                    <rect
                      key={i}
                      x={x - candleWidth / 2}
                      y={volumeHeight - h}
                      width={candleWidth}
                      height={h}
                      fill={isBull ? '#10b981' : '#ef4444'}
                      opacity="0.65"
                    />
                  );
                })}
              </g>
            )}

            {/* ======================================================== */}
            {/* 3. RSI SUBPANE                                           */}
            {/* ======================================================== */}
            {showRSI && (
              <g transform={`translate(0, ${chartHeight + volumeHeight})`}>
                <line x1={0} y1={0} x2={svgTotalWidth} y2={0} stroke="#334155" strokeWidth="1" />
                <text x={padding.left} y={15} fill="#a855f7" fontSize="10" fontWeight="bold">
                  RSI (14)
                </text>

                {/* 70 & 30 Lines */}
                <line
                  x1={0}
                  y1={getRsiY(70)}
                  x2={svgTotalWidth}
                  y2={getRsiY(70)}
                  stroke="#ef4444"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />
                <line
                  x1={0}
                  y1={getRsiY(30)}
                  x2={svgTotalWidth}
                  y2={getRsiY(30)}
                  stroke="#10b981"
                  strokeDasharray="2 2"
                  strokeWidth="1"
                />

                {/* RSI Curve */}
                <path d={generatePath('rsi14', getRsiY)} fill="none" stroke="#a855f7" strokeWidth="1.8" />
              </g>
            )}

            {/* ======================================================== */}
            {/* 4. MACD SUBPANE                                          */}
            {/* ======================================================== */}
            {showMACD && (
              <g transform={`translate(0, ${chartHeight + volumeHeight + rsiHeight})`}>
                <line x1={0} y1={0} x2={svgTotalWidth} y2={0} stroke="#334155" strokeWidth="1" />
                <text x={padding.left} y={15} fill="#3b82f6" fontSize="10" fontWeight="bold">
                  MACD (12, 26, 9)
                </text>

                {/* Zero Line */}
                <line
                  x1={0}
                  y1={getMacdY(0)}
                  x2={svgTotalWidth}
                  y2={getMacdY(0)}
                  stroke="#475569"
                  strokeWidth="1"
                />

                {/* MACD Histogram */}
                {filteredData.map((d, i) => {
                  if (d.macdHist === undefined) return null;
                  const x = getX(i);
                  const zeroY = getMacdY(0);
                  const valY = getMacdY(d.macdHist);
                  const barTop = Math.min(zeroY, valY);
                  const barHeight = Math.abs(valY - zeroY);
                  const isPos = d.macdHist >= 0;
                  return (
                    <rect
                      key={i}
                      x={x - candleWidth / 2}
                      y={barTop}
                      width={candleWidth}
                      height={Math.max(1, barHeight)}
                      fill={isPos ? '#10b981' : '#ef4444'}
                      opacity="0.8"
                    />
                  );
                })}

                {/* MACD Line & Signal Line */}
                <path d={generatePath('macd', getMacdY)} fill="none" stroke="#3b82f6" strokeWidth="1.6" />
                <path d={generatePath('macdSignal', getMacdY)} fill="none" stroke="#f97316" strokeWidth="1.6" />
              </g>
            )}

            {/* ======================================================== */}
            {/* 5. INTERACTIVE CROSSHAIRS & HOVER HIGHLIGHT              */}
            {/* ======================================================== */}
            {hoverIndex !== null && filteredData[hoverIndex] && (
              <g pointerEvents="none">
                {/* Vertical Crosshair Line aligned to candlestick */}
                <line
                  x1={getX(hoverIndex)}
                  y1={padding.top}
                  x2={getX(hoverIndex)}
                  y2={totalChartHeight - 5}
                  stroke="#38bdf8"
                  strokeDasharray="3 3"
                  strokeWidth="1.2"
                  opacity="0.85"
                />

                {/* Horizontal Price Crosshair Line */}
                <line
                  x1={0}
                  y1={getPriceY(filteredData[hoverIndex].close)}
                  x2={svgTotalWidth}
                  y2={getPriceY(filteredData[hoverIndex].close)}
                  stroke="#94a3b8"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                  opacity="0.5"
                />

                {/* Circle on Close of hovered candle */}
                <circle
                  cx={getX(hoverIndex)}
                  cy={getPriceY(filteredData[hoverIndex].close)}
                  r="4.5"
                  fill="#38bdf8"
                  stroke="#ffffff"
                  strokeWidth="2"
                />
              </g>
            )}
          </svg>
        </div>

        {/* ======================================================== */}
        {/* FIXED / PINNED RIGHT PRICE AXIS SCALE                    */}
        {/* ======================================================== */}
        <div 
          className="w-[65px] shrink-0 border-l border-slate-800/80 bg-slate-950/95 relative select-none"
          style={{ height: `${totalChartHeight}px` }}
        >
          <svg width={rightAxisWidth} height={totalChartHeight} className="block overflow-visible">
            {/* Price Y Ticks */}
            {priceTicks.map((price, idx) => {
              const y = getPriceY(price);
              return (
                <g key={idx}>
                  <line x1={0} y1={y} x2={5} y2={y} stroke="#334155" strokeWidth="1" />
                  <text
                    x={8}
                    y={y + 3.5}
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {price.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Support & Resistance Price Axis Badges */}
            {showSR && srLevels && (
              <>
                {/* R2 Badge */}
                <g transform={`translate(2, ${getPriceY(srLevels?.r2 ?? 0) - 8})`}>
                  <rect width={58} height={16} rx={3} fill="#881337" stroke="#f43f5e" strokeWidth="1" />
                  <text x={29} y={11} fill="#fecdd3" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    R2 {srLevels?.r2 != null ? srLevels.r2.toFixed(0) : '--'}
                  </text>
                </g>

                {/* R1 Badge */}
                <g transform={`translate(2, ${getPriceY(srLevels.r1) - 8})`}>
                  <rect width={58} height={16} rx={3} fill="#4c0519" stroke="#fb7185" strokeWidth="1" />
                  <text x={29} y={11} fill="#ffe4e6" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    R1 {srLevels.r1.toFixed(0)}
                  </text>
                </g>

                {/* S1 Badge */}
                <g transform={`translate(2, ${getPriceY(srLevels.s1) - 8})`}>
                  <rect width={58} height={16} rx={3} fill="#064e3b" stroke="#34d399" strokeWidth="1" />
                  <text x={29} y={11} fill="#a7f3d0" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    S1 {srLevels.s1.toFixed(0)}
                  </text>
                </g>

                {/* S2 Badge */}
                <g transform={`translate(2, ${getPriceY(srLevels.s2) - 8})`}>
                  <rect width={58} height={16} rx={3} fill="#022c22" stroke="#10b981" strokeWidth="1" />
                  <text x={29} y={11} fill="#6ee7b7" fontSize="9" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    S2 {srLevels.s2.toFixed(0)}
                  </text>
                </g>
              </>
            )}

            {/* Current Price Marker Badge on Right Axis */}
            {filteredData.length > 0 && (
              <g transform={`translate(2, ${getPriceY(filteredData[filteredData.length - 1].close) - 9})`}>
                <rect 
                  width={60} 
                  height={18} 
                  rx={3} 
                  fill={filteredData[filteredData.length - 1].close >= filteredData[filteredData.length - 1].open ? '#047857' : '#be123c'} 
                  stroke="#ffffff" 
                  strokeWidth="0.5" 
                />
                <text 
                  x={30} 
                  y={13} 
                  fill="#ffffff" 
                  fontSize="10" 
                  fontFamily="monospace" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  {filteredData[filteredData.length - 1].close.toFixed(1)}
                </text>
              </g>
            )}

            {/* Hovered Price Marker Badge */}
            {hoverIndex !== null && filteredData[hoverIndex] && (
              <g transform={`translate(2, ${getPriceY(filteredData[hoverIndex].close) - 9})`}>
                <rect 
                  width={60} 
                  height={18} 
                  rx={3} 
                  fill="#0369a1" 
                  stroke="#38bdf8" 
                  strokeWidth="1" 
                />
                <text 
                  x={30} 
                  y={13} 
                  fill="#ffffff" 
                  fontSize="10" 
                  fontFamily="monospace" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  {filteredData[hoverIndex].close.toFixed(1)}
                </text>
              </g>
            )}

            {/* Volume Axis Label */}
            {showVolume && (
              <g transform={`translate(0, ${chartHeight})`}>
                <text x={8} y={15} fill="#64748b" fontSize="9" fontFamily="monospace">
                  {(maxVolume / 1000).toFixed(0)}k
                </text>
              </g>
            )}

            {/* RSI Axis Labels */}
            {showRSI && (
              <g transform={`translate(0, ${chartHeight + volumeHeight})`}>
                <text x={8} y={getRsiY(70) + 3} fill="#ef4444" fontSize="9" fontFamily="monospace">
                  70
                </text>
                <text x={8} y={getRsiY(30) + 3} fill="#10b981" fontSize="9" fontFamily="monospace">
                  30
                </text>
              </g>
            )}

            {/* MACD Axis Label */}
            {showMACD && (
              <g transform={`translate(0, ${chartHeight + volumeHeight + rsiHeight})`}>
                <text x={8} y={getMacdY(0) + 3} fill="#64748b" fontSize="9" fontFamily="monospace">
                  0
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Floating Pan Navigation Buttons at Canvas Edges */}
        {scrollProgress.canPanLeft && !isFitMode && (
          <button
            onClick={() => panChart(-260)}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-xl backdrop-blur-md transition-all hover:scale-110"
            title="Pan left to older candles (-260px)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        {scrollProgress.canPanRight && !isFitMode && (
          <button
            onClick={() => panChart(260)}
            className="absolute right-20 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-slate-900/85 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-xl backdrop-blur-md transition-all hover:scale-110"
            title="Pan right to recent candles (+260px)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {/* Jump to Latest Floating Button (Visible when scrolled left into past candles) */}
        {isScrolledLeft && !isFitMode && (
          <button
            onClick={scrollToLatest}
            className="absolute bottom-4 right-20 z-20 px-3 py-1.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 animate-bounce"
            title="Scroll to current live candlestick"
          >
            <ChevronsRight className="w-4 h-4" />
            <span>Latest Candle</span>
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* HORIZONTAL TIMELINE RANGE SCRUBBER & NAVIGATION BAR     */}
      {/* ======================================================== */}
      {!isFitMode && (
        <div className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-2.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-inner">
          {/* Left Buttons: Oldest & Pan Left */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-start">
            <button
              onClick={scrollToOldest}
              disabled={!scrollProgress.canPanLeft}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
              title="Jump to oldest historical candle"
            >
              <ChevronsLeft className="w-3.5 h-3.5" />
              <span>Oldest</span>
            </button>
            <button
              onClick={() => panChart(-250)}
              disabled={!scrollProgress.canPanLeft}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
              title="Pan left across chart (-250px)"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Pan Left</span>
            </button>
          </div>

          {/* Interactive Timeline Range Scrubber Slider */}
          <div className="flex-1 w-full max-w-xl flex items-center gap-3 px-2">
            <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap hidden md:inline">
              {visibleDates.start}
            </span>
            
            <div className="flex-1 flex flex-col items-center gap-1 relative">
              <input
                type="range"
                min="0"
                max="100"
                value={scrollProgress.percent}
                onChange={handleScrubberChange}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all"
                title="Drag horizontally to scrub across history timeline"
              />
              <div className="flex items-center justify-between w-full text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <ArrowLeftRight className="w-3 h-3 text-emerald-400" />
                  <span>Showing {visibleDates.count} candles ({visibleDates.start} → {visibleDates.end})</span>
                </span>
                <span className="text-emerald-400 font-bold">{scrollProgress.percent}%</span>
              </div>
            </div>

            <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap hidden md:inline">
              {visibleDates.end}
            </span>
          </div>

          {/* Right Buttons: Pan Right & Latest */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto justify-between sm:justify-end">
            <button
              onClick={() => panChart(250)}
              disabled={!scrollProgress.canPanRight}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1"
              title="Pan right across chart (+250px)"
            >
              <span>Pan Right</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={scrollToLatest}
              disabled={!scrollProgress.canPanRight}
              className="px-2.5 py-1 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/50 text-[11px] font-mono text-emerald-300 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 font-bold"
              title="Jump to latest live candlestick"
            >
              <span>Latest</span>
              <ChevronsRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer Legend */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3 flex-wrap gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span> Bullish Candle
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span> Bearish Candle
          </span>
          
          {showSR && (
            <>
              <span className="flex items-center gap-1.5 font-mono text-rose-300">
                <span className="w-2.5 h-0.5 bg-rose-500 border-dashed"></span> Resistance (R1/R2)
              </span>
              <span className="flex items-center gap-1.5 font-mono text-emerald-300">
                <span className="w-2.5 h-0.5 bg-emerald-500 border-dashed"></span> Support (S1/S2)
              </span>
            </>
          )}

          {showEMA50 && (
            <span className="flex items-center gap-1.5 font-mono text-cyan-300">
              <span className="w-2 h-0.5 bg-cyan-400"></span> EMA 50
            </span>
          )}
          {showEMA200 && (
            <span className="flex items-center gap-1.5 font-mono text-purple-300">
              <span className="w-2 h-0.5 bg-purple-400"></span> EMA 200
            </span>
          )}
          {showSMA200 && (
            <span className="flex items-center gap-1.5 font-mono text-blue-300">
              <span className="w-2 h-0.5 bg-blue-400"></span> SMA 200
            </span>
          )}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
          <span className="hidden md:inline-flex items-center gap-1 text-slate-500">
            <span>Scroll wheel or drag to pan • Scrubber timeline below • Pinch or Ctrl+Wheel to zoom</span>
          </span>
          <span className="text-slate-500">|</span>
          <span>{filteredData.length} Trading Days</span>
        </div>
      </div>
    </div>
  );
};
