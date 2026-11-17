# Order notification activation and operations

This implementation is prepared locally. No hosted migration has been applied and no email has been delivered during this task.

## Architecture

The additive `20261117111929_launch_order_email_outbox.sql` migration adds private, RLS-enabled queue and webhook-event tables. A deferred order trigger snapshots the order and its item rows at transaction end. The queue insert commits atomically with the order; rolled-back orders never produce mail. Existing orders are not backfilled.

COD and bank transfer pending events produce “received” notifications. Other online methods wait for the database to record verified `paid` status. Those methods remain disabled in the current application; this code does not integrate or authenticate a payment gateway. Customer and admin notifications have separate unique `(order, event, audience)` keys. Later verified payment can produce a distinct paid notification. Templates render persisted totals, variants, quantities, address, timestamps, payment/order states and links that require the existing account/admin authorization.

A protected `GET /api/internal/order-emails` claims up to three jobs. Claims use `FOR UPDATE SKIP LOCKED`, a five-minute lease and a random lease token. An exact provider request is persisted before sending and reused for retries, even after deployment/configuration changes. Resend requests use a stable key derived from job ID. Failures back off exponentially, at most eight attempts. Jobs older than 23 hours are quarantined to prevent ambiguous automatic re-sends beyond Resend's 24-hour idempotency window. Provider calls use a 12-second timeout and do not run in checkout requests. Provider failure never repeats or mutates the customer order.

`accepted` means the provider accepted the API request. It does **not** mean a customer received the email. Signed `POST /api/webhooks/resend` events update delivered/bounced/complained/delayed status. The Svix library validates the exact raw body and timestamp. A private unique event ID prevents replayed events from changing state twice; older events cannot overwrite newer delivery state. Webhooks arriving before acceptance is recorded return a retryable error. Logs and HTTP responses omit recipient data, addresses, message bodies and provider diagnostics.

Public clients and authenticated users have no queue table access and cannot execute worker RPCs. Only a server-side secret/service-role client may call the narrow worker functions. Never prefix that key with `NEXT_PUBLIC_`.

## Activation checklist

1. Confirm the correct SoftHaven Supabase project and compare hosted schema/migration history. The local regression suite is not proof of hosted schema parity.
2. Apply the additive migration in an isolated test environment first. Run existing commerce/admin/quota suites plus `scripts/verify-email-outbox.mjs`; review policies and advisors. No database resets are required.
3. Verify a Resend sender domain. Set `RESEND_API_KEY`, `ORDER_FROM_EMAIL`, `ORDER_ADMIN_EMAIL`, `NEXT_PUBLIC_SITE_URL` (the approved HTTPS origin), `SUPABASE_SECRET_KEY` and a strong `CRON_SECRET` on the correct preview environment. These are all blank/missing locally; do not paste secrets into chat.
4. Configure a reliable scheduler to call `GET /api/internal/order-emails` with `Authorization: Bearer <CRON_SECRET>`. Choose a cadence and batch capacity that meet actual order volume, within the hosting plan. No cron configuration is enabled automatically; the wrong Vercel project/plan must not be assumed.
5. Configure Resend webhook events `email.delivered`, `email.bounced`, `email.complained`, `email.delivery_delayed` to the preview's `/api/webhooks/resend`; set `RESEND_WEBHOOK_SECRET`.
6. Place an authorized test COD order with real test customer/admin inboxes. Verify both messages are received, totals/address/status match the order and the admin link rejects unauthorized sessions. Test provider failure, worker retry and duplicate invocation, plus signed webhook delivery/bounce updates.
7. Monitor queue age, failed jobs, last error codes and webhook delivery statuses using trusted SQL. Alert on failed jobs, backlog and bounces. Neither an operational alert destination nor an on-call team is invented here.
8. Only after verified preview results, configure the correct production project with explicit release approval. Keep online payment methods disabled until their own adapter/callback flows pass testing.

## Recovery

Pause the scheduler before changing delivery configuration. For failed/expired jobs, inspect the provider by persisted job key/provider ID before any manual replay; do not blindly reset queue state or generate a new idempotency key. Manual re-sends require checking for an already accepted message.

For application rollback, retain both private tables and their records. Disable the enqueue trigger if needed and stop scheduling the worker; preserve delivery evidence. Do not drop customer orders or truncate queue tables. The migration changes no existing product/order columns, prices or stock. A frontend rollback does not undo the queue migration.

## Evidence and limits

37 unit tests cover existing safeguards, WhatsApp, pricing/publication validation, templates, provider rejection/idempotency and valid/tampered/stale webhook signatures. The isolated PostgreSQL queue regression covers deferred item snapshots, rollback, role grants, deduplication, competing claims, lease mismatch, retry reuse, expired-job quarantine and duplicate/out-of-order delivery events. These do not establish real inbox delivery or production operations.

References: [Resend sending](https://resend.com/docs/api-reference/emails/send-email), [idempotency retention](https://resend.com/docs/dashboard/emails/idempotency-keys), [signed webhooks](https://resend.com/docs/webhooks/verify-webhooks-requests), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).
