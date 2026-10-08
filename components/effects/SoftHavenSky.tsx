'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

type Mode = 'rich' | 'store' | 'product' | 'transaction' | 'standard';
type Depth = 'haze' | 'far' | 'middle' | 'foreground';
const profiles: Record<Mode, { desktop: number; tablet: number; mobile: number; motion: number; variant: number }> = {
  rich: { desktop: 34, tablet: 19, mobile: 13, motion: 1, variant: 0 },
  store: { desktop: 29, tablet: 19, mobile: 12, motion: .9, variant: 1 },
  standard: { desktop: 25, tablet: 18, mobile: 12, motion: .85, variant: 2 },
  product: { desktop: 14, tablet: 13, mobile: 10, motion: .72, variant: 3 },
  transaction: { desktop: 15, tablet: 13, mobile: 9, motion: .65, variant: 4 },
};
const baseCounts: Record<Mode, { desktop: number; tablet: number; mobile: number }> = {
  rich: { desktop: 26, tablet: 15, mobile: 11 },
  store: { desktop: 22, tablet: 15, mobile: 10 },
  standard: { desktop: 19, tablet: 14, mobile: 10 },
  product: { desktop: 11, tablet: 10, mobile: 8 },
  transaction: { desktop: 12, tablet: 10, mobile: 7 },
};
// Fixed placement records: responsive composition never depends on random values or hydration.
type CloudPlacement = {
  x: number; y: number; mobileX: number; mobileY: number; width: number; depth: Depth;
  tabletX?: number; tabletY?: number; desktopTravel?: number; mobileTravel?: number;
  tabletTravel?: number; coverage?: 'anchor' | 'distant' | 'transition'; opacity?: number;
};
const placements: CloudPlacement[] = [
  { x: -4, y: 12, mobileX: -13, mobileY: 12, width: 230, depth: 'middle' },
  { x: 77, y: 19, mobileX: 72, mobileY: 22, width: 250, depth: 'middle' },
  { x: 28, y: 8, mobileX: 32, mobileY: 8, width: 160, depth: 'far' },
  { x: 1, y: 46, mobileX: -15, mobileY: 48, width: 270, depth: 'middle' },
  { x: 79, y: 55, mobileX: 73, mobileY: 66, width: 270, depth: 'middle' },
  { x: 20, y: 78, mobileX: 16, mobileY: 86, width: 180, depth: 'far' },
  { x: 58, y: 38, mobileX: 51, mobileY: 37, width: 160, depth: 'far' },
  { x: 68, y: 83, mobileX: 62, mobileY: 91, width: 310, depth: 'foreground' },
  { x: -5, y: 89, mobileX: -16, mobileY: 78, width: 320, depth: 'foreground' },
  { x: 38, y: 64, mobileX: 40, mobileY: 59, width: 150, depth: 'far' },
  { x: 9, y: 27, mobileX: 4, mobileY: 30, width: 200, depth: 'middle' },
  { x: 49, y: 92, mobileX: 45, mobileY: 96, width: 190, depth: 'middle' },
  { x: 63, y: 5, mobileX: 63, mobileY: 5, width: 170, depth: 'far' },
  { x: 88, y: 37, mobileX: 85, mobileY: 42, width: 220, depth: 'middle' },
  { x: 21, y: 58, mobileX: 17, mobileY: 56, width: 160, depth: 'far' },
  { x: 46, y: 21, mobileX: 43, mobileY: 20, width: 140, depth: 'far' },
  { x: 8, y: 69, mobileX: 3, mobileY: 72, width: 220, depth: 'middle' },
  { x: 86, y: 74, mobileX: 82, mobileY: 75, width: 200, depth: 'middle' },
  { x: 34, y: 48, mobileX: 28, mobileY: 48, width: 150, depth: 'far' },
  { x: 14, y: 16, mobileX: 8, mobileY: 16, width: 180, depth: 'middle' },
  { x: 61, y: 68, mobileX: 56, mobileY: 68, width: 210, depth: 'middle' },
  { x: 4, y: 57, mobileX: -10, mobileY: 57, width: 240, depth: 'middle' },
  { x: 75, y: 30, mobileX: 72, mobileY: 30, width: 180, depth: 'middle' },
  { x: 30, y: 88, mobileX: 25, mobileY: 88, width: 270, depth: 'foreground' },
  { x: 56, y: 12, mobileX: 52, mobileY: 12, width: 150, depth: 'middle' },
  { x: -12, y: 34, mobileX: -20, mobileY: 34, width: 270, depth: 'foreground' },
];
// Small satellites form irregular clusters beside existing clouds, with open sky between groups.
const satellites: typeof placements = [
  { x: 8, y: 17, mobileX: 1, mobileY: 16, width: 95, depth: 'haze' },
  { x: 72, y: 26, mobileX: 77, mobileY: 27, width: 110, depth: 'haze' },
  { x: 25, y: 83, mobileX: 22, mobileY: 88, width: 80, depth: 'haze' },
  { x: 55, y: 43, mobileX: 56, mobileY: 40, width: 120, depth: 'haze' },
  { x: 13, y: 62, mobileX: 6, mobileY: 62, width: 100, depth: 'haze' },
  { x: 82, y: 79, mobileX: 85, mobileY: 81, width: 125, depth: 'haze' },
  { x: 3, y: 21, mobileX: -12, mobileY: 19, width: 145, depth: 'middle' },
  { x: 73, y: 72, mobileX: 70, mobileY: 74, width: 200, depth: 'middle' },
];
// Low-motion coverage stays in its zone when the original moving clouds drift right.
// Each responsive subset includes anchors on both edges, with irregular clusters and open sky.
const coverageCounts: Record<Mode, { desktop: number; tablet: number; mobile: number }> = {
  rich: { desktop: 10, tablet: 5, mobile: 3 },
  store: { desktop: 8, tablet: 5, mobile: 3 },
  standard: { desktop: 7, tablet: 5, mobile: 3 },
  product: { desktop: 4, tablet: 3, mobile: 2 },
  transaction: { desktop: 4, tablet: 3, mobile: 2 },
};
const coverageClouds: CloudPlacement[] = [
  { x: 2, y: 34, mobileX: -6, mobileY: 42, tabletX: -2, tabletY: 38, width: 155, depth: 'haze', coverage: 'anchor', desktopTravel: 0, mobileTravel: 0, tabletTravel: 0, opacity: .34 },
  { x: 4, y: 79, mobileX: -8, mobileY: 78, tabletX: 1, tabletY: 80, width: 120, depth: 'far', coverage: 'distant', desktopTravel: 64, mobileTravel: 18, tabletTravel: 30 },
  { x: 81, y: 69, mobileX: 77, mobileY: 73, tabletX: 83, tabletY: 64, width: 170, depth: 'haze', coverage: 'anchor', desktopTravel: 18, mobileTravel: 6, tabletTravel: 10, opacity: .3 },
  { x: 19, y: 49, mobileX: 8, mobileY: 58, tabletX: 15, tabletY: 51, width: 95, depth: 'far', coverage: 'distant', desktopTravel: 86, mobileTravel: 22, tabletTravel: 40 },
  { x: 5, y: 94, mobileX: -4, mobileY: 91, tabletX: 2, tabletY: 93, width: 180, depth: 'haze', coverage: 'anchor', desktopTravel: 12, mobileTravel: 4, tabletTravel: 8, opacity: .32 },
  { x: 59, y: 87, mobileX: 64, mobileY: 86, width: 100, depth: 'far', coverage: 'distant', desktopTravel: 72, mobileTravel: 18, tabletTravel: 32 },
  { x: -10, y: 64, mobileX: -18, mobileY: 64, width: 190, depth: 'middle', coverage: 'transition' },
  { x: 72, y: 10, mobileX: 79, mobileY: 15, width: 105, depth: 'haze', coverage: 'anchor', desktopTravel: 26, mobileTravel: 8, tabletTravel: 14, opacity: .26 },
  { x: -13, y: 23, mobileX: -20, mobileY: 25, width: 165, depth: 'middle', coverage: 'transition' },
  { x: -18, y: 86, mobileX: -22, mobileY: 87, width: 245, depth: 'foreground', coverage: 'transition' },
];
const assets = ['pastel-blush', 'pastel-blue', 'dream-cloud-01', 'dream-cloud-02', 'dream-cloud-03', 'dream-cloud-04', 'dream-cloud-05', 'dream-cloud-07', 'dream-cloud-08', 'dream-cloud-warm'];
const movement: Record<Depth, { desktop: number; mobile: number; y: number; scrub: number }> = {
  haze: { desktop: 40, mobile: 14, y: 4, scrub: .32 },
  far: { desktop: 220, mobile: 45, y: 10, scrub: .28 },
  middle: { desktop: 580, mobile: 105, y: 22, scrub: .22 },
  foreground: { desktop: 880, mobile: 150, y: 34, scrub: .2 },
};
function modeFor(path: string): Mode {
  if (path === '/' || path === '/about') return 'rich';
  if (path.startsWith('/shop') || path.startsWith('/collections')) return 'store';
  if (path.startsWith('/product/')) return 'product';
  if (/^\/(cart|checkout|account|orders|order-tracking|tracking)(\/|$)/.test(path)) return 'transaction';
  if (path === '/contact' || path === '/order-confirmation') return 'standard';
  return 'rich';
}

