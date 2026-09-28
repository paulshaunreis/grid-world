# Grid World Repository Organization

## Principle

Grid World is organized around **systems, features, and user-facing surfaces**. A folder should have one clear reason to exist.

> If a developer cannot predict where a file belongs, the architecture is not finished.

## Canonical structure

```
grid-world/
├── docs/                         # Architecture, decisions, security, product specs
├── public/                       # Static public assets
├── src/
│   ├── app/                      # Application entrypoints and composition
│   ├── world/                    # Persistent world model and simulation
│   ├── core/                     # Local player/runtime primitives
│   ├── engine/                   # Rendering/engine adapters as they grow
│   ├── features/                 # User-facing Grid features
│   │   ├── social/
│   │   ├── profiles/
│   │   ├── gallery/
│   │   ├── communities/
│   │   ├── channels/
│   │   ├── events/
│   │   ├── marketplace/
│   │   └── creator/
│   ├── network/                  # Realtime transport and multiplayer
│   ├── persistence/              # Storage, database, cloud state
│   ├── media/                    # Grid Media abstraction and media services
│   ├── scripting/                # Grid Script language/runtime/security
│   ├── avatars/                  # Avatar definitions and presentation
│   ├── ui/                       # Shared in-world UI components
│   ├── theme/                    # Shared Grid Identity/theme system
│   └── shared/                   # Small cross-feature utilities/types
└── tests/                        # Unit/integration/system tests as they arrive
```

## Current-to-target mapping

The current codebase already has several correct boundaries:

- `src/world` → remains the authoritative world/simulation boundary.
- `src/core` → remains runtime/player primitives.
- `src/network` → remains multiplayer/realtime transport.
- `src/persistence` → remains cloud/local persistence.
- `src/scripting` → remains Grid Script and creator execution.
- `src/avatars` → remains avatar definitions/presentation.
- `src/ui` → remains shared in-world UI.
- Current web/profile entry code will migrate into `src/app` and `src/features/` incrementally.
- Media and Theme receive dedicated boundaries before their implementations become large.

## Naming rules

- Use **PascalCase** for class/module files when the file exports a primary class.
- Use **camelCase** for small utility modules.
- Use nouns for system folders: `world`, `network`, `media`.
- Use product nouns for user-facing features: `gallery`, `channels`, `communities`.
- Avoid generic folders such as `misc`, `stuff`, `helpers`, or `new`.
- Do not put database code inside UI feature folders.
- Do not put rendering-specific code inside persistent world state.
- Do not make one feature directly depend on another feature's private implementation.

## Boundary rule

A feature may depend on:

1. Shared primitives.
2. Platform services through explicit interfaces.
3. Other features through public contracts.

A feature must not reach into another feature's private files merely because they are nearby.

## User-facing information architecture

The repository structure should mirror the product structure where practical:

- **Home** → social feed and discovery.
- **Profile** → identity, customization, gallery, creations, worlds.
- **Communities** → channels, forums, members, roles.
- **Channels** → live streams, chat, clips, VOD, schedules.
- **Gallery** → artwork, projects, collections, media.
- **Events** → virtual, IRL, and hybrid events.
- **Marketplace** → assets, themes, creations, services.
- **Creator Hub** → Builder, Advanced Builder, Grid Script, publishing.
- **Worlds** → regions, exploration, world activity.

## Migration rule

Do not perform a blind mass move.

Move one bounded feature at a time, update imports, build, verify the deployed surface, then continue. The live product always takes priority over folder aesthetics.

## Long-term goal

The repository should make it possible to answer these questions immediately:

- Where does a world live?
- Where does a user's profile live?
- Where does artwork live?
- Where does media storage live?
- Where does realtime chat live?
- Where does a creator's channel live?
- Where does the Advanced Builder live?
- Where does the shared theme live?

If the answer requires searching the whole repository, the organization needs improvement.
