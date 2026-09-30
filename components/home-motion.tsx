'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export function HomeMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.utils.toArray<HTMLElement>('.home-motion-image').forEach((image) => {
        gsap.fromTo(image, { y: 14, opacity: 0.9 }, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          clearProps: 'transform,opacity',
          scrollTrigger: { trigger: image, start: 'top 92%', once: true },
        });
      });

    });

    return () => media.revert();
  }, { scope });

  return <div ref={scope} className="home-motion-scope">{children}</div>;
}
