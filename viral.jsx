// viral.jsx — PLG Lotto Viral Launch page. Light mode, fully functional.
// Uses Icon/Emblem from components.jsx and LOTTO from data.js (loaded first).
const { useState, useEffect, useRef } = React;

const LS = "plg_viral";
function loadState() {try {return JSON.parse(localStorage.getItem(LS) || "null");} catch (e) {return null;}}
function saveState(s) {try {localStorage.setItem(LS, JSON.stringify(s));} catch (e) {}}

// Affiliate state — set once a visitor heads to the signup. The popup only
// shows to people who aren't affiliates yet. (Cross-domain note: the affiliate
// account lives on plg.proposals.digital, so this is the best signal we have on
// this static origin — it can't read the app's auth session.)
const AFF_LS = "plg_affiliate";
function isAffiliate() {try {return !!localStorage.getItem(AFF_LS);} catch (e) {return false;}}
function markAffiliate(email) {try {localStorage.setItem(AFF_LS, JSON.stringify({ email: email, at: Date.now() }));} catch (e) {}}
function makeCode(email) {const base = (email || "player").split("@")[0].replace(/[^a-z0-9]/gi, "").toUpperCase().slice(0, 6) || "LUCKY";return base + Math.floor(100 + Math.random() * 900);}
const money = (n) => "$" + Math.round(n).toLocaleString("en-US");

function useToast() {
  const [msg, setMsg] = useState("");
  const show = (m) => {setMsg(m);setTimeout(() => setMsg(""), 2200);};
  const node = msg ? <div className="vtoast">{msg}</div> : null;
  return [show, node];
}

/* ============================ APP ============================ */
function ViralApp() {
  const [state, setState] = useState(() => loadState());
  const [toast, toastNode] = useToast();
  const [showAff, setShowAff] = useState(() => !isAffiliate());   // popup only for non-affiliates
  function join(email) {
    const code = makeCode(email);
    const position = 2000 + Math.floor(Math.random() * 6000);
    const s = { email, code, position, refs: 0, joinedAt: Date.now() };
    setState(s);saveState(s);toast("You're on the list! 🎉");
  }
  function addRef() {
    if (!state) return;
    const s = { ...state, refs: state.refs + 1, position: Math.max(1, state.position - 240 - Math.floor(Math.random() * 200)) };
    setState(s);saveState(s);toast("+1 referral — you jumped the queue!");
  }
  function reset() {setState(null);saveState(null);}
  const link = state ? "playlottoglobal.com/r/" + state.code : "playlottoglobal.com";

  return (
    <div className="vp">
      <Nav state={state} />
      <div className="vp-wrap">
        <Hero state={state} join={join} addRef={addRef} reset={reset} link={link} toast={toast} />
        <Stats />
        <Loops />
        <Leaderboard state={state} link={link} toast={toast} />
        <ShareStudio link={link} toast={toast} />
        <SpinToWin toast={toast} />
        <LinkInBio link={link} toast={toast} />
        <EmbedWidget toast={toast} />
        <FinalCTA state={state} />
      </div>
      <Footer />
      <ShareBar link={link} toast={toast} />
      <AffiliateModal open={showAff} onClose={() => setShowAff(false)} />
      {toastNode}
    </div>);

}

/* ============================ AFFILIATE MODAL ============================ */
// Official affiliate offer. Entering an email routes to the real signup page
// (the SSR app's /auth on plg.proposals.digital), with the email carried over.
const AFFILIATE_SIGNUP = "https://plg.proposals.digital/auth";
function AffiliateModal({ open, onClose }) {
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);
  if (!open) return null;

  function submit(e) {
    e.preventDefault();
    const v = (email || "").trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { return; }
    markAffiliate(v);   // they're joining — don't show the popup again
    window.location.href =
      AFFILIATE_SIGNUP + "?intent=affiliate&email=" + encodeURIComponent(v);
  }

  const tiers = [
    { pct: "10%", lvl: "Commission", sub: "Players you refer" },
    { pct: "5%", lvl: "Level 1 royalty", sub: "Your sub-affiliates" },
    { pct: "2.5%", lvl: "Level 2 royalty", sub: "Two levels deep" }];

  const feats = [
    "Real-time dashboard & network tree",
    "Instant payouts to wallet, bank or crypto",
    "Marketing toolkit: links, QR, banners",
    "Climb tiers for higher rates & perks"];

  return (
    <div className="aff-overlay" onClick={onClose}>
      <div className="aff-modal" role="dialog" aria-modal="true"
        aria-label="Become a Lotto Global affiliate" onClick={(e) => e.stopPropagation()}>
        <button className="aff-close" onClick={onClose} aria-label="Close">
          <Icon name="close" size={18} color="#3949c0" outline="" />
        </button>
        <div className="aff-emblem"><Icon name="trophy" size={28} color="#4f46e5" outline="" /></div>
        <h2 className="aff-title">Become a Lotto Global affiliate</h2>
        <p className="aff-sub">Earn 10% on every player you refer, plus royalties two levels deep. It's free to join and pays out weekly.</p>
        <div className="aff-tiers">
          {tiers.map((t) =>
            <div className="aff-tier" key={t.lvl}>
              <div className="aff-pct">{t.pct}</div>
              <div className="aff-lvl">{t.lvl}</div>
              <div className="aff-tsub">{t.sub}</div>
            </div>
          )}
        </div>
        <ul className="aff-feats">
          {feats.map((f) =>
            <li key={f}><span className="aff-chk"><Icon name="check" size={13} color="#4f46e5" outline="" /></span>{f}</li>
          )}
        </ul>
        <form className="aff-form" onSubmit={submit}>
          <input type="email" inputMode="email" autoComplete="email" placeholder="you@email.com"
            value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button type="submit" className="aff-join">
            Join free <span className="aff-arrow"><Icon name="arrowR" size={15} color="#ffffff" outline="" /></span>
          </button>
        </form>
        <p className="aff-foot">No fees · 18+ · Commission paid on net ticket revenue</p>
      </div>
    </div>);

}

