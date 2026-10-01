// Public connection details for SoftHaven's dedicated project. RLS protects data.
// Environment overrides are optional; no privileged key is used here.
const dedicatedUrl = "https://ecaoxnaokkjlotklquip.supabase.co";
const dedicatedPublishableKey = "sb_publishable_Jk8h7UsualZGhxAUvmKAGA_kSZPp6pU";

type PublicConfiguration = { url?: string; publishableKey?: string; anonKey?: string };
export function getSupabaseConfig(environment: PublicConfiguration = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
}) {
  const url = environment.url?.trim() || dedicatedUrl;
  const key = environment.publishableKey?.trim() || environment.anonKey?.trim() ||
    (url === dedicatedUrl ? dedicatedPublishableKey : '');
  if (!key) throw new Error('A custom Supabase project requires its own publishable key.');
  return { url, key };
}
