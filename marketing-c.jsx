// marketing-c.jsx — Marketing Hub: AI tools, Workflow canvas, Wireframe canvas, Viral engine
const MC = window.MK;

/* ============================ AI TOOLS (image/video/voice + API) ============================ */
function MAITools() {
  const [tools, setTools] = useState(MC.aiTools);
  const [tab, setTab] = useState("image");
  const [prompt, setPrompt] = useState("PLG Lotto gold jackpot reveal, confetti, premium, cinematic");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  function toggle(kind, id) {setTools((t) => ({ ...t, [kind]: t[kind].map((x) => x.id === id ? { ...x, connected: !x.connected } : x) }));}
  function run() {setBusy(true);setDone(false);setTimeout(() => {setBusy(false);setDone(true);}, 1400);}
  const all = [...MC.aiTools.image, ...MC.aiTools.video, ...MC.aiTools.voice];
  const connected = all.filter((t) => tools[t.kind && ""]).length;
  const connCount = Object.values(tools).flat().filter((t) => t.connected).length;
  const genTools = tab === "voice" ? tools.voice : tools[tab];

  return (
    <>
      <div className="kpi-row three">
        <div className="kpi kpi-gold"><span className="kpi-l">Connected generators</span><span className="kpi-v tnum">{connCount}</span><span className="kpi-d">image · video · voice</span></div>
        <div className="kpi"><span className="kpi-l">Assets generated (30d)</span><span className="kpi-v tnum">2,418</span><span className="kpi-d up">+34% vs last mo</span></div>
        <div className="kpi"><span className="kpi-l">Avg. cost / asset</span><span className="kpi-v tnum">$0.12</span><span className="kpi-d">across providers</span></div>
      </div>

      <div className="dash-card" style={{ marginTop: 18 }}>
        <div className="dc-head"><h3>Generation studio</h3><span className="dc-sub">Hermes can call any connected tool</span></div>
        <div className="ai-studio">
          <div className="ai-controls">
            <div className="ss-tabs" style={{ marginBottom: 16 }}>
              {[["image", "Image"], ["video", "Video"], ["voice", "Voice / Avatar"]].map(([v, l]) => <button key={v} className={tab === v ? "on" : ""} onClick={() => {setTab(v);setDone(false);}}>{l}</button>)}
            </div>
            <label className="mk-field"><span>Model</span>
              <select>{genTools.filter((t) => t.connected).map((t) => <option key={t.id}>{t.name} · {t.vendor}</option>)}</select></label>
            <label className="mk-field"><span>Prompt</span><textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} /></label>
            <button className="dash-btn-gold" style={{ width: "100%", justifyContent: "center" }} onClick={run}><Icon name="wand" size={16} /> {busy ? "Generating…" : "Generate " + tab}</button>
          </div>
          <div className="ai-output">
            <div className={`ai-canvas ${tab}`}>
              {busy ? <div className="ai-spinner"><Icon name="refresh" size={26} /></div> :
              done ? <div className="ai-result">{tab === "video" ? <Icon name="play" size={34} /> : tab === "voice" ? <Icon name="phone" size={34} /> : <Icon name="image" size={34} />}<span>{tab} ready · {prompt.slice(0, 28)}…</span></div> :
              <div className="ai-empty"><Icon name={tab === "video" ? "video" : tab === "voice" ? "phone" : "image"} size={30} /><span>Preview appears here</span></div>}
            </div>
            {done && <div className="ai-out-actions"><button className="mk-ghost"><Icon name="arrowR" size={14} /> Use in ad</button><button className="mk-ghost"><Icon name="inbox" size={14} /> Send via Hermes</button></div>}
          </div>
        </div>
      </div>

      {["image", "video", "voice"].map((kind) =>
      <div className="dash-card" style={{ marginTop: 18 }} key={kind}>
          <div className="dc-head"><h3 style={{ textTransform: "capitalize" }}>{kind} generators</h3></div>
          <div className="tool-grid">
            {tools[kind].map((t) =>
          <div className={`tool-card ${t.connected ? "on" : ""}`} key={t.id}>
                <div className="tool-top"><span className="tool-logo">{t.name[0]}</span><span className={`tool-status ${t.connected ? "on" : ""}`}>{t.connected ? "Connected" : "Off"}</span></div>
                <div className="tool-name">{t.name}</div>
                <div className="tool-vendor">{t.vendor} · {t.kind}</div>
                <div className="tool-api"><Icon name="bolt" size={11} /> <code>{t.env}</code></div>
                <button className={`tool-btn ${t.connected ? "conn" : ""}`} onClick={() => toggle(kind, t.id)}>{t.connected ? "Manage key" : "Connect API"}</button>
              </div>
          )}
          </div>
        </div>
      )}
    </>);

}

