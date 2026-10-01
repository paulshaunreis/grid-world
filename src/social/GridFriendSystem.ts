import { GridFriendship, GridSocialAuthority } from './GridSocialAuthority';

export type GridFriendPresence='online'|'away'|'busy'|'offline';

export interface GridFriend {
  userId:string;
  displayName:string;
  presence?:GridFriendPresence;
  lastSeenAt?:number;
  worldId?:string;
  regionId?:string;
  metadata?:Record<string,unknown>;
}

export class GridFriendSystem {
  private friends=new Map<string,GridFriend>();
  private requests=new Map<string,GridFriendship>();

  async refresh(authority:GridSocialAuthority){
    const relationships=await authority.listFriendRelationships();
    this.requests.clear();
    for(const row of relationships){
      if(row.status==='pending'){
        const otherUserId=row.userId===row.requestedBy?row.friendUserId:row.userId;
        this.requests.set(otherUserId,row);
      }
    }
    return relationships;
  }

  setFriend(friend:GridFriend){this.friends.set(friend.userId,friend);return friend;}
  removeFriend(userId:string){return this.friends.delete(userId);}
  get(userId:string){return this.friends.get(userId);}
  list(){return [...this.friends.values()].sort((a,b)=>a.displayName.localeCompare(b.displayName));}
  online(){return this.list().filter(f=>f.presence&&f.presence!=='offline');}
  request(userId:string){return this.requests.get(userId);}
  requestsList(){return [...this.requests.values()];}
  incomingRequests(){return this.requestsList().filter(row=>row.requestedBy!==row.userId);}
  outgoingRequests(){return this.requestsList().filter(row=>row.requestedBy===row.userId);}
  snapshot(){return this.list().map(f=>({...f,metadata:f.metadata?{...f.metadata}:undefined}));}
}
