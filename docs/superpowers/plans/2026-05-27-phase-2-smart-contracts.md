# Phase 2: Smart Contracts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement `MockVault.sol` + `AgentVaultDepositor.sol` + full forge test suite (≥ 80% coverage) + deploy script for Sepolia.

**Architecture:** `MockVault` is a minimal mock vault (shares = assets 1:1, no real ERC20 transfers). `AgentVaultDepositor` holds per-agent permission mappings and executes the Swap→Approve→Deposit flow, emitting 6 events per run. All validation reverts with custom errors (CEI pattern + ReentrancyGuard).

**Tech Stack:** Solidity ^0.8.24, Foundry (forge), OpenZeppelin ReentrancyGuard, forge-std Test. All forge commands run in WSL via `wsl -e bash -c "cd /mnt/c/SharredData/project/competition/yield-vibing && ~/.foundry/bin/forge ..."`.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `foundry.toml` | Modify | Add remappings |
| `contracts/MockVault.sol` | Implement | ERC-4626-like mock vault, shares 1:1 |
| `contracts/AgentVaultDepositor.sol` | Implement | Per-agent permission + CEI execution + 6 events |
| `test/MockVault.t.sol` | Implement | Deposit success, accumulation, events, zero-amount revert |
| `test/AgentVaultDepositor.t.sol` | Implement | Success path, all reverts, parallel agents, fuzz |
| `script/Deploy.s.sol` | Implement | Deploy 2x MockVault + 1x AgentVaultDepositor to Sepolia |

---

## Task 1: Remappings + MockVault.sol

**Files:**
- Modify: `foundry.toml`
- Create: `contracts/MockVault.sol`

### Step 1.1 — Add remappings to foundry.toml

- [ ] Open `foundry.toml` and add remappings after `optimizer_runs`:

```toml
[profile.default]
src = "contracts"
out = "out"
libs = ["lib"]
solc_version = "0.8.24"
optimizer = true
optimizer_runs = 200
remappings = [
    "@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/",
    "forge-std/=lib/forge-std/src/"
]

[rpc_endpoints]
sepolia = "${SEPOLIA_RPC}"

[etherscan]
sepolia = { key = "${ETHERSCAN_API_KEY}", url = "https://api-sepolia.etherscan.io/api" }
```

### Step 1.2 — Write MockVault.sol

- [ ] Replace contents of `contracts/MockVault.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title MockVault
/// @notice Minimal mock vault for hackathon demo. Shares = assets 1:1.
///         No real ERC20 transfers — deposit is purely accounting.
contract MockVault {
    string public name;
    address public asset; // informational only (mock USDC address)

    mapping(address => uint256) private _shares;
    uint256 private _totalDeposited;

    event Deposit(
        address indexed caller,
        address indexed owner,
        uint256 assets,
        uint256 shares
    );

    constructor(string memory _name, address _asset) {
        name = _name;
        asset = _asset;
    }

    /// @notice Deposit assets, receive shares 1:1.
    function deposit(uint256 assets, address receiver) external returns (uint256) {
        require(assets > 0, "Zero assets");
        uint256 sharesAmount = assets;
        _shares[receiver] += sharesAmount;
        _totalDeposited += assets;
        emit Deposit(msg.sender, receiver, assets, sharesAmount);
        return sharesAmount;
    }

    function balanceOf(address account) external view returns (uint256) {
        return _shares[account];
    }

    function totalAssets() external view returns (uint256) {
        return _totalDeposited;
    }
}
```

### Step 1.3 — Verify build

- [ ] Run:

```
wsl -e bash -c "cd /mnt/c/SharredData/project/competition/yield-vibing && ~/.foundry/bin/forge build"
```

Expected: `Compiler run successful` — no warnings about missing pragma.

### Step 1.4 — Commit

```
git add foundry.toml contracts/MockVault.sol
git commit -m "feat(contracts): implement MockVault.sol with shares 1:1 accounting"
```

---

## Task 2: MockVault.t.sol

**Files:**
- Implement: `test/MockVault.t.sol`

### Step 2.1 — Write failing tests first

