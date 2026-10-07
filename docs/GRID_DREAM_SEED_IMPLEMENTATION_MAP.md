# Grid Dream Seed — Existing Implementation Map

**Status:** L0 architecture/source mapping only. No production behavior changed.

## Purpose

Dream Seed must extend the existing Grid World runtime rather than create a second world registry, second capability authority, or parallel persistence architecture.

The canonical path is:

`Dream Seed -> Blueprint -> existing GridWorldRegistry -> existing world capabilities -> existing world systems -> existing persistence/recovery -> verification -> world link`

## Confirmed reuse points

### 1. World identity and unlimited-world topology

**Canonical authority:** `src/world/GridWorldRegistry.ts`

The existing registry already provides:

- `GridWorldId`
- `GridWorldDefinition`
- `registerWorld()`
- `upsertWorld()`
- `registerNetworkWorld()`
- `connectWorld()`
- `getWorld()`
- `getWorlds()`
- `getWorldConnections()`
- `getWorldCenter()`

The registry explicitly uses an unlimited-world model:

> There is no hard-coded maximum number of worlds.

**Decision:** Dream Seed must create world definitions through this existing authority. It must not introduce a second registry or hard-coded world-slot model.

### 2. World capability contract

**Canonical authority:** `src/world/WorldCapabilityContract.ts`

Existing capability dimensions include:

- transit
- PvE
- PvP
- building
- terrain sculpting
- marketplace
- social/event spaces
- ecology intensity
- creator permissions

Capabilities are normalized when worlds are registered/upserted and exposed through `getWorldCapabilities()`.

**Decision:** A Dream Seed blueprint may request capabilities, but requested capabilities are not authorization. The existing world capability contract remains authoritative.

### 3. Creator/build integration

**Existing systems:**

- `src/world/GridEasyBuildSystem.ts`
- `src/world/GridMatterTerrainSystem.ts`

World capability gates are already wired into the runtime.

**Decision:** Dream-generated worlds should describe intended building/terrain behavior in the blueprint, then resolve those requests through existing capability gates. Dream Seed must not directly grant creator privileges.

### 4. Existing world population and living systems

The engineering state identifies existing living-world systems for NPC society, routines, ecology, missions, transit, economy, and world events.

**Decision:** Dream Seed should produce a structured world blueprint that feeds existing systems where compatible. It should not create a separate NPC, ecology, quest, economy, or transit stack.

### 5. Persistence and recovery

Existing engineering work already has persistence/cloud-world-state paths and background-service failure/recovery reporting.

Relevant prior work includes PR #51 and PR #52, which explicitly preserve the existing persistence architecture and surface failures rather than hiding them.

**Decision:** Persistent Dream Worlds must use existing persistence/recovery boundaries. A provider or persistence failure must never be represented as successful world creation.

## Dream Seed -> runtime boundary

### Seed layer

Owns:

- original user input/reference
- consent/visibility
- Reality class
- provenance
- interpretation version
- blueprint version
- transformation history
- retention/deletion state

### Blueprint layer

Owns:

- world identity intent
- terrain/geography
- climate/weather
- architecture
- materials
- flora/fauna intent
- NPC population intent
- points of interest
- requested capabilities
- generation constraints
- provenance
- validation state

### Runtime layer

Owns:

- authoritative world registration
- capability resolution
- actual simulation
- persistence
- permissions
- economy
- social systems
- NPC systems
- transit
- world health
- recovery

### Publication layer

Owns:

- verification result
- publication authorization
- world link
- creator attribution
- user notification

## Important separation

A Dream Seed is **not**:

- a world
- a permission grant
- a currency authority
- a land authority
- a moderation decision
- a legal conclusion
- an Omni Core command
- an instruction to bypass existing world capability contracts

A preview is also not a persistent world.

## First implementation slice

The safest next implementation is:

1. Keep the current Dream Seed and Dream Seed Contract documents as the product/architecture specification.
2. Add a typed, inspectable blueprint representation.
3. Validate blueprint capability requests against `WorldCapabilityContract`.
4. Resolve an approved blueprint into a `GridWorldDefinition` without creating a parallel registry.
5. Generate a non-authoritative preview using existing world presentation systems.
6. Record provenance and transformation history.
7. Exercise failure/recovery states before persistent generation.
8. Only after that, connect approved blueprints to persistent world creation.

## Verification requirement

The implementation must eventually satisfy the existing Studio Workflow:

`branch -> implement -> analyzer/tsc/build -> CI -> cross-review -> Paul approval -> merge -> Render/deploy check`

Until those checks are actually observed, Dream Seed work must remain labeled at its observed verification level.

## Known boundary

The current source mapping confirms the world registry and capability contracts. A dedicated production Dream Seed persistence schema and world-generation service have **not** been verified as existing implementation surfaces in this pass.

Therefore the next engineering step is to inspect the actual persistence/generation seams before writing production schema or generation code.

## Measure-before-cut

Before persistent Dream World creation, measure:

1. source/provenance
2. identity/authorization
3. evidence/context
4. requested capabilities
5. applicable rights/policy
6. safety and peace impact
7. dependency impact
8. persistence/recovery
9. reversibility
10. verification
11. dissent/alternative interpretation
12. publication authority

**If a material answer is unknown, do not silently convert the blueprint into a persistent world.**
