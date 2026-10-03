# Grid Browser — the web, inside the Grid and out

**Status:** Concept design. Awaiting Paul's approval before implementation.
**Rule (Paul, 2026-10-03):** a GridWorld browser window like Second Life's — usable BOTH in-world and outside of it. Same UI treatment everywhere.

## Concept

The Grid Browser is a Chromium-based browser wearing full GridWorld chrome. One engine, two modes, one citizen session:

- **In-world mode:** web pages render on 3D surfaces — public kiosks, parcel media screens, shop signage, and a personal HUD browser panel. Click via raycast; scroll via gesture/crown/wheel. Parcel owners can set a shared URL (media screen); public kiosks run an allowlist.
- **External mode:** the same browser as a standalone window outside the game (desktop + phone), signed into the citizen's Grid identity, with the same chrome.

**Continuity:** tabs, history, and bookmarks follow the citizen. Start reading a quest wiki on an in-world kiosk, keep reading on the phone on the bus. Handoff is explicit and visible ("Continue on phone").

## UI treatment (shared chrome spec)

The chrome is part of the Unified UI System (docs/UNIFIED_UI_SYSTEM.md):

- Tab strip, address bar with Grid identity avatar, navigation controls, and menus — all in GridWorld visual language (cyan accents, citizen's chosen accent color, GRC-aware touches like tip buttons on creator pages).
- In-world rendering keeps the same chrome, adapted: larger touch targets on kiosks, simplified chrome on parcel screens (address bar collapsible), full chrome on the HUD panel.
- Loading, error, and security states are designed states, not browser defaults — phishing/malware warnings appear in GridWorld voice, all-ages safe.

## Safety (all-ages, kind, never frightening)

- In-world public surfaces (kiosks, parcel screens visible to others): URL allowlist + safe-content filter. No exceptions.
- Personal HUD panel and external mode: full web, with GridWorld safe-browsing warnings.
- Sandboxed: no filesystem access from in-world rendering, no silent downloads, no popups on shared surfaces.
- Private modes are clearly labeled; shared kiosks auto-clear session on walk-away.

## Implementation notes (ChatGPT's lane)

- Engine options: CEF (in-engine texture), Electron/Tauri (external), or a shared Chromium core with two frontends. Texture streaming path for in-world surfaces; input routing (raycast → DOM events).
- Session sync service: tabs/history/bookmarks across modes, end-to-end for private data.
- Performance budget: in-world surfaces render at capped resolution/frame-rate; pause off-screen surfaces.
- Phased: (1) external browser MVP, (2) personal HUD panel, (3) parcel screens + kiosks, (4) session continuity.

## Open questions for Paul

- Which engine approach fits the custom engine best (CEF embedded vs separate app)?
- Should parcel media screens allow any URL or owner-curated only?
- Do kiosks need the full web or a curated Grid-web (wiki, marketplace, events)?
