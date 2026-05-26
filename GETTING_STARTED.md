# GETTING_STARTED.md — YIELD VIBING MVP Plan

Deadline: **15 Juni 2026** · Prize: $11,000 · Solo · Platform: HackQuest

---

## 0. Spike Status — All Resolved ✅

| Spike | Status | Critical Finding |
|-------|--------|-----------------|
| EIP-7702 + MetaMask SAK | ✅ | Sepolia live since March 5, 2025. **MetaMask Flask 13.9+ required** (not regular MM). Viem ESM CDN for auth signing. |
| ERC-7715 scoped permissions | ✅ | VaultDepositor uses own `permissions` mapping. ERC-7715 shown in frontend UI only. `context` stored in sessionStorage. |
| 1Shot API relayer | ✅ | Use Business API (`api.1shotapi.com/v0`). M2M JWT auth. Pre-configure contract method in dashboard. |
| Venice AI | ✅ | OpenAI-compatible. Model: `llama-3.3-70b`. OpenAI SDK via ESM CDN pointed at Venice base URL. |

**Proceed to Phase 2: write contracts.**

---

## 1. MVP Scope

**In scope — must demo:**
- EIP-7702 EOA → smart account upgrade (MetaMask)
- ERC-7715 scoped permission grant (vault + maxAmount + expiry)
- 1Shot relay executing swap → approve → deposit (user pays 0 gas)
- Venice AI vault recommendation (input: amount + risk → output: vault JSON)
- VaultDepositor.sol + MockVault.sol on Sepolia
- Status dashboard: step-by-step tx progress with Etherscan links

**Explicit out of scope:**
- Mainnet deployment
- Real vault protocols (Aave, Compound)
- Cross-chain
- Mobile breakpoints
- Multi-vault dashboard

---

## 2. Target Directory Structure (fully built)

```
yield-vibing/
│
├── contracts/
│   ├── VaultDepositor.sol          # Core — permission check + swap + deposit (CEI + ReentrancyGuard)
│   └── MockVault.sol               # ERC-4626 mock vault for Sepolia demo
│
├── test/
│   ├── VaultDepositor.t.sol        # Forge tests — success path, permission violations, fuzz
│   └── MockVault.t.sol             # Basic ERC-4626 compliance checks
│
├── script/
│   └── Deploy.s.sol                # Deploys VaultDepositor + MockVault to Sepolia
│
├── frontend/
│   ├── index.html                  # App shell — loads ethers v6 + MetaMask SAK via CDN
│   ├── app.js                      # Orchestrator: state machine, event listeners, flow control
│   ├── wallet.js                   # EIP-7702 upgrade + ERC-7715 permission grant/revoke
│   ├── relay.js                    # 1Shot API relay request builder + submission
│   ├── venice.js                   # Venice AI API call + recommendation renderer
│   ├── ui.js                       # DOM manipulation helpers, step tracker updater
│   └── style.css                   # Port from design/styles.css — tokens + components
│
├── design/                         # ✅ EXISTS — v2 prototype, reference implementation
│   ├── YIELD VIBING Prototype.html # Visual reference for frontend/ build
│   ├── styles.css                  # Copy tokens from here to frontend/style.css
│   └── src/
│       ├── app.jsx                 # State machine logic to port to frontend/app.js
│       ├── components.jsx
│       ├── screens.jsx
│       └── tweaks-panel.jsx
│
├── docs/                           # ✅ EXISTS — all in Indonesian
│
├── .env                            # Never commit — copy from .env.example
├── .env.example                    # ✅ TODO: create this
├── .gitignore                      # ✅ EXISTS
├── foundry.toml                    # ✅ TODO: create when init Foundry
├── CLAUDE.md                       # ✅ EXISTS
├── DESIGN.md                       # ✅ EXISTS
└── GETTING_STARTED.md              # ✅ This file
```

---

## 3. Build Order

Dependencies flow top-to-bottom. Don't skip ahead.

```
[SPIKE: EIP-7702 + SAK]
        ↓
[SPIKE: ERC-7715]
        ↓
foundry init + foundry.toml
        ↓
MockVault.sol (simpler, no deps)
        ↓
VaultDepositor.sol (depends on MockVault interface)
        ↓
forge test (≥ 80% coverage gate)
        ↓
forge script Deploy.s.sol → Sepolia
        ↓
[SPIKE: 1Shot API]
        ↓
frontend/wallet.js  ← MetaMask SAK integration
        ↓
frontend/relay.js   ← 1Shot integration
        ↓
[SPIKE: Venice AI]
        ↓
frontend/venice.js  ← Venice AI integration
        ↓
frontend/app.js     ← wire everything together
        ↓
frontend/index.html ← final UI (port from design/)
        ↓
End-to-end Sepolia test
        ↓
Demo video
```

---

## 4. Contract Spec

### `MockVault.sol`

```
ERC-4626 minimal mock.
State:
  - balances: mapping(address → uint256) shares
  - totalDeposited: uint256

Functions:
  deposit(uint256 assets, address receiver) → shares
  balanceOf(address) → uint256
  totalAssets() → uint256
  asset() → address  (returns mock USDC address)

No real yield logic — shares = assets 1:1 for demo.
APY data lives in frontend mock, not on-chain.
```

### `VaultDepositor.sol`

