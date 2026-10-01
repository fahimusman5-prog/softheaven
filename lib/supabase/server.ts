import 'server-only';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export async function serverClient() {
  const store = await cookies();
  return createServerClient(
    getSupabaseConfig().url,
    getSupabaseConfig().key,
    {
      cookies: {
        getAll: () => store.getAll(),
        setAll: (values) => {
          try {
            values.forEach(({ name, value, options }) =>
              store.set(name, value, options),
            );
          } catch {
            /* Rendering is read-only; route handlers refresh cookies. */
          }
        },
      },
    },
  );
}
