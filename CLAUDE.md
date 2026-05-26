# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: YIELD VIBING

Hackathon: MetaMask Smart Accounts Kit x 1Shot API x Venice AI Dev Cook Off  
Deadline: 15 Juni 2026 | Prize: $11,000 | Solo

**Core product:** Automated vault deposit flow for yield farmers. User sets scoped permissions once (ERC-7715), agent executes swap → approve → deposit without repeated MetaMask popups.

---

## Directory Structure (Planned)

```
contracts/
  VaultDepositor.sol     # Core: permission validation + swap + deposit
  MockVault.sol          # ERC-4626 mock vault for testnet
test/
  VaultDepositor.t.sol   # Forge tests
script/
  Deploy.s.sol           # Foundry deploy script
frontend/
  index.html             # Main UI
  app.js                 # ethers.js v6 wallet + contract logic
  venice.js              # Venice AI recommendation module
  relay.js               # 1Shot API relay module
  style.css
docs/
  teknis-arsitektur.md   # Full architecture + ADRs + NFRs + failure modes
  teknis-blockchain-penggunaan.md  # On-chain vs off-chain, contract scope, audit trail
  teknis-keamanan-privasi.md       # Security constraints
  teknis-api-events.md             # Event definitions
  produk-demo-skenario.md          # Demo script (read before recording)
  spikes/                # Technical research — resolve before implementing
```

---

## Commands

### Smart Contracts (Foundry)

```bash
# Install Foundry (first time)
curl -L https://foundry.paradigm.xyz | bash && foundryup

# Build
forge build

# Test all
forge test

# Single test with verbose output
forge test --match-test testFunctionName -vvv

# Fuzz test
forge test --match-test testFuzz -vvv --fuzz-runs 1000

# Coverage (target ≥ 80%)
forge coverage

# Deploy to Sepolia
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC --broadcast --verify
```

### Frontend

```bash
# Serve locally (plain HTML/JS)
npx serve frontend/
```

### Environment Variables

Copy `.env.example` → `.env` before any deployment or API testing:

```bash
SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0x...           # deployer key (never commit)
ONESHOT_API_KEY=...         # 1Shot API key
VENICE_API_KEY=...          # Venice AI API key
VAULT_DEPOSITOR_ADDRESS=0x...  # filled after deploy
MOCK_VAULT_ADDRESS=0x...       # filled after deploy
```

---

## Architecture

```
User Wallet (EOA)
    │ EIP-7702: upgrade to smart account
    ▼
MetaMask Smart Accounts Kit
    │ ERC-7715: wallet_requestExecutionPermissions (vault, maxAmount, expiry)
    ▼
Frontend (orchestrator)
    │ builds calldata + permission context
    ▼
1Shot API Permissionless Relayer (EIP-7710)
    │ user pays 0 gas
    ▼
VaultDepositor.sol
    ├── validatePermission(user, vault, amount, permContext) — CHECKS
    ├── executeSwap(amount)                                  — INTERACTIONS
    ├── approve(vault, amount)
    └── deposit(amount) → MockVault.sol (ERC-4626)          — INTERACTIONS

Venice AI (pre-flow, off-chain)
    └── OpenAI-compatible REST API → vault recommendation JSON
```

### Key Contracts

- **`VaultDepositor.sol`** — `executeDeposit(user, vault, amount, permissionContext)` — validates ERC-7715 scope then executes swap → deposit. CEI pattern enforced.
- **`MockVault.sol`** — ERC-4626 mock. Implements `deposit()`, `balanceOf()`, `totalAssets()`.
- **`script/Deploy.s.sol`** — deploys both contracts to Sepolia.

### VaultDepositor Events (frontend must listen)

```solidity
PermissionGranted(address indexed user, address vault, uint256 maxAmount, uint256 expiresAt)
SwapExecuted(address indexed user, uint256 amountIn, uint256 amountOut)
DepositExecuted(address indexed user, address vault, uint256 amount, uint256 shares)
PermissionRevoked(address indexed user, address vault)
ExecutionFailed(address indexed user, string reason)
```

### User Flow

1. Connect wallet → EIP-7702 upgrades EOA to smart account
2. Venice AI (optional): user inputs risk level + amount → receives vault recommendation JSON
3. User grants ERC-7715 permission: `wallet_requestExecutionPermissions` (vault address, maxAmount, expiry)
4. Frontend → 1Shot API relay request with permission context
5. 1Shot → VaultDepositor: validates scope → executes swap → deposits to MockVault
6. Frontend listens to `SwapExecuted` + `DepositExecuted` events → updates status UI

---

## Key Implementation Notes

**ethers.js version:** Use v6. v6 has breaking changes from v5 (BigInt not BigNumber, `provider.getSigner()` is async, `Contract` import path changed).

**Venice AI:** OpenAI-compatible API (`/api/v1/chat/completions`). Use `response_format: { type: 'json_object' }` for structured vault recommendation output.

**1Shot API:** Sepolia support must be verified (see spike). Handles nonce + gas. `from` in relay tx = relayer address (not user wallet) — this is the demo evidence of gas abstraction.

**Security — enforce in every contract function:**
- Amount ≤ user-defined maxAmount (revert if exceeded, never silent fail)
- Vault address == user-approved vault (revert if different)
- `block.timestamp < expiresAt` (revert if permission expired)
- CEI pattern: all checks before all interactions
- No privileged admin roles post-deploy
- ReentrancyGuard on `executeDeposit`

---

## Technical Spikes

Resolve before implementing. See `docs/spikes/`:

| Spike | File | Blocks |
|-------|------|--------|
| EIP-7702 + MetaMask SAK | `api-eip7702-metamask-sak-spike.md` | Everything |
| ERC-7715 scoped permissions | `architecture-erc7715-scoped-permissions-spike.md` | VaultDepositor design |
| 1Shot API relayer | `api-1shot-permissionless-relayer-spike.md` | Agent/relay layer |
| Venice AI capabilities | `api-venice-ai-vault-recommendation-spike.md` | Frontend AI step |

---

## Hackathon Qualification Checklist

- [ ] Uses MetaMask Smart Accounts Kit (EIP-7702 + ERC-7715) in main flow
- [ ] Demo video shows EIP-7702 upgrade + ERC-7715 permission grant
- [ ] 1Shot API relays the deposit tx — demo shows `from` = relayer on Sepolia Etherscan
- [ ] Venice AI recommendation shown before permission grant step
- [ ] All 3 prize tracks demonstrable in ≤ 5 min video

## Prize Tracks

- Best Agent — $3,000
- Best use of Venice AI — $3,000
- Best Use of 1Shot Permissionless Relayer — $1,000 USDC

---

## Key Docs

- [Architecture + ADRs + failure modes](docs/teknis-arsitektur.md)
- [On-chain scope + audit trail + risks](docs/teknis-blockchain-penggunaan.md)
- [Demo script](docs/produk-demo-skenario.md)
- MetaMask Smart Accounts Kit: https://docs.metamask.io/wallet/smart-accounts/
- EIP-7702: https://eips.ethereum.org/EIPS/eip-7702
- ERC-7715: https://eips.ethereum.org/EIPS/eip-7715
- 1Shot API: https://1shotapi.com/docs
- Venice AI: https://venice.ai/
