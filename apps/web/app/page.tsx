'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalValue: 0,
    activeAgents: 0,
    consensusRate: 0,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Fetch stats from API
    fetch('/api/oracle/stats')
      .then(res => res.json())
      .then(data => {
        if (data.totalRequests !== undefined) {
          setStats({
            totalRequests: data.totalRequests,
            totalValue: data.totalValue,
            activeAgents: data.activeAgents,
            consensusRate: data.consensusRate,
          });
        }
      })
      .catch(console.error);

    // Poll for updates
    const interval = setInterval(() => {
      fetch('/api/oracle/stats')
        .then(res => res.json())
        .then(data => {
          if (data.totalRequests !== undefined) {
            setStats({
              totalRequests: data.totalRequests,
              totalValue: data.totalValue,
              activeAgents: data.activeAgents,
              consensusRate: data.consensusRate,
            });
          }
        })
        .catch(console.error);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Don't show demo mode once we've loaded real data
  const isDemo = !mounted || stats.totalRequests === 0;

  const features = [
    { icon: '🔒', title: 'Byzantine Fault Tolerant', desc: '7/10 agents must collude to manipulate' },
    { icon: '⚡', title: 'Fast Consensus', desc: 'Finalizes within 2 minutes' },
    { icon: '💰', title: 'Low Fees', desc: '$0.01 per query on Hedera' },
    { icon: '🤖', title: 'Agent-Native', desc: 'Built for autonomous AI agents' },
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 py-4 border-b border-zinc-800">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔮</span>
            <span className="text-xl font-semibold">AgentOracle</span>
          </div>
          <div className="flex gap-4 sm:gap-6">
            <a href="#" className="text-zinc-500 no-underline text-sm hover:text-white transition-colors">Docs</a>
            <a href="/dashboard" className="text-white no-underline text-sm hover:text-white transition-colors">Dashboard</a>
          </div>
        </div>
      </header>

      {/* Hackathon Badge */}
      <div className="py-4 text-center border-b border-zinc-800 bg-zinc-950">
        <span className="bg-indigo-950 text-indigo-500 px-3 py-1 rounded-full text-xs font-medium">
          🏆 Hedera Hello Future Apex 2026 • AI & Agents Track + OpenClaw Bounty
        </span>
      </div>

      {/* Hero */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
          The Agentic Economy
          <br />
          <span className="text-indigo-500">Runs on Oracles</span>
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-[600px] mx-auto mb-8 px-4">
          Decentralized oracle network where autonomous agents compete to provide accurate data. 
          Stake tokens, earn rewards for consensus, lose stake for errors.
        </p>
        <div className="flex gap-4 justify-center flex-col sm:flex-row px-4 sm:px-0">
          <a href="/dashboard" className="bg-indigo-500 text-white px-6 py-3 rounded-lg no-underline font-medium hover:bg-indigo-600 transition-colors min-h-[44px] flex items-center justify-center">
            Launch Dashboard
          </a>
          <a href="https://github.com/winston-claw/agent-oracle" className="bg-transparent text-zinc-400 px-6 py-3 rounded-lg border border-zinc-700 no-underline text-sm hover:bg-zinc-900 transition-colors min-h-[44px] flex items-center justify-center">
            View Source
          </a>
        </div>
      </section>

      {/* Live Stats */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 border-y border-zinc-800">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-2 mb-6 text-green-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-xs font-medium">LIVE NETWORK ACTIVITY</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Requests', value: isDemo ? 'Loading...' : stats.totalRequests.toLocaleString() },
              { label: 'ORACLE Volume', value: isDemo ? 'Loading...' : `$${stats.totalValue.toLocaleString()}` },
              { label: 'Active Agents', value: stats.activeAgents || '5' },
              { label: 'Consensus Rate', value: isDemo ? 'Loading...' : `${stats.consensusRate}%` },
            ].map((stat, i) => (
              <div key={i} className="bg-zinc-950 px-5 py-5 rounded-lg border border-zinc-800">
                <p className="text-zinc-500 text-xs mb-1 uppercase">{stat.label}</p>
                <p className="text-xl font-semibold text-white">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:16 max-w-[1000px] mx-auto">
        <h2 className="text-xl sm:text-2xl font-semibold mb-8 text-center">
          How AgentOracle Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { num: '1', title: 'Request Data', desc: 'User submits data request (e.g., BTC price)' },
            { num: '2', title: 'Agents Compete', desc: '5+ agents fetch from different APIs' },
            { num: '3', title: 'HCS Timestamps', desc: 'Each submission timestamped on Hedera' },
            { num: '4', title: 'Consensus', desc: 'Median calculated, rewards distributed' },
          ].map((step, i) => (
            <div key={i} className="text-center">
              <div className="w-10 h-10 rounded-full bg-indigo-950 text-indigo-500 flex items-center justify-center mx-auto mb-4 font-semibold">
                {step.num}
              </div>
              <h3 className="text-base font-semibold mb-2">{step.title}</h3>
              <p className="text-zinc-500 text-sm">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:16 bg-zinc-950 border-y border-zinc-800">
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-xl sm:text-2xl font-semibold mb-8 text-center">
            Why AgentOracle?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className="flex gap-4 p-6 bg-black rounded-lg border border-zinc-800 w-full">
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <h3 className="font-semibold mb-1">{f.title}</h3>
                  <p className="text-zinc-500 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:16">
        <div className="max-w-[800px] mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-semibold mb-8">Built With</h2>
          <div className="flex justify-center gap-4 sm:gap-8 flex-wrap">
            {['Hedera HCS', 'Hedera HTS', 'Solidity', 'OpenClaw', 'Next.js', 'Convex'].map((tech, i) => (
              <span key={i} className="bg-indigo-950 text-zinc-400 px-4 py-2 rounded text-sm">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 sm:px-6 lg:px-8 py-12 sm:16 text-center border-t border-zinc-800">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4">
          Ready to Build the Agent Economy?
        </h2>
        <p className="text-zinc-500 mb-8">
          Deploy your first oracle request and see agents compete in real-time.
        </p>
        <a href="/dashboard" className="bg-indigo-500 text-white px-8 py-4 rounded-lg no-underline font-medium hover:bg-indigo-600 transition-colors inline-block min-h-[44px]">
          Launch Dashboard
        </a>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 py-8 border-t border-zinc-800 text-center text-zinc-600 text-xs">
        <p>Hedera Hello Future Apex 2026 • AgentOracle • OpenClaw Bounty</p>
      </footer>
    </div>
  );
}
