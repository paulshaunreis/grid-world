# Areas, Shards & First Sight

**Status:** Concept design. Awaiting Paul's approval before implementation.
**Rule (Paul, 2026-10-03):** First Light must be big — or handle places like WoW servers, but NEVER stop users from meeting each other; servers are just an extended word in the gates. Some areas unlock mysteriously (quests). First visit to an area gets a 3D cinematic + a mysterious description.

## Shards are words, not walls

Places scale like WoW servers: when First Light fills up, it opens **wards** — First Light · Ember Ward, First Light · Tide Ward — each a full copy of the city, each just an extended word in the gate address.

The iron rule: **a shard must never stop one user from meeting another.**
- Joining a friend is one lock-in: the gate offers "join [friend]'s ward" directly.
- Parties sync wards automatically when traveling together.
- The ward word is visible but ignorable — most citizens never think about it.
- Capacity overflow is invisible; social connection is explicit.

Shards are plumbing. Friendship is the interface.

## First Light, the big place

First Light is the starting city AND the social heart — it needs to feel like a city, not a lobby:
- **Dawn Plaza** (arrival, Aurora's greeting), **Gate Terrace** (the World Gate + city gates), **Tethered Market** (trade, food, noise), **Quiet Grove** (tuning tutorial, calm), **The Overlook** (farewell point, whole city below), **Residential Wards** (citizen plots cluster here first).
- Big enough to get lost in, dense enough to never feel empty. Small-dense rule applies per ward.

## Mysterious unlocks

Some areas don't appear in the registry — they show as **???**, a silhouette with a whisper:
- **Quest unlocks:** finish a questline, earn the lock. (The Verdant deep grove after the tuning trials.)
- **Deed unlocks:** the Historium notices — help enough citizens, and a door opens. (Kindness as a key.)
- **Group unlocks:** ancient things open for communities — some seals need many hands. (Ancient Gate tie-in.)
- **Mystery unlocks:** no criteria listed. The Mirror Gate's shimmer changes; the Silent Gate has never opened. Some doors are mysteries on purpose.

Sealed by story, never by paywall. A locked area is a promise, not a punishment.

## First Sight — the cinematic

The first time a citizen enters an area, the world introduces itself:
- A short **3D flythrough** — camera sweeps the landmark, the light, the life — then settles behind you as control returns.
- Over it, **one mysterious description line**. Not a wiki entry — a whisper:
  - *"The Ember Ward — where the lanterns never go out, and neither do the stories."*
  - *"The Quiet Grove — the trees remember every tune ever played here."*
  - *"The Sunken Gate — it flickers on storm nights. Nobody knows why."*
- Skippable, short, epic. Repeat visits: no cinematic, just the world.
- Aurora's touch: she recorded the lines. Her voice, wry and warm, naming each place like an old friend.

## Implementation notes (ChatGPT's lane)

- **Gate registry:** addresses gain an optional ward word; friend-ward join = one lock-in; party ward sync on travel.
- **Shard service:** capacity-driven ward spin-up, invisible overflow, ward affinity (friends/strangers balance), cross-ward chat always on.
- **Unlock service:** area access flags per citizen (quest/deed/group/mystery), registry silhouette rendering for locked areas, Historium deed hooks.
- **First Sight system:** per-citizen per-area "seen" flags; cinematic = scripted camera path + title card + description line (data-driven, one entry per area); skip support; must be cheap (no loading-screen hell — stream during the sweep).

## Open questions for Paul

- Ward naming: poetic (Ember Ward) or numbered (Ward 7)?
- First Sight length target: ~10 seconds? Shorter?
- Should friends be able to *pull* you to their ward, or only join-by-choice?
