# Grid Omni Voice

## Goal

Let a traveler:

- type in Grid Chat;
- speak to another player through voice chat;
- speak to an NPC and receive an audible response;
- speak to a team member and receive an audible response;
- speak to an object and trigger a logical, inspectable cause/effect reaction.

## Layers

### 1. Voice identity

Every NPC and team member has a stable GridVoiceProfile containing:

- profile ID
- voice style
- rate
- pitch
- preferred local voice names

The browser's SpeechSynthesis API is the immediate zero-cost fallback. The profile stays stable even if the installed system voice changes.

### 2. Voice input

Grid World uses the Web Speech API when available. SpeechRecognition is not baseline across all browsers, so the microphone UI must always have a text-chat fallback. Some browser implementations may send recognition audio to a remote recognition service, so the product must disclose that behavior before using it for sensitive contexts.

### 3. Multiplayer voice

The target production architecture is:

microphone → WebRTC media track → nearby peers → spatial audio → mute/block/report controls

Supabase Realtime can serve as the signaling/control plane; it should not carry the continuous audio media stream.

For larger groups, use a dedicated SFU rather than a full peer-to-peer mesh. Steam's own voice guidance recommends push-to-talk as a strong default and cautions against always-on voice for larger groups.

### 4. Spatial voice

Web Audio's PannerNode and AudioListener provide a browser-native foundation for positional audio. Grid World should map the listener to the camera/player and each voice source to the speaker's Grid position. HRTF should be the preferred production mode where performance permits.

### 5. Cause and effect

Voice should not bypass the same permissions and simulation rules as UI interaction.

Example:

“Open the beacon.”
→ parse intent
→ inspect target
→ verify permission
→ run Grid Code / object action
→ mutate state
→ record event
→ NPC/object response
→ audible confirmation

No arbitrary JavaScript should be generated from voice commands.

## Safety

- push-to-talk and mute are first-class;
- users can block/mute another speaker;
- recording is off by default;
- voice commands are scoped to the current target/context;
- high-risk actions require explicit confirmation;
- voice transcripts are not persisted by default;
- moderation and reporting paths cover voice abuse;
- service degradation falls back to text rather than pretending audio succeeded.

## Current implementation

src/audio/GridVoiceSystem.ts provides:

- 30 stable profiles for Grid and the current NPC/team roster;
- browser TTS;
- browser speech recognition when available;
- deterministic voice rate/pitch differentiation;
- graceful text fallback.

The multiplayer WebRTC/SFU layer is intentionally a separate boundary so the world does not become dependent on a single voice transport.
