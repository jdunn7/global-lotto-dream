// flow.jsx — Auth, Checkout, Confirmation, Account screens

/* ============================ AUTH ============================ */
function Auth({ onAuth, go }) {
  const [mode, setMode] = useState("signup"); // signup | login
  const [form, setForm] = useState({ name: "", email: "", pass: "" });
  const [touched, setTouched] = useState(false);
  const valid = form.email.includes("@") && form.pass.length >= 6 && (mode === "login" || form.name.trim());

  function submit(e) {
    e && e.preventDefault();
    setTouched(true);
    if (!valid) return;
    onAuth({ name: mode === "login" ? "Amara Okafor" : form.name, email: form.email });
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
            <button className={mode === "signup" ? "on" : ""} onClick={() => setMode("signup")}>Sign up</button>
            <button className={mode === "login" ? "on" : ""} onClick={() => setMode("login")}>Log in</button>
            <span className="auth-tab-thumb" style={{ transform: mode === "login" ? "translateX(100%)" : "none" }} />
          </div>

          <h2 className="auth-title">{mode === "signup" ? "Create your account" : "Welcome back"}</h2>
          <p className="auth-sub">{mode === "signup" ? "Join in under a minute. No fees to sign up." : "Log in to play and check your tickets."}</p>

          <div className="auth-social">
            <button className="auth-soc" onClick={() => onAuth({ name: "Amara Okafor", email: "amara@gmail.com" })}>
              <span className="soc-g">G</span> Continue with Google
            </button>
            <button className="auth-soc" onClick={() => onAuth({ name: "Amara Okafor", email: "amara@icloud.com" })}>
              <span className="soc-a"></span> Continue with Apple
            </button>
          </div>
          <div className="auth-divider"><span>or with email</span></div>

          <form className="auth-form" onSubmit={submit}>
            {mode === "signup" && (
              <label className="field">
                <span>Full name</span>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Amara Okafor" />
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
              <input type="password" value={form.pass} onChange={(e) => setForm({ ...form, pass: e.target.value })} placeholder="At least 6 characters" />
              {touched && form.pass.length < 6 && <em className="field-err">Min. 6 characters</em>}
            </label>
            <Btn variant="gold" size="lg" className="auth-submit" type="submit" iconRight="arrowR">
              {mode === "signup" ? "Create account" : "Log in"}
            </Btn>
          </form>

          <button className="auth-guest" onClick={() => go("home")}>Browse as guest →</button>
          <div className="auth-badges"><SecurityBadges payments={false} /></div>
        </div>
      </div>
    </div>
  );
}

/* ============================ CHECKOUT ============================ */
const DRAW_PLANS = [
  { id: 1, label: "Single draw", sub: "Just the next draw", off: 0 },
  { id: 4, label: "4 draws", sub: "≈ 2 weeks", off: 0.05 },
  { id: 12, label: "12 draws", sub: "≈ 6 weeks", off: 0.1 },
];

function Checkout({ go, slip, setSlip, user }) {
  const game = LOTTO.gameById(slip.gameId);
  const [plan, setPlan] = useState(1);
  const [autoplay, setAutoplay] = useState(false);
  const [pay, setPay] = useState("wallet");
  const [promo, setPromo] = useState("");
  const [applied, setApplied] = useState(false);
  const lines = slip.lines;
  const base = lines.length * game.price * plan;
  const planOff = (DRAW_PLANS.find((p) => p.id === plan) || {}).off || 0;
  const promoOff = applied ? 0.1 : 0;
  const discount = base * (planOff + promoOff);
  const total = Math.max(0, base - discount);
  const walletBal = user.wallet;
  const insufficient = pay === "wallet" && total > walletBal;

  function confirm() {
    if (insufficient) return;
    setSlip({ ...slip, plan, autoplay, total, paidWith: pay });
    go("confirmation", game.id);
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

          <div className="co-card card">
            <h3 className="co-h">How many draws?</h3>
            <div className="plan-grid">
              {DRAW_PLANS.map((p) => (
                <button key={p.id} className={`plan ${plan === p.id ? "on" : ""}`} onClick={() => setPlan(p.id)}>
                  {p.off > 0 && <span className="plan-save">Save {Math.round(p.off * 100)}%</span>}
                  <span className="plan-label">{p.label}</span>
                  <span className="plan-sub">{p.sub}</span>
                </button>
              ))}
            </div>
            <label className="co-toggle">
              <span><strong>Auto-play</strong><em>Automatically renew these numbers each draw. Cancel anytime.</em></span>
              <button className={`switch ${autoplay ? "on" : ""}`} onClick={() => setAutoplay(!autoplay)} type="button"><span /></button>
            </label>
          </div>
        </div>

        <aside className="checkout-right">
          <div className="pay-card card">
            <h3 className="co-h">Payment</h3>
            <div className="pay-methods">
              <button className={`pay-m ${pay === "wallet" ? "on" : ""}`} onClick={() => setPay("wallet")}>
                <span className="pay-m-l"><Icon name="wallet" size={18} /> Wallet</span>
                <span className="pay-m-r tnum">{LOTTO.formatFull(walletBal, "$")}</span>
              </button>
              <button className={`pay-m ${pay === "card" ? "on" : ""}`} onClick={() => setPay("card")}>
                <span className="pay-m-l"><Icon name="ticket" size={18} /> Visa •••• 4821</span>
                <span className="pay-m-r pay-default">Default</span>
              </button>
            </div>

            <div className="promo">
              <input value={promo} onChange={(e) => { setPromo(e.target.value); setApplied(false); }} placeholder="Promo code" />
              <button onClick={() => setApplied(promo.trim().length > 0)} disabled={!promo.trim()}>Apply</button>
            </div>
            {applied && <div className="promo-ok"><Icon name="check" size={13} /> Code applied — 10% off</div>}

            <div className="summary">
              <div className="sum-row"><span>{lines.length} line{lines.length !== 1 ? "s" : ""} × {plan} draw{plan !== 1 ? "s" : ""}</span><span className="tnum">{game.currency}{base.toFixed(2)}</span></div>
              {discount > 0 && <div className="sum-row sum-off"><span>Discount</span><span className="tnum">−{game.currency}{discount.toFixed(2)}</span></div>}
              <div className="sum-row sum-total"><span>Total</span><span className="tnum">{game.currency}{total.toFixed(2)}</span></div>
            </div>

            {insufficient && <div className="pay-warn"><Icon name="bell" size={13} /> Not enough in your wallet. Switch to card or top up.</div>}

            <Btn variant="gold" size="lg" className="pay-cta" onClick={confirm} iconRight="arrowR"
              style={insufficient ? { opacity: 0.5, cursor: "not-allowed" } : {}}>
              Pay {game.currency}{total.toFixed(2)}
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
