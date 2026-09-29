export type FeatureFlag =
  | 'ui_mods'
  | 'ui_layout_persistence'
  | 'grid_script'
  | 'region_streaming'
  | 'multiplayer_presence'
  | 'cloud_persistence';

const defaults: Record<FeatureFlag, boolean> = {
  ui_mods: true,
  ui_layout_persistence: true,
  grid_script: true,
  region_streaming: true,
  multiplayer_presence: true,
  cloud_persistence: true,
};

const storageKey = 'grid-world:feature-flags:v1';

export class FeatureFlags {
  private readonly values: Record<FeatureFlag, boolean>;

  constructor(overrides?: Partial<Record<FeatureFlag, boolean>>) {
    let saved: Partial<Record<FeatureFlag, boolean>> = {};
    try {
      saved = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as typeof saved;
    } catch {
      // Ignore corrupt client configuration.
    }
    this.values = { ...defaults, ...saved, ...overrides };
  }

  enabled(flag: FeatureFlag) {
    return this.values[flag];
  }

  set(flag: FeatureFlag, enabled: boolean) {
    this.values[flag] = enabled;
    localStorage.setItem(storageKey, JSON.stringify(this.values));
  }

  snapshot() {
    return { ...this.values };
  }
}
