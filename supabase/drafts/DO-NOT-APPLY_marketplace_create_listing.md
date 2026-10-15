# DO-NOT-APPLY — Marketplace create-listing shared-backend verification

Status: DRAFT NOTE ONLY. This file is not a migration. Do not run it against any
database. It exists so the shared-listings work is scoped honestly, not guessed.

## What the client does today (branch aurora/marketplace)

- Browse reads live `grid_marketplace_listings` with the exact column list the
  repo code already selects:
  `id, seller_staff_id, title, description, category, currency_id, price,
  inventory_limit, art_key, status, created_at`, filtered `status = 'published'`.
- Create-listing saves to **this browser only** (localStorage key
  `gridworld-marketplace-my-listings-v1`). Listings are labeled
  "YOUR LISTING · SAVED IN THIS BROWSER" and are not visible to other citizens.
- Buy dialog never spends GWC, never creates an order. Payments are disabled.

## Why create-listing is NOT wired to Supabase yet

Phase 0 (see `hidden_files/phase0-live-db-results-2026-10-15.md`) captured table
**names** only for the marketplace tables. For `grid_marketplace_listings`,
`grid_marketplace_orders`, `grid_marketplace_protection_rules`, `grid_bazaar_listings`,
`grid_shops`, and `grid_shop_listings`, Phase 0 captured NO columns, NO RLS
policies, and NO grants. Writing an INSERT or a migration now would be guessing
at the live schema — the exact failure mode Phase 0 exists to prevent.

## What must be verified live BEFORE wiring create-listing to Supabase

Run these read-only queries in the Supabase Dashboard SQL Editor (same style as
the Phase 0 follow-up runs) and record the full outputs:

1. Columns:
   `select table_name, column_name, data_type, is_nullable, column_default
   from information_schema.columns where table_schema = 'public'
   and table_name in ('grid_marketplace_listings','grid_marketplace_orders',
   'grid_marketplace_protection_rules','grid_bazaar_listings','grid_shops',
   'grid_shop_listings') order by table_name, ordinal_position;`
2. RLS policies:
   `select tablename, policyname, permissive, roles, cmd, qual from pg_policies
   where schemaname = 'public' and tablename in ('grid_marketplace_listings',
   'grid_marketplace_orders','grid_shops','grid_shop_listings')
   order by tablename, policyname;`
3. Grants:
   `select grantee, table_name, privilege_type
   from information_schema.role_table_grants where table_schema = 'public'
   and grantee in ('anon','authenticated') and table_name in
   ('grid_marketplace_listings','grid_marketplace_orders',
   'grid_marketplace_protection_rules','grid_bazaar_listings','grid_shops',
   'grid_shop_listings') order by table_name, grantee, privilege_type;`

## Wiring rules once the live schema is captured

- The client INSERT must use only columns confirmed to exist live, and must
  respect the live RLS insert policy (if authenticated users cannot INSERT,
  shared listings need a SECURITY DEFINER RPC or a policy change — Paul's call,
  not a unilateral client-side bypass).
- The assumed insert shape (to be confirmed, NOT applied): title, description,
  category, currency_id = 'grid', price (GWC), inventory_limit, art_key,
  status = 'published', seller = auth.uid(). `seller_staff_id` in existing reads
  is staff-shaped; the client must NOT invent a staff id for citizen sellers —
  confirm the live column's meaning first.
- Until then, this file stays a note. No migration is drafted here on purpose.
