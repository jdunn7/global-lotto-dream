// dashboard-data.js — Affiliate / MLM commission dashboard dataset
(function () {
  const FIRST = ["Daniel", "Priya", "Marco", "Aisha", "Tom", "Lena", "Carlos", "Yuki", "Sara", "Owen", "Nadia", "Leo", "Mia", "Kofi", "Ines", "Raj", "Elsa", "Bruno", "Tara", "Sam", "Hana", "Diego", "Zoe", "Felix"];
  const LAST = ["K.", "N.", "B.", "O.", "R.", "M.", "S.", "T.", "L.", "P.", "C.", "D.", "V.", "A.", "G."];
  const COUNTRY = ["🇬🇧 UK", "🇩🇪 Germany", "🇫🇷 France", "🇪🇸 Spain", "🇮🇹 Italy", "🇳🇬 Nigeria", "🇮🇳 India", "🇧🇷 Brazil", "🇦🇺 Australia", "🇵🇹 Portugal", "🇿🇦 South Africa", "🇲🇽 Mexico"];
  const GAMES = ["EuroMillions", "Powerball", "Mega Millions", "UK Lotto", "El Gordo", "Oz Lotto"];

  let s = 7;
  const rnd = () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const between = (a, b) => a + rnd() * (b - a);

  const RATES = { 1: 0.08, 2: 0.04, 3: 0.02 };
  const COUNTS = { 1: 14, 2: 39, 3: 86 };

  function makeMembers() {
    const out = [];
    let id = 1001;
    [1, 2, 3].forEach((lvl) => {
      const n = lvl === 1 ? 14 : lvl === 2 ? 18 : 14; // show subset of larger network
      for (let i = 0; i < n; i++) {
        const vol = Math.round(between(20, lvl === 1 ? 900 : lvl === 2 ? 400 : 160));
        const active = rnd() > (lvl === 1 ? 0.18 : lvl === 2 ? 0.34 : 0.5);
        const daysAgo = Math.round(between(1, 180));
        out.push({
          id: "U" + (id++),
          name: pick(FIRST) + " " + pick(LAST),
          level: lvl,
          country: pick(COUNTRY),
          game: pick(GAMES),
          joinedDays: daysAgo,
          status: active ? "active" : "dormant",
          volume: active ? vol : Math.round(vol * 0.15),
          referrals: lvl === 1 ? Math.round(between(0, 9)) : Math.round(between(0, 3)),
          commission: Math.round(vol * RATES[lvl] * (active ? 1 : 0.15) * 100) / 100,
        });
      }
    });
    return out.sort((a, b) => b.commission - a.commission);
  }

  const members = makeMembers();

  // 12 weeks of earnings
  const weeks = [];
  let base = 28;
  for (let i = 0; i < 12; i++) {
    base = Math.max(8, base * between(0.92, 1.28));
    weeks.push({
      label: "W" + (i + 1),
      commission: Math.round(base * 100) / 100,
      signups: Math.round(between(1, 9)),
    });
  }

  const byLevel = [1, 2, 3].map((lvl) => {
    const mem = members.filter((m) => m.level === lvl);
    const volume = Math.round(mem.reduce((a, m) => a + m.volume, 0) * (lvl === 3 ? 4 : lvl === 2 ? 2.2 : 1));
    const commission = Math.round(volume * RATES[lvl] * 100) / 100;
    return { lvl, rate: RATES[lvl] * 100, members: COUNTS[lvl], volume, commission };
  });

  const lifetime = Math.round(byLevel.reduce((a, l) => a + l.commission, 0) * 100) / 100 + 1840;
  const thisMonth = Math.round(weeks.slice(-4).reduce((a, w) => a + w.commission, 0) * 100) / 100;
  const pending = 318.4;

  const tiers = [
    { name: "Bronze", min: 0, rate: "5 / 2 / 1%", perks: "Standard links" },
    { name: "Silver", min: 1000, rate: "6 / 3 / 1%", perks: "Custom code" },
    { name: "Gold", min: 5000, rate: "8 / 4 / 2%", perks: "Priority payouts, banners" },
    { name: "Platinum", min: 20000, rate: "10 / 5 / 3%", perks: "Account manager, events" },
  ];
  const tierVolume = 12640; // lifetime referred volume toward tier

  const payouts = [
    { ref: "PO-4471", method: "Bank · GBP", amount: 200, status: "completed", date: "24 May 2026" },
    { ref: "PO-4390", method: "USDC · 0x9f…2c", amount: 318.4, status: "pending", date: "Today" },
    { ref: "PO-4288", method: "PayPal", amount: 142.5, status: "completed", date: "10 May 2026" },
    { ref: "PO-4120", method: "Bank · GBP", amount: 96, status: "completed", date: "28 Apr 2026" },
  ];

  const leaderboard = [
    { name: "You (Amara O.)", network: 139, vol: 12640, you: true },
    { name: "Sven L.", network: 412, vol: 38200 },
    { name: "Grace M.", network: 268, vol: 24100 },
    { name: "Hiro T.", network: 201, vol: 19850 },
    { name: "Amara O. (you)", network: 139, vol: 12640 },
    { name: "Bianca R.", network: 96, vol: 8400 },
  ].filter((x, i) => !(x.you)).sort((a, b) => b.vol - a.vol);

  const activity = members.slice(0, 8).map((m) => ({
    name: m.name, level: m.level, game: m.game,
    amount: Math.round(between(0.4, 22) * 100) / 100,
    when: m.joinedDays < 1 ? "just now" : pick(["12m ago", "1h ago", "3h ago", "today", "yesterday"]),
  }));

  window.AFFIL = {
    affiliate: { name: "Amara Okafor", id: "AF-77214", code: "AMARA777", tier: "Gold", joined: "Jan 2024", avatar: "AO" },
    kpi: { lifetime, thisMonth, pending, network: 139, directRate: 0.68, conv: 0.41 },
    weeks, byLevel, members, tiers, tierVolume, payouts, leaderboard, activity, rates: RATES, counts: COUNTS,
  };
})();
