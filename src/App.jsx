import { useState, useEffect, useRef } from "react";
import ChartTab from "./components/ChartTab";

// ── DESIGN SYSTEM ──
const C = {
  bg: "#08080b", bg1: "#0e0e13", bg2: "#141419", bg3: "#1a1a21",
  border: "#222230", borderDim: "#1a1a25",
  text: "#e4e4ec", textMid: "#9494ac", textDim: "#5a5a72",
  gold: "#d4a843", goldBg: "#d4a84312", goldBorder: "#d4a84330",
  green: "#34d399", greenBg: "#34d39910", greenBorder: "#34d39925",
  red: "#f87171", redBg: "#f8717110", redBorder: "#f8717125",
  blue: "#6d8aff", blueBg: "#6d8aff10", blueBorder: "#6d8aff25",
  purple: "#a78bfa", purpleBg: "#a78bfa10", purpleBorder: "#a78bfa25",
  cyan: "#22d3ee", cyanBg: "#22d3ee10",
  amber: "#fbbf24",
};
const mono = "'JetBrains Mono', 'SF Mono', monospace";
const sans = "'DM Sans', -apple-system, sans-serif";

// ── PRIMITIVES ──
const Pill = ({ children, color = C.gold, bg, style = {} }) => (
  <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 7px", borderRadius: 4, fontSize: 9.5, fontFamily: mono, color, background: bg || color + "15", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", whiteSpace: "nowrap", ...style }}>{children}</span>
);

const Dot = ({ color = C.green, pulse, size = 7 }) => (
  <span style={{ position: "relative", display: "inline-block", width: size, height: size }}>
    <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color, animation: pulse ? "mc-pulse 2s ease-in-out infinite" : "none" }} />
  </span>
);

const Card = ({ children, style = {}, glow }) => (
  <div style={{ background: C.bg2, borderRadius: 10, border: `1px solid ${glow || C.borderDim}`, ...style }}>{children}</div>
);

const Label = ({ children, style = {} }) => (
  <div style={{ fontSize: 10, fontFamily: mono, color: C.textDim, letterSpacing: "0.07em", textTransform: "uppercase", fontWeight: 600, ...style }}>{children}</div>
);

