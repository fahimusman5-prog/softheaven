import assert from 'node:assert/strict';
import test from 'node:test';
import { getSupabaseConfig } from '../lib/supabase/config';

test('missing Vercel variables still connect to the dedicated public project', () => {
  const config = getSupabaseConfig({ url: '', publishableKey: '' });
  assert.equal(config.url, 'https://ecaoxnaokkjlotklquip.supabase.co');
  assert.match(config.key, /^sb_publishable_/);
});
test('existing anon-key deployments remain compatible', () => {
  assert.equal(getSupabaseConfig({ anonKey: ' legacy-public-key ' }).key, 'legacy-public-key');
});
test('explicit publishable key takes precedence over the legacy key', () => {
  assert.equal(getSupabaseConfig({ publishableKey: ' current-public-key ', anonKey: 'legacy-public-key' }).key, 'current-public-key');
});
test('a different project cannot inherit the SoftHaven project key', () => {
  assert.throws(() => getSupabaseConfig({ url: 'https://another-project.supabase.co' }), /requires its own publishable key/);
});
