// components.jsx — shared UI primitives for Lotto Global
const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------------- Icons (inline, lucide-style stroke) ---------------- */
function Icon({ name, size = 20, stroke = 2, style, color = "#ffffff", outline = "#2e1065" }) {
  const P = {
    home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5",
    ticket: "M3 9a2 2 0 0 0 2-2 2 2 0 0 1 4 0h6a2 2 0 0 1 4 0 2 2 0 0 0 2 2v6a2 2 0 0 0-2 2 2 2 0 0 1-4 0H9a2 2 0 0 1-4 0 2 2 0 0 0-2-2z",
    grid: "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z",
    play: "M7 4v16l13-8z",
    trophy: "M7 4h10v4a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 14h6v3H9zM8 21h8M12 17v4",
    clock: "M12 7v5l3 2M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
    dice: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.5 8.5h.01M15.5 8.5h.01M12 12h.01M8.5 15.5h.01M15.5 15.5h.01",
    sparkle: "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z",
    gift: "M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8M3 8h18v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1zM12 8v13M12 8S11 4 8.5 4a2.5 2.5 0 0 0 0 5C11 9 12 8 12 8zM12 8s1-4 3.5-4a2.5 2.5 0 0 1 0 5C13 9 12 8 12 8z",
    check: "M4 12.5l5 5 11-11",
    chevron: "M9 6l6 6-6 6",
    chevronL: "M15 6l-6 6 6 6",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    refresh: "M21 12a9 9 0 1 1-3-6.7M21 4v4h-4",
    bell: "M18 9a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 0 1-3.4 0",
    user: "M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
    wallet: "M3 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v0H5a2 2 0 0 0-2 2zM3 9h16a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM16 13h2",
    globe: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3c2.5 2.5 3.5 6 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-6-3.5-9s1-6.5 3.5-9z",
    flame: "M12 3c2 3 5 4.5 5 8a5 5 0 0 1-10 0c0-1.4.6-2.5 1.4-3.4C9 8.5 9 6.5 12 3zM12 21a3 3 0 0 1-1-5.8c.3 1 .9 1.5 1 2 .2-1 .8-1.7 1.4-2.2A3 3 0 0 1 12 21z",
    shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
    arrowR: "M5 12h14M13 5l7 7-7 7",
    close: "M6 6l12 12M18 6L6 18",
    users: "M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-1a4 4 0 0 0-3-3.9M16 3.1A4 4 0 0 1 16 11",
    mail: "M3 6h18v12H3zM3 7l9 6 9-6",
    chat: "M21 12a8 8 0 0 1-8 8H7l-4 3V12a8 8 0 0 1 8-8h2a8 8 0 0 1 8 8z",
    phone: "M5 3h4l2 5-2.5 1.5a11 11 0 0 0 5 5L17 11l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z",
    share: "M15 8a3 3 0 1 0-2.8-2H12a4 4 0 0 0-4 4v.2A3 3 0 1 0 8 14a4 4 0 0 0 4 4 3 3 0 1 0 3-3 3 3 0 0 0-2.8-1.8M9.5 10.5l5-3M9.5 13l5 3",
    image: "M3 5h18v14H3zM3 16l5-5 4 4 3-3 6 6M8.5 9.5h.01",
    video: "M3 6h12v12H3zM15 9l6-3v12l-6-3z",
    pen: "M14 4l6 6L8 22H2v-6zM12 6l6 6",
    megaphone: "M3 11v2a1 1 0 0 0 1 1h2l9 5V5L6 10H4a1 1 0 0 0-1 1zM18 8a4 4 0 0 1 0 8M15 14h.01",
    calendar: "M3 5h18v16H3zM3 9h18M8 3v4M16 3v4",
    palette: "M12 3a9 9 0 1 0 0 18 2 2 0 0 0 2-2 2 2 0 0 1 2-2h1a4 4 0 0 0 4-4 9 9 0 0 0-9-8zM7.5 11.5h.01M10.5 7.5h.01M15 7.5h.01",
    wand: "M5 19l9-9M14 7l1.5-1.5M14 7l-1.5-1.5M14 7l1.5 1.5M14 7l-1.5 1.5M18 12h.01M20 5h.01M9 4h.01",
    inbox: "M3 13h5l1.5 3h5L21 13M5 5h14l2 8v6H3v-6z",
    bolt: "M13 2L4 14h6l-1 8 9-12h-6z"
  };
  const d = P[name] || P.home;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    strokeLinecap="round" strokeLinejoin="round" style={style} aria-hidden="true">
      {outline && <path d={d} stroke={outline} strokeWidth={stroke + 2} />}
      <path d={d} stroke={color} strokeWidth={stroke} />
    </svg>);

}

/* ---------------- Game emblems (original glossy lottery-orb badges) ---------------- */
const EMBLEMS = {
  euromillions: { l1: "EURO", l2: "MILLIONS", grad: ["#46a6ff", "#1366c8", "#072f6e"], fg: "#ffffff", rim: "#ffd24a" },
  powerball: { l1: "POWER", l2: "BALL", grad: ["#ff6a62", "#d8222a", "#7c0d14"], fg: "#ffffff", rim: "#ffffff" },
  megamillions: { l1: "MEGA", l2: "MILLIONS", grad: ["#356fd6", "#1b3f9e", "#0c2057"], fg: "#ffd24a", rim: "#ffd24a" },
  uklotto: { l1: "UK", l2: "LOTTO", grad: ["#8a64ff", "#5a2fe0", "#33168f"], fg: "#ffffff", rim: "#9fe6ff" },
  elgordo: { l1: "EL", l2: "GORDO", grad: ["#ffb52e", "#f5811f", "#b8410b"], fg: "#ffffff", rim: "#ffffff" },
  ozlotto: { l1: "OZ", l2: "LOTTO", grad: ["#2bc9da", "#0a96b0", "#055163"], fg: "#ffffff", rim: "#ffd24a" }
};

