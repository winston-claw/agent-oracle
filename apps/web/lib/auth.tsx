'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/api';

interface User {
  userId: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function setToken(token: string) {
  localStorage.setItem('auth_token', token);
}

function removeToken() {
  localStorage.removeItem('auth_token');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const loginMutation = useMutation(api.auth.login);
  const signupMutation = useMutation(api.auth.signup);
  const logoutMutation = useMutation(api.auth.logout);

  useEffect(() => {
    const token = getToken();
    if (token) {
      // TODO: Validate token with me query
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await loginMutation({ email, password });
    setToken(result.token);
    setUser({ userId: result.userId, name: result.name, email });
    router.push('/dashboard');
  };

  const signup = async (name: string, email: string, password: string) => {
    const result = await signupMutation({ name, email, password });
    setToken(result.token);
    setUser({ userId: result.userId, name: result.name, email });
    router.push('/dashboard');
  };

  const logout = async () => {
    const token = getToken();
    if (token) {
      await logoutMutation({ token });
    }
    removeToken();
    setUser(null);
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
