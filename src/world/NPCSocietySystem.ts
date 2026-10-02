import * as THREE from 'three';
import type { EcologyWorld, EcologySnapshot } from './CreatureEcologySystem';
import { traversalHit, steerAround } from './TraversalSystem';
import type { WorldConsequenceSnapshot } from './WorldConsequenceSystem';
import { getWorlds } from './GridWorldRegistry';
import type { LivingWorldEventKind } from './GridLivingWorld';
import { hourOfDayFromDayFraction, resolveNpcRoutine, routinePhaseFor } from '../npc/NpcDailyRoutine';
import { createNPCProfile, type NPCProfileRecord } from './NPCProfile';
import { NPCRelationshipNetwork, type NPCRelationship } from './NPCRelationshipSystem';
import { NPCInventorySystem } from './NPCInventorySystem';
import { NPCJobProgressionSystem } from './NPCJobProgressionSystem';
import { GridMaterialDropSystem } from './GridMaterialDropSystem';
import { NPCProductionSystem } from './NPCProductionSystem';
import { NPCMarketSystem } from './NPCMarketSystem';
import { GridNpcBrain, type GridNpcAction } from '../npc/GridNpcBrain';

export type CitizenState = 'WORK'|'TRAVEL'|'GATHER'|'TALK'|'REST'|'CELEBRATE'|'EAT';
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
  merchant:boolean;
  merchantStock:number;
  merchantStress:number;
  merchantMood:string;
  merchantOpen:boolean;
  merchantSchedule:number;
  schedulePhase:number;
  travelTimer:number;
  travelTarget:THREE.Vector3;
  travelMode:'WALK'|'TELEPORT';
  travelPurpose:'WORK'|'TRADE'|'FESTIVAL'|'EMERGENCY'|'RELATIONSHIP';
  travelWorld:EcologyWorld;
  selectedDestination:EcologyWorld;
  gateCooldown:number;
  travelStage:'IDLE'|'APPROACH_GATE'|'TRANSIT';
  gatePosition:THREE.Vector3;
  brain: GridNpcBrain;
  mealCooldown:number;
  memoryCooldown:number;
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

function createGateVFX(world:EcologyWorld, colorOverride?:number) {
  const group=new THREE.Group();
  group.name='npc-gate-network';
  const palette:{[key:string]:number}={HARBOR:0x52d9e8,GARDENS:0x9be27b,CITADEL:0xd7b46a,ARTS:0xd28cff,WILDS:0xc9a36a};
  const color=palette[world] ?? colorOverride ?? 0x68d9ff;
  for(let i=0;i<3;i++){
    const ring=new THREE.Mesh(
      new THREE.TorusGeometry(1.35+i*.22,.035,8,48),
      new THREE.MeshBasicMaterial({color,transparent:true,opacity:.32})
    );
    ring.rotation.y=Math.PI/2;
    ring.position.y=.95;
    ring.userData.baseScale=1+i*.08;
    group.add(ring);
  }
  const labelCanvas=document.createElement('canvas'); labelCanvas.width=512; labelCanvas.height=128; const labelCtx=labelCanvas.getContext('2d')!; labelCtx.clearRect(0,0,512,128); labelCtx.fillStyle='#ffffff'; labelCtx.font='700 34px sans-serif'; labelCtx.textAlign='center'; labelCtx.fillText(world+' GATE',256,48); labelCtx.font='18px sans-serif'; labelCtx.fillStyle='rgba(210,245,255,.72)'; labelCtx.fillText('DESTINATION SELECT',256,82); const label=new THREE.Sprite(new THREE.SpriteMaterial({map:new THREE.CanvasTexture(labelCanvas),transparent:true,depthWrite:false})); label.scale.set(3.8,.95,1); label.position.set(0,2.85,0); group.add(label);
  const core=new THREE.Mesh(
    new THREE.CircleGeometry(1.15,40),
    new THREE.MeshBasicMaterial({color,transparent:true,opacity:.08,side:THREE.DoubleSide})
  );
  core.rotation.y=Math.PI/2;
  core.position.y=.95;
  group.add(core);
  group.userData.world=world;
  return group;
}

