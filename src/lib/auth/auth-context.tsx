'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { AuthUser, Profile } from '@/types/database';
import {
  mockLogin,
  mockSignup,
  mockGetCurrentUser,
  mockLogout,
  mockSetCurrentUser,
} from '@/lib/mock-data';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (
    email: string,
    password: string,
    fullName: string,
    matricNumber?: string,
    faculty?: string,
    affiliationType?: 'student' | 'uthm_staff',
    phone?: string
  ) => Promise<{ error: string | null }>;
  logout: () => void;
  isAdmin: boolean;
  isStaff: boolean;
  isUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'pkudas_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      try {
        const userId = JSON.parse(stored);
        mockSetCurrentUser(userId);
        const mockUser = mockGetCurrentUser();
        if (mockUser) {
          setUser({
            id: mockUser.id,
            email: mockUser.email,
            profile: mockUser.profile,
          });
        }
      } catch {
        localStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = mockLogin(email, password);
    if (result.error || !result.user) {
      return { error: result.error || 'Login failed' };
    }
    const authUser: AuthUser = {
      id: result.user.id,
      email: result.user.email,
      profile: result.user.profile,
    };
    setUser(authUser);
    localStorage.setItem(SESSION_KEY, JSON.stringify(result.user.id));
    return { error: null };
  }, []);

  const signup = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      matricNumber?: string,
      faculty?: string,
      affiliationType?: 'student' | 'uthm_staff',
      phone?: string
    ) => {
      const result = mockSignup(email, password, fullName, matricNumber, faculty, affiliationType, phone);
      if (result.error || !result.user) {
        return { error: result.error || 'Signup failed' };
      }
      const authUser: AuthUser = {
        id: result.user.id,
        email: result.user.email,
        profile: result.user.profile,
      };
      setUser(authUser);
      localStorage.setItem(SESSION_KEY, JSON.stringify(result.user.id));
      return { error: null };
    },
    []
  );

  const logout = useCallback(() => {
    mockLogout();
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const isAdmin = user?.profile.role === 'admin';
  const isStaff = user?.profile.role === 'staff';
  const isUser = user?.profile.role === 'user';

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, logout, isAdmin, isStaff, isUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
