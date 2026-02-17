'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/auth';

// Types
interface Agent {
  id: string;
  name: string;
  reputation: number;
  stake: number;
  status: 'active' | 'inactive';
  avatar: string;
}

interface Submission {
  id: string;
  agentId: string;
  agentName: string;
  value: string;
  timestamp: Date;
  isCorrect?: boolean;
}

interface OracleRequest {
  id: string;
  query: string;
  timestamp: Date;
  status: 'pending' | 'resolving' | 'completed';
  submissions: Submission[];
  consensus?: {
    median: string;
    winners: string[];
    slashed: string[];
  };
}

// Demo agents data
const INITIAL_AGENTS: Agent[] = [
  { id: '1', name: 'Agent Alpha', reputation: 98, stake: 50000, status: 'active', avatar: '🔵' },
  { id: '2', name: 'Agent Beta', reputation: 95, stake: 42000, status: 'active', avatar: '🟢' },
  { id: '3', name: 'Agent Gamma', reputation: 87, stake: 35000, status: 'active', avatar: '🟡' },
  { id: '4', name: 'Agent Delta', reputation: 72, stake: 28000, status: 'active', avatar: '🟠' },
  { id: '5', name: 'Agent Epsilon', reputation: 45, stake: 15000, status: 'inactive', avatar: '🔴' },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  
  // State
  const [query, setQuery] = useState('');
  const [requests, setRequests] = useState<OracleRequest[]>([
    {
      id: '1',
      query: 'What is BTC/USD price?',
      timestamp: new Date(Date.now() - 300000),
      status: 'completed',
      submissions: [
        { id: '1', agentId: '1', agentName: 'Agent Alpha', value: '$42,350', timestamp: new Date(Date.now() - 280000), isCorrect: true },
        { id: '2', agentId: '2', agentName: 'Agent Beta', value: '$42,380', timestamp: new Date(Date.now() - 260000), isCorrect: true },
        { id: '3', agentId: '3', agentName: 'Agent Gamma', value: '$42,100', timestamp: new Date(Date.now() - 240000), isCorrect: false },
      ],
      consensus: {
        median: '$42,350',
        winners: ['1', '2'],
        slashed: ['3'],
      },
    },
    {
      id: '2',
      query: 'ETH/USD price target?',
      timestamp: new Date(Date.now() - 120000),
      status: 'resolving',
      submissions: [
        { id: '4', agentId: '1', agentName: 'Agent Alpha', value: '$2,890', timestamp: new Date(Date.now() - 100000) },
        { id: '5', agentId: '2', agentName: 'Agent Beta', value: '$2,875', timestamp: new Date(Date.now() - 80000) },
      ],
    },
  ]);
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [recentActivity, setRecentActivity] = useState<string[]>([
    'Agent Alpha submitted: BTC/USD $42,350',
    'Agent Beta submitted: ETH/USD $2,875',
    'Request completed: BTC/USD consensus reached',
    'Agent Gamma joined the network',
  ]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
  };

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const newRequest: OracleRequest = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: new Date(),
      status: 'pending',
      submissions: [],
    };

    setRequests(prev => [newRequest, ...prev]);
    setQuery('');

    // Simulate agent responses
    const randomValues = generateMockValues(query);
    simulateAgentResponses(newRequest.id, randomValues);
    
    setRecentActivity(prev => [`New request: ${query.trim()}`, ...prev]);
  };

  const generateMockValues = (q: string): string[] => {
    // Generate realistic mock values based on query type
    if (q.toLowerCase().includes('btc') || q.toLowerCase().includes('bitcoin')) {
      return ['$42,350', '$42,380', '$42,100', '$42,420', '$42,290'];
    } else if (q.toLowerCase().includes('eth') || q.toLowerCase().includes('ethereum')) {
      return ['$2,890', '$2,875', '$2,920', '$2,850', '$2,900'];
    } else if (q.toLowerCase().includes('sol') || q.toLowerCase().includes('solana')) {
      return ['$98.50', '$99.20', '$97.80', '$98.90', '$98.10'];
    } else if (q.toLowerCase().includes('ai16z') || q.toLowerCase().includes('ai16z')) {
      return ['$0.42', '$0.41', '$0.43', '$0.40', '$0.44'];
    }
    // Default random values
    const base = Math.floor(Math.random() * 1000);
    return [base.toString(), (base + 20).toString(), (base - 30).toString(), (base + 10).toString(), (base - 10).toString()];
  };

  const simulateAgentResponses = (requestId: string, values: string[]) => {
    const activeAgents = agents.filter(a => a.status === 'active');
    
    // Update status to resolving
    setTimeout(() => {
      setRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: 'resolving' } : r
      ));
    }, 1000);

    // Simulate each active agent submitting
    activeAgents.forEach((agent, index) => {
      setTimeout(() => {
        const value = values[index] || values[0];
        
        const submission: Submission = {
          id: `${requestId}-${agent.id}`,
          agentId: agent.id,
          agentName: agent.name,
          value,
          timestamp: new Date(),
        };

        setRequests(prev => prev.map(r => {
          if (r.id === requestId) {
            return { ...r, submissions: [...r.submissions, submission] };
          }
          return r;
        }));

        setRecentActivity(prev => [`${agent.name} submitted: ${value}`, ...prev.slice(0, 9)]);
      }, 2000 + (index * 1500));
    });

    // Calculate consensus after all submissions
    setTimeout(() => {
      setRequests(prev => prev.map(r => {
        if (r.id === requestId && r.submissions.length > 0) {
          // Calculate median
          const numericValues = r.submissions
            .map(s => parseFloat(s.value.replace(/[^0-9.-]/g, '')))
            .sort((a, b) => a - b);
          const mid = Math.floor(numericValues.length / 2);
          const median = numericValues.length % 2 !== 0 
            ? numericValues[mid] 
            : (numericValues[mid - 1] + numericValues[mid]) / 2;
          
          // Format median back to currency
          const formattedMedian = median >= 1000 
            ? `$${median.toLocaleString()}` 
            : `$${median.toFixed(2)}`;

          // Determine winners (within 5% of median)
          const threshold = median * 0.05;
          const winners = r.submissions
            .filter(s => Math.abs(parseFloat(s.value.replace(/[^0-9.-]/g, '')) - median) <= threshold)
            .map(s => s.agentId);
          
          const slashed = r.submissions
            .filter(s => !winners.includes(s.agentId))
            .map(s => s.agentId);

          // Mark submissions as correct/incorrect
          const updatedSubmissions = r.submissions.map(s => ({
            ...s,
            isCorrect: winners.includes(s.agentId),
          }));

          return {
            ...r,
            status: 'completed',
            submissions: updatedSubmissions,
            consensus: {
              median: formattedMedian,
              winners,
              slashed,
            },
          };
        }
        return r;
      }));

      setRecentActivity(prev => [`Consensus reached for request`, ...prev.slice(0, 9)]);
    }, 10000);
  };

  // Calculate stats
  const totalRequests = requests.length;
  const oracleVolume = totalRequests * 125000; // Mock volume
  const activeAgentsCount = agents.filter(a => a.status === 'active').length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;
  const consensusRate = completedRequests > 0 
    ? Math.round((completedRequests / requests.filter(r => r.status !== 'pending').length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
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
            <div className="text-2xl sm:text-3xl font-bold text-white">{totalRequests}</div>
            <div className="text-xs text-emerald-400 mt-1">All time</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">ORACLE Volume</span>
              <span className="text-2xl">💎</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">${(oracleVolume / 1000000).toFixed(2)}M</div>
            <div className="text-xs text-emerald-400 mt-1">+12.5% this week</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">Active Agents</span>
              <span className="text-2xl">🤖</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{activeAgentsCount}/{agents.length}</div>
            <div className="text-xs text-emerald-400 mt-1">Online now</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">Consensus Rate</span>
              <span className="text-2xl">🎯</span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">{consensusRate}%</div>
            <div className="text-xs text-emerald-400 mt-1">Last 24 hours</div>
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
                    placeholder="e.g., What is BTC/USD price?"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!query.trim()}
                  className="w-full px-4 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold rounded-lg cursor-pointer hover:from-emerald-600 hover:to-cyan-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                >
                  Submit Request
                </button>
              </form>
            </div>

            {/* Active Requests */}
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span>📋</span> Requests
              </h3>
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {requests.length === 0 ? (
                  <p className="text-slate-500 text-center py-8">No requests yet</p>
                ) : (
                  requests.map((request) => (
                    <div key={request.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-white font-medium">{request.query}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatTimeAgo(request.timestamp)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          request.status === 'completed' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : request.status === 'resolving'
                            ? 'bg-yellow-500/20 text-yellow-400'
                            : 'bg-slate-600 text-slate-300'
                        }`}>
                          {request.status === 'completed' ? '✓ Complete' : request.status === 'resolving' ? '⏳ Resolving' : '⏸ Pending'}
                        </span>
                      </div>

                      {/* Submissions */}
                      {request.submissions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-700">
                          <p className="text-xs text-slate-500 mb-2">Agent Submissions:</p>
                          <div className="space-y-2">
                            {request.submissions.map((sub) => (
                              <div key={sub.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span className={
                                    request.status === 'completed' 
                                      ? sub.isCorrect 
                                        ? 'text-emerald-400' 
                                        : 'text-red-400'
                                      : 'text-slate-300'
                                  }>
                                    {sub.isCorrect === true ? '✓' : sub.isCorrect === false ? '✗' : '○'}
                                  </span>
                                  <span className="text-slate-300">{sub.agentName}</span>
                                </div>
                                <span className="text-white font-mono">{sub.value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Consensus */}
                      {request.consensus && (
                        <div className="mt-3 pt-3 border-t border-slate-700 bg-slate-800/50 rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-slate-400">Consensus</span>
                            <span className="text-lg font-bold text-emerald-400">{request.consensus.median}</span>
                          </div>
                          <div className="flex gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                              <span className="text-slate-400">Winners: {request.consensus.winners.length}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                              <span className="text-slate-400">Slashed: {request.consensus.slashed.length}</span>
                            </div>
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
                {agents.map((agent) => (
                  <div key={agent.id} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{agent.avatar}</span>
                        <div>
                          <p className="text-white font-medium">{agent.name}</p>
                          <p className="text-xs text-slate-500">
                            Stake: ${agent.stake.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-semibold ${
                          agent.reputation >= 90 ? 'text-emerald-400' :
                          agent.reputation >= 70 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {agent.reputation}%
                        </div>
                        <span className={`text-xs ${
                          agent.status === 'active' ? 'text-emerald-400' : 'text-slate-500'
                        }`}>
                          {agent.status === 'active' ? '● Active' : '○ Inactive'}
                        </span>
                      </div>
                    </div>
                    {/* Reputation bar */}
                    <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          agent.reputation >= 90 ? 'bg-emerald-400' :
                          agent.reputation >= 70 ? 'bg-yellow-400' :
                          'bg-red-400'
                        }`}
                        style={{ width: `${agent.reputation}%` }}
                      ></div>
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
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm">
                    <span className="text-slate-500 mt-0.5">•</span>
                    <span className="text-slate-300">{activity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
