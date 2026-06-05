// dashboard.jsx — Affiliate / MLM commission dashboard (standalone)
// (Icon, Emblem, Ball + React hooks come from components.jsx loaded before this)
const A = window.AFFIL;
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");
const money2 = (n) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/* decorative QR + barcode */
function dseeded(seed) { let s = 0; for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0; return () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; }
function QR({ data, size = 100 }) {
  const n = 21, rnd = dseeded(data || "LG"), cells = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const f = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
    const lx = x >= n - 7 ? x - (n - 7) : x, ly = y >= n - 7 ? y - (n - 7) : y;
    const on = f ? (lx === 0 || lx === 6 || ly === 0 || ly === 6 || (lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4)) : rnd() > 0.5;
    if (on) cells.push(<rect key={x + "-" + y} x={x} y={y} width="1" height="1" />);
  }
  return <svg className="qr" viewBox={`0 0 ${n} ${n}`} width={size} height={size} shapeRendering="crispEdges"><g fill="#0d1320">{cells}</g></svg>;
}

const NAV = [
  { id: "overview", label: "Overview", icon: "grid" },
  { id: "network", label: "Network", icon: "users" },
  { id: "commissions", label: "Commissions", icon: "trophy" },
  { id: "payouts", label: "Payouts", icon: "wallet" },
  { id: "marketing", label: "Marketing", icon: "sparkle" },
];

function Dash() {
  const [tab, setTab] = useState("overview");
  return (
    <div className="dash">
      <aside className="dash-side">
        <a className="dash-brand" href="Lotto Global.html">
          <img src="plg-logo.png" alt="PLG Lotto" className="brand-logo" />
        </a>
        <span className="dash-side-tag">Affiliate Portal</span>
        <nav className="dash-nav">
          {NAV.map((n) => (
            <button key={n.id} className={`dash-nav-i ${tab === n.id ? "on" : ""}`} onClick={() => setTab(n.id)}>
              <Icon name={n.icon} size={18} /> {n.label}
            </button>
          ))}
        </nav>
        <div className="dash-tierbox">
          <span className="dt-tier-l">Current tier</span>
          <span className="dt-tier-v"><Icon name="trophy" size={15} /> {A.affiliate.tier}</span>
          <div className="dt-tier-bar"><span style={{ width: "63%" }} /></div>
          <span className="dt-tier-sub">{money(A.tierVolume)} / {money(20000)} to Platinum</span>
        </div>
        <a className="dash-back" href="Lotto Global.html"><Icon name="chevronL" size={15} /> Back to app</a>
      </aside>

      <main className="dash-main">
        <header className="dash-top">
          <div>
            <h1 className="dash-h1">{NAV.find((n) => n.id === tab).label}</h1>
            <span className="dash-crumb">Affiliate {A.affiliate.id} · Member since {A.affiliate.joined}</span>
          </div>
          <div className="dash-top-r">
            <div className="dash-range">{["7D", "30D", "90D", "All"].map((r, i) => <button key={r} className={i === 1 ? "on" : ""}>{r}</button>)}</div>
            <button className="dash-btn-gold"><Icon name="wallet" size={16} /> Withdraw {money(A.kpi.pending)}</button>
            <div className="dash-user"><span className="dash-ava">{A.affiliate.avatar}</span></div>
          </div>
        </header>

        <div className="dash-body">
          {tab === "overview" && <Overview go={setTab} />}
          {tab === "network" && <Network />}
          {tab === "commissions" && <Commissions />}
          {tab === "payouts" && <Payouts />}
          {tab === "marketing" && <Marketing />}
        </div>
      </main>
    </div>
  );
}

