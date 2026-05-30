// Contract addresses — Ethereum Sepolia deploy
export const AGENT_VAULT_DEPOSITOR_ADDRESS = '0x4A48F4b9bb76cA2743957c79729ccB38dcEEB9A0'
export const MOCK_VAULT_A_ADDRESS = '0xc9C56e5eCce76C444C220D00690d006d837a6990'
export const MOCK_VAULT_B_ADDRESS = '0x22a6e3192C446fAECB719D6F712Aec5b94653396'

// Network — Ethereum Sepolia (demo); for mainnet use Base (8453) or Base Sepolia (84532)
export const SEPOLIA_CHAIN_ID = 11155111
export const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7'

// USDC — Ethereum Sepolia (Circle official testnet)
export const USDC_SEPOLIA = '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'

// APIs
export const ONE_SHOT_RELAYER_URL = 'https://relayer.1shotapi.com/relayers'
export const VENICE_BASE_URL = 'https://api.venice.ai/api/v1'
export const VENICE_MODEL = 'claude-opus-4-8'
export const VENICE_TIMEOUT_MS = 60000

// DeepSeek — OpenAI-compatible, used as dev fallback when Venice x402 not funded
export const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1'
export const DEEPSEEK_MODEL = 'deepseek-v4-pro'
// Server-side AI proxy — key stays on the server (see api/ai.js). No secret in client.
export const AI_PROXY_URL = '/api/ai'

// AgentVaultDepositor ABI — only what frontend needs
export const DEPOSITOR_ABI = [
  'function grantAgentPermission(bytes32 agentId, address vault, uint256 maxAmount, uint256 expiresAt) external',
  'function setAgentCapabilities(bytes32 agentId, bool allowWithdraw, bool allowHarvest) external',
  'function revokeAgentPermission(bytes32 agentId) external',
  'function executeAgentDeposit(bytes32 agentId, address user, address vault, uint256 amount) external',
  'function executeWithdraw(bytes32 agentId, address user, address vault, uint256 amount) external',
  'function executeHarvest(bytes32 agentId, address user, address vault, bool recompound) external',
  'function agentPermissions(address user, bytes32 agentId) external view returns (address vault, uint256 maxAmount, uint256 usedAmount, uint256 expiresAt, bool active, bool allowWithdraw, bool allowHarvest)',
  'event AgentStarted(bytes32 indexed agentId, address indexed user, address vault)',
  'event SwapExecuted(bytes32 indexed agentId, address indexed user, uint256 amountIn, uint256 amountOut)',
  'event ApproveExecuted(bytes32 indexed agentId, address indexed user, address vault, uint256 amount)',
  'event DepositExecuted(bytes32 indexed agentId, address indexed user, address vault, uint256 amount, uint256 sharesReceived)',
  'event AgentCompleted(bytes32 indexed agentId, address indexed user, address vault, uint256 sharesReceived)',
  'event AgentFailed(bytes32 indexed agentId, address indexed user, string reason)',
  'event WithdrawExecuted(address indexed user, address vault, uint256 amount, uint256 shares)',
  'event HarvestExecuted(address indexed user, address vault, uint256 rewards)',
  'event HarvestRecompounded(address indexed user, address vault, uint256 rewards)'
]

// MockVault ABI — reads + harvest/withdraw flows for Background Agents (monitor, harvest, emergency withdraw)
export const VAULT_ABI = [
  'function apyBps() external view returns (uint256)',
  'function balanceOf(address account) external view returns (uint256)',
  'function totalAssets() external view returns (uint256)',
  'function convertToAssets(uint256 shares) external pure returns (uint256)',
  'function depositTimestamp(address user) external view returns (uint256)',
  'function getUnclaimedRewards(address user) external view returns (uint256)',
  'function claimRewards(address user) external returns (uint256)',
  'function withdrawAssets(uint256 assets, address receiver, address owner) external returns (uint256)',
  'event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares)',
  'event Withdraw(address indexed caller, address indexed receiver, address indexed owner, uint256 assets, uint256 shares)',
  'event RewardsClaimed(address indexed user, uint256 amount)',
  'event YieldAccrued(address indexed user, uint256 amount)'
]

// Vault catalog — enriched metadata so the AI advisor can reason, not just split.
// All entries map to the two really-deployed MockVaults (execution-safe universe).
export const VAULT_CATALOG = [
  {
    name: 'Aave v3 USDC',
    protocol: 'aave-v3',
    address: MOCK_VAULT_A_ADDRESS,
    apy: 4.8,
    risk: 'low',
    yield_source: 'lending',
    drawdown: '-1.2',
    min_capital: 100,
    description: 'Overcollateralized pooled lending. Battle-tested, highest TVL in DeFi. Best for principal preservation.'
  },
  {
    name: 'Morpho Blue USDC',
    protocol: 'morpho-blue',
    address: MOCK_VAULT_B_ADDRESS,
    apy: 6.1,
    risk: 'medium',
    yield_source: 'curated',
    drawdown: '-2.8',
    min_capital: 500,
    description: 'Curator-managed isolated lending markets. Better yield than Aave, curator-dependent risk.'
  },
  {
    name: 'Pendle PT-USDC',
    protocol: 'pendle-v2',
    address: MOCK_VAULT_B_ADDRESS,
    apy: 9.4,
    risk: 'high',
    yield_source: 'structured',
    drawdown: '-6.5',
    min_capital: 1000,
    description: 'Fixed-rate yield via zero-coupon bond mechanics. Hold to maturity or face AMM exit loss.'
  },
  {
    name: 'Fluid USDC',
    protocol: 'fluid',
    address: MOCK_VAULT_A_ADDRESS,
    apy: 5.2,
    risk: 'high',
    yield_source: 'hybrid',
    drawdown: '-4.1',
    min_capital: 2000,
    description: 'Unified lending + DEX architecture. Highest capital efficiency, highest architectural risk.'
  }
]

// Back-compat alias — older imports referenced DEMO_VAULTS
export const DEMO_VAULTS = VAULT_CATALOG
