'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function CollectionsMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const targets = node.querySelectorAll<HTMLElement>('[data-collection-reveal]');
      const cards = node.querySelectorAll<HTMLElement>('[data-collection-card]');
      const reveal = ScrollTrigger.create({
        trigger: node,
        start: 'top 84%',
        once: true,
        onEnter: () => {
          if (targets.length) {
            gsap.fromTo(targets,
              { autoAlpha: 0, y: 20 },
              { autoAlpha: 1, y: 0, duration: 0.62, ease: 'power2.out', stagger: 0.07, immediateRender: false, clearProps: 'transform,opacity,visibility' },
            );
          }
          if (cards.length) {
            gsap.fromTo(cards,
              { autoAlpha: 0, y: 28 },
              { autoAlpha: 1, y: 0, duration: 0.68, ease: 'power2.out', stagger: 0.1, immediateRender: false, clearProps: 'transform,opacity,visibility' },
            );
          }
        },
      });

      return () => reveal.kill();
    }, node);

    return () => context.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
