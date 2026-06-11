// app.jsx — shell, routing, tweaks
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "gold",
  "theme": "midnight",
  "jackpotEnergy": 1,
  "density": "regular"
} /*EDITMODE-END*/;

const ACCENTS = {
  gold: { hsl: "43 90% 62%", soft: "40 95% 74%", deep: "34 82% 48%", name: "Gold" },
  royal: { hsl: "263 85% 70%", soft: "258 95% 80%", deep: "266 70% 54%", name: "Royal" },
  rose: { hsl: "344 90% 66%", soft: "344 95% 76%", deep: "344 75% 52%", name: "Rose" },
  ice: { hsl: "192 90% 60%", soft: "190 95% 72%", deep: "200 80% 48%", name: "Ice" }
};
const THEMES = {
  midnight: { bg: "222 38% 6%", card: "221 28% 10%", card2: "220 25% 13%", elev: "220 24% 15%", border: "218 22% 20%", name: "Midnight" },
  obsidian: { bg: "230 16% 5%", card: "228 14% 9%", card2: "228 12% 12%", elev: "228 12% 15%", border: "228 12% 18%", name: "Obsidian" },
  forest: { bg: "188 40% 5%", card: "184 32% 8%", card2: "182 28% 11%", elev: "180 26% 14%", border: "180 22% 18%", name: "Deep forest" }
};

const BASE_JP = LOTTO.GAMES.map((g) => g.jackpot);

const SEED_HISTORY = [
{ gameId: "powerball", status: "done", when: "Sat 31 May", lines: [{ main: [12, 23, 32, 39, 61], bonus: [16] }], winning: { main: [5, 23, 32, 40, 61], bonus: [9] }, totalWin: 0 },
{ gameId: "uklotto", status: "done", when: "Wed 28 May", lines: [{ main: [8, 14, 23, 38, 40, 52], bonus: [] }], winning: { main: [8, 14, 23, 38, 41, 52], bonus: [] }, totalWin: 140 }];


