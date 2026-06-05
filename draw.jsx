// draw.jsx — animated live draw machine + win reveal
function Draw({ gameId, go, slip, onResult }) {
  const game = LOTTO.gameById(gameId) || LOTTO.GAMES[0];
  const p = game.pick;
  const lines = (slip && slip.lines && slip.lines.length) ? slip.lines : [LOTTO.quickPick(game)];

  const [phase, setPhase] = useState("ready"); // ready | drawing | done
  const [drawn, setDrawn] = useState({ main: [], bonus: [] });
  const [winning] = useState(() => LOTTO.quickPick(game));
  const [result, setResult] = useState(null);
  const [confetti, setConfetti] = useState(false);

  function start() {
    setPhase("drawing");
    setDrawn({ main: [], bonus: [] });
    const seqMain = winning.main;
    const seqBonus = winning.bonus;
    let i = 0;
    const total = seqMain.length + seqBonus.length;
    const step = () => {
      i++;
      if (i <= seqMain.length) {
        setDrawn((d) => ({ ...d, main: seqMain.slice(0, i) }));
      } else {
        const bi = i - seqMain.length;
        setDrawn((d) => ({ ...d, bonus: seqBonus.slice(0, bi) }));
      }
      if (i < total) setTimeout(step, 1050);
      else setTimeout(finish, 1100);
    };
    setTimeout(step, 700);
  }

  function finish() {
    // evaluate every line, keep the best
    let best = null;
    lines.forEach((ln, idx) => {
      const mMatch = ln.main.filter((n) => winning.main.includes(n)).length;
      const bMatch = ln.bonus.filter((n) => winning.bonus.includes(n)).length;
      const prize = prizeFor(game, mMatch, bMatch);
      const r = { idx, mMatch, bMatch, prize, line: ln };
      if (!best || prize.amount > best.prize.amount || (prize.amount === best.prize.amount && mMatch > best.mMatch)) best = r;
    });
    const totalWin = lines.reduce((sum, ln) => {
      const mMatch = ln.main.filter((n) => winning.main.includes(n)).length;
      const bMatch = ln.bonus.filter((n) => winning.bonus.includes(n)).length;
      return sum + prizeFor(game, mMatch, bMatch).amount;
    }, 0);
    setResult({ best, totalWin });
    setPhase("done");
    if (totalWin > 0) { setConfetti(true); setTimeout(() => setConfetti(false), 4200); }
    if (onResult) onResult({ gameId: game.id, lines, winning, totalWin, when: "Just now" });
  }

  return (
    <div className="screen draw" style={{ "--tint": game.tint }}>
      <Confetti run={confetti} />
      <div className="draw-head container">
        <button className="back-btn" onClick={() => go("picker", game.id)}><Icon name="chevronL" size={18} /> Edit numbers</button>
        <span className="chip chip-live"><span className="dot" /> <Emblem id={game.id} size={18} /> {game.name} · Live draw</span>
      </div>

      <div className="draw-stage container">
        {/* MACHINE */}
        <div className={`machine ${phase}`}>
          <div className="machine-glow" />
          <div className="sphere">
            <div className="sphere-shine" />
            <div className="tumble">
              {[...game.hot, ...winning.main].slice(0, 9).map((n, i) => (
                <span key={i} className="tball" style={{ animationDelay: `${-i * 0.6}s`, animationDuration: `${2.6 + (i % 4) * 0.5}s` }}>
                  <Ball n={n} size={30 + (i % 3) * 8} kind={i % 5 === 4 ? "bonus" : "main"} />
                </span>
              ))}
            </div>
            <div className="sphere-mouth" />
          </div>
          <div className="machine-base">
            {phase === "ready" && (
              <Btn variant="gold" size="lg" icon="play" onClick={start}>Start the draw</Btn>
            )}
            {phase === "drawing" && <span className="drawing-label"><span className="dot" /> Drawing…</span>}
            {phase === "done" && (
              <Btn variant="ghost" icon="refresh" onClick={() => { setPhase("ready"); setDrawn({ main: [], bonus: [] }); setResult(null); }}>Replay</Btn>
            )}
          </div>
        </div>

        {/* DRAWN NUMBERS */}
        <div className="draw-right">
          <div className="drawn-panel card">
            <span className="drawn-label">Winning numbers</span>
            <div className="drawn-row">
              {Array.from({ length: p.main }, (_, i) => (
                drawn.main[i] != null
                  ? <Ball key={i} n={drawn.main[i]} size={52} picked />
                  : <span key={i} className="drawn-slot" />
              ))}
              {p.bonus > 0 && <span className="drawn-div" />}
              {Array.from({ length: p.bonus }, (_, i) => (
                drawn.bonus[i] != null
                  ? <Ball key={"b" + i} n={drawn.bonus[i]} kind="bonus" size={52} picked />
                  : <span key={"b" + i} className="drawn-slot" />
              ))}
            </div>
            {phase === "ready" && <p className="drawn-hint">Press start — {p.main} main{p.bonus ? ` + ${p.bonus} ${p.bonusName}` : ""} balls will be drawn live.</p>}
          </div>

          {/* RESULT */}
          {phase === "done" && result && (
            <div className={`result-card card ${result.totalWin > 0 ? "win" : "nowin"}`}>
              {result.totalWin > 0 ? (
                <>
                  <span className="rc-eyebrow text-gold"><Icon name="trophy" size={16} /> {result.best.prize.tier}</span>
                  <div className="rc-amount">You won <span className="text-gold tnum">{LOTTO.formatFull(result.totalWin, game.currency)}</span></div>
                  <p className="rc-sub">Matched {result.best.mMatch} number{result.best.mMatch !== 1 ? "s" : ""}{result.best.bMatch ? ` + ${result.best.bMatch} ${p.bonusName}` : ""} on your best line. Winnings credited to your wallet.</p>
                </>
              ) : (
                <>
                  <span className="rc-eyebrow"><Icon name="sparkle" size={16} /> So close</span>
                  <div className="rc-amount nowin-amt">No win this time</div>
                  <p className="rc-sub">Best line matched {result.best.mMatch} number{result.best.mMatch !== 1 ? "s" : ""}. The next {game.name} draw is already rolling.</p>
                </>
              )}
              <div className="rc-actions">
                <Btn variant="gold" icon="dice" onClick={() => go("picker", game.id, { quick: true })}>Play again</Btn>
                <Btn variant="ghost" onClick={() => go("tickets")}>My tickets</Btn>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* YOUR LINES — match highlight */}
      <div className="draw-lines container">
        <h3 className="dl-title">Your {lines.length} line{lines.length !== 1 ? "s" : ""}</h3>
        <div className="dl-list">
          {lines.map((ln, i) => {
            const matchM = ln.main.filter((n) => phase === "done" || drawn.main.includes(n) ? drawn.main.includes(n) : false);
            const matchB = ln.bonus.filter((n) => drawn.bonus.includes(n));
            const r = phase === "done" ? prizeFor(game, ln.main.filter((n) => winning.main.includes(n)).length, ln.bonus.filter((n) => winning.bonus.includes(n)).length) : null;
            return (
              <div className={`dl-row ${r && r.amount > 0 ? "dl-win" : ""}`} key={i}>
                <span className="dl-idx">{i + 1}</span>
                <div className="dl-balls">
                  {ln.main.map((n, j) => (
                    <Ball key={j} n={n} size={30} kind={drawn.main.includes(n) ? "emerald" : "main"} style={!drawn.main.includes(n) && phase === "done" ? { opacity: 0.4 } : {}} />
                  ))}
                  {ln.bonus.map((n, j) => (
                    <Ball key={"b" + j} n={n} size={30} kind="bonus" style={!drawn.bonus.includes(n) && phase === "done" ? { opacity: 0.4 } : {}} />
                  ))}
                </div>
                <span className="dl-status">
                  {phase === "done"
                    ? (r.amount > 0 ? <span className="text-gold tnum">+{LOTTO.formatFull(r.amount, game.currency)}</span> : <span className="dl-miss">—</span>)
                    : <span className="dl-pending tnum">{matchM.length + matchB.length} hit</span>}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Simplified prize table scaled to the game jackpot
function prizeFor(game, mMatch, bMatch) {
  const p = game.pick;
  const jp = game.jackpot;
  const allMain = mMatch === p.main;
  const allBonus = bMatch === p.bonus;
  if (allMain && allBonus) return { tier: "JACKPOT!", amount: jp };
  if (allMain) return { tier: "Match " + p.main, amount: Math.round(jp * 0.004) };
  const frac = mMatch + bMatch;
  if (p.bonus > 0 && mMatch >= p.main - 1 && bMatch >= 1) return { tier: "2nd tier", amount: Math.round(jp * 0.0008) };
  if (mMatch >= p.main - 1) return { tier: "High match", amount: 1800 };
  if (mMatch >= p.main - 2) return { tier: "Mid match", amount: 140 };
  if (mMatch >= 2 && p.bonus > 0 && bMatch >= 1) return { tier: "Small win", amount: 12 };
  if (mMatch >= 3) return { tier: "Small win", amount: 9 };
  return { tier: "No win", amount: 0 };
}

Object.assign(window, { Draw, prizeFor });
