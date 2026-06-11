// portal-b.jsx — Portal screens: E-Wallet, Payout, Profile, Replica, Tools, Mailbox, Support
const { useState: useStateB } = React;

/* ============ E-WALLET ============ */
function EWallet() {
  const txns = [];
  return (
    <>
      <div className="grid-2 wide">
        <div className="id-card" style={{borderRadius:"var(--radius-xl)"}}>
          <div style={{position:"relative"}}>
            <div className="id-pv-l" style={{opacity:0.85}}>E-Wallet Balance</div>
            <div style={{fontFamily:"var(--fd)",fontWeight:800,fontSize:"2.8rem",lineHeight:1.1,margin:"4px 0 14px"}}>$0.00</div>
            <div style={{display:"flex",gap:10}}>
              <button className="btn btn-gold btn-sm"><PIcon name="plus" size={15} /> Top up</button>
              <button className="btn btn-ghost btn-sm" style={{background:"rgba(255,255,255,0.14)",border:"none",color:"#fff"}}><PIcon name="payout" size={15} /> Withdraw</button>
            </div>
          </div>
        </div>
        <div className="card panel">
          <div className="panel-h"><h3>Balance breakdown</h3></div>
          {[["Commission","comm","$0.00"],["Royalty income","trophy","$0.00"],["Bonus credit","gift","$0.00"]].map((b,i)=>(
            <div key={i} className="payout-stat" style={{marginBottom:10}}>
              <span className="l" style={{display:"flex",alignItems:"center",gap:10}}><span className="stat-ic comm" style={{width:34,height:34}}><PIcon name={b[1]} size={17} /></span>{b[0]}</span>
              <span className="v app tnum">{b[2]}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="card" style={{marginTop:16}}>
        <div className="panel-h" style={{padding:"18px 20px",borderBottom:"1px solid var(--line)"}}><h3>Transaction history</h3><span className="pill pill-royal">All</span></div>
        <div className="empty" style={{padding:60}}><PIcon name="wallet" size={48} /><p>No transactions yet. Your wallet activity will appear here.</p></div>
      </div>
    </>
  );
}

/* ============ PAYOUT ============ */
function Payout() {
  const [open,setOpen] = useStateB(false);
  const cards = [["Requested","$0","req"],["Approved","$0","app"],["Paid","$0","paid"],["Rejected","$0","rej"]];
  return (
    <>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:18,flexWrap:"wrap",gap:12}}>
        <h2 style={{fontSize:"1.5rem"}}>Payout</h2>
        <button className="btn btn-gold" onClick={()=>setOpen(true)}><PIcon name="payout" size={17} /> Request Payout</button>
      </div>
      <div className="stat-row">
        {cards.map((c,i)=>(
          <div className="stat card" key={i}>
            <div className="stat-top"><span className="stat-l">{c[0]}</span><span className={`stat-ic ${c[2]==='req'?'comm':c[2]==='app'?'wallet':c[2]==='paid'?'debit':'credit'}`}><PIcon name={c[2]==='paid'?'check':c[2]==='rej'?'close':'payout'} size={20} /></span></div>
            <span className="stat-v">{c[1]}</span>
            <span className="stat-delta down"><PIcon name="chart" size={13} /> -0% Last month</span>
          </div>
        ))}
      </div>
      <div className="card filters" style={{marginTop:16}}>
        <div className="field"><label>Status</label><select><option>All items are selected</option><option>Pending</option><option>Approved</option><option>Paid</option></select></div>
        <div style={{display:"flex",gap:10}}><button className="btn btn-royal btn-sm">Search</button><button className="btn btn-ghost btn-sm">Reset</button></div>
      </div>
      <div className="card" style={{marginTop:16}}>
        <div className="tbl-wrap"><table className="tbl"><thead><tr><th>Date</th><th>Amount</th><th>Payout Method</th><th>Status</th><th className="num">Action</th></tr></thead></table></div>
        <div className="empty" style={{padding:60}}><PIcon name="search" size={46} /><p>Sorry, no data found.</p></div>
      </div>
      {open && <PayoutModal onClose={()=>setOpen(false)} />}
    </>
  );
}

function PayoutModal({ onClose }) {
  const [amt,setAmt] = useStateB("");
  const rows = [["Default Currency","($)"],["E-Wallet Balance","$0"],["Already In Payout Process","$0"],["Total Paid Amount","$0"],["Payout Method","Bank Transfer"],["Minimum Withdrawal","$10.00"],["Maximum Withdrawal","$500.00"],["Available Maximum","$0"],["Payout Fee","0.0700 %"],["Payout Fee Mode","Percentage"]];
  return (
    <div style={{position:"fixed",inset:0,zIndex:200,background:"rgba(20,29,82,0.4)",backdropFilter:"blur(5px)",display:"flex",justifyContent:"flex-end"}} onClick={onClose}>
      <div style={{width:"min(480px,94vw)",height:"100%",background:"var(--surface)",overflowY:"auto",boxShadow:"var(--shadow-lg)",animation:"slideL 0.3s var(--ease)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"22px 24px",borderBottom:"1px solid var(--line)",position:"sticky",top:0,background:"var(--surface)",zIndex:2}}>
          <h2 style={{fontSize:"1.4rem"}}>Payout Request</h2>
          <button className="icon-btn" onClick={onClose}><PIcon name="close" size={18} /></button>
        </div>
        <div style={{padding:24}}>
          <div style={{background:"rgba(241,183,58,0.12)",border:"1px solid rgba(241,183,58,0.35)",borderRadius:14,padding:16,marginBottom:20}}>
            <p style={{fontSize:"0.88rem",color:"var(--muted)",marginBottom:10}}>Add your bank or crypto details before requesting withdrawals.</p>
            <button className="btn btn-gold btn-sm"><PIcon name="wallet" size={15} /> Update payout details <PIcon name="arrow" size={14} /></button>
          </div>
          <div className="field" style={{marginBottom:16}}><label>Withdrawal Amount *</label>
            <div style={{display:"flex",alignItems:"center",background:"var(--surface-2)",border:"1px solid var(--line)",borderRadius:11,paddingLeft:14}}>
              <span style={{color:"var(--muted)",fontWeight:700}}>$</span>
              <input value={amt} onChange={e=>setAmt(e.target.value.replace(/[^0-9.]/g,''))} placeholder="Amount" style={{border:"none",background:"none",flex:1}} />
            </div>
          </div>
          <div className="field" style={{marginBottom:16}}><label>Transaction Password *</label><input type="password" placeholder="••••••••" /></div>
          <button className="btn btn-royal" style={{width:"100%"}}>Submit</button>
          <p style={{fontSize:"0.8rem",color:"var(--muted)",margin:"12px 0 18px"}}>An additional <strong style={{color:"var(--royal)"}}>0.0700%</strong> will be debited as payout fee.</p>
          <div className="card" style={{overflow:"hidden"}}>
            <div style={{padding:"14px 16px",borderBottom:"1px solid var(--line)",fontWeight:700,fontFamily:"var(--fd)"}}>Particulars</div>
            {rows.map((r,i)=>(<div key={i} style={{display:"flex",justifyContent:"space-between",padding:"11px 16px",borderBottom:i<rows.length-1?"1px solid var(--line-soft)":"none",fontSize:"0.86rem"}}><span style={{color:"var(--muted)"}}>{r[0]}</span><strong>{r[1]}</strong></div>))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ PROFILE ============ */
function Profile() {
  const [tab,setTab] = useStateB("bank");
  const tabs = [["personal","Personal Details"],["contact","Contact Details"],["bank","Bank Details"],["payment","Payment Details"]];
  const bankFields = [["Bank Name",""],["Branch Name",""],["Account Holder","NA"],["Account Number",""],["IFSC Code",""],["PAN Number",""]];
  return (
    <>
      <div className="card" style={{padding:24,marginBottom:18}}>
        <div style={{display:"grid",gridTemplateColumns:"auto 1px 1fr",gap:24,alignItems:"center"}}>
          <div style={{textAlign:"center"}}>
            <div className="avatar" style={{width:96,height:96,margin:"0 auto",fontSize:"2rem"}}>{USER.initials}</div>
            <h3 style={{marginTop:12}}>{USER.name}</h3>
            <div className="sub">{USER.user.toLowerCase()}</div>
          </div>
          <div style={{background:"var(--line)",height:"100%"}} />
          <div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:18,marginBottom:18}}>
              <div><div className="sub" style={{fontSize:"0.78rem"}}>Email</div><div style={{fontWeight:600}}>{USER.email}</div></div>
              <div><div className="sub" style={{fontSize:"0.78rem"}}>Sponsor</div><div style={{fontWeight:700}}>{USER.sponsor}</div></div>
              <div><div className="sub" style={{fontSize:"0.78rem"}}>Placement</div><div style={{fontWeight:700}}>{USER.sponsor}</div></div>
            </div>
            <div style={{display:"flex",gap:24,padding:16,borderRadius:14,background:"var(--surface-2)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}><span className="stat-ic wallet" style={{width:38,height:38}}><PIcon name="users" size={18} /></span><div><div className="sub" style={{fontSize:"0.76rem"}}>Personal PV</div><strong style={{fontFamily:"var(--fd)",fontSize:"1.3rem"}}>0</strong></div></div>
              <div style={{display:"flex",alignItems:"center",gap:10}}><span className="stat-ic comm" style={{width:38,height:38}}><PIcon name="network" size={18} /></span><div><div className="sub" style={{fontSize:"0.76rem"}}>Group PV</div><strong style={{fontFamily:"var(--fd)",fontSize:"1.3rem"}}>0</strong></div></div>
              <div style={{marginLeft:"auto",display:"flex",gap:10,alignItems:"center"}}><button className="btn btn-ghost btn-sm">Reset Password</button><button className="btn btn-ghost btn-sm">Reset Txn Password</button></div>
            </div>
          </div>
        </div>
      </div>
      <div className="card" style={{display:"grid",gridTemplateColumns:"240px 1fr",overflow:"hidden",minHeight:380}}>
        <div style={{borderRight:"1px solid var(--line)",padding:14,background:"var(--surface-2)"}}>
          {tabs.map(t=><button key={t[0]} className={`nav-i ${tab===t[0]?"on":""}`} style={{marginBottom:4}} onClick={()=>setTab(t[0])}>{t[1]}</button>)}
        </div>
        <div style={{padding:28}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22}}><h3>{tabs.find(t=>t[0]===tab)[1]}</h3><button className="icon-btn"><PIcon name="edit" size={18} /></button></div>
          <div style={{display:"grid",gap:18,maxWidth:560}}>
            {(tab==="bank"?bankFields:[["Field 1",""],["Field 2",""],["Field 3",""]]).map((f,i)=>(
              <div key={i} style={{display:"grid",gridTemplateColumns:"160px 1fr",alignItems:"center",gap:14}}>
                <label style={{fontWeight:600,fontSize:"0.9rem"}}>{f[0]} <span style={{color:"var(--red)"}}>*</span></label>
                <input defaultValue={f[1]} style={{background:"var(--surface-2)",border:"1px solid var(--line)",borderRadius:11,padding:"11px 14px",fontFamily:"var(--fs)",fontSize:"0.9rem"}} />
              </div>
            ))}
            <button className="btn btn-royal btn-sm" style={{justifySelf:"start",marginLeft:174}}>Update</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ============ REPLICA SITE ============ */
function Replica() {
  return (
    <>
      <div className="sec-title"><div><span className="pill pill-royal">Replica Site Management</span><h2 style={{marginTop:8}}>Banner Upload</h2></div></div>
      <div className="card panel">
        <div className="upload-grid">
          <div>
            <h3 style={{textAlign:"center",marginBottom:18}}>Upload Top Banner</h3>
            <div className="dropzone">
              <div className="up-ic"><PIcon name="upload" size={26} /></div>
              <h4>Choose an image file or drag it here</h4>
              <p className="sub">PNG / JPEG / JPG · Max 2MB<br/>Recommended 1920×1080 px</p>
              <button className="btn btn-royal" style={{marginTop:16}}>Upload</button>
            </div>
          </div>
          <div>
            <h3 style={{textAlign:"center",marginBottom:18}}>Current Top Banner</h3>
            <div className="empty" style={{minHeight:240,border:"1px solid var(--line)",borderRadius:"var(--radius-lg)"}}><PIcon name="flag" size={44} /><p>No images available.</p></div>
          </div>
        </div>
      </div>
    </>
  );
}

function ToolsPage({ route }) {
  const titles = { materials:"Download Materials", news:"News", faqs:"FAQs" };
  const icons = { materials:"download", news:"flag", faqs:"support" };
  return (
    <>
      <div className="sec-title"><h2>{titles[route]}</h2></div>
      <div className="card"><div className="empty" style={{padding:60}}><PIcon name={icons[route]} size={48} /><p>{route==="faqs"?"Frequently asked questions will appear here.":route==="news"?"Latest PLG news and updates will appear here.":"Marketing materials and banners available to download will appear here."}</p></div></div>
    </>
  );
}

/* ============ MAILBOX ============ */
function Mailbox() {
  const [sel,setSel] = useStateB(0);
  const mails = [
    { from:"PLG Affiliates", subj:"Welcome to PLG Lotto Affiliates 🎉", time:"2h", unread:true, body:"Hi Joshua,\n\nWelcome aboard! Your affiliate account is live. Share your referral link or QR code and start earning 10% of all referred players' ongoing spending, plus royalty income from your network.\n\nHead to your Dashboard to grab your link.\n\n— The PLG Team" },
    { from:"Commission Bot", subj:"How royalty income works", time:"1d", unread:false, body:"You earn 5% royalty income from Level 1 referral players and 2.5% from Level 2 — seamlessly paid into your wallet. 100% automated, no cost, no involvement." },
    { from:"PLG Support", subj:"Complete your payout details", time:"3d", unread:false, body:"To receive withdrawals, please add your bank or crypto payout details under Profile › Bank Details." },
  ];
  const m = mails[sel];
  return (
    <>
      <div className="sec-title"><h2>Mail Box</h2></div>
      <div className="mail-layout">
        <div className="mail-list">
          <div className="mail-compose"><button className="btn btn-royal btn-sm" style={{width:"100%"}}><PIcon name="edit" size={15} /> Compose</button></div>
          <div className="mail-list-h"><strong>Inbox</strong><div style={{display:"flex",gap:8}}><button className="icon-btn" style={{width:32,height:32}}><PIcon name="refresh" size={15} /></button></div></div>
          {mails.map((mm,i)=>(
            <div key={i} className={`mail-item ${sel===i?"on":""} ${mm.unread?"unread":""}`} onClick={()=>setSel(i)}>
              <div className="mail-from"><span className="mail-name">{mm.from}</span><span className="mail-time">{mm.time}</span></div>
              <div className="mail-subj">{mm.subj}</div>
              <div className="mail-prev">{mm.body.split("\n")[0]}</div>
            </div>
          ))}
        </div>
        <div className="mail-read">
          <div className="mail-read-h"><h3>{m.subj}</h3><div className="sub" style={{marginTop:6}}>From <strong style={{color:"var(--ink)"}}>{m.from}</strong> · {m.time} ago</div></div>
          <div className="mail-body">{m.body.split("\n").map((l,i)=><p key={i} style={{marginBottom:10}}>{l||"\u00a0"}</p>)}</div>
        </div>
      </div>
    </>
  );
}

/* ============ SUPPORT ============ */
function Support() {
  const [tab,setTab] = useStateB("my");
  return (
    <>
      <div className="sec-title"><div className="tabs">{[["my","My Ticket"],["create","Create Ticket"],["faqs","FAQs"]].map(t=><button key={t[0]} className={tab===t[0]?"on":""} onClick={()=>setTab(t[0])}>{t[1]}</button>)}</div></div>
      {tab==="create" ? (
        <div className="card panel" style={{maxWidth:680}}>
          <h3 style={{marginBottom:18}}>Create a support ticket</h3>
          <div style={{display:"grid",gap:16}}>
            <div className="field"><label>Subject</label><input placeholder="Brief summary of your issue" /></div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
              <div className="field"><label>Category</label><select><option>Select…</option><option>Payout</option><option>Account</option><option>Technical</option></select></div>
              <div className="field"><label>Priority</label><select><option>Select…</option><option>Low</option><option>Medium</option><option>High</option></select></div>
            </div>
            <div className="field"><label>Message</label><textarea rows={5} placeholder="Describe your issue…" style={{background:"var(--surface-2)",border:"1px solid var(--line)",borderRadius:11,padding:"11px 14px",fontFamily:"var(--fs)",fontSize:"0.9rem",resize:"vertical"}} /></div>
            <button className="btn btn-royal" style={{justifySelf:"start"}}>Submit ticket</button>
          </div>
        </div>
      ) : tab==="faqs" ? (
        <div className="card panel"><FaqList /></div>
      ) : (
        <>
          <div className="card filters" style={{marginBottom:16}}>
            <div className="field"><label>Ticket Id</label><input placeholder="Ticket Id" /></div>
            <div className="field"><label>Category</label><select><option>Select…</option></select></div>
            <div className="field"><label>Priority</label><select><option>Select…</option></select></div>
            <div className="field"><label>Status</label><select><option>Select…</option></select></div>
            <div style={{display:"flex",gap:10}}><button className="btn btn-royal btn-sm">Search</button><button className="btn btn-ghost btn-sm">Reset</button></div>
          </div>
          <div className="card">
            <div className="tbl-wrap"><table className="tbl"><thead><tr>{["Sl.No","Ticket Id","Subject","Assignee","Status","Category","Priority","Created On","Last Updated","Timeline"].map(h=><th key={h}>{h}</th>)}</tr></thead></table></div>
            <div className="empty" style={{padding:60}}><PIcon name="search" size={46} /><p>Sorry, no data found.</p></div>
          </div>
        </>
      )}
    </>
  );
}

function FaqList() {
  const [open,setOpen] = useStateB(0);
  const faqs = [
    ["How do I earn commission?","You earn 10% of all referred players' ongoing spending, plus 5% royalty from Level 1 and 2.5% from Level 2 — paid automatically to your wallet."],
    ["When can I request a payout?","Once your e-wallet balance reaches the $10 minimum. Add bank or crypto details under Profile, then request from the Payout page."],
    ["How do I share my replica site?","Copy your referral link or download your QR code from the Dashboard. Anyone who joins through it is tracked to your account."],
    ["What is Personal vs Group PV?","Personal PV is your own activity volume; Group PV aggregates your entire downline's volume."],
  ];
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {faqs.map((f,i)=>(
        <div key={i} className="card" style={{boxShadow:"none",overflow:"hidden"}}>
          <button onClick={()=>setOpen(open===i?-1:i)} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 18px",background:"none",border:"none",fontWeight:700,fontFamily:"var(--fd)",fontSize:"0.96rem",textAlign:"left"}}>
            {f[0]} <span style={{transform:open===i?"rotate(90deg)":"none",transition:"transform 0.2s",color:"var(--royal)"}}><PIcon name="chev" size={18} /></span>
          </button>
          {open===i && <div style={{padding:"0 18px 18px",color:"var(--muted)",fontSize:"0.9rem",lineHeight:1.6}}>{f[1]}</div>}
        </div>
      ))}
    </div>
  );
}

Object.assign(window, { EWallet, Payout, Profile, Replica, ToolsPage, Mailbox, Support });