export class NPCSocietySystem {
  readonly root = new THREE.Group();
  private citizens: Citizen[] = [];
  private profiles = new Map<string, NPCProfileRecord>();
  /** Rich needs/memory brain for the visible citizen layer; deliberately bridged, not a replacement for society state. */
  private brains = new Map<string, GridNpcBrain>();
  private relationships = new NPCRelationshipNetwork();
  private inventory = new NPCInventorySystem();
  private progression = new NPCJobProgressionSystem();
  private materialDrops = new GridMaterialDropSystem();
  private production = new NPCProductionSystem(this.materialDrops, this.inventory);
  private market = new NPCMarketSystem();
  private marketedProduction = new Set<string>();
  private gates=new Map<EcologyWorld,THREE.Group>();
  private gateBusy=new Map<EcologyWorld,number>();
  private transitTrafficRecorder: ((source:EcologyWorld,destination:EcologyWorld,queueDepth:number)=>void) | null = null;
  private gatePositions=new Map<EcologyWorld,[number,number]>();
  private snapshot: SocietySnapshot = { population:0, active:0, working:0, gathering:0, talking:0, world:'HARBOR', signal:'QUIET' };

  constructor() {
    this.root.name='grid-npc-society';
    this.root.add(this.materialDrops.root, this.production.root);
    for(const world of getWorlds()) this.registerWorld(world);
    for (const [name,role,world,hx,hz,wx,wz] of CITIZENS) this.spawn(name,role,world,hx,hz,wx,wz);
    for (let i = 0; i < this.citizens.length; i++) {
      for (let j = i + 1; j < this.citizens.length; j++) {
        const a = this.citizens[i], b = this.citizens[j];
        if (a.world === b.world) this.relationships.connect(a.name, b.name, 'friend', .18);
        else if (a.role === b.role) this.relationships.connect(a.name, b.name, 'faction', .08);
      }
    }
  }

  /** Runtime-created worlds receive a gate and a small native society without editing this system. */
  registerWorld(world:{id:string;label:string;center:THREE.Vector3;color:number}) {
    if(this.gates.has(world.id)) return;
    const gate=createGateVFX(world.id,world.color);
    this.gates.set(world.id,gate);
    this.gatePositions.set(world.id,[world.center.x,world.center.z]);
    this.root.add(gate);
    const existing=this.citizens.filter(c=>c.world===world.id).length;
    const hasDesignedSociety=CITIZENS.some(row=>row[2]===world.id);
    if(existing===0 && !hasDesignedSociety){
      const x=world.center.x,z=world.center.z;
      this.spawn(world.label+' Guide','NAVIGATOR',world.id,x+2,z+2,x-2,z-2);
      this.spawn(world.label+' Keeper','KEEPER',world.id,x-2,z+1,x+2,z-1);
    }
  }

  private gatePosition(world:EcologyWorld):[number,number] {
    return this.gatePositions.get(world) ?? [0,0];
  }

