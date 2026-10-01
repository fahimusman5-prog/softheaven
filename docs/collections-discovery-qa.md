# Collections discovery verification

Verified 2026-10-01 against a local optimized production build on port 3016.

- Lint, TypeScript and production build pass.
- Rendered at 1920×1080, 1600×900, 1440×900, 1366×768, 1280×800, 1024×768, 768×1024, 430×932, 412×915, 390×844, 375×812 and 360×800. No horizontal overflow or broken campaign images. A clipped 1024px bunny card was corrected by stacking the tablet composition and retested.
- All three featured cards navigate to the correct live collection filter. All six directory destinations were clicked and their matching shop headings verified. Mobile bunny navigation passed.
- Explore all collections scrolls to the text directory. Cards are single accessible links; keyboard focus has a visible purple outline. Necessary information is always visible and whole cards provide large touch targets.
- Hovered all three desktop cards: approximately 6px lift, clipped image zoom, no grid movement or adjacent-card collision.
- Slow, fast and alternating down/up scrolls preserve zero horizontal overflow. Far/middle/near/foreground clouds travel left at distinct rates and reverse with scroll. All ambient cloud animations are disabled on this route. Two settled samples 1.1 seconds apart were identical.
- Reloading while scrolled preserved position and resumed matching cloud transforms. Collection navigation away and back passed. Responsive resizing passed.
- Browser console had no captured warnings or errors in the exercised flows.
- Reduced motion is enforced in GSAP matchMedia, Lenis setup and CSS; no animation starts in the reduced-motion branch. This branch was reviewed in source, not through browser media emulation.
- Campaign raster payload: 266 KB desktop / 125 KB mobile, with first image eager/high priority and lower cards lazy. Explicit dimensions and fixed aspect ratios reserve space.

Screenshots and viewport measurements are saved locally under `.qa/collections-discovery/`, including desktop-final.png and mobile-final.png. They are not application assets.

Existing data observation: the teddy filter renders the correct heading and products, while its configured browser SEO title currently reads Puppy Pals. This is existing catalog SEO data; it was preserved rather than changing database records during a layout repair.

Scope: Collections route composition, its CSS and motion component, original campaign assets, and route-specific shared-sky behavior. Homepage and other routes retain their existing sky behavior. Catalog/admin/payment/account systems were not modified.