/* ============================ NAV ============================ */
function Nav({ state }) {
  return (
    <nav className="vp-nav">
      <div className="vp-nav-in">
        <img src="plg-logo.png" alt="PLG Lotto" className="vp-logo" style={{ width: "74px", height: "51px" }} />
        <div className="vp-nav-links">
          <a href="#how">How it works</a>
          <a href="#share">Share studio</a>
          <a href="#bio">Link-in-bio</a>
          <a href="Affiliate Dashboard.html">Affiliates</a>
          <a className="vbtn vbtn-gold vbtn-sm" href="Lotto Global.html" style={{ borderRadius: "10px" }}>Open the app</a>
        </div>
      </div>
    </nav>);

}

/* ============================ HERO + WAITLIST ============================ */
function Hero({ state, join, addRef, reset, link, toast }) {
  const game = LOTTO.GAMES[0];
  const [email, setEmail] = useState("");
  const cd = useCountdown(game.nextDrawISO);
  const pad = (x) => String(x).padStart(2, "0");
  function copy() {try {navigator.clipboard.writeText(link);} catch (e) {}toast("Referral link copied!");}
  function share(net) {
    const text = encodeURIComponent("I'm playing the world's biggest lotteries on PLG Lotto — skip the line with my link:");
    const u = encodeURIComponent("https://" + link);
    const urls = { wa: `https://wa.me/?text=${text}%20${u}`, x: `https://twitter.com/intent/tweet?text=${text}&url=${u}`, fb: `https://www.facebook.com/sharer/sharer.php?u=${u}` };
    window.open(urls[net], "_blank");}
  const nextMs = [1, 3, 5, 10];const nextMilestone = nextMs.find((m) => m > (state ? state.refs : 0)) || 10;
  const pct = state ? Math.min(100, state.refs / nextMilestone * 100) : 0;

  return (
    <section className="vhero">
      <div className="vhero-left">
        <span className="veyebrow"><span className="vdot" /> Now live worldwide · {game.cadence}</span>
        <h1 className="vhero-title"><span className="vhero-ul" style={{ fontSize: "44px" }}>The world's biggest jackpots</span> — <span className="vp-text-gold">win your share.</span></h1>
        <p className="vhero-sub">Tonight's {game.name} is {LOTTO.formatMoney(game.jackpot, game.currency)}. Join free, invite friends, and skip the line to your first free line — the more you share, the sooner you play.</p>
        <div className="vhero-cd">
          <span className="vcd-pre"><Icon name="clock" size={14} /> Draw closes in</span>
          <div className="vcd">
            {[["days", cd.d], ["hrs", cd.h], ["min", cd.m], ["sec", cd.s]].map(([l, v]) =>
            <div className="vcd-u" key={l}><span className="vcd-v tnum">{pad(v)}</span><span className="vcd-l">{l}</span></div>
            )}
          </div>
        </div>
      </div>

      <div className="vcard waitlist-card">
        {!state ?
        <>
            <h3 className="wl-h">Get early access — free</h3>
            <p className="wl-sub">Join 38,000+ players on the launch list. No card required.</p>
            <form className="wl-form" onSubmit={(e) => {e.preventDefault();if (/\S+@\S+/.test(email)) join(email);else toast("Enter a valid email");}}>
              <input type="email" placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="vbtn vbtn-gold vbtn-md" type="submit">Join free</button>
            </form>
            <div className="wl-trust">
              <span><Icon name="shield" size={13} /> Licensed &amp; secure</span>
              <span><Icon name="check" size={13} /> 18+ play responsibly</span>
              <span><Icon name="bell" size={13} /> No spam</span>
            </div>
          </> :

        <div className="wl-success">
            <div className="wl-pos-badge"><span className="wl-pos-num tnum" style={{ fontSize: "18px" }}>#{state.position.toLocaleString()}</span><span className="wl-pos-lbl">in line</span></div>
            <h3 className="wl-skip-h">You're in! Now skip the line.</h3>
            <p className="wl-skip-sub">Each friend who joins moves you up — hit milestones to unlock free lines &amp; bonuses.</p>
            <div className="wl-progress">
              <div className="wl-prog-track"><div className="wl-prog-fill" style={{ width: pct + "%" }} /></div>
              <div className="wl-prog-milestones">
                {[["1 ref", "Free line", 1], ["3 refs", "$5 bonus", 3], ["5 refs", "VIP", 5], ["10 refs", "Founder", 10]].map(([a, b, n]) =>
              <div className={`wl-ms ${state.refs >= n ? "hit" : ""}`} key={n}>{state.refs >= n ? "✓ " : ""}{a}<br />{b}</div>
              )}
              </div>
            </div>
            <div className="wl-reflink">
              <div className="wl-reflink-box"><span className="wl-reflink-l">Your link</span><span className="wl-reflink-u">{link}</span></div>
              <button className="vbtn vbtn-gold vbtn-sm" onClick={copy} style={{ height: "36px", width: "91px", padding: "9px 14px", borderRadius: "10px" }}><Icon name="ticket" size={14} /> Copy</button>
            </div>
            <div className="wl-share-row">
              <button className="wl-share-btn wa" onClick={() => share("wa")} style={{ borderRadius: "1px" }}>WhatsApp</button>
              <button className="wl-share-btn x" onClick={() => share("x")} style={{ borderRadius: "10px" }}>Post on X</button>
              <button className="wl-share-btn fb" onClick={() => share("fb")}>Facebook</button>
            </div>
            <p className="wl-refs-made">You've referred <strong>{state.refs}</strong> {state.refs === 1 ? "friend" : "friends"} · {Math.max(0, nextMilestone - state.refs)} more to next reward</p>
            <button className="wl-demo" onClick={addRef}>▶ Simulate a referral (demo)</button>
            <br /><button className="wl-demo" onClick={reset} style={{ marginTop: 4 }}>Reset</button>
          </div>
        }
      </div>
    </section>);

}

