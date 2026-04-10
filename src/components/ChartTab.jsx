import TradingViewChart from "./TradingViewChart";
import BacktestPanel from "./BacktestPanel";
import IntradayMonitor from "./IntradayMonitor";

const C = {
  bg: "#08080b", bg1: "#0e0e13", bg2: "#141419", bg3: "#1a1a21",
  border: "#222230", borderDim: "#1a1a25",
  text: "#e4e4ec", textMid: "#9494ac", textDim: "#5a5a72",
  gold: "#d4a843", goldBg: "#d4a84312", goldBorder: "#d4a84330",
  green: "#34d399", greenBg: "#34d39910", greenBorder: "#34d39925",
  red: "#f87171", redBg: "#f8717110", redBorder: "#f8717125",
  blue: "#6d8aff", blueBg: "#6d8aff10", blueBorder: "#6d8aff25",
  purple: "#a78bfa", purpleBg: "#a78bfa10", purpleBorder: "#a78bfa25",
};

const Label = ({ children }) => (
  <div style={{ 
    fontSize: 10, 
    fontFamily: "'JetBrains Mono', monospace", 
    color: C.textDim, 
    letterSpacing: "0.07em", 
    textTransform: "uppercase", 
    fontWeight: 600 
  }}>{children}</div>
);

const Card = ({ children, style = {} }) => (
  <div style={{ 
    background: C.bg2, 
    borderRadius: 10, 
    border: `1px solid ${C.borderDim}`, 
    ...style 
  }}>{children}</div>
);

const ChartTab = () => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "mc-fade 0.25s ease" }}>
      {/* Top Row: Chart + Intraday Monitor */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, height: "500px" }}>
        {/* TradingView Chart */}
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <TradingViewChart symbol="SPX" interval="1" />
        </Card>
        
        {/* Intraday Monitor */}
        <div style={{ height: "100%", overflow: "auto" }}>
          <IntradayMonitor />
        </div>
      </div>
      
      {/* Bottom Row: Backtest Panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, height: "400px" }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <BacktestPanel />
        </Card>
        
        {/* Placeholder for additional analysis */}
        <Card style={{ padding: 16 }}>
          <Label>STRATEGY ANALYSIS</Label>
          <div style={{ 
            marginTop: 20, 
            padding: 20, 
            borderRadius: 8, 
            background: C.bg,
            border: `1px solid ${C.borderDim}`,
            textAlign: "center",
            color: C.textDim
          }}>
            <div style={{ fontSize: 14, marginBottom: 10 }}>📊 Strategy Performance Metrics</div>
            <div style={{ fontSize: 12 }}>
              Run a backtest to see detailed performance analysis,
              equity curves, drawdown periods, and trade distributions.
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChartTab;
