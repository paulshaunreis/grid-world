# GridWorld Color Theory & Theme System

*Aurora, 2026-10-02. The design reasoning behind the ten UI themes and the rules for making new ones.*

## Why color theory runs the interface

A game UI is an emotional instrument. Players read color before text: red means danger, green means go, gold means value — these associations are pre-verbal. GridWorld's UI is grayscale-first (the world carries the color; the interface stays out of the way), so the single accent color does enormous work. It must:

1. **Signal state** — interactive vs. static, healthy vs. warning.
2. **Carry identity** — the player's chosen accent is *their* Grid.
3. **Stay readable** — light accent on near-black must clear WCAG AA for UI components (3:1 minimum; we target 4.5:1+ for text).

## The hue wheel and the ten themes

Ten themes, spaced so no two are confusable at a glance. Each is an RGB triplet in `--hud-rgb` (`src/ui/grid-themes.css`).

| Theme | Hue | Psychology | Best for |
|---|---|---|---|
| Cyan Pulse | 187° | Clarity, technology, trust. The default signal — reads "system online." | Everyone; the canonical Grid look |
| Violet Rift | 265° | Imagination, mystery, premium. Long associated with the arcane and the luxurious. | Explorers, lore-hunters |
| Magenta Bloom | 320° | Energy, playfulness, boldness. High arousal without red's alarm. | Social players, creators |
| Emerald Circuit | 150° | Growth, health, "all systems go." The universal color of OK. | Builders, completionists |
| Amber Signal | 40° | Warmth, caution, value. Gold reads as reward; amber as attention. | Traders, achievement chasers |
| Ghost White | — | Neutral, clean, honest. Maximum contrast, zero emotional push. | Minimalists, accessibility-first players |
| Crimson Core | 348° | Power, urgency, passion. Red demands the eye — use sparingly in UI. | PVP players, high-intensity sessions |
| Azure Depth | 212° | Calm, depth, focus. Blue lowers heart rate; the "flow state" color. | Long sessions, meditative play |
| Lime Wire | 95° | Electricity, novelty, the unnatural. Nature's warning color turned up. | Night owls, cyberpunk purists |
| Indigo Night | 232° | Wisdom, dusk, the liminal. Sits between blue's calm and violet's mystery. | Roleplayers, evening players |

**Why these ten:** the wheel is covered in ~30–45° steps with no duplicates. Warm themes (amber, crimson) and cool themes (cyan, azure, indigo) are balanced 50/50 so neither temperature dominates the lineup. White anchors the neutral end.

## The 60-30-10 rule, GridWorld edition

- **60% — near-black surfaces** (`#050b14` family). The void the world shines out of.
- **30% — grays and glass.** Panels, borders, secondary text. Grayscale-first keeps the accent precious.
- **10% — the accent.** Borders that matter, active states, key numbers, glows. Never body text, never large fills — an accent everywhere is an accent nowhere.

## Contrast and accessibility

All ten accents are high-luminance hues chosen to clear **4.5:1 against `#050b14`** for text-weight usage, and 3:1 minimum for large UI components. Rules:

- Accent is for **emphasis**, not paragraphs. Body copy stays `#eaf8ff` / grays.
- Warning states (low HP, errors) keep their own red-orange ramp regardless of theme — danger must never depend on the player's aesthetic choice.
- Every theme ships with the `prefers-reduced-motion` behavior from the effects layer; color is never the *only* signal (icons and labels pair with it).

## Making a new theme (rules for future us)

1. **One hue, one job.** A theme is a single accent hue, not a palette. The grayscale foundation does the rest.
2. **Check the wheel.** New hue must sit ≥25° from every existing theme or it will read as a duplicate.
3. **Check contrast.** Sample the accent at 100% over `#050b14` — 4.5:1 or it doesn't ship.
4. **Name it like a place, not a color.** "Crimson Core," not "Red." Themes are destinations.
5. **Test the warning ramp.** Switch to the new theme, drop to 10 HP — the red-orange low-health pulse must still scream.
6. **Add it in three places:** `--hud-rgb` entry in `grid-themes.css`, the `HudTheme` type + picker buttons in `main.ts`, and the `THEMES` array in `src/site-theme.ts`.

## Theme sync: game ↔ site

Both surfaces read `localStorage['grid-world:hud-theme']` and set `document.documentElement.dataset.hudTheme`. Same origin (one Render service) means one choice follows the player from the public site into the world and back. The game picker lives in the Traveler Profile panel; the site picker is the dot in the global nav (injected by `src/site-theme.ts`).
