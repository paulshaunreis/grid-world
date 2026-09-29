# Grid World Texture Library

The Grid World Texture Library is the canonical material vocabulary for Grid Engine.

## Principles

- Texture identity is stable and renderer-independent.
- Materials carry rights and provenance metadata.
- Creator textures enter quarantine before publication.
- A texture can have multiple renderer-specific representations without changing its Grid ID.
- Original Grid textures are explicitly marked as original; external assets must carry their actual rights status.
- Textures are versioned independently from worlds and objects.

## Initial library

- Moon Slate
- Obsidian Glassstone
- Wayfinder Timber
- Aether Alloy
- Sentinel Plate
- Prism Glass
- First Light Soil
- Living Moss
- Signal Mesh
- Aurora Veil

## Pipeline

`Create/Import → Hash → Quarantine → Validate → Rights Metadata → Moderation → Publish → CDN/Cache → Renderer Variant`

Supabase stores catalog metadata in `grid_texture_library`; binary texture assets belong in Storage rather than Postgres. Supabase recommends storing media files outside database tables and using Storage access controls/RLS for uploads and retrieval. 

## Future texture variants

A single Grid texture ID may eventually expose:

- color/albedo
- normal
- roughness
- metallic
- ambient occlusion
- height/displacement
- emissive
- packed PBR
- procedural definition
- WebGPU representation
- native renderer representation

The library is therefore a **material identity system**, not merely an image gallery.
