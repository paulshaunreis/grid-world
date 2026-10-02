# GridWorld Living-World Visual Pass — Pack 1

*Aurora, 2026-10-02. Paul: "Living-world visual pass: integrating the world art, atmosphere, plants, trees, creatures, buildings, textures, and world-specific presentation into the actual experience."*

## What's in the pack

**Creatures** (`public/models/creatures/`, CC0 via Poly Pizza):
- `quaternius-shiba.glb` — dog/wolf-class companion creature. 24 animations: Idle, Walk, Gallop, Attack, Death, Eating, hit reacts.
- `quaternius-chick.glb` — small bird/ambient critter. Idle, Peck, Run, Attack, Death.
- `quaternius-frog.glb` — amphibian. Idle, Jump, Attack, Death.

**Signature flora** (`public/models/flora/`, original GridWorld designs, built in Blender):
- `lanternbloom.glb` — glowing lantern flower (emissive petals, reads as a light source at night).
- `crystalsprout.glb` — crystal growths among leaves.
- `mistfern.glb` — feathery blue-green fern.
- `ironbark.glb` — dark metallic-bark tree.

**Textures** (`public/textures/`, CC0 Poly Haven, 2K PBR sets — diffuse + OpenGL normal + roughness):
- `forest_ground_04` — district ground cover.
- `leafy_grass` / `aerial_grass_rock` — grass and grass-rock blend.
- `bark_brown_02` — tree trunks (Ironbark gets the stylized treatment; this is for natural trees).
- `rock_boulder_dry` / `mossy_rock` — rocks, cliffs, ruins.

**Atmosphere** (`public/textures/hdri/`):
- `moonless_golf_2k.hdr` — night-sky HDRI for image-based lighting. Day skies come later; this gives the night Grid its glow.

## Art direction notes

- Humanoids are realistic (MakeHuman base). Flora/creatures are stylized-realistic — deliberate contrast: the world feels alive and slightly otherworldly, the people feel real. This matches the concept-art bible.
- All flora is original — no stock plants. Creatures start from CC0 bases; GridWorld-native creature designs (Emberpup, Glidefin, etc.) remain the long-term goal.
- G-rated, kind, never frightening — the frog is the scariest thing in this pack, and it's adorable.

## Pack 2 — wide selection (2026-10-02)

**World-signature flora** (`public/models/flora/`, original designs, one per WorldDNA archetype):
- `emberbloom.glb` — volcanic: ember-orange emissive petals, charred stem, floating sparkles.
- `prismshard.glb` — crystalline: pure faceted crystal cluster, violet/cyan emissive.
- `stormreed.glb` — storm: reeds bent by a uniform wind vector, electric-blue tips.
- `mossheart.glb` — primal: giant teal-glowing mushroom, speckled cap.

**More creatures** (CC0, Quaternius via Poly Pizza): `quaternius-fox.glb` (24 anims), `quaternius-horse.glb` (26 anims — mount candidate), `quaternius-dolphin.glb` (Swim), `quaternius-shark.glb` (Swim).

**Nature kit** (`public/models/nature/`, CC0 Kenney): 305 models in 6 categories — 37 trees, 116 rocks/cliffs, 29 plants, 21 crops, 48 structures, 54 misc. 3.2 MB total.

## Integration (ChatGPT's lane)

- Flora: scatter via the ecology/district systems; Lanternbloom wants a PointLight or emissive bloom pass at night.
- Creatures: idle/wander behavior; the Shiba's 24 clips cover a full behavior set already.
- Textures: terrain material blending; the HDRI plugs into the scene environment for IBL.
- Buildings: next pack — Kenney/KayKit CC0 kits for district architecture.
