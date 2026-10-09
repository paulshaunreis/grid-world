# Grid World Logo — Print & Merch Specs

**Copyright © 2026 Paul Shaun Reis. All rights reserved.**

This package contains the master logo artwork for print production and merchandise.
All text is converted to vector outlines — no font files required.

## Files

| File | Use |
|---|---|
| `logo-full-color.svg` | Master. Full-color stacked lockup (icon + banner). Print, web hero, packaging. |
| `logo-mono-black.svg` | Single-ink black. Embroidery, vinyl cut, single-color print, fax, engraving. |
| `logo-mono-white.svg` | Single-ink white (reversed). Dark backgrounds, dark garments, window decals. |
| `logo-icon-only.svg` | Icon mark only (no text). Favicons, app icons, small merch, social avatars. |
| `logo-horizontal.svg` | Horizontal lockup (icon left, wordmark right). Website headers, banners, letterhead. |

## Brand Colors

### Primary palette (from master artwork)

| Name | Hex | CMYK (approx) | Closest Pantone® ref |
|---|---|---|---|
| Signal Cyan | `#59e9ff` | 65 / 5 / 0 / 0 | 305 C |
| Deep Grid Blue | `#2768d9` | 82 / 51 / 0 / 15 | 2727 C |
| Abyss Navy | `#111b4f` | 80 / 66 / 0 / 69 | 282 C |
| Metal Dark | `#08132e` | 73 / 59 / 0 / 82 | 5395 C |
| Gold Light | `#ffe8a1` | 0 / 9 / 37 / 0 | 1205 C |
| Gold Mid | `#d9942e` | 0 / 32 / 82 / 15 | 7555 C |
| Gold Deep | `#d9a13b` | 0 / 26 / 77 / 15 | 7554 C |
| Ice White | `#eefcff` | 4 / 0 / 1 / 0 | — |

> CMYK values are process-color approximations for briefing a printer.
> Pantone® references are closest-match suggestions — always verify against a physical swatch book before committing to a production run.

### Mono versions
- **Black:** 100% K (rich black `C40 M30 Y30 K100` for large solid areas in offset print)
- **White:** paper/garment showing through (0/0/0/0), or opaque white ink on dark substrates

## Clear Space

Minimum clear space around the logo on all sides = **the height of the "G" in GRID WORLD** (approximately 1/8 of total logo height). No text, graphics, or page edges inside this zone.

## Minimum Sizes

| Variant | Print minimum | Digital minimum |
|---|---|---|
| Full-color / mono (stacked) | 1.25 in / 32 mm wide | 120 px wide |
| Icon-only | 0.5 in / 13 mm wide | 32 px wide |
| Horizontal lockup | 2 in / 50 mm wide | 200 px wide |

Below these sizes, use the icon-only mark.

**Embroidery:** Use `logo-mono-black.svg` (or white on dark garments). Minimum 2 in wide for the stacked version; icon-only for patches under 2 in. Simplify: embroiderer may need to drop the inner grid lines below 1.5 in — approve a stitch-out proof first.

**Vinyl cut:** Mono versions only. Minimum line weight in the artwork is ~7 units at 800-unit viewBox (≈0.9% of logo width) — safe for cutting at 3 in and above.

## What NOT To Do

- **Don't** stretch, squash, or rotate the logo.
- **Don't** recolor the full-color version (use the mono variants for single-color needs).
- **Don't** add drop shadows, outlines, or effects not in the master.
- **Don't** place the full-color logo on busy backgrounds without sufficient contrast.
- **Don't** use the mono-black version on dark backgrounds (use mono-white).
- **Don't** rearrange the lockup (icon always above banner in stacked; icon always left in horizontal).
- **Don't** recreate the wordmark in a different font — the letterforms are custom outlines.
- **Don't** remove the © attribution where the license requires it.

## Production Notes

- **Vector:** All files are pure vector SVG. Scale infinitely without loss.
- **Fonts:** None required — all text is outlines.
- **Filters:** The full-color master uses SVG glow filters (`feGaussianBlur`). For offset/litho print, ask your printer to flatten or rasterize at 300 DPI. The mono and icon versions have no filters.
- **Merch mockups:** Export PNG at 300 DPI at final print size for mockup comps.
- **File delivery to vendors:** Send the SVG plus a 300-DPI PDF export. Most print shops prefer PDF/X-4.
