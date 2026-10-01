import * as THREE from 'three';
import { getWorlds } from './GridWorldRegistry';
import type { EcologyWorld } from './CreatureEcologySystem';
import type { LivingWorldSnapshot } from './GridLivingWorld';
import type { WorldConsequenceSnapshot } from './WorldConsequenceSystem';

export interface Genome {
  size:number;
  speed:number;
  social:number;
  curiosity:number;
  coldTolerance:number;
  heatTolerance:number;
  droughtTolerance:number;
  stormTolerance:number;
  aquaticAffinity:number;
  aerialAffinity:number;
  colorShift:number;
}

export interface EvolvingPopulation {
  world:EcologyWorld;
  speciesId:string;
  generation:number;
  population:number;
  genome:Genome;
  traitHistory:string[];
}

const KEY='grid-world:evolutionary-populations:v1';
const clamp=(n:number)=>THREE.MathUtils.clamp(n,0,1);
const mutate=(n:number,amount:number)=>clamp(n+(Math.random()-.5)*amount);
const hash=(s:string)=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);

export class EvolutionaryPopulationSystem {
  readonly root=new THREE.Group();
  private populations=new Map<string,EvolvingPopulation>();
  private elapsed=0;

  constructor(){
    this.root.name='grid-evolutionary-populations';
    this.load();
    for(const world of getWorlds()) this.registerWorld(world.id);
  }

  private key(world:string,species:string){return world+'::'+species;}

  private defaultGenome(seed:string):Genome{
    const h=hash(seed);
    return {
      size:.45+((h%35)/100),
      speed:.45+(((h>>3)%45)/100),
      social:.35+(((h>>5)%55)/100),
      curiosity:.4+(((h>>7)%50)/100),
      coldTolerance:.35+(((h>>9)%55)/100),
      heatTolerance:.35+(((h>>11)%55)/100),
      droughtTolerance:.35+(((h>>13)%55)/100),
      stormTolerance:.35+(((h>>15)%55)/100),
      aquaticAffinity:.25+(((h>>17)%65)/100),
      aerialAffinity:.25+(((h>>19)%65)/100),
      colorShift:((h%100)/100),
    };
  }

  private load(){
    try{
      const raw=localStorage.getItem(KEY);
      if(raw){
        const parsed=JSON.parse(raw) as EvolvingPopulation[];
        for(const p of parsed??[]) if(p?.world&&p?.speciesId) this.populations.set(this.key(p.world,p.speciesId),p);
      }
    }catch{}
  }

  private save(){
    try{localStorage.setItem(KEY,JSON.stringify([...this.populations.values()]));}catch{}
  }

  registerWorld(world:EcologyWorld){
    const ids=['native','wanderer'];
    for(const speciesId of ids){
      const key=this.key(world,speciesId);
      if(!this.populations.has(key)){
        this.populations.set(key,{
          world,speciesId,generation:1,population:8,
          genome:this.defaultGenome(key),traitHistory:['Founding genome'],
        });
      }
    }
  }

  private fitness(p:EvolvingPopulation,living:LivingWorldSnapshot,state:{fertility:number;biodiversity:number;water:number;environmentalStress:number}){
    const heat=clamp((living.temperatureC-15)/20);
    const cold=clamp((5-living.temperatureC)/20);
    const drought=1-state.water;
    const storm=living.weather==='STORM'?1:0;
    return clamp(
      .25*p.genome.social + .2*p.genome.curiosity +
      .18*(1-Math.abs(state.fertility-.65)) +
      .12*(1-Math.abs(state.biodiversity-.65)) +
      .1*(1-drought*p.genome.droughtTolerance) +
      .08*(1-storm*(1-p.genome.stormTolerance)) +
      .04*(1-heat*(1-p.genome.heatTolerance)) +
      .03*(1-cold*(1-p.genome.coldTolerance)) -
      state.environmentalStress*.2
    );
  }

  update(delta:number,living:LivingWorldSnapshot,state:{fertility:number;biodiversity:number;water:number;environmentalStress:number}){
    this.elapsed+=delta;
    if(this.elapsed<8)return;
    this.elapsed=0;
    this.registerWorld(living.world);

    for(const p of this.populations.values()){
      if(p.world!==living.world)continue;
      const fitness=this.fitness(p,living,state);
      const pressure=1-fitness;
      const births=Math.max(0,Math.round(p.population*(.035+fitness*.025)));
      const deaths=Math.max(0,Math.round(p.population*(.012+pressure*.035)));
      p.population=THREE.MathUtils.clamp(p.population+births-deaths,2,5000);

      if(p.population>=14 && Math.random()<.28){
        const child:{genome:Genome}={
          genome:{
            size:mutate(p.genome.size,.08),
            speed:mutate(p.genome.speed,.08),
            social:mutate(p.genome.social,.08),
            curiosity:mutate(p.genome.curiosity,.08),
            coldTolerance:mutate(p.genome.coldTolerance,.1),
            heatTolerance:mutate(p.genome.heatTolerance,.1),
            droughtTolerance:mutate(p.genome.droughtTolerance,.1),
            stormTolerance:mutate(p.genome.stormTolerance,.1),
            aquaticAffinity:mutate(p.genome.aquaticAffinity,.1),
            aerialAffinity:mutate(p.genome.aerialAffinity,.1),
            colorShift:mutate(p.genome.colorShift,.14),
          }
        };
        p.genome=child.genome;
        p.generation++;
        const traits:string[]=[];
        if(p.genome.speed>.8)traits.push('swift');
        if(p.genome.droughtTolerance>.8)traits.push('drought-adapted');
        if(p.genome.stormTolerance>.8)traits.push('storm-hardened');
        if(p.genome.coldTolerance>.8)traits.push('cold-adapted');
        if(p.genome.heatTolerance>.8)traits.push('heat-adapted');
        if(p.genome.aerialAffinity>.8)traits.push('aerial');
        if(p.genome.aquaticAffinity>.8)traits.push('aquatic');
        if(traits.length)p.traitHistory=[...p.traitHistory,...traits].slice(-12);
      }
    }
    this.save();
    this.root.userData.populations=[...this.populations.values()];
  }

  get(world:EcologyWorld,speciesId='native'){return this.populations.get(this.key(world,speciesId));}
  getAll(){return [...this.populations.values()];}
}
