// marketing.jsx — Marketing Hub shell + mount
const MNAV = [
{ id: "overview", label: "Overview", icon: "grid" },
{ id: "hermes", label: "Hermes inbox", icon: "inbox" },
{ id: "campaigns", label: "Campaigns", icon: "megaphone" },
{ id: "copy", label: "Copywriting", icon: "pen" },
{ id: "aitools", label: "AI studio", icon: "wand" },
{ id: "workflow", label: "Workflows", icon: "bolt" },
{ id: "wireframe", label: "Planning", icon: "grid" },
{ id: "viral", label: "Viral engine", icon: "share" },
{ id: "brand", label: "Branding", icon: "palette" },
{ id: "ads", label: "Ad builder", icon: "image" },
{ id: "influencers", label: "Influencers", icon: "users" },
{ id: "social", label: "Social", icon: "share" }];


function MHub() {
  const [tab, setTab] = useState("overview");
  const [settings, setSettings] = useState(false);
  const [range, setRange] = useState("30D");
  const [composer, setComposer] = useState(false);
  const [mode, setMode] = useState(() => {try {return localStorage.getItem("lg_mode") || "dark";} catch (e) {return "dark";}});
  useEffect(() => {document.documentElement.classList.toggle("light", mode === "light");try {localStorage.setItem("lg_mode", mode);} catch (e) {}}, [mode]);
  const setRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [sideW, setSideW] = useState(() => {try {return +localStorage.getItem("mhub_sidew") || 236;} catch (e) {return 236;}});
  const wRef = useRef(sideW);wRef.current = sideW;
  const dragRef = useRef(false);
  useEffect(() => {
    const onMove = (e) => {if (!dragRef.current) return;setSideW(Math.min(360, Math.max(190, e.clientX)));};
    const onUp = () => {if (dragRef.current) {dragRef.current = false;document.body.style.userSelect = "";document.body.style.cursor = "";try {localStorage.setItem("mhub_sidew", String(wRef.current));} catch (e) {}}};
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {window.removeEventListener("pointermove", onMove);window.removeEventListener("pointerup", onUp);};
  }, []);
  function startResize(e) {e.preventDefault();dragRef.current = true;document.body.style.userSelect = "none";document.body.style.cursor = "col-resize";}
  useEffect(() => {
    const onDoc = (e) => {if (setRef.current && !setRef.current.contains(e.target)) setSettings(false);};
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, []);
  const go = (t) => {setTab(t);window.scrollTo(0, 0);};
  const cur = MNAV.find((n) => n.id === tab);
  const setGroups = [
  { h: "Workspace", items: [["Team & seats", "users"], ["Brand profile", "palette"], ["Connected channels", "share"], ["API & webhooks", "bolt"]] },
  { h: "Hermes", items: [["Auto-reply rules", "wand"], ["Voice & numbers", "phone"], ["Sending domains", "mail"], ["Compliance & opt-outs", "shield"]] },
  { h: "Account", items: [["Billing & plan", "wallet"], ["Notifications", "bell"], ["Security", "shield"]] }];

  return (
    <div className="dash mhub" style={{ gridTemplateColumns: (collapsed ? 76 : sideW) + "px 1fr" }}>
      <aside className={`dash-side ${collapsed ? "is-collapsed" : ""}`} style={{ backgroundColor: "rgba(255, 255, 255, 0.6)" }}>
        <div className="dash-side-top">
          <a className="dash-brand" href="Lotto Global.html"><img src="plg-logo.png" alt="PLG Lotto" className="brand-logo" style={{ ...(collapsed ? {} : { width: "94px", height: "57px" }), height: "63px", margin: "0px" }} /></a>
          <button className="dash-collapse" onClick={() => setCollapsed((c) => !c)} title={collapsed ? "Expand" : "Collapse"}><Icon name={collapsed ? "chevron" : "chevronL"} size={16} /></button>
        </div>
        {!collapsed && <span className="dash-side-tag" style={{ color: "rgb(70, 20, 125)" }}>Marketing Hub</span>}
        <nav className="dash-nav">
          {MNAV.map((n) =>
          <button key={n.id} className={`dash-nav-i ${tab === n.id ? "on" : ""}`} onClick={() => go(n.id)} title={n.label}>
              <Icon name={n.icon} size={18} /> {!collapsed && n.label}
              {n.id === "hermes" && <span className="nav-badge">3</span>}
            </button>
          )}
        </nav>
        <a className="dash-back" href="Lotto Global.html" style={{ color: "rgb(87, 23, 125)" }} title="Back to app"><Icon name="chevronL" size={15} /> {!collapsed && "Back to app"}</a>
        {!collapsed && <div className="dash-resize" onPointerDown={startResize} title="Drag to resize" />}
      </aside>
      <main className="dash-main">
        <header className="dash-top" style={{ height: "72px", backgroundColor: "rgba(255, 255, 255, 0.8)", width: "978px", borderWidth: "0px 0px 6px" }}>
          <div><h1 className="dash-h1" style={{ color: "rgb(0, 0, 0)" }}>{cur.label}</h1><span className="dash-crumb" style={{ color: "rgb(85, 86, 88)" }}>PLG Lotto · Marketing &amp; growth</span></div>
          <div className="dash-top-r">
            <div className="dash-range">{["7D", "30D", "90D"].map((r) => <button key={r} className={range === r ? "on" : ""} onClick={() => setRange(r)}>{r}</button>)}</div>
            <button className="dash-btn-gold" onClick={() => setComposer(true)}><Icon name="megaphone" size={16} /> New campaign</button>
            <div className="mset-wrap" ref={setRef}>
              <button className={`dash-ava ${settings ? "open" : ""}`} onClick={() => setSettings((s) => !s)} title="Settings">PLG</button>
              {settings &&
              <div className="mset-menu">
                <div className="mset-head"><span className="mset-ava">PLG</span><div className="mset-id"><span className="mset-name">PLG Lotto</span><span className="mset-email">marketing@playlottoglobal.com</span></div></div>
                {setGroups.map((g, gi) =>
                <div className="mset-group" key={gi}>
                    <span className="mset-gh">{g.h}</span>
                    {g.items.map(([l, ic], i) => <button className="mset-item" key={i}><Icon name={ic} size={15} /> {l}</button>)}
                  </div>
                )}
                <div className="mset-group">
                  <span className="mset-gh">Appearance</span>
                  <div className="mset-appearance">
                    <span><Icon name="palette" size={15} /> Theme</span>
                    <div className="mset-seg">
                      <button className={mode === "light" ? "on" : ""} onClick={() => setMode("light")}>Light</button>
                      <button className={mode === "dark" ? "on" : ""} onClick={() => setMode("dark")}>Dark</button>
                    </div>
                  </div>
                </div>
                <div className="mset-foot">
                  <a className="mset-item" href="Lotto Global.html"><Icon name="arrowR" size={15} /> Back to app</a>
                  <button className="mset-item mset-out"><Icon name="user" size={15} /> Sign out</button>
                </div>
              </div>
              }
            </div>
          </div>
        </header>
        <div className="dash-body">
          {tab === "overview" && <MOverview go={go} range={range} />}
          {tab === "hermes" && <Hermes />}
          {tab === "campaigns" && <MCampaigns />}
          {tab === "copy" && <MCopy />}
          {tab === "aitools" && <MAITools />}
          {tab === "workflow" && <MWorkflow />}
          {tab === "wireframe" && <MWireframe />}
          {tab === "viral" && <MViral />}
          {tab === "brand" && <MBrand />}
          {tab === "ads" && <MAds />}
          {tab === "influencers" && <MInfluencers />}
          {tab === "social" && <MSocial />}
        </div>
      </main>
      {composer && <CampaignComposer onClose={() => setComposer(false)} go={go} />}
    </div>);

}

/* ============================ NEW CAMPAIGN COMPOSER ============================ */
function CampaignComposer({ onClose, go }) {
  const CH = M.analytics.CH;
  const [name, setName] = useState("");
  const [channel, setChannel] = useState("email");
  const [objective, setObjective] = useState("Acquisition");
  const [audience, setAudience] = useState(M.audiences[0]);
  const [when, setWhen] = useState("now");
  const [msg, setMsg] = useState("");
  const [stage, setStage] = useState("form");
  const [ref, setRef] = useState("");
  const PROVIDERS = {
    smtp: { name: "Hermes Mail", sub: "Verified sending domains", env: "HERMES_SMTP_KEY", icon: "mail" },
    telnyx: { name: "Telnyx", sub: "SMS & voice delivery API", env: "TELNYX_API_KEY", icon: "chat" },
    eleven: { name: "ElevenLabs", sub: "AI voice synthesis", env: "ELEVENLABS_API_KEY", icon: "phone" },
    social: { name: "Hermes Social", sub: "Connected accounts", env: "SOCIAL_OAUTH", icon: "share" },
    hermes: { name: "Hermes", sub: "Orchestration & opt-outs", env: "HERMES_API_KEY", icon: "inbox" }
  };
  const routeFor = (id) => id === "email" ? ["smtp", "hermes"] : id === "sms" ? ["telnyx", "hermes"] : id === "voice" ? ["eleven", "telnyx", "hermes"] : ["social", "hermes"];
  const route = routeFor(channel);

  const ch = CH.find((c) => c.id === channel);
  const base = ch.baseImp || ch.baseSend;
  const audFactor = { "New players": 1, "Lapsed players": 0.5, "VIPs": 0.12, "Affiliates": 0.2, "Jackpot hunters": 0.7 }[audience] || 1;
  const estReach = Math.round(base * 30 * audFactor); // ~30-day addressable for the channel × segment
  const estPlayers = Math.round(estReach * (ch.baseImp ? ch.clickRate : ch.openRate * ch.clickRate) * ch.conv);
  const estRev = Math.round(estPlayers * ch.arpu);
  const smsLimit = 160,isSms = channel === "sms";
  const valid = name.trim().length > 1 && msg.trim().length > 4;

  function launch() {
    if (!valid) return;
    setRef("CMP-" + Math.random().toString(36).slice(2, 7).toUpperCase());
    setStage(when === "now" ? "sending" : "done");
    if (when === "now") setTimeout(() => setStage("done"), 2000);
  }

  return (
    <div className="cc-overlay" onClick={onClose}>
      <div className="cc-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cc-x" onClick={onClose}><Icon name="close" size={18} /></button>
        {stage === "form" ?
        <>
            <div className="cc-head"><span className="cc-eyebrow"><Icon name="megaphone" size={14} /> New campaign</span><h3>Launch a campaign</h3></div>
            <div className="cc-body">
              <div className="cc-form">
                <label className="cc-field"><span>Campaign name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Friday Mega Rollover" /></label>
                <div className="cc-row2">
                  <label className="cc-field"><span>Channel</span>
                    <div className="cc-chtabs">{CH.map((c) => <button key={c.id} className={channel === c.id ? "on" : ""} onClick={() => setChannel(c.id)}><Icon name={c.icon} size={14} /> {c.name}</button>)}</div>
                  </label>
                </div>
                <div className="cc-row2">
                  <label className="cc-field"><span>Objective</span><select value={objective} onChange={(e) => setObjective(e.target.value)}>{["Acquisition", "Re-engagement", "Jackpot alert", "Win-back", "Affiliate recruit"].map((o) => <option key={o}>{o}</option>)}</select></label>
                  <label className="cc-field"><span>Audience</span><select value={audience} onChange={(e) => setAudience(e.target.value)}>{M.audiences.map((a) => <option key={a}>{a}</option>)}</select></label>
                </div>
                <label className="cc-field"><span>Message {isSms && <em className={msg.length > smsLimit ? "over" : ""}>{msg.length}/{smsLimit}</em>}</span>
                  <textarea rows={isSms ? 2 : 4} value={msg} onChange={(e) => setMsg(e.target.value)} placeholder={isSms ? "PLG: €211M tonight! Play in 2 taps 👉 {LINK} (STOP to opt out)" : "Write your message… use {NAME}, {JP}, {LINK} tokens"} /></label>
                <div className="cc-field"><span>Schedule</span>
                  <div className="cc-seg">
                    <button className={when === "now" ? "on" : ""} onClick={() => setWhen("now")}>Send now</button>
                    <button className={when === "later" ? "on" : ""} onClick={() => setWhen("later")}>Schedule</button>
                  </div>
                  {when === "later" && <input className="cc-dt" type="datetime-local" />}
                </div>
              </div>
              <div className="cc-side">
                <span className="cc-side-h">Projected impact</span>
                <div className="cc-stat"><span>Est. reach</span><strong className="tnum">{M.analytics.fmtK(estReach)}</strong></div>
                <div className="cc-stat"><span>Est. new players</span><strong className="tnum">{M.analytics.fmtK(estPlayers)}</strong></div>
                <div className="cc-stat"><span>Est. revenue</span><strong className="vp-gold tnum">{M.analytics.fmtMoney(estRev)}</strong></div>
                <div className="cc-bar"><span style={{ width: Math.min(100, audFactor * 100) + "%" }} /></div>
                <span className="cc-side-note">Projected from live {ch.name.toLowerCase()} performance × the {audience.toLowerCase()} segment.</span>
                <div className="cc-delivery">
                  <span className="cc-side-h">Delivery route</span>
                  {route.map((k) => {const p = PROVIDERS[k];return (
                    <div className="cc-prov" key={k}><span className="cc-prov-ic"><Icon name={p.icon} size={13} /></span><div className="cc-prov-tx"><strong>{p.name}</strong><em>{p.sub}</em></div><span className="cc-prov-st" title={p.env}><i /> Connected</span></div>);
                })}
                </div>
              </div>
            </div>
            <div className="cc-foot">
              <button className="mk-ghost" onClick={onClose}>Cancel</button>
              <button className="dash-btn-gold" disabled={!valid} style={!valid ? { opacity: 0.5, cursor: "not-allowed" } : {}} onClick={launch}><Icon name="bolt" size={15} /> {when === "now" ? "Launch now" : "Schedule campaign"}</button>
            </div>
          </> :
        stage === "sending" ?
        <div className="cc-sending">
            <div className="cc-send-spin"><Icon name="bolt" size={26} /></div>
            <h3>Routing via {route.map((k) => PROVIDERS[k].name).join(" → ")}</h3>
            <div className="cc-send-steps">
              {route.map((k) => <div className="cc-send-step" key={k}><Icon name="check" size={14} /> Handed to {PROVIDERS[k].name}</div>)}
            </div>
            <p className="cc-side-note">Live API hand-off · {audience} · {M.analytics.fmtK(estReach)} recipients</p>
          </div> :

        <div className="cc-done">
            <div className="cc-done-badge"><Icon name="check" size={30} /></div>
            <h3>{when === "now" ? "Campaign launched 🚀" : "Campaign scheduled 📅"}</h3>
            <p>{name} is {when === "now" ? "now sending" : "scheduled"} to {audience} via {ch.name} — routed through {route.map((k) => PROVIDERS[k].name).join(" → ")}. Ref {ref} · projected {M.analytics.fmtK(estReach)} reached.</p>
            <div className="cc-done-actions">
              <button className="dash-btn-gold" onClick={() => {onClose();go("campaigns");}}>View campaigns</button>
              <button className="mk-ghost" onClick={onClose}>Done</button>
            </div>
          </div>
        }
      </div>
    </div>);
}

ReactDOM.createRoot(document.getElementById("root")).render(<MHub />);