// marketing-data.js — PLG Lotto Marketing Hub dataset
(function () {
  const avc = ["230 72% 57%", "43 90% 62%", "265 70% 64%", "0 75% 58%", "188 80% 50%", "32 92% 56%", "158 60% 45%"];
  const ac = (i) => `hsl(${avc[i % avc.length]})`;

  /* ============================================================
     ANALYTICS ENGINE — event-sourced.
     Every metric shown in the hub is AGGREGATED from a deterministic
     90-day stream of per-channel daily events. Deltas are real
     period-over-period comparisons (last 30d vs prior 30d), so the
     KPI cards, channel rollups and the chart are always internally
     consistent — change a model assumption and everything re-derives.
     ============================================================ */
  function mulberry(a) { return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const rngA = mulberry(20260605);

  // Channel models (the only hand-set assumptions; all outputs are derived)
  const CH = [
    { id: "email", name: "Email", icon: "mail", baseSend: 5600, openRate: 0.412, clickRate: 0.091, conv: 0.11, leadRate: 0.46, costPerSend: 0.0009, arpu: 31 },
    { id: "sms", name: "SMS", icon: "chat", baseSend: 2950, openRate: 0.941, clickRate: 0.124, conv: 0.15, leadRate: 0.40, costPerSend: 0.011, arpu: 27 },
    { id: "voice", name: "Voice", icon: "phone", baseSend: 410, openRate: 0.38, clickRate: 0.0, conv: 0.22, leadRate: 0.30, costPerSend: 0.085, arpu: 64 },
    { id: "social", name: "Social", icon: "share", baseImp: 103000, openRate: 0.058, clickRate: 0.032, conv: 0.06, leadRate: 0.18, cpm: 6.4, arpu: 22 },
  ];

  const DAYS = 90;
  const days = [];
  for (let d = 0; d < DAYS; d++) {
    const dow = d % 7;
    const weekendBoost = (dow === 4 || dow === 5) ? 1.16 : 1.0; // Fri/Sat draw run-up
    const trend = 1 + (d / DAYS) * 0.46;                        // steady growth across the window
    const day = { idx: d, ch: {}, reach: 0, leads: 0, newPlayers: 0, spend: 0, revenue: 0, msgs: 0, clicks: 0 };
    CH.forEach((c) => {
      const noise = 0.85 + rngA() * 0.3;
      const imp = c.baseImp ? Math.round(c.baseImp * trend * weekendBoost * noise) : 0;
      const sent = c.baseSend ? Math.round(c.baseSend * trend * weekendBoost * noise) : 0;
      const reach = imp || sent;
      const denom = c.baseImp ? reach : sent;
      const opens = Math.round((c.baseImp ? reach : sent) * c.openRate * (0.92 + rngA() * 0.16));
      const clicks = Math.round((c.baseImp ? reach : opens) * c.clickRate * (0.9 + rngA() * 0.2));
      const actions = c.id === "voice" ? opens : clicks; // voice converts on pickups, not clicks
      const conv = Math.round(actions * c.conv);
      const leads = Math.round(actions * c.leadRate);
      const spend = c.cpm ? (imp / 1000) * c.cpm : sent * c.costPerSend;
      const revenue = conv * c.arpu * (0.82 + rngA() * 0.5);
      const msgs = c.id === "social" ? 0 : sent + Math.round(opens * 0.06); // outbound + inbound replies
      day.ch[c.id] = { sent, imp, reach, opens, clicks, conv, leads, spend, revenue, msgs };
      day.reach += reach; day.leads += leads; day.newPlayers += conv; day.spend += spend; day.revenue += revenue; day.msgs += msgs; day.clicks += clicks;
    });
    days.push(day);
  }

  const sum = (arr, f) => arr.reduce((a, x) => a + f(x), 0);
  const pct = (a, b) => b === 0 ? 0 : ((a - b) / b) * 100;
  const last30 = days.slice(-30), prev30 = days.slice(-60, -30);
  const fmtK = (n) => n >= 1e6 ? (n / 1e6).toFixed(n >= 1e7 ? 0 : 1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(n >= 1e4 ? 0 : 1) + "k" : Math.round(n).toLocaleString();
  const fmtMoney = (n) => n >= 1e6 ? "$" + (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? "$" + (n / 1e3).toFixed(1) + "k" : "$" + Math.round(n);
  const fmtPct = (p) => (p >= 0 ? "+" : "") + p.toFixed(1) + "%";

  const reach30 = sum(last30, (d) => d.reach), reachPrev = sum(prev30, (d) => d.reach);
  const leads30 = sum(last30, (d) => d.leads), leadsPrev = sum(prev30, (d) => d.leads);
  const players30 = sum(last30, (d) => d.newPlayers), playersPrev = sum(prev30, (d) => d.newPlayers);
  const spend30 = sum(last30, (d) => d.spend);
  const revenue30 = sum(last30, (d) => d.revenue);
  const msgs30 = sum(last30, (d) => d.msgs), msgsPrev = sum(prev30, (d) => d.msgs);
  const clicks30 = sum(last30, (d) => d.clicks);
  const roas = spend30 ? revenue30 / spend30 : 0;
  const convRate = clicks30 ? (players30 / clicks30) * 100 : 0;
  const autoShare = 0.58 + (sum(last30, (d) => d.ch.email.msgs + d.ch.sms.msgs) / Math.max(1, msgs30)) * 0.1; // derived auto-reply coverage
  const avgResp = autoShare * 0.4 + (1 - autoShare) * 3.1; // minutes (auto replies near-instant)

  const kpis = [
    { l: "Total reach (30d)", v: fmtK(reach30), d: fmtPct(pct(reach30, reachPrev)) + " vs prev 30d", up: reach30 >= reachPrev, ic: "globe", gold: true },
    { l: "Leads captured", v: fmtK(leads30), d: fmtPct(pct(leads30, leadsPrev)) + " vs prev 30d", up: leads30 >= leadsPrev, ic: "users" },
    { l: "New players", v: fmtK(players30), d: convRate.toFixed(1) + "% click→play", up: players30 >= playersPrev, ic: "ticket" },
    { l: "Ad spend (30d)", v: fmtMoney(spend30), d: "ROAS " + roas.toFixed(1) + "×", up: roas >= 1, ic: "wallet" },
    { l: "Hermes msgs", v: fmtK(msgs30), d: fmtPct(pct(msgs30, msgsPrev)) + " in + out", up: msgs30 >= msgsPrev, ic: "chat" },
    { l: "Avg. response", v: avgResp.toFixed(1) + "m", d: Math.round(autoShare * 100) + "% auto-handled", up: true, ic: "clock" },
  ];

  const channels = CH.map((c) => {
    const sent30 = sum(last30, (d) => d.ch[c.id].sent);
    const imp30 = sum(last30, (d) => d.ch[c.id].imp);
    const opens30 = sum(last30, (d) => d.ch[c.id].opens);
    const clk30 = sum(last30, (d) => d.ch[c.id].clicks);
    const reachC = imp30 || sent30;
    const reachCprev = sum(prev30, (d) => d.ch[c.id].imp || d.ch[c.id].sent);
    const isSocial = c.id === "social";
    const rate = isSocial ? (reachC ? (clk30 / reachC) * 100 : 0) : c.id === "voice" ? c.openRate * 100 : (sent30 ? (opens30 / sent30) * 100 : 0);
    return {
      id: c.id, name: c.name, icon: c.icon,
      sent: fmtK(reachC),
      rate: rate.toFixed(1) + "%",
      rateL: isSocial ? "CTR" : c.id === "sms" ? "delivered" : c.id === "voice" ? "pickup" : "open rate",
      trend: fmtPct(pct(reachC, reachCprev)), up: reachC >= reachCprev,
    };
  });

  // 12-week reach/leads chart — aggregated from the last 84 days of events
  const weeks = [];
  const wdays = days.slice(-84);
  for (let w = 0; w < 12; w++) {
    const seg = wdays.slice(w * 7, w * 7 + 7);
    weeks.push({ label: "W" + (w + 1), reach: Math.round(sum(seg, (d) => d.reach)), leads: Math.round(sum(seg, (d) => d.leads)) });
  }

  // Window-aware recompute — lets the 7D/30D/90D toggle re-derive everything live
  function compute(nDays) {
    const win = days.slice(-nDays);
    const prev = days.slice(-2 * nDays, -nDays);
    const hasPrev = prev.length > 0;
    const lab = nDays + "d";
    const reach = sum(win, (d) => d.reach), reachP = sum(prev, (d) => d.reach);
    const leads = sum(win, (d) => d.leads), leadsP = sum(prev, (d) => d.leads);
    const players = sum(win, (d) => d.newPlayers), playersP = sum(prev, (d) => d.newPlayers);
    const spend = sum(win, (d) => d.spend);
    const revenue = sum(win, (d) => d.revenue);
    const msgs = sum(win, (d) => d.msgs), msgsP = sum(prev, (d) => d.msgs);
    const clicks = sum(win, (d) => d.clicks);
    const roasW = spend ? revenue / spend : 0;
    const convR = clicks ? (players / clicks) * 100 : 0;
    const auto = 0.58 + (sum(win, (d) => d.ch.email.msgs + d.ch.sms.msgs) / Math.max(1, msgs)) * 0.1;
    const resp = auto * 0.4 + (1 - auto) * 3.1;
    const dlt = (a, b) => hasPrev ? fmtPct(pct(a, b)) + " vs prev " + lab : "tracked live";
    const kpis = [
      { l: "Total reach (" + lab + ")", v: fmtK(reach), d: dlt(reach, reachP), up: reach >= reachP, ic: "globe", gold: true },
      { l: "Leads captured", v: fmtK(leads), d: dlt(leads, leadsP), up: leads >= leadsP, ic: "users" },
      { l: "New players", v: fmtK(players), d: convR.toFixed(1) + "% click→play", up: players >= playersP, ic: "ticket" },
      { l: "Ad spend (" + lab + ")", v: fmtMoney(spend), d: "ROAS " + roasW.toFixed(1) + "×", up: roasW >= 1, ic: "wallet" },
      { l: "Hermes msgs", v: fmtK(msgs), d: hasPrev ? dlt(msgs, msgsP) : "in + out", up: msgs >= msgsP, ic: "chat" },
      { l: "Avg. response", v: resp.toFixed(1) + "m", d: Math.round(auto * 100) + "% auto-handled", up: true, ic: "clock" },
    ];
    const channelsW = CH.map((c) => {
      const s = sum(win, (d) => d.ch[c.id].sent), im = sum(win, (d) => d.ch[c.id].imp);
      const op = sum(win, (d) => d.ch[c.id].opens), ck = sum(win, (d) => d.ch[c.id].clicks);
      const rc = im || s, rcp = sum(prev, (d) => d.ch[c.id].imp || d.ch[c.id].sent);
      const isSoc = c.id === "social";
      const rate = isSoc ? (rc ? (ck / rc) * 100 : 0) : c.id === "voice" ? c.openRate * 100 : (s ? (op / s) * 100 : 0);
      return { id: c.id, name: c.name, icon: c.icon, sent: fmtK(rc), rate: rate.toFixed(1) + "%", rateL: isSoc ? "CTR" : c.id === "sms" ? "delivered" : c.id === "voice" ? "pickup" : "open rate", trend: hasPrev ? fmtPct(pct(rc, rcp)) : "—", up: rc >= rcp };
    });
    let buckets = [];
    if (nDays <= 7) {
      buckets = win.map((d, i) => ({ label: "D" + (i + 1), reach: Math.round(d.reach), leads: Math.round(d.leads) }));
    } else {
      const groups = nDays <= 30 ? 10 : 12, gs = Math.floor(win.length / groups);
      for (let g = 0; g < groups; g++) { const seg = win.slice(g * gs, g === groups - 1 ? win.length : (g + 1) * gs); buckets.push({ label: (nDays <= 30 ? "" : "W") + (g + 1), reach: Math.round(sum(seg, (d) => d.reach)), leads: Math.round(sum(seg, (d) => d.leads)) }); }
    }
    return { kpis, channels: channelsW, weeks: buckets, reach, leads, players, spend, revenue, roas: roasW };
  }

  // Live ingestion — simulates real-time events landing on "today" so the
  // dashboard ticks upward like a real pipeline. compute()/last30 read days,
  // so a pulse here flows through every KPI, channel and the chart.
  function ingest() {
    const d = days[days.length - 1];
    CH.forEach((c) => {
      const cd = d.ch[c.id];
      const add = Math.round((c.baseImp || c.baseSend) * (0.0015 + Math.random() * 0.0035));
      if (c.baseImp) cd.imp += add; else cd.sent += add;
      cd.reach += add;
      const op = Math.round(add * c.openRate); cd.opens += op;
      const ck = Math.round((c.baseImp ? add : op) * c.clickRate); cd.clicks += ck;
      const act = c.id === "voice" ? op : ck;
      const cv = Math.round(act * c.conv); cd.conv += cv;
      const ld = Math.round(act * c.leadRate); cd.leads += ld;
      const sp = c.cpm ? (add / 1000) * c.cpm : add * c.costPerSend; cd.spend += sp;
      const rv = cv * c.arpu; cd.revenue += rv;
      const ms = c.id === "social" ? 0 : add + Math.round(op * 0.06); cd.msgs += ms;
      d.reach += add; d.leads += ld; d.newPlayers += cv; d.spend += sp; d.revenue += rv; d.msgs += ms; d.clicks += ck;
    });
    return d;
  }

  const analytics = { days, last30, prev30, reach30, leads30, players30, spend30, revenue30, msgs30, roas, convRate, autoShare, avgResp, fmtK, fmtMoney, fmtPct, pct, sum, compute, ingest, CH };

  // HERMES — unified inbox
  const convos = [
    { id: 1, name: "Daniel K.", channel: "email", subject: "Re: Your EuroMillions ticket", time: "2m", unread: true, status: "open", tags: ["VIP"], i: 0,
      messages: [
        { from: "them", t: "Hi — I bought a line for Friday but didn't get a confirmation email. Can you check?", time: "09:12" },
        { from: "us", t: "Hi Daniel! Your EuroMillions line (LG-2231) is confirmed for Friday's draw. Resending your receipt now — anything else?", time: "09:13", auto: true },
        { from: "them", t: "Got it, thanks! Also how do I set up auto-play?", time: "09:14" },
      ] },
    { id: 2, name: "+44 7700 •••231", channel: "sms", subject: "JACKPOT alert reply", time: "8m", unread: true, status: "open", tags: [], i: 3,
      messages: [
        { from: "us", t: "🎰 PLG: Tonight's EuroMillions is €211M! Play in 2 taps: lottoglobal.app/r — reply STOP to opt out", time: "18:30", camp: true },
        { from: "them", t: "How late can I buy?", time: "18:38" },
      ] },
    { id: 3, name: "Priya N.", channel: "voice", subject: "Callback — withdrawal help", time: "22m", unread: false, status: "open", tags: ["Callback"], i: 1,
      messages: [
        { from: "them", t: "📞 Inbound call · 3m 41s · transcript: \"…wanted to confirm my $530 withdrawal went through…\"", time: "17:50", voice: true },
        { from: "us", t: "Logged: withdrawal PO-4390 confirmed, ETA 1–2 days. Follow-up SMS sent.", time: "17:55", auto: true },
      ] },
    { id: 4, name: "Marco B.", channel: "email", subject: "Affiliate payout question", time: "1h", unread: false, status: "snoozed", tags: ["Affiliate"], i: 2,
      messages: [{ from: "them", t: "When does my level-2 commission pay out this week?", time: "16:20" }] },
    { id: 5, name: "+1 415 •••882", channel: "sms", subject: "Welcome flow", time: "3h", unread: false, status: "closed", tags: ["New"], i: 4,
      messages: [{ from: "us", t: "Welcome to PLG! Here's your free line 🎟️ Tap to claim: lottoglobal.app/welcome", time: "13:02", camp: true }] },
  ];

  // Campaigns — display metrics computed from raw audience size + channel rates
  const campaignSeed = [
    { name: "Friday Mega Rollover", channel: "email", status: "live", audience: 84200 },
    { name: "Jackpot SMS Blast", channel: "sms", status: "live", audience: 42700 },
    { name: "Win-back: dormant 30d", channel: "email", status: "scheduled", audience: 0 },
    { name: "Voice: VIP re-engage", channel: "voice", status: "live", audience: 2100 },
    { name: "Affiliate recruitment", channel: "social", status: "live", audience: 1200000 },
    { name: "El Gordo countdown", channel: "email", status: "draft", audience: 0 },
  ];
  const campaigns = campaignSeed.map((c) => {
    const m = CH.find((x) => x.id === c.channel);
    if (c.status !== "live" || !c.audience) return { ...c, sent: "—", open: "—", click: "—", rev: "—" };
    const reached = c.audience;
    const opens = Math.round(reached * m.openRate);
    const clicks = Math.round(reached * (m.baseImp ? m.clickRate : m.openRate * m.clickRate));
    const actions = c.channel === "voice" ? opens : clicks; // voice converts on pickups
    const rev = actions * m.conv * m.arpu;
    return {
      ...c,
      sent: fmtK(reached),
      open: m.id === "sms" || m.id === "social" ? "—" : Math.round(m.openRate * 100) + "%",
      click: m.clickRate ? (m.baseImp ? (m.clickRate * 100).toFixed(1) : (m.openRate * m.clickRate * 100).toFixed(1)) + "%" : "—",
      rev: fmtMoney(rev),
    };
  });

  const flows = [
    { name: "New signup → welcome series", trigger: "Sign up", steps: ["Email: Welcome + free line", "Wait 1d", "SMS: First deposit nudge", "Wait 3d", "Email: How to play"], active: true, enrolled: "12.4k" },
    { name: "Abandoned bet slip", trigger: "Slip not paid", steps: ["Wait 30m", "Email: Finish your ticket", "Wait 1d", "SMS: 10% off reminder"], active: true, enrolled: "3.1k" },
    { name: "Big jackpot alert", trigger: "Jackpot > €150M", steps: ["Segment: opted-in", "SMS blast", "Social: auto-post"], active: true, enrolled: "auto" },
    { name: "Dormant win-back", trigger: "No play 30d", steps: ["Email: We miss you", "Wait 2d", "Voice: VIP callback", "Offer: bonus line"], active: false, enrolled: "8.6k" },
  ];

  // COPYWRITING ENGINE
  const copyTypes = [
    { id: "email_subject", label: "Email subject line" },
    { id: "sms", label: "SMS / push" },
    { id: "ad_headline", label: "Ad headline" },
    { id: "social", label: "Social caption" },
    { id: "landing", label: "Landing hero" },
  ];
  const tones = ["Hype", "Trustworthy", "Playful", "Urgent", "Premium"];
  const audiences = ["New players", "Lapsed players", "VIPs", "Affiliates", "Jackpot hunters"];
  const copyBank = {
    email_subject: [
      "€{JP} is on the table tonight — are you in?",
      "Your luckiest {DAY} starts here 🍀",
      "{NAME}, tonight's jackpot just hit €{JP}",
      "Don't watch someone else win €{JP}",
      "2 taps. 1 line. €{JP} on the line.",
    ],
    sms: [
      "PLG: €{JP} EuroMillions tonight! Play in 2 taps 👉 {LINK} (STOP to opt out)",
      "🎰 Last call! Lines close 20:00. €{JP} waiting. {LINK}",
      "Your free line is ready, {NAME} 🎟️ Claim before midnight: {LINK}",
    ],
    ad_headline: [
      "Play the world's biggest jackpots — from anywhere.",
      "€{JP} tonight. Your numbers, your shot.",
      "Flood your wallet with winnings, not regrets.",
      "One account. Every global lottery.",
    ],
    social: [
      "Somebody's going to win €{JP} tonight. Might as well be you 👀 Tap the link in bio to play {GAME} in 2 taps. 18+ #LottoGlobal",
      "POV: you checked your ticket and it's a winner 🤑 Play {GAME} now — link in bio. Play responsibly, 18+.",
      "Big dreams start with one line. €{JP} on the table 🌍🎟️ #PLGLotto",
    ],
    landing: [
      "Tonight you could win €{JP}. Pick your numbers or let fate decide.",
      "The world's biggest jackpots, one account. Play {GAME} in 2 taps.",
      "Real draws. Instant payouts. €{JP} waiting for a winner.",
    ],
  };

  // BRAND KIT
  const brandKit = {
    name: "PLG Lotto",
    colors: [
      { name: "Royal Blue", hex: "#3949c0", role: "Primary" },
      { name: "Deep Navy", hex: "#181860", role: "Ink" },
      { name: "Gold", hex: "#f5c451", role: "Jackpot accent" },
      { name: "Sky", hex: "#46a6ff", role: "Highlight" },
      { name: "Off-white", hex: "#f4f7fa", role: "Surface" },
    ],
    fonts: { display: "Outfit", body: "Inter" },
    voice: [
      { p: "Confident, not boastful", s: "We promise outcomes and back them with mechanics." },
      { p: "Outcome-first", s: "Lead with the win, support with the how." },
      { p: "Playful but trusted", s: "Fun energy, always licensed & responsible." },
    ],
    toneSliders: [{ l: "Formal", r: "Casual", v: 68 }, { l: "Serious", r: "Playful", v: 60 }, { l: "Calm", r: "Hype", v: 74 }],
  };

  const adFormats = [
    { id: "square", label: "Square", sub: "1:1 · Feed", w: 280, h: 280 },
    { id: "story", label: "Story", sub: "9:16 · Reels", w: 200, h: 356 },
    { id: "landscape", label: "Landscape", sub: "16:9 · Display", w: 360, h: 202 },
    { id: "video", label: "Video", sub: "15s · Reels/TikTok", w: 200, h: 356, video: true },
  ];

  const influencers = [
    { name: "@luckylauren", platform: "TikTok", followers: "1.2M", er: "7.4%", stage: 0, region: "🇬🇧", i: 0 },
    { name: "@bigwinmike", platform: "YouTube", followers: "840k", er: "4.1%", stage: 0, region: "🇺🇸", i: 3 },
    { name: "@jackpotjenna", platform: "Instagram", followers: "560k", er: "6.2%", stage: 1, region: "🇦🇺", i: 4 },
    { name: "@elgordogo", platform: "Instagram", followers: "310k", er: "5.5%", stage: 1, region: "🇪🇸", i: 5 },
    { name: "@dailydrawdan", platform: "TikTok", followers: "920k", er: "8.0%", stage: 2, region: "🇨🇦", i: 2 },
    { name: "@fortunefatima", platform: "YouTube", followers: "1.5M", er: "3.8%", stage: 3, region: "🇳🇬", i: 1 },
    { name: "@spinwithsam", platform: "Twitch", followers: "210k", er: "9.1%", stage: 3, region: "🇩🇪", i: 6 },
  ];
  const stages = ["Prospects", "Contacted", "Negotiating", "Live deal"];

  // AI TOOLS — image + video + voice generators with API entry
  const aiTools = {
    image: [
      { id: "dalle", name: "DALL·E 3", vendor: "OpenAI", kind: "Image", connected: true, env: "OPENAI_API_KEY" },
      { id: "midjourney", name: "Midjourney", vendor: "Midjourney", kind: "Image", connected: true, env: "MJ_API_KEY" },
      { id: "sdxl", name: "Stable Diffusion XL", vendor: "Stability AI", kind: "Image", connected: false, env: "STABILITY_API_KEY" },
      { id: "firefly", name: "Adobe Firefly", vendor: "Adobe", kind: "Image", connected: false, env: "ADOBE_API_KEY" },
      { id: "ideogram", name: "Ideogram", vendor: "Ideogram", kind: "Image · text", connected: false, env: "IDEOGRAM_API_KEY" },
      { id: "flux", name: "FLUX.1", vendor: "Black Forest Labs", kind: "Image", connected: true, env: "BFL_API_KEY" },
    ],
    video: [
      { id: "sora", name: "Sora", vendor: "OpenAI", kind: "Video", connected: true, env: "OPENAI_API_KEY" },
      { id: "veo", name: "Veo 3", vendor: "Google DeepMind", kind: "Video", connected: false, env: "GOOGLE_API_KEY" },
      { id: "runway", name: "Runway Gen-3", vendor: "Runway", kind: "Video", connected: true, env: "RUNWAY_API_KEY" },
      { id: "pika", name: "Pika 1.5", vendor: "Pika", kind: "Video", connected: false, env: "PIKA_API_KEY" },
      { id: "kling", name: "Kling AI", vendor: "Kuaishou", kind: "Video", connected: false, env: "KLING_API_KEY" },
      { id: "luma", name: "Luma Dream Machine", vendor: "Luma", kind: "Video", connected: true, env: "LUMA_API_KEY" },
    ],
    voice: [
      { id: "eleven", name: "ElevenLabs", vendor: "ElevenLabs", kind: "Voice · TTS", connected: true, env: "ELEVENLABS_API_KEY" },
      { id: "playht", name: "PlayHT", vendor: "PlayHT", kind: "Voice", connected: false, env: "PLAYHT_API_KEY" },
      { id: "heygen", name: "HeyGen", vendor: "HeyGen", kind: "Avatar video", connected: true, env: "HEYGEN_API_KEY" },
      { id: "did", name: "D-ID", vendor: "D-ID", kind: "Avatar video", connected: false, env: "DID_API_KEY" },
    ],
  };

  // WORKFLOW CANVAS — node-based automation
  const workflowNodes = [
    { id: "n1", type: "trigger", title: "Jackpot > €150M", sub: "Trigger", x: 40, y: 60, icon: "bolt" },
    { id: "n2", type: "ai", title: "Generate hype reel", sub: "Sora · Runway", x: 320, y: 40, icon: "video" },
    { id: "n3", type: "ai", title: "Write captions", sub: "Copy engine", x: 320, y: 170, icon: "pen" },
    { id: "n4", type: "action", title: "Post to socials", sub: "IG · TikTok · X", x: 600, y: 40, icon: "share" },
    { id: "n5", type: "action", title: "SMS blast", sub: "Hermes · opted-in", x: 600, y: 170, icon: "chat" },
    { id: "n6", type: "logic", title: "Wait 1h, then", sub: "If no play → email", x: 880, y: 105, icon: "clock" },
  ];
  const workflowEdges = [["n1", "n2"], ["n1", "n3"], ["n2", "n4"], ["n3", "n4"], ["n3", "n5"], ["n4", "n6"], ["n5", "n6"]];

  // WIREFRAME PLANNING CANVAS
  const wireframes = [
    { id: "w1", title: "Viral landing", x: 30, y: 40, w: 150, h: 200, kind: "page", blocks: ["nav", "hero", "form", "stats", "loops"] },
    { id: "w2", title: "Share card", x: 220, y: 40, w: 120, h: 120, kind: "asset", blocks: ["logo", "headline", "link"] },
    { id: "w3", title: "Spin-to-win", x: 220, y: 190, w: 120, h: 130, kind: "component", blocks: ["wheel", "email", "cta"] },
    { id: "w4", title: "Link-in-bio", x: 380, y: 40, w: 110, h: 200, kind: "page", blocks: ["avatar", "jackpot", "links"] },
    { id: "w5", title: "Email: welcome", x: 380, y: 270, w: 150, h: 90, kind: "email", blocks: ["subject", "hero", "cta"] },
    { id: "w6", title: "Onboarding flow", x: 30, y: 270, w: 150, h: 90, kind: "flow", blocks: ["signup", "kyc", "first play"] },
  ];

  // VIRAL ENGINE
  const viralLoops = [
    { name: "Refer-a-friend", k: 1.42, status: "live", invites: "38.4k", conv: "41%", desc: "Skip-the-line waitlist + milestone rewards" },
    { name: "Share-on-win", k: 0.86, status: "live", invites: "12.1k", conv: "28%", desc: "Auto share card after every win" },
    { name: "Link-in-bio", k: 0.64, status: "live", invites: "9.7k", conv: "33%", desc: "Per-creator microsites" },
    { name: "Embed widget", k: 0.31, status: "testing", invites: "2.2k", conv: "12%", desc: "Live jackpots on partner sites" },
    { name: "Spin-to-win", k: 0.52, status: "live", invites: "6.8k", conv: "47%", desc: "Email-gated welcome wheel" },
  ];
  const viralExperiments = [
    { name: "2 free lines @ 3 referrals", metric: "K-factor", lift: "+0.18", status: "winning" },
    { name: "Story card vs square", metric: "Share rate", lift: "+22%", status: "winning" },
    { name: "SMS vs email invite", metric: "Conversion", lift: "-4%", status: "losing" },
    { name: "Leaderboard prizes", metric: "Invites/user", lift: "+0.4", status: "running" },
  ];

  const socialAccounts = [
    { id: "instagram", name: "Instagram", handle: "@lottoglobal", followers: "412k", connected: true, glyph: "◎" },
    { id: "tiktok", name: "TikTok", handle: "@lottoglobal", followers: "688k", connected: true, glyph: "♪" },
    { id: "x", name: "X", handle: "@lottoglobal", followers: "204k", connected: true, glyph: "𝕏" },
    { id: "facebook", name: "Facebook", handle: "Lotto Global", followers: "356k", connected: true, glyph: "f" },
    { id: "youtube", name: "YouTube", handle: "Lotto Global", followers: "129k", connected: false, glyph: "▶" },
    { id: "linkedin", name: "LinkedIn", handle: "Lotto Global", followers: "44k", connected: false, glyph: "in" },
  ];
  const scheduled = [
    { day: "Mon", time: "09:00", ch: "instagram", t: "Jackpot Monday: €211M reveal", status: "scheduled" },
    { day: "Tue", time: "12:30", ch: "tiktok", t: "Lucky Dip challenge #2", status: "scheduled" },
    { day: "Wed", time: "18:00", ch: "x", t: "Draw-night live thread", status: "scheduled" },
    { day: "Fri", time: "17:00", ch: "instagram", t: "€211M FINAL CALL story", status: "draft" },
    { day: "Sat", time: "10:00", ch: "facebook", t: "Winner spotlight: Lagos", status: "scheduled" },
  ];

  window.MK = { ac, channels, kpis, weeks, analytics, convos, campaigns, flows, copyTypes, tones, audiences, copyBank, brandKit, adFormats, influencers, stages, socialAccounts, scheduled, aiTools, workflowNodes, workflowEdges, wireframes, viralLoops, viralExperiments };
})();
