'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Decorations own scroll transforms; entry and pointer motion use separate targets. */
export function CollectionsPageMotion({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    gsap.registerPlugin(ScrollTrigger);
    let disposed = false;
    let refreshFrame = 0;
    const refresh = () => {
      cancelAnimationFrame(refreshFrame);
      refreshFrame = requestAnimationFrame(() => { if (!disposed) ScrollTrigger.refresh(); });
    };
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({ reduce: '(prefers-reduced-motion: reduce)', mobile: '(max-width: 700px)', desktop: '(min-width: 701px)' }, match => {
        if (match.conditions?.reduce) return;
        // Fully visible server HTML is the baseline; entry motion never hides content.
        gsap.fromTo(node.querySelectorAll('[data-hero-enter]'), { y: 16, opacity: .72 }, { y: 0, opacity: 1, duration: .85, stagger: .09, ease: 'power2.out', clearProps: 'transform,opacity' });
        const heroArt = node.querySelector<HTMLElement>('[data-hero-art]');
        if (heroArt) gsap.fromTo(heroArt, { y: 12, opacity: .85 }, { y: 0, opacity: 1, duration: 1.1, ease: 'power2.out', clearProps: 'transform,opacity' });

      });
      media.add('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)', () => {
        const hero = node.querySelector<HTMLElement>('[data-collections-section="hero"]');
        const image = hero?.querySelector('picture');
        if (!hero || !image) return;
        const xTo = gsap.quickTo(image, 'x', { duration: .7, ease: 'power2.out' });
        const yTo = gsap.quickTo(image, 'y', { duration: .7, ease: 'power2.out' });
        const move = (event: PointerEvent) => {
          const rect = hero.getBoundingClientRect();
          xTo(((event.clientX - rect.left) / rect.width - .5) * 12);
          yTo(((event.clientY - rect.top) / rect.height - .5) * 8);
        };
        const reset = () => { xTo(0); yTo(0); };
        hero.addEventListener('pointermove', move);
        hero.addEventListener('pointerleave', reset);
        return () => { hero.removeEventListener('pointermove', move); hero.removeEventListener('pointerleave', reset); };
      });
    }, node);
    node.addEventListener('load', refresh, true);
    void document.fonts.ready.then(() => { if (!disposed) refresh(); });
    refresh();
    return () => {
      disposed = true;
      cancelAnimationFrame(refreshFrame);
      node.removeEventListener('load', refresh, true);
      media.revert();
      context.revert();
    };
  }, []);
  return <div ref={root}>{children}</div>;
}
