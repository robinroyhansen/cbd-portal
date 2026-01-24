'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  login: (apiKey: string) => Promise<boolean>;
  logout: () => void;
  getAuthHeaders: () => HeadersInit;
}

const AdminAuthContext = createContext<AdminAuthContextType | null>(null);

const AUTH_KEY = 'cbd_admin_session';

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState<string | null>(null);

  useEffect(() => {
    // Check if already authenticated in this session
    const stored = sessionStorage.getItem(AUTH_KEY);
    if (stored) {
      setPassword(stored);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (pwd: string): Promise<boolean> => {
    // Validate the password by making a test request to a protected endpoint
    try {
      const response = await fetch('/api/admin/auth-check', {
        headers: {
          'Authorization': `Bearer ${pwd}`
        }
      });

      if (response.ok) {
        setPassword(pwd);
        setIsAuthenticated(true);
        sessionStorage.setItem(AUTH_KEY, pwd);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setPassword(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_KEY);
  };

  const getAuthHeaders = (): HeadersInit => {
    if (!password) return {};
    return {
      'Authorization': `Bearer ${password}`
    };
  };

  return (
    <AdminAuthContext.Provider value={{ isAuthenticated, login, logout, getAuthHeaders }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}

/**
 * Helper to create fetch with admin auth headers
 */
export function useAdminFetch() {
  const { getAuthHeaders } = useAdminAuth();

  return async (url: string, options: RequestInit = {}) => {
    return fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        ...getAuthHeaders()
      }
    });
  };
}