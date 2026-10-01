import * as THREE from 'three';
import type { EcologyWorld } from './CreatureEcologySystem';
import type { LivingWorldSnapshot } from './GridLivingWorld';
import type { WorldEvolutionState } from './WorldEvolutionSystem';

export type EcologicalRole = 'PLANT'|'HERBIVORE'|'PREDATOR'|'POLLINATOR'|'DECOMPOSER';

export interface EcologicalPopulation {
  world:EcologyWorld;
  role:EcologicalRole;
  key:string;
  population:number;
  health:number;
  niche:number;
  generation:number;
  pressure:number;
}

const KEY='grid-world:ecological-web:v1';
const clamp=(n:number)=>THREE.MathUtils.clamp(n,0,1);

export class EcologicalWebSystem {
  readonly root=new THREE.Group();
  private populations=new Map<string,EcologicalPopulation>();
  private elapsed=0;

  constructor(){
    this.root.name='grid-ecological-web';
    this.load();
  }

  private id(world:EcologyWorld,role:EcologicalRole){return world+'::'+role;}
  private load(){
    try{
      const raw=localStorage.getItem(KEY);
      if(!raw)return;
      for(const p of JSON.parse(raw) as EcologicalPopulation[])if(p?.world&&p?.role)this.populations.set(this.id(p.world,p.role),p);
    }catch{}
  }
  private save(){try{localStorage.setItem(KEY,JSON.stringify([...this.populations.values()]));}catch{}}

  registerWorld(world:EcologyWorld){
    const defaults:[EcologicalRole,number,number][]=[
      ['PLANT',120,.7],['HERBIVORE',18,.62],['PREDATOR',5,.52],['POLLINATOR',12,.58],['DECOMPOSER',10,.66]
    ];
    for(const [role,population,niche] of defaults){
      const key=this.id(world,role);
      if(!this.populations.has(key))this.populations.set(key,{world,role,key,population,health:.68,niche,generation:1,pressure:0});
    }
  }

  update(delta:number,living:LivingWorldSnapshot,evolution:WorldEvolutionState){
    this.elapsed+=delta;
    this.registerWorld(living.world);
    const plant=this.populations.get(this.id(living.world,'PLANT'))!;
    const herb=this.populations.get(this.id(living.world,'HERBIVORE'))!;
    const predator=this.populations.get(this.id(living.world,'PREDATOR'))!;
    const pollinator=this.populations.get(this.id(living.world,'POLLINATOR'))!;
    const decomposer=this.populations.get(this.id(living.world,'DECOMPOSER'))!;

    const rain=living.weather==='RAIN'||living.weather==='MIST'||living.weather==='BLOOM';
    const drought=1-evolution.water;
    const storm=living.weather==='STORM';
    const plantGrowth=(evolution.fertility*.48+evolution.water*.28+pollinator.health*.12+decomposer.health*.12)-(drought*.24+evolution.environmentalStress*.22);
    plant.health=clamp(plant.health+(plantGrowth-.45)*delta/90);
    plant.population=THREE.MathUtils.clamp(plant.population*(1+(plant.health-.5)*delta/180),12,50000);

    const forage=clamp(plant.health*.7+plant.population/50000*.3);
    herb.pressure=clamp(predator.population/Math.max(herb.population,1)*.05+(1-forage)*.45);
    herb.health=clamp(herb.health+(forage-.5)*delta/80-herb.pressure*delta/100);
    herb.population=THREE.MathUtils.clamp(herb.population*(1+(herb.health-.5)*delta/120),2,5000);

    const prey=clamp(herb.health*.75+herb.population/5000*.25);
    predator.pressure=clamp((.55-prey)*.55);
    predator.health=clamp(predator.health+(prey-.5)*delta/95-predator.pressure*delta/110);
    predator.population=THREE.MathUtils.clamp(predator.population*(1+(predator.health-.5)*delta/140),1,1200);

    pollinator.pressure=clamp((.55-plant.health)*.45+(storm?.18:0));
    pollinator.health=clamp(pollinator.health+(plant.health-.5)*delta/85-pollinator.pressure*delta/120);
    pollinator.population=THREE.MathUtils.clamp(pollinator.population*(1+(pollinator.health-.5)*delta/150),2,3000);

    decomposer.health=clamp(decomposer.health+(plant.health*.4+herb.health*.25+predator.health*.15-.4)*delta/110);
    decomposer.population=THREE.MathUtils.clamp(decomposer.population*(1+(decomposer.health-.5)*delta/160),2,3000);

    for(const p of [plant,herb,predator,pollinator,decomposer]){
      p.generation=Math.max(1,Math.floor(1+(p.health*100)/15));
      p.niche=clamp(p.niche+(p.health-.5)*delta/180);
    }
    this.root.userData.activeWorld=living.world;
    this.root.userData.web={plant:plant.population,herbivore:herb.population,predator:predator.population,pollinator:pollinator.population,decomposer:decomposer.population};
    this.root.userData.niches=[plant,herb,predator,pollinator,decomposer];
    if(this.elapsed>=15){this.elapsed=0;this.save();}
    void rain;
  }

  get(world:EcologyWorld,role:EcologicalRole){return this.populations.get(this.id(world,role));}
  getAll(){return [...this.populations.values()];}
}
