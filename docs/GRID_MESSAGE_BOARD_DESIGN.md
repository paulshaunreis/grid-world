# Grid World — Shared Message Board Design

Status: DESIGN / implementation-ready direction
Date: 2026-10-06

## Product intent
One persistent community message board exists both inside Grid World and on the signed-in website. Both surfaces use the same authoritative backend records. A post made in-world appears on the website and a website reply appears in-world without a second forum database.

The inspiration is the role of the BBS in .hack: a living social layer for help, rumors, current events, meetups, discoveries, trading, artwork, and community stories. Grid World keeps its own terminology and IP.

## Core spaces
WORLD, NEWS, MARKET, CARD TABLE, QUESTS, CREATOR, GUILDS, LORE, SOCIAL, HELP.

A future unofficial/rumor layer may exist, but it must be clearly labeled community content and remain subject to safety/moderation rules.

## Identity
Every account has first/middle/last account identity plus a unique public Grid Handle beginning with @. The handle is the primary social identity. Private/account identity is never exposed by the handle system unless explicitly published.

## Live synchronization
1. Website or in-world client writes a post.
2. Authoritative database stores it.
3. Realtime event reaches subscribed clients.
4. The other surface updates without a reload.
5. Replies, reports, blocking, and moderation use the same record IDs and permissions.
6. Offline users see current state when they return.

The website must work without loading the 3D world.

## Security
Database permissions are authoritative; browser filtering is not access control. Preserve the existing forum/RLS authority rather than creating a second authorization system.

Required: author ownership, moderator roles, report/block/mute, anti-spam/rate limits, edit/delete moderation history, content-rating enforcement at the database boundary, bounded pagination, and no client authority over reputation, currency, tournament prizes, or moderation state.

## UI
In-world: Social/HUD access plus physical public Message Board terminals in towns. Use the existing movable GridSnap/window language.

Website: signed-in responsive route, phone through ultrawide, no WebGL dependency, deep links to threads.

Posts can show handle, avatar, timestamp, thread state, and optionally world/region context.

## Atmosphere
Ancient archive + advanced network: etched glyphs, archival borders, translucent technical panels, saturated neon accents, signal traces, animated message-arrival pulses, and subtle data motion. It should feel like a civilization with centuries of accumulated digital history.

## Implementation rule
Audit the existing forum schema and PR #88 before adding tables. Extend existing authority where possible. Do not build a second messaging architecture merely to obtain the visual experience.
