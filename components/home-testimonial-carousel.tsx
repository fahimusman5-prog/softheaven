'use client';

import { useState } from 'react';
import { useRef } from 'react';
import Link from 'next/link';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Product } from '@/lib/data';
import { ProductMedia } from '@/components/product-media';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HomeTestimonialCarousel({ products }: { products: Product[] }) {
  const companions = products.slice(0, 3);
  const [activeIndex, setActiveIndex] = useState(0);
  const stackRef = useRef<HTMLDivElement>(null);
  const move = (direction: -1 | 1) => setActiveIndex((index) => (index + direction + companions.length) % companions.length);

  useGSAP(() => {
    const cards = stackRef.current?.querySelectorAll<HTMLElement>('.home-feedback__card');
    if (!cards?.length) return;

    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(cards,
        { y: (index) => 70 + index * 18, scale: 0.9, rotate: (index) => (index - 1) * 3 },
        {
          y: (index, target) => Number((target as HTMLElement).dataset.stackDepth ?? index) * 13,
          scale: 1,
          rotate: (index, target) => Number((target as HTMLElement).dataset.stackDepth ?? index) * -1.2,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: stackRef.current, start: 'top 78%', end: 'bottom 48%', scrub: 0.65 },
        },
      );
    });

    return () => media.revert();
  }, { scope: stackRef, dependencies: [activeIndex], revertOnUpdate: true });

  if (!companions.length) return null;

  return <div className="home-feedback" role="region" aria-roledescription="carousel" aria-label="Featured SoftHaven companions">
    <div className="home-feedback__stack" aria-live="polite" ref={stackRef}>
      {companions.map((product, index) => {
        const depth = (index - activeIndex + companions.length) % companions.length;
        return <article className={`home-feedback__card ${depth === 0 ? 'is-active' : ''}`} data-stack-depth={depth} key={product.id} aria-hidden={depth !== 0}>
          <ProductMedia product={product} alt={product.name} fit="cover" className="home-feedback__image" />
          <span className="home-feedback__copy"><small>{product.category}</small><p>{product.description}</p><Link href={`/product/${product.slug}`}>Meet {product.name} <span aria-hidden="true">→</span></Link></span>
        </article>;
      })}
    </div>
    <div className="home-feedback__controls">
      <button type="button" onClick={() => move(-1)} aria-label="Previous featured companion">←</button>
      <span>{String(activeIndex + 1).padStart(2, '0')} <i /> {String(companions.length).padStart(2, '0')}</span>
      <button type="button" onClick={() => move(1)} aria-label="Next featured companion">→</button>
    </div>
  </div>;
}
