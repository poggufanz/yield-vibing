---
title: "1Shot API Permissionless Relayer — EIP-7710 Gas Abstraction"
category: "API Integration"
status: "🔴 Not Started"
priority: "High"
timebox: "2 days"
created: 2026-05-26
updated: 2026-05-26
owner: "Muhammad Faiq"
tags: ["technical-spike", "api-integration", "1shot", "eip-7710", "gas-abstraction", "relay"]
---

# 1Shot API Permissionless Relayer — EIP-7710 Gas Abstraction

## Summary

**Spike Objective:** Determine how 1Shot API permissionless relayer works, what it costs, and how VaultDepositor calls are routed through it so the user pays zero gas for agent-executed transactions.

**Why This Matters:** 1Shot relay is a required prize track (Best Use of 1Shot Permissionless Relayer — $1,000 USDC). Also critical UX: user shouldn't pay gas for agent actions after setting permissions. If 1Shot doesn't support Sepolia or the API is complex, need fallback plan.

**Timebox:** 2 days

**Decision Deadline:** 2026-05-31 — must resolve before building agent execution layer.

---

## Research Question(s)

**Primary Question:** How does 1Shot API accept, sign, and broadcast relay transactions — what is the exact request format, and does it support Sepolia + EIP-7702 smart accounts?

**Secondary Questions:**

- Does 1Shot support Sepolia testnet, or mainnet only?
- Is there an API key required, and how long does provisioning take?
- What transaction types does 1Shot relay support (EIP-1559, EIP-7702, type 0x04)?
- Does 1Shot forward ERC-7715 permission data as calldata, or strip it?
- What are rate limits and latency characteristics?
- Does 1Shot handle nonce management, or must the caller provide nonce?
- Is there a webhook/callback for relay status, or must we poll?

---

## Investigation Plan

### Research Tasks

- [ ] Read 1Shot API docs — find relay endpoint, request schema, auth method
- [ ] Check 1Shot Sepolia support (testnet page or Discord)
- [ ] Sign up / request API key if needed
- [ ] Test minimal relay call: simple ETH transfer on Sepolia via 1Shot
- [ ] Test relay call with calldata (simulating VaultDepositor call)
- [ ] Check if 1Shot supports EIP-7710 `execute()` on delegated EOA
- [ ] Measure relay latency (time from API call to tx confirmed on Sepolia)
- [ ] Review 1Shot pricing / rate limits

### Success Criteria

**This spike is complete when:**

- [ ] 1Shot Sepolia support confirmed (or blocker documented)
- [ ] API key obtained and working
- [ ] Minimal relay tx broadcasted and confirmed on Sepolia (with tx hash)
- [ ] Request schema documented (headers, body, auth)
- [ ] Latency measured (< 30s target for hackathon demo)
- [ ] Clear integration pattern for VaultDepositor relay call

---

## Technical Context

**Related Components:**
- Agent (off-chain) — sends relay request to 1Shot after reading permissions
- `VaultDepositor.sol` — must be callable via relay (no `msg.sender` assumptions)
- Frontend — may show relay status / tx hash

**Dependencies:**
- Partially depends on: ERC-7715 spike (to know what calldata agent sends)
- Blocks: Agent execution layer implementation

**Constraints:**
- Agent pays relay fee (not user) — or 1Shot sponsors it on testnet
- Tx must be attributable to user's smart account (not relayer address)
- Prize track requires 1Shot visible in demo flow

---

## Research Findings

### Expected Request Format (verify against docs)

```javascript
// Hypothetical 1Shot relay request
const response = await fetch('https://api.1shotapi.com/v1/relay', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${ONESHOT_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    chainId: 11155111,  // Sepolia
    to: VAULT_DEPOSITOR_ADDRESS,
    data: encodedCalldata,
    from: USER_SMART_ACCOUNT,  // delegated EOA
    // 1Shot handles gas
  })
});
const { txHash, status } = await response.json();
```

### Investigation Results

_[Fill during spike — paste actual API response, tx hashes]_

### Prototype/Testing Notes

_[Fill during spike]_

### External Resources

- [1Shot API docs](https://1shotapi.com/docs)
- [EIP-7710 spec](https://eips.ethereum.org/EIPS/eip-7710)
- [1Shot Discord / support](https://discord.gg/1shot)  ← verify link
- [Sepolia Etherscan](https://sepolia.etherscan.io/)

---

## Decision

### Recommendation

_[Fill after investigation]_

### Rationale

_[Why this relay approach vs self-relaying or Pimlico/Gelato]_

### Implementation Notes

```javascript
// Agent execution flow with 1Shot
async function executeVaultDeposit(permission, amount, vault) {
  // 1. Build calldata
  const calldata = vaultDepositor.interface.encodeFunctionData(
    'executeWithPermission',
    [permission, permSig, amount, vault]
  );
  
  // 2. Relay via 1Shot
  const relayResult = await oneShotRelay({
    chainId: SEPOLIA_CHAIN_ID,
    to: VAULT_DEPOSITOR_ADDRESS,
    data: calldata,
    from: userSmartAccount
  });
  
  // 3. Wait for confirmation
  return relayResult.txHash;
}
```

### Follow-up Actions

- [ ] Store 1Shot API key in `.env.example` (not hardcoded)
- [ ] Build `relay.js` agent module
- [ ] Add 1Shot relay step to demo script
- [ ] Show tx hash in frontend UI for demo

---

## Status History

| Date       | Status         | Notes                           |
| ---------- | -------------- | ------------------------------- |
| 2026-05-26 | 🔴 Not Started | Spike created, prize track req  |

---

_Last updated: 2026-05-26 by Muhammad Faiq_
