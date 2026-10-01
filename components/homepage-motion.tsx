'use client';

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function HomepageMotion() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({ reduce: '(prefers-reduced-motion: reduce)', compact: '(max-width: 760px)' }, (match) => {
        if (match.conditions?.reduce) return;
        const duration = match.conditions?.compact ? 0.32 : 0.4;
        const triggers: ScrollTrigger[] = [];

        document.querySelectorAll<HTMLElement>('[data-home-motion]').forEach((section) => {
          const trigger = ScrollTrigger.create({
            trigger: section,
            start: 'top 86%',
            once: true,
            onEnter: () => {
              gsap.fromTo(section.querySelectorAll('.eyebrow, h2, p, .home-text-link, .home-button, .home-why__photo, .home-note, .home-collage figure, .home-detail-list li, .home-family__item, .home-finale__product'),
                { y: match.conditions?.compact ? 12 : 16, autoAlpha: 0.88, scale: 1 },
                { y: 0, autoAlpha: 1, scale: 1, duration, stagger: 0.07, ease: 'power3.out', clearProps: 'transform,opacity,visibility' },
              );
            },
          });
          triggers.push(trigger);
        });

        return () => triggers.forEach((trigger) => trigger.kill());
      });
    });

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return null;
}
