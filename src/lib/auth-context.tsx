import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
// import { supabase } from './supabase';
import type { User } from './auth-store';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isPasswordRecovery: false,
  clearPasswordRecovery: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  useEffect(() => {
    // Auth disabled for testing - no Supabase credentials
    setUser(null);
    setLoading(false);
  }, []);

  const clearPasswordRecovery = () => setIsPasswordRecovery(false);

  return (
    <AuthContext.Provider value={{ user, loading, isPasswordRecovery, clearPasswordRecovery }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
