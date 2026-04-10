import { useEffect, useRef, useState } from 'react';

const C = {
  bg: "#08080b", bg1: "#0e0e13", bg2: "#141419", bg3: "#1a1a21",
  border: "#222230", borderDim: "#1a1a25",
  text: "#e4e4ec", textMid: "#9494ac", textDim: "#5a5a72",
  gold: "#d4a843", green: "#34d399", red: "#f87171",
  blue: "#6d8aff", purple: "#a78bfa", amber: "#fbbf24"
};

const TradingViewChart = ({ 
  symbol = "SPX", 
  interval = "1", 
  theme = "dark",
  onPriceUpdate,
  showStudies = true
}) => {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up any existing widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (window.TradingView) {
        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: interval,
          timezone: "America/New_York",
          theme: theme,
          style: "1",
          locale: "en",
          toolbar_bg: C.bg1,
          enable_publishing: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: false,
          container_id: containerRef.current.id,
          studies: showStudies ? [
            "MASimple@tv-basicstudies",
            "RSI@tv-basicstudies",
            "VWAP@tv-basicstudies"
          ] : [],
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
          disabled_features: [
            "header_symbol_search",
            "header_compare",
            "header_screenshot"
          ],
          enabled_features: [
            "study_templates",
            "use_localstorage_for_settings"
          ],
          overrides: {
            "paneProperties.background": C.bg,
            "paneProperties.vertGridProperties.color": C.borderDim,
            "paneProperties.horzGridProperties.color": C.borderDim,
            "symbolWatermarkProperties.transparency": 90,
            "scalesProperties.textColor": C.textDim
          }
        });
        setIsLoaded(true);
      }
    };

    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [symbol, interval, theme, showStudies]);

  // Simulate price updates for backtesting interface
  useEffect(() => {
    const intervalId = setInterval(() => {
      // Mock price data - in production this would come from WebSocket/API
      const mockPrice = 5823.47 + (Math.random() - 0.5) * 10;
      const change = (Math.random() - 0.5) * 20;
      setCurrentPrice(mockPrice);
      setPriceChange(change);
      if (onPriceUpdate) {
        onPriceUpdate({ price: mockPrice, change });
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [onPriceUpdate]);

  return (
    <div style={{ 
      background: C.bg2, 
      borderRadius: 10, 
      border: `1px solid ${C.borderDim}`,
      overflow: 'hidden',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '12px 16px',
        borderBottom: `1px solid ${C.borderDim}`,
        background: C.bg1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ 
            fontSize: 14, 
            fontWeight: 700, 
            fontFamily: 'JetBrains Mono, monospace',
            color: C.gold 
          }}>
            {symbol}
          </span>
          <span style={{ 
            fontSize: 12, 
            fontFamily: 'JetBrains Mono, monospace',
            color: priceChange >= 0 ? C.green : C.red 
          }}>
            {currentPrice?.toFixed(2) || '---'}
            {priceChange && (
              <span style={{ marginLeft: 8 }}>
                {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}
              </span>
            )}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['1', '5', '15', '30', '60', 'D'].map(tf => (
            <button
              key={tf}
              onClick={() => {}}
              style={{
                padding: '4px 8px',
                borderRadius: 4,
                border: 'none',
                background: interval === tf ? C.gold : 'transparent',
                color: interval === tf ? C.bg : C.textDim,
                fontSize: 10,
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        <div 
          id={`tradingview-chart-${symbol}`}
          ref={containerRef}
          style={{ 
            width: '100%', 
            height: '100%',
            minHeight: '400px'
          }}
        />
        {!isLoaded && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: C.bg,
            color: C.textDim,
            fontSize: 12,
            fontFamily: 'JetBrains Mono, monospace'
          }}>
            Loading Chart...
          </div>
        )}
      </div>
    </div>
  );
};

export default TradingViewChart;
