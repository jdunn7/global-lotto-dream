/* hermes-agent.js — "Hermes", an embedded AI operating partner docked at the
   bottom of the PLG Board & Admin console. Wired to window.claude.complete and
   grounded in the live ADMIN dataset. Self-injects CSS; mounts to <body>. */
(function () {
  function grounding() {
    var A = window.ADMIN; if (!A) return "No live data loaded.";
    var k = A.kpis;
    var taxOwed = A.taxes.reduce(function (a, t) { return a + t.owed; }, 0);
    var liab = A.liabilities.reduce(function (a, l) { return a + l.v; }, 0);
    return [
      "PlayLottoGlobal (PLG Holdings Ltd) — FY2026 board figures.",
      "Revenue YTD " + A.money(k.revenueYTD) + "; EBITDA " + A.money(k.ebitdaYTD) + " (" + Math.round(k.netMargin * 100) + "% net margin); gross margin " + Math.round(k.grossMargin * 100) + "%.",
      "Players " + k.players.toLocaleString() + "; YTD signups " + k.signupsYTD.toLocaleString() + "; churn " + (k.churn * 100).toFixed(1) + "%; ARPU $" + k.arpu + "; LTV $" + k.ltv + "; CAC $" + k.cac + " (LTV:CAC " + (k.ltv / k.cac).toFixed(1) + "x).",
      "Cash on hand " + A.money(k.cashOnHand) + "; runway " + k.runwayMo + " months; MoM growth " + (k.mrrGrowth * 100).toFixed(1) + "%.",
      "Top opex: " + A.expenses.slice(0, 3).map(function (e) { return e.cat + " " + A.money(e.val); }).join(", ") + ".",
      "Open risks: " + A.risks.filter(function (r) { return r.status !== "Resolved"; }).map(function (r) { return r.title + " [" + r.sev + "]"; }).join("; ") + ".",
      "Legal exposure " + A.money(A.legal.reduce(function (a, l) { return a + l.exposure; }, 0)) + " across " + A.legal.length + " matters. Total liabilities " + A.money(liab) + ". Tax owed " + A.money(taxOwed) + ".",
      "Cap table: " + A.capTable.map(function (c) { return c.holder + " " + c.pct + "%"; }).join(", ") + ". Entities: " + A.corp.subs.map(function (s) { return s.name; }).join(", ") + " under " + A.corp.parent.name + "."
    ].join(" ");
  }
  var SYS = "You are Hermes, the AI operating partner embedded in PlayLottoGlobal's Board & Admin console. You assist the board and executives across finance, growth, marketing, affiliate operations, risk, legal, accounting, taxes and corporate strategy. Style: concise, sharp, boardroom-professional; lead with the answer, then 1-2 supporting points. Use the LIVE CONTEXT figures when relevant and cite them. If a number isn't in context, say you'd need it wired from the data room. For legal/tax, give direction but flag where qualified counsel is required. Keep replies under ~120 words unless asked to expand.";

  var history = [];
  var CSS =
    "#hermes-spacer{height:74px}" +
    ".hz{position:fixed;left:0;right:0;bottom:0;z-index:300;font-family:var(--font-sans,'Inter',sans-serif)}" +
    ".hz-bar{display:flex;align-items:center;gap:12px;padding:12px 18px;background:linear-gradient(180deg,hsl(222 32% 11%/.96),hsl(222 38% 8%/.98));backdrop-filter:blur(16px);border-top:1px solid hsl(0 0% 100%/.08);box-shadow:0 -16px 40px -24px #000}" +
    ".hz-ava{width:40px;height:40px;border-radius:12px;flex:none;display:flex;align-items:center;justify-content:center;background:linear-gradient(150deg,#c6a86a,#4f63b5);color:#fff;font-family:var(--font-display,'Outfit');font-weight:800;box-shadow:0 8px 20px -8px rgba(79,99,181,.7)}" +
    ".hz-id{flex:none;min-width:0}" +
    ".hz-name{font-family:var(--font-display,'Outfit');font-weight:800;font-size:.92rem;color:#fff;display:flex;align-items:center;gap:7px}" +
    ".hz-dot{width:7px;height:7px;border-radius:50%;background:#5fae86;box-shadow:0 0 0 0 rgba(95,174,134,.6);animation:hzp 1.8s infinite}" +
    "@keyframes hzp{0%,100%{box-shadow:0 0 0 0 rgba(95,174,134,.5)}50%{box-shadow:0 0 0 6px rgba(95,174,134,0)}}" +
    ".hz-role{font-size:.72rem;color:#8a93b5}" +
    ".hz-form{flex:1;display:flex;align-items:center;gap:8px;background:hsl(222 24% 16%/.7);border:1px solid hsl(0 0% 100%/.1);border-radius:999px;padding:5px 6px 5px 18px;max-width:760px;margin:0 auto}" +
    ".hz-form input{flex:1;background:none;border:none;outline:none;color:#fff;font-size:.92rem;font-family:inherit}" +
    ".hz-form input::placeholder{color:#7e87a8}" +
    ".hz-send{width:38px;height:38px;border-radius:50%;border:none;cursor:pointer;flex:none;background:linear-gradient(150deg,#5b76e8,#3b5bdb);color:#fff;display:flex;align-items:center;justify-content:center}" +
    ".hz-send:disabled{opacity:.5;cursor:default}" +
    ".hz-min{width:34px;height:34px;border-radius:9px;border:1px solid hsl(0 0% 100%/.1);background:transparent;color:#8a93b5;cursor:pointer;flex:none;display:flex;align-items:center;justify-content:center}" +
    ".hz-min:hover{color:#fff}" +
    ".hz-panel{position:fixed;right:20px;bottom:80px;z-index:300;width:min(440px,94vw);max-height:64vh;display:none;flex-direction:column;background:hsl(222 32% 10%/.98);backdrop-filter:blur(20px);border:1px solid hsl(0 0% 100%/.1);border-radius:20px;box-shadow:0 30px 70px -28px #000;overflow:hidden}" +
    ".hz-panel.open{display:flex;animation:hzup .26s cubic-bezier(.16,1,.3,1)}" +
    "@keyframes hzup{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}" +
    ".hz-head{display:flex;align-items:center;gap:11px;padding:15px 16px;border-bottom:1px solid hsl(0 0% 100%/.08)}" +
    ".hz-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px}" +
    ".hz-msg{max-width:86%;padding:11px 14px;border-radius:14px;font-size:.9rem;line-height:1.5;white-space:pre-wrap}" +
    ".hz-msg.u{align-self:flex-end;background:linear-gradient(150deg,#5b76e8,#3b5bdb);color:#fff;border-bottom-right-radius:4px}" +
    ".hz-msg.a{align-self:flex-start;background:hsl(222 22% 17%);color:#e6e9f5;border-bottom-left-radius:4px}" +
    ".hz-msg.a b{color:#f0d9a8}" +
    ".hz-sugg{display:flex;flex-wrap:wrap;gap:7px;padding:0 16px 14px}" +
    ".hz-chip{background:hsl(222 22% 16%);border:1px solid hsl(0 0% 100%/.1);color:#c7cde6;border-radius:999px;padding:7px 13px;font-size:.78rem;cursor:pointer;font-family:inherit}" +
    ".hz-chip:hover{border-color:#5b76e8;color:#fff}" +
    ".hz-typing{align-self:flex-start;display:flex;gap:4px;padding:13px 16px;background:hsl(222 22% 17%);border-radius:14px}" +
    ".hz-typing i{width:7px;height:7px;border-radius:50%;background:#8a93b5;animation:hzb 1.2s infinite}" +
    ".hz-typing i:nth-child(2){animation-delay:.2s}.hz-typing i:nth-child(3){animation-delay:.4s}" +
    "@keyframes hzb{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-4px)}}";

  var SUGG = ["What's our runway and burn?", "Summarize our top 3 risks", "Where can we improve margin?", "Draft a board update on growth"];
  var panel, body, input, sendBtn;

  function icon(p) { return '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function fmt(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>"); }

  function addMsg(role, text) {
    var d = document.createElement("div"); d.className = "hz-msg " + (role === "user" ? "u" : "a");
    d.innerHTML = fmt(text); body.appendChild(d); body.scrollTop = body.scrollHeight; return d;
  }
  function openPanel() { panel.classList.add("open"); }

  async function send(q) {
    q = (q || input.value).trim(); if (!q) return;
    input.value = ""; openPanel();
    addMsg("user", q);
    history.push({ r: "User", t: q });
    var sg = panel.querySelector(".hz-sugg"); if (sg) sg.style.display = "none";
    var typing = document.createElement("div"); typing.className = "hz-typing"; typing.innerHTML = "<i></i><i></i><i></i>";
    body.appendChild(typing); body.scrollTop = body.scrollHeight;
    sendBtn.disabled = true;
    var reply;
    try {
      if (window.claude && window.claude.complete) {
        var convo = history.slice(-8).map(function (m) { return m.r + ": " + m.t; }).join("\n");
        var prompt = SYS + "\n\nLIVE CONTEXT: " + grounding() + "\n\nConversation:\n" + convo + "\nHermes:";
        reply = await window.claude.complete(prompt);
      } else {
        reply = "I'm online, but the live model isn't connected in this preview. Wire window.claude.complete (or your LLM endpoint) and I'll answer from the live data room. From current context: runway " + (window.ADMIN ? window.ADMIN.kpis.runwayMo + " months, EBITDA " + window.ADMIN.money(window.ADMIN.kpis.ebitdaYTD) : "n/a") + ".";
      }
    } catch (e) {
      reply = "I hit an error reaching the model. Check the API connection and try again.";
    }
    typing.remove();
    addMsg("assistant", (reply || "").trim() || "—");
    history.push({ r: "Hermes", t: reply });
    sendBtn.disabled = false; input.focus();
  }

  function mount() {
    if (!document.body) return;
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    var spacer = document.createElement("div"); spacer.id = "hermes-spacer"; document.body.appendChild(spacer);

    panel = document.createElement("div"); panel.className = "hz-panel";
    panel.innerHTML =
      '<div class="hz-head"><span class="hz-ava">H</span><div class="hz-id"><div class="hz-name">Hermes <span class="hz-dot"></span></div><div class="hz-role">AI Operating Partner · live data</div></div>' +
      '<button class="hz-min" title="Minimize" style="margin-left:auto">' + icon('<path d="M5 12h14"/>') + '</button></div>' +
      '<div class="hz-body"></div>' +
      '<div class="hz-sugg">' + SUGG.map(function (s) { return '<button class="hz-chip">' + s + '</button>'; }).join("") + '</div>';
    document.body.appendChild(panel);
    body = panel.querySelector(".hz-body");
    panel.querySelector(".hz-min").onclick = function () { panel.classList.remove("open"); };
    panel.querySelectorAll(".hz-chip").forEach(function (c) { c.onclick = function () { send(c.textContent); }; });

    var bar = document.createElement("div"); bar.className = "hz";
    bar.innerHTML =
      '<div class="hz-bar"><span class="hz-ava">H</span><div class="hz-id"><div class="hz-name">Hermes <span class="hz-dot"></span></div><div class="hz-role">AI Operating Partner</div></div>' +
      '<form class="hz-form"><input type="text" placeholder="Ask Hermes anything — finance, growth, risk, strategy…" /><button type="submit" class="hz-send" title="Send">' + icon('<path d="M5 12h14M13 5l7 7-7 7"/>') + '</button></form></div>';
    document.body.appendChild(bar);
    input = bar.querySelector("input"); sendBtn = bar.querySelector(".hz-send");
    bar.querySelector(".hz-form").addEventListener("submit", function (e) { e.preventDefault(); send(); });
    input.addEventListener("focus", openPanel);
    if (body.childElementCount === 0) addMsg("assistant", "Hi — I'm **Hermes**, your operating partner. Ask me about the P&L, runway, risks, growth or strategy, or tell me to draft something for the board.");
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount); else mount();
})();