- [ ] Replace contents of `test/MockVault.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockVault} from "../contracts/MockVault.sol";

contract MockVaultTest is Test {
    MockVault vaultA;
    MockVault vaultB;
    address user = address(0xBEEF);

    function setUp() public {
        vaultA = new MockVault("MockVault USDC-A", address(0x1111));
        vaultB = new MockVault("MockVault USDC-B", address(0x2222));
    }

    function test_name_set_correctly() public view {
        assertEq(vaultA.name(), "MockVault USDC-A");
        assertEq(vaultB.name(), "MockVault USDC-B");
    }

    function test_asset_set_correctly() public view {
        assertEq(vaultA.asset(), address(0x1111));
        assertEq(vaultB.asset(), address(0x2222));
    }

    function test_deposit_returns_shares_one_to_one() public {
        uint256 amount = 100e6; // 100 USDC (6 decimals)
        uint256 sharesReceived = vaultA.deposit(amount, user);

        assertEq(sharesReceived, amount);
    }

    function test_deposit_updates_balance() public {
        uint256 amount = 100e6;
        vaultA.deposit(amount, user);

        assertEq(vaultA.balanceOf(user), amount);
    }

    function test_deposit_updates_total_assets() public {
        uint256 amount = 100e6;
        vaultA.deposit(amount, user);

        assertEq(vaultA.totalAssets(), amount);
    }

    function test_multiple_deposits_accumulate() public {
        vaultA.deposit(100e6, user);
        vaultA.deposit(50e6, user);

        assertEq(vaultA.balanceOf(user), 150e6);
        assertEq(vaultA.totalAssets(), 150e6);
    }

    function test_deposit_to_different_receivers() public {
        address user2 = address(0xDEAD);
        vaultA.deposit(100e6, user);
        vaultA.deposit(200e6, user2);

        assertEq(vaultA.balanceOf(user), 100e6);
        assertEq(vaultA.balanceOf(user2), 200e6);
        assertEq(vaultA.totalAssets(), 300e6);
    }

    function test_deposit_emits_event() public {
        uint256 amount = 50e6;
        vm.expectEmit(true, true, false, true);
        emit MockVault.Deposit(address(this), user, amount, amount);
        vaultA.deposit(amount, user);
    }

    function test_deposit_reverts_on_zero_assets() public {
        vm.expectRevert("Zero assets");
        vaultA.deposit(0, user);
    }

    function test_vaults_are_independent() public {
        vaultA.deposit(100e6, user);
        vaultB.deposit(200e6, user);

        assertEq(vaultA.balanceOf(user), 100e6);
        assertEq(vaultB.balanceOf(user), 200e6);
        assertEq(vaultA.totalAssets(), 100e6);
        assertEq(vaultB.totalAssets(), 200e6);
    }
}
```

### Step 2.2 — Run tests (expect FAIL — MockVault not yet fully implemented... but it is, so expect PASS)

- [ ] Run:

```
wsl -e bash -c "cd /mnt/c/SharredData/project/competition/yield-vibing && ~/.foundry/bin/forge test --match-contract MockVaultTest -vv"
```

Expected: All 8 tests PASS.

### Step 2.3 — Commit

```
git add test/MockVault.t.sol
git commit -m "test(MockVault): full test suite — deposit, accumulation, events, zero-revert"
```

---

## Task 3: AgentVaultDepositor.sol — Permission Management

**Files:**
- Implement: `contracts/AgentVaultDepositor.sol` (struct + grant + revoke)

### Step 3.1 — Write AgentVaultDepositor.sol (permission management only, no executeAgentDeposit yet)

