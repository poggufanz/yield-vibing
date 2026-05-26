/* ============================================
   YIELD VIBING — Screens
   ============================================ */

const { useState, useEffect, useRef } = React;

/* ---------- Helpers ---------- */
const shortAddr = (a) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";
const fakeHash = () => "0x" + Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

const RISK_OPTIONS = [
  { id: "low", label: "Low", sub: "Stable · Capital pres." },
  { id: "med", label: "Medium", sub: "Balanced yield" },
  { id: "high", label: "High", sub: "Aggressive · Volat." },
];

/* ---------- Screen 1: Input (Venice AI preference) ---------- */
const InputScreen = ({ amount, setAmount, risk, setRisk, onSubmit }) => {
  const valid = Number(amount) > 0 && risk;
  return (
    <section className="hero slide-up">
      <div className="hero-grain" />
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="num">01</span> · Mulai Vibing
        </div>
        <h1 className="hero-title">
          Set deposit kamu — biar <em>agent yang ribet</em>, kamu cuma tinggal approve sekali.
        </h1>
        <p className="hero-sub">
          Venice AI bakal nyariin vault yang cocok sama profil risiko kamu. Tidak ada data yang disimpan,
          tidak ada gas yang kamu bayar — semua relay lewat 1Shot.
        </p>

        <div className="form-grid">
          <div className="field">
            <label className="field-label">Jumlah</label>
            <div className="amount-input">
              <input
                type="number"
                placeholder="100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                aria-label="Jumlah USDC"
              />
              <span className="ticker">USDC</span>
            </div>
          </div>

          <div className="field">
            <label className="field-label">Risk Profile</label>
            <div className="risk-group" role="radiogroup">
              {RISK_OPTIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  role="radio"
                  aria-checked={risk === r.id}
                  className={`risk-opt ${risk === r.id ? "selected" : ""}`}
                  onClick={() => setRisk(r.id)}
                >
                  <span className="risk-opt-label">{r.label}</span>
                  <span className="risk-opt-sub">{r.sub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="form-foot">
          <div className="privacy-note">
            <span className="v-badge"><Icon name="sparkles" size={12} /> Venice AI</span>
            <span>Privacy-first · No data retention</span>
          </div>
          <button className="btn btn-primary btn-lg" disabled={!valid} onClick={onSubmit}>
            Dapatkan Rekomendasi <Icon name="arrow" size={16} className="arrow" />
          </button>
        </div>
      </div>
    </section>
  );
};

/* ---------- Screen 2a: AI thinking ---------- */
const ThinkingCard = ({ phase }) => {
  const messages = [
    "Memindai 24 vault aktif di Sepolia…",
    "Menganalisa APY, TVL, dan risk score…",
    "Mencocokkan dengan profil risiko kamu…",
  ];
  return (
    <section className="thinking slide-up">
      <div className="thinking-icon">
        <Icon name="sparkles" size={22} />
      </div>
      <div>
        <div className="thinking-text">Venice AI lagi mikir<span className="dots"><span /><span /><span /></span></div>
        <div className="thinking-sub mono">{messages[phase] || messages[0]}</div>
      </div>
    </section>
  );
};

/* ---------- Screen 2b: AI Recommendation ---------- */
const RECOMMENDATION = {
  vault: "MockVault USDC · Conservative",
  addr: "0xABCD7e8F3a2c91D5e6f0B842c1234567890aBcDe",
  apy: "8.2",
  tvl: "12.4",
  risk: "Low",
  reasoning: (
    <>
      Vault ini pakai strategi <b>lending konservatif</b> ke Aave v3 USDC pool — return-nya stabil,
      drawdown historis &lt; 2%, dan <b>TVL $12.4M</b> jadi likuiditas exit-nya aman.
      Cocok banget buat profil <b>Low risk</b> kamu.
    </>
  ),
  tags: ["Aave v3", "Lending", "Single-asset", "Audited"],
};

const RecommendCard = ({ onProceed }) => {
  return (
    <section className="ai-card slide-up">
      <div className="ai-card-head">
        <div className="ai-card-eyebrow">
          <span className="pulse" />
          Venice AI · Rekomendasi · 4.2s
        </div>
        <span className="chip">
          <Icon name="shield" size={11} /> Private inference
        </span>
      </div>

      <div className="ai-card-grid">
        <div>
          <div className="vault-name">{RECOMMENDATION.vault}</div>
          <div className="vault-addr mono">{RECOMMENDATION.addr}</div>
          <p className="reasoning">{RECOMMENDATION.reasoning}</p>
          <div className="tag-row">
            {RECOMMENDATION.tags.map((t, i) => (
              <span key={i} className={`tag ${i === 0 ? "strategy" : ""}`}>{t}</span>
            ))}
          </div>
        </div>

        <div className="stat-grid">
          <div className="stat accent">
            <div className="stat-label">APY</div>
            <div className="stat-val">{RECOMMENDATION.apy}<span className="unit">%</span></div>
          </div>
          <div className="stat">
            <div className="stat-label">TVL</div>
            <div className="stat-val">${RECOMMENDATION.tvl}<span className="unit">M</span></div>
          </div>
          <div className="stat">
            <div className="stat-label">Risk Score</div>
            <div className="stat-val">2.1<span className="unit">/10</span></div>
          </div>
          <div className="stat">
            <div className="stat-label">Drawdown 1y</div>
            <div className="stat-val">−1.8<span className="unit">%</span></div>
          </div>
        </div>
      </div>

      <div className="ai-card-foot">
        <div className="privacy-note">
          <Icon name="info" size={13} /> Data vault dummy untuk demo · APY mock
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost">Lihat alternatif</button>
          <button className="btn btn-primary" onClick={onProceed}>
            Lanjut · Connect Wallet <Icon name="arrow" size={16} className="arrow" />
          </button>
        </div>
      </div>
    </section>
  );
};

/* ---------- Screen 3: Connect & EIP-7702 upgrade ---------- */
const ConnectCard = ({ phase, onConnect, onUpgrade, onDone }) => {
  // phases: idle | connecting | connected | upgrading | upgraded
  return (
    <section className="hero slide-up">
      <div className="hero-grain" />
      <div className="hero-content">
        <div className="hero-eyebrow">
          <span className="num">03</span> · Connect & Upgrade
        </div>
        <h1 className="hero-title">
          Upgrade EOA kamu ke <em>Smart Account</em> via EIP-7702.
        </h1>
        <p className="hero-sub">
          MetaMask kamu masih EOA biasa. Kita bakal upgrade akunnya pakai EIP-7702 authorization —
          satu signature, smart account langsung aktif. Aman, reversible, dan tetap di wallet yang sama.
        </p>

        {phase === "idle" && (
          <div className="form-foot" style={{ marginTop: 32 }}>
            <div className="privacy-note">
              <Icon name="info" size={13} /> Pastikan MetaMask kamu di network Sepolia testnet.
            </div>
            <button className="btn btn-primary btn-lg" onClick={onConnect}>
              <Icon name="wallet" size={16} /> Connect MetaMask
            </button>
          </div>
        )}

        {phase === "connecting" && (
          <ConnectingPanel label="Membuka MetaMask…" sub="Approve permintaan koneksi di MetaMask popup" />
        )}

        {phase === "connected" && (
          <UpgradePrompt onUpgrade={onUpgrade} />
        )}

        {phase === "upgrading" && (
          <ConnectingPanel
            label="EIP-7702 authorization in-flight…"
            sub="Menunggu signature · 1Shot Relayer broadcasting tx"
          />
        )}

        {phase === "upgraded" && (
          <UpgradedPanel onDone={onDone} />
        )}
      </div>
    </section>
  );
};

const ConnectingPanel = ({ label, sub }) => (
  <div className="mm-pop" style={{ marginTop: 28 }}>
    <div className="mm-pop-head">
      <div className="mm-fox">🦊</div>
      <div>
        <div className="mm-name">MetaMask · Sepolia</div>
      </div>
    </div>
    <div className="flex gap-3 items-center">
      <div className="spinner-ring" />
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 500 }}>{label}</div>
        <div className="mm-body" style={{ marginTop: 2 }}>{sub}</div>
      </div>
    </div>
  </div>
);

