import * as THREE from 'three';
import type { EcologyWorld } from './CreatureEcologySystem';
import type { SocietySnapshot } from './NPCSocietySystem';

export type StoryKind = 'MEETING' | 'GROUP' | 'DISCOVERY' | 'CELEBRATION' | 'WORLD_EVENT';

export interface LocalStory {
  id: string;
  kind: StoryKind;
  title: string;
  text: string;
  world: EcologyWorld;
  participants: string[];
  age: number;
}

type Relationship = {
  a: string;
  b: string;
  affinity: number;
  meetings: number;
};

type CitizenSeed = { name: string; world: EcologyWorld; role: string };

const CITIZENS: CitizenSeed[] = [
  {name:'Mara',world:'HARBOR',role:'Navigator'},{name:'Iven',world:'HARBOR',role:'Navigator'},
  {name:'Sela',world:'GARDENS',role:'Gardener'},{name:'Tarin',world:'GARDENS',role:'Gardener'},
  {name:'Caro',world:'ARTS',role:'Artisan'},{name:'Veya',world:'ARTS',role:'Artisan'},
  {name:'Orin',world:'CITADEL',role:'Keeper'},{name:'Nara',world:'CITADEL',role:'Keeper'},
  {name:'Rook',world:'WILDS',role:'Ranger'},{name:'Edda',world:'WILDS',role:'Ranger'},
];

const STORY_LINES: Record<StoryKind, string[]> = {
  MEETING: ['crossed paths and stopped to talk.', 'recognized a familiar face and shared a local story.'],
  GROUP: ['formed a small traveling group.', 'left together to visit a nearby place.'],
  DISCOVERY: ['noticed something unusual and began investigating.', 'found a new detail worth sharing with the neighborhood.'],
  CELEBRATION: ['joined a spontaneous celebration.', 'turned a local signal into a reason to gather.'],
  WORLD_EVENT: ['responded to the changing world around them.', 'carried news of the current world event to their neighbors.'],
};

export class RelationshipStorySystem {
  readonly root = new THREE.Group();
  private relationships: Relationship[] = [];
  private stories: LocalStory[] = [];
  private timer = 6;
  private counter = 0;
  private lastEvent = 'QUIET';
  private snapshot = { relationships: 0, activeStories: 0, groups: 0, strongest: '' };

  constructor() {
    this.root.name = 'grid-relationship-stories';
    for (let i=0;i<CITIZENS.length;i++) {
      for (let j=i+1;j<CITIZENS.length;j++) {
        const a=CITIZENS[i], b=CITIZENS[j];
        if (a.world===b.world || (a.role===b.role && (i+j)%3===0)) {
          this.relationships.push({a:a.name,b:b.name,affinity:.45+((i+j)%4)*.08,meetings:0});
        }
      }
    }
  }

  private makeStory(kind:StoryKind, world:EcologyWorld, participants:string[], text:string) {
    const id='story-'+(++this.counter);
    const story={id,kind,title:kind.replace('_',' '),text,world,participants,age:0};
    this.stories.unshift(story);
    this.stories=this.stories.slice(0,8);
    const marker=new THREE.Group();
    marker.position.set((this.counter%5-2)*3, .15, (Math.floor(this.counter/5)%3-1)*3);
    marker.userData={gridObjectKind:'local-story',storyId:id,interactionName:story.title,story};
    const ring=new THREE.Mesh(new THREE.TorusGeometry(.32,.025,6,20),new THREE.MeshBasicMaterial({color:0xffd36a,transparent:true,opacity:.7}));
    ring.rotation.x=Math.PI/2;
    marker.add(ring);
    this.root.add(marker);
    window.setTimeout(()=>marker.removeFromParent(), 12000);
    return story;
  }

  update(delta:number, world:EcologyWorld, event:string, phase:string, society:SocietySnapshot, playerX=0, playerZ=0) {
    this.timer-=delta;
    for (const story of this.stories) story.age+=delta;
    for (const r of this.relationships) {
      const sameWorld=CITIZENS.find(c=>c.name===r.a)?.world===world && CITIZENS.find(c=>c.name===r.b)?.world===world;
      if (sameWorld) r.affinity=Math.min(1,r.affinity+delta*.0007);
    }

    const normalized=event.toUpperCase();
    if (normalized!==this.lastEvent) {
      this.lastEvent=normalized;
      if (normalized!=='QUIET') {
        const candidates=CITIZENS.filter(c=>c.world===world);
        if (candidates.length>=2) {
          const participants=candidates.slice(0,2).map(c=>c.name);
          this.makeStory('WORLD_EVENT',world,participants,participants[0]+' and '+participants[1]+' '+STORY_LINES.WORLD_EVENT[ this.counter%2 ]);
        }
      }
    }

    if (this.timer<=0) {
      this.timer=12+((this.counter*7)%9);
      const candidates=this.relationships.filter(r=>{
        const wa=CITIZENS.find(c=>c.name===r.a)?.world;
        const wb=CITIZENS.find(c=>c.name===r.b)?.world;
        return wa===world && wb===world;
      }).sort((a,b)=>b.affinity-a.affinity);
      const pair=candidates[0];
      if (pair) {
        pair.meetings++;
        pair.affinity=Math.min(1,pair.affinity+.08);
        const kind:StoryKind=pair.meetings%4===0?'GROUP':pair.meetings%3===0?'DISCOVERY':'MEETING';
        const line=STORY_LINES[kind][(pair.meetings+this.counter)%STORY_LINES[kind].length];
        this.makeStory(kind,world,[pair.a,pair.b],pair.a+' and '+pair.b+' '+line);
      }
    }

    const active=this.stories.filter(s=>s.age<20);
    const strongest=[...this.relationships].sort((a,b)=>b.affinity-a.affinity)[0];
    this.snapshot={relationships:this.relationships.length,activeStories:active.length,groups:this.stories.filter(s=>s.kind==='GROUP'&&s.age<30).length,strongest:strongest?strongest.a+' ↔ '+strongest.b:''};
    this.root.userData.stories=this.snapshot;
    this.root.userData.latestStory=this.stories[0] ?? null;
  }

  getLatestStory(){ return this.stories[0] ?? null; }
  getSnapshot(){ return this.snapshot; }
}
