'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const features = [
  { number: '01', tone: 'rose', title: <>Thoughtfully<br />Selected</>, copy: <>Carefully chosen<br />companions with<br />personality and charm.</>, icon: 'heart' },
  { number: '02', tone: 'lilac', title: <>Made for<br />Meaningful Moments</>, copy: <>For celebrations,<br />thoughtful gifts and<br />everyday comfort.</>, icon: 'sparkle' },
  { number: '03', tone: 'blue', title: <>Gifting,<br />Made Softer</>, copy: <>A little companion<br />for moments worth<br />remembering.</>, icon: 'gift' },
] as const;

function FeatureIcon({ type }: { type: (typeof features)[number]['icon'] }) {
  if (type === 'heart') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20S4 15.1 4 9.4C4 6.8 5.9 5 8.4 5c1.5 0 2.9.8 3.6 2 1-1.5 3-2.2 4.7-1.8 2 .5 3.3 2.3 3.3 4.4C20 15.1 12 20 12 20Z" /></svg>;
  if (type === 'sparkle') return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c.5 5.4 3 7.9 8 8.5-5 .5-7.5 3-8 8.5C11.5 15 9 12 4 11.5 9 11 11.5 8.5 12 3Z" /><path d="M18.2 3.5c.2 2.1 1.2 3.1 3.3 3.3-2.1.2-3.1 1.2-3.3 3.3-.2-2.1-1.2-3.1-3.3-3.3 2.1-.2 3.1-1.2 3.3-3.3Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 10.2h15v9.3h-15zM3.5 7.2h17v3h-17zM12 7.2v12.3M12 7.2c-2.8 0-4.3-1.1-4.3-2.4 0-1 1-1.7 2-1.2C11.1 4.1 12 7.2 12 7.2Zm0 0c2.8 0 4.3-1.1 4.3-2.4 0-1-1-1.7-2-1.2C12.9 4.1 12 7.2 12 7.2Z" /></svg>;
}

export function SoftHavenForThat() {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !sectionRef.current) return;
    gsap.registerPlugin(ScrollTrigger);
    const context = gsap.context(() => {
      gsap.to('[data-cloud="far"]', { y: -30, ease: 'none', scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('[data-cloud="near"]', { y: -58, ease: 'none', scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true } });
      gsap.to('[data-teddy]', { y: -15, ease: 'none', scrollTrigger: { trigger: sectionRef.current, start: 'top bottom', end: 'bottom top', scrub: true } });
    }, sectionRef);
    return () => context.revert();
  }, []);

  return <section className="softer-experience" ref={sectionRef} aria-labelledby="softer-experience-title">
    <div className="softer-experience__atmosphere" aria-hidden="true" />
    <div className="softer-experience__cloud softer-experience__cloud--top-left" data-cloud="far" aria-hidden="true" />
    <div className="softer-experience__cloud softer-experience__cloud--top-right" data-cloud="far" aria-hidden="true" />
    <div className="softer-experience__cloud softer-experience__cloud--mid" data-cloud="far" aria-hidden="true" />
    <div className="softer-experience__layout">
      <div className="softer-experience__intro">
        <span className="softer-experience__eyebrow">WHY CHOOSE SOFTHAVEN <i aria-hidden="true" /></span>
        <h2 id="softer-experience-title">A Softer<br /><em>Experience.</em></h2>
        <p>Thoughtfully chosen companions<br className="softer-experience__wide-break" /> for gifting, comforting and all the<br className="softer-experience__wide-break" /> little moments in between.</p>
      </div>
      <div className="softer-experience__features">
        {features.map((feature, index) => <article className={`softer-experience__feature softer-experience__feature--${feature.tone}`} key={feature.number}>
          <span className="softer-experience__number">{feature.number}</span><span className="softer-experience__icon"><FeatureIcon type={feature.icon} /></span><h3>{feature.title}</h3><i className="softer-experience__accent" aria-hidden="true" /><p>{feature.copy}</p>{index < features.length - 1 && <span className="softer-experience__divider" aria-hidden="true" />}
        </article>)}
      </div>
      <div className="softer-experience__teddy" data-teddy><svg className="softer-experience__heart" viewBox="0 0 78 61" fill="none" aria-hidden="true"><path d="M29 40C8 28 17 9 29 17c5 3 6 8 7 11 3-7 9-14 17-11 14 5 6 24-17 31-3-3-5-5-7-8Z" /><path d="M59 15c4 2 5 6 2 10M66 11l2-5M73 16l4 2M60 53c-9-4-5-13 1-8 2 1 2 3 2 5 1-3 4-5 7-3 4 3 1 9-7 10-1-1-2-2-3-4Z" /></svg><Image src="/assets/header-teddies.png" alt="" width={2172} height={724} sizes="(max-width: 767px) 88vw, (max-width: 1100px) 37vw, 26vw" className="softer-experience__teddy-image" /></div>
    </div>
    <div className="softer-experience__cloud-bank" data-cloud="near" aria-hidden="true"><span className="softer-experience__bank softer-experience__bank--left" /><span className="softer-experience__bank softer-experience__bank--middle" /><span className="softer-experience__bank softer-experience__bank--right" /></div>
  </section>;
}