- [ ] Replace contents of `contracts/AgentVaultDepositor.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IVault {
    function deposit(uint256 assets, address receiver) external returns (uint256);
}

/// @title AgentVaultDepositor
/// @notice Executes per-agent scoped vault deposits.
///         Each agent has its own permission: vault, maxAmount, expiry.
///         CEI pattern + ReentrancyGuard on executeAgentDeposit.
contract AgentVaultDepositor is ReentrancyGuard {
    struct AgentPermission {
        address vault;
        uint256 maxAmount;
        uint256 usedAmount;
        uint256 expiresAt;
        bool active;
    }

    mapping(address => mapping(bytes32 => AgentPermission)) public agentPermissions;

    // Events
    event AgentStarted(bytes32 indexed agentId, address indexed user, address vault);
    event SwapExecuted(bytes32 indexed agentId, address indexed user, uint256 amountIn, uint256 amountOut);
    event ApproveExecuted(bytes32 indexed agentId, address indexed user, address vault, uint256 amount);
    event DepositExecuted(bytes32 indexed agentId, address indexed user, address vault, uint256 amount, uint256 sharesReceived);
    event AgentCompleted(bytes32 indexed agentId, address indexed user, address vault, uint256 sharesReceived);
    event AgentFailed(bytes32 indexed agentId, address indexed user, string reason);

    // Custom errors
    error PermissionNotActive();
    error PermissionExpired();
    error VaultMismatch();
    error AmountExceedsPermission();
    error InvalidVault();
    error InvalidAmount();
    error InvalidExpiry();

    /// @notice Grant permission to an agent to deposit into a specific vault.
    function grantAgentPermission(
        bytes32 agentId,
        address vault,
        uint256 maxAmount,
        uint256 expiresAt
    ) external {
        if (vault == address(0)) revert InvalidVault();
        if (maxAmount == 0) revert InvalidAmount();
        if (expiresAt <= block.timestamp) revert InvalidExpiry();

        agentPermissions[msg.sender][agentId] = AgentPermission({
            vault: vault,
            maxAmount: maxAmount,
            usedAmount: 0,
            expiresAt: expiresAt,
            active: true
        });
    }

    /// @notice Revoke an agent's permission immediately.
    function revokeAgentPermission(bytes32 agentId) external {
        agentPermissions[msg.sender][agentId].active = false;
    }
}
```

### Step 3.2 — Verify build

- [ ] Run:

```
wsl -e bash -c "cd /mnt/c/SharredData/project/competition/yield-vibing && ~/.foundry/bin/forge build"
```

Expected: `Compiler run successful`.

### Step 3.3 — Commit

```
git add contracts/AgentVaultDepositor.sol
git commit -m "feat(contracts): AgentVaultDepositor permission management — struct, grant, revoke"
```

---

## Task 4: AgentVaultDepositor.sol — executeAgentDeposit

**Files:**
- Modify: `contracts/AgentVaultDepositor.sol` (add executeAgentDeposit)

### Step 4.1 — Add executeAgentDeposit to AgentVaultDepositor.sol

- [ ] Append this function inside the contract (before the closing `}`):

```solidity
    /// @notice Execute a full Swap→Approve→Deposit flow for one agent.
    ///         CEI pattern: all checks before state update before external calls.
    ///         nonReentrant prevents reentrancy on vault.deposit() callback.
    function executeAgentDeposit(
        bytes32 agentId,
        address user,
        address vault,
        uint256 amount
    ) external nonReentrant {
        AgentPermission storage perm = agentPermissions[user][agentId];

        // CHECKS — revert immediately on any violation
        if (!perm.active) revert PermissionNotActive();
        if (block.timestamp >= perm.expiresAt) revert PermissionExpired();
        if (perm.vault != vault) revert VaultMismatch();
        if (perm.usedAmount + amount > perm.maxAmount) revert AmountExceedsPermission();

        // EFFECTS — update state before external calls
        perm.usedAmount += amount;

        // INTERACTIONS — emit events + call vault
        emit AgentStarted(agentId, user, vault);

        // Swap step (mocked — no real DEX for hackathon demo)
        emit SwapExecuted(agentId, user, amount, amount); // 1:1 mock swap

        // Approve step (mocked — no real ERC20.approve() needed for MockVault)
        emit ApproveExecuted(agentId, user, vault, amount);

        // Deposit to vault — try/catch so AgentFailed can be emitted on vault failure
        try IVault(vault).deposit(amount, user) returns (uint256 sharesReceived) {
            emit DepositExecuted(agentId, user, vault, amount, sharesReceived);
            emit AgentCompleted(agentId, user, vault, sharesReceived);
        } catch {
            // Undo usedAmount — vault deposit did not happen
            perm.usedAmount -= amount;
            emit AgentFailed(agentId, user, "Vault deposit failed");
        }
    }
```

### Step 4.2 — Verify build

- [ ] Run:

