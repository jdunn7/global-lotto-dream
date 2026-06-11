// portal.jsx — PLG Affiliate Member Portal: shell, icons, Dashboard, Genealogy
const { useState, useEffect, useRef, useMemo } = React;

function PIcon({ name, size = 22, sw = 1.8 }) {
  const P = {
    home: "M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5",
    network: "M12 3v5M5 21v-4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M12 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM5 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM19 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    wallet: "M3 7a2 2 0 0 1 2-2h13a1 1 0 0 1 1 1v1M3 7v10a2 2 0 0 0 2 2h14a1 1 0 0 0 1-1v-4M3 7h17a1 1 0 0 1 1 1v3M17 12h.01",
    payout: "M21 12a9 9 0 1 1-9-9M16 8l5-4M21 4v4h-4M12 8v8M9 13l3 3 3-3",
    tools: "M14 7a4 4 0 0 0-5.4 5.4l-5.3 5.3a1.5 1.5 0 0 0 2.1 2.1l5.3-5.3A4 4 0 0 0 17 14M14 7l3-3 2 2-3 3M14 7l3 3",
    mail: "M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 8l9 6 9-6",
    support: "M18 9a6 6 0 1 0-12 0M4 13a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2zM16 13a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h0a2 2 0 0 1-2-2zM18 18v1a3 3 0 0 1-3 3h-3",
    bell: "M18 9a6 6 0 1 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M13.7 21a2 2 0 0 1-3.4 0",
    home2: "M3 11.5 12 4l9 7.5M5 10.5V20h14v-9.5",
    chev: "M9 6l6 6-6 6",
    plus: "M12 5v14M5 12h14", minus: "M5 12h14",
    refresh: "M21 12a9 9 0 1 1-3-6.7M21 4v4h-4",
    expand: "M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5",
    search: "M21 21l-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z",
    copy: "M9 9h10a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10a1 1 0 0 1 1-1zM5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1",
    download: "M12 3v12M8 11l4 4 4-4M4 21h16",
    check: "M4 12.5l5 5 11-11",
    upload: "M12 16V4M8 8l4-4 4 4M4 20h16",
    gift: "M20 12v8a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-8M2 8h20v4H2zM12 8v13M12 8S10.5 4 8 4a2 2 0 0 0 0 4M12 8s1.5-4 4-4a2 2 0 0 1 0 4",
    trophy: "M7 4h10v4a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3M9 14h6v3H9zM8 21h8M12 17v4",
    users: "M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 20v-1a4 4 0 0 0-3-3.9M16 3.1A4 4 0 0 1 16 11",
    arrow: "M5 12h14M13 5l7 7-7 7",
    close: "M6 6l12 12M18 6L6 18", edit: "M4 20h4L18 10l-4-4L4 16zM14 6l4 4",
    chart: "M4 20V10M10 20V4M16 20v-7M22 20H2",
    sad: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 9h.01M16 9h.01M8.5 16a4 4 0 0 1 7 0",
    flag: "M4 21V4M4 4h13l-2 4 2 4H4",
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"><path d={P[name] || P.home} /></svg>;
}

// decorative QR
function seeded(s){let h=0;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))>>>0;return()=>(h=(h*1103515245+12345)&0x7fffffff)/0x7fffffff;}
function QR({ data, size = 160, logo }) {
  const n = 25, rnd = seeded(data || "PLG"), cells = [];
  for (let y=0;y<n;y++) for (let x=0;x<n;x++){
    const f=(x<7&&y<7)||(x>=n-7&&y<7)||(x<7&&y>=n-7);
    const lx=x>=n-7?x-(n-7):x, ly=y>=n-7?y-(n-7):y;
    const on=f?(lx===0||lx===6||ly===0||ly===6||(lx>=2&&lx<=4&&ly>=2&&ly<=4)):rnd()>0.52;
    if(on)cells.push(<rect key={x+'-'+y} x={x} y={y} width="1" height="1" rx="0.2" />);
  }
  return (
    <div className="qr-img" style={{ width: size, height: size, position: "relative" }}>
      <svg viewBox={`0 0 ${n} ${n}`} width="100%" height="100%" shapeRendering="crispEdges"><g fill="#1b2a6b">{cells}</g></svg>
      {logo && <img src="plg-logo-full.png" alt="" style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width: size*0.26, background:"#fff", padding:3, borderRadius:6 }} />}
    </div>
  );
}

