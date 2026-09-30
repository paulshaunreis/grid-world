import * as THREE from 'three';
import type { EcologyWorld } from './CreatureEcologySystem';
import type { SocietySnapshot } from './NPCSocietySystem';
import type { LocalStory } from './RelationshipStorySystem';
import { QuestSystem, type Quest } from './QuestSystem';

type GeneratedQuestSeed = Omit<Quest,'progress'|'status'>;

const WORLD_GIVER: Record<EcologyWorld,string> = {
  HARBOR:'Mara',
  GARDENS:'Sela',
  CITADEL:'Orin',
  ARTS:'Caro',
  WILDS:'Rook',
};

const WORLD_POSITION: Record<EcologyWorld,[number,number]> = {
  HARBOR:[22,-24],
  GARDENS:[23,20],
  CITADEL:[-19,-18],
  ARTS:[17,-15],
  WILDS:[-25,22],
};

/**
 * Turns simulation signals into authored-feeling missions.
 * The generator is deliberately deterministic: the same world signal creates
 * one stable mission instead of flooding the player with procedural noise.
 */
export class DynamicQuestSystem {
  readonly root = new THREE.Group();
  private timer = 7;
  private serial = 0;
  private seenStoryIds = new Set<string>();
  private lastEvent = 'QUIET';

  constructor(private quests:QuestSystem) {
    this.root.name='grid-dynamic-quests';
  }

  private add(seed:GeneratedQuestSeed) {
    if (this.quests.addDynamicQuest(seed)) {
      this.root.userData.latestQuest=seed.id;
      return true;
    }
    return false;
  }

  update(
    delta:number,
    world:EcologyWorld,
    event:string,
    _phase:string,
    society:SocietySnapshot,
    story:LocalStory|null,
    playerX:number,
    playerZ:number,
  ): boolean {
    let changed=false;
    const normalized=event.toUpperCase();
    this.timer-=delta;

    // World events create temporary-feeling but persistent mission offers.
    // The mission remains in the player's journal once accepted.
    if (normalized!=='QUIET' && normalized!==this.lastEvent) {
      const giver=WORLD_GIVER[world];
      const position=WORLD_POSITION[world];
      this.serial++;
      if(this.add({
        id:'dynamic-event-'+world.toLowerCase()+'-'+this.serial,
        title:world==='WILDS'?'Guide the Migration':world==='GARDENS'?'Protect the Bloom':world==='ARTS'?'Carry the Signal':world==='CITADEL'?'Read the Crown Signal':'Trace the Tide',
        description:'A live world event has changed the local routine. Follow the signal and report what you find.',
        type:'WORLD_EVENT',
        world,
        target:1,
        reward:110+this.serial%4*25,
        giver,
        objective:'Reach the local event route while '+normalized+' is active.',
        objectivePosition:position,
      })) changed=true;
      this.lastEvent=normalized;
    }

    // A local story can become a mission: this makes NPC relationships matter
    // to the player's path instead of existing only as background simulation.
    if (story && !this.seenStoryIds.has(story.id)) {
      this.seenStoryIds.add(story.id);
      const giver=story.participants[0] ?? WORLD_GIVER[story.world];
      const position=WORLD_POSITION[story.world];
      this.serial++;
      if(this.add({
        id:'dynamic-story-'+story.id,
        title:'Follow the Story',
        description:story.text,
        type:'DISCOVER',
        world:story.world,
        target:1,
        reward:90+(story.kind==='DISCOVERY'?40:0),
        giver,
        objective:'Visit the place where this local story is unfolding and record what you learn.',
        objectivePosition:position,
        targetId:'story:'+story.id,
      })) changed=true;
    }

    // Society pressure creates a small civic mission when a world is unusually active.
    if (this.timer<=0) {
      this.timer=18;
      if (society.talking>=3) {
        const giver=WORLD_GIVER[world];
        this.serial++;
        if(this.add({
          id:'dynamic-social-'+world.toLowerCase()+'-'+this.serial,
          title:'Listen to the Neighborhood',
          description:'Several citizens are talking at once. Learn what the neighborhood is coordinating.',
          type:'MEET',
          world,
          target:2,
          reward:120,
          giver,
          objective:'Meet 2 local citizens and learn what they are coordinating.',
          objectivePosition:WORLD_POSITION[world],
        })) changed=true;
      } else if (society.working>=4) {
        const giver=WORLD_GIVER[world];
        this.serial++;
        if(this.add({
          id:'dynamic-work-'+world.toLowerCase()+'-'+this.serial,
          title:'Lend a Hand',
          description:'The local work crews are active. Find the current work and help move it forward.',
          type:'BUILD',
          world,
          target:1,
          reward:130,
          giver,
          objective:'Visit the local work route and inspect what is being built.',
          objectivePosition:WORLD_POSITION[world],
        })) changed=true;
      }
    }

    this.root.userData.world=world;
    this.root.userData.event=normalized;
    this.root.userData.playerDistance=Math.round(Math.hypot(playerX-WORLD_POSITION[world][0],playerZ-WORLD_POSITION[world][1]));
    return changed;
  }
}
