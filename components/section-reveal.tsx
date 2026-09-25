'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function SectionReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add(
        {
          reduce: '(prefers-reduced-motion: reduce)',
          mobile: '(max-width: 767px)',
        },
        (match) => {
          if (match.conditions?.reduce) return;

          const section = node.firstElementChild;
          const cards = node.querySelectorAll<HTMLElement>('.product-grid .product-card, .shop-grid .product-card');
          const heading = node.querySelector<HTMLElement>('.section-heading, .page-intro');
          const tweenConfig = { y: 0, duration: match.conditions?.mobile ? 0.56 : 0.72, ease: 'power2.out', clearProps: 'transform' };

          if (cards.length) {
            const reveal = gsap.timeline({
              scrollTrigger: { trigger: node, start: 'top 84%', once: true },
            });
            if (heading) reveal.fromTo(heading, { y: 14 }, { ...tweenConfig, duration: 0.62 });
            reveal.fromTo(cards, { y: 12, scale: 0.99 }, { ...tweenConfig, stagger: match.conditions?.mobile ? 0.035 : 0.06 }, heading ? '-=0.2' : 0);
            return () => reveal.kill();
          }

          if (!section) return;
          const reveal = gsap.fromTo(section, { y: 16 }, {
            ...tweenConfig,
            scrollTrigger: { trigger: node, start: 'top 84%', once: true },
          });
          return () => reveal.kill();
        },
      );
    }, node);

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}