const NAV = [
  { id:"dashboard", label:"Dashboard", icon:"home" },
  { id:"network", label:"Networks", icon:"network", sub:[["genealogy","Genealogy Tree"],["downline","Downline Members"]] },
  { id:"wallet", label:"E-Wallet", icon:"wallet" },
  { id:"payout", label:"Payout", icon:"payout" },
  { id:"tools", label:"Tools", icon:"tools", sub:[["replica","Replica Site"],["materials","Download Materials"],["news","News"],["faqs","FAQs"]] },
  { id:"mailbox", label:"Mail Box", icon:"mail" },
  { id:"support", label:"Support Centre", icon:"support" },
];

const USER = { name:"Joshua Dunn", user:"JOSHUADUNN", sponsor:"TODDPOINDEXTER", email:"joshuadanieldunn@gmail.com", initials:"JD" };

function Portal() {
  const { EWallet, Payout, Profile, Replica, ToolsPage, Mailbox, Support } = window;
  const [route, setRoute] = useState("dashboard");
  const [open, setOpen] = useState({ network:false, tools:false });
  const [sideOpen, setSideOpen] = useState(false);
  const cur = NAV.find(n => n.id===route) || NAV.find(n=>n.sub&&n.sub.some(s=>s[0]===route)) || NAV[0];
  const subLabel = (()=>{ for(const n of NAV) if(n.sub) for(const s of n.sub) if(s[0]===route) return s[1]; return null; })();
  function go(id){ setRoute(id); setSideOpen(false); window.scrollTo(0,0); }

  return (
    <div className="pg">
      <div className="shell">
        <aside className={`side ${sideOpen?"open":""}`}>
          <div className="side-logo"><img src="plg-logo-full.png" alt="PLG Lotto" /></div>
          {NAV.map(n => (
            <React.Fragment key={n.id}>
              <button className={`nav-i ${route===n.id?"on":""} ${n.sub&&open[n.id]?"open":""}`}
                onClick={()=> n.sub ? setOpen(o=>({...o,[n.id]:!o[n.id]})) : go(n.id)}>
                <span className="ic"><PIcon name={n.icon} /></span> {n.label}
                {n.sub && <span className="chev"><PIcon name="chev" size={16} /></span>}
              </button>
              {n.sub && open[n.id] && (
                <div className="nav-sub">
                  {n.sub.map(s => <button key={s[0]} className={route===s[0]?"on":""} onClick={()=>go(s[0])}>{s[1]}</button>)}
                </div>
              )}
            </React.Fragment>
          ))}
          <div className="side-foot">PLG Affiliates · Member Portal</div>
        </aside>

        <main className="main">
          <header className="topbar">
            <button className="icon-btn menu-toggle" onClick={()=>setSideOpen(o=>!o)}><PIcon name="chart" size={18} /></button>
            <div className="crumb">
              <span className="home"><PIcon name="home2" size={16} /></span>
              <span className="sep"><PIcon name="chev" size={14} /></span>
              {subLabel ? <><span>{cur.label}</span><span className="sep"><PIcon name="chev" size={14} /></span><span className="cur">{subLabel}</span></> : <span className="cur">{cur.label}</span>}
            </div>
            <div className="top-r">
              <button className="icon-btn"><PIcon name="mail" size={19} /></button>
              <button className="icon-btn"><PIcon name="bell" size={19} /><span className="badge">3</span></button>
              <div className="avatar">{USER.initials}</div>
            </div>
          </header>
          <div className="body">
            {route==="dashboard" && <Dashboard go={go} />}
            {route==="genealogy" && <Genealogy />}
            {route==="downline" && <Downline />}
            {route==="wallet" && <EWallet />}
            {route==="payout" && <Payout />}
            {route==="replica" && <Replica />}
            {(route==="materials"||route==="news"||route==="faqs") && <ToolsPage route={route} />}
            {route==="mailbox" && <Mailbox />}
            {route==="support" && <Support />}
            {route==="profile" && <Profile />}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ============ DASHBOARD (live · movable · resizable) ============ */
const DASH_LS = "plg_dash_layout_v2";
const COLS = 12, ROWH = 60, GAP = 14;
const DASH_DEFAULT = {
  wallet:{x:0,y:0,w:3,h:2}, comm:{x:3,y:0,w:3,h:2}, credit:{x:6,y:0,w:3,h:2}, debit:{x:9,y:0,w:3,h:2},
  join:{x:0,y:2,w:8,h:6}, news:{x:8,y:2,w:4,h:6},
  rail:{x:0,y:8,w:12,h:5},
  team:{x:0,y:13,w:6,h:4}, earn:{x:6,y:13,w:6,h:4},
};

function useLiveStats() {
  const [s, setS] = useState({ wallet:0, comm:0, credit:0, debit:0, pv:0, gpv:0, members:0, hist:Array(24).fill(0) });
  useEffect(() => {
    const iv = setInterval(() => {
      setS(p => {
        const comm = +(p.comm + Math.random()*6).toFixed(2);
        const hist = [...p.hist.slice(1), comm];
        return {
          wallet:+(p.wallet + Math.random()*9).toFixed(2),
          comm, credit:+(p.credit + Math.random()*14).toFixed(2),
          debit:+(p.debit + Math.random()*5).toFixed(2),
          pv: p.pv + (Math.random()<0.35?1:0),
          gpv: p.gpv + (Math.random()<0.7?Math.ceil(Math.random()*3):0),
          members: p.members + (Math.random()<0.18?1:0),
          hist,
        };
      });
    }, 2000);
    return () => clearInterval(iv);
  }, []);
  return s;
}

function LiveChart({ hist }) {
  const W=620, H=210, pad=24;
  const max = Math.max(1, ...hist);
  const n = hist.length;
  const pts = hist.map((v,i)=>[pad+(W-pad*2)*(i/(n-1)), H-pad-(v/max)*(H-pad*2)]);
  const line = pts.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" ");
  const area = line+` L ${W-pad} ${H-pad} L ${pad} ${H-pad} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="chart" preserveAspectRatio="none" style={{height:"100%"}}>
      <defs><linearGradient id="lcg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="rgba(59,91,219,0.28)"/><stop offset="100%" stopColor="rgba(59,91,219,0)"/></linearGradient></defs>
      {[0,0.5,1].map(g=><line key={g} x1={pad} x2={W-pad} y1={H-pad-g*(H-pad*2)} y2={H-pad-g*(H-pad*2)} className="grid-l" />)}
      <path d={area} fill="url(#lcg)" />
      <path d={line} fill="none" stroke="var(--royal)" strokeWidth="2.5" />
      {pts.length && <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="4" fill="var(--royal)" />}
    </svg>
  );
}

function MoBoard({ widgets, edit }) {
  const ref = useRef(null);
  const [bw, setBw] = useState(1100);
  const [layout, setLayout] = useState(() => { try { return {...DASH_DEFAULT, ...JSON.parse(localStorage.getItem(DASH_LS)||"{}")}; } catch(e){ return DASH_DEFAULT; } });
  const drag = useRef(null);
  useEffect(() => { const m=()=>{ if(ref.current) setBw(ref.current.clientWidth); }; m(); window.addEventListener("resize",m); return ()=>window.removeEventListener("resize",m); }, []);
  const colW = bw / COLS;
  function save(l){ setLayout(l); try{ localStorage.setItem(DASH_LS, JSON.stringify(l)); }catch(e){} }
  useEffect(() => {
    function mv(e){
      const d = drag.current; if(!d) return;
      const dx=e.clientX-d.sx, dy=e.clientY-d.sy;
      setLayout(l=>{
        const cur=l[d.id]; let n;
        if(d.mode==="move"){ let nx=Math.max(0,Math.min(COLS-cur.w,Math.round((d.ox*colW+dx)/colW))); let ny=Math.max(0,Math.round((d.oy*ROWH+dy)/ROWH)); n={...cur,x:nx,y:ny}; }
        else { let nw=Math.max(2,Math.min(COLS-cur.x,Math.round((d.ow*colW+dx)/colW))); let nh=Math.max(2,Math.round((d.oh*ROWH+dy)/ROWH)); n={...cur,w:nw,h:nh}; }
        d.result={...l,[d.id]:n}; return d.result;
      });
    }
    function up(){ if(drag.current){ if(drag.current.result) save(drag.current.result); drag.current=null; document.body.style.userSelect=""; } }
    window.addEventListener("pointermove",mv); window.addEventListener("pointerup",up);
    return ()=>{ window.removeEventListener("pointermove",mv); window.removeEventListener("pointerup",up); };
  }, [colW]);
  function start(e,id,mode){ if(!edit) return; e.preventDefault(); e.stopPropagation(); const p=layout[id]; drag.current={id,mode,sx:e.clientX,sy:e.clientY,ox:p.x,oy:p.y,ow:p.w,oh:p.h}; document.body.style.userSelect="none"; }
  const maxRow = Math.max(8, ...Object.values(layout).map(p=>p.y+p.h));
  return (
    <div ref={ref} className={`mo-board ${edit?"edit":""}`} style={{height:maxRow*ROWH}}>
      {widgets.map(wd=>{
        const p=layout[wd.id]||DASH_DEFAULT[wd.id];
        return (
          <div key={wd.id} className="mo-w" style={{left:p.x*colW+GAP/2, top:p.y*ROWH+GAP/2, width:p.w*colW-GAP, height:p.h*ROWH-GAP}}>
            {edit && <span className="mo-handle" onPointerDown={e=>start(e,wd.id,"move")}><PIcon name="network" size={13}/> drag</span>}
            <div className="mo-w-inner" onPointerDown={e=>edit&&start(e,wd.id,"move")} style={{cursor:edit?"move":"default"}}>{wd.render()}</div>
            {edit && <span className="mo-resize" onPointerDown={e=>start(e,wd.id,"resize")} />}
          </div>
        );
      })}
    </div>
  );
}

function Dashboard({ go }) {
  const [span, setSpan] = useState("Month");
  const [edit, setEdit] = useState(false);
  const live = useLiveStats();
  const months = ["Jul","Aug","Sep","Oct","Nov","Dec","Jan","Feb","Mar","Apr","May","Jun"];
  const money = n => "$" + n.toLocaleString("en-US",{minimumFractionDigits:2,maximumFractionDigits:2});
  function resetLayout(){ try{ localStorage.removeItem(DASH_LS); }catch(e){} window.location.reload(); }

  const statCard = (l,k,ic,val,delta) => (
    <div className="stat card" style={{height:"100%"}}>
      <div className="stat-top"><span className="stat-l">{l}</span><span className={`stat-ic ${k}`}><PIcon name={ic} size={22} /></span></div>
      <span className="stat-v tnum">{val}</span>
      <span className={`stat-delta ${delta>=0?"up":"down"}`}><PIcon name="chart" size={13} /> {delta>=0?"+":""}{delta}% this month</span>
    </div>
  );
  const widgets = [
    { id:"wallet", render:()=>statCard("E-Wallet","wallet","wallet",money(live.wallet),3) },
    { id:"comm", render:()=>statCard("Commission","comm","comm",money(live.comm),5) },
    { id:"credit", render:()=>statCard("Total Credit","credit","credit",money(live.credit),2) },
    { id:"debit", render:()=>statCard("Total Debit","debit","debit",money(live.debit),1) },
    { id:"join", render:()=>(
      <div className="panel card" style={{height:"100%",display:"flex",flexDirection:"column",overflow:"hidden"}}>
        <div className="panel-h"><h3>Joinings <span className="pill pill-green" style={{marginLeft:6}}><span style={{width:6,height:6,borderRadius:9,background:"var(--green)",display:"inline-block"}}/> Live</span></h3><div className="seg">{["Year","Month","Day"].map(x=><button key={x} className={span===x?"on":""} onClick={()=>setSpan(x)}>{x}</button>)}</div></div>
        <div style={{flex:1,minHeight:0}}><LiveChart hist={live.hist} /></div>
        <div className="chart-x">{months.map((m,i)=><span key={i}>{m}</span>)}</div>
      </div>
    )},
    { id:"news", render:()=>(
      <div className="panel card" style={{height:"100%",overflow:"auto"}}>
        <div className="panel-h"><h3>New Members</h3><span className="pill pill-royal tnum">{live.members}</span></div>
        {live.members>0
          ? <div style={{display:"flex",flexDirection:"column",gap:8}}>{Array.from({length:Math.min(live.members,6)}).map((_,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 4px"}}><span className="avatar" style={{width:34,height:34,fontSize:"0.8rem"}}>{String.fromCharCode(65+((i*7)%26))}{String.fromCharCode(66+((i*3)%25))}</span><div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:"0.86rem"}}>New referral #{live.members-i}</div><div className="sub" style={{fontSize:"0.76rem"}}>joined · just now</div></div><span className="pill pill-green">+1</span></div>))}</div>
          : <div className="empty"><PIcon name="sad" size={44} /><p>No new members yet.<br/>Share your link to grow.</p><button className="btn btn-royal btn-sm" onClick={()=>go("genealogy")}>View network</button></div>}
      </div>
    )},
    { id:"rail", render:()=><DashRail go={go} live={live} /> },
    { id:"team", render:()=>(
      <div className="panel card" style={{height:"100%",overflow:"auto"}}>
        <div className="panel-h"><h3>Team Performance</h3><div className="seg"><button className="on">Top Earners</button><button>Recruiters</button></div></div>
        {live.gpv>0
          ? <div style={{display:"flex",flexDirection:"column",gap:6}}>{[["You",live.gpv],["Direct line",Math.round(live.gpv*0.6)],["Tier 2",Math.round(live.gpv*0.35)]].map((r,i)=>(<div key={i} style={{display:"flex",alignItems:"center",gap:10}}><span className="geno-ava" style={{width:30,height:30,fontSize:"0.8rem",border:"none"}}>{i+1}</span><div style={{flex:1}}><div style={{height:8,borderRadius:9,background:"var(--surface-2)",overflow:"hidden"}}><span style={{display:"block",height:"100%",width:(100-i*28)+"%",background:"linear-gradient(90deg,var(--royal-soft),var(--royal))"}}/></div></div><strong className="tnum" style={{fontFamily:"var(--fd)"}}>{r[1]}</strong></div>))}</div>
          : <div className="empty"><PIcon name="trophy" size={44} /><p>Top earners will appear here.</p></div>}
      </div>
    )},
    { id:"earn", render:()=>(
      <div className="panel card" style={{height:"100%",overflow:"auto"}}>
        <div className="panel-h"><h3>Earnings &amp; Expenses</h3><div className="seg"><button className="on">Earnings</button><button>Expenses</button></div></div>
        <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:10}}><span className="stat-v tnum" style={{color:"var(--green)"}}>{money(live.comm+live.credit)}</span><span className="pill pill-green">+ live</span></div>
        <div style={{flex:1,minHeight:60}}><LiveChart hist={live.hist} /></div>
      </div>
    )},
  ];

  return (
    <>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <h2 style={{fontSize:"1.5rem"}}>Welcome, <span style={{color:"var(--royal)"}}>Joshua</span> 👋</h2>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          {edit && <button className="btn btn-ghost btn-sm" onClick={resetLayout}><PIcon name="refresh" size={15} /> Reset</button>}
          <button className={`btn btn-sm ${edit?"btn-royal":"btn-ghost"}`} onClick={()=>setEdit(e=>!e)}><PIcon name={edit?"check":"expand"} size={15} /> {edit?"Done":"Customize"}</button>
          <button className="btn btn-gold btn-sm" onClick={()=>go("payout")}><PIcon name="payout" size={16} /> Request Payout</button>
        </div>
      </div>
      {edit && <div className="mo-hint"><PIcon name="expand" size={14} /> Drag widgets to move · pull the bottom-right corner to resize · your layout is saved automatically.</div>}
      <MoBoard widgets={widgets} edit={edit} />
    </>
  );
}

function DashRail({ go, live }) {
  const pv = live ? live.pv : 0, gpv = live ? live.gpv : 0;
  return (
    <div className="dash-rail" style={{display:"grid",gridTemplateColumns:"1.3fr 1fr",gap:16,height:"100%"}}>
      <div className="id-card">
        <div className="id-top">
          <div className="avatar">{USER.initials}</div>
          <div><div className="id-name">{USER.name}</div><div className="id-user">{USER.user}</div></div>
          <span className="pill pill-gold" style={{marginLeft:"auto",background:"rgba(255,255,255,0.16)",color:"#fff"}}>● Active</span>
        </div>
        <div className="id-pv">
          <div><div className="id-pv-l">Personal PV</div><div className="id-pv-v tnum">{pv}</div></div>
          <div className="div" />
          <div><div className="id-pv-l">Group PV</div><div className="id-pv-v tnum">{gpv}</div></div>
        </div>
        <div className="id-sponsor"><div className="id-sponsor-l">Sponsor</div><div className="id-sponsor-v">{USER.sponsor}</div></div>
      </div>
      <div className="card qr-block">
        <h4>Your Own QR Code</h4>
        <QR data={"plgaffiliates.com/replica/"+USER.user} size={150} logo />
        <div className="ref-link">
          <div className="ref-link-box"><div className="ref-link-l">Your referral link</div><div className="ref-link-u">member.plgaffiliates.com/replica/joshuadunn/77367…</div></div>
          <button className="btn btn-royal btn-sm" style={{flex:"none"}}><PIcon name="copy" size={15} /></button>
        </div>
        <button className="btn btn-ghost btn-sm" style={{width:"100%",marginTop:10}}><PIcon name="download" size={15} /> Download QR Code</button>
      </div>
    </div>
  );
}

function JoinChart({ months }) {
  const data = months.map(()=>0);
  const W=620,H=190,pad=26,bw=(W-pad*2)/months.length;
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="chart" preserveAspectRatio="none">
        {[0,0.5,1].map(g=><line key={g} x1={pad} x2={W-pad} y1={H-pad-g*(H-pad*2)} y2={H-pad-g*(H-pad*2)} className="grid-l" />)}
        {months.map((m,i)=>{const x=pad+bw*i+bw/2;return <g key={i}><line x1={x} y1={pad} x2={x} y2={H-pad} stroke="var(--line-soft)" strokeWidth="1" /><circle cx={x} cy={H-pad} r="3.5" fill="var(--royal)" /></g>;})}
        <text x={pad-6} y={pad+4} fontSize="10" fill="var(--dim)" textAnchor="end">1</text>
        <text x={pad-6} y={H-pad+3} fontSize="10" fill="var(--dim)" textAnchor="end">0</text>
      </svg>
      <div className="chart-x" style={{paddingLeft:20,paddingRight:20}}>{months.map((m,i)=><span key={i}>{m} 26</span>)}</div>
    </div>
  );
}

/* ============ GENEALOGY ============ */
function Genealogy() {
  const [tab,setTab] = useState("tree");
  return (
    <>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <div className="tabs">
          {[["tree","Genealogy Tree"],["list","Tree View"],["down","Downline Members"]].map(t=><button key={t[0]} className={tab===t[0]?"on":""} onClick={()=>setTab(t[0])}>{t[1]}</button>)}
        </div>
        <div className="field" style={{minWidth:240}}>
          <div style={{position:"relative"}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"var(--dim)"}}><PIcon name="search" size={16} /></span>
            <input placeholder="Search member…" style={{width:"100%",paddingLeft:36}} />
          </div>
        </div>
      </div>
      <div className="geno-canvas">
        <div className="geno-zoom">
          <button><PIcon name="plus" size={18} /></button>
          <button><PIcon name="minus" size={18} /></button>
          <button><PIcon name="refresh" size={18} /></button>
          <button><PIcon name="expand" size={18} /></button>
        </div>
        <div className="geno-tree">
          <div className="geno-node">
            <div className="geno-ava">{USER.initials}</div>
            <div className="geno-name">{USER.user}</div>
            <div className="geno-meta">Children: <strong>0</strong></div>
          </div>
          <div className="geno-line" />
          <div className="geno-add"><PIcon name="close" size={22} /></div>
        </div>
      </div>
      <div className="card panel" style={{marginTop:16,display:"flex",gap:24,flexWrap:"wrap"}}>
        {[["Total network","0","users"],["Direct referrals","0","users"],["Active this month","0","trophy"],["Group volume","$0","chart"]].map((s,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:12}}>
            <span className="stat-ic comm" style={{width:42,height:42}}><PIcon name={s[2]} size={20} /></span>
            <div><div className="stat-v" style={{fontSize:"1.4rem"}}>{s[1]}</div><div className="sub">{s[0]}</div></div>
          </div>
        ))}
      </div>
    </>
  );
}

function Downline(){
  return (
    <>
      <div className="sec-title"><h2>Downline Members</h2></div>
      <div className="card"><div className="empty" style={{padding:60}}><PIcon name="users" size={48} /><p>No downline members yet. Invite your first referral to start building your network.</p></div></div>
    </>
  );
}

window.Portal = Portal; window.PIcon = PIcon; window.QR = QR; window.USER = USER;
ReactDOM.createRoot(document.getElementById("root")).render(<Portal />);
