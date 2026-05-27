# Roadmap & Backlog — Vibing Farmer

> **Skill Referensi:** architecture-designer + finance-expert
> **Versi:** 2.0 | **Tanggal:** 27 Mei 2026
> **Tujuan:** Roadmap 20 hari hackathon, prioritas fitur, dan manajemen risiko

---

## 1. Ringkasan Roadmap

Deadline: **15 Juni 2026** (20 hari dari 26 Mei).
Submission platform: HackQuest.
Target: Demo end-to-end multi-vault deposit automation dengan agent swarm di Sepolia + video 3–5 menit.

**4 track target:** Best Agent ($3,000) + Best Venice AI ($3,000) + Best A2A Coordination ($3,000) + Best 1Shot ($1,000 USDC) = **$10,000 dari $11,000 prize pool.**

---

## 2. Priority Matrix (MoSCoW)

### Must Have

| ID | Fitur | Track |
|----|-------|-------|
| M1 | Wallet connect + EIP-7702 account upgrade | Qualification |
| M2 | ERC-7715 permission grant UI per agent | Qualification |
| M3 | AgentVaultDepositor.sol (per-agent permission + execution) | Core |
| M4 | 1Shot API relay untuk semua agent transactions | 1Shot Track |
| M5 | Venice AI: strategy generation + skill auto-generation per agent | Venice Track |
| M6 | Skill review + edit UI (user approves sebelum eksekusi) | Agent Track |
| M7 | Orchestrator Agent: parallel Worker dispatch | A2A Track |
| M8 | Worker Agent: single vault Swap→Approve→Deposit | Agent Track |
| M9 | Agent memory files: write + display | Agent Track |
| M10 | vis.js Network graph: real-time agent visualization | Agent Track |
| M11 | End-to-end flow di Sepolia testnet | Demo |
| M12 | Demo video (3–5 menit) | Submission |

### Should Have

| ID | Fitur | Alasan |
|----|-------|--------|
| S1 | Agent memory displayed di vis.js node detail | Memperkuat Agent track |
| S2 | Permission boundary enforcement (revert on exceed) per agent | Security & judging quality |
| S3 | MockVault × 2 instances untuk demo 2 parallel Workers | Demo completeness |
| S4 | Skill edit capability (user ubah slippage, amount) | UX untuk judging |

### Could Have

| ID | Fitur | Alasan |
|----|-------|--------|
| C1 | Memory-aware Venice AI re-prompting | Nilai tambah Agent track |
| C2 | APY comparison UI antar vault | Lebih compelling untuk demo |
| C3 | ≥ 3 parallel Workers (expandable N) | Memperkuat A2A track |

### Won't Have (Explicit Out of Scope)

| Fitur | Alasan Dikeluarkan |
|-------|-------------------|
| Cross-chain bridging | Terlalu kompleks, tidak ada nilai tambah judging |
| Remove liquidity automation | High-stakes, timing-sensitive, bukan scope |
| Custom AMM/DEX | Reinventing wheel, bukan nilai hackathon ini |
| Mainnet deployment | Tidak aman untuk demo, testnet cukup |
| Mobile breakpoints | Bukan requirement judging |

---

## 3. Milestone per Fase

### Fase 1: Foundation (Day 1–3 | 26–28 Mei)

> **Catatan:** Semua 4 spike sudah resolved ✅. Review spike tidak perlu diulang — langsung lanjut ke pemahaman arsitektur dan persiapan teknis.

| Hari | Deliverable | Selesai |
|------|-------------|---------|
| Day 1 | Review Solidity: storage, events, modifiers, access control | [ ] |
| Day 1 | Security patterns: CEI pattern, ReentrancyGuard, revert vs silent fail | [ ] |
| Day 2 | Baca `GETTING_STARTED.md` end-to-end: contract spec, build order, skill schema | [ ] |
| Day 2 | Pahami Skill System: JSON schema per agent, flow Venice AI → skills.js → worker.js | [ ] |
| Day 3 | Review design prototype (`design/Vibing Farmer Prototype.html`) — UI reference sebelum tulis contract | [ ] |
| Day 3 | Setup check: `forge build` OK · `.env.example` → `.env` · `agents/memory/` dir exists | [ ] |
| Day 3 | Verify `contracts/AgentVaultDepositor.sol` + `test/AgentVaultDepositor.t.sol` siap diisi | [ ] |

**Milestone gate:** `forge build` green. Semua file skeleton bernama benar. Skill schema dipahami. Siap tulis logic di Phase 2.

### Fase 2: Smart Contract (Day 4–8 | 29 Mei – 2 Juni)

| Hari | Deliverable | Selesai |
|------|-------------|---------|
| Day 4 | MockVault.sol — ERC-4626 minimal, deploy 2 instances | [ ] |
| Day 5 | AgentVaultDepositor.sol — per-agent permission struct + grantAgentPermission | [ ] |
| Day 6 | AgentVaultDepositor.sol — executeAgentDeposit (CEI) + all events | [ ] |
| Day 7 | Security review: per-agent validation, no admin key, ReentrancyGuard | [ ] |
| Day 8 | Testing: success path, fail path, parallel agentId, fuzz (forge test) | [ ] |

