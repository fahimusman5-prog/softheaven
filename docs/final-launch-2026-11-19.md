# SoftHaven final implementation and launch gate

Implementation date: 18 November 2026. Target public launch: 19 November 2026.

**Decision: RED / NO-GO.** The reviewed application is implemented, tested locally and published through the existing release PR. Public checkout must remain unavailable until the hosted schema, shipping, payment and notification gates are completed. A successful preview build is not an operational checkout.

## 1. Implementation summary

Continued the existing `codex/release-sync-2026-11-18` candidate and PR #8, preserving current main as an ancestor and all prior launch/payment work. No replacement site, new brand, database reset, force push, production merge or promotion was performed. The stack is Next.js 16.4.6 App Router, React 18.3.1, TypeScript 5.7.2, custom CSS and Motion/GSAP; no Tailwind rewrite was introduced.

The earlier reconciliation preserved newer main policies, atmosphere, account and loading work alongside the mobile header/carousel, two-method prepaid checkout, private receipts, durable Resend outbox, single-page product editor and approved free-delivery migration. This pass fixes additional source- and browser-confirmed defects rather than recreating those features.

Route audit: public home, Shop, Collections, product details, cart, account, About, Contact, four canonical legal pages, payment result and legacy order confirmation exist. Search and collection filtering use `/shop` query parameters; wishlist is an existing drawer/local state rather than an invented `/wishlist` page. Tracking belongs in authenticated order details rather than a fabricated public tracking route. Admin uses the protected catch-all console for dashboard, products/new/edit, categories, collections, inventory, orders, customers, reviews, newsletter, reports and settings. Unsupported routes retain 404 behavior.

## 2. Bugs fixed and defect register

| Priority | Defect | Resolution / state |
|---|---|---|
| P0 | Hosted backend lacks the required email/payment/receipt/free-shipping rollout | Confirmed read-only; remains blocked pending authorized, tested hosted migration/configuration |
| P0 | Real PayHere, bank approval, order/email journeys and authenticated admin persistence unverified | Do not activate public checkout; real isolated test environment/accounts and provider configuration required |
| P0 | Public domains serve the older main release; connector cannot inspect SoftHaven | Integrated candidate/PR retained; no silent production release; exact project/domain mapping and hosted verification remain required |
| P1 | Mobile shop search/sort retained two columns above 380px; inner input had a disconnected white surface | One full-width row per control through 767px; transparent flexible inner input within its glass field; no overflow-hiding substitute |
| P1 | Card price could differ from the variant actually added; price sorting could disagree with cards | Cards and sorting use the first offered active variant's price; invalid comparison prices hidden; deterministic ID tie-breaks and catalogue ordering |
| P1 | Unknown stock could show an Add to bag action; persisted inactive variants could remain in cart | Unknown/nonpositive stock is sold out; inactive variants are rejected during cart hydration/add; database stock validation remains authoritative |
| P1 | WhatsApp form required email but permitted missing phone | Separate WhatsApp schema requires phone and makes email optional; legacy retired email-service schema unchanged |
| P2 | Category pills lacked selected-state semantics; whitespace searches missed valid products | `aria-pressed`, bounded search input and trimmed matching; category/search/sort composition tested |
| P2 | Order details omitted stored delivery method/tracking and rendered zero delivery as a number | Display stored method, FREE for persisted zero shipping, and tracking/provider only when present; customer ownership filter retained |
| P2 | Nonproduction indexing and public sitemap behavior were incomplete | Nonproduction noindex metadata/headers/robots; production private routes noindex; sitemap includes only public routes and published products under approved production origin, excludes draft legal/private pages |
| P2 | Product cards depended on a third-party photo origin | Exact-source local WebP derivatives of the four currently published catalogue photos, original URLs retained as fallbacks; changed source URLs bypass old caches |
| P2 | Mobile LCP remains above target | Measured and disclosed; further performance work remains, no improvement claim based on compilation |

No customer/product/order/inventory records were changed by this pass. Cached photos are technical derivatives of current store photography, not new or substituted images. Exact URL mapping prevents a changed product photo from silently reverting to an old cached image.

## 3. Mobile optimisation

The existing compact liquid-glass header, undistorted logo, cloud identity, portrait carousel and CTA styling remain. The shop now has stacked phone search/sort, horizontally scrollable category pills with hidden decorative scrollbar and accessible selected state, readable variant-consistent prices, and correct sold-out/choice states. Existing responsive cart, checkout, product details, Contact, admin and footer work is preserved.

