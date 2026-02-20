'use client';

import { useState } from 'react';

// Demo auth hook - replace with actual Convex auth integration
export function useAuth() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoading(true);
    console.log('Login:', email);
    // Demo: set a mock user
    setUser({ name: 'Demo User', email });
    setLoading(false);
    return { success: true };
  };

  const logout = async () => {
    console.log('Logout');
    setUser(null);
  };

  const createAccount = async (name: string, email: string, password: string) => {
    setLoading(true);
    console.log('Signup:', name, email);
    setUser({ name, email });
    setLoading(false);
    return { success: true };
  };

  return {
    user,
    loading,
    login,
    logout,
    createAccount,
  };
}
