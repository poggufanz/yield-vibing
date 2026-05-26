# Fitur Lengkap — Vibing Farmer

> **Skill Referensi:** mobile-developer + blockchain-developer
> **Versi:** 2.0 | **Tanggal:** 27 Mei 2026
> **Tujuan:** Daftar lengkap functional requirements, prioritas, dan dependensi integrasi

---

## 1. Ringkasan

Vibing Farmer mengotomatisasi multi-vault yield farming dengan agent swarm yang dikoordinasikan oleh Venice AI. Arsitektur terdiri dari 5 komponen inti yang saling terintegrasi:

1. **Venice AI Coordinator** — generate strategy + skill sets per agent
2. **Skill System** — user review/edit + approve sebelum eksekusi
3. **Agent Swarm** — Orchestrator + parallel Worker Agents
4. **Memory System** — per-agent execution log, displayed in UI
5. **vis.js Graph** — real-time agent network visualization

Scope: Multi-vault deposit automation (Swap → Approve → Deposit per vault, paralel). Bukan full yield farming lifecycle.

---

## 2. Functional Requirements (FR)

### FR-01: Venice AI Strategy Generation + Skill Auto-Generation

**Deskripsi:** User memasukkan intent (jumlah USDC, risk level, jumlah vault) dan menerima strategi multi-vault beserta skill set per agent yang auto-generated oleh Venice AI.

**Input:**
- Jumlah USDC total (angka)
- Risk level: Low / Medium / High
- Jumlah vault target (integer, min 2 untuk demo)

**Output:**
- Strategi alokasi multi-vault (vault address, amount per vault, nama vault)
- Skill set JSON per agent per step type:
  - Swap skill: `{ maxSlippage, dexPreference, maxRetries, timeoutSeconds }`
  - Deposit skill: `{ maxAmount, vaultAddress, expiresAt }`
- Privacy badge "Coordinated by Venice AI — No data retention"

**Constraint:**
- Gunakan Venice AI API (`https://api.venice.ai/api/v1`) — OpenAI-compatible
- Model: `llama-3.3-70b`, `response_format: json_object`
- `venice_parameters.include_venice_system_prompt: false`
- Timeout: 10 detik, fallback ke hardcoded strategy
- Jika memory entries tersedia: feed ke Venice AI prompt sebagai context

---

### FR-02: Skill Review + Edit UI

**Deskripsi:** User dapat melihat, mengedit, dan menyetujui skill set yang Venice AI generate sebelum agent mulai eksekusi.

**Flow:**
1. Venice AI output di-render sebagai Skill Cards (satu per agent)
2. Setiap card menampilkan: agentId, vault target, skill parameters (editable)
3. User edit jika perlu (slippage, maxAmount, dll)
4. User klik "Approve Skill Sets" → semua skills ter-lock + ditulis ke `agents/session-{id}/agent-{n}-skills.json`
5. Skill digunakan oleh Worker Agent saat eksekusi

**Editable fields per skill:**
- Swap: maxSlippage (0–2%), dexPreference (dropdown), maxRetries (1–3)
- Deposit: maxAmount (≤ alokasi Venice AI), expiresAt (timestamp)

**Constraint:**
- Eksekusi tidak boleh mulai sebelum user approve skills
- Skill files ditulis ke `agents/session-{id}/` sebelum Worker launch

---

### FR-03: Wallet Connect + EIP-7702 Smart Account Upgrade

**Deskripsi:** User connect MetaMask Flask, aplikasi mengupgrade EOA ke smart account via EIP-7702.

**Flow:**
1. Detect MetaMask Flask extension (bukan regular MetaMask)
2. Request `eth_requestAccounts` → get EOA address
3. Cek apakah akun sudah smart account atau masih EOA
4. Jika EOA: trigger EIP-7702 authorization via Viem + MetaMask SAK
5. Tampilkan status upgrade

**Constraint:**
- Wajib MetaMask Flask 13.9+ (regular MetaMask tidak support ERC-7715)
- Network: Sepolia testnet
- Handle case akun sudah jadi smart account (skip upgrade)
- Viem ESM CDN: `import { createWalletClient } from 'https://esm.sh/viem'`

