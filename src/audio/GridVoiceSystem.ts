export type GridVoiceStyle = 'warm' | 'clear' | 'deep' | 'crisp' | 'delicate' | 'fancy';

export interface GridVoiceProfile {
  id: string;
  style: GridVoiceStyle;
  rate: number;
  pitch: number;
  voiceHints: readonly string[];
}

export const GRID_VOICE_PROFILES: Record<string, GridVoiceProfile> = {
  grid: { id: 'grid', style: 'clear', rate: 1.02, pitch: 1.0, voiceHints: ['Google US English', 'Samantha', 'Microsoft Zira'] },
  'npc.market-broker': { id: 'npc.market-broker', style: 'warm', rate: 1.02, pitch: 1.08, voiceHints: ['Samantha', 'Ava', 'Google US English'] },
  'npc.gallery-curator': { id: 'npc.gallery-curator', style: 'fancy', rate: .94, pitch: .92, voiceHints: ['Daniel', 'Alex', 'Google UK English Male'] },
  'npc.city-guide': { id: 'npc.city-guide', style: 'clear', rate: 1.08, pitch: 1.12, voiceHints: ['Karen', 'Samantha', 'Google US English'] },
  'npc.builder': { id: 'npc.builder', style: 'deep', rate: .96, pitch: .78, voiceHints: ['Daniel', 'Alex', 'Google UK English Male'] },
  'npc.archivist': { id: 'npc.archivist', style: 'delicate', rate: .9, pitch: .88, voiceHints: ['Moira', 'Karen', 'Samantha'] },
  'npc.courier': { id: 'npc.courier', style: 'crisp', rate: 1.12, pitch: 1.04, voiceHints: ['Google US English', 'Alex', 'Samantha'] },
  aurora: { id: 'aurora', style: 'warm', rate: .98, pitch: 1.08, voiceHints: ['Samantha', 'Karen', 'Google US English'] },
  link: { id: 'link', style: 'clear', rate: 1.02, pitch: .94, voiceHints: ['Alex', 'Daniel', 'Google UK English Male'] },
  rey: { id: 'rey', style: 'warm', rate: 1.1, pitch: 1.16, voiceHints: ['Samantha', 'Karen', 'Google US English'] },
  elder: { id: 'elder', style: 'deep', rate: .86, pitch: .72, voiceHints: ['Daniel', 'Alex', 'Google UK English Male'] },
  veyr: { id: 'veyr', style: 'crisp', rate: .92, pitch: .9, voiceHints: ['Alex', 'Daniel', 'Google UK English Male'] },
  nyxen: { id: 'nyxen', style: 'deep', rate: 1.0, pitch: .68, voiceHints: ['Daniel', 'Alex', 'Google UK English Male'] },
  orin: { id: 'orin', style: 'clear', rate: .96, pitch: 1.02, voiceHints: ['Google US English', 'Samantha', 'Alex'] },
  seraith: { id: 'seraith', style: 'fancy', rate: .9, pitch: 1.0, voiceHints: ['Moira', 'Karen', 'Daniel'] },
  vael: { id: 'vael', style: 'crisp', rate: 1.02, pitch: .82, voiceHints: ['Alex', 'Daniel', 'Google UK English Male'] },
  kairox: { id: 'kairox', style: 'clear', rate: 1.16, pitch: .96, voiceHints: ['Google US English', 'Alex', 'Samantha'] },
  morrow: { id: 'morrow', style: 'deep', rate: .88, pitch: .8, voiceHints: ['Daniel', 'Alex', 'Google UK English Male'] },
  cipher: { id: 'cipher', style: 'delicate', rate: .9, pitch: .84, voiceHints: ['Moira', 'Karen', 'Samantha'] },
  solenne: { id: 'solenne', style: 'warm', rate: 1.0, pitch: 1.0, voiceHints: ['Samantha', 'Karen', 'Google US English'] },
  rook: { id: 'rook', style: 'deep', rate: .98, pitch: .76, voiceHints: ['Daniel', 'Alex', 'Google UK English Male'] },
  echo: { id: 'echo', style: 'crisp', rate: 1.18, pitch: 1.06, voiceHints: ['Google US English', 'Samantha', 'Alex'] },
  umbra: { id: 'umbra', style: 'delicate', rate: .84, pitch: .7, voiceHints: ['Moira', 'Daniel', 'Alex'] },
  civitas: { id: 'civitas', style: 'clear', rate: .96, pitch: .92, voiceHints: ['Alex', 'Karen', 'Google US English'] },
  axiom: { id: 'axiom', style: 'warm', rate: .94, pitch: 1.04, voiceHints: ['Samantha', 'Alex', 'Google US English'] },
  mosaic: { id: 'mosaic', style: 'fancy', rate: .98, pitch: 1.02, voiceHints: ['Karen', 'Daniel', 'Samantha'] },
  sentinel: { id: 'sentinel', style: 'deep', rate: .9, pitch: .74, voiceHints: ['Daniel', 'Alex', 'Google UK English Male'] },
  praxis: { id: 'praxis', style: 'crisp', rate: 1.0, pitch: .9, voiceHints: ['Alex', 'Google US English', 'Daniel'] },
  atlas: { id: 'atlas', style: 'deep', rate: .96, pitch: .78, voiceHints: ['Daniel', 'Alex', 'Google UK English Male'] },
  tessera: { id: 'tessera', style: 'fancy', rate: .96, pitch: 1.02, voiceHints: ['Karen', 'Samantha', 'Daniel'] },
  waypoint: { id: 'waypoint', style: 'warm', rate: 1.02, pitch: 1.08, voiceHints: ['Samantha', 'Karen', 'Google US English'] },
};

