# Grid World — Shared Profile Style Standard

**Date:** 2026-10-11  
**Status:** User-approved design direction; implementation pending  
**Reference:** User-supplied Ultima profile UI screenshot and Ultima AI Assistant Profile Sheet.

## Visual system

- Use a consistent grayscale-first foundation across every profile: dark neutral surfaces, restrained gray borders, readable typography hierarchy, and consistent spacing/layout.
- The selected profile style changes the accent palette, glow, and decorative elements. Style changes must be visible immediately and must not change the underlying information architecture.
- Use the supplied Ultima profile screenshot as the composition reference: cinematic cover/identity area, prominent avatar, modular information panels, and clear section hierarchy.
- Keep layouts responsive across desktop, mobile, and foldable viewports; maintain accessible contrast and visible focus states.

## Profile types

- **Player:** identity, bio, avatar, presence, social links, gallery/media, activity and privacy-controlled information.
- **Staff:** identity, role, specialties, published work, assignment and permitted contact actions.
- **NPC:** character identity, lore/personality, role, world/location, interaction history and capabilities appropriate to the NPC.

All types share the same visual language, not identical content. Respect authorization and privacy rules; do not expose private fields to make cards look fuller.

## Ultima portrait

The user supplied an Ultima AI Assistant Profile Sheet and requested that Ultima's profile picture be updated to match it. Extract a dedicated head-and-shoulders crop from the sheet, add it as a repository asset, update the canonical roster/profile reference, and verify the image renders at avatar and profile sizes. Do not use the entire sheet as a small avatar. Until these implementation steps are committed and checked, the portrait update remains pending.

## Verification checklist

- [ ] Shared profile shell is used consistently across player, staff, and NPC profile routes.
- [ ] Changing Style visibly updates accents/decorative treatment without breaking layout.
- [ ] Existing profile data, social authority, media, and privacy rules remain intact.
- [ ] Ultima's new portrait asset exists and loads successfully.
- [ ] TypeScript, analyzer, and production build pass.
- [ ] Test desktop/mobile layouts and key profile interactions in a browser.
- [ ] Record PR, CI result, merge state, and deployment/browser verification separately.
