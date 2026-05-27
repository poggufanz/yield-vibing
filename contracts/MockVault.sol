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
