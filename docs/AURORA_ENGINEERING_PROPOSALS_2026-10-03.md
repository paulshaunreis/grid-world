# Aurora Engineering Proposals — 2026-10-03

**Classification:** AURORA-DECISION / FUTURE-IDEA proposals only. Nothing in this document becomes Grid World canon merely because it is written here.

## Why these proposals

Aurora's current queue repeatedly emphasizes:
- audit existing systems before creating new ones;
- preserve one source of truth;
- keep concept-only regions separate from playable systems;
- make failures visible without creating a second UI architecture;
- keep the world/region/chunk model expandable;
- verify implementation separately from CI/browser/Render verification.

The following additions are designed to extend those principles rather than replace them.

## Proposed next-layer ideas

### 1. World Capability Contract
Give each registered world a small machine-readable capability profile:
- transit
- PvE
- PvP
- building
- terrain sculpting
- marketplace
- social/event spaces
- ecology intensity
- creator permissions

Use it to gate existing systems instead of scattering world-specific conditionals through `main.ts`.

**Benefit:** new worlds can differ substantially without creating bespoke runtime branches.

### 2. World Pulse / Diagnostics
Add a read-only diagnostics snapshot per active world:
- simulation clock
- weather/season
- ecology population
- NPC working/talking counts
- active quests/events
- persistence health
- transit health
- loaded chunk count
- last successful synchronization times

Expose it first to the existing Operator/Team surfaces, not as a new player UI.

**Benefit:** Aurora and future engineers can diagnose a living world without guessing from visual symptoms.

### 3. District Role Contract
Aurora's district notes require every built region to have residential, market, transit/gateway, and civic anchors, with parks/entertainment as social glue.

Represent those as data requirements on a region definition. The validator should warn when a new *implemented* region is incomplete, while leaving concept-only maps untouched.

**Benefit:** the district notes become machine-checkable design guidance without turning concept art into gameplay.

### 4. Event/Consequence Ledger
The existing world-consequence/history systems could become the common audit trail for major world changes:
- ecology shifts
- creature defeats
- resource changes
- major NPC stories
- weather events
- creator changes
- world discoveries

Keep it bounded and world/chunk scoped.

**Benefit:** this creates a foundation for history, quests, NPC memory, player profiles, and future replay/debug tooling without another event architecture.

### 5. NPC Memory Provenance
When an NPC memory is created, retain lightweight provenance:
- source event ID
- location/world
- timestamp
- confidence
- whether the memory came from observation, conversation, work, combat, or system consequence

**Benefit:** NPC profiles can eventually explain *why* a relationship or belief changed instead of presenting opaque stats.

### 6. Teleport Route Graph
The existing destination-selection system is already the authority boundary. Add a derived route graph later:
- direct gate
- multi-hop route
- access requirement
- estimated travel time
- destination preview
- route availability

Do not replace the current destination picker.

**Benefit:** this scales naturally when the number of worlds and regions becomes very large.

### 7. World Lifecycle Hooks
Formalize:
IDENTIFY → LOAD STATE → CATCH UP → GENERATE → ACTIVE → SIMULATE → PERSIST → UNLOAD

The current architecture already documents this lifecycle. The next step would be small typed hooks/events at each boundary, with instrumentation before adding complex streaming.

**Benefit:** bounded offline simulation, chunk streaming, persistence, and future multiplayer can share one lifecycle rather than developing separate state machines.

### 8. Verification Matrix
Keep a tiny machine-readable record of:
- L0 source review
- type/build verification
- CI
- Render deployment
- browser/WebGL
- human click-through

A feature is not marked fully verified until the relevant levels are actually observed.

**Benefit:** prevents the recurring situation where merged code is mistaken for live/browser-verified code.

## Suggested implementation order

1. Finish the current stability audit.
2. Establish World Pulse/Diagnostics as read-only instrumentation.
3. Add the World Capability Contract.
4. Add District Role validation for implemented regions only.
5. Add lifecycle instrumentation before deeper streaming/catch-up work.
6. Add NPC memory provenance and route-graph derivations only after their existing authority boundaries are confirmed.

## Explicit non-goals

- No replacement UI framework.
- No second economy/combat/quest/profile architecture.
- No automatic promotion of concept-only districts.
- No client-side authority for protected state.
- No assumption that a fixed number of worlds or regions exists.
