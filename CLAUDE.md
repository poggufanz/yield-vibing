# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project: YIELD VIBING

Hackathon: MetaMask Smart Accounts Kit x 1Shot API x Venice AI Dev Cook Off  
Deadline: 15 Juni 2026 | Prize: $11,000 | Solo

**Core product:** Automated vault deposit flow for yield farmers. User sets scoped permissions once (ERC-7715), agent executes swap → approve → deposit without repeated MetaMask popups.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Smart Contracts | Solidity + Foundry |
| Frontend | HTML/CSS/JS + ethers.js (React if complexity warrants) |
| Wallet Integration | MetaMask Extension + Smart Accounts Kit |
| Permissions | EIP-7702 (EOA upgrade) + ERC-7715 (scoped permissions) |
| Gas Abstraction | 1Shot API Permissionless Relayer (EIP-7710) |
| AI Layer | Venice AI (vault recommendations, privacy-first) |
| Testnet | Sepolia (verify EIP-7702 support before starting) |

---

## Commands

### Smart Contracts (Foundry)

```bash
# Install Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup

# Build
forge build

# Test all
forge test

# Single test with verbose output
forge test --match-test testFunctionName -vvv

# Fuzz test
forge test --match-test testFuzz -vvv --fuzz-runs 1000

# Coverage
forge coverage

# Deploy to Sepolia
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC --broadcast --verify
```

### Frontend

```bash
# Plain HTML/JS — serve locally
npx serve .

# If React added later
npm install && npm run dev
```

---

## Architecture

```
User Wallet (EOA)
    │ EIP-7702: upgrade to smart account
    ▼
MetaMask Smart Accounts Kit
    │ ERC-7715: grant scoped permission (max swap X, deposit to vault Y)
    ▼
Agent (off-chain or contract-based)
    │ reads permission boundaries
    ▼
VaultDepositor Contract
    ├── validate permission scope
    ├── execute swap (DEX interface)
    ├── approve + deposit to vault
    └── revert if agent exceeds user-defined limits
    │
    ▼ (gas abstraction)
1Shot API Permissionless Relayer (EIP-7710)

Venice AI (pre-flow, optional)
    └── input: user risk preference + amount
    └── output: recommended vault + human-readable summary
```

### Key Contracts

- **`VaultDepositor.sol`** — core: permission validation, swap interface, vault deposit logic
- **`MockVault.sol`** — test vault for local/testnet dev
- **`script/Deploy.s.sol`** — Foundry deploy script for Sepolia

### User Flow

1. Connect wallet → EIP-7702 upgrades EOA to smart account
2. User sets permission: "allow swap max 500 USDC + deposit to vault 0x..."
3. Venice AI (optional): recommends vault based on risk/amount input
4. Agent reads permission boundaries → calls VaultDepositor via 1Shot relay
5. VaultDepositor validates scope → executes swap → deposits to vault

---

## Key Docs

- MetaMask Smart Accounts Kit: https://docs.metamask.io/wallet/smart-accounts/
- 1Shot API: https://1shotapi.com/docs
- EIP-7702: https://eips.ethereum.org/EIPS/eip-7702
- ERC-7715: https://eips.ethereum.org/EIPS/eip-7715
- Venice AI: https://venice.ai/

---

## Hackathon Qualification Checklist

- [ ] Uses MetaMask Smart Accounts or Advanced Permissions
- [ ] Integrates via MetaMask Smart Accounts Kit
- [ ] Demo video shows EIP-7702 + ERC-7715 in main flow
- [ ] 1Shot API used for gas abstraction — shown in demo
- [ ] Venice AI integration (targets Best use of Venice AI track)

## Prize Tracks Targeted

- Best Agent ($3,000)
- Best use of Venice AI ($3,000)
- Best Use of 1Shot Permissionless Relayer ($1,000 USDC)

---

## Security Constraints (Smart Contract)

Enforce in every contract action:
- Permission scope validated before execution (amount ≤ user max, vault == user-approved)
- CEI pattern: Checks → Effects → Interactions
- Input validation on all external call parameters
- Explicit revert when agent tries to exceed limits — never silent fail
- No privileged admin roles post-deploy
