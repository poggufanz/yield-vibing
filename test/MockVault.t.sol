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
