'use client';

import { useEffect, useRef, type CSSProperties } from 'react';

type CloudDepth = 'far' | 'middle' | 'near' | 'wisps';

type CloudDefinition = {
  id: string;
  depth: CloudDepth;
  className: string;
  width: string;
  height: string;
  opacity: string;
  blur: string;
  scale: string;
  duration: string;
  delay: string;
  mobileHidden?: boolean;
};

const clouds: CloudDefinition[] = [
  { id: 'far-left', depth: 'far', className: 'soft-sky__cloud--far-left', width: '30vw', height: '14vw', opacity: '.28', blur: '28px', scale: '1.35', duration: '42s', delay: '-16s' },
  { id: 'far-center', depth: 'far', className: 'soft-sky__cloud--far-center', width: '35vw', height: '16vw', opacity: '.22', blur: '34px', scale: '1.15', duration: '48s', delay: '-29s' },
  { id: 'far-right', depth: 'far', className: 'soft-sky__cloud--far-right', width: '28vw', height: '13vw', opacity: '.24', blur: '30px', scale: '1.25', duration: '39s', delay: '-8s' },
  { id: 'middle-left', depth: 'middle', className: 'soft-sky__cloud--middle-left', width: '24vw', height: '11vw', opacity: '.44', blur: '13px', scale: '1', duration: '34s', delay: '-13s' },
  { id: 'middle-right', depth: 'middle', className: 'soft-sky__cloud--middle-right', width: '27vw', height: '12vw', opacity: '.4', blur: '15px', scale: '1.08', duration: '37s', delay: '-25s' },
  { id: 'middle-lower', depth: 'middle', className: 'soft-sky__cloud--middle-lower', width: '22vw', height: '10vw', opacity: '.3', blur: '14px', scale: '.9', duration: '31s', delay: '-4s', mobileHidden: true },
  { id: 'middle-top', depth: 'middle', className: 'soft-sky__cloud--middle-top', width: '19vw', height: '9vw', opacity: '.3', blur: '16px', scale: '.85', duration: '29s', delay: '-20s', mobileHidden: true },
  { id: 'near-left', depth: 'near', className: 'soft-sky__cloud--near-left', width: '18vw', height: '9vw', opacity: '.5', blur: '7px', scale: '.92', duration: '27s', delay: '-9s' },
  { id: 'near-right', depth: 'near', className: 'soft-sky__cloud--near-right', width: '20vw', height: '9vw', opacity: '.46', blur: '8px', scale: '1.02', duration: '32s', delay: '-22s' },
  { id: 'near-bottom', depth: 'near', className: 'soft-sky__cloud--near-bottom', width: '16vw', height: '8vw', opacity: '.34', blur: '10px', scale: '.88', duration: '24s', delay: '-5s', mobileHidden: true },
  { id: 'wisp-left', depth: 'wisps', className: 'soft-sky__cloud--wisp-left', width: '20vw', height: '5vw', opacity: '.2', blur: '12px', scale: '1', duration: '23s', delay: '-18s', mobileHidden: true },
  { id: 'wisp-right', depth: 'wisps', className: 'soft-sky__cloud--wisp-right', width: '16vw', height: '5vw', opacity: '.18', blur: '13px', scale: '.8', duration: '26s', delay: '-11s', mobileHidden: true },
];

const cssVars = (cloud: CloudDefinition) => ({
  '--cloud-width': cloud.width,
  '--cloud-height': cloud.height,
  '--cloud-opacity': cloud.opacity,
  '--cloud-blur': cloud.blur,
  '--cloud-scale': cloud.scale,
  '--cloud-duration': cloud.duration,
  '--cloud-delay': cloud.delay,
} as CSSProperties);

export function SoftHavenCloudBackground() {
  const skyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sky = skyRef.current;
    if (!sky) return;

    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const setScrollVariables = () => {
      frame = 0;
      if (motionPreference.matches) return;

      const scrollY = window.scrollY;
      const travel = window.innerWidth < 768 ? 0.72 : 1;
      sky.style.setProperty('--sky-far-y', `${scrollY * -0.07 * travel}px`);
      sky.style.setProperty('--sky-middle-y', `${scrollY * -0.14 * travel}px`);
      sky.style.setProperty('--sky-near-y', `${scrollY * -0.22 * travel}px`);
      sky.style.setProperty('--sky-wisp-y', `${scrollY * -0.1 * travel}px`);
      sky.style.setProperty('--sky-far-x', `${Math.sin(scrollY / 760) * 12 * travel}px`);
      sky.style.setProperty('--sky-middle-x', `${Math.sin(scrollY / 520 + 1.2) * 24 * travel}px`);
      sky.style.setProperty('--sky-near-x', `${Math.cos(scrollY / 380 + 0.8) * 36 * travel}px`);
      sky.style.setProperty('--sky-wisp-x', `${Math.sin(scrollY / 610 + 2.8) * 20 * travel}px`);
    };

    const onScroll = () => {
      if (motionPreference.matches || frame) return;
      frame = window.requestAnimationFrame(setScrollVariables);
    };

    const onMotionPreferenceChange = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      if (motionPreference.matches) {
        sky.style.setProperty('--sky-far-y', '0px');
        sky.style.setProperty('--sky-middle-y', '0px');
        sky.style.setProperty('--sky-near-y', '0px');
        sky.style.setProperty('--sky-wisp-y', '0px');
        sky.style.setProperty('--sky-far-x', '0px');
        sky.style.setProperty('--sky-middle-x', '0px');
        sky.style.setProperty('--sky-near-x', '0px');
        sky.style.setProperty('--sky-wisp-x', '0px');
      } else {
        setScrollVariables();
      }
    };

    setScrollVariables();
    window.addEventListener('scroll', onScroll, { passive: true });
    motionPreference.addEventListener('change', onMotionPreferenceChange);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      motionPreference.removeEventListener('change', onMotionPreferenceChange);
    };
  }, []);

  return (
    <div ref={skyRef} className="soft-sky" aria-hidden="true">
      <div className="soft-sky__wash" />
      {(Object.keys({ far: true, middle: true, near: true, wisps: true }) as CloudDepth[]).map((depth) => (
        <div className={`soft-sky__layer soft-sky__layer--${depth}`} key={depth}>
          {clouds.filter((cloud) => cloud.depth === depth).map((cloud) => (
            <div className={`soft-sky__cloud ${cloud.className}${cloud.mobileHidden ? ' soft-sky__cloud--mobile-hidden' : ''}`} style={cssVars(cloud)} key={cloud.id}>
              <span className="soft-sky__cloud-shape" />
            </div>
          ))}
        </div>
      ))}
      <div className="soft-sky__center-light" />
    </div>
  );
}
