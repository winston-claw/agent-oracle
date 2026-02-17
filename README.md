# AgentOracle

**Hedera Hello Future Apex 2026** - AI & Agents Track + OpenClaw Bounty ($8k)

A decentralized oracle network where autonomous OpenClaw agents compete to provide accurate off-chain data to smart contracts. Agents stake tokens, earn rewards for consensus accuracy, and lose stake for errors.

## 🎯 Hackathon Details

- **Deadline:** March 23, 2026
- **Tracks:** AI & Agents (Main: $40k) + OpenClaw Bounty ($8k)
- **Timeline:** 5 weeks

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Smart Contracts (Hedera)                  │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │  OracleHub.sol  │    │     AgentRegistry.sol        │   │
│  │  - requestData │    │  - registerAgent             │   │
│  │  - submitResp  │    │  - stakeTokens               │   │
│  │  - finalize    │    │  - reputation tracking       │   │
│  └─────────────────┘    └──────────────────────────────┘   │
│                              │                             │
│                     ┌────────┴────────┐                    │
│                     │  MockOracleToken │                   │
│                     │  (HTS in prod)   │                   │
│                     └──────────────────┘                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   OpenClaw Agents                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Crypto Alpha │  │ Weather Delta│  │Sports Foxtrot│    │
│  │ - CoinGecko  │  │ Open-Meteo  │  │  TheSportsDB │    │
│  │ - Binance    │  │ WeatherAPI  │  │  API-Football│    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                      │
│  - View requests    - Agent leaderboard   - Create request │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
agent-oracle/
├── contracts/           # Solidity smart contracts
│   ├── src/
│   │   ├── OracleHub.sol      # Main oracle coordinator
│   │   ├── AgentRegistry.sol  # Agent staking & reputation
│   │   └── MockOracleToken.sol
│   ├── scripts/
│   │   └── deploy.ts
│   ├── test/
│   └── hardhat.config.ts
├── agents/              # OpenClaw agents
│   └── src/
│       ├── index.ts           # Main agent entry
│       ├── config.ts          # Agent configurations
│       ├── dataFetcher.ts     # External API fetcher
│       └── submissionEngine.ts # OracleHub submission
├── apps/web/           # Next.js frontend
│   ├── app/
│   │   └── page.tsx          # Oracle dashboard
│   └── lib/
└── SPEC.md             # Technical specification
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Smart contracts
cd contracts && npm install

# Agents
cd ../agents && npm install
```

### 2. Deploy Smart Contracts (Hedera Testnet)

```bash
cd contracts
# Set environment
export PRIVATE_KEY=your_private_key
export HEDERA_NETWORK_URL=https://testnet.hashio.io

# Deploy
npx hardhat run scripts/deploy.ts --network hedera
```

### 3. Start Agents

```bash
cd agents
export PRIVATE_KEY=your_private_key
export ORACLE_HUB_ADDRESS=0x...
npm run start
```

### 4. Frontend

```bash
cd apps/web
npm run dev
```

## 🎮 Demo Flow

1. **User submits request:** "What's BTC/USD?"
2. **Agents compete:** 5 agents fetch data from different APIs
3. **HCS timestamps:** Each submission gets tamper-proof timestamp
4. **Consensus:** Median calculated, outliers slashed
5. **Rewards:** Correct agents earn ORACLE, incorrect lose stake

## 📊 Success Metrics

- ✅ Uses 3+ Hedera services (HCS, HTS, Smart Contracts)
- ✅ Novel approach (first agent-native oracle)
- ✅ Working demo with 5 competing agents
- ✅ Economic model: staking, rewards, slashing

## 🔗 Links

- **Frontend:** https://agent-oracle.vercel.app
- **Convex:** https://original-peccary-712.convex.cloud
- **GitHub:** https://github.com/winston-claw/agent-oracle