export function SoftHavenCloudBackground() {
  const pathname = usePathname();
  const mode = modeFor(pathname);
  const profile = profiles[mode];
  const base = baseCounts[mode];
  const coverage = coverageCounts[mode];
  const skyRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    const sky = skyRef.current;
    if (!sky) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({ mobile: '(max-width: 767px)', tablet: '(min-width: 768px) and (max-width: 1100px)', desktop: '(min-width: 1101px)', reduce: '(prefers-reduced-motion: reduce)' }, match => {
        if (match.conditions?.reduce) return;
        const mobile = Boolean(match.conditions?.mobile);
        const factor = match.conditions?.tablet ? .35 : 1;
        // One context owns the four depths; each gets appropriate smoothing without another RAF loop.
        const timelines = new Map<Depth, gsap.core.Timeline>();
        sky.querySelectorAll<HTMLElement>('[data-cloud-depth]').forEach((cloud, index) => {
          if (getComputedStyle(cloud).display === 'none') return;
          const depth = cloud.dataset.cloudDepth as Depth;
          const settings = movement[depth];
          const variation = .8 + (index % 4) * .06;
          const configuredTravel = mobile ? cloud.dataset.mobileTravel : match.conditions?.tablet ? cloud.dataset.tabletTravel : cloud.dataset.desktopTravel;
          const travel = configuredTravel === undefined
            ? (mobile ? settings.mobile : settings.desktop) * factor * profile.motion * variation
            : Number(configuredTravel);
          // A static anchor needs no tween or compositor work.
          if (travel === 0) return;
          let timeline = timelines.get(depth);
          if (!timeline) {
            timeline = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: {
              id: `softhaven-atmosphere-${depth}`, trigger: document.documentElement, start: 'top top',
              end: () => `+=${Math.max(1, ScrollTrigger.maxScroll(window))}`,
              scrub: mobile ? Math.max(.18, settings.scrub - .04) : settings.scrub,
              invalidateOnRefresh: true,
            } });
            timelines.set(depth, timeline);
          }
          timeline.to(cloud, {
            x: travel,
            y: settings.y * (index % 2 ? 1 : -1) * (mobile ? .4 : factor),
            ...(depth === 'foreground' ? { scale: 1.025 } : {}), duration: 1,
          }, 0);
        });
        const editorialImage = mobile ? null : document.querySelector<HTMLElement>('[data-sky-editorial-image]');
        if (editorialImage) gsap.to(editorialImage, { y: 26, ease: 'none', scrollTrigger: { trigger: editorialImage.parentElement, start: 'top bottom', end: 'bottom top', scrub: .6 } });
      });
    }, sky);
    let disposed = false;
    let frame = 0;
    let height = document.documentElement.scrollHeight;
    const refresh = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { if (!disposed) ScrollTrigger.refresh(); }); };
    const page = sky.parentElement;
    const observer = new ResizeObserver(() => {
      const next = document.documentElement.scrollHeight;
      if (next !== height) { height = next; refresh(); }
    });
    if (page) observer.observe(page);
    page?.addEventListener('load', refresh, true);
    void document.fonts.ready.then(() => { if (!disposed) refresh(); });
    refresh();
    return () => {
      disposed = true; cancelAnimationFrame(frame); observer.disconnect();
      page?.removeEventListener('load', refresh, true); media.revert(); context.revert();
    };
  }, [pathname, profile]);
  if (pathname.startsWith('/admin')) return null;
  return <div ref={skyRef} className="sh-atmosphere" data-atmosphere={mode} aria-hidden="true">
    <div className="sh-atmosphere__colour" />
    {[...placements.slice(0, base.desktop), ...satellites.slice(0, profile.desktop - base.desktop), ...coverageClouds.slice(0, coverage.desktop)].map((cloud, index) => {
      const satelliteIndex = index - base.desktop;
      const coverageIndex = index - profile.desktop;
      const mobileVisible = coverageIndex >= 0 ? coverageIndex < coverage.mobile : index < base.mobile || (satelliteIndex >= 0 && satelliteIndex < profile.mobile - base.mobile);
      const tabletVisible = coverageIndex >= 0 ? coverageIndex < coverage.tablet : index < base.tablet || (satelliteIndex >= 0 && satelliteIndex < profile.tablet - base.tablet);
      const routeVariation = pathname === '/about' ? 3 : pathname === '/collections' ? 1 : 0;
      const asset = assets[(index + profile.variant * 2 + routeVariation) % assets.length];
      const directory = 'v2';
      const style = {
        '--cloud-x': `${mode === 'transaction' && cloud.depth !== 'far' && cloud.depth !== 'haze' ? (index % 2 ? 89 : -10) : cloud.x}%`, '--cloud-y': `${cloud.y}%`,
        '--cloud-mobile-x': `${mode === 'transaction' && cloud.depth !== 'far' && cloud.depth !== 'haze' ? (index % 2 ? 87 : -25) : cloud.mobileX}%`, '--cloud-mobile-y': `${cloud.mobileY}%`,
        '--cloud-tablet-x': `${cloud.tabletX ?? cloud.x}%`, '--cloud-tablet-y': `${cloud.tabletY ?? cloud.y}%`,
        ...(cloud.opacity === undefined ? {} : { opacity: cloud.opacity }),
        '--cloud-flip': satelliteIndex >= 0 && satelliteIndex % 2 ? '-1' : '1', '--cloud-width': `${cloud.width}px`, '--cloud-mobile-width': `${Math.round(cloud.width * .58)}px`,
      } as CSSProperties;
      return <span key={index} className={`sh-atmosphere__cloud sh-atmosphere__cloud--${cloud.depth}${!mobileVisible ? ' sh-atmosphere__cloud--desktop' : ''}${!tabletVisible ? ' sh-atmosphere__cloud--wide' : ''}`} data-cloud-depth={cloud.depth} data-cloud-coverage={cloud.coverage} data-desktop-travel={cloud.desktopTravel} data-mobile-travel={cloud.mobileTravel} data-tablet-travel={cloud.tabletTravel} style={style}>
        <picture><source media="(max-width: 767px)" srcSet={`/assets/clouds/${directory}/${asset}-mobile.webp`} /><img src={`/assets/clouds/${directory}/${asset}.webp`} alt="" loading="lazy" decoding="async" width="640" height="320" /></picture>
      </span>;
    })}
  </div>;
}
