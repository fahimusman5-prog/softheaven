'use client';
import { useEffect, type RefObject } from 'react';
import { gsap } from 'gsap';

/** The image's own hydrated component owns pointer motion; no server HTML is mutated early. */
export function useSoftDepth(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const target = ref.current;
    if (!target) return;
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add('(min-width: 1101px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)', () => {
        gsap.set(target, { transformPerspective:1200, transformOrigin:'50% 50%' });
        const x = gsap.quickTo(target, 'rotationX', { duration:.45, ease:'power3.out' });
        const y = gsap.quickTo(target, 'rotationY', { duration:.45, ease:'power3.out' });
        const move = (event:PointerEvent) => {
          if (event.pointerType !== 'mouse') return;
          const rect = target.getBoundingClientRect();
          x(-(Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))-.5)*4);
          y((Math.max(0,Math.min(1,(event.clientX-rect.left)/rect.width))-.5)*6);
        };
        const reset = () => { x(0); y(0); };
        target.addEventListener('pointermove',move,{passive:true});
        target.addEventListener('pointerleave',reset);
        target.addEventListener('blur',reset);
        return () => {
          target.removeEventListener('pointermove',move); target.removeEventListener('pointerleave',reset); target.removeEventListener('blur',reset);
          x.tween.kill(); y.tween.kill();
        };
      });
    },target);
    return () => { media.revert(); context.revert(); };
  },[ref]);
}