function applyTheme(t, mode) {
  const root = document.documentElement.style;
  const a = ACCENTS[t.accent] || ACCENTS.gold;
  root.setProperty("--hsl-gold", a.hsl);
  root.setProperty("--gold", `hsl(${a.hsl})`);
  root.setProperty("--gold-soft", `hsl(${a.soft})`);
  root.setProperty("--gold-deep", `hsl(${a.deep})`);
  root.setProperty("--accent", `hsl(${a.hsl})`);
  root.setProperty("--hsl-accent", a.hsl);
  if (mode === "light") {
    root.setProperty("--bg", "hsl(210 38% 97%)");
    root.setProperty("--bg-card", "#ffffff");
    root.setProperty("--bg-card-2", "hsl(210 40% 99%)");
    root.setProperty("--bg-elevated", "#ffffff");
    root.setProperty("--border", "hsl(220 18% 89%)");
  } else {
    const th = THEMES[t.theme] || THEMES.midnight;
    root.setProperty("--bg", `hsl(${th.bg})`);
    root.setProperty("--bg-card", `hsl(${th.card})`);
    root.setProperty("--bg-card-2", `hsl(${th.card2})`);
    root.setProperty("--bg-elevated", `hsl(${th.elev})`);
    root.setProperty("--border", `hsl(${th.border})`);
  }
  const dens = { compact: 0.9, regular: 1, comfy: 1.12 }[t.density] || 1;
  root.setProperty("--dens", dens);
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const START = typeof window !== "undefined" && window.LG_VIEW || "home";
  const STARTGAME = typeof window !== "undefined" && window.LG_GAME || "euromillions";
  const demoSlip = () => {const g = LOTTO.gameById(STARTGAME);const lines = [LOTTO.quickPick(g), LOTTO.quickPick(g)];return { gameId: g.id, lines, cost: lines.length * g.price, plan: 1, total: lines.length * g.price, paidWith: "wallet" };};
  const [view, setView] = useState({ name: START, gameId: STARTGAME, opts: START === "picker" ? {} : {} });
  const [slip, setSlip] = useState(["checkout", "confirmation", "draw"].includes(START) ? demoSlip() : null);
  // Real session: start logged OUT; the PLG backend (same database as
  // plg.proposals.digital, cookie shared on .proposals.digital) restores the
  // session + identity + real wallet balance on load.
  const [user, setUser] = useState({ name: "", email: "", wallet: 0, winnings: 0, commission: 0 });
  const loggedIn = !!user.email;
  useEffect(() => {
    if (!window.PLG_API) return;
    PLG_API.auth.session().then(function (s) {
      if (!s.authed || !s.profile) return;
      setUser(function (u) { return { ...u, name: s.profile.name || "", email: s.profile.email || "" }; });
      PLG_API.wallet.getBalance()
        .then(function (w) { setUser(function (u) { return { ...u, wallet: w.playable }; }); })
        .catch(function () {});
    }).catch(function () {});
  }, []);
  const [connectedWallet, setConnectedWallet] = useState(null);
  const [selTicket, setSelTicket] = useState(START === "ticket" ? SEED_HISTORY[1] : null);
  const [affOpen, setAffOpen] = useState(false);
  const [mode, setMode] = useState(() => {try {return localStorage.getItem("lg_mode") || "dark";} catch (e) {return "dark";}});
  useEffect(() => {document.documentElement.classList.toggle("light", mode === "light");try {localStorage.setItem("lg_mode", mode);} catch (e) {}}, [mode]);
  const [history, setHistory] = useState(() => {
    try {const s = JSON.parse(localStorage.getItem("lg_history") || "null");if (s) return s;} catch (e) {}
    return SEED_HISTORY;
  });
  const [, force] = useState(0);
  const persist = (next) => {try {localStorage.setItem("lg_history", JSON.stringify(next));} catch (e) {}};

  useEffect(() => {applyTheme(t, mode);}, [t.accent, t.theme, t.density, mode]);
  useEffect(() => {
    LOTTO.GAMES.forEach((g, i) => {g.jackpot = Math.round(BASE_JP[i] * t.jackpotEnergy);});
    force((x) => x + 1);
  }, [t.jackpotEnergy]);

  // ── LIVE DATA HEARTBEAT ── jackpots roll up, winners stream in, app stays live
  useEffect(() => {
    const NAMES = ["Liam", "Olivia", "Noah", "Emma", "Ava", "Ethan", "Mia", "Lucas", "Aria", "Diego", "Yuki", "Priya", "Marco", "Sara", "Leo", "Nadia", "Kofi", "Ines", "Tom", "Hana"];
    const CITIES = ["London", "Austin", "Sydney", "Madrid", "Lagos", "Berlin", "Toronto", "Mumbai", "Lisbon", "Paris", "Dubai", "Oslo", "Cape Town", "Seoul"];
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const iv = setInterval(() => {
      LOTTO.GAMES.forEach((g) => { g.jackpot += Math.round(g.jackpot * (0.0003 + Math.random() * 0.0009)); });
      if (Math.random() < 0.55) {
        const g = pick(LOTTO.GAMES);
        LOTTO.WINNERS.unshift({ name: pick(NAMES) + " " + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + ".", city: pick(CITIES), game: g.name, amount: Math.round(400 + Math.random() * 120000), when: "just now" });
        if (LOTTO.WINNERS.length > 8) LOTTO.WINNERS.pop();
      }
      force((x) => x + 1);
    }, 4000);
    return () => clearInterval(iv);
  }, []);

  const go = useCallback((name, gameId, opts = {}) => {
    setView({ name, gameId: gameId || "euromillions", opts });
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  function onResult(r) {
    setHistory((h) => {
      const idx = h.findIndex((x) => x.status === "active" && x.gameId === r.gameId);
      let next;
      if (idx >= 0) {next = h.slice();next[idx] = { ...next[idx], ...r, status: "done" };} else
      next = [{ ...r, status: "done" }, ...h];
      next = next.slice(0, 14);persist(next);return next;
    });
  }
  function onPurchase(s) {
    const t = { gameId: s.gameId, lines: s.lines, plan: s.plan || 1, autoplay: !!s.autoplay, total: s.total || s.cost, when: "Just now", status: "active", totalWin: null, winning: null };
    setHistory((h) => {const next = [t, ...h].slice(0, 14);persist(next);return next;});
    if ((s.paidWith || "wallet") === "wallet") setUser((u) => ({ ...u, wallet: Math.max(0, u.wallet - (s.total || s.cost)) }));
  }
  function onAuth(u) {
    setUser({ name: u.name, email: u.email, wallet: 0, winnings: 0, commission: 0 });
    if (window.PLG_API)
      PLG_API.wallet.getBalance()
        .then(function (w) { setUser(function (c) { return { ...c, wallet: w.playable }; }); })
        .catch(function () {});
    go("home");
  }
  function onSignOut() {
    if (window.PLG_API) PLG_API.auth.logout().catch(function () {});
    setUser({ name: "", email: "", wallet: 0, winnings: 0, commission: 0 });
    go("auth");
  }

  const nav = [
  { id: "home", label: "Home", icon: "home" },
  { id: "games", label: "Games", icon: "grid" },
  { id: "results", label: "Results", icon: "check" },
  { id: "news", label: "News", icon: "globe" },
  { id: "rewards", label: "Rewards", icon: "gift" },
  { id: "tickets", label: "Tickets", icon: "ticket" }];

  const active = view.name === "games" ? "home" : view.name === "tickets" || view.name === "ticket" ? "tickets" : ["account", "wallet", "referral", "billing"].includes(view.name) ? "account" : ["results", "rewards", "news"].includes(view.name) ? view.name : "home";

  if (view.name === "auth") {
    return <Auth onAuth={onAuth} go={go} />;
  }

  return (
    <div className="app">
      <Header nav={nav} active={active} go={go} user={user} loggedIn={loggedIn} mode={mode} setMode={setMode} onAffiliate={() => setAffOpen(true)} />

      <main className="main">
        {view.name === "home" && <Home key="home" go={go} />}
        {view.name === "games" && <Home key="games" go={go} />}
        {view.name === "picker" &&
        <Picker key={"pick-" + view.gameId + (view.opts.quick ? "q" : "")} gameId={view.gameId} autoQuick={!!view.opts.quick} go={go} slip={slip} setSlip={setSlip} />
        }
        {view.name === "checkout" && <Checkout key={"co-" + view.gameId} go={go} slip={slip} setSlip={setSlip} user={user} />}
        {view.name === "confirmation" && <Confirmation key="cf" go={go} slip={slip} onPurchase={onPurchase} />}
        {view.name === "draw" && <Draw key={"draw-" + view.gameId} gameId={view.gameId} go={go} slip={slip} onResult={onResult} />}
        {view.name === "tickets" && <Tickets key="tickets" go={go} history={history} user={user} onOpen={(t) => {setSelTicket(t);go("ticket");}} />}
        {view.name === "ticket" && selTicket && <DigitalTicket key="dt" go={go} ticket={selTicket} />}
        {view.name === "wallet" && <Wallet key="wallet" go={go} user={user} setUser={setUser} connectedWallet={connectedWallet} />}
        {view.name === "referral" && <Referral key="referral" go={go} user={user} />}
        {view.name === "billing" && <Billing key="billing" go={go} connectedWallet={connectedWallet} setConnectedWallet={setConnectedWallet} />}
        {view.name === "account" && <Account key="account" go={go} user={user} onSignOut={onSignOut} history={history} />}
        {view.name === "results" && <Results key="results" go={go} />}
        {view.name === "rewards" && <Rewards key="rewards" go={go} user={user} onAffiliate={() => setAffOpen(true)} />}
        {view.name === "news" && <News key="news" go={go} />}
      </main>

      <Footer go={go} />

      {/* mobile bottom nav */}
      <nav className="bottom-nav">
        {[...nav, { id: "account", label: "Account", icon: "user" }].map((n) =>
        <button key={n.id} className={`bn-item ${active === n.id ? "active" : ""}`} onClick={() => go(n.id === "account" && !loggedIn ? "auth" : n.id)}>
            <Icon name={n.icon} size={20} />
            <span>{n.label}</span>
          </button>
        )}
      </nav>

      <TweaksPanel>
        <TweakSection label="Accent" />
        <TweakColor label="Jackpot accent" value={`hsl(${(ACCENTS[t.accent] || ACCENTS.gold).hsl})`}
        options={Object.keys(ACCENTS).map((k) => `hsl(${ACCENTS[k].hsl})`)}
        onChange={(v) => {
          const key = Object.keys(ACCENTS).find((k) => `hsl(${ACCENTS[k].hsl})` === v) || "gold";
          setTweak("accent", key);
        }} />
        <TweakSection label="Surface theme" />
        <TweakRadio label="Background" value={t.theme}
        options={[{ value: "midnight", label: "Midnight" }, { value: "obsidian", label: "Obsidian" }, { value: "forest", label: "Forest" }]}
        onChange={(v) => setTweak("theme", v)} />
        <TweakSection label="Jackpots" />
        <TweakSlider label="Jackpot energy" value={t.jackpotEnergy} min={0.5} max={3} step={0.1} unit="×"
        onChange={(v) => setTweak("jackpotEnergy", v)} />
        <TweakSection label="Layout" />
        <TweakRadio label="Density" value={t.density} options={["compact", "regular", "comfy"]}
        onChange={(v) => setTweak("density", v)} />
      </TweaksPanel>
      <AffiliateModal open={affOpen} onClose={() => setAffOpen(false)} />
      {loggedIn && <WinnerToast />}
    </div>);

}

function Header({ nav, active, go, user, loggedIn, mode, setMode, onAffiliate }) {
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [notif, setNotif] = useState(false);
  const [wallet, setWallet] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const walletRef = useRef(null);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenu(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotif(false);
      if (walletRef.current && !walletRef.current.contains(e.target)) setWallet(false);
    };
    document.addEventListener("pointerdown", onDoc);
    return () => document.removeEventListener("pointerdown", onDoc);
  }, []);
  const NOTIFS = [
  { ic: "clock", t: "EuroMillions draws tonight", s: "Get your numbers in before 20:00", k: "", unread: true },
  { ic: "trophy", t: "You won $140 on UK Lotto", s: "Credited to your wallet", k: "win", unread: true },
  { ic: "users", t: "Commission earned · +$42.50", s: "From 3 players in your network", k: "comm", unread: true },
  { ic: "gift", t: "Daily reward ready", s: "Claim a free play", k: "", unread: false }];

  const initials = (user.name || "AO").split(" ").map((w) => w[0]).slice(0, 2).join("");
  const items = [
  { id: "account", label: "Profile", icon: "user" },
  { id: "tickets", label: "My tickets", icon: "ticket" },
  { id: "results", label: "Results", icon: "check" },
  { id: "rewards", label: "Rewards & offers", icon: "gift" },
  { id: "wallet", label: "Wallet & payouts", icon: "wallet" },
  { id: "referral", label: "Refer a friend", icon: "users" },
  { id: "billing", label: "Billing", icon: "ticket" }];

  function pick(id) {setMenu(false);go(id);}
  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="header-inner container">
        <button className="brand" onClick={() => go("home")}>
          <img src="plg-logo.png" alt="PLG Lotto" className="brand-logo" />
        </button>
        <nav className="nav">
          {nav.map((n) =>
          <button key={n.id} className={`nav-item ${active === n.id ? "active" : ""}`} onClick={() => go(n.id)} style={{ lineHeight: "0", opacity: "1", borderRadius: "5px" }}>{n.label}</button>
          )}
        </nav>
        <div className="header-right">
          {loggedIn ?
          <>
              <div className="wallet-wrap" ref={walletRef}>
                <button className={`balance chip ${wallet ? "open" : ""}`} onClick={() => {setWallet((w) => !w);setMenu(false);setNotif(false);}} title="Wallet"><Icon name="wallet" size={14} /> <span className="tnum">{LOTTO.formatFull(user.wallet, "$")}</span></button>
                {wallet &&
              <div className="profile-menu wallet-menu">
                    <div className="wm-head">
                      <div><span className="wm-l">Total balance</span><span className="wm-total tnum">{LOTTO.formatFull((user.wallet || 0) + (user.winnings || 0) + (user.commission || 0), "$")}</span></div>
                      <button className="wm-expand" onClick={() => {setWallet(false);go("wallet");}} title="Open wallet"><Icon name="arrowR" size={16} /></button>
                    </div>
                    <div className="wm-bals">
                      <div className="wm-bal"><span className="wm-dot play" /><span className="wm-bal-l">Playable</span><span className="wm-bal-v tnum">{LOTTO.formatFull(user.wallet || 0, "$")}</span></div>
                      <div className="wm-bal"><span className="wm-dot win" /><span className="wm-bal-l">Winnings</span><span className="wm-bal-v tnum">{LOTTO.formatFull(user.winnings || 0, "$")}</span></div>
                      <div className="wm-bal"><span className="wm-dot comm" /><span className="wm-bal-l">Commission</span><span className="wm-bal-v tnum">{LOTTO.formatFull(user.commission || 0, "$")}</span></div>
                    </div>
                    <div className="wm-actions">
                      <Btn variant="gold" size="sm" icon="plus" onClick={() => {setWallet(false);go("wallet");}}>Top up</Btn>
                      <Btn variant="ghost" size="sm" onClick={() => {setWallet(false);go("wallet");}}>Withdraw</Btn>
                    </div>
                    <button className="wm-full" onClick={() => {setWallet(false);go("wallet");}}>Open Wallet &amp; payouts <Icon name="chevron" size={14} /></button>
                  </div>
              }
              </div>
              <div className="notif-wrap" ref={notifRef}>
                <button className={`btn-icon ${notif ? "open" : ""}`} title="Notifications" onClick={() => {setNotif((n) => !n);setMenu(false);}}><Icon name="bell" size={18} /><span className="notif-badge" /></button>
                {notif &&
              <div className="profile-menu notif-menu">
                    <div className="nm-head"><span>Notifications</span><button className="nm-clear" onClick={() => setNotif(false)}>Mark all read</button></div>
                    <div className="pm-list">
                      {NOTIFS.map((n, i) =>
                  <button key={i} className={`nm-item ${n.unread ? "unread" : ""}`} onClick={() => {setNotif(false);go("news");}}>
                          <span className={`nm-ic ${n.k}`}><Icon name={n.ic} size={15} /></span>
                          <span className="nm-tx"><span className="nm-t">{n.t}</span><span className="nm-s">{n.s}</span></span>
                          {n.unread && <span className="nm-dot" />}
                        </button>
                  )}
                    </div>
                  </div>
              }
              </div>
              <div className="avatar-wrap" ref={menuRef}>
                <button className={`avatar ${menu ? "open" : ""}`} onClick={() => setMenu((m) => !m)} title="Account">{initials}</button>
                {menu &&
              <div className="profile-menu">
                    <div className="pm-head">
                      <span className="pm-ava">{initials}</span>
                      <div className="pm-id"><span className="pm-name">{user.name}</span><span className="pm-email">{user.email}</span></div>
                    </div>
                    <div className="pm-list">
                      {items.map((it) =>
                  <button key={it.id} className="pm-item" onClick={() => pick(it.id)}><Icon name={it.icon} size={16} /> {it.label}</button>
                  )}
                      <a className="pm-item" href="Affiliate Dashboard.html"><Icon name="grid" size={16} /> Affiliate dashboard <span className="pm-ext">↗</span></a>
                      <a className="pm-item" href="Marketing Hub.html"><Icon name="megaphone" size={16} /> Marketing hub <span className="pm-ext">↗</span></a>
                      <a className="pm-item" href="Viral Launch.html"><Icon name="share" size={16} /> Invite &amp; earn <span className="pm-ext">↗</span></a>
                      <button className="pm-item pm-aff" onClick={() => {setMenu(false);onAffiliate && onAffiliate();}}><Icon name="trophy" size={16} /> Become an affiliate</button>
                    </div>
                    <div className="pm-sep" />
                    <div className="pm-appearance">
                      <span>Appearance</span>
                      <div className="pm-seg">
                        <button className={mode === "light" ? "on" : ""} onClick={() => setMode("light")}>Light</button>
                        <button className={mode === "dark" ? "on" : ""} onClick={() => setMode("dark")}>Dark</button>
                      </div>
                    </div>
                    <div className="pm-sep" />
                    <button className="pm-item pm-out" onClick={() => pick("account")}><Icon name="user" size={16} /> Account settings</button>
                    <button className="pm-item pm-out" onClick={() => pick("account")}><Icon name="bell" size={16} /> Help &amp; support</button>
                    <button className="pm-item pm-out" onClick={() => {setMenu(false);go("auth");}}><Icon name="arrowR" size={16} /> Sign out</button>
                  </div>
              }
              </div>
            </> :

          <>
              <button className="nav-item" onClick={() => go("auth")}>Log in</button>
              <Btn variant="gold" size="sm" onClick={() => go("auth")}>Sign up</Btn>
            </>
          }
        </div>
      </div>
    </header>);

}

function Footer({ go }) {
  return (
    <footer className="footer">
      <div className="container footer-trust">
        <SecurityBadges />
      </div>
      <div className="container footer-inner">
        <div className="footer-brand">
          <img src="plg-logo.png" alt="PLG Lotto" className="brand-logo sm" />
        </div>
        <p className="footer-note">Play responsibly · 18+ · Licensed & regulated. Lotto Global is a concept demo.</p>
        <div className="footer-links">
          <a href="#" onClick={(e) => {e.preventDefault();go("news");}}>Live news</a>
          <a href="#" onClick={(e) => {e.preventDefault();go("results");}}>Results</a>
          <a href="#" onClick={(e) => {e.preventDefault();go("rewards");}}>Responsible play</a>
        </div>
      </div>
    </footer>);

}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);