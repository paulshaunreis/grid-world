# Grid World

Grid World is a persistent 3D social-world project. The first milestone is **First Light**: a small, explorable world that establishes the core client architecture before multiplayer, persistence, creation tools, and economy systems are added.

## Current foundation

- Vite + TypeScript
- Three.js renderer
- Third-person prototype avatar
- WASD movement
- Shift sprint
- Space jump
- Mouse-look pointer lock
- Directional + hemisphere lighting
- Fog and large world grid
- Procedural environment layer: terrain fields, habitat bands, atmosphere, weather motion, and climate-driven particles
- World-DNA-driven architecture, flora, creatures, ecology, migration, and evolution
- Basic trees and landmark geometry

## Run locally

```bash
npm install
npm run dev
```

## Roadmap

1. First Light — playable local world
2. Avatar system — appearance, animation, camera modes
3. Interaction — click/use/pick-up/place
4. Persistence — accounts, inventory, saved world objects
5. Multiplayer — authoritative sessions and player synchronization
6. Social — chat, friends, groups, teleporting
7. Creation — user-built objects and regions
8. Economy — ownership, trading, marketplace
9. Regions — streaming, instancing, scalable servers

The architecture should stay modular so networking and persistence can be introduced without rebuilding the client.

## Living World principle

A world description is treated as environmental DNA. Generated worlds can receive their own architecture, climate, atmosphere, habitat bands, flora, fauna, weather, ecological interactions, seasonal changes, and emergent life without a fixed world-count limit. The public website mirrors this direction with a living-world visual atlas and live Grid signals.


## Chemistry, energy and consequence systems

- **Grid Chemistry** models all 118 periodic-table elements and connects mineral formulas to elemental composition and geological formation families.
- **Grid Minerals** uses chemistry-aware world tags so generated deposits respond to volcanic, hydrothermal, metamorphic, sedimentary, weathering, silica, fluorine and carbon signatures.
- **Grid Chakra** is a fictional/spiritual resonance system inspired by varied chakra traditions; it is gameplay energy, not a medical or scientific claim.
- **Grid Alchemy** provides fictional transformation recipes using mineral inputs, elemental catalysts and energy costs.
- **Grid Karma** tracks consequence history for any subject, including users and NPCs, and exposes karma, luck and streak state for missions, achievements and chance events.
- Elemental laboratory worlds include Emberforge, Azurevault, Aetherion, Verdantium and Primordia for testing world generation and emergent geology.

The project uses these systems as independent layers so future worlds can combine chemistry, geology, ecology, energy, narrative consequence and sandbox gameplay without introducing a fixed world-count ceiling.
