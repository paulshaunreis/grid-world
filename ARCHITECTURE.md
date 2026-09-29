# Grid World Architecture

## Client layers
- Core — input, player controller, interaction, camera.
- World — regions, terrain, lighting, landmarks, starter zones, world objects.
- Persistence — account/world-state adapters.
- Networking — realtime presence and future authoritative synchronization.
- UI — HUD, inventory, chat, social and creator surfaces.
- Scripting — capability-bounded Grid Code and Grid World Studio packages.

## Interaction contract
World objects expose an interactable flag and optional interaction name. The interaction system raycasts from the center of the player's view and returns the first interactable object.

This keeps interaction independent from networking. Later, an interaction can become a server-authorized action without replacing the client-facing interface.

## Multiplayer direction
The eventual authoritative model should treat the server as the source of truth for player identity, player state, ownership, world object state, permissions, and persistence.

The browser client remains responsible for presentation, input, prediction/interpolation, and rendering.

# Grid World — Futureproofing Contract

## Core rule

Grid World is built around replaceable systems and stable contracts. A feature may evolve internally without forcing every consumer to change at the same time.

## Compatibility
- Persisted client data is versioned and migrated explicitly.
- Network payloads are treated as contracts, not implementation details.
- Database schema changes must be additive first, followed by migration, verification, and only then removal.
- UI mods have stable IDs and semantic versions.
- Region IDs are stable identifiers; display names may change.
- Player identity separates local-device identity from authenticated account identity.
- Feature flags allow gradual rollout and emergency disablement.
- Unknown fields must be ignored where safe so newer clients can communicate with older data.

## System boundaries

### Client
Owns presentation, input, local prediction, interpolation, UI, and graceful offline behavior.

### Services
Own authentication, authoritative state, persistence, moderation, economy, and other security-sensitive operations.

### World data
Is data-driven wherever practical. Regions, objects, interactions, scripts, UI modules, and content should not require engine rewrites to add ordinary content.

### Engine boundary
Gameplay content should depend on stable Grid interfaces rather than directly depending on Three.js, Supabase, or another infrastructure vendor.

Target boundary:

Client / Renderer
→ Grid World Runtime API
→ Simulation Services
→ Persistence / Events

A future renderer, native client, server runtime, or storage provider should be replaceable behind these interfaces.

## UI platform
The UI runtime is a platform layer:
- Window Manager controls movement, sizing, stacking, visibility, and layout persistence.
- UI Mod Registry controls module lifecycle.
- UI modules communicate through explicit APIs instead of reaching into unrelated modules.
- Layout data is versioned.
- A future server-synced profile can replace local layout storage without changing window consumers.

## Creator platform

### Grid Code
Grid Code is declarative and HTML-like. It compiles to a restricted intermediate representation.

It must never provide arbitrary JavaScript execution, credentials, unrestricted networking, filesystem access, or raw database access.

### Grid World Studio
Grid World Studio packages a creator-authored experience as a versioned manifest:
- stable package ID
- semantic version
- creator identity
- region/template identity
- Grid Code
- declared capabilities
- required assets
- publication state
- provenance
- rollback parent

The compiler verifies that every capability required by Grid Code is explicitly declared by the package.

Grid World Studio is designed to support the lesson demonstrated by Ryzom Ring: creator tools become much more powerful when authors can build, test and publish experiences without engine-level programming.

## Mod safety
Mods should be capability-bounded. They must not receive arbitrary access to authentication tokens, service-role credentials, raw database access, unrestricted network access, arbitrary DOM outside their declared UI surface, or arbitrary code execution through user-authored world scripts.

## Persistence
Use an explicit migration chain: old schema -> migration -> current schema. Never silently reinterpret old data.

World content should preserve provenance and version history so published experiences can be rolled back or archived without erasing their history.

## Networking
Use authoritative server state for identity, ownership, permissions, economy, and persistent world state. Clients may predict and interpolate, but server-authoritative systems determine durable truth.

## Simulation budgets
Simulation detail is independent of rendering detail.

- Dormant — persistent data only.
- Ambient — low-cost environmental updates.
- Active — detailed simulation near players.
- Social — population and economic interactions.
- Event — elevated simulation around important events.
- Critical — maximum bounded budget.

Regions should be able to degrade simulation fidelity safely under load rather than becoming unavailable.

## Production
Every major feature follows: Design -> Prototype -> Playable -> Playtest -> Harden -> Ship -> Observe -> Iterate.

A feature is not production-ready merely because its implementation compiles.

## Operational safety
Every service-facing feature should have explicit failure behavior, retry/backoff where appropriate, timeout handling, observable status, migration/rollback strategy, and documented ownership.

## Dependency policy
- Prefer small, well-supported dependencies.
- Pin critical versions and commit lockfiles.
- Do not couple game logic directly to vendor SDKs when an internal interface can isolate them.
- Replace infrastructure through adapters rather than rewriting gameplay.

## Operational quality
A five-star system state is earned through capability checks, automated tests, observable health and recovery behavior. A visual 5/5 indicator must never be treated as a guarantee of security, uptime or correctness.

## Universal Grid Measurement
Grid World uses **GU (Grid Units)** as its canonical spatial unit. 1 GU = 1 metre. Interfaces can display GU, metres, feet, or inches without changing the underlying world data.

## Starter zones
Every account receives a personal starter zone assignment. First Light is the default starter region in the prototype. Starter zones teach movement, identity, measurement, building, safety, social interaction and Grid Code before the traveler enters broader public regions. Starter-zone state should become persistent account/world data rather than a client-only scene.