  private spawn(name:string, role:CitizenRole, world:EcologyWorld, hx:number,hz:number,wx:number,wz:number) {
    const root=new THREE.Group();
    const body=new THREE.Mesh(new THREE.CapsuleGeometry(.28,.75,4,8),new THREE.MeshStandardMaterial({color:0x394456,roughness:.72}));
    const head=new THREE.Mesh(new THREE.SphereGeometry(.24,10,8),new THREE.MeshStandardMaterial({color:0xb88f72,roughness:.7}));
    const badge=new THREE.Mesh(new THREE.TorusGeometry(.17,.025,5,10),new THREE.MeshBasicMaterial({color:0x7fe7ff}));
    badge.rotation.x=Math.PI/2; badge.position.y=1.02;
    root.add(body,head,badge); root.position.set(hx,0,hz);
    const merchant = ['Mara','Sela','Caro','Orin','Rook'].includes(name);
    root.userData={gridObjectKind:'npc',interactable:true,interactionName:name,role,world,combatFaction:'NPC',maxHealth:120,damage:6,merchant,marketWorld:merchant?world:undefined,npcProfileId:merchant?('npc.merchant.'+name.toLowerCase()):undefined,profileAvailable:true,logAvailable:true};
    const profile = createNPCProfile({
      id: 'npc.' + name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      displayName: name,
      role,
      archetype: role.toLowerCase(),
      world,
      gender: 'unspecified',
      traits: merchant ? ['merchant', 'social'] : ['citizen', role.toLowerCase()],
      skills: { [role.toLowerCase()]: 1 },
      occupation: { title: role, workplaceId: world.toLowerCase() + '-workplace', progression: 0 },
      home: { world, x: hx, y: 0, z: hz },
      tags: merchant ? ['merchant'] : ['citizen'],
    });
    this.profiles.set(name, profile);
    this.inventory.seed(profile);
    const brain = new GridNpcBrain(profile.id, name, {
      sociability: role === 'KEEPER' ? .35 : role === 'NAVIGATOR' ? .65 : .55,
      curiosity: role === 'RANGER' || role === 'NAVIGATOR' ? .75 : .5,
      diligence: role === 'ARTISAN' || role === 'GARDENER' ? .72 : .58,
      caution: role === 'KEEPER' || role === 'RANGER' ? .72 : .5,
      playfulness: role === 'ARTISAN' ? .68 : .45,
      empathy: role === 'GARDENER' || role === 'KEEPER' ? .7 : .5,
    });
    this.brains.set(name, brain);
    root.userData.npcProfile = profile;
    root.userData.inventory = profile.inventory;
    root.userData.jobProgression = profile.occupation;
    root.userData.relationships = () => this.relationships.forNPC(name);

    if (merchant) {
      const canopy=new THREE.Mesh(new THREE.ConeGeometry(.62,.38,8),new THREE.MeshStandardMaterial({color:0x263d49,roughness:.6,metalness:.15}));
      canopy.position.y=1.45;
      const counter=new THREE.Mesh(new THREE.BoxGeometry(1.15,.32,.62),new THREE.MeshStandardMaterial({color:0x6a5540,roughness:.8}));
      counter.position.set(0,.48,.38);
      const sigil=new THREE.Mesh(new THREE.TorusGeometry(.16,.035,6,12),new THREE.MeshBasicMaterial({color:0x71dfff}));
      sigil.rotation.x=Math.PI/2; sigil.position.set(0,.9,.42);
      root.add(canopy,counter,sigil);
    }
    this.root.add(root);
    this.citizens.push({root,name,role,world,state:'REST',home:new THREE.Vector3(hx,0,hz),workplace:new THREE.Vector3(wx,0,wz),social:.55,energy:.8,stateTimer:2+name.length,phase:name.length,target:new THREE.Vector3(wx,0,wz),jumpVelocity:0,jumpCooldown:1.5+(name.length%4)*.6,jumpPhase:name.length*.7,jumpStyle:name.length%3,jumpTargetY:0,jumpCount:0,merchant,merchantStock:merchant?0:0,merchantStress:0,merchantMood:'CALM',merchantOpen:true,merchantSchedule:name.length%6,schedulePhase:(name.length%10)/10,travelTimer:8+name.length%9,travelTarget:new THREE.Vector3(wx,0,wz),travelMode:'WALK',travelPurpose:'WORK',travelWorld:world,selectedDestination:world,gateCooldown:0,travelStage:'IDLE',gatePosition:new THREE.Vector3(hx,0,hz),brain,mealCooldown:0,memoryCooldown:0});
  }

  private chooseState(c:Citizen,event:string,phase:string,pressure=0,stability=1,brainAction?:GridNpcAction) {
    if (pressure > .72 && c.role === 'RANGER') return 'TRAVEL';
    if (stability < .4 && c.energy < .6) return 'REST';
    if(event==='MARKET' && c.world==='ARTS') return 'GATHER';
    if(event==='BLOOM' && c.world==='GARDENS') return 'GATHER';
    if(event==='MIGRATION' && c.world==='WILDS') return 'TRAVEL';
    if(event==='TIDE' && c.world==='HARBOR') return 'TRAVEL';
    if(event==='AURORA' && c.world==='CITADEL') return 'CELEBRATE';
    if(c.energy<.22) return 'REST';
    if(c.social>.78) return 'TALK';
    switch (brainAction) {
      case 'eat': return 'EAT';
      case 'rest': return 'REST';
      case 'socialize': return 'TALK';
      case 'work': return 'WORK';
      case 'explore': return 'TRAVEL';
      case 'play': return 'CELEBRATE';
      case 'help': return 'WORK';
      default: return c.phase%2>.9 ? 'GATHER' : 'WORK';
    }
  }

