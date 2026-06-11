// admin.jsx — PLG Board & Admin CRM console
const { useState, useEffect } = React;
const A = window.ADMIN;
const RAMP = ["#4f63b5", "#7b86c4", "#a7aed6", "#c6a86a", "#6b7392", "#5fae86"];
const money = A.money, full = A.full;

const ANAV = [
  { id:"overview", label:"Board Overview", icon:"grid" },
  { id:"revenue", label:"Revenue & Growth", icon:"trophy" },
  { id:"expenses", label:"Expenses & Overheads", icon:"wallet" },
  { id:"demographics", label:"Data & Demographics", icon:"users" },
  { id:"projections", label:"Projections", icon:"sparkle" },
  { id:"risk", label:"Risk, Legal & Liabilities", icon:"shield" },
  { id:"accounting", label:"Accounting & Taxes", icon:"check" },
  { id:"cap", label:"Cap Table & Structure", icon:"globe" },
];

function Admin(){
  const [tab,setTab] = useState("overview");
  const [member,setMember] = useState(null);
  const [scale,setScale] = useState(()=>{ try{ return +localStorage.getItem("plg_admin_scale")||1; }catch(e){ return 1; } });
  useEffect(()=>{
    const d=document.querySelector(".dash"); if(!d) return;
    d.style.zoom=scale;
    const fill=(100/scale).toFixed(2)+"vh";
    d.style.minHeight=fill;
    const side=document.querySelector(".dash-side"); if(side) side.style.height=fill;
    try{ localStorage.setItem("plg_admin_scale",scale); }catch(e){}
  },[scale]);
  const cur = ANAV.find(n=>n.id===tab);
  return (
    <div className="dash">
      <aside className="dash-side">
        <a className="dash-brand" href="PLG Member Hub.html"><img src="plg-logo-full.png" alt="PLG" style={{height:34}} /></a>
        <span className="dash-side-tag">Board &amp; Admin CRM</span>
        <nav className="dash-nav">
          {ANAV.map(n=><button key={n.id} className={`dash-nav-i ${tab===n.id?"on":""}`} onClick={()=>{setTab(n.id);window.scrollTo(0,0);}}><Icon name={n.icon} size={18} /> {n.label}</button>)}
        </nav>
        <div className="dash-settings">
          <span className="ds-h">Settings</span>
          <button className="ds-item"><Icon name="user" size={15} /> Admin &amp; users</button>
          <button className="ds-item"><Icon name="shield" size={15} /> Security &amp; access</button>
          <button className="ds-item"><Icon name="globe" size={15} /> Integrations</button>
          <button className="ds-item"><Icon name="bell" size={15} /> Notifications</button>
          <button className="ds-item"><Icon name="grid" size={15} /> Preferences</button>
        </div>
        <a className="dash-back" href="PLG Member Hub.html"><Icon name="chevronL" size={15} /> Member hub</a>
      </aside>
      <main className="dash-main">
        <header className="dash-top">
          <div><h1 className="dash-h1">{cur.label}</h1><span className="dash-crumb">PLG Holdings Ltd · Board of Directors</span></div>
          <div className="dash-top-r">
            <div className="scale-ctl" title="Display scale">
              <Icon name="expand" size={15} />
              <input type="range" min="0.7" max="1.1" step="0.05" value={scale} onChange={e=>setScale(+e.target.value)} />
              <span className="tnum">{Math.round(scale*100)}%</span>
            </div>
            <div className="board-ava">{A.board.map((b,i)=><span key={i} className="bava" title={b.n+" · "+b.r} onClick={()=>setMember(b)} style={{cursor:"pointer"}}>{b.i}</span>)}</div>
            <button className="dash-btn-gold"><Icon name="arrowR" size={16} /> Export board pack</button>
          </div>
        </header>
        <div className="dash-body">
          {tab==="overview" && <Overview go={setTab} onMember={setMember} />}
          {tab==="revenue" && <Revenue />}
          {tab==="expenses" && <Expenses />}
          {tab==="demographics" && <Demographics />}
          {tab==="projections" && <Projections />}
          {tab==="risk" && <Risk />}
          {tab==="accounting" && <Accounting />}
          {tab==="cap" && <CapTable />}
        </div>
        {member && <BoardModal m={member} onClose={()=>setMember(null)} />}
      </main>
    </div>
  );
}

