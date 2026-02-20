'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/useAuth';

interface OracleRequest {
  id: string;
  query: string;
  dataType: string;
  params?: Record<string, unknown>;
  status: string;
  consensusValue?: number;
  createdAt: number;
  completedAt?: number;
  submissions: Array<{
    agentId: string;
    agentName: string;
    value: number;
    source: string;
    timestamp: number;
    responseTime: number;
    isConsensus?: boolean;
  }>;
}

interface OracleStats {
  totalRequests: number;
  completedRequests: number;
  totalSubmissions: number;
  totalValue: number;
  consensusRate: number;
  activeAgents: number;
}

// Agent names
const AGENTS = [
  { id: 'agent-001', name: 'DataPulse', avatar: '🔵' },
  { id: 'agent-002', name: 'CryptoSentinel', avatar: '🟢' },
  { id: 'agent-003', name: 'ChainReader', avatar: '🟡' },
  { id: 'agent-004', name: 'OracleSeeker', avatar: '🟠' },
  { id: 'agent-005', name: 'MarketWatcher', avatar: '🔴' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState<OracleStats>({
    totalRequests: 0,
    completedRequests: 0,
    totalSubmissions: 0,
    totalValue: 0,
    consensusRate: 0,
    activeAgents: 5,
  });
  const [requests, setRequests] = useState<OracleRequest[]>([]);
  const [query, setQuery] = useState('');
  const [dataType, setDataType] = useState('crypto_price');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/oracle/stats');
      const data = await res.json();
      if (data.totalRequests !== undefined) {
        setStats(data);
      }
    } catch (e) {
      console.error('Failed to fetch stats:', e);
    }
  }, []);

  // Fetch all requests
  const fetchRequests = useCallback(async () => {
    // For now, we track requests in local state
    // In production, you'd have a list endpoint
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const handleLogout = async () => {
    await logout();
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // Parse the query to determine params
      let params = {};
      const q = query.toLowerCase();
      
      if (q.includes('btc') || q.includes('bitcoin')) {
        params = { pair: 'bitcoin' };
        setDataType('crypto_price');
      } else if (q.includes('eth') || q.includes('ethereum')) {
        params = { pair: 'ethereum' };
        setDataType('crypto_price');
      } else if (q.includes('sol') || q.includes('solana')) {
        params = { pair: 'solana' };
        setDataType('crypto_price');
      } else if (q.includes('weather') || q.includes('temp')) {
        params = { location: 'Melbourne' };
        setDataType('weather');
      } else {
        // Default to BTC
        params = { pair: 'bitcoin' };
        setDataType('crypto_price');
      }

      const res = await fetch('/api/oracle/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, dataType, params }),
      });
      
      const data = await res.json();
      
      if (data.requestId) {
        // Add to local requests list
        const newRequest: OracleRequest = {
          id: data.requestId,
          query,
          dataType,
          params,
          status: 'pending',
          createdAt: Date.now(),
          submissions: [],
        };
        setRequests(prev => [newRequest, ...prev]);
        setRecentActivity(prev => [`Request submitted: ${query}`, ...prev]);
        
        // Poll for updates on this request
        pollRequest(data.requestId);
      }
      
      setQuery('');
    } catch (err) {
      console.error('Failed to create request:', err);
      setRecentActivity(prev => [`Error: Failed to submit request`, ...prev]);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Poll a specific request for updates
  const pollRequest = (requestId: string) => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`/api/oracle?requestId=${requestId}`);
        const data = await res.json();
        
        if (data.request) {
          setRequests(prev => prev.map(r => 
            r.id === requestId ? data.request : r
          ));
          
          // Update activity
          if (data.request.status === 'completed') {
            setRecentActivity(prev => [
              `Consensus: $${data.request.consensusValue?.toLocaleString()} (${data.request.submissions.filter((s: any) => s.isConsensus).length} agents agreed)`,
              ...prev.slice(0, 4)
            ]);
            clearInterval(poll);
          }
        }
      } catch (e) {
        console.error('Poll error:', e);
      }
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500/20 text-emerald-400';
      case 'processing':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-600 text-slate-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '✓ Complete';
      case 'processing':
        return '⏳ Processing';
      case 'failed':
        return '✗ Failed';
      default:
        return '⏸ Pending';
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-xl font-bold">⬡</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AgentOracle</h1>
              <p className="text-xs text-slate-400">Decentralized Data Oracle</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-400">Network Online</span>
            </div>
            <span className="text-sm text-slate-400 truncate max-w-[200px]">
              {user.email}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-transparent text-slate-400 border border-slate-600 rounded-lg cursor-pointer hover:bg-slate-700 hover:text-white transition-colors min-h-[44px] w-full sm:w-auto text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-[1400px] mx-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">Total Requests</span>
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.totalRequests}</div>
            <div className="text-xs text-emerald-400 mt-1">{stats.completedRequests} completed</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">ORACLE Volume</span>
              <span className="text-2xl">💎</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">${stats.totalValue.toLocaleString()}</div>
            <div className="text-xs text-emerald-400 mt-1">USD value queried</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">Active Agents</span>
              <span className="text-2xl">🤖</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.activeAgents}</div>
            <div className="text-xs text-emerald-400 mt-1">Running</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">Consensus Rate</span>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{stats.consensusRate}%</div>
            <div className="text-xs text-emerald-400 mt-1">Agent agreement</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Oracle Request Form */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🔮</span> Create Oracle Request
              </h3>
              <form onSubmit={handleSubmitRequest} className="space-y-4">
                <div>
                  <label htmlFor="query" className="block text-sm text-slate-400 mb-2">
                    Data Query
                  </label>
                  <input
                    id="query"
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., What is BTC price? or What's the weather?"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => { setDataType('crypto_price'); setQuery('What is BTC price?'); }}
                    className={`px-3 py-1 rounded text-sm ${dataType === 'crypto_price' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                  >
                    Bitcoin
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDataType('crypto_price'); setQuery('What is ETH price?'); }}
                    className={`px-3 py-1 rounded text-sm ${dataType === 'crypto_price' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                  >
                    Ethereum
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDataType('weather'); setQuery("What's the weather in Melbourne?"); }}
                    className={`px-3 py-1 rounded text-sm ${dataType === 'weather' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}
                  >
                    Weather
                  </button>
                </div>
                <button
                  type="submit"
                  disabled={!query.trim() || isSubmitting}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg cursor-pointer hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>
            </div>

            {/* Active Requests */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📋</span> Your Requests
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {requests.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No requests yet. Submit one above!</p>
                ) : (
                  requests.map((req) => (
                    <div key={req.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="text-white font-medium">{req.query}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {req.dataType} • {new Date(req.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(req.status)}`}>
                          {getStatusLabel(req.status)}
                        </span>
                      </div>
                      
                      {/* Submissions */}
                      {req.submissions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-700">
                          <p className="text-xs text-slate-500 mb-2">Agent Submissions:</p>
                          <div className="space-y-2">
                            {req.submissions.map((sub, idx) => (
                              <div key={idx} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className={sub.isConsensus ? 'text-emerald-400' : 'text-red-400'}>
                                    {sub.isConsensus ? '✓' : '✗'}
                                  </span>
                                  <span className="text-slate-300">{sub.agentName}</span>
                                  <span className="text-xs text-slate-500">({sub.source})</span>
                                </div>
                                <span className="text-white font-mono">
                                  {req.dataType === 'crypto_price' ? `$${sub.value.toLocaleString()}` : `${sub.value}°C`}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Consensus */}
                      {req.consensusValue && (
                        <div className="mt-3 pt-3 border-t border-slate-700 bg-slate-800/50 rounded p-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-400">Consensus</span>
                            <span className="text-lg font-bold text-emerald-400">
                              {req.dataType === 'crypto_price' ? `$${req.consensusValue.toLocaleString()}` : `${req.consensusValue}°C`}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Agent Registry */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>🤖</span> Agent Registry
              </h3>
              <div className="space-y-3">
                {AGENTS.map((agent) => (
                  <div key={agent.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{agent.avatar}</span>
                        <div>
                          <p className="text-white font-medium">{agent.name}</p>
                          <p className="text-xs text-slate-500">
                            {agent.id}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-emerald-400">● Active</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>⚡</span> Recent Activity
              </h3>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-slate-500 text-sm">Activity will appear here...</p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 text-sm">
                      <span className="text-slate-500 mt-0.5">•</span>
                      <span className="text-slate-300">{activity}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
