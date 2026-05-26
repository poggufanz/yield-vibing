# Arsitektur Teknis — Vibing Farmer

> **Skill Referensi:** architecture-designer
> **Versi:** 2.0 | **Tanggal:** 27 Mei 2026
> **Tujuan:** Ringkasan arsitektur, prinsip desain, data flow, ADR, NFR, dan failure modes

---

## 1. Ringkasan Arsitektur

Vibing Farmer adalah platform DeFi berbasis web yang mengotomatisasi multi-vault yield farming menggunakan **AI-coordinated agent swarm**. Arsitektur terdiri dari 5 layer utama:

1. **Venice AI Coordinator** — strategy generation + per-agent skill auto-generation
2. **Skill System** — user-reviewable JSON skills per agent per step
3. **Agent Swarm** — Orchestrator + parallel Worker Agents (JavaScript, frontend)
4. **Blockchain Layer** — AgentVaultDepositor.sol (permission enforcer) + MockVault.sol
5. **Visualization Layer** — vis.js Network graph (real-time, browser)

**Vision:** Web3 → Web4 transition primitive. Users express intent, agents execute autonomously, blockchain enforces boundaries cryptographically.

---

## 2. Prinsip Desain

| Prinsip | Penerapan |
|---------|-----------|
| Intent-based execution | User nyatakan intent, Venice AI translate ke executable plan + skills |
| Permission-bounded execution | Per-agent ERC-7715 scope — agent hanya bertindak dalam batas yang user set |
| Parallel-first | Worker Agents berjalan concurrent, bukan sequential |
| Gas abstraction | User tidak bayar gas — relay oleh 1Shot Permissionless Relayer |
| Privacy-first AI | Venice AI tidak menyimpan data user |
| Fail-safe default | Contract revert (bukan silent fail) jika scope violation |
| Observable execution | vis.js graph + agent memory = full visibility atas aktivitas agent |
| Skill-governed agents | Semua agent action dibatasi oleh skill set yang user approve |

---

## 3. Diagram Arsitektur

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER BROWSER                             │
│                                                                  │
│  ┌─────────────┐   ┌────────────────────────────────────────┐   │
│  │  Venice AI  │   │          Vibing Farmer UI              │   │
│  │ Coordinator │◄──│  HTML/CSS/JS + ethers.js v6 + vis.js  │   │
│  │             │   └──────────────────┬─────────────────────┘   │
│  │ Strategy +  │                      │                         │
│  │ Skill Gen   │                      │                         │
│  └──────┬──────┘         ┌────────────▼──────────────┐         │
│         │                │   MetaMask Flask          │         │
│         ▼                │   EIP-7702: EOA → SA      │         │
│  ┌─────────────────┐     │   ERC-7715: Per-Agent     │         │
│  │  Skill Review   │     │   Permission Grant        │         │
│  │  & Edit UI      │     └────────────┬──────────────┘         │
│  └────────┬────────┘                  │ permissionContext × N   │
│           │                           │                         │
│           ▼                           ▼                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │             ORCHESTRATOR AGENT                           │   │
│  │  Receives plan → Dispatches Workers via Promise.allSettled│  │
│  └─────────────────┬──────────────────┬──────────────────────┘  │
│                    │                  │                          │
│            ┌───────▼──────┐   ┌───────▼──────┐                 │
│            │ Worker Agent │   │ Worker Agent │  (parallel)      │
│            │     1        │   │     N        │                  │
│            │ skill: JSON  │   │ skill: JSON  │                  │
│            └───────┬──────┘   └───────┬──────┘                 │
│                    │                  │                          │
└────────────────────┼──────────────────┼──────────────────────────┘
                     │ 1Shot Relay      │ 1Shot Relay
                     ▼                  ▼
         ┌────────────────────────────────────────┐
         │          SEPOLIA TESTNET               │
         │                                        │
         │  ┌─────────────────────────────────┐   │
         │  │   AgentVaultDepositor.sol       │   │
         │  │   agentPermissions[user][agId]  │   │
         │  │   executeAgentDeposit()         │   │
         │  │   CEI pattern + ReentrancyGuard │   │
         │  └──────────┬──────────────────────┘   │
         │             ▼                           │
         │  ┌──────────────┐  ┌──────────────┐   │
         │  │ MockVault A  │  │ MockVault B  │   │
         │  │ (ERC-4626)   │  │ (ERC-4626)   │   │
         │  └──────────────┘  └──────────────┘   │
         └────────────────────────────────────────┘
                     │
                     ▼
         ┌────────────────────────────────────────┐
         │   vis.js Network Graph (browser)       │
         │   Real-time event updates              │
         │   Agent memory in node detail          │
         └────────────────────────────────────────┘
```

---

## 4. Data Flow

```
1. User input intent (amount, risk, N vaults)
   → Venice AI API → strategy JSON + skill JSON per agent

2. User reviews skill cards → edits if needed → approves
   → skill files written: agents/session-{id}/agent-{n}-skills.json

3. User connect MetaMask Flask
   → EIP-7702: EOA upgraded to smart account

4. User grants ERC-7715 permission per agent
   (vault address, maxAmount, expiry)
   → permissionContext per agentId stored in sessionStorage

5. User clicks "Launch Swarm"
   → Orchestrator dispatches N Worker Agents via Promise.allSettled()

