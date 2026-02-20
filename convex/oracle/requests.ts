import { internalAction, internalQuery, mutation, query } from './_generated/server';
import { v } from 'convex/values';

// Define the agents that will fetch data
const AGENTS = [
  { agentId: 'agent-001', name: 'DataPulse', url: 'https://api.coingecko.com' },
  { agentId: 'agent-002', name: 'CryptoSentinel', url: 'https://api.binance.com' },
  { agentId: 'agent-003', name: 'ChainReader', url: 'https://api.kraken.com' },
  { agentId: 'agent-004', name: 'OracleSeeker', url: 'https://api.coinbase.com' },
  { agentId: 'agent-005', name: 'MarketWatcher', url: 'https://api.bybit.com' },
];

// Data fetcher functions (mirrors the agents/src/dataFetcher.ts)
async function fetchCryptoPrice(pair: string): Promise<{ success: boolean; data?: number; source: string; error?: string }> {
  const { default: axios } = await import('axios');
  
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

async function fetchWeather(location: string): Promise<{ success: boolean; data?: any; source: string; error?: string }> {
  const { default: axios } = await import('axios');
  
  // Try Open-Meteo (free, no API key)
  try {
    const response = await axios.get(
      `https://api.open-meteo.com/v1/forecast?latitude=-37.8136&longitude=144.9631&current=temperature_2m,precipitation,humidity`,
      { timeout: 5000 }
    );
    return { success: true, data: response.data.current, source: 'Open-Meteo' };
  } catch (e) {
    return { success: false, source: 'none', error: String(e) };
  }
}

// Create a new oracle request
export const createRequest = mutation({
  args: {
    query: v.string(),
    dataType: v.string(),
    params: v.any(),
  },
  handler: async (ctx, args) => {
    const requestId = await ctx.db.insert('requests', {
      query: args.query,
      dataType: args.dataType,
      params: args.params,
      status: 'pending',
      createdAt: Date.now(),
    });

    // Trigger processing
    await ctx.scheduler.runAfter(0, 'oracle:processRequest', { requestId });

    return requestId;
  },
});

// Internal action to process a request with all agents
export const processRequest = internalAction({
  args: { requestId: v.id('requests') },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request || request.status !== 'pending') return;

    // Update status to processing
    await ctx.db.patch(args.requestId, { status: 'processing' });

    const startTime = Date.now();
    const results: { agentId: string; agentName: string; value: number; source: string; timestamp: number; responseTime: number }[] = [];

    // Fetch data from each agent (simulating 5 different agents)
    for (const agent of AGENTS) {
      const agentStart = Date.now();
      let result: { success: boolean; data?: number; source: string; error?: string };

      if (request.dataType === 'crypto_price') {
        result = await fetchCryptoPrice(request.params?.pair || 'bitcoin');
      } else if (request.dataType === 'weather') {
        const weatherResult = await fetchWeather(request.params?.location || 'Melbourne');
        result = { 
          success: weatherResult.success, 
          data: weatherResult.data?.temperature_2m, 
          source: weatherResult.source 
        };
      } else {
        result = { success: false, source: 'none', error: 'Unknown data type' };
      }

      const responseTime = Date.now() - agentStart;

      if (result.success && result.data !== undefined) {
        results.push({
          agentId: agent.agentId,
          agentName: agent.name,
          value: result.data,
          source: result.source,
          timestamp: Date.now(),
          responseTime,
        });

        // Store submission
        await ctx.db.insert('submissions', {
          requestId: args.requestId,
          agentId: agent.agentId,
          agentName: agent.name,
          value: result.data,
          source: result.source,
          timestamp: Date.now(),
          responseTime,
        });
      }
    }

    // Calculate consensus (median)
    if (results.length > 0) {
      const values = results.map(r => r.value).sort((a, b) => a - b);
      const median = values[Math.floor(values.length / 2)];

      // Mark consensus agents
      const consensusThreshold = median * 0.05; // 5% tolerance
      for (const result of results) {
        const isConsensus = Math.abs(result.value - median) <= consensusThreshold;
        
        // Find and update the submission
        const submissions = await ctx.db
          .query('submissions')
          .withIndex('by_request', q => q.eq('requestId', args.requestId))
          .collect();
        
        const matching = submissions.find(s => s.agentId === result.agentId);
        if (matching) {
          await ctx.db.patch(matching._id, { isConsensus });
        }
      }

      // Update request with consensus value
      await ctx.db.patch(args.requestId, {
        status: 'completed',
        consensusValue: median,
        completedAt: Date.now(),
      });
    } else {
      await ctx.db.patch(args.requestId, {
        status: 'failed',
        completedAt: Date.now(),
      });
    }
  },
});

// Get request by ID
export const getRequest = query({
  args: { requestId: v.id('requests') },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) return null;

    const submissions = await ctx.db
      .query('submissions')
      .withIndex('by_request', q => q.eq('requestId', args.requestId))
      .collect();

    return { request, submissions };
  },
});

// Get recent requests
export const getRecentRequests = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    const requests = await ctx.db
      .query('requests')
      .withIndex('by_created')
      .order('desc')
      .take(limit);

    return requests;
  },
});

// Get stats
export const getStats = query({
  handler: async (ctx) => {
    const requests = await ctx.db.query('requests').collect();
    const submissions = await ctx.db.query('submissions').collect();

    const completed = requests.filter(r => r.status === 'completed');
    const totalValue = completed.reduce((sum, r) => sum + (r.consensusValue || 0), 0);
    const consensusCount = submissions.filter(s => s.isConsensus).length;
    const consensusRate = submissions.length > 0 ? (consensusCount / submissions.length) * 100 : 0;

    return {
      totalRequests: requests.length,
      completedRequests: completed.length,
      totalSubmissions: submissions.length,
      totalValue,
      consensusRate: Math.round(consensusRate),
      activeAgents: AGENTS.length,
    };
  },
});

// List all requests
export const listRequests = query({
  handler: async (ctx) => {
    return await ctx.db
      .query('requests')
      .withIndex('by_created')
      .order('desc')
      .take(50);
  },
});
