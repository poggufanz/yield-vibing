/* ============================================
   YIELD VIBING — v2 screens
   ============================================ */

const { useState, useEffect, useRef } = React;

const shortAddr = (a) => a ? `${a.slice(0, 6)}…${a.slice(-4)}` : "";
const fakeHash = () => "0x" + Array.from({ length: 64 }, () => "0123456789abcdef"[Math.floor(Math.random() * 16)]).join("");

const RISK_OPTIONS = [
  { id: "low", label: "Low", sub: "Capital preservation" },
  { id: "med", label: "Medium", sub: "Balanced yield" },
  { id: "high", label: "High", sub: "Aggressive" },
];

/* ============================================
   01 — INPUT
   Editorial: amount input is the visual anchor.
   ============================================ */
const InputScreen = ({ amount, setAmount, risk, setRisk, onSubmit }) => {
  const valid = Number(amount) > 0 && risk;
  return (
    <section className="card enter">
      <div className="eyebrow">
        <span className="num">01</span>
        <span>Preferensi · venice ai</span>
        <span className="rule" />
        <span>05 langkah</span>
      </div>

      <h1 className="h-display">
        Set deposit kamu — biar agent yang ngerjain semua sisanya.
      </h1>
      <p className="lede">
        Venice AI nyariin vault yang cocok sama profil risiko kamu. Semua relay lewat 1Shot,
        kamu nggak bayar gas. Permission yang kamu kasih nanti scoped — agent nggak bisa keluar batas.
      </p>

      <div className="amount-block">
        <div>
          <div className="amount-label">Jumlah deposit</div>
          <div className="amount-input-row">
            <input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              aria-label="Jumlah USDC"
              inputMode="decimal"
            />
            <span className="ticker">USDC</span>
          </div>
        </div>

        <div>
          <div className="amount-label">Risk profile</div>
          <div className="risk-row" role="radiogroup">
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

      <div className="action-row">
        <div className="foot-note">
          Venice AI · privacy-first · <b>no data retention</b>
        </div>
        <button className="btn btn-primary btn-lg" disabled={!valid} onClick={onSubmit}>
          Cari rekomendasi <Icon name="arrow" size={14} />
        </button>
      </div>
    </section>
  );
};

/* ============================================
   02a — AI Thinking
   Replaces shimmer with real progress checklist
   ============================================ */
const THINK_STEPS = [
  { label: "Memindai 24 vault aktif di Sepolia", time: "0.4s" },
  { label: "Menganalisa APY, TVL, dan risk score", time: "1.6s" },
  { label: "Mencocokkan dengan profil risiko kamu", time: "0.9s" },
];

