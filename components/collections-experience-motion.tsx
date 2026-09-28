'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function CollectionsExperienceMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      const trigger = { trigger: node, start: 'top 82%', once: true };
      const intro = gsap.timeline({ scrollTrigger: trigger });
      const reveal = (selector: string, vars: gsap.TweenVars, position?: gsap.Position) => {
        const elements = node.querySelectorAll(selector);
        if (elements.length) {
          intro.fromTo(elements, { ...vars, immediateRender: false }, {
            ...Object.fromEntries(Object.keys(vars).map((key) => [key, key === 'autoAlpha' ? 1 : 0])),
            y: 0,
            clearProps: 'transform,opacity,visibility',
            duration: mobile ? 0.58 : 0.72,
            ease: 'power3.out',
            stagger: selector === '[data-experience-reason]' ? (mobile ? 0.06 : 0.11) : 0,
          }, position);
        }
      };

      reveal('[data-experience-eyebrow]', { autoAlpha: 0, y: mobile ? 16 : 20 });
      reveal('[data-experience-heading]', { autoAlpha: 0, y: mobile ? 24 : 34 }, '<+=.06');
      reveal('[data-experience-description]', { autoAlpha: 0, y: mobile ? 18 : 25 }, '<+=.1');
      reveal('[data-experience-reason]', { autoAlpha: 0, y: mobile ? 18 : 26 }, '<+=.08');

      const dividers = node.querySelectorAll('[data-experience-divider]');
      if (dividers.length) {
        intro.fromTo(dividers, { scaleY: 0 }, { scaleY: 1, transformOrigin: 'top', duration: mobile ? 0.5 : 0.8, ease: 'power3.out', stagger: 0.1 }, '<+=.04');
      }

      const artwork = node.querySelector('[data-experience-artwork]');
      if (artwork) {
        intro.fromTo(artwork, { autoAlpha: 0, x: mobile ? 0 : 38, y: mobile ? 26 : 20, scale: mobile ? 0.97 : 0.98, immediateRender: false }, {
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          clearProps: 'transform,opacity,visibility',
          duration: mobile ? 0.78 : 1,
          ease: 'power3.out',
        }, '<+=.05');
      }

      if (!mobile) {
        const range = { trigger: node, start: 'top bottom', end: 'bottom top', scrub: 1 };
        ([['[data-experience-cloud-left]', -22], ['[data-experience-cloud-bottom]', -52]] as const).forEach(([selector, y]) => {
          const element = node.querySelector(selector);
          if (element) gsap.to(element, { y, ease: 'none', scrollTrigger: range });
        });
      }
    }, node);

    return () => context.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
