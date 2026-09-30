import * as THREE from 'three';
import type { EcologyWorld, EcologySnapshot } from './CreatureEcologySystem';
import { traversalHit, steerAround } from './TraversalSystem';

export type CitizenState = 'WORK'|'TRAVEL'|'GATHER'|'TALK'|'REST'|'CELEBRATE';
export type CitizenRole = 'NAVIGATOR'|'GARDENER'|'ARTISAN'|'KEEPER'|'RANGER';

type Citizen = {
  root: THREE.Group;
  name: string;
  world: EcologyWorld;
  role: CitizenRole;
  state: CitizenState;
  home: THREE.Vector3;
  workplace: THREE.Vector3;
  social: number;
  energy: number;
  stateTimer: number;
  phase: number;
  target: THREE.Vector3;
  jumpVelocity: number;
  jumpCooldown: number;
  jumpPhase: number;
  jumpStyle: number;
  jumpTargetY: number;
  jumpCount: number;
};

export interface SocietySnapshot {
  population:number;
  active:number;
  working:number;
  gathering:number;
  talking:number;
  world:EcologyWorld;
  signal:string;
}

const CITIZENS = [
  ['Mara','NAVIGATOR','HARBOR',22,-24,27,-20],
  ['Iven','NAVIGATOR','HARBOR',27,-25,22,-28],
  ['Sela','GARDENER','GARDENS',23,20,27,15],
  ['Tarin','GARDENER','GARDENS',27,16,20,25],
  ['Caro','ARTISAN','ARTS',17,-15,22,-21],
  ['Veya','ARTISAN','ARTS',22,-21,14,-12],
  ['Orin','KEEPER','CITADEL',-19,-18,-24,-25],
  ['Nara','KEEPER','CITADEL',-24,-25,-15,-17],
  ['Rook','RANGER','WILDS',-25,22,-18,28],
  ['Edda','RANGER','WILDS',-18,28,-27,19],
] as const;

export class NPCSocietySystem {
  readonly root = new THREE.Group();
  private citizens: Citizen[] = [];
  private snapshot: SocietySnapshot = { population:0, active:0, working:0, gathering:0, talking:0, world:'HARBOR', signal:'QUIET' };

  constructor() {
    this.root.name='grid-npc-society';
    for (const [name,role,world,hx,hz,wx,wz] of CITIZENS) this.spawn(name,role,world,hx,hz,wx,wz);
  }

