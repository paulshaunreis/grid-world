# Gridline Messages — Product and Security Design

**Status:** Design baseline for implementation  
**Product surfaces:** The existing Grid World Social Manager in `src/ui/GridSocialPanel.ts` and a signed-in Messages area on the Grid World website  
**Goal:** Private, dependable conversations that fit Grid World's visual language and protect users from unwanted contact.

Gridline Messages takes functional cues from Second Life's grid-wide instant messages, offline delivery, separate conversations, and mute controls. Its UI, names, privacy defaults, and safety behavior are original to Grid World. See [Second Life Instant Message](https://wiki.secondlife.com/wiki/Instant_Message), [Communication](https://wiki.secondlife.com/wiki/Communication), and [Mute](https://wiki.secondlife.com/wiki/Mute).

## Product decisions

- **One shared inbox, two access surfaces.** Add a `MESSAGES` tab to the current Social Manager beside Friends, Groups, Guilds, Teams, Stores, and NPCs. Also add a signed-in Messages area to the Grid World website, reachable without entering/loading the 3D world. Both surfaces use the same account, conversations, requests, recipient settings, blocks, and delivery state through the same authorized service. A message opened from a profile, friend row, or avatar routes to the correct conversation in the in-world tab; the website routes to that same thread.
- **Pseudonymous by default.** A Grid handle and chosen display name are sufficient to find and message another player. The message system never asks for or displays a legal name, email address, face image, phone number, or real-world location.
- **Private threads.** Support direct messages first, then small group conversations with explicit membership. A direct message is delivered grid-wide; region presence is not required.
- **Recipient control.** Users choose who can start a conversation: anyone, friends, or nobody. Messages from allowed non-friends enter a separate request state until accepted. Do not expose message body previews or read receipts for pending requests.
- **Available outside the game.** The website inbox is a first-class fallback when a player cannot load or access the 3D client. Sign-in, inbox, requests, sending, block, and report do not depend on the renderer, WebGL, or a live game session.
- **Offline delivery.** Queue encrypted messages for a limited, configurable retention window and retrieve them from either surface. Show delivery state clearly; do not forward messages to email. Expired messages are deleted and the sender is told they expired.
- **Block means stop contact.** Blocking rejects new messages server-side and suppresses friend requests, presence, voice invitations, party invites, and other direct-contact requests between the two accounts. Do not tell the blocked account who blocked them. Keep the block reversible; preserve the blocker's own history unless they delete it.
- **Report without routine surveillance.** There is no message-body scanning or routine staff access. A user can report a conversation and explicitly select messages to include. Explain that selected content and minimal routing context will be visible to the safety team for review. Apply retention limits and access audit to report evidence.
- **No ambient tracking.** Typing indicators, read receipts, online/away status, and presence-based delivery are off by default or controlled separately. A private conversation never reveals a user's world, region, coordinates, or real-world location.
- **No AI access by default.** Message content is not used for model training, assistant memory, summaries, or moderation inference. Any future assistant feature requires a separate explicit user action and must state what content it will access.

## Privacy and encryption boundary

Use a maintained, independently reviewed end-to-end encryption protocol/library; do not invent cryptography. The service stores and relays ciphertext, not readable message bodies. Route only what delivery requires (conversation ID, sender/recipient IDs, timestamps, ciphertext size, delivery state). Avoid logging ciphertext, message text, keys, or full request bodies.

Before release, document and verify:
- key creation, device enrollment, recovery, revocation, and rotation;
- offline queue encryption and deletion behavior;
- multi-device and group-key changes;
- what metadata remains visible to Grid World infrastructure;
- how a user may include selected plaintext in a report;
- fallback behavior when a recipient's keys are unavailable.

If a dependable protocol and recovery flow are not ready, do not label the feature end-to-end encrypted. Keep it behind a release flag until those properties are implemented and independently reviewed.

## Integrated UI behavior