---

### FR-04: ERC-7715 Permission Grant per Agent

**Deskripsi:** User men-set scoped permission untuk setiap agent — batasan vault spesifik, batasan jumlah, dan durasi.

**Permission per agent:**
- `agentId`: identifier unik agent (bytes32)
- `allowedVault`: address vault yang diizinkan (spesifik per agent)
- `maxAmount`: jumlah maksimum USDC (sesuai skill deposit)
- `expiresAt`: timestamp expiry (default: 24 jam)

**Flow:**
1. Tampilkan permission cards (satu per agent) dengan detail yang jelas
2. User klik "Grant Permissions" → panggil `wallet_requestExecutionPermissions` (ERC-7715) per agent
3. Simpan `permissionContext` per agentId di `sessionStorage`
4. Tampilkan status "N Agent Permissions Active"

**Constraint:**
- Permission scope harus tampil jelas per agent sebelum user approve
- Harus ada tombol "Revoke All Permissions" setelah grant
- Vault address yang di-show = vault dari skill yang sudah diapprove

---

### FR-05: Orchestrator Agent — Parallel Worker Dispatch

**Deskripsi:** Orchestrator Agent menerima plan dari Venice AI, membuat N Worker Agents, dan mendispatch semua secara paralel.

**Flow:**
1. Terima strategy JSON dari `venice.js`
2. Buat Worker Agent instances (satu per vault dari strategy)
3. Dispatch semua via `Promise.allSettled()` — satu failure tidak abort lainnya
4. Aggregate hasil dari semua Workers
5. Tulis orchestrator summary ke memory

**Constraint:**
- Gunakan `Promise.allSettled()` bukan `Promise.all()`
- Orchestrator node tampil di vis.js graph sebagai pusat
- Edges dari Orchestrator ke setiap Worker agent

---

### FR-06: Worker Agent — Single Vault Deposit Flow

**Deskripsi:** Setiap Worker Agent mengeksekusi satu complete vault deposit flow berdasarkan skill set yang diberikan.

**Flow per Worker:**
1. Baca skill set dari `agents/session-{id}/agent-{n}-skills.json`
2. Emit: `AgentStarted` event
3. Kirim relay request ke 1Shot API (swap step)
4. Emit: `SwapExecuted` on confirmation
5. Kirim relay request ke 1Shot API (approve step)
6. Emit: `ApproveExecuted` on confirmation
7. Kirim relay request ke 1Shot API (deposit step)
8. Emit: `DepositExecuted` on confirmation
9. Emit: `AgentCompleted`
10. Tulis memory entry ke `agents/memory/agent-{n}-memory.json`

**Error handling:**
- Jika 1Shot timeout: retry 1x sesuai skill `maxRetries`
- Jika contract revert: emit `AgentFailed`, tulis error ke memory, Worker berhenti (tidak abort Workers lain)
- Jika exceed permission: revert dari kontrak, Worker tandai failed

**Constraint:**
- Semua tx via 1Shot Permissionless Relayer (user tidak bayar gas)
- Patuhi skill params: maxSlippage, maxRetries, timeout
- Tulis memory setelah selesai (success atau failure)

---

### FR-07: Agent Memory System

**Deskripsi:** Setiap agent mencatat hasil eksekusi ke memory file yang persisten, yang ditampilkan di UI dan digunakan sebagai context di eksekusi berikutnya.

**Memory format (append-only JSON):**
```json
{
  "agentId": "worker-agent-1",
  "sessionId": "session-20260609-001",
  "vault": "0xVaultA...",
  "entries": [
    {
      "timestamp": 1748387200,
      "step": "swap",
      "status": "success",
      "gasUsed": 45000,
      "slippageActual": 0.12,
      "executionTimeMs": 4200,
      "lesson": "MockVault A accepts 0.5% slippage reliably"
    },
    {
      "timestamp": 1748387260,
      "step": "deposit",
      "status": "success",
      "sharesReceived": "50023456",
      "executionTimeMs": 3800
    }
  ]
}
```

**Storage:** `agents/memory/agent-{n}-memory.json`

**Displayed in:** vis.js node detail panel saat user klik agent node

