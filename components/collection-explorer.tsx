'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProductMedia } from '@/components/product-media';
import type { ProductCollection } from '@/lib/data';

export function CollectionExplorer({ collections }: { collections: ProductCollection[] }) {
  const [activeSlug, setActiveSlug] = useState(collections[0]?.slug ?? '');
  const active = collections.find((collection) => collection.slug === activeSlug) ?? collections[0];
  const product = active?.products[0];

  if (!active) return null;

  return <div className="collection-explorer" aria-label="Browse collections">
    <div className="collection-explorer__choices" role="group" aria-label="Choose a companion collection">
      {collections.map((collection) => <button key={collection.slug} className={active.slug === collection.slug ? 'is-active' : ''} type="button" aria-pressed={active.slug === collection.slug} onClick={() => setActiveSlug(collection.slug)}>{collection.shortName}</button>)}
    </div>
    <div className="collection-explorer__stage" key={active.slug} aria-live="polite" aria-atomic="true">
      <div className="collection-explorer__picture">
        {product ? <ProductMedia product={product} alt={product.name} priority sizes="(max-width: 760px) 88vw, 42vw"/> : <div className="collection-explorer__empty" role="img" aria-label="No matching product in the current catalogue"/>}
      </div>
      <article className="collection-explorer__note">
        <span className="eyebrow">Collection {String(collections.indexOf(active) + 1).padStart(2, '0')}</span>
        <h3>{active.name}</h3>
        <p>{product ? active.description : 'No matching product in the current catalogue.'}</p>
        <Link href={`/shop?collection=${active.slug}`}>Explore collection <span aria-hidden="true">→</span></Link>
      </article>
    </div>
  </div>;
}
