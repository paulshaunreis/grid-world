export interface RemotePlayerState {
  id: string;
  displayName: string;
  x: number;
  y: number;
  z: number;
  yaw: number;
  updatedAt: number;
}

export interface PresenceCallbacks {
  onJoin?: (player: RemotePlayerState) => void;
  onUpdate?: (player: RemotePlayerState) => void;
  onLeave?: (playerId: string) => void;
}
