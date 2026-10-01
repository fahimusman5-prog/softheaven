'use client';

import { useRef, type ReactNode } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Entrances use inner wrappers; layout and scroll transforms have separate owners. */
export function HomeMotion({ children }: { children: ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  useGSAP(() => {
    const node = scope.current;
    if (!node) return;
    const media = gsap.matchMedia();
    media.add({ reduce: '(prefers-reduced-motion: reduce)', mobile: '(max-width: 767px)', tablet: '(min-width: 768px) and (max-width: 1100px)' }, (match) => {
      if (match.conditions?.reduce) return;
      const mobile = Boolean(match.conditions?.mobile);
      const distance = mobile ? 10 : match.conditions?.tablet ? 16 : 22;
      const intro = gsap.timeline({ defaults: { duration: .7, ease: 'power3.out', clearProps: 'transform,opacity' } });
      intro.from('.hero-portrait__copy h1', { y: distance, opacity: .78 })
        .from('.hero-portrait__copy p', { y: distance, opacity: .8 }, .15)
        .from('.portrait-carousel__visual', { y: distance, opacity: .85, stagger: .06 }, .3)
        .from('.portrait-carousel__controls, .portrait-hero-actions, .portrait-hero-note', { y: 10, opacity: .8, stagger: .1 }, .65);
      node.querySelectorAll<HTMLElement>('.journey-why, .journey-discover, .journey-details, .journey-gift, .journey-family, .journey-next-hug').forEach((section, index) => {
        const targets = section.querySelectorAll('.eyebrow, h2, [class$="__copy"] > p, [class$="__intro"] > p, [class$="__heading"] > p, [class$="__cta"], [data-story-enter="photo"], [data-story-enter="detail"], [data-next-hug-enter="photo"], .journey-family__item, .journey-discover__rail-item');
        // Establish animation state only on entry. Offscreen content stays readable if setup fails.
        ScrollTrigger.create({ trigger: section, start: 'top 85%', once: true, onEnter: () => {
          match.add(() => {
            gsap.fromTo(targets, { y: index % 2 ? distance : distance * .7, opacity: .82 }, { y: 0, opacity: 1, duration: mobile ? .55 : .8, stagger: mobile ? .025 : .045, ease: 'power3.out', clearProps: 'transform,opacity' });
          });
        }});
      });
    });
    let frame = 0;
    let disposed = false;
    const refresh = () => { if (disposed) return; cancelAnimationFrame(frame); frame = requestAnimationFrame(() => ScrollTrigger.refresh()); };
    node.addEventListener('load', refresh, true);
    void document.fonts.ready.then(refresh);
    refresh();
    return () => { disposed = true; cancelAnimationFrame(frame); node.removeEventListener('load', refresh, true); media.revert(); };
  }, { scope });
  return <div ref={scope} className="home-motion-scope">{children}</div>;
}
