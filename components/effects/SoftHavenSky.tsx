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
  width: string;
  height: string;
  driftX: number;
  driftY: number;
  duration: number;
};

const clouds: CloudDefinition[] = [
  { id: 'far-left', depth: 'far', className: 'soft-sky__cloud--far-left', asset: '/assets/clouds/distant-bank.webp', width: '56vw', height: '31vw', driftX: 18, driftY: -4, duration: 64 },
  { id: 'far-center', depth: 'far', className: 'soft-sky__cloud--far-center', asset: '/assets/clouds/distant-bank.webp', width: '55vw', height: '29vw', driftX: -14, driftY: 5, duration: 70 },
  { id: 'far-right', depth: 'far', className: 'soft-sky__cloud--far-right', asset: '/assets/clouds/mid-cluster.webp', width: '51vw', height: '28vw', driftX: -20, driftY: -5, duration: 59 },
  { id: 'mid-left', depth: 'middle', className: 'soft-sky__cloud--mid-left', asset: '/assets/clouds/mid-cluster.webp', width: '47vw', height: '25vw', driftX: -26, driftY: -8, duration: 41 },
  { id: 'mid-right', depth: 'middle', className: 'soft-sky__cloud--mid-right', asset: '/assets/clouds/foreground-wisp.webp', width: '49vw', height: '26vw', driftX: 30, driftY: 7, duration: 45 },
  { id: 'near-left', depth: 'near', className: 'soft-sky__cloud--near-left', asset: '/assets/clouds/hero-bank.webp', width: '51vw', height: '29vw', driftX: 34, driftY: -12, duration: 32 },
  { id: 'near-right', depth: 'near', className: 'soft-sky__cloud--near-right', asset: '/assets/clouds/foreground-wisp.webp', width: '49vw', height: '27vw', driftX: -39, driftY: -10, duration: 36 },
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
  const isAdmin = pathname.startsWith('/admin');
  const mode = getAtmosphereMode(pathname);

  useEffect(() => {
    if (isAdmin) return;
    const sky = skyRef.current;
    if (!sky) return;

    gsap.registerPlugin(ScrollTrigger);
    const ambientAnimations: gsap.core.Animation[] = [];
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add(
        {
          reduce: '(prefers-reduced-motion: reduce)',
          mobile: '(max-width: 767px)',
          tablet: '(min-width: 768px) and (max-width: 1023px)',
          desktop: '(min-width: 1024px)',
        },
        (match) => {
          if (match.conditions?.reduce) return;
          const mobile = Boolean(match.conditions?.mobile);
          const tablet = Boolean(match.conditions?.tablet);
          const distances = mobile ? { far: 14, middle: 34, near: 58 } : tablet ? { far: 28, middle: 76, near: 128 } : { far: 42, middle: 126, near: 208 };

          sky.querySelectorAll<HTMLElement>('[data-cloud-drift]').forEach((cloud) => {
            const art = cloud.querySelector<HTMLElement>('.soft-sky__cloud');
            if (!art || getComputedStyle(art).display === 'none') return;
            const scale = mobile ? 0.48 : tablet ? 0.76 : 1;
            const tween = gsap.to(cloud, {
              x: Number(cloud.dataset.driftX) * scale,
              y: Number(cloud.dataset.driftY) * scale,
              duration: Number(cloud.dataset.duration) * (mobile ? 1.25 : 1),
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
            });
            ambientAnimations.push(tween);
          });

          sky.querySelectorAll<HTMLElement>('[data-sky-light]').forEach((light, index) => {
            if (getComputedStyle(light).display === 'none') return;
            const tween = gsap.to(light, {
              x: (index % 2 ? -1 : 1) * (mobile ? 5 : 11),
              y: (index % 2 ? 1 : -1) * (mobile ? 4 : 8),
              duration: 38 + index * 4,
              ease: 'sine.inOut',
              repeat: -1,
              yoyo: true,
            });
            ambientAnimations.push(tween);
          });

          (['far', 'middle', 'near'] as const).forEach((depth) => {
            const plane = sky.querySelector<HTMLElement>(`[data-sky-plane="${depth}"]`);
            if (!plane) return;
            gsap.to(plane, {
              y: -distances[depth],
              ease: 'none',
              scrollTrigger: {
                trigger: document.documentElement,
                start: 0,
                end: () => ScrollTrigger.maxScroll(window),
                scrub: mobile ? 1.4 : 1,
                invalidateOnRefresh: true,
              },
            });
          });

          document.querySelectorAll<HTMLElement>('[data-sky-host]').forEach((host) => {
            const scrollCloud = host.querySelector<HTMLElement>('[data-sky-transition-scroll]');
            if (!scrollCloud || getComputedStyle(scrollCloud.parentElement ?? scrollCloud).display === 'none') return;
            const driftCloud = scrollCloud.querySelector<HTMLElement>('[data-sky-transition-drift]');
            const travel = mobile ? 58 : tablet ? 112 : 176;
            gsap.fromTo(scrollCloud, { y: travel, autoAlpha: 0.72 }, {
              y: -travel * 0.72,
              autoAlpha: 1,
              ease: 'none',
              scrollTrigger: {
                trigger: host,
                start: 'top 88%',
                end: 'bottom 18%',
                scrub: mobile ? 1.3 : 1,
                invalidateOnRefresh: true,
              },
            });
            if (driftCloud) {
              const drift = Number(driftCloud.dataset.driftX || 18) * (mobile ? 0.42 : 1);
              const tween = gsap.to(driftCloud, { x: drift, y: mobile ? -4 : -9, duration: mobile ? 48 : 36, ease: 'sine.inOut', repeat: -1, yoyo: true });
              ambientAnimations.push(tween);
            }
          });

          const editorialImage = document.querySelector<HTMLElement>('[data-sky-editorial-image]');
          if (editorialImage) {
            gsap.to(editorialImage, {
              y: mobile ? 10 : 26,
              ease: 'none',
              scrollTrigger: {
                trigger: editorialImage.parentElement,
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1.2,
              },
            });
          }

          if (pathname === '/' && !document.hidden) {
            const hero = document.querySelector<HTMLElement>('.hero-portrait');
            const heroCopy = hero?.querySelector('.hero-portrait__copy');
            const eyebrow = heroCopy?.querySelector('.eyebrow');
            const heading = heroCopy?.querySelector('h1');
            const description = heroCopy?.querySelector('p');
            const carousel = hero?.querySelector('.portrait-carousel');
            const actions = hero?.querySelector('.portrait-hero-actions');
            const introTargets = [eyebrow, heading, description, carousel, actions].filter((target): target is Element => Boolean(target));
            if (introTargets.length) {
              const intro = gsap.timeline({ defaults: { ease: 'power2.out' } });
              intro.fromTo(introTargets[0], { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.48, delay: 0.12 });
              if (introTargets[1]) intro.fromTo(introTargets[1], { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.62 }, '-=0.28');
              if (introTargets[2]) intro.fromTo(introTargets[2], { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.48 }, '-=0.3');
              if (introTargets[3]) intro.fromTo(introTargets[3], { autoAlpha: 0, y: 12, scale: 0.99 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.72 }, '-=0.18');
              if (introTargets[4]) intro.fromTo(introTargets[4], { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.42 }, '-=0.2');
              ambientAnimations.push(intro);
            }
          }

          const refreshFrame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
          return () => {
            window.cancelAnimationFrame(refreshFrame);
            ambientAnimations.splice(0).forEach((animation) => animation.kill());
          };
        },
      );
    }, sky);

    const pauseWhenHidden = () => ambientAnimations.forEach((animation) => animation.paused(document.hidden));
    document.addEventListener('visibilitychange', pauseWhenHidden);
    pauseWhenHidden();

    return () => {
      document.removeEventListener('visibilitychange', pauseWhenHidden);
      media.revert();
      context.revert();
      ambientAnimations.length = 0;
    };
  }, [isAdmin, pathname]);

  if (isAdmin) return null;

  return (
    <div ref={skyRef} className="soft-sky" data-mode={mode} aria-hidden="true">
      <div className="soft-sky__base" />
      <div className="soft-sky__light soft-sky__light--blush" data-sky-light />
      <div className="soft-sky__light soft-sky__light--blue" data-sky-light />
      <div className="soft-sky__light soft-sky__light--lilac" data-sky-light />
      <div className="soft-sky__light soft-sky__light--peach" data-sky-light />
      <div className="soft-sky__light soft-sky__light--mint" data-sky-light />
      {(['far', 'middle', 'near'] as const).map((depth) => (
        <div className={`soft-sky__plane soft-sky__plane--${depth}`} data-sky-plane={depth} key={depth}>
          {clouds.filter((cloud) => cloud.depth === depth).map((cloud) => (
            <div className="soft-sky__drift" data-cloud-drift data-drift-x={cloud.driftX} data-drift-y={cloud.driftY} data-duration={cloud.duration} key={cloud.id}>
              <span
                className={`soft-sky__cloud ${cloud.className}`}
                style={{ '--cloud-width': cloud.width, '--cloud-height': cloud.height } as React.CSSProperties}
              >
                <img className="soft-sky__cloud-art" src={cloud.asset} alt="" width="900" height="460" draggable="false" decoding="async" />
              </span>
            </div>
          ))}
        </div>
      ))}
      <div className="soft-sky__center-light" />
    </div>
  );
}
