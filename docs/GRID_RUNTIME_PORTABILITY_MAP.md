# Grid World Runtime Portability Map

**Audit date:** 2026-10-10  
**Scope:** Source-level map of the current browser runtime. This is a migration aid, not a claim that desktop support already exists.

## Current boot and frame path

1. play.html creates the #app DOM mount and loads src/main.ts.
2. src/main.ts initializes world systems, persistence/network adapters, the GridEngine instance, camera, WebGL renderer, fallback canvas, UI, and most event wiring.
3. src/engine/GridEngine.ts owns a subsystem registry and frame clock, but its public types use THREE.Scene and THREE.Camera.
4. src/engine/ThreeGridRenderer.ts adapts GridEngine render calls to THREE.WebGLRenderer.
5. The main animation loop in src/main.ts updates player/world systems and calls engine.render(camera, frame).
6. Resize and unload listeners are registered at the end of src/main.ts; the resize listener updates camera projection, renderer size, and GridEngine size.

## Portability classification

| Area | Current modules / evidence | Coupling | Migration note |
|---|---|---|---|
| Browser entry and orchestration | play.html, src/main.ts | High: DOM, window events, canvas, renderer, camera and many systems initialized in one module | Keep the existing boot path stable. Extract lifecycle seams gradually; do not rewrite the large file in one pass. |
| Engine lifecycle | src/engine/GridEngine.ts, GridEngineRuntime.ts, GridEngineCore.ts | Medium: subsystem lifecycle is reusable, but frame and renderer contracts use Three.js types | Keep as the current Grid runtime coordinator. Avoid calling it engine-neutral until the scene/camera contract is deliberately addressed. |
| Renderer | src/engine/ThreeGridRenderer.ts | High: explicitly wraps THREE.WebGLRenderer | Good adapter for current web renderer. A native runtime needs a separate implementation and likely a separate scene representation, not just a new renderer class. |
| World/scene graph | src/world/World.ts and related world/engine modules | Very high: THREE.Scene, Mesh, Group, geometry, lights and materials are used directly | Treat Three.js world construction as a Three-backed implementation. First identify portable world definitions/data separately from scene objects. |
| Player/avatar and camera | src/core/PlayerController.ts, camera logic in src/main.ts | High: Three.js transforms plus DOM pointer-lock/mouse/wheel events | Preserve control semantics; isolate input intent and camera policy before attempting native input integration. |
| Input | src/core/Input.ts | High: global key listeners and navigator.getGamepads() | Candidate for a platform input adapter that produces Grid actions/axes independently of DOM event ownership. |
| Persistence | src/core/Persistence.ts, src/core/VersionedStorage.ts | Medium: versioned local browser storage | Keep serialization/schema logic reusable; inject a storage adapter for browser, desktop, or future offline storage. Browser local state is not trusted authority. |
| Cloud persistence/config | src/persistence/SupabasePersistence.ts, src/persistence/config.ts | Medium: Supabase SDK/configuration, but not inherently DOM-bound | Reuse the same authenticated service boundary in the desktop client; never ship service-role credentials. |
| Multiplayer presence | src/network/SupabasePresence.ts, src/network/Presence.ts | Low-to-medium platform coupling: Supabase client/realtime and shared player-state types | Potentially reusable with authenticated user sessions; presence data is not proof of trusted gameplay location. |
| Authoritative combat | src/network/GridCombatAuthority.ts and Supabase grid-combat Edge Function | Low UI coupling; service/API contract is reusable | Preserve server authority and validate every action server-side. Client packaging must not grant trust. |
| Asset loading | src/engine/dracoLoader.ts, src/engine/GridModelLibrary.ts, avatar/world loaders | High: GLTFLoader, Draco decoder path /libs/draco/, browser URL conventions | Inventory asset formats, path resolution, licenses, compression and animation before engine selection. Test whether assets can be reused or need conversion. |
| Modular HUD/windows | src/ui/WindowManager.ts and browser page UI | Very high: HTMLElement, document.createElement, CSS classes and browser storage | Likely keep web HUD for browser; desktop client may need a native or in-engine HUD. Reuse UI data models and commands, not DOM elements. |
| Analytics | src/analytics and main.ts initialization | Medium: browser-oriented analytics SDK | Make opt-in/privacy behavior explicit and isolate any browser-only hooks before desktop adoption. |
| Fallback rendering | src/main.ts WebGL failure path | High: HTML canvas 2D context and window dimensions | Keep the browser fallback separate from native rendering; desktop fallback should be designed for the chosen runtime. |

## Cross-cutting risks

- The main.ts module is a large composition root; platform code, Three.js world construction, input, services, UI and the animation loop are interwoven.
- Many world systems accept or retain Three.js scene nodes. A native runtime cannot directly consume these objects.
- Asset URLs assume web-served paths in places, including the Draco decoder. Desktop packaging needs a verified asset locator/loader contract.
- WindowManager is DOM-specific; a native client should not try to embed browser HTMLElement instances into an engine scene.
- Local persistence and client presence are convenience/display mechanisms, not trusted server state.
- No test script was present in package.json at audit time. The build command is grid-code-analyzer.mjs && tsc && vite build. Adapter work needs at least type/build checks and focused behavior tests where infrastructure allows.

## Recommended extraction order

1. Define explicit platform contracts for viewport lifecycle, input actions, asset location, and local storage without pretending that Three.js scene types are portable.
2. Extract browser input/viewport lifecycle in small, reversible changes while keeping the existing DOM controls and movement/camera behavior.
3. Separate world definitions and simulation data from Three.js scene construction where an existing boundary already exists.
4. Build a small runtime comparison slice: one representative scene, one avatar, camera/movement, asset loading, authenticated world entry, and one safe interaction.
5. Compare Three.js against Godot using actual build/asset/performance results. Consider Unreal only if the required fidelity and measured trade-offs justify it.

## Exit criteria for the audit phase

- [x] Locate the current boot, render, resize, input, storage, asset and service boundaries.
- [x] Identify the strongest Three.js and DOM coupling points.
- [ ] Establish a reproducible analyzer/type/build baseline.
- [ ] Inventory all runtime asset formats and URL/path assumptions.
- [ ] Identify existing tests or add minimal focused coverage for the first adapter.
- [ ] Complete a behavior-preserving browser adapter before selecting a native engine.
