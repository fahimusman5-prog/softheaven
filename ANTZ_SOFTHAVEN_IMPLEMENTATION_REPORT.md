# ANTZ SoftHaven — Admin & Supabase Implementation Report

## Architecture

Existing React 19 + Vite + TypeScript storefront preserved. A `/admin` route now uses Supabase Auth and reads live catalog/order data through the public client under RLS.

## Database and security

The migration `supabase/migrations/20260902120723_production_commerce_mvp.sql` adds catalog, media, orders, payments, inventory history, settings, contact, audit and role tables, indexes, RLS policies, and an atomic `create_order` function. Public reads are limited to active catalog content; admin reads require an authorized profile role.

## Implemented scope

Admin login, dashboard metrics, product and inventory tables, order table, responsive admin shell, LKR formatting, configurable environment names, and core bank-transfer/card payment state model. The storefront remains the supplied design.

## Verification and blockers

Run `npm ci`, `npm run typecheck`, and `npm run build`. Applying the migration and testing live Auth/RLS/provider flows requires the owner’s Supabase project and business inputs. This is not production-ready until the inputs in `LAUNCH_REQUIRED_INPUTS.md` are supplied, the migration is applied, storefront reads are fully migrated from the prototype catalog, and a real card provider plus server callback is configured and tested.
