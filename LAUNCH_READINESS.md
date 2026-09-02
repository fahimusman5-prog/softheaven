# ANTZ SoftHaven launch readiness

## Current status

The repository is a responsive React/Vite storefront preview built from the supplied Stitch exports. It is suitable for local visual and interaction review, but it is not yet a live commerce launch because no catalog API, customer authentication, order service, payment provider, fulfilment service, email service, or newsletter persistence is configured.

The checkout explicitly identifies preview mode and does not create an order, charge a payment method, or transmit customer data.

## Verified locally

- TypeScript, lint, and production build pass.
- Core storefront, product, cart, checkout-preview, account, wishlist, rewards, legal, FAQ, auth-shell, tracking-shell, and 404 routes render.
- Cart state persists in `localStorage` under `antz-soft-haven-cart`.
- Checkout required-field validation prevents empty submission.
- No secrets or environment-variable references are present in the frontend.
- Browser smoke checks covered route rendering, home content, add-to-cart, empty/cart states, checkout preview disclosure, invalid route handling, and console errors.

## Required before launch

1. Connect a server-side product/catalog and inventory source.
2. Replace hardcoded sample account/order/wishlist/rewards data with authenticated APIs and authorization checks.
3. Integrate a PCI-compliant payment provider using server-side order creation and webhook verification.
4. Add server-side checkout validation, tax/shipping calculation, idempotency, fraud controls, and email confirmations.
5. Add real newsletter/contact handling with consent, rate limiting, and abuse protection.
6. Replace policy shells with owner-approved legal copy and production domain URLs.
7. Replace localhost canonical, Open Graph, sitemap, and robots URLs with the deployed domain.
8. Re-run dependency audit in a network-enabled CI environment and verify deployment on the target host.
