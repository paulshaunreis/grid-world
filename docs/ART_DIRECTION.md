# GridWorld Art Direction — the Photoreal Bar

**Ratified by Paul (Creative Director), 2026-10-03.** The realism target for all GridWorld character and creature art is **photorealistic cinematic** — film-quality detail, natural skin/fur/membrane texture, dramatic motivated lighting. Reference: Aurora's option-1 avatar (circuit-gown look). Stylized low-poly is a placeholder tier, never the shipping bar.

## What the bar means per asset class

- **People (citizens, NPCs, merchants, sentinels):** photoreal portraits. Natural skin texture, weathered lived-in faces, techwear with glowing circuit embroidery, neon environments with bokeh and reflections. Concept refs: `~/workspace/gridworld/concept-art/` (merchant, sentinel).
- **Creatures:** photoreal wildlife cinematography of *original* designs. Realistic anatomy, fur/feather/membrane detail, bioluminescent circuit patterns as the GridWorld signature. Inspiration only from real animals — never copy Pokémon/Digimon/MTG/Final Fantasy designs. Concept refs: emberbeast (volcanic predator), glideray (sky ray).
- **Aurora (signature character):** blue circuitry skin, glowing cyan eyes, dark wind-swept hair with cyan light, dark circuit gown with holographic data-stream train. 3D build in progress: `public/models/avatars/aurora-circuit-gown.glb`.
- **Flora/probe:** stylized-original is acceptable for plants and small props, but hero flora should carry PBR materials and emissive accents consistent with the world DNA.

## The creation pipeline (how we hit the bar)

1. **Brief** — Paul's direction or a world-DNA need. One sentence: what it is, where it lives, what it feels like.
2. **2D concept** — photoreal keyframe at the bar (Aurora generates, Paul QAs). Two angles minimum for characters (portrait + full body or action).
3. **3D build** — Blender procedural/sculpted, deterministic generator script checked in (`~/workspace/blender/gen_*.py`). Real-world scale, Y-up, origin at feet/ground.
4. **Materials** — PBR Principled BSDF, emissive for glow elements, 2K textures where needed (Poly Haven CC0 or painted).
5. **QA renders** — Cycles CPU, front/back/detail. Aurora reviews against the brief; iterate until it reads at the bar.
6. **Engine verification** — three.js GLTFLoader parse, tri budget (hero character ≤ 60k, creature ≤ 30k, flora ≤ 15k), then analyzer → TS → Vite.
7. **Integration** — ChatGPT wires into runtime (avatar system, ecology/scatter, creature behavior). Art branch → Paul's merge approval.

## Takeaways

- Quaternius CC0 animals = placeholder tier (stylized). Keep for prototyping; replace or reskin toward photoreal for shipping.
- Kenney nature kit = placeholder tier for environment dressing. Fine for blocking out worlds.
- MPFB avatars = meet the bar for human base meshes (realistic). Need the PBR skin/hair/clothing pass to fully arrive.
- Every new hero asset starts from a photoreal 2D concept at option-1 quality. No exceptions.
