import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock Supabase client for testing (always use mock, no credentials needed)
const mockSupabaseClient = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: async () => ({ error: new Error('Auth disabled') }),
    signInWithPassword: async () => ({ error: new Error('Auth disabled') }),
    signOut: async () => ({}),
    resetPasswordForEmail: async () => ({}),
    updateUser: async () => ({}),
  },
  from: () => ({
    select: () => ({ data: [] }),
    insert: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  }),
};

let supabaseClient: any = mockSupabaseClient;

// Try to create real client if credentials exist
try {
  if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (error) {
  // Use mock client on error
  console.log('Using mock Supabase client (credentials not configured)');
}

export const supabase = supabaseClient;
