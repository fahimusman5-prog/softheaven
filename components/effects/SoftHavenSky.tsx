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
  asset: string;
};

const clouds: CloudDefinition[] = [
  { id: 'far-left', depth: 'far', className: 'soft-sky__cloud--far-left', driftX: 12, driftY: -3, duration: 61, asset: '/assets/clouds/distant-bank.webp' },
  { id: 'far-right', depth: 'far', className: 'soft-sky__cloud--far-right', driftX: -12, driftY: 3, duration: 68, asset: '/assets/clouds/distant-bank.webp' },
  { id: 'far-center', depth: 'far', className: 'soft-sky__cloud--far-center', driftX: 9, driftY: -2, duration: 72, mobileHidden: true, asset: '/assets/clouds/distant-bank.webp' },
  { id: 'middle-left', depth: 'middle', className: 'soft-sky__cloud--middle-left', driftX: -20, driftY: -6, duration: 43, asset: '/assets/clouds/cloud-cluster.webp' },
  { id: 'middle-right', depth: 'middle', className: 'soft-sky__cloud--middle-right', driftX: 24, driftY: 5, duration: 49, asset: '/assets/clouds/cloud-wisp.webp' },
  { id: 'middle-top', depth: 'middle', className: 'soft-sky__cloud--middle-top', driftX: -13, driftY: -4, duration: 54, mobileHidden: true, asset: '/assets/clouds/cloud-cluster.webp' },
  { id: 'middle-lower', depth: 'middle', className: 'soft-sky__cloud--middle-lower', driftX: 15, driftY: -5, duration: 46, mobileHidden: true, asset: '/assets/clouds/cloud-wisp.webp' },
  { id: 'near-left', depth: 'near', className: 'soft-sky__cloud--near-left', driftX: 28, driftY: -8, duration: 35, asset: '/assets/clouds/cloud-cluster.webp' },
  { id: 'near-right', depth: 'near', className: 'soft-sky__cloud--near-right', driftX: -31, driftY: -7, duration: 39, asset: '/assets/clouds/cloud-cluster.webp' },
  { id: 'near-bank', depth: 'near', className: 'soft-sky__cloud--near-bank', driftX: 18, driftY: -6, duration: 42, mobileHidden: true, asset: '/assets/clouds/cloud-bank.webp' },
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
    if (pathname.startsWith('/admin')) return;
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
            if (getComputedStyle(cloud).display === 'none') return;
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
            if (getComputedStyle(light).display === 'none') return;
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

          const parallaxDistance = mobile ? { far: 16, middle: 32, near: 54 } : { far: 48, middle: 116, near: 216 };
          (['far', 'middle', 'near'] as const).forEach((depth) => {
            const layer = sky.querySelector<HTMLElement>(`.soft-sky__layer--${depth}`);
            if (!layer) return;
            const direction = depth === 'middle' ? 1 : -1;
            const tween = gsap.to(layer, {
              y: -parallaxDistance[depth],
              x: direction * (depth === 'far' ? 12 : depth === 'middle' ? 24 : 38) * (mobile ? 0.45 : 1),
              ease: 'none',
              scrollTrigger: { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 1.15, invalidateOnRefresh: true },
            });
            animations.push(tween);
          });

          const editorialImage = document.querySelector<HTMLElement>('[data-sky-editorial-image]');
          if (editorialImage) {
            const imageParallax = gsap.to(editorialImage, {
              y: mobile ? 10 : 26,
              ease: 'none',
              scrollTrigger: {
                trigger: editorialImage.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
            });
            animations.push(imageParallax);
          }

          if (pathname === '/' && !document.hidden) {
            const introTargets = Array.from(document.querySelectorAll<HTMLElement>('.hero-portrait__copy > *, .portrait-carousel'));
            if (introTargets.length) {
              const intro = gsap.fromTo(
                introTargets,
                { y: 14 },
                { y: 0, duration: 0.68, stagger: 0.09, ease: 'power2.out', clearProps: 'transform', delay: 0.08 },
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

  if (pathname.startsWith('/admin')) return null;

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
              <span className="soft-sky__cloud-mass"><img src={cloud.asset} alt="" loading="lazy" decoding="async" /></span>
            </span>
          ))}
        </div>
      ))}
      <div className="soft-sky__center-light" />
    </div>
  );
}
