import * as THREE from 'three';
import { createStarterPBRMaterial } from '../engine/GridPBRLibrary';
import type { WorldConsequenceSnapshot } from './WorldConsequenceSystem';
import { getWorlds } from './GridWorldRegistry';
import { deriveWorldDNA } from './WorldDNA';
import { getClimateProfile, type ClimateProfile } from './WorldClimate';
import type { WorldEvolutionState } from './WorldEvolutionSystem';

interface LivingPlant { root: THREE.Group; sway: number; }
interface LivingCreature { root: THREE.Group; phase: number; radius: number; speed: number; center: THREE.Vector3; habitat: 'HARBOR' | 'GARDENS' | 'CITADEL' | 'ARTS' | 'WILDS'; }
export type LivingSeason = 'SPRING' | 'SUMMER' | 'AUTUMN' | 'WINTER';
export type LivingWeather = 'CLEAR' | 'CLOUDY' | 'RAIN' | 'MIST' | 'STORM' | 'SNOW' | 'AURORA' | 'BLOOM' | 'WIND';
export interface LivingWorldSnapshot { world: string; event: string; phase: 'DAWN' | 'DAY' | 'DUSK' | 'NIGHT'; season: LivingSeason; weather: LivingWeather; temperatureC: number; humidity: number; windX: number; windZ: number; activity: number; ecology: number; }

export class GridLivingWorld {
  readonly root = new THREE.Group();
  private readonly plants: LivingPlant[] = [];
  private readonly creatures: LivingCreature[] = [];
  private readonly fireflies: THREE.Mesh[] = [];
  private readonly waterRipples: THREE.Mesh[] = [];
  private readonly weatherParticles: THREE.Mesh[] = [];
  private readonly weatherRoot = new THREE.Group();
  private time = 0;
  private worldEventSlot = -1;
  private worldEvent: 'quiet' | 'tide' | 'migration' | 'market' | 'bloom' | 'aurora' | 'storm' = 'quiet';
  private readonly eventSignal: THREE.Mesh;
  private activeWorld = 'HARBOR';
  private snapshot: LivingWorldSnapshot = { world: 'HARBOR', event: 'QUIET', phase: 'DAY', season: 'SPRING', weather: 'CLEAR', temperatureC: 15, humidity: .58, windX: 0, windZ: 0, activity: 1, ecology: 70 };

  constructor() {
    this.root.name = 'grid-living-world';
    this.createFlora();
    this.createWildlife();
    this.createFireflies();
    this.createWaterRipples();
    this.createAtmosphericStructures();
    this.createWeatherParticles();
    this.eventSignal = new THREE.Mesh(
      new THREE.TorusGeometry(1.15, .035, 8, 64),
      new THREE.MeshBasicMaterial({ color: 0x65dded, transparent: true, opacity: .42 }),
    );
    this.eventSignal.rotation.x = -Math.PI / 2;
    this.eventSignal.position.set(0, .18, 0);
    this.eventSignal.userData.gridObjectId = 'world-event-signal';
    this.eventSignal.userData.interactable = true;
    this.eventSignal.userData.interactionName = 'World Event Signal';
    this.root.add(this.eventSignal);
    this.weatherRoot.name = 'world-weather';
    this.root.add(this.weatherRoot);
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
        this.creatures.push({root,phase:index*.9,radius:2+index%3,speed:.16+(index%4)*.035,center:new THREE.Vector3(habitat.x,.02,habitat.z),habitat: i < 2 ? 'GARDENS' : index % 3 === 0 ? 'HARBOR' : 'WILDS'});
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

  private createWeatherParticles() {
    const geometry = new THREE.SphereGeometry(.018, 5, 5);
    for (let i = 0; i < 180; i++) {
      const particle = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: 0x9edfff, transparent: true, opacity: 0 }));
      particle.position.set(-52 + Math.random() * 104, 2 + Math.random() * 22, -52 + Math.random() * 104);
      particle.userData.baseY = particle.position.y;
      this.weatherRoot.add(particle);
      this.weatherParticles.push(particle);
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

