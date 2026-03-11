import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Mock Supabase client for when credentials are not configured
const mockSupabaseClient = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signUp: async () => ({ data: { user: null, session: null }, error: new Error('Auth not configured. Please set up Supabase credentials.') }),
    signInWithPassword: async () => ({ data: { user: null, session: null }, error: new Error('Auth not configured. Please set up Supabase credentials.') }),
    signOut: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ data: {}, error: new Error('Auth not configured. Please set up Supabase credentials.') }),
    updateUser: async () => ({ data: { user: null }, error: new Error('Auth not configured. Please set up Supabase credentials.') }),
  },
  from: () => ({
    select: () => ({ data: [], error: null }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
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