  update(delta:number,playerX=0,playerZ=0,world:EcologyWorld='HARBOR',event: LivingWorldEventKind='QUIET',phase='DAY',ecology?:EcologySnapshot,consequences?:WorldConsequenceSnapshot,dayFraction?:number) {
    const pressure=consequences?.pressure ?? 0;
    const stability=consequences?.stability ?? 1;
    const now=performance.now()*.001;
    for(const [gateWorld,gate] of this.gates){
      this.gateBusy.set(gateWorld, Math.max(0, (this.gateBusy.get(gateWorld) ?? 0) - delta));
      gate.visible=true;
      const pulse=this.citizens.some(c=>c.world===gateWorld && c.travelStage==='APPROACH_GATE' && Number(c.root.userData.gatePulse??0)>0);
      const gatePosition=this.gatePosition(gateWorld);
      gate.position.set(gatePosition[0],0,gatePosition[1]);
      gate.rotation.y=now*.18;
      gate.scale.setScalar(pulse?1.12+Math.sin(now*8)*.08:1);
      gate.children.forEach((child,i)=>{
        const mat=(child as THREE.Mesh).material as THREE.MeshBasicMaterial;
        if(mat) mat.opacity=(pulse?.62:.22)+Math.sin(now*2+i)*.05;
      });
    }
    for (const c of this.citizens) {
      if (!c.merchant) continue;
      c.merchantStress = THREE.MathUtils.clamp(pressure*.7 + (1-stability)*.8, 0, 1);
      c.merchantMood = c.merchantStress > .72 ? 'WORRIED' : c.merchantStress > .38 ? 'WATCHFUL' : (event.toUpperCase() === 'MARKET' ? 'BUSY' : 'CALM');
      c.root.userData.merchantMood = c.merchantMood;
      c.root.userData.merchantStress = c.merchantStress;
    }
    let active=0,working=0,gathering=0,talking=0;
    for(const c of this.citizens) {
      const distance=Math.hypot(c.root.position.x-playerX,c.root.position.z-playerZ);
      c.root.visible=distance<58;
      if(!c.root.visible) continue;
      active++;
      c.stateTimer-=delta;
      c.travelTimer-=delta;
      c.gateCooldown=Math.max(0,c.gateCooldown-delta);
      c.mealCooldown=Math.max(0,c.mealCooldown-delta);
      c.memoryCooldown=Math.max(0,c.memoryCooldown-delta);
      // Day-cycle routine: each role keeps a data-driven daily rhythm (sleep /
      // work / meal / leisure). When no dayFraction is passed (older callers),
      // fall back to the coarse phase string so behavior degrades gracefully.
      const hourOfDay = dayFraction === undefined
        ? (phase === 'NIGHT' ? 23 : phase === 'DAWN' ? 6 : phase === 'DUSK' ? 19 : 12)
        : hourOfDayFromDayFraction(dayFraction);
      const routinePhase = routinePhaseFor(resolveNpcRoutine(c.role), hourOfDay);
      const foodAvailable = (this.profiles.get(c.name)?.inventory ?? []).some(item => item.category === 'FOOD' && item.quantity > 0);
      const nearbyNpcIds = this.citizens
        .filter(other => other !== c && other.world === c.world && c.root.position.distanceTo(other.root.position) < 8)
        .map(other => other.name);
      c.brain.update(delta, {
        nearbyNpcIds,
        isDaytime: hourOfDay >= 6 && hourOfDay < 20,
        safe: stability > .35 && pressure < .85,
        hasWork: true,
        hasFood: foodAvailable,
        routinePhase,
      });
      c.root.userData.npcBrainAction = c.brain.state.currentAction;
      c.root.userData.npcNeeds = { ...c.brain.state.needs };
      const profile = this.profiles.get(c.name);
      if (profile) {
        const remembered = c.brain.state.memories.slice(0, 8).map(memory => memory.summary);
        const mergedMemories = [...remembered, ...profile.memories].filter((value, index, list) => value && list.indexOf(value) === index);
        profile.memories = mergedMemories.slice(0, 32);
        profile.relationshipIds = this.relationships.forNPC(c.name).map(rel => rel.sourceId === c.name ? rel.targetId : rel.sourceId);
        c.root.userData.npcProfile = profile;
      }
      c.stateTimer-=delta;
      c.travelTimer-=delta;
      c.gateCooldown=Math.max(0,c.gateCooldown-delta);
      if (c.travelTimer <= 0 && routinePhase !== 'sleep') {
        c.travelTimer = 18 + (c.phase % 11);
        const worlds:EcologyWorld[] = getWorlds().map(candidate=>candidate.id);
        let purpose:'WORK'|'TRADE'|'FESTIVAL'|'EMERGENCY'|'RELATIONSHIP' = 'WORK';
        let travelWorld:EcologyWorld = c.world;
        if (event.toUpperCase() === 'MARKET') purpose = c.merchant ? 'TRADE' : 'FESTIVAL';
        else if (event.toUpperCase() === 'AURORA') purpose = 'FESTIVAL';
        else if (pressure > .72) purpose = 'EMERGENCY';
        else if (c.social > .72) purpose = 'RELATIONSHIP';
        if (purpose !== 'WORK') travelWorld = worlds[(worlds.indexOf(c.world) + 1 + Math.floor(c.phase)) % worlds.length];
        c.travelPurpose = purpose;
        c.travelWorld = travelWorld;
        // NPCs choose a destination before beginning a gate journey.
        // The choice remains stable for this trip rather than changing mid-route.
        c.selectedDestination = travelWorld;
        const remote = this.gatePosition(travelWorld);
        const destination = purpose === 'WORK'
          ? (c.state === 'TRAVEL' ? (c.phase % 2 > 1 ? c.workplace : c.home) : c.workplace)
          : new THREE.Vector3(remote[0] + ((c.phase % 3)-1)*3, 0, remote[1] + ((c.phase % 4)-1)*3);
        const longJump = Math.hypot(destination.x-c.root.position.x,destination.z-c.root.position.z) > 20;
        if (longJump) {
          // Long-distance NPC travel can use Grid gates: preserve continuity
          // while avoiding an expensive cross-world walk.
          c.travelMode = 'TELEPORT';
          c.root.userData.travelEffect = 'GATE_TRANSIT';
          c.root.userData.destinationSelected = true;
          c.root.userData.selectedDestination = c.selectedDestination;
          c.root.userData.gateDestination = c.selectedDestination;
          c.root.userData.gatePulse = 1;
          c.root.userData.gateDeparture = false;
          c.gateCooldown = 10;
          c.travelStage = 'APPROACH_GATE';
          const sourceGate = this.gatePosition(c.world);
          c.gatePosition.set(sourceGate[0],0,sourceGate[1]);
          c.travelTarget.copy(c.gatePosition);
          c.root.userData.travelPurpose = c.travelPurpose;
          c.root.userData.travelWorld = c.travelWorld;
          c.root.userData.travelEffect = 'APPROACHING_GATE';
          c.root.userData.destinationSelected = true;
          c.root.userData.selectedDestination = c.selectedDestination;
          c.root.userData.gateDestination = c.selectedDestination;
          c.root.userData.gateArrival = true;
          c.root.userData.gatePulse = 1;
          c.root.userData.travelPurpose = c.travelPurpose;
          c.root.userData.travelWorld = c.travelWorld;
          c.target.copy(destination);
        } else {
          c.travelMode = 'WALK';
          c.root.userData.travelEffect = 'WALKING';
          c.travelTarget.copy(destination);
          c.target.copy(destination);
        }
      }
      if(c.travelStage==='APPROACH_GATE' && (this.gateBusy.get(c.travelWorld) ?? 0) > 0) {
        const queue = this.citizens.filter(other => other !== c && other.travelStage==='APPROACH_GATE' && other.travelWorld===c.travelWorld).length;
        c.root.userData.gateQueuePosition = queue + 1;
        const side = (queue % 2 === 0 ? 1 : -1) * (1.8 + Math.floor(queue/2)*1.2);
        c.target.set(c.gatePosition.x + side, 0, c.gatePosition.z + 2.2 + Math.floor(queue/2)*1.1);
      }
      if(c.stateTimer<=0){ c.state=this.chooseState(c,event.toUpperCase(),phase,pressure,stability,c.brain.state.currentAction); c.stateTimer=5+(c.phase%6); }
      if(c.merchant) {
        const clock = performance.now() / 1000 + c.merchantSchedule * 11;
        const cycle = (clock % 120) / 120;
        const scheduleOpen = phase === 'NIGHT' ? cycle > .18 && cycle < .78 : true;
        c.merchantOpen = scheduleOpen && c.merchantStress < .9;
        c.root.userData.merchantOpen = c.merchantOpen;
        if (!c.merchantOpen) {
          c.root.userData.marketPrompt = c.merchantStress > .72 ? 'RESTOCKING' : 'CLOSED';
          c.state = c.merchantStress > .5 ? 'GATHER' : 'REST';
        } else if (c.merchantStress > .72 && c.state === 'WORK') {
          c.state = 'GATHER';
        } else if (c.state === 'REST' && c.energy > .65 && c.social < .7) {
          c.state = event.toUpperCase() === 'MARKET' ? 'TALK' : 'WORK';
        }
      }
      if (c.travelStage === 'IDLE' && c.state !== 'CELEBRATE') {
        if (routinePhase === 'sleep') c.state = 'REST';
        else if (routinePhase === 'meal' && c.state !== 'TRAVEL') c.state = 'EAT';
      }
      const remember = (eventType:string, summary:string, subjectId?:string, valence=.1, importance=.32) => {
        if (c.memoryCooldown > 0) return;
        c.brain.remember({ subjectId, eventType, summary, valence, importance, confidence: .82 });
        c.memoryCooldown = 8;
      };
      c.energy=Math.max(0,c.energy-delta*(c.state==='WORK'?.012:.005));
      c.social=Math.max(0,c.social-delta*.006);
      if(c.state==='REST') c.energy=Math.min(1,c.energy+delta*.045);
      if(c.state==='EAT') {
        c.energy=Math.min(1,c.energy+delta*.02);
        if(c.mealCooldown<=0){
          const profile=this.profiles.get(c.name);
          const food=profile?.inventory.find(item=>item.category==='FOOD' && item.quantity>0);
          if(profile && food){
            this.inventory.remove(profile,food.id,1);
            c.mealCooldown=20;
            c.root.userData.lastMeal=food.name;
            remember('meal', 'Ate ' + food.name + '.', food.id, .05, .22);
          }
        }
      }
      if(c.state==='TALK') { c.social=Math.min(1,c.social+delta*.035); talking++; }
      if(c.state==='WORK') {
        working++;
        const profile = this.profiles.get(c.name);
        if (profile) {
          this.progression.award(profile, delta * .7);
          c.root.userData.inventory = profile.inventory;
          c.root.userData.jobProgression = profile.occupation;
          if (profile.level > 1) c.root.userData.npcLevel = profile.level;
          if (profile.occupation.progression > 0) remember('work', 'Worked as ' + profile.occupation.title + '.', profile.occupation.workplaceId, .08, .3);
        }
      }
      if(c.state==='GATHER') { gathering++; remember('discovery', 'Looked for useful materials nearby.', c.world, .04, .2); }
      if(c.merchant) {
        c.root.userData.marketPrompt = c.merchantMood === 'WORRIED' ? 'SUPPLIES LOW' : c.merchantMood === 'BUSY' ? 'MARKET ACTIVE' : 'TRADE';
        const sigil = c.root.children.find(child => child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry) as THREE.Mesh | undefined;
        if (sigil && sigil.material instanceof THREE.MeshBasicMaterial) {
          sigil.material.color.setHex(c.merchantMood === 'WORRIED' ? 0xffb45e : c.merchantMood === 'BUSY' ? 0xffe36e : 0x71dfff);
          sigil.material.opacity = c.merchantMood === 'WORRIED' ? .72 : 1;
          sigil.material.transparent = true;
        }
        c.root.userData.merchantOpen = c.merchantOpen;
        c.root.userData.marketPrompt = c.merchantOpen ? (c.merchantMood === 'WORRIED' ? 'SUPPLIES LOW' : c.merchantMood === 'BUSY' ? 'MARKET ACTIVE' : 'TRADE') : (c.merchantStress > .72 ? 'RESTOCKING' : 'CLOSED');
      }
      if(c.travelStage==='APPROACH_GATE'){
        c.state='TRAVEL';
        c.target.copy(c.gatePosition);
        const gateDistance=Math.hypot(c.root.position.x-c.gatePosition.x,c.root.position.z-c.gatePosition.z);
        const gateBusy = this.gateBusy.get(c.world) ?? 0;
        if(gateDistance<1.35 && c.gateCooldown<=0 && gateBusy<=0){
          c.travelStage='TRANSIT';
          this.gateBusy.set(c.world, 1.25);
          c.root.userData.gateQueuePosition = 0;
          c.root.userData.destinationSelected=true;
          c.root.userData.gateDeparture=true;
          remember('travel', 'Traveled toward ' + c.selectedDestination + '.', c.selectedDestination, .06, .34);
          c.root.userData.travelEffect='GATE_TRANSIT';
          c.root.userData.gatePulse=1;
          c.root.visible=false;
          const arrivalGate=this.gatePosition(c.selectedDestination);
          c.root.position.set(arrivalGate[0],0,arrivalGate[1]);
          c.root.visible=true;
          c.root.userData.travelEffect='ARRIVAL';
          c.root.userData.gateArrival=true;
          remember('arrival', 'Arrived in ' + c.world + '.', c.world, .1, .38);
          c.root.userData.gatePulse=1;
          c.root.userData.gateQueuePosition = 0;
          this.transitTrafficRecorder?.(c.world, c.selectedDestination, Number(c.root.userData.gateQueuePosition ?? 0));
          c.world = c.selectedDestination;
          c.home.set(c.root.position.x,0,c.root.position.z);
          c.root.userData.travelHistory = [...((c.root.userData.travelHistory as string[]|undefined) ?? []), c.world].slice(-8);
          c.root.userData.world = c.world;
          c.travelStage='IDLE';
          c.gateCooldown=10;
        }
      } else {
        const destination=(c.state==='REST'||c.state==='TALK'||c.state==='CELEBRATE'||c.state==='EAT')?c.home:c.workplace;
        c.target.copy(destination);
      }
      const hit=traversalHit(c.root.position,c.target,.32);
      if(hit) {
        if(hit.height<=1.15 && c.state!=='REST') {
          c.jumpCooldown=Math.min(c.jumpCooldown,.15);
        } else {
          steerAround(c.root.position,c.target,hit,c.target);
        }
      }
      const dx=c.target.x-c.root.position.x,dz=c.target.z-c.root.position.z,len=Math.hypot(dx,dz);
      if(len>.2){const consequenceSpeed=stability<.45?.82:pressure>.6?1.1:1;
        const speed=(c.state==='TRAVEL'?1.45:c.state==='WORK'?.42:.7)*consequenceSpeed;const step=Math.min(len,speed*delta);c.root.position.x+=dx/len*step;c.root.position.z+=dz/len*step;c.root.rotation.y=Math.atan2(dx,dz);}
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
      const gatePulse=Number(c.root.userData.gatePulse ?? 0);
      if(gatePulse>0) c.root.userData.gatePulse=Math.max(0,gatePulse-delta*1.8);
      c.root.userData.gateDeparture=false;
      c.root.userData.gateArrival=false;
      if (c.state === 'TALK') {
        const nearby = this.citizens
          .filter(other => other !== c && other.world === c.world)
          .sort((a, b) => c.root.position.distanceTo(a.root.position) - c.root.position.distanceTo(b.root.position))[0];
        if (nearby && c.root.position.distanceTo(nearby.root.position) < 7) {
          this.relationships.interact(c.name, nearby.name, .006, .003);
          c.brain.meet(nearby.name, .006);
        }
      }
      c.phase+=delta*.5;
    }
    this.production.update(delta, this.getWorkingCitizens(), this.profiles);
    for (const item of this.production.getRecent(64)) {
      if (this.marketedProduction.has(item.id)) continue;
      const merchant = this.citizens.find(c => c.merchant && c.world === item.worldId);
      if (!merchant) continue;
      const merchantProfile = this.profiles.get(merchant.name);
      if (!merchantProfile) continue;
      this.market.seedMerchant(merchantProfile, 100);
      this.market.seedBalance(item.npcId, this.market.getBalance(item.npcId) || 25);
      const listing = this.market.restockFromProduction(item, merchantProfile.id);
      merchant.merchantStock += item.quantity;
      merchant.root.userData.merchantStock = merchant.merchantStock;
      merchant.root.userData.lastRestock = listing;
      this.marketedProduction.add(item.id);
      const producer = this.citizens.find(c => c.name === item.npcId);
      if (producer) producer.brain.remember({ subjectId: item.id, eventType: 'production', summary: 'Produced ' + item.quantity + ' × ' + item.name + '.', valence: .12, importance: .34, confidence: .86 });
    }
    this.root.userData.production=this.production.getRecent(32);
    this.root.userData.marketListings=this.market.getListings(world);
    this.root.userData.marketTrades=this.market.getTrades(32);
    this.root.userData.materialDrops=this.materialDrops.getSnapshot();
    const signal=event.toUpperCase()!=='QUIET'?event.toUpperCase():(ecology?.state||'QUIET');
    this.snapshot={population:this.citizens.length,active,working,gathering,talking,world,signal};
    this.root.userData.society=this.snapshot;
  }

