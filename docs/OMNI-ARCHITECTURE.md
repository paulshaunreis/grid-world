# Omni Architecture

## Purpose

**Omni** is Grid World's financial/value layer. The long-term vision is an integrated system for Grid earnings, Grid Share distributions, Circular Credits, marketplace payments, and supported external assets.

**Omni Bank** is the eventual regulated financial-institution concept. The current software must not represent itself as a bank, deposit-taking institution, exchange, money transmitter, or custodian unless and until Grid Corporation obtains the required licenses, partnerships, approvals, and controls.

## Core Principle

> One financial interface for many forms of value, with transparent provenance and user choice.

## Value domains

- Fiat currencies
- Supported cryptocurrencies
- Grid Credits
- Circular Credits
- Creator earnings
- Grid Work earnings
- Grid Share distributions
- Grants and community funds
- Marketplace proceeds

## Architecture

```
Grid Corporation
├── Grid Economy
│   ├── Grid Work
│   ├── Marketplace
│   ├── Grid Share
│   ├── Community Funds
│   └── Grid Circular
└── Omni
    ├── Identity & Accounts
    ├── Ledger
    ├── Wallet Abstraction
    ├── Payments
    ├── Payouts
    ├── Asset Registry
    ├── Conversion
    ├── Compliance Boundary
    ├── Risk & Fraud
    └── Audit
```

## Ledger-first design

Every value-changing event should have a durable, auditable record:

- actor
- counterparty
- asset type
- amount
- direction
- source
- destination
- reference
- status
- timestamp
- authorization context
- reversal/correction record where applicable

Client applications must never directly mutate authoritative balances.

## Asset abstraction

Omni should use an asset interface rather than hard-code a single currency.

An asset definition can include:

- stable identifier
- display symbol
- asset class
- precision
- issuer/network
- custody model
- transfer capability
- conversion capability
- jurisdiction/availability metadata
- risk status

This allows Grid Credits, Circular Credits, fiat rails, Bitcoin, Dogecoin, Ethereum, and future supported assets to share infrastructure without pretending they are legally or economically identical.

## Internal credits

Grid Credits and Circular Credits are platform instruments, not automatically bank deposits or government currency.

Circular Credits require verified real-world activity before issuance.

## Security boundary

- No private keys in frontend code.
- No service-role/database-admin credentials in clients.
- No client-authoritative balance changes.
- No unrestricted transfer API.
- Sensitive financial operations require server-side authorization.
- Every privileged operation is logged.
- Fraud, abuse, sanctions, identity, age, tax, and other compliance requirements belong behind a dedicated compliance boundary before real-money launch.

## Product phases

### Phase 0 — Foundation
- terminology
- architecture
- ledger contracts
- asset abstraction
- test fixtures
- no real-money custody

### Phase 1 — Grid Economy
- internal earnings records
- Grid Work
- marketplace balances
- Grid Share accounting model
- community-fund accounting

### Phase 2 — Circular
- verified recycling/reuse events
- Circular Credits
- provenance records
- partner verification interfaces

### Phase 3 — External rails
- licensed/partner payment providers
- supported fiat payout methods
- supported crypto rails
- deposits/withdrawals only where legally and operationally supported

### Phase 4 — Omni Bank
- evaluate regulated-bank, fintech-partner, or other legally appropriate structure
- licensing and compliance
- custody/payment infrastructure
- consumer protection
- audited financial controls

## Non-negotiables

1. Never promise a user that an internal credit is cash.
2. Never promise investment returns.
3. Never allow creators or users to bypass the authoritative ledger.
4. Never add an asset solely because it is fashionable.
5. Never sacrifice financial safety for launch speed.
6. Keep the basic Grid platform free where the business model permits it.
7. Publish understandable rules for fees, eligibility, distributions, and conversions.

## Relationship to Grid Share

Grid Share is an accounting/distribution system. It should feed eligible distributions into Omni only after the distribution has been authorized and recorded.

## Relationship to Grid Circular

Grid Circular creates verified environmental activity records. Omni may receive an authorized credit issuance event; it must not fabricate value merely because a user reports recycling.

## Future physical Omni locations

If Grid Corporation eventually operates physical facilities, Omni locations should support circular operations, accessible service, secure identity verification where required, and responsible handling of devices/materials.

## Implementation rule

Build the financial abstractions before connecting real money.

The prototype should be useful with simulated balances and test assets while preserving a clean path to compliant external rails later.
