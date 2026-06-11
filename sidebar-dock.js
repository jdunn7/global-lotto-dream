/* sidebar-dock.js — universal: makes a page's sidebar resizable, collapsible,
   and dockable (left / right / bottom). Framework-agnostic; self-injects CSS.
   Works on .dash-side (dashboard pages) and .side (portal). Persists per page. */
(function () {
  var KEY = "plg_sbdock_" + location.pathname;
  var def = { dock: "left", w: 248, h: 200, collapsed: false };
  var state = load();
  function load() { try { return Object.assign({}, def, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { return Object.assign({}, def); } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }

  var CSS =
    ".sb-tools{display:flex;gap:4px;padding:4px 8px 12px;margin-bottom:2px}" +
    ".sb-tools button{flex:1;height:30px;border:1px solid var(--border,#e7ebf5);background:transparent;border-radius:8px;color:inherit;cursor:pointer;display:flex;align-items:center;justify-content:center;opacity:.6;transition:all .15s}" +
    ".sb-tools button:hover{opacity:1;background:rgba(127,140,200,.14)}" +
    ".sb-tools button.on{opacity:1;border-color:var(--primary,#3b5bdb);color:var(--primary,#3b5bdb);background:rgba(91,118,232,.12)}" +
    ".sb-grip{position:absolute;z-index:60}" +
    ".sb-grip.v{top:0;bottom:0;width:10px;cursor:col-resize}" +
    ".sb-grip.h{left:0;right:0;height:10px;cursor:row-resize}" +
    ".sb-grip::after{content:'';position:absolute;background:var(--primary,#3b5bdb);border-radius:999px;opacity:0;transition:opacity .2s}" +
    ".sb-grip:hover::after,.sb-grip.drag::after{opacity:.8}" +
    ".sb-grip.v::after{top:50%;left:50%;transform:translate(-50%,-50%);width:3px;height:46px}" +
    ".sb-grip.h::after{left:50%;top:50%;transform:translate(-50%,-50%);height:3px;width:46px}" +
    ".sb-reopen{position:fixed;left:14px;top:14px;z-index:200;width:44px;height:44px;border-radius:12px;border:1px solid var(--border,#e7ebf5);background:var(--bg-card,#fff);color:var(--primary,#3b5bdb);cursor:pointer;display:none;align-items:center;justify-content:center;box-shadow:0 12px 28px -12px rgba(20,29,82,.5)}" +
    ".sb-bottom{flex-direction:row!important;height:auto!important;align-items:center;overflow-x:auto;overflow-y:hidden;gap:6px}" +
    ".sb-bottom .sb-tools{flex-direction:column;padding:0 6px;margin:0;flex:none}" +
    ".sb-bottom .dash-nav,.sb-bottom .nav-sub{flex-direction:row!important}" +
    ".sb-bottom .dash-nav-i,.sb-bottom .nav-i{white-space:nowrap}" +
    ".sb-bottom .dash-brand,.sb-bottom .side-logo,.sb-bottom .dash-side-tag,.sb-bottom .dash-tierbox,.sb-bottom .dash-back,.sb-bottom .side-foot,.sb-bottom .nav-sub{display:none!important}";

  function svg(p) { return '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>'; }
  var IC = {
    collapse: '<path d="M15 6l-6 6 6 6"/><path d="M4 4v16"/>',
    left: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>',
    right: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
    bottom: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 15h18"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  };

  var side, shell, main, grip, reopen, tools;

  function apply() {
    if (!side || !shell) return;
    shell.style.position = "relative";
    side.classList.remove("sb-bottom");
    side.style.order = ""; main.style.order = ""; side.style.width = ""; side.style.height = "";
    shell.style.flexDirection = ""; shell.style.gridTemplateColumns = ""; shell.style.gridTemplateRows = "";

    if (state.dock === "bottom") {
      shell.style.display = "flex"; shell.style.flexDirection = "column";
      main.style.order = "1"; side.style.order = "2";
      side.classList.add("sb-bottom");
      side.style.setProperty("height", state.h + "px", "important");
    } else {
      shell.style.display = "grid";
      if (state.dock === "right") { shell.style.gridTemplateColumns = "1fr " + state.w + "px"; side.style.order = "2"; main.style.order = "1"; }
      else { shell.style.gridTemplateColumns = state.w + "px 1fr"; side.style.order = "1"; main.style.order = "2"; }
    }

    side.style.display = state.collapsed ? "none" : "";
    reopen.style.display = state.collapsed ? "flex" : "none";

    // grip placement
    grip.className = "sb-grip " + (state.dock === "bottom" ? "h" : "v");
    grip.style.left = grip.style.right = grip.style.top = grip.style.bottom = "";
    if (state.dock === "bottom") { grip.style.top = "-4px"; }
    else if (state.dock === "right") { grip.style.left = "-4px"; }
    else { grip.style.right = "-4px"; }

    // active states on dock buttons
    tools.querySelectorAll("[data-dock]").forEach(function (b) { b.classList.toggle("on", b.dataset.dock === state.dock); });
    save();
  }

  function buildTools() {
    tools = document.createElement("div"); tools.className = "sb-tools";
    function mk(title, html, on) { var b = document.createElement("button"); b.title = title; b.innerHTML = html; b.onclick = on; return b; }
    function tog(d) { state.dock = (state.dock === d ? "left" : d); apply(); }
    var bR = mk("Dock right (toggle)", svg(IC.right), function () { tog("right"); }); bR.dataset.dock = "right";
    var bB = mk("Dock to bottom (toggle)", svg(IC.bottom), function () { tog("bottom"); }); bB.dataset.dock = "bottom";
    tools.appendChild(bR); tools.appendChild(bB);
    side.insertBefore(tools, side.firstChild);
  }

  function buildGrip() {
    grip = document.createElement("div"); grip.className = "sb-grip v";
    side.appendChild(grip);
    var dragging = false;
    grip.addEventListener("pointerdown", function (e) { e.preventDefault(); dragging = true; grip.classList.add("drag"); grip.setPointerCapture(e.pointerId); });
    grip.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var r = side.getBoundingClientRect();
      if (state.dock === "bottom") { state.h = Math.max(90, Math.min(340, r.bottom - e.clientY)); }
      else if (state.dock === "right") { state.w = Math.max(150, Math.min(440, r.right - e.clientX)); }
      else { state.w = Math.max(150, Math.min(440, e.clientX - r.left)); }
      apply();
    });
    grip.addEventListener("pointerup", function (e) { dragging = false; grip.classList.remove("drag"); });
  }

  function init() {
    side = document.querySelector(".dash-side, .side");
    if (!side) return false;
    shell = side.parentElement;
    main = Array.prototype.filter.call(shell.children, function (c) { return c !== side; })[0];
    if (!main) return false;
    var st = document.createElement("style"); st.textContent = CSS; document.head.appendChild(st);
    reopen = document.createElement("button"); reopen.className = "sb-reopen"; reopen.title = "Show sidebar"; reopen.innerHTML = svg(IC.menu);
    reopen.onclick = function () { state.collapsed = false; apply(); };
    document.body.appendChild(reopen);
    buildTools(); buildGrip(); apply();
    return true;
  }

  // React pages render async — poll until the sidebar exists
  if (!init()) {
    var tries = 0, iv = setInterval(function () { if (init() || ++tries > 40) clearInterval(iv); }, 150);
  }
})();
