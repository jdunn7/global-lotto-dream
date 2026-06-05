// tickets.jsx — wallet + ticket history
function Tickets({ go, history, user, onOpen }) {
  const upcoming = LOTTO.GAMES.slice(0, 3);
  const wallet = user ? user.wallet : 248.5;
  const won = history.filter((t) => t.totalWin > 0).length;
  return (
    <div className="screen tickets">
      <div className="container">
        <div className="tk-hero card">
          <div className="tk-wallet">
            <span className="tk-w-label"><Icon name="wallet" size={15} /> Wallet balance</span>
            <span className="tk-w-val tnum">{LOTTO.formatFull(wallet, "$")}</span>
            <div className="tk-w-actions">
              <Btn variant="gold" size="sm" icon="plus">Top up</Btn>
              <Btn variant="ghost" size="sm">Withdraw</Btn>
            </div>
          </div>
          <div className="tk-stats">
            {[
              { l: "Tickets played", v: String(12 + history.length) },
              { l: "Winning tickets", v: String(won) },
              { l: "Win rate", v: "23%" },
            ].map((s, i) => (
              <div key={i} className="tk-stat">
                <span className="tk-stat-v tnum">{s.v}</span>
                <span className="tk-stat-l">{s.l}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sec-head" style={{ marginTop: 34 }}>
          <h2>My tickets</h2>
          <Btn variant="primary" size="sm" icon="plus" onClick={() => go("home")}>Buy more</Btn>
        </div>

        {history.length === 0 && (
          <div className="card tk-empty">
            <Icon name="ticket" size={32} />
            <h3>No tickets yet</h3>
            <p>Enter a draw and your tickets will appear here. We check every one automatically.</p>
            <Btn variant="gold" icon="grid" onClick={() => go("home")}>Browse games</Btn>
          </div>
        )}

        <div className="tk-list">
          {history.map((t, i) => {
            const g = LOTTO.gameById(t.gameId);
            const active = t.status === "active" || t.winning == null;
            const won = t.totalWin > 0;
            return (
              <div className={`tk-card card ${won ? "tk-won" : ""} ${active ? "tk-active" : ""}`} key={i} onClick={() => onOpen && onOpen(t)} style={{ cursor: "pointer" }}>
                <div className="tk-card-top">
                  <span className="tk-game"><Emblem id={t.gameId} size={26} /> {g.name}</span>
                  <span className={`chip ${active ? "chip-live" : won ? "chip-gold" : ""}`}>
                    {active ? <><span className="dot" /> Active</> : won ? "Winner" : "Checked"}
                  </span>
                </div>
                <div className="tk-when">{t.when} · {t.lines.length} line{t.lines.length !== 1 ? "s" : ""}{t.plan > 1 ? ` · ${t.plan} draws` : ""}</div>
                <div className="tk-winning">
                  <span className="tk-mini-label">{active ? "Your numbers" : "Winning"}</span>
                  <div className="tk-mini-balls">
                    {active
                      ? <>
                          {t.lines[0].main.map((n, j) => <Ball key={j} n={n} size={24} />)}
                          {t.lines[0].bonus.map((n, j) => <Ball key={"b" + j} n={n} kind="bonus" size={24} />)}
                        </>
                      : <>
                          {t.winning.main.map((n, j) => <Ball key={j} n={n} size={24} />)}
                          {t.winning.bonus.map((n, j) => <Ball key={"b" + j} n={n} kind="bonus" size={24} />)}
                        </>}
                  </div>
                </div>
                <div className="tk-card-foot">
                  {active
                    ? <span className="tk-await"><Icon name="clock" size={13} /> Awaiting draw</span>
                    : won
                      ? <span className="text-gold tnum tk-amt">+{LOTTO.formatFull(t.totalWin, g.currency)}</span>
                      : <span className="tk-amt-miss">No win</span>}
                  <button className="link-more" onClick={(e) => { e.stopPropagation(); go("draw", t.gameId); }}>{active ? "Watch draw" : "Replay"} <Icon name="chevron" size={14} /></button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sec-head" style={{ marginTop: 38 }}>
          <h2>Upcoming draws</h2>
        </div>
        <div className="tk-upcoming">
          {upcoming.map((g) => (
            <button key={g.id} className="tk-up card card-hover" onClick={() => go("picker", g.id)}>
              <Emblem id={g.id} size={42} />
              <div className="tk-up-info">
                <span className="tk-up-name">{g.name}</span>
                <span className="tk-up-jp text-gold tnum">{LOTTO.formatMoney(g.jackpot, g.currency)}</span>
              </div>
              <Countdown targetISO={g.nextDrawISO} compact />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Tickets });