```
wsl -e bash -c "cd /mnt/c/SharredData/project/competition/yield-vibing && ~/.foundry/bin/forge build"
```

Expected: `Compiler run successful`.

### Step 4.3 — Commit

```
git add contracts/AgentVaultDepositor.sol
git commit -m "feat(contracts): executeAgentDeposit — CEI pattern, 6 events, try/catch vault call"
```

---

## Task 5: AgentVaultDepositor.t.sol — Success, Parallel Agents, Fail Paths

**Files:**
- Implement: `test/AgentVaultDepositor.t.sol`

### Step 5.1 — Write the test file

- [ ] Replace contents of `test/AgentVaultDepositor.t.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {AgentVaultDepositor} from "../contracts/AgentVaultDepositor.sol";
import {MockVault} from "../contracts/MockVault.sol";

contract AgentVaultDepositorTest is Test {
    AgentVaultDepositor depositor;
    MockVault vaultA;
    MockVault vaultB;

    address user = address(0xBEEF);
    bytes32 agentId1 = keccak256("agent-1");
    bytes32 agentId2 = keccak256("agent-2");
    uint256 maxAmount = 100e6; // 100 USDC
    uint256 expiry; // set in setUp

    function setUp() public {
        depositor = new AgentVaultDepositor();
        vaultA = new MockVault("MockVault USDC-A", address(0));
        vaultB = new MockVault("MockVault USDC-B", address(0));
        expiry = block.timestamp + 1 days;
    }

    // ─── Grant / Revoke ───────────────────────────────────────────────────────

    function test_grantAgentPermission_stores_permission() public {
        vm.prank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);

        (address vault, uint256 max, uint256 used, uint256 exp, bool active) =
            depositor.agentPermissions(user, agentId1);

        assertEq(vault, address(vaultA));
        assertEq(max, maxAmount);
        assertEq(used, 0);
        assertEq(exp, expiry);
        assertTrue(active);
    }

    function test_grantAgentPermission_reverts_zero_vault() public {
        vm.prank(user);
        vm.expectRevert(AgentVaultDepositor.InvalidVault.selector);
        depositor.grantAgentPermission(agentId1, address(0), maxAmount, expiry);
    }

    function test_grantAgentPermission_reverts_zero_amount() public {
        vm.prank(user);
        vm.expectRevert(AgentVaultDepositor.InvalidAmount.selector);
        depositor.grantAgentPermission(agentId1, address(vaultA), 0, expiry);
    }

    function test_grantAgentPermission_reverts_past_expiry() public {
        vm.prank(user);
        vm.expectRevert(AgentVaultDepositor.InvalidExpiry.selector);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, block.timestamp);
    }

    function test_revokeAgentPermission_sets_inactive() public {
        vm.startPrank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);
        depositor.revokeAgentPermission(agentId1);
        vm.stopPrank();

        (,,,, bool active) = depositor.agentPermissions(user, agentId1);
        assertFalse(active);
    }

    // ─── executeAgentDeposit — Success Path ───────────────────────────────────

    function test_executeAgentDeposit_success() public {
        uint256 amount = 50e6;

        vm.prank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);

        depositor.executeAgentDeposit(agentId1, user, address(vaultA), amount);

        // shares received in vault
        assertEq(vaultA.balanceOf(user), amount);

        // usedAmount updated
        (, , uint256 used,,) = depositor.agentPermissions(user, agentId1);
        assertEq(used, amount);
    }

    function test_executeAgentDeposit_emits_all_events() public {
        uint256 amount = 50e6;

        vm.prank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);

        vm.expectEmit(true, true, false, true);
        emit AgentVaultDepositor.AgentStarted(agentId1, user, address(vaultA));

        vm.expectEmit(true, true, false, true);
        emit AgentVaultDepositor.SwapExecuted(agentId1, user, amount, amount);

        vm.expectEmit(true, true, false, true);
        emit AgentVaultDepositor.ApproveExecuted(agentId1, user, address(vaultA), amount);

        vm.expectEmit(true, true, false, true);
        emit AgentVaultDepositor.DepositExecuted(agentId1, user, address(vaultA), amount, amount);

        vm.expectEmit(true, true, false, true);
        emit AgentVaultDepositor.AgentCompleted(agentId1, user, address(vaultA), amount);

        depositor.executeAgentDeposit(agentId1, user, address(vaultA), amount);
    }

    function test_executeAgentDeposit_accumulates_used_amount() public {
        vm.prank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);

        depositor.executeAgentDeposit(agentId1, user, address(vaultA), 30e6);
        depositor.executeAgentDeposit(agentId1, user, address(vaultA), 40e6);

        (, , uint256 used,,) = depositor.agentPermissions(user, agentId1);
        assertEq(used, 70e6);
    }

    // ─── executeAgentDeposit — Parallel Agents ───────────────────────────────

    function test_parallel_agents_independent_vaults() public {
        vm.startPrank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);
        depositor.grantAgentPermission(agentId2, address(vaultB), maxAmount, expiry);
        vm.stopPrank();

        depositor.executeAgentDeposit(agentId1, user, address(vaultA), 60e6);
        depositor.executeAgentDeposit(agentId2, user, address(vaultB), 80e6);

        assertEq(vaultA.balanceOf(user), 60e6);
        assertEq(vaultB.balanceOf(user), 80e6);

        (, , uint256 used1,,) = depositor.agentPermissions(user, agentId1);
        (, , uint256 used2,,) = depositor.agentPermissions(user, agentId2);
        assertEq(used1, 60e6);
        assertEq(used2, 80e6);
    }

    function test_parallel_agents_same_vault_allowed() public {
        bytes32 agentId3 = keccak256("agent-3");

        vm.startPrank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);
        depositor.grantAgentPermission(agentId3, address(vaultA), maxAmount, expiry);
        vm.stopPrank();

        depositor.executeAgentDeposit(agentId1, user, address(vaultA), 50e6);
        depositor.executeAgentDeposit(agentId3, user, address(vaultA), 50e6);

        assertEq(vaultA.totalAssets(), 100e6);
    }

    // ─── executeAgentDeposit — Fail Paths ────────────────────────────────────

    function test_revert_permission_not_active() public {
        // No grant at all
        vm.expectRevert(AgentVaultDepositor.PermissionNotActive.selector);
        depositor.executeAgentDeposit(agentId1, user, address(vaultA), 50e6);
    }

    function test_revert_after_revoke() public {
        vm.startPrank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);
        depositor.revokeAgentPermission(agentId1);
        vm.stopPrank();

        vm.expectRevert(AgentVaultDepositor.PermissionNotActive.selector);
        depositor.executeAgentDeposit(agentId1, user, address(vaultA), 50e6);
    }

    function test_revert_permission_expired() public {
        vm.prank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);

        // Warp past expiry
        vm.warp(expiry + 1);

        vm.expectRevert(AgentVaultDepositor.PermissionExpired.selector);
        depositor.executeAgentDeposit(agentId1, user, address(vaultA), 50e6);
    }

    function test_revert_vault_mismatch() public {
        vm.prank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);

        // Pass vaultB but permission is for vaultA
        vm.expectRevert(AgentVaultDepositor.VaultMismatch.selector);
        depositor.executeAgentDeposit(agentId1, user, address(vaultB), 50e6);
    }

    function test_revert_amount_exceeds_permission() public {
        vm.prank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);

        // maxAmount = 100e6, try depositing 101e6
        vm.expectRevert(AgentVaultDepositor.AmountExceedsPermission.selector);
        depositor.executeAgentDeposit(agentId1, user, address(vaultA), 101e6);
    }

    function test_revert_cumulative_amount_exceeds_permission() public {
        vm.prank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);

        depositor.executeAgentDeposit(agentId1, user, address(vaultA), 60e6);

        // 60e6 used, maxAmount = 100e6, trying 50e6 more = 110e6 total → revert
        vm.expectRevert(AgentVaultDepositor.AmountExceedsPermission.selector);
        depositor.executeAgentDeposit(agentId1, user, address(vaultA), 50e6);
    }

    function test_used_amount_not_updated_on_revert() public {
        vm.prank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);

        // This will revert
        vm.expectRevert(AgentVaultDepositor.AmountExceedsPermission.selector);
        depositor.executeAgentDeposit(agentId1, user, address(vaultA), 200e6);

        // usedAmount should still be 0
        (, , uint256 used,,) = depositor.agentPermissions(user, agentId1);
        assertEq(used, 0);
    }
}
```

