'use client';

// Demo auth hook - replace with actual Convex auth integration
export function useAuth() {
  const login = async (email: string, password: string) => {
    console.log('Login:', email);
    return { success: true };
  };

  const logout = async () => {
    console.log('Logout');
  };

  const createAccount = async (name: string, email: string, password: string) => {
    console.log('Signup:', name, email);
    return { success: true };
  };

  return {
    login,
    logout,
    createAccount,
  };
}
