import { serverClient } from '@/lib/supabase/server';
import { AuthForm } from '@/components/auth-form';
import { AccountDashboard } from '@/components/account/dashboard';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'My SoftHaven' };
export default async function AccountPage() {
  const db = await serverClient();
  const { data: { user } } = await db.auth.getUser();
  if (!user) return <section className="account-auth"><p className="account-eyebrow">MY SOFTHAVEN</p><h1>Your little SoftHaven corner.</h1><AuthForm /></section>;
  const [orders, rewards, addresses, profile, balance, settings] = await Promise.all([
    db.from('orders').select('*,order_items(name,image,quantity)', { count: 'exact' }).eq('customer_id', user.id).order('created_at', { ascending: false }).limit(25),
    db.from('reward_transactions').select('*').eq('customer_id', user.id).order('created_at', { ascending: false }).limit(100),
    db.from('customer_addresses').select('*', { count: 'exact' }).eq('customer_id', user.id).limit(25),
    db.from('profiles').select('name,phone').eq('id', user.id).single(),
    db.rpc('reward_balance'),
    db.from('reward_settings').select('enabled,minimum_redemption,point_value,earn_per_currency,expiry_days').eq('id', 'default').single(),
  ]);
  const errors = { orders: !!orders.error, rewards: !!rewards.error || !!balance.error, addresses: !!addresses.error, profile: !!profile.error };
  for (const [name, result] of Object.entries({ orders, rewards, addresses, profile, balance, settings })) if (result.error) console.error(`Account ${name} load failed`, result.error);
  return <AccountDashboard email={user.email ?? ''} profile={profile.data} addresses={addresses.data ?? []} addressCount={addresses.error ? null : addresses.count} orders={orders.data ?? []} orderCount={orders.error ? null : orders.count} rewards={rewards.data ?? []} balance={balance.error ? null : Number(balance.data)} settings={settings.error ? null : settings.data} errors={errors} />;
}