/* ---- shared chart helpers ---- */
function BarLine({ data, barKey, lineKey, labels, barColor="rgba(79,99,181,.55)", lineColor="var(--gold)" }){
  const W=640,H=210,pad=26,n=data.length,bw=(W-pad*2)/n;
  const maxB=Math.max(...data.map(d=>d[barKey])),maxL=Math.max(...data.map(d=>d[lineKey]||0));
  const pts=data.map((d,i)=>[pad+bw*i+bw/2, H-pad-((d[lineKey]||0)/maxL)*(H-pad*2)]);
  const line=pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" preserveAspectRatio="none">
        {[.25,.5,.75,1].map(g=><line key={g} x1={pad} x2={W-pad} y1={H-pad-g*(H-pad*2)} y2={H-pad-g*(H-pad*2)} className="grid-l" />)}
        {data.map((d,i)=>{const h=(d[barKey]/maxB)*(H-pad*2);return <rect key={i} x={pad+bw*i+bw*0.24} y={H-pad-h} width={bw*0.52} height={h} rx="3" fill={barColor} />;})}
        {lineKey&&<path d={line} fill="none" stroke={lineColor} strokeWidth="2.5" />}
        {lineKey&&pts.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="3" fill={lineColor} />)}
      </svg>
      <div className="chart-x">{labels.map((l,i)=><span key={i}>{l}</span>)}</div>
    </div>
  );
}
function Donut({ data, size=150 }){
  const total=data.reduce((a,d)=>a+d[1],0); let acc=0; const r=size/2,cx=r,cy=r,rad=r-10,C=2*Math.PI*rad;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{transform:"rotate(-90deg)"}}>
      <circle cx={cx} cy={cy} r={rad} fill="none" stroke="var(--border-soft)" strokeWidth="14" />
      {data.map((d,i)=>{const frac=d[1]/total,len=frac*C,off=acc*C;acc+=frac;
        return <circle key={i} cx={cx} cy={cy} r={rad} fill="none" stroke={d[2]||RAMP[i%6]} strokeWidth="14" strokeDasharray={`${len} ${C-len}`} strokeDashoffset={-off} />;})}
    </svg>
  );
}
function kpiCard(l,v,d,ic,gold,up){ return (
  <div className={`kpi ${gold?"kpi-gold":""}`}><span className="kpi-ic"><Icon name={ic} size={16} /></span><span className="kpi-l">{l}</span><span className="kpi-v tnum">{v}</span><span className={`kpi-d ${up?"up":""}`}>{d}</span></div>
); }

/* ---- OVERVIEW ---- */
function Overview({ go, onMember }){
  const k=A.kpis;
  return (
    <>
      <div className="kpi-row">
        {kpiCard("Revenue (YTD)",money(k.revenueYTD),"+"+Math.round(k.mrrGrowth*100)+"% MoM","trophy",true,true)}
        {kpiCard("EBITDA",money(k.ebitdaYTD),Math.round(k.netMargin*100)+"% net margin","chart",false,true)}
        {kpiCard("Active players",k.players.toLocaleString(),"+"+k.signupsYTD.toLocaleString()+" signups","users",false,true)}
        {kpiCard("Cash on hand",money(k.cashOnHand),k.runwayMo+" mo runway","wallet",false,false)}
        {kpiCard("LTV : CAC",(k.ltv/k.cac).toFixed(1)+"×","$"+k.ltv+" LTV · $"+k.cac+" CAC","sparkle",true,true)}
        {kpiCard("Churn",Math.round(k.churn*1000)/10+"%","monthly player churn","refresh",false,false)}
      </div>
      <div className="dash-2col">
        <div className="dash-card"><div className="dc-head"><h3>Revenue &amp; EBITDA</h3><span className="dc-sub">Trailing 12 months</span></div>
          <BarLine data={A.series} barKey="revenue" lineKey="ebitda" labels={A.MONTHS} /></div>
        <div className="dash-card"><div className="dc-head"><h3>P&amp;L snapshot</h3></div>
          <div className="pnl-mini">
            {A.pnl.filter(p=>["rev","total","net"].includes(p.kind)).map((p,i)=>(
              <div className={`pnl-mini-row ${p.kind}`} key={i}><span>{p.line}</span><strong className="tnum">{money(p.val)}</strong></div>
            ))}
          </div>
          <button className="dc-link" onClick={()=>go("accounting")} style={{marginTop:10}}>Full statement →</button>
        </div>
      </div>
      <div className="dash-2col b">
        <div className="dash-card"><div className="dc-head"><h3>Signup sources</h3></div>
          <div className="donut-row"><Donut data={A.signupSources} /><div className="legend">{A.signupSources.map((s,i)=><div className="leg" key={i}><span className="leg-dot" style={{background:s[2]}} /> {s[0]} <strong>{s[1]}%</strong></div>)}</div></div>
        </div>
        <div className="dash-card"><div className="dc-head"><h3>Board &amp; governance</h3></div>
          <div className="board-list">{A.board.map((b,i)=><div className="board-row" key={i} onClick={()=>onMember&&onMember(b)} style={{cursor:"pointer"}}><span className="bava lg">{b.i}</span><div><div className="board-n">{b.n}</div><div className="board-r">{b.r}</div></div><span className="board-go"><Icon name="chevron" size={15} /></span></div>)}</div>
        </div>
      </div>
    </>
  );
}

