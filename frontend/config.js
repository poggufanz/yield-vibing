// Contract addresses — fill from Deploy.s.sol output after Sepolia deploy
export const AGENT_VAULT_DEPOSITOR_ADDRESS = '0x0000000000000000000000000000000000000000'
export const MOCK_VAULT_A_ADDRESS = '0x0000000000000000000000000000000000000000'
export const MOCK_VAULT_B_ADDRESS = '0x0000000000000000000000000000000000000000'

// Network
export const SEPOLIA_CHAIN_ID = 11155111
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7'

// APIs
export const ONE_SHOT_RELAYER_URL = 'https://relayer.1shotapi.com/relayers'
export const VENICE_BASE_URL = 'https://api.venice.ai/api/v1'
export const VENICE_MODEL = 'llama-3.3-70b'
export const VENICE_TIMEOUT_MS = 10000

// AgentVaultDepositor ABI — only what frontend needs
export const DEPOSITOR_ABI = [
  'function grantAgentPermission(bytes32 agentId, address vault, uint256 maxAmount, uint256 expiresAt) external',
  'function revokeAgentPermission(bytes32 agentId) external',
  'function executeAgentDeposit(bytes32 agentId, address user, address vault, uint256 amount) external',
  'function agentPermissions(address user, bytes32 agentId) external view returns (address vault, uint256 maxAmount, uint256 usedAmount, uint256 expiresAt, bool active)',
  'event AgentStarted(bytes32 indexed agentId, address indexed user, address vault)',
  'event SwapExecuted(bytes32 indexed agentId, address indexed user, uint256 amountIn, uint256 amountOut)',
  'event ApproveExecuted(bytes32 indexed agentId, address indexed user, address vault, uint256 amount)',
  'event DepositExecuted(bytes32 indexed agentId, address indexed user, address vault, uint256 amount, uint256 sharesReceived)',
  'event AgentCompleted(bytes32 indexed agentId, address indexed user, address vault, uint256 sharesReceived)',
  'event AgentFailed(bytes32 indexed agentId, address indexed user, string reason)'
]

// Default vault list for demo
export const DEMO_VAULTS = [
  { name: 'MockVault USDC-A', address: MOCK_VAULT_A_ADDRESS, apy: 8.2 },
  { name: 'MockVault USDC-B', address: MOCK_VAULT_B_ADDRESS, apy: 12.7 }
]