/* ---------------- Overview ---------------- */
function Overview({ go }) {
  const kpis = [
    { l: "Lifetime commission", v: money(A.kpi.lifetime), d: "+12.4% vs last mo", up: true, ic: "trophy", gold: true },
    { l: "This month", v: money(A.kpi.thisMonth), d: "+" + money(42) + " this week", up: true, ic: "sparkle" },
    { l: "Pending payout", v: money(A.kpi.pending), d: "Ready to withdraw", ic: "wallet" },
    { l: "Network size", v: A.kpi.network, d: "across 3 levels", ic: "users" },
    { l: "Active rate", v: Math.round(A.kpi.directRate * 100) + "%", d: "played this month", ic: "flame" },
    { l: "Conversion", v: Math.round(A.kpi.conv * 100) + "%", d: "click → signup", ic: "arrowR" },
  ];
  return (
    <>
      <div className="kpi-row">
        {kpis.map((k, i) => (
          <div className={`kpi ${k.gold ? "kpi-gold" : ""}`} key={i}>
            <span className="kpi-ic"><Icon name={k.ic} size={16} /></span>
            <span className="kpi-l">{k.l}</span>
            <span className="kpi-v tnum">{k.v}</span>
            <span className={`kpi-d ${k.up ? "up" : ""}`}>{k.d}</span>
          </div>
        ))}
      </div>

      <div className="dash-2col">
        <div className="dash-card">
          <div className="dc-head"><h3>Commission earnings</h3><span className="dc-sub">Last 12 weeks</span></div>
          <EarningsChart />
        </div>
        <div className="dash-card">
          <div className="dc-head"><h3>By level</h3></div>
          <LevelBreakdown />
        </div>
      </div>

      <div className="dash-2col b">
        <div className="dash-card">
          <div className="dc-head"><h3>Top earners in your network</h3><button className="dc-link" onClick={() => go("network")}>View all →</button></div>
          <TopEarners />
        </div>
        <div className="dash-card">
          <div className="dc-head"><h3>Live activity</h3><span className="chip chip-live"><span className="dot" /> Live</span></div>
          <ActivityFeed />
        </div>
      </div>
    </>
  );
}

function EarningsChart() {
  const w = A.weeks;
  const max = Math.max(...w.map((x) => x.commission));
  const maxS = Math.max(...w.map((x) => x.signups));
  const W = 620, H = 200, pad = 28, bw = (W - pad * 2) / w.length;
  const pts = w.map((x, i) => [pad + bw * i + bw / 2, H - pad - (x.signups / maxS) * (H - pad * 2)]);
  const line = pts.map((p, i) => (i === 0 ? "M" : "L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" preserveAspectRatio="none">
        {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1={pad} x2={W - pad} y1={H - pad - g * (H - pad * 2)} y2={H - pad - g * (H - pad * 2)} className="grid-l" />)}
        {w.map((x, i) => {
          const h = (x.commission / max) * (H - pad * 2);
          return <rect key={i} x={pad + bw * i + bw * 0.22} y={H - pad - h} width={bw * 0.56} height={h} rx="3" fill="rgba(40,184,131,0.6)" />;
        })}
        <path d={line} fill="none" stroke="var(--gold)" strokeWidth="2" />
        {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="3" fill="var(--gold)" stroke="var(--bg)" strokeWidth="1.5" />)}
      </svg>
      <div className="chart-x">{w.map((x, i) => <span key={i}>{i % 2 === 0 ? x.label : ""}</span>)}</div>
      <div className="chart-legend"><span className="lg-bar">Commission</span><span className="lg-line">New signups</span></div>
    </div>
  );
}

function LevelBreakdown() {
  const total = A.byLevel.reduce((a, l) => a + l.commission, 0);
  const colors = ["var(--primary)", "var(--gold)", "#2fb7ff"];
  return (
    <div className="lvl-break">
      {A.byLevel.map((l, i) => (
        <div className="lb-row" key={l.lvl}>
          <div className="lb-top"><span className="lb-name"><span className="lb-dot" style={{ background: colors[i] }} /> Level {l.lvl} · {l.rate}%</span><span className="lb-amt tnum">{money(l.commission)}</span></div>
          <div className="lb-bar"><span style={{ width: (l.commission / total) * 100 + "%", background: colors[i] }} /></div>
          <div className="lb-meta">{l.members} members · {money(l.volume)} volume</div>
        </div>
      ))}
      <div className="lb-total"><span>Total commission</span><span className="text-gold tnum">{money(total)}</span></div>
    </div>
  );
}

function TopEarners() {
  return (
    <div className="te-list">
      {A.members.slice(0, 6).map((m, i) => (
        <div className="te-row" key={m.id}>
          <span className="te-rank">{i + 1}</span>
          <span className="te-av" style={{ background: `hsl(${LOTTO.GAMES[i % 6].tint})` }}>{m.name[0]}</span>
          <div className="te-info"><span className="te-name">{m.name} <span className={`lvl-pill l${m.level}`}>L{m.level}</span></span><span className="te-sub">{m.country} · {m.referrals} referrals</span></div>
          <span className="te-amt text-gold tnum">{money2(m.commission)}</span>
        </div>
      ))}
    </div>
  );
}

function ActivityFeed() {
  return (
    <div className="af-list">
      {A.activity.map((a, i) => (
        <div className="af-row" key={i}>
          <span className={`af-dot l${a.level}`} />
          <div className="af-info"><span className="af-name">{a.name} <span className={`lvl-pill l${a.level}`}>L{a.level}</span></span><span className="af-act">played {a.game} · {a.when}</span></div>
          <span className="af-amt text-gold tnum">+{money2(a.amount)}</span>
        </div>
      ))}
    </div>
  );
}

