# Grid World Architecture

## Client layers
- Core — input, player controller, interaction, camera.
- World — regions, terrain, lighting, landmarks, world objects.
- Persistence — future account/session/world-state services.
- Networking — future authoritative multiplayer synchronization.
- UI — future HUD, inventory, chat, social systems.

## Interaction contract
World objects expose an interactable flag and optional interaction name. The interaction system raycasts from the center of the player's view and returns the first interactable object.

This keeps interaction independent from networking. Later, an interaction can become a server-authorized action without replacing the client-facing interface.

## Multiplayer direction
The eventual authoritative model should treat the server as the source of truth for player identity, player state, ownership, world object state, permissions, and persistence.

The browser client remains responsible for presentation, input, prediction/interpolation, and rendering.
\n\n# Grid World — Futureproofing Contract\n\n## Core rule\n\nGrid World is built around replaceable systems and stable contracts. A feature may evolve internally without forcing every consumer to change at the same time.\n\n## Compatibility\n- Persisted client data is versioned and migrated explicitly.\n- Network payloads are treated as contracts, not implementation details.\n- Database schema changes must be additive first, followed by migration, verification, and only then removal.\n- UI mods have stable IDs and semantic versions.\n- Region IDs are stable identifiers; display names may change.\n- Player identity separates local-device identity from authenticated account identity.\n- Feature flags allow gradual rollout and emergency disablement.\n- Unknown fields must be ignored where safe so newer clients can communicate with older data.\n\n## System boundaries\n### Client\nOwns presentation, input, local prediction, interpolation, UI, and graceful offline behavior.\n### Services\nOwn authentication, authoritative state, persistence, moderation, economy, and other security-sensitive operations.\n### World data\nIs data-driven wherever practical. Regions, objects, interactions, scripts, UI modules, and content should not require engine rewrites to add ordinary content.\n\n## UI platform\nThe UI runtime is a platform layer:\n- Window Manager controls movement, sizing, stacking, visibility, and layout persistence.\n- UI Mod Registry controls module lifecycle.\n- UI modules communicate through explicit APIs instead of reaching into unrelated modules.\n- Layout data is versioned.\n- A future server-synced profile can replace local layout storage without changing window consumers.\n\n## Mod safety\nMods should be capability-bounded. They must not receive arbitrary access to authentication tokens, service-role credentials, raw database access, unrestricted network access, arbitrary DOM outside their declared UI surface, or arbitrary code execution through user-authored world scripts.\nCreator scripting remains declarative and capability-based.\n\n## Persistence\nUse an explicit migration chain: old schema -> migration -> current schema. Never silently reinterpret old data.\n\n## Networking\nUse authoritative server state for identity, ownership, permissions, economy, and persistent world state. Clients may predict and interpolate, but server-authoritative systems determine durable truth.\n\n## Production\nEvery major feature follows: Design -> Prototype -> Playable -> Playtest -> Harden -> Ship -> Observe -> Iterate.\nA feature is not production-ready merely because its implementation compiles.\n\n## Operational safety\nEvery service-facing feature should have explicit failure behavior, retry/backoff where appropriate, timeout handling, observable status, migration/rollback strategy, and documented ownership.\n\n## Dependency policy\n- Prefer small, well-supported dependencies.\n- Pin critical versions and commit lockfiles.\n- Do not couple game logic directly to vendor SDKs when an internal interface can isolate them.\n- Replace infrastructure through adapters rather than rewriting gameplay.\n\n## Definition of futureproof\nFutureproof does not mean predicting every future technology.\nIt means making reasonable future changes cheap, safe, observable, and reversible.
## Universal Grid Measurement
Grid World uses **GU (Grid Units)** as its canonical spatial unit. 1 GU = 1 metre. Interfaces can display GU, metres, feet, or inches without changing the underlying world data.

## Starter zones
Every account receives a personal starter zone assignment. First Light is the default starter region in the prototype. Starter zones teach movement, identity, measurement, building, safety, social interaction and Grid Code before the traveler enters broader public regions. Starter-zone state should become persistent account/world data rather than a client-only scene.

## Grid Omni response presence
Grid Omni Security can escalate a detected signal into a world-visible safety response. NPC sentinels may appear, move to the affected location, hold a perimeter, guide the user away, or return to patrol. The sentinel is a response agent, not proof that a threat exists: its appearance means the system detected enough uncertainty or risk to justify observation/containment.

## Grid Code
Grid Code is a declarative, HTML-like language for world behavior. Example:
<House id="starter-home">
  <Notify value="Welcome" />
  <Show target="welcome-beacon" />
</House>
Grid Code is parsed into a restricted intermediate representation and executed through capability-bounded runtimes. It is not arbitrary JavaScript and cannot directly access credentials, unrestricted networking, the filesystem, or raw database operations.

## Operational quality
A five-star system state is earned through capability checks, automated tests, observable health and recovery behavior. A visual 5/5 indicator must never be treated as a guarantee of security, uptime or correctness.
