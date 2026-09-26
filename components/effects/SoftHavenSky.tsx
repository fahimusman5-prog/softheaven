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
};

type WispDefinition = {
  id: string;
  depth: CloudDepth;
  className: string;
};

const depthTravel = {
  far: { ratio: 0.16, min: 180, max: 300, mobileRatio: 0.22, mobileMin: 60, mobileMax: 110, scrub: 0.55, mobileScrub: 0.45 },
  middle: { ratio: 0.31, min: 350, max: 550, mobileRatio: 0.39, mobileMin: 120, mobileMax: 200, scrub: 0.35, mobileScrub: 0.3 },
  near: { ratio: 0.44, min: 550, max: 850, mobileRatio: 0.58, mobileMin: 180, mobileMax: 300, scrub: 0.22, mobileScrub: 0.18 },
} satisfies Record<CloudDepth, { ratio: number; min: number; max: number; mobileRatio: number; mobileMin: number; mobileMax: number; scrub: number; mobileScrub: number }>;

function getTravel(depth: CloudDepth, mobile: boolean) {
  const settings = depthTravel[depth];
  return gsap.utils.clamp(
    mobile ? settings.mobileMin : settings.min,
    mobile ? settings.mobileMax : settings.max,
    window.innerWidth * (mobile ? settings.mobileRatio : settings.ratio),
  );
}

const clouds: CloudDefinition[] = [
  { id: 'far-left', depth: 'far', className: 'soft-sky__cloud--far-left', asset: '/assets/clouds/soft-cloud-distant.webp' },
  { id: 'far-right', depth: 'far', className: 'soft-sky__cloud--far-right', asset: '/assets/clouds/soft-cloud-bank.webp' },
  { id: 'middle-left', depth: 'middle', className: 'soft-sky__cloud--middle-left', asset: '/assets/clouds/soft-cloud-cluster.webp' },
  { id: 'middle-right', depth: 'middle', className: 'soft-sky__cloud--middle-right', asset: '/assets/clouds/soft-cloud-bank.webp' },
  { id: 'near-bank', depth: 'near', className: 'soft-sky__cloud--near-bank', asset: '/assets/clouds/soft-cloud-bank.webp' },
];

const wisps: WispDefinition[] = [
  { id: 'wisp-upper-left', depth: 'far', className: 'soft-sky__wisp--upper-left' },
  { id: 'wisp-upper-center', depth: 'far', className: 'soft-sky__wisp--upper-center soft-sky__wisp--mobile' },
  { id: 'wisp-upper-right', depth: 'far', className: 'soft-sky__wisp--upper-right' },
  { id: 'wisp-middle-left', depth: 'middle', className: 'soft-sky__wisp--middle-left' },
  { id: 'wisp-middle-right', depth: 'middle', className: 'soft-sky__wisp--middle-right soft-sky__wisp--mobile' },
  { id: 'wisp-right-low', depth: 'middle', className: 'soft-sky__wisp--right-low' },
  { id: 'wisp-lower-left', depth: 'near', className: 'soft-sky__wisp--lower-left' },
  { id: 'wisp-lower-center', depth: 'near', className: 'soft-sky__wisp--lower-center' },
  { id: 'wisp-small-upper-left', depth: 'far', className: 'soft-sky__wisp--small-upper-left' },
  { id: 'wisp-small-upper-right', depth: 'far', className: 'soft-sky__wisp--small-upper-right' },
  { id: 'wisp-small-mid-right', depth: 'middle', className: 'soft-sky__wisp--small-mid-right' },
  { id: 'wisp-small-lower-right', depth: 'near', className: 'soft-sky__wisp--small-lower-right' },
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
          (['far', 'middle', 'near'] as const).forEach((depth) => {
            const layer = sky.querySelector<HTMLElement>(`[data-parallax-layer="${depth}"]`);
            if (!layer || getComputedStyle(layer).display === 'none') return;

            const motion = gsap.timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: document.documentElement,
                start: 'top top',
                end: () => `+=${Math.max(1, ScrollTrigger.maxScroll(window))}`,
                scrub: mobile ? depthTravel[depth].mobileScrub : depthTravel[depth].scrub,
                invalidateOnRefresh: true,
              },
            });
            const travel = getTravel(depth, mobile);
            motion.to(layer, { y: mobile ? -Math.min(34, travel * 0.12) : -Math.min(92, travel * 0.12), duration: 1 }, 0);

            clouds.filter((cloud) => cloud.depth === depth).forEach((cloud) => {
              const element = sky.querySelector<HTMLElement>(`#${cloud.id}`);
              if (element && getComputedStyle(element).display !== 'none') {
                motion.to(element, { x: travel, duration: 1 }, 0);
              }
            });
            wisps.filter((wisp) => wisp.depth === depth).forEach((wisp) => {
              const element = sky.querySelector<HTMLElement>(`#${wisp.id}`);
              if (element && getComputedStyle(element).display !== 'none') {
                motion.to(element, { x: getTravel(wisp.depth, mobile), duration: 1 }, 0);
              }
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
              <span className="soft-sky__cloud-mass">
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
