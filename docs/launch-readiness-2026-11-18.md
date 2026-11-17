# SoftHaven launch readiness: 18 November 2026

Review: 17 November 2026, Asia/Colombo. Source: current checkout, remote fahimusman5-prog/softheaven, starting branch master, HEAD 7aaf8ba363b8eabbddb812f1b8ab40525268ccac. Review branch: codex/launch-readiness-2026-11-18. Extensive pre-existing dirty work preserved. Baseline patch/status and exact copies of touched files: artifacts/launch-readiness/baseline. No production deployment or database changes authorized by this report.

Architecture: Next.js 16.3.8 App Router, React 18.3.1, strict TypeScript, CSS, Motion/GSAP. Supabase SSR cookies and database roles guard admin APIs; database RPC owns totals, stock and idempotency. Existing Resend contact adapter, no order email integration found. Only COD enabled. Other payment methods fail closed. Images use existing upload API and catalogue assets.

## Initial confirmed issues
| Priority | Surface and cause | Fix and verification |
| --- | --- | --- |
| P0 | Public shipping rates returns zero rows; checkout cannot select delivery | Configure approved active zones/rates; verify authenticated order |
| P0 | No legal page routes in source and no policy links in public navigation | Supply approved policies; implement and verify links, never invent copy |
| P1 | No order email triggers/outbox | Prepare atomic private queue and retry worker; verify received test emails |
| P1 | Contact submits email, contrary to requested WhatsApp flow | Validated configured WhatsApp redirect; encoding/fail-closed tests |
| P1 | Product editor tabs, variants after pricing | Stacked shared editor; retain ledger/IDs |
| P1 | Fixed logo plus four controls cannot fit 320px | Flexible logo and 44px controls; browser matrix |
| P1 gap | Authenticated flows, production identity, email receipt unverified | Scoped provider access and test credentials/config required |
| P2 gap | Performance metrics unmeasured | Browser measurements, preserve imagery/clouds |

Public API check: four published products, four active variants (three stock 0, one stock 10), zero public shipping rates. Connectivity verified; authenticated writes/RLS not yet certified. All 31 baseline tests passed. Vercel connector only lists YARA; Supabase connector requires missing link_id. Native security scan failed: “Scan scope must reference an existing directory inside the target.” No completed native scan claimed.

## A. Implementation summary

- Preserved the premium cloud imagery, serif identity, catalogue and existing server commerce model. No storefront rebuild or production release.
- Fixed narrow mobile navigation using the original aspect-ratio logo, flexible spacing and 44px controls. Added search/menu/wishlist Escape handling, focus containment/return, outside/backdrop dismissal and scroll locking. Logo inspection: 293×233 pixels; no excess alpha padding, so no derivative or transform workaround was needed.
- Cart hydration removes unavailable variants and caps quantities to current stock. Quantity changes respect cached stock; the database remains authoritative at checkout. Storage failures now leave the cart usable in memory.
- Contact uses configured WhatsApp handoff, with no customer form submission to the application's email API. Unconfigured social methods remain hidden and submission disabled. User explicitly requested keeping business details and policies blank for now.
- Add/edit products share a structured single-page editor. Draft/publish actions, field validation, unique-handle/SKU conflict messages, image management and unsaved-change protection are included.
- Prepared customer/admin order emails using the existing Resend provider family, private durable outbox, retry worker, HTML/text templates and signed delivery events. Hosted activation and real inbox verification remain outstanding.
- Upgraded Next.js 16.3.8→16.4.6, matching eslint-config-next, Zod 4.3.6→4.6.7 and compatible lockfile dependencies. Added pinned Svix 2.10.0 for webhook signature verification. Final full npm audit reports zero known vulnerabilities.
- Generated responsive derivatives of nine approved editorial photographs without cropping or replacing originals. Original files total 2,591,926 bytes; the nine 640px derivatives total 515,654 bytes. This is an asset-size comparison, not a claim that every device downloads that exact total.
- Enlarged carousel pagination hit areas, strengthened informational text contrast, eagerly loaded adjacent hero imagery, and skipped the mobile hero entrance timeline while retaining cloud/section motion and desktop entrance behavior.

## B. Files changed

The exact task file list is `artifacts/launch-readiness/task-files.txt`. This is **not** the full working-tree diff: extensive earlier edits/untracked work already existed.

