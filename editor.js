// SOLARA in-page visual editor v2 — portable, multi-site.
// Drop on ANY site:  <link rel=stylesheet href=editor.css>
//                    <script src=editor.js data-site="<id>" defer></script>
// Without ?edit it silently replays saved edits for every visitor. With ?edit +
// passcode it injects a grouped, draggable toolbar with popovers for spacing,
// typography, links/images, page navigation, effects ("The Book"), AI photo/video
// generation, structural notes ("Tell Claude"), draft/save, and full undo/redo.
// All edits persist via the solaravpn control-plane Worker (prop-agnostic D1).
(function () {
  var API = "https://api.solaravpn.com";
  var ME = document.currentScript;
  var SITE = (ME && ME.getAttribute("data-site")) || ""; // per-site namespace so sites do not collide
  var PATH = SITE + (location.pathname.replace(/\/index\.html$/, "/") || "/");

  function cssPath(el) {
    if (el.id) return "#" + CSS.escape(el.id);
    var parts = [];
    while (el && el.nodeType === 1 && el.tagName.toLowerCase() !== "body") {
      var tag = el.tagName.toLowerCase(), parent = el.parentNode;
      if (!parent) { parts.unshift(tag); break; }
      if (el.id) { parts.unshift("#" + CSS.escape(el.id)); break; }
      var same = Array.prototype.filter.call(parent.children, function (s) { return s.tagName === el.tagName; });
      parts.unshift(same.length > 1 ? tag + ":nth-of-type(" + (same.indexOf(el) + 1) + ")" : tag);
      el = parent;
    }
    return parts.join(" > ");
  }

  // ── apply saved edits for everyone (idempotent → MutationObserver can't loop) ──
  var EDITS = [];
  function applyOne(e) {
    try {
      var el = document.querySelector(e.selector); if (!el) return;
      if (e.prop === "text") { if (el.textContent !== e.value) el.textContent = e.value; }
      else if (e.prop === "remove") { el.remove(); }
      else if (e.prop.indexOf("class:") === 0) { var c = e.prop.slice(6); if (!el.classList.contains(c)) el.classList.add(c); }
      else if (e.prop.indexOf("attr:") === 0) { var a = e.prop.slice(5); if (e.value === "" || e.value == null) el.removeAttribute(a); else if (el.getAttribute(a) !== e.value) el.setAttribute(a, e.value); }
      else { if (el.style.getPropertyValue(e.prop) !== e.value) el.style.setProperty(e.prop, e.value); }
    } catch (_) {}
  }
  function applyEdits() { for (var i = 0; i < EDITS.length; i++) applyOne(EDITS[i]); }
  fetch(API + "/v1/site/edits?path=" + encodeURIComponent(PATH))
    .then(function (r) { return r.json(); })
    .then(function (d) {
      EDITS = d.edits || []; if (!EDITS.length) return;
      applyEdits();
      [200, 800, 1800].forEach(function (t) { setTimeout(applyEdits, t); });
      window.addEventListener("load", applyEdits);
      var pend = 0;
      var mo = new MutationObserver(function () { clearTimeout(pend); pend = setTimeout(applyEdits, 250); });
      try { mo.observe(document.documentElement, { childList: true, subtree: true }); } catch (_) {}
    }).catch(function () {});

  if (!new URLSearchParams(location.search).has("edit")) return;
  var pass = sessionStorage.getItem("solara_edit_pass") || window.prompt("SOLARA editor passcode:");
  if (!pass) return;
  sessionStorage.setItem("solara_edit_pass", pass);

  // ── state ──
  var sel = null, moveMode = false, handle = null, hist = [], redo = [];
  var draft = false, queue = [], copied = null;

  function msg(t) { var m = document.getElementById("solara-edit-msg"); if (m) { m.textContent = t; clearTimeout(msg._t); msg._t = setTimeout(function () { m.textContent = ""; }, 2600); } }
  function api(p, payload) { return fetch(API + p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).then(function (r) { if (r.status === 401) { sessionStorage.removeItem("solara_edit_pass"); msg("wrong passcode — reload"); return false; } return r.ok; }); }
  function apiJSON(p, payload) { return fetch(API + p, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }).then(function (r) { if (r.status === 401) { sessionStorage.removeItem("solara_edit_pass"); msg("wrong passcode — reload"); return null; } return r.json().then(function (j) { return r.ok ? j : { error: (j && j.error) || ("HTTP " + r.status) }; }).catch(function () { return { error: "HTTP " + r.status }; }); }).catch(function () { return { error: "network" }; }); }
  function save(s, prop, value) { return api("/v1/site/edits", { pass: pass, path: PATH, selector: s, prop: prop, value: value }); }
  function need() { if (!sel) { msg("click an element first"); return false; } return true; }

  // ── draft-aware persistence: live → POST now; draft → queue (dedup by selector+prop) ──
  function persist(s, prop, value) {
    if (draft) {
      queue = queue.filter(function (q) { return !(q.selector === s && q.prop === prop); });
      queue.push({ selector: s, prop: prop, value: value });
      setStatus("dirty"); return Promise.resolve(true);
    }
    setStatus("dirty");
    return save(s, prop, value).then(function (ok) { setStatus(ok ? "saved" : "error"); return ok; });
  }
  function flush() {
    if (!queue.length) { setStatus("saved"); msg("nothing to save"); return; }
    setStatus("saving"); var q = queue.slice(); queue = [];
    (function next(i) {
      if (i >= q.length) { setStatus("saved"); msg("saved " + q.length + " change" + (q.length > 1 ? "s" : "") + " ✓"); return; }
      save(q[i].selector, q[i].prop, q[i].value).then(function (ok) { if (!ok) { setStatus("error"); queue = q.slice(i).concat(queue); msg("save failed — retry"); return; } next(i + 1); });
    })(0);
  }
  function setStatus(st) { var d = document.getElementById("solara-status"); if (d) { d.className = "st-" + st; d.title = st; } }

  // ── history ──
  function commit(undo, redoFn) { hist.push({ undo: undo, redo: redoFn }); redo = []; }
  function doUndo() { var h = hist.pop(); if (!h) { msg("nothing to undo"); return; } h.undo(); redo.push(h); msg("undone ↩"); }
  function doRedo() { var h = redo.pop(); if (!h) { msg("nothing to redo"); return; } h.redo(); hist.push(h); msg("redone ↪"); }

  // ── generic value read/apply (text | attr:* | css prop) ──
  function readVal(el, prop) { if (prop === "text") return el.textContent; if (prop.indexOf("attr:") === 0) return el.getAttribute(prop.slice(5)) || ""; return el.style.getPropertyValue(prop); }
  function applyVal(el, prop, v) {
    if (prop === "text") { el.textContent = v; }
    else if (prop.indexOf("attr:") === 0) { var a = prop.slice(5); if (v === "" || v == null) el.removeAttribute(a); else el.setAttribute(a, v); }
    else { if (v === "") el.style.removeProperty(prop); else el.style.setProperty(prop, v); }
  }
  // one discrete edit (text/attr/style) with undo
  function styleEdit(el, prop, value) {
    var s = cssPath(el), prev = readVal(el, prop);
    applyVal(el, prop, value); persist(s, prop, value); msg("saved ✓");
    commit(function () { applyVal(el, prop, prev); persist(s, prop, prev); }, function () { applyVal(el, prop, value); persist(s, prop, value); });
  }

  function getXY(el) { return [el._tx || 0, el._ty || 0]; }
  function setXY(el, x, y) { el._tx = x; el._ty = y; el.style.transform = "translate(" + x + "px," + y + "px)"; }
  function placeHandle() { if (!handle) return; if (!sel) { handle.style.display = "none"; return; } var r = sel.getBoundingClientRect(); handle.style.display = "block"; handle.style.left = (r.right - 7) + "px"; handle.style.top = (r.bottom - 7) + "px"; }

  // ── effects ("The Book") ──
  // Hover/press effects can't be triggered from JS (no API to force :hover), so the
  // editor flashes a `.fx-prev` mirror class for ~1.6s to preview them on click.
  // Never persisted → real visitors still get the hover/press interaction. Harmless
  // on instant/animation effects (no .fx-prev mirror rule matches them).
  function previewFx(el) { if (!el) return; el.classList.add("fx-prev"); clearTimeout(el._fxPrev); el._fxPrev = setTimeout(function () { el.classList.remove("fx-prev"); }, 1600); }
  function addEffect(el, cls) {
    if (!el) { msg("⚠ click an element on the page first"); return; }
    var s = cssPath(el);
    var on = !el.classList.contains(cls);
    if (on) { el.classList.add(cls); persist(s, "class:" + cls, "1"); previewFx(el); msg("applied " + cls + " ✓"); }
    else { el.classList.remove(cls); persist(s, "class:" + cls, ""); msg("removed " + cls); }
    markApplied();
    commit(
      function () { if (on) { el.classList.remove(cls); persist(s, "class:" + cls, ""); } else { el.classList.add(cls); persist(s, "class:" + cls, "1"); } markApplied(); },
      function () { if (on) { el.classList.add(cls); persist(s, "class:" + cls, "1"); } else { el.classList.remove(cls); persist(s, "class:" + cls, ""); } markApplied(); }
    );
  }
  function markApplied() {
    var bk = document.getElementById("solara-book"); if (!bk) return;
    bk.querySelectorAll(".bk-item").forEach(function (b) { var c = b.getAttribute("data-c"); b.classList.toggle("on", !!(c && sel && sel.classList.contains(c))); });
    var s = document.getElementById("bk-sel"); if (s) s.textContent = sel ? ("Selected: <" + sel.tagName.toLowerCase() + ">") : "nothing selected — click an element";
  }

  var BOOK = [
    ["3D & hover", [
      ["Tilt 3D", "fx-tilt", "perspective tilt on hover"], ["Hover lift", "fx-lift", "rises with a soft shadow"], ["Press", "fx-press", "pushes down on click"], ["Scale up", "fx-scale", "grows slightly on hover"], ["Tilt rotate", "fx-rotate", "playful rotate on hover"], ["Grow + rotate", "fx-grow-rotate", "scales and tilts on hover"], ["Skew hover", "fx-skew-hover", "italic-skew on hover"], ["Fill up", "fx-fill-up", "colour fills from the bottom on hover"], ["Border draw", "fx-border-draw", "border zooms in on hover"], ["Shake hover", "fx-shake", "quick shake on hover"], ["Magnetic", "fx-magnetic", "smooth follow (base for magnetic cursor)"], ["3D card hover", "fx-card-3d", "card tilts in 3D on hover"], ["Flip card", 0, "front/back flip on hover", 1], ["3D cube / carousel", 0, "rotating 3D cube of panels", 1], ["Layered parallax", 0, "foreground/background move at different speeds", 1],
    ]],
    ["Motion & loops", [
      ["Float", "fx-float", "gently bobs up and down"], ["Pulse", "fx-pulse", "heartbeat scale"], ["Breathe", "fx-breathe", "fades in/out softly"], ["Spin", "fx-spin", "slow continuous rotation"], ["Wobble", "fx-wobble", "subtle rocking"], ["Bounce", "fx-bounce", "bounces up and down"], ["Swing", "fx-swing", "swings like a pendulum"], ["Jelly", "fx-jelly", "squashy jelly wobble"], ["Heartbeat", "fx-heartbeat", "double-thump pulse"], ["Flicker", "fx-flicker", "neon flicker"], ["Orbit", "fx-orbit", "continuous orbit spin"], ["Scroll-velocity skew", 0, "skews based on scroll speed", 1], ["Marquee / ticker", "fx-marquee", "auto-scrolling ticker"],
    ]],
    ["Entrances", [
      ["Slide up", "fx-slide-up", "rises into place"], ["Slide from left", "fx-slide-left", "enters from the left"], ["Slide from right", "fx-slide-right", "enters from the right"], ["Blur in", "fx-blur-in", "focuses from blur"], ["Zoom in", "fx-zoom-in", "pops from small"], ["Fade in", "fx-fade-in", "soft opacity fade"], ["Flip in", "fx-flip-in", "flips into place"], ["Drop in", "fx-drop-in", "drops in with a bounce"], ["Clip wipe", "fx-clip-reveal", "wipes in left-to-right"], ["Stagger reveal", 0, "children appear one-by-one on scroll", 1], ["Split-text reveal", 0, "letters/words animate in individually", 1], ["Counter roll-up", 0, "numbers count up when in view", 1],
    ]],
    ["Light & glow", [
      ["Glow", "fx-glow", "warm outer glow"], ["Glow pulse", "fx-glow-pulse", "glow that breathes"], ["Neon text", "fx-neon", "glowing neon letters"], ["Glow text", "fx-glow-text", "soft glow behind text"], ["Glassmorphism", "fx-glass", "frosted translucent panel"], ["Frost", "fx-frost", "lighter frosted glass"], ["Neumorphism", "fx-neumorph", "soft extruded surface"], ["Inner glow", "fx-inner-glow", "glow inside the element"], ["Gradient border", "fx-gradient-border", "animated gradient outline"], ["Shimmer", "fx-shimmer", "light sweeps across (loop)"], ["Shine on hover", "fx-shine", "gloss streak on hover"], ["Button glow", "fx-btn-glow", "lifts + glows (great for CTAs)"], ["Spotlight cursor", 0, "a glow follows the mouse over a section", 1],
    ]],
    ["Typography", [
      ["Animated gradient text", "fx-gradient-text", "flowing colour gradient"], ["Holographic text", "fx-holographic", "iridescent shifting text"], ["Fire text", "fx-fire-text", "ember gradient letters"], ["Rainbow flow", "fx-rainbow", "rainbow gradient sweep"], ["Outlined text", "fx-stroke", "hollow stroked letters"], ["3D text", "fx-3dtext", "extruded layered shadow"], ["Long shadow", "fx-shadow-long", "trailing flat shadow"], ["Retro arcade", "fx-retro", "80s offset shadow"], ["Wide tracking caps", "fx-tracking", "editorial uppercase label"], ["Uppercase", "fx-uppercase", "all caps + spacing"], ["Underline grow", "fx-underline-grow", "underline expands on hover"], ["Balanced wrap", "fx-balance", "no orphan/widow lines"], ["Glitch text", "fx-glitch", "RGB-split glitch jitter"], ["Kinetic typography", 0, "text animates with meaning", 1], ["Drop cap", "fx-dropcap", "large decorative first letter"],
    ]],
    ["Backgrounds & illusions", [
      ["Aurora", "fx-aurora", "slow rotating colour bloom"], ["Mesh gradient", "fx-mesh", "soft multi-point gradient"], ["Animated gradient", "fx-animated-gradient", "shifting warm gradient"], ["Radial pulse", "fx-radial-pulse", "pulsing radial glow"], ["Grid lines", "fx-grid", "blueprint grid"], ["Dot pattern", "fx-dots", "subtle dotted field"], ["Diagonal stripes", "fx-stripes", "soft diagonal stripes"], ["Film noise", "fx-noise", "faint grain texture"], ["Scanlines", "fx-scanlines", "CRT scanline overlay"], ["Vignette", "fx-vignette", "darkened edges"], ["Starfield", "fx-starfield", "night-sky dots"], ["Conic sheen", "fx-conic", "angular gradient sweep"], ["Animated blob", "fx-blob", "morphing organic shape"],
    ]],
    ["Shape & filters", [
      ["Pill shape", "fx-pill", "fully rounded corners"], ["Card surface", "fx-card", "padded bordered card"], ["Slanted cut", "fx-clip-slant", "angled bottom edge"], ["Offset outline", "fx-outline-offset", "floating outline"], ["Greyscale → colour", "fx-grayscale", "colours in on hover"], ["Invert hover", "fx-invert", "inverts on hover"], ["Blur hover", "fx-blur-hover", "blurs on hover"], ["Saturate hover", "fx-saturate", "pops colour on hover"], ["Duotone", "fx-duotone", "two-tone image filter"],
    ]],
    ["Layout & UX (ideas)", [
      ["Bento grid", 0, "asymmetric tiled feature grid", 1], ["Sticky scroll story", 0, "content pins while media changes", 1], ["Scroll-snap sections", 0, "each section snaps into view", 1], ["Z-pattern hero", 0, "guide the eye logo→headline→CTA", 1], ["F-pattern content", 0, "scannable left-aligned blocks", 1], ["Golden-ratio spacing", 0, "harmonious proportional rhythm", 1], ["Sticky element", "fx-sticky", "pins to top on scroll"], ["Social proof row", 0, "logos / counts / reviews strip", 1], ["Comparison toggle", 0, "monthly⇄annual price switch", 1], ["Progressive disclosure", 0, "reveal detail on demand", 1],
    ]],
    ["Micro-UX (ideas)", [
      ["Magnetic cursor", 0, "buttons pull toward the pointer", 1], ["Ripple click", 0, "material ripple on tap", 1], ["Toast notifications", 0, "slide-in confirmations", 1], ["Skeleton shimmer", "fx-skeleton", "loading placeholder shimmer"], ["Optimistic UI", 0, "instant feedback before server confirms", 1], ["Confetti on success", 0, "celebrate a purchase", 1], ["Custom scrollbar", 0, "brand-tinted scrollbar", 1], ["Scroll progress bar", 0, "top bar tracks reading position", 1],
    ]],
  ];

  function buildBook() {
    var bk = document.createElement("div"); bk.id = "solara-book";
    var html = '<div class="bk-head"><b>✨ The Book</b><input id="bk-search" placeholder="search tricks…"><button id="bk-close">✕</button></div>' +
      '<div class="bk-hint">Click an element on the page, then a ⚡ effect to toggle it. 💡 = idea → note to me.</div>' +
      '<div id="bk-sel" class="bk-sel">nothing selected — click an element</div><div id="bk-body">';
    BOOK.forEach(function (group) {
      html += '<div class="bk-cat" data-cat="' + group[0] + '"><h4>' + group[0] + '</h4><div class="bk-items">';
      group[1].forEach(function (it) {
        var idea = it[3];
        html += '<button class="bk-item' + (idea ? ' idea' : '') + '" data-c="' + (it[1] || "") + '" data-n="' + it[0] + '" data-d="' + it[2] + '" title="' + it[2] + '">' + (idea ? "💡 " : "⚡ ") + it[0] + '</button>';
      });
      html += '</div></div>';
    });
    html += '</div>';
    bk.innerHTML = html;
    document.body.appendChild(bk);
    bk.querySelector("#bk-close").addEventListener("click", function () { bk.remove(); });
    bk.querySelector("#bk-search").addEventListener("input", function (e) {
      var q = e.target.value.toLowerCase();
      bk.querySelectorAll(".bk-item").forEach(function (b) { var hit = (b.getAttribute("data-n") + " " + b.getAttribute("data-d")).toLowerCase().indexOf(q) >= 0; b.style.display = hit ? "" : "none"; });
      bk.querySelectorAll(".bk-cat").forEach(function (c) { var any = Array.prototype.some.call(c.querySelectorAll(".bk-item"), function (b) { return b.style.display !== "none"; }); c.style.display = any ? "" : "none"; });
    });
    bk.querySelector("#bk-body").addEventListener("click", function (e) {
      var b = e.target.closest(".bk-item"); if (!b) return;
      var c = b.getAttribute("data-c");
      if (c) { addEffect(sel, c); }
      else { openNote("Add this: " + b.getAttribute("data-n") + " — " + b.getAttribute("data-d") + (sel ? " (on the selected element)" : "")); }
    });
    markApplied();
  }

  // ── popovers ──
  function closePop() { var c = document.getElementById("solara-pop"); if (c) { c.innerHTML = ""; c.dataset.open = ""; } document.querySelectorAll("#solara-editbar button.pop-on").forEach(function (b) { b.classList.remove("pop-on"); }); }
  function openPop(name, btn, builder) {
    var c = document.getElementById("solara-pop");
    if (c.dataset.open === name) { closePop(); return; }
    closePop(); c.dataset.open = name; if (btn) btn.classList.add("pop-on");
    var p = document.createElement("div"); p.className = "solara-popm"; c.appendChild(p); builder(p);
  }
  function row(label, inner) { return '<div class="pr"><span class="prl">' + label + '</span><span class="prc">' + inner + '</span></div>'; }
  function px(v) { return Math.round(parseFloat(v) || 0); }

  // live range/input binder: input → preview; change → persist + undo. getVal() reads the css value from current inputs.
  function liveBind(input, getProp, getVal) {
    var start;
    function cap() { if (sel) start = readVal(sel, getProp()); }
    input.addEventListener("focus", cap); input.addEventListener("pointerdown", cap);
    input.addEventListener("input", function () { if (sel) { applyVal(sel, getProp(), getVal()); placeHandle(); } });
    input.addEventListener("change", function () { if (!sel) return; var p = getProp(), nv = getVal(), el = sel, pv = start; persist(cssPath(el), p, nv); commit(function () { applyVal(el, p, pv); persist(cssPath(el), p, pv); }, function () { applyVal(el, p, nv); persist(cssPath(el), p, nv); }); });
  }

  // SPACING & SIZING popover
  function buildBoxPop(p) {
    if (!sel) { p.innerHTML = '<div class="pop-empty">Click an element first, then reopen Box.</div>'; return; }
    var cs = getComputedStyle(sel);
    p.innerHTML = '<div class="pop-h">Spacing &amp; sizing</div>' +
      row("Padding", '<input type="range" id="bx-pad" min="0" max="80" value="' + px(cs.paddingTop) + '"><b id="bx-padv">' + px(cs.paddingTop) + '</b>') +
      row("Margin", '<input type="range" id="bx-mar" min="0" max="80" value="' + px(cs.marginTop) + '"><b id="bx-marv">' + px(cs.marginTop) + '</b>') +
      row("Radius", '<input type="range" id="bx-rad" min="0" max="80" value="' + px(cs.borderTopLeftRadius) + '"><b id="bx-radv">' + px(cs.borderTopLeftRadius) + '</b>') +
      row("Border", '<input type="range" id="bx-bw" min="0" max="14" value="' + px(cs.borderTopWidth) + '"><input type="color" id="bx-bc" value="' + rgbToHex(cs.borderTopColor) + '">') +
      row("Opacity", '<input type="range" id="bx-op" min="0" max="100" value="' + Math.round((parseFloat(cs.opacity) || 1) * 100) + '"><b id="bx-opv">' + Math.round((parseFloat(cs.opacity) || 1) * 100) + '</b>');
    var pad = p.querySelector("#bx-pad"), mar = p.querySelector("#bx-mar"), rad = p.querySelector("#bx-rad"), op = p.querySelector("#bx-op"), bw = p.querySelector("#bx-bw"), bc = p.querySelector("#bx-bc");
    pad.addEventListener("input", function () { p.querySelector("#bx-padv").textContent = pad.value; });
    mar.addEventListener("input", function () { p.querySelector("#bx-marv").textContent = mar.value; });
    rad.addEventListener("input", function () { p.querySelector("#bx-radv").textContent = rad.value; });
    op.addEventListener("input", function () { p.querySelector("#bx-opv").textContent = op.value; });
    liveBind(pad, function () { return "padding"; }, function () { return pad.value + "px"; });
    liveBind(mar, function () { return "margin"; }, function () { return mar.value + "px"; });
    liveBind(rad, function () { return "border-radius"; }, function () { return rad.value + "px"; });
    liveBind(op, function () { return "opacity"; }, function () { return (op.value / 100).toString(); });
    var border = function () { return bw.value + "px solid " + bc.value; };
    liveBind(bw, function () { return "border"; }, border);
    liveBind(bc, function () { return "border"; }, border);
  }

  // TYPOGRAPHY popover
  var FONTS = ["", "system-ui, sans-serif", "Georgia, serif", "'Times New Roman', serif", "'Courier New', monospace", "Inter, sans-serif", "Poppins, sans-serif", "'Playfair Display', serif", "Montserrat, sans-serif", "Oswald, sans-serif", "'Bebas Neue', sans-serif"];
  function buildTypePop(p) {
    if (!sel) { p.innerHTML = '<div class="pop-empty">Click an element first, then reopen Type.</div>'; return; }
    var cs = getComputedStyle(sel);
    var opts = FONTS.map(function (f) { return '<option value="' + f + '">' + (f ? f.split(",")[0].replace(/'/g, "") : "— default —") + '</option>'; }).join("");
    p.innerHTML = '<div class="pop-h">Typography</div>' +
      row("Font", '<select id="ty-ff">' + opts + '</select><button id="ty-ffc" class="mini" title="custom font">+</button>') +
      row("Size", '<input type="range" id="ty-fs" min="8" max="96" value="' + px(cs.fontSize) + '"><b id="ty-fsv">' + px(cs.fontSize) + '</b>') +
      row("Line", '<input type="range" id="ty-lh" min="80" max="280" value="' + Math.round((parseFloat(cs.lineHeight) / parseFloat(cs.fontSize) || 1.4) * 100) + '"><b id="ty-lhv">' + (Math.round((parseFloat(cs.lineHeight) / parseFloat(cs.fontSize) || 1.4) * 100) / 100) + '</b>') +
      row("Spacing", '<input type="range" id="ty-ls" min="-3" max="16" value="' + px(cs.letterSpacing) + '"><b id="ty-lsv">' + px(cs.letterSpacing) + '</b>') +
      row("Align", '<button class="seg" data-al="left">⬅</button><button class="seg" data-al="center">▣</button><button class="seg" data-al="right">➡</button>') +
      '<div class="pop-foot"><button id="ty-copy" class="mini2">⧉ Copy styles</button><button id="ty-paste" class="mini2"' + (copied ? "" : " disabled") + '>📋 Paste styles</button></div>';
    var ff = p.querySelector("#ty-ff"), fs = p.querySelector("#ty-fs"), lh = p.querySelector("#ty-lh"), ls = p.querySelector("#ty-ls");
    fs.addEventListener("input", function () { p.querySelector("#ty-fsv").textContent = fs.value; });
    lh.addEventListener("input", function () { p.querySelector("#ty-lhv").textContent = (lh.value / 100); });
    ls.addEventListener("input", function () { p.querySelector("#ty-lsv").textContent = ls.value; });
    ff.addEventListener("change", function () { styleEdit(sel, "font-family", ff.value); });
    p.querySelector("#ty-ffc").addEventListener("click", function () { var f = window.prompt("CSS font-family value:", cs.fontFamily); if (f) styleEdit(sel, "font-family", f); });
    liveBind(fs, function () { return "font-size"; }, function () { return fs.value + "px"; });
    liveBind(lh, function () { return "line-height"; }, function () { return (lh.value / 100).toString(); });
    liveBind(ls, function () { return "letter-spacing"; }, function () { return ls.value + "px"; });
    p.querySelectorAll(".seg").forEach(function (b) { b.addEventListener("click", function () { styleEdit(sel, "text-align", b.getAttribute("data-al")); }); });
    p.querySelector("#ty-copy").addEventListener("click", copyStyles);
    p.querySelector("#ty-paste").addEventListener("click", pasteStyles);
  }
  var COPY_PROPS = ["color", "background-color", "font-size", "font-weight", "font-family", "font-style", "letter-spacing", "line-height", "text-align", "text-transform", "border-radius"];
  function copyStyles() { if (!need()) return; var cs = getComputedStyle(sel); copied = {}; COPY_PROPS.forEach(function (p) { copied[p] = cs.getPropertyValue(p); }); msg("styles copied ⧉"); }
  function pasteStyles() { if (!need()) return; if (!copied) { msg("copy styles first"); return; } var el = sel, before = {}; COPY_PROPS.forEach(function (p) { before[p] = el.style.getPropertyValue(p); applyVal(el, p, copied[p]); persist(cssPath(el), p, copied[p]); }); msg("styles pasted 📋"); commit(function () { COPY_PROPS.forEach(function (p) { applyVal(el, p, before[p]); persist(cssPath(el), p, before[p]); }); }, function () { COPY_PROPS.forEach(function (p) { applyVal(el, p, copied[p]); persist(cssPath(el), p, copied[p]); }); }); }

  // LINKS & IMAGES popover
  function buildLinkPop(p) {
    if (!sel) { p.innerHTML = '<div class="pop-empty">Click a link, image, or element first.</div>'; return; }
    var link = sel.closest("a,area"); var isImg = sel.tagName.toLowerCase() === "img";
    var html = '<div class="pop-h">Links &amp; images</div>';
    if (link) html += row("Link →", '<input type="text" id="lk-href" value="' + (link.getAttribute("href") || "") + '" placeholder="https://…"><button id="lk-go" class="mini2">Set</button>');
    if (isImg) html += row("Image src", '<input type="text" id="lk-src" value="' + (sel.getAttribute("src") || "") + '" placeholder="https://…/img.jpg"><button id="lk-srcgo" class="mini2">Swap</button>');
    html += row("BG image", '<input type="text" id="lk-bg" placeholder="https://…/bg.jpg"><button id="lk-bggo" class="mini2">Set</button>');
    html += '<div class="pop-foot"><button id="lk-gen" class="mini2 hot">🎨 Generate instead…</button></div>';
    p.innerHTML = html;
    if (link) p.querySelector("#lk-go").addEventListener("click", function () { styleEdit(link, "attr:href", p.querySelector("#lk-href").value.trim()); });
    if (isImg) p.querySelector("#lk-srcgo").addEventListener("click", function () { styleEdit(sel, "attr:src", p.querySelector("#lk-src").value.trim()); });
    p.querySelector("#lk-bggo").addEventListener("click", function () { var u = p.querySelector("#lk-bg").value.trim(); if (u) styleEdit(sel, "background-image", 'url("' + u + '")'); });
    p.querySelector("#lk-gen").addEventListener("click", function () { openPop("gen", document.querySelector('[data-a="gen"]'), buildGenPop); });
  }

  // PAGE navigation popover (auto-discovers same-origin pages)
  function discoverPages() {
    var set = {};
    document.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href"); if (!href || href[0] === "#") return;
      try { var u = new URL(a.href, location.href); if (u.origin !== location.origin) return; var pth = u.pathname; if (/\.(png|jpe?g|gif|svg|pdf|zip|css|js|ico|webp|mp4|woff2?)$/i.test(pth)) return; set[pth] = true; } catch (_) {}
    });
    set[location.pathname] = true;
    return Object.keys(set).sort();
  }
  function buildPagePop(p) {
    var pages = discoverPages();
    var opts = pages.map(function (pth) { return '<option value="' + pth + '"' + (pth === location.pathname ? " selected" : "") + '>' + pth + '</option>'; }).join("");
    p.innerHTML = '<div class="pop-h">Go to page</div>' +
      '<div class="pop-note">' + pages.length + ' page' + (pages.length > 1 ? "s" : "") + ' found via links on this page. Edit mode stays on.</div>' +
      row("Pages", '<select id="pg-sel">' + opts + '</select>') +
      row("Path", '<input type="text" id="pg-path" placeholder="/some/other/page" value="' + location.pathname + '">') +
      '<div class="pop-foot"><button id="pg-go" class="mini2 hot">Go →</button></div>';
    p.querySelector("#pg-sel").addEventListener("change", function (e) { p.querySelector("#pg-path").value = e.target.value; });
    p.querySelector("#pg-go").addEventListener("click", function () { var pth = p.querySelector("#pg-path").value.trim() || "/"; if (pth[0] !== "/") pth = "/" + pth; location.href = pth + "?edit"; });
  }

  // AI GENERATION popover (Phase 2 — POSTs to /v1/site/generate; the Worker holds the keys)
  // fal.ai models offered per kind: [label, slug, approx cost note].
  var GEN_MODELS = {
    image: [["Flux Schnell — fast & cheap", "fal-ai/flux/schnell"], ["Flux Dev — higher quality", "fal-ai/flux/dev"]],
    video: [
      ["Seedance Lite — cheapest (~$0.11/5s)", "fal-ai/bytedance/seedance/v1/lite/text-to-video"],
      ["Wan 2.2 — cheap open-source", "fal-ai/wan/v2.2-a14b/text-to-video"],
      ["Seedance Pro — sharper", "fal-ai/bytedance/seedance/v1/pro/text-to-video"],
      ["Veo 3 — premium + audio (~$0.30/8s)", "fal-ai/veo3"],
    ],
  };
  function genModelOpts(kind) { return GEN_MODELS[kind].map(function (m) { return '<option value="' + m[1] + '">' + m[0] + '</option>'; }).join(""); }
  function buildGenPop(p) {
    var kind = "image";
    p.innerHTML = '<div class="pop-h">Generate media</div>' +
      '<div class="pop-note">fal.ai — applies the result to the selected element. Video takes ~30–90s.</div>' +
      row("Kind", '<button class="seg gk on" data-k="image">🖼 Image</button><button class="seg gk" data-k="video">🎬 Video</button>') +
      row("Model", '<select id="gn-model">' + genModelOpts(kind) + '</select>') +
      '<div class="pr"><textarea id="gn-prompt" placeholder="describe what to generate… e.g. a golden lottery ball bursting with confetti, studio lighting"></textarea></div>' +
      '<div class="pop-foot"><button id="gn-go" class="mini2 hot">✨ Generate</button><span id="gn-stat" class="gn-stat"></span></div>';
    p.querySelectorAll(".gk").forEach(function (b) { b.addEventListener("click", function () { p.querySelectorAll(".gk").forEach(function (x) { x.classList.remove("on"); }); b.classList.add("on"); kind = b.getAttribute("data-k"); p.querySelector("#gn-model").innerHTML = genModelOpts(kind); }); });
    p.querySelector("#gn-go").addEventListener("click", function () {
      var prompt = p.querySelector("#gn-prompt").value.trim(); if (!prompt) { msg("type a prompt first"); return; }
      var model = p.querySelector("#gn-model").value;
      var stat = p.querySelector("#gn-stat"); stat.textContent = "generating… (can take a minute)"; stat.className = "gn-stat busy";
      apiJSON("/v1/site/generate", { pass: pass, path: PATH, kind: kind, prompt: prompt, model: model }).then(function (r) {
        if (!r || r.error) { stat.textContent = "✗ " + ((r && r.error) || "failed"); stat.className = "gn-stat err"; return; }
        if (!r.url) { stat.textContent = "✗ no media returned"; stat.className = "gn-stat err"; return; }
        applyGenerated(kind, r.url); stat.textContent = "✓ applied"; stat.className = "gn-stat ok";
      });
    });
  }
  function applyGenerated(kind, url) {
    if (!sel) { msg("generated, but no element selected — click one and use Link/Img"); return; }
    if (kind === "image") {
      if (sel.tagName.toLowerCase() === "img") styleEdit(sel, "attr:src", url);
      else styleEdit(sel, "background-image", 'url("' + url + '")');
    } else {
      if (sel.tagName.toLowerCase() === "video") styleEdit(sel, "attr:src", url);
      else { var v = document.createElement("video"); v.src = url; v.autoplay = v.muted = v.loop = v.playsInline = true; v.style.maxWidth = "100%"; sel.appendChild(v); msg("video inserted — use Tell Claude to make permanent"); }
    }
  }

  // structural notes ("Tell Claude")
  function openNote(prefill) { var panel = document.getElementById("solara-notepanel"); var np = document.getElementById("np-text"); if (prefill != null) np.value = prefill; panel.hidden = false; np.focus(); var tg = document.getElementById("np-target"); if (tg) tg.textContent = sel ? ("→ <" + sel.tagName.toLowerCase() + ">") : ""; }

  // breadcrumb (ancestor chain; click a crumb to select that ancestor)
  function renderCrumb() {
    var c = document.getElementById("solara-crumb"); if (!c) return;
    if (!sel) { c.innerHTML = '<span class="cr-empty">click an element…</span>'; c._chain = null; return; }
    var chain = [], n = sel;
    while (n && n.nodeType === 1) { chain.unshift(n); if (n.tagName.toLowerCase() === "body") break; n = n.parentNode; }
    chain = chain.slice(-5); c._chain = chain;
    c.innerHTML = chain.map(function (n, i) { return '<button class="cr' + (n === sel ? " cur" : "") + '" data-i="' + i + '">' + n.tagName.toLowerCase() + (n.id ? "#" + n.id : "") + '</button>'; }).join('<span class="cr-sep">›</span>');
  }
  function selectEl(el, silent) { if (sel) sel.classList.remove("solara-sel"); sel = el; if (sel) sel.classList.add("solara-sel"); placeHandle(); markApplied(); renderCrumb(); if (!silent) msg("selected <" + (sel ? sel.tagName.toLowerCase() : "?") + ">"); }

  function duplicate() {
    if (!need()) return;
    var el = sel, clone = el.cloneNode(true); el.parentNode.insertBefore(clone, el.nextSibling);
    msg("duplicated locally — use Tell Claude to make it permanent");
    commit(function () { clone.remove(); }, function () { el.parentNode.insertBefore(clone, el.nextSibling); });
  }

  function rgbToHex(rgb) { var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb || ""); if (!m) return "#888888"; return "#" + [m[1], m[2], m[3]].map(function (n) { n = (+n).toString(16); return n.length === 1 ? "0" + n : n; }).join(""); }

  function init() {
    var bar = document.createElement("div"); bar.id = "solara-editbar";
    bar.innerHTML =
      '<span id="solara-drag" title="drag toolbar">⠿</span>' +
      '<b>SOLARA</b>' +
      '<span id="solara-crumb" class="crumb"><span class="cr-empty">click an element…</span></span>' +
      '<span class="sep"></span>' +
      '<button data-a="undo" title="Undo (⌘Z)">↶</button><button data-a="redo" title="Redo (⌘⇧Z)">↷</button>' +
      '<span class="sep"></span>' +
      '<button data-a="text" title="Edit text">T</button><button data-a="bold" title="Bold"><b>B</b></button>' +
      '<label class="solara-c" title="Text colour"><input type="color" data-a="color"></label>' +
      '<label class="solara-c" title="Background"><input type="color" data-a="bg"></label>' +
      '<span class="sep"></span>' +
      '<button data-a="box" class="grp" title="Spacing &amp; sizing">⊡ Box</button>' +
      '<button data-a="type" class="grp" title="Typography">Aa</button>' +
      '<button data-a="link" class="grp" title="Links &amp; images">🔗</button>' +
      '<button data-a="page" class="grp" title="Go to another page">▤ Page</button>' +
      '<span class="sep"></span>' +
      '<button data-a="move" id="solara-move" title="Drag to move">✥</button>' +
      '<button data-a="dup" title="Duplicate">⧉</button>' +
      '<button data-a="hide" title="Hide">🙈</button>' +
      '<button data-a="delete" class="solara-del" title="Delete">🗑</button>' +
      '<span class="sep"></span>' +
      '<button data-a="book" class="solara-book-btn" title="Effect catalog">✨ Book</button>' +
      '<button data-a="gen" class="solara-gen-btn" title="AI photo / video">🎨 Generate</button>' +
      '<button data-a="note" class="solara-note-btn" title="Structural change request">💬 Tell&nbsp;Claude</button>' +
      '<span class="sep"></span>' +
      '<button data-a="draft" id="solara-draft" title="Stage edits locally; Save flushes them">Draft</button>' +
      '<button data-a="save" class="solara-save" title="Save changes"><span id="solara-status" class="st-saved"></span>Save</button>' +
      '<button data-a="reset" title="Reset selected element">Reset</button>' +
      '<button data-a="collapse" id="solara-collapse" title="Collapse">⊟</button>' +
      '<span id="solara-edit-msg"></span>';
    document.body.appendChild(bar);

    var pop = document.createElement("div"); pop.id = "solara-pop"; document.body.appendChild(pop);
    handle = document.createElement("div"); handle.id = "solara-resize"; handle.style.display = "none"; document.body.appendChild(handle);

    var panel = document.createElement("div"); panel.id = "solara-notepanel"; panel.hidden = true;
    panel.innerHTML = '<div class="np-head">Tell Claude what to change <span id="np-target"></span></div>' +
      '<textarea id="np-text" placeholder="e.g. move pricing above the comparison, make this 2 columns, add a testimonials section…"></textarea>' +
      '<div class="np-row"><button id="np-send">Send to Claude</button><button id="np-close">Close</button></div>';
    document.body.appendChild(panel);

    var IGNORE = "#solara-editbar,#solara-notepanel,#solara-book,#solara-pop,#solara-resize";
    document.body.addEventListener("mouseover", function (e) { if (!e.target.closest(IGNORE)) e.target.classList.add("solara-hl"); });
    document.body.addEventListener("mouseout", function (e) { e.target.classList.remove("solara-hl"); });

    // drag the toolbar
    (function () {
      var dh = document.getElementById("solara-drag"), dx, dy, bx, by, on = false;
      dh.addEventListener("mousedown", function (e) { on = true; dx = e.clientX; dy = e.clientY; var r = bar.getBoundingClientRect(); bx = r.left; by = r.top; bar.style.transition = "none"; e.preventDefault(); });
      window.addEventListener("mousemove", function (e) { if (!on) return; bar.style.left = (bx + e.clientX - dx) + "px"; bar.style.top = (by + e.clientY - dy) + "px"; bar.style.bottom = "auto"; bar.style.transform = "none"; });
      window.addEventListener("mouseup", function () { on = false; });
    })();

    // move (drag selected element)
    var dragging = false, dragged = false, sx, sy, ox, oy, preT;
    document.body.addEventListener("mousedown", function (e) {
      if (e.target.closest(IGNORE) || e.target === handle) return;
      if (moveMode && sel && (e.target === sel || sel.contains(e.target))) { dragging = true; dragged = false; sx = e.clientX; sy = e.clientY; var xy = getXY(sel); ox = xy[0]; oy = xy[1]; preT = sel.style.transform; e.preventDefault(); }
    }, true);
    window.addEventListener("mousemove", function (e) { if (dragging && sel) { dragged = true; setXY(sel, ox + (e.clientX - sx), oy + (e.clientY - sy)); placeHandle(); } });
    window.addEventListener("mouseup", function () {
      if (dragging && sel) { dragging = false; if (dragged) { var s = cssPath(sel), nv = sel.style.transform, el = sel, before = preT; persist(s, "transform", nv); commit(function () { el.style.transform = before; var m = /translate\(([-\d.]+)px,([-\d.]+)px\)/.exec(before || ""); el._tx = m ? +m[1] : 0; el._ty = m ? +m[2] : 0; persist(s, "transform", before); }, function () { el.style.transform = nv; persist(s, "transform", nv); }); } }
    });

    // select on click
    document.body.addEventListener("click", function (e) {
      if (e.target.closest(IGNORE) || e.target === handle) return;
      e.preventDefault(); e.stopPropagation();
      if (dragged) { dragged = false; return; }
      selectEl(e.target);
    }, true);

    // resize handle
    var rz = false, rsx, rsy, rw, rh, preW, preH;
    handle.addEventListener("mousedown", function (e) { if (!sel) return; rz = true; rsx = e.clientX; rsy = e.clientY; var r = sel.getBoundingClientRect(); rw = r.width; rh = r.height; preW = sel.style.width; preH = sel.style.height; e.preventDefault(); e.stopPropagation(); });
    window.addEventListener("mousemove", function (e) { if (rz && sel) { sel.style.width = Math.max(20, rw + (e.clientX - rsx)) + "px"; sel.style.height = Math.max(20, rh + (e.clientY - rsy)) + "px"; placeHandle(); } });
    window.addEventListener("mouseup", function () { if (rz && sel) { rz = false; var s = cssPath(sel), el = sel, nw = sel.style.width, nh = sel.style.height, bw = preW, bh = preH; persist(s, "width", nw); persist(s, "height", nh); commit(function () { applyVal(el, "width", bw); applyVal(el, "height", bh); persist(s, "width", bw); persist(s, "height", bh); }, function () { el.style.width = nw; el.style.height = nh; persist(s, "width", nw); persist(s, "height", nh); }); } });
    window.addEventListener("scroll", placeHandle, true); window.addEventListener("resize", placeHandle);

    // toolbar actions
    bar.addEventListener("click", function (e) {
      var t = e.target.closest("button"); if (!t) return; var a = t.getAttribute("data-a"); if (!a) return;
      if (a === "undo") return doUndo(); if (a === "redo") return doRedo();
      if (a === "move") { moveMode = !moveMode; t.classList.toggle("on", moveMode); msg(moveMode ? "move ON — drag the selected element" : "move off"); return; }
      if (a === "note") { openNote(null); return; }
      if (a === "book") { if (!document.getElementById("solara-book")) buildBook(); else document.getElementById("solara-book").remove(); return; }
      if (a === "box") return openPop("box", t, buildBoxPop);
      if (a === "type") return openPop("type", t, buildTypePop);
      if (a === "link") return openPop("link", t, buildLinkPop);
      if (a === "page") return openPop("page", t, buildPagePop);
      if (a === "gen") return openPop("gen", t, buildGenPop);
      if (a === "dup") return duplicate();
      if (a === "draft") { draft = !draft; t.classList.toggle("on", draft); msg(draft ? "DRAFT mode — edits stage locally; hit Save to publish" : "live mode — edits save instantly"); if (!draft) flush(); return; }
      if (a === "save") { flush(); return; }
      if (a === "collapse") { bar.classList.toggle("collapsed"); t.textContent = bar.classList.contains("collapsed") ? "⊞" : "⊟"; closePop(); return; }
      if (!need()) return; var s = cssPath(sel);
      if (a === "text") { sel.contentEditable = "true"; sel.focus(); var prevTxt = sel.textContent; var ob = function () { sel.contentEditable = "false"; sel.removeEventListener("blur", ob); var nt = sel.textContent; persist(s, "text", nt); var el = sel; commit(function () { el.textContent = prevTxt; persist(s, "text", prevTxt); }, function () { el.textContent = nt; persist(s, "text", nt); }); }; sel.addEventListener("blur", ob); }
      else if (a === "bold") { var w = getComputedStyle(sel).fontWeight; styleEdit(sel, "font-weight", (w === "700" || w === "bold") ? "400" : "700"); }
      else if (a === "hide") { styleEdit(sel, "display", "none"); }
      else if (a === "delete") { if (window.confirm("Delete this element from the page?")) { var ds = cssPath(sel), el = sel, par = sel.parentNode, nxt = sel.nextSibling; el.remove(); sel = null; placeHandle(); renderCrumb(); persist(ds, "remove", "true"); msg("deleted ✓"); commit(function () { par.insertBefore(el, nxt); persist(ds, "remove", ""); }, function () { el.remove(); persist(ds, "remove", "true"); }); } }
      else if (a === "reset") { ["text", "font-size", "color", "background-color", "background-image", "font-weight", "font-family", "line-height", "letter-spacing", "text-align", "display", "transform", "width", "height", "padding", "margin", "border", "border-radius", "opacity", "attr:src", "attr:href", "remove"].forEach(function (p) { persist(s, p, ""); }); sel._tx = sel._ty = 0; msg("reset — reload to see"); }
    });
    bar.querySelector('input[data-a="color"]').addEventListener("input", function (e) { if (need()) styleEdit(sel, "color", e.target.value); });
    bar.querySelector('input[data-a="bg"]').addEventListener("input", function (e) { if (need()) styleEdit(sel, "background-color", e.target.value); });

    document.getElementById("np-close").addEventListener("click", function () { panel.hidden = true; });
    document.getElementById("np-send").addEventListener("click", function () {
      var note = document.getElementById("np-text").value.trim(); if (!note) { msg("type a note first"); return; }
      var selector = sel ? cssPath(sel) : null;
      msg("applying…");
      // Instant path: a fast model turns the request into edit-ops, saved to
      // site_edits (durable + live for everyone) and returned to apply NOW.
      apiJSON("/v1/site/interpret", { pass: pass, path: PATH, selector: selector, note: note, tag: sel ? sel.tagName.toLowerCase() : "", html: sel ? sel.outerHTML.slice(0, 600) : "" }).then(function (r) {
        if (!r || r.error) { msg("failed: " + ((r && r.error) || "error")); return; }
        var ops = r.ops || [];
        ops.forEach(function (op) { try { applyOne(op); } catch (_) {} EDITS.push(op); });
        document.getElementById("np-text").value = ""; panel.hidden = true;
        if (ops.length && r.needsAgent) { api("/v1/site/requests", { pass: pass, path: PATH, selector: selector, note: note }); msg("applied " + ops.length + " instantly ✓ · queued the rest for Opus"); }
        else if (ops.length) { msg("applied instantly ✓ (" + ops.length + " change" + (ops.length > 1 ? "s" : "") + ")"); }
        else if (r.needsAgent) { api("/v1/site/requests", { pass: pass, path: PATH, selector: selector, note: note }); msg("structural change — queued for Opus (~20s)"); }
        else { msg("no change inferred — try rephrasing"); }
      });
    });

    // breadcrumb click → select ancestor
    document.getElementById("solara-crumb").addEventListener("click", function (e) {
      var b = e.target.closest(".cr"); if (!b) return; var c = document.getElementById("solara-crumb"); if (!c._chain) return;
      var el = c._chain[+b.getAttribute("data-i")]; if (el) selectEl(el);
    });

    document.addEventListener("keydown", function (e) { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") { e.preventDefault(); if (e.shiftKey) doRedo(); else doUndo(); } });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
