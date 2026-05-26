---
title: "1Shot API Permissionless Relayer — EIP-7710 Gas Abstraction"
category: "API Integration"
status: "✅ Resolved"
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

## Research Findings

### Two Distinct 1Shot Products

There are **two separate products** from 1Shot — choose the right one:

| Product | Base URL | Use Case |
|---------|----------|----------|
| **1Shot Business API** | `api.1shotapi.com/v0` | Pre-configure contract methods in dashboard, trigger via REST. Requires account + funded wallet. |
| **Permissionless Relayer** | `relayer.1shotapi.com/relayers` | EIP-7710 based, no account needed. Grant permission → relayer sponsors gas. |

**For hackathon demo (prize track):** The **Business API** is simpler and more reliable to demo. The permissionless relayer is the "ideal" but has more setup.

**Recommended path:** Use 1Shot Business API. It supports EIP-7702 authorization lists natively, proving gas abstraction — `from` in tx = 1Shot's wallet.

---

### 1Shot Business API — Full Flow

#### Step 1: Authenticate (M2M JWT)

```javascript
// POST https://api.1shotapi.com/v0/token
const tokenResponse = await fetch('https://api.1shotapi.com/v0/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    grant_type: 'client_credentials',
    client_id: ONESHOT_CLIENT_ID,     // from dashboard
    client_secret: ONESHOT_CLIENT_SECRET
  })
})
const { access_token } = await tokenResponse.json()
// Token expires in 1 hour
```

#### Step 2: Configure Contract Method (one-time, in dashboard)

In the 1Shot dashboard:
1. Add VaultDepositor contract (ABI + address)
2. Create a "contract method endpoint" for `executeDeposit(address user, uint256 amount, address vault)`
3. Link to a funded 1Shot wallet on Sepolia
4. Note the `CONTRACT_METHOD_ID`

#### Step 3: Execute Relay

```javascript
// POST https://api.1shotapi.com/v0/methods/{CONTRACT_METHOD_ID}/execute
const relayResponse = await fetch(
  `https://api.1shotapi.com/v0/methods/${CONTRACT_METHOD_ID}/execute`,
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      params: {
        user: userAddress,
        amount: amountInUnits,    // USDC smallest unit (6 decimals)
        vault: MOCK_VAULT_ADDRESS
      }
    })
  }
)
const { txHash, status } = await relayResponse.json()
```

Result: `from` in the Sepolia tx = 1Shot's relayer wallet. User paid 0 gas. ✅ Demo evidence.

---

### EIP-7702 Authorization List Support ✅

1Shot supports EIP-7702 `authorizationList` natively. Can combine the EOA upgrade with the deposit tx:

```typescript
// Combine upgrade + execute in one tx via 1Shot
const execution = await oneshotClient.contractMethods.execute(
  CONTRACT_METHOD_ID,
  { user: userAddress, amount: amountInUnits, vault: MOCK_VAULT_ADDRESS },
  {
    memo: "yield-vibing vault deposit",
    authorizationList: [{
      address: EIP7702_DELEGATOR_ADDRESS,
      nonce: userNonce,
      chainId: 11155111,  // Sepolia
      signature: authorizationSignature.serialized,
    }]
  }
)
```

This turns the tx into EIP-7702 type 0x04 — EOA gets upgraded AND deposit happens atomically.

---

### Webhooks for Tx Confirmation

Configure a webhook URL in the dashboard to receive confirmation callback:

```javascript
// 1Shot POSTs this to your webhook URL when tx confirmed:
{
  "txHash": "0x...",
  "status": "confirmed",   // or "failed"
  "blockNumber": 7890123,
  "contractMethodId": "...",
  "params": { "user": "0x...", "amount": "...", "vault": "0x..." },
  "signature": "..."  // ed25519, verify with public key from dashboard
}
```

**For hackathon frontend:** Don't need webhooks. Just poll Sepolia for tx confirmation via `publicClient.waitForTransactionReceipt({ hash: txHash })`.

---

### Permissionless Relayer (EIP-7710) — Future Path

If wanting to use the true permissionless flow:

```
Endpoint: relayer.1shotapi.com/relayers
Payment: USDC/USDT stablecoin for gas (no pre-funded wallet needed)
No account required — just point app at endpoint
```

The user grants EIP-7710 permission, relayer sponsors gas, deducts stablecoin from user's allocation.
More aligned with ERC-7715 spec but requires more setup.

**For hackathon:** Use Business API (simpler). Permissionless relayer = v2 feature.

---

### Sepolia Support ✅

Confirmed: 1Shot supports Sepolia testnet. Examples in docs use `chainId: 11155111`.

---

### Rate Limits & Cost

- Bearer token expires: 1 hour (re-generate as needed)
- Rate limits: not documented explicitly; hackathon usage is low volume, no concern
- Testnet gas: 1Shot funds from their wallet; you fund the 1Shot wallet with Sepolia ETH
- Sepolia ETH: free from faucets (Alchemy, Infura, etc.)

---

### ⚠️ MetaMask Delegation Note

From 1Shot docs:
> "MetaMask currently disallows EIP-712 delegation signatures in their browser and mobile wallets. You will need to import your account into another browser wallet like OKX Wallet to sign and store delegations in the 1Shot API portal."

This only applies to the **wallet delegation** feature of 1Shot (where you delegate your own wallet TO 1Shot service). This is NOT required for the hackathon — we use the Business API with 1Shot's own managed wallets, not user wallet delegation.

---

## Decision

### Recommendation

**Use 1Shot Business API with pre-configured `executeDeposit` contract method endpoint.**

Setup flow:
1. Register 1Shot account, get `CLIENT_ID` + `CLIENT_SECRET`
2. Fund a 1Shot wallet on Sepolia with ~0.1 ETH
3. Import VaultDepositor ABI + create method endpoint for `executeDeposit`
4. Store `CONTRACT_METHOD_ID` in `.env`
5. Generate JWT, call execute endpoint from `relay.js`

### Rationale

- Business API is production-stable, documented, and straightforward
- EIP-7702 `authorizationList` support means single tx for upgrade + deposit
- `from` = 1Shot relayer address = clear demo evidence of gas abstraction on Etherscan
- No webhook complexity needed — just poll for receipt

### Implementation Notes

```javascript
// relay.js — complete 1Shot integration

