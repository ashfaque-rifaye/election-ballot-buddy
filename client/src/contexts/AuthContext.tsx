/**
 * Authentication Context
 * Built with Google Antigravity & Vertex AI
 *
 * Manages Google Identity authentication state and provides
 * auth token and user role to all child components.
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@shared/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (credential: string) => Promise<void>;
  signOut: () => void;
  startDemo: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Decode a Google Identity JWT to extract user info.
 */
function decodeJwt(token: string): { sub: string; email: string; name?: string } | null {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').filter(Boolean);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('auth_token');
    if (savedToken) {
      const decoded = decodeJwt(savedToken);
      if (decoded) {
        const role: UserRole = ADMIN_EMAILS.includes(decoded.email?.toLowerCase())
          ? 'administrator'
          : 'voter';
        setAuthState({
          user: { uid: decoded.sub, email: decoded.email, role },
          token: savedToken,
          isAuthenticated: true,
          isLoading: false,
        });
        return;
      }
    }
    setAuthState((prev) => ({ ...prev, isLoading: false }));
  }, []);

  const signIn = useCallback(async (credential: string) => {
    const decoded = decodeJwt(credential);
    if (!decoded) {
      throw new Error('Invalid authentication token');
    }

    const role: UserRole = ADMIN_EMAILS.includes(decoded.email?.toLowerCase())
      ? 'administrator'
      : 'voter';

    const user: User = {
      uid: decoded.sub,
      email: decoded.email,
      role,
    };

    sessionStorage.setItem('auth_token', credential);

    setAuthState({
      user,
      token: credential,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const signOut = useCallback(() => {
    sessionStorage.removeItem('auth_token');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const startDemo = useCallback(() => {
    const demoPayload = { sub: 'demo', email: 'guest@election.app', role: 'voter' as UserRole };
    const mockToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify(demoPayload))}.signature`;
    const user: User = { uid: demoPayload.sub, email: demoPayload.email, role: demoPayload.role };
    setAuthState({ user, token: mockToken, isAuthenticated: true, isLoading: false });
    sessionStorage.setItem('auth_token', mockToken);
  }, []);

  return (
    <AuthContext.Provider value={{ ...authState, signIn, signOut, startDemo }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