| Area | Main files |
| --- | --- |
| Navigation/cart/mobile | `components/site-header.tsx`, `components/cart-provider.tsx`, `app/readiness.css` |
| Contact | `app/contact/{page.tsx,contact-experience.tsx,contact.css}`, `app/api/contact/route.ts`, `lib/contact/{config.ts,whatsapp.ts}` |
| Product administration | `components/admin/{catalogue-editors.tsx,editor.tsx,shared.ts}`, `app/admin/admin.css`, `lib/admin/resources.ts`, `app/api/admin/[...resource]/route.ts` |
| Order email | `lib/email/{order-template.ts,delivery.ts,webhook.ts}`, `app/api/internal/order-emails/route.ts`, `app/api/webhooks/resend/route.ts`, additive outbox migration |
| Images/motion | `components/{home-editorial-journey.tsx,portrait-hero-carousel.tsx,home-motion.tsx}`, `lib/responsive-editorial.{ts,json}`, 36 WebP derivatives under `public/assets/responsive` |
| Configuration/QA | `.env.example`, package manifest/lockfile, `tests/launch-readiness.test.ts`, six verification/generation scripts, launch/email documentation |

## C. Mobile and storefront verification

Chrome production rendering covered 13 routes at 320, 360, 375, 390, 393, 414, 430, 480, 768, 1024 and 1440px: **143 cases**, no root horizontal overflow or page exceptions. Routes: Home, Shop, Collections, a real product, Cart, Checkout, Account, About, Contact, confirmation, denied order detail, Admin entry and 404. This checks public/denied views; it is not an authenticated dashboard sign-off.

Interactions passed: 320px logo/control geometry and 44px navbar targets; menu scroll lock, Escape and focus return; search navigation; guest wishlist persistence/removal; product add-to-cart, quantity/persistence/removal; Shop search/empty state/sort; carousel next/pause; populated mobile checkout rendering; missing delivery configuration failing closed. Invalid checkout input returned 400, the unauthenticated worker returned 401, and the retired contact POST returned 410.

WebKit 26.5 over local HTTPS passed Home/Shop/Contact/Cart/Checkout at 390px with no horizontal overflow and menu/Escape interaction. Local HTTP cannot be used as a Safari-equivalent production test because `upgrade-insecure-requests` upgrades its assets to HTTPS; HTTPS was used without weakening the app's security policy.

Firefox could not launch its installed test binary (“Could not find profile folder”), including a persistent-profile attempt. Microsoft Edge is not installed. Branded Safari, physical iPhones/Android devices, native keyboard behavior and touch-swipe performance remain unverified. WebKit engine testing is not a claim of testing current Safari or iOS hardware.

## D. Contact page

Preserved the concierge hero and pastel-cloud composition. Four platform-icon glass cards are available for WhatsApp, Facebook, Instagram and TikTok **only when configured**. Approved destinations may come from existing public social settings or central server configuration (`WHATSAPP_NUMBER`, `FACEBOOK_URL`, `INSTAGRAM_URL`, `TIKTOK_URL`). HTTPS platform hosts are validated; no invented URLs appear.

The seven enquiry categories and requested customer fields are validated. Optional order numbers are included when relevant. A URL-encoded message opens the configured WhatsApp conversation for the customer to review and send. The success state says the message is ready, never delivered, and includes a fallback link if popup opening is blocked. No enquiry contents enter application logs or analytics. The old email endpoint returns 410; the old adapter's unit tests are retained as historical regression coverage, not proof of the current contact flow.

Live public social settings and local overrides are blank. All four cards therefore remain hidden and the form unavailable, as requested. Real WhatsApp app handoff with an approved business number remains a business-configured acceptance check; encoding/destination validation is unit-tested.

## E. Order email system

See `docs/email/ORDER-EMAILS.md` for activation, retry rules, monitoring and recovery. Queue snapshots and two audience jobs commit with authoritative orders. COD says payment is due on delivery; bank-transfer pending events do not claim payment; online notifications require authoritative paid state. Online payment methods themselves remain disabled.

Leases, immutable persisted requests, unique event/audience keys, stable provider idempotency keys, exponential retries, an eight-attempt limit and a 23-hour retry boundary prevent routine duplicate processing. Provider acceptance and signed delivered/bounced/complained/delayed events are tracked separately. Customer/admin URLs still require their existing authorization.

**Not active in hosted Supabase:** migration, worker schedule, sender/domain, server-only queue credential, webhook configuration and inbox tests. No real customer/admin email was sent or received. Do not treat passing template/provider mocks as proof of delivery.

## F. Admin product editor

Sections: Basic Information → Images → Colours & Variants → Pricing → Inventory → Categories & Collections → SEO → Publishing. Collections retain their separate existing editor. Product IDs and relationships are preserved on edits. Slugs are suggested until manually changed, and database uniqueness remains authoritative.

Multiple upload/drop, real progress, preview, cover selection, reorder and detach controls reuse the existing protected upload API/bucket. Detaching never deletes storage. Existing database reference checks and storage policies remain in place. A visual colour input uses the current colour-hex schema. Existing variant price/availability and inventory-ledger editors are retained.

