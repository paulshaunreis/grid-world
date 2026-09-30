import * as THREE from 'three';

export type TraversalKind = 'STEP'|'ROCK'|'LOG'|'STREAM'|'BRIDGE';

export interface TraversalObstacle {
  id: string;
  kind: TraversalKind;
  position: THREE.Vector3;
  width: number;
  depth: number;
  height: number;
}

export const TRAVERSAL_OBSTACLES: readonly TraversalObstacle[] = [
  { id:'harbor-step-01', kind:'STEP', position:new THREE.Vector3(3,0,8), width:3.2, depth:1.2, height:.55 },
  { id:'harbor-rock-01', kind:'ROCK', position:new THREE.Vector3(-6,0,5), width:2.2, depth:2.0, height:.9 },
  { id:'gardens-log-01', kind:'LOG', position:new THREE.Vector3(21,0,13), width:3.8, depth:1.0, height:.8 },
  { id:'gardens-step-01', kind:'STEP', position:new THREE.Vector3(12,0,22), width:2.8, depth:1.5, height:.65 },
  { id:'citadel-step-01', kind:'STEP', position:new THREE.Vector3(-14,0,-14), width:3.5, depth:1.2, height:.7 },
  { id:'citadel-rock-01', kind:'ROCK', position:new THREE.Vector3(-25,0,-18), width:2.4, depth:2.4, height:1.1 },
  { id:'arts-frame-01', kind:'STEP', position:new THREE.Vector3(16,0,-19), width:2.8, depth:1.1, height:.6 },
  { id:'wilds-log-01', kind:'LOG', position:new THREE.Vector3(-22,0,24), width:4.2, depth:1.0, height:.85 },
  { id:'wilds-rock-01', kind:'ROCK', position:new THREE.Vector3(-29,0,18), width:2.5, depth:2.1, height:1.0 },
  { id:'wilds-stream-01', kind:'STREAM', position:new THREE.Vector3(-9,0,27), width:6.0, depth:1.6, height:.18 },
];

export function traversalHit(from:THREE.Vector3,to:THREE.Vector3,clearance=.45) {
  for (const obstacle of TRAVERSAL_OBSTACLES) {
    const minX=obstacle.position.x-obstacle.width/2-clearance;
    const maxX=obstacle.position.x+obstacle.width/2+clearance;
    const minZ=obstacle.position.z-obstacle.depth/2-clearance;
    const maxZ=obstacle.position.z+obstacle.depth/2+clearance;
    const steps=6;
    for(let i=1;i<=steps;i++) {
      const t=i/steps;
      const x=from.x+(to.x-from.x)*t;
      const z=from.z+(to.z-from.z)*t;
      if(x>=minX&&x<=maxX&&z>=minZ&&z<=maxZ) return obstacle;
    }
  }
  return null;
}

export function steerAround(from:THREE.Vector3,to:THREE.Vector3,obstacle:TraversalObstacle,out= new THREE.Vector3()) {
  const dx=to.x-from.x,dz=to.z-from.z;
  const len=Math.max(.001,Math.hypot(dx,dz));
  const sideX=-dz/len,sideZ=dx/len;
  const side=from.x-obstacle.position.x+from.z-obstacle.position.z>0?1:-1;
  out.copy(to);
  out.x+=sideX*side*(Math.max(obstacle.width,obstacle.depth)+1.2);
  out.z+=sideZ*side*(Math.max(obstacle.width,obstacle.depth)+1.2);
  return out;
}

export class TraversalSystem {
  readonly root=new THREE.Group();
  private readonly meshes:THREE.Object3D[]=[];
  constructor() {
    this.root.name='grid-world-traversal';
    for(const obstacle of TRAVERSAL_OBSTACLES) this.addObstacle(obstacle);
  }
  private addObstacle(o:TraversalObstacle) {
    const g=new THREE.Group();
    let mesh:THREE.Mesh;
    if(o.kind==='ROCK') mesh=new THREE.Mesh(new THREE.DodecahedronGeometry(Math.max(o.width,o.depth)*.42,1),new THREE.MeshStandardMaterial({color:0x59636a,roughness:.9}));
    else if(o.kind==='LOG') mesh=new THREE.Mesh(new THREE.CylinderGeometry(o.depth*.42,o.depth*.5,o.width,8),new THREE.MeshStandardMaterial({color:0x604632,roughness:.88}));
    else if(o.kind==='STREAM') mesh=new THREE.Mesh(new THREE.BoxGeometry(o.width,.08,o.depth),new THREE.MeshStandardMaterial({color:0x4f9db0,transparent:true,opacity:.55,roughness:.25}));
    else mesh=new THREE.Mesh(new THREE.BoxGeometry(o.width,o.height,o.depth),new THREE.MeshStandardMaterial({color:o.kind==='STEP'?0x756b5b:0x53606b,roughness:.8}));
    mesh.position.y=o.kind==='ROCK'?o.height*.42:o.height/2;
    g.add(mesh);
    g.position.copy(o.position);
    g.userData={gridObjectKind:'traversal-obstacle',interactable:true,interactionName:o.id,traversalKind:o.kind,height:o.height};
    this.root.add(g);
    this.meshes.push(g);
  }
  update(delta:number) {
    const t=performance.now()*.001;
    for(let i=0;i<this.meshes.length;i++) {
      const mesh=this.meshes[i];
      if(TRAVERSAL_OBSTACLES[i].kind==='STREAM') mesh.rotation.y=Math.sin(t*.35+i)*.008;
      if(TRAVERSAL_OBSTACLES[i].kind==='ROCK') mesh.rotation.y+=delta*.015;
    }
  }
}