- Add `MESSAGES` to the existing Social Manager tabs and render its inbox in the existing `.gw-social-body` and `.gw-social-list` patterns.
- Inbox rows use Grid handles/display names, unread count, last activity time, and a neutral delivery state. Never show an online badge unless the recipient opted to share online status.
- Selecting a row opens the conversation within the same panel. Use the established dark translucent card surfaces, cyan accent, IBM Plex Mono labels, Space Grotesk headings, and existing responsive sizing.
- Provide clear `Message`, `Accept`, `Decline`, `Block`, and `Report` actions, with keyboard focus states and accessible labels.
- Use DOM `textContent` for player text; never interpolate message bodies or user-controlled names into `innerHTML`.
- Do not show message content in desktop/browser notifications by default. Let the user choose generic alerts versus previews.
- Keep local history and server retention controls distinct and understandable. Deleting a local copy does not imply remote deletion; disclose that behavior and provide delete-for-everyone only when protocol and delivery semantics support it.

## Simplified in-world HUD and viewport layout

The 3D world is the primary content. The HUD should provide access and orientation while leaving most of the screen available for looking around and playing.

- Default to a compact **top status bar**, **bottom action bar**, and slim **left and right side rails**. The top bar carries only essential world/session status; the bottom bar carries the few primary actions; side rails organize tools and contextual panels.
- Keep the default world view visually open. A practical desktop target is to preserve at least roughly three quarters of the viewport for the world during normal play. Treat this as a layout target, not a promise on small screens.
- Use narrow icon rails as the persistent sidebars. Expand a rail into a labeled drawer or contextual panel on demand; expanded panels overlay the world instead of permanently reducing the 3D canvas width.
- Group actions instead of showing a separate permanent window for every subsystem. For example, the left rail can group World, Build, Inventory, and Map; the right rail can group Social/Messages, Party, and Quests. Keep names aligned with the features that actually work.
- Show at most one large contextual panel at a time. Opening another panel replaces or explicitly docks the previous one. A clear close/back action and predictable Escape behavior return focus to the world.
- Reduce always-visible telemetry, decorative cards, repeated labels, and simultaneous popups. Move secondary diagnostics, art galleries, help, and detailed world information into their relevant panel.
- Let players hide or collapse bars and rails, and remember their choices. Provide a simple default/reset layout action in Settings.
- On phones, replace the side rails with an accessible navigation drawer or compact bottom navigation. Keep the world visible behind lightweight overlays; ensure controls do not cover the main view or the on-screen keyboard.
- Respect safe areas, portrait/landscape changes, short viewports, browser zoom, touch targets, and reduced motion. Fit the actual available viewport rather than assuming a specific 2026 phone or PC aspect ratio.

This is a visual hierarchy and layout target, not a request to copy a particular game's HUD. Keep Grid World's existing type, colors, translucent surfaces, and icon language while removing competing visual noise.

## Custom window controls and GridSnap

Floating Grid World panels should behave like windows, with Grid World controls that are easy to recognize and use.

- Provide **Minimize**, **Maximize / Restore**, and **Close** controls in every window header. Use accessible labels and keyboard focus states; do not rely on ambiguous symbols alone.
- Minimize sends the panel to a small window dock in the bottom bar. Selecting its dock item restores it and returns focus to the panel.
- Maximize fills the usable interface area while respecting the top/bottom bars, side rails, and safe areas. Restore returns the panel to its previous size and position.
- Close dismisses the panel and leaves a restorable entry in the dock or the owning tool rail. If unsaved work could be lost, save a draft or ask before discarding; closing must not silently delete content.
- Add **GridSnap**: while moving a window, show a clear placement preview when it nears an edge or supported tile zone; releasing snaps it into that zone. Support left/right halves, top/bottom zones, center, and a user-configurable alignment grid for free placement.
- GridSnap must use the available work area after bars, rails, safe areas, and other snapped windows are accounted for. Snapped windows must remain reachable and should not cover all of the world view.
- Let users disable snapping and adjust its sensitivity. Persist position, size, snap zone, maximize state, and minimized/closed state in the existing layout preferences; include a reset-layout option.
- Support pointer/touch dragging, keyboard move/resize actions, reduced motion, and accessible controls. On narrow phones, present panels as full-screen pages or sheets instead of trying to tile them side by side.
- Opening a window should bring it forward without unexpectedly changing its saved size or another window's state.