### Step 5.2 — Run tests

- [ ] Run:

```
wsl -e bash -c "cd /mnt/c/SharredData/project/competition/yield-vibing && ~/.foundry/bin/forge test --match-contract AgentVaultDepositorTest -vv"
```

Expected: All tests PASS.

### Step 5.3 — Commit

```
git add test/AgentVaultDepositor.t.sol
git commit -m "test(AgentVaultDepositor): full test suite — success, parallel agents, all fail paths"
```

---

## Task 6: Fuzz Tests

**Files:**
- Modify: `test/AgentVaultDepositor.t.sol` (append fuzz functions)

### Step 6.1 — Append fuzz tests inside `AgentVaultDepositorTest` contract

- [ ] Add these functions at the bottom of `AgentVaultDepositorTest` (before closing `}`):

```solidity
    // ─── Fuzz Tests ───────────────────────────────────────────────────────────

    function testFuzz_deposit_within_limit_succeeds(uint256 amount) public {
        // Bound amount: 1 wei to maxAmount
        amount = bound(amount, 1, maxAmount);

        vm.prank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);

        depositor.executeAgentDeposit(agentId1, user, address(vaultA), amount);

        assertEq(vaultA.balanceOf(user), amount);
        (, , uint256 used,,) = depositor.agentPermissions(user, agentId1);
        assertEq(used, amount);
    }

    function testFuzz_deposit_over_limit_reverts(uint256 amount) public {
        // Bound amount: maxAmount+1 to maxAmount*10
        amount = bound(amount, maxAmount + 1, maxAmount * 10);

        vm.prank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);

        vm.expectRevert(AgentVaultDepositor.AmountExceedsPermission.selector);
        depositor.executeAgentDeposit(agentId1, user, address(vaultA), amount);
    }

    function testFuzz_cumulative_used_amount_never_exceeds_max(
        uint256 amount1,
        uint256 amount2
    ) public {
        amount1 = bound(amount1, 1, maxAmount);
        amount2 = bound(amount2, 1, maxAmount);

        vm.prank(user);
        depositor.grantAgentPermission(agentId1, address(vaultA), maxAmount, expiry);

        depositor.executeAgentDeposit(agentId1, user, address(vaultA), amount1);

        (, , uint256 used,,) = depositor.agentPermissions(user, agentId1);
        assertEq(used, amount1);

        uint256 remaining = maxAmount - used;
        if (amount2 <= remaining) {
            depositor.executeAgentDeposit(agentId1, user, address(vaultA), amount2);
            (, , uint256 usedAfter,,) = depositor.agentPermissions(user, agentId1);
            assertLe(usedAfter, maxAmount);
        } else {
            vm.expectRevert(AgentVaultDepositor.AmountExceedsPermission.selector);
            depositor.executeAgentDeposit(agentId1, user, address(vaultA), amount2);
        }
    }

    function testFuzz_different_agentIds_dont_interfere(bytes32 id1, bytes32 id2) public {
        vm.assume(id1 != id2);

        vm.startPrank(user);
        depositor.grantAgentPermission(id1, address(vaultA), maxAmount, expiry);
        depositor.grantAgentPermission(id2, address(vaultB), maxAmount, expiry);
        vm.stopPrank();

        uint256 amount1 = 40e6;
        uint256 amount2 = 60e6;

        depositor.executeAgentDeposit(id1, user, address(vaultA), amount1);
        depositor.executeAgentDeposit(id2, user, address(vaultB), amount2);

        (, , uint256 used1,,) = depositor.agentPermissions(user, id1);
        (, , uint256 used2,,) = depositor.agentPermissions(user, id2);

        assertEq(used1, amount1);
        assertEq(used2, amount2);
    }
```

