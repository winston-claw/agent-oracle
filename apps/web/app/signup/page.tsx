'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../lib/auth';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(name, email, password);
    } catch (err: any) {
      setError(err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-[400px] p-6 sm:p-8 bg-white rounded-2xl shadow-lg">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center">
          Create Account
        </h1>
        
        {error && (
          <div className="p-3 bg-red-100 text-red-600 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-3 border border-slate-200 rounded-lg text-base"
              placeholder="John Doe"
            />
          </div>
          
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-slate-200 rounded-lg text-base"
              placeholder="you@example.com"
            />
          </div>
          
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full p-3 border border-slate-200 rounded-lg text-base"
              placeholder="••••••••"
            />
            <p className="text-xs text-slate-500 mt-1">
              Must be at least 6 characters
            </p>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full p-3 bg-blue-600 text-white border-none rounded-lg text-base font-medium cursor-pointer hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed min-h-[44px]"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 no-underline hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
