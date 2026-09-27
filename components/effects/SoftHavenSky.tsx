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
  asset: string;
  travel: number;
  drift?: boolean;
};

type WispDefinition = {
  id: string;
  depth: CloudDepth;
  className: string;
};

const depthTravel = {
  far: { ratio: 0.25, min: 250, max: 420, mobileRatio: 0.44, mobileMin: 120, mobileMax: 220 },
  middle: { ratio: 0.45, min: 500, max: 800, mobileRatio: 0.8, mobileMin: 240, mobileMax: 420 },
  near: { ratio: 0.67, min: 800, max: 1200, mobileRatio: 1.2, mobileMin: 400, mobileMax: 650 },
} satisfies Record<CloudDepth, { ratio: number; min: number; max: number; mobileRatio: number; mobileMin: number; mobileMax: number }>;

function getTravel(depth: CloudDepth, mobile: boolean) {
  const settings = depthTravel[depth];
  return gsap.utils.clamp(
    mobile ? settings.mobileMin : settings.min,
    mobile ? settings.mobileMax : settings.max,
    window.innerWidth * (mobile ? settings.mobileRatio : settings.ratio),
  );
}

const clouds: CloudDefinition[] = [
  { id: 'far-left', depth: 'far', className: 'soft-sky__cloud--far-left', asset: '/assets/clouds/generated/dream-cloud-01.webp', travel: 0.82 },
  { id: 'far-right', depth: 'far', className: 'soft-sky__cloud--far-right', asset: '/assets/clouds/generated/dream-cloud-06.webp', travel: 0.94 },
  { id: 'far-high-left', depth: 'far', className: 'soft-sky__cloud--far-high-left soft-sky__cloud--accent', asset: '/assets/clouds/generated/dream-cloud-07.webp', travel: 0.74 },
  { id: 'far-high-right', depth: 'far', className: 'soft-sky__cloud--far-high-right soft-sky__cloud--accent', asset: '/assets/clouds/generated/dream-cloud-02.webp', travel: 1.12 },
  { id: 'middle-left', depth: 'middle', className: 'soft-sky__cloud--middle-left', asset: '/assets/clouds/generated/dream-cloud-02.webp', travel: 0.9, drift: true },
  { id: 'middle-right', depth: 'middle', className: 'soft-sky__cloud--middle-right', asset: '/assets/clouds/generated/dream-cloud-03.webp', travel: 1.04 },
  { id: 'middle-small-left', depth: 'middle', className: 'soft-sky__cloud--middle-small-left soft-sky__cloud--accent', asset: '/assets/clouds/generated/dream-cloud-08.webp', travel: 0.82 },
  { id: 'middle-small-right', depth: 'middle', className: 'soft-sky__cloud--middle-small-right soft-sky__cloud--accent', asset: '/assets/clouds/generated/dream-cloud-04.webp', travel: 1.14, drift: true },
  { id: 'middle-warm', depth: 'middle', className: 'soft-sky__cloud--middle-warm', asset: '/assets/clouds/generated/dream-cloud-warm.webp', travel: 1.08 },
  { id: 'near-left', depth: 'near', className: 'soft-sky__cloud--near-left', asset: '/assets/clouds/generated/dream-cloud-04.webp', travel: 0.9, drift: true },
  { id: 'near-right', depth: 'near', className: 'soft-sky__cloud--near-right', asset: '/assets/clouds/generated/dream-cloud-08.webp', travel: 1.08 },
  { id: 'near-small-left', depth: 'near', className: 'soft-sky__cloud--near-small-left soft-sky__cloud--accent', asset: '/assets/clouds/generated/dream-cloud-03.webp', travel: 0.76 },
];

