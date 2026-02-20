import { httpAction } from './_generated/server';
import { internal } from './_generated/server';

// Handle oracle requests from the frontend
export const createOracleRequest = httpAction(async (ctx, request) => {
  try {
    const body = await request.json();
    const { query, dataType, params } = body;

    // Create the request
    const requestId = await ctx.db.insert('requests', {
      query: query || '',
      dataType: dataType || 'crypto_price',
      params: params || {},
      status: 'pending',
      createdAt: Date.now(),
    });

    // Trigger processing in background
    await ctx.scheduler.runAfter(0, 'oracle:processRequest', { requestId });

    return new Response(JSON.stringify({ requestId, status: 'pending' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Get request status and results
export const getOracleResult = httpAction(async (ctx, request) => {
  try {
    const url = new URL(request.url);
    const requestId = url.searchParams.get('requestId');

    if (!requestId) {
      return new Response(JSON.stringify({ error: 'Missing requestId' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const oracleRequest = await ctx.db.get(requestId as any);
    if (!oracleRequest) {
      return new Response(JSON.stringify({ error: 'Request not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const submissions = await ctx.db
      .query('submissions')
      .withIndex('by_request', q => q.eq('requestId', requestId as any))
      .collect();

    return new Response(JSON.stringify({
      request: oracleRequest,
      submissions,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});

// Get stats
export const getOracleStats = httpAction(async (ctx, request) => {
  try {
    const requests = await ctx.db.query('requests').collect();
    const submissions = await ctx.db.query('submissions').collect();

    const completed = requests.filter(r => r.status === 'completed');
    const totalValue = completed.reduce((sum, r) => sum + (r.consensusValue || 0), 0);
    const consensusCount = submissions.filter(s => s.isConsensus).length;
    const consensusRate = submissions.length > 0 ? (consensusCount / submissions.length) * 100 : 0;

    return new Response(JSON.stringify({
      totalRequests: requests.length,
      completedRequests: completed.length,
      totalSubmissions: submissions.length,
      totalValue,
      consensusRate: Math.round(consensusRate),
      activeAgents: 5,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
