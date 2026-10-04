'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { AccountIcon } from '@/components/account/ui';
import { AdminIcon } from '@/components/admin/icons';
import styles from './soft-haven-loader.module.css';
import { acquireLoaderLock } from './loader-lock';

/** Mounted only by a real Suspense fallback. Never controls route readiness. */
export function SoftHavenLoader() {
  const ref = useRef<HTMLElement>(null);
  const [portal, setPortal] = useState<HTMLElement | null>(null);

  useEffect(() => { setPortal(document.body); }, []);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    // A new real wait supersedes any previous cosmetic exit copy.
    document.querySelectorAll<HTMLElement>('[data-softhaven-loader][data-loader-exit]').forEach(exit => {
      gsap.killTweensOf(exit);
      exit.remove();
    });
    let revealed = false;
    let release = () => true;
    // Reveal threshold only: resolving Suspense cancels this immediately.
    const threshold = window.setTimeout(() => {
      revealed = true;
      release = acquireLoaderLock(node);
    }, 160);

    return () => {
      window.clearTimeout(threshold);
      const lastWait = release();
      if (!revealed || !lastWait) return;
      node.removeAttribute('data-loader-secondary');
      // Suspense unmounts its fallback immediately. A short, noninteractive
      // visual copy fades above the ready page without retaining any locks.
      const exit = node.cloneNode(true) as HTMLElement;
      exit.setAttribute('aria-hidden', 'true');
      exit.removeAttribute('role');
      exit.removeAttribute('aria-live');
      exit.inert = true;
      exit.setAttribute('data-loader-exit', 'true');
      exit.classList.add(styles.exiting);
      document.body.appendChild(exit);
      gsap.fromTo(exit, { opacity: 1 }, {
        opacity: 0,
        duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.1 : 0.28,
        ease: 'power1.out',
        onComplete: () => exit.remove(),
      });
    };
  }, [portal]);

  const artwork = (
    <section ref={ref} className={styles.loader} role="status" aria-live="polite" aria-label="Loading SoftHaven" data-lenis-prevent data-softhaven-loader>
      <span className="sr-only">Loading SoftHaven</span>
      <div className={styles.sky} aria-hidden="true">
        {['distantLeft', 'distantRight', 'middleLeft', 'middleRight', 'foregroundLeft', 'foregroundRight'].map((position, index) => (
          <div className={`${styles.cloud} ${styles[position]}`} key={position}>
            <Image src={`/assets/clouds/generated/dream-cloud-0${index % 2 === 0 ? '2' : '4'}-mobile.webp`} alt="" width={420} height={280} unoptimized />
          </div>
        ))}
        <i className={styles.starOne}>✦</i><i className={styles.starTwo}>✦</i><i className={styles.starThree}>✦</i>
      </div>
      <div className={styles.content} aria-hidden="true">
        <div className={styles.companion}>
          <span className={styles.heartHalo}>♡</span>
          <Image className={styles.teddy} src="/assets/loading/teddy-cloud.webp" alt="" width={360} height={458} unoptimized />
          <span className={styles.heartLeft}>♡</span><span className={styles.heartRight}>♡</span>
        </div>
        <div className={styles.brand}>Soft<span>Haven</span><sup>♥</sup></div>
        <p className={styles.tagline}>A LITTLE SOFTER EVERYDAY</p>
        <div className={styles.divider}><span>♥</span></div>
        <p className={styles.message}>Something soft is on its way...</p>
        <div className={styles.track}><span className={styles.shimmer} /></div>
        <div className={styles.statuses}>
          <div><AdminIcon name="orders" /><span>Preparing<br />your experience</span></div>
          <div><AccountIcon name="heart" /><span>Almost<br />ready</span></div>
          <div><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><path d="M6 7C0 7 2 0 7 3l2 2h6l2-2c5-3 7 4 1 4a8 8 0 1 1-12 0Z" /><circle cx="9" cy="11" r=".7"/><circle cx="15" cy="11" r=".7"/><path d="m10 15 2 1 2-1M12 16v2" /></svg><span>Bringing<br />more happiness</span></div>
        </div>
      </div>
    </section>
  );
  // Escape the storefront's existing stacking contexts after hydration.
  // The server still streams real fallback HTML while the root data is pending.
  return portal ? createPortal(artwork, portal) : artwork;
}
