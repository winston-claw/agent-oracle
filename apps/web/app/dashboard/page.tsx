'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          Dashboard
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {user.email}
          </span>
          <button
            onClick={handleLogout}
            style={{ 
              padding: '0.5rem 1rem',
              background: 'transparent',
              color: '#64748b',
              border: '1px solid #e2e8f0',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.875rem'
            }}
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
            Welcome back{user.name ? `, ${user.name}` : ''}! 👋
          </h2>
          <p style={{ color: '#64748b' }}>
            This is your authenticated dashboard. Only logged-in users can see this page.
          </p>
        </div>

        {/* Stats Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {[
            { label: 'Total Users', value: '1,234', change: '+12%' },
            { label: 'Revenue', value: '$12,345', change: '+8%' },
            { label: 'Active Sessions', value: '567', change: '+23%' },
            { label: 'Conversion', value: '3.2%', change: '+5%' },
          ].map((stat, i) => (
            <div key={i} style={{ 
              background: 'white', 
              padding: '1.5rem', 
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0'
            }}>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                {stat.label}
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 'bold' }}>
                  {stat.value}
                </span>
                <span style={{ fontSize: '0.875rem', color: '#16a34a' }}>
                  {stat.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ 
          background: 'white', 
          padding: '1.5rem', 
          borderRadius: '0.5rem',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', marginBottom: '1rem' }}>
            Quick Actions
          </h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button style={{ 
              padding: '0.75rem 1rem',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}>
              Create New Project
            </button>
            <button style={{ 
              padding: '0.75rem 1rem',
              background: 'white',
              color: '#2563eb',
              border: '1px solid #2563eb',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}>
              View Analytics
            </button>
            <button style={{ 
              padding: '0.75rem 1rem',
              background: 'white',
              color: '#2563eb',
              border: '1px solid #2563eb',
              borderRadius: '0.5rem',
              cursor: 'pointer'
            }}>
              Invite Team Member
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
