import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase } from './supabase';
import type { User } from './auth-store';
import { loginUser, registerUser, logoutUser, sendPasswordReset } from './auth-store';
import { authRateLimiter } from './rate-limit';
import { sanitizeInput, isValidEmail } from './security';
import { loginSchema, registerSchema, formatZodErrors } from './validations';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isPasswordRecovery: boolean;
  rateLimitRemaining: number;
  clearPasswordRecovery: () => void;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string; rateLimited?: boolean }>;
  signUp: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string; confirmEmail?: boolean; rateLimited?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  isPasswordRecovery: false,
  rateLimitRemaining: 5,
  clearPasswordRecovery: () => {},
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  resetPassword: async () => ({ success: false }),
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(5);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          name: (session.user.user_metadata?.name as string) ?? '',
          isVerified: session.user.email_confirmed_at !== null,
          createdAt: session.user.created_at ?? new Date().toISOString(),
        });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setIsPasswordRecovery(true);
        }

        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            name: (session.user.user_metadata?.name as string) ?? '',
            isVerified: session.user.email_confirmed_at !== null,
            createdAt: session.user.created_at ?? new Date().toISOString(),
          });
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());

    // Validate email format
    if (!isValidEmail(sanitizedEmail)) {
      return { success: false, error: 'Invalid email format' };
    }

    // Check rate limit
    const rateCheck = authRateLimiter.check(sanitizedEmail);
    setRateLimitRemaining(rateCheck.remaining);

    if (!rateCheck.allowed) {
      return {
        success: false,
        error: rateCheck.message || 'Too many login attempts. Please try again later.',
        rateLimited: true
      };
    }

    // Validate with schema
    const validation = loginSchema.safeParse({ email: sanitizedEmail, password });
    if (!validation.success) {
      const errors = formatZodErrors(validation.error);
      authRateLimiter.recordFailure(sanitizedEmail);
      return { success: false, error: errors[0]?.message || 'Invalid input' };
    }

    // Attempt login
    const result = await loginUser(sanitizedEmail, password);

    if (result.success && result.user) {
      // Reset rate limit on successful login
      authRateLimiter.reset(sanitizedEmail);
      setRateLimitRemaining(5);
      setUser(result.user);
    } else {
      // Record failed attempt
      authRateLimiter.recordFailure(sanitizedEmail);
      const status = authRateLimiter.getStatus(sanitizedEmail);
      setRateLimitRemaining(status.remaining);
    }

    // Generic error message to prevent user enumeration
    if (!result.success) {
      return { success: false, error: 'Invalid email or password' };
    }

    return result;
  };

  const signUp = async (name: string, email: string, password: string) => {
    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
    const sanitizedName = sanitizeInput(name.trim());

    // Check rate limit
    const rateCheck = authRateLimiter.check(sanitizedEmail);
    setRateLimitRemaining(rateCheck.remaining);

    if (!rateCheck.allowed) {
      return {
        success: false,
        error: rateCheck.message || 'Too many attempts. Please try again later.',
        rateLimited: true
      };
    }

    // Validate with schema (confirmPassword is handled on the form side)
    const validation = registerSchema.safeParse({
      name: sanitizedName,
      email: sanitizedEmail,
      password,
      confirmPassword: password // We trust the form validated this
    });

    if (!validation.success) {
      const errors = formatZodErrors(validation.error);
      return { success: false, error: errors[0]?.message || 'Invalid input' };
    }

    const result = await registerUser(sanitizedName, sanitizedEmail, password);

    if (result.success && result.user && !result.confirmEmail) {
      authRateLimiter.reset(sanitizedEmail);
      setUser(result.user);
    }

    return result;
  };

  const signOut = async () => {
    await logoutUser();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    return await sendPasswordReset(email);
  };

  const clearPasswordRecovery = () => setIsPasswordRecovery(false);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isPasswordRecovery,
      rateLimitRemaining,
      clearPasswordRecovery,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
