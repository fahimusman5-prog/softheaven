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
          const tweenConfig = { autoAlpha: 1, y: 0, duration: match.conditions?.mobile ? 0.56 : 0.72, ease: 'power2.out', clearProps: 'transform,opacity,visibility' };
          const playEntrance = (targets: Element | NodeListOf<HTMLElement>, y: number, stagger = 0) => gsap.fromTo(targets,
            { autoAlpha: 0, y, scale: 0.99 },
            { ...tweenConfig, stagger, scale: 1, immediateRender: false },
          );

          if (cards.length) {
            const reveal = ScrollTrigger.create({
              trigger: node,
              start: 'top 84%',
              once: true,
              onEnter: () => {
                if (heading) playEntrance(heading, 28);
                playEntrance(cards, 22, match.conditions?.mobile ? 0.035 : 0.06);
              },
            });
            return () => reveal.kill();
          }

          if (!section) return;
          const reveal = ScrollTrigger.create({
            trigger: node,
            start: 'top 84%',
            once: true,
            onEnter: () => playEntrance(section, 30),
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
