import * as THREE from 'three';

export type GridEngineMode = 'editor' | 'client' | 'server';

export interface GridEngineFrame {
  deltaSeconds: number;
  elapsedSeconds: number;
  frame: number;
}

export interface GridEngineSubsystem {
  readonly id: string;
  start?(engine: GridEngine): void | Promise<void>;
  update?(frame: GridEngineFrame): void;
  stop?(): void | Promise<void>;
}

export interface GridEngineRenderer {
  readonly id: string;
  render(scene: THREE.Scene, camera: THREE.Camera, frame: GridEngineFrame): void;
  resize(width: number, height: number, pixelRatio: number): void;
  dispose(): void;
}

/**
 * Grid Engine is the platform-owned runtime boundary.
 *
 * Three.js is currently one rendering implementation behind this boundary.
 * World simulation, persistence, Grid Code, security, networking and tools
 * must not become coupled to a particular renderer.
 */
export class GridEngine {
  readonly mode: GridEngineMode;
  readonly scene: THREE.Scene;
  private renderer: GridEngineRenderer | null = null;
  private readonly subsystems = new Map<string, GridEngineSubsystem>();
  private started = false;
  private frameNumber = 0;
  private elapsedSeconds = 0;

  constructor(mode: GridEngineMode = 'client', scene = new THREE.Scene()) {
    this.mode = mode;
    this.scene = scene;
  }

  setRenderer(renderer: GridEngineRenderer) {
    if (this.renderer) this.renderer.dispose();
    this.renderer = renderer;
  }

  register(subsystem: GridEngineSubsystem) {
    if (this.subsystems.has(subsystem.id)) {
      throw new Error('Grid Engine subsystem already registered: ' + subsystem.id);
    }
    this.subsystems.set(subsystem.id, subsystem);
    if (this.started) void subsystem.start?.(this);
  }

  getSubsystem<T extends GridEngineSubsystem = GridEngineSubsystem>(id: string): T | undefined {
    return this.subsystems.get(id) as T | undefined;
  }

  async start() {
    if (this.started) return;
    this.started = true;
    for (const subsystem of this.subsystems.values()) await subsystem.start?.(this);
  }

  update(deltaSeconds: number) {
    const safeDelta = Math.min(Math.max(deltaSeconds, 0), 0.1);
    this.elapsedSeconds += safeDelta;
    const frame: GridEngineFrame = {
      deltaSeconds: safeDelta,
      elapsedSeconds: this.elapsedSeconds,
      frame: ++this.frameNumber,
    };
    for (const subsystem of this.subsystems.values()) subsystem.update?.(frame);
    return frame;
  }

  render(camera: THREE.Camera, frame: GridEngineFrame) {
    this.renderer?.render(this.scene, camera, frame);
  }

  resize(width: number, height: number, pixelRatio = 1) {
    this.renderer?.resize(width, height, pixelRatio);
  }

  async stop() {
    if (!this.started) return;
    for (const subsystem of [...this.subsystems.values()].reverse()) await subsystem.stop?.();
    this.started = false;
  }

  dispose() {
    this.renderer?.dispose();
    for (const subsystem of [...this.subsystems.values()].reverse()) subsystem.stop?.();
    this.subsystems.clear();
    this.renderer = null;
  }
}
