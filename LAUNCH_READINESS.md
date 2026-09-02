# ANTZ SoftHaven launch readiness

## Current verdict

NOT READY — code and deployment scaffolding are implemented, but the owner’s production inputs and live-service verification are still required. This is intentional: the app refuses to invent products, prices, currency, shipping, payment credentials, contact details, or legal promises.

## Implemented in this branch

- Supabase schema, explicit grants/RLS, service-role-only checkout RPCs, price/stock/shipping/payment validation, stock locking/decrement, order snapshots, and idempotency.
- Edge Functions for checkout quote, guest order creation, confirmation-token verification, contact persistence/rate limiting, and transactional email hooks.
- Data-driven Shop, Collections, Product, Cart, Checkout, Order confirmation, Contact, About, policy, 404, and minimal authenticated admin routes.
- Public account/rewards/wishlist/gifts/sample-order surfaces removed; no fabricated reviews, metrics, badges, prices, inventory, or order success.
- Search uses `/shop?q=...`; invalid product slugs render a real 404; checkout and admin/private paths are excluded from robots.
- Existing Stitch assets and the pastel/liquid-glass design language remain intact.

## Not verified here

- Hosted Supabase migration/RLS execution, real catalogue and inventory, domain/HTTPS, owner-approved policies, payment sandbox/live callbacks, email provider delivery, contact delivery, and database order persistence.
- Full mobile browser flow at every requested viewport and production deployment.
- `npm audit` and `npm audit --omit=dev` pass with zero reported vulnerabilities after the compatible `nanoid` override.

See `LAUNCH_REQUIRED_INPUTS.md` for the exact owner actions. Do not claim production launch readiness until the full live checklist in the implementation report passes.
