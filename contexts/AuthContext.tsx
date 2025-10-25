import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

type User = {
  id: string;
  email: string;
  username?: string;
  name?: string;
  verified?: boolean;
};

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, newPassword: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

async function saveToken(token: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function getToken() {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function saveUser(user: User) {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

async function getUser(): Promise<User | null> {
  const raw = await SecureStore.getItemAsync(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function clearAuth() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USER_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const [token, storedUser] = await Promise.all([getToken(), getUser()]);
      if (mounted && token && storedUser) {
        setUser(storedUser);
      }
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    // Mock authentication: accept any non-empty credentials
    if (!email || !password) throw new Error('Email and password are required');
    const token = 'mock-token-' + Date.now();
    const nextUser: User = { id: 'u-' + Date.now(), email, verified: true };
    await Promise.all([saveToken(token), saveUser(nextUser)]);
    setUser(nextUser);
  };

  const register = async (name: string, email: string, password: string) => {
    if (!name || !email || !password) throw new Error('All fields are required');
    const token = 'mock-token-' + Date.now();
    const nextUser: User = { id: 'u-' + Date.now(), email, name, verified: false };
    await Promise.all([saveToken(token), saveUser(nextUser)]);
    setUser(nextUser);
  };

  const signOut = async () => {
    await clearAuth();
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    if (!email) throw new Error('Email is required');
    // Mock: simulate email being sent
    await new Promise((res) => setTimeout(res, 600));
  };

  const resetPassword = async (_email: string, _newPassword: string) => {
    // Mock: simulate password reset success
    await new Promise((res) => setTimeout(res, 600));
  };

  const value = useMemo(
    () => ({ user, loading, signIn, register, signOut, forgotPassword, resetPassword }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}