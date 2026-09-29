import * as THREE from 'three';
import { createStarterPBRMaterial } from '../engine/GridPBRLibrary';

interface LivingPlant { root: THREE.Group; sway: number; }
interface LivingCreature { root: THREE.Group; phase: number; radius: number; speed: number; center: THREE.Vector3; }

export class GridLivingWorld {
  readonly root = new THREE.Group();
  private readonly plants: LivingPlant[] = [];
  private readonly creatures: LivingCreature[] = [];
  private readonly fireflies: THREE.Mesh[] = [];
  private readonly waterRipples: THREE.Mesh[] = [];
  private time = 0;

  constructor() {
    this.root.name = 'grid-living-world';
    this.createFlora();
    this.createWildlife();
    this.createFireflies();
    this.createWaterRipples();
    this.createAtmosphericStructures();
  }

  private createFlora() {
    const spots = [
      [-30,-24,.9],[-27,-19,.65],[-23,-31,1.1],[-20,-21,.7],[-14,-32,.8],
      [16,-34,1.2],[20,-30,.75],[25,-33,1.0],[30,-27,.65],[29,-20,.9],
      [13,-20,.7],[-30,15,.8],[-26,18,1.15],[27,16,.7],[31,11,1.0],
      [-5,28,.8],[5,29,1.05],[-12,23,.65],[12,24,.75],
    ] as const;

    for (let i=0;i<spots.length;i++) {
      const [x,z,scale]=spots[i];
      const root=new THREE.Group();
      const stem=new THREE.Mesh(
        new THREE.CylinderGeometry(.025,.05,.55*scale,6),
        createStarterPBRMaterial('foliage',{color:'#3d6f4b',roughness:.92})
      );
      stem.position.y=.275*scale;
      const leaf=new THREE.Mesh(
        new THREE.ConeGeometry(.24*scale,.75*scale,7),
        createStarterPBRMaterial('foliage',{color:i%3===0?'#6ea56a':i%3===1?'#3e7f5a':'#5c9157',roughness:.9})
      );
      leaf.position.y=.68*scale;
      root.add(stem,leaf);
      root.position.set(x,0,z);
      root.rotation.y=(i*1.73)%Math.PI;
      root.userData.gridObjectId='plant.first-light.' + i;
      root.userData.interactable=true;
      root.userData.interactionName='Living Plant';
      this.root.add(root);
      this.plants.push({root,sway:.8+(i%5)*.16});
    }

    for(let i=0;i<8;i++){
      const root=new THREE.Group();
      const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.3,2.8,9),createStarterPBRMaterial('wood',{color:'#5a3d28',roughness:.82}));
      trunk.position.y=1.4;
      const crown=new THREE.Mesh(new THREE.SphereGeometry(1.35,12,9),createStarterPBRMaterial('foliage',{color:i%2?'#397451':'#4e8650',roughness:.94}));
      crown.position.y=3.05;
      crown.scale.set(1,.85,1);
      root.add(trunk,crown);
      root.position.set(-34+i*9,0,24+(i%2)*4);
      root.scale.setScalar(.8+(i%4)*.14);
      root.userData.gridModelFamily='tree';
      this.root.add(root);
      this.plants.push({root,sway:.25+(i%3)*.12});
    }
  }

  private createWildlife() {
    const habitats = [
      {x:21,z:-27,count:4,color:'#7e6048',accent:'#9cf2c1'},
      {x:-20,z:-27,count:3,color:'#53657a',accent:'#76eaff'},
      {x:27,z:20,count:3,color:'#7f745e',accent:'#7fe9ff'},
    ];
    let index=0;
    for(const habitat of habitats){
      for(let i=0;i<habitat.count;i++){
        const root=new THREE.Group();
        const body=new THREE.Mesh(new THREE.SphereGeometry(.42,10,7),createStarterPBRMaterial('skin',{color:habitat.color,roughness:.8}));
        body.scale.set(1.35,.72,.72);
        body.position.y=.52;
        const head=new THREE.Mesh(new THREE.SphereGeometry(.3,10,7),createStarterPBRMaterial('skin',{color:habitat.color,roughness:.78}));
        head.position.set(0,.68,-.48);
        const ear1=new THREE.Mesh(new THREE.ConeGeometry(.09,.22,5),createStarterPBRMaterial('technical',{color:habitat.accent,emissive:habitat.accent,emissiveIntensity:.35}));
        ear1.position.set(-.13,.94,-.52);
        const ear2=ear1.clone();
        ear2.position.x=.13;
        const tail=new THREE.Mesh(new THREE.TorusGeometry(.22,.035,5,12,Math.PI*1.4),createStarterPBRMaterial('technical',{color:habitat.accent,emissive:habitat.accent,emissiveIntensity:.25}));
        tail.rotation.x=Math.PI/2;
        tail.position.set(0,.55,.45);
        root.add(body,head,ear1,ear2,tail);
        root.position.set(habitat.x+(i-1)*2.1,.02,habitat.z+(i%2)*1.8);
        root.userData.interactable=true;
        root.userData.interactionName='Wildlife ' + (index+1);
        root.userData.gridObjectKind='creature';
        this.root.add(root);
        this.creatures.push({root,phase:index*.9,radius:2+index%3,speed:.16+(index%4)*.035,center:new THREE.Vector3(habitat.x,.02,habitat.z)});
        index++;
      }
    }
  }

  private createFireflies() {
    for(let i=0;i<42;i++){
      const dot=new THREE.Mesh(
        new THREE.SphereGeometry(.035,6,6),
        new THREE.MeshBasicMaterial({color:i%3===0?0xffd66b:0x62e8ff,transparent:true,opacity:.7})
      );
      dot.position.set(-34+Math.random()*68,.5+Math.random()*4,-34+Math.random()*62);
      this.root.add(dot);
      this.fireflies.push(dot);
    }
  }

  private createWaterRipples() {
    for(let i=0;i<7;i++){
      const ring=new THREE.Mesh(
        new THREE.RingGeometry(.4+i*.08,.44+i*.08,32),
        new THREE.MeshBasicMaterial({color:0x65dded,transparent:true,opacity:.18,side:THREE.DoubleSide})
      );
      ring.rotation.x=-Math.PI/2;
      ring.position.set(-22+i*7,-.2,38+(i%3)*2);
      this.root.add(ring);
      this.waterRipples.push(ring);
    }
  }

  private createAtmosphericStructures() {
    for(let i=0;i<5;i++){
      const mast=new THREE.Group();
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.035,.05,5,6),createStarterPBRMaterial('metal',{color:'#2d4d60',metalness:.8,roughness:.28}));
      pole.position.y=2.5;
      const orb=new THREE.Mesh(new THREE.SphereGeometry(.14,10,8),createStarterPBRMaterial('glass',{color:'#65dded',emissive:'#65dded',emissiveIntensity:1.2,roughness:.12}));
      orb.position.y=5.05;
      mast.add(pole,orb);
      mast.position.set(-30+i*15,0,31+(i%2)*2);
      this.root.add(mast);
    }
  }

  update(delta:number) {
    this.time+=delta;
    for(let i=0;i<this.plants.length;i++){
      const p=this.plants[i];
      p.root.rotation.z=Math.sin(this.time*p.sway+i)*.045;
      p.root.rotation.x=Math.cos(this.time*p.sway*.7+i)*.025;
    }
    for(let i=0;i<this.creatures.length;i++){
      const c=this.creatures[i];
      const angle=this.time*c.speed+c.phase;
      c.root.position.x=c.center.x+Math.cos(angle)*c.radius;
      c.root.position.z=c.center.z+Math.sin(angle*1.17)*c.radius*.7;
      c.root.rotation.y=Math.atan2(Math.cos(angle*1.17),-Math.sin(angle))+Math.PI;
      const bob=Math.sin(this.time*3.4+c.phase)*.035;
      c.root.position.y=.02+bob;
    }
    for(let i=0;i<this.fireflies.length;i++){
      const f=this.fireflies[i];
      f.position.y += Math.sin(this.time*.6+i)*.0012;
      f.material.opacity=.35+.35*(.5+.5*Math.sin(this.time*2.2+i));
    }
    for(let i=0;i<this.waterRipples.length;i++){
      const r=this.waterRipples[i];
      const s=.8+.35*(.5+.5*Math.sin(this.time*.8+i));
      r.scale.setScalar(s);
      r.material.opacity=.08+.1*(.5+.5*Math.sin(this.time*1.3+i));
    }
  }
}