const wisps: WispDefinition[] = [
  { id: 'wisp-upper-center', depth: 'far', className: 'soft-sky__wisp--upper-center soft-sky__wisp--mobile' },
  { id: 'wisp-middle-right', depth: 'middle', className: 'soft-sky__wisp--middle-right soft-sky__wisp--mobile' },
  { id: 'wisp-lower-center', depth: 'near', className: 'soft-sky__wisp--lower-center' },
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

    const syncVisibility = () => sky.classList.toggle('is-page-hidden', document.hidden);
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);

    gsap.registerPlugin(ScrollTrigger);
    let media: ReturnType<typeof gsap.matchMedia> | undefined;
    let refreshFrame = 0;
    let measuredHeight = document.documentElement.scrollHeight;
    const refreshForLayoutChange = () => {
      const nextHeight = document.documentElement.scrollHeight;
      if (nextHeight === measuredHeight) return;
      measuredHeight = nextHeight;
      window.cancelAnimationFrame(refreshFrame);
      refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    };
    const page = sky.closest<HTMLElement>('.softhaven-app');
    const resizeObserver = typeof ResizeObserver !== 'undefined' && page
      ? new ResizeObserver(refreshForLayoutChange)
      : undefined;
    resizeObserver?.observe(page!);
    page?.addEventListener('load', refreshForLayoutChange, true);

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
          const motion = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: document.documentElement,
              start: 'top top',
              end: () => `+=${Math.max(1, ScrollTrigger.maxScroll(window))}`,
              scrub: true,
              invalidateOnRefresh: true,
            },
          });

          (['far', 'middle', 'near'] as const).forEach((depth) => {
            const layer = sky.querySelector<HTMLElement>(`[data-parallax-layer="${depth}"]`);
            if (!layer || getComputedStyle(layer).display === 'none') return;

            const travel = getTravel(depth, mobile);
            const verticalTravel = mobile
              ? { far: 14, middle: 26, near: 42 }[depth]
              : { far: 22, middle: 42, near: 68 }[depth];
            motion.to(layer, { y: -verticalTravel, duration: 1 }, 0);

            clouds.filter((cloud) => cloud.depth === depth).forEach((cloud) => {
              const element = sky.querySelector<HTMLElement>(`#${cloud.id}`);
              if (element && getComputedStyle(element).display !== 'none') {
                motion.to(element, { x: travel * cloud.travel, duration: 1 }, 0);
              }
            });
            wisps.filter((wisp) => wisp.depth === depth).forEach((wisp) => {
              const element = sky.querySelector<HTMLElement>(`#${wisp.id}`);
              if (!element || getComputedStyle(element).display === 'none') return;
              const accentTravel = wisp.id === 'wisp-mid-slide'
                ? gsap.utils.clamp(mobile ? 240 : 700, mobile ? 350 : 1000, window.innerWidth * (mobile ? 0.82 : 0.62))
                : travel * 0.88;
              motion.to(element, { x: accentTravel, duration: 1 }, 0);
            });
          });

          const editorialImage = mobile ? null : document.querySelector<HTMLElement>('[data-sky-editorial-image]');
          if (editorialImage) {
            gsap.to(editorialImage, {
              y: 26,
              ease: 'none',
              scrollTrigger: {
                trigger: editorialImage.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 0.6,
              },
            });
          }

          if (pathname === '/' && !document.hidden) {
            const introTargets = Array.from(document.querySelectorAll<HTMLElement>('.hero-portrait__copy > *, .portrait-carousel'));
            if (introTargets.length) {
              gsap.fromTo(
                introTargets,
                { y: 14 },
                { y: 0, duration: 0.68, stagger: 0.09, ease: 'power2.out', clearProps: 'transform', delay: 0.08 },
              );
            }
          }

        },
        sky,
      );
    }, sky);

    return () => {
      document.removeEventListener('visibilitychange', syncVisibility);
      page?.removeEventListener('load', refreshForLayoutChange, true);
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(refreshFrame);
      media?.revert();
      context.revert();
    };
  }, [pathname, mode]);

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
          {wisps.filter((wisp) => wisp.depth === depth).map((wisp) => (
            <span key={wisp.id} id={wisp.id} className={`soft-sky__wisp ${wisp.className}`} />
          ))}
          {clouds.filter((cloud) => cloud.depth === depth).map((cloud) => (
            <span
              key={cloud.id}
              id={cloud.id}
              className={`soft-sky__cloud ${cloud.className}`}
            >
              <span className={`soft-sky__cloud-ambient${cloud.drift ? ' soft-sky__cloud-ambient--drift' : ''}`}>
                <picture>
                  <source media="(max-width: 767px)" srcSet={cloud.asset.replace('.webp', '-mobile.webp')} />
                  <img src={cloud.asset} alt="" loading="lazy" decoding="async" />
                </picture>
              </span>
            </span>
          ))}
        </div>
      ))}
      <div className="soft-sky__ambient-fog" aria-hidden="true">
        <span className="soft-sky__ambient-fog-layer soft-sky__ambient-fog-layer--far" />
        <span className="soft-sky__ambient-fog-layer soft-sky__ambient-fog-layer--middle" />
      </div>
      <div className="soft-sky__center-light" />
    </div>
  );
}
