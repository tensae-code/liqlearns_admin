import { createClient } from '@supabase/supabase-js';

const fallbackSupabaseUrl = 'https://qetfonluwxtosvhptlff.supabase.co';
const fallbackSupabaseAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFldGZvbmx1d3h0b3N2aHB0bGZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MTQyMTEsImV4cCI6MjA5MTkwMDIxMX0.xYlZIBM3q5C4Uo4Up0qh7uoGB2N_pgrxnQFE2k_zAGU';

const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || fallbackSupabaseUrl;
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || fallbackSupabaseAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);