A new product must be saved as a draft before variant/stock/collection records can be attached; no schema capability is invented. Simple products use one Standard stock variant under the existing commerce model. Inventory is never written through the general product form. Prices reject negatives/invalid data and compare-at values below selling prices; publishing requires description, cover image and category. Drafts may retain a zero price until completed.

Save actions are guarded against duplicate clicks and uploading conflicts, and fields lock during save. Save results do not refresh over newer unsaved input. Inline field errors, a sticky summary and navigation/unload warnings are provided. Automatic writes to published records were not added; autosave is optional and not required by the existing architecture.

A browser component harness with **simulated API responses** passed section order, slug generation, draft creation, stable edit ID, invalid publishing rejection and desktop/mobile rendering. Actual authenticated create/edit, image upload, stock adjustment and other protected admin sections still need authorized test accounts and a test backend. No production records were used for these write tests.

## G. Supabase and security

Read-only public requests confirmed catalogue connectivity, active variants, public settings/navigation and no shipping rates. Public `orders`, `profiles`, `admin_users` and `media_assets` queries returned zero rows. This is consistent with privacy protections, but anonymous empty results alone do not certify hosted RLS or customer-to-customer isolation.

All repository migrations, including the new outbox, were executed in disposable PostgreSQL/WASM. The existing commerce, admin-workspace and quota SQL suites passed against that schema with fixture Auth/Storage helpers and an owner fixture. Tests cover server-derived quotes, insufficient stock, idempotency, ownership/role restrictions, inventory ledger, order states/refunds, private bank settings, assignment atomicity and quotas. Those helpers do not test hosted Supabase Auth/Storage behavior or migration drift.

The native security workbench did not start: “Scan scope must reference an existing directory inside the target.” No completed native scan or penetration test is claimed. The [security-scan workflow](/Users/usmanfahim08/.codex/plugins/cache/openai-curated-remote/codex-security/0.1.32/skills/security-scan/SKILL.md) requires surfacing a direct-start failure; its desktop reference says “Do not invent scan ownership, start a replacement scan, open setup, or switch to a terminal workflow.” The source review and application/SQL regression checks above are separately identified engineering evidence.

Secrets remain server-only. No local secrets were changed, printed or placed in artifacts. Contact/provider payloads are absent from logs. The worker requires a secret; webhook signatures and raw-body bounds are verified. Existing authenticated admin guards, strict schemas, same-origin mutations, request bounds, nonce CSP and database quotas are retained. The installed React 18 version emits a Next.js deprecation notice; React 19 migration is a future compatibility task, not bundled into this release.

## H. Final checks

| Check | Result and limit |
| --- | --- |
| Production build | PASS, Next.js 16.4.6; React 18 deprecation warning |
| TypeScript | PASS |
| ESLint | PASS |
| Unit tests | PASS, 37 |
| Full dependency audit | PASS, zero known vulnerabilities after compatible fixes |
| Existing commerce/admin/quota SQL | PASS in isolated PostgreSQL; all fixtures rolled back |
| New email outbox SQL | PASS in isolated PostgreSQL: deferred snapshots, rollback, grants, dedup, leases, retries, immutable request, paid-only online event, webhook replay/order |
| Checkout | Guest cart/checkout and isolated database safeguards PASS; real committed preview order NOT VERIFIED |
| Email | Templates, rejection/idempotency mocks and signed webhook tests PASS; real inbox receipt NOT VERIFIED |
| Mobile/browser | Chrome 143 viewport cases and guest interactions PASS; WebKit five HTTPS mobile routes PASS; Firefox/Edge/branded Safari/device tests NOT VERIFIED |
| Admin | Component harness PASS with simulated API; authenticated hosted operations NOT VERIFIED |
| Contact | Validation/configuration/encoding PASS; unconfigured UI correctly disabled; actual business-number app handoff pending |
| Performance | See final Lighthouse artifact and measurement below; target achievement is not guaranteed |
| Whitespace | Task diff check PASS |

Evidence: `artifacts/launch-readiness/{build.log,typecheck.log,lint.log,unit-tests.log,commerce-isolated.log,email-outbox.log,full-audit-after.json}`, browser JSON/screenshots/logs, and Lighthouse HTML/JSON reports. INP requires interaction/field evidence; total blocking time is not represented as INP.

## I. Remaining launch gates and deployment preparation

