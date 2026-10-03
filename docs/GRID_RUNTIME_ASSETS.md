# Grid World runtime asset provenance

Grid World now has a real runtime GLB layer in addition to procedural fallback geometry.

## Runtime source

The first production asset layer uses Kenney CC0 models mirrored in the public `Hidencod/tge-assets` library. The mirror catalog identifies the individual GLB files and their CC0-1.0 license. Runtime loading is isolated behind `src/engine/GridRuntimeModelLoader.ts`.

Selected families:
- City Kit (Suburban): building-type-a through building-type-e
- Nature Kit: oak, pine, and palm trees
- Cube Pets: deer, fox, and cat
- Blocky Characters: character-a

The asset layer is progressive: a model is loaded asynchronously and inserted into the existing world presentation; if it fails, the existing procedural geometry remains visible.

## Why this exists

`GridModelLibrary.ts` previously described model sources, but those entries were metadata only. The runtime loader closes that gap without replacing the existing world, ecology, terrain, transit, or creator systems.

## License

Kenney assets are CC0. The mirror's catalog records the source pack and license. Attribution is not required by CC0, but Grid World records provenance here for auditability.

Source pages:
- https://kenney.nl/assets/modular-buildings
- https://kenney.nl/assets/blocky-characters
- https://kenney.nl/assets/cube-pets
- https://kenney.nl/assets/nature-kit
- https://github.com/Hidencod/tge-assets
