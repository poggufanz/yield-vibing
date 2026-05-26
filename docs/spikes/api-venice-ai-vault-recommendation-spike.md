---
title: "Venice AI — Vault Recommendation API Capabilities"
category: "API Integration"
status: "🔴 Not Started"
priority: "Medium"
timebox: "2 days"
created: 2026-05-26
updated: 2026-05-26
owner: "Muhammad Faiq"
tags: ["technical-spike", "api-integration", "venice-ai", "llm", "vault-recommendation"]
---

# Venice AI — Vault Recommendation API Capabilities

## Summary

**Spike Objective:** Determine Venice AI's API interface, privacy model, available models, and how to build a vault recommendation feature (risk preference → recommended vault + human-readable summary) that qualifies for the "Best Use of Venice AI" prize track.

**Why This Matters:** Venice AI is a separate $3,000 prize track. Integration must be non-trivial — a real recommendation flow, not just a hello-world call. Need to know API format, response structure, and what "privacy-first" means for the demo story.

**Timebox:** 2 days

**Decision Deadline:** 2026-06-01 — can be parallelized with contract dev, but needs resolution before frontend AI step is built.

---

## Research Question(s)

**Primary Question:** What is the Venice AI API interface (OpenAI-compatible or custom), and can it reliably recommend a DeFi vault given user risk preference + amount input?

**Secondary Questions:**

- Is Venice AI API OpenAI-compatible (`/v1/chat/completions`)?
- What models are available on Venice AI (llama, mistral, etc.)?
- What does "privacy-first" mean technically — is inference on-device, or just no data retention?
- What API key format is needed, and how long does provisioning take?
- What is the latency for a typical recommendation prompt (< 5s for good UX)?
- Can Venice AI return structured JSON output (vault address, APY, risk level, explanation)?
- Are there rate limits / cost implications for hackathon usage?
- What prompt template produces the best vault recommendation output?

---

## Investigation Plan

### Research Tasks

- [ ] Read Venice AI docs — find API endpoint, auth, model list
- [ ] Sign up and obtain Venice AI API key
- [ ] Test basic completion call with DeFi vault recommendation prompt
- [ ] Test structured JSON output (function calling or JSON mode)
- [ ] Measure response latency for recommendation prompt
- [ ] Design final prompt template: risk + amount → vault recommendation
- [ ] Verify "privacy-first" claim for demo story (no data stored on Venice servers?)
- [ ] Check if Venice AI has any DeFi/finance model specialization

### Success Criteria

**This spike is complete when:**

- [ ] API key working, base call successful
- [ ] Structured JSON vault recommendation returned (vault name, address, APY estimate, risk, summary)
- [ ] Latency < 8s for recommendation (acceptable for hackathon demo)
- [ ] Final prompt template documented and tested
- [ ] Privacy model understood and documented for demo narrative

---

## Technical Context

**Related Components:**
- Frontend — Venice AI recommendation panel (Step 3 in optional pre-flow)
- Agent (off-chain) — may incorporate Venice recommendation into vault selection
- No Solidity dependency — pure off-chain API call

**Dependencies:**
- No blockers — can run this spike in parallel with EIP-7702 and ERC-7715 spikes

**Constraints:**
- Venice AI is privacy-first — don't send real user wallet addresses in prompts (use amounts only)
- Response must be human-readable for the demo video
- Must clearly show Venice AI in the demo flow for prize qualification

---

## Research Findings

### Prompt Template Draft (iterate during spike)

```
System: You are a DeFi yield optimization assistant. You recommend the best yield vault 
for a user's risk profile. Always respond with valid JSON only.

User: I want to deposit {amount} USDC. My risk tolerance is {risk_level} (low/medium/high). 
Available vaults on Sepolia testnet: {vault_list}.

Recommend the best vault. Respond with:
{
  "vault_name": "...",
  "vault_address": "0x...",
  "estimated_apy": "...",
  "risk_level": "low|medium|high",
  "summary": "One sentence why this vault fits the user"
}
```

### Investigation Results

_[Fill during spike — paste actual API response]_

### Prototype/Testing Notes

```javascript
// Expected Venice AI call (verify against actual docs)
const response = await fetch('https://api.venice.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${VENICE_API_KEY}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b',  // verify model name
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: buildRecommendationPrompt(amount, riskLevel) }
    ],
    response_format: { type: 'json_object' }
  })
});
const recommendation = await response.json();
```

### External Resources

- [Venice AI docs](https://venice.ai/)
- [Venice AI API reference](https://docs.venice.ai/)  ← verify URL
- [Venice AI Discord](https://discord.gg/venice)  ← verify link
- [OpenAI-compatible API spec](https://platform.openai.com/docs/api-reference/chat)

---

## Decision

### Recommendation

_[Fill after investigation]_

### Rationale

_[Why Venice AI over other LLM providers for this use case]_

### Implementation Notes

```javascript
// venice-ai.js — recommendation module
export async function recommendVault({ amount, riskLevel, availableVaults }) {
  const prompt = buildRecommendationPrompt(amount, riskLevel, availableVaults);
  
  const response = await veniceClient.chat.completions.create({
    model: VENICE_MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt }
    ],
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(response.choices[0].message.content);
}
```

### Follow-up Actions

- [ ] Store `VENICE_API_KEY` in `.env.example`
- [ ] Build `venice-ai.js` recommendation module
- [ ] Build frontend Venice AI panel (risk slider + recommendation card)
- [ ] Record demo showing Venice AI step → vault selection → deposit
- [ ] Document privacy story for hackathon submission

---

## Status History

| Date       | Status         | Notes                                    |
| ---------- | -------------- | ---------------------------------------- |
| 2026-05-26 | 🔴 Not Started | Spike created, can run parallel to others |

---

_Last updated: 2026-05-26 by Muhammad Faiq_
