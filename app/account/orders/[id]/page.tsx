import { serverClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';
import { formatPrice } from '@/lib/format';
export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const db = await serverClient();
  const {
    data: { user },
  } = await db.auth.getUser();
  if (!user) redirect('/account');
  const { data: order } = await db
    .from('orders')
    .select('*')
    .eq('id', id)
    .eq('customer_id', user.id)
    .single();
  if (!order) notFound();
  const [items, events] = await Promise.all([
    db.from('order_items').select('*').eq('order_id', id),
    db.from('order_events').select('*').eq('order_id', id).order('created_at'),
  ]);
  return (
    <section className="section">
      <h1>Order SH-{order.order_number}</h1>
      <p>
        {order.status} · Payment: {order.payment_status}
      </p>
      <article className="form-card">
        {items.data?.map((i) => (
          <p key={i.id}>
            {i.name} · {i.color} × {i.quantity} ·{' '}
            {formatPrice(i.unit_price * i.quantity)}
          </p>
        ))}
        <p>Subtotal {formatPrice(order.subtotal)}</p>
        <p>Discount {formatPrice(order.discount)}</p>
        <p>Shipping {formatPrice(order.shipping)}</p>
        <strong>Total {formatPrice(order.total)}</strong>
      </article>
      <h2>Delivery address</h2>
      <p>
        {order.shipping_address.name}
        <br />
        {order.shipping_address.address}
        <br />
        {order.shipping_address.city}, {order.shipping_address.district}
        <br />
        {order.phone}
      </p>
      <h2>Order history</h2>
      {events.data?.map((e) => (
        <p key={e.id}>
          {new Date(e.created_at).toLocaleString('en-LK', {
            timeZone: 'Asia/Colombo',
          })}{' '}
          · {e.event}
        </p>
      ))}
    </section>
  );
}
