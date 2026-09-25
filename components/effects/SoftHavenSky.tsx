'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type CloudDepth = 'far' | 'middle' | 'near';

type CloudDefinition = {
  id: string;
  depth: CloudDepth;
  className: string;
  mobileHidden?: boolean;
  driftX: number;
  driftY: number;
  duration: number;
};

const clouds: CloudDefinition[] = [
  { id: 'far-left', depth: 'far', className: 'soft-sky__cloud--far-left', driftX: 25, driftY: -5, duration: 61 },
  { id: 'far-right', depth: 'far', className: 'soft-sky__cloud--far-right', driftX: -20, driftY: 4, duration: 68 },
  { id: 'far-center', depth: 'far', className: 'soft-sky__cloud--far-center', driftX: 16, driftY: -3, duration: 72, mobileHidden: true },
  { id: 'middle-left', depth: 'middle', className: 'soft-sky__cloud--middle-left', driftX: -38, driftY: -10, duration: 43 },
  { id: 'middle-right', depth: 'middle', className: 'soft-sky__cloud--middle-right', driftX: 44, driftY: 9, duration: 49 },
  { id: 'middle-top', depth: 'middle', className: 'soft-sky__cloud--middle-top', driftX: -24, driftY: -7, duration: 54, mobileHidden: true },
  { id: 'middle-lower', depth: 'middle', className: 'soft-sky__cloud--middle-lower', driftX: 30, driftY: -8, duration: 46, mobileHidden: true },
  { id: 'near-left', depth: 'near', className: 'soft-sky__cloud--near-left', driftX: 51, driftY: -14, duration: 35 },
  { id: 'near-right', depth: 'near', className: 'soft-sky__cloud--near-right', driftX: -57, driftY: -12, duration: 39 },
  { id: 'near-bank', depth: 'near', className: 'soft-sky__cloud--near-bank', driftX: 34, driftY: -10, duration: 42, mobileHidden: true },
];

function getAtmosphereMode(pathname: string) {
  if (pathname === '/') return 'hero';
  if (pathname.startsWith('/about')) return 'story';
  if (pathname.startsWith('/shop')) return 'shop';
  if (pathname.startsWith('/product/')) return 'product';
  if (pathname.startsWith('/contact')) return 'contact';
  if (pathname.startsWith('/cart')) return 'minimal';
  if (pathname.startsWith('/checkout') || pathname.startsWith('/order-confirmation')) return 'quiet';
  return 'standard';
}

export function SoftHavenCloudBackground() {
  const skyRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const mode = getAtmosphereMode(pathname);

  useEffect(() => {
    const sky = skyRef.current;
    if (!sky) return;

    gsap.registerPlugin(ScrollTrigger);
    const animations: gsap.core.Animation[] = [];
    let media: ReturnType<typeof gsap.matchMedia> | undefined;
    const context = gsap.context(() => {
      media = gsap.matchMedia(sky);
      media.add(
        {
          reduce: '(prefers-reduced-motion: reduce)',
          mobile: '(max-width: 767px)',
          desktop: '(min-width: 768px)',
        },
        (match) => {
          if (match.conditions?.reduce) return;
          const mobile = Boolean(match.conditions?.mobile);

          Array.from(sky.querySelectorAll<HTMLElement>('[data-cloud-drift]')).forEach((cloud) => {
            const distance = Number(cloud.dataset.driftX) * (mobile ? 0.42 : 1);
            const vertical = Number(cloud.dataset.driftY) * (mobile ? 0.45 : 1);
            const tween = gsap.to(cloud, {
              x: distance,
              y: vertical,
              duration: Number(cloud.dataset.duration),
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
            });
            animations.push(tween);
          });

          Array.from(sky.querySelectorAll<HTMLElement>('[data-sky-light]')).forEach((light, index) => {
            const tween = gsap.to(light, {
              x: index % 2 ? -11 : 13,
              y: index % 2 ? 8 : -9,
              scale: 1.035,
              duration: 32 + index * 5,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
            });
            animations.push(tween);
          });

          const parallaxDistance = mobile ? { far: -12, middle: -22, near: -30 } : { far: -26, middle: -42, near: -58 };
          (['far', 'middle', 'near'] as const).forEach((depth) => {
            const layer = sky.querySelector<HTMLElement>(`.soft-sky__layer--${depth}`);
            if (!layer) return;
            const tween = gsap.to(layer, {
              y: parallaxDistance[depth],
              ease: 'none',
              scrollTrigger: {
                trigger: document.documentElement,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.8,
                invalidateOnRefresh: true,
              },
            });
            animations.push(tween);
          });

          if (pathname === '/' && !document.hidden) {
            const introTargets = Array.from(document.querySelectorAll<HTMLElement>('.hero-portrait__copy > *, .portrait-carousel'));
            if (introTargets.length) {
              const intro = gsap.fromTo(
                introTargets,
                { autoAlpha: 0, y: 14 },
                { autoAlpha: 1, y: 0, duration: 0.68, stagger: 0.09, ease: 'power2.out', clearProps: 'all', delay: 0.08 },
              );
              animations.push(intro);
            }
          }

          return () => {
            animations.splice(0).forEach((animation) => animation.kill());
          };
        },
        sky,
      );
    }, sky);

    const pauseWhenHidden = () => {
      animations.forEach((animation) => animation.paused(document.hidden));
    };
    document.addEventListener('visibilitychange', pauseWhenHidden);
    pauseWhenHidden();

    return () => {
      document.removeEventListener('visibilitychange', pauseWhenHidden);
      media?.revert();
      context.revert();
      animations.length = 0;
    };
  }, [pathname]);

  return (
    <div ref={skyRef} className="soft-sky" data-mode={mode} aria-hidden="true">
      <div className="soft-sky__base" />
      <div className="soft-sky__light soft-sky__light--blush" data-sky-light />
      <div className="soft-sky__light soft-sky__light--blue" data-sky-light />
      <div className="soft-sky__light soft-sky__light--lilac" data-sky-light />
      <div className="soft-sky__light soft-sky__light--peach" data-sky-light />
      <div className="soft-sky__light soft-sky__light--mint" data-sky-light />
      {(['far', 'middle', 'near'] as const).map((depth) => (
        <div className={`soft-sky__layer soft-sky__layer--${depth}`} key={depth}>
          {clouds.filter((cloud) => cloud.depth === depth).map((cloud) => (
            <span
              key={cloud.id}
              className={`soft-sky__cloud ${cloud.className}${cloud.mobileHidden ? ' soft-sky__cloud--mobile-hidden' : ''}`}
              data-cloud-drift
              data-drift-x={cloud.driftX}
              data-drift-y={cloud.driftY}
              data-duration={cloud.duration}
            >
              <span className="soft-sky__cloud-mass" />
            </span>
          ))}
        </div>
      ))}
      <div className="soft-sky__center-light" />
    </div>
  );
}
