# SoftHaven deployment and version synchronization — 18 November 2026

**Production issue remains open until a reviewed release is explicitly approved, deployed and visibly verified.** This investigation prepares one integrated review candidate. It does not authorize production migrations, branch changes, aliases or promotion.

## A. Root cause and evidence

The completed launch implementation was pushed to review branches, not to the production branch. GitHub reports successful **Preview** deployments for `f55e0425b25a3c5c33458764d486665db9a72556` and `3905570724cef18f67298d1c19b8e74d42170cf1`. The latest **Production** deployment records for both SoftHaven projects still reference `b54665f8e6f098e97ba6d9a7d8375de578901b1a` from 16 October. Remote main remains at that SHA. Those are different releases, not equivalent publication states.

Fresh no-cache requests to `softhaven.lk` (redirects to www), `www.softhaven.lk` and `softheavenlk.vercel.app` returned the older checkout response with only `rates` and `customer`, and zero rates. Their root HTML returned `x-vercel-cache: MISS`, `age: 0`, and private/no-store directives; all three served the same sampled immutable chunk paths. A stale browser/CDN cache is therefore not the supported explanation for the version mismatch. No service-worker registration was found. Static chunk hashing is preserved; caching was not disabled globally.

There was a second Git problem: the review branches originated before newer main work, with extensive add/add and content conflicts. A direct production promotion would omit or replace newer policy, atmosphere, account and loading changes. The new `codex/release-sync-2026-11-18` candidate merges both histories and resolves these deliberately.

There is a separate backend/configuration gap. The correct Softheaven Supabase project `ecaoxnaokkjlotklquip` has zero active shipping zones/rates, no private receipt bucket, no payment-attempt table and no email outbox. The bank setting is disabled with no account number. A frontend release alone cannot activate these workflows.

## B. Current versions

| State | Verified reference |
|---|---|
| Previous launch branch, local and GitHub | `f55e0425b25a3c5c33458764d486665db9a72556` (code `09c5fef2c9b6972f22524d084568db83945ed66a`) |
| Final payment/free-delivery branch, local and GitHub | `3905570724cef18f67298d1c19b8e74d42170cf1` |
| Last payment preview record | SHA `3905570`, GitHub deployment `7875292925`, Vercel deployment `3G6SQQGou82W5SJKHbAwR9mFefJ1`, created `2026-11-18T05:42:49Z` |
| Production branch / latest production records | `b54665f8e6f098e97ba6d9a7d8375de578901b1a`; GitHub deployments `7122278770` / `7122291626` |
| Integrated candidate | The commit containing this report on `codex/release-sync-2026-11-18`; exact SHA is in the PR head and deployment record. It has both main and final-payment history. |

Latest-record production SHA and observed public API are consistent. Exact live alias → deployment ID binding still requires project-domain access; do not equate an old GitHub record with complete current alias verification.

## C. Project/domain mapping and access

Both `softheaven` and `softheavenlk` are present in the signed-in Chrome Vercel team dashboard under team `team_nZxYXL5LkHHHLcfzv4IXcEjY`, slug `usmans-projects-6b0baa56`. Both connect to `fahimusman5-prog/softheaven`. The dashboard labels `softheaven.vercel.app` under softheaven and `softheavenlk.vercel.app` under softheavenlk. GitHub status links independently identify the same two project names.

`softhaven.lk` redirects to `www.softhaven.lk`. Its public responses match the old SoftHaven implementation. The custom-domain owning project, internal project IDs, production-branch setting, environment variables and current alias deployment mapping are **not yet verified**: the connector returns 404 Project not found for SoftHaven, including after the user reconnect, and project search returns no matches. Signed-in native Chrome shows the team/projects but did not yield reliable deployment-detail interaction. Do not substitute YARA or alter protection.

Correct access needed: grant the Vercel connection access to **softheavenlk** and **softheaven** in that team, including project/deployment/domain read access and authenticated preview access. No secret should be pasted into chat. The GitHub-connected branch preview workflow can build the candidate without changing production.

## D. Feature-to-commit inventory

All rows exist in the integrated candidate and were source inspected. “Preview built” below records successful provider status; it does not mean the protected hosted UI or live backend passed.

