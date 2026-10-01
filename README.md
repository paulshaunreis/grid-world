# Grid World

Grid World is a persistent 3D social-world project. The first milestone is **First Light**: a small, explorable world that establishes the core client architecture before multiplayer, persistence, creation tools, and economy systems are added.

## Current foundation

- Vite + TypeScript
- Three.js renderer
- Third-person prototype avatar
- WASD movement
- Shift sprint
- Space jump
- Mouse-look pointer lock
- Directional + hemisphere lighting
- Fog and large world grid
- Procedural environment layer: terrain fields, habitat bands, atmosphere, weather motion, and climate-driven particles
- World-DNA-driven architecture, flora, creatures, ecology, migration, and evolution
- Basic trees and landmark geometry

## Run locally

```bash
npm install
npm run dev
```

## Roadmap

1. First Light — playable local world
2. Avatar system — appearance, animation, camera modes
3. Interaction — click/use/pick-up/place
4. Persistence — accounts, inventory, saved world objects
5. Multiplayer — authoritative sessions and player synchronization
6. Social — chat, friends, groups, teleporting
7. Creation — user-built objects and regions
8. Economy — ownership, trading, marketplace
9. Regions — streaming, instancing, scalable servers

The architecture should stay modular so networking and persistence can be introduced without rebuilding the client.

## Living World principle

A world description is treated as environmental DNA. Generated worlds can receive their own architecture, climate, atmosphere, habitat bands, flora, fauna, weather, ecological interactions, seasonal changes, and emergent life without a fixed world-count limit. The public website mirrors this direction with a living-world visual atlas and live Grid signals.


## Chemistry, energy and consequence systems

- **Grid Chemistry** models all 118 periodic-table elements and connects mineral formulas to elemental composition and geological formation families.
- **Grid Minerals** uses chemistry-aware world tags so generated deposits respond to volcanic, hydrothermal, metamorphic, sedimentary, weathering, silica, fluorine and carbon signatures.
- **Grid Chakra** is a fictional/spiritual resonance system inspired by varied chakra traditions; it is gameplay energy, not a medical or scientific claim.
- **Grid Alchemy** provides fictional transformation recipes using mineral inputs, elemental catalysts and energy costs.
- **Grid Karma** tracks consequence history for any subject, including users and NPCs, and exposes karma, luck and streak state for missions, achievements and chance events.
- Elemental laboratory worlds include Emberforge, Azurevault, Aetherion, Verdantium and Primordia for testing world generation and emergent geology.

The project uses these systems as independent layers so future worlds can combine chemistry, geology, ecology, energy, narrative consequence and sandbox gameplay without introducing a fixed world-count ceiling.

## NPC profiles, Bazaar, Omni Bank and Vault

Grid World NPCs are first-class profile entities with role, archetype, personality, autonomy, schedules and persistent public memory logs. Merchant NPCs participate in the economy and can have Bazaar listings.

The economy now includes three dedicated worlds: **Grid Bazaar** for user/NPC trading, **Grid World Omni Bank** for wallets and ledger services, and **Grid World Vault** for persistent mined-asset storage. Mined minerals are reflected in the player's inventory with authoritative quantities and are also secured in the Vault.

Bazaar listing, purchase, mining and transmutation operations are server-authoritative. User listings reserve inventory before publication; purchases transfer currency and assets atomically; NPC sales create trade/memory records. Client-side controls are not treated as economic authority.

Grid Element Forge supports fictional Grid-universe synthetic elements beyond the real 118-element periodic table: **Aurorium (Ao, 119)**, **Luminite (LuG, 120)** and **Verdanium (Vd, 121)**. These are gameplay elements, not claims about newly discovered real-world elements.


## Identity, land and sustainable revenue model

**Identity:** Grid uses Supabase Auth for email/password authentication. Hosted Supabase projects require email confirmation by default; MFA is supported and should be enabled for higher-risk accounts. Public identity uses a unique **@handle** plus a shareable display name; first, middle and last names are stored separately with an explicit visibility setting. NPCs use the same three-part naming model and can have unique handles.

**Free land:** a verified account can claim one starter parcel from the available starter pool. Starter land is not minted by the client and cannot be claimed twice. Larger parcels are intended to be earned through creation/community milestones rather than forcing new users to pay for basic participation.

**Earned worlds:** a world charter requires verified-account status plus a server-maintained creation score. The initial target is 100 creation points earned through legitimate world building, quests, community contributions and published work. Client-side score edits are not authoritative.

**Sustainable real-money model:** keep entering Grid World free. Potential platform revenue streams are:
1. optional creator/pro subscriptions for advanced authoring, analytics, private collaboration and higher hosted-world resources;
2. creator marketplace fees on real-money sales, with a transparent creator share;
3. paid cosmetic/avatar/world presentation packs that do not grant gameplay power;
4. hosted private/team worlds and event/concert infrastructure;
5. enterprise/education creator spaces and training/certification services;
6. optional physical merchandise and media/events.

The design deliberately avoids making a basic starter parcel or normal participation pay-to-win. Real-money checkout should be implemented server-side through a payment provider such as Stripe Checkout; Stripe documents Checkout Sessions for one-time payments and subscriptions, and Stripe Connect can support application-fee/platform models for creator marketplaces.

**Important:** no real-money charge is claimed to be live yet. A Stripe account, products/prices, tax configuration, webhook endpoint, and secret server-side credentials are required before actual payments can be safely activated.


## Omni Bank monetary policy

Every completed verified account can receive a **one-time 100 GRID starter grant** from the server-authoritative Omni Bank reserve. The grant is not created by the browser, is protected by an idempotency key, requires completed onboarding, and is capped by the bank's issuance reserve.

The initial Omni Bank Grid reserve is **1,000,000 GRID**, with a matching lifetime issuance cap. This is an in-world currency reserve, not a promise that GRID is redeemable for USD or another real-world currency.

To keep the economy supplied without treating Grid Corporation's real-world cash as the funding source, the monetary policy reserves **1% of eligible in-world economic volume** for the Omni Bank circulation pool, subject to the reserve cap. This is a controlled virtual-economy issuance rule: it is not a claim that Grid Corporation gives away 1% of its real-world revenue.

The intended loop is:

**economic activity → 1% controlled circulation allocation → Omni Bank reserve → starter grants / approved economic programs → users spend → creators and NPC merchants receive → economy circulates**

The recycling operation is server-only. Users cannot call it, change the percentage, increase the reserve cap, or mint currency directly.
