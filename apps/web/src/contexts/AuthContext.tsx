import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, User } from '../api/auth';

interface AuthCtx {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  googleLogin: () => void;
}

const Ctx = createContext<AuthCtx>(null!);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem('cc_user') || 'null'); } catch { return null; }
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cc_token'));
  const [loading, setLoading] = useState(false);

  // Handle Google OAuth redirect
  useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#oauth=')) {
      const t = decodeURIComponent(hash.slice(7));
      try {
        const payload = JSON.parse(atob(t.split('.')[1]));
        const u: User = { id: payload.sub, role: payload.role, name: '', email: '' };
        setToken(t);
        setUser(u);
        localStorage.setItem('cc_token', t);
        localStorage.setItem('cc_user', JSON.stringify(u));
        window.history.replaceState({}, '', window.location.pathname);
        // Fetch full profile
        authApi.me().then(fullUser => {
          setUser(fullUser);
          localStorage.setItem('cc_user', JSON.stringify(fullUser));
        }).catch(() => {});
      } catch {}
    }
  }, []);

  const persist = (u: User, t: string) => {
    setUser(u); setToken(t);
    localStorage.setItem('cc_token', t);
    localStorage.setItem('cc_user', JSON.stringify(u));
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const r = await authApi.login({ email: email.trim().toLowerCase(), password });
      persist(r.user, r.accessToken);
    } finally { setLoading(false); }
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true);
    try {
      const r = await authApi.register({ name: name.trim(), email: email.trim().toLowerCase(), password });
      persist(r.user, r.accessToken);
    } finally { setLoading(false); }
  };

  const logout = useCallback(() => {
    setUser(null); setToken(null);
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    window.location.href = '/';
  }, []);

  const googleLogin = () => {
    window.location.href = authApi.googleUrl();
  };

  return <Ctx.Provider value={{ user, token, loading, login, register, logout, googleLogin }}>{children}</Ctx.Provider>;
}
