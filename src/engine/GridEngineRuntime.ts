import type { GridEngine, GridEngineFrame, GridEngineSubsystem } from './GridEngine';

export interface FixedStepOptions {
  stepSeconds?: number;
  maxStepsPerFrame?: number;
}

/**
 * Deterministic simulation clock used by Grid Engine.
 * Rendering may run at variable FPS; simulation advances in fixed steps.
 */
export class GridSimulationClock implements GridEngineSubsystem {
  readonly id = 'grid.simulation-clock';
  readonly stepSeconds: number;
  readonly maxStepsPerFrame: number;
  private accumulator = 0;
  private simulationTime = 0;

  constructor(options: FixedStepOptions = {}) {
    this.stepSeconds = options.stepSeconds ?? 1 / 30;
    this.maxStepsPerFrame = options.maxStepsPerFrame ?? 5;
  }

  start(engine: GridEngine) {
    void engine;
    this.accumulator = 0;
    this.simulationTime = 0;
  }

  update(frame: GridEngineFrame) {
    this.accumulator += frame.deltaSeconds;
    let steps = 0;
    while (this.accumulator >= this.stepSeconds && steps < this.maxStepsPerFrame) {
      this.accumulator -= this.stepSeconds;
      this.simulationTime += this.stepSeconds;
      steps++;
    }
  }

  get timeSeconds() {
    return this.simulationTime;
  }
}
