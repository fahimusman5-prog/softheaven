'use client';

import Link from 'next/link';
import { getCartLineId, useCart } from '@/components/cart-provider';
import { formatPrice } from '@/lib/format';

export default function CartPage() {
  const { lines, subtotal, update, remove } = useCart();

  return (
    <div className="cart-page">
      <div className="page-intro compact">
        <span className="eyebrow">Your SoftHaven bag</span>
        <h1>Your SoftHaven Bag <span className="count-badge">{lines.reduce((sum, line) => sum + line.quantity, 0)} items</span></h1>
      </div>

      {lines.length === 0 ? (
        <div className="empty-state cart-empty">
          <div className="empty-plush" aria-hidden="true" />
          <div className="empty-icon" aria-hidden="true">♡</div>
          <h2>Your bag is waiting softly</h2>
          <p>Choose a companion and we&apos;ll keep it safe here.</p>
          <Link className="primary-button" href="/shop">Explore the collection →</Link>
        </div>
      ) : (
        <div className="cart-layout">
          <div className="cart-lines">
            {lines.map(({ product, variant, quantity }) => {
              const lineId = getCartLineId(product, variant);
              return (
                <article className="cart-line" key={lineId}>
                  <img src={variant.image} alt={`${product.name} in ${variant.color}`} />
                  <div className="cart-line-copy">
                    <span className="eyebrow">{product.category}</span>
                    <h2>{product.name}</h2>
                    <p>{variant.color}</p>
                    <div className="quantity">
                      <button onClick={() => update(lineId, quantity - 1)} aria-label={`Decrease ${product.name} quantity`}>−</button>
                      <span>{quantity}</span>
                      <button onClick={() => update(lineId, quantity + 1)} aria-label={`Increase ${product.name} quantity`}>+</button>
                    </div>
                  </div>
                  <strong>{formatPrice(variant.price * quantity)}</strong>
                  <button className="remove-button" onClick={() => remove(lineId)} aria-label={`Remove ${product.name} in ${variant.color}`}>×</button>
                </article>
              );
            })}
          </div>

          <aside className="cart-summary">
            <h2>Bag summary</h2>
            <div><span>Bag Subtotal</span><b>{formatPrice(subtotal)}</b></div>
            <hr />
            <div className="total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div>
            <Link className="primary-button full" href="/checkout">Continue to checkout →</Link>
            <Link className="secondary-button full" href="/shop">Continue browsing</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
