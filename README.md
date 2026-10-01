# SoftHaven commerce administration

This checkout now uses the dedicated Supabase project `ecaoxnaokkjlotklquip` for the storefront and administration system. Database migrations have been applied to that project. Application changes are local to this checkout; they have not been pushed or deployed.

## Run

```sh
npm install
cp .env.example .env.local
# Enter the project's publishable key in .env.local.
npm run dev -- --port 3007
```

The server running during verification uses `npm run start -- --port 3007`.

- Storefront: http://localhost:3007
- Administration: http://localhost:3007/admin
- Customer account: http://localhost:3007/account

Only the public Supabase URL and publishable key are needed. The application does not use a service-role key. Set `NEXT_PUBLIC_SITE_URL` to the verified storefront URL when deploying for correct absolute metadata URLs.

## First administrator

1. In Supabase **Authentication → URL Configuration**, configure the intended application origin and allow its `/auth/confirm` callback, including the `?next=recovery` password-reset callback. For local work, use the origin `http://localhost:3007`; port 3000 currently runs the separate GitHub checkout.
2. At `/admin`, choose **Create an account** with `fahimusman5@gmail.com` and enter your own password.
3. Confirm ownership through the Supabase confirmation email. Supabase email signup is enabled, and confirmation is required.
4. Return to `/admin` and sign in. A database-only, one-time bootstrap grants the confirmed address `SUPER_ADMIN` and removes the bootstrap record. No client metadata can grant a role.
5. Other administrators must first have confirmed Supabase accounts. A SUPER_ADMIN can assign roles in **Administrators** by selecting their confirmed customer account.

Confirmation delivery, redirect settings, password recovery and a real authenticated browser session still require live validation. Configure supported SMTP for production Auth delivery. The application never reads, sets or displays an administrator's password on behalf of that administrator.

## Operational areas

Products, colour variants, categories, collections and collection assignments share storefront records. Stock changes use **Inventory → Adjust stock** and are recorded in the movement ledger. Product publishing/archival and featured selection support bulk operations. Records use paginated tables, search, sorting, explicit page-level CSV exports and forms.

Orders retain price, product, variant, delivery-address and category snapshots. Order changes follow validated transitions. Cancellation/returns restock once. Only authorized administrators may mark COD collected on delivery. An administrator may record a **full COD refund already completed outside SoftHaven**, with a reference and reason. That action records evidence and reverses rewards; it does not transfer money. Online payments and provider refunds are not configured.

Customers have private order/address/reward data. Internal customer and order notes are stored separately from customer-readable records. Reviews are pending until staff approve them; verified purchase is derived from a delivered order. Approved reviews appear on product pages. Loyalty uses a ledger, with optional welcome/review bonuses and points earned on paid delivery.

Homepage sections edit content inside the existing layouts. The landing carousel reads scheduled active slides with ordering, images, alt text and CTAs. Homepage favourites use product featured flags. Header/footer navigation, contact/social settings and SEO read Supabase records. Layouts and motion remain controlled by code.

Media uploads validate image signatures and decoded dimensions, limit size to 5 MB, generate safe unique paths and convert images to WebP. Referenced media, including historic order imagery, is protected from removal.

Newsletter subscriptions and token-based unsubscription are connected. Campaigns store drafts/cancellations only. There is no bulk email delivery integration, send action or fake delivery result.

Reports aggregate in PostgreSQL; browser clients do not download orders to calculate totals. Role checks run server-side and in PostgreSQL. Every exposed table has RLS. Privileged transaction bodies live in the unexposed `private` schema; public RPC wrappers use invoker rights and explicit grants. Important mutations are audited.

## Configuration before real orders

- Review the migrated catalogue prices. Existing numeric values were preserved; no exchange rates or new product specifications were invented.
- Receive actual inventory with ledger adjustments. Migrated variants start at **zero stock** because no authoritative counts were provided.
- Create an active shipping zone and rate using approved delivery rules. No shipping price was invented.
- Rewards begin disabled. Configure point values, earning, redemption and expiration before enabling them.
- Enter verified contact/social destinations and review SEO/footer text.
- Configure and validate Auth confirmation/reset redirects and email delivery.
- Complete authenticated administration and storefront browser workflows before production use.

## Verification

```sh
npm run lint
npm run typecheck
npm run test
npm run build
```

`tests/database-regression.sql` exercises authorization/RLS, inventory ledger, quote calculations, coupon usage, shipping, reward redemption/earning, idempotent order creation, order transitions, review moderation and return restocking against PostgreSQL in a transaction that rolls back all fixtures. PostgreSQL sequence numbers may still advance during rolled-back tests; order-number gaps are expected and must not be reset over live orders.

The local server route checks and security advisor results do not establish a deployed production outcome. Desktop/mobile authenticated browser verification remains necessary; browser tooling in this session was unreliable.
