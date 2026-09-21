# ANTZ SoftHaven

Customer-facing storefront rebuilt from the supplied Google Stitch screens.

## Run locally

```bash
npm install
npm run dev
```

The current phase intentionally uses an in-memory temporary product catalog and a localStorage cart. Checkout is UI-only and does not submit payment or create orders. Supabase, authentication, inventory, payment, and admin work are reserved for the next phase.
