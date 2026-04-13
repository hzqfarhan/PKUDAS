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
import { createClient } from '@/lib/supabase/client';

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
  refreshSession: () => void;
  loginWithGoogle: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'pkudas_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage or Supabase
  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    const initializeAuth = async () => {
      // 1. Check Supabase first for real OAuth session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        if (mounted) {
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            profile: {
              id: session.user.id,
              full_name: session.user.user_metadata.full_name || 'Google User',
              email: session.user.email || '',
              avatar_url: session.user.user_metadata.avatar_url || null,
              role: 'user',
              matric_number: null,
              faculty: null,
              affiliation_type: null,
              phone: null,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            } as Profile
          });
          setLoading(false);
        }
        return;
      }
      
      // 2. Fallback to mock session
      const stored = localStorage.getItem(SESSION_KEY);
      if (stored) {
        try {
          const userId = JSON.parse(stored);
          mockSetCurrentUser(userId);
          const mockUser = mockGetCurrentUser();
          if (mockUser && mounted) {
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
      if (mounted) setLoading(false);
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && mounted) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          profile: {
            id: session.user.id,
            full_name: session.user.user_metadata.full_name || 'Google User',
            email: session.user.email || '',
            avatar_url: session.user.user_metadata.avatar_url || null,
            role: 'user',
            matric_number: null,
            faculty: null,
            affiliation_type: null,
            phone: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as Profile
        });
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
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

  const loginWithGoogle = useCallback(async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      return { error: error.message };
    }
    
    // Auth state change will handle setUser
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

  const logout = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();

    mockLogout();
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  }, []);

  const refreshSession = useCallback(() => {
    const mockUser = mockGetCurrentUser();
    if (mockUser) {
      setUser({
        id: mockUser.id,
        email: mockUser.email,
        profile: mockUser.profile,
      });
    }
  }, []);

  const isAdmin = user?.profile.role === 'admin';
  const isStaff = user?.profile.role === 'staff';
  const isUser = user?.profile.role === 'user';

  return (
    <AuthContext.Provider
      value={{ user, loading, login, loginWithGoogle, signup, logout, refreshSession, isAdmin, isStaff, isUser }}
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
