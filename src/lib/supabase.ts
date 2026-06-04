import { createClient } from '@supabase/supabase-js';

// Vite strictly requires 'import.meta.env' to read the secret safe
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// This will help us catch if the keys are still missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables! Check your .env file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);