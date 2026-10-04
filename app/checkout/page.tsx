'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/components/cart-provider';
import { formatPrice } from '@/lib/format';
export default function CheckoutPage() {
  const { lines, clear } = useCart();
  const [rates, setRates] = useState<
    Array<{ id: string; name: string; rate: number }>
  >([]);
  const [rate, setRate] = useState('');
  const [quote, setQuote] = useState<Record<string, number> | null>(null);
  const [order, setOrder] = useState<Record<string, unknown> | null>(null);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [key] = useState(() => crypto.randomUUID());
  useEffect(() => {
    fetch('/api/checkout')
      .then((r) => r.json())
      .then((v) => {
        setRates(v.rates ?? []);
        setRate(v.rates?.[0]?.id ?? '');
      })
      .catch(() => setMessage('Shipping options could not be loaded.'));
  }, []);
  if (order)
    return (
      <div className="success-page">
        <h1>Order received</h1>
        <p>
          Order SH-{String(order.order_number)} ·{' '}
          {formatPrice(Number(order.total))}
        </p>
        <p>Payment is pending. Pay cash on delivery.</p>
        <Link href="/account">View order history →</Link>
      </div>
    );
  return (
    <div className="checkout-page">
      <form
        className="checkout-main"
        onChange={() => setQuote(null)}
        onSubmit={async (e) => {
          e.preventDefault();
          if (busy) return;
          const submit = (e.nativeEvent as SubmitEvent)
            .submitter as HTMLButtonElement;
          const commit = submit?.value === 'place';
          const f = new FormData(e.currentTarget);
          setBusy(true);
          setMessage('');
          try {
            const response = await fetch('/api/checkout', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                lines: lines.map((l) => ({
                  variant_id: l.variant.id,
                  quantity: l.quantity,
                })),
                address: {
                  name: f.get('name'),
                  phone: f.get('phone'),
                  address: f.get('address'),
                  city: f.get('city'),
                  district: f.get('district'),
                  country: 'LK',
                },
                rate,
                coupon: f.get('coupon'),
                points: Number(f.get('points') || 0),
                commit,
                key,
                notes: f.get('notes'),
              }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            if (commit) {
              setOrder(result);
              clear();
            } else setQuote(result);
          } catch (e) {
            setMessage((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <section className="form-card">
          <h1>Checkout</h1>
          <p>
            <Link href="/account">Sign in or create an account</Link> before
            placing an order.
          </p>
          <h2>Delivery details</h2>
          <label>
            Recipient name
            <input name="name" required maxLength={150} autoComplete="name" />
          </label>
          <label>
            Phone
            <input
              name="phone"
              type="tel"
              inputMode="tel"
              required
              minLength={6}
              maxLength={30}
              autoComplete="tel"
            />
          </label>
          <label>
            Street address
            <input
              name="address"
              required
              minLength={3}
              maxLength={500}
              autoComplete="street-address"
            />
          </label>
          <div className="two-col">
            <label>
              City
              <input name="city" required autoComplete="address-level2" />
            </label>
            <label>
              District
              <input name="district" required autoComplete="address-level1" />
            </label>
          </div>
          <p>Country: Sri Lanka</p>
          <label>
            Delivery method
            <select
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
            >
              <option value="">Select shipping</option>
              {rates.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} · {formatPrice(Number(r.rate))}
                </option>
              ))}
            </select>
          </label>
          {!rates.length && (
            <p role="status">
              Delivery is not configured yet. Orders cannot be placed until an
              administrator sets an active shipping zone and rate.
            </p>
          )}
        </section>
        <section className="form-card">
          <h2>Discounts and rewards</h2>
          <label>
            Coupon code
            <input name="coupon" maxLength={100} />
          </label>
          <label>
            Reward points to redeem
            <input type="number" min="0" name="points" defaultValue="0" />
          </label>
          <label>
            Order notes
            <textarea name="notes" maxLength={2000} />
          </label>
        </section>
        <section className="form-card">
          <h2>Order summary</h2>
          {lines.map((l) => (
            <p key={l.variant.id}>
              {l.product.name} · {l.variant.color} × {l.quantity}
            </p>
          ))}
          <p>Payment method: cash on delivery</p>
          {quote && (
            <>
              <p>Subtotal: {formatPrice(quote.subtotal)}</p>
              <p>Coupon discount: {formatPrice(quote.discount)}</p>
              <p>Reward discount: {formatPrice(quote.points_discount)}</p>
              <p>Shipping: {formatPrice(quote.shipping)}</p>
              <strong>Total: {formatPrice(quote.total)}</strong>
            </>
          )}
          <p role="alert">{message}</p>
          <button
            className="primary-button"
            name="action"
            value="quote"
            disabled={busy || !lines.length || !rate}
          >
            Calculate total
          </button>
          <button
            className="primary-button"
            name="action"
            value="place"
            disabled={busy || !quote || !lines.length || !rate}
          >
            {busy ? 'Please wait…' : 'Place cash-on-delivery order'}
          </button>
        </section>
      </form>
    </div>
  );
}
