# Grid World Architecture

## Client layers
- Core — input, player controller, interaction, camera.
- World — regions, terrain, lighting, landmarks, starter zones, world objects.
- Persistence — account/world-state adapters.
- Networking — realtime presence and future authoritative synchronization.
- UI — HUD, inventory, chat, social and creator surfaces.
- Scripting — capability-bounded Grid Code and Grid Ring packages.

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

### Grid Ring
Grid Ring packages a creator-authored experience as a versioned manifest:
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

Grid Ring is designed to support the lesson demonstrated by Ryzom Ring: creator tools become much more powerful when authors can build, test and publish experiences without engine-level programming.

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
