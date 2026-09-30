import * as THREE from 'three';
import { getWorlds } from './GridWorldRegistry';
import { deriveWorldDNA } from './WorldDNA';
import { createStarterPBRMaterial } from '../engine/GridPBRLibrary';

function addBridge(cluster: THREE.Group, from: THREE.Vector3, to: THREE.Vector3, material: THREE.Material, thickness=.14) {
  const delta=to.clone().sub(from), length=delta.length();
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(thickness,thickness,length,8),material);
  beam.position.copy(from).add(to).multiplyScalar(.5);
  beam.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
  cluster.add(beam);
}

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
      const style=dna.buildingStyle;
      const verticality=THREE.MathUtils.clamp(style.verticality,.65,2.2);
      const organicity=THREE.MathUtils.clamp(style.organicity,0,1);
      const aerial=world.tags?.includes('aerial') || world.tags?.includes('cloud');
      const living=world.tags?.includes('living') || world.tags?.includes('growth');
      const wildlife=world.tags?.includes('wildlife');
      const positions: THREE.Vector3[]=[];
      const count=Math.max(5,Math.round(5*dna.ambientLife));
      for(let i=0;i<count;i++){
        const a=i*2.399963;
        const radius=5+(i%3)*2;
        const h=(3+(i%4)*1.8)*verticality;
        const family=dna.architecture.buildingFamilies[i%dna.architecture.buildingFamilies.length] ?? 'settlement';
        let mesh:THREE.Object3D;
        if(family.includes('canopy') || family.includes('grove') || family.includes('living') || living){
          mesh=new THREE.Mesh(new THREE.CylinderGeometry(.45,.8+organicity*.35,h,9),primary);
          const crown=new THREE.Mesh(new THREE.SphereGeometry(1.2+organicity*.9,10,7),secondary);
          crown.position.y=h;
          mesh.add(crown);
          if(living) for(let r=0;r<2;r++){const root=new THREE.Mesh(new THREE.TorusGeometry(1+r*.35,.055,6,24),secondary);root.rotation.x=Math.PI/2;root.position.y=h*(.32+r*.18);mesh.add(root);}
        } else if(family.includes('gallery') || family.includes('studio') || family.includes('market')){
          mesh=new THREE.Mesh(new THREE.BoxGeometry(2.2+organicity*.7,h,1.7+organicity*.45),primary);
          const frame=new THREE.Mesh(new THREE.BoxGeometry(2.5+organicity*.7,.18,1.95+organicity*.45),secondary);
          frame.position.y=h*.7;
          mesh.add(frame);
        } else if(family.includes('temple') || family.includes('citadel') || family.includes('archive')){
          mesh=new THREE.Mesh(new THREE.CylinderGeometry(1.05,.9,h,8),primary);
          const ring=new THREE.Mesh(new THREE.TorusGeometry(1.25,.08,6,24),secondary);
          ring.position.y=h*.72;
          mesh.add(ring);
        } else if(family.includes('watchtower')){
          mesh=new THREE.Mesh(new THREE.CylinderGeometry(.55,.9,h*1.25,8),primary);
        } else if(family.includes('burrow') || family.includes('lodge')){
          mesh=new THREE.Mesh(new THREE.CylinderGeometry(1.25,1.05,h*.55,8),primary);
          mesh.scale.z=1.35;
        } else {
          mesh=new THREE.Mesh(new THREE.BoxGeometry(1.8,h,1.8),primary);
        }
        const localY=aerial ? 3.5+(i%3)*2.5 : 0;
        mesh.position.set(Math.cos(a)*radius,localY+h/2,Math.sin(a)*radius);
        mesh.rotation.y=a*.37;
        mesh.userData.gridObjectKind='world-building';
        mesh.userData.worldId=world.id;
        mesh.userData.architectureFamily=family;
        cluster.add(mesh);
        positions.push(new THREE.Vector3(mesh.position.x,localY+h*.55,mesh.position.z));
      }
      if(aerial || living || world.tags?.includes('canopy')) for(let i=0;i<positions.length;i++) addBridge(cluster,positions[i],positions[(i+1)%positions.length],secondary,.12+organicity*.07);
      if(aerial){
        const cloudDeck=new THREE.Mesh(new THREE.CircleGeometry(14,48),new THREE.MeshBasicMaterial({color:world.color,transparent:true,opacity:.055,depthWrite:false}));
        cloudDeck.rotation.x=-Math.PI/2;cloudDeck.position.y=-1.5;cloudDeck.userData.gridObjectKind='world-cloud-deck';cloudDeck.userData.worldId=world.id;cluster.add(cloudDeck);
      }
      if(wildlife) for(let i=0;i<3;i++){const habitat=new THREE.Mesh(new THREE.CylinderGeometry(.35,.6,1.1,7),secondary);const ha=i*2.1;habitat.position.set(Math.cos(ha)*3.2,.55,Math.sin(ha)*3.2);habitat.userData.gridObjectKind='wildlife-habitat';habitat.userData.worldId=world.id;cluster.add(habitat);}
      const landmark=new THREE.Mesh(new THREE.TorusGeometry(3.2,.14,8,48),secondary);
      landmark.position.y=(aerial?7:5.5)*verticality;
      landmark.rotation.x=Math.PI/2;
      landmark.userData.gridObjectKind='world-landmark';
      landmark.userData.worldId=world.id;
      cluster.add(landmark);
      cluster.userData.architectureDNA=dna.architecture;
      cluster.userData.buildingStyle=style;
      cluster.userData.worldDescription=world.description;
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
