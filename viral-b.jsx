// viral-b.jsx — Viral page part B: share-card canvas, spin, bio, embed, footer + mount.
const { useState, useEffect, useRef } = React;

/* ============================ SHARE STUDIO (canvas → PNG) ============================ */
function ShareStudio({ link, toast }) {
  const canvasRef = useRef(null);
  const [type, setType] = useState("jackpot");
  const [gameId, setGameId] = useState("euromillions");
  const [name, setName] = useState("Alex");
  const game = LOTTO.gameById(gameId);
  const logoRef = useRef(null);
  const [logoReady, setLogoReady] = useState(false);
  useEffect(() => {
    const img = new Image();
    img.onload = () => { logoRef.current = img; setLogoReady(true); };
    img.src = "plg-logo.png";
  }, []);

  function hx(tint) { // hsl string from data tint -> use directly
    return `hsl(${tint})`;
  }
  function draw() {
    const c = canvasRef.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = 540, H = 540; c.width = W; c.height = H;
    // bg gradient (navy → royal)
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#eef2fb");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // glow
    const rg = ctx.createRadialGradient(W * 0.75, H * 0.18, 10, W * 0.75, H * 0.18, 360);
    rg.addColorStop(0, "rgba(245,196,81,0.45)"); rg.addColorStop(1, "rgba(245,196,81,0)");
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    // brand logo (our actual PLG logo)
    ctx.textBaseline = "top";
    const lg = logoRef.current;
    if (lg && lg.complete && lg.naturalWidth) {
      const lw = 122, lh = lw * (lg.naturalHeight / lg.naturalWidth);
      ctx.drawImage(lg, 38, 34, lw, lh);
    } else {
      ctx.fillStyle = "#181860"; ctx.font = "800 26px Outfit, sans-serif";
      ctx.fillText("PLG", 40, 40);
      ctx.fillStyle = "#e0a82e"; ctx.fillText("LOTTO", 40 + ctx.measureText("PLG ").width, 40);
    }
    // emblem circle
    const cx = W / 2, cy = 200, r = 64;
    const eg = ctx.createRadialGradient(cx - 20, cy - 24, 8, cx, cy, r);
    eg.addColorStop(0, "#fffef8"); eg.addColorStop(1, hx(game.tint));
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = eg; ctx.fill();
    ctx.fillStyle = "#11132e"; ctx.textAlign = "center"; ctx.font = "800 15px Outfit, sans-serif";
    const gn = game.name.toUpperCase().split(" ");
    ctx.fillText(gn[0], cx, cy - 16); if (gn[1]) ctx.fillText(gn[1], cx, cy + 4);
    // headline
    ctx.textAlign = "center"; ctx.fillStyle = "#fff";
    let line1, line2, sub;
    if (type === "jackpot") { line1 = "TONIGHT'S JACKPOT"; line2 = LOTTO.formatMoney(game.jackpot, game.currency); sub = "Play in 2 taps — your numbers, your shot."; }
    else if (type === "win") { line1 = name.toUpperCase() + " JUST WON"; line2 = LOTTO.formatMoney(Math.round(game.jackpot * 0.004), game.currency); sub = "Real draws. Instant payouts. You're next."; }
    else { line1 = "I'M PLAYING " + game.name.toUpperCase(); line2 = "ARE YOU IN?"; sub = "Join with my link & skip the line."; }
    ctx.font = "600 22px Inter, sans-serif"; ctx.fillStyle = "rgba(24,24,96,0.6)"; ctx.fillText(line1, cx, 300);
    ctx.font = "800 58px Outfit, sans-serif"; ctx.fillStyle = "#e0a82e"; ctx.fillText(line2, cx, 326);
    ctx.font = "400 17px Inter, sans-serif"; ctx.fillStyle = "#5b6080"; ctx.fillText(sub, cx, 404);
    // ticket link pill
    ctx.fillStyle = "rgba(24,24,96,0.07)"; roundRect(ctx, cx - 200, 446, 400, 52, 26); ctx.fill();
    ctx.fillStyle = "#181860"; ctx.font = "700 18px Outfit, sans-serif"; ctx.fillText(link, cx, 462);
    // fine print
    ctx.fillStyle = "#9aa0b8"; ctx.font = "400 12px Inter, sans-serif"; ctx.fillText("18+ · Play responsibly", cx, 512);
    ctx.textAlign = "left";
  }
  useEffect(() => { if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw); draw(); /* eslint-disable-next-line */ }, [type, gameId, name, logoReady]);

  function download() { const c = canvasRef.current; const a = document.createElement("a"); a.download = `plg-${type}-${gameId}.png`; a.href = c.toDataURL("image/png"); a.click(); toast("Share card downloaded!"); }
  function copyLink() { try { navigator.clipboard.writeText(link); } catch (e) {} toast("Link copied — paste with your card!"); }

  return (
    <section className="vsec" id="share">
      <div className="vsec-head"><span className="veyebrow"><Icon name="image" size={13} /> Share studio</span><h2>Turn every moment into an ad</h2><p>Generate a branded share card for any win, jackpot, or invite — your referral link baked right in. One tap to post.</p></div>
      <div className="share-studio">
        <div className="vcard ss-controls">
          <div className="ss-field"><span>Card type</span>
            <div className="ss-tabs">
              {[["jackpot", "Jackpot"], ["win", "Big win"], ["invite", "Invite"]].map(([v, l]) => <button key={v} className={type === v ? "on" : ""} onClick={() => setType(v)}>{l}</button>)}
            </div>
          </div>
          <div className="ss-field"><span>Game</span>
            <div className="ss-games">{LOTTO.GAMES.map((g) => <button key={g.id} className={gameId === g.id ? "on" : ""} onClick={() => setGameId(g.id)}>{g.name.split(" ")[0]}</button>)}</div>
          </div>
          {type === "win" && <label className="ss-field"><span>Winner name</span><input value={name} onChange={(e) => setName(e.target.value)} /></label>}
          <div className="ss-actions">
            <button className="vbtn vbtn-gold vbtn-md" onClick={download}><Icon name="arrowR" size={15} /> Download PNG</button>
            <button className="vbtn vbtn-ghost vbtn-md" onClick={copyLink}><Icon name="ticket" size={15} /> Copy link</button>
          </div>
        </div>
        <div className="ss-preview">
          <div className="ss-canvas-wrap"><canvas ref={canvasRef} style={{ width: 380, height: 380 }} /></div>
          <p className="vstat-l">1080×1080 · perfect for IG, TikTok &amp; X</p>
        </div>
      </div>
    </section>
  );
}
function roundRect(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

/* ============================ SPIN TO WIN ============================ */
function SpinToWin({ toast }) {
  const prizes = ["Free line", "$5 bonus", "2× entry", "10% off", "Lucky Dip", "VIP day", "$1 credit", "Mystery"];
  const colors = ["#3949c0", "#f5c451", "#46a6ff", "#181860", "#5566e0", "#e0a82e", "#3949c0", "#f5c451"];
  const [rot, setRot] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [email, setEmail] = useState("");
  const [claimed, setClaimed] = useState(false);
  // referral popup
  const [refOpen, setRefOpen] = useState(false);
  const [refMethod, setRefMethod] = useState("email");
  const [refVal, setRefVal] = useState("");
  const [refSent, setRefSent] = useState(false);
  const seg = 360 / prizes.length;
  const grad = prizes.map((p, i) => `${colors[i]} ${i * seg}deg ${(i + 1) * seg}deg`).join(", ");

  function spin() {
    if (spinning) return;
    if (!/\S+@\S+/.test(email)) { toast("Enter your email to spin"); return; }
    setSpinning(true); setResult(null);
    const win = Math.floor(Math.random() * prizes.length);
    const target = 360 * 5 + (360 - (win * seg + seg / 2));
    setRot((r) => r - (r % 360) + target);
    setTimeout(() => { setSpinning(false); setResult(prizes[win]); toast("You won: " + prizes[win] + "! 🎉"); }, 4600);
  }
  function claim() { setClaimed(true); setRefOpen(true); setRefSent(false); toast("Reward claimed!"); }
  function validRef() { return refMethod === "email" ? /\S+@\S+\.\S+/.test(refVal) : refVal.replace(/[^0-9]/g, "").length >= 7; }
  function sendInvite() {
    if (!validRef()) { toast(refMethod === "email" ? "Enter a valid email" : "Enter a valid phone number"); return; }
    setRefSent(true); toast("Invite sent to your friend! 🎉");
  }

  return (
    <section className="vsec">
      <div className="vsec-head"><span className="veyebrow"><Icon name="gift" size={13} /> Welcome wheel</span><h2>Spin for a free reward</h2><p>Drop your email and spin — everyone wins something to start playing with.</p></div>
      <div className="spin-wrap">
        <div className="spin-stage">
          <div className="wheel-box">
            <div className="wheel-pointer" />
            <div className="wheel" style={{ background: `conic-gradient(${grad})`, transform: `rotate(${rot}deg)` }} />
            <div className="wheel-hub"><img src="plg-logo.png" alt="" /></div>
          </div>
        </div>
        <div>
          {!claimed ? (
            <div className="spin-form">
              <h3 style={{ fontSize: "1.4rem" }}>Claim your spin</h3>
              <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: 6 }}>One spin per player. Reward lands in your wallet on signup.</p>
              <input className="wl-form" style={{ display: "block", width: "100%", background: "var(--surface-2)", border: "1px solid var(--border-strong)", borderRadius: 999, padding: "13px 18px", fontFamily: "var(--font-sans)", fontSize: "0.95rem" }} placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              {!result ? (
                <button className="vbtn vbtn-gold vbtn-lg" onClick={spin} disabled={spinning}>{spinning ? "Spinning…" : "Spin the wheel"}</button>
              ) : (
                <>
                  <div className="spin-result"><div className="vstat-l">You won</div><div className="spin-result-prize vp-text-gold">{result}</div></div>
                  <button className="vbtn vbtn-royal vbtn-lg" onClick={claim}>Claim {result} →</button>
                </>
              )}
            </div>
          ) : (
            <div className="spin-form">
              <div className="spin-result"><Icon name="check" size={30} style={{ color: "#2bb673" }} /><h3 style={{ fontSize: "1.3rem", margin: "6px 0" }}>{result} is yours!</h3><p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>We saved it to {email}. Refer a friend and you both get a bonus line.</p></div>
              <button className="vbtn vbtn-gold vbtn-lg" onClick={() => { setRefOpen(true); setRefSent(false); }}><Icon name="users" size={17} /> Refer a friend — double it</button>
              <a className="vbtn vbtn-ghost vbtn-lg" href="Lotto Global.html" style={{ textDecoration: "none" }}>Open the app</a>
            </div>
          )}
        </div>
      </div>

      {refOpen && (
        <div className="vmodal-overlay" onClick={() => setRefOpen(false)}>
          <div className="vmodal" onClick={(e) => e.stopPropagation()}>
            <button className="vmodal-x" onClick={() => setRefOpen(false)}><Icon name="close" size={18} /></button>
            {!refSent ? (
              <>
                <div className="vmodal-badge"><Icon name="gift" size={26} /></div>
                <h3 className="vmodal-h">Invite a friend, double your reward</h3>
                <p className="vmodal-sub">Send one invite — when they join, you both get a free line on the house.</p>
                <div className="vmodal-seg">
                  <button className={refMethod === "email" ? "on" : ""} onClick={() => { setRefMethod("email"); setRefVal(""); }}><Icon name="mail" size={15} /> Email</button>
                  <button className={refMethod === "phone" ? "on" : ""} onClick={() => { setRefMethod("phone"); setRefVal(""); }}><Icon name="phone" size={15} /> Phone</button>
                </div>
                <input className="vmodal-input" type={refMethod === "email" ? "email" : "tel"} inputMode={refMethod === "email" ? "email" : "tel"}
                  placeholder={refMethod === "email" ? "friend@email.com" : "+1 555 000 1234"} value={refVal}
                  onChange={(e) => setRefVal(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") sendInvite(); }} />
                <button className="vbtn vbtn-gold vbtn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={sendInvite}><Icon name="share" size={16} /> Send invite</button>
                <p className="vmodal-fine">We'll send a one-time invite. 18+ · Play responsibly.</p>
              </>
            ) : (
              <div className="vmodal-done">
                <div className="vmodal-badge ok"><Icon name="check" size={28} /></div>
                <h3 className="vmodal-h">Invite sent! 🎉</h3>
                <p className="vmodal-sub">We've sent your invite to <strong>{refVal}</strong>. The moment they join, a bonus line drops into both your wallets.</p>
                <button className="vbtn vbtn-royal vbtn-lg" style={{ width: "100%", justifyContent: "center" }} onClick={() => { setRefVal(""); setRefSent(false); }}>Invite another</button>
                <button className="vbtn vbtn-ghost vbtn-md" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={() => setRefOpen(false)}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

/* ============================ LINK IN BIO (influencer builder) ============================ */
function LinkInBio({ link, toast }) {
  const game = LOTTO.GAMES[0];
  const [handle, setHandle] = useState("luckylauren");
  const [name, setName] = useState("Lauren");
  const [tag, setTag] = useState("Playing the world's biggest jackpots 🌍 Join me 👇");
  const [followers, setFollowers] = useState(250000);
  const myLink = "playlottoglobal.com/@" + (handle.replace(/[^a-z0-9_.]/gi, "").toLowerCase() || "you");

  // earnings estimate (transparent, derived): engaged → join → spend → commission
  const engaged = followers * 0.04, joiners = engaged * 0.08, monthlyRev = joiners * 22, est = Math.round(monthlyRev * 0.08);
  const fmtF = (n) => n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? Math.round(n / 1e3) + "k" : n;

  function copy() { try { navigator.clipboard.writeText(myLink); } catch (e) {} toast("Your link is copied — paste it in your bio!"); }
  function share() {
    if (navigator.share) navigator.share({ title: "Play with me on PLG Lotto", text: tag, url: "https://" + myLink }).catch(() => {});
    else copy();
  }

  return (
    <section className="vsec" id="bio">
      <div className="vsec-head"><span className="veyebrow"><Icon name="users" size={13} /> Creator tool</span><h2>Your money-making link, in 30 seconds</h2><p>Built for influencers: drop in your photo, share one link, and earn on every play from your audience — tracked automatically. No tech, no setup.</p></div>

      <div className="bio-build">
        {/* LEFT: foolproof builder */}
        <div className="bio-panel">
          <div className="bio-step">
            <span className="bio-step-n">1</span>
            <div className="bio-step-body">
              <h4>Make it yours</h4>
              <label className="bio-ctl"><span>@handle</span><div className="bio-handle-in"><i>@</i><input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="yourhandle" /></div></label>
              <label className="bio-ctl"><span>Display name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></label>
              <label className="bio-ctl"><span>Bio line</span><input value={tag} onChange={(e) => setTag(e.target.value)} maxLength={70} placeholder="Say something that converts" /></label>
            </div>
          </div>

          <div className="bio-step">
            <span className="bio-step-n">2</span>
            <div className="bio-step-body">
              <h4>Add your content <em>— this is what sells</em></h4>
              <p className="bio-hint">Drag in your best clips/photos — you celebrating, cashing out, the lifestyle. This is what makes followers tap.</p>
              <div className="bio-media-grid">
                <image-slot id="bio-clip-1" shape="rounded" radius="14" fit="cover" placeholder="Drop a hero clip 💸" style={{ width: "100%", height: "150px", display: "block" }}></image-slot>
                <image-slot id="bio-clip-2" shape="rounded" radius="14" fit="cover" placeholder="A win moment 🎉" style={{ width: "100%", height: "150px", display: "block" }}></image-slot>
              </div>
            </div>
          </div>

          <div className="bio-step">
            <span className="bio-step-n">3</span>
            <div className="bio-step-body">
              <h4>Estimate your payout</h4>
              <div className="bio-earn">
                <div className="bio-earn-row"><span>Your followers</span><strong className="tnum">{fmtF(followers)}</strong></div>
                <input className="bio-slider" type="range" min={1000} max={2000000} step={1000} value={followers} onChange={(e) => setFollowers(+e.target.value)} />
                <div className="bio-earn-out">
                  <div><span className="bio-earn-l">Est. monthly commission</span><span className="bio-earn-v vp-text-gold tnum">${est.toLocaleString()}</span></div>
                  <span className="bio-earn-note">at 8% of audience play · paid weekly to your wallet</span>
                </div>
              </div>
              <div className="bio-cta-row">
                <button className="vbtn vbtn-gold vbtn-lg" onClick={copy}><Icon name="ticket" size={17} /> Copy my link</button>
                <button className="vbtn vbtn-ghost vbtn-lg" onClick={share}><Icon name="share" size={17} /> Share</button>
              </div>
              <div className="bio-link-pill"><span>{myLink}</span><button onClick={copy}>Copy</button></div>
            </div>
          </div>

          <div className="bio-trust">
            {[["wallet", "Paid weekly"], ["shield", "Auto-tracked"], ["bolt", "No setup"], ["users", "Works on every platform"]].map(([ic, t], i) => (
              <span className="bio-trust-i" key={i}><Icon name={ic} size={14} /> {t}</span>
            ))}
          </div>
        </div>

        {/* RIGHT: live, sexy preview */}
        <div className="bio-preview">
          <div className="bio-phone">
            <div className="bio-screen">
              <image-slot id="bio-hero" shape="rounded" radius="20" fit="cover" placeholder="Drop your hero photo/clip" style={{ width: "100%", height: "190px", display: "block", marginBottom: "-44px" }}></image-slot>
              <image-slot id="bio-ava" shape="circle" fit="cover" placeholder="Photo" style={{ width: "84px", height: "84px", display: "block", position: "relative", zIndex: 2, border: "3px solid #fff", borderRadius: "50%", boxShadow: "var(--shadow)" }}></image-slot>
              <div className="bio-handle">@{handle || "you"}</div>
              <div className="bio-tag">{tag}</div>
              <div className="bio-jp"><div className="bio-jp-l">{game.name} tonight</div><div className="bio-jp-v">{LOTTO.formatMoney(game.jackpot, game.currency)}</div></div>
              <div className="bio-links">
                <a className="bio-link primary" href="Lotto Global.html"><Icon name="ticket" size={16} /> Play now — 2 taps <Icon name="arrowR" size={15} /></a>
                <div className="bio-link"><Icon name="gift" size={16} /> Claim your free line <Icon name="chevron" size={15} /></div>
                <div className="bio-link"><Icon name="trophy" size={16} /> Tonight's results <Icon name="chevron" size={15} /></div>
                <div className="bio-link"><Icon name="sparkle" size={16} /> {name || "My"}'s winning tips <Icon name="chevron" size={15} /></div>
              </div>
              <div className="bio-foot-mark"><img src="plg-logo.png" alt="PLG Lotto" /></div>
            </div>
          </div>
          <span className="bio-preview-cap">Live preview · updates as you type</span>
        </div>
      </div>
    </section>
  );
}

/* ============================ EMBED WIDGET ============================ */
function EmbedWidget({ toast }) {
  const games = LOTTO.GAMES.slice(0, 3);
  function copy() { try { navigator.clipboard.writeText('<script src="https://playlottoglobal.com/embed.js" data-ref="YOURCODE"><\/script>'); } catch (e) {} toast("Embed code copied!"); }
  return (
    <section className="vsec">
      <div className="vsec-head"><span className="veyebrow"><Icon name="grid" size={13} /> Embeddable widget</span><h2>Put live jackpots on any site</h2><p>Partners, blogs and news sites paste one line of code to show live jackpots with your referral baked in. Free placement, real traffic.</p></div>
      <div className="embed-demo">
        <div className="embed-code">
          <button className="embed-copy" onClick={copy}>Copy</button>
          <div><span className="tag">&lt;script</span> <span className="attr">src</span>=<span className="str">"https://playlottoglobal.com/embed.js"</span></div>
          <div>&nbsp;&nbsp;<span className="attr">data-ref</span>=<span className="str">"YOURCODE"</span></div>
          <div>&nbsp;&nbsp;<span className="attr">data-theme</span>=<span className="str">"light"</span><span className="tag">&gt;&lt;/script&gt;</span></div>
        </div>
        <div className="widget-preview">
          <div className="widget-top"><img src="plg-logo.png" alt="" style={{ height: 22 }} /><span className="vchip" style={{ background: "rgba(255,255,255,0.12)", color: "#fff", border: "none" }}><span className="vdot" /> Live</span></div>
          <div className="widget-jps">
            {games.map((g) => (
              <div className="widget-jp" key={g.id}><Emblem id={g.id} size={30} /><div className="widget-jp-info"><div className="widget-jp-name">{g.name}</div></div><div className="widget-jp-v tnum">{LOTTO.formatMoney(g.jackpot, g.currency)}</div></div>
            ))}
          </div>
          <button className="widget-cta">Play now →</button>
        </div>
      </div>
    </section>
  );
}

/* ============================ FINAL CTA + FOOTER + SHARE BAR ============================ */
function FinalCTA({ state }) {
  return (
    <section className="vcta">
      <h2>Don't watch someone else win.</h2>
      <p>Join the launch list free and skip the line to your first play.</p>
      <a className="vbtn vbtn-gold vbtn-lg" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} style={{ textDecoration: "none" }}>{state ? "Share & climb the line" : "Get early access"}</a>
    </section>
  );
}
function Footer() {
  return (
    <footer className="vfoot"><div className="vp-wrap vfoot-in">
      <img src="plg-logo.png" alt="PLG Lotto" />
      <p className="vfoot-note">Play responsibly · 18+ · Licensed &amp; regulated. PLG Lotto is a concept demo.</p>
      <a className="vbtn vbtn-ghost vbtn-sm" href="Lotto Global.html">Open the app</a>
    </div></footer>
  );
}
function ShareBar({ link, toast }) {
  function share() {
    if (navigator.share) { navigator.share({ title: "PLG Lotto", text: "Play the world's biggest jackpots — skip the line with my link", url: "https://" + link }).catch(() => {}); }
    else { try { navigator.clipboard.writeText(link); } catch (e) {} toast("Link copied!"); }
  }
  return <div className="share-bar"><p>Share &amp; skip the line →</p><button className="vbtn vbtn-gold vbtn-sm" onClick={share}><Icon name="share" size={14} /> Share link</button></div>;
}

ReactDOM.createRoot(document.getElementById("root")).render(<ViralApp />);
