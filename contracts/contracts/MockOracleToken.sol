// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockOracleToken
 * @dev Mock token for testing (replace with HTS in production)
 */
contract MockOracleToken is ERC20 {
    
    uint256 public constant INITIAL_SUPPLY = 10000000e18; // 10M tokens
    
    constructor() ERC20("Oracle Token", "ORACLE") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
