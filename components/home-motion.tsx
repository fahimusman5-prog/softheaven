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
        gsap.fromTo(image, { scale: 0.8, opacity: 0.55, filter: 'brightness(0.78)' }, {
          scale: 1,
          opacity: 1,
          filter: 'brightness(1)',
          ease: 'none',
          scrollTrigger: { trigger: image, start: 'top bottom', end: 'bottom top', scrub: 0.7 },
        });
      });

    });

    return () => media.revert();
  }, { scope });

  return <div ref={scope} className="home-motion-scope">{children}</div>;
}
