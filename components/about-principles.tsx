'use client';

import { motion, useReducedMotion } from 'motion/react';
import styles from '@/app/about/about.module.css';

type Principle = {
  title: string;
  text: string;
  icon: 'heart' | 'sparkle' | 'gift';
};

const principles: Principle[] = [
  { title: 'Thoughtful Designs', text: 'Created with care for the little moments that make a day feel special.', icon: 'heart' },
  { title: 'Premium Quality', text: 'Selected with comfort, character and lasting enjoyment in mind.', icon: 'sparkle' },
  { title: 'More Than a Gift', text: 'A soft companion is a simple way to let someone know you care.', icon: 'gift' },
];

const cardTones: Record<Principle['icon'], string> = {
  heart: styles.principleCardHeart,
  sparkle: styles.principleCardSparkle,
  gift: styles.principleCardGift,
};
const iconTones: Record<Principle['icon'], string> = {
  heart: styles.iconHeart,
  sparkle: styles.iconSparkle,
  gift: styles.iconGift,
};

function PrincipleIcon({ name }: { name: Principle['icon'] }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth: 1.7,
  };

  if (name === 'heart') return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M20.8 8.8c0 5.4-8.8 10-8.8 10S3.2 14.2 3.2 8.8A4.7 4.7 0 0 1 12 6.1a4.7 4.7 0 0 1 8.8 2.7Z" /></svg>;
  if (name === 'sparkle') return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path {...common} d="M3 8h18v13H3zM2 4h20v4H2zM12 4v17M12 4c-1-3-6-4-6-1 0 2 3 2 6 1Zm0 0c1-3 6-4 6-1 0 2-3 2-6 1Z" /></svg>;
}

export function AboutPrinciples() {
  const reduceMotion = useReducedMotion();

  return (
    <section className={styles.principles} aria-labelledby="principles-title">
      <h2 className={`${styles.eyebrow} ${styles.principlesTitle}`} id="principles-title">What Makes Us Different</h2>
      <div className={styles.principleGrid}>
        {principles.map((item) => (
          <motion.article
            className={`${styles.principleCard} ${cardTones[item.icon]}`}
            key={item.title}
            whileHover={reduceMotion ? undefined : { y: -5, scale: 1.008 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className={`${styles.iconBubble} ${iconTones[item.icon]}`} aria-hidden="true">
              <PrincipleIcon name={item.icon} />
            </span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