const Spark = ({ data, color = C.green, w = 100, h = 28 }) => {
  if (!data || data.length < 2) return null;
  const mn = Math.min(...data), mx = Math.max(...data), r = mx - mn || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - mn) / r) * (h - 4) - 2}`).join(" ");
  return <svg width={w} height={h} style={{ display: "block" }}><polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} strokeLinecap="round" strokeLinejoin="round" /></svg>;
};

// ── MOCK DATA ──
const MARKET = {
  regime: "NEGATIVE GAMMA",
  regimeColor: C.red,
  regimeDesc: "Dealers short gamma — directional moves amplified. Trend-following favored.",
  spx: { price: 5823.47, change: -12.30, pct: -0.21, spark: [5848, 5842, 5835, 5840, 5832, 5828, 5830, 5825, 5820, 5818, 5823] },
  vix: { value: 18.4, change: 1.2, term: "Backwardation", spark: [16.8, 17.1, 17.0, 17.4, 17.8, 18.0, 17.6, 18.2, 18.4] },
  gex: {
    total: -2.8, unit: "B",
    callWall: 5850, putWall: 5790, hvl: 5815, zeroGamma: 5830, volTrigger: 5825,
    ratio: 0.38,
  },
  nodes: [
    { level: 5850, type: "Call Wall", strength: "HIGH", fresh: true },
    { level: 5830, type: "Zero Gamma", strength: "MED", fresh: true },
    { level: 5825, type: "Vol Trigger", strength: "HIGH", fresh: true },
    { level: 5815, type: "HVL", strength: "HIGH", fresh: true },
    { level: 5800, type: "Node Cluster", strength: "MED", fresh: false },
    { level: 5790, type: "Put Wall", strength: "HIGH", fresh: true },
  ],
  catalysts: [
    { time: "Tomorrow 8:30 AM", event: "CPI Release", impact: "HIGH", icon: "🔴" },
    { time: "Wed 2:00 PM", event: "FOMC Minutes", impact: "HIGH", icon: "🔴" },
    { time: "Thu 8:30 AM", event: "Jobless Claims", impact: "MED", icon: "🟡" },
    { time: "Fri 10:00 AM", event: "Consumer Sentiment", impact: "LOW", icon: "🟢" },
  ],
  flow: [
    { time: "2:21 PM", type: "SWEEP", symbol: "TSLA", strike: "345C", size: "500x", premium: "$190K", side: "BUY", sentiment: "BULL" },
    { time: "2:15 PM", type: "BLOCK", symbol: "SPX", strike: "5850C", size: "2000x", premium: "$1.2M", side: "SELL", sentiment: "BEAR" },
    { time: "2:10 PM", type: "DARK", symbol: "SPX", strike: "—", size: "$2.1B", premium: "—", side: "BUY", sentiment: "NEUTRAL" },
    { time: "1:58 PM", type: "SWEEP", symbol: "QQQ", strike: "495P", size: "800x", premium: "$320K", side: "BUY", sentiment: "BEAR" },
    { time: "1:45 PM", type: "BLOCK", symbol: "SPY", strike: "582C", size: "3000x", premium: "$420K", side: "BUY", sentiment: "BULL" },
  ],
  forecast: {
    bias: "BEARISH LEAN",
    confidence: 62,
    range: { low: 5790, high: 5845 },
    notes: "Negative gamma + CPI tomorrow = elevated vol risk. Favor puts or sit out. Below 5815 HVL opens 5790 put wall test.",
  },
};

const AGENTS = [
  { id: 1, name: "Gamma Scanner", icon: "📡", status: "running", ping: "1s", cpu: 34, mem: 220, tasks: 1, lastAction: "GEX levels refreshed" },
  { id: 2, name: "Risk Monitor", icon: "🛡", status: "running", ping: "0s", cpu: 12, mem: 85, tasks: 3, lastAction: "Trade count: 5/6 — warning issued" },
  { id: 3, name: "Flow Analyzer", icon: "🌊", status: "running", ping: "2s", cpu: 48, mem: 310, tasks: 2, lastAction: "TSLA 345C sweep detected" },
  { id: 4, name: "Alert Dispatch", icon: "🔔", status: "running", ping: "0s", cpu: 8, mem: 45, tasks: 5, lastAction: "Telegram: TSLA breaking 342" },
  { id: 5, name: "Backtest Engine", icon: "⚙️", status: "idle", ping: "4m", cpu: 0, mem: 12, tasks: 0, lastAction: "GK setups queued for EOD" },
  { id: 6, name: "Journal Parser", icon: "📓", status: "idle", ping: "12m", cpu: 0, mem: 8, tasks: 0, lastAction: "Awaiting EOD sync" },
];

const SCHEDULE = [
  { time: "06:00", label: "Pre-market briefing", agent: "Gamma Scanner", done: true },
  { time: "06:30", label: "GEX + VIX term pull", agent: "Gamma Scanner", done: true },
  { time: "09:30", label: "Opening bell flow scan", agent: "Flow Analyzer", done: true },
  { time: "12:00", label: "Midday risk + regime check", agent: "Risk Monitor", done: true },
  { time: "13:15", label: "0DTE decay cliff warning", agent: "Risk Monitor", active: true },
  { time: "16:00", label: "EOD journal sync", agent: "Journal Parser", done: false },
  { time: "16:30", label: "Daily P&L + compliance report", agent: "Risk Monitor", done: false },
  { time: "18:00", label: "Backtest: Gatekeeper setups", agent: "Backtest Engine", done: false },
];

const MEMORY = [
  { name: "heatseeker_nodes_04_06.csv", type: "live", size: "23 KB", mod: "2:15 PM", preview: "level,type,freshness\n5845,call_wall,fresh\n5830,zero_gamma,fresh\n5815,hvl,fresh\n5790,put_wall,fresh\n5800,node_cluster,stale" },
  { name: "trading_rules_v3.md", type: "rules", size: "4.2 KB", mod: "Apr 5", preview: "## Core Rules\n- Max 6 trades/day\n- Stop after -$800 daily loss\n- No trades past 12:30 PM Fridays\n- Min 2:1 R:R\n- No averaging into losers past 2x" },
  { name: "gatekeeper_setups.md", type: "strategy", size: "12 KB", mod: "Apr 4", preview: "## Gatekeeper\nFresh node resistance + rejection candle\nEntry: break of rejection low\nTarget: next node\nStop: above node + 2pts" },
  { name: "q1_performance.json", type: "data", size: "89 KB", mod: "Apr 1", preview: '{"pnl":14280,"winRate":0.62,"profitFactor":1.87,"avgWin":485,"avgLoss":-312,"trades":248}' },
  { name: "tax_1256_strategy.md", type: "ref", size: "8.4 KB", mod: "Mar 28", preview: "## 1256 Treatment\nSPXW: 60/40 LT/ST federal\nCA non-conforming: all ordinary\nEstimated savings vs SPY: ~$3,200/yr on $50K gains" },
  { name: "schwab_tokens.enc", type: "config", size: "1.1 KB", mod: "Today", preview: "[ENCRYPTED] OAuth2 tokens" },
];

const LOGS = [
  { t: "2:22", lvl: "trade", agent: "Flow", msg: "TSLA 345C sweep 500x @ $3.80 — unusual activity flag" },
  { t: "2:20", lvl: "warn", agent: "Risk", msg: "Trade #5 today — 1 remaining before hard limit" },
  { t: "2:15", lvl: "info", agent: "Gamma", msg: "SPX call wall shifted 5845→5850. Dealer repositioning detected." },
  { t: "2:10", lvl: "info", agent: "Alert", msg: "Telegram sent: TSLA breaking 342 resistance" },
  { t: "2:05", lvl: "warn", agent: "Risk", msg: "SPX 5820P underwater -22.9%. Trim before decay cliff." },
  { t: "1:58", lvl: "info", agent: "Gamma", msg: "VIX backwardation steepening. Short gamma regime confirmed." },
  { t: "1:45", lvl: "trade", agent: "Flow", msg: "Dark pool: SPX $2.1B notional at 5822 — support building" },
  { t: "1:30", lvl: "info", agent: "Gamma", msg: "0DTE concentration: 58% of SPX volume. Gamma impact elevated." },
];

// ════════════════════════════════════════
// TAB COMPONENTS
// ════════════════════════════════════════

function CommandTab() {
  const M = MARKET;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "mc-fade 0.25s ease" }}>
      {/* ROW 1: Market Regime + Key Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 10 }}>
        <Card style={{ padding: 14 }}>
          <Label>SPX</Label>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
            <span style={{ fontSize: 20, fontFamily: mono, fontWeight: 700 }}>{M.spx.price}</span>
            <span style={{ fontSize: 12, fontFamily: mono, fontWeight: 600, color: M.spx.change >= 0 ? C.green : C.red }}>{M.spx.change >= 0 ? "+" : ""}{M.spx.change} ({M.spx.pct}%)</span>
          </div>
          <div style={{ marginTop: 6 }}><Spark data={M.spx.spark} color={M.spx.change >= 0 ? C.green : C.red} w={120} h={24} /></div>
        </Card>
        <Card style={{ padding: 14 }}>
          <Label>VIX</Label>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 6 }}>
            <span style={{ fontSize: 20, fontFamily: mono, fontWeight: 700, color: M.vix.value > 20 ? C.red : M.vix.value > 16 ? C.amber : C.green }}>{M.vix.value}</span>
            <span style={{ fontSize: 11, fontFamily: mono, color: C.red }}>+{M.vix.change}</span>
          </div>
          <div style={{ marginTop: 4 }}><Pill color={C.red}>{M.vix.term}</Pill></div>
        </Card>
        <Card style={{ padding: 14 }}>
          <Label>NET GEX</Label>
          <div style={{ fontSize: 20, fontFamily: mono, fontWeight: 700, color: M.gex.total < 0 ? C.red : C.green, marginTop: 6 }}>{M.gex.total}{M.gex.unit}</div>
          <div style={{ marginTop: 4 }}><Pill color={C.textMid}>RATIO {M.gex.ratio}</Pill></div>
        </Card>
        <Card style={{ padding: 14 }}>
          <Label>0DTE VOL %</Label>
          <div style={{ fontSize: 20, fontFamily: mono, fontWeight: 700, color: C.amber, marginTop: 6 }}>58%</div>
          <div style={{ marginTop: 4, fontSize: 10, color: C.textDim }}>of SPX options vol</div>
        </Card>
        <Card style={{ padding: 14 }} glow={C.goldBorder}>
          <Label style={{ color: C.gold }}>FORECAST</Label>
          <div style={{ fontSize: 14, fontFamily: mono, fontWeight: 700, color: M.forecast.bias.includes("BEAR") ? C.red : C.green, marginTop: 6 }}>{M.forecast.bias}</div>
          <div style={{ marginTop: 4 }}>
            <Pill color={C.gold}>{M.forecast.confidence}% CONF</Pill>
            <span style={{ fontSize: 10, fontFamily: mono, color: C.textDim, marginLeft: 6 }}>{M.forecast.range.low}–{M.forecast.range.high}</span>
          </div>
        </Card>
      </div>

      {/* ROW 2: Key Levels + Catalysts + Flow */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1.3fr", gap: 12 }}>
        {/* KEY LEVELS */}
        <Card style={{ padding: 14 }}>
          <Label style={{ marginBottom: 10 }}>KEY LEVELS</Label>
          {M.nodes.map((n, i) => {
            const isAbove = n.level > M.spx.price;
            const dist = ((n.level - M.spx.price) / M.spx.price * 100).toFixed(2);
            const typeColor = n.type.includes("Call") ? C.green : n.type.includes("Put") ? C.red : n.type.includes("HVL") ? C.gold : n.type.includes("Vol") ? C.amber : C.blue;
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 0", borderBottom: i < M.nodes.length - 1 ? `1px solid ${C.borderDim}` : "none", animation: `mc-slide 0.2s ease ${i * 0.03}s both` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 4, height: 4, borderRadius: "50%", background: n.fresh ? C.green : C.textDim, flexShrink: 0 }} />
                  <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 600 }}>{n.level}</span>
                  <Pill color={typeColor}>{n.type}</Pill>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Pill color={n.strength === "HIGH" ? C.gold : C.textDim}>{n.strength}</Pill>
                  <span style={{ fontFamily: mono, fontSize: 10, color: isAbove ? C.green : C.red }}>{isAbove ? "+" : ""}{dist}%</span>
                </div>
              </div>
            );
          })}
          {/* Visual Level Map */}
          <div style={{ marginTop: 10, position: "relative", height: 8, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
            {M.nodes.map((n, i) => {
              const min = M.gex.putWall - 10, max = M.gex.callWall + 10;
              const pct = ((n.level - min) / (max - min)) * 100;
              const col = n.type.includes("Call") ? C.green : n.type.includes("Put") ? C.red : n.type.includes("HVL") ? C.gold : C.blue;
              return <div key={i} style={{ position: "absolute", left: `${pct}%`, top: 0, width: 2, height: "100%", background: col, opacity: 0.7 }} />;
            })}
            {/* Spot marker */}
            <div style={{ position: "absolute", left: `${((M.spx.price - (M.gex.putWall - 10)) / ((M.gex.callWall + 10) - (M.gex.putWall - 10))) * 100}%`, top: -2, width: 6, height: 12, background: C.text, borderRadius: 2, transform: "translateX(-3px)" }} />
          </div>
        </Card>

        {/* CATALYSTS */}
        <Card style={{ padding: 14 }}>
          <Label style={{ marginBottom: 10 }}>UPCOMING CATALYSTS</Label>
          {M.catalysts.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: i < M.catalysts.length - 1 ? `1px solid ${C.borderDim}` : "none", animation: `mc-slide 0.2s ease ${i * 0.04}s both` }}>
              <span style={{ fontSize: 12 }}>{c.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{c.event}</div>
                <div style={{ fontSize: 10, fontFamily: mono, color: C.textDim }}>{c.time}</div>
              </div>
              <Pill color={c.impact === "HIGH" ? C.red : c.impact === "MED" ? C.amber : C.green}>{c.impact}</Pill>
            </div>
          ))}
          <div style={{ marginTop: 10, padding: 10, borderRadius: 6, background: C.bg, border: `1px solid ${C.borderDim}` }}>
            <div style={{ fontSize: 10, fontFamily: mono, color: C.gold, fontWeight: 600, marginBottom: 4 }}>⚠️ REGIME NOTE</div>
            <div style={{ fontSize: 11, color: C.textMid, lineHeight: 1.5 }}>{M.forecast.notes}</div>
          </div>
        </Card>

        {/* OPTIONS FLOW */}
        <Card style={{ padding: 14 }}>
          <Label style={{ marginBottom: 10 }}>LIVE OPTIONS FLOW</Label>
          <div style={{ maxHeight: 260, overflowY: "auto" }}>
            {M.flow.map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: i < M.flow.length - 1 ? `1px solid ${C.borderDim}` : "none", animation: `mc-fade 0.2s ease ${i * 0.04}s both` }}>
                <span style={{ fontFamily: mono, fontSize: 10, color: C.textDim, width: 48, flexShrink: 0 }}>{f.time}</span>
                <Pill color={f.type === "SWEEP" ? C.purple : f.type === "BLOCK" ? C.blue : C.textMid}>{f.type}</Pill>
                <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, minWidth: 40 }}>{f.symbol}</span>
                <span style={{ fontFamily: mono, fontSize: 11, color: C.textMid, flex: 1 }}>{f.strike} {f.size}</span>
                <span style={{ fontFamily: mono, fontSize: 11, color: C.gold }}>{f.premium}</span>
                <Pill color={f.sentiment === "BULL" ? C.green : f.sentiment === "BEAR" ? C.red : C.textDim}>{f.side}</Pill>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* ROW 3: Agent Status Strip + Recent Feed */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {/* Agent Strip */}
        <Card style={{ padding: 14 }}>
          <Label style={{ marginBottom: 10 }}>AGENT FLEET</Label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {AGENTS.map((a, i) => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 9px", borderRadius: 6, background: a.status === "running" ? C.purpleBg : "transparent", border: `1px solid ${a.status === "running" ? C.purpleBorder : C.borderDim}`, animation: `mc-fade 0.2s ease ${i * 0.04}s both` }}>
                <span style={{ fontSize: 13 }}>{a.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{a.name}</div>
                  <div style={{ fontSize: 9, color: C.textDim, fontFamily: mono }}>{a.ping}</div>
                </div>
                <Dot color={a.status === "running" ? C.green : C.textDim} pulse={a.status === "running"} size={6} />
              </div>
            ))}
          </div>
        </Card>

        {/* Live Feed */}
        <Card style={{ padding: 14 }}>
          <Label style={{ marginBottom: 10 }}>AGENT FEED</Label>
          <div style={{ maxHeight: 130, overflowY: "auto" }}>
            {LOGS.slice(0, 5).map((l, i) => <LogRow key={i} l={l} i={i} />)}
          </div>
        </Card>
      </div>
    </div>
  );
}

function AgentsTab() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, animation: "mc-fade 0.25s ease" }}>
      {AGENTS.map((a, i) => (
        <Card key={a.id} style={{ padding: 16, animation: `mc-fade 0.25s ease ${i * 0.05}s both` }} glow={a.status === "running" ? C.purpleBorder : undefined}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <span style={{ fontWeight: 700, fontSize: 14 }}>{a.name}</span>
            </div>
            <Dot color={a.status === "running" ? C.green : C.textDim} pulse={a.status === "running"} size={8} />
          </div>
          <div style={{ display: "flex", gap: 20, marginBottom: 10 }}>
            {[{ l: "STATUS", v: a.status.toUpperCase(), c: a.status === "running" ? C.green : C.textDim }, { l: "CPU", v: `${a.cpu}%`, c: a.cpu > 40 ? C.amber : C.text }, { l: "MEM", v: `${a.mem}MB`, c: C.text }, { l: "TASKS", v: a.tasks, c: C.text }].map((m, j) => (
              <div key={j}>
                <div style={{ fontSize: 9, fontFamily: mono, color: C.textDim, letterSpacing: "0.06em" }}>{m.l}</div>
                <div style={{ fontSize: 13, fontFamily: mono, fontWeight: 600, color: m.c, marginTop: 2 }}>{m.v}</div>
              </div>
            ))}
          </div>
          {/* CPU bar */}
          <div style={{ height: 3, borderRadius: 2, background: C.border, marginBottom: 8 }}>
            <div style={{ height: "100%", borderRadius: 2, width: `${a.cpu}%`, background: a.cpu > 40 ? C.amber : C.green, transition: "width 0.5s" }} />
          </div>
          <div style={{ fontSize: 10, color: C.textDim, fontFamily: mono }}>Last: {a.lastAction}</div>
        </Card>
      ))}
    </div>
  );
}

function ScheduleTab() {
  return (
    <Card style={{ padding: 4, animation: "mc-fade 0.25s ease" }}>
      <div style={{ padding: "12px 16px 8px" }}><Label>TODAY'S SCHEDULE</Label></div>
      {SCHEDULE.map((s, i) => {
        const color = s.active ? C.gold : s.done ? C.green : C.textDim;
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 16px", borderBottom: i < SCHEDULE.length - 1 ? `1px solid ${C.borderDim}` : "none", animation: `mc-slide 0.2s ease ${i * 0.03}s both` }}>
            <span style={{ fontFamily: mono, fontSize: 12, color: C.textDim, width: 48 }}>{s.time}</span>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: color, boxShadow: s.active ? `0 0 10px ${C.gold}50` : "none", flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: 10, color: C.textDim, fontFamily: mono }}>{s.agent}</div>
            </div>
            <Pill color={color}>{s.active ? "RUNNING" : s.done ? "DONE" : "PENDING"}</Pill>
          </div>
        );
      })}
    </Card>
  );
}

function MemoryTab({ sel, setSel }) {
  const typeColor = { live: C.green, rules: C.red, strategy: C.amber, data: C.blue, ref: C.purple, config: C.gold };
  const typeIcon = { live: "📡", rules: "📋", strategy: "🎯", data: "📊", ref: "📖", config: "🔐" };
  return (
    <div style={{ display: "grid", gridTemplateColumns: sel !== null ? "1fr 1fr" : "1fr", gap: 14, animation: "mc-fade 0.25s ease" }}>
      <Card style={{ padding: 4 }}>
        <div style={{ padding: "12px 16px 8px" }}><Label>AGENT MEMORY</Label></div>
        {MEMORY.map((f, i) => (
          <div key={i} onClick={() => setSel(i === sel ? null : i)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 16px", cursor: "pointer", background: i === sel ? C.purpleBg : "transparent", borderBottom: i < MEMORY.length - 1 ? `1px solid ${C.borderDim}` : "none", transition: "background 0.1s", animation: `mc-slide 0.2s ease ${i * 0.03}s both` }}>
            <span style={{ fontSize: 14 }}>{typeIcon[f.type]}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, fontFamily: mono, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
              <div style={{ fontSize: 10, color: C.textDim }}>{f.size} · {f.mod}</div>
            </div>
            <Pill color={typeColor[f.type]}>{f.type}</Pill>
          </div>
        ))}
      </Card>
      {sel !== null && (
        <Card style={{ padding: 16, animation: "mc-fade 0.15s ease" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <Label>PREVIEW</Label>
            <button onClick={() => setSel(null)} style={{ background: "none", border: "none", color: C.textDim, cursor: "pointer", fontSize: 14 }}>✕</button>
          </div>
          <div style={{ fontFamily: mono, fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{MEMORY[sel].name}</div>
          <div style={{ fontSize: 10, color: C.textDim, fontFamily: mono, marginBottom: 14 }}>{MEMORY[sel].size} · {MEMORY[sel].mod}</div>
          <pre style={{ fontFamily: mono, fontSize: 11, color: C.textMid, background: C.bg, borderRadius: 8, padding: 14, whiteSpace: "pre-wrap", wordBreak: "break-word", border: `1px solid ${C.borderDim}`, lineHeight: 1.6, maxHeight: 360, overflowY: "auto" }}>{MEMORY[sel].preview}</pre>
        </Card>
      )}
    </div>
  );
}

function LogsTab() {
  return (
    <Card style={{ padding: 4, animation: "mc-fade 0.25s ease" }}>
      <div style={{ padding: "12px 16px 8px" }}><Label>AGENT LOG STREAM</Label></div>
      {LOGS.map((l, i) => <LogRow key={i} l={l} i={i} />)}
    </Card>
  );
}

function LogRow({ l, i }) {
  const lc = { info: C.blue, warn: C.amber, trade: C.green, error: C.red };
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 16px", borderBottom: `1px solid ${C.borderDim}`, animation: `mc-slide 0.2s ease ${i * 0.025}s both` }}>
      <span style={{ fontFamily: mono, fontSize: 10, color: C.textDim, flexShrink: 0, paddingTop: 2, width: 36 }}>{l.t}</span>
      <span style={{ fontFamily: mono, fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 3, color: lc[l.lvl], background: (lc[l.lvl]) + "12", letterSpacing: "0.05em", textTransform: "uppercase", flexShrink: 0, marginTop: 1 }}>{l.lvl}</span>
      <span style={{ fontFamily: mono, fontSize: 10, color: C.purple, flexShrink: 0, paddingTop: 2, width: 36 }}>{l.agent}</span>
      <span style={{ fontSize: 11.5, color: C.textMid, lineHeight: 1.4, paddingTop: 1 }}>{l.msg}</span>
    </div>
  );
}

// ── MAIN ──
export default function MissionControl() {
  const [tab, setTab] = useState("command");
  const [memSel, setMemSel] = useState(null);
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  const tabs = [
    { k: "command", l: "Command", icon: "◆" },
    { k: "chart", l: "Chart", icon: "◉" },
    { k: "agents", l: "Agents", icon: "◈" },
    { k: "schedule", l: "Schedule", icon: "◇" },
    { k: "memory", l: "Memory", icon: "◻️" },
    { k: "logs", l: "Feed", icon: "▪️" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text, fontFamily: sans }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${C.border}; border-radius: 3px; }
        @keyframes mc-pulse { 0%,100% { opacity:1 } 50% { opacity:.35 } }
        @keyframes mc-fade { from { opacity:0; transform:translateY(5px) } to { opacity:1; transform:translateY(0) } }
        @keyframes mc-slide { from { opacity:0; transform:translateX(-6px) } to { opacity:1; transform:translateX(0) } }
        @keyframes mc-glow { 0%,100% { box-shadow: 0 0 8px ${C.gold}15 } 50% { box-shadow: 0 0 16px ${C.gold}25 } }
      `}</style>

      {/* ── HEADER ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: `1px solid ${C.border}`, background: C.bg1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: 7, background: `linear-gradient(135deg, ${C.gold}25, ${C.gold}08)`, border: `1px solid ${C.goldBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>⚡️</div>
          <div>
            <span style={{ fontWeight: 700, fontSize: 14, letterSpacing: "-0.01em" }}>MISSION CONTROL</span>
            <span style={{ fontSize: 10, color: C.textDim, fontFamily: mono, marginLeft: 8 }}>v2.1</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Regime Badge — HERO element */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 12px", borderRadius: 6, background: MARKET.regimeColor + "12", border: `1px solid ${MARKET.regimeColor}30`, animation: "mc-glow 3s ease-in-out infinite" }}>
            <Dot color={MARKET.regimeColor} pulse size={8} />
            <span style={{ fontSize: 10, fontFamily: mono, fontWeight: 700, color: MARKET.regimeColor, letterSpacing: "0.05em" }}>{MARKET.regime}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 6, background: C.greenBg, border: `1px solid ${C.greenBorder}` }}>
            <Dot color={C.green} pulse size={6} />
            <span style={{ fontSize: 10, fontFamily: mono, color: C.green, fontWeight: 600 }}>LIVE</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 13, fontFamily: mono, fontWeight: 600, color: C.gold }}>{now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</div>
          </div>
        </div>
      </div>

      {/* ── TABS ── */}
      <div style={{ display: "flex", gap: 1, padding: "0 20px", background: C.bg1, borderBottom: `1px solid ${C.border}` }}>
        {tabs.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)} style={{
            display: "flex", alignItems: "center", gap: 5, padding: "9px 14px", fontSize: 11, fontFamily: mono,
            fontWeight: 600, background: "none", border: "none", cursor: "pointer", letterSpacing: "0.04em",
            color: tab === t.k ? C.gold : C.textDim,
            borderBottom: tab === t.k ? `2px solid ${C.gold}` : "2px solid transparent",
          }}>
            <span style={{ fontSize: 8 }}>{t.icon}</span> {t.l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: "16px 20px", maxWidth: 1440, margin: "0 auto" }}>
        {tab === "command" && <CommandTab />}
        {tab === "chart" && <ChartTab />}
        {tab === "agents" && <AgentsTab />}
        {tab === "schedule" && <ScheduleTab />}
        {tab === "memory" && <MemoryTab sel={memSel} setSel={setMemSel} />}
        {tab === "logs" && <LogsTab />}
      </div>
    </div>
  );
}
