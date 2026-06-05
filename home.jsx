// home.jsx — Lotto Global home dashboard
function Home({ go, addToCart }) {
  const games = LOTTO.GAMES;
  const hero = games[0];
  const [heroIdx, setHeroIdx] = useState(0);
  const featured = games[heroIdx];

  return (
    <div className="screen home">
      {/* HERO */}
      <section className="hero">
        <div className="hero-glow" style={{ background: `radial-gradient(50% 60% at 70% 30%, hsl(${featured.tint} / 0.28), transparent 70%)` }} />
        <div className="hero-left">
          <span className="eyebrow"><span className="dot-live" /> <Emblem id={featured.id} size={18} /> {featured.name} · {featured.cadence}</span>
          <h1 className="hero-title">
            Tonight you could win<br />
            <span className="text-gold">{LOTTO.formatMoney(featured.jackpot, featured.currency)}</span>
          </h1>
          <p className="hero-sub">
            {featured.tagline}. Pick your numbers or let fate decide with a Lucky Dip — playable across {games.length} of the world's biggest lotteries.
          </p>
          <div className="hero-cd">
            <span className="cd-pre"><Icon name="clock" size={15} /> Draw closes in</span>
            <Countdown targetISO={featured.nextDrawISO} />
          </div>
          <div className="hero-cta">
            <Btn variant="gold" size="lg" icon="grid" onClick={() => go("picker", featured.id)}>Pick Numbers</Btn>
            <Btn variant="ghost" size="lg" icon="dice" onClick={() => go("picker", featured.id, { quick: true })}>Lucky Dip</Btn>
          </div>
          <div className="hero-switch">
            {games.map((g, i) => (
              <button key={g.id} className={`hsw ${i === heroIdx ? "active" : ""}`} onClick={() => setHeroIdx(i)}>
                <Emblem id={g.id} size={22} />
                <span className="hsw-jp tnum">{LOTTO.formatMoney(g.jackpot, g.currency)}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="hero-right">
          <HeroMachine game={featured} />
        </div>
      </section>

      <div className="container">
        <JackpotTicker />
        <div className="offers-band">
          <button className="offer-mini card card-hover" onClick={() => go("rewards")}>
            <span className="offer-mini-ic"><Icon name="ticket" size={20} /></span>
            <span className="offer-mini-tx"><span className="offer-mini-t">First line free</span><span className="offer-mini-s">On your first $10 deposit</span></span>
          </button>
          <button className="offer-mini card card-hover gold" onClick={() => go("rewards")}>
            <span className="offer-mini-ic"><Icon name="gift" size={20} /></span>
            <span className="offer-mini-tx"><span className="offer-mini-t">Daily rewards</span><span className="offer-mini-s">Claim a free play every day</span></span>
          </button>
          <button className="offer-mini card card-hover" onClick={() => go("referral")}>
            <span className="offer-mini-ic"><Icon name="users" size={20} /></span>
            <span className="offer-mini-tx"><span className="offer-mini-t">Give $10, get $10</span><span className="offer-mini-s">Refer friends &amp; earn commission</span></span>
          </button>
        </div>
      </div>

      {/* GAME GRID */}
      <section className="container section">
        <div className="sec-head">
          <div>
            <span className="sec-ey"><Icon name="globe" size={15} /> The global board</span>
            <h2>Choose your game</h2>
          </div>
          <button className="link-more" onClick={() => go("games")}>All lotteries <Icon name="chevron" size={16} /></button>
        </div>
        <div className="game-grid">
          {games.map((g) => <GameCard key={g.id} game={g} go={go} />)}
        </div>
      </section>

      {/* RESULTS + WINNERS */}
      <section className="container section two-col">
        <div className="results-panel card">
          <div className="panel-head">
            <h3>Latest results</h3>
            <span className="chip"><Icon name="check" size={13} /> Verified</span>
          </div>
          <div className="results-list">
            {LOTTO.RESULTS.map((r, i) => {
              const g = LOTTO.gameById(r.id);
              return (
                <div className="result-row" key={i}>
                  <div className="result-meta">
                    <span className="rr-game"><Emblem id={r.id} size={24} /> {g.name}</span>
                    <span className="rr-date">{r.date}{r.jackpotWon && <em className="rr-won"> · Jackpot won!</em>}</span>
                  </div>
                  <div className="result-balls">
                    {r.balls.map((b, j) => <Ball key={j} n={b} size={32} />)}
                    {r.bonus.map((b, j) => <Ball key={"b" + j} n={b} kind="bonus" size={32} />)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="winners-panel card">
          <div className="panel-head">
            <h3>Recent winners</h3>
            <span className="chip chip-live"><span className="dot" /> Live</span>
          </div>
          <div className="winners-list">
            {LOTTO.WINNERS.map((w, i) => (
              <div className="winner-row" key={i}>
                <div className="wr-ava" style={{ background: `linear-gradient(135deg, hsl(${LOTTO.GAMES[i % 6].tint}), hsl(${LOTTO.GAMES[(i + 2) % 6].tint}))` }}>
                  {w.name[0]}
                </div>
                <div className="wr-info">
                  <span className="wr-name">{w.name} · {w.city}</span>
                  <span className="wr-game">{w.game} · {w.when}</span>
                </div>
                <span className="wr-amt text-gold tnum">{LOTTO.formatMoney(w.amount, "$")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="container section">
        <div className="trust card">
          {[
            { ic: "shield", t: "Licensed & secure", s: "Regulated play, encrypted wallet" },
            { ic: "users", t: "12.4M players", s: "Across 41 countries" },
            { ic: "trophy", t: "$50M+ paid out", s: "Winnings auto-credited" },
            { ic: "bell", t: "Win alerts", s: "We check every ticket for you" },
          ].map((x, i) => (
            <div className="trust-item" key={i}>
              <div className="trust-ic"><Icon name={x.ic} size={20} /></div>
              <div><div className="trust-t">{x.t}</div><div className="trust-s">{x.s}</div></div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

/* Hero ball machine — slowly tumbling preview balls */
function HeroMachine({ game }) {
  const balls = game.hot;
  return (
    <div className="hero-machine">
      <div className="hm-ring" />
      <div className="hm-ring hm-ring-2" />
      <div className="hm-glass">
        <div className="hm-balls">
          {balls.map((b, i) => (
            <span key={i} className="hm-ball" style={{ animationDelay: `${i * 0.4}s`, left: `${12 + i * 16}%`, top: `${20 + (i % 3) * 22}%` }}>
              <Ball n={b} size={i === 2 ? 64 : 50} kind={i === balls.length - 1 ? "bonus" : "main"} />
            </span>
          ))}
        </div>
        <div className="hm-base">
          <span className="hm-base-label"><Emblem id={game.id} size={22} /> {game.name}</span>
        </div>
      </div>
    </div>
  );
}

/* Game card */
function GameCard({ game, go }) {
  const { d, h } = useCountdown(game.nextDrawISO);
  return (
    <button className="game-card card card-hover" onClick={() => go("picker", game.id)}
      style={{ "--tint": game.tint }}>
      <div className="gc-glow" />
      <div className="gc-top">
        <Emblem id={game.id} size={50} />
        <span className="chip">{game.cadence}</span>
      </div>
      <div className="gc-name">{game.name}</div>
      <div className="gc-region">{game.region}</div>
      <div className="gc-jp">
        <span className="gc-jp-label">Jackpot</span>
        <span className="gc-jp-val text-gold tnum">{LOTTO.formatMoney(game.jackpot, game.currency)}</span>
      </div>
      <div className="gc-foot">
        <span className="gc-next"><Icon name="clock" size={13} /> {d}d {h}h</span>
        <span className="gc-play">Play <Icon name="arrowR" size={14} /></span>
      </div>
    </button>
  );
}

Object.assign(window, { Home });
