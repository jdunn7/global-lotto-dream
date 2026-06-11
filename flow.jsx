// flow.jsx — Auth, Checkout, Confirmation, Account screens

/* ============================ AUTH (real — bridged to plg Better Auth) ============================ */
// Derive a friendly display name from an email local-part, e.g. "todd.poindexter@x.com" → "Todd Poindexter".
function nameFromEmail(email) {
  const local = ((email || "").split("@")[0] || "").replace(/[._+-]+/g, " ").trim();
  if (!local) return "";
  return local.split(" ").filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

const ERR_STYLE = { background: "#fdecec", color: "#b3261e", border: "1px solid #f3c0bd", borderRadius: 10, padding: "9px 13px", fontSize: ".84rem", lineHeight: 1.4, margin: "2px 0 14px" };

function Auth({ onAuth, go }) {
  const [mode, setMode] = useState("signup"); // signup | login
  const [form, setForm] = useState({ name: "", email: "", pass: "" });
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  // phone-OTP sub-flow
  const [pmode, setPmode] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const valid = form.email.includes("@") && form.pass.length >= 8 && (mode === "login" || form.name.trim());

  function finish(profile, fallbackEmail) {
    const email = (profile && profile.email) || fallbackEmail || "";
    onAuth({ name: (profile && profile.name) || nameFromEmail(email) || "Player", email });
  }

  async function submit(e) {
    e && e.preventDefault();
    setTouched(true); setErr("");
    if (!valid) return;
    const email = form.email.trim().toLowerCase();
    setBusy(true);
    try {
      const r = mode === "signup"
        ? await PLG_API.auth.signup({ name: form.name.trim(), email, password: form.pass })
        : await PLG_API.auth.login({ email, password: form.pass });
      finish(r.profile, email);
    } catch (e2) {
      setErr(e2.message || "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  }

  function google() {
    setErr("");
    PLG_API.auth.loginGoogle(window.location.origin + window.location.pathname)
      .catch((e) => setErr(e.message || "Google sign-in failed."));
  }

  async function sendOtp() {
    setErr("");
    const p = phone.trim();
    if (p.replace(/[^0-9]/g, "").length < 7) { setErr("Enter your number with country code, e.g. +1 555 123 4567."); return; }
    setBusy(true);
    try { await PLG_API.auth.sendPhoneOtp(p); setOtpSent(true); }
    catch (e) { setErr(e.message || "Couldn't send the code. Check the number and try again."); }
    finally { setBusy(false); }
  }
  async function verifyOtp() {
    setErr(""); setBusy(true);
    try {
      const r = await PLG_API.auth.verifyPhoneOtp({ phoneNumber: phone.trim(), code: code.trim() });
      finish(r.profile, "");
    } catch (e) { setErr(e.message || "That code didn't match. Request a new one and try again."); }
    finally { setBusy(false); }
  }

  return (
    <div className="auth-screen">
      <div className="auth-aside">
        <button className="brand" onClick={() => go("home")}>
          <img src="plg-logo.png" alt="PLG Lotto" className="brand-logo" />
        </button>
        <div className="auth-aside-mid">
          <h1 className="auth-h1">The world's biggest jackpots,<br /><span className="text-gold">one account.</span></h1>
          <p className="auth-lead">Play EuroMillions, Powerball, Mega Millions and more from anywhere. Every ticket checked automatically — winnings paid straight to your wallet.</p>
          <div className="auth-emblems">
            {LOTTO.GAMES.map((g) => <Emblem key={g.id} id={g.id} size={46} />)}
          </div>
          <div className="auth-stats">
            <div><span className="as-v tnum">12.4M</span><span className="as-l">players</span></div>
            <div><span className="as-v tnum">$50M+</span><span className="as-l">paid out</span></div>
            <div><span className="as-v tnum">41</span><span className="as-l">countries</span></div>
          </div>
        </div>
        <div className="auth-aside-foot">Licensed &amp; regulated · 18+ · Play responsibly</div>
      </div>

      <div className="auth-main">
        <div className="auth-card">
          <div className="auth-tabs">
            <button className={mode === "signup" ? "on" : ""} onClick={() => { setMode("signup"); setErr(""); }}>Sign up</button>
            <button className={mode === "login" ? "on" : ""} onClick={() => { setMode("login"); setErr(""); }}>Log in</button>
            <span className="auth-tab-thumb" style={{ transform: mode === "login" ? "translateX(100%)" : "none" }} />
          </div>

          {!pmode ? (
            <React.Fragment>
              <h2 className="auth-title">{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
              <p className="auth-sub">{mode === "signup" ? "Join in under a minute. No fees to sign up." : "Log in to play and check your tickets."}</p>

              {err && <div style={ERR_STYLE}>{err}</div>}

              <div className="auth-social">
                <button type="button" className="auth-soc" onClick={google} disabled={busy}>
                  <span className="soc-g">G</span> Continue with Google
                </button>
                <button type="button" className="auth-soc" onClick={() => { setPmode(true); setErr(""); }} disabled={busy}>
                  <span className="soc-g" style={{ fontSize: 15 }}>☎</span> Continue with phone
                </button>
              </div>
              <div className="auth-divider"><span>or with email</span></div>

              <form className="auth-form" onSubmit={submit}>
                {mode === "signup" && (
                  <label className="field">
                    <span>Full name</span>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
                    {touched && !form.name.trim() && <em className="field-err">Enter your name</em>}
                  </label>
                )}
                <label className="field">
                  <span>Email</span>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@email.com" />
                  {touched && !form.email.includes("@") && <em className="field-err">Enter a valid email</em>}
                </label>
                <label className="field">
                  <span>Password</span>
                  <input type="password" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} placeholder="At least 8 characters" />
                  {touched && form.pass.length < 8 && <em className="field-err">Min. 8 characters</em>}
                </label>
                <Btn variant="gold" size="lg" className="auth-submit" type="submit" iconRight="arrowR" disabled={busy}>
                  {busy ? "Please wait…" : (mode === "signup" ? "Create account" : "Log in")}
                </Btn>
              </form>
            </React.Fragment>
          ) : (
            <React.Fragment>
              <h2 className="auth-title">Continue with phone</h2>
              <p className="auth-sub">{otpSent ? "Enter the 6-digit code we texted you." : "We'll text you a one-time code. Include your country code."}</p>

              {err && <div style={ERR_STYLE}>{err}</div>}

              {!otpSent ? (
                <div className="auth-form">
                  <label className="field">
                    <span>Phone number</span>
                    <input type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 123 4567" />
                  </label>
                  <Btn variant="gold" size="lg" className="auth-submit" onClick={sendOtp} iconRight="arrowR" disabled={busy}>
                    {busy ? "Sending…" : "Send code"}
                  </Btn>
                </div>
              ) : (
                <div className="auth-form">
                  <label className="field">
                    <span>Verification code</span>
                    <input type="text" inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="123456" />
                  </label>
                  <Btn variant="gold" size="lg" className="auth-submit" onClick={verifyOtp} iconRight="arrowR" disabled={busy}>
                    {busy ? "Verifying…" : "Verify & continue"}
                  </Btn>
                  <button type="button" className="auth-guest" onClick={() => { setOtpSent(false); setCode(""); setErr(""); }}>Use a different number</button>
                </div>
              )}
              <button type="button" className="auth-guest" onClick={() => { setPmode(false); setOtpSent(false); setErr(""); }}>← Back to email</button>
            </React.Fragment>
          )}

          <div className="auth-badges"><SecurityBadges payments={false} /></div>
        </div>
      </div>
    </div>
  );
}

/* ============================ CHECKOUT ============================ */
// Real money flow: flat $6.50 per line for the next draw, paid from the wallet
// (debited server-side by plg). No draw-plans/promo — plg has flat pricing.
const TICKET_PRICE = 6.5;

function Checkout({ go, slip, setSlip, user }) {
  const game = LOTTO.gameById(slip.gameId);
  const lines = slip.lines;
  const total = lines.length * TICKET_PRICE;
  const walletBal = user.wallet;
  const insufficient = total > walletBal;
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function confirm() {
    setErr("");
    if (insufficient) { setErr("Not enough in your wallet. Top up to play."); return; }
    setBusy(true);
    try {
      // plg debits the wallet, mints the ticket(s) and credits the affiliate.
      await PLG_API.tickets.buyTicket({ gameId: game.id, lines });
      setSlip({ ...slip, plan: 1, total, paidWith: "wallet" });
      go("confirmation", game.id);
    } catch (e) {
      setErr(String(e.message).includes("insufficient")
        ? "Not enough in your wallet. Top up to play."
        : (e.message || "Couldn't complete the purchase. Please try again."));
      setBusy(false);
    }
  }

  return (
    <div className="screen checkout">
      <div className="container checkout-head">
        <button className="back-btn" onClick={() => go("picker", game.id)}><Icon name="chevronL" size={18} /> Back to numbers</button>
        <Steps current={1} />
      </div>

      <div className="container checkout-body">
        <div className="checkout-left">
          <div className="co-card card">
            <div className="co-card-head">
              <div className="co-game"><Emblem id={game.id} size={42} /><div><h3>{game.name}</h3><span className="co-game-sub">{game.region} · next draw {fmtDraw(game.nextDrawISO)}</span></div></div>
              <span className="co-jp text-gold tnum">{LOTTO.formatMoney(game.jackpot, game.currency)}</span>
            </div>
            <div className="co-lines">
              {lines.map((ln, i) => (
                <div className="co-line" key={i}>
                  <span className="co-line-idx">Line {i + 1}</span>
                  <div className="co-line-balls">
                    {ln.main.map((n, j) => <Ball key={j} n={n} size={28} />)}
                    {ln.bonus.map((n, j) => <Ball key={"b" + j} n={n} kind="bonus" size={28} />)}
                  </div>
                </div>
              ))}
            </div>
            <button className="co-edit" onClick={() => go("picker", game.id)}><Icon name="grid" size={14} /> Edit lines</button>
          </div>
        </div>

        <aside className="checkout-right">
          <div className="pay-card card">
            <h3 className="co-h">Payment</h3>
            <div className="pay-methods">
              <button className="pay-m on" type="button">
                <span className="pay-m-l"><Icon name="wallet" size={18} /> Wallet</span>
                <span className="pay-m-r tnum">{LOTTO.formatFull(walletBal, "$")}</span>
              </button>
            </div>

            <div className="summary">
              <div className="sum-row"><span>{lines.length} line{lines.length !== 1 ? "s" : ""} × $6.50</span><span className="tnum">${total.toFixed(2)}</span></div>
              <div className="sum-row sum-total"><span>Total</span><span className="tnum">${total.toFixed(2)}</span></div>
            </div>

            {err && <div className="pay-warn"><Icon name="bell" size={13} /> {err}</div>}
            {insufficient && !err && <div className="pay-warn"><Icon name="bell" size={13} /> Not enough in your wallet — <button type="button" onClick={() => go("wallet")} style={{ background: "none", border: "none", padding: 0, font: "inherit", color: "inherit", textDecoration: "underline", cursor: "pointer" }}>top up</button>.</div>}

            <Btn variant="gold" size="lg" className="pay-cta" onClick={confirm} iconRight="arrowR" disabled={busy}
              style={(insufficient || busy) ? { opacity: 0.55, cursor: "not-allowed" } : {}}>
              {busy ? "Processing…" : "Pay $" + total.toFixed(2)}
            </Btn>
            <div className="pay-secure"><Icon name="shield" size={13} /> Secure checkout · 18+ · Play responsibly</div>
            <div className="co-pays"><SecurityBadges trust={false} /></div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* ============================ CONFIRMATION ============================ */
function Confirmation({ go, slip, onPurchase }) {
  const game = LOTTO.gameById(slip.gameId);
  const [confetti, setConfetti] = useState(true);
  const ref = "LG-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  useEffect(() => {
    onPurchase && onPurchase(slip);
    const t = setTimeout(() => setConfetti(false), 3500);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, []);

  return (
    <div className="screen confirm" style={{ "--tint": game.tint }}>
      <Confetti run={confetti} />
      <div className="container confirm-wrap">
        <div className="confirm-badge"><Icon name="check" size={40} /></div>
        <h1 className="confirm-h1">You're in the draw!</h1>
        <p className="confirm-sub">Your {game.name} ticket is locked in. We'll check every line automatically and pay any winnings to your wallet.</p>

        <div className="confirm-card card">
          <div className="cc-top">
            <div className="co-game"><Emblem id={game.id} size={40} /><div><h3>{game.name}</h3><span className="co-game-sub">Draw {fmtDraw(game.nextDrawISO)}</span></div></div>
            <span className="cc-ref">Ref {ref}</span>
          </div>
          <div className="co-lines">
            {slip.lines.map((ln, i) => (
              <div className="co-line" key={i}>
                <span className="co-line-idx">Line {i + 1}</span>
                <div className="co-line-balls">
                  {ln.main.map((n, j) => <Ball key={j} n={n} size={26} />)}
                  {ln.bonus.map((n, j) => <Ball key={"b" + j} n={n} kind="bonus" size={26} />)}
                </div>
              </div>
            ))}
          </div>
          <div className="cc-meta">
            <div><span className="cc-m-l">Draws</span><span className="cc-m-v">{slip.plan || 1}{slip.autoplay ? " · auto-play on" : ""}</span></div>
            <div><span className="cc-m-l">Paid</span><span className="cc-m-v tnum">{game.currency}{(slip.total || slip.cost).toFixed(2)} · {slip.paidWith || "wallet"}</span></div>
          </div>
        </div>

        <div className="confirm-cta">
          <Btn variant="gold" size="lg" icon="play" onClick={() => go("draw", game.id)}>Watch the live draw</Btn>
          <Btn variant="ghost" size="lg" icon="ticket" onClick={() => go("tickets")}>View my tickets</Btn>
        </div>
        <button className="confirm-more" onClick={() => go("home")}>Back to lobby</button>
      </div>
    </div>
  );
}

/* ============================ ACCOUNT ============================ */
function Account({ go, user, onSignOut, history }) {
  const won = history.filter((t) => t.totalWin > 0).length;
  const [limit, setLimit] = useState(100);
  const [notif, setNotif] = useState(true);
  return (
    <div className="screen account">
      <div className="container">
        <div className="acc-head card">
          <div className="acc-avatar">{(user.name || "AO").split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
          <div className="acc-id">
            <h2>{user.name || "Guest player"}</h2>
            <span className="acc-email">{user.email || "Playing as guest"}</span>
            <span className="acc-tier"><Icon name="trophy" size={12} /> Gold member · since 2024</span>
          </div>
          <Btn variant="outline" size="sm" onClick={onSignOut}>Sign out</Btn>
        </div>

        <div className="acc-grid">
          <div className="acc-wallet card">
            <span className="tk-w-label"><Icon name="wallet" size={15} /> Wallet balance</span>
            <span className="tk-w-val tnum">{LOTTO.formatFull(user.wallet, "$")}</span>
            <div className="tk-w-actions"><Btn variant="gold" size="sm" icon="plus" onClick={() => go("wallet")}>Top up</Btn><Btn variant="ghost" size="sm" onClick={() => go("wallet")}>Withdraw</Btn></div>
          </div>
          <div className="acc-stat card"><span className="acc-stat-v tnum">{12 + history.length}</span><span className="acc-stat-l">Tickets played</span></div>
          <div className="acc-stat card"><span className="acc-stat-v tnum">{won}</span><span className="acc-stat-l">Winning tickets</span></div>
        </div>

        <div className="hub-grid">
          <button className="hub-card card card-hover" onClick={() => go("wallet")}>
            <span className="hub-ic gold"><Icon name="wallet" size={20} /></span>
            <span className="hub-tx"><span className="hub-t">Wallet &amp; payouts <Icon name="chevron" size={15} /></span><span className="hub-s">Balances, withdraw, history</span></span>
          </button>
          <button className="hub-card card card-hover" onClick={() => go("referral")}>
            <span className="hub-ic"><Icon name="users" size={20} /></span>
            <span className="hub-tx"><span className="hub-t">Refer &amp; earn <span className="hub-badge">{LOTTO.formatFull(user.commission || 0, "$")}</span></span><span className="hub-s">Multi-level commission</span></span>
          </button>
          <button className="hub-card card card-hover" onClick={() => go("billing")}>
            <span className="hub-ic"><Icon name="ticket" size={20} /></span>
            <span className="hub-tx"><span className="hub-t">Billing <Icon name="chevron" size={15} /></span><span className="hub-s">Cards, crypto wallet, invoices</span></span>
          </button>
        </div>

        <div className="acc-cols">
          <div className="acc-card card">
            <h3 className="co-h">Settings</h3>
            <div className="set-row"><span><Icon name="bell" size={16} /> Draw &amp; win alerts</span>
              <button className={`switch ${notif ? "on" : ""}`} onClick={() => setNotif(!notif)} type="button"><span /></button></div>
            <div className="set-row"><span><Icon name="ticket" size={16} /> Payment methods</span><span className="set-go">Visa •••• 4821 ›</span></div>
            <div className="set-row"><span><Icon name="globe" size={16} /> Language &amp; region</span><span className="set-go">English (UK) ›</span></div>
            <div className="set-row"><span><Icon name="user" size={16} /> Personal details</span><span className="set-go">Edit ›</span></div>
          </div>

          <div className="acc-card card acc-rg">
            <h3 className="co-h"><Icon name="shield" size={16} /> Responsible play</h3>
            <p className="rg-lead">You're in control. Set a weekly deposit limit — we'll never let you go over it.</p>
            <div className="rg-limit">
              <div className="rg-limit-top"><span>Weekly deposit limit</span><span className="text-gold tnum">${limit}</span></div>
              <input type="range" min="10" max="500" step="10" value={limit} onChange={(e) => setLimit(+e.target.value)} className="rg-slider" />
            </div>
            <div className="rg-links">
              <button>Take a break</button>
              <button>Self-exclusion</button>
              <button>Get support</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- shared ---------- */
function Steps({ current }) {
  const steps = ["Pick", "Pay", "Confirm"];
  return (
    <div className="steps">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`step ${i < current ? "done" : ""} ${i === current ? "on" : ""}`}>
            <span className="step-dot">{i < current ? <Icon name="check" size={12} /> : i + 1}</span>
            <span className="step-lbl">{s}</span>
          </div>
          {i < steps.length - 1 && <span className={`step-bar ${i < current ? "done" : ""}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function fmtDraw(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

Object.assign(window, { Auth, Checkout, Confirmation, Account });
