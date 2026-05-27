import { VENICE_BASE_URL, VENICE_MODEL, VENICE_TIMEOUT_MS, DEMO_VAULTS } from './config.js'

// Hardcoded fallback for offline/timeout scenarios
const FALLBACK_STRATEGY = {
  vaults: [
    { address: DEMO_VAULTS[0].address, name: DEMO_VAULTS[0].name, allocation: 0.5, expectedApy: 8.2 },
    { address: DEMO_VAULTS[1].address, name: DEMO_VAULTS[1].name, allocation: 0.5, expectedApy: 12.7 }
  ],
  rationale: 'Fallback: equal split across available vaults',
  generatedBy: 'fallback'
}

/**
 * Generate multi-vault allocation strategy.
 * @param {object} params
 * @param {number} params.amount - total USDC amount
 * @param {'low'|'medium'|'high'} params.riskLevel
 * @param {number} params.numVaults - how many vaults to use
 * @param {string} params.apiKey - Venice API key
 * @returns {Promise<{vaults: Array, rationale: string, generatedBy: string}>}
 */
export async function generateStrategy({ amount, riskLevel, numVaults, apiKey }) {
  if (!apiKey) {
    console.warn('[venice] No API key — using fallback strategy')
    return buildFallbackForParams(amount, numVaults)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), VENICE_TIMEOUT_MS)

  try {
    const response = await fetch(`${VENICE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: VENICE_MODEL,
        response_format: { type: 'json_object' },
        venice_parameters: { include_venice_system_prompt: false },
        messages: [
          {
            role: 'system',
            content: 'You are a DeFi yield strategy generator. Respond ONLY with valid JSON matching the requested schema. No explanation outside JSON.'
          },
          {
            role: 'user',
            content: `Generate a yield farming strategy.
Amount: ${amount} USDC
Risk level: ${riskLevel}
Number of vaults: ${numVaults}
Available vaults: ${JSON.stringify(DEMO_VAULTS)}

Respond with JSON schema:
{
  "vaults": [{ "address": "0x...", "name": "...", "allocation": 0.5, "expectedApy": 8.2 }],
  "rationale": "one sentence",
  "generatedBy": "venice-ai"
}

allocations must sum to 1.0. Use exactly ${numVaults} vaults.`
          }
        ]
      })
    })

    if (!response.ok) throw new Error(`Venice API ${response.status}`)
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty Venice response')

    const parsed = JSON.parse(content)
    validateStrategy(parsed, numVaults)
    return parsed
  } catch (err) {
    console.warn('[venice] Strategy generation failed, using fallback:', err.message)
    return buildFallbackForParams(amount, numVaults)
  } finally {
    clearTimeout(timeout)
  }
}

/**
 * Generate skill JSON for a single agent step.
 * @param {object} params
 * @param {string} params.agentId
 * @param {string} params.vault - vault address
 * @param {number} params.amount - USDC amount for this vault
 * @param {string} params.apiKey
 * @returns {Promise<object>} skill JSON
 */
export async function generateAgentSkills({ agentId, vault, amount, apiKey }) {
  const expiresAt = Math.floor(Date.now() / 1000) + 3600

  // Fallback skills — always valid even without Venice
  const fallback = {
    agentId,
    vaultAddress: vault,
    skills: {
      swap: { maxSlippage: 0.5, dexPreference: 'mock', maxRetries: 2, timeoutSeconds: 30 },
      deposit: { maxAmount: String(Math.floor(amount * 1e6)), vaultAddress: vault, expiresAt }
    },
    generatedBy: 'fallback',
    approvedByUser: false
  }

  if (!apiKey) return fallback

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), VENICE_TIMEOUT_MS)

  try {
    const response = await fetch(`${VENICE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: VENICE_MODEL,
        response_format: { type: 'json_object' },
        venice_parameters: { include_venice_system_prompt: false },
        messages: [
          {
            role: 'system',
            content: 'You generate DeFi agent skill configurations. Respond ONLY with valid JSON.'
          },
          {
            role: 'user',
            content: `Generate skill config for agent ${agentId} depositing ${amount} USDC to vault ${vault}.
Respond with JSON schema:
{
  "agentId": "${agentId}",
  "vaultAddress": "${vault}",
  "skills": {
    "swap": { "maxSlippage": 0.5, "dexPreference": "uniswap-v3", "maxRetries": 2, "timeoutSeconds": 30 },
    "deposit": { "maxAmount": "${Math.floor(amount * 1e6)}", "vaultAddress": "${vault}", "expiresAt": ${expiresAt} }
  },
  "generatedBy": "venice-ai",
  "approvedByUser": false
}`
          }
        ]
      })
    })

    if (!response.ok) throw new Error(`Venice API ${response.status}`)
    const data = await response.json()
    const content = data.choices?.[0]?.message?.content
    if (!content) throw new Error('Empty response')
    return JSON.parse(content)
  } catch (err) {
    console.warn('[venice] Skill gen failed, using fallback:', err.message)
    return fallback
  } finally {
    clearTimeout(timeout)
  }
}

function buildFallbackForParams(amount, numVaults) {
  const count = Math.min(numVaults, DEMO_VAULTS.length)
  const allocation = 1 / count
  return {
    vaults: DEMO_VAULTS.slice(0, count).map(v => ({
      address: v.address,
      name: v.name,
      allocation,
      expectedApy: v.apy
    })),
    rationale: 'Fallback: equal split across available vaults',
    generatedBy: 'fallback'
  }
}

function validateStrategy(strategy, numVaults) {
  if (!Array.isArray(strategy.vaults)) throw new Error('Missing vaults array')
  if (strategy.vaults.length !== numVaults) throw new Error(`Expected ${numVaults} vaults`)
  const total = strategy.vaults.reduce((s, v) => s + v.allocation, 0)
  if (Math.abs(total - 1.0) > 0.01) throw new Error('Allocations do not sum to 1.0')
}
