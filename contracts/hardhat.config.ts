import { HardhatUserConfig } from "hardhat/types";
import "@nomicfoundation/hardhat-toolbox";
import "@openzeppelin/hardhat-upgrades";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hedera: {
      url: process.env.HEDERA_NETWORK_URL || "https://testnet.hashio.io",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 296
    },
    hederaLocal: {
      url: "http://localhost:7546",
      accounts: ["0x0000000000000000000000000000000000000000000000000000000000000001"],
      chainId: 296
    }
  },
  etherscan: {
    apiKey: {
      hedera: process.env.HEDERA_EXPLORER_API_KEY || ""
    }
  }
};

export default config;
