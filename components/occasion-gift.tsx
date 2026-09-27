'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/lib/data';
import { ProductMedia } from '@/components/product-media';

const occasions = [
  { label: 'Warmth', productId: 'aurelius' },
  { label: 'Celebration', productId: 'amour' },
  { label: 'Comfort', productId: 'oliver' },
  { label: 'Just because', productId: 'celeste' },
];

export function OccasionGift({ products }: { products: Product[] }) {
  const [activeId, setActiveId] = useState(occasions[0].productId);
  const selected = products.find((product) => product.id === activeId) ?? products[0];

  if (!selected) return null;

  return <section className="gift-feature" aria-labelledby="gift-feature-title">
    <div className="section-heading">
      <div><span className="eyebrow">Choose by feeling</span><h2 id="gift-feature-title">Find a Soft Gift</h2><p>Choose a feeling to explore a companion from the collection.</p></div>
      <div className="occasion-tabs" role="group" aria-label="Choose a gift feeling">
        {occasions.map((occasion) => <button className={activeId === occasion.productId ? 'active' : ''} key={occasion.productId} type="button" aria-pressed={activeId === occasion.productId} onClick={() => setActiveId(occasion.productId)}>{occasion.label}</button>)}
      </div>
    </div>
    <div className="gift-panel home-gift-panel">
      <div><span className="eyebrow">{selected.category}</span><h3>{selected.name}</h3><p>{selected.description}</p><Link className="primary-button" href={`/product/${selected.slug}`}>Discover this companion <span aria-hidden="true">→</span></Link></div>
      <ProductMedia product={selected} alt={selected.name} fit="cover" className="home-motion-image" />
    </div>
  </section>;
}
