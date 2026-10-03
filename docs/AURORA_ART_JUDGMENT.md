# How Aurora Judges Art — the "Think Like Aurora" Manual

**For ChatGPT (and future collaborators).** Paul asked that ChatGPT be able to think like Aurora on art calls. This is the codified version of her judgment: how she evaluates, what she catches, how she decides. Read this before making or reviewing any visual asset.

## The core lens

Every asset must answer three questions:
1. **Does it hit the photoreal bar?** (docs/ART_DIRECTION.md) Film-quality detail, natural textures, motivated lighting. If it looks like a placeholder, it is one — label it honestly.
2. **Does it belong in GridWorld?** Circuit-glow signature, neon-noir palette (deep blacks, cyan/teal light, violet accents), techwear material culture. It should feel like it was found in the world, not pasted onto it.
3. **Is it kind?** All-ages, never frightening, never unsettling. Dignified. Paul's rule, no exceptions.

## The QA checklist (run on every asset)

- **Silhouette first:** read the shape at thumbnail size. If it's muddy small, it's muddy big.
- **Ground contact:** nothing floats unless it canonically hovers. Shadows anchor objects.
- **Scale sanity:** doors ~2m, chairs ~0.45m seat height, humans 1.6–1.9m. Check against a human reference.
- **Material honesty:** metal reflects, cloth folds, skin has pores. Glossy-plastic-looking bark/rock/fur is the #1 tell of a failed material — fix roughness and normal strength before anything else.
- **Light logic:** one key light direction. Emissive elements need a reason (circuit, lamp, bioluminescence).
- **Anatomy:** count limbs, fingers, joints. Extra/missing digits are an instant reject on characters and creatures.
- **Text in images:** AI-generated text is almost always garbled. Either verify every glyph or remove text entirely.
- **No protected designs:** original only. If it reminds you of a specific Pokémon/Digimon/MTG/Final Fantasy design, it's too close — redesign.
- **Watermark:** every public-facing image gets © GridWorld before it leaves the studio.

## Taste rules (Aurora's actual preferences)

- **Prefer:** weathered over pristine (lived-in faces, worn techwear), practical over ornamental (every seam earns its place), calm over busy (one hero element per frame), cyan/teal glow over rainbow noise.
- **Avoid:** horror-adjacent imagery, sexualization, cluttered compositions, lens-flare soup, generic "sci-fi" greebles with no function.
- **Paul's known likes:** realism, circuit aesthetics, Linkin Park / cyberpunk edge, martial-arts philosophy (discipline, quiet mastery), kind all-ages tone. When in doubt, elegant and calm beats loud.

## Common misses to catch (things ChatGPT should self-check)

1. Shipping a placeholder (Quaternius/Kenney tier) without labeling it as placeholder.
2. Forgetting the watermark on public art.
3. Concept-only regions leaking into playable systems without Paul's approval.
4. Claiming a verification level not actually observed (analyzer → TS → Vite → CI → browser/WebGL/mobile → deployed Render — never skip-claim).
5. Generating colorways before Paul verifies the base (his standing rule: variants only AFTER in-world verification).
6. Reusing a filename across versions (Paul's viewer caches stale copies — always version the filename).

## How decisions get made

- Paul is Creative Director and merge approver. Branches, never direct-to-main.
- Aurora's call: art quality, QA verdicts, placeholder-vs-shipping classification.
- ChatGPT's call: systems integration, runtime wiring.
- Disagreements: the notebook (NOTES-FOR-CHATGPT.md) is the forum. State the options plainly, recommend one, let Paul decide.
- When uncertain: ask Paul with one crisp choice, not an open-ended question.

## Working method

Reference-first (never generate from vibes alone), iterate in small passes, verify at every rung of the ladder, document everything in the notebook dated and in your own voice. Facts first, honesty over comfort — including telling Paul when something isn't working.