**Used for:** Feed ke Venice AI prompt sebagai context pada eksekusi berikutnya (Could Have)

---

### FR-08: vis.js Network Graph — Real-Time Monitoring

**Deskripsi:** Force-directed network graph yang memvisualisasikan agent swarm, status eksekusi, dan komunikasi antar agent secara real-time.

**Nodes:**
- Orchestrator Agent (pusat)
- Worker Agent × N
- Vault target × N

**Edges:**
- Orchestrator → Worker Agent (dependency edge)
- Worker Agent → Vault (execution edge)

**Node states (color-coded):**
- `idle` — gray
- `running` — blue (animate border)
- `confirmed` — green
- `failed` — red

**Interaksi:**
- Klik node → panel detail muncul: current step, skill used, memory entries
- Graph update real-time dari on-chain events (ethers.js `contract.on(...)`)

**Constraint:**
- Gunakan vis.js Network (bukan D3.js, bukan Neo4j)
- CDN: `https://unpkg.com/vis-network/standalone/umd/vis-network.min.js`

---

### FR-09: Permission Revocation

**Deskripsi:** User dapat mencabut permission semua atau per agent kapanpun.

**Flow:**
1. Tombol "Revoke All Permissions" tersedia setelah permission aktif
2. Panggil `revokeAgentPermission` per agentId via kontrak
3. Update UI: "Permissions revoked — agents cannot execute"

---

## 3. Prioritas (MoSCoW)

| FR | Fitur | Prioritas | Track |
|----|-------|-----------|-------|
| FR-01 | Venice AI Strategy + Skill Generation | Must | Venice |
| FR-02 | Skill Review + Edit UI | Must | Agent |
| FR-03 | Wallet Connect + EIP-7702 | Must | Qualification |
| FR-04 | ERC-7715 Permission per Agent | Must | Qualification |
| FR-05 | Orchestrator Agent (parallel dispatch) | Must | A2A |
| FR-06 | Worker Agent (single vault flow) | Must | Agent + 1Shot |
| FR-07 | Agent Memory System | Must | Agent |
| FR-08 | vis.js Network Graph | Must | Agent + A2A |
| FR-09 | Permission Revocation | Should | Security |

---

## 4. Platform Considerations

| Aspek | Detail |
|-------|--------|
| Browser | Chrome / Brave (MetaMask Flask extension support) |
| Wallet | MetaMask Flask (bukan regular MetaMask) |
| Network | Sepolia testnet |
| Smart Contract | Solidity ^0.8.24, Foundry |
| Frontend | HTML/CSS/JS + ethers.js v6 + vis.js Network |
| AI | Venice AI API (OpenAI-compatible, llama-3.3-70b) |
| Relay | 1Shot Permissionless Relayer (JSON-RPC, no API key) |
| Viem | ESM CDN for EIP-7702/ERC-7715 signing |

---

## 5. Integrasi & Dependensi

| Komponen | Dependensi | Catatan |
|----------|-----------|---------|
| MetaMask Flask | Flask 13.9+ extension | Regular MetaMask tidak support ERC-7715 |
| Viem | ESM CDN (`esm.sh/viem`) | EIP-7702 + ERC-7715 signing |
| ethers.js | v6 via CDN | Contract event listening + calldata encoding |
| vis.js Network | `unpkg.com/vis-network` | Force-directed graph, no backend |
| Venice AI | REST API + API key | `https://api.venice.ai/api/v1` |
| 1Shot API | Permissionless Relayer | `https://relayer.1shotapi.com/relayers` — no API key |
| Foundry | `forge`, `cast` (via WSL) | Smart contract dev + test |

---

## 6. Referensi

- EIP-7702: https://eips.ethereum.org/EIPS/eip-7702
- ERC-7715: https://eips.ethereum.org/EIPS/eip-7715
- ERC-7710: https://eips.ethereum.org/EIPS/eip-7710
- MetaMask Smart Accounts Kit: https://docs.metamask.io/wallet/smart-accounts/
- Venice AI Docs: https://docs.venice.ai/
- 1Shot API Docs: https://1shotapi.com/docs
- vis.js Network Docs: https://visjs.github.io/vis-network/docs/network/
