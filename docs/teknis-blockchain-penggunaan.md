# Blockchain — Vibing Farmer

> **Skill Referensi:** blockchain-developer + web3-expert
> **Versi:** 2.0 | **Tanggal:** 27 Mei 2026
> **Tujuan:** Dokumentasi teknis penggunaan blockchain: on-chain vs off-chain, smart contract scope, audit trail, risiko

---

## 1. Ringkasan Peran Blockchain

Blockchain digunakan sebagai **execution layer** dan **per-agent permission enforcer** — bukan sebagai data store. Semua validasi permission dan eksekusi deposit terjadi on-chain sehingga tamper-proof dan dapat diverifikasi per agent.

**Network:** Sepolia testnet (Ethereum)  
**EIP yang digunakan:**
- **EIP-7702:** Set code for EOA — upgrade EOA ke smart account secara persistent (Pectra, Mar 5 2025)
- **ERC-7715:** Scoped permission request via `wallet_requestExecutionPermissions` (per agent)
- **ERC-7710:** Smart contract delegation — interface untuk relay permissioned transactions via 1Shot

---

## 2. Komponen On-Chain vs Off-Chain

### On-Chain

| Komponen | Kontrak | Deskripsi |
|----------|---------|-----------|
| Per-agent permission validation | `AgentVaultDepositor.sol` | Cek scope per agentId sebelum eksekusi |
| Swap execution | `AgentVaultDepositor.sol` | Interface ke DEX (mock untuk testnet) |
| Vault deposit | `AgentVaultDepositor.sol` | Deposit ke ERC-4626 vault per agent |
| Mock vault A + B | `MockVault.sol` × 2 | Simulasi vault ERC-4626, 2 instance |
| EOA upgrade | EIP-7702 (via MetaMask Flask) | Set code untuk smart account behavior |

### Off-Chain

| Komponen | Teknologi | Deskripsi |
|----------|-----------|-----------|
| AI coordinator | Venice AI API | Strategy generation + skill auto-generation per agent |
| Gas relay | 1Shot Permissionless Relayer | Submit tx on-chain tanpa user bayar gas |
| Orchestrator Agent | JavaScript (frontend) | Terima plan, dispatch Workers paralel |
| Worker Agents | JavaScript (frontend) | Single vault Swap→Approve→Deposit per agent |
| Skill files | JSON (local) | Per-agent skill configuration, user-approved |
| Memory files | JSON (local) | Per-agent execution log, append-only |
| UI + graph | HTML/JS + vis.js | Frontend trigger semua flow + real-time visualization |
| Permission UI | MetaMask Flask | User approve/revoke ERC-7715 per agent |

---

## 3. Smart Contract Scope

### `AgentVaultDepositor.sol`

**State:**

```solidity
struct AgentPermission {
    address allowedVault;   // vault spesifik per agent
    uint256 maxAmount;      // batas jumlah USDC
    uint256 usedAmount;     // jumlah yang sudah dieksekusi
    uint256 expiresAt;      // timestamp expiry
    bool isActive;          // status permission
}

// Per-user, per-agent permission (nested mapping)
mapping(address user => mapping(bytes32 agentId => AgentPermission)) public agentPermissions;
```

**Fungsi utama:**

```solidity
// Grant permission untuk satu agent (dipanggil oleh user, sebelum eksekusi)
function grantAgentPermission(
    bytes32 agentId,
    address vault,
    uint256 maxAmount,
    uint256 expiresAt
) external;

// Eksekusi deposit untuk satu agent (CEI pattern, dipanggil via 1Shot relay)
function executeAgentDeposit(
    bytes32 agentId,
    address user,
    address vault,
    uint256 amount
) external nonReentrant;

// Revoke permission untuk satu agent
function revokeAgentPermission(bytes32 agentId) external;

// View: cek apakah permission valid
function validateAgentPermission(
    bytes32 agentId,
    address user,
    address vault,
    uint256 amount
) external view returns (bool);
```

**Events (semua di-listen oleh frontend + vis.js graph):**

```solidity
event AgentStarted(bytes32 indexed agentId, address indexed user, address vault);
event SwapExecuted(bytes32 indexed agentId, address indexed user, uint256 amountIn, uint256 amountOut);
event ApproveExecuted(bytes32 indexed agentId, address indexed user, address vault, uint256 amount);
event DepositExecuted(bytes32 indexed agentId, address indexed user, address vault, uint256 amount, uint256 shares);
event AgentCompleted(bytes32 indexed agentId, address indexed user, address vault, uint256 shares);
event AgentFailed(bytes32 indexed agentId, address indexed user, string reason);
```

