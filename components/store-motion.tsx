'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/** Route enhancements only. Existing hero, reel, product and account motion keep their own targets. */
export function StoreMotion({ children }: { children:ReactNode }) {
  const scope = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith('/admin')) return;
    const root = scope.current;
    if (!root) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    const context = gsap.context(() => {
      media.add({ reduce: '(prefers-reduced-motion: reduce)', mobile: '(max-width: 767px)', desktop: '(min-width: 768px)' }, match => {
        if (match.conditions?.reduce) return;
        const mobile = Boolean(match.conditions?.mobile);
        const selectors = pathname === '/shop' ? '.page-intro > *'
          : pathname === '/contact' ? '.contact-hero > *, .contact-panel'
          : pathname === '/cart' ? '.page-intro, .cart-empty, .cart-summary'
          : pathname.startsWith('/account') ? '.account-auth > *, .account-order-detail > h1'
          : '[data-store-reveal]';
        const targets = [...Array.from(root.querySelectorAll<HTMLElement>(selectors)), ...Array.from(root.querySelectorAll<HTMLElement>('.site-footer__column'))];
        targets.forEach((target, index) => {
          ScrollTrigger.create({ trigger: target, start: 'top 92%', once: true,
            onEnter: match.add(`storeReveal${index}`, () => {
              gsap.fromTo(target, { y: mobile ? 10 : 20, opacity: .72 }, {
                y: 0, opacity: 1, duration: mobile ? .5 : .8, delay: (index % 3) * (mobile ? .02 : .04),
                ease: 'power3.out', clearProps: 'transform,opacity',
              });
            }) as () => void,
          });
        });
      });

    }, root);
    return () => { media.revert(); context.revert(); };
  }, [pathname]);
  return <div ref={scope} className="soft-motion-scope">{children}</div>;
}
