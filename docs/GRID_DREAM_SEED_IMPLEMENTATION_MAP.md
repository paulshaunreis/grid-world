# Grid Dream Seed — Existing Implementation Map

**Status:** L0 source mapping plus first runtime adapter implemented. CI has verified the Dream Seed adapter/factory integration commit; persistent publication remains gated.

## Purpose

Dream Seed must extend the existing Grid World runtime rather than create a second world registry, second capability authority, or parallel persistence architecture.

The canonical path is:

`Dream Seed -> Blueprint -> validation/Measure gate -> existing WorldFactory -> existing GridWorldRegistry -> existing world capabilities -> existing world systems -> existing persistence/recovery -> verification -> publication/world link`

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

**Decision:** A Dream Seed blueprint may request capabilities, but requested capabilities are not user authorization. The existing world capability contract remains authoritative, and Dream Seed cannot grant `FULL` creator permissions.

### 3. Dream Seed runtime adapter

**Implementation:** `src/world/DreamSeedWorldAdapter.ts`

The first runtime slice now provides:

- typed `DreamSeedWorldBlueprint`
- required-field validation
- known-capability validation
- ecology-intensity validation
- rejection of `FULL` creator permissions
- normalized effective capabilities
- translation into the existing `GridWorldCreationRequest`

The adapter deliberately does **not**:

- create worlds directly
- grant user permissions
- persist seeds
- publish world links
- bypass existing world authority

**Decision:** Dream Seed remains an input/translation layer. Authoritative world creation stays with the existing factory/registry path.

### 4. Existing WorldFactory integration

**Implementation:** `src/world/WorldFactory.ts`

`GridWorldCreationRequest` now accepts optional world capabilities and passes them through the existing `registerNetworkWorld()` path.

This preserves the existing factory lifecycle and avoids a parallel Dream Seed generator.

**Observed implementation path:**

`DreamSeedWorldBlueprint -> validateDreamSeedBlueprint() -> toDreamSeedFactoryRequest() -> createWorldFromDescription() -> registerNetworkWorld()`

### 5. Creator/build integration

**Existing systems:**

- `src/world/GridEasyBuildSystem.ts`
- `src/world/GridMatterTerrainSystem.ts`

World capability gates are already wired into the runtime.

**Decision:** Dream-generated worlds should describe intended building/terrain behavior in the blueprint, then resolve those requests through existing capability gates. Dream Seed must not directly grant creator privileges.

### 6. Existing world population and living systems

The engineering state identifies existing living-world systems for NPC society, routines, ecology, missions, transit, economy, and world events.

**Decision:** Dream Seed should produce a structured world blueprint that feeds existing systems where compatible. It should not create a separate NPC, ecology, quest, economy, or transit stack.

### 7. Persistence and recovery

Existing engineering work already has persistence/cloud-world-state paths and background-service failure/recovery reporting.

Relevant prior work includes PR #51 and PR #52, which explicitly preserve the existing persistence architecture and surface failures rather than hiding them.

The verified factory seam also shows that `src/main.ts` creates the authoritative in-memory factory world through `WorldFactory`/the registry and then uses the existing `GridWorldAuthority.create()` path for persistent cloud registration. Persistence failure is surfaced while the local world remains active; it is not silently represented as durable success.

**Decision:** Dream Seed must use those existing persistence/recovery boundaries. A persistence/provider failure must never be represented as successful durable publication.

### 8. Publication boundary

Dream Seed does not currently publish a persistent world link automatically.

The required future sequence remains:

`APPROVED BLUEPRINT -> FACTORY CREATION -> PERSISTENCE VERIFICATION -> WORLD HEALTH CHECK -> PUBLICATION AUTHORIZATION -> WORLD LINK`

A generated preview must remain distinguishable from a persistent world.

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

Completed:

1. Keep the Dream Seed and Dream Seed Contract documents as the product/architecture specification.
2. Add a typed, inspectable blueprint representation.
3. Validate blueprint capability requests against `WorldCapabilityContract`.
4. Translate an approved blueprint into the existing `GridWorldCreationRequest`.
5. Pass the validated capability configuration through the existing WorldFactory into the existing registry.
6. Preserve separation between world capability configuration and user authorization.

Still gated:

7. Generate a non-authoritative preview using existing world presentation systems.
8. Record provenance and transformation history in the runtime persistence boundary.
9. Exercise failure/recovery states for the Dream Seed lifecycle.
10. Connect approved blueprints to persistent publication only after verification and approval.

## Verification requirement

The implementation must satisfy the existing Studio Workflow:

`branch -> implement -> analyzer/tsc/build -> CI -> cross-review -> Paul approval -> merge -> Render/deploy check`

Observed for the current implementation commit:

- GitHub Actions: **Grid World CI #1370**
- Commit: `dc6fb8e1f8e7863f9fa9663d274dd7110adf9cd2`
- dependency installation: passed
- TypeScript check: passed
- production build: passed

This is CI/source verification for the implementation commit. It is **not** browser, Render, deployment, production, or cross-review verification.

The Dream Seed PR remains draft and unmerged.

## Known boundary

The exact existing world-generation seam is now verified: `WorldFactory.createWorldFromDescription()` produces the authoritative world through `registerNetworkWorld()`, while `main.ts` performs the existing persistence registration through `GridWorldAuthority.create()`.

A dedicated Dream Seed persistence schema and automatic Dream Seed publication service have **not** been introduced or verified. Those should not be invented while existing authority boundaries are sufficient.

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
