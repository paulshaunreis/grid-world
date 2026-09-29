import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

export interface GridVoicePeerCallbacks {
  onPeerCount?: (count: number) => void;
  onState?: (state: 'idle' | 'connecting' | 'connected' | 'muted' | 'error') => void;
  onError?: (error: unknown) => void;
}

interface VoiceSignal {
  from: string;
  to: string;
  kind: 'offer' | 'answer' | 'candidate';
  description?: RTCSessionDescriptionInit;
  candidate?: RTCIceCandidateInit;
}

interface PeerAudio {
  connection: RTCPeerConnection;
  audio: HTMLAudioElement;
  source?: MediaStreamAudioSourceNode;
  panner?: PannerNode;
}

export class GridVoiceRoom {
  private channel?: RealtimeChannel;
  private localStream?: MediaStream;
  private audioContext?: AudioContext;
  private readonly peers = new Map<string, PeerAudio>();
  private muted = false;
  private started = false;

  constructor(
    private readonly client: SupabaseClient,
    private readonly identityId: string,
    private readonly regionId = 'first-light',
    private readonly iceServers: RTCIceServer[] = [],
    private readonly callbacks: GridVoicePeerCallbacks = {},
  ) {}

  async start() {
    if (this.started) return;
    this.started = true;
    this.callbacks.onState?.('connecting');

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.audioContext = new AudioContext();

      this.channel = this.client.channel('voice:' + this.regionId, {
        config: {
          private: true,
          presence: { key: this.identityId },
          broadcast: { self: false, ack: true },
        },
      });

      this.channel.on('presence', { event: 'sync' }, () => {
        const state = this.channel?.presenceState<Record<string, unknown>>() ?? {};
        const peerIds = Object.keys(state).filter(id => id !== this.identityId);
        for (const peerId of peerIds) {
          if (!this.peers.has(peerId) && this.identityId < peerId) {
            void this.createOffer(peerId);
          }
        }
        this.callbacks.onPeerCount?.(this.peers.size);
      });

      this.channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
        for (const entry of leftPresences as Array<{ id?: string }>) {
          const peerId = entry.id;
          if (peerId) this.removePeer(peerId);
        }
        this.callbacks.onPeerCount?.(this.peers.size);
      });

      this.channel.on('broadcast', { event: 'voice-signal' }, payload => {
        const signal = payload?.payload as VoiceSignal | undefined;
        if (!signal || signal.to !== this.identityId || signal.from === this.identityId) return;
        void this.handleSignal(signal);
      });

      await new Promise<void>((resolve, reject) => {
        this.channel!.subscribe(async status => {
          if (status === 'SUBSCRIBED') {
            await this.channel!.track({ id: this.identityId, voice: true, updatedAt: Date.now() });
            resolve();
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            reject(new Error('Grid voice channel ' + status));
          }
        });
      });

      this.callbacks.onState?.('connected');
    } catch (error) {
      this.started = false;
      this.callbacks.onState?.('error');
      this.callbacks.onError?.(error);
      await this.stop();
      throw error;
    }
  }

  async toggleMute() {
    this.muted = !this.muted;
    for (const track of this.localStream?.getAudioTracks() ?? []) track.enabled = !this.muted;
    this.callbacks.onState?.(this.muted ? 'muted' : 'connected');
    return this.muted;
  }

  setPeerPosition(peerId: string, x: number, y: number, z: number) {
    const peer = this.peers.get(peerId);
    if (!peer?.panner) return;
    peer.panner.positionX.value = x;
    peer.panner.positionY.value = y;
    peer.panner.positionZ.value = z;
  }

  async stop() {
    this.localStream?.getTracks().forEach(track => track.stop());
    this.localStream = undefined;
    for (const peerId of [...this.peers.keys()]) this.removePeer(peerId);
    if (this.channel) {
      await this.client.removeChannel(this.channel);
      this.channel = undefined;
    }
    await this.audioContext?.close().catch(() => undefined);
    this.audioContext = undefined;
    this.started = false;
    this.callbacks.onPeerCount?.(0);
    this.callbacks.onState?.('idle');
  }

  private async createOffer(peerId: string) {
    const peer = this.ensurePeer(peerId);
    const offer = await peer.connection.createOffer();
    await peer.connection.setLocalDescription(offer);
    await this.sendSignal({ from: this.identityId, to: peerId, kind: 'offer', description: offer });
  }

  private async handleSignal(signal: VoiceSignal) {
    const peer = this.ensurePeer(signal.from);

    if (signal.kind === 'offer' && signal.description) {
      await peer.connection.setRemoteDescription(signal.description);
      const answer = await peer.connection.createAnswer();
      await peer.connection.setLocalDescription(answer);
      await this.sendSignal({ from: this.identityId, to: signal.from, kind: 'answer', description: answer });
    } else if (signal.kind === 'answer' && signal.description) {
      await peer.connection.setRemoteDescription(signal.description);
    } else if (signal.kind === 'candidate' && signal.candidate) {
      await peer.connection.addIceCandidate(signal.candidate);
    }
  }

  private ensurePeer(peerId: string) {
    const existing = this.peers.get(peerId);
    if (existing) return existing;

    const connection = new RTCPeerConnection({ iceServers: this.iceServers });
    for (const track of this.localStream?.getTracks() ?? []) connection.addTrack(track, this.localStream!);

    const audio = document.createElement('audio');
    audio.autoplay = true;
    audio.setAttribute('playsinline', '');
    audio.dataset.gridVoicePeer = peerId;
    audio.style.display = 'none';
    document.body.appendChild(audio);

    const peer: PeerAudio = { connection, audio };

    connection.onicecandidate = event => {
      if (!event.candidate) return;
      void this.sendSignal({
        from: this.identityId,
        to: peerId,
        kind: 'candidate',
        candidate: event.candidate.toJSON(),
      });
    };

    connection.ontrack = event => {
      const stream = event.streams[0];
      if (!stream) return;
      audio.srcObject = stream;

      if (this.audioContext) {
        const source = this.audioContext.createMediaStreamSource(stream);
        const panner = new PannerNode(this.audioContext, {
          panningModel: 'HRTF',
          distanceModel: 'inverse',
          refDistance: 3,
          maxDistance: 45,
          rolloffFactor: 1.2,
        });
        source.connect(panner).connect(this.audioContext.destination);
        peer.source = source;
        peer.panner = panner;
        audio.muted = true;
      }
    };

    connection.onconnectionstatechange = () => {
      if (connection.connectionState === 'failed' || connection.connectionState === 'closed') {
        this.removePeer(peerId);
      }
    };

    this.peers.set(peerId, peer);
    this.callbacks.onPeerCount?.(this.peers.size);
    return peer;
  }

  private async sendSignal(signal: VoiceSignal) {
    if (!this.channel) return;
    await this.channel.send({
      type: 'broadcast',
      event: 'voice-signal',
      payload: signal,
    });
  }

  private removePeer(peerId: string) {
    const peer = this.peers.get(peerId);
    if (!peer) return;
    peer.connection.close();
    peer.source?.disconnect();
    peer.panner?.disconnect();
    peer.audio.remove();
    this.peers.delete(peerId);
  }
}
