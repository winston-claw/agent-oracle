'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

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

const USERS_KEY = 'auth_users';
const CURRENT_USER_KEY = 'auth_current_user';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

function getUsers(): Record<string, { user: User; password: string }> {
  if (typeof window === 'undefined') return {};
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : {};
}

function saveUsers(users: Record<string, { user: User; password: string }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser(): User | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(CURRENT_USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Restore user from localStorage on mount
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const users = getUsers();
    const userRecord = users[email.toLowerCase()];
    
    if (!userRecord || userRecord.password !== password) {
      throw new Error('Invalid email or password');
    }
    
    setCurrentUser(userRecord.user);
    setUser(userRecord.user);
    router.push('/dashboard');
  };

  const signup = async (name: string, email: string, password: string) => {
    const users = getUsers();
    const normalizedEmail = email.toLowerCase();
    
    if (users[normalizedEmail]) {
      throw new Error('User already exists');
    }
    
    const newUser: User = {
      userId: generateId(),
      name,
      email: normalizedEmail,
    };
    
    users[normalizedEmail] = { user: newUser, password };
    saveUsers(users);
    
    setCurrentUser(newUser);
    setUser(newUser);
    router.push('/dashboard');
  };

  const logout = async () => {
    setCurrentUser(null);
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