The current `WindowManager` already exposes minimize and hide actions and stores basic size/position state; this design completes the interaction model with explicit close behavior, maximize/restore, a window dock, and GridSnap.

## In-world system menu and Settings

The in-world interface needs a familiar, predictable system menu that fits Grid World's own visual design.

- Pressing `Escape` opens a pause-style system menu when no modal is active. Pressing `Escape` while the menu is open resumes the world. If another modal is open, the first press closes only the topmost modal; it must not accidentally activate a control behind it.
- Put **Resume** and **Settings** first and make them available by keyboard. Include **Controls**, **Accessibility**, **Privacy & Safety**, **Messages & Notifications**, **Help / Report a problem**, and **Leave World**. Confirm before signing out or leaving an unsaved activity.
- Organize Settings into clear categories. Keep account identity/profile editing inside Account or Identity settings; do not use the Settings entry as a shortcut that directly opens the identity editor.
- Opening this menu captures keyboard focus, pauses local gameplay input, and prevents world interactions through the overlay. It must not imply that server-side presence or communication has stopped; those are governed by explicit privacy and presence controls.
- Keep an always-visible equivalent menu/settings action for touch devices where Escape is unavailable. Respect safe areas, short heights, browser back behavior, keyboard focus, and screen readers.
- Use Grid World's existing type, color, translucent surfaces, spacing, responsive behavior, and icon language. Follow familiar menu conventions without copying another game's art or branded layout.
- Share one Settings destination between the system menu and the existing HUD Settings action so users do not encounter two competing settings flows.

The current main branch routes the HUD Settings action to the identity panel, and `Escape` only closes that panel. Treat the system menu as a dedicated UI flow and keep identity editing as one settings section.
 
## Responsive website design across Grid World

This requirement applies to the whole Grid World website, including the Messages area, social/profile pages, navigation, forms, cards, and account/settings surfaces.

- Adapt to the available viewport and input capabilities rather than detecting named phone or PC models. Support tall and narrow portrait phones, wide/short landscape phones, tablets, browser split-screen, standard PC windows, and ultrawide displays. Do not assume one fixed aspect ratio such as 16:9.
- Use fluid sizing and content-driven breakpoints. Keep long-form content readable on wide displays with a sensible maximum line length; let card grids gain columns when space allows and stack naturally when it does not.
- Reflow ordinary content without losing functionality or requiring two-dimensional scrolling at 320 CSS pixels. This is the WCAG 2.1 AA Reflow criterion for vertically scrolling content, with specified exceptions for content that inherently requires two dimensions. See [W3C guidance on Reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow).
- Account for mobile browser chrome, notches, and rounded corners with dynamic viewport sizing and safe-area insets. Avoid fixed-height panels that hide the composer or primary actions when the on-screen keyboard opens.
- Make global navigation usable on small viewports, keep focus visible, and preserve access to every route when desktop navigation collapses.
- Ensure dialogs, drawers, message lists, composer controls, tables, and profile cards reflow or scroll within their own region. Do not clip controls at short viewport heights.
- Support touch, keyboard, mouse, browser zoom, text enlargement, and reduced motion. Interactive controls must remain usable when text wraps or system font sizes increase.
- Keep ultrawide pages composed: cap reading widths, use deliberate multi-column layouts, and avoid stretching text and forms across the full display.
- Verify representative viewport widths including 320 CSS pixels, common compact and large phone widths, tablet widths, standard desktop, and ultrawide; test portrait and landscape and short viewport heights. These are test points, not device-specific layout branches.

## Server authority and data boundaries

The browser is untrusted. Membership, send permission, recipient preferences, block state, rate limits, offline expiry, and report authorization must be enforced server-side in one atomic send operation. A client-side check is only a usability aid.

Proposed logical records (final schema depends on the audited Supabase project schema):
- `message_conversations`: opaque ID, type, creator, created/updated timestamps; no public directory listing.
- `message_members`: conversation ID, account ID, role, joined/left state, key version, notification preferences.
- `message_envelopes`: conversation ID, sender account ID, ciphertext, client-generated message ID, created/expiry/delivery timestamps.
- `message_requests`: recipient account ID, sender account ID, pending/accepted/declined state, created/expiry timestamps.
- `message_blocks`: blocker account ID, blocked account ID, timestamps; readable and mutable only by the blocker.
- `message_reports`: reporter, target, reason, selected evidence, restricted review state, retention deadline, and access audit.

