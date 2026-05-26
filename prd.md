# YIELD VIBING — Hackathon Project Plan

## Hackathon Info

- **Event:** MetaMask Smart Accounts Kit x 1Shot API x Venice AI Dev Cook Off
- **Deadline:** 15 Juni 2026
- **Prize Pool:** $11,000
- **Pengumuman:** 22 Juni 2026
- **Platform:** HackQuest
- **Waktu tersedia:** ~20 hari (dari 26 Mei 2026)
- **Mode:** Solo

---

## Pain Point (Hasil Research dari X/Twitter 2025–2026)

### Problem Utama: Yield Farming UX yang Broken

Yield farmer harus melakukan **8+ transaksi manual** untuk satu flow rebalance/compound:

1. Remove liquidity → sign approve/burn NFT
2. Receive token mentah (ETH + USDC)
3. Swap token → sign approve + execute swap
4. Supply ke lending protocol (Aave) → sign supply + use as collateral
5. Borrow asset → sign execute borrow
6. Deposit ke vault → sign approve + deposit & stake

**Setiap langkah = popup MetaMask, gas fee, risiko salah klik.**

### Voices dari User (Verbatim dari X)

> "Are you tired of the tedious, multi-step dance of adjusting liquidity in DeFi? Removing liquidity, claiming fees, and adding it back in a new price range can feel like navigating a maze blindfolded." — @John_Peace1

> "Normally it's: bridge → swap → find the right vault → deposit… and hope you didn't miss a step 😭" — @kokocodes

> "agent finance UX is still broken. Today you choose between: full wallet access (risky) • human over-control (co-approving every step)." — @0xYann_

> "approve every tx manually, kills automation. give AI full wallet access, too risky." — @Celina6644

> "only ~15–18% of wallet connects end in a real transaction." — @agnt_hub

### Step Paling Menyakitkan (Dari Research)

1. **Removing liquidity / exiting positions** — multi-tx, gas boros, timing kritis
2. **Vault deposit flow** — bridge → swap → approve → deposit, gampang salah step

---

## Solusi: YIELD VIBING

### Elevator Pitch

> Automated vault deposit flow untuk yield farmer — user set permission sekali via ERC-7715, agent eksekusi swap → approve → deposit otomatis, tanpa popup berulang, dalam batas yang user tentukan sendiri.

### Scope (Realistis untuk 20 Hari Solo)

**Fokus: Vault Deposit Flow Automation** — bukan seluruh yield farming lifecycle.

Flow yang di-automate:
1. User connect wallet (EIP-7702 enabled EOA)
2. User set scoped permission via ERC-7715: "boleh swap max X token dan deposit ke vault Y"
3. Agent eksekusi otomatis: swap → approve → deposit
4. User tetap pegang kendali via permission boundaries
5. Kalau agent coba exceed limit → ditolak otomatis

**Kenapa scope ini:**
- Flow linear dan predictable
- Langsung showcase EIP-7702 + ERC-7715
- Demo yang clean dan understandable (3-5 menit video)
- Stakes lebih rendah daripada exit/rebalance yang timing-sensitive

### Bukan Scope (Explicit)

- ❌ Full yield farming protocol
- ❌ Removing liquidity automation (terlalu high-stakes)
- ❌ Cross-chain bridging
- ❌ Custom AMM/DEX
- ❌ Real mainnet deployment

---

## Tech Stack

### Required by Hackathon

- **MetaMask Smart Accounts Kit** — EIP-7702 + ERC-7715 integration
- **1Shot API Permissionless Relayer** — gas abstraction, EIP-7710 transactions
- **Venice AI** — optional tapi bisa boost judging (AI-powered yield suggestion?)

### Development

- **Smart Contracts:** Solidity + Foundry
- **Frontend:** HTML/CSS/JS + ethers.js (atau React jika perlu)
- **Testnet:** Sepolia (atau chain yang support EIP-7702)
- **Wallet:** MetaMask Extension

---

## Qualification Checklist

- [ ] Project uses MetaMask Smart Accounts or Advanced Permissions
- [ ] Integration via MetaMask Smart Accounts Kit
- [ ] Demo video shows working integration in main flow
- [ ] EIP-7702 authorizations to upgrade accounts to smart accounts via 1Shot Permissionless Relayer
- [ ] If using 1Shot API, demo must show it being used

---

## Timeline (20 Hari)

### Phase 1: Foundation (Day 1–3, 26-28 Mei)

- [ ] Day 1 — Review Solidity fundamentals (compress Day 16-17 roadmap)
- [ ] Day 2 — Security patterns: validation, access control, CEI (compress Day 18-19 roadmap)
- [ ] Day 3 — Deep dive EIP-7702 + ERC-7715 docs, setup Smart Accounts Kit, run hello-world example

### Phase 2: Smart Contract (Day 4–8, 29 Mei - 2 Juni)

