import type { SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import type { PlayerIdentity, AvatarStyle } from '../core/PlayerIdentity';
import type { PlayerTransform } from '../core/PlayerController';
import type { PresenceCallbacks, RemotePlayerState } from './Presence';

interface PresencePayload {
 id:string; displayName:string; avatarStyle:AvatarStyle; x:number;y:number;z:number;yaw:number;updatedAt:number; regionRole?:string; activeObjectId?:string;
}
export class SupabasePresence {
 private channel?:RealtimeChannel; private readonly remote=new Map<string,RemotePlayerState>();
 constructor(private readonly client:SupabaseClient,private identity:PlayerIdentity,private readonly callbacks:PresenceCallbacks,private readonly regionId='first-light'){}
 async setIdentity(identity:PlayerIdentity,initialTransform?:PlayerTransform){this.identity=identity;if(this.channel){await this.disconnect();if(initialTransform)await this.connect(initialTransform);}}
 async connect(initialTransform:PlayerTransform){
  this.callbacks.onStatus?.('CONNECTING');
  this.channel=this.client.channel(`region:${this.regionId}`,{config:{presence:{key:this.identity.id},broadcast:{self:false,ack:true}}});
  const emit=()=>this.callbacks.onSnapshot?.([...this.remote.values()]);
  this.channel.on('presence',{event:'sync'},()=>{const state=this.channel!.presenceState<PresencePayload>();const seen=new Set<string>();for(const [key,entries] of Object.entries(state)){const e=entries[0];if(!e||key===this.identity.id)continue;const p:RemotePlayerState={id:key,displayName:e.displayName,avatarStyle:e.avatarStyle??'azure',x:e.x,y:e.y,z:e.z,yaw:e.yaw,updatedAt:e.updatedAt,regionRole:e.regionRole,activeObjectId:e.activeObjectId};seen.add(key);if(this.remote.has(key))this.callbacks.onUpdate?.(p);else this.callbacks.onJoin?.(p);this.remote.set(key,p);}for(const id of [...this.remote.keys()])if(!seen.has(id)){this.remote.delete(id);this.callbacks.onLeave?.(id);}emit();});
  this.channel.on('presence',{event:'join'},({newPresences})=>{for(const e of newPresences as unknown as PresencePayload[]){if(e.id===this.identity.id)continue;const p:RemotePlayerState={...e,avatarStyle:e.avatarStyle??'azure'};this.remote.set(p.id,p);this.callbacks.onJoin?.(p);}emit();});
  this.channel.on('presence',{event:'leave'},({leftPresences})=>{for(const e of leftPresences as unknown as PresencePayload[])if(this.remote.delete(e.id))this.callbacks.onLeave?.(e.id);emit();});
  return new Promise<void>((resolve,reject)=>this.channel!.subscribe(async(status,error)=>{if(status==='SUBSCRIBED'){try{await this.update(initialTransform);this.callbacks.onStatus?.('CONNECTED');resolve();}catch(e){this.callbacks.onStatus?.('ERROR',e);reject(e);}}else if(status==='CHANNEL_ERROR'){this.callbacks.onStatus?.('ERROR',error);reject(error??new Error(status));}else if(status==='TIMED_OUT'){this.callbacks.onStatus?.('TIMED_OUT',error);reject(error??new Error(status));}});});
 }
 onChat(callback:(message:{senderId:string;displayName:string;message:string;sentAt:number})=>void){this.channel?.on('broadcast',{event:'chat'},({payload})=>{if(!payload||payload.senderId===this.identity.id)return;if(typeof payload.displayName!=='string'||typeof payload.message!=='string')return;callback({senderId:String(payload.senderId),displayName:payload.displayName.slice(0,20),message:payload.message.slice(0,240),sentAt:typeof payload.sentAt==='number'?payload.sentAt:Date.now()});});}
 async sendChat(message:string){if(!this.channel)return false;const text=message.trim().slice(0,240);if(!text)return false;return await this.channel.send({type:'broadcast',event:'chat',payload:{senderId:this.identity.id,displayName:this.identity.displayName,message:text,sentAt:Date.now()}})==='ok';}
 async update(transform:PlayerTransform,metadata:{regionRole?:string;activeObjectId?:string}={}){if(!this.channel)return;await this.channel.track({id:this.identity.id,displayName:this.identity.displayName,avatarStyle:this.identity.avatarStyle,...transform,...metadata,updatedAt:Date.now()} satisfies PresencePayload);}
 async disconnect(){if(this.channel){await this.client.removeChannel(this.channel);this.channel=undefined;}}
}