**Security constraints:**
- CEI pattern (Checks → Effects → Interactions) di `executeAgentDeposit`
- `require(amount <= agentPermissions[user][agentId].maxAmount - usedAmount)` — revert jika exceed
- `require(vault == agentPermissions[user][agentId].allowedVault)` — revert jika vault berbeda
- `require(block.timestamp < agentPermissions[user][agentId].expiresAt)` — revert jika expired
- `require(agentPermissions[user][agentId].isActive)` — revert jika permission tidak aktif
- `nonReentrant` modifier (OpenZeppelin ReentrancyGuard)
- Tidak ada admin key atau privileged role

---

### `MockVault.sol`

**Interface:** ERC-4626 (Tokenized Vault Standard)

**Fungsi yang diimplementasikan:**
- `deposit(uint256 assets, address receiver) returns (uint256 shares)`
- `balanceOf(address account) returns (uint256)`
- `totalAssets() returns (uint256)`
- `asset() returns (address)` — mock USDC address

**Deploy:** 2 instances untuk demo (MockVault USDC-A dan MockVault USDC-B)  
APY dan vault metadata disimpan off-chain (frontend mock), bukan on-chain.

---

## 4. AgentId Generation

AgentId adalah `bytes32` yang digunakan sebagai key di `agentPermissions` mapping.

```javascript
// Frontend — generate agentId
const agentId = ethers.keccak256(ethers.toUtf8Bytes("worker-agent-1"));
// Result: 0x<32 bytes hash>
```

AgentId deterministic dari session: sama agentId string = sama bytes32 = bisa re-use permission jika belum expired.

---

## 5. Audit Trail & Verifikasi

Setiap langkah eksekusi menghasilkan on-chain evidence yang bisa diverifikasi di Sepolia Etherscan:

| Langkah | Evidence On-Chain |
|---------|------------------|
| EOA upgrade | EIP-7702 authorization di transaction |
| Permission grant per agent | `agentPermissions` mapping ter-update (readable via `contract.agentPermissions(user, agentId)`) |
| Agent started | `AgentStarted` event dengan agentId |
| Swap execution | `SwapExecuted` event |
| Approve | `ApproveExecuted` event |
| Vault deposit | `DepositExecuted` event + MockVault balance change |
| Gas relayed by 1Shot | `from` address = 1Shot relayer (bukan user wallet) |
| Agent completed | `AgentCompleted` event dengan shares minted |

**Cara verifikasi di demo:**
1. Buka Sepolia Etherscan dengan TX hash dari agent
2. Tunjukkan `from` = 1Shot relayer address (BUKAN user wallet)
3. Tunjukkan events: `AgentStarted` → `SwapExecuted` → `ApproveExecuted` → `DepositExecuted` → `AgentCompleted`
4. Tunjukkan MockVault balance bertambah untuk 2 vault (2 TX hashes)
5. Tunjukkan `agentId` berbeda untuk setiap Worker Agent → konfirmasi parallel execution

---

## 6. Risiko & Mitigasi

| Risiko | Probabilitas | Mitigasi |
|--------|-------------|---------|
| agentId collision antara agents | Low | Gunakan `keccak256(agentId_string)` — deterministic, collision-resistant |
| ERC-7715 di MetaMask Flask belum stabil | Medium | Gunakan versi Flask yang direkomendasikan docs. Test early (Day 3). |
| Reentrancy di AgentVaultDepositor | Low | CEI pattern + ReentrancyGuard dari OpenZeppelin |
| Permission bypass via crafted calldata | Low | Validasi ketat: vault == allowedVault, amount <= maxAmount - usedAmount |
| 1Shot relay tidak kompatibel EIP-7710 | Medium | Test relay di Day 9 sebelum frontend integration |
| Multiple Workers race condition on-chain | Low | Per-agent permission mapping — tidak ada shared state antar agents |
| MockVault A dan B address tertukar | Low | Hardcode address per agentId di skill file setelah deploy |

---

## 7. Kenapa Blockchain Adalah Inti Solusi

EIP-7702 + ERC-7715 + per-agent permission adalah cryptographic primitive yang memecahkan masalah nyata:

- **EIP-7702:** EOA bertindak seperti smart contract tanpa migrasi wallet. User tetap pakai MetaMask yang sama.
- **ERC-7715:** Scoped permission yang user-controlled, granular per agent. Agent 1 tidak bisa akses vault Agent 2. Bukan full wallet access.
- **Per-agent agentPermissions:** Setiap Worker Agent dibatasi vault-nya sendiri, amount-nya sendiri, expiry-nya sendiri. Boundary enforced on-chain, bukan hanya di frontend.
- **ERC-7710 (via 1Shot):** Gas abstraction permissioned. Relay tidak bisa bertindak di luar scope yang diizinkan.

Kombinasi ketiganya + parallel agent dispatch adalah solusi teknis yang genuine untuk masalah DeFi UX + agent trust yang sudah divalidasi dari data pasar.
