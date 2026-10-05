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
- Across site pages, essential content and actions remain available at 320 CSS pixels and at tall, wide, landscape, and ultrawide viewport shapes without layout clipping or unintended two-dimensional scrolling.
