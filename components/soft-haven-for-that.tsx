'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import styles from '@/app/collections/soft-haven-for-that.module.css';

function GiftIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 9.5h15v10h-15zM3.5 6.5h17v3h-17zM12 6.5v13M12 6.2C10.5 3.6 8.9 3 7.8 3.7c-1.1.8-.5 2.8 1 2.8H12Zm0 0c1.5-2.6 3.1-3.2 4.2-2.5 1.1.8.5 2.8-1 2.8H12Z" /></svg>;
}

function HeartIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.6 5.8c-1.8-1.9-4.8-1.9-6.7 0L12 7.7l-1.9-1.9a4.6 4.6 0 0 0-6.7 0 5 5 0 0 0 0 6.9L12 21l8.6-8.3a5 5 0 0 0 0-6.9Z" /></svg>;
}

function SparkleIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c.7 4.7 3.3 7.3 8 8-4.7.7-7.3 3.3-8 8-.7-4.7-3.3-7.3-8-8 4.7-.7 7.3-3.3 8-8Z" /></svg>;
}

function Cloud({ src, className, sizes, depth }: { src: string; className: string; sizes: string; depth: string }) {
  return (
    <div className={`${styles.cloudLayer} ${className}`} data-cloud-parallax={depth} aria-hidden="true">
      <div className={styles.cloudDrift} data-cloud-drift>
        <Image src={src} alt="" fill sizes={sizes} quality={82} />
      </div>
    </div>
  );
}