  update(delta:number, playerX = 0, playerZ = 0, consequences?:WorldConsequenceSnapshot, evolution?:WorldEvolutionState) {
    this.time+=delta;
    const epochSeconds = Date.now() / 1000;
    const worlds = getWorlds();
    let nearest = Infinity;
    for (const candidate of worlds) {
      const distance = Math.hypot(playerX - candidate.center.x, playerZ - candidate.center.z);
      if (distance < nearest) { nearest = distance; this.activeWorld = candidate.id; }
    }
    const eventSlot = Math.floor(epochSeconds / 70);
    if (eventSlot !== this.worldEventSlot) {
      this.worldEventSlot = eventSlot;
      const worldDef = worlds.find(candidate => candidate.id === this.activeWorld);
      this.worldEvent = worldDef?.event ?? 'quiet';
      this.root.userData.worldEvent = this.worldEvent;
      this.root.userData.worldEventStartedAt = epochSeconds;
    }
    const eventPhase = (epochSeconds % 70) / 70;
    const localDay = ((epochSeconds % 86400) + 86400) % 86400;
    const phase: LivingWorldSnapshot['phase'] = localDay < 7 * 3600 ? 'DAWN' : localDay < 18 * 3600 ? 'DAY' : localDay < 20 * 3600 ? 'DUSK' : 'NIGHT';
    const worldDef = worlds.find(candidate => candidate.id === this.activeWorld);
    const dna = deriveWorldDNA(worldDef?.tags ?? []);
    const climate: ClimateProfile = getClimateProfile(dna.climate);
    const seasonIndex = Math.floor(((epochSeconds / 1800) + this.activeWorld.length * 7) % 4);
    const season: LivingSeason = ['SPRING','SUMMER','AUTUMN','WINTER'][seasonIndex] as LivingSeason;
    const seasonWave = Math.sin((epochSeconds / 1800) * Math.PI / 2 + seasonIndex);
    const temperatureC = climate.baseTemperatureC + climate.seasonalAmplitudeC * seasonWave * .55;
    const humidity = THREE.MathUtils.clamp(climate.baseHumidity + Math.sin(epochSeconds / 37 + this.activeWorld.length) * .08 + (this.worldEvent === 'storm' ? .14 : 0), 0, 1);
    const windStrength = .15 + dna.ecology.environmentalForces.length * .035 + (this.worldEvent === 'storm' ? .75 : this.worldEvent === 'migration' ? .32 : 0);
    const windX = Math.sin(epochSeconds / 19 + this.activeWorld.length) * windStrength;
    const windZ = Math.cos(epochSeconds / 23 + this.activeWorld.length * .7) * windStrength;
    const coldEnoughForSnow = temperatureC <= 2 && (climate.type === 'alpine' || climate.type === 'temperate' || climate.type === 'frontier');
    const wetEnoughForRain = humidity > .58 && climate.rainfallBias > .42;
    let weather: LivingWeather = 'CLEAR';
    if (this.worldEvent === 'storm') weather = 'STORM';
    else if (this.worldEvent === 'aurora') weather = 'AURORA';
    else if (this.worldEvent === 'bloom' && dna.ambientLife > 1) weather = 'BLOOM';
    else if (coldEnoughForSnow && wetEnoughForRain) weather = 'SNOW';
    else if (wetEnoughForRain) weather = humidity > .76 ? 'MIST' : 'RAIN';
    else if (Math.abs(windStrength) > .65) weather = 'WIND';
    else if (humidity > .55) weather = 'CLOUDY';
    const ecologyBase = Math.round((50 + climate.vegetationBias * 35 + dna.ambientLife * 8) * (.78 + (evolution?.biodiversity ?? .62) * .44);
    const activity = this.worldEvent === 'migration' ? 1.8 : this.worldEvent === 'bloom' ? 1.35 : this.worldEvent === 'storm' ? .72 : 1;
    this.snapshot = { world: this.activeWorld, event: this.worldEvent.toUpperCase(), phase, season, weather, temperatureC, humidity, windX, windZ, activity, ecology: THREE.MathUtils.clamp(ecologyBase, 0, 100) };
    const pressure = consequences?.pressure ?? 0;
    const stability = consequences?.stability ?? 1;
    const consequenceFactor = stability < .4 ? .7 : pressure > .6 ? 1.18 : 1;
    this.root.userData.worldActivity = this.snapshot.activity;
    this.root.userData.climate = { season, weather, temperatureC, humidity, windX, windZ, climateType: climate.type };
    this.root.userData.worldPulse = eventPhase;
    const eventColors: Record<typeof this.worldEvent, number> = {
      quiet: 0x65dded,
      tide: 0x65dded,
      migration: 0x9cf2c1,
      market: 0xffd36a,
      bloom: 0x8fe388,
      aurora: 0xc6a6ff,
      storm: 0x76b9ff,
    };
    const eventMaterial = this.eventSignal.material as THREE.MeshBasicMaterial;
    eventMaterial.color.setHex(eventColors[this.worldEvent]);
    eventMaterial.opacity = .26 + eventPhase * .34;
    const signalScale = this.worldEvent === 'storm' ? 1.15 : this.worldEvent === 'migration' ? 1.05 : 1;
    this.eventSignal.scale.setScalar(signalScale + Math.sin(this.time * 2.4) * .035);
    const weatherIntensity = weather === 'STORM' ? .95 : weather === 'RAIN' || weather === 'SNOW' ? .72 : weather === 'MIST' ? .4 : weather === 'WIND' ? .5 : weather === 'BLOOM' ? .18 : 0;
    for (let i = 0; i < this.weatherParticles.length; i++) {
      const particle = this.weatherParticles[i];
      const material = particle.material as THREE.MeshBasicMaterial;
      const active = weatherIntensity > 0 && i < Math.floor(this.weatherParticles.length * weatherIntensity);
      material.opacity = active ? (weather === 'SNOW' ? .58 : .38) : 0;
      if (active) {
        const fall = weather === 'SNOW' ? .7 : 2.8;
        particle.position.y -= fall * delta;
        particle.position.x += windX * .018;
        particle.position.z += windZ * .018;
        if (particle.position.y < .15) {
          particle.position.y = 12 + (i % 11);
          particle.position.x = playerX - 45 + (i * 17) % 90;
          particle.position.z = playerZ - 45 + (i * 29) % 90;
        }
        material.color.setHex(weather === 'SNOW' ? 0xe8f4ff : weather === 'MIST' ? 0xb8d6d8 : weather === 'BLOOM' ? 0xffb7d8 : 0x79cfff);
      }
    }

    for(let i=0;i<this.plants.length;i++){
      const p=this.plants[i];
      const bloom = this.worldEvent === 'bloom' ? .11 : stability < .4 ? .025 : .045 + (evolution?.fertility ?? .64) * .025;
      const windSway = Math.min(.18, Math.hypot(windX, windZ) * .045);
      const seasonalGrowth = (season === 'SPRING' ? 1.04 : season === 'WINTER' ? .92 : 1) * (.86 + (evolution?.fertility ?? .64) * .28);
      p.root.scale.y = THREE.MathUtils.lerp(p.root.scale.y, seasonalGrowth, Math.min(1, delta * .8));
      p.root.rotation.z=Math.sin(this.time*p.sway+i)*bloom + windSway * Math.sin(this.time*1.4+i);
      p.root.rotation.x=Math.cos(this.time*p.sway*.7+i)*.025 + windSway * Math.cos(this.time*1.1+i);
    }
    for(let i=0;i<this.creatures.length;i++){
      const c=this.creatures[i];
      const migration = c.habitat === this.activeWorld && this.worldEvent === 'migration' ? 1.8 : 1;
      const consequenceMigration = c.habitat === this.activeWorld ? consequenceFactor : 1;
      const angle=this.time*c.speed*migration*consequenceMigration+c.phase;
      c.root.position.x=c.center.x+Math.cos(angle)*c.radius;
      c.root.position.z=c.center.z+Math.sin(angle*1.17)*c.radius*.7;
      c.root.rotation.y=Math.atan2(Math.cos(angle*1.17),-Math.sin(angle))+Math.PI;
      const bob=Math.sin(this.time*3.4+c.phase)*.035;
      c.root.position.y=.02+bob;
    }
    for(let i=0;i<this.fireflies.length;i++){
      const f=this.fireflies[i];
      f.position.y += Math.sin(this.time*.6+i)*.0012;
      const fireflyMaterial = f.material as THREE.MeshBasicMaterial;
      const auroraBoost = this.worldEvent === 'aurora' ? .2 : 0;
      const pressureBoost = pressure > .55 ? .12 : 0;
      fireflyMaterial.opacity=Math.min(.95,.35+auroraBoost+pressureBoost+.35*(.5+.5*Math.sin(this.time*2.2+i)));
    }
    for(let i=0;i<this.waterRipples.length;i++){
      const r=this.waterRipples[i];
      const tidePulse = this.worldEvent === 'storm' || this.worldEvent === 'tide' ? .22 : 0;
      const s=.8+.35*(.5+.5*Math.sin(this.time*.8+i))+tidePulse;
      r.scale.setScalar(s);
      const rippleMaterial = r.material as THREE.MeshBasicMaterial;
      rippleMaterial.opacity=(.08+.1*(.5+.5*Math.sin(this.time*1.3+i)))*(stability<.4?.75:1);
    }
  }

  getSnapshot() { return this.snapshot; }
}
