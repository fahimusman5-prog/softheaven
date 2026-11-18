# SoftHaven contact experience

Implemented locally on 5 November 2026. No publication or deployment was performed.

## Scope and files

Modified:
- `app/contact/page.tsx`: server page, metadata, runtime readiness and CSP nonce.
- `app/contact/contact.css`: isolated responsive styling, glass surfaces, reveal and reduced-motion rules.
- `lib/browser-security.ts`: optional contact-only Turnstile connect/frame allowlist. Defaults remain unchanged.
- `proxy.ts`: enables that allowlist only for `/contact`.
- `.env.example`: contact configuration names, no secrets.

Created:
- `app/contact/contact-experience.tsx`: hero, three configured contact cards, form, approved existing artwork, FAQ, CTA and Turnstile lifecycle.
- `app/api/contact/route.ts`: Node POST endpoint.
- `lib/contact/config.ts`: typed public contact configuration and safe destination validation.
- `lib/contact/schema.ts`: shared strict validation and enquiry categories.
- `lib/contact/service.ts`: origin/body checks, honeypot, bounded rate limiter, verified Turnstile, Resend notification + acknowledgement batch.
- `tests/contact.test.ts`: validation, integration contracts, failures and CSP tests.
- `artifacts/contact/`: screenshots and reproducible browser verification script/results.

Navigation, footer, logo, fonts, shared cloud implementation, checkout, payment and authentication behavior were preserved. No dependencies or database objects were added. Reused `/assets/home-story/plush-cloud-cutout.webp`, an existing teddy/bunny cloud visual; no new product photograph or envelope-holding teddy is represented as approved imagery.

## Business setup still required

The local environment has only the existing storefront connection settings. No verified public support email, telephone or WhatsApp was found in the loaded public settings. Supply approved values through the existing admin General settings (`email`, `phone`) and Social settings (`whatsapp`). WhatsApp accepts an HTTPS `wa.me/<international digits>` or `api.whatsapp.com/send?phone=<international digits>` link. Missing destinations render an availability notice and a real account link, never a fake contact action.

`getContactConfig()` includes displayName, email, phone, whatsapp and supportHours. Support hours deliberately remain null pending business confirmation. No response-time promise appears.

No shipping or returns policy route exists in this checkout. FAQ answers use the existing account/order behavior and product-page delivery guidance without invented delivery timelines, return rights, gift wrapping, or cancellation guarantees. When the public navigation contains an actual internal policy destination, the relevant FAQ links to it. Confirm and publish those policies separately if needed.

## Required server configuration

```
RESEND_API_KEY=
CONTACT_FROM_EMAIL=
CONTACT_TO_EMAIL=
TURNSTILE_SECRET_KEY=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

Use a real Resend key and verified sender domain. `CONTACT_FROM_EMAIL` and `CONTACT_TO_EMAIL` are bare email addresses. The private destination can match the business-approved public support inbox; it is never exposed as a secret-derived prop. Public email/contact links always come from existing public store settings. Restrict Turnstile to the storefront hostname(s); validation checks hostname and action `contact`. The site key is intentionally public and supplied at runtime. The secret and Resend key remain server-side.

Until all five settings are present and the email values are valid, the form is visibly unavailable and the API returns HTTP 503. Presence checks cannot establish domain verification or actual delivery. A live delivery test is required after configuration, before describing the form as operational.

Resend receives two plain-text messages in one batch: support notification (all customer fields, enquiry, optional order details; customer as reply-to) and customer acknowledgement (no response-time promise). The email Date header is the submission timestamp. Using that header keeps the request body stable for provider deduplication. No untrusted input is rendered as HTML. The server only returns success when both provider acceptance IDs exist. Provider acceptance is not proof of inbox delivery; check Resend delivery events and both inboxes during activation.

References: [Resend batch API](https://resend.com/docs/api-reference/emails/send-batch-emails), [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/).

## Abuse protection and operational limits

- Same-origin POST; strict JSON content type; 24 KB streaming body cap.
- Strict shared schema; trimmed fields, validated email and enquiry enum, bounded lengths and phone formatting.
- Honeypot; server-verified, single-use Turnstile token with hostname/action matching.
- Five attempts per ten minutes for each hashed IP and each hashed email, with expiry and bounded map size.
- Stable SHA-256 content-derived Resend idempotency key for concurrent/retried identical submissions, valid for the provider's 24-hour window. Identical notes in that window are acknowledged without a duplicate delivery.
- Busy guard and disabled submit during processing; failures retain the form; success requires server acceptance.
- Provider timeouts, generic private errors, no customer message logging and no database persistence.

The in-process rate limiter is supplemental: it resets with process restarts and does not share counters across replicas. Before a multi-instance/public launch, configure a platform/WAF rate rule for POST `/api/contact` (recommended 5 attempts/10 minutes/IP) or replace this limiter with a shared durable quota. The hosting proxy must sanitize client-supplied forwarded IP headers. Turnstile and provider deduplication work across instances; they do not create a durable per-person request quota. Email delivery and abuse costs should be monitored in the provider dashboard.

## Verification

- TypeScript: passed.
- ESLint: passed.
- Production build: passed, including `/contact` and `/api/contact`.
- Automated tests: see final test output and browser-results.json.
- Browser screenshots inspected at desktop 1440px and mobile 390px; overflow assertions at 320, 390, 768, 1024, 1440px.
- Browser FAQ click/keyboard, optional order field, reduced motion and page errors checked.
- Submission failure, retry, field retention, busy state, success focus and reset tested with browser HTTP mocks and dummy local-only configuration. Provider API behavior tested with injected mocks, never with real recipients.
- Actual missing-configuration behavior is also checked against the default local server.
- Physical devices, actual Turnstile challenges, real email delivery and production deployment remain unverified.

System Git/Python commands encountered an existing Xcode license gate. Node-based authoring and project checks work. No license terms or system configuration were changed.

### Final recorded results

All 31 Node tests passed. Final TypeScript, ESLint and production build passed. Production-mode browser assertions passed with zero page errors. Axe scans scoped to `.concierge` at 390px and 1440px reported zero violations after the contrast refinement. A separate browser pass on the actual unconfigured local environment verified its unavailable message, disabled sending, FAQ click/keyboard behavior, conditional order fields, reduced motion and all five viewport overflow checks. The real local API returned 503 without provider calls, as intended.

View the default local page at `http://localhost:3100/contact`. Screenshots `desktop-top.png`, `desktop-form.png`, `mobile-top.png`, `mobile-form.png` show the actual unconfigured state. `desktop-full.png`, `desktop-faq.png` and `mobile-full.png` were captured on a local production server with dummy configuration and mocked security/submission responses. These latter captures demonstrate layout and are not evidence of working credentials or live email delivery.