export function SoftHavenForThat() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add(
        {
          desktop: '(min-width: 1101px)',
          tablet: '(min-width: 768px) and (max-width: 1100px)',
          mobile: '(max-width: 767px)',
          reduce: '(prefers-reduced-motion: reduce)',
        },
        (match) => {
          if (match.conditions?.reduce) return;

          const mobile = Boolean(match.conditions?.mobile);
          const tablet = Boolean(match.conditions?.tablet);
          const trigger = { trigger: section, start: 'top 82%', once: true };

          ScrollTrigger.create({
            ...trigger,
            onEnter: () => {
              const copy = gsap.timeline();
              copy
                .fromTo('[data-moment-eyebrow]', { y: 18, opacity: 0.25 }, { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out', immediateRender: false })
                .fromTo('[data-moment-title]', { y: 35, opacity: 0.25 }, { y: 0, opacity: 1, duration: 0.82, ease: 'power3.out', immediateRender: false }, '-=.31')
                .fromTo('[data-moment-copy]', { y: 24, opacity: 0.25 }, { y: 0, opacity: 1, duration: 0.65, ease: 'power3.out', immediateRender: false }, '-=.43')
                .fromTo('[data-moment-cta]', { y: 20, opacity: 0.25 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', immediateRender: false }, '-=.38');

              const visual = gsap.timeline({ delay: 0.08 });
              visual
                .fromTo('[data-island-entrance]', { y: 30, scale: 0.97, opacity: 0.45 }, { y: 0, scale: 1, opacity: 1, duration: 1, ease: 'power3.out', immediateRender: false })
                .fromTo('[data-companion-entrance]', { y: mobile ? 22 : 36, opacity: 0.35 }, { y: 0, opacity: 1, duration: 0.84, stagger: 0.09, ease: 'power3.out', immediateRender: false }, '-=.7')
                .fromTo('[data-callout-entrance]', { y: 15, scale: 0.97, opacity: 0.3 }, { y: 0, scale: 1, opacity: 1, duration: 0.58, stagger: 0.1, ease: 'power3.out', immediateRender: false }, '-=.32');
            },
          });

          const distances = mobile
            ? { far: -12, mid: -20, near: -30 }
            : tablet
              ? { far: -18, mid: -36, near: -54 }
              : { far: -30, mid: -56, near: -78 };

          (['far', 'mid', 'near'] as const).forEach((depth) => {
            section.querySelectorAll<HTMLElement>(`[data-cloud-parallax="${depth}"]`).forEach((layer, index) => {
              gsap.to(layer, {
                y: distances[depth] * (index === 0 ? 1 : 0.76),
                ease: 'none',
                scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: mobile ? 0.6 : 0.9 },
              });
            });
          });

          if (!mobile) {
            section.querySelectorAll<HTMLElement>('[data-cloud-drift]').forEach((cloud, index) => {
              gsap.to(cloud, { y: index % 2 ? -3 : 3, duration: 6.5 + index * 0.4, ease: 'sine.inOut', repeat: -1, yoyo: true });
            });
            section.querySelectorAll<HTMLElement>('[data-callout-drift]').forEach((callout, index) => {
              gsap.to(callout, { y: index === 1 ? 5 : index === 2 ? 3 : 4, duration: index === 1 ? 7.2 : index === 2 ? 5.8 : 6.4, ease: 'sine.inOut', repeat: -1, yoyo: true });
            });
          }
        },
      );
    }, section);

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return (
    <section className={styles.section} ref={sectionRef} aria-labelledby="moment-campaign-title">
      <div className={styles.atmosphere} aria-hidden="true" />
      <div className={styles.inner}>
        <div className={styles.copy}>
          <div className={styles.eyebrow} data-moment-eyebrow><span>Whatever the moment</span><i aria-hidden="true" /></div>
          <h2 id="moment-campaign-title" data-moment-title><span>There’s a SoftHaven</span><em>For That.</em></h2>
          <p data-moment-copy>Big celebrations, little surprises, comforting hugs<br className={styles.desktopBreak} /> or simply because — find a companion made<br className={styles.desktopBreak} /> for the moment.</p>
          <Link className={styles.cta} href="/shop" data-moment-cta><span>Find Your Perfect Match</span><span className={styles.ctaArrow} aria-hidden="true">→</span></Link>
        </div>

        <div className={styles.visual} role="group" aria-label="SoftHaven plush companions gathered together among soft clouds">
          <Cloud src="/assets/clouds/soft-cloud-distant.webp" className={styles.cloudFar} sizes="(max-width: 767px) 90vw, 46vw" depth="far" />
          <Cloud src="/assets/clouds/soft-cloud-cluster.webp" className={styles.cloudMid} sizes="(max-width: 767px) 86vw, 43vw" depth="mid" />
          <div className={styles.island} data-island-entrance>
            <div className={styles.companionScene} data-companion-entrance>
              <Image src="/images/collections/teddy-classic-cuddles.webp" alt="A teddy, puppy, elephant, and kitten nestled together among SoftHaven clouds" fill sizes="(max-width: 767px) 112vw, (max-width: 1100px) 78vw, 50vw" quality={86} />
            </div>
            <Cloud src="/assets/clouds/soft-cloud-bank.webp" className={styles.cloudNear} sizes="(max-width: 767px) 100vw, 52vw" depth="near" />
            <Cloud src="/assets/clouds/cloud-wisp.webp" className={styles.cloudWisp} sizes="(max-width: 767px) 70vw, 33vw" depth="near" />
          </div>

          <svg className={styles.connectors} viewBox="0 0 760 560" aria-hidden="true">
            <path d="M145 129c34 7 54 26 68 57" /><path d="M614 149c-27 6-45 25-56 50" /><path d="M615 413c-25-7-44-20-60-42" />
          </svg>

          <div className={`${styles.callout} ${styles.birthday}`} data-callout-entrance><div data-callout-drift><span className={`${styles.calloutIcon} ${styles.gift}`}><GiftIcon /></span><span>Birthday<br />Surprise</span></div></div>
          <div className={`${styles.callout} ${styles.because}`} data-callout-entrance><div data-callout-drift><span className={`${styles.calloutIcon} ${styles.love}`}><HeartIcon /></span><span>Just<br />Because</span></div></div>
          <div className={`${styles.callout} ${styles.comfort}`} data-callout-entrance><div data-callout-drift><span className={`${styles.calloutIcon} ${styles.comfortIcon}`}><SparkleIcon /></span><span>A Comforting<br />Hug</span></div></div>

          <span className={`${styles.sparkle} ${styles.sparkleOne}`} aria-hidden="true">✦</span>
          <span className={`${styles.sparkle} ${styles.sparkleTwo}`} aria-hidden="true">✧</span>
          <svg className={styles.heart} viewBox="0 0 24 24" aria-hidden="true"><path d="M20 5.8c-1.6-1.7-4.3-1.7-6 0l-2 2-2-2a4.1 4.1 0 0 0-6 0 4.5 4.5 0 0 0 0 6.2l8 7.7 8-7.7a4.5 4.5 0 0 0 0-6.2Z" /></svg>
        </div>
      </div>
    </section>
  );
}
