export interface WorldClockState {
  startedAt: string;
  elapsedSeconds: number;
}

export class WorldClock {
  private elapsedSeconds = 0;
  private lastRealTimeMs = Date.now();

  constructor(private readonly dayLengthSeconds = 1200) {}

  update(realTimeMs = Date.now()): number {
    const deltaSeconds = Math.max(0, (realTimeMs - this.lastRealTimeMs) / 1000);
    this.lastRealTimeMs = realTimeMs;
    this.elapsedSeconds += deltaSeconds;
    return deltaSeconds;
  }

  get totalSeconds(): number {
    return this.elapsedSeconds;
  }

  get dayFraction(): number {
    return (this.elapsedSeconds % this.dayLengthSeconds) / this.dayLengthSeconds;
  }

  get state(): WorldClockState {
    return {
      startedAt: new Date(Date.now() - this.elapsedSeconds * 1000).toISOString(),
      elapsedSeconds: this.elapsedSeconds,
    };
  }

  restore(state: WorldClockState) {
    this.elapsedSeconds = Math.max(0, state.elapsedSeconds);
    this.lastRealTimeMs = Date.now();
  }
}
