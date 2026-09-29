# Ryzom Lessons → Grid World

Grid World studies The Saga of Ryzom as a historical design case, not as a template to copy.

## What Ryzom demonstrated

- A world can have identity beyond a map: ecology, cultures, geography, history and dynamic events can reinforce one another.
- Classless progression and modular abilities can give players room to invent their own identity.
- Player-created scenarios can turn an MMO into a platform for experiences, not only developer-authored quests.
- Deep crafting and changing resource conditions can make the world itself part of the economy.
- A committed community can preserve a world through corporate and ownership changes.
- Open-source engine/tooling can extend a project's life beyond the original operator.

Ryzom Core describes itself as the open-source project related to Ryzom and is released under AGPLv3 for its source code. The current Ryzom project describes the game as classless, roleplay-oriented, focused on live events, complex crafting and dynamic environments.

## Where Grid must diverge

### 1. Build the platform in survivable layers

Ryzom combined many ambitious systems in one commercial MMO. Grid should make each major capability independently useful:

World → Identity → Social → Creator → Code → Economy → Media → Events → Archive.

A failure in one service must not require the whole world to fail.

### 2. Simulation budgets are first-class

Ecology and crowd simulation must have explicit budgets.

Grid uses simulation levels:

- Dormant — persistent data only.
- Ambient — low-cost environmental updates.
- Active — detailed simulation near players.
- Social — population/economic interactions.
- Event — elevated simulation around important events.
- Critical — maximum bounded budget for protected scenarios.

Graphics LOD and simulation LOD are separate systems.

### 3. Creator tools are a platform

Ryzom Ring showed the value of player-authored scenarios. Grid Creator therefore needs:

- visual building
- declarative Grid Code
- instant safe preview
- reusable templates
- discovery
- versioning
- provenance
- permissions
- moderation
- rollback
- creator reputation
- audience/distribution
- optional economy

A creator tool without discovery and audience is not a creator ecosystem.

### 4. The world must remain legible

Advanced systems must be progressive:

Simple → Useful → Advanced → Expert.

A new traveler should be able to enter First Light without learning the entire platform.

### 5. The world must outlive its operator

World definitions, creator content, object identity, provenance, Grid Code and archives should use stable, documented contracts.

Platform services may change implementation without destroying the world's durable data model.

## Grid Ring

Grid Ring is the planned creator layer inspired by the problem Ryzom Ring solved.

A Grid Ring experience is a versioned package:

- Experience ID
- creator identity
- region/template
- object set
- NPC set
- Grid Code
- permissions/capabilities
- required assets
- safety policy
- provenance
- publication state
- rollback target

The runtime loads the package through capability boundaries. It never grants arbitrary JavaScript, filesystem access, credentials, raw database access or unrestricted network access.

## Grid NeL boundary

Ryzom Core's modular engine/service architecture is a useful historical reference.

Grid should keep an explicit engine boundary:

Client presentation
→ World Runtime API
→ Simulation Services
→ Persistence/Events

Gameplay content should depend on stable Grid interfaces, not Three.js, Supabase or another infrastructure vendor directly.

This permits a future renderer, native client, server runtime or storage provider to replace an implementation without rewriting world content.

## Community continuity

Grid Archive should preserve:

- version history
- creator attribution
- object provenance
- region history
- event records
- published experience versions
- migration metadata

A retired service should be able to become read-only archive infrastructure rather than silently destroying history.

## Design doctrine

**Ryzom's lesson is not "make another Ryzom."**

The lesson is:

> Build a world that is deep enough to become meaningful, but architect the platform so that no single ambitious subsystem, company, vendor, or release has to carry the entire future.

## Research references

- Ryzom Core: https://github.com/ryzom/ryzomcore
- Ryzom: https://www.ryzom.com/
- Ryzom service architecture: https://en.wiki.ryzom.com/wiki/Ryzom_Service_Architecture
- Ryzom Ring release coverage: https://www.gamesindustry.biz/the-ryzom-ring-is-released
