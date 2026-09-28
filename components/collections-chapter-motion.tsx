'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function CollectionsChapterMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const eyebrow = node.querySelector<HTMLElement>('[data-chapter-eyebrow]');
      const heading = node.querySelector<HTMLElement>('[data-chapter-heading]');
      const copy = node.querySelector<HTMLElement>('[data-chapter-copy]');
      const cta = node.querySelector<HTMLElement>('[data-chapter-cta]');
      const artwork = node.querySelector<HTMLElement>('[data-chapter-art-entrance]');
      const parallax = node.querySelector<HTMLElement>('[data-chapter-art-parallax]');
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      const targets = [eyebrow, heading, copy, cta].filter((target): target is HTMLElement => Boolean(target));

      const entrance = gsap.timeline({
        scrollTrigger: { trigger: node, start: 'top 82%', once: true },
      });

      if (eyebrow) {
        entrance.fromTo(eyebrow, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.56, ease: 'power3.out', immediateRender: false, clearProps: 'transform,opacity,visibility' });
      }
      if (heading) {
        entrance.fromTo(heading, { autoAlpha: 0, y: 35 }, { autoAlpha: 1, y: 0, duration: 0.78, ease: 'power3.out', immediateRender: false, clearProps: 'transform,opacity,visibility' }, '<+=0.08');
      }
      if (copy) {
        entrance.fromTo(copy, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.62, ease: 'power3.out', immediateRender: false, clearProps: 'transform,opacity,visibility' }, '<+=0.1');
      }
      if (cta) {
        entrance.fromTo(cta, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.56, ease: 'power3.out', immediateRender: false, clearProps: 'transform,opacity,visibility' }, '<+=0.08');
      }
      if (artwork) {
        entrance.fromTo(
          artwork,
          { autoAlpha: 0, y: mobile ? 30 : 55, scale: mobile ? 0.97 : 0.94 },
          { autoAlpha: 1, y: 0, scale: 1, duration: mobile ? 0.8 : 1.12, ease: 'power3.out', immediateRender: false, clearProps: 'transform,opacity,visibility' },
          targets.length ? '>-0.24' : 0,
        );
      }

      if (parallax && !mobile) {
        gsap.to(parallax, {
          y: 22,
          ease: 'none',
          scrollTrigger: {
            trigger: node,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.7,
          },
        });
      }

      return () => entrance.kill();
    }, node);

    return () => context.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
