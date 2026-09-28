# Grid World — World Architecture

## Purpose

Grid World is a framework for persistent, expandable worlds rather than a single fixed map.

The internal architecture must allow new worlds, regions, creators, simulation systems, rendering engines, networking models, and persistence providers to evolve independently.

## Core hierarchy

```
Grid World
  └── World
      └── Region
          └── Chunk
              └── Object / Entity
                  └── Component / Script / State
```

A world is a persistent simulation space. A region is a named geographic/gameplay area. A chunk is a streamable simulation and persistence unit.

Worlds are not limited to the initial nine zones.

## Non-negotiable invariants

### 1. Stable identity

Every persistent object must have a stable logical identity independent of rendering.

Do not use Three.js object references, scene order, DOM identifiers, or generated mesh IDs as authoritative identity.

### 2. Stable world coordinates

World coordinates must remain meaningful when chunks unload, regions expand, or the rendering engine changes.

Chunk identity is region-qualified:

`<regionId>:<chunkX>,<chunkZ>`

### 3. Simulation is engine-agnostic

The authoritative world model must not depend on Three.js, WebGPU, Unreal, Unity, or another renderer.

The simulation pipeline is:

```
Time
  ↓
Climate
  ↓
Season
  ↓
Weather
  ↓
Ecology
  ↓
World changes
```

Rendering consumes simulation state. Rendering must not define the simulation.

### 4. Persistence is replaceable

Local storage is a development fallback, not the permanent authority.

The world-state interface must permit:

- local development storage
- Supabase persistence
- server-side authoritative storage
- future dedicated world servers

without changing simulation rules.

### 5. Networking is an adapter

Realtime presence, chat, replication, and future multiplayer transport must not become the world model.

A networking provider may synchronize state; it must not redefine what the state means.

### 6. Server authority for ownership and economy

Land ownership, object ownership, Grid Coin, marketplace transactions, inventory mutations, and other consequential economy operations must remain server-authoritative.

Client code may request actions and render results.

### 7. Streaming is an optimization

Unloaded chunks still exist logically.

Loading a chunk creates a runtime representation of persistent state. Unloading a chunk must preserve that state.

### 8. Effectively unlimited world

The world may be practically unbounded while only a finite neighborhood is loaded.

Do not introduce a maximum-world-size assumption into core APIs.

### 9. Determinism where useful

Procedural generation and simulation should use stable seeds and deterministic rules where possible.

Given the same world definition, region definition, chunk identity, simulation inputs, and version, generated results should be reproducible.

### 10. Version everything that can evolve

Persistent terrain, simulation rules, object schemas, and creator-script APIs need explicit versions.

A future rule change must be able to distinguish old state from new state and migrate it safely.

## Runtime boundaries

The intended dependency direction is:

```
World data/model
    ↓
Simulation
    ↓
Persistence / networking adapters
    ↓
Runtime orchestration
    ↓
Rendering / UI
```

The reverse direction should be avoided.

For example:

- weather may change lighting;
- lighting must never decide the weather;
- a mesh may display vegetation growth;
- a mesh must never become the authoritative vegetation state.

## Chunk lifecycle

A chunk follows this conceptual lifecycle:

```
IDENTIFY
  ↓
LOAD STATE
  ↓
SIMULATE CATCH-UP
  ↓
GENERATE / UPDATE RUNTIME REPRESENTATION
  ↓
ACTIVE
  ↓
SIMULATE
  ↓
PERSIST
  ↓
UNLOAD
```

Offline time must eventually be handled by simulation catch-up using `lastSimulatedAt`, with bounded work rather than one update per elapsed second.

## Regions and worlds

A region is not the same thing as a world.

Multiple regions may belong to one world, and multiple worlds may coexist in Grid World.

The initial First Light region is therefore starter content, not the architectural boundary.

Future examples include:

- fantasy worlds
- science-fiction worlds
- alien worlds
- experimental worlds
- creator worlds
- social worlds
- survival worlds
- historical or alternate-reality worlds

Each can reuse the same world infrastructure while providing different definitions, climates, rules, assets, and content.

## Rendering-engine replacement test

A future renderer should be able to consume the world model without rewriting:

- world identity
- region identity
- chunk identity
- terrain state
- climate
- seasons
- weather
- ecology
- ownership
- persistence
- creator permissions

If changing the renderer requires changing those systems, the boundary has been violated.

## Complexity rule

Grid World follows the Elder/Vael principle:

> Build the smallest system that preserves the long-term capability.

Future-proof does not mean predicting every feature.

It means preserving the boundaries that make future features possible.

## Current implementation status

The current prototype already has:

- world-region registry
- world-coordinate chunk streaming
- region-qualified chunk state
- local chunk persistence
- engine-agnostic clock
- climate profiles
- deterministic season/weather foundation
- chunk ecology state
- runtime simulation integration
- player region persistence

Next architectural milestones:

1. bounded offline simulation catch-up
2. region/world definitions beyond First Light
3. authoritative Supabase world-state persistence
4. terrain/material simulation
5. visible seasonal/ecological changes
6. chunk-owned world objects
7. creator-world expansion
8. authoritative multiplayer replication