/* ---- REVENUE ---- */
function Revenue(){
  const k=A.kpis;
  return (
    <>
      <div className="kpi-row three">
        {kpiCard("Ticket sales (YTD)",A.ytd("tickets").toLocaleString(),"tickets purchased","ticket",false,true)}
        {kpiCard("New signups (YTD)",A.ytd("signups").toLocaleString(),"+"+Math.round(k.mrrGrowth*100)+"% MoM","users",true,true)}
        {kpiCard("ARPU",full(k.arpu),"per active player / yr","trophy",false,true)}
      </div>
      <div className="dash-card" style={{marginTop:18}}><div className="dc-head"><h3>New signups</h3><span className="dc-sub">Monthly</span></div>
        <BarLine data={A.series} barKey="signups" lineKey="signups" labels={A.MONTHS} barColor="rgba(79,99,181,.55)" /></div>
      <div className="dash-2col" style={{marginTop:18}}>
        <div className="dash-card"><div className="dc-head"><h3>Ticket purchases</h3><span className="dc-sub">Monthly volume</span></div>
          <BarLine data={A.series} barKey="tickets" labels={A.MONTHS} barColor="rgba(198,168,106,.65)" /></div>
        <div className="dash-card"><div className="dc-head"><h3>Revenue by stream</h3></div>
          <div className="bars">{[["Ticket commission",71,"var(--primary)"],["Affiliate fees",19,"var(--gold)"],["Premium & ads",10,"#2fb7ff"]].map((b,i)=>(
            <div className="bar-row" key={i}><div className="bar-top"><span>{b[0]}</span><strong>{b[1]}%</strong></div><div className="bar-track"><span style={{width:b[1]+"%",background:b[2]}} /></div></div>
          ))}</div></div>
      </div>
    </>
  );
}

/* ---- EXPENSES ---- */
function Expenses(){
  const total=A.expenses.reduce((a,e)=>a+e.val,0);
  return (
    <>
      <div className="kpi-row three">
        {kpiCard("Total opex (YTD)",money(total),"all overheads","wallet",false,false)}
        {kpiCard("Burn / mo",money(Math.round(total/12)),"avg monthly","chart",false,false)}
        {kpiCard("Opex ratio",Math.round(total/(A.ytd("revenue")*1000)*100)+"%","of revenue","refresh",true,false)}
      </div>
      <div className="dash-2col" style={{marginTop:18}}>
        <div className="dash-card"><div className="dc-head"><h3>Expense breakdown</h3></div>
          <div className="donut-row"><Donut data={A.expenses.map(e=>[e.cat,e.val,e.color])} /><div className="legend">{A.expenses.map((e,i)=><div className="leg" key={i}><span className="leg-dot" style={{background:e.color}} /> {e.cat} <strong>{money(e.val)}</strong></div>)}</div></div></div>
        <div className="dash-card"><div className="dc-head"><h3>Overheads detail</h3></div>
          <div className="tbl-wrap"><table className="dl-table"><thead><tr><th>Category</th><th className="num">Annual</th><th className="num">% opex</th><th className="num">YoY</th></tr></thead><tbody>
            {A.expenses.map((e,i)=><tr key={i}><td>{e.cat}</td><td className="num tnum">{money(e.val)}</td><td className="num tnum">{Math.round(e.val/total*100)}%</td><td className="num" style={{color:e.trend[0]==="-"?"var(--primary-soft)":"var(--gold)"}}>{e.trend}</td></tr>)}
          </tbody></table></div></div>
      </div>
    </>
  );
}

