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

const clouds: CloudDefinition[] = [
  { id: 'far-left', depth: 'far', className: 'soft-sky__cloud--far-left', scrollX: 76, mobileScrollX: 28, asset: '/assets/clouds/soft-cloud-distant.webp' },
  { id: 'far-right', depth: 'far', className: 'soft-sky__cloud--far-right', scrollX: 84, mobileScrollX: 32, asset: '/assets/clouds/soft-cloud-bank.webp' },
  { id: 'middle-left', depth: 'middle', className: 'soft-sky__cloud--middle-left', scrollX: 142, mobileScrollX: 58, asset: '/assets/clouds/soft-cloud-cluster.webp' },
  { id: 'middle-right', depth: 'middle', className: 'soft-sky__cloud--middle-right', scrollX: 156, mobileScrollX: 66, asset: '/assets/clouds/soft-cloud-bank.webp' },
  { id: 'near-bank', depth: 'near', className: 'soft-sky__cloud--near-bank', scrollX: 246, mobileScrollX: 94, asset: '/assets/clouds/soft-cloud-bank.webp' },
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
              end: 'bottom bottom',
              scrub: mobile ? 0.3 : 0.45,
              invalidateOnRefresh: true,
            },
          });

          const yDistance = mobile ? { far: 14, middle: 28, near: 44 } : { far: 48, middle: 104, near: 172 };
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

          const fog = sky.querySelector<HTMLElement>('.soft-sky__fog');
          const fogMoments = mode === 'hero' ? [0.08, 0.34, 0.62, 0.86]
            : mode === 'collections' || mode === 'story' ? [0.28, 0.72]
              : mode === 'shop' ? [0.08] : [];
          fogMoments.forEach((moment, index) => {
            if (!fog || (mobile && index > (mode === 'hero' ? 1 : 0))) return;
            motion.fromTo(
              fog,
              { xPercent: -27, yPercent: 16, opacity: 0 },
              { xPercent: mobile ? 15 : 24, yPercent: mobile ? -8 : -14, opacity: mobile ? 0.32 : 0.44, duration: 0.07, immediateRender: false },
              moment,
            );
            motion.to(fog, { xPercent: mobile ? 34 : 48, yPercent: mobile ? -17 : -26, opacity: 0, duration: 0.09 }, moment + 0.07);
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
      <div className="soft-sky__fog" />
      <div className="soft-sky__center-light" />
    </div>
  );
}
