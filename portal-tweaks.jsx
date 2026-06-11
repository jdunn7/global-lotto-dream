// portal-tweaks.jsx — Tweaks panel for the PLG Affiliate Portal.
// Mounts in its own React root and applies a view scale to the shell.
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "viewScale": 100
}/*EDITMODE-END*/;

function applyViewScale(pct) {
  const v = Math.max(50, Math.min(100, pct)) / 100;
  const shell = document.querySelector(".shell");
  if (!shell) return;
  // `zoom` scales layout cleanly (reflows scrollbars/clicks correctly)
  shell.style.zoom = v;
  // compensate height so the zoomed shell + sidebar still fill the viewport
  const fill = (100 / v).toFixed(2) + "vh";
  shell.style.minHeight = fill;
  const side = document.querySelector(".side");
  if (side) side.style.height = fill;
}

function PortalTweaks() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  React.useEffect(() => { applyViewScale(t.viewScale); }, [t.viewScale]);
  return (
    <TweaksPanel>
      <TweakSection label="Display" />
      <TweakSlider label="View scale" value={t.viewScale} min={50} max={100} step={5} unit="%"
        onChange={(v) => setTweak("viewScale", v)} />
    </TweaksPanel>
  );
}

// apply the default immediately (before tweaks mode is ever opened)
(function () {
  function boot() {
    applyViewScale(TWEAK_DEFAULTS.viewScale);
    const mount = document.createElement("div");
    mount.id = "tweaks-root";
    document.body.appendChild(mount);
    ReactDOM.createRoot(mount).render(<PortalTweaks />);
  }
  // wait for the portal's .shell to exist
  let tries = 0;
  const iv = setInterval(() => {
    if (document.querySelector(".shell") || tries++ > 40) { clearInterval(iv); boot(); }
  }, 80);
})();
