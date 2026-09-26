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
  driftDistance: number;
  driftLeftDuration: number;
  driftReturnDuration: number;
  asset: string;
};

const clouds: CloudDefinition[] = [
  { id: 'far-left', depth: 'far', className: 'soft-sky__cloud--far-left', driftDistance: 7, driftLeftDuration: 88, driftReturnDuration: 150, asset: '/assets/clouds/soft-cloud-distant.webp' },
  { id: 'far-right', depth: 'far', className: 'soft-sky__cloud--far-right', driftDistance: 9, driftLeftDuration: 96, driftReturnDuration: 164, asset: '/assets/clouds/soft-cloud-bank.webp' },
  { id: 'middle-left', depth: 'middle', className: 'soft-sky__cloud--middle-left', driftDistance: 13, driftLeftDuration: 58, driftReturnDuration: 102, asset: '/assets/clouds/soft-cloud-cluster.webp' },
  { id: 'near-bank', depth: 'near', className: 'soft-sky__cloud--near-bank', driftDistance: 18, driftLeftDuration: 43, driftReturnDuration: 78, asset: '/assets/clouds/soft-cloud-bank.webp' },
];

function getAtmosphereMode(pathname: string) {
  if (pathname === '/') return 'hero';
  if (pathname.startsWith('/collections')) return 'collections';
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
            if (mobile || getComputedStyle(cloud).display === 'none') return;
            const distance = Number(cloud.dataset.driftDistance);
            const drift = gsap.timeline({ repeat: -1, defaults: { ease: 'none' } });
            drift.to(cloud, { x: -distance, duration: Number(cloud.dataset.driftLeftDuration) });
            drift.to(cloud, { x: 0, duration: Number(cloud.dataset.driftReturnDuration) });
            animations.push(drift);
          });

          const parallaxDistance = mobile ? { far: 20, middle: 40, near: 58 } : { far: 68, middle: 150, near: 250 };
          const parallaxLayers = (['far', 'middle', 'near'] as const).flatMap((depth) => {
            const layer = sky.querySelector<HTMLElement>(`[data-parallax-layer="${depth}"]`);
            return layer ? [{ layer, distance: parallaxDistance[depth], setY: gsap.quickSetter(layer, 'y', 'px') }] : [];
          });
          let frame = 0;
          const updateParallax = () => {
            if (frame) return;
            frame = window.requestAnimationFrame(() => {
              frame = 0;
              const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
              const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
              parallaxLayers.forEach(({ distance, setY }) => setY(-distance * progress));
            });
          };
          window.addEventListener('scroll', updateParallax, { passive: true });
          window.addEventListener('resize', updateParallax, { passive: true });
          ScrollTrigger.addEventListener('refresh', updateParallax);
          updateParallax();

          const editorialImage = mobile ? null : document.querySelector<HTMLElement>('[data-sky-editorial-image]');
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
            window.removeEventListener('scroll', updateParallax);
            window.removeEventListener('resize', updateParallax);
            ScrollTrigger.removeEventListener('refresh', updateParallax);
            if (frame) window.cancelAnimationFrame(frame);
            animations.splice(0).forEach((animation) => animation.kill());
            parallaxLayers.forEach(({ layer }) => gsap.set(layer, { clearProps: 'transform' }));
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
        <div className={`soft-sky__layer soft-sky__layer--${depth}`} key={depth} data-parallax-layer={depth}>
          {clouds.filter((cloud) => cloud.depth === depth).map((cloud) => (
            <span
              key={cloud.id}
              className={`soft-sky__cloud ${cloud.className}`}
            >
              <span className="soft-sky__cloud-drift" data-cloud-drift data-drift-distance={cloud.driftDistance} data-drift-left-duration={cloud.driftLeftDuration} data-drift-return-duration={cloud.driftReturnDuration}>
                <span className="soft-sky__cloud-mass">
                  <picture>
                    <source media="(max-width: 767px)" srcSet={cloud.asset.replace('.webp', '-mobile.webp')} />
                    <img src={cloud.asset} alt="" loading="lazy" decoding="async" />
                  </picture>
                </span>
              </span>
            </span>
          ))}
        </div>
      ))}
      <div className="soft-sky__center-light" />
    </div>
  );
}
