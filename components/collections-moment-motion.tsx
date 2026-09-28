'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function CollectionsMomentMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      const intro = gsap.timeline({ scrollTrigger: { trigger: node, start: 'top 82%', once: true } });
      const fromTo = (selector: string, vars: gsap.TweenVars, to: gsap.TweenVars, position?: gsap.Position) => {
        const el = node.querySelector(selector);
        if (el) intro.fromTo(el, vars, { ...to, clearProps: 'transform,opacity,visibility' }, position);
      };
      fromTo('[data-moment-eyebrow]', { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: .55, ease: 'power3.out' });
      fromTo('[data-moment-heading]', { autoAlpha: 0, y: 35 }, { autoAlpha: 1, y: 0, duration: .82, ease: 'power3.out' }, '<+=.08');
      fromTo('[data-moment-description]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .65, ease: 'power3.out' }, '<+=.1');
      fromTo('[data-moment-cta]', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: .6, ease: 'power3.out' }, '<+=.08');
      fromTo('[data-moment-artwork]', { autoAlpha: 0, y: mobile ? 30 : 42, scale: mobile ? .97 : .96 }, { autoAlpha: 1, y: 0, scale: 1, duration: mobile ? .82 : 1.02, ease: 'power3.out' }, '<+=.08');
      const callouts = node.querySelectorAll('[data-moment-callout]');
      if (callouts.length) intro.fromTo(callouts, { autoAlpha: 0, y: 15, scale: .97 }, { autoAlpha: 1, y: 0, scale: 1, duration: .52, ease: 'power3.out', stagger: .1 }, '<+=.06');
      if (!mobile) {
        const range = { trigger: node, start: 'top bottom', end: 'bottom top', scrub: 1 };
        [['[data-moment-cloud-far]', -22], ['[data-moment-cloud-mid]', -42], ['[data-moment-cloud-foreground]', -64]].forEach(([selector, y]) => {
          const el = node.querySelector(selector as string);
          if (el) gsap.to(el, { y: y as number, ease: 'none', scrollTrigger: range });
        });
      }
      callouts.forEach((callout, index) => gsap.to(callout, { y: index === 1 ? -4 : -3, duration: 6 + index, ease: 'sine.inOut', repeat: -1, yoyo: true, delay: index * .3 }));
    }, node);
    return () => context.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
