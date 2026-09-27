# Grid World Architecture

## Client layers
- Core — input, player controller, interaction, camera.
- World — regions, terrain, lighting, landmarks, world objects.
- Persistence — future account/session/world-state services.
- Networking — future authoritative multiplayer synchronization.
- UI — future HUD, inventory, chat, social systems.

## Interaction contract
World objects expose an interactable flag and optional interaction name. The interaction system raycasts from the center of the player's view and returns the first interactable object.

This keeps interaction independent from networking. Later, an interaction can become a server-authorized action without replacing the client-facing interface.

## Multiplayer direction
The eventual authoritative model should treat the server as the source of truth for player identity, player state, ownership, world object state, permissions, and persistence.

The browser client remains responsible for presentation, input, prediction/interpolation, and rendering.
