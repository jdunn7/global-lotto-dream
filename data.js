// data.js — Lotto Global game catalogue + helpers (plain JS, attaches to window)
(function () {
  const GAMES = [
    {
      id: "euromillions",
      name: "EuroMillions",
      region: "Europe",
      flag: "🇪🇺",
      tagline: "Friday rollover live",
      jackpot: 211000000,
      currency: "€",
      pick: { main: 5, mainMax: 50, bonus: 2, bonusMax: 12, bonusName: "Lucky Stars" },
      price: 2.5,
      nextDrawISO: nextDraw(5, 20), // Friday 20:00
      cadence: "Tue & Fri",
      hot: [17, 23, 44, 21, 50],
      tint: "224 72% 58%",
    },
    {
      id: "powerball",
      name: "Powerball",
      region: "USA",
      flag: "🇺🇸",
      tagline: "Record rollover",
      jackpot: 386000000,
      currency: "$",
      pick: { main: 5, mainMax: 69, bonus: 1, bonusMax: 26, bonusName: "Powerball" },
      price: 2.0,
      nextDrawISO: nextDraw(3, 22),
      cadence: "Mon · Wed · Sat",
      hot: [32, 39, 23, 61, 16],
      tint: "0 75% 58%",
    },
    {
      id: "megamillions",
      name: "Mega Millions",
      region: "USA",
      flag: "🇺🇸",
      tagline: "Tuesday draw",
      jackpot: 154000000,
      currency: "$",
      pick: { main: 5, mainMax: 70, bonus: 1, bonusMax: 25, bonusName: "Mega Ball" },
      price: 2.0,
      nextDrawISO: nextDraw(2, 23),
      cadence: "Tue & Fri",
      hot: [10, 31, 14, 48, 70],
      tint: "265 70% 64%",
    },
    {
      id: "uklotto",
      name: "UK Lotto",
      region: "United Kingdom",
      flag: "🇬🇧",
      tagline: "Saturday + bonus",
      jackpot: 7800000,
      currency: "£",
      pick: { main: 6, mainMax: 59, bonus: 0, bonusMax: 0, bonusName: "" },
      price: 2.0,
      nextDrawISO: nextDraw(6, 19),
      cadence: "Wed & Sat",
      hot: [40, 14, 52, 23, 38, 7],
      tint: "210 90% 60%",
    },
    {
      id: "elgordo",
      name: "El Gordo",
      region: "Spain",
      flag: "🇪🇸",
      tagline: "Sunday primitiva",
      jackpot: 18200000,
      currency: "€",
      pick: { main: 5, mainMax: 54, bonus: 1, bonusMax: 9, bonusName: "Clave" },
      price: 1.5,
      nextDrawISO: nextDraw(0, 21),
      cadence: "Sundays",
      hot: [13, 26, 41, 5, 49],
      tint: "32 92% 56%",
    },
    {
      id: "ozlotto",
      name: "Oz Lotto",
      region: "Australia",
      flag: "🇦🇺",
      tagline: "Tuesday mega",
      jackpot: 30000000,
      currency: "$",
      pick: { main: 7, mainMax: 47, bonus: 0, bonusMax: 0, bonusName: "" },
      price: 1.6,
      nextDrawISO: nextDraw(2, 20),
      cadence: "Tuesdays",
      hot: [7, 11, 27, 38, 1, 44, 20],
      tint: "188 80% 50%",
    },
  ];

  // Past results for the ticker / results feed
  const RESULTS = [
    { id: "euromillions", date: "Fri 30 May", balls: [4, 17, 23, 44, 50], bonus: [3, 9], jackpotWon: false },
    { id: "powerball", date: "Sat 31 May", balls: [12, 23, 32, 39, 61], bonus: [16], jackpotWon: false },
    { id: "uklotto", date: "Sat 31 May", balls: [8, 14, 23, 38, 40, 52], bonus: [11], jackpotWon: true },
    { id: "megamillions", date: "Fri 30 May", balls: [10, 14, 31, 48, 70], bonus: [7], jackpotWon: false },
  ];

  // Winners feed
  const WINNERS = [
    { name: "Amara O.", city: "Lagos", game: "Powerball", amount: 1200000, when: "2h ago" },
    { name: "Lukas M.", city: "Munich", game: "EuroMillions", amount: 84000, when: "5h ago" },
    { name: "Priya R.", city: "Mumbai", game: "Mega Millions", amount: 530000, when: "yesterday" },
    { name: "Sofia C.", city: "Lisbon", game: "El Gordo", amount: 21500, when: "yesterday" },
    { name: "Jack T.", city: "Sydney", game: "Oz Lotto", amount: 96000, when: "2 days ago" },
  ];

  function nextDraw(weekday, hour) {
    const now = new Date();
    const d = new Date(now);
    d.setHours(hour, 0, 0, 0);
    let add = (weekday - d.getDay() + 7) % 7;
    if (add === 0 && d <= now) add = 7;
    d.setDate(d.getDate() + add);
    return d.toISOString();
  }

  function gameById(id) { return GAMES.find((g) => g.id === id); }

  function formatMoney(n, currency) {
    currency = currency || "$";
    if (n >= 1000000) {
      const m = n / 1000000;
      return currency + (m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)) + "M";
    }
    return currency + n.toLocaleString("en-US");
  }
  function formatFull(n, currency) {
    return (currency || "$") + Math.round(n).toLocaleString("en-US");
  }

  function quickPick(game) {
    const p = game.pick;
    return {
      main: sample(p.mainMax, p.main),
      bonus: p.bonus ? sample(p.bonusMax, p.bonus) : [],
    };
  }
  function sample(max, count) {
    const pool = Array.from({ length: max }, (_, i) => i + 1);
    const out = [];
    for (let i = 0; i < count; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      out.push(pool.splice(idx, 1)[0]);
    }
    return out.sort((a, b) => a - b);
  }

  window.LOTTO = { GAMES, RESULTS, WINNERS, gameById, formatMoney, formatFull, quickPick, sample };
})();