  applyTransitInfluence(flowByWorld: Record<string, number>) {
    for (const citizen of this.citizens) {
      const flow = Number(flowByWorld[citizen.world] ?? 0);
      citizen.root.userData.transitActivity = flow;
      if (flow > .65 && citizen.state === 'REST') citizen.state = 'TALK';
    }
  }

  setTransitTrafficRecorder(recorder: (source:EcologyWorld,destination:EcologyWorld,queueDepth:number)=>void) { this.transitTrafficRecorder = recorder; }

  getSnapshot(){return this.snapshot;}
  getNPCProfile(name:string){ return this.profiles.get(name); }
  getRelationships(name:string){ return this.relationships.forNPC(name); }
  getRelationshipSnapshot(){ return this.relationships.snapshot(); }
  getNPCInventory(name:string){ const profile=this.profiles.get(name); return profile ? this.inventory.snapshot(profile) : []; }
  getNPCProduction(limit=25){ return this.production.getRecent(limit); }
  getMaterialDrops(){ return this.materialDrops.getSnapshot(); }
  getMarketListings(worldId?:string){ return this.market.getListings(worldId); }
  getMarketTrades(limit=25){ return this.market.getTrades(limit); }
  getNPCGridCoin(name:string){ const profile=this.profiles.get(name); return profile ? this.market.getBalance(profile.id) : 0; }
  buyNPCMarketListing(listingId:string,buyerName:string,quantity=1){
    const buyer=this.profiles.get(buyerName);
    if(!buyer) return null;
    const trade=this.market.buy(listingId,buyer.id,quantity);
    if(trade){
      const merchant=this.citizens.find(c=>this.profiles.get(c.name)?.id===trade.sellerId);
      if(merchant){
        merchant.merchantStock=Math.max(0,merchant.merchantStock-trade.quantity);
        merchant.root.userData.merchantStock=merchant.merchantStock;
      }
    }
    return trade;
  }
  collectMaterialDrop(id:string){ return this.materialDrops.collect(id); }
  awardNPCJobXP(name:string, amount:number, skill?:string){ const profile=this.profiles.get(name); return profile ? this.progression.award(profile, amount, skill) : null; }
  exportPersistentState(worldId?: string) {
    const citizens = this.citizens.filter(c => !worldId || c.world === worldId).map(c => {
      const profile = this.profiles.get(c.name);
      return {
        name: c.name,
        world: c.world,
        state: c.state,
        energy: c.energy,
        social: c.social,
        phase: c.phase,
        stateTimer: c.stateTimer,
        travelTimer: c.travelTimer,
        selectedDestination: c.selectedDestination,
        travelPurpose: c.travelPurpose,
        travelWorld: c.travelWorld,
        travelMode: c.travelMode,
        travelStage: c.travelStage,
        mealCooldown: c.mealCooldown,
        position: [c.root.position.x, c.root.position.y, c.root.position.z],
        profile: profile ? structuredClone(profile) : null,
      };
    });
    return {
      version: 2,
      worldId,
      citizens,
      relationships: this.relationships.snapshot().filter(r => !worldId || citizens.some(c => c.name === r.sourceId || c.name === r.targetId)),
    };
  }

