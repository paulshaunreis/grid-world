import * as THREE from 'three';
import { getWorlds } from './GridWorldRegistry';
import type { EcologyWorld } from './CreatureEcologySystem';
import type { LivingWorldSnapshot } from './GridLivingWorld';

export interface Genome {
  size:number; speed:number; social:number; curiosity:number;
  coldTolerance:number; heatTolerance:number; droughtTolerance:number; stormTolerance:number;
  aquaticAffinity:number; aerialAffinity:number; colorShift:number;
}

export interface EvolvingPopulation {
  world:EcologyWorld; speciesId:string; generation:number; population:number;
  genome:Genome; traitHistory:string[]; lineage:string; isolation:number;
}

export interface EmergentSpecies {
  world:EcologyWorld; parentSpeciesId:string; speciesId:string; name:string;
  generation:number; genome:Genome; traitHistory:string[]; lineage:string;
}

const KEY='grid-world:evolutionary-populations:v2';
const clamp=(n:number)=>THREE.MathUtils.clamp(n,0,1);
const mutate=(n:number,amount:number)=>clamp(n+(Math.random()-.5)*amount);
const hash=(s:string)=>[...s].reduce((a,c)=>(a*31+c.charCodeAt(0))>>>0,7);

export class EvolutionaryPopulationSystem {
  readonly root=new THREE.Group();
  private populations=new Map<string,EvolvingPopulation>();
  private emergent:EmergentSpecies[]=[];
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
      size:.45+((h%35)/100),speed:.45+(((h>>3)%45)/100),social:.35+(((h>>5)%55)/100),
      curiosity:.4+(((h>>7)%50)/100),coldTolerance:.35+(((h>>9)%55)/100),heatTolerance:.35+(((h>>11)%55)/100),
      droughtTolerance:.35+(((h>>13)%55)/100),stormTolerance:.35+(((h>>15)%55)/100),
      aquaticAffinity:.25+(((h>>17)%65)/100),aerialAffinity:.25+(((h>>19)%65)/100),colorShift:((h%100)/100),
    };
  }
  private load(){
    try{
      const raw=localStorage.getItem(KEY);
      if(raw){
        const parsed=JSON.parse(raw) as EvolvingPopulation[];
        for(const p of parsed??[])if(p?.world&&p?.speciesId)this.populations.set(this.key(p.world,p.speciesId),{...p,lineage:p.lineage??p.speciesId,isolation:p.isolation??0});
      }
    }catch{}
  }
  private save(){try{localStorage.setItem(KEY,JSON.stringify([...this.populations.values()]));}catch{}}

  registerWorld(world:EcologyWorld){
    this.registerSpecies(world,'native');
    this.registerSpecies(world,'wanderer');
  }
  registerSpecies(world:EcologyWorld,speciesId:string){
    const key=this.key(world,speciesId);
    if(this.populations.has(key))return;
    this.populations.set(key,{world,speciesId,generation:1,population:8,genome:this.defaultGenome(key),traitHistory:['Founding genome'],lineage:world+':'+speciesId,isolation:0});
  }

  private fitness(p:EvolvingPopulation,living:LivingWorldSnapshot,state:{fertility:number;biodiversity:number;water:number;environmentalStress:number}){
    const heat=clamp((living.temperatureC-15)/20),cold=clamp((5-living.temperatureC)/20),drought=1-state.water,storm=living.weather==='STORM'?1:0;
    return clamp(.25*p.genome.social+.2*p.genome.curiosity+.18*(1-Math.abs(state.fertility-.65))+.12*(1-Math.abs(state.biodiversity-.65))+
      .1*(1-drought*(1-p.genome.droughtTolerance))+.08*(1-storm*(1-p.genome.stormTolerance))+.04*(1-heat*(1-p.genome.heatTolerance))+
      .03*(1-cold*(1-p.genome.coldTolerance))-state.environmentalStress*.2);
  }

  private distance(a:Genome,b:Genome){
    const keys=(Object.keys(a) as (keyof Genome)[]);
    return keys.reduce((sum,key)=>sum+Math.abs(a[key]-b[key]),0)/keys.length;
  }

  update(delta:number,living:LivingWorldSnapshot,state:{fertility:number;biodiversity:number;water:number;environmentalStress:number}){
    this.elapsed+=delta;if(this.elapsed<8)return;this.elapsed=0;this.registerWorld(living.world);
    for(const p of this.populations.values()){
      if(p.world!==living.world)continue;
      const fitness=this.fitness(p,living,state),pressure=1-fitness;
      const births=Math.max(0,Math.round(p.population*(.035+fitness*.025))),deaths=Math.max(0,Math.round(p.population*(.012+pressure*.035)));
      p.population=THREE.MathUtils.clamp(p.population+births-deaths,2,5000);
      p.isolation=clamp(p.isolation + (pressure>.58?.06:0) - (fitness>.7?.025:0));

      if(p.population>=14&&Math.random()<.28){
        const child:Genome={
          size:mutate(p.genome.size,.08),speed:mutate(p.genome.speed,.08),social:mutate(p.genome.social,.08),curiosity:mutate(p.genome.curiosity,.08),
          coldTolerance:mutate(p.genome.coldTolerance,.1),heatTolerance:mutate(p.genome.heatTolerance,.1),droughtTolerance:mutate(p.genome.droughtTolerance,.1),
          stormTolerance:mutate(p.genome.stormTolerance,.1),aquaticAffinity:mutate(p.genome.aquaticAffinity,.1),aerialAffinity:mutate(p.genome.aerialAffinity,.1),colorShift:mutate(p.genome.colorShift,.14)
        };
        p.genome=child;p.generation++;
        const traits:string[]=[];
        if(p.genome.speed>.8)traits.push('swift');if(p.genome.droughtTolerance>.8)traits.push('drought-adapted');if(p.genome.stormTolerance>.8)traits.push('storm-hardened');
        if(p.genome.coldTolerance>.8)traits.push('cold-adapted');if(p.genome.heatTolerance>.8)traits.push('heat-adapted');if(p.genome.aerialAffinity>.8)traits.push('aerial');if(p.genome.aquaticAffinity>.8)traits.push('aquatic');
        if(traits.length)p.traitHistory=[...p.traitHistory,...traits].slice(-12);

        if(p.generation>=4&&p.isolation>.68&&this.distance(p.genome,this.defaultGenome(p.lineage))>.12&&!this.emergent.some(e=>e.lineage===p.lineage&&e.generation===p.generation)){
          const speciesId=p.speciesId+'-evo-'+p.generation;
          this.emergent.push({world:p.world,parentSpeciesId:p.speciesId,speciesId,name:p.speciesId.replaceAll('-',' ')+' evolved form',generation:p.generation,genome:{...p.genome},traitHistory:[...p.traitHistory],lineage:p.lineage+':'+p.generation});
          p.isolation=.18;
        }
      }
    }
    this.save();
    this.root.userData.populations=[...this.populations.values()];
    this.root.userData.emergentSpecies=this.emergent;
  }

  get(world:EcologyWorld,speciesId='native'){return this.populations.get(this.key(world,speciesId));}
  getOrFallback(world:EcologyWorld,speciesId:string){return this.populations.get(this.key(world,speciesId))??this.populations.get(this.key(world,speciesId.includes('native')?'native':'wanderer'));}
  getGenome(world:EcologyWorld,speciesId:string){const p=this.getOrFallback(world,speciesId);return p?{...p.genome,generation:p.generation,lineage:p.lineage}:undefined;}
  getAll(){return [...this.populations.values()];}
  consumeEmergentSpecies(){const next=[...this.emergent];this.emergent=[];return next;}
}
