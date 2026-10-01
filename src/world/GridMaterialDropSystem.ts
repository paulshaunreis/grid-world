import * as THREE from 'three';

export interface GridMaterialDrop { id:string; sourceId:string; sourceKind:'CREATURE'|'NPC'; worldId:string; material:string; amount:number; position:THREE.Vector3; createdAt:number; }

const CREATURE_MATS=['Hide','Fang','Bone','Scale','Feather','Fiber','Crystal Shard','Resin','Claw'];
const NPC_MATS=['Cloth','Leather','Metal Scrap','Wood','Glass','Wire','Component','Blueprint Scrap'];

export class GridMaterialDropSystem {
  readonly root=new THREE.Group();
  private drops=new Map<string,GridMaterialDrop>();
  constructor(){this.root.name='grid-material-drops';}
  createDrop(sourceId:string,sourceKind:'CREATURE'|'NPC',worldId:string,position:THREE.Vector3,seed=0){
    const pool=sourceKind==='CREATURE'?CREATURE_MATS:NPC_MATS;
    const material=pool[Math.abs(seed)%pool.length],amount=1+Math.abs(seed)%3;
    const id=sourceId+':drop:'+Date.now()+':'+Math.random().toString(36).slice(2,7);
    const drop={id,sourceId,sourceKind,worldId,material,amount,position:position.clone(),createdAt:Date.now()};
    const mesh=new THREE.Mesh(new THREE.IcosahedronGeometry(.11,0),new THREE.MeshStandardMaterial({color:sourceKind==='CREATURE'?0x7acb9c:0xb8a36b,roughness:.55,metalness:.2}));
    mesh.position.copy(position);mesh.userData={gridObjectKind:'material-drop',dropId:id,material,amount,worldId,interactable:true,interactionName:material+' x'+amount};
    this.root.add(mesh);this.drops.set(id,drop);return drop;
  }
  collect(id:string){const d=this.drops.get(id);if(!d)return null;const o=this.root.getObjectByProperty('userData.dropId',id);if(o)this.root.remove(o);this.drops.delete(id);return d;}
  getSnapshot(){return [...this.drops.values()].map(d=>({...d,position:d.position.clone()}));}
  seedFor(sourceId:string){let h=2166136261;for(const c of sourceId)h=Math.imul(h^c.charCodeAt(0),16777619);return Math.abs(h);}
}
