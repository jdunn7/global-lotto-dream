// flow2.jsx — Wallet & payouts, Multi-level commission/referral, Digital ticket

/* ===== shared decorative QR + barcode (deterministic, decorative only) ===== */
function seeded(seed) { let s = 0; for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0; return () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff; }
function QR({ data, size = 100 }) {
  const n = 21;
  const rnd = seeded(data || "LG");
  const cells = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const finder = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
    const on = finder ? finderCell(x, y, n) : rnd() > 0.5;
    if (on) cells.push(<rect key={x + "-" + y} x={x} y={y} width="1" height="1" />);
  }
  return <svg className="qr" viewBox={`0 0 ${n} ${n}`} width={size} height={size} shapeRendering="crispEdges"><g fill="#0d1320">{cells}</g></svg>;
}
function finderCell(x, y, n) {
  const lx = x >= n - 7 ? x - (n - 7) : x, ly = y >= n - 7 ? y - (n - 7) : y;
  const border = lx === 0 || lx === 6 || ly === 0 || ly === 6;
  const core = lx >= 2 && lx <= 4 && ly >= 2 && ly <= 4;
  return border || core;
}
function Barcode({ data, h = 38 }) {
  const rnd = seeded((data || "x") + "bc");
  const bars = Array.from({ length: 48 }, (_, i) => ({ w: 1 + Math.round(rnd() * 2), on: rnd() > 0.35, i }));
  return <div className="barcode" style={{ height: h }}>{bars.map((b) => <span key={b.i} style={{ width: b.w * 2, opacity: b.on ? 1 : 0 }} />)}</div>;
}

/* ============================ WALLET & PAYOUTS ============================ */
const PAYOUT_METHODS = [
  { id: "bank", label: "Bank transfer", sub: "1–3 business days · free", icon: "wallet" },
  { id: "paypal", label: "PayPal", sub: "Instant · 1% fee", icon: "globe" },
  { id: "crypto", label: "USDC (crypto)", sub: "~10 min · network fee", icon: "shield" },
];
const TXNS = [
  { t: "Commission payout", g: "Level 1 · 3 referrals", a: 42.5, dir: "in", k: "commission", when: "Today" },
  { t: "Lottery win", g: "UK Lotto", a: 140, dir: "in", k: "win", when: "Wed 28 May" },
  { t: "Ticket purchase", g: "EuroMillions · 2 lines", a: -5, dir: "out", k: "play", when: "Wed 28 May" },
  { t: "Withdrawal", g: "Bank transfer", a: -200, dir: "out", k: "payout", when: "24 May" },
  { t: "Top up", g: "Visa •••• 4821", a: 250, dir: "in", k: "deposit", when: "20 May" },
];
const PAYOUTS = [
  { ref: "PO-4471", method: "Bank transfer", a: 200, status: "completed", when: "24 May" },
  { ref: "PO-4390", method: "PayPal", a: 75, status: "pending", when: "Today" },
];

