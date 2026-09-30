import * as THREE from 'three';

export type CombatMode='PVE'|'PVP'|'SAFE';
export type CombatFaction='PLAYER'|'NPC'|'CREATURE'|'TEAM'|'WORLD';

export interface Combatant {
  id:string;
  faction:CombatFaction;
  root:THREE.Object3D;
  maxHealth:number;
  health:number;
  damage:number;
  range:number;
  attackCooldown:number;
  attackTimer:number;
  invulnerableUntil:number;
  alive:boolean;
  respawnAt:number;
  respawnPosition:THREE.Vector3;
}

export interface CombatSnapshot {
  mode:CombatMode;
  inCombat:boolean;
  playerHealth:number;
  playerMaxHealth:number;
  target:string;
  targetHealth:number;
  recentDamage:number;
  kills:number;
  defeats:number;
}

const HOSTILE_PVE: Record<CombatFaction,Set<CombatFaction>>={
  PLAYER:new Set(['CREATURE']),
  NPC:new Set(['CREATURE']),
  CREATURE:new Set(['PLAYER','NPC','TEAM']),
  TEAM:new Set(['CREATURE']),
  WORLD:new Set(),
};

export class CombatSystem {
  readonly root=new THREE.Group();
  private combatants=new Map<string,Combatant>();
  private mode:CombatMode='PVE';
  private now=0;
  private targetId='';
  private recentDamage=0;
  private kills=0;
  private defeats=0;
  private snapshot:CombatSnapshot={mode:'PVE',inCombat:false,playerHealth:100,playerMaxHealth:100,target:'',targetHealth:0,recentDamage:0,kills:0,defeats:0};

  constructor(){
    this.root.name='grid-combat-system';
    this.root.userData.security='server-authoritative combat required for multiplayer';
  }

  setMode(mode:CombatMode){this.mode=mode;this.root.userData.mode=mode;}
  getMode(){return this.mode;}

  register(def:{id:string;faction:CombatFaction;root:THREE.Object3D;maxHealth?:number;damage?:number;range?:number;respawnPosition?:THREE.Vector3}){
    const maxHealth=def.maxHealth??100;
    this.combatants.set(def.id,{id:def.id,faction:def.faction,root:def.root,maxHealth,health:maxHealth,damage:def.damage??10,range:def.range??2.4,attackCooldown:.8,attackTimer:0,invulnerableUntil:0,alive:true,respawnAt:0,respawnPosition:def.respawnPosition?.clone()??def.root.position.clone()});
    def.root.userData.combatId=def.id;
    def.root.userData.combatFaction=def.faction;
    def.root.userData.health=maxHealth;
  }

  unregister(id:string){this.combatants.delete(id);if(this.targetId===id)this.targetId='';}
  syncScene(scene:THREE.Object3D){
    scene.traverse(obj=>{
      const id=String(obj.userData.combatId??'');
      const faction=obj.userData.combatFaction as CombatFaction|undefined;
      if(id&&faction&&!this.combatants.has(id))this.register({id,faction,root:obj,maxHealth:Number(obj.userData.maxHealth??100),damage:Number(obj.userData.damage??10),respawnPosition:obj.position});
    });
  }
  selectNearest(attackerId:string,maxDistance=10){
    const a=this.combatants.get(attackerId);if(!a)return '';
    let best='',distance=maxDistance;
    for(const t of this.combatants.values()){
      if(t.id===attackerId||!t.alive||!this.canDamage(attackerId,t.id))continue;
      const d=a.root.position.distanceTo(t.root.position);if(d<distance){distance=d;best=t.id;}
    }
    if(best)this.targetId=best;
    return best;
  }

  canDamage(attackerId:string,targetId:string){
    if(this.mode==='SAFE') return false;
    const a=this.combatants.get(attackerId),t=this.combatants.get(targetId);
    if(!a||!t||!a.alive||!t.alive||a.id===t.id)return false;
    if(this.mode==='PVP' && (a.faction==='PLAYER'||a.faction==='TEAM') && (t.faction==='PLAYER'||t.faction==='TEAM')) return true;
    if(this.mode==='PVP' && a.faction==='PLAYER' && t.faction==='CREATURE') return true;
    return this.mode==='PVE' && (HOSTILE_PVE[a.faction]?.has(t.faction)??false);
  }

  selectTarget(targetId:string){
    const target=this.combatants.get(targetId);
    if(target?.alive)this.targetId=targetId;
  }

  attack(attackerId:string,targetId=this.targetId){
    const a=this.combatants.get(attackerId),t=this.combatants.get(targetId);
    if(!a||!t||!this.canDamage(attackerId,targetId)||a.attackTimer>0||this.now<a.invulnerableUntil)return false;
    if(a.root.position.distanceTo(t.root.position)>a.range+1.2)return false;
    a.attackTimer=a.attackCooldown;
    t.health=Math.max(0,t.health-a.damage);
    t.invulnerableUntil=this.now+.18;
    t.root.userData.health=t.health;
    this.recentDamage=a.damage;
    if(t.health<=0)this.defeat(t,a);
    return true;
  }

  private defeat(target:Combatant,killer:Combatant){
    target.alive=false;
    target.root.visible=false;
    target.respawnAt=this.now+(target.faction==='CREATURE'?6:8);
    if(killer.faction==='PLAYER'||killer.faction==='TEAM')this.kills++;
    if(target.faction==='PLAYER')this.defeats++;
  }

  private respawn(c:Combatant){
    c.health=c.maxHealth;c.alive=true;c.root.position.copy(c.respawnPosition);c.root.visible=true;c.root.userData.health=c.health;
  }

  update(dt:number,playerId='player'){
    this.now+=dt;this.recentDamage*=Math.max(0,1-dt*5);
    for(const c of this.combatants.values()){
      c.attackTimer=Math.max(0,c.attackTimer-dt);
      if(!c.alive&&this.now>=c.respawnAt)this.respawn(c);
    }
    const p=this.combatants.get(playerId);
    const t=this.combatants.get(this.targetId);
    this.snapshot={mode:this.mode,inCombat:Boolean(p&&t&&p.alive&&t.alive&&p.root.position.distanceTo(t.root.position)<12),playerHealth:p?.health??0,playerMaxHealth:p?.maxHealth??0,target:t?.id??'',targetHealth:t?.health??0,recentDamage:this.recentDamage,kills:this.kills,defeats:this.defeats};
    this.root.userData.combat=this.snapshot;
  }

  applyAuthoritativeHealth(id:string, health:number) {
    const combatant=this.combatants.get(id);
    if (!combatant) return;
    combatant.health=Math.max(0,Math.min(combatant.maxHealth,health));
    combatant.root.userData.health=combatant.health;
    if (combatant.health<=0) combatant.alive=false;
  }

  getSnapshot(){return this.snapshot;}
}