  importPersistentState(raw: unknown, worldId: string) {
    if (!raw || typeof raw !== 'object') return;
    const state = raw as Record<string, unknown>;
    const citizens = Array.isArray(state.citizens) ? state.citizens as Array<Record<string, unknown>> : [];
    for (const record of citizens) {
      if (record.world !== worldId || typeof record.name !== 'string') continue;
      const citizen = this.citizens.find(c => c.name === record.name && c.world === worldId);
      if (!citizen) continue;
      if (typeof record.state === 'string') citizen.state = record.state as CitizenState;
      for (const key of ['energy','social','phase','stateTimer','travelTimer'] as const) {
        if (typeof record[key] === 'number' && Number.isFinite(record[key])) (citizen as any)[key] = record[key];
      }
      if (typeof record.selectedDestination === 'string') citizen.selectedDestination = record.selectedDestination;
      if (typeof record.travelWorld === 'string') citizen.travelWorld = record.travelWorld;
      if (typeof record.travelPurpose === 'string') citizen.travelPurpose = record.travelPurpose as Citizen['travelPurpose'];
      if (typeof record.travelMode === 'string') citizen.travelMode = record.travelMode as Citizen['travelMode'];
      if (typeof record.travelStage === 'string') citizen.travelStage = record.travelStage as Citizen['travelStage'];
      if (typeof record.mealCooldown === 'number' && Number.isFinite(record.mealCooldown)) citizen.mealCooldown = Math.max(0, record.mealCooldown);
      if (Array.isArray(record.position) && record.position.length === 3) {
        const p = record.position.map(Number);
        if (p.every(Number.isFinite)) citizen.root.position.set(p[0], p[1], p[2]);
      }
      if (record.profile && typeof record.profile === 'object') {
        const profile = record.profile as NPCProfileRecord;
        this.profiles.set(citizen.name, profile);
        if (!this.brains.has(citizen.name)) this.brains.set(citizen.name, new GridNpcBrain(profile.id, citizen.name));
        citizen.brain.hydrateMemories((profile.memories ?? []).map((summary, index) => ({
          id: profile.id + ':profile-memory:' + index,
          summary,
          eventType: 'profile',
          valence: 0,
          importance: .25,
          confidence: .7,
          createdAt: new Date().toISOString(),
        })));
        citizen.root.userData.npcProfile = profile;
        citizen.root.userData.inventory = profile.inventory;
        citizen.root.userData.jobProgression = profile.occupation;
      }
    }
    const relationships = Array.isArray(state.relationships) ? state.relationships as NPCRelationship[] : [];
    for (const rel of relationships) {
      if (rel.sourceId && rel.targetId) {
        const restored = this.relationships.connect(rel.sourceId, rel.targetId, rel.kind, 0);
        if (restored) Object.assign(restored, rel);
      }
    }
  }

  getWorkingCitizens(){return this.citizens.filter(c=>c.state==='WORK'||c.state==='GATHER').map(c=>({id:c.name,world:c.world,position:c.root.position.clone(),role:c.role}));}
}