## Grid Omni response presence
Grid Omni Security can escalate a detected signal into a world-visible safety response. NPC sentinels may appear, move to the affected location, hold a perimeter, guide the user away, or return to patrol. The sentinel is a response agent, not proof that a threat exists: its appearance means the system detected enough uncertainty or risk to justify observation/containment.

## Ryzom lessons
Ryzom's strongest architectural ideas for Grid are:
- world identity and ecology
- classless/composable identity
- modular actions
- creator-authored experiences
- community continuity
- open tooling and durable world data

Its major caution is equally important: ambitious systems must be introduced as independently useful, bounded and observable capabilities. A living world cannot depend on every subsystem working perfectly at once.

See `docs/RYZOM_LESSONS.md` for the detailed design translation.


## Grid Omni organizational tree

**Grid Omni Core** is the root organizational layer above every Grid Omni service. It is not a peer of Security, World, Wallet, or the other domains.

```
Grid Omni Core
├── Grid Omni Security
├── Grid Omni Identity
├── Grid Omni World
├── Grid Omni Social
├── Grid Omni Creator
├── Grid Omni Market
├── Grid Omni Wallet
├── Grid Omni Sound
├── Grid Omni Events
├── Grid Omni Media
├── Grid Omni Connect
└── Grid Omni Archive
```

Services may contain their own subsystems and capabilities, but their stable organizational parent is Grid Omni Core. This gives the platform one durable namespace and makes future Omni services additive rather than architectural rewrites.

### Measure Ten Times, Cut Once

Grid Omni Core provides a pre-change safety gate for high-impact Grid Engine changes. Before activation, a proposal checks ten things:

1. change identity
2. target scope
3. clear summary
4. accountable owner
5. executable tests
6. rollback plan
7. supporting evidence
8. reversibility appropriate to risk
9. dependency review
10. data-impact and observability readiness

The gate is a safety mechanism, not a guarantee. Critical changes should still receive independent review and production verification. A failed gate blocks activation rather than silently accepting an unsafe change.

## Grid Engine 0.1

Grid Engine 0.1 now has an explicit engine-core subsystem. Its responsibilities are deliberately narrow:

- expose the Grid Omni Core organizational contract
- expose the pre-change security gate
- coordinate stable engine-owned boundaries
- remain independent of the current Three.js renderer

The engine should grow outward from these contracts: entity/object model, Grid World Format, authoritative simulation, networking, asset lifecycle, creator preview, and replaceable renderer backends.


## Grid Engine 0.1 — Entity & Object System

Everything persistent in the Grid world is represented through a stable entity/object contract.

```
Grid Entity
├── Transform (GU canonical)
├── Metadata
├── Components
└── Stable ID

Grid Object
├── Entity
├── Kind
├── Permissions
└── Provenance
```

Supported object kinds begin with structures, props, terrain, avatars, NPCs, plants, creatures, vehicles, items, and landmarks.

### Grid World Format

The first versioned object document uses:

- `format: grid-world`
- `version: 1`
- stable object/entity ID
- transform in Grid Units
- metadata and tags
- component payloads
- permissions
- provenance/version/hash fields

The format is data-first and renderer-independent. A Three.js mesh is a presentation of a Grid object, not the object's identity.

### Engine 0.1 rule

**Identity belongs to Grid. Presentation belongs to the renderer.**

This permits the same object to be represented in browser, native, editor, server, archive, or future renderer implementations without changing its world identity.


## Grid Engine 0.1 — Components, Permissions & Mutation

### Components

Components are behavior/state extensions attached to entities. Each component has a stable type and may declare a schema version. Component data is serialized independently so new components can be added without changing the identity contract.

### Permission invariant

UI visibility is not authorization.

Every persistent object mutation must pass a Grid permission check using an explicit actor/context. Copy, export, remix, view, and modify are separate capabilities.

### Version-aware mutation

Creator and multiplayer mutations may supply an expected object version. A stale expected version is rejected instead of silently overwriting newer state.

Successful mutations advance the object's provenance version. This is the beginning of optimistic concurrency protection; authoritative server-side conflict resolution will be added at the network boundary.

### Provenance

Derived objects retain their parent object ID and source asset information where applicable. This supports creator attribution, remix lineage, rollback, moderation, and archive/recovery workflows.

### Security boundary

Client-side permission checks improve UX but are not the final authority. Grid Server / Grid Omni services must re-check authorization before persistent writes, commerce, publication, or privileged world actions.


## Grid World Texture Library

Grid materials are first-class world resources.

```
Grid Texture ID
├── Material Definition
├── Rights
├── Provenance
├── Version
└── Renderer Variants
    ├── WebGL
    ├── WebGPU
    └── Native
```

The initial library contains ten original Grid materials spanning stone, wood, metal, glass, ground, foliage, technical, and special categories.

Binary texture files are intentionally separate from catalog metadata. The catalog lives in `grid_texture_library`; future binary maps should live in Supabase Storage with bucket-specific access controls. This follows Supabase's current Storage architecture and avoids putting large media blobs into Postgres. citeturn0search0turn0search4

Texture publication follows:

`Create/Import → Hash → Quarantine → Validate → Rights Metadata → Moderation → Publish → Cache → Renderer Variant`

No external texture is treated as Grid-owned merely because it was imported. Rights status and provenance travel with the material.
