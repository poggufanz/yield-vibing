# Arsitektur Teknis — YIELD VIBING

> **Skill Referensi:** architecture-designer
> **Versi:** 1.0 | **Tanggal:** 26 Mei 2026
> **Tujuan:** Ringkasan arsitektur, prinsip desain, data flow, ADR, NFR, dan failure modes

---

## 1. Ringkasan Arsitektur

YIELD VIBING adalah aplikasi DeFi berbasis web yang mengotomatisasi vault deposit flow menggunakan:
- **Smart Contract** sebagai execution engine + permission enforcer
- **MetaMask Smart Accounts Kit** sebagai wallet layer (EIP-7702 + ERC-7715)
- **1Shot API** sebagai gas abstraction layer (EIP-7710 relay)
- **Venice AI** sebagai recommendation layer (off-chain, privacy-first)
- **Frontend** sebagai orchestration layer

---

## 2. Prinsip Desain

| Prinsip | Penerapan |
|---------|-----------|
| Permission-bounded execution | Agent hanya bertindak dalam batas ERC-7715 yang user set |
| Gas abstraction | User tidak bayar gas — relay oleh 1Shot |
| Privacy-first AI | Venice AI tidak menyimpan data user |
| Fail-safe default | Contract revert (bukan silent fail) jika scope violation |
| Minimal on-chain footprint | Logic sesederhana mungkin di contract |
| No admin keys | Kontrak tidak punya privileged role setelah deploy |

---

## 3. Diagram Arsitektur

```
┌─────────────────────────────────────────────────────────┐
│                     USER BROWSER                        │
│                                                         │
│  ┌────────────┐    ┌────────────────────────────────┐  │
│  │ Venice AI  │    │       YIELD VIBING UI           │  │
│  │  (Input)   │◄───│  HTML/CSS/JS + ethers.js v6    │  │
│  └──────┬─────┘    └──────────────┬─────────────────┘  │
│         │                         │                     │
│         ▼                         ▼                     │
│  ┌────────────┐    ┌────────────────────────────────┐  │
│  │ Venice AI  │    │     MetaMask Extension         │  │
│  │  REST API  │    │  EIP-7702: EOA → Smart Account │  │
│  └────────────┘    │  ERC-7715: Permission Grant    │  │
│                    └──────────────┬─────────────────┘  │
└───────────────────────────────────┼─────────────────────┘
                                    │ permission context
                                    ▼
             ┌────────────────────────────────────┐
             │        1Shot API Relayer           │
             │  EIP-7710: Permissioned Relay      │
             │  Gas dibayar relayer, bukan user   │
             └───────────────┬────────────────────┘
                             │
                             ▼
             ┌────────────────────────────────────┐
             │         SEPOLIA TESTNET            │
             │                                    │
             │  ┌──────────────────────────────┐  │
             │  │     VaultDepositor.sol        │  │
             │  │  validatePermission()         │  │
             │  │  executeSwap()                │  │
             │  │  depositToVault()             │  │
             │  └───────────────┬───────────────┘  │
             │                  ▼                   │
             │  ┌──────────────────────────────┐  │
             │  │      MockVault.sol           │  │
             │  │    (ERC-4626 mock)           │  │
             │  └──────────────────────────────┘  │
             └────────────────────────────────────┘
```

---

## 4. Data Flow

```
1. User input preference (amount, risk)
   → Venice AI API → vault recommendation
2. User connect MetaMask → EIP-7702 upgrade EOA ke smart account
3. User grant ERC-7715 permission (vault, maxAmount, expiry)
4. Frontend → 1Shot API relay request + permission context
5. 1Shot → VaultDepositor:
   a. validatePermission(user, vault, amount)
   b. executeSwap(amount)
   c. approve(vault, amount)
   d. deposit(amount) → MockVault
6. VaultDepositor emits: SwapExecuted, DepositExecuted
7. Frontend listen events → update status dashboard
8. User lihat: "Deposit berhasil — X USDC earning Y% APY"
```

---

## 5. ADR (Architecture Decision Records)

### ADR-01: Foundry sebagai Smart Contract Framework

**Keputusan:** Gunakan Foundry untuk development dan testing.

**Alasan:** Native Solidity testing, fuzz testing built-in, fast runner, standar industri DeFi hackathon.

**Ditolak:** Hardhat — terlalu banyak boilerplate untuk solo hackathon.

---

### ADR-02: HTML/CSS/JS + ethers.js (bukan React)

**Keputusan:** Plain HTML/CSS/JS dengan ethers.js v6.

**Alasan:** Lebih cepat setup, tidak butuh build pipeline, focus pada logika Web3.

**Ditolak:** React — overkill untuk demo video 5 menit.

---

### ADR-03: Venice AI sebagai AI Layer

**Keputusan:** Venice AI, bukan OpenAI atau Anthropic.

**Alasan:** Required untuk prize track $3,000, privacy-first (no data retention), OpenAI-compatible.

---

### ADR-04: MockVault (bukan integrasi real vault)

**Keputusan:** Buat MockVault.sol sendiri untuk testnet.

**Alasan:** Kontrol penuh atas demo, tidak ada dependency ke protocol eksternal, APY bisa di-mock.

---

## 6. NFR (Non-Functional Requirements)

| Aspek | Target |
|-------|--------|
| Waktu eksekusi full flow | < 60 detik |
| Venice AI response time | < 10 detik |
| Gas cost untuk user | 0 (via 1Shot) |
| Browser support | Chrome / Brave terbaru |
| Smart contract test coverage | ≥ 80% |

---

## 7. Failure Modes

| Failure | Dampak | Mitigasi |
|---------|--------|---------|
| EIP-7702 tidak support di Sepolia | Blocker | Verifikasi di Day 1 |
| MetaMask permission dialog tidak muncul | Demo gagal | Test di browser bersih sebelum record |
| 1Shot relay timeout | Tx tidak terkonfirmasi | Retry 1x otomatis |
| Venice AI API key invalid | Recommendation tidak muncul | Test API key sebelum demo |
| MockVault deposit gagal | Demo gagal | Unit test sebelum deploy ke Sepolia |
| Contract revert karena permission exceeded | Tx ditolak | Design intent — tampilkan error jelas |
