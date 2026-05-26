# Keamanan & Privasi — Vibing Farmer

> **Skill Referensi:** security-review + data-privacy-compliance
> **Versi:** 2.0 | **Tanggal:** 27 Mei 2026
> **Tujuan:** Dokumentasi threat model, kontrol keamanan, privasi data, dan compliance

---

## 1. Ringkasan Keamanan & Privasi

Vibing Farmer dirancang dengan prinsip **per-agent permission-bounded execution** — setiap agent hanya memiliki akses ke vault tertentu dengan jumlah tertentu. Tidak ada agent yang memiliki akses penuh ke wallet user. Semua eksekusi dibatasi oleh ERC-7715 scoped permission per agentId yang user tentukan sendiri.

**Prinsip keamanan utama:**
- Tidak ada admin key atau privileged role di smart contract
- Permission scope di-enforce on-chain per agentId (revert, bukan silent fail)
- Satu agent failure tidak bisa mengakibatkan eksekusi di luar permission-nya
- Venice AI tidak menyimpan data user (no data retention)
- Skill files hanya bisa dibaca setelah user approve — tidak bisa dimodifikasi saat eksekusi
- Memory files append-only — tidak bisa di-overwrite atau di-delete oleh agent
- Tidak ada server backend yang menyimpan credential atau private key

---

## 2. Data Classification

| Data | Klasifikasi | Lokasi | Sensitif? |
|------|-------------|--------|-----------|
| Wallet address | Public (on-chain) | Blockchain | Tidak |
| Per-agent permission context (ERC-7715) | Semi-private | Browser session + 1Shot relay | Ya |
| USDC amount + risk preference | Input user | Venice AI API (ephemeral) | Rendah |
| AgentId + vault target | Operasional | Skill file (lokal) + on-chain | Rendah |
| Skill files (agent parameters) | Operasional | Lokal (agents/session-{id}/) | Rendah |
| Memory files (execution logs) | Operasional | Lokal (agents/memory/) | Rendah |
| Private key / seed phrase | Secret | Tidak pernah diakses aplikasi | Sangat sensitif |
| Venice AI conversation | N/A | Tidak disimpan Venice AI | N/A |

---

## 3. Threat Model

### Threat 1: Agent Exceed Permission

**Deskripsi:** Worker Agent mencoba swap atau deposit melebihi batas yang user set untuk agentId tersebut.

**Mitigasi:**
- `require(amount <= agentPermissions[user][agentId].maxAmount - usedAmount)` — revert
- `require(vault == agentPermissions[user][agentId].allowedVault)` — revert jika vault berbeda
- `require(block.timestamp < agentPermissions[user][agentId].expiresAt)` — revert jika expired
- `require(agentPermissions[user][agentId].isActive)` — revert jika permission tidak aktif
- Tidak ada silent fail — semua violation = revert + event `AgentFailed(agentId, user, reason)`
- `usedAmount` di-track on-chain per agentId — cumulative limit enforced

---

### Threat 2: Agent 1 Mengakses Vault Agent 2

**Deskripsi:** Worker Agent 1 mencoba deposit ke vault yang diizinkan untuk Worker Agent 2 (berbeda vault).

**Mitigasi:**
- `agentPermissions[user][agentId].allowedVault` berbeda per agentId
- Contract revert: `require(vault == agentPermissions[user][agentId].allowedVault)`
- Per-agent permission = per-vault isolation — Agent 1 tidak bisa akses vault Agent 2

---

### Threat 3: Permission Context Leak

**Deskripsi:** ERC-7715 permission context per agentId yang dicuri bisa digunakan pihak ketiga.

**Mitigasi:**
- Permission context per agentId hanya di `sessionStorage` (hilang saat tab ditutup)
- Key di sessionStorage: `vf_permission_context_agent{n}` (namespaced, tidak mudah-tebak)
- Tidak dikirim ke server developer
- User bisa revoke permission kapanpun via `revokeAgentPermission(agentId)`
- Expiry timestamp di ERC-7715 membatasi window of exposure

---

### Threat 4: Smart Contract Reentrancy

**Deskripsi:** Vault deposit callback bisa memicu re-entry ke `AgentVaultDepositor`.

**Mitigasi:**
- CEI pattern (Checks → Effects → Interactions) di `executeAgentDeposit`:
  - CHECKS: validate all permission constraints
  - EFFECTS: `usedAmount += amount` (state change before external call)
  - INTERACTIONS: swap → approve → MockVault.deposit()
- `nonReentrant` modifier dari OpenZeppelin ReentrancyGuard

---

### Threat 5: Frontend Injection / XSS

**Deskripsi:** Script injection bisa mencuri permission context dari sessionStorage atau skill files.

**Mitigasi:**
- Tidak ada user-generated content yang di-render sebagai HTML
- Venice AI response di-parse sebagai JSON (bukan eval/innerHTML)
- Skill file content di-validate schema sebelum digunakan
- Memory file content di-sanitize sebelum ditampilkan di vis.js node detail

