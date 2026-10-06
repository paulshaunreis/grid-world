# Grid World Global Language & Localization Architecture

Date: 2026-10-06
Status: Design + implementation requirements

## Core rule
Grid World is multilingual by default. Website, pre-auth onboarding, account creation, in-world UI, Message Board, direct messages, proximity chat, NPC dialogue, marketplace, card game, cards, coins, item art, quests, system notices, and help content must have a localization path.

The canonical record remains language-neutral where possible. Human-authored text is stored in its source language; translated presentation is generated per viewer.

## Pre-send multilingual conversation
When User A speaks French and User B has Japanese selected:
1. User A types in French.
2. Client detects source language.
3. While typing, the client debounces a translation preview request.
4. The compose UI shows a non-destructive recipient preview.
5. The final send path performs an authoritative translation check.
6. The server stores the original message exactly once.
7. Per-recipient translated renderings are produced for each recipient language.
8. Recipients receive the translated presentation with a Translated from indicator and Show original control.
9. If translation fails, the recipient receives the original message.
10. Translation output is never the canonical message.

## Latency policy
- Draft preview: debounced, cancellable, cached.
- Send path: authoritative server translation.
- Never block a message indefinitely because a translation provider is unavailable.
- Users can disable automatic translation for a conversation.
- Users can always inspect the original.

## Cards, coins, and imagery
All reusable visual assets should have a textless master artwork. Text is a localization layer rendered separately.

Asset pipeline:
MASTER ART -> GRID BRAND MARK -> LOCALIZED TEXT LAYER -> LAYOUT VALIDATION -> EXPORT

Cards: artwork is textless; name, type, rules, stats, rarity, serial/provenance and notices are localized overlays. Layout must support CJK, Arabic and long-language strings.

Coins: base coin art is textless; denomination, mint mark, series and provenance text are localized presentation layers.

## Grid World provenance mark
Every Grid World-owned or Grid World-generated image should receive two complementary signals:
1. A tasteful visible black/white Grid World provenance stamp at approximately 0.20 opacity, adjusted by contrast testing.
2. Machine-readable provenance through Content Credentials/C2PA where supported.

The visible mark is a brand/provenance cue, not a security guarantee.

For high-value assets, combine visible marking, C2PA credentials, internal asset hashes, server-side provenance records and an optional robust invisible watermark.

A detector should return verified, likely, unknown, or tampered, never a false absolute claim.

## Translation provider boundary
Translation credentials remain server-side.

Client: compose -> preview adapter -> server
Server: authorized request -> provider adapter -> translated preview

Send: canonical message -> moderation/security -> persistence -> per-recipient translation/cache -> realtime delivery

The provider must be replaceable. Google Cloud Translation is the first planned provider because of its broad language support and automatic source-language detection.

## Acceptance gates
- Pre-auth language selection exists before account creation.
- Website and in-world language setting use one preference model.
- Per-recipient chat translation preview is implemented.
- Original message is always recoverable.
- Textless master artwork exists for localized card/coin families.
- Grid provenance mark is present on Grid World-owned/generated visual exports.
- C2PA provenance is attached where supported.
- RTL and CJK layouts pass visual QA.
- Translation failures degrade safely.
