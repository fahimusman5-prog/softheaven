'use client';
import { getSupabaseConfig } from '@/lib/supabase/config';
import { createBrowserClient } from '@supabase/ssr';
export function browserClient() {
  return createBrowserClient(
    getSupabaseConfig().url,
    getSupabaseConfig().key,
  );
}
