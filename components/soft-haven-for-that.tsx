'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const labels = [
  { className: 'birthday', icon: 'gift', title: 'Birthday', detail: 'Surprise' },
  { className: 'because', icon: 'heart', title: 'Just', detail: 'Because' },
  { className: 'hug', icon: 'sparkle', title: 'A Comforting', detail: 'Hug' },
];

function LabelIcon({ icon }: { icon: string }) {
  if (icon === 'gift') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16v10H4zM12 10v10M3 6h18v4H3zM8.3 6C6.8 6 6 5.1 6 4.1 6 3 6.8 2.3 7.9 2.3c1.7 0 3.2 2 4.1 3.7C12.9 4.3 14.4 2.3 16.1 2.3 17.2 2.3 18 3 18 4.1 18 5.1 17.2 6 15.7 6" /></svg>;
  if (icon === 'heart') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 8.2c0 5.7-8.8 11.1-8.8 11.1S3.2 13.9 3.2 8.2A4.5 4.5 0 0 1 12 6.8a4.5 4.5 0 0 1 8.8 1.4Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Zm7.2 13.1.8 2.9 2.9.8-2.9.8-.8 2.9-.8-2.9-2.9-.8 2.9-.8.8-2.9Z" /></svg>;
}

export function SoftHavenForThat() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.to('[data-moment-parallax="far"]', { y: -18, ease: 'none', scrollTrigger: { trigger: node, start: 'top bottom', end: 'bottom top', scrub: 0.7 } });
      gsap.to('[data-moment-parallax="mid"]', { y: -32, ease: 'none', scrollTrigger: { trigger: node, start: 'top bottom', end: 'bottom top', scrub: 0.7 } });
      gsap.to('[data-moment-parallax="near"]', { y: -48, ease: 'none', scrollTrigger: { trigger: node, start: 'top bottom', end: 'bottom top', scrub: 0.7 } });
    }, node);
    return () => context.revert();
  }, []);

  return (
    <section ref={ref} className="softhaven-moment" aria-labelledby="softhaven-moment-title">
      <div className="softhaven-moment__atmosphere" aria-hidden="true" />
      <div className="softhaven-moment__distant-cloud softhaven-moment__distant-cloud--left" data-moment-parallax="far" aria-hidden="true" />
      <div className="softhaven-moment__distant-cloud softhaven-moment__distant-cloud--middle" data-moment-parallax="far" aria-hidden="true" />
      <div className="softhaven-moment__distant-cloud softhaven-moment__distant-cloud--right" data-moment-parallax="far" aria-hidden="true" />
      <div className="softhaven-moment__content">
        <div className="softhaven-moment__copy">
          <span className="softhaven-moment__eyebrow">WHATEVER THE MOMENT <i aria-hidden="true" /></span>
          <h2 id="softhaven-moment-title"><span>There&apos;s a SoftHaven</span><em>For That.</em></h2>
          <p>Big celebrations, little surprises, comforting hugs<br className="softhaven-moment__desktop-break" /> or simply because — find a companion made<br className="softhaven-moment__desktop-break" /> for the moment.</p>
          <Link className="softhaven-moment__cta" href="/shop"><span>Find Your Perfect Match</span><b aria-hidden="true">→</b></Link>
        </div>
        <div className="softhaven-moment__world" aria-label="SoftHaven plush companions nestled in clouds">
          <div className="softhaven-moment__cloud softhaven-moment__cloud--middle" data-moment-parallax="mid" aria-hidden="true" />
          <Image className="softhaven-moment__plush" data-moment-parallax="mid" src="/assets/collections/softhaven-plush-cloud-world.webp" alt="A teddy bear, giraffe, lion, unicorn, rabbits, puppy, koala and hedgehog resting in pastel clouds" width={1672} height={940} sizes="(max-width: 767px) 112vw, (max-width: 1100px) 65vw, 62vw" unoptimized priority />
          <div className="softhaven-moment__cloud softhaven-moment__cloud--foreground" data-moment-parallax="near" aria-hidden="true" />
          <div className="softhaven-moment__heart-cloud" aria-hidden="true"><span /><span /><span /></div>
          <svg className="softhaven-moment__strokes" viewBox="0 0 760 560" fill="none" aria-hidden="true">
            <path d="M141 164c-27 8-29 34-9 39 25 6 27-22 7-20-25 3-12 34 22 35 22 1 34-10 42-23" />
            <path d="M600 144c20 9 22 29 9 38m-13-15c8 9 20 8 29-1" />
            <path d="M585 393c29 0 41-20 28-34-13-13-34 2-19 17 13 13 39 5 52-14" />
            <path d="M221 416c-12 11-2 26 13 24 14-1 16-17 5-21-16-5-20 16 1 28" />
          </svg>
          <div className="softhaven-moment__sparkle softhaven-moment__sparkle--one" aria-hidden="true">✧</div>
          <div className="softhaven-moment__sparkle softhaven-moment__sparkle--two" aria-hidden="true">✦</div>
          {labels.map((label) => (
            <div className={`softhaven-moment__label softhaven-moment__label--${label.className}`} key={label.className}>
              <span className="softhaven-moment__label-icon"><LabelIcon icon={label.icon} /></span>
              <span><strong>{label.title}</strong><small>{label.detail}</small></span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