/* ============================ WORKFLOW CANVAS ============================ */
/* ============================ WORKFLOW CANVAS (interactive node editor) ============================ */
const WF_PALETTE = [
  { type: "trigger", icon: "bolt", title: "New trigger", sub: "When this happens…" },
  { type: "ai", icon: "wand", title: "AI step", sub: "Generate content" },
  { type: "action", icon: "share", title: "Send", sub: "Pick a channel" },
  { type: "logic", icon: "clock", title: "Wait / branch", sub: "Add a condition" },
];
function MWorkflow() {
  const NW = 190, NH = 66;
  const [nodes, setNodes] = useState(() => MC.workflowNodes.map((n) => ({ ...n })));
  const [edges, setEdges] = useState(() => MC.workflowEdges.map(([from, to]) => ({ from, to })));
  const [sel, setSel] = useState(null);
  const [connectFrom, setConnectFrom] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [runStep, setRunStep] = useState(-1); // -1 idle; index into run order
  const [running, setRunning] = useState(false);
  const drag = useRef(null);
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const runOrder = [...nodes].sort((a, b) => a.x - b.x || a.y - b.y);
  const activeId = running && runStep >= 0 && runStep < runOrder.length ? runOrder[runStep].id : null;
  const doneIds = running ? runOrder.slice(0, runStep).map((n) => n.id) : [];

  useEffect(() => {
    function move(e) { if (!drag.current) return; drag.current.moved = true; const d = drag.current; setNodes((ns) => ns.map((n) => n.id === d.id ? { ...n, x: Math.max(0, d.ox + (e.clientX - d.sx)), y: Math.max(0, d.oy + (e.clientY - d.sy)) } : n)); }
    function up() { drag.current = null; }
    window.addEventListener("pointermove", move); window.addEventListener("pointerup", up);
    return () => { window.removeEventListener("pointermove", move); window.removeEventListener("pointerup", up); };
  }, []);

  function startDrag(e, id) { if (connectFrom) return; const n = byId[id]; drag.current = { id, sx: e.clientX, sy: e.clientY, ox: n.x, oy: n.y, moved: false }; setSel(id); }
  function nodeClick(e, id) { e.stopPropagation(); if (drag.current && drag.current.moved) return; if (connectFrom && connectFrom !== id) { addEdge(connectFrom, id); setConnectFrom(null); } else setSel(id); }
  function addEdge(from, to) { setEdges((es) => es.some((x) => x.from === from && x.to === to) || from === to ? es : [...es, { from, to }]); }
  function addNode(p) { const id = "n" + Date.now(); setNodes((ns) => [...ns, { id, type: p.type, icon: p.icon, title: p.title, sub: p.sub, x: 60 + (ns.length % 4) * 70, y: 60 + (ns.length % 3) * 60 }]); setAddOpen(false); setSel(id); }
  function delNode(id) { setNodes((ns) => ns.filter((n) => n.id !== id)); setEdges((es) => es.filter((e) => e.from !== id && e.to !== id)); setSel(null); }
  function updNode(id, patch) { setNodes((ns) => ns.map((n) => n.id === id ? { ...n, ...patch } : n)); }
  function run() {
    if (running) return; setRunning(true); setRunStep(0); setSel(null);
    let i = 0; const order = [...nodes].sort((a, b) => a.x - b.x || a.y - b.y);
    const tick = () => { i++; if (i <= order.length) { setRunStep(i); setTimeout(tick, 760); } else { setTimeout(() => { setRunning(false); setRunStep(-1); }, 900); } };
    setTimeout(tick, 760);
  }
  const selNode = sel ? byId[sel] : null;

  return (
    <>
      <div className="dc-head" style={{ marginBottom: 14 }}>
        <div><h3 style={{ fontSize: "var(--text-xl)" }}>Automation workflow</h3><span className="dc-sub">Drag to arrange · click a port then a node to connect · Run to simulate</span></div>
        <div style={{ display: "flex", gap: 8, position: "relative" }}>
          <button className="mk-ghost" onClick={() => setAddOpen((o) => !o)}><Icon name="plus" size={14} /> Add node</button>
          {addOpen && <div className="wf-addmenu">{WF_PALETTE.map((p) => <button key={p.type} className={`wf-addopt ${p.type}`} onClick={() => addNode(p)}><span className="wf-node-ic"><Icon name={p.icon} size={14} /></span> {p.title}</button>)}</div>}
          <button className="dash-btn-gold sm" onClick={run} disabled={running}><Icon name={running ? "refresh" : "bolt"} size={15} /> {running ? "Running…" : "Run"}</button>
        </div>
      </div>
      <div className="dash-card wf-canvas">
        <div className="wf-inner" onClick={() => { setSel(null); setConnectFrom(null); }}>
          <svg className="wf-edges">
            {edges.map((e, i) => {
              const na = byId[e.from], nb = byId[e.to]; if (!na || !nb) return null;
              const x1 = na.x + NW, y1 = na.y + NH / 2, x2 = nb.x, y2 = nb.y + NH / 2, mx = (x1 + x2) / 2;
              const live = running && doneIds.includes(e.from);
              return <path key={i} d={`M${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`} className={`wf-edge ${live ? "live" : ""}`} onClick={(ev) => { ev.stopPropagation(); setEdges((es) => es.filter((_, j) => j !== i)); }} />;
            })}
          </svg>
          {nodes.map((n) => {
            const state = n.id === activeId ? "running" : doneIds.includes(n.id) ? "done" : "";
            return (
              <div className={`wf-node ${n.type} ${sel === n.id ? "sel" : ""} ${state} ${connectFrom === n.id ? "connecting" : ""}`} key={n.id}
                style={{ left: n.x, top: n.y, width: NW }}
                onPointerDown={(e) => startDrag(e, n.id)} onClick={(e) => nodeClick(e, n.id)}>
                <span className="wf-port in" />
                <span className="wf-node-ic"><Icon name={n.icon} size={15} /></span>
                <div className="wf-node-tx"><span className="wf-node-title">{n.title}</span><span className="wf-node-sub">{n.sub}</span></div>
                <span className={`wf-tag ${n.type}`}>{n.type}</span>
                <span className="wf-port out" title="Connect" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); setConnectFrom(connectFrom === n.id ? null : n.id); }} />
                {state === "running" && <span className="wf-run-dot" />}
              </div>
            );
          })}
          {connectFrom && <div className="wf-connect-hint">Click a node to connect →</div>}
        </div>
        {selNode && !running && (
          <div className="wf-config" onClick={(e) => e.stopPropagation()}>
            <div className="wf-config-head"><span className={`wf-tag ${selNode.type}`}>{selNode.type}</span><button className="wf-config-x" onClick={() => setSel(null)}><Icon name="close" size={15} /></button></div>
            <label className="wf-cf"><span>Title</span><input value={selNode.title} onChange={(e) => updNode(selNode.id, { title: e.target.value })} /></label>
            <label className="wf-cf"><span>Detail</span><input value={selNode.sub} onChange={(e) => updNode(selNode.id, { sub: e.target.value })} /></label>
            <label className="wf-cf"><span>Type</span><select value={selNode.type} onChange={(e) => updNode(selNode.id, { type: e.target.value })}>{["trigger", "ai", "action", "logic"].map((t) => <option key={t} value={t}>{t}</option>)}</select></label>
            <div className="wf-config-actions">
              <button className="mk-ghost" onClick={() => setConnectFrom(selNode.id)}><Icon name="share" size={13} /> Connect</button>
              <button className="wf-del" onClick={() => delNode(selNode.id)}><Icon name="close" size={13} /> Delete</button>
            </div>
          </div>
        )}
      </div>
      <div className="wf-legend">
        {[["trigger", "Trigger"], ["ai", "AI generation"], ["action", "Send / action"], ["logic", "Logic / wait"]].map(([k, l]) =>
        <span className="wf-leg" key={k}><span className={`wf-leg-dot ${k}`} /> {l}</span>
        )}
        <span className="wf-leg-hint">{nodes.length} nodes · {edges.length} connections</span>
      </div>
    </>);

}

