# SoftHaven security regression — 2026-10-04

Read-only review of the canonical checkout, plus existing transaction tests whose fixtures all roll back. No source, policy, grant, provider configuration, inventory, shipping, or customer records were changed persistently.

## Scope and identity

- Dedicated connector `link_6abd25431988819199068811ebcd1dd9` listed exactly one project: `ecaoxnaokkjlotklquip`, named `softheaven`, ACTIVE_HEALTHY, PostgreSQL 17.11.
- Reviewed all existing API route handlers, server authentication/authorization, account/order ownership, admin permission schemas, auth callback, checkout provider gate, request limits, error handling, Supabase clients, proxy/CSP, configuration headers, search normalization, storage and database permissions.
- Current Supabase changelog and official RLS/function guidance checked. No Supabase feature or schema changes required.

## Database tests actually executed

All three existing SQL files ran unchanged and passed:

1. `tests/database-regression.sql`: authorization/RLS and role-spoof denial; stock ledger; server-derived quote, coupons, shipping and rewards; duplicate-variant oversell denial; idempotency; order transitions, COD refund, review moderation, verified purchase and restock.
2. `tests/request-budget-regression.sql`: durable quota threshold, direct private-table access denial, and direct review-RPC quota protection.
3. `tests/admin-workspace-regression.sql`: customer denial, private banking details, role-scoped financial metrics, stock aggregation, atomic collection assignment, and shipping sibling isolation/reactivation.

Post-test live query confirmed zero remaining test users, orders, shipping zones, and request-budget rows. Inventory remained Oliver 0, Amour 0, Aurelius 0, Celeste 10. Shipping rates remained 0. No real customer order was placed.

## Live database review

- 33/33 public tables have RLS enabled. No public table lacks RLS.
- Public admin views use `security_invoker=true` and deny anonymous SELECT.
- All privileged public/private SECURITY DEFINER routines have fixed empty `search_path`.
- Customer policies include ownership predicates; address writes have both USING and WITH CHECK. No policy authorization depends on user-editable metadata or deprecated `auth.role()`.
- Sensitive public RPC wrappers are SECURITY INVOKER, explicitly granted to authenticated/service roles and denied to anon. The two intentional anonymous newsletter RPCs are narrowly scoped.
- Admin permissions use confirmed users and server/database role checks, independently of navbar visibility.
- Private bootstrap and request-budget tables deny client SELECT. Budget RLS without policies intentionally provides default denial.
- Storage objects have RLS. `store-media` is an intentionally public image bucket; 5 MB/image MIME restrictions, permissioned per-user uploads, and referenced-asset deletion protection are present. No unneeded upsert/UPDATE path was added.

## Production request and header checks

Against the clean production build at `http://localhost:3032`:

- 23 safe API guard checks passed: external-origin and missing-origin denials, wrong content type, malformed JSON, body-size limit, schema bounds, anonymous account/review/admin read/admin write/upload/checkout denials, invalid newsletter input, and oversized review query.
- Four additional valid-schema payment checks confirmed card, bank_transfer, koko and mintpay each return HTTP 400 with the configured-payment error, before any order/provider operation.
- Auth callback with an external next URL redirected only to local `/account?confirmation=failed`.
- CSP contains a per-request nonce attached to rendered scripts, strict-dynamic, frame-ancestors none, and no unsafe-eval in production. HSTS `max-age=15552000`, nosniff, DENY frame protection, strict-origin-when-cross-origin Referrer-Policy and restricted Permissions-Policy were verified.
- Existing live deployment headers at `https://softheavenlk.vercel.app` independently show the same protections. This live check precedes the motion release.
- Six security/search unit tests ran and passed, including streamed body limits without Content-Length, error-detail redaction, same-origin denial, production nonce CSP, quota-to-429 mapping and bounded literal search handling.

Raw browser/API evidence remains outside the repository in the local QA directory.

## Secrets and dependencies

- Pattern scan of 188 tracked text files (the checked-in .env.example is a public template) found no tracked live environment files, private keys, Supabase secret/service-role JWTs, GitHub tokens, Stripe secrets or AWS access keys. Public publishable configuration is intentional. Pattern scanning is not a guarantee that every possible secret format has been detected.
- `npm audit --omit=dev --json` completed successfully: 0 currently reported production dependency vulnerabilities. No packages or lockfile were changed.
- Search is local catalogue filtering, bounded to 120 characters on URL and input paths and rendered as React text. No dangerouslySetInnerHTML search rendering was found.

## Remaining provider/manual boundaries

- Supabase security advisor WARN: **Leaked Password Protection Disabled**. Enable it in Supabase Auth provider settings: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection . No provider setting was changed in this review.
- Advisor INFO: private.request_budgets has RLS but no policies. This is intentional; direct access denial passed. Do not add a permissive policy merely to clear the advisory.
- Confirm deployed Supabase Auth rate limits/CAPTCHA, mail/SMTP and Vercel WAF rules for unauthenticated auth and newsletter abuse. The authenticated database budgets are durable; there is no claim that they cover every unauthenticated endpoint. Newsletter RPC is publicly callable by design and relies on provider protection for abusive signup volume.
- Shipping has no configured rates, so live COD checkout remains unavailable until real delivery configuration exists. Celeste has stock 10; other variants have 0.
- Card, bank transfer, Koko and MintPay need verified official merchant/pending-payment adapters and callback flows before activation. They remain blocked server-side.
- Contact remains an explicitly disclosed local preview; no email delivery service was configured.
- Authenticated customer/admin browser sessions, password-reset email delivery, provider MFA/CAPTCHA/WAF settings, real payment/refund processing, and a real customer purchase were not verified. Database fixture tests do not replace those live-service checks.

## Changes justified by this upgrade

The root task adds shared bounded search normalization and matching tests. Existing authentication, commerce RPCs, RLS, durable abuse protections and CSP were retained; no speculative security refactor was needed.

Official references: https://supabase.com/docs/guides/database/postgres/row-level-security ; https://supabase.com/docs/guides/database/functions ; https://supabase.com/changelog .
