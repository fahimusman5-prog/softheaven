'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { products, type Product } from '@/lib/data';
import { formatPrice } from '@/lib/format';

type DiscoveryIcon = 'bear' | 'sparkle' | 'heart' | 'hug' | 'tiny' | 'all';
type MatchOption = { key: string; label: string; descriptor: string; category?: string; icon: DiscoveryIcon; tone: string };

const matchOptions: MatchOption[] = [
  { key: 'teddy', label: 'Teddy Bears', descriptor: 'Classic companions', category: 'Teddy Bear Collection', icon: 'bear', tone: 'blush' },
  { key: 'cuddly', label: 'Cute & Cuddly', descriptor: 'Soft favourites', category: 'Soft Animal Friends', icon: 'sparkle', tone: 'blue' },
  { key: 'gifting', label: 'Love & Gifting', descriptor: 'Made for someone special', category: 'Love & Gifting', icon: 'heart', tone: 'pink' },
  { key: 'giant', label: 'Giant Hugs', descriptor: 'The biggest welcome', category: 'Teddy Bear Collection', icon: 'hug', tone: 'lavender' },
  { key: 'little', label: 'Little Companions', descriptor: 'Small, full of feeling', category: 'Soft Animal Friends', icon: 'tiny', tone: 'cyan' },
  { key: 'all', label: 'Explore All', descriptor: 'Meet everyone', icon: 'all', tone: 'pearl' },
];

function MatchIcon({ type }: { type: DiscoveryIcon }) {
  const props = { viewBox: '0 0 32 32', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
  if (type === 'bear') return <svg {...props}><circle cx="16" cy="17" r="8.5"/><circle cx="10" cy="9.5" r="3.5"/><circle cx="22" cy="9.5" r="3.5"/><circle cx="13" cy="16" r="1" fill="currentColor"/><circle cx="19" cy="16" r="1" fill="currentColor"/><path d="M13.5 20c1.5 1.6 3.5 1.6 5 0"/></svg>;
  if (type === 'sparkle') return <svg {...props}><path d="m16 4 1.7 7.1L25 13l-7.3 1.8L16 22l-1.7-7.2L7 13l7.3-1.9L16 4Z"/><path d="m25 21 .7 2.3L28 24l-2.3.7L25 27l-.7-2.3L22 24l2.3-.7L25 21Z"/></svg>;
  if (type === 'heart') return <svg {...props}><path d="M16 26S5 19.5 5 11.9C5 8.8 7.1 6.5 10.1 6.5c2.1 0 4 1.2 5.9 3.3 1.9-2.1 3.8-3.3 5.9-3.3 3 0 5.1 2.3 5.1 5.4C27 19.5 16 26 16 26Z"/></svg>;
  if (type === 'hug') return <svg {...props}><path d="M10 7.5c-2.2 1.2-3.8 3.5-3.8 6.2 0 3.8 2.4 6.8 5.8 7.5M22 7.5c2.2 1.2 3.8 3.5 3.8 6.2 0 3.8-2.4 6.8-5.8 7.5"/><path d="M11 12c1.3 2.2 2.9 3.3 5 3.3s3.7-1.1 5-3.3M11.5 22.5c1.4 1.8 2.9 2.7 4.5 2.7s3.1-.9 4.5-2.7"/></svg>;
  if (type === 'tiny') return <svg {...props}><circle cx="16" cy="16" r="8.5"/><path d="M10.5 11.5 8 8.8M21.5 11.5 24 8.8M13.5 16h.1M18.5 16h.1M13.5 20c1.6 1.2 3.4 1.2 5 0"/></svg>;
  return <svg {...props}><circle cx="16" cy="16" r="10"/><path d="M11 16h10M16 11v10"/></svg>;
}

function previewFor(option: MatchOption): Product[] {
  if (!option.category) return products.slice(0, 4);
  return products.filter((product) => product.category === option.category);
}

export function PerfectMatch() {
  const [selectedKey, setSelectedKey] = useState('teddy');
  const selected = matchOptions.find((option) => option.key === selectedKey) ?? matchOptions[0];
  const previewProducts = useMemo(() => previewFor(selected), [selected]);
  const shopHref = selected.category ? `/shop?category=${encodeURIComponent(selected.category)}` : '/shop';

  return <section className="perfect-match-section" aria-labelledby="perfect-match-title">
    <div className="perfect-match-heading">
      <span className="eyebrow">Find your soft side</span>
      <h2 id="perfect-match-title">Choose Your Perfect Match</h2>
      <p>From tiny companions to giant hugs,<br className="perfect-match-break"/> find the plush that feels just right.</p>
    </div>
    <div className="perfect-match-options" role="list" aria-label="Choose a plush feeling">
      {matchOptions.map((option) => <button key={option.key} type="button" aria-pressed={selectedKey === option.key} className={`perfect-match-option perfect-match-option--${option.tone} ${selectedKey === option.key ? 'is-selected' : ''}`} onClick={() => setSelectedKey(option.key)}>
        <span className="perfect-match-option__icon"><MatchIcon type={option.icon}/></span>
        <span><strong>{option.label}</strong><small>{option.descriptor}</small></span>
      </button>)}
    </div>
    <div className="perfect-match-preview" aria-live="polite">
      <div className="perfect-match-preview__intro">
        <span className="eyebrow">Selected experience</span>
        <h3>{selected.label}</h3>
        <p>{selected.descriptor}. A real edit from the SoftHaven catalogue.</p>
        <Link className="text-button" href={shopHref}>View all <span aria-hidden="true">→</span></Link>
      </div>
      <div className="perfect-match-products">
        {previewProducts.map((product) => <Link className="perfect-match-product" href={`/product/${product.slug}`} key={product.id}>
          <img src={product.image} alt={product.name}/>
          <span><small>{product.category}</small><strong>{product.name}</strong><b>{formatPrice(product.price)}</b></span>
        </Link>)}
      </div>
    </div>
  </section>;
}
