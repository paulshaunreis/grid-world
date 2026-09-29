# Grid Model Library

Grid World uses a curated model-family strategy instead of hardwiring one vendor into the engine.

## Selected production candidates

| Family | Candidate | License | Role |
|---|---|---|---|
| Buildings | Kenney Modular Buildings | CC0 | Modular district architecture |
| Buildings | Kenney Building Kit | CC0 | Secondary structures |
| Avatars | Kenney Blocky Characters | CC0 | Animated NPC/avatar reference |
| Avatars | Kenney Mini Characters | CC0 | Small-scale and accessibility variants |
| Animals | Kenney Cube Pets | CC0 | Companion animals and starter wildlife |
| Animals | Kenney Prototype Kit | CC0 | Rapid world prototyping |
| Trees | Poly Haven Tree Small 02 | CC0 | Broadleaf hero tree |
| Trees | Poly Haven Fir Tree 01 | CC0 | Conifer layer |
| Trees | Poly Haven Island Tree 03 | CC0 | Coastal/hero tree |
| Plants | Poly Haven Plants collection | CC0 | Understory, shrubs, flowers |
| Avatars | Grid Navigator | Original | Canonical Grid identity |

Poly Haven states that its models, textures, and HDRIs are CC0 and suitable for commercial use without attribution requirements. Kenney's selected packs are also listed as CC0 on their asset pages.

## Runtime strategy

The web client currently uses **Grid-native procedural fallbacks** for immediate availability and low download cost. The model library provides stable IDs and source provenance for future local glTF/GLB packs.

This means world objects depend on:

Grid Model ID -> Model Family -> Asset Manifest -> Renderer Loader

rather than:

World code -> vendor-specific file

Animated glTF assets can use Three.js GLTFLoader and AnimationMixer. The renderer can therefore move from the current procedural inhabitants to rigged production models without changing the NPC brain, permissions, persistence, or world-object contracts.

## Living-world pass

First Light now has a living layer containing:

- animated trees and plants
- multiple habitat clusters
- roaming wildlife
- fireflies
- water ripples
- atmospheric light masts
- PBR starter materials
- existing NPC autonomy and memory
- existing team avatars
- existing teleport infrastructure

The procedural layer is intentionally not throwaway art. It establishes the simulation hooks, interaction identity, animation cadence, material families, and object provenance that production models will inherit.

## Asset rule

Every imported external model must pass:

Source -> exact license -> provenance -> hash -> validation -> scan -> optimized glTF -> LOD -> budget -> publish

External assets are not automatically trusted because a source page says "free."
