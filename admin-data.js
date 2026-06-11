// admin-data.js — PLG Board & Admin CRM dataset (illustrative, internally consistent)
(function () {
  const MONTHS = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"];
  // monthly series (12 mo trailing) — $ in thousands unless noted
  let rev=420, sign=6200, tick=58000;
  const series = MONTHS.map((m,i)=>{
    rev = Math.round(rev*(1.04+ (i%3===0?0.05:0.01)) );
    sign = Math.round(sign*(1.03+Math.random()*0.04));
    tick = Math.round(tick*(1.035+Math.random()*0.03));
    const cogs = Math.round(rev*0.32);
    const opex = Math.round(rev*0.41);
    const ebitda = rev - cogs - opex;
    return { m, revenue:rev, signups:sign, tickets:tick, cogs, opex, ebitda, marketing:Math.round(rev*0.18) };
  });
  const ytd = (k)=>series.reduce((a,s)=>a+s[k],0);

  const kpis = {
    revenueYTD: ytd("revenue")*1000,
    ebitdaYTD: ytd("ebitda")*1000,
    players: 124300,
    signupsYTD: ytd("signups"),
    ticketsYTD: ytd("tickets"),
    arpu: 67.4,
    cac: 18.2,
    ltv: 214,
    grossMargin: 0.68,
    netMargin: 0.21,
    cashOnHand: 4_180_000,
    runwayMo: 22,
    mrrGrowth: 0.064,
    churn: 0.039,
  };

  // P&L statement (annual, $)
  const pnl = [
    { line:"Gross revenue", val: ytd("revenue")*1000, kind:"rev", pct:1 },
    { line:"— Ticket sales commission", val: Math.round(ytd("revenue")*1000*0.71), kind:"sub" },
    { line:"— Affiliate program fees", val: Math.round(ytd("revenue")*1000*0.19), kind:"sub" },
    { line:"— Premium & ads", val: Math.round(ytd("revenue")*1000*0.10), kind:"sub" },
    { line:"Cost of revenue (COGS)", val: -ytd("cogs")*1000, kind:"cost" },
    { line:"Gross profit", val: (ytd("revenue")-ytd("cogs"))*1000, kind:"total" },
    { line:"Operating expenses", val: -ytd("opex")*1000, kind:"cost" },
    { line:"— Marketing & growth", val: -ytd("marketing")*1000, kind:"sub" },
    { line:"— Salaries & contractors", val: -Math.round(ytd("opex")*1000*0.44), kind:"sub" },
    { line:"— Tech & infrastructure", val: -Math.round(ytd("opex")*1000*0.16), kind:"sub" },
    { line:"— G&A / overheads", val: -Math.round(ytd("opex")*1000*0.18), kind:"sub" },
    { line:"EBITDA", val: ytd("ebitda")*1000, kind:"total" },
    { line:"Depreciation & amortization", val: -148000, kind:"cost" },
    { line:"Net interest & tax", val: -612000, kind:"cost" },
    { line:"Net profit", val: ytd("ebitda")*1000-148000-612000, kind:"net" },
  ];

  const expenses = [
    { cat:"Marketing & growth", val: ytd("marketing")*1000, color:"#4f63b5", trend:"+8%" },
    { cat:"Salaries & contractors", val: Math.round(ytd("opex")*1000*0.44), color:"#c6a86a", trend:"+3%" },
    { cat:"Tech & infrastructure", val: Math.round(ytd("opex")*1000*0.16), color:"#7b86c4", trend:"+12%" },
    { cat:"Payment & banking fees", val: Math.round(ytd("revenue")*1000*0.06), color:"#a7aed6", trend:"+5%" },
    { cat:"G&A / office / overheads", val: Math.round(ytd("opex")*1000*0.18), color:"#6b7392", trend:"-2%" },
    { cat:"Compliance & legal", val: 286000, color:"#5fae86", trend:"+22%" },
  ];

  const demographics = {
    age: [["18–24",14],["25–34",33],["35–44",27],["45–54",16],["55–64",7],["65+",3]],
    gender: [["Male",58],["Female",40],["Other / NA",2]],
    device: [["Mobile",71],["Desktop",24],["Tablet",5]],
    geo: [["United Kingdom",26,"🇬🇧"],["United States",21,"🇺🇸"],["Germany",12,"🇩🇪"],["Spain",9,"🇪🇸"],["Nigeria",8,"🇳🇬"],["Australia",7,"🇦🇺"],["Brazil",6,"🇧🇷"],["Rest of world",11,"🌍"]],
  };

  const projections = {
    quarters: ["Q3'26","Q4'26","Q1'27","Q2'27","Q3'27","Q4'27"],
    base:   [2.6,3.0,3.4,3.9,4.5,5.1],
    bull:   [2.8,3.5,4.3,5.4,6.7,8.2],
    bear:   [2.4,2.5,2.6,2.7,2.9,3.1],
  };

  const risks = [
    { id:"R-01", title:"Regulatory licence delay (DE market)", cat:"Regulatory", sev:"High", like:"Medium", owner:"Legal", status:"Mitigating", trend:"flat" },
    { id:"R-02", title:"Payment processor concentration", cat:"Financial", sev:"High", like:"Low", owner:"Finance", status:"Monitoring", trend:"down" },
    { id:"R-03", title:"Affiliate payout fraud attempts", cat:"Fraud", sev:"Medium", like:"Medium", owner:"Risk Ops", status:"Active controls", trend:"down" },
    { id:"R-04", title:"Server outage during major draw", cat:"Operational", sev:"High", like:"Low", owner:"Engineering", status:"Resolved", trend:"down" },
    { id:"R-05", title:"FX exposure on EUR payouts", cat:"Financial", sev:"Medium", like:"High", owner:"Treasury", status:"Hedging", trend:"flat" },
    { id:"R-06", title:"Key-person dependency (CTO)", cat:"People", sev:"Medium", like:"Low", owner:"Board", status:"Succession plan", trend:"flat" },
  ];
  const incidents = [
    { d:"02 Jun 2026", t:"Draw-night latency spike", sev:"Minor", impact:"3 min degraded checkout", status:"Closed" },
    { d:"18 May 2026", t:"Chargeback cluster — flagged BIN", sev:"Moderate", impact:"$14.2k provisioned", status:"Recovered" },
    { d:"27 Apr 2026", t:"Mis-credited bonus batch", sev:"Minor", impact:"412 wallets corrected", status:"Closed" },
  ];
  const legal = [
    { case:"PLG v. AffiliateX (ToS breach)", type:"Commercial", juris:"England & Wales", exposure:120000, status:"Discovery", color:"#c6a86a" },
    { case:"Data subject request backlog", type:"Privacy / GDPR", juris:"EU", exposure:0, status:"In compliance", color:"#5fae86" },
    { case:"Trademark opposition (logo)", type:"IP", juris:"USPTO", exposure:45000, status:"Filed response", color:"#4f63b5" },
    { case:"Contractor classification review", type:"Employment", juris:"US-CA", exposure:88000, status:"Advisory", color:"#6b7392" },
  ];
  const liabilities = [
    { l:"Player winnings payable", v:1_240_000 },
    { l:"Affiliate commissions payable", v:512_000 },
    { l:"Deferred revenue (subscriptions)", v:386_000 },
    { l:"Trade payables", v:214_000 },
    { l:"Tax provision", v:612_000 },
    { l:"Term loan (3yr)", v:900_000 },
  ];

  const taxes = [
    { juris:"United Kingdom", type:"Corporation tax", rate:"25%", base:1_840_000, owed:460_000, status:"Provisioned" },
    { juris:"United States", type:"Federal + state", rate:"24.5%", base:980_000, owed:240_100, status:"Filed" },
    { juris:"Germany", type:"Gewerbesteuer + KSt", rate:"30%", base:420_000, owed:126_000, status:"Estimated" },
    { juris:"VAT / Sales tax (multi)", type:"Indirect", rate:"avg 19%", base:0, owed:198_400, status:"Remitting" },
  ];

  const capTable = [
    { holder:"Founders (3)", class:"Common", shares:6_000_000, pct:48.0, color:"#4f63b5" },
    { holder:"Seed investors", class:"Pref. A", shares:2_600_000, pct:20.8, color:"#c6a86a" },
    { holder:"Series A lead", class:"Pref. B", shares:2_100_000, pct:16.8, color:"#7b86c4" },
    { holder:"ESOP pool", class:"Options", shares:1_300_000, pct:10.4, color:"#a7aed6" },
    { holder:"Advisors & angels", class:"Common", shares:500_000, pct:4.0, color:"#6b7392" },
  ];
  const corp = {
    parent:{ name:"PLG Holdings Ltd", juris:"🇬🇧 UK · HoldCo" },
    subs:[
      { name:"PlayLottoGlobal Ops Ltd", juris:"🇬🇧 UK · Trading", note:"Platform & player ops" },
      { name:"PLG Affiliates LLC", juris:"🇺🇸 US · Marketing", note:"Affiliate network" },
      { name:"PLG Payments BV", juris:"🇳🇱 NL · Treasury", note:"Settlement & FX" },
      { name:"PLG Tech Pvt", juris:"🇮🇳 IN · R&D", note:"Engineering" },
    ],
  };
  const board = [
    { n:"Joshua Dunn", r:"CIO", i:"JD", since:"2024", loc:"London, UK", focus:["Product","Platform","AI"], bio:"Founder & chief information officer. Architected the PlayLottoGlobal platform, the affiliate engine and the Hermes operating system. Sets technology and product direction across the group." },
    { n:"Amara Okafor", r:"COO", i:"AO", since:"2024", loc:"Lagos, NG", focus:["Operations","Support","Payouts"], bio:"Chief operating officer. Runs global player operations, support and the payouts pipeline across 40+ markets, and owns the player-experience roadmap." },
    { n:"Maria Reyes", r:"CFO", i:"MR", since:"2024", loc:"Madrid, ES", focus:["Finance","Treasury","Fundraising"], bio:"Chief financial officer. Leads accounting, treasury, FX hedging and investor relations; closed the Series A and manages the cap table." },
    { n:"Sven Lindqvist", r:"Investor Director", i:"SL", since:"2025", loc:"Stockholm, SE", focus:["Governance","Strategy"], bio:"Series A lead investor and board director. Brings marketplace-scaling experience and chairs the audit committee." },
    { n:"Todd Poindexter", r:"Non-Executive", i:"TP", since:"2025", loc:"Austin, US", focus:["Regulatory","Partnerships"], bio:"Non-executive director and advisor on licensing, regulatory strategy and lottery-operator partnerships." },
  ];

  const signupSources = [
    ["Affiliate referrals",46,"#4f63b5"],["Organic / SEO",21,"#c6a86a"],["Paid social",18,"#7b86c4"],["Email / SMS",9,"#a7aed6"],["Direct",6,"#6b7392"]
  ];

  function money(n){ const a=Math.abs(n); const s=n<0?"-":""; if(a>=1e6)return s+"$"+(a/1e6).toFixed(2)+"M"; if(a>=1e3)return s+"$"+(a/1e3).toFixed(0)+"k"; return s+"$"+a; }
  function full(n){ return (n<0?"-$":"$")+Math.abs(Math.round(n)).toLocaleString("en-US"); }

  window.ADMIN = { MONTHS, series, kpis, pnl, expenses, demographics, projections, risks, incidents, legal, liabilities, taxes, capTable, corp, board, signupSources, ytd, money, full };
})();
