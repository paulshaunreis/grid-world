# Persistence Layer

The prototype currently uses browser localStorage so player identity and position survive refreshes without requiring a backend.

The intended production adapter is Supabase:

- `profiles` — player identity and display name
- `player_state` — region, position, heading, and timestamps
- `world_objects` — persistent world objects and ownership

The game code should depend on persistence interfaces rather than directly on Supabase. That lets local development remain playable and lets the backend become authoritative later.