/* ---- DEMOGRAPHICS ---- */
function Demographics(){
  const d=A.demographics;
  return (
    <>
      <div className="dash-2col">
        <div className="dash-card"><div className="dc-head"><h3>Players by geography</h3></div>
          <div className="geo-list">{d.geo.map((g,i)=><div className="geo-row" key={i}><span className="geo-flag">{g[2]}</span><span className="geo-name">{g[0]}</span><div className="bar-track sm"><span style={{width:g[1]*3.8+"%"}} /></div><strong className="tnum">{g[1]}%</strong></div>)}</div></div>
        <div className="dash-card"><div className="dc-head"><h3>Age distribution</h3></div>
          <div className="bars">{d.age.map((a,i)=><div className="bar-row" key={i}><div className="bar-top"><span>{a[0]}</span><strong>{a[1]}%</strong></div><div className="bar-track"><span style={{width:a[1]*3+"%",background:"var(--primary)"}} /></div></div>)}</div></div>
      </div>
      <div className="dash-2col b">
        <div className="dash-card"><div className="dc-head"><h3>Gender</h3></div><div className="donut-row"><Donut data={d.gender} size={130} /><div className="legend">{d.gender.map((g,i)=><div className="leg" key={i}><span className="leg-dot" style={{background:RAMP[i]}} /> {g[0]} <strong>{g[1]}%</strong></div>)}</div></div></div>
        <div className="dash-card"><div className="dc-head"><h3>Device</h3></div><div className="donut-row"><Donut data={d.device} size={130} /><div className="legend">{d.device.map((g,i)=><div className="leg" key={i}><span className="leg-dot" style={{background:RAMP[i]}} /> {g[0]} <strong>{g[1]}%</strong></div>)}</div></div></div>
      </div>
    </>
  );
}

/* ---- PROJECTIONS ---- */
function Projections(){
  const p=A.projections,W=660,H=240,pad=34,n=p.quarters.length;
  const all=[...p.base,...p.bull,...p.bear],max=Math.max(...all)*1.1;
  const xy=(arr)=>arr.map((v,i)=>[pad+(W-pad*2)*(i/(n-1)),H-pad-(v/max)*(H-pad*2)]);
  const path=(arr)=>xy(arr).map((q,i)=>(i?"L":"M")+q[0].toFixed(1)+" "+q[1].toFixed(1)).join(" ");
  return (
    <>
      <div className="kpi-row three">
        {kpiCard("Base case FY27",money(p.base.reduce((a,b)=>a+b,0)*1e6),"revenue forecast","sparkle",false,true)}
        {kpiCard("Bull case",money(p.bull.reduce((a,b)=>a+b,0)*1e6),"aggressive growth","trophy",true,true)}
        {kpiCard("Bear case",money(p.bear.reduce((a,b)=>a+b,0)*1e6),"conservative","shield",false,false)}
      </div>
      <div className="dash-card" style={{marginTop:18}}><div className="dc-head"><h3>Revenue projection — scenarios</h3><span className="dc-sub">$M / quarter</span></div>
        <div className="chart-wrap"><svg viewBox={`0 0 ${W} ${H}`} className="chart" preserveAspectRatio="none">
          {[.25,.5,.75,1].map(g=><line key={g} x1={pad} x2={W-pad} y1={H-pad-g*(H-pad*2)} y2={H-pad-g*(H-pad*2)} className="grid-l" />)}
          <path d={path(p.bull)} fill="none" stroke="#c6a86a" strokeWidth="2.5" />
          <path d={path(p.base)} fill="none" stroke="#4f63b5" strokeWidth="2.5" />
          <path d={path(p.bear)} fill="none" stroke="#b9756a" strokeWidth="2" strokeDasharray="5 4" />
          {xy(p.base).map((q,i)=><circle key={i} cx={q[0]} cy={q[1]} r="3" fill="var(--primary)" />)}
        </svg><div className="chart-x">{p.quarters.map((q,i)=><span key={i}>{q}</span>)}</div>
        <div className="chart-legend"><span className="lg-line" style={{"--c":"#c6a86a"}}>Bull</span><span className="lg-line" style={{"--c":"#4f63b5"}}>Base</span><span className="lg-line" style={{"--c":"#b9756a"}}>Bear</span></div></div>
      </div>
    </>
  );
}

