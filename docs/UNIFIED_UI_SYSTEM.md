# Unified UI System — one GridWorld look, every surface

**Status:** Design spec. Awaiting Paul's approval before implementation.
**Rule (Paul, 2026-10-03):** the phone app UI must look like and update with the GridWorld UI and the site UI. One design language, four surfaces.

## The four surfaces

1. **Game HUD** — WebGL overlay UI inside the 3D world.
2. **Site** — the public web experience.
3. **Phone app** — iOS/Android companion (manage + analyze; see docs/GRIDWATCH.md for the watch split).
4. **Grid Browser chrome** — tabs, address bar, controls, in-world and external (see docs/GRID_BROWSER.md).

A citizen moving between them should never feel a seam.

## Design tokens (single source of truth)

Tokens live in one versioned package consumed by all four surfaces:

- **Color:** grayscale-first base (existing rule) + GridWorld accents — cyan (primary/signature), violet/magenta, ember orange, gold. Windows-style accent personalization carries everywhere: a citizen's accent choice follows them across game, site, phone, and browser chrome.
- **Type:** one family, three roles (display / UI / mono). Minimum sizes per surface; never below legibility on watch (separate spec).
- **Shape & space:** shared radii, spacing scale, elevation, borders. Cards, sheets, and dialogs share geometry.
- **Motion:** one easing vocabulary, one duration scale. Short, interruptible animations.
- **Iconography:** one icon set, one stroke weight, one corner style.

## Shared component kit

Spec'd once, implemented per platform (CSS for site, HUD components in-game, native components on phone, chrome components for the browser):

Buttons, tabs, segmented controls, cards, lists, address/search bar, dialogs, toasts, avatars, stat rings/bars, price tags (GRC), empty states, loading skeletons.

## Theme sync

Extends the existing `Edit → Preview → Publish → Realtime Sync` pipeline (see USER-INTERFACE-ARCHITECTURE.md):

- A theme edit publishes once and propagates to **all four surfaces** within the sync window.
- Overrides allowed per surface for legibility/accessibility (e.g., higher contrast on watch, reduced motion honored everywhere).
- Surfaces declare the design-system version they implement; mismatches fall back gracefully, never break.

## Phone app specifics

- Same primary navigation as USER-INTERFACE-ARCHITECTURE.md (Home, Discover, Communities, Channels, Gallery, Events, Marketplace, Creator Hub, Profile, Enter World), adapted to the mobile bottom-tab + stack pattern.
- Phone = manage + analyze: inventories, maps, settings, full chat, checkout, builder-lite. Watch = monitor + command (docs/GRIDWATCH.md).
- The phone app is the configuration surface for watch complications, regions, notification prefs, and Grid Browser pairing.

## Governance

- New components are proposed with a mockup, reviewed by Aurora (art) + ChatGPT (systems), approved by Paul.
- No surface ships a one-off visual that isn't in the kit. The kit grows; it never forks.
