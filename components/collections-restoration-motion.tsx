'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Lower content owns only its reveals; the existing shared sky owns clouds. */
export function CollectionsRestorationMotion({ children }: { children: ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = root.current;
    if (!node) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(prefers-reduced-motion: no-preference)', () => {
        node.querySelectorAll<HTMLElement>('[data-restored-section]').forEach(section => {
          // Initial states are applied only upon entry, never in permanent CSS.
          ScrollTrigger.create({ trigger: section, start: 'top 88%', once: true, onEnter: () => {
            const timeline = gsap.timeline({ defaults: { duration: .7, ease: 'power3.out', clearProps: 'transform,opacity' } });
            const headings = section.querySelectorAll('[data-restored-heading]');
            const copy = section.querySelectorAll('[data-restored-copy]');
            const rows = section.querySelectorAll('[data-restored-row]');
            const images = section.querySelectorAll('[data-restored-image]');
            if (headings.length) timeline.from(headings, { opacity: 0, y: 35 }, 0);
            if (copy.length) timeline.from(copy, { opacity: 0, y: 20, stagger: .08 }, .08);
            if (rows.length) timeline.from(rows, { opacity: 0, y: 20, stagger: .09 }, .12);
            if (images.length) timeline.from(images, { opacity: 0, scale: .97, duration: .85 }, 0);
          } });
        });
      });
    }, node);
    return () => { media.revert(); context.revert(); };
  }, []);
  return <div ref={root}>{children}</div>;
}
