# Grid World Runtime Portability Map

**Audit date:** 2026-10-10  
**Scope:** Source-level map of the current browser runtime. This is a migration aid, not a claim that desktop support already exists.

## Current boot and frame path

1. play.html creates the #app DOM mount and loads src/main.ts.
2. src/main.ts initializes world systems, persistence/network adapters, the GridEngine instance, camera, WebGL renderer, fallback canvas, UI, and most event wiring.
3. src/engine/GridEngine.ts owns a subsystem registry and frame clock, but its public types use THREE.Scene and THREE.Camera.
4. src/engine/ThreeGridRenderer.ts adapts GridEngine render calls to THREE.WebGLRenderer.
5. The main animation loop in src/main.ts updates player/world systems and calls engine.render(camera, frame).
6. Resize and unload listeners are registered at the end of src/main.ts; resize updates camera projection, renderer size, and GridEngine size.

## Portability classification

| Area | Current modules / evidence | Coupling | Migration note |
|---|---|---|---|
| Browser entry and orchestration | play.html, src/main.ts | High: DOM, canvas, renderer, camera and many systems initialized in one module | Keep the existing boot path stable. Extract lifecycle seams gradually; do not rewrite the large file in one pass. |
| Engine lifecycle | src/engine/GridEngine.ts, GridEngineRuntime.ts, GridEngineCore.ts | Medium: subsystem lifecycle is reusable, but frame and renderer contracts use Three.js types | Keep as the current Grid runtime coordinator. Avoid calling it engine-neutral until the scene/camera contract is deliberately addressed. |
| Renderer | src/engine/ThreeGridRenderer.ts | High: explicitly wraps THREE.WebGLRenderer | Good adapter for current web renderer. A native runtime needs a separate implementation and likely a separate scene representation, not just a new renderer class. |
| World/scene graph | src/world/World.ts and related world/engine modules | Very high: THREE.Scene, Mesh, Group, geometry, lights and materials are used directly | Treat Three.js world construction as a Three-backed implementation. First identify portable world definitions/data separately from scene objects. |
| Player/avatar and camera | src/core/PlayerController.ts, camera logic in src/main.ts | High: Three.js transforms plus DOM pointer-lock/mouse/wheel events | Preserve control semantics; isolate input intent and camera policy before attempting native input integration. |
| Input | src/core/Input.ts, src/core/InputPlatform.ts, src/platform/BrowserInputPlatform.ts | Reduced for key/gamepad acquisition: Grid input now depends on an interface, with a browser adapter providing global keyboard/gamepad events | PR #121 merged with passing type/build CI; viewport and camera event handling are still browser-bound. |
| Viewport resize | src/platform/BrowserViewport.ts | Reduced: uses injected camera/renderer/resize interfaces; owns the browser window resize listener | PR #123 merged with passing type/build CI. Canvas creation and pointer-lock/camera mouse handlers remain in main.ts. |
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
2. Extract browser input acquisition and viewport resize lifecycle in small, reversible changes while keeping the existing DOM controls and movement/camera behavior.
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


## 2026-10-10 update

- PR #121 separated keyboard/gamepad acquisition behind InputPlatform and BrowserInputPlatform.
- PR #123 separated viewport resize-listener lifecycle behind BrowserViewport.
- Both PRs passed GitHub Actions TypeScript and build checks. Browser/WebGL behavior remains unverified; the next target is pointer-lock and camera-event wiring, after an asset URL/decoder audit.


## 2026-10-12 update — asset path and decoder inventory (source-level)

- Confirmed on `main` that `src/engine/dracoLoader.ts` sets the decoder base to the root-relative URL `/libs/draco/`.
- Confirmed the following public files exist at those repository paths: `public/libs/draco/draco_wasm_wrapper.js` and `public/libs/draco/draco_decoder.js`. The GitHub file API could not render `public/libs/draco/draco_decoder.wasm` as UTF-8 because it is binary; that response is consistent with the file being present, but does not verify its contents or production delivery. The path `public/libs/draco/draco_wasm_wrapper.wasm` returned 404 and is not the configured decoder filename.
- Initial finding: the source path and checked-in decoder filenames appear aligned with Three.js's configured decoder directory. Do not change this path without evidence of a failing deployment. Root-relative `/libs/draco/` may still need an asset-base strategy if Grid World is ever hosted below a URL subpath or packaged outside the browser.
- `src/engine/GridModelLibrary.ts` is a source registry of model-source references and metadata; the registry itself does not prove that referenced models are downloaded, bundled, licensed correctly in the shipped artifact, or loading in the running world.
- Verification boundary: this was a repository source/path inspection only. No production URL request, browser GLTF load, compressed-model decode, or desktop package test was performed. Do not mark decoder runtime as verified.
- Next asset-audit steps: inspect every GLTF/GLB/texture/audio loader call site and URL construction; identify which models are actual local assets versus external catalog references/procedural fallbacks; then run a browser smoke test that loads at least one known Draco-compressed asset and records network responses. Preserve current browser behavior until that test supplies evidence for a change.


### Loader call-site findings

- `src/core/PlayerController.ts` calls the shared `createGLTFLoader()` and requests `/models/avatars/avatar-${gender}-clothed.glb`. Both `public/models/avatars/avatar-male-clothed.glb` and `public/models/avatars/avatar-female-clothed.glb` are present in the repository. This confirms the source asset paths exist; it does not confirm that the deployed browser can fetch/decode them or that the models contain the expected animations/materials.
- `src/engine/GridPBRLibrary.ts` loads image textures from `/textures/${textureFile}` using `THREE.TextureLoader`. The world uses names including `tex-ground-metal-deck.webp` and `tex-ground-plaza-dark.webp`; matching repository paths under `public/textures/` exist (the file API reports binary UTF-8 decode errors for these image files, not a successful image decode test).
- These are root-relative runtime paths. Confirm they return HTTP 200 in the deployed app and work under the intended hosting base path before changing path construction.
- A first-pass text search through the known entry modules did not yield a complete inventory of every loader, so the audit remains incomplete. Do not infer that there are no additional loaders from that search.
- GitHub Actions run #1520 for the documentation branch completed successfully. This checks the repository CI workflow for the documentation change; it is not a browser asset-loading test.
