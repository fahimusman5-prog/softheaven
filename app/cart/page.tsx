'use client';
import { StoreMotion } from '@/components/store-motion';

import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { getCartLineId, useCart } from '@/components/cart-provider';
import { formatPrice } from '@/lib/format';

export default function CartPage() {
  const { lines, subtotal, update, remove } = useCart();
  const reduce = useReducedMotion();

  return (
    <StoreMotion><div className="cart-page">
      <div className="page-intro compact">
        <span className="eyebrow">Your SoftHaven bag</span>
        <h1>Your SoftHaven Bag <span className="count-badge">{lines.reduce((sum, line) => sum + line.quantity, 0)} items</span></h1>
      </div>

      <AnimatePresence initial={false} mode="wait">
      {lines.length === 0 ? (
        <motion.div key="empty" className="empty-state cart-empty" initial={{ opacity:reduce ? 1 : .8 }} animate={{ opacity:1 }} exit={{ opacity:0 }} transition={{ duration:reduce ? 0 : .18 }}>
          <div className="empty-plush" aria-hidden="true" />
          <div className="empty-icon" aria-hidden="true">♡</div>
          <h2>Your bag is waiting softly</h2>
          <p>Choose a companion and we&apos;ll keep it safe here.</p>
          <Link className="primary-button" href="/shop">Explore the collection →</Link>
        </motion.div>
      ) : (
        <motion.div key="bag" className="cart-layout" initial={false} exit={{ opacity:0 }} transition={{ duration:reduce ? 0 : .18 }}>
          <div className="cart-lines">
            <AnimatePresence initial={false}>
            {lines.map(({ product, variant, quantity }) => {
              const lineId = getCartLineId(product, variant);
              return (
                <motion.article className="cart-line" key={lineId} initial={false} exit={{ opacity:0, x:reduce ? 0 : -8 }} transition={{ duration:reduce ? 0 : .18 }}>
                  <img src={variant.image} alt={`${product.name} in ${variant.color}`} />
                  <div className="cart-line-copy">
                    <span className="eyebrow">{product.category}</span>
                    <h2>{product.name}</h2>
                    <p>{variant.color}</p>
                    <div className="quantity">
                      <button onClick={() => update(lineId, quantity - 1)} aria-label={`Decrease ${product.name} quantity`}>−</button>
                      <span key={quantity} className="soft-value-response" aria-live="polite">{quantity}</span>
                      <button onClick={() => update(lineId, quantity + 1)} aria-label={`Increase ${product.name} quantity`}>+</button>
                    </div>
                  </div>
                  <strong>{formatPrice(variant.price * quantity)}</strong>
                  <button className="remove-button" onClick={() => remove(lineId)} aria-label={`Remove ${product.name} in ${variant.color}`}>×</button>
                </motion.article>
              );
            })}
            </AnimatePresence>
          </div>

          <aside className="cart-summary">
            <h2>Bag summary</h2>
            <div><span>Bag Subtotal</span><b key={subtotal} className="soft-value-response">{formatPrice(subtotal)}</b></div>
            <hr />
            <div className="total"><span>Total</span><strong>{formatPrice(subtotal)}</strong></div>
            <Link className="primary-button full" href="/checkout">Continue to checkout →</Link>
            <Link className="secondary-button full" href="/shop">Continue browsing</Link>
          </aside>
        </motion.div>
      )}
      </AnimatePresence>
    </div></StoreMotion>
  );
}
