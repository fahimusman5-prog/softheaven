# Free standard islandwide delivery — 18 November 2026

**AMBER implementation / RED hosted activation:** the business has approved permanent free standard delivery to all 25 Sri Lankan districts, with no minimum order and no threshold. The tested configuration is ready for an authorized database rollout. Hosted production is unchanged and currently has no shipping rates.

## Cause and configuration

A read-only query against Softheaven project `ecaoxnaokkjlotklquip` found zero rows in shipping_rates. The existing checkout correctly fails closed. Its existing commerce function supports `countries=["LK"]` and an empty district list for all districts. No fee fallback or bypass is needed.

Migration `supabase/migrations/20261118070000_free_islandwide_delivery.sql` creates/reuses one zone named **Sri Lanka — Islandwide** and one **Standard Islandwide Delivery** rate: active, LKR 0.00, `free_over=NULL`. There is no minimum-order field/check in this shipping calculation. The transaction locks configuration tables, is repeatable without duplicates, and aborts for conflicting active Sri Lanka methods, duplicate standard methods or a shared conflicting zone. It does not delete historical rates/orders or silently change unrelated methods.

This migration is an initial approved configuration, not a permanent database rule forcing every future method to be free. Administrators can continue to edit the method, amount, districts, active state and optional threshold in existing Business settings → Shipping charges. Do not rerun the configuration script to override later intentional business changes.

## Application changes

- Checkout displays the approved delivery name and “Enjoy FREE delivery anywhere in Sri Lanka!” only when the returned active zone/rate confirms zero fee, no threshold, Sri Lanka and islandwide matching. Zero quoted shipping displays FREE. Missing configuration and unavailable shipping service have separate errors; no zero fallback was added.
- Homepage, product details and cart show a restrained free-delivery notice only after API confirmation. No popup or invented delivery-time promise.
- Exact totals remain computed by the existing database commerce engine. PayHere uses the resulting exact decimal amount/hash. Bank transfer retains mandatory private receipt and staff verification.
- New prepaid orders snapshot `shipping_method` from the chosen configured rate; existing deferred email outbox snapshots it, with zero shipping shown as FREE for both customer and admin. Historical orders without a method remain “Delivery,” not falsely labelled as the new service.
- The prepaid quote/commit entry points additionally require a nonblank address, explicit LK country and a recognized Sri Lankan district. Existing rate/zone/active checks still run. No authenticated legacy commit path is reopened.
- Admin settings show Sri Lanka — Islandwide, the configured method, zero fee and active state. Order details show the snapshotted method.

## Verification

45 unit tests pass, including explicit configuration recognition, PayHere amount/hash and customer/admin free-shipping email totals. Five isolated PostgreSQL suites pass. The new shipping suite applies the migration twice and verifies one method, all 25 district quotes, a LKR 1 order with no minimum, inactive/missing rates, invalid districts, blank addresses, unsupported countries, card callback, bank pending state and email snapshots. TypeScript, ESLint and production build pass.

Browser checkout acceptance uses explicit simulated transport and real local built UI; it is not a hosted checkout or real payment. It checks all 11 requested widths, the configured-free panel, mandatory bank receipt, one order submission, pending state, missing configuration and shipping service failure. Local visual artifacts remain under ignored `artifacts/final-launch/`.

## Authorized rollout still required

1. Confirm the intended nonproduction SoftHaven Supabase/Vercel project and use a suitable test backend. The isolated database is a disposable PostgreSQL fixture, not hosted Supabase Auth/Storage certification.
2. Apply earlier baseline migrations, the outbox migration, final payment workflow migration, then free-islandwide delivery migration. The new order-method snapshot/address guard live in the still-unapplied final-payment migration.
3. In that environment, query shipping_rates joined to shipping_zones: exactly one active standard method, rate=0, free_over null, countries=["LK"], districts=[], active zone. Exercise real authenticated quote and both complete payment journeys, then inspect order/email records.
4. Obtain explicit production database authorization before applying the configuration to hosted production. Recheck conflicts immediately before application. Do not promote a frontend release ahead of required migrations.
5. After separate deployment authorization, verify the exact deployed commit, public rendered checkout and authoritative quote. Only then report production free delivery active.

Other launch blockers remain: hosted outbox/payment migrations and maintenance scheduler; approved PayHere credentials/domain and real sandbox callback journey; approved bank details; Resend verified sender/secrets and actual customer/admin inbox delivery; final legal/business approval; correct Vercel access and protected preview rendering; authenticated product-admin QA. Mobile performance LCP remains above target (last local lab 4.66s). WhatsApp/social links remain blank as requested.

No hosted mutation or production deployment was performed. GitHub publication is separate from activation.
