// extras.jsx — Rewards (value-adds), Results, Affiliate signup modal, winner toast

/* ============================ REWARDS / VALUE-ADDS ============================ */
function Rewards({ go, user, onAffiliate }) {
  const [claimed, setClaimed] = useState(false);
  const loyalty = 6400,loyaltyNext = 10000;
  const offers = [
  { ic: "ticket", tag: "New players", t: "Free EuroMillions line", s: "Get your first line free when you deposit $10+.", cta: "Claim offer", g: false },
  { ic: "users", tag: "Refer & earn", t: "Give $10, get $10", s: "Friends get $10 off their first ticket — you earn too.", cta: "Invite friends", g: false, to: "referral" },
  { ic: "flame", tag: "This weekend", t: "2× jackpot boost", s: "Add a booster for a shot at double the top prize.", cta: "See games", g: true, to: "home" }];

  const more = [
  { ic: "trophy", t: "VIP & loyalty", s: "Earn points on every ticket. Unlock cashback, free plays and faster payouts as you climb." },
  { ic: "refresh", t: "Auto-play & save", s: "Never miss a draw — set numbers to renew and save up to 10% on multi-draw bundles." },
  { ic: "shield", t: "Win protection", s: "Every line auto-checked. Winnings credited instantly — no claim forms, ever." }];

  return (
    <div className="screen rewards">
      <div className="container">
        {/* daily reward hero */}
        <div className="rw-hero card">
          <div className="rw-hero-l">
            <span className="eyebrow"><Icon name="gift" size={14} /> Daily reward</span>
            <h1 className="rw-h1">Come back daily,<br /><span className="text-gold">win free plays.</span></h1>
            <p className="rw-lead">Claim a reward every day — free lines, bonus cash, or jackpot boosters. Your streak multiplies the prize.</p>
            <div className="rw-streak">
              {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) =>
              <div key={d} className={`rw-day ${i < 4 ? "done" : ""} ${i === 4 ? "today" : ""}`}>
                  <span className="rw-day-d">{d}</span>
                  <span className="rw-day-ic">{i < 4 ? <Icon name="check" size={14} /> : i === 4 ? <Icon name="gift" size={14} /> : "?"}</span>
                </div>
              )}
            </div>
            <Btn variant={claimed ? "ghost" : "gold"} size="lg" icon={claimed ? "check" : "gift"} onClick={() => setClaimed(true)} disabled={claimed}>
              {claimed ? "Claimed — see you tomorrow!" : "Claim today's reward"}
            </Btn>
          </div>
          <div className="rw-hero-r">
            <div className="rw-prize">
              <span className="rw-prize-l">Day 5 reward</span>
              <div className="rw-prize-orb"><Icon name="ticket" size={30} /></div>
              <span className="rw-prize-v">1 free line</span>
              <span className="rw-prize-s">+ 250 loyalty points</span>
            </div>
          </div>
        </div>

        {/* loyalty progress */}
        <div className="rw-loyalty card">
          <div className="rw-loy-top">
            <div><span className="rw-loy-tier"><Icon name="trophy" size={15} /> Gold tier</span><span className="rw-loy-sub">{loyalty.toLocaleString()} / {loyaltyNext.toLocaleString()} pts to Platinum</span></div>
            <div className="rw-loy-perks">{["5% cashback", "Priority payouts", "Birthday bonus"].map((p) => <span key={p} className="chip chip-gold">{p}</span>)}</div>
          </div>
          <div className="rw-loy-bar"><span style={{ width: loyalty / loyaltyNext * 100 + "%" }} /></div>
        </div>

        {/* featured offers */}
        <div className="sec-head" style={{ marginTop: 30 }}><div><span className="sec-ey"><Icon name="flame" size={15} /> Live offers</span><h2>Offers &amp; boosters</h2></div></div>
        <div className="rw-offers">
          {offers.map((o, i) =>
          <div className={`rw-offer card ${o.g ? "rw-offer-gold" : ""}`} key={i}>
              <div className="rw-offer-top"><span className="rw-offer-ic"><Icon name={o.ic} size={20} /></span><span className="rw-offer-tag">{o.tag}</span></div>
              <h3 className="rw-offer-t">{o.t}</h3>
              <p className="rw-offer-s">{o.s}</p>
              <Btn variant={o.g ? "gold" : "primary"} size="sm" iconRight="arrowR" onClick={() => o.to ? go(o.to) : null}>{o.cta}</Btn>
            </div>
          )}
        </div>

        {/* perks grid */}
        <div className="rw-perks">
          {more.map((m, i) =>
          <div className="rw-perk card" key={i}>
              <span className="hub-ic"><Icon name={m.ic} size={20} /></span>
              <div><h4 className="rw-perk-t">{m.t}</h4><p className="rw-perk-s">{m.s}</p></div>
            </div>
          )}
        </div>

        {/* syndicates teaser */}
        <div className="rw-synd card">
          <div className="rw-synd-l">
            <span className="eyebrow"><Icon name="users" size={14} /> Play together</span>
            <h2 className="rw-synd-h">Join a syndicate, multiply your odds</h2>
            <p className="rw-synd-s">Pool tickets with players worldwide. More lines, more chances — winnings split automatically to every member's wallet.</p>
            <div className="rw-synd-stats"><div><span className="tnum">40×</span> more lines</div><div><span className="tnum">12k</span> active groups</div><div><span className="tnum">$3.1M</span> shared in May</div></div>
            <Btn variant="primary" icon="users">Browse syndicates</Btn>
          </div>
          <div className="rw-synd-r">
            <div className="rw-synd-avas">{Array.from({ length: 9 }).map((_, i) => <span key={i} style={{ background: `hsl(${LOTTO.GAMES[i % 6].tint})` }}>{String.fromCharCode(65 + i)}</span>)}</div>
          </div>
        </div>

        {/* become an affiliate */}
        <div className="rw-aff card" onClick={onAffiliate}>
          <div className="rw-aff-l"><span className="rw-aff-ic"><Icon name="trophy" size={22} /></span><div><h3>Turn your network into income</h3><p>Earn up to 8% commission across 3 levels. Free to join, paid weekly.</p></div></div>
          <Btn variant="gold" iconRight="arrowR" onClick={(e) => {e.stopPropagation();onAffiliate();}}>Become an affiliate</Btn>
        </div>
      </div>
    </div>);

}

