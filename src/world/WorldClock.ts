export interface WorldClockState {
  startedAt: string;
  elapsedSeconds: number;
}

export class WorldClock {
  private elapsedSeconds = 0;
  private lastRealTimeMs = Date.now();

  constructor(
    private readonly dayLengthSeconds = 1200,
    private readonly worldEpochMs = Date.UTC(2026, 0, 1),
  ) {}

  update(realTimeMs = Date.now()): number {
    const deltaSeconds = Math.max(0, (realTimeMs - this.lastRealTimeMs) / 1000);
    this.lastRealTimeMs = realTimeMs;
    this.elapsedSeconds += deltaSeconds;
    return deltaSeconds;
  }

  get totalSeconds(): number {
    return this.elapsedSeconds;
  }

  get worldSeconds(): number {
    return Math.max(0, (Date.now() - this.worldEpochMs) / 1000);
  }

  getWorldSeconds(realTimeMs = Date.now()): number {
    return Math.max(0, (realTimeMs - this.worldEpochMs) / 1000);
  }

  get dayFraction(): number {
    return (this.worldSeconds % this.dayLengthSeconds) / this.dayLengthSeconds;
  }

  get state(): WorldClockState {
    return {
      startedAt: new Date(this.worldEpochMs).toISOString(),
      elapsedSeconds: this.elapsedSeconds,
    };
  }

  restore(state: WorldClockState) {
    this.elapsedSeconds = Math.max(0, state.elapsedSeconds);
    this.lastRealTimeMs = Date.now();
  }
}
