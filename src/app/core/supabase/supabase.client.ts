import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '@environments/environment';

export const supabase: SupabaseClient = createClient(
  environment.supabaseUrl,
  environment.supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
    db: { schema: 'public' },
    global: {
      fetch: (url, opts) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 15000);
        return fetch(url, { ...opts, signal: controller.signal })
          .finally(() => clearTimeout(id));
      },
    },
  }
);
