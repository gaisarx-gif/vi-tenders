import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { signInWithRedirect, getRedirectResult, signInWithCustomToken, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { api } from '../lib/api';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmployeeId: (employeeId: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const data = await api.get<User>('/api/me');
      setUser(data);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          const idToken = await result.user.getIdToken();
          const data = await api.post<User>('/api/login', { idToken });
          if (data.firebaseToken) {
            try { await signInWithCustomToken(auth, data.firebaseToken); }
            catch { /* allow Google auth to persist */ }
          }
          setUser(data);
          setLoading(false);
          return;
        }
      } catch {
        // Not a redirect result; ignore
      }
      try {
        const data = await api.get<User>('/api/me');
        setUser(data);
      } catch {
        setUser(null);
      }
      setLoading(false);
    };
    init();
  }, []);

  const signInWithGoogle = useCallback(async () => {
    await signInWithRedirect(auth, googleProvider);
  }, []);

  const signInWithEmployeeId = useCallback(async (employeeId: string) => {
    const data = await api.post<User>('/api/login', { employeeId });
    if (data.firebaseToken) {
      try { await signInWithCustomToken(auth, data.firebaseToken); }
      catch { /* non-critical */ }
    }
    setUser(data);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
    await fetch('/api/logout', { method: 'POST' });
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signInWithEmployeeId, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