/* ---------------- Network ---------------- */
function Network() {
  const [lvl, setLvl] = useState(0);
  const [q, setQ] = useState("");
  const filtered = A.members.filter((m) => (lvl === 0 || m.level === lvl) && m.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="dash-card">
        <div className="dc-head"><h3>Network tree</h3><span className="dc-sub">{A.kpi.network} members · 3 levels deep</span></div>
        <NetworkTree />
      </div>
      <div className="dash-card" style={{ marginTop: 18 }}>
        <div className="dc-head wrap">
          <h3>Downline</h3>
          <div className="dl-controls">
            <div className="dl-tabs">
              {[{ v: 0, l: "All" }, { v: 1, l: "Level 1" }, { v: 2, l: "Level 2" }, { v: 3, l: "Level 3" }].map((t) => (
                <button key={t.v} className={lvl === t.v ? "on" : ""} onClick={() => setLvl(t.v)}>{t.l}</button>
              ))}
            </div>
            <input className="dl-search" placeholder="Search member…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>
        <div className="dl-table-wrap">
          <table className="dl-table">
            <thead><tr><th>Member</th><th>Level</th><th>Country</th><th>Joined</th><th>Status</th><th className="num">Volume</th><th className="num">Refs</th><th className="num">Your cut</th></tr></thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td><div className="dl-member"><span className="dl-av" style={{ background: `hsl(${LOTTO.GAMES[(m.name.charCodeAt(0)) % 6].tint})` }}>{m.name[0]}</span>{m.name}</div></td>
                  <td><span className={`lvl-pill l${m.level}`}>L{m.level}</span></td>
                  <td className="muted">{m.country}</td>
                  <td className="muted">{m.joinedDays}d ago</td>
                  <td><span className={`dl-status ${m.status}`}>{m.status === "active" ? "Active" : "Dormant"}</span></td>
                  <td className="num tnum">{money(m.volume)}</td>
                  <td className="num tnum">{m.referrals}</td>
                  <td className="num tnum text-gold">{money2(m.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="dl-empty">No members match.</div>}
        </div>
      </div>
    </>
  );
}

function NetworkTree() {
  const l1 = A.members.filter((m) => m.level === 1).slice(0, 6);
  return (
    <div className="tree">
      <div className="tree-root"><span className="tree-you">AO</span><span className="tree-lbl">You</span></div>
      <div className="tree-line-v" />
      <div className="tree-row">
        {l1.map((m, i) => (
          <div className="tree-node" key={m.id}>
            <span className="tn-av l1">{m.name[0]}</span>
            <span className="tn-name">{m.name.split(" ")[0]}</span>
            <span className="tn-sub">{m.referrals} refs</span>
            {m.referrals > 0 && <div className="tn-children"><span className="tnc l2" />{m.referrals > 3 && <span className="tnc l3" />}<span className="tnc-count">+{m.referrals}</span></div>}
          </div>
        ))}
        <div className="tree-more">+{A.counts[1] - 6} more L1<br /><span>{A.counts[2] + A.counts[3]} deeper</span></div>
      </div>
    </div>
  );
}

/* ---------------- Commissions ---------------- */
function Commissions() {
  return (
    <>
      <div className="dash-2col">
        <div className="dash-card"><div className="dc-head"><h3>Commission structure</h3></div>
          <div className="comm-tiers">
            {A.byLevel.map((l, i) => (
              <div className="comm-tier" key={l.lvl} style={{ "--tc": ["var(--primary)", "var(--gold)", "#2fb7ff"][i] }}>
                <span className="ct-rate">{l.rate}%</span>
                <span className="ct-lvl">Level {l.lvl}</span>
                <span className="ct-desc">{l.members} members · {money(l.volume)} vol</span>
                <span className="ct-earn text-gold tnum">{money(l.commission)} earned</span>
              </div>
            ))}
          </div>
        </div>
        <div className="dash-card"><div className="dc-head"><h3>Tier progression</h3></div><TierLadder /></div>
      </div>
      <div className="dash-card" style={{ marginTop: 18 }}>
        <div className="dc-head"><h3>Earnings trend</h3><span className="dc-sub">Weekly commission</span></div>
        <EarningsChart />
      </div>
    </>
  );
}

function TierLadder() {
  const cur = "Gold";
  return (
    <div className="ladder">
      {A.tiers.map((t, i) => {
        const reached = A.tierVolume >= t.min;
        const isCur = t.name === cur;
        return (
          <div className={`ladder-row ${reached ? "reached" : ""} ${isCur ? "cur" : ""}`} key={t.name}>
            <span className="ld-dot">{reached ? <Icon name="check" size={12} /> : i + 1}</span>
            <div className="ld-info"><span className="ld-name">{t.name} {isCur && <span className="ld-badge">You</span>}</span><span className="ld-perks">{t.perks}</span></div>
            <div className="ld-r"><span className="ld-rate">{t.rate}</span><span className="ld-min">{t.min === 0 ? "Start" : money(t.min) + "+"}</span></div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Payouts ---------------- */
function Payouts() {
  return (
    <>
      <div className="kpi-row three">
        <div className="kpi kpi-gold"><span className="kpi-l">Available to withdraw</span><span className="kpi-v tnum">{money(A.kpi.pending)}</span><span className="kpi-d">commission balance</span></div>
        <div className="kpi"><span className="kpi-l">Withdrawn lifetime</span><span className="kpi-v tnum">{money(438)}</span><span className="kpi-d">across 3 payouts</span></div>
        <div className="kpi"><span className="kpi-l">Next auto-payout</span><span className="kpi-v">1 Jul</span><span className="kpi-d">when balance &gt; $50</span></div>
      </div>
      <div className="dash-card" style={{ marginTop: 18 }}>
        <div className="dc-head"><h3>Payout history</h3><button className="dash-btn-gold sm"><Icon name="wallet" size={15} /> Request payout</button></div>
        <div className="dl-table-wrap">
          <table className="dl-table">
            <thead><tr><th>Reference</th><th>Method</th><th>Date</th><th>Status</th><th className="num">Amount</th></tr></thead>
            <tbody>
              {A.payouts.map((p) => (
                <tr key={p.ref}>
                  <td className="mono">{p.ref}</td>
                  <td>{p.method}</td>
                  <td className="muted">{p.date}</td>
                  <td><span className={`po-status ${p.status}`}>{p.status === "pending" ? "Pending" : "Completed"}</span></td>
                  <td className="num tnum">{money2(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ---------------- Marketing ---------------- */
function Marketing() {
  const [copied, setCopied] = useState("");
  const links = [
    { l: "Homepage", url: "lottoglobal.app/r/" + A.affiliate.code },
    { l: "EuroMillions", url: "lottoglobal.app/r/" + A.affiliate.code + "?g=euro" },
    { l: "Sign-up bonus", url: "lottoglobal.app/r/" + A.affiliate.code + "?b=welcome" },
  ];
  function cp(u) { try { navigator.clipboard.writeText(u); } catch (e) {} setCopied(u); setTimeout(() => setCopied(""), 1400); }
  return (
    <>
      <div className="dash-2col">
        <div className="dash-card"><div className="dc-head"><h3>Your referral links</h3></div>
          <div className="mk-links">
            {links.map((x) => (
              <div className="mk-link" key={x.l}>
                <div className="mk-link-info"><span className="mk-link-l">{x.l}</span><span className="mk-link-u">{x.url}</span></div>
                <button className={`mk-copy ${copied === x.url ? "ok" : ""}`} onClick={() => cp(x.url)}>{copied === x.url ? "Copied" : "Copy"}</button>
              </div>
            ))}
          </div>
          <div className="mk-qr-row"><QRBox data={A.affiliate.code} /><div className="mk-qr-txt"><strong>Your QR code</strong><span>Print it, post it, share it. Scans open your sign-up link.</span><button className="dc-link">Download PNG →</button></div></div>
        </div>
        <div className="dash-card"><div className="dc-head"><h3>Leaderboard</h3><span className="dc-sub">This month</span></div>
          <div className="lead-list">
            {A.leaderboard.map((p, i) => (
              <div className={`lead-row ${/you/i.test(p.name) ? "me" : ""}`} key={i}>
                <span className={`lead-rank r${i + 1}`}>{i + 1}</span>
                <div className="lead-info"><span className="lead-name">{p.name}</span><span className="lead-sub">{p.network} in network</span></div>
                <span className="lead-vol tnum">{money(p.vol)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="dash-card" style={{ marginTop: 18 }}>
        <div className="dc-head"><h3>Marketing banners</h3><span className="dc-sub">Ready-to-share creatives</span></div>
        <div className="banner-grid">
          {LOTTO.GAMES.slice(0, 3).map((g) => (
            <div className="banner" key={g.id} style={{ background: `radial-gradient(120% 120% at 80% 0%, hsl(${g.tint}/0.35), var(--bg-card-2))` }}>
              <Emblem id={g.id} size={44} />
              <div className="banner-tx"><span className="banner-jp text-gold tnum">{LOTTO.formatMoney(g.jackpot, g.currency)}</span><span className="banner-cta">Play {g.name} →</span></div>
              <button className="banner-dl"><Icon name="arrowR" size={14} /></button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function QRBox({ data }) { return <QR data={data} size={104} />; }

ReactDOM.createRoot(document.getElementById("root")).render(<Dash />);