| Feature | Source commit / files | Committed and pushed before integration | Preview built | Production status |
|---|---|---|---|---|
| Navbar / fitted logo / mobile footer | `09c5fef`, `3905570`; site-header, readiness/final-launch CSS, footer | Yes | Yes, 3905570 | Latest refinements absent |
| Compact 270×338 carousel / image delivery / shop/PDP | `09c5fef`, `3905570`; portrait carousel, image loaders, shop/product components | Yes | Yes | Latest refinements absent |
| Mobile checkout; exactly card and bank; no new COD/Koko/MintPay | `3905570`; checkout page, payment-methods | Yes | Yes | Old checkout remains |
| PayHere hash / callback / status / retry / reservation expiry | `3905570`; lib/payments, payment API, final-payment migration | Yes | Yes | Not installed/activated |
| Mandatory private receipt / staff review / rejection/resubmission | `3905570`; receipt API/UI, admin review, migration | Yes | Yes | Bucket/schema absent |
| Resend customer/admin templates / durable outbox / worker / webhook | `09c5fef`, `3905570`; lib/email, internal/order-emails, webhooks/resend, migrations | Yes | Yes | Outbox absent; delivery unverified |
| Single-page admin product editor; images/variants/inventory | `09c5fef`; catalogue-editors, existing admin media/inventory API | Yes | Yes | Older admin exists; newest editor not released |
| Contact WhatsApp flow / blank unapproved destinations | `09c5fef`; contact experience, configuration | Yes | Yes | Latest contact flow absent |
| Explicit free islandwide rate / 25 districts / no minimum | `3905570`; free-delivery migration, shipping config, quote/commit validation | Yes | Yes (code only) | Zero configured rates; not active |
| Canonical legal routes and detailed return-policy sections | `df94814`, `886e041`, `b54665f`; policies, policy-page, static routes | Yes, main | Yes | Main version exists; candidate reconciles new payment/delivery facts and marks drafts |
| Current main cloud / account / loader work | main history through `b54665f` | Yes | Yes, prior main | Preserved in candidate |
| Protected automatic deployment diagnostics | Integrated candidate; API route, Settings Deployment tab, next.config metadata | Candidate commit | Fresh build required | Absent |

The single-page editor retains Basic Information → Images → Colours & Variants → Pricing → Inventory → Categories & Collections → SEO → Publishing. Production/test authenticated CRUD and uploads still require proper isolated test access; no customer/product record was changed for this audit.

## E. Integration and actual corrections

- Backed up all refs in ignored `artifacts/deployment-sync/pre-sync.bundle`, plus status and merge analysis. Initial working tree was clean; there were no uncommitted/untracked source changes to discard.
- Created a separate review branch. Kept tested prepaid checkout, receipt authorization, rate limits, durable emails, dependency versions, responsive derivatives, mobile refinements and single-page editor from final-payment history.
- Preserved newer main cloud component and matching atmosphere styles; account entry/layout, loading lifecycle, desktop-only smooth scrolling and transaction background; retained main-only source files and canonical policy structure.
- Resolved binary artwork conflicts using main originals; existing optimized derivative assets remain preserved. No new stock imagery or redesign.
- Replaced duplicate dynamic legal routes with canonical static main routes. Preserved detailed returns/cancellation sections. Updated obsolete COD/online-payment and shipping descriptions to match the candidate, clearly kept policies as drafts/noindex. Historical COD refunds remain historical text, not a new checkout method.
- Added **Admin → Settings → Deployment**. The protected endpoint `/api/admin/deployment` requires verified admin settings permission and returns only package version, build-time Vercel Git SHA, UTC build timestamp and environment. Responses are private/no-store; unauthenticated access returns 401. It does not serialize environment variables or secrets. Local builds without Vercel Git metadata explicitly show unknown SHA rather than an invented identifier.
- Preserved hashed immutable assets and existing HTML/API cache policy. No global cache purge or cache disabling.

## F. Validation and blockers

Integrated candidate: production build, TypeScript, ESLint, **49 unit tests**, five isolated PostgreSQL suites, **143 Chrome responsive cases** (no overflow/exceptions), and the simulated bank checkout/receipt/missing-rate/service-error suite pass. Checkout is checked at all 11 specified widths. These are actual local results recorded under ignored `artifacts/deployment-sync/`.

Hosted fresh-preview verification remains a separate gate: homepage/shop/collections/PDP/cart/checkout/contact/legal/admin must be visibly checked against the exact new SHA, including 393px logo/carousel and exactly two methods. Provider build success alone is insufficient. Do not enable live payments merely to inspect UI.

No hosted migrations were applied. The approved free rate remains a migration, not an active production claim. Missing requirements include outbox/payment/free-rate migrations, private receipt storage and RLS verification, reliable maintenance/email scheduling, approved bank details, PayHere domain/credentials and sandbox callback tests, Resend verified sender/configuration and actual inbox delivery, final policy/business approval, authenticated admin QA and correct Vercel project access. Last local performance measurement remains LCP 4.66s, above target; no new performance improvement is claimed.

## G. Exact next action and rollback

Review the integrated candidate PR. Restore project-scoped Vercel read/preview access and verify the resulting hosted preview's SHA and visible UI. Configure a suitable nonproduction backend, apply the existing outbox then final-payment then free-delivery migrations (after matching the already-installed baseline by function/schema, not blindly replaying differently timestamped historical migrations), and execute real authenticated flows. Review existing environment-variable names in `.env.example`; never expose server-only credentials.

Once those gates and business approvals are complete, request explicit approval for the named candidate, correct project/domains and hosted database operations. Merge/promote only under that approval, then verify public aliases and admin build diagnostics. Production is not automatically updated by a review-branch push.

Keep the current production deployment available for rollback. If the prepaid schema is installed, do not independently restore the old COD frontend: it uses a commit path the new schema intentionally rejects. Disable new handoffs safely, preserve callbacks, paid orders, reservations, private receipts, audit/outbox records and repair forward or use a coordinated compatible rollback. Never drop customer/order data to resolve a deployment mismatch.
