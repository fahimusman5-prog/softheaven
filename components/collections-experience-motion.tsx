'use client';

import type { ReactNode } from 'react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function CollectionsExperienceMotion({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia(node);
    media.add({
      desktop: '(min-width: 768px)',
      reduceMotion: '(prefers-reduced-motion: reduce)',
    }, ({ conditions }) => {
      if (conditions?.reduceMotion) return;

      const mobile = !conditions?.desktop;
      const trigger = { trigger: node, start: 'top 82%', once: true };
      const intro = gsap.timeline({ scrollTrigger: trigger });
      const reveal = (selector: string, y: number, position?: gsap.Position, stagger = 0) => {
        const elements = node.querySelectorAll(selector);
        if (!elements.length) return;
        intro.fromTo(elements, { autoAlpha: 0, y, immediateRender: false }, {
          autoAlpha: 1,
          y: 0,
          clearProps: 'transform,opacity,visibility',
          duration: mobile ? 0.58 : 0.72,
          ease: 'power3.out',
          stagger,
        }, position);
      };

      reveal('[data-experience-eyebrow]', mobile ? 16 : 20);
      reveal('[data-experience-heading]', mobile ? 24 : 34, '<+=.06');
      reveal('[data-experience-description]', mobile ? 18 : 25, '<+=.1');
      const dividers = node.querySelectorAll('[data-experience-divider]');
      const reasons = node.querySelectorAll('[data-experience-reason]');
      reasons.forEach((reason, index) => {
        const number = reason.querySelector('[data-experience-number]');
        const details = reason.querySelectorAll('[data-experience-detail]');
        if (number) {
          intro.fromTo(number, { autoAlpha: 0, y: mobile ? -10 : -14, immediateRender: false }, {
            autoAlpha: 1,
            y: 0,
            clearProps: 'transform,opacity,visibility',
            duration: mobile ? 0.5 : 0.62,
            ease: 'power3.out',
          }, index === 0 ? '<+=.08' : '>');
        }
        if (details.length) {
          intro.fromTo(details, { autoAlpha: 0, y: mobile ? 12 : 16, immediateRender: false }, {
            autoAlpha: 1,
            y: 0,
            clearProps: 'transform,opacity,visibility',
            duration: mobile ? 0.46 : 0.56,
            ease: 'power3.out',
            stagger: 0.045,
          }, '<+=.04');
        }
        const divider = dividers[index];
        if (divider) {
          intro.fromTo(divider,
            { scaleX: mobile ? 0 : 1, scaleY: mobile ? 1 : 0, immediateRender: false },
            {
              scaleX: 1,
              scaleY: 1,
              transformOrigin: mobile ? 'left center' : 'top',
              clearProps: 'transform',
              duration: mobile ? 0.5 : 0.8,
              ease: 'power3.out',
            }, '>');
        }
      });

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
        }, '>+=.06');
      }

      if (!mobile) {
        const range = { trigger: node, start: 'top bottom', end: 'bottom top', scrub: 1 };
        ([['[data-experience-cloud-left]', -22], ['[data-experience-cloud-bottom]', -52]] as const).forEach(([selector, y]) => {
          const element = node.querySelector(selector);
          if (element) gsap.to(element, { y, ease: 'none', scrollTrigger: range });
        });
      }
    });

    return () => media.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
