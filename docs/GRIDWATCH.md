# GridWatch — GridWorld Smartwatch Companion (design v1)

**Status:** Concept design. No code yet. Awaiting Paul's approval before implementation.
**Platforms:** watchOS (Apple Watch) + Wear OS. Phone apps (iOS/Android) + web site + game server complete the loop.
**Research base:** `~/workspace/research_notes/smartwatch-apps-research-20261003-1615/report.md` — top 2025–2026 watch apps, small-screen UI patterns, companion architectures, battery practices.

## 1. Vision

GridWatch puts the living Grid on the wrist. It is a **companion, not a port** — the research is unambiguous: watch apps win as retention multipliers (glance + quick action), never as shrunken phone apps. No Roblox, VRChat, Second Life, or Fortnite ships a watch companion (verified 2026-10-03); GridWatch would be a first in the virtual-world space.

Governing rule: **watch = monitor + command; phone = manage + analyze; site = configure + deep dive.** Every feature must pass the ten-second test: launch straight into the most relevant detail view.

## 2. Feature set (watch-appropriate only)

| # | Feature | Watch does | Phone/site does |
|---|---------|-----------|-----------------|
| 1 | **Complication dashboard** | Face shows citizen status ring, GRC balance, next event countdown, region weather — one glance | Choose which complications, arrange faces |
| 2 | **Region weather + time** | Set region → see its local time, timezone, weather, hourly strip. Swipe between regions | Pick/set regions, add custom zones |
| 3 | **Event alerts w/ quick actions** | Push: quest complete, friend login, auction sold, guild attack, daily forge drop. Each carries 1–2 actions (Collect / Accept / Decline) | Full event log, notification preferences |
| 4 | **Citizen status** | Energy/mood/hunger rings, location, one-tap Check In | Needs detail, history, tuning |
| 5 | **Quick commands (voice)** | Dictate: "send 50 GRC to Maya", "accept quest", "where is Jax". Canned chips. Crown scrolls lists | Command history, custom macros |
| 6 | **Marketplace glance** | Daily forge item, price, Wishlist tap | Checkout, listings, full catalog |
| 7 | **Citizen chat** | Voice notes + quick replies + emoji. Never the tiny keyboard | Full chat history, threads |
| 8 | **Haptic event language** | Distinct taps: success (quest complete), warning (danger), message (tap). Never ambient buzzing | Haptic intensity settings |

Deliberately NOT on watch: inventories, maps, settings, long-form chat, checkout, world building.

## 3. Screen map (5 core screens, vertical crown pagination)

1. **Face** — time + 4 deep-linked complications (citizen ring, GRC, next event, region weather).
2. **Region** — big temp, condition, region local time + timezone, hourly strip, swipe for regions.
3. **Alerts** — newest event card with 1–2 action buttons; freshness stamp ("2m ago").
4. **Citizen** — stat bars, location, single Check In action.
5. **Forge** — daily item, price, Wishlist; "checkout on phone" footnote.

Mockups: `~/workspace/gridworld/gridwatch-mockups/` (face, weather, notification, citizen, market).

## 4. Cross-platform architecture

- **Independent watch apps** (watchOS 6+ / Wear OS), phone connectivity for *sync, not dependency*. Offline-first: last-known state cached, freshness indicator shown.
- **Real-time path:** game server → APNs/FCM → phone → watch push. This is the ONLY reliable sub-minute channel on watchOS (no inbound sockets to the watch). Every push carries quick actions.
- **Scheduled path:** complication/tile timelines (OS-budgeted), cursor-based delta syncs. watchOS background refresh is OS-scheduled (15min–1hr+); Wear OS tiles ~15min floor.
- **Sync discipline:** WatchConnectivity (context/message/userInfo/file) on watchOS as opportunistic optimization; Wear OS DataClient durable snapshots + MessageClient refresh with monotonic ordering. `isReachable` is never trusted for latency-sensitive features.
- **Site role:** watch pairing, complication/region configuration, notification preferences, full history — everything the wrist shouldn't do.

## 5. Battery budget (Paul's hard requirement)

- **Never poll on a timer.** Push/event-driven only; push is ~30% cheaper than HTTP polling. Inefficient sync = 25% of wearable drain complaints.
- **Batched sync windows:** 2-hour cadence for slow data (weather, forge), cursor-based deltas (empty syncs nearly free), foreground-open sync throttled to 15 min.
- **BLE-first radios; Wi-Fi over cellular.** No continuous GPS — defer to phone. No live sockets.
- **Display:** dark OLED faces, raise-to-wake (no always-on default), short wake duration.
- **Haptics:** meaningful events only; per-event cost is small, constant buzzing + screen wakes are what cost.
- **Complications:** few, essential, timeline-based. Degrade gracefully in Low Power Mode (fewer updates, delayed pushes).
- Acceptance criterion: "doesn't noticeably drain the watch" — judged like the top apps are judged.

## 6. Implementation roadmap (for ChatGPT's take)

1. Game-server push pipeline (APNs/FCM topics per citizen) + delta state API.
2. Phone app: pairing, region config, notification prefs, command macros.
3. watchOS app: complications (WidgetKit), alerts w/ actions, 5 screens, voice commands.
4. Wear OS app: tiles, complications, DataClient sync.
5. Site: pairing + configuration pages.
6. Battery profiling pass against §5 before any public beta.

## 7. Open questions for Paul

- watchOS first, Wear OS first, or both in parallel?
- Which regions ship in the region-weather picker at launch?
- Should quick commands be able to spend GRC from the wrist, or view-only until phone confirms?

## 8. Security (Paul's hard requirement)

No citizen can learn another citizen's IP address or real-world location through GridWatch — or any GridWorld surface. Ever.

- **Relay-only networking.** No direct peer-to-peer connections between clients. Voice goes through TURN relay; game traffic goes through the authoritative server. WebRTC is forced to relay mode; host/srflx ICE candidates (the ones that leak IPs) are disabled.
- **No IPs on any user-visible surface.** Not in profiles, chat metadata, logs, error messages, or debug screens.
- **Location stays on the device.** Phone/watch GPS is never transmitted, never shared, never used for "nearby players" features. Proximity is in-world only. Region weather uses in-world regions; Grid timezones are fictional (Grid Meridian +0) — the device timezone is used for display only and never shared.
- **Session hygiene.** Token-based auth; short-lived tokens on the watch; remote revoke from phone/site if a device is lost.
- **Platform-wide.** This rule binds the watch app, phone app, Grid Browser (both modes), and the game client. ChatGPT: apply to the networking/voice architecture.