---

### Threat 6: Skill File Tampering (Setelah Approve)

**Deskripsi:** Skill file dimodifikasi oleh pihak ketiga setelah user approve, mengubah parameter eksekusi.

**Mitigasi:**
- Skill file di-hash setelah approve — Worker Agent validasi hash sebelum baca
- Skill file read di-lock: setelah approve, UI tidak bisa lagi edit
- Skill parameters juga di-validate oleh smart contract (vault + amount enforce on-chain)

---

### Threat 7: Orchestrator Abuse (One Worker Overriding Others)

**Deskripsi:** Satu Worker Agent yang compromised mencoba cancel atau interfere dengan Workers lain.

**Mitigasi:**
- Workers berjalan independen via `Promise.allSettled()` — tidak ada komunikasi antar Worker
- Setiap Worker hanya punya akses ke permissionContext agentId-nya sendiri
- Failure satu Worker tidak bisa trigger revoke permission Workers lain

---

## 4. Kontrol Keamanan

### Smart Contract

| Kontrol | Implementasi |
|---------|-------------|
| Per-agent permission validation | `agentPermissions[user][agentId]` — nested mapping |
| Vault scope check | `require(vault == agentPermissions[user][agentId].allowedVault)` |
| Amount check (cumulative) | `require(amount <= maxAmount - usedAmount)` |
| Expiry check | `require(block.timestamp < expiresAt)` |
| Active check | `require(agentPermissions[user][agentId].isActive)` |
| Reentrancy guard | `nonReentrant` — OpenZeppelin ReentrancyGuard |
| No admin key | Tidak ada `onlyOwner` di fungsi kritis |
| CEI pattern | Checks → Effects → Interactions di `executeAgentDeposit` |
| Event logging | Semua aksi penting emit event (termasuk AgentFailed) |

### Frontend

| Kontrol | Implementasi |
|---------|-------------|
| Input sanitization | Venice AI response di-parse JSON, bukan eval |
| Skill schema validation | Validate JSON schema sebelum write ke file dan sebelum use |
| Memory XSS prevention | Sanitize memory entry sebelum render ke DOM |
| No private key handling | Aplikasi tidak pernah minta private key |
| Network check | Verifikasi user di Sepolia sebelum eksekusi |
| Permission review | Tampilkan detail scope per agent sebelum user approve |
| Worker isolation | Workers tidak share state — independen |
| permissionContext namespacing | `vf_permission_context_agent{n}` — tidak mudah collision |

### API Security

| Kontrol | Implementasi |
|---------|-------------|
| Venice AI API key | Environment variable — tidak di-hardcode |
| HTTPS only | Semua API call via HTTPS |
| Input validation | Validasi amount (positif, ≤ balance) sebelum kirim ke contract |
| Skill parameter validation | maxSlippage (0–2%), maxAmount (≤ alokasi strategy), expiresAt (masa depan) |

---

## 5. Compliance

| Aspek | Status |
|-------|--------|
| Data personal (PII) | Tidak ada PII yang dikumpulkan atau disimpan oleh developer |
| GDPR / privasi | Venice AI no-retention align dengan data minimization. Skill + memory files lokal. |
| KYC/AML | N/A — testnet, bukan mainnet financial product |
| Smart contract audit | Belum diaudit — hackathon scope, tidak untuk mainnet |
| Agent memory privacy | Memory files lokal — tidak pernah dikirim ke server manapun |

**Peringatan:** Proyek ini adalah demo hackathon di Sepolia testnet. Tidak untuk digunakan dengan aset nyata di mainnet tanpa:
1. Audit smart contract yang komprehensif
2. Formal verification untuk permission logic
3. Production security review untuk agent system

---

## 6. Checklist Keamanan Pre-Demo

**Smart Contract**
- [ ] Tidak ada private key atau API key yang ter-hardcode di kode
- [ ] Semua fungsi state-changing pakai CEI pattern
- [ ] `require` statements terpasang: vault, amount (cumulative), expiry, isActive
- [ ] `nonReentrant` modifier terpasang di `executeAgentDeposit`
- [ ] Tidak ada admin key atau `onlyOwner` di fungsi kritis
- [ ] `forge test` semua pass, coverage ≥ 80%

**Frontend + API**
- [ ] Venice AI API key di `.env` (tidak di-gitignore? cek .gitignore)
- [ ] Venice AI response di-parse sebagai JSON (bukan eval)
- [ ] Skill schema validation sebelum write dan sebelum use
- [ ] Memory content di-sanitize sebelum render ke DOM
- [ ] permissionContext per agent tersimpan di sessionStorage (bukan localStorage)
- [ ] Workers tidak share permissionContext satu sama lain

**Demo Environment**
- [ ] Demo wallet hanya berisi USDC testnet (tidak ada aset mainnet)
- [ ] Permission revocation berjalan dengan benar
- [ ] MetaMask Flask (bukan regular MetaMask) digunakan
- [ ] Browser dalam clean profile (no extensions yang bisa interfere)
