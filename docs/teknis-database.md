# Database & Data Model — Vibing Farmer

> **Skill Referensi:** database-schema-designer
> **Versi:** 2.0 | **Tanggal:** 27 Mei 2026
> **Tujuan:** Dokumentasi data model, storage strategy, dan kebijakan retensi data

---

## 1. Ringkasan Data Model

Vibing Farmer **tidak menggunakan database tradisional** (SQL/NoSQL). State disimpan di empat lokasi:

| Layer | Storage | Data yang Disimpan |
|-------|---------|-------------------|
| On-chain (Sepolia) | Smart contract storage | Per-agent permission state, tx events (audit trail) |
| File sistem lokal | JSON files (`agents/`) | Skill files per agent, memory files per agent |
| Browser | `localStorage` / `sessionStorage` | Session state, UI state, permissionContext per agent |
| Off-chain ephemeral | API response | Venice AI strategy + skill output, 1Shot relay status |

Tidak ada server backend, tidak ada database yang dikelola developer.

---

## 2. On-Chain Storage (Smart Contract)

### `AgentVaultDepositor.sol` — State Variables

```solidity
struct AgentPermission {
    address allowedVault;   // vault yang diizinkan untuk agent ini
    uint256 maxAmount;      // batas jumlah USDC (dalam wei)
    uint256 usedAmount;     // jumlah yang sudah dieksekusi
    uint256 expiresAt;      // timestamp expiry (Unix)
    bool isActive;          // status permission
}

// Nested mapping: user address → agentId → permission
mapping(address user => mapping(bytes32 agentId => AgentPermission)) public agentPermissions;
```

### Event Log (On-Chain Audit Trail — Immutable)

| Event | Fields |
|-------|--------|
| `AgentStarted` | agentId, user, vault |
| `SwapExecuted` | agentId, user, amountIn, amountOut |
| `ApproveExecuted` | agentId, user, vault, amount |
| `DepositExecuted` | agentId, user, vault, amount, shares |
| `AgentCompleted` | agentId, user, vault, shares |
| `AgentFailed` | agentId, user, reason |

---

## 3. Skill Files (JSON, Local)

### Path

```
agents/
  session-{sessionId}/
    agent-1-skills.json
    agent-2-skills.json
```

### Schema (per file)

```json
{
  "agentId": "worker-agent-1",
  "sessionId": "session-20260609-001",
  "vaultAddress": "0xMockVaultA",
  "vaultName": "MockVault USDC-A",
  "skills": {
    "swap": {
      "maxSlippage": 0.5,
      "dexPreference": "uniswap-v3",
      "maxRetries": 2,
      "timeoutSeconds": 30
    },
    "deposit": {
      "maxAmount": "50000000",
      "vaultAddress": "0xMockVaultA",
      "expiresAt": 1749686400
    }
  },
  "generatedBy": "venice-ai",
  "approvedByUser": true,
  "approvedAt": 1748387100
}
```

### Lifecycle

1. Venice AI generates skill JSON → stored in memory (not file yet)
2. User reviews + edits via Skill Card UI
3. User approves → file written to `agents/session-{id}/agent-{n}-skills.json`
4. Worker Agent reads skill file before execution
5. Skill file adalah read-only setelah diapprove

---

## 4. Memory Files (JSON, Local — Append-Only)

### Path

```
agents/
  memory/
    agent-1-memory.json
    agent-2-memory.json
```

### Schema (per file)

```json
{
  "agentId": "worker-agent-1",
  "vault": "0xMockVaultA",
  "entries": [
    {
      "sessionId": "session-20260609-001",
      "timestamp": 1748387200,
      "step": "swap",
      "status": "success",
      "gasUsed": 45000,
      "slippageActual": 0.12,
      "executionTimeMs": 4200,
      "txHash": "0xABC123...",
      "lesson": "MockVault A accepts 0.5% slippage reliably"
    },
    {
      "sessionId": "session-20260609-001",
      "timestamp": 1748387260,
      "step": "deposit",
      "status": "success",
      "sharesReceived": "50023456",
      "executionTimeMs": 3800,
      "txHash": "0xDEF456..."
    }
  ]
}
```

### Lifecycle

1. Worker Agent selesai (success atau failure) → write entry ke memory file
2. Entry di-append ke `entries` array (tidak pernah overwrite)
3. Pada sesi berikutnya: memory file dibaca → feed ke Venice AI prompt sebagai context
4. Memory ditampilkan di vis.js node detail panel

---

## 5. Browser Storage

### `sessionStorage` (hilang saat tab ditutup)

| Key | Value (contoh) | Deskripsi |
|-----|----------------|-----------|
| `vf_permission_context_agent1` | JSON string | ERC-7715 context untuk Worker Agent 1 |
| `vf_permission_context_agent2` | JSON string | ERC-7715 context untuk Worker Agent 2 |
| `vf_strategy` | JSON string | Venice AI strategy untuk session ini |
| `vf_skills_approved` | `"true"` | Apakah user sudah approve skills |
| `vf_execution_state` | JSON string | Status eksekusi semua agents |

### `localStorage` (persisten lintas sesi)

