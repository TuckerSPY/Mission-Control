import { useState, useEffect } from 'react';

const C = {
  bg: "#08080b", bg1: "#0e0e13", bg2: "#141419", bg3: "#1a1a21",
  border: "#222230", borderDim: "#1a1a25",
  text: "#e4e4ec", textMid: "#9494ac", textDim: "#5a5a72",
  gold: "#d4a843", goldBg: "#d4a84312", goldBorder: "#d4a84330",
  green: "#34d399", greenBg: "#34d39910", greenBorder: "#34d39925",
  red: "#f87171", redBg: "#f8717110", redBorder: "#f8717125",
  blue: "#6d8aff", blueBg: "#6d8aff10", blueBorder: "#6d8aff25",
  amber: "#fbbf24"
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

const Card = ({ children, style = {}, glow }) => (
  <div style={{ 
    background: C.bg2, 
    borderRadius: 10, 
    border: `1px solid ${glow || C.borderDim}`, 
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

const IntradayMonitor = () => {
  const [marketData, setMarketData] = useState({
    spx: { price: 5823.47, change: -12.30, pct: -0.21, high: 5848, low: 5818, vwap: 5828.5 },
    vix: { value: 18.4, change: 1.2 },
    gex: { total: -2.8, callWall: 5850, putWall: 5790, hvl: 5815 },
    breadth: { advancers: 234, decliners: 267, unchanged: 9 },
    volume: { spx: 1.2, spy: 45.3, qqq: 28.7 }
  });

  const [alerts, setAlerts] = useState([
    { time: '10:32', type: 'SETUP', msg: 'SPX approaching 5850 Call Wall', level: 'high' },
    { time: '10:15', type: 'FLOW', msg: 'Large SPX 5850C sweep detected', level: 'med' },
    { time: '09:45', type: 'REGIME', msg: 'VIX term structure flipped to backwardation', level: 'high' },
  ]);

  // Simulate live updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketData(prev => ({
        ...prev,
        spx: {
          ...prev.spx,
          price: prev.spx.price + (Math.random() - 0.5) * 2,
          change: prev.spx.change + (Math.random() - 0.5) * 0.5
        }
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getLevelColor = (price, hvl, callWall, putWall) => {
    const distToCall = Math.abs(price - callWall);
    const distToPut = Math.abs(price - putWall);
    const distToHVL = Math.abs(price - hvl);
    
    if (distToCall < 5 || distToPut < 5) return C.red;
    if (distToHVL < 3) return C.gold;
    return C.text;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {/* Price Header */}
      <Card style={{ padding: 16 }} glow={C.goldBorder}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Label>SPX INTRADAY</Label>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginTop: 6 }}>
              <span style={{ fontSize: 28, fontFamily: mono, fontWeight: 700, color: C.text }}>
                {marketData.spx.price.toFixed(2)}
              </span>
              <span style={{ 
                fontSize: 14, 
                fontFamily: mono, 
                fontWeight: 600, 
                color: marketData.spx.change >= 0 ? C.green : C.red 
              }}>
                {marketData.spx.change >= 0 ? '+' : ''}{marketData.spx.change.toFixed(2)} 
                ({marketData.spx.pct}%)
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, color: C.textDim, fontFamily: mono }}>H: {marketData.spx.high}</div>
            <div style={{ fontSize: 10, color: C.textDim, fontFamily: mono, marginTop: 2 }}>L: {marketData.spx.low}</div>
            <div style={{ fontSize: 10, color: C.gold, fontFamily: mono, marginTop: 2 }}>VWAP: {marketData.spx.vwap}</div>
          </div>
        </div>
      </Card>

      {/* Key Levels */}
      <Card style={{ padding: 14 }}>
        <Label>KEY LEVELS</Label>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          {[
            { label: 'CALL WALL', value: marketData.gex.callWall, color: C.green },
            { label: 'HVL', value: marketData.gex.hvl, color: C.gold },
            { label: 'PUT WALL', value: marketData.gex.putWall, color: C.red }
          ].map(level => (
            <div key={level.label} style={{ 
              flex: 1, 
              padding: 10, 
              borderRadius: 6, 
              background: C.bg,
              border: `1px solid ${C.borderDim}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono }}>{level.label}</div>
              <div style={{ 
                fontSize: 16, 
                fontFamily: mono, 
                fontWeight: 700, 
                color: level.color,
                marginTop: 4 
              }}>
                {level.value}
              </div>
            </div>
          ))}
        </div>
        {/* Distance indicator */}
        <div style={{ 
          marginTop: 10, 
          height: 4, 
          borderRadius: 2, 
          background: `linear-gradient(90deg, ${C.red} 0%, ${C.gold} 50%, ${C.green} 100%)`,
          position: 'relative'
        }}>
          <div style={{
            position: 'absolute',
            left: `${((marketData.spx.price - marketData.gex.putWall) / (marketData.gex.callWall - marketData.gex.putWall)) * 100}%`,
            top: -3,
            width: 8,
            height: 10,
            background: C.text,
            borderRadius: 2,
            transform: 'translateX(-4px)'
          }} />
        </div>
      </Card>

      {/* Market Internals */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <Card style={{ padding: 12 }}>
          <Label>BREADTH</Label>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.green, fontFamily: mono }}>
                {marketData.breadth.advancers}
              </div>
              <div style={{ fontSize: 9, color: C.textDim }}>UP</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.red, fontFamily: mono }}>
                {marketData.breadth.decliners}
              </div>
              <div style={{ fontSize: 9, color: C.textDim }}>DOWN</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.textDim, fontFamily: mono }}>
                {marketData.breadth.unchanged}
              </div>
              <div style={{ fontSize: 9, color: C.textDim }}>FLAT</div>
            </div>
          </div>
        </Card>
        <Card style={{ padding: 12 }}>
          <Label>VOLUME (M)</Label>
          <div style={{ marginTop: 8 }}>
            {Object.entries(marketData.volume).map(([sym, vol]) => (
              <div key={sym} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 10, color: C.textDim, textTransform: 'uppercase' }}>{sym}</span>
                <span style={{ fontSize: 11, fontFamily: mono, color: C.text }}>{vol}M</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Live Alerts */}
      <Card style={{ padding: 14, flex: 1 }}>
        <Label>LIVE ALERTS</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
          {alerts.map((alert, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10, 
              padding: '8px 10px',
              borderRadius: 6,
              background: C.bg,
              border: `1px solid ${C.borderDim}`
            }}>
              <span style={{ fontSize: 10, color: C.textDim, fontFamily: mono, minWidth: 40 }}>
                {alert.time}
              </span>
              <Pill color={alert.level === 'high' ? C.red : alert.level === 'med' ? C.amber : C.blue}>
                {alert.type}
              </Pill>
              <span style={{ fontSize: 11, color: C.textMid, flex: 1 }}>
                {alert.msg}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default IntradayMonitor;
