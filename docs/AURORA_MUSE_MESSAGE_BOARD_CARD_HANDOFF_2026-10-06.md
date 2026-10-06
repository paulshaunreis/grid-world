# Aurora / Muse Engineering Handoff — Message Board + Grid Relics + Identity Economy
Date: 2026-10-06
Classification: DESIGN HANDOFF / implementation planning

## AI-to-AI operating note

Aurora, Muse: treat this document as an implementation handoff, not as permission to invent a second architecture.

Preserve existing authority boundaries. Inspect first. Extend existing systems where they already own the relevant state. Do not duplicate forum, social, inventory, economy, tournament, profile, realtime, or UI-window systems merely because the desired presentation is new.

User-facing explanations must stay ordinary and concrete. Internal engineering notes may be precise and machine-oriented.

### Execution model

AUDIT -> IDENTIFY EXISTING AUTHORITY -> EXTEND -> VERIFY -> REPORT

Do not collapse:
implemented
committed
PR
merged
CI verified
deployed
browser verified

into one status.

## Workstream A — Shared Message Board

### Objective

Create one live board visible from:
1. Grid World in-world Social/HUD surface.
2. Signed-in website.

Both clients consume the same authoritative forum records.

### Existing authority

PR #88 is the current forum-content-rating RLS hardening work. Before modifying schema:
- inspect current forum tables;
- inspect current RLS policies;
- inspect existing realtime subscriptions;
- inspect current social/profile identity fields;
- inspect existing website navigation and in-world Social Manager;
- identify whether an existing thread/post schema already satisfies the persistence requirement.

Do NOT create a new forum database if the existing schema is suitable.

### Required data flow

CLIENT A -> AUTHENTICATED API/RPC -> POSTGRES AUTHORITY -> REALTIME EVENT -> CLIENT A + CLIENT B

The website must remain usable without WebGL.

### Required features

Categories:
WORLD
NEWS
MARKET
CARD TABLE
QUESTS
CREATOR
GUILDS
LORE
SOCIAL
HELP

Future rumor/unofficial layer is optional and must be visibly community-authored.

Each post/thread should have stable IDs, author identity, timestamps, moderation state, content rating, and bounded pagination.

### Identity

Expose public Grid Handle beginning with @.

Do not expose private/account identity fields through social APIs unless explicitly intended by profile privacy rules.

Handle uniqueness must be authoritative.

### Abuse/security

Browser filters are presentation only.

Enforce at database/API boundary:
- author ownership;
- moderator authority;
- report/block/mute;
- content rating;
- anti-spam/rate limits;
- bounded query sizes;
- safe edit/delete semantics;
- no client-supplied privileged roles;
- no client authority over reputation/currency/prizes.

### Realtime UX

Website post -> in-world board receives update without reload.

In-world post -> website receives update without reload.

Reconnect must resynchronize from authoritative state; do not trust missed realtime events as durable state.

### UI

Reuse existing Social Manager/GridSnap window architecture.

Do not create a second window manager.

Visual direction:
ancient archive + advanced network + saturated neon history.

Use:
etched glyphs
archival borders
translucent technical panels
signal traces
message-arrival pulse
restrained scan/data motion
reduced-motion support

## Workstream B — Grid Relics card game

Working title only: Grid Relics.

This is an original Grid World game inspired by successful patterns from major TCGs, not a clone.

### Card types

Relic
Entity
Technique
Site
Protocol
Echo

### Working resource

Resonance.

Provisional. Must be tested before canonization.

### Board

1 Core/Relic
5 Entity lanes
3 Site/Protocol slots
Archive/discard
Reserve
Resonance
history/replay

### Turn rhythm

Draw
Synchronize
Deploy
Clash
Resolve
Archive

### Design constraints

Fast enough for digital play.
Readable on desktop and phone.
Deep enough for tournament play.
Strong archetype identity.
Cards must have useful strategic identity, not merely rarity.
Old cards can be valuable through scarcity/provenance/usefulness, not guaranteed financial appreciation.

### Packs

Starter Archive
Booster Pack
Archive Pack
Relic Vault
World Pack
Event Pack
Creator Pack
Draft Kit

Pack opening should be an event:
seal -> glyph activation -> energy leakage -> card rise -> rarity reveal.

Do not build monetization before server-authoritative ownership and anti-duplication rules exist.

### Tournament system

Required future formats:
casual
ranked
scheduled
seasonal
sealed
draft
guild/team
world-region

Rewards:
Grid Coin
cosmetic trophies
titles
visual effects
prestige
card products

Prize issuance must be server-authoritative.

## Workstream C — Identity / surnames

Seed file:
data/grid-starter-surnames-v0.1.txt

Contains 12,000 generated candidates.

These are NOT automatically production-approved.

Pipeline:
GENERATED -> DUPLICATE CHECK -> SAFETY SCREEN -> RESERVED-NAME CHECK -> LOCALIZATION REVIEW -> APPROVED POOL

The public identity model remains:
first name + middle name + last name
+
unique @GridHandle

## Workstream D — Economy / land

The user wants the economy to make participation feel exciting.

Legitimate earning loops:
jobs
quests
gathering
crafting
creator sales
marketplace
card play
tournaments
land businesses
events
discoveries
collectibles

Do not create an economy where value depends solely on later buyers.

Land acquisition should show:
region
district
terrain
nearby landmarks
travel
capabilities
parcel size
development potential
business/creator use
ownership history where privacy permits

Protect claims with database constraints/transactions. Never rely on client-side uniqueness checks.

## Workstream E — Visual / animation

The visual target is:
World of Warcraft sense of readable game systems
+
Cyberpunk 2077 saturated technical history
+
Second Life creator ownership
+
.hack-style persistent virtual-world social layer

Important: Grid World is NOT neon-only. Different worlds retain distinct aesthetics.

Card visual target:
ancient relic artifact + futuristic technical interface.

Concept-study card composition:
approximately golden-ratio portrait proportion, target 1:1.618.

Use original Grid World iconography, glyphs, world symbols, and card frames.

## Acceptance gates

Message Board:
- same thread visible on both surfaces;
- realtime update verified both directions;
- rating and authorization enforced server-side;
- offline/reconnect state tested;
- mobile/desktop layout tested.

Cards:
- deterministic authoritative ownership;
- duplicate/copy abuse blocked;
- pack opening animation does not grant client-authoritative inventory;
- first playable rules prototype documented;
- accessibility motion/sound controls.

Identity:
- handle uniqueness enforced;
- 12k seed candidates screened before production use.

Economy:
- transactions server-authoritative;
- land race conditions tested;
- currency issuance paths audited;
- no client-authoritative reward path.

## Do not do yet

Do not:
- promote concept-only worlds into gameplay;
- create a second forum architecture;
- create a second window framework;
- make generated surname candidates automatically canonical;
- promise card/land profit;
- copy .hack terminology/story;
- copy copyrighted card-game rules or card text;
- call a design concept implemented until it is actually built and verified.
