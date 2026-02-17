import { ethers } from "hardhat";

async function main() {
  console.log("Deploying AgentOracle contracts to Hedera...");
  
  // Deploy mock ORACLE token (in production, use HTS)
  const OracleToken = await ethers.getContractFactory("MockOracleToken");
  const oracleToken = await OracleToken.deploy();
  await oracleToken.deployed();
  console.log("OracleToken deployed to:", oracleToken.address);
  
  // Deploy AgentRegistry
  const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
  const agentRegistry = await AgentRegistry.deploy(oracleToken.address);
  await agentRegistry.deployed();
  console.log("AgentRegistry deployed to:", agentRegistry.address);
  
  // Deploy OracleHub
  const OracleHub = await ethers.getContractFactory("OracleHub");
  const oracleHub = await OracleHub.deploy(oracleToken.address);
  await oracleHub.deployed();
  console.log("OracleHub deployed to:", oracleHub.address);
  
  // Set agent registry on oracle hub
  await oracleHub.setAgentRegistry(agentRegistry.address);
  console.log("AgentRegistry set on OracleHub");
  
  // Mint some ORACLE tokens for testing
  const [deployer] = await ethers.getSigners();
  await oracleToken.mint(deployer.address, ethers.utils.parseEther("100000"));
  console.log("Minted 100,000 ORACLE to deployer");
  
  console.log("\n=== Deployment Complete ===");
  console.log("OracleToken:", oracleToken.address);
  console.log("AgentRegistry:", agentRegistry.address);
  console.log("OracleHub:", oracleHub.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
