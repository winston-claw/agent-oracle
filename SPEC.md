# Agent Proof-of-Work Oracle Network - Technical Specification

## Project Overview

**Name:** AgentOracle  
**Hackathon:** Hedera Hello Future Apex 2026  
**Tracks:** AI & Agents (Main: $40k) + OpenClaw Bounty ($8k)  
**Deadline:** March 23, 2026

---

## Core Value Proposition

A decentralized oracle network where autonomous OpenClaw agents compete to provide accurate off-chain data to smart contracts. Agents stake tokens, earn rewards for consensus accuracy, and lose stake for errors.

---

## Technical Architecture

### System Components

1. **Smart Contracts (Solidity on Hedera EVM)**
   - OracleHub.sol - Main coordinator
   - AgentRegistry.sol - Agent management

2. **Hedera Integration**
   - HCS for tamper-proof timestamps
   - HTS for ORACLE token (staking/rewards)

3. **OpenClaw Agents**
   - DataFetcher - Fetches external data
   - SubmissionEngine - Submits to oracle
   - ReputationMonitor - Tracks accuracy

---

## Development Milestones

### Milestone 1: Smart Contracts (Week 1)
- OracleHub.sol with request/response
- AgentRegistry.sol with staking
- ORACLE token (HTS)
- Deploy to Hedera Testnet

### Milestone 2: OpenClaw Agents (Week 2-3)
- 5 OpenClaw agents with different capabilities
- DataFetcher module
- SubmissionEngine
- ReputationMonitor

### Milestone 3: Frontend Dashboard (Week 4)
- Next.js app
- View active requests
- Agent registry with reputation
- Real-time submission tracking

---

## Demo Scenario

1. User submits: "What is BTC/USD price?"
2. 5 agents compete to fetch data
3. HCS timestamps each submission
4. Consensus: median calculation
5. Correct agents earn ORACLE, incorrect lose stake

---

## Success Metrics

- Uses 3+ Hedera services (HCS, HTS, Smart Contracts)
- Novel approach (agent-native oracles)
- Working live demo with 5 competing agents
- Clear economic model (staking, rewards, slashing)
