# ANTZ SoftHaven — launch inputs

The code intentionally refuses to invent these values. Supply and verify them before enabling the public store.

## CRITICAL — required for launch

- Hosted Supabase project URL, publishable key, migration deployment access, and an authorized admin Auth user.
- Real product catalogue: names, descriptions, categories, image URLs, SKUs, prices, currency, stock, and any genuine variants.
- Launch countries, shipping amount/free-shipping rule, and an owner-approved delivery estimate for each country.
- At least one confirmed payment method: COD approval or verified bank-transfer instructions. Card requires a named provider, merchant credentials, callback/webhook contract, and a completed sandbox transaction before live credentials.
- Production domain and HTTPS deployment target.
- Final privacy, terms, shipping, and returns/refund copy approved for the operating jurisdiction.

## IMPORTANT

- Business email, phone, WhatsApp URL, location, and verified Instagram/Facebook/TikTok URLs.
- Resend (or another supported email provider) API key, verified sender address/domain, and notification recipient addresses.
- `SITE_URL`, `ALLOWED_ORIGINS`, `ORDER_TOKEN_PEPPER`, and `RATE_LIMIT_PEPPER` secrets in the Supabase Edge Function environment.
- Redirect/auth settings for the production domain.

## OPTIONAL AFTER LAUNCH

- Customer accounts, synced wishlist, reviews, loyalty/rewards, advanced promotions, analytics, and carrier tracking.

Until the critical inputs are supplied and the full live flow is verified, the app shows a clear configuration state and must not be marketed as accepting orders.
