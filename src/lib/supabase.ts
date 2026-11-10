import { createClient, type SupabaseClient } from '@supabase/supabase-js';

let client: SupabaseClient | undefined;

export function getSupabase() {
  if (client) return client;

  const env = (import.meta as ImportMeta & {
    env: Record<string, string | undefined>;
  }).env;
  const url = env.VITE_SUPABASE_URL;
  const key = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error('As variáveis públicas do Supabase não estão disponíveis.');
  }

  client = createClient(url, key);
  return client;
}
