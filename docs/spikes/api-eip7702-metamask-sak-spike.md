---
title: "EIP-7702 + MetaMask Smart Accounts Kit Integration"
category: "API Integration"
status: "🔴 Not Started"
priority: "High"
timebox: "3 days"
created: 2026-05-26
updated: 2026-05-26
owner: "Muhammad Faiq"
tags: ["technical-spike", "api-integration", "eip-7702", "metamask", "smart-accounts"]
---

# EIP-7702 + MetaMask Smart Accounts Kit Integration

## Summary

**Spike Objective:** Determine if EIP-7702 EOA-to-smart-account upgrade works on Sepolia via MetaMask Smart Accounts Kit, and identify the exact SDK setup required for the yield-vibing flow.

**Why This Matters:** EIP-7702 is the foundational layer. If Sepolia doesn't support it or the SDK setup is non-trivial, the entire architecture shifts. Blocks VaultDepositor contract design and frontend wallet integration.

**Timebox:** 3 days

**Decision Deadline:** 2026-05-29 — must resolve before writing VaultDepositor.sol or wallet connect UI.

---

## Research Question(s)

**Primary Question:** Does Sepolia fully support EIP-7702 today, and can MetaMask Smart Accounts Kit upgrade an EOA in a single user interaction?

**Secondary Questions:**

- What version of MetaMask Smart Accounts Kit is current, and what are the install/import patterns?
- What RPC calls does EIP-7702 require, and does Sepolia's public RPC support them?
- Can the upgrade be done without a custom bundler/paymaster, or does it need 1Shot relay from the start?
- What does the MetaMask UI show to the user during the upgrade transaction?

---

## Investigation Plan

### Research Tasks

- [ ] Check EIP-7702 activation status on Sepolia (Ethereum devnet tracker, Berachain, Etherscan Sepolia)
- [ ] Read MetaMask Smart Accounts Kit docs — find install command, `createSmartAccount` or equivalent API
- [ ] Test minimal EIP-7702 `authorization` struct signing via ethers.js on Sepolia
- [ ] Check if MetaMask wallet itself supports signing EIP-7702 auth or requires SDK middleware
- [ ] Find example repos using MetaMask SAK on testnet
- [ ] Verify `eth_sendTransaction` with type `0x04` (EIP-7702 tx type) works on Sepolia RPC

### Success Criteria

**This spike is complete when:**

- [ ] Confirmed Sepolia supports EIP-7702 (or identified blocker with workaround)
- [ ] Working minimal example: EOA signs EIP-7702 authorization, tx broadcast on Sepolia
- [ ] MetaMask SAK version + exact import pattern documented
- [ ] Clear decision: can we upgrade EOA in frontend with MetaMask, or need alternative approach?

---

## Technical Context

**Related Components:**
- `VaultDepositor.sol` — needs to know if caller is upgraded EOA or standard EOA
- Frontend wallet connect flow — MetaMask provider setup
- ERC-7715 spike (depends on this being resolved first)

**Dependencies:**
- ERC-7715 spike blocked until EOA upgrade flow is confirmed

**Constraints:**
- MetaMask Extension only (no WalletConnect / mobile)
- Sepolia testnet (not mainnet, not other L2)
- Solo dev — complexity budget is limited

---

## Research Findings

### Investigation Results

_[Fill during spike]_

### Prototype/Testing Notes

_[Paste Sepolia tx hash, error logs, or working code snippet here]_

### External Resources

- [MetaMask Smart Accounts Kit docs](https://docs.metamask.io/wallet/smart-accounts/)
- [EIP-7702 spec](https://eips.ethereum.org/EIPS/eip-7702)
- [Sepolia block explorer](https://sepolia.etherscan.io/)
- [Ethereum EIP-7702 devnet status](https://github.com/ethereum/go-ethereum/issues)
- [MetaMask SAK GitHub](https://github.com/MetaMask/smart-accounts-kit)

---

## Decision

### Recommendation

_[Fill after investigation]_

### Rationale

_[Why this approach vs alternatives]_

### Implementation Notes

```solidity
// Expected: VaultDepositor checks for delegated EOA
// If EIP-7702 confirmed on Sepolia:
//   - EOA will have code = delegation designator
//   - Can call execute() on EOA directly
```

### Follow-up Actions

- [ ] If EIP-7702 works: update VaultDepositor.sol interface to assume smart account caller
- [ ] If EIP-7702 NOT on Sepolia: evaluate EIP-4337 + Pimlico/Bundler as fallback
- [ ] Update architecture doc with confirmed approach
- [ ] Create ERC-7715 spike (unblock)

---

## Status History

| Date       | Status         | Notes                              |
| ---------- | -------------- | ---------------------------------- |
| 2026-05-26 | 🔴 Not Started | Spike created, highest priority    |

---

_Last updated: 2026-05-26 by Muhammad Faiq_
