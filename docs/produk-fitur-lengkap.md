# Fitur Lengkap — YIELD VIBING

> **Skill Referensi:** mobile-developer + blockchain-developer
> **Versi:** 1.0 | **Tanggal:** 26 Mei 2026
> **Tujuan:** Daftar lengkap functional requirements, prioritas, dan dependensi integrasi

---

## 1. Ringkasan

YIELD VIBING mengotomatisasi vault deposit flow dengan menggabungkan:
- **EIP-7702** — upgrade EOA ke smart account secara transien
- **ERC-7715** — permission request JSON-RPC untuk scoped execution
- **1Shot API** — permissionless relay (EIP-7710) untuk gas abstraction
- **Venice AI** — AI recommendation yang privacy-first

Scope: Vault deposit automation. Bukan full yield farming lifecycle.

---

## 2. Functional Requirements (FR)

### FR-01: Venice AI Vault Recommendation

**Deskripsi:** User memasukkan preferensi (jumlah USDC, risk level) dan menerima rekomendasi vault dari Venice AI.

**Input:**
- Jumlah USDC (angka)
- Risk level: Low / Medium / High

**Output:**
- Nama vault + address kontrak
- Estimasi APY
- Reasoning singkat (human-readable, ≤ 3 kalimat)
- Privacy badge "Powered by Venice AI — No data retention"

**Constraint:**
- Gunakan Venice AI API (`https://api.venice.ai/api/v1`) — OpenAI-compatible
- Model: `llama-3.3-70b` atau setara
- Timeout: 10 detik
- Data vault (APY, TVL) boleh mock untuk hackathon

---

### FR-02: Wallet Connect & EIP-7702 Smart Account Upgrade

**Deskripsi:** User connect wallet MetaMask, aplikasi mengupgrade EOA ke smart account via EIP-7702 authorization.

**Flow:**
1. Detect MetaMask extension
2. Request `eth_requestAccounts`
3. Cek apakah akun sudah smart account atau masih EOA
4. Jika EOA: trigger EIP-7702 authorization (persistent delegation)
5. Tampilkan status upgrade

**Constraint:**
- Gunakan MetaMask Smart Accounts Kit
- Network: Sepolia testnet
- Handle case akun sudah jadi smart account (skip upgrade)

---

### FR-03: Permission Grant via ERC-7715

**Deskripsi:** User men-set scoped permission untuk agent — batasan vault, batasan jumlah, dan durasi.

**Permission yang di-grant:**
- `allowedVault`: address vault yang diizinkan
- `maxAmount`: jumlah maksimum USDC yang bisa diswap + deposit
- `expiresAt`: timestamp expiry permission (default: 24 jam)

**Flow:**
1. Tampilkan modal permission dengan detail yang jelas
2. Panggil `wallet_requestExecutionPermissions` (ERC-7715)
3. Simpan permission context untuk digunakan relay
4. Tampilkan status "Permission Active"

**Constraint:**
- Permission scope harus tampil jelas sebelum user approve
- Harus ada tombol "Revoke Permission" setelah grant

---

### FR-04: Automated Vault Deposit Execution

**Deskripsi:** Agent mengeksekusi swap → approve → deposit secara otomatis dalam batas permission, tanpa interaksi user lebih lanjut.

**Flow eksekusi:**
1. Baca permission context yang sudah di-grant
2. Validasi scope (jumlah ≤ maxAmount, vault == allowedVault)
3. Kirim relay request ke 1Shot API dengan permission context
4. 1Shot relay eksekusi via EIP-7710:
   - Swap USDC (jika perlu)
   - Approve vault
   - Deposit ke vault
5. Update status dashboard per step

**Constraint:**
- Semua tx via 1Shot relayer (user tidak bayar gas)
- Jika agent coba exceed permission → revert, bukan silent fail
- Tampilkan Etherscan link per transaksi

---

### FR-05: Status Dashboard

**Deskripsi:** Real-time tracker yang menampilkan progress eksekusi setiap step.

**State per step:**
- `idle` — belum mulai
- `pending` — menunggu konfirmasi
- `confirmed` — tx sukses (dengan tx hash)
- `failed` — error (dengan pesan error)

**Tampilan:**
- Stepper visual: Swap → Approve → Deposit
- TX hash + Etherscan link setelah confirmed
- Summary akhir: "Deposit berhasil — X USDC earning Y% APY"

---

### FR-06: Permission Revocation

**Deskripsi:** User dapat mencabut permission kapanpun sebelum/setelah eksekusi.

**Flow:**
1. Tampilkan tombol "Revoke Permission" setelah permission aktif
2. Panggil fungsi revoke via Smart Accounts Kit
3. Update UI: "Permission dicabut — agent tidak bisa eksekusi"

---

## 3. Prioritas (MoSCoW)

| FR | Fitur | Prioritas |
|----|-------|-----------|
| FR-02 | Wallet Connect + EIP-7702 | Must |
| FR-03 | ERC-7715 Permission Grant | Must |
| FR-04 | Automated Execution via 1Shot | Must |
| FR-05 | Status Dashboard | Must |
| FR-01 | Venice AI Recommendation | Should |
| FR-06 | Permission Revocation | Should |

---

## 4. Platform Considerations

| Aspek | Detail |
|-------|--------|
| Browser | Chrome / Brave (MetaMask extension support) |
| Wallet | MetaMask Extension (terbaru) |
| Network | Sepolia testnet |
| Smart Contract | Solidity ^0.8.24, Foundry |
| Frontend | HTML/CSS/JS + ethers.js v6 |
| AI | Venice AI API (OpenAI-compatible) |
| Relay | 1Shot API (EIP-7710) |

---

## 5. Integrasi & Dependensi

| Komponen | Dependensi | Catatan |
|----------|-----------|---------|
| MetaMask Smart Accounts Kit | `@metamask/smart-accounts` | Latest |
| ethers.js | `ethers` v6 | Frontend web3 interaction |
| Venice AI | REST API + API key | `https://api.venice.ai/api/v1` |
| 1Shot API | REST API + EIP-7710 permission context | Gas-free relay |
| Foundry | `forge`, `cast`, `anvil` | Smart contract dev + test |

---

## 6. Referensi

- EIP-7702: https://eips.ethereum.org/EIPS/eip-7702
- ERC-7715: https://eips.ethereum.org/EIPS/eip-7715
- ERC-7710: https://eips.ethereum.org/EIPS/eip-7710
- MetaMask Smart Accounts Kit: https://docs.metamask.io/wallet/smart-accounts/
- Venice AI Docs: https://docs.venice.ai/
- 1Shot API Docs: https://1shotapi.com/docs
