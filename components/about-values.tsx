'use client';

import { motion, useReducedMotion } from 'motion/react';

const values = [
  {
    title: 'Thoughtful Designs',
    description: 'A small edit of considered companions, chosen for their character, materiality, and ability to make a room feel warmer.',
    tone: 'blush',
    icon: 'heart',
  },
  {
    title: 'Premium Quality',
    description: 'From weighted cores to hand-finished details, every object is designed to be experienced in the hand, not just seen on a screen.',
    tone: 'lavender',
    icon: 'sparkle',
  },
  {
    title: 'More Than a Gift',
    description: 'Beautiful presentation, personal inscriptions, and global delivery make thoughtful gifting feel effortless.',
    tone: 'blue',
    icon: 'gift',
  },
] as const;

function ValueIcon({ name }: { name: (typeof values)[number]['icon'] }) {
  if (name === 'heart') {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20.8 8.7c0 5.1-8.8 10.1-8.8 10.1S3.2 13.8 3.2 8.7a4.4 4.4 0 0 1 8.8-.2 4.4 4.4 0 0 1 8.8.2Z" /></svg>;
  }

  if (name === 'sparkle') {
    return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m12 3 1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8L12 3Z" /><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z" /></svg>;
  }

  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 10h17v10.5h-17V10Z" /><path d="M2.5 6.5h19V10h-19V6.5ZM12 6.5v14M12 6.5H8.7a2.2 2.2 0 1 1 2.2-2.2c0 1.2 1.1 2.2 1.1 2.2Zm0 0h3.3a2.2 2.2 0 1 0-2.2-2.2c0 1.2-1.1 2.2-1.1 2.2Z" /></svg>;
}

export function AboutValues() {
  const reduceMotion = useReducedMotion();

  return (
    <section className="about-values" aria-labelledby="about-values-title">
      <h2 className="about-values__label" id="about-values-title">What Makes Us Different</h2>
      <div className="about-values__grid">
        {values.map((value) => (
          <motion.article
            key={value.title}
            className={`about-value about-value--${value.tone}`}
            whileHover={reduceMotion ? undefined : { y: -5, scale: 1.008 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="about-value__icon" aria-hidden="true"><ValueIcon name={value.icon} /></span>
            <h3>{value.title}</h3>
            <p>{value.description}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