export interface GridSpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type RecognitionConstructor = new () => GridSpeechRecognition;

function recognitionConstructor(): RecognitionConstructor | null {
  const candidate = window as unknown as {
    SpeechRecognition?: RecognitionConstructor;
    webkitSpeechRecognition?: RecognitionConstructor;
  };
  return candidate.SpeechRecognition ?? candidate.webkitSpeechRecognition ?? null;
}

export class GridVoiceSystem {
  private readonly voices: SpeechSynthesisVoice[] = [];
  private recognition: GridSpeechRecognition | null = null;
  private listening = false;
  // Avatar speech is intentionally muted for now; text/chat interactions remain active.\n  private outputEnabled = false;\n
  constructor() {
    const refresh = () => {
      this.voices.length = 0;
      this.voices.push(...speechSynthesis.getVoices());
    };
    refresh();
    speechSynthesis.addEventListener?.('voiceschanged', refresh);
  }

  isSpeechOutputAvailable() {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  isSpeechInputAvailable() {
    return recognitionConstructor() !== null;
  }

  speak(profileId: string, text: string) {
    if (!this.isSpeechOutputAvailable() || !text.trim()) return false;
    const profile = GRID_VOICE_PROFILES[profileId] ?? GRID_VOICE_PROFILES.grid;
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 900));
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = 1;
    const hint = profile.voiceHints.find(candidate =>
      this.voices.some(voice => voice.name.toLowerCase().includes(candidate.toLowerCase())),
    );
    if (hint) {
      utterance.voice = this.voices.find(voice => voice.name.toLowerCase().includes(hint.toLowerCase())) ?? null;
    }
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
    return true;
  }

  async listenOnce(): Promise<string | null> {
    const Constructor = recognitionConstructor();
    if (!Constructor) return null;

    return new Promise(resolve => {
      const recognition = new Constructor();
      this.recognition = recognition;
      this.listening = true;
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      let settled = false;
      const finish = (value: string | null) => {
        if (settled) return;
        settled = true;
        this.listening = false;
        this.recognition = null;
        resolve(value?.trim() || null);
      };
      recognition.onresult = event => {
        const transcript = event.results[0]?.[0]?.transcript ?? '';
        finish(transcript);
      };
      recognition.onerror = () => finish(null);
      recognition.onend = () => finish(null);
      try {
        recognition.start();
      } catch {
        finish(null);
      }
    });
  }

  stopListening() {
    this.recognition?.stop();
    this.recognition = null;
    this.listening = false;
  }

  get isListening() {
    return this.listening;
  }
}
