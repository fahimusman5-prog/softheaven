# SoftHaven final launch implementation — 18 November 2026

**Overall: RED — not safe to open checkout for public launch yet.** The implementation is locally built and tested; production activation and the two complete live journeys are outstanding. No production deployment or hosted database mutation was performed during this implementation.

## Repository and deployment evidence

Work is on `codex/final-payments-launch-2026-11-18`, based on the preserved launch-readiness implementation at `f55e0425b25a3c5c33458764d486665db9a72556` (code commit `09c5fef2c9b6972f22524d084568db83945ed66a`). The final-payment and approved free-delivery changes are published for review on this branch; the branch history identifies the exact candidate. Nothing was reset or force-pushed.

GitHub records successful Vercel previews of f55e042 for both `softheaven` and `softheavenlk`. The latest production deployment records inspected reference `b54665f8e6f098e97ba6d9a7d8375de578901b1a`, not the launch-readiness branch. The public checkout API also returns the older response shape. The unique preview and production URLs require Vercel authentication, so their rendered output and current domain alias binding were not verified. These records explain why pushing the previous review branch did not promote it to production; they do not prove an alias's exact current bytes.

Previous preview: https://softheavenlk-nckqwg7co-usmans-projects-6b0baa56.vercel.app (protected). A new review-branch push requests the configured Vercel preview checks; inspect GitHub status for the final result. The connected Vercel account exposes YARA but cannot retrieve either SoftHaven project, even under the team in GitHub deployment records. Correct project access is required. Reconcile the newer main-branch policy work before any merge; do not replace it blindly with these drafts.

## Implementation and status

| Area | Status | Result / remaining requirement |
|---|---|---|
| New checkout methods | AMBER | Exactly Card/PayHere and Bank Transfer; historical methods retained. Each method stays unavailable until configured. |
| PayHere | AMBER | Official server hash, fixed decimal money, form notification signature/merchant/amount/currency checks, transactional attempt history, duplicate protection, retries and late-payment review implemented. Real sandbox journey and domain approval pending. Browser return never authorizes payment. |
| Bank transfer | AMBER | Approved configurable account snapshot, mandatory owned receipt, stale-account-version rejection, pending order, staff approval/rejection/audit and same-order resubmission implemented. Business details remain blank. |
| Receipt storage | AMBER | Migration defines private `payment-receipts` bucket. Actual JPEG/PNG/WebP bytes validated and re-encoded; 5 MB upload limit; owner/staff-only short-lived signed access. Bucket/migration not installed on hosted project. PDF unsupported. |
| Resend | AMBER | Reuses existing durable outbox, delivery tracking and signed webhook. Pending/paid/rejected/failed/review messages supported, HTML plus text. Sender/domain/secrets, scheduler and actual customer/admin inbox tests pending. |
| Mobile storefront | AMBER | Compact contained logo and accessible controls, 270×338 hero at 393px, compact image collage, shop/PDP/checkout/footer refinements. Local browser checks pass; fresh hosted rendering pending. |
| Legal | RED | Four substantive nonempty pages explicitly marked drafts and noindex. Business approval and exact facts needed; these are not approved final merchant policies. |
| Shipping | RED hosted / AMBER implementation | Business approved permanent free standard delivery, all 25 Sri Lankan districts, no minimum. Idempotent configuration and payment/email tests pass. Hosted rate is not yet installed; see `docs/free-islandwide-delivery-2026-11-18.md`. |
| Database | RED | New migration tested in isolated PostgreSQL. Hosted project lacks both the previous outbox migration and the new payment migration. |
| Admin product editor | AMBER | Existing single-page editor and section order retained; prior component/browser and isolated database coverage preserved. Real authenticated create/upload/variant/publish journey not executed in this run. |

## Files modified

Payment implementation: `lib/payments/{payhere,server,handoff,receipt}.ts`, `lib/checkout/payment-{methods,provider}.ts`, `app/api/checkout/route.ts`, `app/api/payments/{payhere/notify,receipts,receipts/[id],status,retry,bank-review}/route.ts`, `app/api/internal/payment-maintenance/route.ts`, and `supabase/migrations/20261117154742_final_payment_workflows.sql`.

UI: `app/checkout/{page.tsx,checkout.css}`, `app/payment-result/{page.tsx,payment-result.css}`, `components/checkout/{bank-details,receipt-upload}.tsx`, `components/admin/payment-review.tsx`, existing admin detail/settings/API files, `lib/admin/settings.ts`, `app/final-launch.css`, `app/collections/collections.module.css`, `app/layout.tsx`, and `components/site-footer.tsx`.

Legal/email/security: `lib/legal/policies.ts`, `app/(policies)/[policy]/*`, `lib/email/order-template.ts`, `lib/browser-security.ts`, `proxy.ts`, `.env.example`, and `tsconfig.json` (exclude copied generated build declarations only).

Validation: `tests/checkout-payment.test.ts`, `tests/receipt.test.ts`, `tests/payments-regression.sql`, `scripts/verify-commerce-isolated.mjs`, `scripts/verify-final-payments-browser.mjs`. See Git diff for the authoritative file list.

## Local verification