const UpgradePrompt = ({ onUpgrade }) => (
  <>
    <div className="mm-pop" style={{ marginTop: 28 }}>
      <div className="mm-pop-head">
        <div className="mm-fox">🦊</div>
        <div className="mm-name">EIP-7702 Authorization Request</div>
      </div>
      <div className="mm-body">
        Authorize delegation target<br />
        <span className="hl">→ MetaMask Smart Account v1.2</span><br />
        Chain · Sepolia (11155111)<br />
        Nonce · 7
      </div>
    </div>
    <div className="flex gap-2" style={{ marginTop: 18, justifyContent: "flex-end" }}>
      <button className="btn btn-ghost">Batal</button>
      <button className="btn btn-primary" onClick={onUpgrade}>
        Sign Authorization <Icon name="arrow" size={14} className="arrow" />
      </button>
    </div>
  </>
);

const UpgradedPanel = ({ onDone }) => (
  <div className="slide-up" style={{ marginTop: 28 }}>
    <div className="flex gap-3 items-center" style={{ padding: 18, background: "var(--bg-elev)", borderRadius: "var(--radius-md)", border: "1px solid var(--border-accent)" }}>
      <div style={{ width: 40, height: 40, borderRadius: 11, background: "var(--accent)", color: "var(--accent-fg)", display: "grid", placeItems: "center" }}>
        <Icon name="check" size={18} />
      </div>
      <div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 500 }}>Smart Account aktif</div>
        <div className="mono" style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2, letterSpacing: "0.04em" }}>
          EOA berhasil di-upgrade · authorization tx confirmed
        </div>
      </div>
      <div style={{ marginLeft: "auto" }}>
        <button className="btn btn-primary" onClick={onDone}>
          Lanjut · Set Permission <Icon name="arrow" size={14} className="arrow" />
        </button>
      </div>
    </div>
  </div>
);

