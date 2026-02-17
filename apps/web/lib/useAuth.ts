'use client';

import { signIn, signUp } from '@db/convex/auth';
import { useMutation } from 'convex/react';

export function useAuth() {
  const login = useMutation(signIn);
  const logout = useMutation(signOut);
  const createAccount = useMutation(signUp);

  return {
    login,
    logout,
    createAccount,
  };
}
