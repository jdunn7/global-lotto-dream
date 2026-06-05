// marketing-sec.jsx — Marketing Hub sections (export to window)
// React hooks + Icon/Emblem come from components.jsx (loaded first)
const M = window.MK;

/* ---------------- OVERVIEW ---------------- */
function MOverview({ go, range = "30D" }) {
  const nDays = { "7D": 7, "30D": 30, "90D": 90 }[range] || 30;
  const [, setTick] = useState(0);
  const [live, setLive] = useState(true);
  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => { M.analytics.ingest(); setTick((x) => x + 1); }, 2600);
    return () => clearInterval(t);
  }, [live]);
  const data = M.analytics.compute(nDays);
  const kpis = data.kpis, channels = data.channels, wk = data.weeks;
  const max = Math.max(...wk.map((w) => w.reach), 1);
  const maxLeads = Math.max(...wk.map((w) => w.leads), 1);
  const n = wk.length;
  const chartLabel = range === "7D" ? "Last 7 days" : range === "30D" ? "Last 30 days" : "Last 90 days";
  return (
    <>
      <div className="ov-livebar">
        <button className={`live-toggle ${live ? "on" : ""}`} onClick={() => setLive((l) => !l)}>
          <span className="live-dot" /> {live ? "Live" : "Paused"}
        </button>
        <span className="ov-live-note">{live ? "Streaming events in real time · updates every few seconds" : "Stream paused — tap Live to resume"}</span>
      </div>
      <div className="kpi-row">
        {kpis.map((k, i) => (
          <div className={`kpi ${k.gold ? "kpi-gold" : ""} ${live ? "kpi-live" : ""}`} key={i} tabIndex={0}>
            <span className="kpi-ic"><Icon name={k.ic} size={16} /></span>
            <span className="kpi-l">{k.l}</span><span className="kpi-v tnum">{k.v}</span>
            <span className={`kpi-d ${k.up ? "up" : ""}`}>{k.d}</span>
          </div>
        ))}
      </div>
      <div className="dash-2col">
        <div className="dash-card">
          <div className="dc-head"><h3>Reach &amp; leads</h3><span className="dc-sub">{chartLabel} · {live ? "live" : "paused"}</span></div>
          <div className="chart-wrap">
            <svg viewBox="0 0 620 200" className="chart" preserveAspectRatio="none">
              {[0.25, 0.5, 0.75, 1].map((g) => <line key={g} x1="28" x2="592" y1={172 - g * 144} y2={172 - g * 144} className="grid-l" />)}
              {wk.map((w, i) => { const h = (w.reach / max) * 144, bw = 564 / n; return <rect key={i} x={28 + bw * i + bw * 0.22} y={172 - h} width={bw * 0.56} height={h} rx="3" fill="rgba(57,73,192,0.6)" />; })}
              <path d={wk.map((w, i) => { const bw = 564 / n; return (i ? "L" : "M") + (28 + bw * i + bw / 2) + " " + (172 - (w.leads / maxLeads) * 132); }).join(" ")} fill="none" stroke="var(--gold)" strokeWidth="2.5" />
              {wk.map((w, i) => { const bw = 564 / n; return <circle key={i} cx={28 + bw * i + bw / 2} cy={172 - (w.leads / maxLeads) * 132} r="2.5" fill="var(--gold)" />; })}
            </svg>
            <div className="chart-legend"><span className="lg-bar">Reach</span><span className="lg-line">Leads</span></div>
          </div>
        </div>
        <div className="dash-card">
          <div className="dc-head"><h3>Channels</h3></div>
          <div className="chan-list">
            {channels.map((c) => (
              <div className="chan-row" key={c.id}>
                <span className="chan-ic"><Icon name={c.icon} size={16} /></span>
                <div className="chan-info"><span className="chan-name">{c.name}</span><span className="chan-sub">{c.sent} {c.id === "social" ? "impressions" : "sent"}</span></div>
                <div className="chan-r"><span className="chan-rate tnum">{c.rate}</span><span className={`chan-trend ${c.up ? "up" : "down"}`}>{c.trend}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="dash-card" style={{ marginTop: 18 }}>
        <div className="dc-head"><h3>Live campaigns</h3><button className="dc-link" onClick={() => go("campaigns")}>View all →</button></div>
        <div className="dl-table-wrap">
          <table className="dl-table">
            <thead><tr><th>Campaign</th><th>Channel</th><th>Status</th><th className="num">Sent</th><th className="num">Open</th><th className="num">Click</th><th className="num">Revenue</th></tr></thead>
            <tbody>{M.campaigns.slice(0, 5).map((c, i) => (
              <tr key={i}><td className="mono">{c.name}</td><td><span className="chan-pill"><Icon name={chIcon(c.channel)} size={12} /> {c.channel}</span></td>
                <td><span className={`cstatus ${c.status}`}>{c.status}</span></td><td className="num tnum">{c.sent}</td><td className="num tnum">{c.open}</td><td className="num tnum">{c.click}</td><td className="num tnum text-gold">{c.rev}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
    </>
  );
}
function chIcon(c) { return { email: "mail", sms: "chat", voice: "phone", social: "share" }[c] || "mail"; }

/* ---------------- HERMES (unified inbox) ---------------- */
function Hermes() {
  const [filter, setFilter] = useState("all");
  const [convos, setConvos] = useState(M.convos);
  const [sel, setSel] = useState(M.convos[0].id);
  const [draft, setDraft] = useState("");
  const list = convos.filter((c) => filter === "all" || c.channel === filter);
  const active = convos.find((c) => c.id === sel) || list[0];
  function send() {
    if (!draft.trim()) return;
    setConvos((cs) => cs.map((c) => c.id === active.id ? { ...c, messages: [...c.messages, { from: "us", t: draft, time: "now" }], unread: false } : c));
    setDraft("");
  }
  function markRead(id) { setConvos((cs) => cs.map((c) => c.id === id ? { ...c, unread: false } : c)); setSel(id); }
  return (
    <div className="hermes">
      <div className="hermes-list dash-card">
        <div className="hl-head">
          <div className="hl-tabs">
            {[["all", "All"], ["email", "Email"], ["sms", "SMS"], ["voice", "Voice"]].map(([v, l]) => (
              <button key={v} className={filter === v ? "on" : ""} onClick={() => setFilter(v)}>{l}</button>
            ))}
          </div>
        </div>
        <div className="hl-items">
          {list.map((c) => (
            <button key={c.id} className={`hl-item ${c.id === sel ? "on" : ""} ${c.unread ? "unread" : ""}`} onClick={() => markRead(c.id)}>
              <span className="hl-av" style={{ background: M.ac(c.i) }}>{c.name[0] === "+" ? <Icon name={chIcon(c.channel)} size={15} /> : c.name[0]}</span>
              <div className="hl-tx">
                <div className="hl-top"><span className="hl-name">{c.name}</span><span className="hl-time">{c.time}</span></div>
                <div className="hl-sub"><span className={`hl-ch ${c.channel}`}><Icon name={chIcon(c.channel)} size={10} /></span>{c.subject}</div>
              </div>
              {c.unread && <span className="hl-dot" />}
            </button>
          ))}
        </div>
      </div>
      <div className="hermes-thread dash-card">
        {active && <>
          <div className="ht-head">
            <div className="ht-who"><span className="hl-av" style={{ background: M.ac(active.i) }}>{active.name[0] === "+" ? <Icon name={chIcon(active.channel)} size={16} /> : active.name[0]}</span>
              <div><span className="ht-name">{active.name}</span><span className="ht-sub"><span className={`chan-pill ${active.channel}`}><Icon name={chIcon(active.channel)} size={11} /> {active.channel}</span> · {active.subject}</span></div></div>
            <div className="ht-actions"><button className="ht-act" title="Call"><Icon name="phone" size={15} /></button><button className="ht-act" title="Snooze"><Icon name="clock" size={15} /></button><button className="ht-act" title="Close"><Icon name="check" size={15} /></button></div>
          </div>
          <div className="ht-msgs">
            {active.messages.map((m, i) => (
              <div className={`ht-msg ${m.from}`} key={i}>
                {m.voice ? <div className="ht-bubble voice"><Icon name="phone" size={13} /> {m.t}</div>
                  : <div className={`ht-bubble ${m.camp ? "camp" : ""}`}>{m.t}</div>}
                <span className="ht-meta">{m.from === "us" ? (m.auto ? "Hermes auto · " : m.camp ? "Campaign · " : "You · ") : ""}{m.time}</span>
              </div>
            ))}
          </div>
          <div className="ht-composer">
            <div className="ht-comp-tools">
              <button title="Insert AI reply" onClick={() => setDraft("Thanks for reaching out! ")}><Icon name="wand" size={14} /> AI reply</button>
              <span className="ht-chsel">via <strong>{active.channel}</strong></span>
            </div>
            <div className="ht-comp-row">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={`Reply by ${active.channel}…`} />
              <button className="ht-send" onClick={send}><Icon name="arrowR" size={16} /></button>
            </div>
          </div>
        </>}
      </div>
    </div>
  );
}

/* ---------------- CAMPAIGNS + FLOWS ---------------- */
function MCampaigns() {
  return (
    <>
      <div className="dash-card">
        <div className="dc-head"><h3>All campaigns</h3><button className="dash-btn-gold sm"><Icon name="plus" size={15} /> New campaign</button></div>
        <div className="dl-table-wrap">
          <table className="dl-table">
            <thead><tr><th>Campaign</th><th>Channel</th><th>Status</th><th className="num">Sent</th><th className="num">Open</th><th className="num">Click</th><th className="num">Revenue</th></tr></thead>
            <tbody>{M.campaigns.map((c, i) => (
              <tr key={i}><td className="mono">{c.name}</td><td><span className="chan-pill"><Icon name={chIcon(c.channel)} size={12} /> {c.channel}</span></td>
                <td><span className={`cstatus ${c.status}`}>{c.status}</span></td><td className="num tnum">{c.sent}</td><td className="num tnum">{c.open}</td><td className="num tnum">{c.click}</td><td className="num tnum text-gold">{c.rev}</td></tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div className="dc-head" style={{ margin: "24px 0 14px" }}><h3 style={{ fontSize: "var(--text-xl)" }}>Automation flows</h3></div>
      <div className="flow-grid">
        {M.flows.map((f, i) => (
          <div className="flow-card dash-card" key={i}>
            <div className="flow-top"><span className={`flow-status ${f.active ? "on" : "off"}`}>{f.active ? "Active" : "Paused"}</span><span className="flow-enrolled">{f.enrolled} enrolled</span></div>
            <h4 className="flow-name">{f.name}</h4>
            <div className="flow-trigger"><Icon name="bolt" size={13} /> {f.trigger}</div>
            <div className="flow-steps">{f.steps.map((s, j) => <div className="flow-step" key={j}><span className="fs-dot" />{s}</div>)}</div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------- COPYWRITING ENGINE ---------------- */
function MCopy() {
  const [type, setType] = useState("email_subject");
  const [tone, setTone] = useState("Hype");
  const [aud, setAud] = useState("New players");
  const [ctx, setCtx] = useState("EuroMillions €211M Friday rollover");
  const [out, setOut] = useState([]);
  const [busy, setBusy] = useState(false);
  function gen() {
    setBusy(true);
    setTimeout(() => {
      const bank = M.copyBank[type];
      const jp = (ctx.match(/€?\$?([\d.]+M)/i) || [, "211M"])[1];
      const game = (ctx.match(/euro\w+|powerball|mega\s?millions|el gordo|oz lotto|uk lotto/i) || ["EuroMillions"])[0];
      const pool = [...bank].sort(() => Math.random() - 0.5).slice(0, 3);
      setOut(pool.map((s) => s.replace(/\{JP\}/g, jp).replace(/\{GAME\}/g, game).replace(/\{NAME\}/g, "Alex").replace(/\{DAY\}/g, "Friday").replace(/\{LINK\}/g, "lottoglobal.app/r")));
      setBusy(false);
    }, 650);
  }
  useEffect(() => { gen(); /* eslint-disable-next-line */ }, []);
  return (
    <div className="copy-engine">
      <div className="dash-card copy-controls">
        <h3 className="dc-h2"><Icon name="wand" size={17} /> Copy generator</h3>
        <label className="mk-field"><span>Content type</span>
          <select value={type} onChange={(e) => setType(e.target.value)}>{M.copyTypes.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}</select></label>
        <label className="mk-field"><span>Tone</span>
          <div className="mk-chips">{M.tones.map((t) => <button key={t} className={tone === t ? "on" : ""} onClick={() => setTone(t)}>{t}</button>)}</div></label>
        <label className="mk-field"><span>Audience</span>
          <div className="mk-chips">{M.audiences.map((a) => <button key={a} className={aud === a ? "on" : ""} onClick={() => setAud(a)}>{a}</button>)}</div></label>
        <label className="mk-field"><span>Context / offer</span>
          <textarea value={ctx} onChange={(e) => setCtx(e.target.value)} rows={3} /></label>
        <button className="dash-btn-gold copy-gen" onClick={gen}><Icon name="wand" size={16} /> {busy ? "Generating…" : "Generate copy"}</button>
      </div>
      <div className="copy-out">
        <div className="dc-head"><h3>Variations <span className="copy-meta">{tone} · {aud}</span></h3></div>
        {out.map((o, i) => (
          <div className="copy-card dash-card" key={i}>
            <span className="copy-badge">V{i + 1}</span>
            <p className="copy-text">{o}</p>
            <div className="copy-actions"><button onClick={() => { try { navigator.clipboard.writeText(o); } catch (e) {} }}><Icon name="ticket" size={13} /> Copy</button><button><Icon name="check" size={13} /> Use</button><button onClick={gen}><Icon name="refresh" size={13} /> Remix</button></div>
          </div>
        ))}
        {busy && <div className="copy-card dash-card copy-skel"><span /><span /><span /></div>}
      </div>
    </div>
  );
}

Object.assign(window, { MOverview, Hermes, MCampaigns, MCopy, chIcon });