/* ---- RISK / LEGAL / LIABILITIES ---- */
function Risk(){
  const sevC={High:"#b9756a",Medium:"#c6a86a",Low:"#5fae86"};
  const totalLiab=A.liabilities.reduce((a,l)=>a+l.v,0);
  const totalExp=A.legal.reduce((a,l)=>a+l.exposure,0);
  return (
    <>
      <div className="kpi-row three">
        {kpiCard("Open risks",A.risks.filter(r=>r.status!=="Resolved").length,A.risks.length+" tracked","shield",false,false)}
        {kpiCard("Legal exposure",money(totalExp),A.legal.length+" active matters","flag",true,false)}
        {kpiCard("Total liabilities",money(totalLiab),"on balance sheet","wallet",false,false)}
      </div>
      <div className="dash-card" style={{marginTop:18}}><div className="dc-head"><h3>Risk register</h3></div>
        <div className="tbl-wrap"><table className="dl-table"><thead><tr><th>ID</th><th>Risk</th><th>Category</th><th>Severity</th><th>Likelihood</th><th>Owner</th><th>Status</th></tr></thead><tbody>
          {A.risks.map((r,i)=><tr key={i}><td className="mono">{r.id}</td><td>{r.title}</td><td className="muted">{r.cat}</td><td><span className="sev" style={{background:sevC[r.sev]+"22",color:sevC[r.sev]}}>{r.sev}</span></td><td className="muted">{r.like}</td><td className="muted">{r.owner}</td><td><span className="po-status completed">{r.status}</span></td></tr>)}
        </tbody></table></div></div>
      <div className="dash-2col" style={{marginTop:18}}>
        <div className="dash-card"><div className="dc-head"><h3>Incidents &amp; setbacks</h3></div>
          <div className="inc-list">{A.incidents.map((c,i)=><div className="inc-row" key={i}><span className={`inc-sev ${c.sev.toLowerCase()}`}>{c.sev}</span><div className="inc-info"><span className="inc-t">{c.t}</span><span className="inc-d">{c.d} · {c.impact}</span></div><span className="po-status completed">{c.status}</span></div>)}</div></div>
        <div className="dash-card"><div className="dc-head"><h3>Legal matters</h3></div>
          <div className="legal-list">{A.legal.map((l,i)=><div className="legal-row" key={i} style={{borderLeftColor:l.color}}><div><div className="legal-c">{l.case}</div><div className="legal-m">{l.type} · {l.juris}</div></div><div className="legal-r"><span className="tnum">{l.exposure?money(l.exposure):"—"}</span><span className="legal-s">{l.status}</span></div></div>)}</div></div>
      </div>
      <div className="dash-card" style={{marginTop:18}}><div className="dc-head"><h3>Liabilities breakdown</h3></div>
        <div className="bars two">{A.liabilities.map((l,i)=><div className="bar-row" key={i}><div className="bar-top"><span>{l.l}</span><strong className="tnum">{money(l.v)}</strong></div><div className="bar-track"><span style={{width:(l.v/totalLiab*100)+"%",background:RAMP[i%6]}} /></div></div>)}</div></div>
    </>
  );
}

