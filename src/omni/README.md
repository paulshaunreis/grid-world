# Omni

Omni is Grid's value and financial-domain boundary.

The current implementation is **internal accounting only**. It does not custody real money, hold private keys, connect to banks, or execute external transfers.

## Initial modules

- `Asset.ts` — asset identity and metadata
- `Ledger.ts` — append-only value movement records
- `index.ts` — public domain exports

## Rules

1. Balances are derived from ledger events; clients do not authoritatively set balances.
2. Every ledger entry identifies its asset.
3. Internal Grid credits are distinct from fiat and cryptocurrencies.
4. External rails are adapters, not part of the core ledger.
5. Reversals are new compensating entries, never destructive edits.
6. Real-money operations require a future server-side authorization/compliance boundary.
