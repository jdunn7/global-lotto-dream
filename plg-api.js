/* =====================================================================
   plg-api.js — PlayLottoGlobal unified service layer (backend-ready seam)
   ---------------------------------------------------------------------
   Every button/feature across the product calls one of these methods.
   • mode:"mock"  → resolves locally, persisted to localStorage (works today)
   • mode:"live"  → issues real fetch() calls to config.baseUrl + endpoint
   To wire a backend: set PLG_API.config.baseUrl and PLG_API.config.mode="live".
   Each method documents its REST endpoint as `METHOD /path`.
   ===================================================================== */
(function () {
  const LSK = "plg_store_v1";
  const cfg = {
    baseUrl: "",            // e.g. "https://api.playlottoglobal.com"
    mode: "mock",           // "mock" | "live"
    token: null,            // bearer token once authed
    onError: null,          // optional global error handler
    latency: 280,           // simulated network delay (ms) in mock mode
  };

  /* ---- event bus so any UI can react to state changes ---- */
  const listeners = {};
  function on(evt, fn) { (listeners[evt] = listeners[evt] || []).push(fn); return () => off(evt, fn); }
  function off(evt, fn) { if (listeners[evt]) listeners[evt] = listeners[evt].filter(f => f !== fn); }
  function emit(evt, data) { (listeners[evt] || []).forEach(f => { try { f(data); } catch (e) {} }); (listeners["*"] || []).forEach(f => { try { f(evt, data); } catch (e) {} }); }

  /* ---- persisted mock store ---- */
  const seed = {
    profile: { name: "Amara Okafor", email: "amara@gmail.com", country: "United Kingdom", sponsor: "TODDPOINDEXTER", kycVerified: true },
    wallet: { playable: 248.5, winnings: 1284, commission: 412.6, currency: "USD" },
    cards: [{ id: "card_1", brand: "visa", name: "Amara Okafor", last4: "4821", exp: "08/27", default: true }],
    connectedWallet: null,
    tickets: [],
    payouts: [{ ref: "PO-4471", method: "Bank transfer", amount: 200, status: "completed", date: "24 May 2026" }],
    supportTickets: [],
    waitlist: null,
    campaigns: [],
  };
  function load() { try { return Object.assign({}, seed, JSON.parse(localStorage.getItem(LSK) || "{}")); } catch (e) { return Object.assign({}, seed); } }
  let store = load();
  function persist() { try { localStorage.setItem(LSK, JSON.stringify(store)); } catch (e) {} }

  /* ---- core request helper ---- */
  function delay(v) { return new Promise(r => setTimeout(() => r(v), cfg.mode === "mock" ? cfg.latency : 0)); }
  async function req(method, path, body, mockFn) {
    emit("request", { method, path, body });
    if (cfg.mode === "live") {
      try {
        const res = await fetch(cfg.baseUrl + path, {
          method,
          headers: Object.assign({ "Content-Type": "application/json" }, cfg.token ? { Authorization: "Bearer " + cfg.token } : {}),
          body: body != null && method !== "GET" ? JSON.stringify(body) : undefined,
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const data = await res.json();
        emit("response", { method, path, data });
        return data;
      } catch (err) {
        if (cfg.onError) cfg.onError(err, { method, path });
        emit("error", { method, path, error: String(err) });
        throw err;
      }
    }
    // mock
    const out = await delay(mockFn ? mockFn(body) : { ok: true });
    emit("response", { method, path, data: out, mock: true });
    return out;
  }
  const id = (p) => p + "_" + Math.random().toString(36).slice(2, 9);
  function clone(x) { return JSON.parse(JSON.stringify(x)); }

  /* ============== AUTH — bridged to plg.proposals.digital Better Auth ==============
     Real cross-subdomain SSO: the session is a cookie scoped to .proposals.digital,
     so every call goes to the live auth API with credentials. Also LIVE against plg:
     profile (/api/me), wallet (/api/wallet), tickets buy+list (/api/tickets),
     affiliate summary + payouts (/api/affiliate), lottery jackpots/draws
     (/api/lotteries). Cards, network breakdowns, marketing, support, and admin
     boards remain mock until plg exposes them. */
  const API_BASE = "https://plg.proposals.digital";
  // Map the player app's local game ids → plg lottery slugs.
  const TICKET_SLUG = { euromillions: "euromillions", powerball: "us-powerball", megamillions: "us-mega-millions", uklotto: "uk-lotto", elgordo: "el-gordo", ozlotto: "oz-lotto" };
  async function liveReq(path, body, method) {
    method = method || (body ? "POST" : "GET");
    emit("request", { method, path, body });
    let res, data = null;
    try {
      res = await fetch(API_BASE + path, {
        method,
        credentials: "include",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      });
      try { data = await res.json(); } catch (e) {}
    } catch (e) {
      emit("error", { path, error: String(e) });
      throw new Error("Network error — please check your connection and try again.");
    }
    if (!res.ok) {
      const msg = (data && (data.message || data.error)) || ("Request failed (" + res.status + ")");
      emit("error", { path, error: msg });
      const err = new Error(msg); err.status = res.status; throw err;
    }
    emit("response", { path, data });
    return data;
  }
  const userOf = (d) => (d && d.user) ? d.user : (d && d.email ? d : null);
  const auth = {
    signup: (d) => liveReq("/api/auth/sign-up/email", { name: d.name, email: d.email, password: d.password }).then((r) => { const u = userOf(r); emit("auth", u); return { profile: u }; }),
    login: (d) => liveReq("/api/auth/sign-in/email", { email: d.email, password: d.password }).then((r) => { const u = userOf(r); emit("auth", u); return { profile: u }; }),
    loginGoogle: (callbackURL) => liveReq("/api/auth/sign-in/social", { provider: "google", callbackURL }).then((r) => { if (r && r.url) window.location.href = r.url; return r; }),
    sendPhoneOtp: (phoneNumber) => liveReq("/api/auth/phone-number/send-otp", { phoneNumber }),
    verifyPhoneOtp: (d) => liveReq("/api/auth/phone-number/verify", { phoneNumber: d.phoneNumber, code: d.code }).then((r) => { const u = userOf(r); emit("auth", u); return { profile: u }; }),
    session: () => liveReq("/api/auth/get-session", null, "GET").then((r) => ({ authed: !!userOf(r), profile: userOf(r) })).catch(() => ({ authed: false, profile: null })),
    logout: () => liveReq("/api/auth/sign-out", {}).then((r) => { emit("auth", null); return r; }),
  };

  /* ============================ PLAYERS ============================ */
  const players = {
    // LIVE — identity, roles, and active world from the SSO session (/api/me).
    // Falls back to the demo profile when logged out so showcase pages still render.
    getProfile: () => liveReq("/api/me").then((m) => ({
      name: (m.profile && m.profile.display_name) || (m.user && m.user.name) || "",
      email: m.user ? m.user.email : "",
      country: (m.profile && m.profile.country) || "",
      kycVerified: !!m.onboarded,
      roles: m.roles || [],
      modes: m.modes || { available: ["player"], active: "player" },
      live: true,
    })).catch((e) => { if (e && e.status === 401) return clone(store.profile); throw e; }),
    updateProfile: (d) => req("PATCH", "/v1/me", d, () => { store.profile = Object.assign(store.profile, d); persist(); emit("profile", store.profile); return clone(store.profile); }),
    updateBankDetails: (d) => req("PUT", "/v1/me/bank", d, () => { store.profile.bank = d; persist(); return { ok: true }; }),
    getStats: () => req("GET", "/v1/me/stats", null, () => ({ ticketsPlayed: store.tickets.length + 12, totalWon: store.wallet.winnings, winRate: 0.23 })),
  };

  /* ============================ WALLET ============================ */
  const wallet = {
    getBalance: () => liveReq("/api/wallet", null, "GET").then((w) => ({ playable: (w.balance_cents || 0) / 100, winnings: 0, commission: 0, currency: w.currency || "USD", balance_cents: w.balance_cents || 0 })),
    topUp: (d) => req("POST", "/v1/wallet/topup", d, () => { store.wallet.playable += +d.amount; persist(); emit("wallet", clone(store.wallet)); return { ok: true, balance: clone(store.wallet), txn: { id: id("txn"), type: "topup", amount: +d.amount } }; }),
    withdraw: (d) => req("POST", "/v1/wallet/withdraw", d, () => { const amt = +d.amount; const avail = store.wallet.winnings + store.wallet.commission; if (amt > avail) throw new Error("Insufficient withdrawable balance"); let rem = amt; const fromW = Math.min(store.wallet.winnings, rem); store.wallet.winnings -= fromW; rem -= fromW; store.wallet.commission -= rem; persist(); emit("wallet", clone(store.wallet)); return { ok: true, balance: clone(store.wallet) }; }),
    getTransactions: () => liveReq("/api/wallet", null, "GET").then((w) => (w.transactions || [])),
  };

  /* ============================ PAYMENTS ============================ */
  const payments = {
    listCards: () => req("GET", "/v1/payments/cards", null, () => clone(store.cards)),
    addCard: (d) => req("POST", "/v1/payments/cards", d, () => { const card = { id: id("card"), brand: d.brand, name: d.name, last4: d.last4, exp: d.exp, default: d.default || store.cards.length === 0 }; if (card.default) store.cards.forEach(c => c.default = false); store.cards.push(card); persist(); emit("cards", clone(store.cards)); return clone(card); }),
    removeCard: (cid) => req("DELETE", "/v1/payments/cards/" + cid, null, () => { store.cards = store.cards.filter(c => c.id !== cid); if (store.cards.length && !store.cards.some(c => c.default)) store.cards[0].default = true; persist(); emit("cards", clone(store.cards)); return { ok: true }; }),
    setDefaultCard: (cid) => req("PUT", "/v1/payments/cards/" + cid + "/default", null, () => { store.cards.forEach(c => c.default = c.id === cid); persist(); emit("cards", clone(store.cards)); return { ok: true }; }),
    connectWallet: (d) => req("POST", "/v1/payments/wallet/connect", d, () => { const hex = () => Math.floor(Math.random() * 16).toString(16); store.connectedWallet = { app: d.app, name: d.name, chain: d.chain, addr: "0x" + Array.from({ length: 4 }, hex).join("") + "…" + Array.from({ length: 4 }, hex).join(""), balanceUSDC: +(300 + Math.random() * 4200).toFixed(2) }; persist(); emit("cryptoWallet", clone(store.connectedWallet)); return clone(store.connectedWallet); }),
    disconnectWallet: () => req("POST", "/v1/payments/wallet/disconnect", null, () => { store.connectedWallet = null; persist(); emit("cryptoWallet", null); return { ok: true }; }),
    listInvoices: () => req("GET", "/v1/payments/invoices", null, () => ([{ t: "EuroMillions · 4 draws", d: "2 Jun 2026", a: 10 }, { t: "Powerball · 2 lines", d: "31 May 2026", a: 4 }])),
    checkout: (d) => req("POST", "/v1/payments/checkout", d, () => ({ ok: true, paymentId: id("pay"), status: "succeeded", amount: d.amount })),
  };

  /* ============================ TICKETS & DRAWS ============================ */
  // LIVE overlay: keep the local game configs (pick rules, art) but replace
  // jackpot / next-draw / currency with the real values from /api/lotteries —
  // the same numbers plg.proposals.digital renders. Falls back to demo data offline.
  const SLUG_TO_ID = Object.keys(TICKET_SLUG).reduce((m, k) => { m[TICKET_SLUG[k]] = k; return m; }, {});
  const CCY_SYMBOL = { USD: "$", EUR: "€", GBP: "£", AUD: "A$", CAD: "C$", NGN: "₦" };
  function overlayLive(games, lotteries) {
    const bySlug = {};
    (lotteries || []).forEach((l) => { bySlug[l.slug] = l; });
    return games.map((g) => {
      const live = bySlug[TICKET_SLUG[g.id] || g.id];
      if (!live) return g;
      return Object.assign({}, g, {
        jackpot: Number(live.current_jackpot_usd) || g.jackpot,
        currency: CCY_SYMBOL[live.currency] || g.currency,
        nextDrawISO: live.next_draw_at || g.nextDrawISO,
        liveSlug: live.slug,
      });
    });
  }
  const tickets = {
    listGames: () => {
      const local = () => (window.LOTTO ? clone(window.LOTTO.GAMES) : []);
      return liveReq("/api/lotteries")
        .then((r) => overlayLive(local(), r.lotteries))
        .catch(() => delay(local()));
    },
    getGame: (gid) => req("GET", "/v1/games/" + gid, null, () => (window.LOTTO ? clone(window.LOTTO.gameById(gid)) : null)),
    buyTicket: (d) => liveReq("/api/tickets", { slug: TICKET_SLUG[d.gameId] || d.gameId, lines: d.lines }, "POST").then((r) => { emit("tickets", null); return r; }),
    listTickets: () => liveReq("/api/tickets", null, "GET").then((r) => (r.tickets || [])),
    getTicket: (tid) => req("GET", "/v1/tickets/" + tid, null, () => clone(store.tickets.find(t => t.id === tid) || null)),
    getResults: (gid) => req("GET", "/v1/draws/results" + (gid ? "?game=" + gid : ""), null, () => (window.LOTTO ? clone(window.LOTTO.RESULTS) : [])),
    getNextDraw: (gid) => req("GET", "/v1/draws/next?game=" + gid, null, () => { const g = window.LOTTO && window.LOTTO.gameById(gid); return g ? { gameId: gid, drawISO: g.nextDrawISO } : null; }),
  };

  /* ============================ AFFILIATE ============================ */
  // getDashboard / getReferralLink are LIVE (/api/affiliate, owner-scoped via the
  // SSO cookie — the same record the plg Member Hub renders). Network/commissions/
  // leaderboard remain demo data until plg exposes per-level breakdowns.
  const affiliate = {
    getDashboard: () => liveReq("/api/affiliate").then((r) => {
      const a = r.affiliate || {};
      const clicks = Number(a.total_clicks) || 0;
      const signups = Number(a.total_signups) || 0;
      return {
        pending: Number(a.balance_usd) || 0,
        lifetime: Number(a.balance_usd) || 0,
        network: signups,
        clicks: clicks,
        sales: Number(a.total_sales) || 0,
        conv: clicks ? +(signups / clicks).toFixed(2) : 0,
        directRate: clicks ? +(signups / clicks).toFixed(2) : 0,
        thisMonth: Number(a.balance_usd) || 0,
        affiliate: a,
        live: true,
      };
    }).catch((e) => { if (e && e.status === 401) return window.AFFIL ? clone(window.AFFIL.kpi) : {}; throw e; }),
    getNetwork: () => req("GET", "/v1/affiliate/network", null, () => (window.AFFIL ? clone(window.AFFIL.members) : [])),
    getCommissions: () => req("GET", "/v1/affiliate/commissions", null, () => (window.AFFIL ? clone(window.AFFIL.byLevel) : [])),
    getReferralLink: () => liveReq("/api/affiliate")
      .then((r) => ({ code: r.affiliate.referral_code, url: r.link, live: true }))
      .catch((e) => { if (e && e.status === 401) return { code: "AMARA777", url: "playlottoglobal.com/r/AMARA777" }; throw e; }),
    getLeaderboard: () => req("GET", "/v1/affiliate/leaderboard", null, () => (window.AFFIL ? clone(window.AFFIL.leaderboard) : [])),
    joinWaitlist: (d) => req("POST", "/v1/affiliate/waitlist", d, () => { store.waitlist = { email: d.email, code: (d.email || "you").split("@")[0].toUpperCase().slice(0, 6) + Math.floor(100 + Math.random() * 900), position: 2000 + Math.floor(Math.random() * 6000), refs: 0 }; persist(); emit("waitlist", clone(store.waitlist)); return clone(store.waitlist); }),
    recordReferral: (d) => req("POST", "/v1/affiliate/referral", d, () => { if (store.waitlist) { store.waitlist.refs++; store.waitlist.position = Math.max(1, store.waitlist.position - 240); persist(); } return { ok: true, waitlist: clone(store.waitlist) }; }),
    sendInvite: (d) => req("POST", "/v1/affiliate/invite", d, () => ({ ok: true, sentTo: d.to, channel: d.channel })),
  };

  /* ============================ PAYOUTS ============================ */
  // LIVE — real payout requests against the affiliate balance on plg ($20 min,
  // full-balance, admin settles out of band). List shows the real history.
  const payouts = {
    request: () => liveReq("/api/affiliate", {}, "POST").then((r) => {
      if (!r.ok) {
        throw new Error(r.reason === "below_minimum"
          ? "Minimum payout is $20 — current balance $" + (r.balanceUsd || "0")
          : "No affiliate account yet — open the Affiliate Hub first.");
      }
      emit("payouts", null);
      return { ref: "requested", amount: Number(r.amountUsd) || 0, status: "pending", date: "Today" };
    }),
    list: () => liveReq("/api/affiliate").then((r) => (r.payouts || []).map((p) => ({
      ref: "PO-" + String(p.id || "").slice(0, 8),
      method: p.method || "—",
      amount: Number(p.amount_usd) || 0,
      status: p.status,
      date: p.created_at ? new Date(p.created_at).toLocaleDateString() : "",
    }))).catch((e) => { if (e && e.status === 401) return clone(store.payouts); throw e; }),
    getStats: () => req("GET", "/v1/payouts/stats", null, () => ({ requested: 0, approved: 0, paid: 438, rejected: 0 })),
  };

  /* ============================ MARKETING (Hermes) ============================ */
  const marketing = {
    listCampaigns: () => req("GET", "/v1/marketing/campaigns", null, () => clone(store.campaigns)),
    createCampaign: (d) => req("POST", "/v1/marketing/campaigns", d, () => { const c = Object.assign({ id: id("cmp"), status: d.when === "now" ? "sending" : "scheduled", createdAt: Date.now() }, d); store.campaigns.unshift(c); persist(); emit("campaigns", clone(store.campaigns)); return clone(c); }),
    listChannels: () => req("GET", "/v1/marketing/channels", null, () => (window.MK ? clone(window.MK.channels) : [])),
    sendMessage: (d) => req("POST", "/v1/marketing/hermes/send", d, () => ({ ok: true, messageId: id("msg"), channel: d.channel })),
    generateAsset: (d) => req("POST", "/v1/marketing/ai/generate", d, () => ({ ok: true, jobId: id("job"), kind: d.kind, status: "queued", provider: d.model })),
    listInfluencers: () => req("GET", "/v1/marketing/influencers", null, () => (window.MK ? clone(window.MK.influencers) : [])),
  };

  /* ============================ SUPPORT ============================ */
  const support = {
    listTickets: () => req("GET", "/v1/support/tickets", null, () => clone(store.supportTickets)),
    createTicket: (d) => req("POST", "/v1/support/tickets", d, () => { const t = Object.assign({ id: "TK-" + Math.floor(1000 + Math.random() * 8999), status: "Open", createdAt: Date.now() }, d); store.supportTickets.unshift(t); persist(); emit("support", clone(store.supportTickets)); return clone(t); }),
    getFaqs: () => req("GET", "/v1/support/faqs", null, () => ([])),
  };

  /* ============================ ADMIN / BOARD ============================ */
  const admin = {
    getKpis: () => req("GET", "/v1/admin/kpis", null, () => (window.ADMIN ? clone(window.ADMIN.kpis) : {})),
    getPnL: () => req("GET", "/v1/admin/pnl", null, () => (window.ADMIN ? clone(window.ADMIN.pnl) : [])),
    getExpenses: () => req("GET", "/v1/admin/expenses", null, () => (window.ADMIN ? clone(window.ADMIN.expenses) : [])),
    getDemographics: () => req("GET", "/v1/admin/demographics", null, () => (window.ADMIN ? clone(window.ADMIN.demographics) : {})),
    getProjections: () => req("GET", "/v1/admin/projections", null, () => (window.ADMIN ? clone(window.ADMIN.projections) : {})),
    getRisks: () => req("GET", "/v1/admin/risks", null, () => (window.ADMIN ? clone(window.ADMIN.risks) : [])),
    getLegal: () => req("GET", "/v1/admin/legal", null, () => (window.ADMIN ? clone(window.ADMIN.legal) : [])),
    getTaxes: () => req("GET", "/v1/admin/taxes", null, () => (window.ADMIN ? clone(window.ADMIN.taxes) : [])),
    getCapTable: () => req("GET", "/v1/admin/cap-table", null, () => (window.ADMIN ? clone(window.ADMIN.capTable) : [])),
    exportBoardPack: () => req("POST", "/v1/admin/board-pack/export", null, () => ({ ok: true, url: "#", generatedAt: Date.now() })),
  };

  /* ---- utility: reset mock store ---- */
  function resetMock() { store = clone(seed); persist(); emit("reset", null); }

  window.PLG_API = {
    config: cfg, on, off, emit,
    auth, players, wallet, payments, tickets, affiliate, payouts, marketing, support, admin,
    resetMock,
    _store: () => clone(store),
    // full endpoint catalogue for docs / the API console
    catalogue: {
      auth: ["signup", "login", "logout", "session", "verifyEmail", "requestReset"],
      players: ["getProfile", "updateProfile", "updateBankDetails", "getStats"],
      wallet: ["getBalance", "topUp", "withdraw", "getTransactions"],
      payments: ["listCards", "addCard", "removeCard", "setDefaultCard", "connectWallet", "disconnectWallet", "listInvoices", "checkout"],
      tickets: ["listGames", "getGame", "buyTicket", "listTickets", "getTicket", "getResults", "getNextDraw"],
      affiliate: ["getDashboard", "getNetwork", "getCommissions", "getReferralLink", "getLeaderboard", "joinWaitlist", "recordReferral", "sendInvite"],
      payouts: ["request", "list", "getStats"],
      marketing: ["listCampaigns", "createCampaign", "listChannels", "sendMessage", "generateAsset", "listInfluencers"],
      support: ["listTickets", "createTicket", "getFaqs"],
      admin: ["getKpis", "getPnL", "getExpenses", "getDemographics", "getProjections", "getRisks", "getLegal", "getTaxes", "getCapTable", "exportBoardPack"],
    },
  };
})();
