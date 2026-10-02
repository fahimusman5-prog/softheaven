# Curved collection film strip — local production verification

The new section sits between the approved editorial section and the approved benefits section. The page has six major sections, then the existing footer. The five approved sections retain their markup and styling.

The explorer consumes all active collections from the existing server storefront query. Collection names, descriptions, order, and links come from that data. Existing images are reused; known default teddy/bunny assets use the approved editorial photographs for this cover layout, and custom images from the collection editor take precedence. Existing puppy/kitty/fantasy assets cover missing images. No reference screenshot or newly generated imagery is used.

Implementation:
- `components/collections-film-strip.tsx`
- `components/collections-film-strip.module.css`
- One insertion in `app/collections/page.tsx`
- Page cloud direction adjusted in `components/collections-page-motion.tsx`

Each transform has one owner: track translation, card curve/depth, hover, and image parallax use separate wrappers. GSAP computes horizontal travel from measured card centres. The section is not pinned. Touch gestures, numbered controls, and keyboard focus also expose every collection. Reduced motion and no-JavaScript mode retain a native horizontal collection list. Decorative repeated neighbours are excluded from the accessibility order.

ESLint, TypeScript, production build, and Git whitespace validation pass.

`results.json` records production-build browser QA at all twelve requested viewport sizes plus 820px. Checks include all six real collection destinations (HTTP 200), scroll-driven exposure of every collection, direction/reversal, curve changes, center scale around 1.1, idle/refresh stability, touch swipes without vertical scroll hijacking, keyboard focus and outlines, hover, route history, Home/mobile navigation, refresh at mid-page, reduced motion, no-JavaScript fallback, images, removed content, and footer reachability.

Stability comparisons allow subpixel rounding differences after ScrollTrigger refresh; they reject position changes of one pixel or more and material scale/rotation changes.

Preview: http://127.0.0.1:3001/collections

GitHub and deployment configuration were not changed. No publication or deployment was performed.
