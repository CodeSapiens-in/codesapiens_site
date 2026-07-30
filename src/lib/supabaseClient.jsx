// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Create a real client if credentials exist, otherwise a dummy that returns empty data
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : new Proxy({}, {
      get(_, prop) {
        // Return chainable stub so .from().select().eq()... never throws
        const noop = () => new Proxy(Promise.resolve({ data: [], error: null, count: 0 }), {
          get(target, p) {
            if (p === 'then' || p === 'catch' || p === 'finally') return target[p].bind(target);
            return noop;
          }
        });
        if (prop === 'auth') {
          return {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            getUser: () => Promise.resolve({ data: { user: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
            signUp: noop, signInWithPassword: noop, signOut: noop,
            signInWithOAuth: noop, resetPasswordForEmail: noop, updateUser: noop,
          };
        }
        if (prop === 'storage') {
          return {
            from: () => ({
              upload: noop, getPublicUrl: () => ({ data: { publicUrl: '' } }),
              list: noop, remove: noop, download: noop,
            }),
          };
        }
        return noop;
      }
    });

const hasCredentials = !!(supabaseUrl && supabaseAnonKey);
console.log('Supabase URL present:', !!supabaseUrl);
console.log('Supabase Anon Key present:', !!supabaseAnonKey);
if (!hasCredentials) console.warn('⚠️ Supabase credentials missing – running in preview mode with empty data');