  private spawn(name:string, role:CitizenRole, world:EcologyWorld, hx:number,hz:number,wx:number,wz:number) {
    const root=new THREE.Group();
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.75,4,8),new THREE.MeshStandardMaterial({color:0x394456,roughness:.72}));
    const head=new THREE.Mesh(new THREE.SphereGeometry(.24,10,8),new THREE.MeshStandardMaterial({color:0xb88f72,roughness:.7}));
    const badge=new THREE.Mesh(new THREE.TorusGeometry(.17,.025,5,10),new THREE.MeshBasicMaterial({color:0x7fe7ff}));
    badge.rotation.x=Math.PI/2; badge.position.y=1.02;
    root.add(body,head,badge); root.position.set(hx,0,hz);
    root.userData={gridObjectKind:'npc',interactable:true,interactionName:name,role,world,combatFaction:'NPC',maxHealth:120,damage:6};
    this.root.add(root);
    this.citizens.push({root,name,role,world,state:'REST',home:new THREE.Vector3(hx,0,hz),workplace:new THREE.Vector3(wx,0,wz),social:.55,energy:.8,stateTimer:2+name.length,phase:name.length,target:new THREE.Vector3(wx,0,wz),jumpVelocity:0,jumpCooldown:1.5+(name.length%4)*.6,jumpPhase:name.length*.7,jumpStyle:name.length%3,jumpTargetY:0,jumpCount:0});
  }

  private chooseState(c:Citizen,event:string,phase:string) {
    if(event==='MARKET' && c.world==='ARTS') return 'GATHER';
    if(event==='BLOOM' && c.world==='GARDENS') return 'GATHER';
    if(event==='MIGRATION' && c.world==='WILDS') return 'TRAVEL';
    if(event==='TIDE' && c.world==='HARBOR') return 'TRAVEL';
    if(event==='AURORA' && c.world==='CITADEL') return 'CELEBRATE';
    if(c.energy<.22) return 'REST';
    if(c.social>.78) return 'TALK';
    return c.phase%2>.9 ? 'GATHER' : 'WORK';
  }

  update(delta:number,playerX=0,playerZ=0,world:EcologyWorld='HARBOR',event='QUIET',phase='DAY',ecology?:EcologySnapshot) {
    let active=0,working=0,gathering=0,talking=0;
    for(const c of this.citizens) {
      const distance=Math.hypot(c.root.position.x-playerX,c.root.position.z-playerZ);
      c.root.visible=distance<58;
      if(!c.root.visible) continue;
      active++;
      c.stateTimer-=delta;
      if(c.stateTimer<=0){ c.state=this.chooseState(c,event.toUpperCase(),phase); c.stateTimer=5+(c.phase%6); }
      c.energy=Math.max(0,c.energy-delta*(c.state==='WORK'?.012:.005));
      c.social=Math.max(0,c.social-delta*.006);
      if(c.state==='REST') c.energy=Math.min(1,c.energy+delta*.045);
      if(c.state==='TALK') { c.social=Math.min(1,c.social+delta*.035); talking++; }
      if(c.state==='WORK') working++;
      if(c.state==='GATHER') gathering++;
      const destination=(c.state==='REST'||c.state==='TALK'||c.state==='CELEBRATE')?c.home:c.workplace;
      c.target.copy(destination);
      const hit=traversalHit(c.root.position,c.target,.32);
      if(hit) {
        if(hit.height<=1.15 && c.state!=='REST') {
          c.jumpCooldown=Math.min(c.jumpCooldown,.15);
        } else {
          steerAround(c.root.position,c.target,hit,c.target);
        }
      }
      const dx=c.target.x-c.root.position.x,dz=c.target.z-c.root.position.z,len=Math.hypot(dx,dz);
      if(len>.2){const speed=c.state==='TRAVEL'?1.45:c.state==='WORK'?.42:.7;const step=Math.min(len,speed*delta);c.root.position.x+=dx/len*step;c.root.position.z+=dz/len*step;c.root.rotation.y=Math.atan2(dx,dz);}
      c.jumpCooldown-=delta;
      const canJump = len>.8 && c.state!=='REST' && c.energy>.34;
      if(c.jumpCooldown<=0 && canJump) {
        c.jumpVelocity = c.jumpStyle===0 ? 2.5 : c.jumpStyle===1 ? 2.9 : 3.25;
        c.jumpCooldown = 3.2 + (c.phase%4)*1.15;
        c.jumpCount++;
        c.jumpTargetY = c.jumpStyle===2 ? .82 : c.jumpStyle===1 ? .68 : .55;
      }
      // Small traversal hops become taller during travel, giving citizens a readable
      // ability to clear low lips/steps without turning movement into flight.
      c.jumpVelocity -= delta*8.2;
      c.root.position.y = Math.max(0,c.root.position.y+c.jumpVelocity*delta);
      if(c.root.position.y===0 && c.jumpVelocity<0) c.jumpVelocity=0;
      const airborne=c.root.position.y>0.05;
      c.root.rotation.x = airborne ? THREE.MathUtils.clamp(-c.jumpVelocity*.045,-.18,.18) : 0;
      c.root.rotation.z = c.state==='CELEBRATE' ? Math.sin(performance.now()*.004+c.phase)*.12 : 0;
      if(c.state==='CELEBRATE') c.root.rotation.z=Math.sin(performance.now()*.004+c.phase)*.12;
      c.phase+=delta*.5;
    }
    const signal=event.toUpperCase()!=='QUIET'?event.toUpperCase():(ecology?.state||'QUIET');
    this.snapshot={population:this.citizens.length,active,working,gathering,talking,world,signal};
    this.root.userData.society=this.snapshot;
  }

  getSnapshot(){return this.snapshot;}
}
