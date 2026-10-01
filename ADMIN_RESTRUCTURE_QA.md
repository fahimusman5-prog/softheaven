# SoftHaven admin restructure — verification

Implemented in the GitHub production checkout and copied as scoped admin changes into the reference workspace. Public storefront source and catalogue assets were preserved.

## Business workspace

- Twelve main navigation destinations with role filtering; CMS, media, navigation, footer and database relationship screens removed from the admin UI.
- Product tabs include media upload, pricing, variants, stock, organization, collection membership and SEO. Variant stock still changes through the inventory ledger.
- Collections save product assignments atomically inside their editor.
- Commerce contains shipping charges, private bank instructions, coupons and global rewards. Checkout remains COD; bank settings do not create a payment integration.
- Customer profiles contain contact details, summaries and paginated order/address/review/reward tabs.
- Orders use item snapshots, addresses, payment information, notes and a timeline. Status choices follow the existing transition rules; refund recording retains its existing privileged checks.
- Reports use server calculations and Sri Lanka date boundaries, with sales/order charts and product/category/customer/stock/review/reward tables.
- Tables use business labels, pagination, filters, empty states and restrained badges. Stock changes use a labelled dialog; row menus render outside scrolling tables.

## Verification

- Lint, TypeScript, 14 existing unit tests and production build passed.
- Authenticated browser checks covered every main destination, unchanged product/variant saves, unchanged collection assignment saves, bank settings persistence, shipping/coupon forms, customer child tabs, stock validation/history, reports and administrator settings.
- Dashboard and catalogue passed overflow and broken-image checks at 1920×1080, 1440×900, 1366×768, 1280×800, 1024×768, 768×1024, 430×932, 390×844 and 375×812.
- Mobile drawer focus and contained table scrolling were checked.
- Unauthenticated business API access returns 401.
- `tests/database-regression.sql` checks authorization, checkout pricing, coupons, idempotency, order transitions, COD payment/refund recording, rewards, review moderation, restocking and paid report totals.
- `tests/admin-workspace-regression.sql` checks metrics, aggregate stock, private bank settings, atomic assignments, shipping isolation/reactivation and role-scoped overview data.
- Both SQL suites ran against the dedicated SoftHaven project within rollback transactions; no fixtures remain.

## Limits

The store currently has no real orders, reviews, coupons or shipping charges. These browser views were checked in their empty states. Order transitions, refunds, coupon redemption and shipping writes were tested in rolled-back database transactions rather than by creating production commerce records. No bank account details were invented; the bank configuration remains disabled and blank. Image upload logic was preserved and exposed in Product → Media; no duplicate production media was uploaded for QA.

This admin restructure is local and has not been published to GitHub or Vercel.