/* ============================ RESULTS ============================ */
function Results({ go }) {
  const rows = LOTTO.GAMES.map((g) => {
    const base = LOTTO.RESULTS.find((r) => r.id === g.id);
    return base ? { ...base, g } : { id: g.id, g, date: "Latest draw", balls: g.hot.slice(0, g.pick.main), bonus: g.pick.bonus ? [g.hot[0]] : [], jackpotWon: false };
  });
  return (
    <div className="screen results-screen">
      <div className="container">
        <div className="sec-head"><div><span className="sec-ey"><Icon name="check" size={15} /> Official results</span><h2>Latest draw results</h2></div>
          <span className="chip"><Icon name="clock" size={13} /> Updated live</span></div>
        <div className="res-list">
          {rows.map((r, i) =>
          <div className="res-card card" key={i}>
              <div className="res-game"><Emblem id={r.id} size={44} /><div><h3>{r.g.name}</h3><span className="res-date">{r.date} · {r.g.cadence}</span></div></div>
              <div className="res-balls">
                {r.balls.map((b, j) => <Ball key={j} n={b} size={36} />)}
                {(r.bonus || []).map((b, j) => <Ball key={"b" + j} n={b} kind="bonus" size={36} />)}
              </div>
              <div className="res-right">
                {r.jackpotWon ? <span className="res-won text-gold">Jackpot won!</span> : <span className="res-roll">Rolls to {LOTTO.formatMoney(r.g.jackpot, r.g.currency)}</span>}
                <Btn variant="ghost" size="sm" iconRight="arrowR" onClick={() => go("picker", r.id)}>Play next draw</Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>);

}

/* ============================ AFFILIATE SIGNUP MODAL ============================ */
function AffiliateModal({ open, onClose }) {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  useEffect(() => {if (open) setStep(0);}, [open]);
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="aff-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose}><Icon name="close" size={18} /></button>
        {step === 0 ?
        <>
            <span className="aff-badge"><Icon name="trophy" size={22} /></span>
            <h2 className="aff-h2">Become a Lotto Global affiliate</h2>
            <p className="aff-sub">Earn commission every time your network plays — three levels deep. It's free to join and pays out weekly.</p>
            <div className="aff-tiers">
              {[{ l: "Level 1", r: "8%", d: "Direct referrals" }, { l: "Level 2", r: "4%", d: "Their referrals" }, { l: "Level 3", r: "2%", d: "Three deep" }].map((t) =>
            <div className="aff-tier" key={t.l}><span className="aff-tier-r text-gold">{t.r}</span><span className="aff-tier-l">{t.l}</span><span className="aff-tier-d">{t.d}</span></div>
            )}
            </div>
            <ul className="aff-benefits">
              {["Real-time dashboard & network tree", "Instant payouts to wallet, bank or crypto", "Marketing toolkit: links, QR, banners", "Climb tiers for higher rates & perks"].map((b) =>
            <li key={b}><span className="aff-check"><Icon name="check" size={12} /></span>{b}</li>
            )}
            </ul>
            <div className="aff-form">
              <input placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Btn variant="gold" size="lg" iconRight="arrowR" onClick={() => setStep(1)}>Join free</Btn>
            </div>
            <span className="aff-fine">No fees · 18+ · Commission paid on net ticket revenue</span>
          </> :

        <div className="aff-done">
            <span className="confirm-badge"><Icon name="check" size={36} /></span>
            <h2 className="aff-h2">You're an affiliate! 🎉</h2>
            <p className="aff-sub">Your unique link is ready. Share it and start earning — your dashboard is live.</p>
            <div className="aff-link">lottoglobal.app/r/AMARA777</div>
            <div className="aff-done-cta">
              <a className="btn btn-gold btn-md" href="Affiliate Dashboard.html">Open dashboard <Icon name="arrowR" size={16} /></a>
              <Btn variant="ghost" onClick={onClose}>Maybe later</Btn>
            </div>
          </div>
        }
      </div>
    </div>);

}

/* ============================ WINNER TOAST (interest driver) ============================ */
function WinnerToast() {
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  useEffect(() => {
    let t;
    const cycle = () => {setShow(true);t = setTimeout(() => {setShow(false);setTimeout(() => setIdx((i) => i + 1), 600);}, 4500);};
    const first = setTimeout(cycle, 9000);
    const iv = setInterval(cycle, 24000);
    return () => {clearTimeout(first);clearTimeout(t);clearInterval(iv);};
  }, []);
  const w = LOTTO.WINNERS[idx % LOTTO.WINNERS.length];
  return (
    <div className={`winner-toast ${show ? "show" : ""}`}>
      <span className="wt-ava" style={{ background: `hsl(${LOTTO.GAMES[idx % 6].tint})` }}>{w.name[0]}</span>
      <div className="wt-info"><span className="wt-name">{w.name} just won</span><span className="wt-sub">{w.game} · {w.city}</span></div>
      <span className="wt-amt text-gold tnum">{LOTTO.formatMoney(w.amount, "$")}</span>
    </div>);

}

/* ============================ LIVE LOTTO NEWS ============================ */
function News({ go }) {
  const total = LOTTO.GAMES.reduce((a, g) => a + g.jackpot, 0);
  const headlines = [
  { id: "euromillions", t: "EuroMillions rolls again — jackpot climbs to €211M", s: "No ticket matched all seven numbers on Tuesday, pushing Friday's top prize toward the cap.", when: "2h ago", region: "Europe", hot: true },
  { id: "powerball", t: "Powerball nears $386M ahead of Saturday's draw", s: "A 14-week rollover streak continues across all participating states.", when: "5h ago", region: "USA" },
  { id: "megamillions", t: "Single ticket scoops $154M Mega Millions prize", s: "The winning ticket was sold in the Midwest; the holder has 180 days to claim.", when: "yesterday", region: "USA" },
  { id: "uklotto", t: "UK Lotto jackpot won — £7.8M to one lucky player", s: "Saturday's must-win draw saw the cap reached and the prize paid in full.", when: "yesterday", region: "UK" },
  { id: "elgordo", t: "El Gordo builds toward a record Sunday draw", s: "Spain's weekly draw climbs to €18.2M as ticket sales surge nationwide.", when: "2d ago", region: "Spain" }];

  const movers = LOTTO.GAMES.map((g, i) => ({ g, up: i % 4 !== 0, pct: 2 + i * 3 % 9 }));
  return (
    <div className="screen news">
      <div className="container">
        <div className="news-hero card">
          <div className="news-hero-l">
            <span className="chip chip-live"><span className="dot" /> Live · worldwide</span>
            <h1 className="news-h1">Lotto news &amp; data,<br /><span className="text-emerald">from every corner of the world.</span></h1>
            <p className="news-lead">Jackpots, results and winners across the biggest global lotteries — updated the moment draws happen.</p>
          </div>
          <div className="news-global">
            <span className="ng-l">Total jackpots live right now</span>
            <span className="ng-v text-gold tnum">{LOTTO.formatFull(total, "$")}</span>
            <div className="news-movers">
              {movers.map((m) =>
              <div className="mover" key={m.g.id}>
                  <Emblem id={m.g.id} size={22} />
                  <span className="mover-name">{m.g.name}</span>
                  <span className={`mover-pct ${m.up ? "up" : "flat"}`}>{m.up ? "▲" : "•"} {m.up ? m.pct + "%" : "held"}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="news-cols">
          <div>
            <div className="sec-head"><div><span className="sec-ey"><Icon name="flame" size={15} /> Breaking</span><h2>Latest headlines</h2></div></div>
            <div className="news-feed">
              {headlines.map((h, i) => {
                const g = LOTTO.gameById(h.id);
                return (
                  <div className={`news-card card card-hover ${i === 0 ? "news-lead-card" : ""}`} key={i} onClick={() => go("results")}>
                    <div className="nc-side" style={{ background: `radial-gradient(120% 120% at 50% 0%, hsl(${g.tint}/0.35), var(--bg-card-2))` }}><Emblem id={h.id} size={i === 0 ? 54 : 40} /></div>
                    <div className="nc-body">
                      <div className="nc-meta"><span className="nc-tag">{h.region}</span>{h.hot && <span className="nc-hot"><Icon name="flame" size={11} /> Trending</span>}<span className="nc-when">{h.when}</span></div>
                      <h3 className="nc-title">{h.t}</h3>
                      <p className="nc-sum">{h.s}</p>
                      <span className="nc-read">Read &amp; play <Icon name="arrowR" size={14} /></span>
                    </div>
                  </div>);

              })}
            </div>
          </div>

          <aside className="news-aside">
            <div className="card pad-card">
              <div className="panel-head2"><h3>Upcoming draws</h3></div>
              <div className="news-sched">
                {LOTTO.GAMES.slice(0, 5).map((g) =>
                <div className="sched-row" key={g.id} onClick={() => go("picker", g.id)}>
                    <Emblem id={g.id} size={30} />
                    <div className="sched-info"><span className="sched-name">{g.name}</span><span className="sched-jp text-gold tnum">{LOTTO.formatMoney(g.jackpot, g.currency)}</span></div>
                    <Countdown targetISO={g.nextDrawISO} compact />
                  </div>
                )}
              </div>
            </div>
            <div className="card pad-card">
              <div className="panel-head2"><h3>Winners worldwide</h3><span className="chip chip-live"><span className="dot" /> Live</span></div>
              <div className="winners-list">
                {LOTTO.WINNERS.map((w, i) =>
                <div className="winner-row" key={i}>
                    <div className="wr-ava" style={{ background: `linear-gradient(135deg, hsl(${LOTTO.GAMES[i % 6].tint}), hsl(${LOTTO.GAMES[(i + 2) % 6].tint}))` }}>{w.name[0]}</div>
                    <div className="wr-info"><span className="wr-name">{w.name} · {w.city}</span><span className="wr-game">{w.game} · {w.when}</span></div>
                    <span className="wr-amt text-gold tnum">{LOTTO.formatMoney(w.amount, "$")}</span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>

        <div className="sec-head" style={{ marginTop: 30 }}><div><span className="sec-ey"><Icon name="globe" size={15} /> Around the world</span><h2>Latest results</h2></div>
          <button className="link-more" onClick={() => go("results")}>All results <Icon name="chevron" size={16} /></button></div>
        <div className="news-results">
          {LOTTO.GAMES.map((g) => {
            const r = LOTTO.RESULTS.find((x) => x.id === g.id);
            const balls = r ? r.balls : g.hot.slice(0, g.pick.main);
            const bonus = r ? r.bonus : [];
            return (
              <div className="nres card" key={g.id} onClick={() => go("picker", g.id)}>
                <div className="nres-top"><Emblem id={g.id} size={34} /><div><span className="nres-name">{g.name}</span><span className="nres-date">{r ? r.date : "Next draw"}</span></div></div>
                <div className="nres-balls">{balls.map((b, j) => <Ball key={j} n={b} size={28} />)}{bonus.map((b, j) => <Ball key={"b" + j} n={b} kind="bonus" size={28} />)}</div>
              </div>);

          })}
        </div>
      </div>
    </div>);

}

/* ============================ SECURITY / PAYMENT BADGES ============================ */
function SecurityBadges({ payments = true, trust = true, className = "" }) {
  const badges = [
  { ic: "shield", t: "256-bit SSL" },
  { ic: "shield", t: "PCI DSS L1" },
  { ic: "check", t: "Licensed & regulated" },
  { ic: "users", t: "18+ Play responsibly" },
  { ic: "wallet", t: "Verified instant payouts" }];

  const pays = [
  { l: "VISA", c: "visa" },
  { l: "Mastercard", c: "mc" },
  { l: "PayPal", c: "pp" },
  { l: "Pay", c: "ap" },
  { l: "G Pay", c: "gp" },
  { l: "USDC", c: "usdc" }];

  return (
    <div className={"sec-badges " + className} style={{ textAlign: "center", justifyContent: "center" }}>
      {trust &&
      <div className="sb-trust">
          {badges.map((b, i) =>
        <span className="sb-badge" key={i}><Icon name={b.ic} size={13} /> {b.t}</span>
        )}
        </div>
      }
      {payments &&
      <div className="sb-pays">
          {pays.map((p) =>
        <span className={`sb-pay sb-pay-${p.c}`} key={p.c}>{p.c === "ap" && <span className="sb-apple"></span>}{p.l}</span>
        )}
        </div>
      }
    </div>);

}

Object.assign(window, { Rewards, Results, AffiliateModal, WinnerToast, News, SecurityBadges });