The broad Chrome run covers 18 routes × 13 widths = **234 cases**, including every required width and additional 393/480px checks. No horizontal overflow or page exceptions were recorded. Separate shop tests cover all 12 requested widths, search/reset/no-results/category/sorting/control geometry, and emulated Chrome touch carousel next/previous/pagination/pause. Actual loaded card photographs were verified and screenshots captured at 375/390/430/768/1440px; inspected phone and desktop renders show real photos rather than treating initial blank lazy-load surfaces as verification.

These are browser emulation results, not physical iPhone/Android certification. WebKit is tested over local HTTPS separately. Existing focus return, menu Escape/scroll lock and header search navigation remain covered.

## 4. Contact page

Preserved the existing concierge hero, approved teddy visual, glass form, policy-aware FAQ and CTA. Updated the four configured social cards to the requested copy. Only validated official destinations render; missing values never become `#` links or invented accounts.

The form requires name, phone, enquiry and message; email/order number are optional. It constructs a structured, safely encoded official `wa.me` handoff, omits an absent email, explains that the customer must send the message in WhatsApp and never claims delivery. It does not call a separate contact-email API. Schema/unit tests cover valid, invalid and missing destination cases; browser tests confirm optional email/required phone and safe disabled state without a configured number.

Read-only public settings currently contain no support email, phone, WhatsApp, Facebook, Instagram or TikTok destination. Existing environment overrides remain available, but their hosted presence cannot be verified without the correct project access. The business asked to supply these later; they remain blank. Actual contact-channel activation and a real cross-device WhatsApp handoff are therefore outstanding.

## 5. Admin product editor

Preserved one continuous form: Basic Product Information → Product Images → Colours & Variants → Pricing → Inventory → Categories & Collections → SEO → Publishing. Existing image upload, variants, inventory ledger, validation, draft/publish and stable-ID paths remain.

The browser component test uses explicitly simulated API transport: eight ordered sections, automatic handle, draft save, stable edit ID, incomplete publish rejection and desktop/mobile rendering pass. Isolated database tests cover admin permissions/operations. Real authenticated image storage, create/edit/save/reload/publish persistence and storefront publication have **not** been certified against a suitable hosted test environment. No production products were created or edited to manufacture that evidence.

## 6. Email system

Reuses the existing Resend durable outbox, deferred transactional snapshots, leases, immutable provider requests/idempotency keys, bounded retries, signed delivery webhook and failure quarantine. Card confirmation requires verified payment; bank pending, verified, rejected and payment-review states have distinct wording. Historical COD events remain supported without reintroducing COD to new checkout.

Customer/admin totals come from stored order snapshots. Zero shipping displays FREE and the selected delivery method is snapshotted. Eight HTML email renders at mobile/desktop widths have no overflow; the inspected mobile bank-pending template clearly states that payment awaits verification. Escaping, recipients, provider failure/retry and duplicate-event behavior are tested locally.

**Actual inbox delivery is unverified.** Hosted outbox installation, Resend key, verified sender/domain, approved admin recipient, webhook secret and reliable worker scheduling remain required. No real messages were sent by this pass.

## 7. Database

Read-only verification used Softheaven link and project `ecaoxnaokkjlotklquip`: four published products, one active stocked variant, all public tables RLS-enabled, zero active shipping rates, no email outbox/payment-attempt relation and no private receipt bucket. This proves catalogue connectivity, not complete Auth/RLS/Storage/checkout operation.

Required new migrations remain prepared and locally tested: existing email outbox → final payment workflow → approved free-islandwide delivery. Match the already-installed baseline by schema/functions before application; do not blindly replay differently timestamped historical baseline migrations. No hosted migration or shipping mutation was authorized/performed.

Free standard delivery is formally approved for all 25 Sri Lankan districts, no minimum and LKR 0.00. The idempotent explicit zero-rate configuration preserves country/district/rate validation and rejects conflicts. Missing configuration still fails closed.

## 8. Payments

Exactly two new checkout methods remain: PayHere Card Payment and Bank Transfer with mandatory private receipt. Neither becomes operational merely from rendering a selector.

PayHere: server exact-money hash, trusted form callback signature/merchant/amount/currency checks, transactional attempts, duplicate/terminal-state protection, retry, expiry and late-paid review are locally tested. Real approved-domain sandbox payment/callback and production settings remain unverified; browser return never marks paid.

