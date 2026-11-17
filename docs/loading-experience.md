# SoftHaven loading experience

The former plain “Loading SoftHaven…” screen was the root `app/loading.tsx` fallback. The root layout also awaited `getStorefront()` before that boundary could render. The async server-only `StorefrontContent` now contains exactly the existing catalogue fetch and providers, behind a server Suspense boundary. Both boundaries reuse `SoftHavenLoader`; neither controls navigation readiness or moves data fetching into the browser.

Account and admin route skeletons, checkout cart hydration, product image placeholders, reviews fetching, and admin resource skeletons remain scoped to their existing workflows. Authentication, authorization, redirects, mutations, CSP, and error boundaries are unchanged. The loader does not wait for images, fonts, analytics, or animations.

The fallback is hidden for 160ms. Suspense can replace it at any time, including before that threshold. After hydration a portal escapes the storefront stacking contexts. A revealed fallback temporarily preserves the scrollbar gutter, locks scrolling, and makes surrounding DOM inert; cleanup restores each original value immediately. A decorative, inert copy fades out for 280ms (100ms with reduced motion), then removes itself. A subsequent fallback cancels an older exit copy. No minimum duration, percentages, sequential stages, or pathname-triggered loader exist.

The artwork reuses two existing mobile cloud WebPs (about 40KB combined) and a 28KB derivative of the existing cream teddy/cloud asset. Labels and indicator are HTML; cloud/teddy drift and indeterminate shimmer are CSS, with GSAP used only for the exit. Reduced motion disables decorative movement.

## Verification

Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`. Browser verification must include:

- A real pending Suspense promise resolved before 160ms: no visible loader.
- A held required-data response: one opaque full-screen fallback, then immediate content availability and lock cleanup upon release.
- A rejected critical data response: existing error UI, no retained overlay.
- Fast client navigation: no visible loader frames.
- 320, 360, 375, 390, 393, 412, 430, 480, 768, 820, 1024, 1280, 1440, and 1920px: readable composition, no overflow; also reduced motion and short landscape screens.
- Existing homepage, shop, product, collections, cart, checkout, account, and admin routes, including signed-out protection; no hydration errors or CSP violations.

Network holds, failure injection, and any component test routes belong only in local QA. Never ship those fixtures or delays. SQL regression scripts and live authenticated purchases require the separate established database/customer-flow workflow; this presentational change does not modify those systems.
