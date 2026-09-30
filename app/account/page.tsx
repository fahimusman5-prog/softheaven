import { ResetPassword } from '@/components/reset-password';
import Link from 'next/link';
import { serverClient } from '@/lib/supabase/server';
import { AuthForm } from '@/components/auth-form';
import { AccountControls } from '@/components/account-controls';
import { formatPrice } from '@/lib/format';
import '../admin/admin.css';
export const dynamic = 'force-dynamic';
export default async function AccountPage() {
  const db = await serverClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user)
    return (
      <div className="section">
        <AuthForm />
      </div>
    );
  const [orders, rewards, addresses, profile] = await Promise.all([
    db
      .from('orders')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(25),
    db
      .from('reward_transactions')
      .select('*')
      .eq('customer_id', user.id)
      .order('created_at', { ascending: false })
      .limit(100),
    db
      .from('customer_addresses')
      .select('*')
      .eq('customer_id', user.id)
      .limit(25),
    db.from('profiles').select('*').eq('id', user.id).single(),
  ]);
  const { data: balance } = await db.rpc('reward_balance');
  return (
    <div className="section">
      <h1>Your SoftHaven account</h1>
      <p>{user.email}</p>
      <ResetPassword />
      <AccountControls
        profile={profile.data}
        addresses={addresses.data ?? []}
      />
      <h2>Orders</h2>
      {orders.error && <p role="alert">{orders.error.message}</p>}
      {!orders.data?.length && <p>You have no orders yet.</p>}
      {orders.data?.map((o) => (
        <article className="form-card" key={o.id}>
          <h3>
            SH-{o.order_number} · {formatPrice(o.total)}
          </h3>
          <p>
            {o.status} · Payment {o.payment_status}
          </p>
          <p>
            {new Date(o.created_at).toLocaleDateString('en-LK', {
              timeZone: 'Asia/Colombo',
            })}
          </p>
          {o.tracking_number && (
            <p>
              {o.shipping_provider}: {o.tracking_number}
            </p>
          )}
          <Link href={`/account/orders/${o.id}`}>View order →</Link>
        </article>
      ))}
      <h2>Reward points</h2>
      <p>Available balance: {balance ?? 0}</p>
      {rewards.data?.map((r) => (
        <p key={r.id}>
          {r.points > 0 ? '+' : ''}
          {r.points} · {r.reason}
        </p>
      ))}
      <Link href="/shop">Meet your next companion →</Link>
    </div>
  );
}