/* ============================ STATS ============================ */
function Stats() {
  const stats = [["38,420", "On the launch list"], ["$50M+", "Paid to winners"], ["41", "Countries live"], ["2 taps", "To play any game"]];
  return (
    <div className="vstats">
      {stats.map(([v, l], i) => <div className="vcard vstat" key={i}><div className="vstat-v vp-text-royal">{v}</div><div className="vstat-l">{l}</div></div>)}
    </div>);

}

/* ============================ LOOPS (how it goes viral) ============================ */
function Loops() {
  const loops = [
  { ic: "users", t: "Invite & climb", s: "Share your link — every friend who joins moves you up the line and unlocks free lines and bonuses." },
  { ic: "share", t: "Auto share cards", s: "Turn any win, ticket, or jackpot into a branded story for IG, TikTok, X & WhatsApp — your link baked in." },
  { ic: "trophy", t: "Earn forever", s: "Keep earning commission on everyone you bring in, three levels deep. Your network pays you while you sleep." }];

  return (
    <section className="vsec" id="how">
      <div className="vsec-head"><span className="veyebrow">The growth loop</span><h2>Built to spread</h2><p>Every player becomes a promoter. Three loops compound into exponential reach.</p></div>
      <div className="loop-grid">
        {loops.map((l, i) =>
        <div className="vcard loop-card" key={i}>
            <span className="loop-step-n">{i + 1}</span>
            <span className="loop-ic"><Icon name={l.ic} size={24} /></span>
            <h3>{l.t}</h3><p>{l.s}</p>
          </div>
        )}
      </div>
    </section>);

}

/* ============================ LEADERBOARD ============================ */
function Leaderboard({ state, link, toast }) {
  const base = [
  { name: "Lauren M.", refs: 142, city: "London" },
  { name: "Mike R.", refs: 118, city: "Austin" },
  { name: "Jenna K.", refs: 96, city: "Sydney" },
  { name: "Diego S.", refs: 74, city: "Madrid" },
  { name: "Fatima O.", refs: 61, city: "Lagos" }];

  const you = state ? { name: "You", refs: state.refs, city: "—", you: true } : null;
  let rows = base.slice();
  if (you) {rows.push(you);rows.sort((a, b) => b.refs - a.refs);}
  return (
    <section className="vsec">
      <div className="vsec-head"><span className="veyebrow"><Icon name="trophy" size={13} /> Top inviters</span><h2>Climb the launch leaderboard</h2><p>Top referrers win lifetime VIP status, bonus jackpot entries and founder badges.</p></div>
      <div className="vcard vlead">
        {rows.map((p, i) =>
        <div className={`vlead-row ${p.you ? "you" : ""}`} key={i}>
            <span className={`vlead-rank r${i + 1}`}>{i + 1}</span>
            <span className="vlead-av" style={{ background: "#111111" }}>{p.name[0]}</span>
            <div className="vlead-info"><div className="vlead-name">{p.name}{p.you && " (you)"}</div><div className="vlead-sub">{p.city}</div></div>
            <div className="vlead-refs tnum">{p.refs}<span>invites</span></div>
          </div>
        )}
      </div>
    </section>);

}

Object.assign(window, { ViralApp, useToast, money });