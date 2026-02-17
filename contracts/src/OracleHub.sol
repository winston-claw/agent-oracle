// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title OracleHub
 * @dev Main coordinator for oracle requests and consensus
 */
contract OracleHub is Ownable, ReentrancyGuard {
    
    // Structs
    struct Request {
        address requester;
        string dataType;        // "crypto_price", "weather", etc.
        bytes parameters;       // ABI-encoded params (e.g., "BTC/USD")
        uint256 fee;           // Payment in ORACLE tokens
        uint8 requiredAgents;
        uint8 consensusThreshold;  // Percentage needed (e.g., 66)
        uint256 deadline;
        bool finalized;
        bytes result;
        Response[] responses;
    }
    
    struct Response {
        address agent;
        bytes data;
        string proof;          // IPFS hash of API response
        uint256 timestamp;
        bool correct;
    }
    
    struct AgentInfo {
        bool isRegistered;
        string[] capabilities;
        uint256 stake;
        uint256 reputation;     // 0-100
        uint256 totalRequests;
        uint256 correctResponses;
    }
    
    // State
    mapping(bytes32 => Request) public requests;
    mapping(address => AgentInfo) public agents;
    address[] public agentList;
    
    IERC20 public oracleToken;
    address public agentRegistry;
    
    uint256 public constant MIN_STAKE = 1000e18;
    uint256 public constant SLASH_PENALTY = 50; // 5%
    uint256 public constant REWARD_MULTIPLIER = 10000;
    
    // Events
    event DataRequested(bytes32 indexed requestId, address requester, string dataType, uint256 fee);
    event ResponseSubmitted(bytes32 indexed requestId, address agent, bytes data);
    event RequestFinalized(bytes32 indexed requestId, bytes result, uint256 correctCount, uint256 incorrectCount);
    event RewardDistributed(bytes32 indexed requestId, address[] agents, uint256[] rewards);
    
    constructor(address _oracleToken) Ownable(msg.sender) {
        oracleToken = IERC20(_oracleToken);
    }
    
    /**
     * @dev Set the agent registry contract
     */
    function setAgentRegistry(address _agentRegistry) external onlyOwner {
        agentRegistry = _agentRegistry;
    }
    
    /**
     * @dev Request data from the oracle network
     */
    function requestData(
        string calldata dataType,
        bytes calldata parameters,
        uint8 requiredAgents,
        uint8 consensusThreshold
    ) external payable returns (bytes32 requestId) {
        require(requiredAgents >= 3, "Need at least 3 agents");
        require(consensusThreshold >= 51 && consensusThreshold <= 100, "Threshold 51-100%");
        
        requestId = keccak256(abi.encodePacked(
            msg.sender,
            dataType,
            parameters,
            block.timestamp
        ));
        
        // Transfer fee to contract (simplified - in production would be HTS)
        require(oracleToken.transferFrom(msg.sender, address(this), 100e18), "Fee transfer failed");
        
        Request storage req = requests[requestId];
        req.requester = msg.sender;
        req.dataType = dataType;
        req.parameters = parameters;
        req.fee = 100e18;
        req.requiredAgents = requiredAgents;
        req.consensusThreshold = consensusThreshold;
        req.deadline = block.timestamp + 2 minutes;
        req.finalized = false;
        
        emit DataRequested(requestId, msg.sender, dataType, req.fee);
    }
    
    /**
     * @dev Agents submit their response to a request
     */
    function submitResponse(
        bytes32 requestId,
        bytes calldata data,
        string calldata proof
    ) external {
        Request storage req = requests[requestId];
        require(req.requester != address(0), "Request not found");
        require(!req.finalized, "Request already finalized");
        require(block.timestamp < req.deadline, "Deadline passed");
        require(agents[msg.sender].isRegistered, "Agent not registered");
        require(agents[msg.sender].stake >= MIN_STAKE, "Insufficient stake");
        
        // Check if agent already responded
        for (uint i = 0; i < req.responses.length; i++) {
            require(req.responses[i].agent != msg.sender, "Already responded");
        }
        
        req.responses.push(Response({
            agent: msg.sender,
            data: data,
            proof: proof,
            timestamp: block.timestamp,
            correct: false
        }));
        
        emit ResponseSubmitted(requestId, msg.sender, data);
    }
    
    /**
     * @dev Finalize request and calculate consensus
     */
    function finalizeRequest(bytes32 requestId) external nonReentrant returns (bytes memory result) {
        Request storage req = requests[requestId];
        require(req.requester != address(0), "Request not found");
        require(!req.finalized, "Already finalized");
        require(req.responses.length >= req.requiredAgents || block.timestamp > req.deadline, "Need more responses");
        
        // Calculate consensus based on data type
        if (keccak256(abi.encodePacked(req.dataType)) == keccak256(abi.encodePacked("crypto_price"))) {
            result = _calculateNumericConsensus(req.responses);
        } else {
            result = _calculateModeConsensus(req.responses);
        }
        
        req.result = result;
        req.finalized = true;
        
        // Determine correct/incorrect and distribute rewards
        uint256 correctCount = 0;
        uint256 incorrectCount = 0;
        address[] memory correctAgents = new address[](req.responses.length);
        
        for (uint i = 0; i < req.responses.length; i++) {
            bool isCorrect = _verifyResponse(req.responses[i].data, result);
            req.responses[i].correct = isCorrect;
            
            if (isCorrect) {
                correctAgents[correctCount] = req.responses[i].agent;
                correctCount++;
                agents[req.responses[i].agent].correctResponses++;
            } else {
                incorrectCount++;
                // Slash incorrect agent
                uint256 slashAmount = (agents[req.responses[i].agent].stake * SLASH_PENALTY) / 1000;
                agents[req.responses[i].agent].stake -= slashAmount;
            }
            
            agents[req.responses[i].agent].totalRequests++;
        }
        
        // Distribute rewards to correct agents
        if (correctCount > 0) {
            uint256 rewardPerAgent = req.fee / correctCount;
            for (uint i = 0; i < correctCount; i++) {
                if (correctAgents[i] != address(0)) {
                    oracleToken.transfer(correctAgents[i], rewardPerAgent);
                }
            }
        }
        
        emit RequestFinalized(requestId, result, correctCount, incorrectCount);
    }
    
    /**
     * @dev Calculate median for numeric data
     */
    function _calculateNumericConsensus(Response[] storage responses) internal pure returns (bytes memory) {
        uint256 n = responses.length;
        uint256[] memory values = new uint256[](n);
        
        for (uint i = 0; i < n; i++) {
            values[i] = abi.decode(responses[i].data, (uint256));
        }
        
        // Sort and get median
        _sort(values);
        uint256 median = values[n / 2];
        
        return abi.encode(median);
    }
    
    /**
     * @dev Calculate mode for categorical data
     */
    function _calculateModeConsensus(Response[] storage responses) internal pure returns (bytes memory) {
        // For simplicity, just return the first response
        // In production, implement proper mode calculation
        return responses[0].data;
    }
    
    /**
     * @dev Verify if response matches consensus
     */
    function _verifyResponse(bytes memory data, bytes memory consensus) internal pure returns (bool) {
        // Simple comparison - in production use ±2% tolerance for numeric
        return keccak256(data) == keccak256(consensus);
    }
    
    /**
     * @dev Quick sort for median calculation
     */
    function _sort(uint256[] memory arr) internal pure {
        for (uint i = 0; i < arr.length; i++) {
            for (uint j = i + 1; j < arr.length; j++) {
                if (arr[i] > arr[j]) {
                    uint256 temp = arr[i];
                    arr[i] = arr[j];
                    arr[j] = temp;
                }
            }
        }
    }
    
    /**
     * @dev Get request details
     */
    function getRequest(bytes32 requestId) external view returns (
        address requester,
        string memory dataType,
        uint256 fee,
        uint8 requiredAgents,
        uint256 responseCount,
        bool finalized
    ) {
        Request storage req = requests[requestId];
        return (
            req.requester,
            req.dataType,
            req.fee,
            req.requiredAgents,
            req.responses.length,
            req.finalized
        );
    }
}
