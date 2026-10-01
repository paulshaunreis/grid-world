import type { AvatarStyle } from '../core/PlayerIdentity';

export interface RemotePlayerState {
  id:string; displayName:string; avatarStyle:AvatarStyle;
  x:number; y:number; z:number; yaw:number; updatedAt:number;
  regionRole?:string; activeObjectId?:string;
}
export interface PresenceCallbacks {
  onJoin?: (player:RemotePlayerState)=>void;
  onUpdate?: (player:RemotePlayerState)=>void;
  onLeave?: (playerId:string)=>void;
  onSnapshot?: (players:RemotePlayerState[])=>void;
  onStatus?: (status:'CONNECTING'|'CONNECTED'|'ERROR'|'TIMED_OUT',error?:unknown)=>void;
}