- TypeScript, ESLint and final production build pass.
- 45 unit tests pass: exact amounts, official checksum, wrong merchant/currency/signature, activation gate independent of callbacks, actual image validation/limits, email state wording and existing suites.
- Five isolated database suites pass: commerce, admin, request budgets and new payment regression. Payment cases cover idempotency, amount/currency mismatch, pending/success/failure/chargeback, retries, expiry, late success, required/foreign receipts, stale bank configuration, rejection/resubmission/approval, fulfilment guard and email deduplication. No production order or inventory was changed.
- Full local Chrome responsive matrix: 143 cases passed. New simulated bank checkout verifies two methods, mandatory receipt, upload, one submission, pending result, four legal routes, and no overflow at 320/360/375/390/393/414/430/480/768/1024/1440px.
- Rebuilt homepage: logo contained and no overflow at all 11 widths. At 393px the logo is 105×54 within its container and hero card is 270×338.
- Browser payment transport is deliberately simulated. These results do **not** prove hosted RLS/storage, real PayHere, real authenticated admin operations or delivered email. Real journeys A and B remain unexecuted.
- Final local HTTPS WebKit smoke: all seven homepage/checkout/result/legal routes passed at 393px (automated WebKit, not a physical Safari device).
- Final Lighthouse mobile lab run on local HTTPS: performance 81, accessibility 96, LCP 4.66s, CLS 0, TBT 11ms. LCP target not met; field INP is unmeasured.
- Local artifacts: `artifacts/final-launch/` (ignored, not published). Check the latest Lighthouse JSON for measurements; lab results are not field INP or production measurements.

## Activation runbook and remaining environment

1. Confirm correct SoftHaven Vercel project IDs, team, production branch/domain aliases and the exact candidate commit. Restore access to protected previews. Review branch differences against main before merging.
2. Use an appropriate nonproduction backend first. Apply the existing outbox migration `20261117111929_launch_order_email_outbox.sql`, then `20261117154742_final_payment_workflows.sql`, with all earlier migrations. Verify public RPC grants, private bucket, RLS, callback transaction, receipt owner/staff access and email queue against that actual environment.
3. Configure server-only `SUPABASE_SECRET_KEY`; preserve public Supabase URL/publishable key. Never place the secret in NEXT_PUBLIC variables or Git.
4. PayHere: set `PAYHERE_MERCHANT_ID`, `PAYHERE_MERCHANT_SECRET`, explicit `PAYHERE_MODE=sandbox`, and approved HTTPS `NEXT_PUBLIC_SITE_URL`. Keep `PAYHERE_CHECKOUT_ENABLED=false` until domain/credential/callback checks are ready. Callback is `<approved-origin>/api/payments/payhere/notify`; must accept public form POST. Then enable only in test environment and complete sandbox journey A. Production requires separately reviewed production merchant credentials, mode and approved domain.
5. Configure approved bank account under existing business settings: enabled flag, bank name, account holder, account number, branch, optional SWIFT/instructions. Confirm displayed account and payable amount before enabling. Do not use test fixture account values.
6. Configure approved shipping in Admin → business settings → Shipping charges. Add area, one district per line (blank covers all Sri Lanka), delivery method, exact approved LKR charge, optional approved free-over threshold and active state. Disable unsupported areas/rates. Test address matching and server total; zero must be intentional business approval, never a fallback.
7. Email: configure `RESEND_API_KEY`, verified `ORDER_FROM_EMAIL`, `ORDER_ADMIN_EMAIL`, `NEXT_PUBLIC_SITE_URL`, `RESEND_WEBHOOK_SECRET`, `CRON_SECRET` and the service key. Existing contact sender/recipient and Turnstile variables are separate. No duplicate RESEND_FROM_EMAIL/ORDER_NOTIFICATION_EMAIL/SITE_URL aliases are needed. Verify signed webhook at `/api/webhooks/resend` and received messages in real customer and admin inboxes.
8. Configure and monitor a reliable scheduler with Bearer `CRON_SECRET` for `/api/internal/payment-maintenance` (recommended every minute) and `/api/internal/order-emails` (see existing email runbook). No scheduler was activated here. Maintenance releases stock/coupon/points holds exactly once and deletes expired orphan receipts. Default technical holds: card 20 minutes; bank 24 hours. Review those operational defaults before activation. An inactive scheduler can retain inventory indefinitely and blocks launch.
9. Complete both live test journeys: sandbox provider → verified callback → persisted order → admin display → actual customer/admin inbox; bank upload → private owner/staff access → pending order → authorized audit approval → paid notification. Also test a rejected replacement receipt, expiry, callback retries and inaccessible foreign receipt.
10. Only after business approval, test evidence and explicit production approval: deploy the reconciled candidate, verify exact SHA/aliases, render public desktop/mobile, and review production configuration. Never treat GitHub publication as deployment.

## Business approval checklist

Keep WhatsApp, Facebook, Instagram and TikTok blank until supplied. Obtain approved legal merchant identity, postal/contact information, support route/hours if any, remaining delivery timing/handling rules, bank details, return eligibility, damaged-item procedure, cancellation rules, refund method/timing, delivery expectations, privacy retention/deletion rules, cookie practices and processor disclosures. Approve all four policy pages before removing their draft status. Do not invent missing periods or promises.

Hosted Supabase security advisor also reported leaked-password protection disabled. Review this in Auth configuration before launch. No auth policy was changed automatically.

## Recovery and operational limits

Disable new card handoffs with `PAYHERE_CHECKOUT_ENABLED=false`; retain merchant configuration for outstanding verified callbacks. Disable bank checkout through business settings. Stop new checkout during a coordinated rollback if necessary. Preserve payment attempts, receipts, audit trail, notifications, reservations and queued emails; do not drop tables or restore the old COD frontend independently. The new database wrapper intentionally rejects old direct committed checkout calls. Review a forward repair or compatible rollback transaction with outstanding paid/held orders before reverting schema/functions. Late payments after released reservations require staff reconciliation and are never auto-fulfilled.

Primary integration reference: [official PayHere Checkout API](https://support.payhere.lk/api-%26-mobile-sdk/checkout-api). Storage access model: [Supabase Storage access control](https://supabase.com/docs/guides/storage/security/access-control). Existing email details: `docs/email/ORDER-EMAILS.md`.
