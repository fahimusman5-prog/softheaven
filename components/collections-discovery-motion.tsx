'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function CollectionsDiscoveryMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    gsap.registerPlugin(ScrollTrigger);
    let disposed = false;
    let frame = 0;
    const context = gsap.context(() => {
      const media = gsap.matchMedia();
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const copy = node.querySelectorAll('[data-collection-enter]');
        const cards = node.querySelectorAll('[data-collection-card]');
        // Visible server-rendered content is enhanced only after animation setup succeeds.
        const entrance = gsap.timeline({ scrollTrigger: { trigger: node, start: 'top 90%', once: true } });
        entrance.from(copy, { y: 32, opacity: 0, duration: .8, stagger: .09, ease: 'power3.out', clearProps: 'all' });
        entrance.from(cards, { y: 42, opacity: 0, scale: .975, duration: .95, stagger: .12, ease: 'power3.out', clearProps: 'all' }, .22);
        node.querySelectorAll<HTMLElement>('[data-collection-image]').forEach((image) => {
          gsap.fromTo(image, { yPercent: -3 }, { yPercent: 3, ease: 'none', scrollTrigger: { trigger: image.parentElement, start: 'top bottom', end: 'bottom top', scrub: .5, invalidateOnRefresh: true } });
        });
      });
      return () => media.revert();
    }, node);
    const refresh = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { if (!disposed) ScrollTrigger.refresh(); }); };
    node.addEventListener('load', refresh, true);
    void document.fonts.ready.then(refresh);
    return () => { disposed = true; cancelAnimationFrame(frame); node.removeEventListener('load', refresh, true); context.revert(); };
  }, []);
  return <div ref={root}>{children}</div>;
}
