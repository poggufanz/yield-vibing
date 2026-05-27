import { SEPOLIA_CHAIN_ID_HEX, SEPOLIA_CHAIN_ID, AGENT_VAULT_DEPOSITOR_ADDRESS, DEPOSITOR_ABI } from './config.js'

// Lazy-loaded viem + SAK (ESM, loaded on demand to not block initial paint)
let walletClient = null
let ethersProvider = null
let account = null

/**
 * Connect MetaMask Flask, switch to Sepolia if needed.
 * Returns connected account address.
 * @returns {Promise<string>} account address
 */
export async function connectWallet() {
  if (!window.ethereum) throw new Error('MetaMask Flask not found. Install Flask 13.9+.')

  // Request accounts
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
  account = accounts[0]

  // Ensure Sepolia
  const chainId = await window.ethereum.request({ method: 'eth_chainId' })
  if (chainId !== SEPOLIA_CHAIN_ID_HEX) {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }]
      })
    } catch (e) {
      throw new Error(`Switch to Sepolia in MetaMask. Current: ${chainId}`)
    }
  }

  // Setup ethers provider for contract calls
  const { ethers } = await import('https://esm.sh/ethers')
  ethersProvider = new ethers.BrowserProvider(window.ethereum)

  // Setup viem walletClient + SAK for ERC-7715
  const { createWalletClient, custom } = await import('https://esm.sh/viem')
  const { erc7715ProviderActions } = await import('https://esm.sh/@metamask/smart-accounts-kit/actions')

  walletClient = createWalletClient({
    transport: custom(window.ethereum)
  }).extend(erc7715ProviderActions())

  return account
}

/**
 * Get connected account. Must call connectWallet() first.
 * @returns {string|null}
 */
export function getAccount() {
  return account
}

/**
 * Grant ERC-7715 permission for AgentVaultDepositor via MetaMask SAK.
 * EIP-7702 is handled internally by SAK — do NOT call eth_signAuthorization.
 * @param {number} expirySeconds - seconds from now
 * @returns {Promise<{permissionContext: string, grantedPermissions: Array}>}
 */
export async function requestERC7715Permission(expirySeconds = 86400) {
  if (!walletClient) throw new Error('Wallet not connected. Call connectWallet() first.')

  const result = await walletClient.grantPermissions({
    chainId: SEPOLIA_CHAIN_ID,
    expiry: Math.floor(Date.now() / 1000) + expirySeconds,
    permissions: [
      {
        type: 'contract-call',
        data: {
          address: AGENT_VAULT_DEPOSITOR_ADDRESS,
          calls: [
            { signature: 'executeAgentDeposit(bytes32,address,address,uint256)' }
          ]
        },
        required: true
      }
    ]
  })

  if (!result || !result.permissionContext) {
    throw new Error('SAK did not return permissionContext')
  }

  return result
}

/**
 * Call grantAgentPermission on AgentVaultDepositor directly (user signs tx).
 * @param {string} agentId - bytes32 hex string
 * @param {string} vault - vault address
 * @param {bigint} maxAmount - max deposit amount in wei/units
 * @param {number} expiresAt - unix timestamp
 * @returns {Promise<string>} tx hash
 */
export async function grantAgentPermissionOnChain(agentId, vault, maxAmount, expiresAt) {
  if (!ethersProvider) throw new Error('Wallet not connected.')
  const signer = await ethersProvider.getSigner()
  const { ethers } = await import('https://esm.sh/ethers')
  const contract = new ethers.Contract(AGENT_VAULT_DEPOSITOR_ADDRESS, DEPOSITOR_ABI, signer)
  const tx = await contract.grantAgentPermission(agentId, vault, maxAmount, expiresAt)
  await tx.wait()
  return tx.hash
}

/**
 * Read agentPermission from contract.
 * @param {string} userAddress
 * @param {string} agentId - bytes32 hex
 * @returns {Promise<{vault, maxAmount, usedAmount, expiresAt, active}>}
 */
export async function readAgentPermission(userAddress, agentId) {
  if (!ethersProvider) throw new Error('Wallet not connected.')
  const { ethers } = await import('https://esm.sh/ethers')
  const contract = new ethers.Contract(AGENT_VAULT_DEPOSITOR_ADDRESS, DEPOSITOR_ABI, ethersProvider)
  const [vault, maxAmount, usedAmount, expiresAt, active] =
    await contract.agentPermissions(userAddress, agentId)
  return { vault, maxAmount, usedAmount, expiresAt, active }
}

/**
 * Subscribe to contract events and call callback on each.
 * @param {string} eventName - 'AgentStarted' | 'DepositExecuted' | 'AgentCompleted' | 'AgentFailed'
 * @param {function} callback - (event) => void
 * @returns {function} unsubscribe function
 */
export async function onContractEvent(eventName, callback) {
  if (!ethersProvider) throw new Error('Wallet not connected.')
  const { ethers } = await import('https://esm.sh/ethers')
  const contract = new ethers.Contract(AGENT_VAULT_DEPOSITOR_ADDRESS, DEPOSITOR_ABI, ethersProvider)
  contract.on(eventName, callback)
  return () => contract.off(eventName, callback)
}
