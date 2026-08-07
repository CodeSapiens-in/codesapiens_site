// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder-key');

console.log('Supabase URL present:', !!import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Anon Key present:', !!import.meta.env.VITE_SUPABASE_ANON_KEY);