/* ============================ WIREFRAME CANVAS ============================ */
function MWireframe() {
  const [sel, setSel] = useState("w1");
  return (
    <>
      <div className="dc-head" style={{ marginBottom: 14 }}>
        <div><h3 style={{ fontSize: "var(--text-xl)" }}>Planning canvas</h3><span className="dc-sub">Low-fi wireframes for the whole growth surface — pages, assets, flows.</span></div>
        <div style={{ display: "flex", gap: 8 }}><button className="mk-ghost"><Icon name="image" size={14} /> Frame</button><button className="mk-ghost"><Icon name="pen" size={14} /> Note</button><button className="dash-btn-gold sm"><Icon name="share" size={15} /> Share board</button></div>
      </div>
      <div className="dash-card wire-canvas">
        <div className="wire-inner">
          {MC.wireframes.map((w) =>
          <div className={`wire-frame ${sel === w.id ? "sel" : ""}`} key={w.id} style={{ left: w.x, top: w.y, width: w.w, height: w.h }} onClick={() => setSel(w.id)}>
              <div className="wire-bar"><span className="wire-kind">{w.kind}</span><span className="wire-dots"><i /><i /><i /></span></div>
              <div className="wire-title">{w.title}</div>
              <div className="wire-blocks">
                {w.blocks.map((b, i) => <div className={`wire-block ${b === "hero" || b === "wheel" || b === "avatar" ? "lg" : ""}`} key={i}>{b}</div>)}
              </div>
            </div>
          )}
          <svg className="wire-links"><path d="M180 140 C 200 140, 200 100, 220 100" className="wire-link" /><path d="M180 360 C 280 360, 280 300, 380 300" className="wire-link" /></svg>
        </div>
      </div>
    </>);

}

