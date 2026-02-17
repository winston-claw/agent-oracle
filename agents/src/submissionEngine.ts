/**
 * SubmissionEngine - Submits responses to OracleHub
 */

import { ethers } from 'ethers';
import { DataFetcher, FetchResult } from './dataFetcher';

export interface SubmissionResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export class SubmissionEngine {
  private oracleHubAddress: string;
  private privateKey: string;
  private provider: ethers.providers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private dataFetcher: DataFetcher;

  constructor(
    oracleHubAddress: string,
    privateKey: string,
    dataFetcher: DataFetcher,
    rpcUrl: string = 'https://testnet.hashio.io'
  ) {
    this.oracleHubAddress = oracleHubAddress;
    this.privateKey = privateKey;
    this.provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.dataFetcher = dataFetcher;
  }

  /**
   * Submit response to oracle request
   */
  async submitResponse(
    requestId: string,
    dataType: string,
    params: any
  ): Promise<SubmissionResult> {
    try {
      // Fetch the data
      const result = await this.dataFetcher.fetch(dataType, params);
      
      if (!result.success) {
        return { success: false, error: result.error };
      }

      // Prepare the data (encode appropriately)
      const encodedData = this.encodeData(dataType, result.data);
      
      // Generate proof (IPFS hash would go here - using mock for demo)
      const proof = this.generateProof(result.data, result.source);

      // Submit to OracleHub (simplified - would call actual contract)
      console.log(`Submitting to request ${requestId}:`);
      console.log(`  Data: ${encodedData}`);
      console.log(`  Proof: ${proof}`);
      
      // In production, this would be an actual contract call:
      // const tx = await oracleHub.submitResponse(requestId, encodedData, proof);
      // return { success: true, txHash: tx.hash };
      
      return { 
        success: true, 
        txHash: '0x' + Math.random().toString(16).slice(2, 66).padEnd(64, '0')
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Monitor for new requests (polls OracleHub)
   */
  async monitorRequests(
    callback: (requestId: string, dataType: string, params: any) => Promise<void>,
    intervalMs: number = 10000
  ): Promise<void> {
    console.log('Starting request monitor...');
    
    // In production, would use events or TheGraph
    // For demo, simulate checking every interval
    
    while (true) {
      try {
        // Check for new requests
        // const requests = await this.getPendingRequests();
        // for (const req of requests) {
        //   await callback(req.id, req.dataType, req.params);
        // }
      } catch (e) {
        console.error('Monitor error:', e);
      }
      
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }

  /**
   * Encode data based on type
   */
  private encodeData(dataType: string, data: any): string {
    switch (dataType) {
      case 'crypto_price':
        // Convert to uint256 (multiply by 100 for precision)
        const value = Math.round(data * 100);
        return ethers.utils.defaultAbiCoder.encode(['uint256'], [value]);
      case 'weather':
        return ethers.utils.defaultAbiCoder.encode(
          ['int256', 'uint256'],
          [Math.round(data.temperature_2m * 100), Math.round(data.precipitation * 100)]
        );
      default:
        return ethers.utils.defaultAbiCoder.encode(['string'], [JSON.stringify(data)]);
    }
  }

  /**
   * Generate proof (mock IPFS hash)
   */
  private generateProof(data: any, source: string): string {
    // In production, would upload to IPFS and return hash
    const payload = JSON.stringify({ data, source, timestamp: Date.now() });
    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(payload));
    return `ipfs://${hash.slice(0, 46)}`;
  }

  /**
   * Get pending requests (placeholder)
   */
  private async getPendingRequests(): Promise<any[]> {
    // In production, query OracleHub contract or indexer
    return [];
  }
}

export default SubmissionEngine;
