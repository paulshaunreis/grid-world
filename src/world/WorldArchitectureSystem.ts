import * as THREE from 'three';
import { getWorlds } from './GridWorldRegistry';
import { deriveWorldDNA } from './WorldDNA';
import { createStarterPBRMaterial } from '../engine/GridPBRLibrary';

export class WorldArchitectureSystem {
  readonly root = new THREE.Group();
  private readonly generated = new Set<string>();

  constructor() {
    this.root.name='grid-world-generated-architecture';
    this.rebuild();
  }

  rebuild() {
    for (const world of getWorlds()) {
      if (this.generated.has(world.id)) continue;
      this.generated.add(world.id);
      const dna=deriveWorldDNA(world.tags ?? []);
      const cluster=new THREE.Group();
      cluster.name='architecture-'+world.id.toLowerCase();
      cluster.position.copy(world.center);
      const primary=createStarterPBRMaterial('stone',{color:'#'+world.color.toString(16).padStart(6,'0'),roughness:.62,metalness:.18});
      const secondary=createStarterPBRMaterial('metal',{color:'#'+world.secondary.toString(16).padStart(6,'0'),roughness:.3,metalness:.72});
      const count=Math.max(5,Math.round(5*dna.ambientLife));
      for(let i=0;i<count;i++){
        const a=i*2.399963;
        const radius=5+(i%3)*2;
        const h=3+(i%4)*1.8;
        const family=dna.architecture.buildingFamilies[i%dna.architecture.buildingFamilies.length] ?? 'settlement';
        let mesh:THREE.Object3D;
        if(family.includes('canopy') || family.includes('grove') || family.includes('living')){
          mesh=new THREE.Mesh(new THREE.CylinderGeometry(.45,.8,h,9),primary);
          const crown=new THREE.Mesh(new THREE.SphereGeometry(1.4,10,7),secondary);
          crown.position.y=h;
          mesh.add(crown);
        } else if(family.includes('gallery') || family.includes('studio') || family.includes('market')){
          mesh=new THREE.Mesh(new THREE.BoxGeometry(2.2, h, 1.7),primary);
          const frame=new THREE.Mesh(new THREE.BoxGeometry(2.5,.18,1.95),secondary);
          frame.position.y=h*.7;
          mesh.add(frame);
        } else if(family.includes('temple') || family.includes('citadel') || family.includes('archive')){
          mesh=new THREE.Mesh(new THREE.CylinderGeometry(1.05,.9,h,8),primary);
          const ring=new THREE.Mesh(new THREE.TorusGeometry(1.25,.08,6,24),secondary);
          ring.position.y=h*.72;
          mesh.add(ring);
        } else {
          mesh=new THREE.Mesh(new THREE.BoxGeometry(1.8, h, 1.8),primary);
        }
        mesh.position.set(Math.cos(a)*radius,h/2,Math.sin(a)*radius);
        mesh.rotation.y=a*.37;
        mesh.userData.gridObjectKind='world-building';
        mesh.userData.worldId=world.id;
        mesh.userData.architectureFamily=family;
        cluster.add(mesh);
      }
      const landmark=new THREE.Mesh(new THREE.TorusGeometry(3.2,.14,8,48),secondary);
      landmark.position.y=5.5;
      landmark.rotation.x=Math.PI/2;
      landmark.userData.gridObjectKind='world-landmark';
      landmark.userData.worldId=world.id;
      cluster.add(landmark);
      cluster.userData.architectureDNA=dna.architecture;
      this.root.add(cluster);
    }
  }

  update(dt:number) {
    for(const cluster of this.root.children){
      cluster.children.forEach((object,index)=>{
        if(object.userData.gridObjectKind==='world-landmark') object.rotation.z+=dt*(.04+index*.002);
      });
    }
  }
}
