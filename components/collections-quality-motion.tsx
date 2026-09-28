'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function CollectionsQualityMotion({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduceMotion) return;

      const visual = node.querySelector<HTMLElement>('[data-quality-artwork]');
      const rearCloud = node.querySelector<HTMLElement>('[data-quality-cloud-back]');
      const frontCloud = node.querySelector<HTMLElement>('[data-quality-cloud-front]');
      const eyebrow = node.querySelector<HTMLElement>('[data-quality-eyebrow]');
      const heading = node.querySelector<HTMLElement>('[data-quality-heading]');
      const description = node.querySelector<HTMLElement>('[data-quality-description]');
      const markers = node.querySelectorAll<HTMLElement>('[data-quality-marker]');
      const cta = node.querySelector<HTMLElement>('[data-quality-cta]');

      const entrance = gsap.timeline({
        scrollTrigger: { trigger: node, start: 'top 82%', once: true },
      });

      if (visual) {
        entrance.fromTo(visual, { autoAlpha: 0, y: 50, scale: 0.96 }, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: 'power3.out',
          immediateRender: false,
          clearProps: 'transform,opacity,visibility',
        });
      }
      if (eyebrow) {
        entrance.fromTo(eyebrow, { autoAlpha: 0, y: 20 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.56,
          ease: 'power3.out',
          immediateRender: false,
          clearProps: 'transform,opacity,visibility',
        }, '<+=0.12');
      }
      if (heading) {
        entrance.fromTo(heading, { autoAlpha: 0, y: 35 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.76,
          ease: 'power3.out',
          immediateRender: false,
          clearProps: 'transform,opacity,visibility',
        }, '<+=0.08');
      }
      if (description) {
        entrance.fromTo(description, { autoAlpha: 0, y: 25 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.62,
          ease: 'power3.out',
          immediateRender: false,
          clearProps: 'transform,opacity,visibility',
        }, '<+=0.1');
      }
      if (markers.length) {
        entrance.fromTo(markers, { autoAlpha: 0, y: 18 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.55,
          ease: 'power3.out',
          stagger: 0.11,
          immediateRender: false,
          clearProps: 'transform,opacity,visibility',
        }, '<+=0.08');
      }
      if (cta) {
        entrance.fromTo(cta, { autoAlpha: 0, y: 20 }, {
          autoAlpha: 1,
          y: 0,
          duration: 0.58,
          ease: 'power3.out',
          immediateRender: false,
          clearProps: 'transform,opacity,visibility',
        }, '<+=0.1');
      }

      if (visual) {
        gsap.to(visual, {
          y: -24,
          ease: 'none',
          scrollTrigger: {
            trigger: node,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.8,
          },
        });
      }
      if (rearCloud) {
        gsap.to(rearCloud, {
          y: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: node,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        });
      }
      if (frontCloud) {
        gsap.to(frontCloud, {
          y: -32,
          ease: 'none',
          scrollTrigger: {
            trigger: node,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 0.9,
          },
        });
      }

      return () => entrance.kill();
    }, node);

    return () => context.revert();
  }, []);

  return <div ref={ref}>{children}</div>;
}