- [ ] Day 4 — Design contract architecture: VaultDepositor contract spec
- [ ] Day 5 — Write core contract: permission validation, swap logic interface
- [ ] Day 6 — Write vault deposit logic, integration with mock vault
- [ ] Day 7 — Security review: access control, input validation, edge cases
- [ ] Day 8 — Testing: success path, fail path, edge cases, fuzz

### Phase 3: Integration (Day 9–13, 3-7 Juni)

- [ ] Day 9 — 1Shot API integration: gas abstraction setup
- [ ] Day 10 — Frontend: wallet connect + EIP-7702 account upgrade flow
- [ ] Day 11 — Frontend: permission request UI (ERC-7715)
- [ ] Day 12 — Frontend: vault deposit automation flow + status dashboard
- [ ] Day 13 — End-to-end test on testnet: full flow from connect to deposit

### Phase 4: Polish & Ship (Day 14–17, 8-11 Juni)

- [ ] Day 14 — Bug fixes, UX polish, error handling
- [ ] Day 15 — Venice AI integration (optional: AI yield suggestion)
- [ ] Day 16 — README, documentation, architecture diagram
- [ ] Day 17 — Demo video recording (3-5 menit)

### Phase 5: Buffer (Day 18–20, 12-15 Juni)

- [ ] Day 18-19 — Buffer untuk unexpected issues
- [ ] Day 20 — Final submission (deadline 15 Juni)

---

## Risiko & Mitigasi

| Risiko | Probabilitas | Mitigasi |
|--------|-------------|----------|
| EIP-7702 belum support di Sepolia | Medium | Cek supported networks di docs dulu sebelum mulai |
| Smart Accounts Kit docs kurang jelas | High | Liat past hackathon winners untuk reference implementasi |
| Solo = burnout | High | Timebox per hari, max 8 jam. Kalau stuck > 2 jam, pivot |
| Scope creep | Medium | Stick ke vault deposit flow only. No feature creep |
| Demo video quality | Low | Script dulu, record last, keep under 5 menit |

---

## Reference & Resources

### Dokumentasi

- MetaMask Smart Accounts Kit: https://docs.metamask.io/wallet/smart-accounts/
- 1Shot API: https://1shotapi.com/docs
- Venice AI API: https://venice.ai/
- EIP-7702: https://eips.ethereum.org/EIPS/eip-7702
- ERC-7715: https://eips.ethereum.org/EIPS/eip-7715

### Past Hackathon Winners (Study These)

- MetaMask Smart Accounts x Monad Dev Cook Off winners
- MetaMask Delegation Toolkit DTK Dev Cook-Off winners
- MetaMask Advanced Permissions Dev Cook-Off submissions

### Pain Point Research Sources

- X/Twitter complaints (2025-2026) — compiled in this document
- DeFi user behavior data dari @agnt_hub (15-18% wallet connect completion rate)

---

## Key Decision: Jalur Developer

**Security-aware Smart Contract Dev** — build products dengan security mindset dari awal.

Portfolio ini bukan cuma "project hackathon" tapi juga demonstration bahwa:
1. Bisa bikin produk yang solve real problem
2. Punya security habit (validation, access control, failure-path thinking)
3. Ngerti EIP-7702/ERC-7715 — cutting edge Web3 primitives

---

## Next Immediate Action

1. Cek apakah Sepolia (atau network lain) udah support EIP-7702
2. Setup MetaMask Smart Accounts Kit locally
3. Run hello-world example dari docs
4. Study past hackathon winners untuk reference scope dan quality bar


# Tambahan (Wajib dimasukkan juga)
Oke, ini scope tambahan Venice AI yang bisa diintegrasiin ke VIBE YIELD:

---

## Venice AI Integration Scope

**Use case yang makes sense untuk VIBE YIELD:**

> User kasih input: "Gw punya 500 USDC, mau yield farming yang low risk" → Venice AI rekomendasiin vault terbaik berdasarkan APY, risk profile, dan kondisi market saat ini → user approve permission sekali → agent eksekusi otomatis

**Konkretnya Venice AI ngapain:**
- Analisa kondisi vault (APY, TVL, risk score)
- Rekomendasiin allocation strategy berdasarkan user preference
- Generate human-readable summary: "Vault ini safe karena X, expected yield Y per bulan"
- Alert kalau kondisi berubah drastis (APY drop, TVL exodus)

**Kenapa ini strong untuk judging:**
- Venice AI = privacy-first, data user nggak di-log → align sama Web3 ethos
- Bukan gimmick — genuinely useful buat user yang nggak mau riset manual
- Showcase AI + Web3 integration yang meaningful

---

**Flow lengkap VIBE YIELD dengan Venice AI:**

```
User input preference (risk level, amount)
    → Venice AI analisa & rekomendasiin vault
        → User review rekomendasi
            → User set permission via ERC-7715
                → 1Shot Relayer eksekusi gas-free
                    → Agent deposit ke vault otomatis
```

---

Track yang bisa dikejar sekaligus:
- ✅ Best Agent ($3,000)
- ✅ Best use of Venice AI ($3,000)
- ✅ Best Use of 1Shot Permissionless Relayer ($1,000 USDC)
