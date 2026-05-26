---
title: "ERC-7715 Scoped Permissions — Grant Flow & Enforcement"
category: "Architecture & Design"
status: "🔴 Not Started"
priority: "High"
timebox: "3 days"
created: 2026-05-26
updated: 2026-05-26
owner: "Muhammad Faiq"
tags: ["technical-spike", "architecture", "erc-7715", "permissions", "agent"]
---

# ERC-7715 Scoped Permissions — Grant Flow & Enforcement

## Summary

**Spike Objective:** Determine how ERC-7715 scoped permissions are granted, stored, and validated — both from MetaMask SDK side and from VaultDepositor contract side — for the yield-vibing agent flow.

**Why This Matters:** ERC-7715 is the core security primitive. It defines what the agent CAN do without repeated user approval. Wrong implementation = either broken UX (constant popups) or broken security (agent can exceed user limits). Directly shapes VaultDepositor.sol architecture.

**Timebox:** 3 days

**Decision Deadline:** 2026-05-30 — must resolve before implementing VaultDepositor permission validation logic.

---

## Research Question(s)

**Primary Question:** How does an EOA (upgraded via EIP-7702) grant ERC-7715 scoped permissions to an agent address, and how does VaultDepositor.sol validate those permissions on-chain?

**Secondary Questions:**

- What is the exact ERC-7715 permission object format (ABI, struct, signature scheme)?
- Does MetaMask SAK provide a `grantPermission()` UI or must we build custom signing UI?
- Are permissions stored on-chain or off-chain (signed message)?
- How does the agent pass the permission to VaultDepositor — calldata? separate `permit` call?
- What does permission revocation look like?
- Are there existing ERC-7715 reference implementations on Sepolia?

---

## Investigation Plan

### Research Tasks

- [ ] Read ERC-7715 full spec — identify `Permission` struct, signing domain, validation interface
- [ ] Check MetaMask SAK docs for `requestPermissions()` or `wallet_grantPermissions` RPC method
- [ ] Find existing ERC-7715 implementations on GitHub (search: `erc-7715 solidity`)
- [ ] Determine: are permissions validated via signature recovery on-chain, or via separate registry?
- [ ] Test `wallet_grantPermissions` JSON-RPC call via MetaMask on Sepolia
- [ ] Design VaultDepositor permission validation pseudocode
- [ ] Check if 1Shot relayer supports forwarding ERC-7715 permission data in relay calls

### Success Criteria

**This spike is complete when:**

- [ ] `Permission` struct format documented (ABI-encodable)
- [ ] Grant flow confirmed: user interaction steps mapped (click → MetaMask popup → signed permission)
- [ ] On-chain validation approach decided (signature recovery vs registry)
- [ ] VaultDepositor permission check interface drafted
- [ ] Confirmed: MetaMask SAK provides `wallet_grantPermissions` or equivalent

---

## Technical Context

**Related Components:**
- `VaultDepositor.sol` — `validatePermission()` function design
- Frontend — permission grant UI step (Step 2 in user flow)
- Agent (off-chain) — reads permission boundaries before calling VaultDepositor

**Dependencies:**
- Blocked by: EIP-7702 spike (EOA must be upgraded before granting permissions)
- Blocks: VaultDepositor.sol implementation, 1Shot API integration

**Constraints:**
- Permission scope: max USDC amount + specific vault address
- No privileged admin roles — permissions must be self-sovereign
- Must be revocable by user

---

## Research Findings

### ERC-7715 Permission Object (Expected)

```solidity
// Expected structure (verify against actual spec)
struct Permission {
    address signer;      // agent address allowed to act
    address target;      // VaultDepositor contract
    bytes4  selector;    // allowed function selector
    uint256 maxAmount;   // max USDC the agent can use
    uint256 expiry;      // unix timestamp
    bytes   data;        // additional constraints
}
```

### Investigation Results

_[Fill during spike]_

### Prototype/Testing Notes

```javascript
// Expected MetaMask RPC call (verify actual method name)
const permission = await ethereum.request({
  method: 'wallet_grantPermissions',
  params: [{
    signer: AGENT_ADDRESS,
    permissions: [{
      type: 'native-token-transfer',  // or vault-deposit custom type
      data: { maxAmount: '500000000' } // 500 USDC
    }]
  }]
});
```

### External Resources

- [ERC-7715 spec](https://eips.ethereum.org/EIPS/eip-7715)
- [MetaMask Smart Accounts Kit docs](https://docs.metamask.io/wallet/smart-accounts/)
- [ERC-7715 reference impl search](https://github.com/search?q=erc-7715&type=repositories)
- [EIP-7710 (delegation framework)](https://eips.ethereum.org/EIPS/eip-7710)

---

## Decision

### Recommendation

_[Fill after investigation]_

### Rationale

_[On-chain signature recovery vs off-chain registry — why]_

### Implementation Notes

```solidity
// VaultDepositor.sol — permission validation sketch
function executeWithPermission(
    Permission calldata perm,
    bytes calldata sig,
    uint256 amount,
    address vault
) external {
    // Checks
    require(block.timestamp < perm.expiry, "Permission expired");
    require(amount <= perm.maxAmount, "Exceeds permission scope");
    require(vault == perm.approvedVault, "Vault not in scope");
    require(_recoverSigner(perm, sig) == user, "Invalid permission sig");
    
    // Effects
    // ... update state
    
    // Interactions
    // ... swap + deposit
}
```

### Follow-up Actions

- [ ] Finalize Permission struct in VaultDepositor.sol
- [ ] Build frontend permission grant UI component
- [ ] Write unit tests for permission validation
- [ ] Confirm 1Shot relayer forwards permission data correctly

---

## Status History

| Date       | Status         | Notes                                          |
| ---------- | -------------- | ---------------------------------------------- |
| 2026-05-26 | 🔴 Not Started | Spike created, blocked until EIP-7702 confirmed |

---

_Last updated: 2026-05-26 by Muhammad Faiq_