/* ============================ VIRAL ENGINE ============================ */
function MViral() {
  const avgK = MC.viralLoops.filter((l) => l.status === "live").reduce((a, l) => a + l.k, 0).toFixed(2);
  return (
    <>
      <div className="kpi-row three">
        <div className="kpi kpi-gold"><span className="kpi-l">Viral coefficient (K)</span><span className="kpi-v tnum">{avgK}</span><span className="kpi-d up">&gt;1.0 = exponential</span></div>
        <div className="kpi"><span className="kpi-l">Invites sent (30d)</span><span className="kpi-v tnum">69.2k</span><span className="kpi-d up">+28%</span></div>
        <div className="kpi"><span className="kpi-l">Viral signups</span><span className="kpi-v tnum">24.8k</span><span className="kpi-d">64% of new players</span></div>
      </div>
      <div className="dash-2col" style={{ marginTop: 18 }}>
        <div className="dash-card" style={{ width: "533px" }}>
          <div className="dc-head"><h3>Growth loops</h3><a className="dc-link" href="Viral Launch.html">Open viral page →</a></div>
          <div className="vloop-list">
            {MC.viralLoops.map((l, i) =>
            <div className="vloop-row" key={i}>
                <div className="vloop-k"><span className="tnum">{l.k}</span><em>K</em></div>
                <div className="vloop-info"><span className="vloop-name">{l.name} <span className={`cstatus ${l.status === "live" ? "live" : "scheduled"}`}>{l.status}</span></span><span className="vloop-desc">{l.desc}</span></div>
                <div className="vloop-stats"><span className="tnum">{l.invites}</span><em>{l.conv} conv</em></div>
              </div>
            )}
          </div>
        </div>
        <div className="dash-card">
          <div className="dc-head"><h3>Experiments</h3></div>
          <div className="vexp-list">
            {MC.viralExperiments.map((e, i) =>
            <div className="vexp-row" key={i}>
                <span className={`vexp-status ${e.status}`} />
                <div className="vexp-info"><span className="vexp-name">{e.name}</span><span className="vexp-metric">{e.metric}</span></div>
                <span className={`vexp-lift ${e.lift.startsWith("-") ? "down" : "up"}`}>{e.lift}</span>
              </div>
            )}
          </div>
          <div className="vexp-foot"><button className="mk-ghost" style={{ width: "100%", justifyContent: "center" }}><Icon name="plus" size={14} /> New experiment</button></div>
        </div>
      </div>
      <div className="dash-card viral-cta" style={{ marginTop: 18 }}>
        <div><h3>Referral program is live</h3><p>Skip-the-line waitlist, share cards, link-in-bio and embed widget are all driving signups. Tune rewards and creative on the viral page.</p></div>
        <a className="dash-btn-gold" href="Viral Launch.html" style={{ textDecoration: "none", flex: "none" }}><Icon name="share" size={16} /> Open viral engine</a>
      </div>
    </>);

}

Object.assign(window, { MAITools, MWorkflow, MWireframe, MViral });