**Milestone gate:** `forge test` semua pass, coverage ≥ 80%.

### Fase 3: Integration (Day 9–13 | 3–7 Juni)

| Hari | Deliverable | Selesai |
|------|-------------|---------|
| Day 9 | 1Shot relay integration: relay.js + test Sepolia relay | [ ] |
| Day 10 | wallet.js: EIP-7702 upgrade + ERC-7715 per-agent permission | [ ] |
| Day 11 | venice.js: strategy generation + skill auto-generation | [ ] |
| Day 12 | skills.js + memory.js: review UI + memory write/read | [ ] |
| Day 11 | worker.js: single vault agent flow | [ ] |
| Day 12 | orchestrator.js: parallel dispatch + Promise.allSettled | [ ] |
| Day 13 | graph.js: vis.js Network + real-time event updates | [ ] |

**Milestone gate:** 2 Worker Agents berjalan paralel di Sepolia, graph update real-time.

### Fase 4: Polish & Ship (Day 14–17 | 8–11 Juni)

| Hari | Deliverable | Selesai |
|------|-------------|---------|
| Day 14 | Bug fixes: edge cases, error handling, UX polish | [ ] |
| Day 15 | Memory UI di node detail, skill edit capability | [ ] |
| Day 16 | README, dokumentasi lengkap, architecture diagram update | [ ] |
| Day 17 | Demo video recording (3–5 menit) | [ ] |

**Milestone gate:** Video terupload, semua qualification checklist terpenuhi.

### Fase 5: Buffer (Day 18–20 | 12–15 Juni)

| Hari | Deliverable | Selesai |
|------|-------------|---------|
| Day 18–19 | Buffer untuk unexpected issues | [ ] |
| Day 20 | Final submission di HackQuest (deadline 15 Juni) | [ ] |

---

## 4. Backlog Fitur Utama

### Kontrak (Priority: Kritis)

- `AgentVaultDepositor.sol` — per-agent permission mapping, executeAgentDeposit, 6 events
- `MockVault.sol` — ERC-4626 mock, deploy 2 instances (VaultA dan VaultB)
- `script/Deploy.s.sol` — deploy AgentVaultDepositor + 2 MockVault ke Sepolia
- Foundry tests: unit (per agent), integration (2 parallel agents), fuzz (amount edge cases)

### Frontend — Agent System (Priority: Kritis)

- `orchestrator.js` — terima plan Venice AI, dispatch Workers via Promise.allSettled
- `worker.js` — single vault Swap→Approve→Deposit, respect skill params
- `skills.js` — generate + render editable skill cards, write to `agents/session-{id}/`
- `memory.js` — append-only memory write, read + render in node detail

### Frontend — Visualization (Priority: Tinggi)

- `graph.js` — vis.js Network: init graph, update node state dari on-chain events
- Node states: idle (gray) → running (blue) → confirmed (green) → failed (red)
- Click handler: detail panel dengan skill JSON + memory entries

### Frontend — Web3 (Priority: Tinggi)

- `wallet.js` — MetaMask Flask detect, EIP-7702, ERC-7715 per agent
- `relay.js` — 1Shot relay per Worker Agent, retry 1x on timeout
- `venice.js` — strategy + skill generation, 10s timeout, hardcoded fallback

### Frontend — App (Priority: Tinggi)

- `app.js` — state machine: input→strategy→skills→permissions→execute→done
- `ui.js` — step tracker, status badges, Etherscan links

---

## 5. Risiko & Mitigasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|-------------|--------|----------|
| vis.js graph tidak render smooth dengan event updates | Medium | Medium | Test dengan mock events dulu sebelum real contract |
| Venice AI JSON output tidak sesuai schema skill | Medium | Tinggi | Validasi output + fallback ke hardcoded skill template |
| Promise.allSettled terlalu cepat — 1Shot rate limit | Low | Medium | Add delay antar Worker dispatch jika perlu |
| Solo burnout | Tinggi | Tinggi | Max 8 jam/hari. Stuck > 2 jam → pivot atau skip |
| Scope creep ke fitur C2/C3 | Medium | Tinggi | Strict: 2 Workers + basic memory = MVP. No feature creep after Day 13 |
| AgentId collision antara agents | Low | Medium | Gunakan keccak256(agentId string) — deterministic |
| MetaMask Flask version incompatibility | Low | Tinggi | Test di clean browser profile, catat exact Flask version yang works |
| 1Shot Permissionless Relayer down | Low | Tinggi | Verify relayer health Day 9. Have fallback: direct EOA tx untuk demo |
| Venice AI response lambat (> 10 detik) | Low | Rendah | Timeout + hardcoded fallback strategy |
| Demo video kualitas buruk | Low | Medium | Script dulu, record terakhir, max 5 menit |
