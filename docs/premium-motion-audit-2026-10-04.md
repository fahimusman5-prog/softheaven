# SoftHaven motion audit and implementation map

Baseline: canonical `main` at `dbea5251266656a4b43b305452b1cd53a60ea594`. The reference checkout contains unrelated historical changes, so implementation uses the canonical repository. No layouts, product records or pricing are being redesigned.

## Audit completed before implementation

Next.js 16 App Router, dynamic server catalogue, scoped CSS plus shared stylesheet overrides, existing GSAP/ScrollTrigger, Motion and homepage-only Lenis were inspected. The root Suspense and route loading boundaries use the existing real-wait SoftHaven loader. Catalogue/cart/wishlist providers sit outside route content. Account/checkout deliberately have their own frames; admin authorization is server-side.

Rendered baseline routes: home, collections, shop, a genuine product, About, Contact, cart, checkout, account, order details, order-confirmation and admin/products. Signed-out order routes redirect to account; admin renders sign-in. Baseline desktop had no page errors or document overflow. Authenticated customer/admin workflows need authorized sessions and remain a separate verification limit.

| Before | After (implementation map) | Why |
| --- | --- | --- |
| Shared cloud motion can travel hundreds of pixels on home | Far/mid/near layers use bounded 10–50px desktop travel and smaller mobile travel | Stable atmosphere and less compositing work |
| 16 shared desktop cloud images, including hidden route layers | Render only relevant layers; reuse a few medium edge accents; cap phone atmosphere at five clouds | More useful clouds without a large DOM or mobile downloads |
| Home/product/collections already own their entrances and carousel geometry | Preserve their owners; add restrained reveals only to About, Contact, shop intro, cart, account login and footer | Avoid duplicate animation ownership |
| Product card uses an ungated JS hover lift | Fine-pointer CSS lift/image scale plus interpolated image-link tilt (2/3 degree limits) | Touch-safe hover and restrained depth |
| Mobile menu supports Escape and scroll lock but lacks a focus loop | Focus transfer, loop and restoration; search/wishlist dismissal | Predictable keyboard and touch interaction |
| Search query is unbounded | Shared 120-character normalization at server page boundary and both inputs | Bound processing; preserve escaped React text |
| Existing loader threshold/exit are tied to real Suspense | Preserve artwork and threshold; verify overlapping fallback cleanup | No artificial wait or permanent overlay |
| Store controls have uneven feedback | Wishlist/count, quantity, swatch, payment-selection, form-focus and cart-removal feedback | Communicate real state changes |
| Lenis starts on tablets without checking pointer capability | Fine-pointer desktop only; phones/tablets use native scrolling | Reduce scroll interference |

## Security baseline

Inspected auth/reset/confirmation, newsletter, account, reviews, checkout, admin resources/business handlers and upload; shared stream/body limits, schemas, safe errors, same-origin checks, durable database budgets, nonce CSP and production headers. Server authorization/RLS remain the authority. Contact is a disclosed local preview with no send API; this pass will not claim that messages are delivered. Provider payments remain unconfigured. No new animation package or database policy change is planned.

## Completed implementation and validation

1. Full audit: all public routes, protected account/order routes, admin sign-in, App Router, CSS, GSAP, Lenis, loader, images, accessibility and server security reviewed before implementation.
2. Scroll effects: corrected desktop breakpoint conditions in existing HomeMotion and SectionReveal; added scoped route/footer reveals while retaining existing editorial and reel owners.
3. Hover: fine-pointer product surface lift of 4px, image scale 1.025, CTA lift/arrow response and icon feedback. Touch devices do not depend on hover.
4. Loader: retained the existing real Suspense loader, 160ms reveal threshold and 280ms exit. Shared locking shows one primary fallback and releases only after the last wait. Fast, slow and overlapping waits passed the local controlled Suspense harness; no artificial wait is shipped.
5. 3D: component-owned interpolated product-image tilt, maximum 2 degrees X/3 degrees Y, perspective 1200. Fine-pointer desktops only; reset and cleanup verified. Carousel geometry unchanged.
6. Entrances: restrained copy/image/card language extended to About, Contact, shop intro, cart, account login and footer. Essential content is visible by default. Ownership was corrected to prevent pre-hydration mutations.
7. Micro-interactions: wishlist/count, bag feedback, quantity/subtotal, cart row/final-item removal, payment selection and form focus. Mobile menu focus loop/Escape/restoration, search/wishlist dismissal and mutual exclusion verified. Saved-bag restoration now finishes before persistence writes, fixing StrictMode loss of stored lines.
8. Parallax: shared far/middle/near/foreground layers use bounded 10/24/40/50px desktop vertical travel, 4/8/12/14px mobile. Section cloud travel was bounded too. Transform owners remain separate; settled cloud matrices did not snap.
9. Clouds: two medium edge accents reuse existing optimized cloud art. Irrelevant route layers are omitted; shared phone sky uses at most five images, two on quieter public routes. No new assets/packages.
10. Mobile/tablet: all 14 requested widths checked; native phone/tablet scrolling, no pointer tilt, fewer clouds, cheaper fog/blur and larger control targets. Reduced motion removes parallax/tilt/ScrollTriggers/Lenis; touch and keyboard checks passed.
11. Performance: opacity/transform updates, quickTo interpolation, passive pointer/scroll listeners, scoped cleanup and reused responsive WebP assets. Repeated home/shop/About/collections visits produced stable trigger counts and zero disconnected trigger targets. Headless frame sampling is indicative, not a physical-phone performance certification.
12. Security review: auth/admin/ownership, all APIs, checkout, RLS/grants/storage/functions, secrets, durable quotas, CSP and headers. Detailed evidence: premium-motion-security-2026-10-04.md.
13. Security change: one shared 120-character search limit at input and server URL boundary, tested with long and literal HTML queries. Existing authorization, commerce pricing/stock logic, database policies and CSP preserved.
14. Manual security/actions: enable Supabase leaked-password protection; verify provider Auth/newsletter rate limits/CAPTCHA/WAF and SMTP; configure real shipping and supported merchant adapters. Contact remains a disclosed local preview.
15. Tests: full lint, typecheck, 21 unit tests and three unchanged live-database transaction regression suites passed; all database fixtures rolled back. 23 API guard cases plus four disabled-payment cases passed. Production browser matrix: 140 checks with zero document overflow, visible stuck loader, page error or console error. Checkout authenticated UI checks at all 14 widths used intercepted responses; quotes become stale after edits, disabled methods stay blocked, invalid coupon feedback works and duplicate submission produces one intercepted commit. This is not a real order/payment test.
16. Build: clean Next.js 16.3.8 Turbopack production build passed, with no QA route included. Fresh production rendering and interaction checks had no hydration or CSP violations.
17. Files: scoped source, test and these reports only. Generated next-env.d.ts, environment secrets, screenshots and QA scripts are excluded. The final Git diff is the authoritative changed-file list.
18. Commit SHA: recorded with the verified release in the final response.
19. Publication: authorized non-force publication to origin/main after validation; final response records the remote SHA and deployment status separately.
20. Remaining limits: authenticated customer/admin browser sessions, email delivery, merchant payment/refund and real purchase flow remain unverified. Current data has Celeste stock 10, other active variants 0 and no shipping rates; no store records were changed persistently.

Desktop geometry compared against baseline at 1280px: zero changes across home (13 measured targets), collections (5), About (4) and product page (4). Production screenshots were visually checked on desktop and mobile, including intact homepage image frames and transparent family composition.

