import { GridOmniCore } from '../core/GridOmniCore';
import { GridOmniChangeGate } from '../core/GridOmniChangeGate';
import type { GridEngine, GridEngineSubsystem } from './GridEngine';

/**
 * Core organizational bridge for Grid Engine 0.1.
 * The engine does not own Omni services; it knows their stable root contract.
 */
export class GridEngineCore implements GridEngineSubsystem {
  readonly id = 'grid.engine-core';
  readonly omni = new GridOmniCore();
  readonly changeGate = new GridOmniChangeGate();

  start(engine: GridEngine) {
    void engine;
  }

  update() {
    // 0.1 intentionally keeps orchestration lightweight.
    // Service-specific simulation belongs in dedicated subsystems.
  }
}
