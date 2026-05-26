/* ============================================
   YIELD VIBING — v2 right rail + main App
   ============================================ */

const { useState: useS, useEffect: useE, useRef: useR } = React;

/* ---------- Right rail panels ---------- */
const WalletPanel = ({ phase, address }) => {
  if (phase === "none") {
    return (
      <div className="panel">
        <div className="panel-head">
          <div className="panel-title">Wallet</div>
          <span className="panel-meta">not connected</span>
        </div>
        <div className="empty">— belum connect</div>
      </div>
    );
  }
  const isSmart = phase === "upgraded";
  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">Wallet</div>
        <span className="panel-meta">{isSmart ? "smart account" : "eoa"}</span>
      </div>
      <div className="wallet-row">
        <div>
          <div className="wallet-addr">{shortAddr(address)}</div>
          <div className={`wallet-type ${isSmart ? "active" : ""}`}>
            {isSmart ? "eip-7702 active" : "regular eoa"}
          </div>
        </div>
        <div className="wallet-actions">
          <button className="wallet-action" title="copy" aria-label="copy"><Icon name="copy" /></button>
          <button className="wallet-action" title="etherscan" aria-label="etherscan"><Icon name="external" /></button>
          <button className="wallet-action" title="disconnect" aria-label="disconnect"><Icon name="logout" /></button>
        </div>
      </div>
      <div className="balance-row">
        <div className="balance-cell">
          <div className="label">USDC</div>
          <div className="val tnum">2,481<span className="unit">.32</span></div>
        </div>
        <div className="balance-cell">
          <div className="label">Sepolia ETH</div>
          <div className="val tnum">0.18<span className="unit">ETH</span></div>
        </div>
      </div>
    </div>
  );
};

const PermissionPanel = ({ active, amount, onRevoke }) => {
  return (
    <div className="panel">
      <div className="panel-head">
        <div className="panel-title">Active permission</div>
        <span className="panel-meta">erc-7715</span>
      </div>
      <div className={`perm-status ${active ? "active" : ""}`}>
        {active ? "permission active · 23h 59m" : "no active permission"}
      </div>
      {active && (
        <>
          <div className="perm-detail">
            <div className="perm-detail-row">
              <span className="k">action</span>
              <span className="v">vault-deposit</span>
            </div>
            <div className="perm-detail-row">
              <span className="k">max</span>
              <span className="v">{amount || 100} USDC</span>
            </div>
            <div className="perm-detail-row">
              <span className="k">vault</span>
              <span className="v">{RECOMMENDATION.addr.slice(0, 8)}…{RECOMMENDATION.addr.slice(-4)}</span>
            </div>
          </div>
          <button className="perm-revoke" onClick={onRevoke}>
            revoke permission
          </button>
        </>
      )}
    </div>
  );
};

