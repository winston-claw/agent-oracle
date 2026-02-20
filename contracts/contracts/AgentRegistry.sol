// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title AgentRegistry
 * @dev Manages agent registration, staking, and reputation
 */
contract AgentRegistry is Ownable, ReentrancyGuard {
    
    struct Agent {
        address payable wallet;
        string[] capabilities;
        string[] dataSources;
        uint256 stake;
        uint256 reputation;       // 0-100 score
        uint256 totalRequests;
        uint256 correctResponses;
        uint256 lastActive;
        bool blacklisted;
    }
    
    // State
    mapping(address => Agent) public agents;
    address[] public agentList;
    
    IERC20 public oracleToken;
    uint256 public constant MIN_STAKE = 1000e18;
    uint256 public constant LOCK_PERIOD = 7 days;
    
    mapping(address => uint256) public stakedAt;
    mapping(address => uint256) public pendingUnstake;
    
    // Events
    event AgentRegistered(address indexed agent, string[] capabilities);
    event AgentStaked(address indexed agent, uint256 amount);
    event AgentUnstaked(address indexed agent, uint256 amount, uint256 unlockTime);
    event StakeSlashed(address indexed agent, uint256 amount, string reason);
    event ReputationUpdated(address indexed agent, uint256 newReputation);
    event AgentBlacklisted(address indexed agent, string reason);
    
    constructor(address _oracleToken) Ownable(msg.sender) {
        oracleToken = IERC20(_oracleToken);
    }
    
    /**
     * @dev Register a new agent
     */
    function registerAgent(
        string[] calldata capabilities,
        string[] calldata dataSources
    ) external {
        require(!agents[msg.sender].blacklisted, "Agent is blacklisted");
        require(capabilities.length > 0, "Need at least one capability");
        
        agents[msg.sender].wallet = payable(msg.sender);
        agents[msg.sender].capabilities = capabilities;
        agents[msg.sender].dataSources = dataSources;
        agents[msg.sender].stake = 0;
        agents[msg.sender].reputation = 50; // Start with neutral reputation
        agents[msg.sender].lastActive = block.timestamp;
        
        agentList.push(msg.sender);
        
        emit AgentRegistered(msg.sender, capabilities);
    }
    
    /**
     * @dev Stake ORACLE tokens
     */
    function stakeTokens(uint256 amount) external nonReentrant {
        require(amount >= MIN_STAKE, "Minimum stake is 1000 ORACLE");
        require(agents[msg.sender].capabilities.length > 0, "Agent not registered");
        
        require(oracleToken.transferFrom(msg.sender, address(this), amount), "Transfer failed");
        
        agents[msg.sender].stake += amount;
        stakedAt[msg.sender] = block.timestamp;
        
        emit AgentStaked(msg.sender, amount);
    }
    
    /**
     * @dev Request to unstake tokens (starts lock period)
     */
    function unstakeTokens(uint256 amount) external nonReentrant {
        require(agents[msg.sender].stake >= amount, "Insufficient stake");
        
        // Check lock period
        if (agents[msg.sender].stake >= MIN_STAKE) {
            require(
                block.timestamp >= stakedAt[msg.sender] + LOCK_PERIOD,
                "Stake locked for 7 days"
            );
        }
        
        agents[msg.sender].stake -= amount;
        
        // Queue for withdrawal after lock
        pendingUnstake[msg.sender] = amount;
        
        emit AgentUnstaked(msg.sender, amount, block.timestamp + LOCK_PERIOD);
    }
    
    /**
     * @dev Withdraw unstaked tokens after lock period
     */
    function withdraw() external nonReentrant {
        uint256 amount = pendingUnstake[msg.sender];
        require(amount > 0, "No pending withdrawal");
        
        pendingUnstake[msg.sender] = 0;
        require(oracleToken.transfer(msg.sender, amount), "Transfer failed");
    }
    
    /**
     * @dev Slash an agent's stake (called by OracleHub)
     */
    function slashStake(address agent, uint256 amount, string calldata reason) external onlyOwner {
        require(agents[agent].stake >= amount, "Insufficient stake to slash");
        
        agents[agent].stake -= amount;
        
        // Reduce reputation
        if (agents[agent].reputation > 10) {
            agents[agent].reputation -= 10;
        }
        
        emit StakeSlashed(agent, amount, reason);
    }
    
    /**
     * @dev Update agent reputation
     */
    function updateReputation(address agent, uint256 newReputation) external onlyOwner {
        require(newReputation <= 100, "Reputation max 100");
        
        agents[agent].reputation = newReputation;
        agents[agent].lastActive = block.timestamp;
        
        emit ReputationUpdated(agent, newReputation);
    }
    
    /**
     * @dev Record successful response
     */
    function recordSuccess(address agent) external onlyOwner {
        require(agents[agent].capabilities.length > 0, "Agent not registered");
        
        agents[agent].totalRequests++;
        agents[agent].correctResponses++;
        
        // Increase reputation (capped at 100)
        if (agents[agent].reputation < 100) {
            agents[agent].reputation = uint256(
                min(int256(agents[agent].reputation + 1), 100)
            );
        }
        
        agents[agent].lastActive = block.timestamp;
    }
    
    /**
     * @dev Blacklist a malicious agent
     */
    function blacklistAgent(address agent, string calldata reason) external onlyOwner {
        agents[agent].blacklisted = true;
        
        // Slash remaining stake
        uint256 stake = agents[agent].stake;
        agents[agent].stake = 0;
        
        emit AgentBlacklisted(agent, reason);
        emit StakeSlashed(agent, stake, reason);
    }
    
    /**
     * @dev Get agent count
     */
    function getAgentCount() external view returns (uint256) {
        return agentList.length;
    }
    
    /**
     * @dev Get agents by capability
     */
    function getAgentsByCapability(string calldata capability) external view returns (address[] memory) {
        uint256 count = 0;
        for (uint i = 0; i < agentList.length; i++) {
            if (!agents[agentList[i]].blacklisted && agents[agentList[i]].stake >= MIN_STAKE) {
                for (uint j = 0; j < agents[agentList[i]].capabilities.length; j++) {
                    if (keccak256(abi.encodePacked(agents[agentList[i]].capabilities[j])) 
                        == keccak256(abi.encodePacked(capability))) {
                        count++;
                        break;
                    }
                }
            }
        }
        
        address[] memory result = new address[](count);
        uint256 idx = 0;
        for (uint i = 0; i < agentList.length; i++) {
            if (!agents[agentList[i]].blacklisted && agents[agentList[i]].stake >= MIN_STAKE) {
                for (uint j = 0; j < agents[agentList[i]].capabilities.length; j++) {
                    if (keccak256(abi.encodePacked(agents[agentList[i]].capabilities[j])) 
                        == keccak256(abi.encodePacked(capability))) {
                        result[idx] = agentList[i];
                        idx++;
                        break;
                    }
                }
            }
        }
        
        return result;
    }
    
    /**
     * @dev Helper: minimum of two numbers
     */
    function min(int256 a, int256 b) internal view returns (int256) {
        return a < b ? a : b;
    }
}
