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
  private hud!: HTMLDivElement;
  private hudHealth!: HTMLDivElement;
  private hudTarget!: HTMLDivElement;
  private hudMode!: HTMLDivElement;
  private hudFeed!: HTMLDivElement;
  private arenaRoot=new THREE.Group();
  private arenaPulse=0;
  private cooldownRemaining=0;
  private cooldownTotal=.8;
  private fxRoot=new THREE.Group();
  private lastHealth=100;
  private lastTargetHealth=0;

  constructor(){
    this.root.name='grid-combat-system';
    this.root.userData.security='server-authoritative combat required for multiplayer';
    this.buildArena();
    this.buildHud();
  }

  private buildArena(){
    this.arenaRoot.name='pvp-arena-visuals';
    const center=new THREE.Vector3(-22,0,-4);
    for(let i=0;i<3;i++){
      const ring=new THREE.Mesh(
        new THREE.TorusGeometry(7+i*3.2,.035+i*.012,8,96),
        new THREE.MeshBasicMaterial({color:0x9f7cff,transparent:true,opacity:.18-i*.035})
      );
      ring.rotation.x=Math.PI/2;
      ring.position.copy(center);
      ring.position.y=.08+i*.012;
      this.arenaRoot.add(ring);
    }
    for(const x of [-28,-16]){
      for(const z of [-10,2]){
        const pylon=new THREE.Mesh(
          new THREE.CylinderGeometry(.16,.24,2.8,8),
          new THREE.MeshBasicMaterial({color:0x7e6cff,transparent:true,opacity:.45})
        );
        pylon.position.set(x,1.4,z);
        this.arenaRoot.add(pylon);
      }
    }
    this.root.add(this.arenaRoot);
    this.fxRoot.name='combat-feedback-vfx';
    this.root.add(this.fxRoot);
  }

  private buildHud(){
    this.hud=document.createElement('div');
    this.hud.className='grid-combat-hud';
    this.hud.style.cssText='position:fixed;right:26px;top:calc(50% - 170px);width:250px;pointer-events:none;z-index:40;font-family:IBM Plex Mono,monospace;color:#eff8ff;opacity:.92;';
    this.hud.innerHTML=`
      <div style="padding:10px 12px;border:1px solid rgba(120,220,255,.22);border-left:2px solid rgba(120,220,255,.78);background:rgba(3,9,16,.48);backdrop-filter:blur(12px);box-shadow:0 12px 40px rgba(0,0,0,.2)">
        <div style="display:flex;justify-content:space-between;gap:10px;font-size:9px;letter-spacing:.13em;opacity:.72"><span>COMBAT LINK</span><span data-combat-mode>PVE</span></div>
        <div style="margin-top:8px;font-size:9px;letter-spacing:.1em;opacity:.56">VITALS</div>
        <div style="height:5px;margin-top:5px;border:1px solid rgba(120,220,255,.14);background:rgba(0,0,0,.22)"><div data-combat-health style="height:100%;width:100%;background:linear-gradient(90deg,rgba(90,255,190,.85),rgba(120,220,255,.55));transition:width .15s"></div></div>
        <div data-combat-target style="margin-top:9px;font-size:10px;letter-spacing:.08em;color:rgba(235,245,255,.72)">NO TARGET</div>
        <div data-combat-feed style="margin-top:7px;font-size:8px;line-height:1.45;color:rgba(220,235,245,.5)">PVE · CREATURES / EVENTS</div>
      </div>`;
    document.body.appendChild(this.hud);
    this.hudHealth=this.hud.querySelector('[data-combat-health]') as HTMLDivElement;
    this.hudTarget=this.hud.querySelector('[data-combat-target]') as HTMLDivElement;
    this.hudMode=this.hud.querySelector('[data-combat-mode]') as HTMLDivElement;
    this.hudFeed=this.hud.querySelector('[data-combat-feed]') as HTMLDivElement;
  }

  private updateHud(){
    const max=Math.max(1,this.snapshot.playerMaxHealth);
    const pct=Math.max(0,Math.min(100,this.snapshot.playerHealth/max*100));
    this.hudHealth.style.width=`${pct}%`;
    this.hudMode.textContent=this.snapshot.mode;
    this.hudTarget.textContent=this.snapshot.target
      ? `TARGET · ${this.snapshot.target} · ${Math.max(0,Math.round(this.snapshot.targetHealth))} HP`
      : 'NO TARGET';
    const state=this.snapshot.mode==='SAFE' ? 'SAFE · BUILD / SOCIAL / CREATE'
      : this.snapshot.mode==='PVP' ? 'PVP ARENA · SERVER VALIDATED'
      : 'PVE · CREATURES / EVENTS';
    this.hudFeed.textContent=`${state} · K ${this.snapshot.kills} · D ${this.snapshot.defeats} · CD ${this.cooldownRemaining>0?this.cooldownRemaining.toFixed(1)+'s':'READY'}`;
    this.hud.style.opacity=this.snapshot.mode==='SAFE' ? '.68' : '.94';
  }

  setMode(mode:CombatMode){this.mode=mode;this.root.userData.mode=mode;this.updateHud();}
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
    this.cooldownRemaining=a.attackCooldown;
    this.cooldownTotal=a.attackCooldown;
    t.health=Math.max(0,t.health-a.damage);
    this.spawnHitFx(t.root.position, false);
    t.invulnerableUntil=this.now+.18;
    t.root.userData.health=t.health;
    this.recentDamage=a.damage;
    if(t.health<=0){
      this.spawnHitFx(t.root.position, true);
      this.defeat(t,a);
    }
    return true;
  }

  private spawnHitFx(position:THREE.Vector3, defeat:boolean){
    const group=new THREE.Group();
    group.position.copy(position);
    const ring=new THREE.Mesh(
      new THREE.TorusGeometry(defeat?.7:.42,.035,8,32),
      new THREE.MeshBasicMaterial({color:defeat?0xffd36a:0x7fe9ff,transparent:true,opacity:.9})
    );
    ring.rotation.x=Math.PI/2;
    group.add(ring);
    for(let i=0;i<6;i++){
      const shard=new THREE.Mesh(new THREE.BoxGeometry(.035,.035,defeat?.42:.24),new THREE.MeshBasicMaterial({color:defeat?0xffd36a:0x7fe9ff,transparent:true,opacity:.85}));
      const a=i*Math.PI/3;
      shard.position.set(Math.cos(a)*.12,.15,Math.sin(a)*.12);
      shard.userData.vx=Math.cos(a)*(defeat?.9:.55);
      shard.userData.vz=Math.sin(a)*(defeat?.9:.55);
      group.add(shard);
    }
    group.userData.life=defeat?.55:.32;
    this.fxRoot.add(group);
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
    this.now+=dt;
    this.recentDamage*=Math.max(0,1-dt*5);
    this.cooldownRemaining=Math.max(0,this.cooldownRemaining-dt);
    for(const fx of [...this.fxRoot.children]){
      const life=Number(fx.userData.life??0)-dt;
      fx.userData.life=life;
      fx.scale.multiplyScalar(1+dt*3);
      for(const child of fx.children){
        const mesh=child as THREE.Mesh;
        mesh.position.y+=dt*(.35+Number(mesh.userData.vz??0)*.08);
        mesh.position.x+=dt*Number(mesh.userData.vx??0);
        mesh.position.z+=dt*Number(mesh.userData.vz??0);
        const mat=mesh.material as THREE.MeshBasicMaterial;
        mat.opacity=Math.max(0,life*2.2);
      }
      if(life<=0)this.fxRoot.remove(fx);
    }
    for(const c of this.combatants.values()){
      c.attackTimer=Math.max(0,c.attackTimer-dt);
      if(!c.alive&&this.now>=c.respawnAt)this.respawn(c);
    }
    const p=this.combatants.get(playerId);
    const t=this.combatants.get(this.targetId);
    this.snapshot={mode:this.mode,inCombat:Boolean(p&&t&&p.alive&&t.alive&&p.root.position.distanceTo(t.root.position)<12),playerHealth:p?.health??0,playerMaxHealth:p?.maxHealth??0,target:t?.id??'',targetHealth:t?.health??0,recentDamage:this.recentDamage,kills:this.kills,defeats:this.defeats};
    this.root.userData.combat=this.snapshot;
    if(this.snapshot.playerHealth<this.lastHealth) this.spawnHitFx(p?.root.position??new THREE.Vector3(), false);
    if(this.snapshot.targetHealth<this.lastTargetHealth && t) this.spawnHitFx(t.root.position, false);
    this.lastHealth=this.snapshot.playerHealth;
    this.lastTargetHealth=this.snapshot.targetHealth;
    this.updateHud();
    this.arenaRoot.visible=this.mode==='PVP';
    this.arenaPulse+=dt;
    const rings=this.arenaRoot.children.filter(child=>child instanceof THREE.Mesh).slice(0,3) as THREE.Mesh[];
    rings.forEach((ring,index)=>{ring.rotation.z=this.arenaPulse*(.05+index*.02);const material=ring.material as THREE.MeshBasicMaterial;material.opacity=(this.mode==='PVP' ? .13 : .02)+Math.sin(this.arenaPulse*2+index)*.035;});
  }

  applyAuthoritativeHealth(id:string, health:number) {
    const combatant=this.combatants.get(id);
    if (!combatant) return;
    combatant.health=Math.max(0,Math.min(combatant.maxHealth,health));
    combatant.root.userData.health=combatant.health;
    if (combatant.health<=0) combatant.alive=false;
    this.updateHud();
  }

  applyAuthoritativeCreatureState(id:string, health:number, maxHealth:number, alive:boolean){
    const root=this.root.parent?.getObjectByProperty('userData.combatId',id);
    if(root){
      root.userData.health=Math.max(0,Math.min(maxHealth,health));
      root.userData.maxHealth=maxHealth;
      root.visible=alive && health>0;
    }
    this.updateHud();
  }

  getSnapshot(){return this.snapshot;}
}
