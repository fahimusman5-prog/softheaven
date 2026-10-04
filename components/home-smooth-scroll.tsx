'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** One ticker; touch and keyboard retain native browser scrolling. */
export function HomeSmoothScroll() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({
        autoRaf: false,
        lerp: 0.16,
        smoothWheel: true,
        syncTouch: false,
        anchors: true,
        allowNestedScroll: true,
      });
      const tick = (seconds: number) => lenis.raf(seconds * 1000);
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(tick);
      return () => {
        gsap.ticker.remove(tick);
        lenis.off('scroll', ScrollTrigger.update);
        lenis.destroy();
      };
    });
    return () => media.revert();
  }, []);
  return null;
}
