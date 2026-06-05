// marketing-b.jsx — Marketing Hub sections B (Brand, Ads, Influencers, Social)
const MB = window.MK;

/* ---------------- BRANDING ENGINE ---------------- */
function MBrand() {
  const bk = MB.brandKit;
  const [sliders, setSliders] = useState(bk.toneSliders.map((s) => s.v));
  return (
    <>
      <div className="dash-2col">
        <div className="dash-card">
          <div className="dc-head"><h3>Brand identity</h3><button className="dc-link">Export kit ↓</button></div>
          <div className="brand-logo-box"><img src="plg-logo.png" alt="PLG Lotto" /></div>
          <div className="brand-fonts">
            <div className="bf"><span className="bf-l">Display</span><span className="bf-v" style={{ fontFamily: "var(--font-display)" }}>{bk.fonts.display} 700</span></div>
            <div className="bf"><span className="bf-l">Body</span><span className="bf-v" style={{ fontFamily: "var(--font-sans)" }}>{bk.fonts.body} 400</span></div>
          </div>
        </div>
        <div className="dash-card">
          <div className="dc-head"><h3>Color palette</h3></div>
          <div className="brand-colors">
            {bk.colors.map((c, i) => (
              <div className="bcolor" key={i}><span className="bc-sw" style={{ background: c.hex }} /><span className="bc-name">{c.name}</span><span className="bc-role">{c.role}</span><span className="bc-hex tnum">{c.hex}</span></div>
            ))}
          </div>
        </div>
      </div>
      <div className="dash-2col b">
        <div className="dash-card">
          <div className="dc-head"><h3>Brand voice</h3></div>
          <div className="voice-pillars">{bk.voice.map((v, i) => (<div className="vp" key={i}><span className="vp-n">{i + 1}</span><div><strong>{v.p}</strong><em>{v.s}</em></div></div>))}</div>
        </div>
        <div className="dash-card">
          <div className="dc-head"><h3>Tone</h3><span className="dc-sub">Tune the brand</span></div>
          <div className="tone-sliders">
            {bk.toneSliders.map((s, i) => (
              <div className="tslider" key={i}>
                <div className="ts-labels"><span>{s.l}</span><span>{s.r}</span></div>
                <input type="range" min="0" max="100" value={sliders[i]} onChange={(e) => setSliders((a) => a.map((x, j) => j === i ? +e.target.value : x))} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="dash-card" style={{ marginTop: 18 }}>
        <div className="dc-head"><h3>Asset library</h3><button className="dash-btn-gold sm"><Icon name="plus" size={15} /> Upload</button></div>
        <div className="asset-grid">
          {MB.channels.map((c, i) => <div className="asset" key={i} style={{ background: `radial-gradient(120% 120% at 60% 0%, hsl(${["230 72% 57%", "43 90% 62%", "265 70% 64%", "188 80% 50%"][i]}/0.35), var(--bg-card-2))` }}><Icon name="image" size={22} /><span>{c.name} kit</span></div>)}
          <div className="asset"><Icon name="video" size={22} /><span>Brand sting 5s</span></div>
          <div className="asset"><Icon name="image" size={22} /><span>Logo lockups</span></div>
        </div>
      </div>
    </>
  );
}

/* ---------------- AD BUILDER ---------------- */
function MAds() {
  const [fmt, setFmt] = useState("square");
  const [game, setGame] = useState("euromillions");
  const [headline, setHeadline] = useState("Win €211M tonight");
  const [cta, setCta] = useState("Play in 2 taps");
  const [bg, setBg] = useState(0);
  const f = MB.adFormats.find((x) => x.id === fmt);
  const g = LOTTO.gameById(game);
  const bgs = [["#3949c0", "#181860"], ["#0b1020", "#1a2a6e"], ["#2a1a5e", "#0a3a8a"], ["#1a1a1a", "#3a2a00"]];
  return (
    <div className="ad-builder">
      <div className="dash-card ad-controls">
        <h3 className="dc-h2"><Icon name="image" size={17} /> Creative builder</h3>
        <label className="mk-field"><span>Format</span>
          <div className="fmt-grid">{MB.adFormats.map((x) => <button key={x.id} className={fmt === x.id ? "on" : ""} onClick={() => setFmt(x.id)}>{x.video && <Icon name="video" size={12} />}{x.label}<em>{x.sub}</em></button>)}</div></label>
        <label className="mk-field"><span>Game</span>
          <div className="mk-chips game-chips">{LOTTO.GAMES.map((x) => <button key={x.id} className={game === x.id ? "on" : ""} onClick={() => setGame(x.id)}>{x.name.split(" ")[0]}</button>)}</div></label>
        <label className="mk-field"><span>Headline</span><input value={headline} onChange={(e) => setHeadline(e.target.value)} /></label>
        <label className="mk-field"><span>CTA</span><input value={cta} onChange={(e) => setCta(e.target.value)} /></label>
        <label className="mk-field"><span>Background</span><div className="bg-swatches">{bgs.map((b, i) => <button key={i} className={bg === i ? "on" : ""} style={{ background: `linear-gradient(135deg, ${b[0]}, ${b[1]})` }} onClick={() => setBg(i)} />)}</div></label>
        <div className="ad-export"><button className="dash-btn-gold"><Icon name={f.video ? "video" : "image"} size={15} /> Export {f.video ? "MP4" : "PNG"}</button><button className="mk-ghost">Save draft</button></div>
      </div>
      <div className="ad-preview">
        <div className="ad-stage">
          <div className={`ad-canvas ${f.video ? "is-video" : ""}`} style={{ width: f.w, height: f.h, background: `linear-gradient(150deg, ${bgs[bg][0]}, ${bgs[bg][1]})` }}>
            <div className="ad-glow" style={{ background: `radial-gradient(60% 50% at 70% 20%, hsl(${g.tint}/0.5), transparent 70%)` }} />
            <div className="ad-logo"><img src="plg-logo.png" alt="" /></div>
            <Emblem id={game} size={f.h > 300 ? 84 : 64} />
            <div className="ad-headline">{headline}</div>
            <div className="ad-cta">{cta} <Icon name="arrowR" size={14} /></div>
            <div className="ad-fine">18+ · Play responsibly</div>
            {f.video && <div className="ad-scenes"><span className="on" /><span /><span /><span /></div>}
            {f.video && <div className="ad-playbtn"><Icon name="play" size={20} /></div>}
          </div>
        </div>
        <div className="ad-formats-note">{f.label} · {f.sub}{f.video ? " · auto-captions, music & 4 scenes" : ""}</div>
      </div>
    </div>
  );
}

/* ---------------- INFLUENCER OUTREACH ---------------- */
function MInfluencers() {
  const [people, setPeople] = useState(MB.influencers);
  function move(name, dir) { setPeople((p) => p.map((x) => x.name === name ? { ...x, stage: Math.max(0, Math.min(3, x.stage + dir)) } : x)); }
  return (
    <>
      <div className="infl-head">
        <div className="dc-head"><h3>Influencer pipeline</h3><button className="dash-btn-gold sm"><Icon name="plus" size={15} /> Add creator</button></div>
        <div className="infl-kpis">
          {[["Prospects", people.filter((p) => p.stage === 0).length], ["In talks", people.filter((p) => p.stage > 0 && p.stage < 3).length], ["Live deals", people.filter((p) => p.stage === 3).length], ["Total reach", "5.6M"]].map(([l, v]) => (
            <div className="infl-kpi" key={l}><span className="tnum">{v}</span><em>{l}</em></div>
          ))}
        </div>
      </div>
      <div className="pipeline">
        {MB.stages.map((st, si) => (
          <div className="pipe-col" key={si}>
            <div className="pipe-head"><span>{st}</span><span className="pipe-count">{people.filter((p) => p.stage === si).length}</span></div>
            <div className="pipe-cards">
              {people.filter((p) => p.stage === si).map((p) => (
                <div className="infl-card" key={p.name}>
                  <div className="ic-top"><span className="ic-av" style={{ background: MB.ac(p.i) }}>{p.region}</span><div className="ic-id"><span className="ic-name">{p.name}</span><span className="ic-plat">{p.platform}</span></div></div>
                  <div className="ic-stats"><span><strong className="tnum">{p.followers}</strong> followers</span><span><strong className="tnum">{p.er}</strong> ER</span></div>
                  <div className="ic-actions">
                    <button onClick={() => move(p.name, -1)} disabled={p.stage === 0}><Icon name="chevronL" size={13} /></button>
                    <button className="ic-msg"><Icon name="mail" size={12} /> Outreach</button>
                    <button onClick={() => move(p.name, 1)} disabled={p.stage === 3}><Icon name="chevron" size={13} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/* ---------------- SOCIAL ---------------- */
function MSocial() {
  const [accts, setAccts] = useState(MB.socialAccounts);
  const [post, setPost] = useState("Tonight's EuroMillions is €211M 🌍 Play in 2 taps — link in bio. 18+");
  const [sel, setSel] = useState(["instagram", "tiktok"]);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  function toggle(id) { setAccts((a) => a.map((x) => x.id === id ? { ...x, connected: !x.connected } : x)); }
  function selToggle(id) { setSel((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]); }
  return (
    <>
      <div className="dash-card">
        <div className="dc-head"><h3>Connected accounts</h3></div>
        <div className="social-grid">
          {accts.map((a) => (
            <div className={`social-acct ${a.connected ? "on" : ""}`} key={a.id}>
              <span className={`sa-logo sa-${a.id}`}>{a.glyph}</span>
              <div className="sa-info"><span className="sa-name">{a.name}</span><span className="sa-handle">{a.connected ? a.handle + " · " + a.followers : "Not connected"}</span></div>
              <button className={`sa-btn ${a.connected ? "conn" : ""}`} onClick={() => toggle(a.id)}>{a.connected ? "Connected" : "Connect"}</button>
            </div>
          ))}
        </div>
      </div>
      <div className="dash-2col" style={{ marginTop: 18, gridTemplateColumns: "1fr 1fr" }}>
        <div className="dash-card">
          <div className="dc-head"><h3>Composer</h3></div>
          <div className="composer">
            <div className="comp-accts">{accts.filter((a) => a.connected).map((a) => <button key={a.id} className={`comp-acct ${sel.includes(a.id) ? "on" : ""}`} onClick={() => selToggle(a.id)}><span className={`sa-logo sa-${a.id}`}>{a.glyph}</span></button>)}</div>
            <textarea value={post} onChange={(e) => setPost(e.target.value)} rows={4} />
            <div className="comp-foot">
              <div className="comp-tools"><button title="AI caption"><Icon name="wand" size={14} /></button><button title="Attach"><Icon name="image" size={14} /></button><span className="comp-count">{post.length}/280</span></div>
              <div className="comp-send"><button className="mk-ghost"><Icon name="calendar" size={14} /> Schedule</button><button className="dash-btn-gold sm">Post to {sel.length}</button></div>
            </div>
          </div>
        </div>
        <div className="dash-card">
          <div className="dc-head"><h3>This week</h3><span className="dc-sub">{MB.scheduled.length} scheduled</span></div>
          <div className="sched-week">
            {days.map((d) => {
              const items = MB.scheduled.filter((s) => s.day === d);
              return (<div className="sw-day" key={d}><span className="sw-d">{d}</span><div className="sw-items">{items.length ? items.map((s, i) => (
                <div className={`sw-post ${s.status}`} key={i}><span className={`sa-logo sa-${s.ch}`}>{(MB.socialAccounts.find((a) => a.id === s.ch) || {}).glyph}</span><span className="sw-t">{s.time} · {s.t}</span></div>
              )) : <span className="sw-empty">—</span>}</div></div>);
            })}
          </div>
        </div>
      </div>
      <div className="dash-card" style={{ marginTop: 18 }}>
        <div className="dc-head"><h3>Automation rules</h3><button className="dash-btn-gold sm"><Icon name="plus" size={15} /> New rule</button></div>
        <div className="auto-rules">
          {[["Jackpot > €150M", "Auto-post hype reel to IG + TikTok"], ["New big winner", "Post winner spotlight + story"], ["Draw night −1h", "Go-live reminder across all channels"], ["Mention or DM", "Route to Hermes inbox + auto-reply"]].map(([t, a], i) => (
            <div className="auto-rule" key={i}><span className="ar-trig"><Icon name="bolt" size={13} /> {t}</span><Icon name="arrowR" size={14} /><span className="ar-act">{a}</span><span className="switch on" style={{ marginLeft: "auto" }}><span /></span></div>
          ))}
        </div>
      </div>
    </>
  );
}

Object.assign(window, { MBrand, MAds, MInfluencers, MSocial });