### Step 6.2 — Run fuzz tests

- [ ] Run:

```
wsl -e bash -c "cd /mnt/c/SharredData/project/competition/yield-vibing && ~/.foundry/bin/forge test --match-test testFuzz -vv --fuzz-runs 500"
```

Expected: All fuzz tests PASS (500 runs each).

### Step 6.3 — Commit

```
git add test/AgentVaultDepositor.t.sol
git commit -m "test(AgentVaultDepositor): fuzz tests — amount bounds, cumulative limit, agent isolation"
```

---

## Task 7: Deploy.s.sol

**Files:**
- Implement: `script/Deploy.s.sol`

### Step 7.1 — Write Deploy.s.sol

- [ ] Replace contents of `script/Deploy.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {MockVault} from "../contracts/MockVault.sol";
import {AgentVaultDepositor} from "../contracts/AgentVaultDepositor.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        MockVault vaultA = new MockVault("MockVault USDC-A", address(0));
        MockVault vaultB = new MockVault("MockVault USDC-B", address(0));
        AgentVaultDepositor depositor = new AgentVaultDepositor();

        vm.stopBroadcast();

        console.log("=== Vibing Farmer Deployment ===");
        console.log("VaultA (MockVault USDC-A):", address(vaultA));
        console.log("VaultB (MockVault USDC-B):", address(vaultB));
        console.log("AgentVaultDepositor:      ", address(depositor));
        console.log("================================");
        console.log("Copy these into .env:");
        console.log("AGENT_VAULT_DEPOSITOR_ADDRESS=", address(depositor));
        console.log("MOCK_VAULT_A_ADDRESS=", address(vaultA));
        console.log("MOCK_VAULT_B_ADDRESS=", address(vaultB));
    }
}
```

