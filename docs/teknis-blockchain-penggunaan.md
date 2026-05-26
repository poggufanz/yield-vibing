# Blockchain — YIELD VIBING

> **Skill Referensi:** blockchain-developer + web3-expert
> **Versi:** 1.0 | **Tanggal:** 26 Mei 2026
> **Tujuan:** Dokumentasi teknis penggunaan blockchain: on-chain vs off-chain, smart contract scope, audit trail, risiko

---

## 1. Ringkasan Peran Blockchain

Blockchain digunakan sebagai **execution layer** dan **permission enforcer** — bukan sebagai data store. Semua logika penting (validasi permission, swap, deposit) terjadi on-chain sehingga tamper-proof dan dapat diverifikasi.

**Network:** Sepolia testnet (Ethereum)
**EIP yang digunakan:**
- **EIP-7702:** Set code for EOA — upgrade EOA ke smart account secara persistent
- **ERC-7715:** Scoped permission request via `wallet_requestExecutionPermissions`
- **ERC-7710:** Smart contract delegation — interface untuk relay permissioned transactions

---

## 2. Komponen On-Chain vs Off-Chain

### On-Chain

| Komponen | Kontrak | Deskripsi |
|----------|---------|-----------|
| Permission validation | `VaultDepositor.sol` | Cek scope sebelum eksekusi |
| Swap execution | `VaultDepositor.sol` | Interface ke DEX (mock untuk testnet) |
| Vault deposit | `VaultDepositor.sol` | Deposit ke ERC-4626 vault |
| Mock vault | `MockVault.sol` | Simulasi vault ERC-4626 |
| EOA upgrade | EIP-7702 (via MetaMask) | Set code untuk smart account behavior |

### Off-Chain

| Komponen | Teknologi | Deskripsi |
|----------|-----------|-----------|
| AI recommendation | Venice AI API | Vault suggestion berdasarkan preferensi user |
| Gas relay | 1Shot API | Submit tx on-chain tanpa user bayar gas |
| UI orchestration | HTML/JS + ethers.js | Frontend trigger semua flow |
| Permission UI | MetaMask Extension | User approve/revoke ERC-7715 permission |

---

## 3. Smart Contract Scope

### `VaultDepositor.sol`

**Fungsi utama:**

```solidity
// Eksekusi deposit dengan validasi permission (CEI pattern)
function executeDeposit(
    address user,
    address vault,
    uint256 amount,
    bytes calldata permissionContext
) external;

// Revoke permission
function revokePermission(address user) external;
```

**Events:**

```solidity
event PermissionGranted(address indexed user, address vault, uint256 maxAmount, uint256 expiresAt);
event SwapExecuted(address indexed user, uint256 amountIn, uint256 amountOut);
event DepositExecuted(address indexed user, address vault, uint256 amount, uint256 shares);
event PermissionRevoked(address indexed user, address vault);
event ExecutionFailed(address indexed user, string reason);
```

**Security constraints:**
- CEI pattern (Checks → Effects → Interactions) di semua fungsi
- `require(amount <= maxAmount)` — revert jika exceed
- `require(vault == allowedVault)` — revert jika vault berbeda
- `require(block.timestamp < expiresAt)` — revert jika expired
- Tidak ada admin key atau privileged role

---

### `MockVault.sol`

**Interface:** ERC-4626 (Tokenized Vault Standard)

**Fungsi yang diimplementasikan:**
- `deposit(uint256 assets, address receiver) returns (uint256 shares)`
- `balanceOf(address account) returns (uint256)`
- `totalAssets() returns (uint256)`

APY dan vault metadata disimpan off-chain (frontend mock), bukan on-chain.

---

## 4. Audit Trail & Verifikasi

Setiap langkah eksekusi menghasilkan on-chain evidence yang bisa diverifikasi di Sepolia Etherscan:

| Langkah | Evidence On-Chain |
|---------|------------------|
| EOA upgrade | EIP-7702 authorization di transaction |
| Permission grant | `PermissionGranted` event |
| Swap execution | `SwapExecuted` event |
| Vault deposit | `DepositExecuted` event + MockVault balance change |
| Gas relayed by 1Shot | `from` address = relayer, bukan user |

**Cara verifikasi di demo:**
1. Buka Sepolia Etherscan dengan TX hash
2. Tunjukkan `from` = relayer address (bukan user wallet)
3. Tunjukkan events: SwapExecuted + DepositExecuted
4. Tunjukkan MockVault balance bertambah

---

## 5. Risiko & Mitigasi

| Risiko | Probabilitas | Mitigasi |
|--------|-------------|---------|
| ERC-7715 di MetaMask belum stabil | Tinggi | Gunakan versi MetaMask yang direkomendasikan docs |
| Reentrancy di VaultDepositor | Low | CEI pattern + ReentrancyGuard dari OpenZeppelin |
| Permission bypass via crafted calldata | Low | Validasi ketat: vault == allowedVault, amount <= maxAmount |
| 1Shot relay tidak kompatibel EIP-7710 | Medium | Test relay di Day 9 sebelum frontend integration |

---

## 6. Catatan: Kenapa Blockchain Adalah Inti Solusi

EIP-7702 + ERC-7715 bukan gimmick — mereka memecahkan masalah nyata:

- **EIP-7702:** EOA bertindak seperti smart contract tanpa migrasi wallet. User tetap pakai MetaMask yang sama.
- **ERC-7715:** Scoped permission yang user-controlled. Agent bisa eksekusi, tapi hanya dalam batas yang user tentukan. Bukan full wallet access.
- **ERC-7710 (via 1Shot):** Gas abstraction permissioned. Relay tidak bisa bertindak di luar scope yang diizinkan.

Kombinasi ketiganya adalah solusi teknis yang genuine untuk masalah DeFi UX yang sudah divalidasi dari data pasar.
