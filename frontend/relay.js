import { ONE_SHOT_RELAYER_URL, AGENT_VAULT_DEPOSITOR_ADDRESS } from './config.js'

/**
 * Encode calldata for executeAgentDeposit.
 * Uses ethers.js v6 ABI encoding.
 * @param {string} agentId - bytes32 hex (0x...)
 * @param {string} user - address
 * @param {string} vault - address
 * @param {bigint} amount - uint256
 * @returns {Promise<string>} hex calldata
 */
export async function encodeExecuteAgentDeposit(agentId, user, vault, amount) {
  const { ethers } = await import('https://esm.sh/ethers')
  const iface = new ethers.Interface([
    'function executeAgentDeposit(bytes32 agentId, address user, address vault, uint256 amount)'
  ])
  return iface.encodeFunctionData('executeAgentDeposit', [agentId, user, vault, amount])
}

/**
 * Encode calldata for grantAgentPermission.
 * @param {string} agentId - bytes32 hex
 * @param {string} vault - address
 * @param {bigint} maxAmount
 * @param {number} expiresAt - unix timestamp
 * @returns {Promise<string>} hex calldata
 */
export async function encodeGrantAgentPermission(agentId, vault, maxAmount, expiresAt) {
  const { ethers } = await import('https://esm.sh/ethers')
  const iface = new ethers.Interface([
    'function grantAgentPermission(bytes32 agentId, address vault, uint256 maxAmount, uint256 expiresAt)'
  ])
  return iface.encodeFunctionData('grantAgentPermission', [agentId, vault, maxAmount, BigInt(expiresAt)])
}

/**
 * Submit a call via 1Shot Permissionless Relayer.
 * No API key required. Pure JSON-RPC.
 * @param {object} params
 * @param {string} params.to - target contract address
 * @param {string} params.calldata - hex encoded calldata
 * @param {string} params.permissionContext - from ERC-7715 grantPermissions
 * @param {string} params.delegationManager - address (optional, defaults to zero)
 * @returns {Promise<{txHash: string, status: string}>}
 */
export async function submitRelay({ to, calldata, permissionContext, delegationManager = '0x0000000000000000000000000000000000000000' }) {
  const body = {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_sendUserOperation',
    params: [
      {
        target: to,
        data: calldata,
        permissionContext,
        delegationManager
      }
    ]
  }

  const response = await fetch(ONE_SHOT_RELAYER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`1Shot relay failed: ${response.status} — ${text}`)
  }

  const data = await response.json()
  if (data.error) throw new Error(`1Shot error: ${data.error.message}`)

  return {
    txHash: data.result?.transactionHash || data.result || 'pending',
    status: 'submitted'
  }
}

/**
 * Execute grantAgentPermission via 1Shot relay.
 * @param {object} params
 * @param {string} params.agentId - bytes32 hex
 * @param {string} params.vault
 * @param {bigint} params.maxAmount
 * @param {number} params.expiresAt
 * @param {string} params.permissionContext - from ERC-7715
 * @returns {Promise<{txHash: string}>}
 */
export async function relayGrantPermission({ agentId, vault, maxAmount, expiresAt, permissionContext }) {
  const calldata = await encodeGrantAgentPermission(agentId, vault, maxAmount, expiresAt)
  return submitRelay({
    to: AGENT_VAULT_DEPOSITOR_ADDRESS,
    calldata,
    permissionContext
  })
}

/**
 * Execute executeAgentDeposit via 1Shot relay.
 * @param {object} params
 * @param {string} params.agentId - bytes32 hex
 * @param {string} params.user
 * @param {string} params.vault
 * @param {bigint} params.amount
 * @param {string} params.permissionContext
 * @returns {Promise<{txHash: string}>}
 */
export async function relayDeposit({ agentId, user, vault, amount, permissionContext }) {
  const calldata = await encodeExecuteAgentDeposit(agentId, user, vault, amount)
  return submitRelay({
    to: AGENT_VAULT_DEPOSITOR_ADDRESS,
    calldata,
    permissionContext
  })
}
