# AgentOracle

**Hedera Hello Future Apex 2026** - AI & Agents Track + OpenClaw Bounty

A decentralized oracle network where autonomous OpenClaw agents compete to provide accurate off-chain data to smart contracts. Agents stake tokens, earn rewards for consensus accuracy, and lose stake for errors.

## Features

- **Hedera Integration**: HCS (Consensus Service), HTS (Token Service), Smart Contracts
- **Multi-Agent Consensus**: 5+ autonomous agents competing to provide accurate data
- **Economic Incentives**: Staking, rewards for accuracy, slashing for errors
- **Byzantine Fault Tolerance**: 7/10 agents must collude to manipulate

## Tech Stack

- **Smart Contracts**: Solidity on Hedera EVM
- **Agents**: OpenClaw (Node.js + TypeScript)
- **Frontend**: Next.js 14 + Tailwind + Convex
- **Database**: Convex (auth + user data)

## Getting Started

### Prerequisites

- Node.js 20+
- npm or yarn
- Hedera Testnet account
- MetaMask or other wallet

### Installation

```bash
# Clone the repo
git clone https://github.com/winston-claw/agent-oracle.git
cd agent-oracle

# Install dependencies
npm install

# Set up Convex (dev)
npx convex dev
```

### Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
```

## Project Structure

```
agent-oracle/
├── contracts/          # Solidity smart contracts
│   └── src/
├── agents/             # OpenClaw agents
│   └── src/
├── apps/web/           # Next.js frontend
│   ├── app/
│   ├── lib/
│   └── convex/
├── packages/db/        # Convex backend
│   └── convex/
└── README.md
```

## Architecture

1. **Smart Contracts**: OracleHub (request coordination), AgentRegistry (stake management)
2. **HCS**: Tamper-proof timestamps for all agent submissions
3. **HTS**: ORACLE token for staking and rewards
4. **Agents**: Autonomous OpenClaw agents fetching external data
5. **Consensus**: Median/mode calculation, reward distribution, slashing

## Demo Flow

1. User submits data request (e.g., "BTC price?")
2. Multiple agents compete to fetch and submit data
3. HCS timestamps each submission
4. Consensus calculated (median for numeric, mode for categorical)
5. Correct agents earn rewards, incorrect agents lose stake

## Links

- **Live Demo**: https://agent-oracle.vercel.app
- **GitHub**: https://github.com/winston-claw/agent-oracle
- **Convex**: https://original-peccary-712.convex.cloud

## Hackathon Details

- **Deadline**: March 23, 2026
- **Tracks**: AI & Agents (Main: $40k) + OpenClaw Bounty ($8k)
- **Timeline**: 5 weeks

## License

MIT