function Wallet({ go, user }) {
  const winnings = user.winnings || 0, commission = user.commission || 0, play = user.wallet || 0;
  const total = play + winnings + commission;
  const [amt, setAmt] = useState("100");
  const [method, setMethod] = useState("bank");
  const [done, setDone] = useState(false);
  const withdrawable = winnings + commission;
  const val = Math.max(0, Math.min(withdrawable, parseFloat(amt) || 0));

  return (
    <div className="screen wallet">
      <div className="container">
        <div className="sec-head"><div><span className="sec-ey"><Icon name="wallet" size={15} /> Wallet &amp; payouts</span><h2>Your money</h2></div>
          <Btn variant="ghost" size="sm" icon="chevronL" onClick={() => go("account")}>Account</Btn></div>

        {/* balances */}
        <div className="bal-grid">
          <div className="bal-card bal-total card">
            <span className="bal-l">Total balance</span>
            <span className="bal-v tnum">{LOTTO.formatFull(total, "$")}</span>
            <div className="bal-actions"><Btn variant="gold" size="sm" icon="plus">Top up</Btn><Btn variant="ghost" size="sm" icon="arrowR">Withdraw</Btn></div>
          </div>
          <div className="bal-card card"><span className="bal-l"><span className="bal-dot play" /> Playable</span><span className="bal-v2 tnum">{LOTTO.formatFull(play, "$")}</span><span className="bal-sub">For buying tickets</span></div>
          <div className="bal-card card"><span className="bal-l"><span className="bal-dot win" /> Winnings</span><span className="bal-v2 tnum">{LOTTO.formatFull(winnings, "$")}</span><span className="bal-sub">Withdrawable now</span></div>
          <div className="bal-card card"><span className="bal-l"><span className="bal-dot comm" /> Commission</span><span className="bal-v2 tnum">{LOTTO.formatFull(commission, "$")}</span><span className="bal-sub">From your network</span></div>
        </div>

        <div className="wallet-cols">
          {/* withdraw */}
          <div className="card withdraw-card">
            <h3 className="co-h">Withdraw funds</h3>
            {done ? (
              <div className="withdraw-done">
                <div className="confirm-badge sm"><Icon name="check" size={26} /></div>
                <h4>Payout requested</h4>
                <p>{LOTTO.formatFull(val, "$")} via {PAYOUT_METHODS.find((m) => m.id === method).label}. You'll get a confirmation shortly.</p>
                <Btn variant="ghost" size="sm" onClick={() => setDone(false)}>Make another</Btn>
              </div>
            ) : (
              <>
                <label className="wd-amt">
                  <span>Amount <em>· max {LOTTO.formatFull(withdrawable, "$")} withdrawable</em></span>
                  <div className="wd-amt-in"><span className="wd-cur">$</span><input value={amt} onChange={(e) => setAmt(e.target.value.replace(/[^0-9.]/g, ""))} /><button onClick={() => setAmt(String(withdrawable))}>Max</button></div>
                </label>
                <div className="wd-quick">{[50, 100, 250].map((q) => <button key={q} className={+amt === q ? "on" : ""} onClick={() => setAmt(String(q))}>${q}</button>)}</div>
                <span className="wd-label">Payout to</span>
                <div className="wd-methods">
                  {PAYOUT_METHODS.map((m) => (
                    <button key={m.id} className={`pay-m ${method === m.id ? "on" : ""}`} onClick={() => setMethod(m.id)}>
                      <span className="pay-m-l"><Icon name={m.icon} size={18} /> <span className="wd-m-txt"><strong>{m.label}</strong><em>{m.sub}</em></span></span>
                      <span className={`radio ${method === m.id ? "on" : ""}`} />
                    </button>
                  ))}
                </div>
                <Btn variant="gold" size="lg" className="pay-cta" iconRight="arrowR" onClick={() => val > 0 && setDone(true)} style={val <= 0 ? { opacity: 0.5, cursor: "not-allowed" } : {}}>Withdraw {LOTTO.formatFull(val, "$")}</Btn>
                <div className="pay-secure"><Icon name="shield" size={13} /> Withdrawals go to verified accounts only</div>
              </>
            )}
          </div>

          {/* payouts + transactions */}
          <div className="wallet-right">
            <div className="card pad-card">
              <div className="panel-head2"><h3>Payout requests</h3></div>
              <div className="payout-list">
                {PAYOUTS.map((p) => (
                  <div className="payout-row" key={p.ref}>
                    <div><span className="po-ref">{p.ref}</span><span className="po-method">{p.method} · {p.when}</span></div>
                    <div className="po-right"><span className="po-amt tnum">{LOTTO.formatFull(p.a, "$")}</span><span className={`po-status ${p.status}`}>{p.status === "pending" ? "Pending" : "Paid"}</span></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card pad-card">
              <div className="panel-head2"><h3>Recent activity</h3></div>
              <div className="txn-list">
                {TXNS.map((tx, i) => (
                  <div className="txn-row" key={i}>
                    <span className={`txn-ic ${tx.k}`}><Icon name={txnIcon(tx.k)} size={15} /></span>
                    <div className="txn-info"><span className="txn-t">{tx.t}</span><span className="txn-g">{tx.g} · {tx.when}</span></div>
                    <span className={`txn-a ${tx.dir} tnum`}>{tx.dir === "in" ? "+" : "−"}{LOTTO.formatFull(Math.abs(tx.a), "$")}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function txnIcon(k) { return { commission: "users", win: "trophy", play: "ticket", payout: "arrowR", deposit: "plus" }[k] || "wallet"; }

/* ============================ MULTI-LEVEL COMMISSION ============================ */
const TIERS = [
  { lvl: 1, rate: 8, label: "Direct referrals", desc: "People who join with your code", count: 14, color: "var(--primary)" },
  { lvl: 2, rate: 4, label: "Second level", desc: "Referrals of your referrals", count: 39, color: "var(--gold)" },
  { lvl: 3, rate: 2, label: "Third level", desc: "Their network, three deep", count: 86, color: "var(--brand-chrome-blue, #2fb7ff)" },
];
const REF_ACTIVITY = [
  { name: "Daniel K.", lvl: 1, act: "played EuroMillions", a: 4.2, when: "12m ago" },
  { name: "Priya N.", lvl: 2, act: "joined your network", a: null, when: "1h ago" },
  { name: "Marco B.", lvl: 1, act: "won on Powerball", a: 18.6, when: "3h ago" },
  { name: "Aisha O.", lvl: 3, act: "played Mega Millions", a: 0.9, when: "5h ago" },
  { name: "Tom R.", lvl: 2, act: "topped up wallet", a: 2.1, when: "yesterday" },
];

function Referral({ go, user }) {
  const code = "AMARA777";
  const [copied, setCopied] = useState(false);
  const link = "lottoglobal.app/r/" + code;
  const teamSize = TIERS.reduce((s, t) => s + t.count, 0);
  function copy() { try { navigator.clipboard.writeText(link); } catch (e) {} setCopied(true); setTimeout(() => setCopied(false), 1600); }

  return (
    <div className="screen referral">
      <div className="container">
        <div className="ref-hero card">
          <div className="ref-hero-l">
            <span className="eyebrow"><Icon name="users" size={14} /> Multi-level rewards</span>
            <h1 className="ref-h1">Earn when your<br /><span className="text-gold">network plays.</span></h1>
            <p className="ref-lead">Invite friends and earn commission on every ticket they buy — and on their referrals too, three levels deep. Paid to your wallet automatically.</p>
            <div className="ref-link">
              <div className="ref-link-box"><span className="ref-code-l">Your link</span><span className="ref-code">{link}</span></div>
              <Btn variant={copied ? "primary" : "gold"} icon={copied ? "check" : "ticket"} onClick={copy}>{copied ? "Copied!" : "Copy"}</Btn>
            </div>
            <div className="ref-share">Share via <button>WhatsApp</button><button>Email</button><button>X</button><button>Telegram</button></div>
          </div>
          <div className="ref-hero-r">
            <div className="ref-earn-orb">
              <span className="ref-earn-l">Lifetime commission</span>
              <span className="ref-earn-v text-gold tnum">{LOTTO.formatFull(user.commission || 0, "$")}</span>
              <span className="ref-earn-sub">+ ${(42.5).toFixed(2)} this week</span>
              <Btn variant="ghost" size="sm" icon="wallet" onClick={() => go("wallet")}>Withdraw to wallet</Btn>
            </div>
          </div>
        </div>

        {/* commission tiers */}
        <div className="sec-head" style={{ marginTop: 34 }}><div><span className="sec-ey"><Icon name="trophy" size={15} /> Commission structure</span><h2>Three levels of earning</h2></div></div>
        <div className="tier-flow">
          <div className="tier-you"><div className="tier-you-av">AO</div><span>You</span></div>
          <div className="tier-arrow"><Icon name="chevron" size={18} /></div>
          <div className="tier-cards">
            {TIERS.map((t) => (
              <div className="tier-card card" key={t.lvl} style={{ "--tc": t.color }}>
                <div className="tier-top"><span className="tier-badge">Level {t.lvl}</span><span className="tier-rate">{t.rate}%</span></div>
                <div className="tier-bar"><span style={{ width: t.rate * 8 + "%" }} /></div>
                <span className="tier-label">{t.label}</span>
                <span className="tier-desc">{t.desc}</span>
                <div className="tier-foot"><span className="tier-count tnum">{t.count}</span><span className="tier-count-l">in your network</span></div>
              </div>
            ))}
          </div>
        </div>

        {/* network stats */}
        <div className="ref-stats">
          {[
            { v: teamSize, l: "Total network", s: "across 3 levels" },
            { v: TIERS[0].count, l: "Direct referrals", s: "level 1" },
            { v: "68%", l: "Active players", s: "played this month" },
            { v: "$2.1k", l: "Team volume", s: "tickets this month" },
          ].map((s, i) => (
            <div className="ref-stat card" key={i}><span className="ref-stat-v tnum">{s.v}</span><span className="ref-stat-l">{s.l}</span><span className="ref-stat-s">{s.s}</span></div>
          ))}
        </div>

        {/* activity */}
        <div className="ref-cols">
          <div className="card pad-card">
            <div className="panel-head2"><h3>Network activity</h3><span className="chip chip-live"><span className="dot" /> Live</span></div>
            <div className="ref-act-list">
              {REF_ACTIVITY.map((a, i) => (
                <div className="ref-act" key={i}>
                  <span className="ref-act-av" style={{ background: `hsl(${LOTTO.GAMES[i % 6].tint})` }}>{a.name[0]}</span>
                  <div className="ref-act-info"><span className="ref-act-name">{a.name} <span className={`lvl-pill l${a.lvl}`}>L{a.lvl}</span></span><span className="ref-act-act">{a.act} · {a.when}</span></div>
                  {a.a != null ? <span className="ref-act-a text-gold tnum">+${a.a.toFixed(2)}</span> : <span className="ref-act-new">joined</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="card pad-card ref-how">
            <h3 className="co-h">How it works</h3>
            <ol className="how-list">
              <li><span className="how-n">1</span><div><strong>Share your link</strong><em>Send your unique code to friends.</em></div></li>
              <li><span className="how-n">2</span><div><strong>They play</strong><em>You earn {TIERS[0].rate}% of every ticket they buy.</em></div></li>
              <li><span className="how-n">3</span><div><strong>Your network grows</strong><em>Earn {TIERS[1].rate}% &amp; {TIERS[2].rate}% as they refer others.</em></div></li>
              <li><span className="how-n">4</span><div><strong>Get paid</strong><em>Commission lands in your wallet — withdraw anytime.</em></div></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================ DIGITAL TICKET ============================ */
function DigitalTicket({ go, ticket }) {
  const game = LOTTO.gameById(ticket.gameId);
  const status = ticket.status === "active" || ticket.winning == null ? "active" : (ticket.totalWin > 0 ? "winner" : "checked");
  const ref = ticket.ref || ("LG-" + (ticket.gameId.slice(0, 3).toUpperCase()) + "-" + String(1000 + (ticket.lines.length * 7)).slice(0, 4));
  return (
    <div className="screen dticket" style={{ "--tint": game.tint }}>
      <div className="container dticket-wrap">
        <button className="back-btn" onClick={() => go("tickets")}><Icon name="chevronL" size={18} /> My tickets</button>

        <div className="dt-card">
          <div className="dt-top">
            <div className="co-game"><Emblem id={game.id} size={46} /><div><h3>{game.name}</h3><span className="co-game-sub">{game.region}</span></div></div>
            <span className={`dt-status dt-${status}`}>{status === "active" ? "Active" : status === "winner" ? "Winner" : "Checked"}</span>
          </div>

          <div className="dt-meta">
            <div><span className="dt-m-l">Draw date</span><span className="dt-m-v">{fmtDraw(game.nextDrawISO)}</span></div>
            <div><span className="dt-m-l">Draws</span><span className="dt-m-v">{ticket.plan || 1}{ticket.autoplay ? " · auto" : ""}</span></div>
            <div><span className="dt-m-l">Ref</span><span className="dt-m-v">{ref}</span></div>
          </div>

          <div className="dt-lines">
            {ticket.lines.map((ln, i) => (
              <div className="dt-line" key={i}>
                <span className="dt-line-idx">{String.fromCharCode(65 + i)}</span>
                <div className="dt-line-balls">
                  {ln.main.map((n, j) => <Ball key={j} n={n} size={34} />)}
                  {ln.bonus.map((n, j) => <Ball key={"b" + j} n={n} kind="bonus" size={34} />)}
                </div>
              </div>
            ))}
          </div>

          {status !== "active" && ticket.winning && (
            <div className="dt-result">
              <span className="dt-m-l">Drawn numbers</span>
              <div className="dt-line-balls" style={{ marginTop: 8 }}>
                {ticket.winning.main.map((n, j) => <Ball key={j} n={n} size={30} kind={ticket.lines.some((l) => l.main.includes(n)) ? "emerald" : "main"} />)}
                {ticket.winning.bonus.map((n, j) => <Ball key={"b" + j} n={n} size={30} kind="bonus" />)}
              </div>
              {ticket.totalWin > 0 && <div className="dt-win text-gold">You won {LOTTO.formatFull(ticket.totalWin, game.currency)} 🎉</div>}
            </div>
          )}

          <div className="dt-perf"><span className="dt-notch l" /><span className="dt-dash" /><span className="dt-notch r" /></div>

          <div className="dt-codes">
            <QR data={ref} size={92} />
            <div className="dt-codes-r">
              <span className="dt-secured"><Icon name="shield" size={13} /> Cryptographically secured · auto-checked</span>
              <Barcode data={ref} />
              <span className="dt-ref-txt">{ref}</span>
            </div>
          </div>
        </div>

        <div className="dt-actions">
          {status === "active" && <Btn variant="gold" icon="play" onClick={() => go("draw", game.id)}>Watch the draw</Btn>}
          <Btn variant="ghost" icon="wallet">Add to wallet</Btn>
          <Btn variant="ghost" icon="arrowR">Share</Btn>
        </div>
      </div>
    </div>
  );
}

/* ============================ BILLING & CRYPTO CONNECT ============================ */
const WALLET_APPS = [
  { id: "metamask", name: "MetaMask", glyph: "🦊", cls: "metamask" },
  { id: "wc", name: "WalletConnect", glyph: "🔗", cls: "wc" },
  { id: "coinbase", name: "Coinbase", glyph: "🅒", cls: "coinbase" },
  { id: "phantom", name: "Phantom", glyph: "👻", cls: "phantom" },
];
const INVOICES = [
  { t: "EuroMillions · 4 draws", d: "2 Jun 2026", a: 10 },
  { t: "Powerball · 2 lines", d: "31 May 2026", a: 4 },
  { t: "Wallet top-up", d: "20 May 2026", a: 250 },
  { t: "Mega Millions · 1 line", d: "18 May 2026", a: 2 },
];

function Billing({ go, connectedWallet, setConnectedWallet }) {
  const [cards, setCards] = useState([
    { id: 1, brand: "visa", name: "Visa", last: "4821", exp: "08/27", def: true },
    { id: 2, brand: "mc", name: "Mastercard", last: "6390", exp: "02/26", def: false },
  ]);
  function connect(app) {
    const addr = "0x" + Math.random().toString(16).slice(2, 6) + "…" + Math.random().toString(16).slice(2, 6);
    setConnectedWallet({ app: app.id, name: app.name, cls: app.cls, glyph: app.glyph, addr, bal: 1840.22 });
  }

  return (
    <div className="screen billing">
      <div className="container">
        <div className="sec-head"><div><span className="sec-ey"><Icon name="ticket" size={15} /> Settings · Billing</span><h2>Billing &amp; payments</h2></div>
          <Btn variant="ghost" size="sm" icon="chevronL" onClick={() => go("account")}>Account</Btn></div>

        <div className="bill-cols">
          <div className="bill-card card">
            <h3 className="co-h">Payment methods</h3>
            <div className="method-list" style={{ marginTop: 14 }}>
              {cards.map((c) => (
                <div className="method-row" key={c.id}>
                  <span className={`method-ic ${c.brand}`}>{c.brand === "visa" ? "VISA" : "MC"}</span>
                  <div className="method-info">
                    <span className="method-name">{c.name} •••• {c.last} {c.def && <span className="method-tag">Default</span>}</span>
                    <span className="method-sub">Expires {c.exp}</span>
                  </div>
                  <button className="method-x" onClick={() => setCards(cards.filter((x) => x.id !== c.id))}>Remove</button>
                </div>
              ))}
            </div>
            <button className="add-method" onClick={() => setCards([...cards, { id: Date.now(), brand: "visa", name: "Visa", last: String(1000 + Math.floor(Math.random() * 8999)), exp: "11/28", def: false }])}>
              <Icon name="plus" size={15} /> Add card
            </button>
          </div>

          <div className="bill-card card">
            <h3 className="co-h"><Icon name="shield" size={16} /> Crypto wallet</h3>
            <p className="rg-lead" style={{ marginTop: 8 }}>Connect a wallet to deposit or withdraw in USDC, instantly.</p>
            <div className="wallets-connect">
              {connectedWallet ? (
                <>
                  <div className="wc-connected">
                    <span className={`wc-logo ${connectedWallet.cls}`}>{connectedWallet.glyph}</span>
                    <div className="wc-info">
                      <span className="wc-name">{connectedWallet.name} <span className="method-tag">Connected</span></span>
                      <span className="wc-addr">{connectedWallet.addr}</span>
                    </div>
                    <div className="wc-bal"><span className="wc-bal-v tnum">{LOTTO.formatFull(connectedWallet.bal, "$")}</span><span className="wc-bal-l">USDC</span></div>
                  </div>
                  <button className="wc-disc" onClick={() => setConnectedWallet(null)} style={{ alignSelf: "flex-start" }}>Disconnect</button>
                </>
              ) : (
                <>
                  <div className="wc-options">
                    {WALLET_APPS.map((a) => (
                      <button key={a.id} className="wc-opt" onClick={() => connect(a)}>
                        <span className={`wc-logo ${a.cls}`}>{a.glyph}</span>
                        <span className="wc-opt-name">{a.name}</span>
                      </button>
                    ))}
                  </div>
                  <span className="wc-note"><Icon name="shield" size={12} /> Non-custodial · we never hold your keys</span>
                </>
              )}
            </div>
          </div>

          <div className="bill-card card">
            <div className="panel-head2" style={{ padding: "0 0 14px", borderColor: "var(--border-soft)" }}><h3>Billing history</h3></div>
            <div className="invoice-list">
              {INVOICES.map((iv, i) => (
                <div className="invoice-row" key={i}>
                  <div className="inv-l"><span className="inv-t">{iv.t}</span><span className="inv-d">{iv.d}</span></div>
                  <div className="inv-r"><span className="inv-a tnum">${iv.a.toFixed(2)}</span><button className="inv-dl">Receipt</button></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bill-card card">
            <h3 className="co-h">Billing details</h3>
            <div className="invoice-list" style={{ marginTop: 6 }}>
              <div className="set-row"><span><Icon name="user" size={16} /> Name</span><span className="set-go">Amara Okafor</span></div>
              <div className="set-row"><span><Icon name="globe" size={16} /> Country</span><span className="set-go">United Kingdom ›</span></div>
              <div className="set-row"><span><Icon name="ticket" size={16} /> Tax ID</span><span className="set-go">Add ›</span></div>
              <div className="set-row"><span><Icon name="bell" size={16} /> Email receipts</span><span className="set-go">amara@gmail.com</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Wallet, Referral, DigitalTicket, Billing, QR, Barcode });
