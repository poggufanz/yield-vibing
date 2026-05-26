/* ============================================
   YIELD VIBING — v2 shared components & icons
   ============================================ */

/* ---------- Icons (Lucide-style, stroke 1.5) ---------- */
const Icon = ({ name, size = 16, className = "" }) => {
  const paths = {
    home: <><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1V9.5z" /></>,
    grid: <><rect x="3" y="3" width="7" height="7" rx="1.2" /><rect x="14" y="3" width="7" height="7" rx="1.2" /><rect x="3" y="14" width="7" height="7" rx="1.2" /><rect x="14" y="14" width="7" height="7" rx="1.2" /></>,
    layers: <><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></>,
    bell: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
    refresh: <><path d="M21 12a9 9 0 1 1-3-6.7L21 8" /><path d="M21 3v5h-5" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M5 12h14M13 5l7 7-7 7" /></>,
    check: <><path d="M20 6L9 17l-5-5" /></>,
    x: <><path d="M18 6L6 18M6 6l12 12" /></>,
    copy: <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
    external: <><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6" /><path d="M10 14L21 3" /></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>,
    chev: <><path d="M9 6l6 6-6 6" /></>,
    chevDown: <><path d="M6 9l6 6 6-6" /></>,
  };
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {paths[name] || null}
    </svg>
  );
};

/* ---------- Sidebar (minimal, no active-bar gimmick) ---------- */
const Sidebar = () => {
  const items = [
    { key: "home", icon: "home" },
    { key: "vaults", icon: "grid", active: true },
    { key: "history", icon: "layers" },
    { key: "settings", icon: "settings" },
  ];
  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="sb-logo" title="yield/vibing">y/</div>
      {items.map((it) => (
        <button key={it.key} className={`sb-item ${it.active ? "active" : ""}`} title={it.key} aria-label={it.key}>
          <Icon name={it.icon} />
        </button>
      ))}
      <div className="sb-spacer" />
      <button className="sb-item" title="notifications" aria-label="notifications">
        <Icon name="bell" />
      </button>
    </nav>
  );
};

/* ---------- Top bar — minimal, no chip soup ---------- */
const TopBar = ({ walletConnected }) => {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="brand">
          <span>yield</span>
          <span className="slash">/</span>
          <span className="vibing">vibing</span>
        </div>
        <span className="brand-net mono">
          <span className="dot" />sepolia
        </span>
      </div>
      <div className="topbar-right">
        <span className="topbar-meta">
          relayer&nbsp;<b>1Shot</b>&nbsp;·&nbsp;gas&nbsp;<b>0</b>
        </span>
        <button className="icon-btn" title="refresh" aria-label="refresh"><Icon name="refresh" /></button>
        <button className="icon-btn" title="new deposit" aria-label="new deposit"><Icon name="plus" /></button>
      </div>
    </header>
  );
};

/* ---------- Step rail (subtle numeric, no wizard chrome) ---------- */
const STEPS = [
  { id: "input", label: "Preferensi" },
  { id: "recommend", label: "AI Rekomendasi" },
  { id: "connect", label: "Connect & Upgrade" },
  { id: "permission", label: "Permission" },
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
          <div key={s.id} className={`step-rail-item ${state}`}>
            <span className="num">{String(i + 1).padStart(2, "0")}</span>
            <span>{s.label}</span>
          </div>
        );
      })}
    </div>
  );
};

Object.assign(window, {
  Icon, Sidebar, TopBar, StepRail, STEPS,
});