| Priority | Remaining issue / cause | Required fix and verification |
| --- | --- | --- |
| P0 | Zero publicly usable delivery rates; no delivery choice | Business configures approved zones/rates and verifies quotes/order on the correct test backend |
| P0 | Required legal routes and approved policy text absent | Obtain approved Privacy/Terms/Returns/Shipping copy, implement direct routes and footer links; user asked to leave blank meanwhile |
| P1 | Order notifications not activated or received | Review/apply migration in preview, configure verified sender/credentials/scheduler/webhook, receive both test emails and test retries |
| P1 | Full authenticated customer/admin journey not verified | Supply authorized test access through the intended environment; complete order/account/admin/inventory/upload/recovery checks |
| P1 | Production and hosted preview identity unavailable | Vercel connector exposes only YARA; confirm SoftHaven team/project/branch/current deployment/HTTPS/domain/callbacks and create a correctly scoped preview |
| P1 | WhatsApp/social destinations intentionally blank | Configure approved business destinations later; no broken placeholders are exposed |
| P2 | Mobile LCP target unproven / unmet in local lab samples | See measurements; investigate streaming/render/font/animation and real deployment timings; validate under mobile network/CPU conditions |
| P2 | Browser/device coverage incomplete | Complete current Safari/Firefox/Edge and physical-device acceptance checks |
| P2 | React 18 deprecation | Plan a separately reviewed React 19 upgrade before adopting Next.js 17 |
| P3 | Optional visual refinements | No decorative redesign is needed for these launch blockers |

Local configuration contains only the public Supabase URL/key. Order-email credentials, verified sender, cron/webhook secrets and canonical site origin are missing. No online gateway or bank-transfer adapter is configured; those methods remain unavailable. Hosted Auth redirect/SMTP/leaked-password settings and storage-upload authorization remain unverified with current connector access. Do not infer correctness from environment-variable presence.

No GitHub push, remote migration, DNS change or production deployment occurred. A production build/local browser preview is available; **no hosted preview deployment was created**, because the connector is scoped to another project. Before release, confirm the deployment branch and build settings, production environment, canonical HTTPS domain, Auth redirects, callback URLs, sender domain and database migration parity on SoftHaven itself.

## Rollback plan

Record the exact current **production** deployment ID before any promotion; local HEAD is not proof of what is live. The production version could not be verified here. Preserve that deployment for a platform rollback after a separately authorized release.

Local review rollback must preserve the earlier dirty work: restore task-touched files from `artifacts/launch-readiness/baseline/files` and remove only task-created files from the task manifest. Package baseline files were reconstructed from HEAD plus the saved pre-existing patch. Do not reset the branch or discard all uncommitted changes. Duplicate generated `.next/types` files with copy-number suffixes were moved to baseline artifacts; they were build output, not application source.

The outbox migration is additive and has not been applied remotely. If it is later activated, stop scheduling the worker before rollback, disable the enqueue trigger if required, retain queue/webhook evidence and all orders, and do not truncate/drop data. A frontend rollback cannot reverse a database migration or delivered email. Inspect the provider before manually replaying ambiguous jobs.

## J. Launch decision

**RED — NOT SAFE TO LAUNCH.** Local code improvements and tests are substantial, but delivery configuration, approved legal pages, activated/received transactional emails, correct deployment scope and authenticated end-to-end acceptance remain outstanding. No green launch claim is made for 18 November 2026.

## Final local Lighthouse measurement

Lighthouse 13.6.0, simulated mobile through the local HTTPS preview: performance **82/100**, accessibility **96/100**, LCP **4.7 s**, CLS **0**, TBT **10 ms**. Pagination target-size audit passes. This is a single local lab run, not a field INP measurement, physical-device result or production guarantee. The 2.5-second LCP target remains unmet in the measured run. Full report: `artifacts/launch-readiness/lighthouse-mobile-release.report.html`.

Final navbar geometry checks at all nine requested mobile widths (320–768px) found no logo/control overlap, clipped controls, undersized navbar targets or root overflow. A normal-motion scroll down and back up on the final mobile homepage produced no page exceptions or overflow and no completed broken images; one offscreen decorative cloud was still lazy/unloaded at capture. External catalogue-host availability remains an operational dependency. The remaining Lighthouse contrast flag is the aria-hidden decorative “COMPANIONS” background word.

## GitHub publication follow-up

On 17 November 2026 the user authorized publishing this tested working application to GitHub. The review branch is `codex/launch-readiness-2026-11-18` in `fahimusman5-prog/softheaven`; this authorization does not merge `main`, apply hosted migrations or deploy production. Earlier statements about no GitHub push describe the audit before this publication follow-up. Local build caches, environment files, screenshots, baseline patches and QA backups are excluded from the publication.

Publication verification: fetching GitHub revealed newer `main` history, including Return Policy review work (main at `b54665f` at inspection). The policy-route finding above applies to this audited checkout, not a fresh review of GitHub main. Keep the review branch separate and reconcile newer main changes before any merge or deployment.