const ThinkingCard = ({ phase }) => {
  return (
    <section className="thinking enter">
      <div className="eyebrow">
        <span className="num">02</span>
        <span>Venice AI · llama-3.3-70b · running</span>
      </div>
      <h2 className="thinking-title">Lagi nyari vault yang cocok…</h2>

      <div className="thinking-list">
        {THINK_STEPS.map((s, i) => {
          const state = i < phase ? "done" : i === phase ? "active" : "idle";
          return (
            <div key={i} className={`think-step ${state}`}>
              <span className="marker" />
              <span>{s.label}</span>
              <span className="time">{state === "idle" ? "—" : s.time}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

/* ============================================
   02b — Recommendation
   Editorial: vault name + huge APY side-by-side
   ============================================ */
const RECOMMENDATION = {
  vault: "MockVault USDC",
  variant: "Conservative",
  addr: "0xABCD7e8F3a2c91D5e6f0B842c1234567890aBcDe",
  apy: "8.2",
  tvl: "12.4",
  riskScore: "2.1",
  drawdown: "-1.8",
  reasoning: (
    <>
      Vault ini pakai strategi <b>lending konservatif</b> ke Aave v3 USDC pool — return-nya stabil,
      drawdown historis dibawah 2 persen, dan TVL $12.4M jadi exit-nya likuid.
      Cocok buat profil low-risk kamu, dan strategi-nya bisa di-audit sepenuhnya onchain.
    </>
  ),
  tags: ["aave-v3", "lending", "single-asset", "audited"],
  rationale: [
    { k: "Strategy", v: "Aave v3 USDC lending" },
    { k: "Volatility 30d", v: "0.4%" },
    { k: "Audit", v: "OpenZeppelin · Mar 2025" },
    { k: "Withdrawal", v: "Instant · no lockup" },
  ],
};

const RecommendCard = ({ onProceed }) => {
  return (
    <section className="rec-card enter">
      <div className="eyebrow">
        <span className="num">02</span>
        <span>Rekomendasi · 2.9 detik · 24 vault dianalisa</span>
        <span className="rule" />
        <span>1 of 1 match</span>
      </div>

      <div className="rec-hgroup">
        <div>
          <div className="rec-vault-name">
            {RECOMMENDATION.vault}
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)", letterSpacing: "-0.01em", marginTop: 6, fontWeight: 400 }}>
              variant · {RECOMMENDATION.variant.toLowerCase()}
            </div>
          </div>
          <div className="rec-vault-addr">{RECOMMENDATION.addr}</div>
        </div>
        <div className="rec-hgroup-apy">
          <span className="figure figure-md tnum">{RECOMMENDATION.apy}<span className="unit">% APY</span></span>
          <span className="label">net of fees · last 30d avg</span>
        </div>
      </div>

      <div className="rec-prose">
        <p className="rec-prose-body">{RECOMMENDATION.reasoning}</p>
        <div className="rec-prose-meta">
          {RECOMMENDATION.rationale.map((m, i) => (
            <div key={i} className="rec-meta-row">
              <span className="k">{m.k}</span>
              <span className="v">{m.v}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rec-tags">
        {RECOMMENDATION.tags.map((t, i) => <span key={i} className="rec-tag">{t}</span>)}
      </div>

      <div className="action-row">
        <div className="foot-note">
          Vault data dummy · APY mock buat demo. Reasoning di-generate oleh <b>Venice AI</b>, privacy-first.
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost">Lihat alternatif</button>
          <button className="btn btn-primary" onClick={onProceed}>
            Lanjut · connect wallet <Icon name="arrow" size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};

/* ============================================
   03 — Connect & EIP-7702 upgrade
   Document-grade MetaMask mock — no fox emoji
   ============================================ */
const ConnectCard = ({ phase, onConnect, onUpgrade, onDone }) => {
  return (
    <section className="card enter">
      <div className="eyebrow">
        <span className="num">03</span>
        <span>Connect · EIP-7702 upgrade</span>
        <span className="rule" />
        <span>required for ERC-7715</span>
      </div>

      <h1 className="h-display">
        Upgrade akun kamu jadi smart account — satu signature, reversible.
      </h1>
      <p className="lede">
        MetaMask kamu masih EOA biasa. EIP-7702 nge-set kode delegasi di akun yang sama,
        jadi smart account aktif tanpa pindah wallet. Kamu bisa balik ke EOA kapanpun.
      </p>

      {phase === "idle" && (
        <div className="action-row">
          <div className="foot-note">Pastikan MetaMask kamu di network <b>Sepolia</b> testnet.</div>
          <button className="btn btn-primary btn-lg" onClick={onConnect}>
            Connect MetaMask <Icon name="arrow" size={14} />
          </button>
        </div>
      )}

      {phase === "connecting" && (
        <MmDialog
          domain="yield-vibing.app"
          title="Connection request"
          rows={[
            { k: "request", v: "eth_requestAccounts" },
            { k: "network", v: "Sepolia · 11155111" },
            { k: "status", v: "awaiting user…" },
          ]}
          pending
        />
      )}

      {phase === "connected" && (
        <>
          <MmDialog
            domain="yield-vibing.app"
            title="EIP-7702 authorization"
            rows={[
              { k: "delegate to", v: "MetaMask Smart Account v1.2", accent: true },
              { k: "chainId", v: "11155111" },
              { k: "nonce", v: "7" },
              { k: "expiry", v: "ephemeral · single tx" },
            ]}
          />
          <div className="action-row">
            <div className="foot-note">Authorization tx bakal di-relay sama 1Shot · gas <b>0</b>.</div>
            <div className="flex gap-2">
              <button className="btn btn-ghost">Cancel</button>
              <button className="btn btn-primary" onClick={onUpgrade}>
                Sign authorization <Icon name="arrow" size={14} />
              </button>
            </div>
          </div>
        </>
      )}

      {phase === "upgrading" && (
        <MmDialog
          domain="1Shot Relayer"
          title="Broadcasting authorization"
          rows={[
            { k: "tx", v: "0x9f3…a124" },
            { k: "relayer", v: "1Shot Permissionless · EIP-7710" },
            { k: "gas paid", v: "by relayer · user 0 ETH", accent: true },
            { k: "status", v: "confirming…" },
          ]}
          pending
        />
      )}

      {phase === "upgraded" && (
        <UpgradedCallout onDone={onDone} />
      )}
    </section>
  );
};

const MmDialog = ({ domain, title, rows, pending }) => (
  <div className="mm-pop enter">
    <div className="mm-pop-head">
      <div className="mm-brand">
        <div className="mm-mark">MM</div>
        <span className="mm-name">MetaMask</span>
      </div>
      <span className="mm-domain">{domain}</span>
    </div>
    <div className="mono" style={{ fontSize: 12, color: "var(--text)", marginBottom: 12, letterSpacing: "-0.01em" }}>
      {title}{pending ? "…" : ""}
    </div>
    <div className="mm-body">
      {rows.map((r, i) => (
        <div key={i} className="row">
          <span className="k">{r.k}</span>
          <span className={`v ${r.accent ? "accent" : ""}`}>{r.v}</span>
        </div>
      ))}
    </div>
  </div>
);

const UpgradedCallout = ({ onDone }) => (
  <div className="enter" style={{ marginTop: 28 }}>
    <div style={{
      borderTop: "1px solid var(--border)",
      borderBottom: "1px solid var(--border)",
      padding: "24px 0",
      display: "grid",
      gridTemplateColumns: "1fr auto",
      gap: 18,
      alignItems: "center",
    }}>
      <div>
        <div className="mono" style={{ fontSize: 11, color: "var(--accent)", letterSpacing: "-0.01em", marginBottom: 8 }}>
          ✓ smart account active
        </div>
        <div className="h-sub">EOA berhasil di-upgrade. Authorization tx confirmed.</div>
        <div className="mono" style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6, letterSpacing: "-0.01em" }}>
          tx · 0x9f3a8b…a124 · relayed by 1Shot
        </div>
      </div>
      <button className="btn btn-primary" onClick={onDone}>
        Lanjut · set permission <Icon name="arrow" size={14} />
      </button>
    </div>
  </div>
);

/* ============================================
   04 — Permission scope (document-grade)
   ============================================ */
const PermissionCard = ({ amount, onGrant, phase, onConfirm }) => {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const expiresFmt = expiresAt.toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <section className="card enter">
      <div className="eyebrow">
        <span className="num">04</span>
        <span>Scoped permission · ERC-7715</span>
        <span className="rule" />
        <span>signed by smart account</span>
      </div>

      <h1 className="h-display">
        Izinkan agent — tapi cuma sebatas yang ini.
      </h1>
      <p className="lede">
        Permission ini tersimpan di smart account kamu dengan boundary yang ketat: vault tertentu, jumlah maksimum,
        kadaluarsa otomatis. Di luar scope ini, kontrak <span className="mono">VaultDepositor.sol</span> bakal <b>revert</b> — bukan silent fail.
      </p>

      <div className="perm-doc">
        <div className="perm-doc-row">
          <div className="perm-doc-k">action.type</div>
          <div className="perm-doc-v">
            vault-deposit
            <span className="annot">swap → approve → deposit</span>
          </div>
        </div>
        <div className="perm-doc-row">
          <div className="perm-doc-k">allowed.vault</div>
          <div className="perm-doc-v">
            {RECOMMENDATION.addr}
            <span className="annot">single-vault scope</span>
          </div>
        </div>
        <div className="perm-doc-row">
          <div className="perm-doc-k">max.amount</div>
          <div className="perm-doc-v">
            <span className="accent">{amount || "100"} USDC</span>
            <span className="annot">hard cap · exceed = revert</span>
          </div>
        </div>
        <div className="perm-doc-row">
          <div className="perm-doc-k">expires.at</div>
          <div className="perm-doc-v">
            {expiresFmt}
            <span className="annot">86 400 detik dari sekarang</span>
          </div>
        </div>
        <div className="perm-doc-row">
          <div className="perm-doc-k">revocable</div>
          <div className="perm-doc-v">
            yes
            <span className="annot">kapanpun · satu klik · onchain</span>
          </div>
        </div>
      </div>

      <div className="action-row">
        <div className="foot-note">
          Agent <b>tidak punya akses</b> ke saldo wallet di luar scope ini. Kontrak validasi tiap call.
        </div>
        {phase === "idle" && (
          <button className="btn btn-primary btn-lg" onClick={onGrant}>
            Grant permission <Icon name="arrow" size={14} />
          </button>
        )}
        {phase === "prompting" && (
          <span className="foot-note mono">awaiting metamask…</span>
        )}
      </div>

      {phase === "prompting" && (
        <MmPermissionModal amount={amount} onConfirm={onConfirm} />
      )}
    </section>
  );
};

const MmPermissionModal = ({ amount, onConfirm }) => (
  <div className="modal-backdrop" onClick={onConfirm}>
    <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
      <div className="modal-eyebrow">wallet_requestExecutionPermissions</div>
      <h3 className="modal-title">Approve execution permission?</h3>

      <div className="mm-pop" style={{ marginTop: 0 }}>
        <div className="mm-pop-head">
          <div className="mm-brand">
            <div className="mm-mark">MM</div>
            <span className="mm-name">MetaMask</span>
          </div>
          <span className="mm-domain">yield-vibing.app</span>
        </div>
        <div className="mm-body">
          <div className="row"><span className="k">type</span><span className="v accent">vault-deposit</span></div>
          <div className="row"><span className="k">vault</span><span className="v">{RECOMMENDATION.addr.slice(0, 14)}…</span></div>
          <div className="row"><span className="k">maxAmount</span><span className="v accent">{amount || "100"} USDC</span></div>
          <div className="row"><span className="k">expires</span><span className="v">86 400s</span></div>
        </div>
      </div>

      <div className="modal-actions">
        <button className="btn btn-ghost" onClick={onConfirm}>Reject</button>
        <button className="btn btn-primary" onClick={onConfirm}>Approve</button>
      </div>
    </div>
  </div>
);

/* ============================================
   05 — Execution (terminal log feel)
   ============================================ */
const EXEC_STEPS = [
  { id: "swap", title: "Swap via DEX", sub: "USDC → USDC pool · 0.05% slippage cap" },
  { id: "approve", title: "Approve vault spender", sub: "ERC-20 approve · MockVault" },
  { id: "deposit", title: "Deposit ke MockVault", sub: "ERC-4626 deposit · mint shares" },
];

const ExecCard = ({ amount, execState, onDone }) => {
  const done = execState.filter((s) => s.status === "done").length;
  const pct = (done / EXEC_STEPS.length) * 100;

  useEffect(() => {
    if (done === EXEC_STEPS.length) {
      const t = setTimeout(onDone, 900);
      return () => clearTimeout(t);
    }
  }, [done]);

  return (
    <section className="card enter">
      <div className="eyebrow">
        <span className="num">05</span>
        <span>Agent executing · 1Shot relayer</span>
        <span className="rule" />
        <span>gas paid by relayer</span>
      </div>

      <div className="exec-header">
        <div>
          <h1 className="h-display" style={{ fontSize: 30, marginTop: 6 }}>
            Auto-eksekusi 3 transaksi — tanpa popup, tanpa gas.
          </h1>
          <p className="lede" style={{ marginTop: 10, maxWidth: 520 }}>
            Smart account kamu yang nge-sign, 1Shot relayer yang nanggung gas,
            kontrak VaultDepositor yang validasi scope tiap call.
          </p>
        </div>
        <div className="exec-progress">
          <span className="label">progress</span>
          <span className={`value ${done === EXEC_STEPS.length ? "done" : ""}`}>
            {done}/{EXEC_STEPS.length}
          </span>
          <div className="exec-progress-bar">
            <div className="exec-progress-bar-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      <div className="exec-log">
        {EXEC_STEPS.map((s, i) => {
          const st = execState[i]?.status || "idle";
          return (
            <div key={s.id} className={`exec-row ${st}`}>
              <div className="exec-marker" />
              <div className="exec-body">
                <div className="exec-title">
                  {s.title}
                  <span className="step-num">step {String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="exec-sub">
                  <span>{s.sub}</span>
                  {st === "done" && execState[i]?.hash && (
                    <a className="tx" href="#" onClick={(e) => e.preventDefault()}>
                      tx · {shortAddr(execState[i].hash)}
                      <Icon name="external" size={11} />
                    </a>
                  )}
                  {st === "pending" && <span>· broadcasting</span>}
                </div>
              </div>
              <div className="exec-status">
                {st === "done" && "confirmed"}
                {st === "pending" && "pending"}
                {st === "idle" && "queued"}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

/* ============================================
   06 — Success
   ============================================ */
const SuccessCard = ({ amount, onAgain }) => {
  const monthly = ((Number(amount) || 100) * 0.082 / 12).toFixed(2);
  return (
    <section className="success-card enter">
      <div className="eyebrow">
        <span className="num">06</span>
        <span>Vault position opened · confirmed onchain</span>
        <span className="rule" />
        <span>≈ 42 detik total</span>
      </div>

      <h1 className="success-title">
        Deposit confirmed. Kamu sekarang earning 8.2% APY di MockVault USDC.
      </h1>

      <div className="success-numbers">
        <div className="success-num-cell">
          <span className="label">deposited</span>
          <span className="figure tnum">{amount || 100}<span className="unit">USDC</span></span>
        </div>
        <div className="success-num-cell">
          <span className="label">est. yield /bulan</span>
          <span className="figure tnum" style={{ color: "var(--accent)" }}>
            +{monthly}<span className="unit">USDC</span>
          </span>
        </div>
        <div className="success-num-cell">
          <span className="label">user signatures</span>
          <span className="figure tnum">2</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-faint)", letterSpacing: "-0.01em", marginTop: -4 }}>
            vs 8 traditional
          </span>
        </div>
      </div>

      <div className="action-row" style={{ marginTop: 36 }}>
        <div className="foot-note">
          Etherscan · <span style={{ color: "var(--text)" }}>0x9f3…a124</span> (deposit tx) ·
          gas paid by <b>1Shot relayer</b>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-ghost">
            Lihat di Etherscan <Icon name="external" size={13} />
          </button>
          <button className="btn btn-primary" onClick={onAgain}>
            Deposit lagi <Icon name="plus" size={14} />
          </button>
        </div>
      </div>
    </section>
  );
};

Object.assign(window, {
  InputScreen, ThinkingCard, RecommendCard, ConnectCard,
  PermissionCard, ExecCard, SuccessCard, RECOMMENDATION, shortAddr, fakeHash,
  THINK_STEPS, EXEC_STEPS,
});