function Emblem({ id, size = 64 }) {
  const e = EMBLEMS[id] || EMBLEMS.euromillions;
  const r = Math.max(1, size * 0.028);
  return (
    <span className="emblem" style={{ width: size, height: size, fontSize: Math.max(5.5, size * 0.2) }}>
      <span
        className="emblem-orb"
        style={{
          background: `radial-gradient(125% 125% at 34% 24%, ${e.grad[0]}, ${e.grad[1]} 56%, ${e.grad[2]})`,
          boxShadow: `inset 0 0 0 ${r}px ${e.rim}77, inset 0 ${-size * 0.09}px ${size * 0.16}px rgba(0,0,0,.5), inset 0 ${size * 0.05}px ${size * 0.1}px rgba(255,255,255,.4), 0 ${size * 0.09}px ${size * 0.18}px -${size * 0.07}px rgba(0,0,0,.65)`
        }}>
        
        <span className="emblem-sheen" />
        <span className="emblem-text" style={{ color: e.fg }}>
          <span className="el1">{e.l1}</span>
          <span className="el2">{e.l2}</span>
        </span>
      </span>
    </span>);

}

/* ---------------- Button ---------------- */
function Btn({ children, variant = "primary", size = "md", className = "", icon, iconRight, ...rest }) {
  return (
    <button className={`btn btn-${variant} btn-${size} ${className}`} {...rest}>
      {icon && <Icon name={icon} size={size === "lg" ? 19 : 16} />}
      {children}
      {iconRight && <Icon name={iconRight} size={size === "lg" ? 19 : 16} />}
    </button>);

}

/* ---------------- Lottery Ball ---------------- */
function Ball({ n, kind = "main", size = 46, idle = false, picked = false, style }) {
  // kind: main | bonus | blank
  return (
    <span
      className={`ball ball-${kind} ${picked ? "ball-picked" : ""}`}
      style={{ width: size, height: size, fontSize: size * 0.42, ...(idle ? { animation: "floatY 4s ease-in-out infinite" } : {}), ...style }}>
      
      <span className="ball-sheen" />
      <span className="ball-num">{n}</span>
    </span>);

}

/* ---------------- Countdown ---------------- */
function useCountdown(targetISO) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(targetISO).getTime() - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor(diff % 86400000 / 3600000);
  const m = Math.floor(diff % 3600000 / 60000);
  const s = Math.floor(diff % 60000 / 1000);
  return { d, h, m, s, done: diff === 0 };
}

function Countdown({ targetISO, compact = false }) {
  const { d, h, m, s } = useCountdown(targetISO);
  const pad = (x) => String(x).padStart(2, "0");
  const units = [
  { v: d, l: "days" },
  { v: h, l: "hrs" },
  { v: m, l: "min" },
  { v: s, l: "sec" }];

  return (
    <div className={`countdown ${compact ? "countdown-compact" : ""}`}>
      {units.map((u, i) =>
      <React.Fragment key={u.l}>
          <div className="cd-unit">
            <span className="cd-val tnum">{pad(u.v)}</span>
            <span className="cd-lbl">{u.l}</span>
          </div>
          {i < units.length - 1 && <span className="cd-sep">:</span>}
        </React.Fragment>
      )}
    </div>);

}

/* ---------------- Animated count-up money ---------------- */
function CountMoney({ value, currency, className }) {
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    const from = prev.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    const dur = 900;
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setShown(Math.round(from + (to - from) * eased));
      if (p < 1) raf = requestAnimationFrame(tick);else
      prev.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={`tnum ${className || ""}`}>{LOTTO.formatFull(shown, currency)}</span>;
}

/* ---------------- Jackpot ticker (marquee) ---------------- */
function JackpotTicker() {
  const items = LOTTO.GAMES.map((g) => `${g.name} · ${LOTTO.formatMoney(g.jackpot, g.currency)}`);
  const line = items.join("      ✦      ");
  return (
    <div className="ticker glass">
      <span className="ticker-tag"><Icon name="flame" size={14} /> LIVE JACKPOTS</span>
      <div className="ticker-track">
        <div className="ticker-move">{line}&nbsp;&nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;&nbsp;{line}</div>
      </div>
    </div>);

}

/* ---------------- Confetti burst ---------------- */
function Confetti({ run }) {
  const pieces = useMemo(
    () =>
    Array.from({ length: 90 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      dur: 2.4 + Math.random() * 1.8,
      size: 6 + Math.random() * 8,
      color: ["var(--gold)", "var(--primary)", "var(--gold-soft)", "#fff", "var(--primary-soft)"][i % 5],
      rot: Math.random() * 360
    })),
    []
  );
  if (!run) return null;
  return (
    <div className="confetti-layer">
      {pieces.map((p) =>
      <span
        key={p.id}
        style={{
          left: p.left + "%",
          width: p.size,
          height: p.size * 0.6,
          background: p.color,
          transform: `rotate(${p.rot}deg)`,
          animation: `confettiFall ${p.dur}s linear ${p.delay}s forwards`
        }} />

      )}
    </div>);

}

Object.assign(window, { Icon, Emblem, EMBLEMS, Btn, Ball, Countdown, useCountdown, CountMoney, JackpotTicker, Confetti });