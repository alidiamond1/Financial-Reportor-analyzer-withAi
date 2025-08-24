import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Client for browser/frontend use
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

// Admin client for server-side operations (if service role key is available)
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Database table names
export const TABLES = {
  USERS: 'users',
  FILES: 'files', 
  ANALYSES: 'analyses',
  DASHBOARDS: 'dashboards',
  CHAT_MESSAGES: 'chat_messages',
  NOTIFICATIONS: 'notifications'
} as const;

// Storage bucket names
export const STORAGE_BUCKETS = {
  FILES: 'uploaded-files',
  EXPORTS: 'exported-reports'
} as const;