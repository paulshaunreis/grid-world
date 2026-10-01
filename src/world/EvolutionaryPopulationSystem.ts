import * as THREE from 'three';
import { getWorlds } from './GridWorldRegistry';
import type { EcologyWorld } from './CreatureEcologySystem';
import type { LivingWorldSnapshot } from './GridLivingWorld';

export interface Genome {
  size:number; speed:number; social:number; curiosity:number;
  coldTolerance:number; heatTolerance:number; droughtTolerance:number; stormTolerance:number;
  aquaticAffinity:number; aerialAffinity:number; dietAffinity:number; predatorAffinity:number; pollinatorAffinity:number; defenseTolerance:number; colorShift:number;
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
  private readonly emergentVisuals=new Map<string,THREE.Object3D>();
  private elapsed=0;
  private phenotypeElapsed=0;
  private visualState=new Map<string,number>();

  constructor(){
    this.root.name='grid-evolutionary-populations';
    this.load();
    for(const world of getWorlds())this.registerWorld(world.id);
  }

  private key(world:string,species:string){return world+'::'+species;}
  private defaultGenome(seed:string):Genome{
    const h=hash(seed);
    return {size:.45+((h%35)/100),speed:.45+(((h>>3)%45)/100),social:.35+(((h>>5)%55)/100),curiosity:.4+(((h>>7)%50)/100),
      coldTolerance:.35+(((h>>9)%55)/100),heatTolerance:.35+(((h>>11)%55)/100),droughtTolerance:.35+(((h>>13)%55)/100),
      stormTolerance:.35+(((h>>15)%55)/100),aquaticAffinity:.25+(((h>>17)%65)/100),aerialAffinity:.25+(((h>>19)%65)/100),
      dietAffinity:.35+(((h>>21)%55)/100),predatorAffinity:.35+(((h>>23)%55)/100),pollinatorAffinity:.3+(((h>>25)%60)/100),defenseTolerance:.35+(((h>>27)%55)/100),colorShift:((h%100)/100)};
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

  registerWorld(world:EcologyWorld){this.registerSpecies(world,'native');this.registerSpecies(world,'wanderer');}
  registerSpecies(world:EcologyWorld,speciesId:string){
    const key=this.key(world,speciesId);
    if(this.populations.has(key))return;
    this.populations.set(key,{world,speciesId,generation:1,population:8,genome:this.defaultGenome(key),traitHistory:['Founding genome'],lineage:world+':'+speciesId,isolation:0});
  }

  private roleForSpecies(speciesId:string){
    const id=speciesId.toLowerCase();
    if(id.includes('moth')||id.includes('swallow')||id.includes('kite')||id.includes('pollin'))return 'pollinator';
    if(id.includes('wanderer')||id.includes('pred')||id.includes('hunter')||id.includes('stalker'))return 'predator';
    if(id.includes('fung')||id.includes('decomposer'))return 'decomposer';
    return 'herbivore';
  }
  private fitness(p:EvolvingPopulation,living:LivingWorldSnapshot,state:{fertility:number;biodiversity:number;water:number;environmentalStress:number},web?:Record<string,{population:number;health:number;niche:number;compatibility:number;pressure:number;generation:number}>){
    const heat=clamp((living.temperatureC-15)/20),cold=clamp((5-living.temperatureC)/20),drought=1-state.water,storm=living.weather==='STORM'?1:0;
    const role=this.roleForSpecies(p.speciesId),niche=web?.[role],plant=web?.plant;
    const roleFit=role==='predator' ? p.genome.predatorAffinity*(niche?.health??.5) : role==='pollinator' ? p.genome.pollinatorAffinity*(niche?.health??.5) : role==='decomposer' ? p.genome.defenseTolerance*(niche?.health??.5) : p.genome.dietAffinity*(plant?.health??.5);
    const pressurePenalty=(niche?.pressure??0)*.12;
    return clamp(.2*p.genome.social+.16*p.genome.curiosity+.15*(1-Math.abs(state.fertility-.65))+.1*(1-Math.abs(state.biodiversity-.65))+
      .08*(1-drought*(1-p.genome.droughtTolerance))+.07*(1-storm*(1-p.genome.stormTolerance))+.04*(1-heat*(1-p.genome.heatTolerance))+
      .03*(1-cold*(1-p.genome.coldTolerance))+.12*roleFit+.05*(niche?.compatibility??.5)-pressurePenalty-state.environmentalStress*.2);
  }
  private distance(a:Genome,b:Genome){
    const keys=(Object.keys(a) as (keyof Genome)[]);
    return keys.reduce((sum,key)=>sum+Math.abs(a[key]-b[key]),0)/keys.length;
  }
  private traits(g:Genome){
    const out:string[]=[];
    if(g.speed>.8)out.push('swift');if(g.droughtTolerance>.8)out.push('drought-adapted');if(g.stormTolerance>.8)out.push('storm-hardened');
    if(g.coldTolerance>.8)out.push('cold-adapted');if(g.heatTolerance>.8)out.push('heat-adapted');if(g.aerialAffinity>.8)out.push('aerial');if(g.aquaticAffinity>.8)out.push('aquatic');
    return out;
  }

  private syncPhenotypes(living:LivingWorldSnapshot){
    const scene=this.root.parent;
    if(!scene)return;
    const seen=new Set<string>();
    scene.traverse(object=>{
      if(object===this.root||object.userData.evolutionEmergent)return;
      if(object.userData.gridObjectKind!=='creature')return;
      const speciesId=String(object.userData.species??'');
      if(!speciesId)return;
      const world=String(object.userData.worldId??living.world);
      this.registerSpecies(world,speciesId);
      const p=this.getOrFallback(world,speciesId);
      if(!p)return;
      seen.add(world+'::'+speciesId);
      object.userData.evolution={generation:p.generation,lineage:p.lineage,traits:p.traitHistory.slice(-8)};
      object.userData.evolutionSpeed=THREE.MathUtils.lerp(.72,1.55,p.genome.speed);
      object.userData.evolutionSocial=p.genome.social;
      object.userData.evolutionCuriosity=p.genome.curiosity;
      object.userData.evolutionGenome=p.genome;
      const abundance=Math.sqrt(THREE.MathUtils.clamp(p.population/40,.05,4));
      const abundanceScale=THREE.MathUtils.clamp(.86+Math.log2(abundance+1)*.08,.82,1.12);
      object.userData.evolutionAbundance=p.population;
      object.userData.evolutionPopulationState=p.population<5?'SCARCE':p.population>32?'ABUNDANT':'STABLE';
      object.scale.setScalar(THREE.MathUtils.lerp(.86,1.18,p.genome.size)*abundanceScale);
      if(object.userData.evolutionColorApplied!==p.genome.colorShift){
        object.userData.evolutionColorApplied=p.genome.colorShift;
        object.traverse(child=>{
          const mesh=child as THREE.Mesh;
          const material=mesh.material as THREE.MeshStandardMaterial|undefined;
          if(material?.color){
            const hue=THREE.MathUtils.clamp((p.genome.colorShift-.5)*.12,-.06,.06);
            material.color.offsetHSL(hue,THREE.MathUtils.lerp(-.05,.12,p.genome.colorShift),THREE.MathUtils.lerp(-.06,.08,p.genome.colorShift));
          }
        });
      }
    });
    this.root.userData.trackedSpecies=[...seen];
  }

  private spawnEmergentVisual(species:EmergentSpecies){
    if(this.emergentVisuals.has(species.speciesId))return;
    const scene=this.root.parent;if(!scene)return;
    let parent:THREE.Object3D|undefined;
    scene.traverse(object=>{
      if(!parent&&object.userData.gridObjectKind==='creature'&&String(object.userData.species)===species.parentSpeciesId)parent=object;
    });
    if(!parent)return;
    const visual=parent.clone(true);
    visual.userData.evolutionEmergent=true;
    visual.userData.gridObjectKind='creature';
    visual.userData.species=species.speciesId;
    visual.userData.combatFaction='CREATURE';
    visual.userData.combatId=species.speciesId+':lineage';
    visual.userData.interactable=true;
    visual.userData.interactionName=species.name;
    visual.userData.evolution={generation:species.generation,lineage:species.lineage,traits:species.traitHistory.slice(-8)};
    visual.position.copy(parent.position).add(new THREE.Vector3(1.8,0,1.8));
    visual.scale.setScalar(THREE.MathUtils.lerp(.86,1.18,species.genome.size));
    visual.userData.evolutionSpeed=THREE.MathUtils.lerp(.72,1.55,species.genome.speed);
    visual.userData.emergentSignature=true;
    visual.traverse(child=>{
      const mesh=child as THREE.Mesh;
      const material=mesh.material as THREE.MeshStandardMaterial|undefined;
      if(material?.emissive){
        material.emissiveIntensity=.35;
        material.emissive.offsetHSL?.((species.genome.colorShift-.5)*.12,0,.05);
      }
    });
    scene.add(visual);
    this.emergentVisuals.set(species.speciesId,visual);
  }

  update(delta:number,living:LivingWorldSnapshot,state:{fertility:number;biodiversity:number;water:number;environmentalStress:number},web?:Record<string,{population:number;health:number;niche:number;compatibility:number;pressure:number;generation:number}>){
    this.elapsed+=delta;this.phenotypeElapsed+=delta;this.updateEmergentVisuals(delta);
    if(this.phenotypeElapsed>=1.5){this.phenotypeElapsed=0;this.syncPhenotypes(living);}
    if(this.elapsed<8)return;
    this.elapsed=0;this.registerWorld(living.world);
    for(const p of this.populations.values()){
      if(p.world!==living.world)continue;
      const fitness=this.fitness(p,living,state,web),pressure=1-fitness;
      const births=Math.max(0,Math.round(p.population*(.035+fitness*.025))),deaths=Math.max(0,Math.round(p.population*(.012+pressure*.035)));
      p.population=THREE.MathUtils.clamp(p.population+births-deaths,2,5000);
      p.isolation=clamp(p.isolation+(pressure>.58?.06:0)-(fitness>.7?.025:0));
      if(p.population>=14&&Math.random()<.28){
        p.genome={size:mutate(p.genome.size,.08),speed:mutate(p.genome.speed,.08),social:mutate(p.genome.social,.08),curiosity:mutate(p.genome.curiosity,.08),
          coldTolerance:mutate(p.genome.coldTolerance,.1),heatTolerance:mutate(p.genome.heatTolerance,.1),droughtTolerance:mutate(p.genome.droughtTolerance,.1),
          stormTolerance:mutate(p.genome.stormTolerance,.1),aquaticAffinity:mutate(p.genome.aquaticAffinity,.1),aerialAffinity:mutate(p.genome.aerialAffinity,.1),
          dietAffinity:mutate(p.genome.dietAffinity,.1),predatorAffinity:mutate(p.genome.predatorAffinity,.1),pollinatorAffinity:mutate(p.genome.pollinatorAffinity,.1),defenseTolerance:mutate(p.genome.defenseTolerance,.1),colorShift:mutate(p.genome.colorShift,.14)};
        p.generation++;
        const traits=this.traits(p.genome);
        if(traits.length)p.traitHistory=[...p.traitHistory,...traits].slice(-12);
        if(p.generation>=4&&p.isolation>.68&&this.distance(p.genome,this.defaultGenome(p.lineage))>.12&&!this.emergent.some(e=>e.lineage===p.lineage&&e.generation===p.generation)){
          const speciesId=p.speciesId+'-evo-'+p.generation;
          const emergent={world:p.world,parentSpeciesId:p.speciesId,speciesId,name:p.speciesId.replaceAll('-',' ')+' evolved form',generation:p.generation,genome:{...p.genome},traitHistory:[...p.traitHistory],lineage:p.lineage+':'+p.generation};
          this.emergent.push(emergent);this.spawnEmergentVisual(emergent);p.isolation=.18;
        }
      }
    }
    this.syncPhenotypes(living);
    this.save();
    this.root.userData.populations=[...this.populations.values()];
    this.root.userData.emergentSpecies=this.emergent;
  }

  private updateEmergentVisuals(delta:number){
    for(const [id,visual] of this.emergentVisuals){
      const species=this.emergent.find(item=>item.speciesId===id);
      if(!species)continue;
      const t=performance.now()*.00035+species.speciesId.length;
      visual.position.x+=Math.cos(t)*delta*species.genome.speed*.35;
      visual.position.z+=Math.sin(t*1.17)*delta*species.genome.speed*.28;
      visual.position.y+=Math.sin(t*1.8)*delta*.12;
    }
  }

  get(world:EcologyWorld,speciesId='native'){return this.populations.get(this.key(world,speciesId));}
  getOrFallback(world:EcologyWorld,speciesId:string){return this.populations.get(this.key(world,speciesId))??this.populations.get(this.key(world,speciesId.includes('native')?'native':'wanderer'));}
  getGenome(world:EcologyWorld,speciesId:string){const p=this.getOrFallback(world,speciesId);return p?{...p.genome,generation:p.generation,lineage:p.lineage}:undefined;}
  getAll(){return [...this.populations.values()];}
  consumeEmergentSpecies(){const next=[...this.emergent];this.emergent=[];return next;}
}
