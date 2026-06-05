// reveal.js — smooth scroll + medium, smooth scroll-reveal transitions.
// Fail-safe: content is only hidden AFTER this runs and arms <html>; if JS
// never runs (or reduced-motion), everything stays fully visible.
(function () {
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // smooth scrolling everywhere
  try { document.documentElement.style.scrollBehavior = "smooth"; } catch (e) {}
  if (reduce) return;

  var SEL = [
    "[data-reveal]",
    ".vsec", ".vcard", ".loop-card", ".vstat",
    ".dash-card", ".kpi", ".tool-card", ".wire-frame", ".banner",
    ".bio-feat", ".ref-stat", ".trust", ".game-card"
  ].join(",");

  var css = document.createElement("style");
  css.textContent =
    "html.reveal-ready .reveal{opacity:0;transform:translateY(22px);" +
    "transition:opacity .62s cubic-bezier(.16,1,.3,1),transform .62s cubic-bezier(.16,1,.3,1);will-change:opacity,transform;}" +
    "html.reveal-ready .reveal.reveal-in{opacity:1;transform:none;}";
  document.head.appendChild(css);
  document.documentElement.classList.add("reveal-ready");

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        // gentle stagger among siblings revealing together
        var sibs = en.target.parentNode ? Array.prototype.indexOf.call(en.target.parentNode.children, en.target) : 0;
        en.target.style.transitionDelay = Math.min(sibs % 6, 5) * 55 + "ms";
        en.target.classList.add("reveal-in");
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -7% 0px" });

  function arm(root) {
    var nodes = (root || document).querySelectorAll(SEL);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      if (n.__revArmed) continue;
      n.__revArmed = true;
      n.classList.add("reveal");
      // if already in view on load, reveal on next frame (no flash)
      io.observe(n);
    }
  }

  function boot() {
    arm(document);
    // React renders after mount — re-scan as the DOM fills in
    var mo = new MutationObserver(function (muts) {
      for (var i = 0; i < muts.length; i++) { if (muts[i].addedNodes.length) { arm(document); break; } }
    });
    mo.observe(document.body, { childList: true, subtree: true });
    // safety: stop re-scanning after the app has settled
    setTimeout(function () { mo.disconnect(); }, 8000);
    // absolute fail-safe: nothing should stay hidden
    setTimeout(function () {
      document.querySelectorAll(".reveal:not(.reveal-in)").forEach(function (n) {
        var r = n.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) n.classList.add("reveal-in");
      });
    }, 1200);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
