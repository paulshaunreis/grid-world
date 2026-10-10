# Grid World Desktop Runtime — Architecture Audit and Roadmap

**Date:** 2026-10-10  
**Status:** Architecture audit in progress; no engine migration has been selected or implemented.  
**Owner:** Grid World engineering, with Paul as final approver.

## Goal

Evolve Grid World from a browser-first Three.js client into a multi-client world platform: the current browser client remains supported, and a future downloadable desktop client can use a dedicated native-capable 3D runtime. Both clients must share the same world identity, accounts, permissions, social graph, inventory/economy APIs, and server-authoritative gameplay state.

An EXE package alone is not the target. The target is a maintainable desktop runtime with its own rendering/input/lifecycle capabilities that connects to the same Grid World services.

## Repository facts observed on 2026-10-10

- package.json identifies the project as Vite + TypeScript with Three.js as a runtime dependency. The build script is grid-code-analyzer.mjs, then tsc, then vite build; there is no test script in the inspected package manifest.
- play.html mounts src/main.ts into a browser DOM element.
- src/main.ts creates a THREE.WebGLRenderer, appends renderer.domElement to #app, installs DOM pointer/wheel/pointer-lock handlers on that canvas, and constructs browser camera/input behavior directly.
- src/engine/GridEngine.ts already defines a GridEngine, subsystem lifecycle, simulation frame, and GridEngineRenderer interface. src/engine/ThreeGridRenderer.ts implements that interface.
- The current renderer abstraction is only a partial portability boundary: GridEngine itself imports Three.js and exposes THREE.Scene and THREE.Camera; GridEngineRenderer.render also accepts those types. Many world/interaction systems use Three.js scene objects directly. A non-Three runtime cannot be substituted by implementing the current renderer interface alone.
- src/main.ts owns a large amount of browser bootstrap, rendering setup, camera input, and world-system orchestration. These are migration seams to separate incrementally, not reasons to rewrite the whole project.
- Existing architecture and shared service contracts should be preserved; this work must not create a second identity, inventory, social, economy, teleport, or authority stack.

## Decisions and non-goals

1. Keep the browser client running while the desktop path is developed.
2. Do not choose Godot, Unreal, or another engine until a small proof of concept is compared against the existing Three.js implementation.
3. Do not start by porting every world system. First establish clean platform boundaries and a representative vertical slice.
4. Do not duplicate trusted gameplay state in the desktop client. Clients are modifiable; server-side validation remains mandatory for movement, teleportation, combat, mining, currency, inventory, ownership, and permissions.
5. Do not promise a delivery date, performance improvement, platform support, or budget until validated.
6. Preserve Grid World's original art direction: different worlds can have different visual identities; a desktop client must not force all regions into a single neon/cyberpunk style.

## Phased plan

### Phase A — Audit and portability boundaries
- Map the current boot sequence, render loop, input/camera controls, world construction, asset loading, UI, persistence, networking, and server-authoritative actions.
- Identify which modules are platform-neutral data/simulation and which depend on DOM, WebGL, Three.js, browser storage, or browser-only APIs.
- Record asset formats and loading assumptions, including GLB/GLTF, textures, audio, and path conventions.
- Establish baseline analyzer/type/build results and note the lack of a dedicated test script.
- Deliverable: an evidence-based portability map and migration risks.

### Phase B — Extract a platform adapter boundary
- Keep existing Three.js world behavior intact while separating platform lifecycle, input events, viewport/canvas hosting, asset access, and renderer ownership from world/service logic where feasible.
- Avoid a false abstraction: Three.js Scene, Camera, and object types should remain explicitly part of the current Three-backed world layer until a real alternate runtime proves the need for a deeper engine-neutral scene representation.
- Add contract tests for platform-independent state and adapters where the existing test setup allows.
- Deliverable: a cleaner browser runtime that still builds and runs as before.

### Phase C — Compare runtime candidates
Build the same small vertical slice in the existing client and one candidate runtime:
- load one representative Grid World scene and assets;
- show one avatar and basic third-person movement/camera;
- connect to existing authentication and read-only world/session data;
- exercise a safe, non-economic interaction;
- measure startup, memory, frame behavior, asset conversion effort, tooling, deployment size, accessibility, and maintenance cost on the target Windows machine.
Compare at least the current Three.js client with Godot. Consider Unreal only if requirements and measured results justify its heavier pipeline.
- Deliverable: a decision memo with evidence and a recommended route. No engine selection is pre-approved by this document.

### Phase D — Desktop vertical slice
- Package a Windows desktop client using the selected runtime.
- Implement secure authentication handoff, update/version strategy, logs/crash reporting with privacy safeguards, graphics/input settings, and safe world entry.
- Reuse shared backend APIs and authoritative server state.
- Keep the browser client as a supported fallback.
- Deliverable: a clearly labelled internal prototype, not a production-ready public launcher.

### Phase E — Gradual world/runtime expansion
- Add world streaming, advanced creator tools, higher-fidelity rendering/physics where justified, and other platform targets only after the vertical slice proves the architecture.
- Keep a compatibility/version contract for world definitions, assets, and shared services so worlds do not require separate installations.

## First implementation slice

Before editing runtime code, complete the Phase A portability map. The first code change should be narrow and reversible: extract a browser platform adapter for viewport sizing, pointer/wheel/pointer-lock event wiring, and lifecycle/disposal only where it can be done without changing movement or camera semantics. Do not attempt to make all Three.js world objects engine-neutral in one pass.

## Verification gates

For each change, record separately:
- source review;
- analyzer/type/build results;
- unit/contract tests, if present;
- browser/WebGL interaction results;
- CI status;
- desktop packaging and launch results;
- live backend behavior.

A successful TypeScript build does not prove browser/WebGL behavior, and a desktop package that launches does not prove server authority or multiplayer correctness.

## Initial audit conclusion

Grid World has a useful early GridEngine subsystem lifecycle and renderer interface, but the current client is not yet runtime-agnostic. The lowest-risk path is to preserve Three.js as the first renderer, map the actual coupling, extract browser platform boundaries, and then compare a native runtime through a limited vertical slice. No migration, engine choice, or desktop executable is claimed as complete.