/* ---- ACCOUNTING & TAXES ---- */
function Accounting(){
  const taxOwed=A.taxes.reduce((a,t)=>a+t.owed,0);
  return (
    <>
      <div className="dash-2col wide">
        <div className="dash-card"><div className="dc-head"><h3>Profit &amp; Loss statement</h3><span className="dc-sub">FY2026 · audited basis</span></div>
          <div className="pnl">{A.pnl.map((p,i)=><div className={`pnl-row ${p.kind}`} key={i}><span>{p.line}</span><strong className="tnum">{money(p.val)}</strong></div>)}</div></div>
        <div className="dash-card"><div className="dc-head"><h3>Tax provision</h3></div>
          <div className="tax-total"><span>Total tax owed</span><strong className="tnum gold">{money(taxOwed)}</strong></div>
          <div className="tax-list">{A.taxes.map((t,i)=><div className="tax-row" key={i}><div><div className="tax-j">{t.juris}</div><div className="tax-t">{t.type} · {t.rate}</div></div><div className="tax-r"><span className="tnum">{money(t.owed)}</span><span className="po-status pending">{t.status}</span></div></div>)}</div></div>
      </div>
      <div className="dash-2col b">
        {[["Assets","cash & receivables"],["Liabilities","payables & debt"],["Equity","retained + paid-in"]].map((b,i)=>{
          const vals=[A.kpis.cashOnHand+2_640_000, A.liabilities.reduce((a,l)=>a+l.v,0), 0];
          vals[2]=vals[0]-vals[1];
          return <div className="dash-card" key={i}><div className="dc-head"><h3>{b[0]}</h3></div><div className="bs-v tnum">{money(vals[i])}</div><div className="dc-sub">{b[1]}</div></div>;
        })}
      </div>
    </>
  );
}

/* ---- CAP TABLE & CORP STRUCTURE ---- */
function CapTable(){
  const totalShares=A.capTable.reduce((a,c)=>a+c.shares,0);
  return (
    <>
      <div className="dash-2col wide">
        <div className="dash-card"><div className="dc-head"><h3>Capitalization table</h3><span className="dc-sub">{(totalShares/1e6).toFixed(1)}M shares · fully diluted</span></div>
          <div className="donut-row"><Donut data={A.capTable.map(c=>[c.holder,c.pct,c.color])} size={160} />
            <div className="tbl-wrap" style={{flex:1}}><table className="dl-table"><thead><tr><th>Holder</th><th>Class</th><th className="num">Shares</th><th className="num">%</th></tr></thead><tbody>
              {A.capTable.map((c,i)=><tr key={i}><td><span className="leg-dot" style={{background:c.color,marginRight:8}} />{c.holder}</td><td className="muted">{c.class}</td><td className="num tnum">{(c.shares/1e6).toFixed(2)}M</td><td className="num tnum">{c.pct}%</td></tr>)}
            </tbody></table></div></div></div>
        <div className="dash-card"><div className="dc-head"><h3>Ownership</h3></div>
          <div className="bars">{A.capTable.map((c,i)=><div className="bar-row" key={i}><div className="bar-top"><span>{c.holder}</span><strong>{c.pct}%</strong></div><div className="bar-track"><span style={{width:c.pct+"%",background:c.color}} /></div></div>)}</div></div>
      </div>
      <div className="dash-card" style={{marginTop:18}}><div className="dc-head"><h3>Corporate structure</h3></div>
        <div className="corp">
          <div className="corp-parent"><div className="corp-box parent"><div className="corp-n">{A.corp.parent.name}</div><div className="corp-j">{A.corp.parent.juris}</div></div></div>
          <div className="corp-stem" />
          <div className="corp-subs">{A.corp.subs.map((s,i)=><div className="corp-box" key={i}><div className="corp-n">{s.name}</div><div className="corp-j">{s.juris}</div><div className="corp-note">{s.note}</div></div>)}</div>
        </div>
      </div>
    </>
  );
}

/* ---- BOARD MEMBER PROFILE MODAL ---- */
function BoardModal({ m, onClose }){
  return (
    <div className="bmodal-ov" onClick={onClose}>
      <div className="bmodal" onClick={e=>e.stopPropagation()}>
        <button className="bmodal-x" onClick={onClose}><Icon name="close" size={18} /></button>
        <div className="bmodal-head">
          <span className="bmodal-ava">{m.i}</span>
          <div><div className="bmodal-n">{m.n}</div><div className="bmodal-r">{m.r}</div><div className="bmodal-meta">Since {m.since} · {m.loc}</div></div>
        </div>
        <p className="bmodal-bio">{m.bio}</p>
        <div className="bmodal-focus">{(m.focus||[]).map((f,i)=><span key={i} className="bmodal-tag">{f}</span>)}</div>
        <div className="bmodal-actions"><button className="dash-btn-gold"><Icon name="user" size={15} /> Full profile</button><button className="bmodal-ghost" onClick={onClose}>Close</button></div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<Admin />);
