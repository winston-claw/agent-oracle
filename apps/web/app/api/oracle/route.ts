import { NextResponse } from 'next/server';
import axios from 'axios';

// In-memory storage (resets on server restart)
const requests: Map<string, {
  id: string;
  query: string;
  dataType: string;
  params: any;
  status: string;
  consensusValue?: number;
  createdAt: number;
  completedAt?: number;
  submissions: Array<{
    requestId: string;
    agentId: string;
    agentName: string;
    value: number;
    source: string;
    timestamp: number;
    responseTime: number;
    isConsensus?: boolean;
  }>;
}> = new Map();

// Agents configuration
const AGENTS = [
  { agentId: 'agent-001', name: 'DataPulse', url: 'https://api.coingecko.com' },
  { agentId: 'agent-002', name: 'CryptoSentinel', url: 'https://api.binance.com' },
  { agentId: 'agent-003', name: 'ChainReader', url: 'https://api.kraken.com' },
  { agentId: 'agent-004', name: 'OracleSeeker', url: 'https://api.coinbase.com' },
  { agentId: 'agent-005', name: 'MarketWatcher', url: 'https://api.bybit.com' },
];

// Data fetching functions
async function fetchCryptoPrice(pair: string): Promise<{ success: boolean; data?: number; source: string; error?: string }> {
  // Try CoinGecko
  try {
    const response = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${pair}&vs_currencies=usd`,
      { timeout: 5000 }
    );
    const data = response.data[pair]?.usd;
    if (data) return { success: true, data, source: 'CoinGecko' };
  } catch {}

  // Try Binance
  try {
    const response = await axios.get(
      `https://api.binance.com/api/v3/ticker/price?symbol=${pair.toUpperCase()}USDT`,
      { timeout: 5000 }
    );
    const data = parseFloat(response.data.price);
    if (!isNaN(data)) return { success: true, data, source: 'Binance' };
  } catch {}

  // Try Coinbase
  try {
    const response = await axios.get(
      `https://api.coinbase.com/v2/prices/${pair.toUpperCase()}-USD/spot`,
      { timeout: 5000 }
    );
    const data = parseFloat(response.data.data.amount);
    if (!isNaN(data)) return { success: true, data, source: 'Coinbase' };
  } catch {}

  return { success: false, source: 'none', error: 'All sources failed' };
}

async function fetchWeather(location: string): Promise<{ success: boolean; data?: number; source: string; error?: string }> {
  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=-37.8136&longitude=144.9631&current=temperature_2m`,
      { timeout: 5000 }
    );
    const data = response.data.current?.temperature_2m;
    if (data !== undefined) return { success: true, data, source: 'Open-Meteo' };
  } catch {}

  return { success: false, source: 'none', error: 'Weather API failed' };
}

// POST /api/oracle/create - Create a new oracle request
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, dataType = 'crypto_price', params = {} } = body;

    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const oracleRequest = {
      id: requestId,
      query: query || '',
      dataType,
      params,
      status: 'pending',
      createdAt: Date.now(),
      submissions: [],
    };

    requests.set(requestId, oracleRequest);

    // Process asynchronously (don't await)
    processRequest(requestId, dataType, params);

    return NextResponse.json({ requestId, status: 'pending' });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

// Process request with all agents
async function processRequest(requestId: string, dataType: string, params: any) {
  const request = requests.get(requestId);
  if (!request) return;

  request.status = 'processing';
  requests.set(requestId, request);

  const results: Array<{
    agentId: string;
    agentName: string;
    value: number;
    source: string;
    timestamp: number;
    responseTime: number;
  }> = [];

  // Fetch from each agent
  for (const agent of AGENTS) {
    const agentStart = Date.now();
    let result: { success: boolean; data?: number; source: string; error?: string };

    if (dataType === 'crypto_price') {
      result = await fetchCryptoPrice(params?.pair || 'bitcoin');
    } else if (dataType === 'weather') {
      result = await fetchWeather(params?.location || 'Melbourne');
    } else {
      result = { success: false, source: 'none', error: 'Unknown data type' };
    }

    const responseTime = Date.now() - agentStart;

    if (result.success && result.data !== undefined) {
      const submission = {
        requestId,
        agentId: agent.agentId,
        agentName: agent.name,
        value: result.data,
        source: result.source,
        timestamp: Date.now(),
        responseTime,
      };
      
      results.push(submission);

      // Update request
      const req = requests.get(requestId);
      if (req) {
        req.submissions.push(submission);
        requests.set(requestId, req);
      }
    }
  }

  // Calculate consensus (median)
  if (results.length > 0) {
    const values = results.map(r => r.value).sort((a, b) => a - b);
    const median = values[Math.floor(values.length / 2)];

    // Mark consensus agents (within 5% of median)
    const threshold = median * 0.05;
    const updatedResults = results.map(result => ({
      ...result,
      requestId,
      isConsensus: Math.abs(result.value - median) <= threshold,
    }));

    // Update request with results
    const req = requests.get(requestId);
    if (req) {
      req.submissions = updatedResults;
      req.status = 'completed';
      req.consensusValue = median;
      req.completedAt = Date.now();
      requests.set(requestId, req);
    }
  } else {
    const req = requests.get(requestId);
    if (req) {
      req.status = 'failed';
      req.completedAt = Date.now();
      requests.set(requestId, req);
    }
  }
}

// GET /api/oracle/stats - Get network stats
export async function GET(request: Request) {
  const url = new URL(request.url);
  const requestId = url.searchParams.get('requestId');

  // Return stats
  if (!requestId) {
    const allRequests = Array.from(requests.values());
    const completed = allRequests.filter(r => r.status === 'completed');
    const totalValue = completed.reduce((sum, r) => sum + (r.consensusValue || 0), 0);
    const allSubmissions = allRequests.flatMap(r => r.submissions);
    const consensusCount = allSubmissions.filter(s => s.isConsensus).length;
    const consensusRate = allSubmissions.length > 0 
      ? Math.round((consensusCount / allSubmissions.length) * 100) 
      : 0;

    return NextResponse.json({
      totalRequests: allRequests.length,
      completedRequests: completed.length,
      totalSubmissions: allSubmissions.length,
      totalValue: Math.round(totalValue * 100) / 100,
      consensusRate,
      activeAgents: AGENTS.length,
    });
  }

  // Return specific request
  const requestData = requests.get(requestId);
  if (!requestData) {
    return NextResponse.json({ error: 'Request not found' }, { status: 404 });
  }

  return NextResponse.json({ request: requestData });
}