6. Each Worker Agent (parallel):
   a. Read skill file (maxSlippage, dexPreference, etc.)
   b. Build calldata for swap → approve → deposit
   c. POST to 1Shot Permissionless Relayer with permissionContext
   d. 1Shot → AgentVaultDepositor.sol:
      CHECKS: validateAgentPermission(agentId, user, vault, amount)
      EFFECTS: usedAmount += amount
      INTERACTIONS: executeSwap → approve → MockVault.deposit()
   e. Contract emits: AgentStarted, SwapExecuted, ApproveExecuted,
                      DepositExecuted, AgentCompleted (or AgentFailed)

7. Frontend listens to events via ethers.js contract.on(...)
   → vis.js graph updates: node color idle→running→confirmed/failed
   → Memory file written: agents/memory/agent-{n}-memory.json

8. User clicks agent node → sees detail: skill used + memory entries

9. Summary: N vaults deposited, total shares, total estimated APY
```

---

## 5. ADR (Architecture Decision Records)

### ADR-01: Foundry sebagai Smart Contract Framework

**Keputusan:** Gunakan Foundry (via WSL) untuk development dan testing.

**Alasan:** Native Solidity testing, fuzz testing built-in, fast runner, standar industri DeFi hackathon.

**Ditolak:** Hardhat — terlalu banyak boilerplate untuk solo hackathon.

**Catatan:** Foundry hanya bisa dijalankan via WSL di Windows — selalu gunakan `wsl -e bash -c "..."`.

---

### ADR-02: HTML/CSS/JS + ethers.js v6 + vis.js (bukan React)

**Keputusan:** Plain HTML/CSS/JS dengan ethers.js v6 dan vis.js Network via CDN.

**Alasan:** Lebih cepat setup, tidak butuh build pipeline, fokus pada logika Web3 + agent. vis.js force-directed graph tepat untuk agent network visualization.

**Ditolak:** React — overkill untuk demo video 5 menit. D3.js — terlalu low-level untuk network graph.

---

### ADR-03: Venice AI sebagai Coordinator + Skill Generator

**Keputusan:** Venice AI tidak hanya sebagai recommendation engine, tapi sebagai strategy coordinator yang auto-generates skill sets per agent.

**Alasan:** Required untuk prize track $3,000 (Best Venice AI). Privacy-first (no data retention). Menambah nilai signifikan: bukan hanya "AI menyarankan vault" tapi "AI generate executable agent configuration."

**Ditolak:** OpenAI/Anthropic — tidak qualify untuk Venice track. Groq — tidak qualify untuk Venice track.

---

### ADR-04: Parallel Agent Dispatch (Promise.allSettled)

**Keputusan:** Orchestrator menggunakan `Promise.allSettled()` untuk dispatch semua Workers secara paralel.

**Alasan:** Demonstrasi nyata A2A coordination untuk prize track $3,000. Sequential = tidak ada nilai koordinasi. `allSettled` vs `all`: satu failure tidak abort Workers lain.

**Ditolak:** Sequential dispatch — tidak qualify untuk A2A coordination track.

---

### ADR-05: Per-Agent ERC-7715 Permission (bukan satu permission untuk semua)

**Keputusan:** Setiap Worker Agent mendapatkan ERC-7715 permission tersendiri (agentId spesifik, vault spesifik, amount spesifik).

**Alasan:** Security-first: agent 1 tidak bisa akses vault agent 2 meskipun satu session. Demonstrasi granular permission control.

**Ditolak:** Satu permission untuk semua agent — terlalu broad, weaker security story.

---

### ADR-06: MockVault (bukan integrasi real vault)

**Keputusan:** Buat 2 instance MockVault.sol (ERC-4626) untuk testnet.

**Alasan:** Kontrol penuh atas demo, tidak ada dependency ke protocol eksternal, deploy 2 untuk demo parallel Workers ke vault berbeda.

---

## 6. NFR (Non-Functional Requirements)

| Aspek | Target |
|-------|--------|
| Waktu eksekusi full flow (2 vaults paralel) | < 60 detik |
| Venice AI response time | < 10 detik |
| vis.js graph update latency dari on-chain event | < 1 detik |
| Gas cost untuk user | 0 (via 1Shot) |
| Browser support | Chrome / Brave terbaru |
| Smart contract test coverage | ≥ 80% |
| Worker Agent failure isolation | Satu Worker gagal tidak abort Workers lain |
| Minimum parallel Workers demo | ≥ 2 (untuk A2A track) |

---

## 7. Failure Modes

| Failure | Dampak | Mitigasi |
|---------|--------|---------|
| EIP-7702 tidak support di Sepolia | Blocker | Sudah diverifikasi — live sejak Mar 5 2025 |
| MetaMask regular (bukan Flask) | Demo gagal | Show pesan: "Install MetaMask Flask (13.9+)" |
| Venice AI timeout | Skill tidak ter-generate | Hardcoded fallback skill template |
| Venice AI JSON output malformed | Skill card tidak render | JSON schema validation + error message |
| 1Shot relay timeout per Worker | TX tidak terkonfirmasi | Retry 1x sesuai skill maxRetries; Worker marks failed |
| Satu Worker Agent gagal | Partial execution | Promise.allSettled — workers lain lanjut; graph node merah |
| vis.js graph tidak render | Visualisasi tidak muncul | Fallback: step-tracker list view |
| Contract revert permission exceeded | TX ditolak | Design intent — tampilkan error jelas di graph node detail |
| agentId collision | Wrong permission used | Gunakan keccak256(deterministic string) |
| MockVault deposit gagal | Worker marks failed | Unit test sebelum deploy ke Sepolia |