const ActivityPanel = ({ logs }) => {
  return (
    <div className="panel" style={{ borderBottom: "none", flex: 1 }}>
      <div className="panel-head">
        <div className="panel-title">Activity</div>
        <span className="panel-meta">realtime</span>
      </div>
      {logs.length === 0 ? (
        <div className="empty">no events yet</div>
      ) : (
        <div className="activity">
          {logs.slice().reverse().map((l) => (
            <div key={l.id} className="act-row">
              <div>
                <div className="act-title">{l.title}</div>
                <div className="act-meta">{l.meta}</div>
              </div>
              <span className="act-time">{l.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ---------- Palette picker (custom — restrained) ---------- */
const PALETTES = [
  { id: "acid-yield", name: "Acid Yield", swatch: ["#cfff3d", "#1a1b16", "#ecebe1"], desc: "Default · warm dark + acid lime" },
  { id: "mono-slate", name: "Mono Slate", swatch: ["#e6edff", "#16182e", "#e8ebf3"], desc: "Refined · cool slate, no chroma" },
  { id: "liquid-mint", name: "Liquid Mint", swatch: ["#5ee6c5", "#11201b", "#ecebe1"], desc: "Teal undertone · mint accent" },
  { id: "bone-paper", name: "Bone Paper", swatch: ["#1a180f", "#e3dfd2", "#f4f1e9"], desc: "Light · editorial paper feel" },
];

const PalettePicker = ({ value, onChange }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
    {PALETTES.map((p) => {
      const on = p.id === value;
      return (
        <button
          key={p.id}
          type="button"
          onClick={() => onChange(p.id)}
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr auto",
            alignItems: "center",
            gap: 10,
            padding: "7px 9px",
            border: on ? ".5px solid rgba(0,0,0,.35)" : ".5px solid rgba(0,0,0,.08)",
            borderRadius: 7,
            background: on ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.4)",
            cursor: "default",
            textAlign: "left",
            font: "inherit",
            color: "inherit",
          }}
        >
          <div style={{ display: "flex", gap: 2 }}>
            {p.swatch.map((c, i) => (
              <span key={i} style={{
                width: 12, height: 12, borderRadius: 3,
                background: c, border: ".5px solid rgba(0,0,0,.1)",
              }} />
            ))}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 500, fontSize: 11.5 }}>{p.name}</div>
            <div style={{ fontSize: 10, color: "rgba(41,38,27,.55)", marginTop: 1, lineHeight: 1.3 }}>
              {p.desc}
            </div>
          </div>
          <span style={{ fontSize: 11, color: on ? "rgba(41,38,27,.7)" : "transparent" }}>✓</span>
        </button>
      );
    })}
  </div>
);

/* ---------- Tweak defaults ---------- */
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "acid-yield",
  "density": "comfortable",
  "speed": "medium"
}/*EDITMODE-END*/;

const SPEED_MS = { fast: 220, medium: 600, slow: 1100 };
const MOCK_ADDR = "0xA36f3c8e2B7f124d9a8E4D2F1C5b7e0d8a9b126a4";

/* ---------- App ---------- */
const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const [stage, setStage] = useS("input");
  const [amount, setAmount] = useS("100");
  const [risk, setRisk] = useS("low");

  const [aiPhase, setAiPhase] = useS(0); // 0..2 active step idx, 99 = done
  const [connectPhase, setConnectPhase] = useS("idle");
  const [permPhase, setPermPhase] = useS("idle");
  const [permActive, setPermActive] = useS(false);
  const [execState, setExecState] = useS([{ status: "idle" }, { status: "idle" }, { status: "idle" }]);
  const [logs, setLogs] = useS([]);
  const logIdRef = useR(0);

  useE(() => {
    document.documentElement.dataset.palette = tweaks.palette;
    document.documentElement.dataset.density = tweaks.density;
  }, [tweaks.palette, tweaks.density]);

  const speed = SPEED_MS[tweaks.speed] || SPEED_MS.medium;

  const addLog = (entry) => {
    logIdRef.current += 1;
    setLogs((l) => [...l, { id: logIdRef.current, time: "just now", ...entry }]);
  };

  /* ----- Flow handlers ----- */
  const handleSubmitPreference = () => {
    setStage("recommend");
    setAiPhase(0);
    addLog({ title: "Venice AI query started", meta: `${amount} usdc · ${risk} risk` });
  };

  useE(() => {
    if (stage !== "recommend" || aiPhase === 99) return;
    if (aiPhase < 2) {
      const t = setTimeout(() => setAiPhase((p) => p + 1), speed * 1.2);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setAiPhase(99);
      addLog({ title: "Recommendation ready", meta: "mockvault usdc · 8.2% apy" });
    }, speed * 1.5);
    return () => clearTimeout(t);
  }, [stage, aiPhase, speed]);

  const handleAcceptRecommendation = () => {
    setStage("connect");
    setConnectPhase("idle");
  };

  const handleConnect = () => {
    setConnectPhase("connecting");
    setTimeout(() => {
      setConnectPhase("connected");
      addLog({ title: "MetaMask connected", meta: shortAddr(MOCK_ADDR) });
    }, speed * 1.4);
  };

  const handleUpgrade = () => {
    setConnectPhase("upgrading");
    setTimeout(() => {
      setConnectPhase("upgraded");
      addLog({ title: "EIP-7702 authorization confirmed", meta: `tx ${shortAddr(fakeHash())} · 1shot` });
    }, speed * 1.8);
  };

  const handleConnectDone = () => {
    setStage("permission");
    setPermPhase("idle");
  };

  const handleGrant = () => setPermPhase("prompting");

  const handlePermConfirm = () => {
    setPermPhase("idle");
    setPermActive(true);
    addLog({ title: "ERC-7715 permission granted", meta: `vault-deposit · ${amount} usdc max` });
    setTimeout(() => {
      setStage("execute");
      startExecution();
    }, 600);
  };

  const startExecution = () => {
    setExecState([{ status: "idle" }, { status: "idle" }, { status: "idle" }]);
    runStep(0);
  };

  const runStep = (i) => {
    if (i >= EXEC_STEPS.length) return;
    setExecState((prev) => prev.map((s, idx) => (idx === i ? { status: "pending" } : s)));
    addLog({ title: `${EXEC_STEPS[i].title} broadcasting`, meta: "via 1shot · gas 0" });
    setTimeout(() => {
      const hash = fakeHash();
      setExecState((prev) => prev.map((s, idx) => (idx === i ? { status: "done", hash } : s)));
      addLog({ title: `${EXEC_STEPS[i].title} confirmed`, meta: `tx ${shortAddr(hash)}` });
      runStep(i + 1);
    }, speed * 1.8);
  };

  const handleExecDone = () => {
    setStage("done");
    addLog({ title: "Vault position opened", meta: `${amount} usdc · 8.2% apy` });
  };

  const handleAgain = () => {
    setStage("input");
    setAiPhase(0);
    setExecState([{ status: "idle" }, { status: "idle" }, { status: "idle" }]);
  };

  const handleRevoke = () => {
    setPermActive(false);
    addLog({ title: "Permission revoked", meta: "agent execution halted" });
  };

  const jumpTo = (id) => {
    if (id === "input") {
      setStage("input");
      setAiPhase(0);
      setConnectPhase("idle");
      setPermActive(false);
      setExecState([{ status: "idle" }, { status: "idle" }, { status: "idle" }]);
      return;
    }
    if (id === "recommend") { setStage("recommend"); setAiPhase(99); return; }
    if (id === "connect") { setStage("connect"); setConnectPhase("idle"); return; }
    if (id === "permission") { setStage("permission"); setPermPhase("idle"); setConnectPhase("upgraded"); return; }
    if (id === "execute") { setStage("execute"); setConnectPhase("upgraded"); setPermActive(true); startExecution(); return; }
    if (id === "done") {
      setStage("done");
      setConnectPhase("upgraded");
      setPermActive(true);
      setExecState([
        { status: "done", hash: fakeHash() },
        { status: "done", hash: fakeHash() },
        { status: "done", hash: fakeHash() },
      ]);
    }
  };

  const renderStage = () => {
    switch (stage) {
      case "input":
        return <InputScreen amount={amount} setAmount={setAmount} risk={risk} setRisk={setRisk} onSubmit={handleSubmitPreference} />;
      case "recommend":
        return aiPhase < 99
          ? <ThinkingCard phase={aiPhase} />
          : <RecommendCard onProceed={handleAcceptRecommendation} />;
      case "connect":
        return <ConnectCard phase={connectPhase} onConnect={handleConnect} onUpgrade={handleUpgrade} onDone={handleConnectDone} />;
      case "permission":
        return <PermissionCard amount={amount} phase={permPhase} onGrant={handleGrant} onConfirm={handlePermConfirm} />;
      case "execute":
        return <ExecCard amount={amount} execState={execState} onDone={handleExecDone} />;
      case "done":
        return <SuccessCard amount={amount} onAgain={handleAgain} />;
      default:
        return null;
    }
  };

  const walletPhase =
    connectPhase === "idle" || connectPhase === "connecting" ? "none" :
    connectPhase === "upgraded" ? "upgraded" : "eoa";

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <TopBar walletConnected={walletPhase !== "none"} />
        <StepRail stage={stage} />
        <div className="stage" key={stage}>
          {renderStage()}
        </div>
      </main>
      <aside className="rail">
        <WalletPanel phase={walletPhase} address={MOCK_ADDR} />
        <PermissionPanel active={permActive} amount={amount} onRevoke={handleRevoke} />
        <ActivityPanel logs={logs} />
      </aside>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Brand palette" />
        <PalettePicker value={tweaks.palette} onChange={(v) => setTweak("palette", v)} />

        <TweakSection label="Demo speed" />
        <TweakRadio
          label="Speed"
          value={tweaks.speed}
          options={[
            { value: "fast", label: "Fast" },
            { value: "medium", label: "Med" },
            { value: "slow", label: "Slow" },
          ]}
          onChange={(v) => setTweak("speed", v)}
        />

        <TweakSection label="Density" />
        <TweakRadio
          label="Layout"
          value={tweaks.density}
          options={[
            { value: "comfortable", label: "Comfy" },
            { value: "compact", label: "Compact" },
          ]}
          onChange={(v) => setTweak("density", v)}
        />

        <TweakSection label="Jump to step" />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => jumpTo(s.id)}
              style={{
                appearance: "none",
                border: ".5px solid rgba(0,0,0,.08)",
                borderRadius: 6,
                background: stage === s.id ? "rgba(0,0,0,.08)" : "rgba(255,255,255,.4)",
                color: "inherit",
                font: "inherit",
                fontSize: 10.5,
                fontWeight: stage === s.id ? 600 : 500,
                padding: "6px 8px",
                textAlign: "left",
                cursor: "default",
                letterSpacing: "-0.01em",
              }}
            >
              <span style={{ color: "rgba(41,38,27,.45)", marginRight: 5, fontFamily: "ui-monospace, monospace" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              {s.label}
            </button>
          ))}
        </div>
      </TweaksPanel>
    </div>
  );
};

Object.assign(window, { App, WalletPanel, PermissionPanel, ActivityPanel, MOCK_ADDR, PALETTES, PalettePicker });
