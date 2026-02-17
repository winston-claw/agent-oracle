/**
 * AgentOracle Agent - Main entry point
 * 
 * This runs as an OpenClaw agent, competing to provide accurate data
 * to the OracleHub smart contract.
 */

import { DataFetcher } from './dataFetcher';
import { SubmissionEngine } from './submissionEngine';
import { AgentConfig, DEFAULT_CONFIG } from './config';

export class OracleAgent {
  private config: AgentConfig;
  private dataFetcher: DataFetcher;
  private submissionEngine: SubmissionEngine;
  private running: boolean = false;

  constructor(
    config: AgentConfig = DEFAULT_CONFIG,
    oracleHubAddress: string,
    privateKey: string,
    rpcUrl: string = 'https://testnet.hashio.io'
  ) {
    this.config = config;
    this.dataFetcher = new DataFetcher(config.dataSources);
    this.submissionEngine = new SubmissionEngine(
      oracleHubAddress,
      privateKey,
      this.dataFetcher,
      rpcUrl
    );
  }

  /**
   * Start the agent
   */
  async start(): Promise<void> {
    console.log(`Starting Agent: ${this.config.name} (${this.config.agentId})`);
    console.log(`  Capabilities: ${this.config.capabilities.join(', ')}`);
    console.log(`  Stake: ${this.config.stake} ORACLE`);
    
    this.running = true;
    
    // Monitor for requests and respond
    await this.submissionEngine.monitorRequests(
      this.handleNewRequest.bind(this),
      15000 // Check every 15 seconds
    );
  }

  /**
   * Stop the agent
   */
  stop(): void {
    this.running = false;
    console.log(`Agent ${this.config.name} stopped`);
  }

  /**
   * Handle new oracle request
   */
  private async handleNewRequest(
    requestId: string,
    dataType: string,
    params: any
  ): Promise<void> {
    // Check if we can handle this request type
    if (!this.config.capabilities.includes(dataType)) {
      console.log(`Skipping request ${requestId} - not in capabilities`);
      return;
    }

    console.log(`\n=== New Request: ${requestId} ===`);
    console.log(`  Type: ${dataType}`);
    console.log(`  Params:`, params);

    // Fetch and submit
    const result = await this.submissionEngine.submitResponse(
      requestId,
      dataType,
      params
    );

    if (result.success) {
      console.log(`  ✅ Submitted successfully!`);
      console.log(`  Tx: ${result.txHash}`);
    } else {
      console.log(`  ❌ Failed: ${result.error}`);
    }
  }

  /**
   * Get agent status
   */
  getStatus(): { name: string; capabilities: string[]; running: boolean } {
    return {
      name: this.config.name,
      capabilities: this.config.capabilities,
      running: this.running
    };
  }
}

// CLI entry point
async function main() {
  const ORACLE_HUB = process.env.ORACLE_HUB_ADDRESS || '0x...';
  const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
  
  if (!PRIVATE_KEY) {
    console.error('Error: PRIVATE_KEY not set');
    process.exit(1);
  }

  const agent = new OracleAgent(
    DEFAULT_CONFIG,
    ORACLE_HUB,
    PRIVATE_KEY
  );

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\nShutting down...');
    agent.stop();
    process.exit(0);
  });

  await agent.start();
}

export default OracleAgent;

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}