Bank: owned image receipt validation/private storage/short-lived authorized access, configuration version checks, pending state, permitted staff audit approval/rejection and same-order resubmission are implemented and locally tested. Approved bank account details and real hosted Storage/RLS/admin approval flow remain outstanding. Free delivery never bypasses receipt or payment verification.

COD/Koko/MintPay are not offered for new orders. Historical COD handling is retained only for existing records/tests.

## 9. Test results and limits

Passed: `npm run typecheck`, `npm run lint`, `npm test` (**52 tests**), `npm run build`, five disposable PostgreSQL commerce/admin/budget/payment/shipping suites and the dedicated email-outbox suite. Passing browser results include 234 route/viewport cases, all 12 shop widths with search/filter/sort behavior, emulated touch carousel, image loading, safe contact configuration state, simulated bank checkout/receipt gates, private diagnostics 401 and nonproduction indexing rules, guest cart/wishlist persistence and stock caps, and the single-page editor component harness.

Initial test issues were diagnosed rather than hidden: a real mobile control-layout defect was fixed; assertions were made to wait for persisted cart removal and use visible accessible controls instead of transient hidden streaming copies; WebKit's default executable path was absent, so the existing installed binary is selected explicitly. Simulated transport and isolated SQL are labelled as such.

Latest local mobile Lighthouse lab run: performance **77**, accessibility **96**, LCP **5.95s**, CLS **0**, TBT **0ms**. LCP does not meet the 2.5s target; field INP is unmeasured. This is a local simulated-mobile measurement, not production Core Web Vitals.

No claims are made for real payments, inbox receipt, live order persistence, authentication registration/recovery or authenticated admin writes without their test-environment evidence. Local screenshots and logs are ignored artifacts under `artifacts/deployment-sync/`.

## 10. GitHub

Verified repository: `https://github.com/fahimusman5-prog/softheaven.git`. Continued branch: `codex/release-sync-2026-11-18`. Existing draft review: https://github.com/fahimusman5-prog/softheaven/pull/8 . The final commit SHA/push result are recorded by that PR head and the accompanying final response. The candidate preserves `main` ancestry; no forced update, protected-branch bypass or automatic merge is used. Changed files and public asset derivatives are reviewed; local credentials/build outputs are excluded.

## 11. Deployment

Review-branch pushes use the existing GitHub-connected Vercel preview workflow for `softheavenlk` and `softheaven`, not production promotion. Exact resulting SHA, deployment IDs/URLs and build statuses are checked after publication. Previous production records and remote main remain at `b54665f8e6f098e97ba6d9a7d8375de578901b1a` unless a subsequent externally authorized release changes them.

The current Vercel connector still returns SoftHaven Project not found. Previous signed-in Chrome checks verified the reconciled candidate's 393px homepage/product/cart, but not the full hosted checkout/admin journey. Fresh previews require Vercel SSO for automated requests. Project IDs, custom-domain alias mapping, hosted environment-variable presence and complete hosted smoke tests remain explicit access gates. See `docs/deployment-sync-2026-11-18.md` for the branch/deployment root-cause evidence. Public website changes are not claimed merely from a GitHub push.

## 12. Remaining configuration

Correct Vercel project/deployment/domain read and preview access; suitable nonproduction backend and controlled customer/admin accounts; approved migration application and free-delivery rate; private receipt access and maintenance scheduling; PayHere domain/mode/credentials/public callback and sandbox verification; Resend verified sender/key/admin inbox/webhook and actual receipt; official support/social destinations; approved merchant identity/contact/return/refund/cancellation/privacy-retention terms. Preserve existing environment names in `.env.example` and public settings instead of adding conflicting aliases. Review leaked-password protection reported by the earlier hosted advisor.

Public checkout cannot be activated while these critical gates remain unverified. Production database changes and deployment still require explicit authorization under the existing release requirements.

## 13. Launch decision

**RED / NO-GO for 19 November until the P0 gates pass.** Application fixes and local regression evidence are substantial, but hosted payment/order/email/auth/admin operation remains unverified and required schema/configuration is absent. Complete the correctly scoped test-environment journeys and policy approval, review the named release candidate, then obtain explicit production migration/promotion approval and verify public domains plus admin build diagnostics. Preserve outstanding orders, receipts, reservations and outbox/audit history during any coordinated rollback; do not independently revert to the old COD commit path after prepaid schema activation.
