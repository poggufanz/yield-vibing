# Roadmap & Backlog — YIELD VIBING

> **Skill Referensi:** architecture-designer + finance-expert
> **Versi:** 1.0 | **Tanggal:** 26 Mei 2026
> **Tujuan:** Roadmap 20 hari hackathon, prioritas fitur, dan manajemen risiko

---

## 1. Ringkasan Roadmap

Deadline: **15 Juni 2026** (20 hari dari 26 Mei).
Submission platform: HackQuest.
Target: Demo end-to-end vault deposit automation di Sepolia + video 3–5 menit.

---

## 2. Priority Matrix (MoSCoW)

### Must Have

| ID | Fitur | Alasan |
|----|-------|--------|
| M1 | Wallet connect + EIP-7702 account upgrade | Qualification requirement |
| M2 | ERC-7715 permission grant UI | Qualification requirement |
| M3 | VaultDepositor smart contract (swap + deposit) | Core functionality |
| M4 | 1Shot API relay integration | Qualification requirement |
| M5 | End-to-end flow di Sepolia testnet | Demo requirement |
| M6 | Demo video (3–5 menit) | Submission requirement |

### Should Have

| ID | Fitur | Alasan |
|----|-------|--------|
| S1 | Venice AI vault recommendation | Mengejar prize track $3,000 |
| S2 | Permission boundary enforcement (revert on exceed) | Security & judging quality |
| S3 | Status dashboard (tx progress) | UX untuk demo |
| S4 | MockVault contract untuk testnet | Kontrol skenario demo |

### Could Have

| ID | Fitur | Alasan |
|----|-------|--------|
| C1 | APY comparison UI antar vault | Lebih compelling untuk demo |
| C2 | Alert Venice AI kalau APY drop | Nilai tambah tapi bukan inti |
| C3 | Multi-vault support | Extensibility, bukan kebutuhan demo |

### Won't Have (Explicit Out of Scope)

| Fitur | Alasan Dikeluarkan |
|-------|-------------------|
| Cross-chain bridging | Terlalu kompleks, tidak ada nilai tambah judging |
| Remove liquidity automation | High-stakes, timing-sensitive, bukan scope |
| Custom AMM/DEX | Reinventing wheel, bukan nilai hackathon ini |
| Mainnet deployment | Tidak aman untuk demo, testnet cukup |

---

## 3. Milestone per Fase

### Fase 1: Foundation (Day 1–3 | 26–28 Mei)

| Hari | Deliverable | Selesai |
|------|-------------|---------|
| Day 1 | Review Solidity fundamentals (storage, events, modifiers) | [ ] |
| Day 2 | Security patterns: validation, access control, CEI pattern | [ ] |
| Day 3 | EIP-7702 + ERC-7715 docs deep dive, setup Smart Accounts Kit, hello-world running | [ ] |

**Milestone gate:** Smart Accounts Kit hello-world berjalan di browser + Sepolia support terkonfirmasi.

### Fase 2: Smart Contract (Day 4–8 | 29 Mei – 2 Juni)

| Hari | Deliverable | Selesai |
|------|-------------|---------|
| Day 4 | Desain kontrak: VaultDepositor spec + interface | [ ] |
| Day 5 | Kontrak inti: permission validation + swap logic interface | [ ] |
| Day 6 | Vault deposit logic + MockVault integration | [ ] |
| Day 7 | Security review: access control, input validation, edge cases | [ ] |
| Day 8 | Testing: success path, fail path, edge cases, fuzz (forge test) | [ ] |

**Milestone gate:** `forge test` semua pass, coverage ≥ 80%.

### Fase 3: Integration (Day 9–13 | 3–7 Juni)

| Hari | Deliverable | Selesai |
|------|-------------|---------|
| Day 9 | 1Shot API integration: gas abstraction setup + test relay | [ ] |
| Day 10 | Frontend: wallet connect + EIP-7702 account upgrade flow | [ ] |
| Day 11 | Frontend: permission request UI (ERC-7715) | [ ] |
| Day 12 | Frontend: vault deposit automation flow + status dashboard | [ ] |
| Day 13 | End-to-end test Sepolia: connect → permission → deposit | [ ] |

**Milestone gate:** Full flow end-to-end berjalan di Sepolia tanpa error.

### Fase 4: Polish & Ship (Day 14–17 | 8–11 Juni)

| Hari | Deliverable | Selesai |
|------|-------------|---------|
| Day 14 | Bug fixes, UX polish, error handling | [ ] |
| Day 15 | Venice AI integration: vault recommendation + summary | [ ] |
| Day 16 | README, dokumentasi, architecture diagram | [ ] |
| Day 17 | Demo video recording (3–5 menit) | [ ] |

**Milestone gate:** Video terupload, semua qualification checklist terpenuhi.

### Fase 5: Buffer (Day 18–20 | 12–15 Juni)

| Hari | Deliverable | Selesai |
|------|-------------|---------|
| Day 18–19 | Buffer untuk unexpected issues | [ ] |
| Day 20 | Final submission di HackQuest (deadline 15 Juni) | [ ] |

---

## 4. Backlog Fitur Utama

### Kontrak (Priority: Tinggi)

- `VaultDepositor.sol` — validasi permission, swap interface, deposit logic
- `MockVault.sol` — mock ERC-4626 vault untuk testnet
- `script/Deploy.s.sol` — Foundry deploy script ke Sepolia
- Foundry tests: unit + integration + fuzz

### Frontend (Priority: Tinggi)

- Wallet connect dengan MetaMask Smart Accounts Kit
- EIP-7702 account upgrade flow
- ERC-7715 permission grant modal (amount + vault address)
- Eksekusi otomatis + status tracker (pending → confirmed)

### Venice AI (Priority: Medium)

- Input form: risk preference + jumlah USDC
- API call ke Venice (base URL: `https://api.venice.ai/api/v1`, OpenAI-compatible)
- Render rekomendasi vault + reasoning human-readable
- Privacy note: "Data tidak disimpan oleh Venice AI"

### 1Shot API (Priority: Tinggi)

- Setup relayer untuk EIP-7710 permissioned transactions
- Test relay di Sepolia
- Error handling kalau relay gagal

---

## 5. Risiko & Mitigasi

| Risiko | Probabilitas | Dampak | Mitigasi |
|--------|-------------|--------|----------|
| Sepolia belum support EIP-7702 | Medium | Tinggi | Cek network support di hari 1 sebelum kode apapun |
| Smart Accounts Kit docs kurang jelas | Tinggi | Medium | Study past hackathon winners sebagai reference |
| Solo burnout | Tinggi | Tinggi | Max 8 jam/hari. Stuck > 2 jam → pivot atau skip |
| Scope creep | Medium | Tinggi | Strict: vault deposit flow only, no new features after Day 13 |
| 1Shot API quota/rate limit | Low | Medium | Test di hari 9, minta akses lebih awal jika perlu |
| Venice AI response lambat | Low | Rendah | Tambahkan loading state + timeout 10 detik |
| Demo video kualitas buruk | Low | Medium | Script dulu, record terakhir, max 5 menit |
