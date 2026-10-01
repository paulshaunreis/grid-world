import * as THREE from 'three';

export type GridOrganizationKind='GUILD'|'GROUP'|'TEAM';
export type GridOrganizationRole='OWNER'|'ADMIN'|'LEADER'|'OFFICER'|'MEMBER';
export interface GridOrganizationMember { userId:string; role:GridOrganizationRole; joinedAt:number; }
export interface GridOrganization { id:string; name:string; kind:GridOrganizationKind; description:string; worldIds:string[]; members:GridOrganizationMember[]; tags:string[]; createdAt:number; }

export class GridGuildSystem {
  readonly root=new THREE.Group();
  private organizations=new Map<string,GridOrganization>();
  constructor(){this.root.name='grid-guild-group-team-network';}
  create(id:string,name:string,kind:GridOrganizationKind,description='',tags:string[]=[]){const org={id,name,kind,description,worldIds:[],members:[],tags,createdAt:Date.now()};this.organizations.set(id,org);return org;}
  addMember(orgId:string,userId:string,role:GridOrganizationRole='MEMBER'){const o=this.organizations.get(orgId);if(!o)return false;if(!o.members.some(m=>m.userId===userId))o.members.push({userId,role,joinedAt:Date.now()});return true;}
  setWorlds(orgId:string,worldIds:string[]){const o=this.organizations.get(orgId);if(!o)return false;o.worldIds=[...new Set(worldIds)];return true;}
  organizationsForUser(userId:string){return [...this.organizations.values()].filter(o=>o.members.some(m=>m.userId===userId));}
  get(id:string){return this.organizations.get(id);}
  snapshot(){return [...this.organizations.values()].map(o=>({...o,members:o.members.map(m=>({...m})),worldIds:[...o.worldIds]}));}
}
