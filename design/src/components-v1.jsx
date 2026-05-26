/* ============================================
   YIELD VIBING — Shared components & icons
   ============================================ */

/* ---------- Icons (Lucide-style stroke 1.5) ---------- */
const Icon = ({ name, size = 16, className = "" }) => {
  const paths = {
    home: <><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.2" /><rect x="14" y="3" width="7" height="7" rx="1.2" /><rect x="3" y="14" width="7" height="7" rx="1.2" /><rect x="14" y="14" width="7" height="7" rx="1.2" /></>,
    layers: <><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
    bell: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    refresh: <><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    expand: <><path d="M9 3H5a2 2 0 0 0-2 2v4" /><path d="M21 9V5a2 2 0 0 0-2-2h-4" /><path d="M3 15v4a2 2 0 0 0 2 2h4" /><path d="M15 21h4a2 2 0 0 0 2-2v-4" /></>,
    arrow: <><path d="M5 12h14M13 5l7 7-7 7" /></>,
    arrowDown: <><path d="M12 5v14M5 13l7 7 7-7" /></>,
    arrowUp: <><path d="M12 19V5M5 11l7-7 7 7" /></>,
    check: <><path d="M20 6L9 17l-5-5" /></>,
    checkCircle: <><circle cx="12" cy="12" r="10" /><path d="M9 12l2 2 4-4" /></>,
    x: <><path d="M18 6L6 18M6 6l12 12" /></>,
    shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
    shieldCheck: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="M9 12l2 2 4-4" /></>,
    lock: <><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></>,
    sparkles: <><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" /><path d="M19 14l.8 2.5L22 17l-2.2.5L19 20l-.8-2.5L16 17l2.2-.5L19 14z" /><path d="M5 17l.6 1.8L7 19l-1.4.2L5 21l-.6-1.8L3 19l1.4-.2L5 17z" /></>,
    bolt: <><path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" /></>,
    swap: <><path d="M7 4v16M3 8l4-4 4 4" /><path d="M17 20V4M13 16l4 4 4-4" /></>,
    wallet: <><rect x="2" y="6" width="20" height="14" rx="2" /><path d="M16 14h2" /><path d="M2 10h20" /></>,
    coin: <><circle cx="12" cy="12" r="9" /><path d="M14.5 9.5h-3a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-3" /><path d="M12 8v8" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14L21 3" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
    download: <><path d="M12 3v12" /><path d="M7 10l5 5 5-5" /><path d="M5 21h14" /></>,
    upload: <><path d="M12 21V9" /><path d="M7 14l5-5 5 5" /><path d="M5 3h14" /></>,
    chart: <><path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 6-6" /></>,
    coffee: <><path d="M17 8h1a4 4 0 0 1 0 8h-1" /><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" /><path d="M6 2v3M10 2v3M14 2v3" /></>,
    info: <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>,
    chev: <><path d="M9 6l6 6-6 6" /></>,
    triangle: <><path d="M12 2L2 22h20L12 2z" /></>,
    pulse: <><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></>,
    target: <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
    timer: <><circle cx="12" cy="13" r="8" /><path d="M12 9v4l2 2" /><path d="M9 2h6" /></>,
    cap: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name] || null}
    </svg>
  );
};

/* ---------- Sidebar ---------- */
const Sidebar = ({ stage }) => {
  const items = [
    { key: "home", icon: "home" },
    { key: "vaults", icon: "grid", active: true },
    { key: "history", icon: "layers" },
    { key: "settings", icon: "settings" },
  ];
  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="sb-logo" title="YIELD VIBING">Y</div>
      {items.map((it) => (
        <div key={it.key} className={`sb-item ${it.active ? "active" : ""}`} title={it.key}>
          <Icon name={it.icon} />
        </div>
      ))}
      <div className="sb-spacer" />
      <div className="sb-item" title="notifications">
        <Icon name="bell" />
      </div>
    </nav>
  );
};

/* ---------- Top bar ---------- */
const TopBar = ({ stage, walletConnected }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand">
          yield<span className="slash">/</span><span className="vibing">vibing</span>
        </div>
        <span className="chip">
          <span className="chip-dot violet" />
          Sepolia · Testnet
        </span>
        <span className="chip">
          <span className="chip-dot" />
          1Shot Relayer · Online
        </span>
        {walletConnected && (
          <span className="chip">
            <span className="chip-dot amber" />
            Gas paid by relayer
          </span>
        )}
      </div>
      <div className="topbar-right">
        <button className="icon-btn" title="Refresh"><Icon name="refresh" /></button>
        <button className="icon-btn" title="New deposit"><Icon name="plus" /></button>
        <button className="icon-btn" title="Fullscreen"><Icon name="expand" /></button>
      </div>
    </header>
  );
};

/* ---------- Step rail (top of stage) ---------- */
const STEPS = [
  { id: "input", label: "Preferensi" },
  { id: "recommend", label: "AI Rekomendasi" },
  { id: "connect", label: "Connect & Upgrade" },
  { id: "permission", label: "Grant Permission" },
  { id: "execute", label: "Auto-Execute" },
  { id: "done", label: "Selesai" },
];

const StepRail = ({ stage }) => {
  const idx = STEPS.findIndex((s) => s.id === stage);
  return (
    <div className="step-rail" role="progressbar" aria-valuenow={idx + 1} aria-valuemax={STEPS.length}>
      {STEPS.map((s, i) => {
        const state = i < idx ? "done" : i === idx ? "active" : "idle";
        return (
          <React.Fragment key={s.id}>
            <div className={`step-rail-item ${state}`}>
              <span className="step-rail-num">{state === "done" ? <Icon name="check" size={10} /> : String(i + 1).padStart(2, "0")}</span>
              <span>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className="step-rail-sep" />}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* Export to window for cross-file scope */
Object.assign(window, {
  Icon, Sidebar, TopBar, StepRail, STEPS,
});
