# Grid World Free Asset Sources

Grid World will prefer assets with clear commercial-use rights and a provenance record.

## Primary sources

- Poly Haven — CC0 HDRIs, PBR textures, and 3D models. Its current library includes 500+ models and thousands of textures/HDRIs. Commercial use and redistribution are allowed under CC0.
- Kenney — large CC0 game-asset library; useful for stylized props, prototypes, UI, and gameplay kits. Re-check the source license when importing a specific pack.
- Quaternius — CC0 3D packs with characters, environments, modular platforms, and animation-friendly assets. The Ultimate Platformer Pack includes an animated character, enemies, nature, modular pieces, and 18 animations.
- KayKit — CC0 prototype and character packs. Prototype Bits includes optimized 3D models and GLTF/FBX/OBJ/Blend sources.
- itch.io CC0 collections — useful discovery index for free 3D models and animations, but each asset must still be checked against its displayed license before entering the Grid library.
- Mixamo — large library of rigged characters and motion-captured animations. Use it as a source for animation research and compatible production assets; preserve the applicable Adobe/Mixamo terms with each imported asset.

## Import rule

Discover → verify license → download → hash → normalize → scan → record provenance → optimize → preview → publish

Do not bulk-import a mixed-license collection into the product just because a search result calls it “free.”

## Initial target asset packs

1. locomotion: idle, walk, run, turn, sit, crouch
2. social: wave, point, talk, listen, laugh, celebrate
3. object use: sit, read, type, craft, inspect, push, pull
4. creatures: walk, run, idle, eat, sleep, flee, curiosity
5. environment: rocks, trees, plants, lamps, benches, signs, doors, props
6. events: stage, lights, speakers, crowd barriers, effects
7. creator: modular walls, floors, trims, primitives, sculpting helpers

## Legal boundary

inZOI's own ModKit documentation warns that external assets can carry separate copyright and redistribution obligations. Grid World should follow the same discipline: record the exact source, license, version, hash, and intended use before an asset reaches a published catalog.


## Audio sources

- OpenGameArt CC0 collections are useful for footsteps, UI, NPC messages, teleport and environmental effects. Individual pages identify the license; preserve the source URL and author metadata in Grid's provenance record.
- The OpenGameArt "The Shop" samples are CC0 for the files distributed on OpenGameArt and include ambience, drones and room tone.
- Kenney's game assets are CC0, including its audio collections.
- Sonniss #GameAudioGDC is a large royalty-free commercial game-audio source. Its current license allows use in games and other synchronized media, but prohibits redistributing the sounds as a standalone library. Therefore it is a production-source option, not a Grid marketplace redistribution source.
- Freesound is a discovery source rather than a blanket license. Each sound can have a different Creative Commons license, including CC0, CC BY and CC BY-NC. Grid only accepts sounds whose exact license permits the intended use.
- Pixabay provides free audio under its content license, but its license prohibits standalone redistribution. It can be used as a source for finished experiences, not as an unrestricted Grid sound-library pack.

## Audio import rule

Discover → exact license → creator/source → download date → hash → normalize → loudness check → scan → provenance → publish.

The runtime also contains a procedural Grid-original audio layer so First Light has usable feedback even when no external binary audio has been imported.
