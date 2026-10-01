import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';

export interface GridFriendPresenceState {
  userId:string;
  presence:'online'|'away'|'busy'|'offline';
  worldId?:string;
  regionId?:string;
  updatedAt:number;
}

export class GridFriendPresence {
  private channels=new Map<string,RealtimeChannel>();

  constructor(private readonly client:SupabaseClient){}

  private topic(userId:string){
    return 'friend:'+userId+':presence';
  }

  async publish(userId:string,state:Omit<GridFriendPresenceState,'userId'>){
    const channel=this.channels.get(userId)??this.client.channel(this.topic(userId),{config:{private:true,presence:{key:userId}}});
    this.channels.set(userId,channel);
    return new Promise<string>((resolve,reject)=>{
      channel.subscribe(async status=>{
        if(status!=='SUBSCRIBED'){
          if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')reject(new Error('Friend presence channel '+status));
          return;
        }
        try{
          const result=await channel.track({...state,userId});
          if(result==='ok')resolve(result);
          else reject(new Error('Friend presence track failed: '+result));
        }catch(error){reject(error);}
      });
    });
  }

  async watch(friendUserId:string,onSync:(state:GridFriendPresenceState)=>void){
    const channel=this.channels.get(friendUserId)??this.client.channel(this.topic(friendUserId),{config:{private:true,presence:{key:friendUserId}}});
    this.channels.set(friendUserId,channel);
    channel.on('presence',{event:'sync'},()=>{
      const state=channel.presenceState<GridFriendPresenceState>();
      for(const entries of Object.values(state)){
        for(const entry of entries)onSync(entry);
      }
    });
    return new Promise<void>((resolve,reject)=>{
      channel.subscribe(status=>{
        if(status==='SUBSCRIBED')resolve();
        else if(status==='CHANNEL_ERROR'||status==='TIMED_OUT')reject(new Error('Friend presence channel '+status));
      });
    });
  }

  async unwatch(friendUserId:string){
    const channel=this.channels.get(friendUserId);
    if(!channel)return;
    await this.client.removeChannel(channel);
    this.channels.delete(friendUserId);
  }

  async dispose(){
    await Promise.all([...this.channels.keys()].map(id=>this.unwatch(id)));
  }
}
