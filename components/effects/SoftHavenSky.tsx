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
  scrollX: number;
  mobileScrollX: number;
  asset: string;
};

type WispDefinition = {
  id: string;
  depth: CloudDepth;
  className: string;
  scrollX: number;
  mobileScrollX: number;
};

const clouds: CloudDefinition[] = [
  { id: 'far-left', depth: 'far', className: 'soft-sky__cloud--far-left', scrollX: 128, mobileScrollX: 58, asset: '/assets/clouds/soft-cloud-distant.webp' },
  { id: 'far-right', depth: 'far', className: 'soft-sky__cloud--far-right', scrollX: 142, mobileScrollX: 64, asset: '/assets/clouds/soft-cloud-bank.webp' },
  { id: 'middle-left', depth: 'middle', className: 'soft-sky__cloud--middle-left', scrollX: 228, mobileScrollX: 106, asset: '/assets/clouds/soft-cloud-cluster.webp' },
  { id: 'middle-right', depth: 'middle', className: 'soft-sky__cloud--middle-right', scrollX: 246, mobileScrollX: 118, asset: '/assets/clouds/soft-cloud-bank.webp' },
  { id: 'near-bank', depth: 'near', className: 'soft-sky__cloud--near-bank', scrollX: 368, mobileScrollX: 166, asset: '/assets/clouds/soft-cloud-bank.webp' },
];

const wisps: WispDefinition[] = [
  { id: 'wisp-upper-left', depth: 'far', className: 'soft-sky__wisp--upper-left', scrollX: 100, mobileScrollX: 48 },
  { id: 'wisp-upper-center', depth: 'far', className: 'soft-sky__wisp--upper-center soft-sky__wisp--mobile', scrollX: 138, mobileScrollX: 56 },
  { id: 'wisp-upper-right', depth: 'far', className: 'soft-sky__wisp--upper-right', scrollX: 164, mobileScrollX: 62 },
  { id: 'wisp-middle-left', depth: 'middle', className: 'soft-sky__wisp--middle-left', scrollX: 208, mobileScrollX: 82 },
  { id: 'wisp-middle-right', depth: 'middle', className: 'soft-sky__wisp--middle-right soft-sky__wisp--mobile', scrollX: 248, mobileScrollX: 96 },
  { id: 'wisp-right-low', depth: 'middle', className: 'soft-sky__wisp--right-low', scrollX: 276, mobileScrollX: 102 },
  { id: 'wisp-lower-left', depth: 'near', className: 'soft-sky__wisp--lower-left', scrollX: 340, mobileScrollX: 126 },
  { id: 'wisp-lower-center', depth: 'near', className: 'soft-sky__wisp--lower-center', scrollX: 420, mobileScrollX: 148 },
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
          const page = sky.closest<HTMLElement>('.softhaven-app');
          const motion = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: page ?? document.documentElement,
              start: 'top top',
              end: () => `+=${Math.max(1, Math.min(
                document.documentElement.scrollHeight - window.innerHeight,
                window.innerHeight * (mobile ? 0.92 : 0.84),
              ))}`,
              scrub: mobile ? 0.18 : 0.22,
              invalidateOnRefresh: true,
            },
          });

          const yDistance = mobile ? { far: 8, middle: 20, near: 34 } : { far: 18, middle: 52, near: 92 };
          (['far', 'middle', 'near'] as const).forEach((depth) => {
            const layer = sky.querySelector<HTMLElement>(`[data-parallax-layer="${depth}"]`);
            if (layer && getComputedStyle(layer).display !== 'none') {
              motion.to(layer, { y: -yDistance[depth], duration: 1 }, 0);
            }
          });

          clouds.forEach((cloud) => {
            const element = sky.querySelector<HTMLElement>(`#${cloud.id}`);
            if (element && getComputedStyle(element).display !== 'none') {
              motion.to(element, { x: mobile ? cloud.mobileScrollX : cloud.scrollX, duration: 1 }, 0);
            }
          });
          wisps.forEach((wisp) => {
            const element = sky.querySelector<HTMLElement>(`#${wisp.id}`);
            if (element && getComputedStyle(element).display !== 'none') {
              motion.to(element, { x: mobile ? wisp.mobileScrollX : wisp.scrollX, duration: 1 }, 0);
            }
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

          return () => motion.kill();
        },
        sky,
      );
    }, sky);

    return () => {
      document.removeEventListener('visibilitychange', syncVisibility);
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
        <span className="soft-sky__ambient-fog-layer soft-sky__ambient-fog-layer--accent" />
      </div>
      <div className="soft-sky__center-light" />
    </div>
  );
}