/* ---------- Screen 4: Permission scope ---------- */
const PermissionCard = ({ amount, onGrant, phase, onConfirm }) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  return (
    <section className="scope-card slide-up">
      <div className="scope-head">
        <div className="hero-eyebrow" style={{ marginBottom: 12 }}>
          <span className="num">04</span> · Scoped Permission · ERC-7715
        </div>
        <h1 className="hero-title" style={{ fontSize: 32 }}>
          Izinkan agent <em>sebatas ini saja</em>.
        </h1>
        <p className="hero-sub" style={{ marginTop: 8 }}>
          Permission ini tersimpan di smart account kamu dengan batas yang ketat.
          Agent <b>tidak bisa</b> swap di luar vault yang kamu pilih, <b>tidak bisa</b> exceed jumlah, dan otomatis kadaluarsa 24 jam lagi.
        </p>
      </div>

      <div className="scope-rows">
        <div className="scope-row">
          <div className="scope-key">
            <Icon name="target" />
            Action allowed
          </div>
          <div className="scope-val">vault-deposit · swap → approve → deposit</div>
          <div className="scope-hint">EIP-7710 calldata</div>
        </div>
        <div className="scope-row">
          <div className="scope-key">
            <Icon name="grid" />
            Vault address
          </div>
          <div className="scope-val">{RECOMMENDATION.addr.slice(0, 22)}…</div>
          <div className="scope-hint">single-vault scope</div>
        </div>
        <div className="scope-row">
          <div className="scope-key">
            <Icon name="cap" />
            Max amount
          </div>
          <div className="scope-val">
            <span className="lim">{amount || "100"} USDC</span> · hard cap
          </div>
          <div className="scope-hint">exceed = revert</div>
        </div>
        <div className="scope-row">
          <div className="scope-key">
            <Icon name="timer" />
            Expires
          </div>
          <div className="scope-val">{expiresAt.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}</div>
          <div className="scope-hint">24h dari sekarang</div>
        </div>
        <div className="scope-row">
          <div className="scope-key">
            <Icon name="logout" />
            Revocable
          </div>
          <div className="scope-val">Ya · kapanpun, instant</div>
          <div className="scope-hint">satu klik di rail kanan</div>
        </div>
      </div>

      <div className="scope-foot">
        <div className="shield-note">
          <Icon name="shieldCheck" size={18} />
          <span>Agent tidak punya akses ke saldo wallet kamu di luar scope ini.</span>
        </div>
        {phase === "idle" && (
          <button className="btn btn-primary btn-lg" onClick={onGrant}>
            <Icon name="lock" size={15} /> Grant Permission
          </button>
        )}
        {phase === "prompting" && (
          <div className="flex gap-2 items-center">
            <div className="spinner-ring" />
            <span className="mono" style={{ fontSize: 11, color: "var(--text-muted)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Awaiting MetaMask…
            </span>
          </div>
        )}
      </div>

      {phase === "prompting" && (
        <MmPermissionModal amount={amount} onConfirm={onConfirm} />
      )}
    </section>
  );
};

const MmPermissionModal = ({ amount, onConfirm }) => (
  <div className="modal-backdrop">
    <div className="modal" role="dialog" aria-modal="true">
      <div className="modal-head">
        <div className="modal-icon"><Icon name="shield" /></div>
        <div>
          <div className="modal-eyebrow">wallet_requestExecutionPermissions</div>
          <div className="modal-title">Izinkan execution permission?</div>
        </div>
      </div>
      <div className="modal-body">
        <b>yield-vibing.app</b> meminta scoped execution untuk smart account kamu:
      </div>
      <div className="mm-pop" style={{ marginBottom: 16 }}>
        <div className="mm-body">
          type · <span className="hl">vault-deposit</span><br />
          vault · {RECOMMENDATION.addr.slice(0, 14)}…<br />
          maxAmount · <span className="hl">{amount || "100"} USDC</span><br />
          expires · <span className="hl">86400s</span>
        </div>
      </div>
      <div className="modal-actions">
        <button className="btn btn-ghost">Reject</button>
        <button className="btn btn-primary" onClick={onConfirm}>Approve</button>
      </div>
    </div>
  </div>
);

/* ---------- Screen 5: Auto-execution ---------- */
const EXEC_STEPS = [
  { id: "swap", title: "Swap via DEX", sub: "USDC → USDC pool routing", icon: "swap" },
  { id: "approve", title: "Approve vault spender", sub: "ERC-20 approve · MockVault", icon: "shield" },
  { id: "deposit", title: "Deposit ke MockVault", sub: "ERC-4626 deposit · receive shares", icon: "download" },
];

const ExecCard = ({ amount, execState, onDone }) => {
  // execState: array of { status: 'idle'|'pending'|'done', hash?: string }
  const done = execState.filter((s) => s.status === "done").length;
  const pct = (done / EXEC_STEPS.length) * 100;

  useEffect(() => {
    if (done === EXEC_STEPS.length) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
  }, [done]);

  return (
    <section className="exec-card slide-up">
      <div className="exec-head">
        <div>
          <div className="hero-eyebrow" style={{ marginBottom: 10 }}>
            <span className="num">05</span> · Agent Executing · via 1Shot Relayer
          </div>
          <h1 className="hero-title" style={{ fontSize: 30 }}>
            Lagi <em>auto-eksekusi</em> deposit kamu — tanpa popup, tanpa gas.
          </h1>
          <p className="hero-sub" style={{ marginTop: 6 }}>
            3 transaksi diatomic-kan jadi 1 flow. Smart account kamu yang nge-sign,
            1Shot relayer yang bayar gas, kontrak <span className="mono">VaultDepositor.sol</span> yang validasi scope.
          </p>
        </div>
        <div className="exec-progress">
          {done}/{EXEC_STEPS.length}
          <div className="exec-progress-bar">
            <div className="exec-progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="exec-steps">
        {EXEC_STEPS.map((s, i) => {
          const st = execState[i]?.status || "idle";
          return (
            <div key={s.id} className={`exec-step ${st}`}>
              <div className="exec-step-icon">
                {st === "done" ? <Icon name="check" /> : <Icon name={s.icon} />}
              </div>
              <div className="exec-step-body">
                <div className="exec-step-title">
                  {s.title}
                  <span className="num">Step {String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="exec-step-sub mono">
                  {st === "done" && execState[i]?.hash ? (
                    <>
                      <span>tx · </span>
                      <a className="tx" href="#" onClick={(e) => e.preventDefault()}>{shortAddr(execState[i].hash)}</a>
                      <Icon name="external" size={11} />
                      <span style={{ marginLeft: 8 }}>· gas paid by relayer</span>
                    </>
                  ) : st === "pending" ? (
                    <>{s.sub} · broadcasting…</>
                  ) : (
                    <>{s.sub}</>
                  )}
                </div>
              </div>
              <div className="exec-step-status">
                {st === "done" && <><Icon name="check" size={11} /> Confirmed</>}
                {st === "pending" && <><div className="spinner-ring" /> Pending</>}
                {st === "idle" && "Queued"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

/* ---------- Screen 6: Success ---------- */
const SuccessCard = ({ amount, onAgain }) => {
  const monthly = ((Number(amount) || 100) * 0.082 / 12).toFixed(2);
  return (
    <section className="success-card slide-up">
      <div className="success-head">
        <div className="success-icon"><Icon name="check" /></div>
        <div style={{ flex: 1 }}>
          <h1 className="success-title">
            Deposit confirmed. <em style={{ fontStyle: "italic", color: "var(--accent)", fontWeight: 400 }}>You're earning 8.2% APY.</em>
          </h1>
          <p className="success-sub">
            {amount || 100} USDC sudah masuk ke MockVault. Dari input sampai onchain — 1 permission, 0 gas, ≈42 detik.
          </p>
        </div>
      </div>

      <div className="success-numbers">
        <div className="stat accent">
          <div className="stat-label">Deposited</div>
          <div className="stat-val">{amount || 100}<span className="unit">USDC</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">Estimasi /bulan</div>
          <div className="stat-val">+{monthly}<span className="unit">USDC</span></div>
        </div>
        <div className="stat">
          <div className="stat-label">User Klik</div>
          <div className="stat-val">3<span className="unit">/8 traditional</span></div>
        </div>
      </div>

      <div className="ai-card-foot" style={{ borderTop: "1px dashed var(--border)" }}>
        <div className="privacy-note">
          <Icon name="external" size={13} /> Etherscan · 0x9f3…a12 (deposit tx)
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost">Lihat di Etherscan <Icon name="external" size={14} /></button>
          <button className="btn btn-primary" onClick={onAgain}>
            Deposit lagi <Icon name="plus" size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};

/* Export */
Object.assign(window, {
  InputScreen, ThinkingCard, RecommendCard, ConnectCard,
  PermissionCard, ExecCard, SuccessCard, RECOMMENDATION, shortAddr, fakeHash,
});
