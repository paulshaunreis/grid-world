import * as THREE from 'three';

export type GridOrganizationKind='GUILD'|'GROUP'|'TEAM';
export type GridOrganizationRole='OWNER'|'ADMIN'|'LEADER'|'OFFICER'|'MEMBER';
export interface GridOrganizationMember { userId:string; role:GridOrganizationRole; joinedAt:number; }
export interface GridOrganizationForum { organizationId:string; title:string; description:string; contentRating:'E'|'CHILD'|'TEEN'|'ADULT'|'GRAPHIC'|'RESTRICTED'; }
export interface GridOrganizationTreasury { organizationId:string; currencyId:string; balance:number; reserved:number; lifetimeInflow:number; lifetimeOutflow:number; }
export interface GridOrganization { id:string; name:string; kind:GridOrganizationKind; description:string; worldIds:string[]; members:GridOrganizationMember[]; tags:string[]; createdAt:number; forum:GridOrganizationForum; treasury:GridOrganizationTreasury; }

export class GridGuildSystem {
  readonly root=new THREE.Group();
  private organizations=new Map<string,GridOrganization>();
  private forums=new Map<string,GridOrganizationForum>();
  private treasuries=new Map<string,GridOrganizationTreasury>();
  constructor(){this.root.name='grid-guild-group-team-network';}
  create(id:string,name:string,kind:GridOrganizationKind,description='',tags:string[]=[]){
    const forum:GridOrganizationForum={organizationId:id,title:name+' Forum',description:'Private discussion space for '+name,contentRating:'E'};
    const treasury:GridOrganizationTreasury={organizationId:id,currencyId:'GRID',balance:0,reserved:0,lifetimeInflow:0,lifetimeOutflow:0};
    const org={id,name,kind,description,worldIds:[],members:[],tags,createdAt:Date.now(),forum,treasury};
    this.organizations.set(id,org);this.forums.set(id,forum);this.treasuries.set(id,treasury);return org;
  }
  addMember(orgId:string,userId:string,role:GridOrganizationRole='MEMBER'){const o=this.organizations.get(orgId);if(!o)return false;if(!o.members.some(m=>m.userId===userId))o.members.push({userId,role,joinedAt:Date.now()});return true;}
  setWorlds(orgId:string,worldIds:string[]){const o=this.organizations.get(orgId);if(!o)return false;o.worldIds=[...new Set(worldIds)];return true;}
  organizationsForUser(userId:string){return [...this.organizations.values()].filter(o=>o.members.some(m=>m.userId===userId));}
  get(id:string){return this.organizations.get(id);}
  forum(id:string){return this.forums.get(id);}
  treasury(id:string){return this.treasuries.get(id);}
  creditTreasury(id:string,amount:number){const t=this.treasuries.get(id);if(!t||amount<=0)return false;t.balance+=amount;t.lifetimeInflow+=amount;return true;}
  debitTreasury(id:string,amount:number){const t=this.treasuries.get(id);if(!t||amount<=0||amount>t.balance-t.reserved)return false;t.balance-=amount;t.lifetimeOutflow+=amount;return true;}
  snapshot(){return [...this.organizations.values()].map(o=>({...o,members:o.members.map(m=>({...m})),worldIds:[...o.worldIds]}));}
}