Database rules and RPCs must ensure:
1. Only active conversation members can read envelopes or membership.
2. A send checks authentication, active membership, recipient policy, block state in both directions, rate limits, size limits, and expiry in one transaction.
3. A pending request cannot be used to send repeated messages or group invitations.
4. Removing a group member revokes future access and rotates group keys; new members cannot read old messages by default.
5. A block is enforced across messages and other direct-contact systems, not only hidden in the UI.
6. Report evidence is isolated from ordinary client access and visible only to authorized reviewers.
7. Service-role keys never ship to the client; privileged operations run in trusted server code.
8. Account deletion and data export cover messages, keys, requests, blocks, and reports under their documented retention rules.

The repository currently has a Social Manager and friend relationship RPCs but no committed private-message service/schema. Its deployed profile and social schema also needs to be captured in version-controlled migrations before RLS behavior can be verified. Do not ship a client-only mock as a production messaging system.

## Abuse resistance and safety

- Server-side per-account, per-recipient, and per-device send throttles with escalating cooldowns.
- Strict message and attachment size limits; v1 has text only.
- Pending request inbox isolation, bulk decline, block, and report without opening the message.
- Block and report actions immediately take effect, even if moderation review is delayed.
- Group additions require consent from the invitee; leaving is always available.
- Audit sensitive staff access to report evidence and administrative actions, but do not create routine plaintext message logs.
- Protect against notification spam, identifier enumeration, replay, duplicate delivery, forged sender identity, membership races, and ciphertext substitution.
- Never use a user's real-world identity or face as a condition for messaging access.

## Delivery plan

1. **Foundation:** capture the real Supabase schema and RPCs as migrations; choose and threat-model a vetted encryption protocol; agree on retention and account recovery.
2. **Direct messages:** add server-authorized conversations, recipient policies, requests, blocks, offline encrypted delivery, and a `MESSAGES` tab in Social Manager.
3. **Safety:** reporting with selected evidence, reviewer permissions/audit, spam limits, and abuse-response playbook.
4. **Groups:** explicit invitations, membership lifecycle, group-key rotation, leave/remove controls, and per-conversation notification settings.
5. **Release gate:** test RLS and RPC authorization as multiple users, verify blocked/pending/expired/offline paths, test deletion and key recovery, and review the crypto integration before enabling production traffic.

## Acceptance criteria

- A user can start a direct conversation from Social Manager, a friend row, or a profile and always lands in the same integrated Messages tab.
- A pseudonymous account can use all messaging features without disclosing real-world identity or a face to other users.
- A non-friend can only contact the recipient through the recipient's configured request policy.
- A blocked sender cannot deliver through alternate client calls, and block state applies to all defined direct-contact channels.
- An offline recipient can retrieve unexpired encrypted messages after signing in; expired content is not retrievable.
- Non-members, removed members, and unauthenticated clients cannot read conversation content through direct API calls.
- Message bodies are not present in normal logs or analytics.
- A report includes only the messages the reporter selected and creates an auditable, access-controlled case.
- UI styling and navigation match the current Social Manager and Grid World website, including narrow screens and keyboard use.
- The website inbox can authenticate, load, send, receive, block, and report without initializing the 3D renderer or requiring an active game session.
- Escape opens and closes the in-world system menu predictably; modal stacking, focus, gameplay input, touch access, and the shared Settings route behave as specified.
- During normal play, a top bar, bottom bar, and slim left/right rails remain available while at least roughly three quarters of a desktop viewport stays visually devoted to the world; expanded panels do not permanently shrink the world view.
- Every floating panel provides minimize, maximize/restore, close, and GridSnap behavior, with a visible way to restore minimized or closed panels.
- Across site pages, essential content and actions remain available at 320 CSS pixels and at tall, wide, landscape, and ultrawide viewport shapes without layout clipping or unintended two-dimensional scrolling.