```
State:
  permissions: mapping(address user → Permission)
    Permission { address vault, uint256 maxAmount, uint256 expiresAt, bool active }

Events (frontend must listen):
  PermissionGranted(address indexed user, address vault, uint256 maxAmount, uint256 expiresAt)
  SwapExecuted(address indexed user, uint256 amountIn, uint256 amountOut)
  DepositExecuted(address indexed user, address vault, uint256 amount, uint256 shares)
  PermissionRevoked(address indexed user, address vault)
  ExecutionFailed(address indexed user, string reason)

External functions:
  grantPermission(address vault, uint256 maxAmount, uint256 expiresAt)
  revokePermission()
  executeDeposit(address user, address vault, uint256 amount, bytes permissionContext)
    → CEI pattern:
      CHECKS: validatePermission(user, vault, amount)
      INTERACTIONS: executeSwap(amount) → approve(vault, amount) → MockVault.deposit()
  validatePermission(address user, address vault, uint256 amount) view

Security invariants (revert, never silent fail):
  amount <= permissions[user].maxAmount
  vault == permissions[user].vault
  block.timestamp < permissions[user].expiresAt
  permissions[user].active == true
  ReentrancyGuard on executeDeposit
  No admin roles
```

---

## 5. Frontend Module Responsibilities

### `wallet.js`
- Detect MetaMask extension
- `eth_requestAccounts` → get EOA address
- Check if already smart account (skip upgrade if yes)
- EIP-7702 authorization call via MetaMask SAK
- `wallet_requestExecutionPermissions` (ERC-7715) → returns `permissionContext`
- Store `permissionContext` in `sessionStorage` only
- `revokePermission()` call

### `relay.js`
- Build 1Shot relay request payload from `permissionContext`
- POST to 1Shot API endpoint
- Poll or webhook for tx confirmation
- Return tx hashes for Swap, Approve, Deposit steps
- Retry once on timeout

### `venice.js`
- POST to `https://api.venice.ai/api/v1/chat/completions`
- Model: `llama-3.3-70b`
- `response_format: { type: "json_object" }`
- Prompt: user risk level + amount → vault recommendation JSON
- Expected output shape:
  ```json
  {
    "vault_name": "...",
    "vault_address": "0x...",
    "estimated_apy": 8.2,
    "reasoning": "..."
  }
  ```
- Timeout: 10s
- Fallback: show hardcoded mock vault if Venice fails

### `app.js`
- Stage state machine: `input → recommend → connect → permission → execute → success`
- Wire events from `VaultDepositor` contract (ethers.js `contract.on(...)`)
- Update step tracker UI per `SwapExecuted` / `DepositExecuted` / `ExecutionFailed`
- Read contract addresses from env (injected at build time or hardcoded after deploy)

---

## 6. Integration Points & Gotchas

| Integration | Gotcha |
|-------------|--------|
| ethers.js v6 | `provider.getSigner()` is async. `BigInt` not `BigNumber`. Import: `import { ethers } from "ethers"` via CDN ESM. |
| MetaMask SAK | `wallet_requestExecutionPermissions` returns a signed permission object — the shape is spike-dependent. Check spike result first. |
| 1Shot API | `from` in relayed tx = relayer address (not user wallet). This is the demo evidence of gas abstraction — capture Etherscan link showing relayer as `from`. |
| Venice AI | API base: `https://api.venice.ai/api/v1`. Key in `.env` as `VENICE_API_KEY`. Don't call from contract — frontend only. |
| ERC-7715 `permissionContext` | Opaque bytes passed through 1Shot → `executeDeposit`. Exact format depends on SAK version — resolve in spike 2. |
| `sessionStorage` for permContext | Cleared on tab close. If user reloads mid-flow, prompt re-grant. |

---

## 7. Environment Setup

```bash
# 1. Install Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup

# 2. Init Foundry project (run once)
forge init --no-git   # --no-git because repo already exists

# 3. Install OpenZeppelin
forge install OpenZeppelin/openzeppelin-contracts

# 4. Copy env
cp .env.example .env
# Fill: SEPOLIA_RPC, PRIVATE_KEY, ONESHOT_API_KEY, VENICE_API_KEY

# 5. Serve design prototype (reference)
npx serve design/
```

`foundry.toml` minimal config:
```toml
[profile.default]
src = "contracts"
out = "out"
libs = ["lib"]
solc = "0.8.24"

[rpc_endpoints]
sepolia = "${SEPOLIA_RPC}"

[etherscan]
sepolia = { key = "${ETHERSCAN_API_KEY}" }
```

---

## 8. MVP Completion Checklist

Before recording demo video:

**Smart Contracts**
- [ ] `forge build` clean
- [ ] `forge test` all pass
- [ ] `forge coverage` ≥ 80%
- [ ] Both contracts deployed to Sepolia
- [ ] Contract addresses in `.env`

**Frontend**
- [ ] Wallet connect → EIP-7702 upgrade visible in MetaMask
- [ ] ERC-7715 permission dialog appears in MetaMask
- [ ] Venice AI recommendation renders before permission step
- [ ] 1Shot relay fires — `from` = relayer on Sepolia Etherscan
- [ ] Step tracker updates: Swap → Approve → Deposit
- [ ] `DepositExecuted` event renders success screen

**Demo Video Must Show (≤ 5 min)**
- [ ] EIP-7702 EOA upgrade interaction in MetaMask
- [ ] ERC-7715 `wallet_requestExecutionPermissions` dialog
- [ ] Deposit tx on Sepolia Etherscan — `from` = 1Shot relayer address
- [ ] Venice AI recommendation step
- [ ] Success screen with shares/APY

**Hackathon Tracks**
- [ ] Best Agent ($3,000) — permission-bounded automation visible
- [ ] Best Venice AI ($3,000) — recommendation + reasoning shown
- [ ] Best 1Shot Relayer ($1,000 USDC) — gas abstraction evidenced on Etherscan