const ONESHOT_TOKEN_URL = 'https://api.1shotapi.com/v0/token'
const ONESHOT_EXECUTE_URL = `https://api.1shotapi.com/v0/methods/${CONTRACT_METHOD_ID}/execute`

let cachedToken = null
let tokenExpiry = 0

async function getBearerToken() {
  if (cachedToken && Date.now() < tokenExpiry) return cachedToken
  
  const res = await fetch(ONESHOT_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: ONESHOT_CLIENT_ID,
      client_secret: ONESHOT_CLIENT_SECRET
    })
  })
  const { access_token, expires_in } = await res.json()
  cachedToken = access_token
  tokenExpiry = Date.now() + (expires_in - 60) * 1000  // refresh 1min early
  return cachedToken
}

export async function relayVaultDeposit(userAddress, amountUsdc, vaultAddress) {
  const token = await getBearerToken()
  
  const res = await fetch(ONESHOT_EXECUTE_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      params: {
        user: userAddress,
        amount: String(amountUsdc * 1_000_000),  // USDC 6 decimals
        vault: vaultAddress
      }
    })
  })
  
  if (!res.ok) throw new Error(`1Shot relay failed: ${res.status}`)
  return res.json()  // { txHash, status, ... }
}
```

### Follow-up Actions

- [ ] Sign up at https://1shotapi.com, obtain `CLIENT_ID` + `CLIENT_SECRET`
- [ ] Add `ONESHOT_CLIENT_ID` + `ONESHOT_CLIENT_SECRET` to `.env.example`
- [ ] Fund a 1Shot wallet with Sepolia ETH (get from faucet)
- [ ] Deploy VaultDepositor.sol first, then import ABI + address into 1Shot dashboard
- [ ] Create contract method endpoint for `executeDeposit`, note the `CONTRACT_METHOD_ID`
- [ ] Add `CONTRACT_METHOD_ID` to `.env.example`
- [ ] Build `relay.js` using the code above
- [ ] Test relay call on Sepolia, capture tx hash
- [ ] Confirm `from` = 1Shot wallet address on Sepolia Etherscan — screenshot for demo
- [ ] Configure 1Shot Sepolia webhook URL (optional) or use `waitForTransactionReceipt` polling

---

## Status History

| Date       | Status         | Notes                           |
| ---------- | -------------- | ------------------------------- |
| 2026-05-26 | 🔴 Not Started | Spike created, prize track req  |
| 2026-05-26 | ✅ Resolved    | Business API approach confirmed, EIP-7702 authorizationList support found |

---

_Last updated: 2026-05-26 by Muhammad Faiq_
