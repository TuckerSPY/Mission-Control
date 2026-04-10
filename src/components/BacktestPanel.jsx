import { useState } from 'react';

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

const mono = "'JetBrains Mono', 'SF Mono', monospace";

const Pill = ({ children, color = C.gold }) => (
  <span style={{ 
    display: "inline-flex", 
    alignItems: "center", 
    padding: "2px 7px", 
    borderRadius: 4, 
    fontSize: 9.5, 
    fontFamily: mono, 
    color, 
    background: color + "15", 
    fontWeight: 600, 
    letterSpacing: "0.05em", 
    textTransform: "uppercase" 
  }}>{children}</span>
);

const Card = ({ children, style = {} }) => (
  <div style={{ 
    background: C.bg2, 
    borderRadius: 10, 
    border: `1px solid ${C.borderDim}`, 
    ...style 
  }}>{children}</div>
);

const Label = ({ children }) => (
  <div style={{ 
    fontSize: 10, 
    fontFamily: mono, 
    color: C.textDim, 
    letterSpacing: "0.07em", 
    textTransform: "uppercase", 
    fontWeight: 600 
  }}>{children}</div>
);

const BacktestPanel = () => {
  const [activeStrategy, setActiveStrategy] = useState('gatekeeper');
  const [timeframe, setTimeframe] = useState('0DTE');
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState(null);

  const strategies = [
    { id: 'gatekeeper', name: 'Gatekeeper', desc: 'Fresh node rejection + break' },
    { id: 'vwap', name: 'VWAP Fade', desc: 'Mean reversion to VWAP' },
    { id: 'momentum', name: 'Momentum', desc: 'Break of structure continuation' },
    { id: 'gamma', name: 'Gamma Flip', desc: 'Trade gamma regime shifts' },
  ];

  const runBacktest = () => {
    setIsRunning(true);
    // Simulate backtest
    setTimeout(() => {
      setResults({
        totalReturn: 12.4,
        winRate: 62.5,
        profitFactor: 1.87,
        maxDrawdown: -8.2,
        sharpe: 1.34,
        trades: 48,
        avgWin: 485,
        avgLoss: -312
      });
      setIsRunning(false);
    }, 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, height: '100%' }}>
      {/* Strategy Selection */}
      <Card style={{ padding: 14 }}>
        <Label>BACKTEST STRATEGY</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
          {strategies.map(s => (
            <div
              key={s.id}
              onClick={() => setActiveStrategy(s.id)}
              style={{
                padding: 10,
                borderRadius: 6,
                background: activeStrategy === s.id ? C.purpleBg : C.bg,
                border: `1px solid ${activeStrategy === s.id ? C.purpleBorder : C.borderDim}`,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600, color: activeStrategy === s.id ? C.purple : C.text }}>
                {s.name}
              </div>
              <div style={{ fontSize: 10, color: C.textDim, marginTop: 2 }}>
                {s.desc}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Parameters */}
      <Card style={{ padding: 14 }}>
        <Label>PARAMETERS</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: C.textMid }}>Timeframe</span>
            <select 
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 4,
                border: `1px solid ${C.borderDim}`,
                background: C.bg,
                color: C.text,
                fontSize: 11,
                fontFamily: mono
              }}
            >
              <option value="0DTE">0DTE</option>
              <option value="1DTE">1DTE</option>
              <option value="Week">Weekly</option>
              <option value="Month">Monthly</option>
            </select>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: C.textMid }}>Symbol</span>
            <Pill color={C.gold}>SPX</Pill>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: C.textMid }}>Date Range</span>
            <span style={{ fontSize: 11, fontFamily: mono, color: C.text }}>Last 30 Days</span>
          </div>
        </div>
      </Card>

      {/* Run Button */}
      <button
        onClick={runBacktest}
        disabled={isRunning}
        style={{
          padding: '12px',
          borderRadius: 6,
          border: 'none',
          background: isRunning ? C.borderDim : C.gold,
          color: isRunning ? C.textDim : C.bg,
          fontSize: 12,
          fontFamily: mono,
          fontWeight: 700,
          cursor: isRunning ? 'not-allowed' : 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.05em'
        }}
      >
        {isRunning ? 'Running Backtest...' : 'Run Backtest'}
      </button>

      {/* Results */}
      {results && (
        <Card style={{ padding: 14, flex: 1 }}>
          <Label>RESULTS</Label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 10 }}>
            <div style={{ padding: 10, borderRadius: 6, background: C.bg }}>
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono }}>TOTAL RETURN</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: results.totalReturn >= 0 ? C.green : C.red, marginTop: 4 }}>
                {results.totalReturn >= 0 ? '+' : ''}{results.totalReturn}%
              </div>
            </div>
            <div style={{ padding: 10, borderRadius: 6, background: C.bg }}>
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono }}>WIN RATE</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginTop: 4 }}>
                {results.winRate}%
              </div>
            </div>
            <div style={{ padding: 10, borderRadius: 6, background: C.bg }}>
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono }}>PROFIT FACTOR</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: results.profitFactor >= 1.5 ? C.green : C.amber, marginTop: 4 }}>
                {results.profitFactor}
              </div>
            </div>
            <div style={{ padding: 10, borderRadius: 6, background: C.bg }}>
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono }}>MAX DRAWDOWN</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.red, marginTop: 4 }}>
                {results.maxDrawdown}%
              </div>
            </div>
            <div style={{ padding: 10, borderRadius: 6, background: C.bg }}>
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono }}>SHARPE RATIO</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginTop: 4 }}>
                {results.sharpe}
              </div>
            </div>
            <div style={{ padding: 10, borderRadius: 6, background: C.bg }}>
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono }}>TRADES</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: C.text, marginTop: 4 }}>
                {results.trades}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 12, padding: 10, borderRadius: 6, background: C.bg, border: `1px solid ${C.borderDim}` }}>
            <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono, marginBottom: 6 }}>AVG WIN / LOSS</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: C.green, fontFamily: mono }}>+${results.avgWin}</span>
              <span style={{ fontSize: 13, color: C.red, fontFamily: mono }}>-${Math.abs(results.avgLoss)}</span>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BacktestPanel;
