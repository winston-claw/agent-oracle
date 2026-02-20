import { ethers } from "hardhat";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  console.log("Deploying AgentOracle contracts to Hedera testnet...");
  
  // Get the provider and wallet directly
  const provider = ethers.provider;
  const privateKey = process.env.HEDERA_PRIVATE_KEY || "";
  
  if (!privateKey) {
    console.error("Error: HEDERA_PRIVATE_KEY not set in .env");
    process.exit(1);
  }
  
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log("Deploying from:", wallet.address);
  
  // Deploy mock ORACLE token (in production, use HTS)
  const OracleToken = await ethers.getContractFactory("MockOracleToken", wallet);
  const oracleToken = await OracleToken.deploy();
  await oracleToken.waitForDeployment();
  const oracleTokenAddress = await oracleToken.getAddress();
  console.log("OracleToken deployed to:", oracleTokenAddress);
  
  // Deploy AgentRegistry
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry", wallet);
  const agentRegistry = await AgentRegistry.deploy(oracleTokenAddress);
  await agentRegistry.waitForDeployment();
  const agentRegistryAddress = await agentRegistry.getAddress();
  console.log("AgentRegistry deployed to:", agentRegistryAddress);
  
  // Deploy OracleHub
  const OracleHub = await ethers.getContractFactory("OracleHub", wallet);
  const oracleHub = await OracleHub.deploy(oracleTokenAddress);
  await oracleHub.waitForDeployment();
  const oracleHubAddress = await oracleHub.getAddress();
  console.log("OracleHub deployed to:", oracleHubAddress);
  
  // Set agent registry on oracle hub
  await oracleHub.setAgentRegistry(agentRegistryAddress);
  console.log("AgentRegistry set on OracleHub");
  
  // Mint some ORACLE tokens for testing
  await oracleToken.mint(wallet.address, ethers.parseEther("100000"));
  console.log("Minted 100,000 ORACLE to deployer");
  
  console.log("\n=== Deployment Complete ===");
  console.log("OracleToken:", oracleTokenAddress);
  console.log("AgentRegistry:", agentRegistryAddress);
  console.log("OracleHub:", oracleHubAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