| Key | Value (contoh) | Deskripsi |
|-----|----------------|-----------|
| `vf_connected_address` | `"0x1234...5678"` | Wallet address terakhir |
| `vf_network` | `"sepolia"` | Network terakhir |
| `vf_last_session_id` | `"session-20260609-001"` | Session ID terakhir |

---

## 6. Entitas Utama

### Strategy Object (ephemeral, dari Venice AI)

```json
{
  "sessionId": "session-20260609-001",
  "totalAmount": "100000000",
  "riskLevel": "Low",
  "vaultCount": 2,
  "vaults": [
    {
      "vaultAddress": "0xMockVaultA",
      "vaultName": "MockVault USDC-A",
      "amount": "50000000",
      "estimatedAPY": 7.8,
      "reasoning": "Vault A konservatif, cocok untuk risk profile Low."
    },
    {
      "vaultAddress": "0xMockVaultB",
      "vaultName": "MockVault USDC-B",
      "amount": "50000000",
      "estimatedAPY": 8.2,
      "reasoning": "Vault B stable APY, risk masih acceptable."
    }
  ]
}
```

### Per-Agent Permission (off-chain representation)

```json
{
  "agentId": "worker-agent-1",
  "agentIdBytes32": "0x<keccak256>",
  "userAddress": "0x1234...5678",
  "allowedVault": "0xMockVaultA",
  "maxAmount": "50000000",
  "usedAmount": "0",
  "expiresAt": 1749686400,
  "isActive": true,
  "permissionContext": "<ERC-7715 context string from MetaMask Flask>"
}
```

### Execution State (session)

```json
{
  "sessionId": "session-20260609-001",
  "orchestratorStatus": "completed",
  "agents": [
    {
      "agentId": "worker-agent-1",
      "vault": "0xMockVaultA",
      "status": "confirmed",
      "steps": [
        { "name": "swap", "status": "confirmed", "txHash": "0xABC..." },
        { "name": "approve", "status": "confirmed", "txHash": "0xDEF..." },
        { "name": "deposit", "status": "confirmed", "txHash": "0xGHI...", "shares": "50023456" }
      ]
    },
    {
      "agentId": "worker-agent-2",
      "vault": "0xMockVaultB",
      "status": "confirmed",
      "steps": [
        { "name": "swap", "status": "confirmed", "txHash": "0xJKL..." },
        { "name": "approve", "status": "confirmed", "txHash": "0xMNO..." },
        { "name": "deposit", "status": "confirmed", "txHash": "0xPQR...", "shares": "50034567" }
      ]
    }
  ]
}
```

---

## 7. Relasi Utama

```
User Wallet Address
    │
    └── N AgentPermissions (on-chain: agentPermissions[user][agentId])
            ├── agentId-1 → AgentPermission { vault: VaultA, maxAmount, usedAmount, expiresAt }
            └── agentId-2 → AgentPermission { vault: VaultB, maxAmount, usedAmount, expiresAt }

Session ID
    │
    ├── Strategy JSON (ephemeral)
    │
    ├── Skill Files (local JSON, agents/session-{id}/)
    │   ├── agent-1-skills.json
    │   └── agent-2-skills.json
    │
    └── Memory Files (local JSON, agents/memory/)
        ├── agent-1-memory.json  ← appended per session
        └── agent-2-memory.json  ← appended per session

On-Chain Events (immutable, per agentId)
    ├── AgentStarted
    ├── SwapExecuted
    ├── ApproveExecuted
    ├── DepositExecuted
    ├── AgentCompleted
    └── AgentFailed
```

---

## 8. Query Penting

| Query | Method | Kapan Digunakan |
|-------|--------|----------------|
| Cek permission aktif per agent | `contract.agentPermissions(userAddress, agentIdBytes32)` | Sebelum eksekusi |
| Riwayat deposit per agent | `queryFilter(DepositExecuted, {agentId})` | Status dashboard |
| Vault balance (agent 1) | `mockVaultA.balanceOf(userAddress)` | Setelah deposit |
| Vault balance (agent 2) | `mockVaultB.balanceOf(userAddress)` | Setelah deposit |
| Agent memory (lokal) | Read `agents/memory/agent-{n}-memory.json` | Node detail panel |

---

## 9. Retensi Data & Privasi

| Data | Retensi | Catatan |
|------|---------|---------|
| On-chain events | Permanen (blockchain immutable) | Tidak bisa dihapus |
| Smart contract state | Sampai permission expired atau revoked | Testnet only |
| Skill files (`agents/`) | Satu sesi — bisa di-clear manual | User kontrol penuh |
| Memory files (`agents/memory/`) | Persisten antar sesi (append-only) | User bisa hapus manual |
| `localStorage` | Manual clear via browser | User kontrol penuh |
| `sessionStorage` | Hilang saat tab ditutup | Otomatis |
| Venice AI conversation | **Tidak disimpan** | No retention — Venice AI policy |
| 1Shot relay logs | Kebijakan 1Shot | Di luar kontrol developer |

**Privacy note:** Data input user (jumlah USDC, risk level) tidak dikirim ke server developer. Venice AI tidak menyimpan data conversation. Skill dan memory files tersimpan lokal di browser/filesystem user — tidak pernah dikirim ke server manapun.
