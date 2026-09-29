export type GridSoundId =
  | 'ui.focus'
  | 'ui.click'
  | 'ui.confirm'
  | 'ui.error'
  | 'chat.receive'
  | 'world.beacon'
  | 'world.portal'
  | 'world.profile'
  | 'world.collect'
  | 'world.footstep'
  | 'world.ambient';

interface ToneOptions {
  frequency: number;
  duration: number;
  type?: OscillatorType;
  gain?: number;
  endFrequency?: number;
}

export interface GridAudioSourceRecord {
  id: string;
  title: string;
  kind: 'sfx' | 'ambience' | 'music';
  license: 'Grid World Original' | 'CC0' | 'royalty-free project license';
  source?: string;
  notes: string;
}

export const GRID_AUDIO_SOURCES: readonly GridAudioSourceRecord[] = [
  {
    id: 'grid-original-ui',
    title: 'Grid Interface Tone Set',
    kind: 'sfx',
    license: 'Grid World Original',
    notes: 'Procedural Web Audio cues used as the zero-download baseline.',
  },
  {
    id: 'oga-various-sfx',
    title: 'Various Sound Effects',
    kind: 'sfx',
    license: 'CC0',
    source: 'https://opengameart.org/content/various-sound-effects-0',
    notes: 'Includes footsteps, UI, NPC message, teleport, bird, metal and environmental cues.',
  },
  {
    id: 'oga-shop-ambience',
    title: 'The Shop Free SFX',
    kind: 'ambience',
    license: 'CC0',
    source: 'https://opengameart.org/content/the-shop',
    notes: 'Room tones, drones and store ambience; CC0 applies to the files distributed on OpenGameArt.',
  },
  {
    id: 'oga-cc0-sfx',
    title: 'CC0 Sound FX Collection',
    kind: 'sfx',
    license: 'CC0',
    source: 'https://opengameart.org/content/cc0-sound-fx',
    notes: 'Foley, creature and gameplay effects; verify the individual collection before import.',
  },
  {
    id: 'sonniss-gdc-2026',
    title: '#GameAudioGDC 2026',
    kind: 'sfx',
    license: 'royalty-free project license',
    source: 'https://gdc.sonniss.com/',
    notes: 'Large professional SFX collection for games and interactive projects; not suitable for redistribution as a standalone sound library.',
  },
  {
    id: 'kenney-audio',
    title: 'Kenney Audio Assets',
    kind: 'sfx',
    license: 'CC0',
    source: 'https://kenney.nl/assets?q=audio',
    notes: 'CC0 game audio assets; check the individual asset page and included license file when importing.',
  },
];

export class GridAudioSystem {
  private context: AudioContext | null = null;
  private master: GainNode | null = null;
  private enabled = true;
  private lastFootstep = 0;

  private ensureContext() {
    if (typeof window === 'undefined' || !this.enabled) return null;
    if (!this.context) {
      this.context = new AudioContext();
      this.master = this.context.createGain();
      this.master.gain.value = 0.16;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') void this.context.resume();
    return this.context;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (this.master) this.master.gain.value = enabled ? 0.16 : 0;
  }

  play(id: GridSoundId, intensity = 1) {
    const context = this.ensureContext();
    if (!context || !this.master) return;

    switch (id) {
      case 'ui.focus':
        this.tone({ frequency: 520, endFrequency: 660, duration: .06, gain: .045 }, intensity);
        break;
      case 'ui.click':
        this.tone({ frequency: 420, endFrequency: 310, duration: .045, gain: .05 }, intensity);
        break;
      case 'ui.confirm':
        this.tone({ frequency: 520, endFrequency: 780, duration: .12, gain: .06 }, intensity);
        break;
      case 'ui.error':
        this.tone({ frequency: 190, endFrequency: 120, duration: .15, gain: .06 }, intensity);
        break;
      case 'chat.receive':
        this.tone({ frequency: 680, endFrequency: 820, duration: .075, gain: .04 }, intensity);
        break;
      case 'world.beacon':
        this.tone({ frequency: 180, endFrequency: 880, duration: .42, gain: .065, type: 'sine' }, intensity);
        this.tone({ frequency: 440, endFrequency: 110, duration: .52, gain: .028, type: 'triangle' }, intensity);
        break;
      case 'world.portal':
        this.tone({ frequency: 110, endFrequency: 760, duration: .5, gain: .07, type: 'sawtooth' }, intensity);
        break;
      case 'world.profile':
        this.tone({ frequency: 720, endFrequency: 1020, duration: .2, gain: .045, type: 'sine' }, intensity);
        break;
      case 'world.collect':
        this.tone({ frequency: 520, endFrequency: 1040, duration: .18, gain: .05, type: 'triangle' }, intensity);
        break;
      case 'world.footstep':
        if (performance.now() - this.lastFootstep < 180) return;
        this.lastFootstep = performance.now();
        this.noise(.055, .035 * intensity);
        break;
      case 'world.ambient':
        this.tone({ frequency: 92, endFrequency: 98, duration: 1.8, gain: .012, type: 'sine' }, intensity);
        break;
    }
  }

  private tone(options: ToneOptions, intensity: number) {
    const context = this.context;
    const master = this.master;
    if (!context || !master) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = options.type ?? 'sine';
    oscillator.frequency.setValueAtTime(options.frequency, context.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(20, options.endFrequency ?? options.frequency),
      context.currentTime + options.duration,
    );
    gain.gain.setValueAtTime(0.0001, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(Math.max(.0001, (options.gain ?? .04) * intensity), context.currentTime + .012);
    gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + options.duration);
    oscillator.connect(gain).connect(master);
    oscillator.start();
    oscillator.stop(context.currentTime + options.duration + .025);
  }

  private noise(duration: number, gainAmount: number) {
    const context = this.context;
    const master = this.master;
    if (!context || !master) return;
    const buffer = context.createBuffer(1, Math.max(1, Math.floor(context.sampleRate * duration)), context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const source = context.createBufferSource();
    const gain = context.createGain();
    gain.gain.value = gainAmount;
    source.buffer = buffer;
    source.connect(gain).connect(master);
    source.start();
  }
}
