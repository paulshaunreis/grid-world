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
    const rows=await authority.listFriends();
    this.requests.clear();
    for(const row of rows)this.requests.set(row.friendUserId===row.requestedBy?row.userId:row.friendUserId,row);
    return rows;
  }

  setFriend(friend:GridFriend){this.friends.set(friend.userId,friend);return friend;}
  removeFriend(userId:string){return this.friends.delete(userId);}
  get(userId:string){return this.friends.get(userId);}
  list(){return [...this.friends.values()].sort((a,b)=>a.displayName.localeCompare(b.displayName));}
  online(){return this.list().filter(f=>f.presence&&f.presence!=='offline');}
  request(userId:string){return this.requests.get(userId);}
  snapshot(){return this.list().map(f=>({...f,metadata:f.metadata?{...f.metadata}:undefined}));}
}
