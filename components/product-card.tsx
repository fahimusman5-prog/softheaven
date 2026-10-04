'use client';

import Link from 'next/link';
import { useSoftDepth } from './use-soft-depth';
import { useEffect, useRef, useState } from 'react';

import type { Product } from '@/lib/data';
import { getProductVariants } from '@/lib/data';
import { formatPrice } from '@/lib/format';
import { useCart } from './cart-provider';
import { useWishlist } from './wishlist-provider';
import { ProductMedia } from './product-media';

export function ProductCard({ product, imageClassName = '' }: { product: Product; imageClassName?: string }) {
  const depth = useRef<HTMLAnchorElement>(null);
  useSoftDepth(depth);
  const { add } = useCart();
  const { ids, toggle } = useWishlist();
  const saved = ids.includes(product.id);
  const [added, setAdded] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const variants = getProductVariants(product);
  const variant = variants[0];
  const soldOut = variants.every((option) => option.stock === 0);
  const needsChoice = variant?.stock === 0 && !soldOut;
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  return (
    <article className="product-card">
      <div className="product-card__surface">
        <div className="product-image">
          <Link ref={depth} data-soft-depth href={`/product/${product.slug}`}><ProductMedia product={product} alt={product.name} fit="cover" className={imageClassName} /></Link>
          <button className="heart" type="button" aria-pressed={saved} aria-label={`${saved ? 'Unsave' : 'Save'} ${product.name}`} onClick={() => toggle(product.id)}>{saved ? '♥' : '♡'}</button>
        </div>
        <div className="product-info">
          <div><h3>{product.name}</h3><p>{product.color}</p></div>
          <div className="price-stack"><strong>{formatPrice(product.price)}</strong>{product.compareAt && <del>{formatPrice(product.compareAt)}</del>}</div>
        </div>
        {needsChoice ? <Link className="card-add" href={`/product/${product.slug}`}>Choose options →</Link> : <button
          type="button" disabled={soldOut} aria-live="polite"
          className={`card-add ${added ? 'added' : ''}`}
          onClick={() => {
            if (soldOut) return;
            add(product); setAdded(true);
            if (timer.current) clearTimeout(timer.current);
            timer.current = setTimeout(() => setAdded(false), 1200);
          }}
        >{soldOut ? 'Sold out' : added ? 'Added to bag ✓' : 'Add to bag +'}</button>}
      </div>
    </article>
  );
}
