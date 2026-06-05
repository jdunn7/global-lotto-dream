// picker.jsx — build-a-ticket number picker with Lucky Dip
function Picker({ gameId, autoQuick, go, slip, setSlip }) {
  const game = LOTTO.gameById(gameId) || LOTTO.GAMES[0];
  const p = game.pick;
  const [cur, setCur] = useState({ main: [], bonus: [] });
  const [lines, setLines] = useState([]);
  const [flash, setFlash] = useState(null); // 'quick'
  const mainFull = cur.main.length === p.main;
  const bonusFull = cur.bonus.length === p.bonus;
  const lineComplete = mainFull && bonusFull;

  useEffect(() => { if (autoQuick) doQuick(); /* eslint-disable-next-line */ }, []);

  function toggle(kind, n) {
    setCur((c) => {
      const arr = c[kind];
      const max = kind === "main" ? p.main : p.bonus;
      if (arr.includes(n)) return { ...c, [kind]: arr.filter((x) => x !== n) };
      if (arr.length >= max) return c;
      return { ...c, [kind]: [...arr, n].sort((a, b) => a - b) };
    });
  }
  function doQuick() {
    const q = LOTTO.quickPick(game);
    setFlash("quick");
    setCur(q);
    setTimeout(() => setFlash(null), 600);
  }
  function clearCur() { setCur({ main: [], bonus: [] }); }
  function addLine() {
    if (!lineComplete) return;
    setLines((l) => [...l, cur]);
    setCur({ main: [], bonus: [] });
  }
  function removeLine(i) { setLines((l) => l.filter((_, j) => j !== i)); }
  function quickAddMany(n) {
    const more = Array.from({ length: n }, () => LOTTO.quickPick(game));
    setLines((l) => [...l, ...more]);
  }

  const allLines = lineComplete ? [...lines, cur] : lines;
  const cost = allLines.length * game.price;

  function enterDraw() {
    let final = lines.slice();
    if (lineComplete) final = [...final, cur];
    if (final.length === 0) final = [LOTTO.quickPick(game)];
    setSlip({ gameId: game.id, lines: final, cost: final.length * game.price });
    go("checkout", game.id);
  }

  return (
    <div className="screen picker">
      <div className="picker-head container" style={{ "--tint": game.tint }}>
        <button className="back-btn" onClick={() => go("home")}><Icon name="chevronL" size={18} /> Back</button>
        <div className="ph-main">
          <div className="ph-title">
            <Emblem id={game.id} size={50} />
            <div>
              <h2>{game.name}</h2>
              <span className="ph-sub">{game.region} · {game.cadence}</span>
            </div>
          </div>
          <div className="ph-meta">
            <div className="ph-jp">
              <span className="ph-jp-l">Estimated jackpot</span>
              <span className="ph-jp-v text-gold tnum">{LOTTO.formatMoney(game.jackpot, game.currency)}</span>
            </div>
            <div className="ph-cd">
              <span className="ph-jp-l">Draw closes in</span>
              <Countdown targetISO={game.nextDrawISO} compact />
            </div>
          </div>
        </div>
      </div>

      <div className="picker-body container">
        {/* LEFT — boards */}
        <div className="picker-board card">
          <div className="board-head">
            <div>
              <h3>Pick {p.main} numbers</h3>
              <span className="board-hint">Tap to choose your {p.main} main numbers from 1–{p.mainMax}</span>
            </div>
            <div className="board-progress">
              <span className="bp-count tnum">{cur.main.length}<span className="bp-of">/{p.main}</span></span>
            </div>
          </div>

          <div className={`num-grid ${flash === "quick" ? "is-quick" : ""}`}>
            {Array.from({ length: p.mainMax }, (_, i) => i + 1).map((n) => {
              const on = cur.main.includes(n);
              const hot = game.hot.includes(n);
              return (
                <button key={n} className={`num ${on ? "num-on" : ""}`} onClick={() => toggle("main", n)}>
                  {n}
                  {hot && !on && <span className="num-hot" title="Hot number"><Icon name="flame" size={10} /></span>}
                </button>
              );
            })}
          </div>

          {p.bonus > 0 && (
            <div className="bonus-block">
              <div className="board-head">
                <div>
                  <h3>{p.bonusName}</h3>
                  <span className="board-hint">Pick {p.bonus} from 1–{p.bonusMax}</span>
                </div>
                <div className="board-progress">
                  <span className="bp-count tnum">{cur.bonus.length}<span className="bp-of">/{p.bonus}</span></span>
                </div>
              </div>
              <div className="num-grid bonus-grid">
                {Array.from({ length: p.bonusMax }, (_, i) => i + 1).map((n) => {
                  const on = cur.bonus.includes(n);
                  return (
                    <button key={n} className={`num num-b ${on ? "num-b-on" : ""}`} onClick={() => toggle("bonus", n)}>{n}</button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="board-actions">
            <Btn variant="ghost" icon="dice" onClick={doQuick}>Lucky Dip</Btn>
            <Btn variant="ghost" icon="refresh" onClick={clearCur}>Clear</Btn>
            <div className="spacer" />
            <Btn variant="primary" icon="plus" onClick={addLine} disabled={!lineComplete}
              style={!lineComplete ? { opacity: 0.45, cursor: "not-allowed" } : {}}>Add line</Btn>
          </div>

          {/* current selection preview */}
          <div className="cur-preview">
            <span className="cur-label">Your line</span>
            <div className="cur-balls">
              {Array.from({ length: p.main }, (_, i) => (
                cur.main[i] ? <Ball key={i} n={cur.main[i]} size={40} picked /> : <Ball key={i} n="" kind="blank" size={40} />
              ))}
              {p.bonus > 0 && <span className="cur-div" />}
              {Array.from({ length: p.bonus }, (_, i) => (
                cur.bonus[i] ? <Ball key={"b" + i} n={cur.bonus[i]} kind="bonus" size={40} picked /> : <Ball key={"b" + i} n="" kind="blank" size={40} />
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — bet slip */}
        <aside className="bet-slip card">
          <div className="slip-head">
            <h3><Icon name="ticket" size={18} /> Your slip</h3>
            <span className="chip">{allLines.length} {allLines.length === 1 ? "line" : "lines"}</span>
          </div>

          <div className="quick-many">
            <span>Quick add:</span>
            {[1, 3, 5].map((n) => (
              <button key={n} className="qm-btn" onClick={() => quickAddMany(n)}>+{n} Lucky Dip{n > 1 ? "s" : ""}</button>
            ))}
          </div>

          <div className="slip-lines">
            {allLines.length === 0 && (
              <div className="slip-empty">
                <Icon name="ticket" size={28} />
                <p>No lines yet. Pick numbers or tap a Lucky Dip to start.</p>
              </div>
            )}
            {lines.map((ln, i) => (
              <SlipLine key={i} idx={i + 1} line={ln} pick={p} onRemove={() => removeLine(i)} />
            ))}
            {lineComplete && <SlipLine idx={lines.length + 1} line={cur} pick={p} pending onRemove={clearCur} />}
          </div>

          <div className="slip-foot">
            <div className="slip-cost">
              <span>{allLines.length} × {game.currency}{game.price.toFixed(2)}</span>
              <span className="slip-total tnum">{game.currency}{cost.toFixed(2)}</span>
            </div>
            <Btn variant="gold" size="lg" className="slip-cta" iconRight="arrowR" onClick={enterDraw}>
              {allLines.length ? "Continue to payment" : "Lucky Dip & continue"}
            </Btn>
            <span className="slip-note"><Icon name="shield" size={12} /> Tickets checked automatically · winnings auto-paid</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

function SlipLine({ idx, line, pick, onRemove, pending }) {
  return (
    <div className={`slip-line ${pending ? "slip-line-pending" : ""}`}>
      <span className="sl-idx">{pending ? "•" : idx}</span>
      <div className="sl-balls">
        {line.main.map((n, i) => <Ball key={i} n={n} size={26} />)}
        {line.bonus.map((n, i) => <Ball key={"b" + i} n={n} kind="bonus" size={26} />)}
      </div>
      <button className="sl-x" onClick={onRemove}><Icon name="close" size={14} /></button>
    </div>
  );
}

Object.assign(window, { Picker });
