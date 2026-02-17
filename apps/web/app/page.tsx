'use client';

import Link from 'next/link';

export default function Home() {
  const features = [
    {
      title: 'Modern UI Components',
      description: 'Built with Tailwind CSS for beautiful, responsive interfaces',
      icon: '🎨',
    },
    {
      title: 'Authentication',
      description: 'Secure user authentication with email & password',
      icon: '🔐',
    },
    {
      title: 'Database',
      description: 'Real-time database powered by Convex',
      icon: '💾',
    },
    {
      title: 'TypeScript',
      description: 'Full type safety throughout the codebase',
      icon: '📘',
    },
  ];

  const plans = [
    {
      name: 'Starter',
      price: '$0',
      description: 'Perfect for side projects',
      features: ['1 user', '1GB storage', 'Community support'],
    },
    {
      name: 'Pro',
      price: '$29',
      description: 'For growing teams',
      features: ['10 users', '100GB storage', 'Priority support'],
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: ['Unlimited users', 'Unlimited storage', '24/7 support'],
    },
  ];

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <header style={{ 
        background: 'white', 
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
          Hackathon Template
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link 
            href="/login"
            style={{ 
              padding: '0.5rem 1rem',
              color: '#64748b',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
          >
            Sign In
          </Link>
          <Link 
            href="/signup"
            style={{ 
              padding: '0.5rem 1rem',
              background: '#2563eb',
              color: 'white',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontSize: '0.875rem'
            }}
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '4rem 2rem', textAlign: 'center', background: '#f8fafc' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          Build Faster with Our Hackathon Template
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#64748b', marginBottom: '2rem' }}>
          Next.js 14 + Tailwind + Convex + Auth
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link 
            href="/signup"
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: '#2563eb', 
              color: 'white', 
              borderRadius: '0.5rem', 
              border: 'none', 
              cursor: 'pointer',
              textDecoration: 'none',
              fontSize: '1rem'
            }}
          >
            Get Started Free
          </Link>
          <Link 
            href="/dashboard"
            style={{ 
              padding: '0.75rem 1.5rem', 
              background: 'white', 
              color: '#2563eb', 
              borderRadius: '0.5rem', 
              border: '1px solid #2563eb', 
              cursor: 'pointer',
              textDecoration: 'none',
              fontSize: '1rem'
            }}
          >
            View Demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '3rem' }}>Features</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
          {features.map((feature, i) => (
            <div key={i} style={{ padding: '1.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{feature.icon}</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{feature.title}</h3>
              <p style={{ color: '#64748b' }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '4rem 2rem', background: '#f8fafc' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '3rem' }}>Pricing</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
          {plans.map((plan, i) => (
            <div key={i} style={{ padding: '2rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', textAlign: 'center', background: 'white' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '0.5rem' }}>{plan.name}</h3>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{plan.price}</div>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>{plan.description}</p>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: '1.5rem' }}>
                {plan.features.map((f, j) => (
                  <li key={j} style={{ padding: '0.25rem 0' }}>✓ {f}</li>
                ))}
              </ul>
              <Link 
                href="/signup"
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  background: '#2563eb', 
                  color: 'white', 
                  borderRadius: '0.5rem', 
                  border: 'none', 
                  cursor: 'pointer',
                  textDecoration: 'none',
                  display: 'inline-block',
                  width: '100%',
                  boxSizing: 'border-box'
                }}
              >
                Choose {plan.name}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '2rem', textAlign: 'center', borderTop: '1px solid #e2e8f0' }}>
        <p style={{ color: '#64748b' }}>© 2026 Hackathon Template. Built with Next.js, Tailwind & Convex.</p>
      </footer>
    </div>
  );
}
