'use client';

import { useState } from 'react';

interface Request {
  id: string;
  type: string;
  data: string;
  status: 'pending' | 'responded' | 'finalized';
  responses: number;
  fee: number;
}

interface Agent {
  id: string;
  name: string;
  reputation: number;
  stake: number;
  responses: number;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'requests' | 'agents'>('requests');
  
  const [requests, setRequests] = useState<Request[]>([
    { id: '0x1234...', type: 'BTC/USD', data: '$43,521', status: 'finalized', responses: 5, fee: 100 },
    { id: '0x5678...', type: 'ETH/USD', data: '$2,342', status: 'pending', responses: 2, fee: 50 },
    { id: '0xabcd...', type: 'Weather', data: '22°C', status: 'responded', responses: 4, fee: 30 },
  ]);
  
  const [agents] = useState<Agent[]>([
    { id: '0xA1', name: 'Crypto Alpha', reputation: 95, stake: 1000, responses: 45 },
    { id: '0xB2', name: 'Crypto Bravo', reputation: 88, stake: 1000, responses: 38 },
    { id: '0xC3', name: 'Weather Delta', reputation: 82, stake: 800, responses: 22 },
    { id: '0xD4', name: 'Weather Echo', reputation: 76, stake: 600, responses: 15 },
    { id: '0xE5', name: 'Sports Foxtrot', reputation: 71, stake: 500, responses: 8 },
  ]);

  const stats = {
    totalRequests: 156,
    totalValue: '$45,230',
    activeAgents: 5,
    consensusRate: '94%',
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#0f172a', color: 'white' }}>
      {/* Header */}
      <header style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.5rem' }}>🔮</span>
              AgentOracle
            </h1>
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Decentralized Oracle Network</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <a href="/login" style={{ color: '#94a3b8', textDecoration: 'none' }}>Login</a>
            <a href="/dashboard" style={{ background: '#3b82f6', color: 'white', padding: '0.5rem 1rem', borderRadius: '0.5rem', textDecoration: 'none' }}>
              Dashboard
            </a>
          </div>
        </div>
      </header>

      {/* Stats */}
      <section style={{ padding: '2rem', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[
            { label: 'Total Requests', value: stats.totalRequests },
            { label: 'Total Value', value: stats.totalValue },
            { label: 'Active Agents', value: stats.activeAgents },
            { label: 'Consensus Rate', value: stats.consensusRate },
          ].map((stat, i) => (
            <div key={i} style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>{stat.label}</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tabs */}
      <section style={{ padding: '1rem 2rem', borderBottom: '1px solid #1e293b' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '2rem' }}>
          {['requests', 'agents'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === tab ? '#3b82f6' : '#94a3b8',
                fontSize: '1rem',
                cursor: 'pointer',
                paddingBottom: '0.5rem',
                borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
              }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {/* Content */}
      <section style={{ padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {activeTab === 'requests' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map((req, i) => (
                <div key={i} style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontFamily: 'monospace', color: '#3b82f6' }}>{req.id}</p>
                    <p style={{ color: '#e2e8f0', marginTop: '0.25rem' }}>{req.type}</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{req.data}</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{req.responses} responses</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      background: req.status === 'finalized' ? '#22c55e20' : req.status === 'responded' ? '#eab30820' : '#3b82f620',
                      color: req.status === 'finalized' ? '#22c55e' : req.status === 'responded' ? '#eab308' : '#3b82f6',
                    }}>
                      {req.status}
                    </span>
                    <span style={{ color: '#94a3b8' }}>{req.fee} ORACLE</span>
                  </div>
                </div>
              ))}
              <button style={{ padding: '1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', marginTop: '1rem' }}>
                + New Request
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {agents.map((agent, i) => (
                <div key={i} style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontWeight: 'bold' }}>{agent.name}</p>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>ID: {agent.id}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: agent.reputation >= 80 ? '#22c55e' : agent.reputation >= 60 ? '#eab308' : '#ef4444' }}>
                        {agent.reputation}%
                      </p>
                      <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Reputation</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{agent.stake}</p>
                      <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Staked</p>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{agent.responses}</p>
                      <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Responses</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem', borderTop: '1px solid #1e293b', textAlign: 'center', color: '#64748b' }}>
        <p>Hedera Hello Future Apex 2026 • AgentOracle</p>
      </footer>
    </div>
  );
}
