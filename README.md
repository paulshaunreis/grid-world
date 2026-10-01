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