### Step 7.2 — Dry-run deploy locally (no broadcast)

- [ ] Run:

```
wsl -e bash -c "cd /mnt/c/SharredData/project/competition/yield-vibing && ~/.foundry/bin/forge script script/Deploy.s.sol -vv"
```

Expected: Script simulates OK, prints addresses. No `PRIVATE_KEY` needed for dry-run (it uses a default anvil key).

### Step 7.3 — Commit

```
git add script/Deploy.s.sol
git commit -m "feat(script): Deploy.s.sol — 2x MockVault + AgentVaultDepositor with address output"
```

---

## Task 8: Coverage Gate + Security Checklist

**Files:**
- No new files — run checks only.

### Step 8.1 — Run full test suite

- [ ] Run:

```
wsl -e bash -c "cd /mnt/c/SharredData/project/competition/yield-vibing && ~/.foundry/bin/forge test -vv"
```

Expected: All tests PASS. Count should be ≥ 20 tests total.

### Step 8.2 — Run coverage

- [ ] Run:

```
wsl -e bash -c "cd /mnt/c/SharredData/project/competition/yield-vibing && ~/.foundry/bin/forge coverage"
```

Expected: `contracts/AgentVaultDepositor.sol` ≥ 80% line coverage. `contracts/MockVault.sol` ≥ 80%.

If coverage < 80%, identify uncovered lines in the report and add targeted tests in `test/AgentVaultDepositor.t.sol`.

### Step 8.3 — Security checklist

Verify manually before marking Phase 2 complete:

- [ ] `executeAgentDeposit` has `nonReentrant` modifier
- [ ] All 3 permission checks fire BEFORE `perm.usedAmount += amount` (CEI)
- [ ] No `msg.sender == owner` admin role anywhere
- [ ] `agentPermissions` mapping is `public` (readable by frontend for display)
- [ ] `grantAgentPermission` validates: vault != 0, maxAmount > 0, expiresAt > now
- [ ] `revokeAgentPermission` sets `active = false` (does NOT delete — keeps history)
- [ ] On vault failure: `usedAmount` is rolled back before `AgentFailed` emit
- [ ] No hardcoded addresses — vault passed as parameter

### Step 8.4 — Final Phase 2 commit

```
git add -A
git commit -m "chore(phase-2): complete — contracts + tests + deploy script. Coverage ≥ 80%"
```

---

## Phase 2 Milestone Gate

Before marking Phase 2 done and starting Phase 3:

```
wsl -e bash -c "cd /mnt/c/SharredData/project/competition/yield-vibing && ~/.foundry/bin/forge test && ~/.foundry/bin/forge coverage"
```

- [ ] All tests PASS
- [ ] Coverage ≥ 80% on both contracts
- [ ] `forge build` zero warnings
- [ ] Deploy dry-run succeeds
- [ ] Security checklist complete (Task 8.3)
