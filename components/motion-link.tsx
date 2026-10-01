'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import type { ComponentProps } from 'react';

const MotionLink = motion.create(Link);

type MotionLinkProps = Omit<ComponentProps<typeof MotionLink>, 'whileHover' | 'whileTap' | 'transition'> & {
  lift?: boolean;
};

export function SoftMotionLink({ children, lift = false, ...props }: MotionLinkProps) {
  const reduceMotion = useReducedMotion();

  return (
    <MotionLink
      {...props}
      whileHover={reduceMotion ? undefined : lift ? { y: -5 } : { opacity: 0.88 }}
      whileTap={reduceMotion ? undefined : { opacity: 0.78 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionLink>
  );
}
