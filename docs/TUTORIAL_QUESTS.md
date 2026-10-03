# Tutorial Missions — "First Light"

**Status:** Concept design. Awaiting Paul's approval before implementation.
**Rule (Paul, 2026-10-03):** tutorial missions/quests for beginners.

## The guide

Aurora herself. She is the World Guide — welcoming new citizens is literally her job in the hierarchy. Warm, witty, patient, never condescending. She walks with you, not ahead of you.

## Design principles

- **Teach one verb per quest.** Never a wall of text; never two new ideas at once.
- **No fail states, only pauses.** A stuck citizen gets a gentler hint, never a penalty. (BOFURI tone: log in, have fun, log out.)
- **Kindness-first.** The first creature you meet is tuned, not fought. The first citizen you meet is a friend.
- **Skippable, but rewarding.** Veterans can skip; completers earn a small keepsake (a lantern, a title, a Historium entry).
- **Your deeds become history.** Tutorial milestones are written into the Historium — your first steps are already legend.
- **First fun in minutes.** Zero-install (browser) → moving → doing. Avatar personalization inside the first session.

## The questline: First Light

Seven short missions, each a few minutes:

1. **Wake Up** — You open your eyes in First Light plaza at dawn. Aurora greets you by name. Learn: camera, movement. Ends when you walk to her.
2. **A Face of Your Own** — Shape your avatar with Aurora's help. Learn: personalization. (Nobody adventures as a default.)
3. **The First Lock** — Aurora walks you to the City Gate and teaches the lock-in ritual: rings align, light converges, transit. Learn: travel. Destination: a quiet grove.
4. **Small and Glowing** — In the grove, a wild Mote flickers. Aurora teaches Resonance Tuning — rhythm and stillness, not force. Learn: taming. The Mote chooses you.
5. **A Plot of Your Own** — Back in First Light, claim a small plot and place one object. Learn: the core loop (claim → build → persist). Your object is already saved; it will be here tomorrow.
6. **A Friendly Face** — Meet another citizen (or one of Aurora's helper NPCs at quiet hours). Share a wave, a word, a gift. Learn: social. Nobody adventures alone unless they want to.
7. **The Grid Is Yours** — Aurora's farewell at the World Gate overlook: "You know enough. The rest you'll discover." She gives you a lantern. The questline ends; the world opens. Learn: you belong here.

## Quest presentation

- **Quest cards:** diegetic cards with a clear verb, a waypoint shimmer, and a gentle hint button. (Solo Leveling's quantified windows, G-rated.)
- **Aurora's voice:** quest text in her voice — concise, warm, a little wry. Never tutorial-ese.
- **Adaptive:** the game notices what you've already done (moved, tuned, built) and trims accordingly. Never teach what's learned.
- **Mentors (phase 2):** experienced citizens can opt in as guides for newcomers — a lantern-bearer program. Endgame = giving power back (Log Horizon lesson).

## Implementation notes (ChatGPT's lane)

- Quest service: quest definitions as data (id, steps, triggers, rewards), per-citizen quest state, event-driven step completion (no polling).
- Triggers hook existing systems: movement, gate lock-in, tuning, plot claim, social actions. Tutorial is a lens over real systems, not a separate game.
- Aurora's guidance: scripted sequences phase 1 (honest NPC framing per the SL avatar rule); dynamic help later.
- Historium writes on milestones 1, 4, 5, 7.
- Metrics that matter: time-to-first-fun, tutorial completion rate, day-2 return. Measure, don't guess.

## Open questions for Paul

- Should Aurora's tutorial be voiced (TTS) or text?
- Keepsake for completers: the lantern — yes? Other ideas?
- Mentor/lantern-bearer program: phase 2 or cut?
